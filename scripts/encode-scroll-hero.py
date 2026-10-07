"""Encode the source drone clip as a short, higher-detail reversible hero.

All 240 source frames are kept. At 48 fps the pass takes five seconds,
without asking the browser to accelerate or skip decoded frames.
"""

from pathlib import Path
import argparse
import struct
import tempfile

import cv2


ROOT = Path(__file__).resolve().parents[1]


def atoms(data):
    offset = 0
    while offset + 8 <= len(data):
        size = int.from_bytes(data[offset:offset + 4], "big")
        header = 8
        if size == 1:
            size = int.from_bytes(data[offset + 8:offset + 16], "big")
            header = 16
        elif size == 0:
            size = len(data) - offset
        if size < header or offset + size > len(data):
            raise ValueError("Invalid MP4 atom")
        yield data[offset + 4:offset + 8], offset, size, header
        offset += size


def move_moov_to_front(path):
    """Place the MP4 index before video bytes so playback can start early."""
    data = path.read_bytes()
    top = list(atoms(data))
    moov = next((item for item in top if item[0] == b"moov"), None)
    mdat = next((item for item in top if item[0] == b"mdat"), None)
    if not moov or not mdat or moov[1] < mdat[1]:
        return
    _, moov_offset, moov_size, _ = moov
    _, mdat_offset, _, _ = mdat
    moov_data = bytearray(data[moov_offset:moov_offset + moov_size])

    def patch_offsets(start, end):
        pos = start
        while pos + 8 <= end:
            size = struct.unpack_from(">I", moov_data, pos)[0]
            kind = moov_data[pos + 4:pos + 8]
            if size < 8 or pos + size > end:
                raise ValueError("Invalid MP4 index atom")
            if kind in (b"stco", b"co64"):
                count = struct.unpack_from(">I", moov_data, pos + 12)[0]
                stride = 4 if kind == b"stco" else 8
                fmt = ">I" if stride == 4 else ">Q"
                for index in range(count):
                    entry = pos + 16 + index * stride
                    old = struct.unpack_from(fmt, moov_data, entry)[0]
                    struct.pack_into(fmt, moov_data, entry, old + moov_size)
            elif kind in (b"moov", b"trak", b"mdia", b"minf", b"stbl", b"edts", b"dinf", b"udta"):
                patch_offsets(pos + 8, pos + size)
            pos += size

    patch_offsets(0, len(moov_data))
    path.write_bytes(data[:mdat_offset] + moov_data + data[mdat_offset:moov_offset] + data[moov_offset + moov_size:])


def encode(source, destination, frame_count, fps, width, height, reverse=False):
    capture = cv2.VideoCapture(str(source))
    writer = cv2.VideoWriter(str(destination), cv2.VideoWriter_fourcc(*"avc1"), fps, (width, height))
    if not capture.isOpened() or not writer.isOpened():
        raise RuntimeError("Unable to read source or start H.264 encoder")
    if reverse:
        # Seeking backwards in a GOP-encoded 4K source repeatedly decodes the
        # same frames. Cache one sequential pass, then write it in reverse.
        with tempfile.TemporaryDirectory(prefix="hero-frames-") as temporary:
            frames = Path(temporary)
            for index in range(frame_count):
                ok, frame = capture.read()
                if not ok:
                    raise RuntimeError(f"Unable to read frame {index}")
                resized = cv2.resize(frame, (width, height), interpolation=cv2.INTER_AREA)
                cv2.imwrite(str(frames / f"{index:04}.jpg"), resized,
                            [cv2.IMWRITE_JPEG_QUALITY, 98])
            for index in range(frame_count - 1, -1, -1):
                frame = cv2.imread(str(frames / f"{index:04}.jpg"))
                writer.write(frame)
    else:
        for index in range(frame_count):
            ok, frame = capture.read()
            if not ok:
                raise RuntimeError(f"Unable to read frame {index}")
            writer.write(cv2.resize(frame, (width, height), interpolation=cv2.INTER_AREA))
    capture.release()
    writer.release()
    move_moov_to_front(destination)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", nargs="?", type=Path, default=ROOT / "headvids.mp4")
    parser.add_argument("--reverse-only", action="store_true", help="Regenerate only the reverse file")
    args = parser.parse_args()
    source = args.source.resolve()
    capture = cv2.VideoCapture(str(source))
    count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
    ok, first_frame = capture.read()
    capture.release()
    if count < 2 or not ok:
        raise RuntimeError("Source video has no frames")
    still = ROOT / "public/assets/images/hero-video-first.webp"
    resized = cv2.resize(first_frame, (2560, 1440), interpolation=cv2.INTER_AREA)
    cv2.imwrite(str(still), resized, [cv2.IMWRITE_WEBP_QUALITY, 96])
    output = ROOT / "public/assets/videos"
    output.mkdir(parents=True, exist_ok=True)
    for reverse, name in ((False, "hero-forward-48.mp4"), (True, "hero-reverse-48.mp4")):
        if args.reverse_only and not reverse:
            continue
        destination = output / name
        encode(source, destination, count, 48, 2560, 1440, reverse)
        print(f"Created {name}: {count / 48:.2f}s, {destination.stat().st_size / 1024**2:.1f} MB", flush=True)


if __name__ == "__main__":
    main()
