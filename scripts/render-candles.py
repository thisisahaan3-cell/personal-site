"""
Builds the portrait's candle tone map and pre-renders the settled wall as a still.

  public/images/portrait-tone.webp     greyscale; drives candle height and brightness in the wall.
                                       Luminance with local contrast (CLAHE) and a gentle emphasis
                                       on the face, so the face reads as the brightest, clearest part.
  public/images/portrait-candles.webp  the settled portrait layer, for reduced motion, no WebGL, no JS.

Used for reduced motion, no WebGL and no JS (direction §4). Mirrors the at-rest logic of the
wall's vertex shader (src/components/home/wall.ts): 96 x 128 candles, body height and brightness
by luminance, "up" (text colour) when brighter than the left neighbour, else "down".

Usage: python3 scripts/render-candles.py
"""

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/images/portrait-matte.webp"
OUT = ROOT / "public/images/portrait-candles.webp"
TONE = ROOT / "public/images/portrait-tone.webp"

# Face centre and radii in the 797 x 1060 portrait, measured by eye from the photograph.
FACE = (415, 410, 175, 240)

COLS, ROWS = 96, 128
SS = 3  # supersampling
W = 960  # output width; height follows the portrait's aspect
TEXT = np.array([0.910, 0.929, 0.965])
DOWN = np.array([0.306, 0.404, 0.573])


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
    cx, cy, rx, ry = FACE
    face = np.exp(-(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2))
    t = t * (0.62 + 0.38 * face) + 0.12 * face
    t = np.clip((t - 0.06) / 0.8, 0, 1) ** 0.9
    return Image.fromarray((t * 255).round().astype(np.uint8), "L")


def main():
    im = Image.open(SRC).convert("RGBA")
    tone = make_tone(im)
    tone.save(TONE, quality=92, method=6)
    H = round(W * im.height / im.width)
    # Cell averages (the shader samples a mip level of about one texel per cell).
    small = np.asarray(im.resize((COLS, ROWS), Image.Resampling.BOX), dtype=np.float64) / 255
    a = small[..., 3]
    L = np.asarray(tone.resize((COLS, ROWS), Image.Resampling.BOX), dtype=np.float64) / 255
    Ll = np.concatenate([L[:, :1], L[:, :-1]], axis=1)
    up = L >= Ll
    alpha = smoothstep(0.08, 0.55, a)

    cw, ch = W * SS / COLS, H * SS / ROWS
    out = np.zeros((H * SS, W * SS, 4))
    yy, xx = np.mgrid[0 : H * SS, 0 : W * SS]
    col_i = np.minimum((xx / cw).astype(int), COLS - 1)
    row_i = np.minimum((yy / ch).astype(int), ROWS - 1)
    lx = xx + 0.5 - (col_i + 0.5) * cw
    ly = yy + 0.5 - (row_i + 0.5) * ch
    Lc = L[row_i, col_i]
    body_half_w = cw * 0.5 * 0.66
    body_half_h = ch * 0.5 * (0.10 + 0.78 * Lc)
    wick_half_h = ch * 0.5 * np.minimum(1.0, 0.10 + 0.78 * Lc + 0.3)
    body = (np.abs(lx) <= body_half_w) & (np.abs(ly) <= body_half_h)
    wick = (np.abs(lx) <= SS * 0.5) & (np.abs(ly) <= wick_half_h)
    m = np.maximum(body * 1.0, wick * 0.35)
    bright = 0.28 + 0.72 * Lc
    colour = np.where(up[row_i, col_i][..., None], TEXT, DOWN) * bright[..., None]
    A = m * alpha[row_i, col_i]
    out[..., :3] = colour * A[..., None]  # premultiplied
    out[..., 3] = A

    img = Image.fromarray((out * 255).round().astype(np.uint8), "RGBA")
    img = img.resize((W, H), Image.Resampling.LANCZOS)
    # Un-premultiply for the file.
    arr = np.asarray(img, dtype=np.float64)
    al = arr[..., 3:4] / 255
    arr[..., :3] = np.where(al > 0, arr[..., :3] / np.maximum(al, 1e-6), 0)
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA").save(OUT, quality=90, method=6)
    print(f"wrote {OUT.relative_to(ROOT)} {W}x{H}")


if __name__ == "__main__":
    main()
