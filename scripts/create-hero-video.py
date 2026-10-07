"""Render the optional 4K camera push-in and responsive hero still."""
import argparse
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source', type=Path, help='Source still image')
args = parser.parse_args()
source = args.source.expanduser().resolve()
im = Image.open(source).convert('RGB')
copy = im.copy()
copy.thumbnail((2880, 2880))
copy.save(root / 'public/assets/images/heaven-2880.webp', quality=91, method=6)
frame = cv2.imread(str(source))
h, w = frame.shape[:2]
out = root / 'public/assets/videos/heaven-camera-4k.mp4'
out.parent.mkdir(parents=True, exist_ok=True)
writer = cv2.VideoWriter(str(out), cv2.VideoWriter_fourcc(*'avc1'), 24, (3840, 2160))
if not writer.isOpened():
    raise RuntimeError('H.264 encoder unavailable')
for i in range(240):
    t = i / 239
    ease = t*t*(3-2*t)
    zoom = 1 + .16*ease
    crop_w = w / zoom
    crop_h = crop_w * 2160 / 3840
    x = (w-crop_w)*.60
    y = (h-crop_h)*.48
    matrix = np.float32([[crop_w/3840,0,x],[0,crop_h/2160,y]])
    output = cv2.warpAffine(frame,matrix,(3840,2160),flags=cv2.INTER_LANCZOS4 | cv2.WARP_INVERSE_MAP)
    writer.write(output)
writer.release()
print(f'Created {out} ({out.stat().st_size / 1024**2:.1f} MB)', flush=True)
