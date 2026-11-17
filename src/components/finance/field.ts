/**
 * "The field" (direction §5): his results drawn to scale as points.
 *   state 0  field       10,000 points fill the screen (one per participant, 10,000+ drawn as 10,000)
 *   state 1  nfo         they collapse into a ranked column; rank 54 is lit amber
 *   state 2  fellowship  the top 2,000 open out into a field; the 100 selected stay lit
 *   state 3  srcc        46 points on a rule, the 46th amber; no pool (none is stated)
 *   state 4  shisfest    the rule settles into one point: first position
 * Phone draws one point for every 10 (scale stated in the copy).
 *
 * The simulation is CPU springs (10,000 points cost well under a millisecond); each point gets a
 * staggered release and a swirl kick so a change of state is thousands of points flying and
 * settling with one damped overshoot. Renderers: WebGL2 points, or Canvas 2D (phone, fallback).
 */

export const STATES = ["field", "nfo", "fellowship", "srcc", "shisfest"] as const;
export type StateId = (typeof STATES)[number];

export type Rect = { x: number; y: number; w: number; h: number };

export type Geo = {
  W: number;
  H: number;
  phone: boolean;
  /** Participants per point. */
  scale: number;
  n: number;
  /** Where the copy sits; field points under it are quieter. */
  panel: Rect;
  area: Rect;
  column: { x: number; y: number; cols: number; rows: number; step: number; amber: number };
  grid: { x: number; y: number; cols: number; rows: number; step: number; count: number; lit: number };
  rule: { x0: number; y: number; step: number; count: number };
};

const POOL = 10_000;
const NFO_RANK = 54;
const FELLOW_POOL = 2_000;
const FELLOW_LIT = 100;
const SRCC_RANK = 46;

export function geometry(W: number, H: number): Geo {
  const phone = W < 760;
  const scale = phone ? 10 : 1;
  const n = POOL / scale;
  const margin = phone ? 20 : 64;
  // Phone: the chart takes the upper half above the copy. Desktop: the right 56% of the stage.
  const area: Rect = phone
    ? { x: margin, y: 64, w: W - margin * 2, h: Math.max(220, H * 0.44 - 64) }
    : { x: Math.max(W * 0.42, 560), y: 120, w: W - Math.max(W * 0.42, 560) - margin, h: H - 120 - 150 };
  const panel: Rect = phone
    ? { x: 0, y: area.y + area.h + 12, w: W, h: H - (area.y + area.h) }
    : { x: 0, y: 0, w: Math.max(W * 0.42, 560) - 24, h: H };

  // Whole-pixel spacing keeps the column free of moiré.
  const cCols = phone ? 20 : 64;
  const cRows = Math.ceil(n / cCols);
  const cStep = Math.max(2, Math.min(Math.floor(area.h / cRows), phone ? 8 : 5));
  const column = {
    cols: cCols,
    rows: cRows,
    step: cStep,
    x: Math.round(area.x + area.w * (phone ? 0.58 : 0.5) - (cCols * cStep) / 2),
    y: Math.round(area.y + (area.h - cRows * cStep) / 2),
    amber: Math.ceil(NFO_RANK / scale) - 1,
  };

  const gCount = FELLOW_POOL / scale;
  const gCols = phone ? 20 : 50;
  const gRows = gCount / gCols;
  const gStep = Math.min((area.w * 0.92) / gCols, (area.h * 0.9) / gRows, phone ? 17 : 15);
  const grid = {
    cols: gCols,
    rows: gRows,
    step: gStep,
    count: gCount,
    lit: FELLOW_LIT / scale,
    x: area.x + (area.w - gCols * gStep) / 2 + gStep / 2,
    y: area.y + (area.h - gRows * gStep) / 2 + gStep / 2,
  };

  const rStep = Math.min(phone ? 7 : 17, (area.w * 0.9) / SRCC_RANK);
  const rule = { x0: area.x + (phone ? 8 : 24), y: area.y + area.h * 0.52, step: rStep, count: SRCC_RANK };

  return { W, H, phone, scale, n, panel, area, column, grid, rule };
}

/** Where rank r (0-based) sits in the ranked column. */
export function columnPoint(g: Geo, r: number) {
  const c = g.column;
  return { x: c.x + ((r % c.cols) + 0.5) * c.step, y: c.y + (Math.floor(r / c.cols) + 0.5) * c.step };
}

/** The point index under (x, y) in the column, or -1. */
export function columnRankAt(g: Geo, x: number, y: number) {
  const c = g.column;
  const col = Math.floor((x - c.x) / c.step);
  const row = Math.floor((y - c.y) / c.step);
  if (col < 0 || col >= c.cols || row < 0 || row >= c.rows) return -1;
  return row * c.cols + col;
}

export function rulePoint(g: Geo, k: number) {
  return { x: g.rule.x0 + k * g.rule.step, y: g.rule.y };
}

// ── Colours (linear 0..1), from the tokens ──
const TEXT = [0.91, 0.929, 0.965];
const DOWN = [0.306, 0.404, 0.573];
const AMBER = [0.949, 0.647, 0.255];
const PALETTE = [TEXT, DOWN, AMBER];
const C_TEXT = 0;
const C_DOWN = 1;
const C_AMBER = 2;

function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export class FieldSim {
  readonly n: number;
  g: Geo;
  state = -1;
  t = 0;
  // Per point
  x: Float32Array; y: Float32Array; vx: Float32Array; vy: Float32Array;
  tx: Float32Array; ty: Float32Array; px: Float32Array; py: Float32Array;
  at: Float32Array; pending: Uint8Array;
  a: Float32Array; a1: Float32Array; a2: Float32Array; aAt: Float32Array;
  s: Float32Array; sT: Float32Array;
  r: Float32Array; gr: Float32Array; b: Float32Array; col: Uint8Array;
  ox: Float32Array; oy: Float32Array;
  k: Float32Array; swirl: Float32Array; jx: Float32Array; jy: Float32Array; park: Float32Array; tone: Uint8Array;
  /** rank[i]: the point's place in the ranked column. */
  rank: Uint32Array;
  /** Of the 2,000 (by rank), which are among the 100 selected. */
  lit: Uint8Array;
  pointer = { x: -1e4, y: -1e4, on: false };
  private parted = false;

  constructor(g: Geo) {
    this.g = g;
    const n = (this.n = g.n);
    const F = () => new Float32Array(n);
    this.x = F(); this.y = F(); this.vx = F(); this.vy = F();
    this.tx = F(); this.ty = F(); this.px = F(); this.py = F(); this.at = F(); this.pending = new Uint8Array(n);
    this.a = F(); this.a1 = F(); this.a2 = F(); this.aAt = F();
    this.s = F(); this.sT = F();
    this.r = F(); this.gr = F(); this.b = F(); this.col = new Uint8Array(n);
    this.ox = F(); this.oy = F();
    this.k = F(); this.swirl = F(); this.jx = F(); this.jy = F(); this.park = F(); this.tone = new Uint8Array(n);
    this.rank = new Uint32Array(n);
    this.lit = new Uint8Array(n);

    const rnd = rng(54_2025);
    for (let i = 0; i < n; i++) this.rank[i] = i;
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const t = this.rank[i];
      this.rank[i] = this.rank[j];
      this.rank[j] = t;
    }
    for (let i = 0; i < n; i++) {
      this.k[i] = 26 + rnd() * 30;
      this.swirl[i] = 0.55 + rnd() * 0.9;
      this.jx[i] = rnd() - 0.5;
      this.jy[i] = rnd() - 0.5;
      this.park[i] = rnd() * Math.PI * 2;
      this.tone[i] = rnd() < 0.62 ? C_TEXT : C_DOWN;
    }
    // The 100 (or 10) selected, spread through the 2,000 (or 200), not clustered.
    const gc = g.grid.count;
    const picks = new Set<number>();
    const rp = rng(100_2000);
    while (picks.size < g.grid.lit) picks.add(Math.floor(rp() * gc));
    for (let i = 0; i < n; i++) this.lit[i] = this.rank[i] < gc && picks.has(this.rank[i]) ? 1 : 0;

    // Start scattered beyond the edges, invisible: the first state flies them in.
    for (let i = 0; i < n; i++) {
      const p = this.parkPos(i);
      this.x[i] = p.x;
      this.y[i] = p.y;
      this.tx[i] = p.x;
      this.ty[i] = p.y;
      this.s[i] = 1.6;
      const c = PALETTE[this.tone[i]];
      this.r[i] = c[0];
      this.gr[i] = c[1];
      this.b[i] = c[2];
    }
  }

  private parkPos(i: number) {
    const { W, H } = this.g;
    const d = Math.hypot(W, H) * (0.62 + 0.25 * (this.jx[i] + 0.5));
    return { x: W / 2 + Math.cos(this.park[i]) * d, y: H / 2 + Math.sin(this.park[i]) * d };
  }

  /** Re-lay the current state for a new viewport (same point count). */
  resize(g: Geo) {
    this.g = g;
    const s = this.state;
    this.state = -1;
    if (s >= 0) this.setState(s, true);
  }

  /**
   * Move to state `s`. `instant` places everything at rest (reduced motion, resize).
   */
  setState(s: number, instant = false) {
    if (s === this.state && !instant) return;
    const prev = this.state;
    this.state = s;
    const g = this.g;
    const n = this.n;
    const t = this.t;
    const id = STATES[s];
    const back = prev > s;

    for (let i = 0; i < n; i++) {
      const r = this.rank[i];
      let x = 0, y = 0, a1 = 0, a2 = 0, aDelay = 0, size = 1.6, col = this.tone[i], delay = 0;
      let parked = false;

      if (id === "field") {
        // Jittered grid over the whole stage, in a random order relative to rank.
        const cols = Math.round(Math.sqrt((n * g.W) / g.H));
        const rows = Math.ceil(n / cols);
        const cw = g.W / cols;
        const ch = g.H / rows;
        const cell = (i * 7919) % n; // a fixed shuffle independent of rank
        x = ((cell % cols) + 0.5 + this.jx[i] * 0.7) * cw;
        y = (Math.floor(cell / cols) + 0.5 + this.jy[i] * 0.7) * ch;
        const underCopy = x > g.panel.x && x < g.panel.x + g.panel.w && y > g.panel.y;
        a1 = a2 = (underCopy ? 0.3 : 1) * (col === C_TEXT ? 0.78 : 1);
        size = g.phone ? 2.6 : 2.3;
        delay = (Math.hypot(x - g.W / 2, y - g.H / 2) / Math.hypot(g.W, g.H)) * 0.5 + Math.abs(this.jy[i]) * 0.25;
      } else if (id === "nfo") {
        const p = columnPoint(g, r);
        x = p.x;
        y = p.y;
        const amber = r === g.column.amber;
        col = amber ? C_AMBER : C_TEXT;
        a1 = a2 = amber ? 1 : 0.5 + 0.25 * (1 - r / n);
        size = amber ? 9 : Math.max(1.4, g.column.step * 0.56);
        // Top ranks land first; the amber point lands last of its row and pops.
        delay = (r / n) * 0.75 + (this.jx[i] + 0.5) * 0.3 + (amber ? 0.9 : 0);
      } else if (id === "fellowship") {
        if (r < g.grid.count) {
          const gx = r % g.grid.cols;
          const gy = Math.floor(r / g.grid.cols);
          x = g.grid.x + gx * g.grid.step;
          y = g.grid.y + gy * g.grid.step;
          const isLit = this.lit[i] === 1;
          col = isLit ? C_AMBER : C_TEXT;
          a1 = 0.85;
          a2 = isLit ? 1 : 0.13;
          aDelay = 1.25 + (isLit ? 0 : (this.jy[i] + 0.5) * 0.35);
          size = isLit ? (g.phone ? 6 : 4.6) : g.phone ? 3.4 : 2.6;
          delay = (gy / g.grid.rows) * 0.45 + (this.jx[i] + 0.5) * 0.25;
        } else parked = true;
      } else if (id === "srcc") {
        if (r < g.rule.count) {
          const p = rulePoint(g, r);
          x = p.x;
          y = p.y;
          const amber = r === g.rule.count - 1;
          col = amber ? C_AMBER : C_TEXT;
          a1 = a2 = amber ? 1 : 0.8;
          size = amber ? 13 : g.phone ? 3.6 : 5.5;
          delay = 0.15 + (r / g.rule.count) * 0.7 + (amber ? 0.35 : 0);
        } else parked = true;
      } else {
        // shisfest: the rule draws into one point at position 1.
        if (r < g.rule.count) {
          const p = rulePoint(g, 0);
          x = p.x;
          y = p.y;
          const one = r === 0;
          col = one ? C_AMBER : C_TEXT;
          a1 = one ? 1 : 0.8;
          a2 = one ? 1 : 0;
          aDelay = one ? 0 : 0.35 + (r / g.rule.count) * 0.5;
          size = one ? (g.phone ? 18 : 26) : 5.5;
          delay = one ? 0 : (1 - r / g.rule.count) * 0.25;
        } else parked = true;
      }

      if (parked) {
        const p = this.parkPos(i);
        x = p.x;
        y = p.y;
        a1 = a2 = 0;
        delay = (this.jx[i] + 0.5) * 0.35;
      }
      if (back) delay *= 0.6;

      if (instant) {
        this.x[i] = this.tx[i] = x;
        this.y[i] = this.ty[i] = y;
        this.vx[i] = this.vy[i] = 0;
        this.pending[i] = 0;
        this.a[i] = this.a1[i] = this.a2[i] = a2;
        this.aAt[i] = -1;
        this.s[i] = this.sT[i] = size;
        const c = PALETTE[col];
        this.r[i] = c[0];
        this.gr[i] = c[1];
        this.b[i] = c[2];
        this.col[i] = col;
      } else {
        this.px[i] = x;
        this.py[i] = y;
        this.at[i] = t + delay;
        this.pending[i] = 1;
        this.a1[i] = a1;
        this.a2[i] = a2;
        this.aAt[i] = t + delay + aDelay;
        this.sT[i] = size;
        this.col[i] = col;
      }
    }
  }

  /** Advance by dt seconds. */
  step(dt: number) {
    dt = Math.min(dt, 1 / 30);
    const t = (this.t += dt);
    const n = this.n;
    const { x, y, vx, vy, tx, ty, px, py, at, pending, a, a1, a2, aAt, s, sT, r, gr, b, col, k, swirl } = this;
    const cx = this.g.W / 2;
    const cy = this.g.H / 2;
    const fa = 1 - Math.exp(-dt / 0.22);
    const fs = 1 - Math.exp(-dt / 0.2);
    const sub = 2;
    const h = dt / sub;
    for (let i = 0; i < n; i++) {
      if (pending[i] && t >= at[i]) {
        pending[i] = 0;
        tx[i] = px[i];
        ty[i] = py[i];
        // Swirl kick: perpendicular to the flight, all one way, plus a short burst outward.
        const dx = tx[i] - x[i];
        const dy = ty[i] - y[i];
        const sw = swirl[i] * 1.5;
        vx[i] += -dy * sw;
        vy[i] += dx * sw;
        const ox = x[i] - cx;
        const oy = y[i] - cy;
        const ol = Math.hypot(ox, oy) || 1;
        const burst = Math.min(420, Math.hypot(dx, dy) * 0.9) * swirl[i];
        vx[i] += (ox / ol) * burst;
        vy[i] += (oy / ol) * burst;
      }
      const ki = k[i];
      const ci = 2 * 0.6 * Math.sqrt(ki);
      for (let j = 0; j < sub; j++) {
        vx[i] += (ki * (tx[i] - x[i]) - ci * vx[i]) * h;
        vy[i] += (ki * (ty[i] - y[i]) - ci * vy[i]) * h;
        x[i] += vx[i] * h;
        y[i] += vy[i] * h;
      }
      if (!pending[i]) {
        const at2 = t >= aAt[i] ? a2[i] : a1[i];
        a[i] += (at2 - a[i]) * fa;
        s[i] += (sT[i] - s[i]) * fs;
        const c = PALETTE[col[i]];
        r[i] += (c[0] - r[i]) * fs;
        gr[i] += (c[1] - gr[i]) * fs;
        b[i] += (c[2] - b[i]) * fs;
      }
    }
    this.part(dt);
  }

  /** Points part around the pointer (display offset only; the simulation is untouched). */
  private part(dt: number) {
    const p = this.pointer;
    if (!p.on && !this.parted) return;
    const R = this.g.phone ? 58 : 84;
    const f = 1 - Math.exp(-dt / 0.09);
    let any = false;
    const { x, y, ox, oy } = this;
    for (let i = 0; i < this.n; i++) {
      let dx = 0, dy = 0;
      if (p.on) {
        const ex = x[i] - p.x;
        const ey = y[i] - p.y;
        const d2 = ex * ex + ey * ey;
        if (d2 < R * R) {
          const d = Math.sqrt(d2) || 1;
          const push = (R - d) * (1 - d / (R * 1.6));
          dx = (ex / d) * push;
          dy = (ey / d) * push;
        }
      }
      ox[i] += (dx - ox[i]) * f;
      oy[i] += (dy - oy[i]) * f;
      if (Math.abs(ox[i]) + Math.abs(oy[i]) > 0.05) any = true;
    }
    this.parted = any;
  }

  /** True once every point has been released and is nearly still. */
  settled() {
    for (let i = 0; i < this.n; i += 7) {
      if (this.pending[i] || Math.abs(this.vx[i]) + Math.abs(this.vy[i]) > 1.5) return false;
    }
    return !this.parted && !this.pointer.on;
  }
}

// ── Renderers ──

export interface FieldRenderer {
  resize(w: number, h: number, dpr: number): void;
  draw(sim: FieldSim): void;
  destroy(): void;
}

const VS = `#version 300 es
precision highp float;
layout(location=0) in vec2 aPos;
layout(location=1) in float aSize;
layout(location=2) in vec4 aColor;
uniform vec2 uView;
uniform float uDpr;
out vec4 vColor;
out float vSize;
void main() {
  vec2 c = aPos / uView * 2.0 - 1.0;
  gl_Position = vec4(c.x, -c.y, 0.0, 1.0);
  float s = aSize * uDpr;
  gl_PointSize = max(s, 1.0);
  vSize = s;
  // Sub-pixel points fade instead of shimmering.
  vColor = vec4(aColor.rgb, aColor.a * min(1.0, s));
}`;

const FS = `#version 300 es
precision highp float;
in vec4 vColor;
in float vSize;
out vec4 o;
void main() {
  vec2 p = gl_PointCoord - 0.5;
  float d = length(p) * max(vSize, 1.0);
  float m = clamp(vSize * 0.5 - d + 0.5, 0.0, 1.0);
  float A = m * vColor.a;
  if (A < 0.004) discard;
  o = vec4(vColor.rgb * A, A);
}`;

export class GLRenderer implements FieldRenderer {
  private gl: WebGL2RenderingContext;
  private prog: WebGLProgram;
  private buf: WebGLBuffer;
  private vao: WebGLVertexArrayObject;
  private data: Float32Array;
  private uView: WebGLUniformLocation | null;
  private uDpr: WebGLUniformLocation | null;
  private dpr = 1;
  private w = 1;
  private h = 1;

  constructor(private canvas: HTMLCanvasElement, n: number) {
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: true, premultipliedAlpha: true });
    if (!gl) throw new Error("WebGL2 unavailable");
    this.gl = gl;
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
      return s;
    };
    const p = gl.createProgram()!;
    gl.attachShader(p, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "link");
    this.prog = p;
    this.uView = gl.getUniformLocation(p, "uView");
    this.uDpr = gl.getUniformLocation(p, "uDpr");
    this.data = new Float32Array(n * 7);
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    this.buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.bufferData(gl.ARRAY_BUFFER, this.data.byteLength, gl.DYNAMIC_DRAW);
    const stride = 7 * 4;
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 1, gl.FLOAT, false, stride, 8);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, stride, 12);
    gl.bindVertexArray(null);
  }

  resize(w: number, h: number, dpr: number) {
    this.w = w;
    this.h = h;
    this.dpr = dpr;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
  }

  draw(sim: FieldSim) {
    const gl = this.gl;
    const d = this.data;
    const { x, y, ox, oy, s, r, gr, b, a, n } = sim;
    for (let i = 0, o = 0; i < n; i++, o += 7) {
      d[o] = x[i] + ox[i];
      d[o + 1] = y[i] + oy[i];
      d[o + 2] = s[i];
      d[o + 3] = r[i];
      d[o + 4] = gr[i];
      d[o + 5] = b[i];
      d[o + 6] = a[i];
    }
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(this.prog);
    gl.uniform2f(this.uView, this.w, this.h);
    gl.uniform1f(this.uDpr, this.dpr);
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, d);
    gl.drawArrays(gl.POINTS, 0, n);
    gl.bindVertexArray(null);
  }

  destroy() {
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}

export class CanvasRenderer implements FieldRenderer {
  private ctx: CanvasRenderingContext2D;
  private dpr = 1;
  private w = 1;
  private h = 1;
  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas unavailable");
    this.ctx = ctx;
  }
  resize(w: number, h: number, dpr: number) {
    this.w = w;
    this.h = h;
    this.dpr = dpr;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
  }
  draw(sim: FieldSim) {
    const c = this.ctx;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.clearRect(0, 0, this.w, this.h);
    const { x, y, ox, oy, s, r, gr, b, a, n } = sim;
    let last = "";
    for (let i = 0; i < n; i++) {
      if (a[i] < 0.01) continue;
      const px = x[i] + ox[i];
      const py = y[i] + oy[i];
      if (px < -10 || py < -10 || px > this.w + 10 || py > this.h + 10) continue;
      // Quantised colour keeps fillStyle changes cheap.
      const fill = `rgb(${(r[i] * 15) | 0},${(gr[i] * 15) | 0},${(b[i] * 15) | 0})`;
      if (fill !== last) {
        c.fillStyle = `rgb(${Math.round(r[i] * 255)},${Math.round(gr[i] * 255)},${Math.round(b[i] * 255)})`;
        last = fill;
      }
      c.globalAlpha = Math.min(1, a[i]);
      const sz = s[i];
      if (sz > 3.2) {
        c.beginPath();
        c.arc(px, py, sz / 2, 0, Math.PI * 2);
        c.fill();
      } else c.fillRect(px - sz / 2, py - sz / 2, sz, sz);
    }
    c.globalAlpha = 1;
  }
  destroy() {}
}

/** English ordinal suffix key for n (1st, 2nd, 3rd, 4th, 11th–13th). */
export function ordinalKey(n: number): "one" | "two" | "few" | "other" {
  const m100 = n % 100;
  if (m100 >= 11 && m100 <= 13) return "other";
  const m = n % 10;
  return m === 1 ? "one" : m === 2 ? "two" : m === 3 ? "few" : "other";
}
