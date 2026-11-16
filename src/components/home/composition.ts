import type { Rect } from "./wall";

/**
 * Art direction of the portrait inside its candle grid. The grid is fixed (96 x 128 on the right
 * half; 56 x 75 on phone), so the photograph is zoomed until the face spans about 45 candles:
 * at the photograph's own framing the face is only 30 candles wide and does not read.
 * `scripts/render-candles.py` uses the same desktop numbers for the pre-rendered still.
 */
export const PORTRAIT = { w: 797, h: 1060 };
/** Face centre and width in the 797 x 1060 photograph, measured by eye. */
export const FACE = { x: 415, y: 410, w: 300 };

const DESKTOP = { width: 0.47, height: 0.38, cx: 0.52, cy: 0.42 };
const PHONE = { width: 0.62, height: 0.5, cx: 0.5, cy: 0.5 };

export function placePortrait(frame: Rect, phone: boolean): Rect {
  const c = phone ? PHONE : DESKTOP;
  const faceW = Math.min(frame.w * c.width, frame.h * c.height);
  const s = faceW / FACE.w;
  return {
    x: frame.x + frame.w * c.cx - FACE.x * s,
    y: frame.y + frame.h * c.cy - FACE.y * s,
    w: PORTRAIT.w * s,
    h: PORTRAIT.h * s,
  };
}

/** The still (`portrait-candles.webp`) is the desktop composition rendered in a 960 x 1200 box. */
export const STILL = { w: 960, h: 1200, posY: 0.42 };

/** Where the photograph sits under the still, when the still is drawn with object-fit: cover. */
export function photoUnderStill(frame: Rect): Rect {
  const sc = Math.max(frame.w / STILL.w, frame.h / STILL.h);
  const dw = STILL.w * sc;
  const dh = STILL.h * sc;
  const dx = frame.x + (frame.w - dw) / 2;
  const dy = frame.y + (frame.h - dh) * STILL.posY;
  const inStill = placePortrait({ x: 0, y: 0, w: STILL.w, h: STILL.h }, false);
  return { x: dx + inStill.x * sc, y: dy + inStill.y * sc, w: inStill.w * sc, h: inStill.h * sc };
}
