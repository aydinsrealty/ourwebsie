"""Create a natural, scroll-scrubbed WebP sequence from a source video."""

import argparse
from pathlib import Path

import cv2
from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]


def resize_frame(frame, width):
    height = round(frame.shape[0] * width / frame.shape[1])
    return cv2.resize(frame, (width, height), interpolation=cv2.INTER_AREA)


def save_webp(frame, destination, quality=90):
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    Image.fromarray(rgb).save(destination, format='WEBP', quality=quality, method=6)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path, help='Source video, for example headvids.mp4')
    parser.add_argument('--frames', type=int, default=121, help='Number of scroll frames to create')
    parser.add_argument('--width', type=int, default=2560, help='Sequence width in pixels')
    parser.add_argument('--first-frame', type=Path, default=ROOT / 'firstframe.jpg', help='Optional still to use as frame 1')
    args = parser.parse_args()

    source = args.source.expanduser().resolve()
    capture = cv2.VideoCapture(str(source))
    if not capture.isOpened():
        raise RuntimeError(f'Unable to open video: {source}')

    frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
    if frame_count < 2 or args.frames < 2:
        raise RuntimeError('The source video does not contain enough frames')

    output_dir = ROOT / 'public/assets/frames'
    output_dir.mkdir(parents=True, exist_ok=True)
    first_frame = args.first_frame.expanduser().resolve()
    has_still_first_frame = first_frame.is_file()
    video_frame_total = args.frames - 1 if has_still_first_frame else args.frames
    indices = [round(index * (frame_count - 1) / (video_frame_total - 1)) for index in range(video_frame_total)]

    next_output_index = 1
    if has_still_first_frame:
        with Image.open(first_frame).convert('RGB') as image:
            resized = ImageOps.fit(image, (args.width, round(args.width * 9 / 16)), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
            save_webp(resized, output_dir / 'frame-1.webp')
            save_webp(resized, ROOT / 'public/assets/images/headvids-hero.webp')
        next_output_index = 2

    next_source_index = 0
    next_video_index = 0
    while next_video_index < len(indices):
        ok, frame = capture.read()
        if not ok:
            capture.release()
            raise RuntimeError(f'Unable to read source frame {indices[next_video_index]}')

        if next_source_index == indices[next_video_index]:
            output_index = next_output_index
            resized = resize_frame(frame, args.width)
            save_webp(resized, output_dir / f'frame-{output_index}.webp')
            if output_index == 1:
                save_webp(resized, ROOT / 'public/assets/images/headvids-hero.webp')
            next_video_index += 1
            next_output_index += 1

        next_source_index += 1

    capture.release()
    print(f'Created {args.frames} frames at {args.width}px wide from {source.name}')


if __name__ == '__main__':
    main()
