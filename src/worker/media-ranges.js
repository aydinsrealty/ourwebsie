// Cloudflare's static asset response does not currently honor byte ranges for
// these files. A 206 response lets mobile browsers seek to the matching frame
// when the visitor reverses the opening film.
export default {
  async fetch(request, env) {
    const range = request.headers.get('Range');
    if (request.method !== 'GET' || !range) return env.ASSETS.fetch(request);

    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (!match || (!match[1] && !match[2])) return env.ASSETS.fetch(request);

    const asset = await env.ASSETS.fetch(new Request(request.url));
    if (!asset.ok) return asset;

    const knownLength = Number(asset.headers.get('Content-Length'));
    const body = Number.isFinite(knownLength) && knownLength > 0
      ? null
      : await asset.arrayBuffer();
    const size = body ? body.byteLength : knownLength;
    const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
    const end = match[2] && match[1] ? Math.min(Number(match[2]), size - 1) : size - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || end < start) {
      return new Response(null, {
        status: 416,
        headers: { 'Content-Range': `bytes */${size}`, 'Accept-Ranges': 'bytes' },
      });
    }

    const headers = new Headers(asset.headers);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
    headers.set('Content-Length', String(end - start + 1));

    // The first open-ended range can stream immediately. Only seeks into the
    // middle of a file need an in-memory slice of the cached static asset.
    if (start === 0 && end === size - 1 && !body) {
      return new Response(asset.body, { status: 206, headers });
    }
    const bytes = body || await asset.arrayBuffer();
    return new Response(bytes.slice(start, end + 1), { status: 206, headers });
  },
};
