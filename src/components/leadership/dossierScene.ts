/**
 * Leadership & Work Experience, "Dossiers" (design/v2.1-addendum.md §4). Seven folders drift
 * toward the camera through one tall shaft of window light, dappled by the canopy loop projected
 * as a light cookie (desktop). At the centre, scroll holds each folder: it settles flat, the
 * cover opens to 165°, the sheet inside lifts 3 cm showing the entry, then it closes and leaves
 * to the left. The pointer tilts the open folder up to 6°.
 *
 * The folders are built in code (a real folder is two scored sheets of card): rounded card
 * panels with a filing tab, a hinged cover, a typed label and a printed sheet. Card and cloth
 * surfaces are generated (fibre, weave, worn edges) and lit by the "warm interior" HDRI.
 */
import * as THREE from "three";
import { HDRI, SIZE_KB } from "@/lib/three/assets";
import type { Engine } from "@/components/three/engine";
import { clamp01, damp, shiftFrame, span } from "@/components/three/kit";
import type { WorkEntry } from "./entries";

export type DossierOptions = {
  element: HTMLElement;
  section: HTMLElement;
  entries: WorkEntry[];
  /** The canopy loop for the light cookie (desktop only). */
  video: string | null;
  motion: boolean;
  onActive: (i: number) => void;
};

const W = 0.24; // folder width (m)
const H = 0.315; // back panel height without the tab
const T = 0.0009; // card thickness
const SHEET_W = 0.212;
const SHEET_H = 0.3;

// ── Surfaces ──

function rand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Card or bookcloth colour map: fibres or a weave, worn lighter at the edges. */
function surface(base: string, kind: "card" | "cloth", seed: number) {
  const n = 512;
  const c = document.createElement("canvas");
  c.width = c.height = n;
  const g = c.getContext("2d")!;
  const r = rand(seed);
  g.fillStyle = base;
  g.fillRect(0, 0, n, n);
  if (kind === "card") {
    for (let i = 0; i < 2600; i++) {
      g.strokeStyle = r() > 0.5 ? "rgba(255,248,230,0.07)" : "rgba(60,40,10,0.07)";
      g.lineWidth = 0.6 + r();
      const x = r() * n;
      const y = r() * n;
      const a = r() * Math.PI;
      const l = 3 + r() * 9;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
      g.stroke();
    }
  } else {
    for (let y = 0; y < n; y += 3) {
      g.fillStyle = `rgba(0,0,0,${0.06 + r() * 0.05})`;
      g.fillRect(0, y, n, 1);
    }
    for (let x = 0; x < n; x += 3) {
      g.fillStyle = `rgba(255,255,255,${0.03 + r() * 0.04})`;
      g.fillRect(x, 0, 1, n);
    }
  }
  // Handled edges.
  const e = g.createLinearGradient(0, 0, n, 0);
  e.addColorStop(0, "rgba(255,240,210,0.0)");
  e.addColorStop(0.94, "rgba(255,240,210,0.0)");
  e.addColorStop(1, "rgba(255,240,210,0.16)");
  g.fillStyle = e;
  g.fillRect(0, 0, n, n);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function bump(seed: number, kind: "card" | "cloth") {
  const n = 256;
  const c = document.createElement("canvas");
  c.width = c.height = n;
  const g = c.getContext("2d")!;
  const img = g.createImageData(n, n);
  const r = rand(seed * 7 + 3);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const weave = kind === "cloth" ? ((x % 3 === 0 ? 40 : 0) + (y % 3 === 0 ? 40 : 0)) : 0;
      const v = 110 + r() * 40 + weave;
      const i = (y * n + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function fontVar(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function wrap(g: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number) {
  const words = text.split(/\s+/);
  let line = "";
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (g.measureText(t).width > max && line) {
      g.fillText(line, x, y);
      y += lh;
      line = w;
    } else line = t;
  }
  if (line) g.fillText(line, x, y);
  return y + lh;
}

type Fonts = { text: string; display: string; mono: string };

/** The printed sheet: the entry exactly as in site.ts (it is mirrored in the DOM). */
function sheetTexture(e: WorkEntry, f: Fonts, accent: string) {
  const w = 1060;
  const h = Math.round((w * SHEET_H) / SHEET_W);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = "#f4efe2";
  g.fillRect(0, 0, w, h);
  const r = rand(e.id.length * 31);
  for (let i = 0; i < 1800; i++) {
    g.fillStyle = `rgba(90,70,40,${r() * 0.035})`;
    g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
  }
  const m = 92;
  g.fillStyle = accent;
  g.fillRect(m, m, 64, 6);
  g.fillStyle = "#2a2b24";
  g.font = `600 40px ${f.text}`;
  let y = wrap(g, e.organisation, m, m + 78, w - 2 * m, 50);
  g.font = `italic 400 70px ${f.display}`;
  y = wrap(g, e.title, m, y + 46, w - 2 * m, 80);
  g.font = `400 32px ${f.mono}`;
  g.fillStyle = "#5d5f52";
  g.fillText(e.period, m, y + 14);
  g.fillStyle = "rgba(42,43,36,0.35)";
  g.fillRect(m, y + 58, w - 2 * m, 2);
  g.fillStyle = "#2a2b24";
  g.font = `400 34px ${f.text}`;
  y += 130;
  for (const p of e.points) {
    g.fillRect(m, y - 12, 12, 2);
    y = wrap(g, p, m + 36, y, w - 2 * m - 36, 50) + 22;
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** The typed label on the cover: organisation and title. */
function labelTexture(e: WorkEntry, f: Fonts) {
  const c = document.createElement("canvas");
  c.width = 640;
  c.height = 200;
  const g = c.getContext("2d")!;
  g.fillStyle = "#f1ebdb";
  g.fillRect(0, 0, 640, 200);
  g.strokeStyle = "rgba(40,40,30,0.5)";
  g.lineWidth = 3;
  g.strokeRect(14, 14, 612, 172);
  g.fillStyle = "#24261f";
  g.font = `600 34px ${f.text}`;
  wrap(g, e.organisation, 36, 70, 568, 40);
  g.font = `400 26px ${f.mono}`;
  g.fillStyle = "#5d5f52";
  g.fillText(e.period, 36, 168);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// ── Geometry ──

function rounded(w: number, h: number, r: number, tab?: { x: number; w: number; h: number }) {
  const s = new THREE.Shape();
  const x0 = -w / 2;
  const y0 = -h / 2;
  s.moveTo(x0 + r, y0);
  s.lineTo(x0 + w - r, y0);
  s.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
  s.lineTo(x0 + w, y0 + h - r);
  s.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h);
  if (tab) {
    const tx = x0 + tab.x;
    s.lineTo(tx + tab.w, y0 + h);
    s.quadraticCurveTo(tx + tab.w - 0.004, y0 + h + tab.h, tx + tab.w - 0.012, y0 + h + tab.h);
    s.lineTo(tx + 0.012, y0 + h + tab.h);
    s.quadraticCurveTo(tx + 0.004, y0 + h + tab.h, tx, y0 + h);
  }
  s.lineTo(x0 + r, y0 + h);
  s.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r);
  s.lineTo(x0, y0 + r);
  s.quadraticCurveTo(x0, y0, x0 + r, y0);
  const g = new THREE.ExtrudeGeometry(s, { depth: T, bevelEnabled: false, curveSegments: 6 });
  // Planar UVs over the panel (the shape's own UVs are in metres).
  g.computeBoundingBox();
  const bb = g.boundingBox!;
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) - bb.min.x) / (bb.max.x - bb.min.x), (pos.getY(i) - bb.min.y) / (bb.max.y - bb.min.y));
  uv.needsUpdate = true;
  return g;
}

type Folder = {
  root: THREE.Group;
  cover: THREE.Group;
  sheet: THREE.Mesh;
  pos: THREE.Vector3;
  rot: THREE.Euler;
  open: number;
  lift: number;
};

export async function buildDossiers(engine: Engine, o: DossierOptions) {
  const q = engine.quality;
  const env = await engine.loadEnvironment(HDRI.warmInterior, SIZE_KB[HDRI.warmInterior]);
  const fonts: Fonts = {
    text: fontVar("--ff-text-stack", "sans-serif"),
    display: fontVar("--ff-display-stack", "serif"),
    mono: fontVar("--ff-figure-stack", "monospace"),
  };
  await Promise.all([
    document.fonts.load(`600 40px ${fonts.text}`),
    document.fonts.load(`400 34px ${fonts.text}`),
    document.fonts.load(`italic 400 70px ${fonts.display}`),
    document.fonts.load(`400 32px ${fonts.mono}`),
  ]).catch(() => undefined);

  const scene = new THREE.Scene();
  scene.environment = env;
  scene.environmentIntensity = 0.22;
  const ground = new THREE.Color(0x0f130d);
  scene.fog = new THREE.Fog(ground, 1.6, 4.6);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 20);
  camera.position.set(0, 0.02, 1.25);
  camera.lookAt(0, 0, 0);

  // Materials: manila card for internships, fern bookcloth for roles.
  const manila = surface("#cfae6e", "card", 3);
  const fern = surface("#4d7349", "cloth", 9);
  const cardBump = bump(3, "card");
  const clothBump = bump(9, "cloth");
  const mat = {
    internship: new THREE.MeshStandardMaterial({ map: manila, bumpMap: cardBump, bumpScale: 0.6, roughness: 0.82, metalness: 0 }),
    role: new THREE.MeshPhysicalMaterial({ map: fern, bumpMap: clothBump, bumpScale: 1.2, roughness: 0.92, sheen: 0.7, sheenRoughness: 0.6, sheenColor: new THREE.Color(0x9fd3a2) }),
    inner: new THREE.MeshStandardMaterial({ color: 0xe9dcb8, roughness: 0.9 }),
  };
  const coverGeo = rounded(W - 0.004, H - 0.008, 0.006);
  const tabSlots = [0.02, 0.085, 0.15, 0.04, 0.11, 0.06, 0.13];

  const folders: Folder[] = o.entries.map((e, i) => {
    const m = e.kind === "internship" ? mat.internship : mat.role;
    const root = new THREE.Group();
    // Back panel with its filing tab.
    const back = new THREE.Mesh(rounded(W, H, 0.006, { x: tabSlots[i % tabSlots.length], w: 0.09, h: 0.022 }), m);
    back.position.z = -T;
    // Inner face, slightly lighter.
    const inner = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.01, H - 0.012), mat.inner);
    inner.position.z = 0.0002;
    // The sheet, printed with the entry.
    const sheet = new THREE.Mesh(
      new THREE.PlaneGeometry(SHEET_W, SHEET_H),
      new THREE.MeshStandardMaterial({ map: sheetTexture(e, fonts, e.kind === "internship" ? "#b58a3a" : "#4d7349"), roughness: 0.88 }),
    );
    sheet.position.set(0.006, -0.004, 0.0012);
    // The cover, hinged at the left edge.
    const cover = new THREE.Group();
    cover.position.set(-W / 2, 0, 0.0024);
    const coverMesh = new THREE.Mesh(coverGeo, m);
    coverMesh.position.set((W - 0.004) / 2, -0.004, 0);
    const label = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.047), new THREE.MeshStandardMaterial({ map: labelTexture(e, fonts), roughness: 0.85 }));
    label.position.set((W - 0.004) / 2 + 0.01, 0.06, T + 0.0003);
    cover.add(coverMesh, label);
    root.add(back, inner, sheet, cover);
    root.traverse((c) => {
      const mm = c as THREE.Mesh;
      if (mm.isMesh) {
        mm.castShadow = q.shadows;
        mm.receiveShadow = q.shadows;
      }
    });
    scene.add(root);
    return { root, cover, sheet, pos: new THREE.Vector3(0, 0, -4), rot: new THREE.Euler(), open: 0, lift: 0 };
  });

  // The shaft: a warm spot from high on the left, dappled by the canopy loop.
  const key = new THREE.SpotLight(0xffc870, q.shadows ? 14 : 11, 0, 0.36, 0.55, 1.2);
  key.position.set(-1.1, 2.6, 0.9);
  key.target.position.set(0.05, -0.05, -0.4);
  key.castShadow = q.shadows;
  key.shadow.mapSize.set(q.shadowMapSize, q.shadowMapSize);
  key.shadow.bias = -0.0003;
  key.shadow.normalBias = 0.004;
  let video: HTMLVideoElement | null = null;
  let cookieCanvas: HTMLCanvasElement | null = null;
  let cookieCtx: CanvasRenderingContext2D | null = null;
  let cookie: THREE.CanvasTexture | null = null;
  let frame = 0;
  if (q.shadows && o.video) {
    video = document.createElement("video");
    video.src = o.video;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    video.play().catch(() => undefined);
    // The loop is drawn through a grey grade first, so the leaves dapple the warm light
    // instead of tinting it sky blue.
    cookieCanvas = document.createElement("canvas");
    cookieCanvas.width = cookieCanvas.height = 256;
    cookieCtx = cookieCanvas.getContext("2d");
    if (cookieCtx) {
      cookieCtx.fillStyle = "#fff";
      cookieCtx.fillRect(0, 0, 256, 256);
    }
    cookie = new THREE.CanvasTexture(cookieCanvas);
    cookie.colorSpace = THREE.SRGBColorSpace;
    key.map = cookie;
  }
  scene.add(key, key.target);
  scene.add(new THREE.HemisphereLight(0x9fb79a, 0x0f130d, 0.35));
  const bounce = new THREE.PointLight(0x86c98f, 0.35, 2.5, 2);
  bounce.position.set(0.7, -0.5, 0.6);
  scene.add(bounce);

  // The visible shaft: soft vertical light planes and dust in the beam.
  const beamTex = (() => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 256;
    const g = c.getContext("2d")!;
    const gx = g.createLinearGradient(0, 0, 64, 0);
    gx.addColorStop(0, "rgba(255,200,112,0)");
    gx.addColorStop(0.5, "rgba(255,200,112,1)");
    gx.addColorStop(1, "rgba(255,200,112,0)");
    g.fillStyle = gx;
    g.fillRect(0, 0, 64, 256);
    g.globalCompositeOperation = "destination-in";
    const gy = g.createLinearGradient(0, 0, 0, 256);
    gy.addColorStop(0, "rgba(0,0,0,0.9)");
    gy.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gy;
    g.fillRect(0, 0, 64, 256);
    return new THREE.CanvasTexture(c);
  })();
  const beamMat = new THREE.MeshBasicMaterial({ map: beamTex, transparent: true, opacity: 0.09, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide });
  const beam = new THREE.Group();
  for (let k = 0; k < 3; k++) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(0.55 + k * 0.2, 3.4), beamMat);
    p.rotation.y = (k - 1) * 0.5;
    beam.add(p);
  }
  beam.position.set(-0.32, 0.6, -0.5);
  beam.rotation.z = -0.36;
  scene.add(beam);

  const DUST = q.phone ? 160 : 420;
  const dustPos = new Float32Array(DUST * 3);
  const r = rand(17);
  for (let k = 0; k < DUST; k++) {
    dustPos[k * 3] = (r() - 0.5) * 0.9;
    dustPos[k * 3 + 1] = (r() - 0.5) * 1.4;
    dustPos[k * 3 + 2] = -r() * 2.2 + 0.3;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({ color: 0xffd9a0, size: 0.0035, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  dust.rotation.z = -0.36;
  dust.position.set(-0.15, 0.1, 0);
  scene.add(dust);

  // ── Choreography ──
  const N = folders.length;
  const still = !o.motion;
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  let size = { w: 1, h: 1 };
  let active = -1;
  let forced: number | null = null;

  /** Scroll position in entries: entry i is centred and open around s = i + 0.5. */
  const sOf = (p: number) => p * (N + 0.25) - 0.15;
  const progress = () => {
    if (still) return forced === null ? 0 : (forced + 0.65) / (N + 0.25);
    const rr = o.section.getBoundingClientRect();
    const sp = rr.height - window.innerHeight;
    return sp > 0 ? clamp01(-rr.top / sp) : 0;
  };

  const tp = new THREE.Vector3();
  const tr = new THREE.Euler();
  const pose = (i: number, a: number, time: number) => {
    let open = 0;
    let lift = 0;
    if (a < 0) {
      // Waiting deeper in the shaft, turning slowly as it drifts in.
      const d = -a;
      const k = Math.min(1, d);
      const e = k * k * (3 - 2 * k);
      const ph = i * 1.37;
      // Down the shaft from high and to the right, so the files behind stay in view.
      tp.set(
        e * (0.13 * d + 0.2 * Math.sin(d * 1.6 + ph) + 0.04),
        e * (0.12 * d + 0.07 * Math.cos(d * 1.2 + ph)) + 0.01 * Math.sin(time * 0.7 + ph),
        -0.95 * d,
      );
      tr.set(e * (0.5 * Math.sin(d * 1.1 + ph) - 0.25), e * (0.9 * Math.sin(d * 0.8 + ph)), e * 0.35 * Math.sin(d * 1.4 + ph));
    } else {
      open = span(a, 0.1, 0.32) * (1 - span(a, 0.72, 0.86));
      lift = span(a, 0.22, 0.36) * (1 - span(a, 0.66, 0.76));
      const ex = span(a, 0.84, 1.0);
      const settle = span(a, 0, 0.1);
      tp.set(open * (W / 2) * 0.92 - 1.25 * ex, -0.01 - 0.12 * ex * ex, 0.28 * ex);
      // Settled, it leans back like a file on a reading slope, turned a little to the light.
      tr.set(-0.4 * settle + 0.3 * ex, 0.16 * settle - 0.7 * ex, -0.03 * settle + 0.25 * ex);
      tr.x += -pointer.sy * 0.105 * open;
      tr.y += pointer.sx * 0.105 * open;
    }
    return { open, lift };
  };

  const remove = engine.addView({
    element: o.element,
    scene,
    camera,
    resize: (s) => {
      size = s;
      camera.aspect = s.w / s.h;
      camera.updateProjectionMatrix();
    },
    update: (dt, time) => {
      const s = sOf(progress());
      pointer.sx = damp(pointer.sx, pointer.x, 0.25, dt);
      pointer.sy = damp(pointer.sy, pointer.y, 0.25, dt);
      const idx = Math.max(0, Math.min(N - 1, Math.round(s - 0.45)));
      if (idx !== active) {
        active = idx;
        o.onActive(idx);
      }
      folders.forEach((f, i) => {
        const a = s - i;
        const { open, lift } = pose(i, a, time);
        const tau = still ? 0 : 0.16;
        if (tau === 0) {
          f.pos.copy(tp);
          f.rot.copy(tr);
          f.open = open;
          f.lift = lift;
        } else {
          f.pos.x = damp(f.pos.x, tp.x, tau, dt);
          f.pos.y = damp(f.pos.y, tp.y, tau, dt);
          f.pos.z = damp(f.pos.z, tp.z, tau, dt);
          f.rot.x = damp(f.rot.x, tr.x, tau, dt);
          f.rot.y = damp(f.rot.y, tr.y, tau, dt);
          f.rot.z = damp(f.rot.z, tr.z, tau, dt);
          f.open = damp(f.open, open, tau, dt);
          f.lift = damp(f.lift, lift, tau, dt);
        }
        f.root.visible = a < 1.25 && a > -4.6;
        f.root.position.copy(f.pos);
        f.root.rotation.copy(f.rot);
        f.cover.rotation.y = -THREE.MathUtils.degToRad(165) * f.open;
        f.sheet.position.z = 0.0012 + 0.03 * f.lift;
        f.sheet.rotation.x = -0.05 * f.lift;
      });
      if (video && cookieCtx && cookie && video.readyState >= 2 && frame++ % 2 === 0) {
        cookieCtx.filter = "grayscale(1) contrast(1.5) brightness(1.15)";
        cookieCtx.drawImage(video, 0, 0, 256, 256);
        cookie.needsUpdate = true;
      }
      dust.rotation.y = time * 0.02;
      dust.position.y = 0.1 + Math.sin(time * 0.15) * 0.03;
      const phone = size.w < 760;
      camera.updateProjectionMatrix();
      shiftFrame(camera, phone ? 0 : 0.06, 0);
      return true;
    },
  });

  return {
    dispose: () => {
      remove();
      video?.pause();
      if (video) video.src = "";
    },
    pointer: (x: number, y: number) => {
      pointer.x = x;
      pointer.y = y;
    },
    /** Reduced motion only: show entry i directly. */
    show: (i: number) => {
      forced = i;
      engine.invalidate();
    },
  };
}
