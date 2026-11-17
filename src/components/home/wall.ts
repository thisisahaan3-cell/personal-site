/**
 * The candle wall (direction §4). Raw WebGL2, two instanced layers drawn by one program:
 *   layer 0, backdrop: luminance of the M1 loop (or procedural "city light"), dim, full screen;
 *   layer 1, portrait: the alpha-matted portrait, one candle per cell.
 * Every candle is one instanced quad; the vertex shader samples its source texture, so
 * nothing is read back to the CPU. The fragment shader draws wick and body with
 * analytic anti-aliasing, and inside the pointer lens shows the true photograph.
 */

export type Rect = { x: number; y: number; w: number; h: number };
export type WallLayout = {
  view: { w: number; h: number };
  /** The portrait layer's grid: the right half on desktop, the top region on phone. */
  frame: Rect;
  /** Where the (zoomed) portrait photograph sits, in CSS px; it may bleed past the frame. */
  image: Rect;
  backdropGrid: [number, number];
  portraitGrid: [number, number];
  /** Candles below this y (CSS px) are dimmed so the foot row reads. */
  footY: number;
  /** Portrait candles fade out above this y (the phone portrait's lower edge). */
  clipY: number;
  phone: boolean;
};

const SERIES_N = 96;

const VS = /* glsl */ `#version 300 es
precision highp float;
layout(location=0) in vec2 aCorner;
layout(location=1) in vec2 aCell;

uniform vec2 uView;
uniform float uLayer;
uniform vec2 uGrid;
uniform vec4 uRect;
uniform vec4 uImg;
uniform sampler2D uPortrait;
uniform sampler2D uSource;
uniform sampler2D uTone;
uniform vec4 uFrame;
uniform float uUseVideo;
uniform float uLod;
uniform float uTime;
uniform float uIntro;
uniform float uReplay;
uniform vec2 uOrigin;
uniform float uPrint;
uniform vec3 uPointer;
uniform vec2 uVel;
uniform vec3 uLean;
uniform float uFootY;
uniform float uClipY;
uniform vec4 uSeries[${SERIES_N}];

out vec2 vLocal;
out vec2 vBodyHalf;
out float vWickHalf;
out vec4 vColor;
out float vLens;
out vec2 vScreen;

const float PI = 3.14159265;
const vec3 TEXT = vec3(0.910, 0.929, 0.965);
const vec3 DOWN = vec3(0.306, 0.404, 0.573);
/* Portrait only: the down blue lifted so brightness, not hue, carries the face. */
const vec3 DOWN_P = vec3(0.560, 0.660, 0.840);
const vec3 AMBER = vec3(0.949, 0.647, 0.255);

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float lum(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
float glide(float t) { return t >= 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * t); }
/* One damped overshoot: 0 -> ~1.09 -> 1. */
float settle(float u) { return u >= 1.0 ? 1.0 : 1.0 - exp(-4.0 * u) * cos(1.5 * PI * u); }

float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}

/* Procedural city light, used when the footage is missing: a slow aerial drift over lit windows. */
float city(vec2 uv, float t) {
  vec2 p = uv + vec2(t * 0.004, 0.0);
  float col = floor(p.x * 34.0);
  float height = 0.22 + 0.55 * hash(vec2(col, 3.0)) * (0.55 + 0.45 * hash(vec2(col, 9.0)));
  float building = step(1.0 - height, uv.y);
  vec2 w = floor(p * uGrid);
  float lit = step(0.58, hash(w + floor(t * 0.12 + hash(w) * 8.0)));
  float haze = vnoise(p * vec2(5.0, 3.0) + vec2(t * 0.03, 0.0));
  float street = smoothstep(0.86, 1.0, uv.y) * (0.5 + 0.5 * vnoise(vec2(p.x * 40.0 - t * 0.6, uv.y * 4.0)));
  float v = building * (0.12 + 0.88 * lit) * (0.35 + 0.65 * haze);
  v += (1.0 - building) * 0.10 * haze;
  return clamp(v + street * 0.8, 0.0, 1.0);
}

float backdrop(vec2 uv) {
  if (uUseVideo > 0.5) {
    float l = lum(texture(uSource, uv).rgb);
    /* Night footage sits low: open the shadows so the whole wall moves, not only the brightest lights. */
    return pow(smoothstep(0.015, 0.6, l), 0.75);
  }
  return city(uv, uTime);
}

/* Tone map -> 0..1. Height and brightness both follow L^0.7, so apparent brightness tracks the photograph. */
/* A floor under the shadows so hair and the outline of the head read; highlights unchanged. */
float portraitTone(float t) { return 0.15 + 0.85 * smoothstep(0.04, 0.95, t); }

bool insideRect(vec2 p, vec4 r) { return p.x >= r.x && p.x <= r.x + r.z && p.y >= r.y && p.y <= r.y + r.w; }

void main() {
  vec2 cell = uRect.zw / uGrid;
  vec2 c = uRect.xy + (aCell + 0.5) * cell;
  vec2 uv = (aCell + 0.5) / uGrid;
  vec2 left = vec2(1.0 / uGrid.x, 0.0);
  bool portrait = uLayer > 0.5;

  float L, Ll, alpha;
  vec2 puv = (c - uImg.xy) / uImg.zw;
  bool onImage = puv.x > 0.0 && puv.x < 1.0 && puv.y > 0.0 && puv.y < 1.0;
  if (portrait) {
    vec2 step1 = vec2(cell.x / uImg.z, 0.0);
    L = portraitTone(textureLod(uTone, puv, uLod).r);
    Ll = portraitTone(textureLod(uTone, puv - step1, uLod).r);
    float a = onImage ? textureLod(uPortrait, puv, uLod).a : 0.0;
    alpha = smoothstep(0.08, 0.55, a)
      * (1.0 - smoothstep(uClipY - cell.y * 3.0, uClipY, c.y))
      * smoothstep(0.0, cell.x * 5.0, c.x - uRect.x);
  } else {
    L = backdrop(uv);
    Ll = backdrop(uv - left);
    float pa = 0.0;
    if (onImage && insideRect(c, uFrame) && c.y < uClipY) pa = textureLod(uPortrait, puv, uLod + 0.5).a;
    alpha = 1.0 - smoothstep(0.05, 0.45, pa);
  }

  bool up = portrait ? L + 0.02 >= Ll : L >= Ll;
  float r1 = hash(aCell + uLayer * 91.7);
  float r2 = hash(aCell * 1.37 + 4.1 + uLayer * 13.0);
  float r3 = hash(aCell * 2.11 + 9.7 + uLayer * 5.0);

  /* ── Intro: series -> burst -> settle ── */
  float k = clamp(floor(c.x / uView.x * ${SERIES_N.toFixed(1)}), 0.0, ${(SERIES_N - 1).toFixed(1)});
  vec4 sr = uSeries[int(k)];
  float sx = (k + 0.5) / ${SERIES_N.toFixed(1)} * uView.x;
  float sw = uView.x / ${SERIES_N.toFixed(1)} * 0.56;
  float top = min(sr.x, sr.y), bot = max(sr.x, sr.y) + 1.5;
  bool wickCell = r2 < 0.16;
  vec2 src = wickCell ? vec2(sx, mix(sr.z, sr.w, r1)) : vec2(sx, mix(top, bot, r1));
  vec2 srcBox = wickCell ? vec2(1.0, max(1.5, (sr.w - sr.z) * 0.12)) : vec2(sw, max(1.5, (bot - top) * 0.16));
  bool seriesUp = sr.y <= sr.x;
  float appear = 0.10 + k / ${SERIES_N.toFixed(1)} * 0.8;
  float seriesA = smoothstep(appear, appear + 0.06, uIntro);

  float d0 = 1.0 + k * 0.006;
  float e = glide(clamp((uIntro - d0) / 0.64, 0.0, 1.0));
  float su = clamp((uIntro - 2.2) / 0.7, 0.0, 1.0);
  float st = settle(su);
  vec2 scatter = (vec2(r1, r3) - 0.5) * vec2(260.0, 340.0);

  /* Replay from a click: every cell bursts from the click point and settles again (0.9s). */
  if (uReplay < 0.9) {
    float dl = length(c - uOrigin) / length(uView) * 0.3;
    e = glide(clamp((uReplay - dl) / 0.42, 0.0, 1.0));
    su = clamp((uReplay - 0.45) / 0.45, 0.0, 1.0);
    st = settle(su);
    src = uOrigin + (vec2(r1, r2) - 0.5) * 18.0;
    srcBox = vec2(1.5);
    seriesA = 1.0;
    seriesUp = up;
    scatter *= 0.5;
  }

  float hRand = 0.1 + 0.9 * r3;
  float h = clamp(mix(hRand, L, st), 0.0, 1.15);

  /* At rest: breathing on the portrait. */
  if (portrait) h *= 1.0 + 0.04 * sin(uTime * 1.7 + c.y * 0.011 + c.x * 0.006) * st;

  vec2 pos = mix(src, c, e) + scatter * sin(PI * e) * (1.0 - e);
  vec2 box = mix(srcBox, cell, e);

  /* Pointer: lens (portrait only), velocity stretch. */
  float d = length(c - uPointer.xy);
  float lens = portrait ? (1.0 - smoothstep(92.0, 140.0, d)) * uPointer.z * st : 0.0;
  float speed = clamp(length(uVel) / 2400.0, 0.0, 1.0);
  float near = pow(max(0.0, 1.0 - d / 240.0), 2.0);
  float stretch = speed * near * st;
  if (length(uVel) > 1.0) pos += normalize(uVel) * stretch * 14.0;
  float sy = 1.0 + stretch * 1.4;

  /* Lean toward a hovered destination. */
  vec2 toLean = uLean.xy - pos;
  if (uLean.z > 0.001 && length(toLean) > 1.0)
    pos += normalize(toLean) * uLean.z * 7.0 * (0.35 + 0.65 * (1.0 - c.y / uView.y));

  /* Geometry within the box. */
  float bodyW = portrait ? 0.74 : 0.52;
  float P = pow(clamp(h, 0.0, 1.2), 0.62);
  float bh = portrait ? 0.06 + 0.86 * P : 0.10 + 0.78 * h;
  float restBodyW = mix(1.0, bodyW, e);
  float restBodyH = mix(1.0, bh, e);
  vec2 bodyHalf = vec2(box.x * 0.5 * restBodyW, box.y * 0.5 * restBodyH * sy);
  float wickHalf = box.y * 0.5 * min(1.0, restBodyH + 0.3) * sy * e;
  bodyHalf = mix(bodyHalf, box * 0.5, lens);
  wickHalf *= 1.0 - lens;

  /* Colour. */
  vec3 restCol = up ? TEXT : (portrait ? DOWN_P : DOWN);
  /* Backdrop tops out at 60% so the face stays the brightest thing on the wall. */
  float bright = portrait ? 0.12 + 0.88 * min(P, 1.0) : 0.6 * mix(0.25, 1.0, clamp(h, 0.0, 1.0));
  vec3 col = mix(seriesUp ? TEXT : DOWN, restCol * bright, e);

  /* Amber "last print": one column at a time across the wall, with a short tail. */
  float dp = uPrint - c.x;
  float print = dp >= -cell.x * 0.5 ? exp(-max(dp - cell.x * 0.5, 0.0) / (cell.x * 2.5)) : 0.0;
  print *= step(dp, cell.x * 30.0) * st;
  col = mix(col, AMBER * (portrait ? 1.0 : 0.7), print * (portrait ? 0.95 : 0.8));

  /* Desktop: the backdrop quietens behind the name and descriptor so the copy stays legible. */
  if (!portrait && uView.x >= 760.0) {
    float qx = 1.0 - smoothstep(0.36, 0.5, c.x / uView.x);
    float qy = smoothstep(0.3, 0.44, c.y / uView.y);
    col *= 1.0 - 0.62 * qx * qy * e;
  }

  /* Foot row: candles below the rule are quieter. */
  float foot = step(uFootY, c.y);
  col *= mix(1.0, portrait ? 0.4 : 0.55, foot * e);

  float a = mix(seriesA, alpha, e);
  if (a < 0.002) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }

  vec2 quad = vec2(box.x, box.y * sy) * 1.02;
  vec2 local = aCorner * quad;
  vec2 screen = pos + local;
  vLocal = local;
  vBodyHalf = bodyHalf;
  vWickHalf = wickHalf;
  vColor = vec4(col, a);
  vLens = lens;
  vScreen = screen;
  vec2 clip = screen / uView * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}`;

const FS = /* glsl */ `#version 300 es
precision highp float;
in vec2 vLocal;
in vec2 vBodyHalf;
in float vWickHalf;
in vec4 vColor;
in float vLens;
in vec2 vScreen;
uniform sampler2D uPortrait;
uniform vec4 uImg;
out vec4 o;

float boxMask(vec2 p, vec2 hs) {
  vec2 w = max(fwidth(p), vec2(1e-4));
  vec2 m = clamp(0.5 - (abs(p) - hs) / w, 0.0, 1.0);
  return m.x * m.y;
}

void main() {
  float body = boxMask(vLocal, vBodyHalf);
  float wick = boxMask(vLocal, vec2(0.5, vWickHalf)) * 0.35;
  float m = max(body, wick);
  vec3 col = vColor.rgb;
  float a = vColor.a;
  if (vLens > 0.001) {
    vec4 ph = texture(uPortrait, (vScreen - uImg.xy) / uImg.zw);
    col = mix(col, ph.rgb, vLens);
    a = mix(a, smoothstep(0.02, 0.6, ph.a), vLens);
  }
  float A = m * a;
  if (A < 0.003) discard;
  o = vec4(col * A, A);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error(`Candle wall shader failed: ${log}`);
  }
  return s;
}

/** Seeded random walk: the schematic series drawn along the hairline at 0s. */
function makeSeries(view: { w: number; h: number }) {
  let s = 20260;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const base = view.h * 0.62;
  const amp = view.h * 0.07;
  const out = new Float32Array(SERIES_N * 4);
  let v = 0;
  for (let i = 0; i < SERIES_N; i++) {
    const open = v;
    v = Math.max(-1, Math.min(1, v + (rnd() - 0.48) * 0.42));
    const close = v;
    const hi = Math.max(open, close) + rnd() * 0.18;
    const lo = Math.min(open, close) - rnd() * 0.18;
    out[i * 4 + 0] = base - open * amp;
    out[i * 4 + 1] = base - close * amp;
    out[i * 4 + 2] = base - hi * amp;
    out[i * 4 + 3] = base - lo * amp;
  }
  return out;
}

type Layer = { vao: WebGLVertexArrayObject; count: number; grid: [number, number] };

export class CandleWall {
  private gl: WebGL2RenderingContext;
  private prog: WebGLProgram;
  private u: Record<string, WebGLUniformLocation | null> = {};
  private layers: { backdrop?: Layer; portrait?: Layer } = {};
  private quad: WebGLBuffer;
  private texPortrait: WebGLTexture;
  private texSource: WebGLTexture;
  private texTone: WebGLTexture;
  private sourceCanvas = document.createElement("canvas");
  private sourceCtx = this.sourceCanvas.getContext("2d", { willReadFrequently: true })!;
  private video: HTMLVideoElement | null = null;
  private useVideo = false;
  private portraitSize = { w: 1, h: 1 };
  private layout: WallLayout | null = null;
  private series = new Float32Array(SERIES_N * 4);
  private dpr = 1;
  private raf = 0;
  private running = false;
  private visible = true;
  private t0 = performance.now();
  private introStart = -1;
  private replayStart = -1e9;
  private origin = { x: 0, y: 0 };
  private lastPrint = 0;
  private pointer = { x: -1e4, y: -1e4, active: false, lens: 0, last: 0 };
  private vel = { x: 0, y: 0 };
  private lean = { x: 0, y: 0, target: 0, amount: 0 };
  private lastFrame = performance.now();
  private lastVideoTime = -1;
  private io: IntersectionObserver;
  private onVis = () => this.updateRunning();
  /** Phone: the lens drifts over the face by itself after 4s idle. */
  private autoLens = false;

  constructor(private canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
    if (!gl) throw new Error("WebGL2 unavailable");
    this.gl = gl;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? "link failed");
    this.prog = prog;
    for (const n of [
      "uView", "uLayer", "uGrid", "uRect", "uImg", "uFrame", "uPortrait", "uSource", "uTone", "uUseVideo", "uLod", "uTime",
      "uIntro", "uReplay", "uOrigin", "uPrint", "uPointer", "uVel", "uLean", "uFootY", "uClipY", "uSeries",
    ]) this.u[n] = gl.getUniformLocation(prog, n);

    this.quad = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5]), gl.STATIC_DRAW);

    this.texPortrait = this.makeTexture();
    this.texTone = this.makeTexture();
    this.texSource = this.makeTexture();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));

    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting;
      this.updateRunning();
    });
    this.io.observe(canvas);
    document.addEventListener("visibilitychange", this.onVis);
  }

  private makeTexture() {
    const gl = this.gl;
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return t;
  }

  /** The alpha-matted photograph (alpha and the lens) and its tone map (candle heights). */
  setPortrait(matte: HTMLImageElement, tone: HTMLImageElement) {
    const gl = this.gl;
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    for (const [tex, img] of [
      [this.texPortrait, matte],
      [this.texTone, tone],
    ] as const) {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
    }
    this.portraitSize = { w: matte.naturalWidth, h: matte.naturalHeight };
  }

  setVideo(video: HTMLVideoElement | null) {
    this.video = video;
    this.useVideo = Boolean(video);
    this.lastVideoTime = -1;
  }

  private makeLayer(grid: [number, number]): Layer {
    const gl = this.gl;
    const [cols, rows] = grid;
    const cells = new Float32Array(cols * rows * 2);
    for (let r = 0, i = 0; r < rows; r++) for (let c = 0; c < cols; c++, i += 2) {
      cells[i] = c;
      cells[i + 1] = r;
    }
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, cells, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(1, 1);
    gl.bindVertexArray(null);
    return { vao, count: cols * rows, grid };
  }

  setLayout(l: WallLayout) {
    const sameGrid = (a?: Layer, g?: [number, number]) => a && g && a.grid[0] === g[0] && a.grid[1] === g[1];
    if (!sameGrid(this.layers.backdrop, l.backdropGrid)) this.layers.backdrop = this.makeLayer(l.backdropGrid);
    if (!sameGrid(this.layers.portrait, l.portraitGrid)) this.layers.portrait = this.makeLayer(l.portraitGrid);
    this.layout = l;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(l.view.w * this.dpr);
    this.canvas.height = Math.round(l.view.h * this.dpr);
    this.series = makeSeries(l.view);
    this.sourceCanvas.width = l.backdropGrid[0] * 2;
    this.sourceCanvas.height = l.backdropGrid[1] * 2;
    this.lastVideoTime = -1;
    if (!this.running) this.draw();
  }

  /** Seconds since the intro started; before it starts the wall is black. */
  startIntro() {
    this.introStart = performance.now();
    // Lets frame-by-frame capture tools align their clock with the intro (scripts/capture-home.mjs).
    this.canvas.dataset.introStart = String(this.introStart);
    this.lastPrint = this.introStart + 2900;
    this.updateRunning();
  }

  /** Skip straight to the settled wall (used for the pre-rendered still and on resize). */
  settleNow() {
    this.introStart = performance.now() - 60_000;
  }

  replay(x: number, y: number) {
    if (this.introStart < 0 || performance.now() - this.introStart < 2900) return;
    this.replayStart = performance.now();
    this.origin = { x, y };
  }

  pointerMove(x: number, y: number) {
    const now = performance.now();
    const p = this.pointer;
    if (p.active && now - p.last < 100) {
      const dt = Math.max(1, now - p.last) / 1000;
      const vx = (x - p.x) / dt;
      const vy = (y - p.y) / dt;
      this.vel.x = this.vel.x * 0.5 + vx * 0.5;
      this.vel.y = this.vel.y * 0.5 + vy * 0.5;
    }
    p.x = x;
    p.y = y;
    p.active = true;
    p.last = now;
    this.autoLens = false;
  }

  pointerLeave() {
    this.pointer.active = false;
  }

  setLean(x: number, y: number, on: boolean) {
    if (on) {
      this.lean.x = x;
      this.lean.y = y;
    }
    this.lean.target = on ? 1 : 0;
  }

  setAutoLens(on: boolean) {
    this.autoLens = on;
  }

  private updateRunning() {
    const should = this.visible && !document.hidden && this.introStart >= 0;
    if (should && !this.running) {
      this.running = true;
      this.lastFrame = performance.now();
      this.raf = requestAnimationFrame(this.frame);
    } else if (!should && this.running) {
      this.running = false;
      cancelAnimationFrame(this.raf);
    }
    if (this.video) {
      if (should) this.video.play().catch(() => {});
      else this.video.pause();
    }
  }

  private frame = () => {
    if (!this.running) return;
    this.draw();
    this.raf = requestAnimationFrame(this.frame);
  };

  private uploadVideo() {
    const v = this.video;
    if (!v || v.readyState < 2 || v.currentTime === this.lastVideoTime || !this.layout) return;
    this.lastVideoTime = v.currentTime;
    const cw = this.sourceCanvas.width;
    const ch = this.sourceCanvas.height;
    const s = Math.max(cw / v.videoWidth, ch / v.videoHeight);
    const w = v.videoWidth * s;
    const h = v.videoHeight * s;
    this.sourceCtx.imageSmoothingQuality = "high";
    this.sourceCtx.drawImage(v, (cw - w) / 2, (ch - h) / 2, w, h);
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texSource);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.sourceCanvas);
  }

  draw() {
    const l = this.layout;
    if (!l) return;
    const gl = this.gl;
    const now = performance.now();
    const dt = Math.min(0.1, (now - this.lastFrame) / 1000);
    this.lastFrame = now;
    const intro = this.introStart < 0 ? 0 : (now - this.introStart) / 1000;

    // Pointer lens, velocity decay (to ~0 within 600ms), lean easing.
    const p = this.pointer;
    let px = p.x;
    let py = p.y;
    if (this.autoLens) {
      const t = now / 1000;
      const img = l.image;
      // Drifts across the face (centre at 52%, 39% of the photograph).
      px = img.x + img.w * (0.52 + 0.13 * Math.sin(t * 0.55));
      py = img.y + img.h * (0.39 + 0.07 * Math.sin(t * 0.9 + 1));
    }
    const lensTarget = p.active || this.autoLens ? 1 : 0;
    p.lens += (lensTarget - p.lens) * (1 - Math.exp(-dt / 0.12));
    const decay = Math.exp(-dt / 0.15);
    this.vel.x *= decay;
    this.vel.y *= decay;
    this.lean.amount += (this.lean.target - this.lean.amount) * (1 - Math.exp(-dt / 0.14));

    // Amber last print every 7s once settled.
    let print = -1e5;
    if (intro > 2.9) {
      const since = (now - this.lastPrint) / 1000;
      if (since > 7) this.lastPrint = now;
      const sweep = 2.1;
      if (since >= 0 && since < sweep) print = (since / sweep) * (l.view.w + 80) - 40;
    }

    if (this.useVideo) this.uploadVideo();

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(10 / 255, 16 / 255, 28 / 255, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(this.prog);

    const u = this.u;
    gl.uniform2f(u.uView, l.view.w, l.view.h);
    gl.uniform4f(u.uImg, l.image.x, l.image.y, l.image.w, l.image.h);
    gl.uniform4f(u.uFrame, l.frame.x, l.frame.y, l.frame.w, l.frame.h);
    gl.uniform1f(u.uUseVideo, this.useVideo && this.lastVideoTime >= 0 ? 1 : 0);
    gl.uniform1f(u.uTime, (now - this.t0) / 1000);
    gl.uniform1f(u.uIntro, intro);
    gl.uniform1f(u.uReplay, (now - this.replayStart) / 1000);
    gl.uniform2f(u.uOrigin, this.origin.x, this.origin.y);
    gl.uniform1f(u.uPrint, print);
    gl.uniform3f(u.uPointer, px, py, p.lens);
    gl.uniform2f(u.uVel, this.vel.x, this.vel.y);
    gl.uniform3f(u.uLean, this.lean.x, this.lean.y, this.lean.amount);
    gl.uniform1f(u.uFootY, l.footY);
    gl.uniform1f(u.uClipY, l.clipY);
    gl.uniform4fv(u.uSeries, this.series);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texPortrait);
    gl.uniform1i(u.uPortrait, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.texSource);
    gl.uniform1i(u.uSource, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.texTone);
    gl.uniform1i(u.uTone, 2);

    const pg = l.portraitGrid;
    // Mip level where one texel is about one portrait cell, a little sharper.
    const texelsPerCell = (l.frame.w / pg[0]) * (this.portraitSize.w / l.image.w);
    const lod = Math.max(0, Math.log2(texelsPerCell) - 0.6);
    gl.uniform1f(u.uLod, lod);

    const drawLayer = (layer: Layer | undefined, index: number, rect: Rect) => {
      if (!layer) return;
      gl.uniform1f(u.uLayer, index);
      gl.uniform2f(u.uGrid, layer.grid[0], layer.grid[1]);
      gl.uniform4f(u.uRect, rect.x, rect.y, rect.w, rect.h);
      gl.bindVertexArray(layer.vao);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, layer.count);
    };
    drawLayer(this.layers.backdrop, 0, { x: 0, y: 0, w: l.view.w, h: l.view.h });
    drawLayer(this.layers.portrait, 1, l.frame);
    gl.bindVertexArray(null);
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.io.disconnect();
    document.removeEventListener("visibilitychange", this.onVis);
    this.video?.pause();
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
