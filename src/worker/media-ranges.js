// Cloudflare's static assets do not serve byte ranges for these MP4s. Store
// each film in small, byte-identical pieces so a seek fetches only the pieces
// it needs instead of reading the whole 25 MB film into this Worker.
const CHUNK_SIZE = 2 * 1024 * 1024;
const FILMS = {
  '/assets/videos/hero-forward-touch.mp4': { folder: 'hero-forward-touch', size: 26189569 },
  '/assets/videos/hero-reverse-touch.mp4': { folder: 'hero-reverse-touch', size: 26205201 },
};

function requestedRange(value, size) {
  if (!value) return { start: 0, end: size - 1, partial: false };
  const match = /^bytes=(\d*)-(\d*)$/.exec(value.trim());
  if (!match || (!match[1] && !match[2])) return null;
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || end < start) return null;
  return { start, end, partial: true };
}

export default {
  async fetch(request, env) {
    const film = FILMS[new URL(request.url).pathname];
    if (!film || (request.method !== 'GET' && request.method !== 'HEAD')) {
      return env.ASSETS.fetch(request);
    }

    const range = requestedRange(request.headers.get('Range'), film.size);
    if (!range) {
      return new Response(null, {
        status: 416,
        headers: { 'Content-Range': `bytes */${film.size}`, 'Accept-Ranges': 'bytes' },
      });
    }
    const headers = new Headers({
      'Content-Type': 'video/mp4',
      'Content-Length': String(range.end - range.start + 1),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
    });
    if (range.partial) headers.set('Content-Range', `bytes ${range.start}-${range.end}/${film.size}`);
    if (request.method === 'HEAD') {
      return new Response(null, { status: range.partial ? 206 : 200, headers });
    }

    let chunkIndex = Math.floor(range.start / CHUNK_SIZE);
    const firstChunk = chunkIndex;
    const lastChunk = Math.floor(range.end / CHUNK_SIZE);
    const body = new ReadableStream({
      async pull(controller) {
        if (chunkIndex > lastChunk) return controller.close();
        const chunkUrl = new URL(`/assets/videos/${film.folder}/chunk-${String(chunkIndex).padStart(3, '0')}.bin`, request.url);
        const response = await env.ASSETS.fetch(chunkUrl.toString());
        if (!response.ok) return controller.error(new Error(`Missing video chunk ${chunkIndex}`));
        const bytes = new Uint8Array(await response.arrayBuffer());
        const from = chunkIndex === firstChunk ? range.start % CHUNK_SIZE : 0;
        const to = chunkIndex === lastChunk ? (range.end % CHUNK_SIZE) + 1 : bytes.length;
        controller.enqueue(bytes.subarray(from, to));
        chunkIndex++;
      },
    });
    return new Response(body, { status: range.partial ? 206 : 200, headers });
  },
};
