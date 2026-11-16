/** Minimal sampler for SVG paths made of absolute M, L, C and Z commands. Runs on the server and in the browser. */

export type Pt = { x: number; y: number };

export function samplePath(d: string, perSegment = 48): Pt[] {
  const tokens = d.match(/[MLCZ]|-?\d*\.?\d+/g) ?? [];
  const pts: Pt[] = [];
  let i = 0;
  let cur: Pt = { x: 0, y: 0 };
  let start: Pt = { x: 0, y: 0 };
  let cmd = "";
  const num = () => Number(tokens[i++]);
  while (i < tokens.length) {
    if (/[MLCZ]/.test(tokens[i])) cmd = tokens[i++];
    if (cmd === "M") {
      cur = { x: num(), y: num() };
      start = cur;
      pts.push(cur);
      cmd = "L";
    } else if (cmd === "L") {
      const p = { x: num(), y: num() };
      for (let k = 1; k <= perSegment; k++) {
        const t = k / perSegment;
        pts.push({ x: cur.x + (p.x - cur.x) * t, y: cur.y + (p.y - cur.y) * t });
      }
      cur = p;
    } else if (cmd === "C") {
      const c1 = { x: num(), y: num() };
      const c2 = { x: num(), y: num() };
      const p = { x: num(), y: num() };
      for (let k = 1; k <= perSegment; k++) {
        const t = k / perSegment;
        const u = 1 - t;
        pts.push({
          x: u * u * u * cur.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p.x,
          y: u * u * u * cur.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p.y,
        });
      }
      cur = p;
    } else if (cmd === "Z") {
      const p = start;
      for (let k = 1; k <= perSegment; k++) {
        const t = k / perSegment;
        pts.push({ x: cur.x + (p.x - cur.x) * t, y: cur.y + (p.y - cur.y) * t });
      }
      cur = p;
      cmd = "";
    } else {
      i++;
    }
  }
  return pts;
}

/** Points resampled at equal arc length, with cumulative fraction. */
export function evenly(pts: Pt[], n: number): Pt[] {
  const acc = [0];
  for (let k = 1; k < pts.length; k++) {
    acc.push(acc[k - 1] + Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y));
  }
  const total = acc[acc.length - 1];
  const out: Pt[] = [];
  let j = 1;
  for (let k = 0; k < n; k++) {
    const target = (k / n) * total;
    while (j < acc.length - 1 && acc[j] < target) j++;
    const seg = acc[j] - acc[j - 1] || 1;
    const t = (target - acc[j - 1]) / seg;
    out.push({
      x: pts[j - 1].x + (pts[j].x - pts[j - 1].x) * t,
      y: pts[j - 1].y + (pts[j].y - pts[j - 1].y) * t,
    });
  }
  return out;
}

/** Unit normal at index k of an evenly sampled closed loop. */
export function normalAt(loop: Pt[], k: number): Pt {
  const a = loop[(k - 1 + loop.length) % loop.length];
  const b = loop[(k + 1) % loop.length];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l = Math.hypot(dx, dy) || 1;
  return { x: -dy / l, y: dx / l };
}

/** A speed trace for a closed loop: high on straights, dipping where the heading turns. */
export function speedTrace(loop: Pt[]): number[] {
  const n = loop.length;
  const turn: number[] = [];
  for (let k = 0; k < n; k++) {
    const a = loop[(k - 2 + n) % n];
    const b = loop[k];
    const c = loop[(k + 2) % n];
    const h1 = Math.atan2(b.y - a.y, b.x - a.x);
    const h2 = Math.atan2(c.y - b.y, c.x - b.x);
    let d = Math.abs(h2 - h1);
    if (d > Math.PI) d = 2 * Math.PI - d;
    turn.push(d);
  }
  // Smooth so the trace brakes before a corner and accelerates out of it.
  const w = Math.max(3, Math.round(n / 40));
  const sm = turn.map((_, k) => {
    let s = 0;
    for (let j = -w; j <= w; j++) s += turn[(k + j + n) % n];
    return s / (2 * w + 1);
  });
  const max = Math.max(...sm) || 1;
  return sm.map((v) => 1 - Math.min(1, v / max) * 0.85);
}
