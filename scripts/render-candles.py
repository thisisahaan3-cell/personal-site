"""
Builds the portrait's candle tone map and pre-renders the settled wall as a still.

  public/images/portrait-tone.webp     greyscale; drives candle height and brightness in the wall.
                                       Luminance with local contrast (CLAHE) and a gentle emphasis
                                       on the face, so the face reads as the brightest, clearest part.
  public/images/portrait-candles.webp  the settled portrait layer (960 x 1200, transparent), shown for
                                       reduced motion, no WebGL and no JS.

The still mirrors the at-rest logic of the wall's vertex shader (src/components/home/wall.ts) and
the desktop composition in src/components/home/composition.ts: 96 x 128 candles, the photograph
zoomed so the face is 47% of the box wide, centred at (52%, 42%). Keep the numbers in step.

Usage: python3 scripts/render-candles.py   (needs numpy, pillow, scipy, opencv-python-headless)
"""

from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import uniform_filter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/images/portrait-matte.webp"
OUT = ROOT / "public/images/portrait-candles.webp"
TONE = ROOT / "public/images/portrait-tone.webp"

# composition.ts: FACE and the desktop placement.
FACE_X, FACE_Y, FACE_W = 415, 410, 300
FACE_EMPHASIS = (415, 410, 175, 240)  # centre and radii for the tone map's face emphasis
BOX_W, BOX_H = 960, 1200
COLS, ROWS = 96, 128
SS = 3

TEXT = np.array([0.910, 0.929, 0.965])
DOWN_P = np.array([0.560, 0.660, 0.840])  # wall.ts DOWN_P


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def make_tone(im: Image.Image) -> Image.Image:
    import cv2

    arr = np.asarray(im, dtype=np.float64) / 255
    lum = arr[..., :3] @ np.array([0.2126, 0.7152, 0.0722])
    clahe = cv2.createCLAHE(clipLimit=2.2, tileGridSize=(8, 8))
    local = clahe.apply((lum * 255).astype(np.uint8)) / 255
    t = 0.45 * lum + 0.55 * local
    h, w = lum.shape
    yy, xx = np.mgrid[0:h, 0:w]
    cx, cy, rx, ry = FACE_EMPHASIS
    face = np.exp(-(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2))
    t = t * (0.55 + 0.45 * face) + 0.1 * face
    t = np.clip((t - 0.08) / 0.85, 0, 1) ** 1.15
    return Image.fromarray((t * 255).round().astype(np.uint8), "L")


def main():
    im = Image.open(SRC).convert("RGBA")
    tone = make_tone(im)
    tone.save(TONE, quality=92, method=6)

    face_w = min(BOX_W * 0.47, BOX_H * 0.38)
    s = face_w / FACE_W
    ix, iy = BOX_W * 0.52 - FACE_X * s, BOX_H * 0.42 - FACE_Y * s
    cw, ch = BOX_W / COLS, BOX_H / ROWS

    # Cell-sized box filter, then sample at each cell centre (the shader's mip level).
    k = max(1, round(cw / s))
    alpha_src = uniform_filter(np.asarray(im, dtype=np.float64)[..., 3] / 255, k)
    tone_src = uniform_filter(np.asarray(tone, dtype=np.float64) / 255, k)
    cx = (np.arange(COLS) + 0.5) * cw
    cy = (np.arange(ROWS) + 0.5) * ch
    sx = ((cx - ix) / s).astype(int)
    sy = ((cy - iy) / s).astype(int)
    inside = (sx[None, :] >= 0) & (sx[None, :] < im.width) & (sy[:, None] >= 0) & (sy[:, None] < im.height)
    sxc, syc = np.clip(sx, 0, im.width - 1), np.clip(sy, 0, im.height - 1)
    L = smoothstep(0.1, 0.95, np.clip(tone_src[syc][:, sxc], 0, 1))
    a = np.clip(alpha_src[syc][:, sxc], 0, 1) * inside
    Ll = np.concatenate([L[:, :1], L[:, :-1]], axis=1)
    up = L + 0.02 >= Ll
    alpha = smoothstep(0.08, 0.55, a) * smoothstep(0, 5, np.arange(COLS) + 0.5)[None, :]

    W, H = BOX_W * SS, BOX_H * SS
    cws, chs = cw * SS, ch * SS
    yy, xx = np.mgrid[0:H, 0:W]
    ci = np.minimum((xx / cws).astype(int), COLS - 1)
    ri = np.minimum((yy / chs).astype(int), ROWS - 1)
    lx = xx + 0.5 - (ci + 0.5) * cws
    ly = yy + 0.5 - (ri + 0.5) * chs
    P = L[ri, ci] ** 0.62
    body_h = chs * 0.5 * (0.06 + 0.86 * P)
    body = (np.abs(lx) <= cws * 0.5 * 0.74) & (np.abs(ly) <= body_h)
    wick = (np.abs(lx) <= SS * 0.5) & (np.abs(ly) <= np.minimum(chs * 0.5, chs * 0.5 * (0.06 + 0.86 * P + 0.3)))
    m = np.maximum(body * 1.0, wick * 0.35)
    bright = 0.12 + 0.88 * P
    colour = np.where(up[ri, ci][..., None], TEXT, DOWN_P) * bright[..., None]
    A = m * alpha[ri, ci]

    out = np.zeros((H, W, 4))
    out[..., :3] = colour * A[..., None]  # premultiplied while resampling
    out[..., 3] = A
    img = Image.fromarray((out * 255).round().astype(np.uint8), "RGBA").resize((BOX_W, BOX_H), Image.Resampling.LANCZOS)
    arr = np.asarray(img, dtype=np.float64)
    al = arr[..., 3:4] / 255
    arr[..., :3] = np.where(al > 0, arr[..., :3] / np.maximum(al, 1e-6), 0)
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA").save(OUT, quality=78, method=6)
    print(f"wrote {OUT.relative_to(ROOT)} and {TONE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
