// Geometry helpers for the reference boards. The boards themselves are static HTML;
// these functions only compute SVG path data when a board is (re)generated.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const here = path.dirname(fileURLToPath(import.meta.url));
export const outDir = path.resolve(here, '..');
export const write = (name, html) => {
  fs.writeFileSync(path.join(outDir, name), html);
  console.log('wrote', name, (html.length / 1024).toFixed(1) + ' kB');
};

export const f = n => (Math.round(n * 100) / 100).toString();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Rounded polyline. pts: [[x, y, r?], ...]. Straight legs joined by tangent arcs of radius r.
export function fillet(pts, { closed = false, r: rDefault = 0 } = {}) {
  const P = pts.map(p => ({ x: p[0], y: p[1], r: p[2] ?? rDefault }));
  const n = P.length;
  const corner = i => {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n];
    const v1 = { x: p0.x - p1.x, y: p0.y - p1.y }, v2 = { x: p2.x - p1.x, y: p2.y - p1.y };
    const l1 = Math.hypot(v1.x, v1.y), l2 = Math.hypot(v2.x, v2.y);
    const u1 = { x: v1.x / l1, y: v1.y / l1 }, u2 = { x: v2.x / l2, y: v2.y / l2 };
    const ang = Math.acos(clamp(u1.x * u2.x + u1.y * u2.y, -1, 1));
    let r = p1.r;
    if (!r || ang > Math.PI - 1e-3) return { a: p1, b: p1, r: 0, sweep: 0 };
    let d = r / Math.tan(ang / 2);
    const maxd = Math.min(l1, l2) / 2;
    if (d > maxd) { d = maxd; r = d * Math.tan(ang / 2); }
    const cross = u1.x * u2.y - u1.y * u2.x;
    return {
      a: { x: p1.x + u1.x * d, y: p1.y + u1.y * d },
      b: { x: p1.x + u2.x * d, y: p1.y + u2.y * d },
      r, sweep: cross < 0 ? 1 : 0,
    };
  };
  let d = '';
  if (closed) {
    const c0 = corner(0);
    d += `M${f(c0.b.x)} ${f(c0.b.y)}`;
    for (let i = 1; i <= n; i++) {
      const c = corner(i % n);
      d += `L${f(c.a.x)} ${f(c.a.y)}`;
      if (c.r) d += `A${f(c.r)} ${f(c.r)} 0 0 ${c.sweep} ${f(c.b.x)} ${f(c.b.y)}`;
    }
    d += 'Z';
  } else {
    d += `M${f(P[0].x)} ${f(P[0].y)}`;
    for (let i = 1; i < n - 1; i++) {
      const c = corner(i);
      d += `L${f(c.a.x)} ${f(c.a.y)}`;
      if (c.r) d += `A${f(c.r)} ${f(c.r)} 0 0 ${c.sweep} ${f(c.b.x)} ${f(c.b.y)}`;
    }
    d += `L${f(P[n - 1].x)} ${f(P[n - 1].y)}`;
  }
  return d;
}

// Deterministic pseudo-random numbers (mulberry32) so regenerated boards are identical.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rad = d => d * Math.PI / 180;

// Orthographic projection centred on (lat0, lon0). Returns {x, y, vis}.
export function ortho(lat, lon, { lat0 = 0, lon0 = 0, R, cx, cy }) {
  const p = rad(lat), l = rad(lon - lon0), p0 = rad(lat0);
  const cosc = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l);
  return {
    x: cx + R * Math.cos(p) * Math.sin(l),
    y: cy - R * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l)),
    vis: cosc >= -1e-9,
  };
}

// Turn a list of projected samples into path data, breaking where the sphere hides them.
export function runs(samples) {
  let d = '', pen = false;
  for (const s of samples) {
    if (!s.vis) { pen = false; continue; }
    d += (pen ? 'L' : 'M') + f(s.x) + ' ' + f(s.y);
    pen = true;
  }
  return d;
}

export function graticule(proj, { step = 15, fine = 1, skipLon = [] } = {}) {
  let d = '';
  for (let lon = -180; lon < 180; lon += step) {
    if (skipLon.includes(lon)) continue;
    const s = [];
    for (let lat = -90; lat <= 90; lat += fine) s.push(ortho(lat, lon, proj));
    d += runs(s);
  }
  for (let lat = -90 + step; lat < 90; lat += step) {
    const s = [];
    for (let lon = -180; lon <= 180; lon += fine) s.push(ortho(lat, lon, proj));
    d += runs(s);
  }
  return d;
}

// Great-circle arc between two (lat, lon) points, sampled by spherical interpolation.
export function greatCircle(a, b, proj, n = 64) {
  const v = ([lat, lon]) => [Math.cos(rad(lat)) * Math.cos(rad(lon)), Math.cos(rad(lat)) * Math.sin(rad(lon)), Math.sin(rad(lat))];
  const A = v(a), B = v(b);
  const om = Math.acos(clamp(A[0] * B[0] + A[1] * B[1] + A[2] * B[2], -1, 1));
  const s = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, k1 = Math.sin((1 - t) * om) / Math.sin(om), k2 = Math.sin(t * om) / Math.sin(om);
    const p = [k1 * A[0] + k2 * B[0], k1 * A[1] + k2 * B[1], k1 * A[2] + k2 * B[2]];
    s.push(ortho(Math.asin(p[2]) * 180 / Math.PI, Math.atan2(p[1], p[0]) * 180 / Math.PI, proj));
  }
  return runs(s);
}

// Mollweide projection (equal-area oval). Returns {x, y}.
export function mollweide(lat, lon, { R, cx, cy }) {
  const p = rad(lat);
  let th = p;
  for (let i = 0; i < 12; i++) th -= (2 * th + Math.sin(2 * th) - Math.PI * Math.sin(p)) / (2 + 2 * Math.cos(2 * th) || 1e-9);
  if (Math.abs(lat) === 90) th = Math.sign(lat) * Math.PI / 2;
  return { x: cx + R * (2 * Math.SQRT2 / Math.PI) * rad(lon) * Math.cos(th), y: cy - R * Math.SQRT2 * Math.sin(th), vis: true };
}

export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// The first eight rows of the delegate awards table, in the resume's order (facts.md section 5).
export const awards8 = [
  ['SHISMUN', 'AAIB', 'Best Delegate', '2026'],
  ['Eurivox MUN', 'UNGA', 'Best Delegate', '2026'],
  ['SHISMUN (Scottish High International School)', 'CCC (Crisis Committee)', 'Best Delegate', '2025'],
  ['GUMUN (Gurugram University MUN)', 'FIA', 'Best Delegate', '2025'],
  ['Online Youth Summit', 'UNSC', 'Best Delegate', '2025'],
  ['LVISMUN', 'UNGA', 'High Commendation', '2026'],
  ['PRASHTA MUN', 'UNGA', 'Best Delegate', '2024'],
  ['ASBBS MUN', 'UNHRC', 'High Commendation', '2024'],
];
export const committees = ['UNGA', 'UNSC', 'UNHRC', 'UNODC', 'ECOSOC', 'WHO', 'UNESCO', 'AAIB', 'CCC', 'FIA', 'AIPPM', 'Rajya Sabha'];
export const bodySentence = 'Self-driven 16-year-old student with a track record of competing and winning at the national level across finance, diplomacy, parliamentary debate and academics.';
export const schoolLine = 'Grade 11 (Commerce), Lotus Valley International School, Gurugram';
