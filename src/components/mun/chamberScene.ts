/**
 * "The chamber" in Three.js (direction §5). Loaded only on /model-un, through a dynamic import.
 * A hemicycle in the petrol palette: a reflective well floor graded down by a veil, terraced
 * tiers, a colonnade wall, haze (fog) and light shafts over the dais. Placards are self-lit;
 * brightness follows the award level. The camera flies from the plan view overhead to
 * delegate eye level, scrubbed by scroll and damped; drag orbits within ±25 degrees.
 */
import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import type { Seat } from "./seats";

const C = {
  ground: 0x081619,
  raised: 0x0f2227,
  hairline: 0x1f3a40,
  text: 0xe8edf6,
  secondary: 0x8fa5a8,
  accent: 0x9cb9ea,
};

export type Projected = { x: number; y: number; w: number; h: number; top: number; on: boolean };

type Placard = {
  seat: Seat;
  group: THREE.Group;
  lift: THREE.Group;
  mat: THREE.MeshBasicMaterial;
  edge: THREE.LineSegments;
  edgeMat: THREE.LineBasicMaterial;
  pos: number;
  vel: number;
  dim: number;
  dimTarget: number;
  raised: boolean;
  width: number;
};

const ORBIT_MAX = (25 * Math.PI) / 180;
const CENTRE = new THREE.Vector3(0, 0, 3);

function bezier(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3, t: number) {
  const u = 1 - t;
  return new THREE.Vector3()
    .addScaledVector(a, u * u * u)
    .addScaledVector(b, 3 * u * u * t)
    .addScaledVector(c, 3 * u * t * t)
    .addScaledVector(d, t * t * t);
}
/** A flat annular sector in the XZ plane at height y, centred on +z (angle 0). */
function sector(r0: number, r1: number, y: number, span: number, seg: number) {
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= seg; i++) {
    const a = -span / 2 + (i / seg) * span;
    pos.push(Math.sin(a) * r0, y, Math.cos(a) * r0, Math.sin(a) * r1, y, Math.cos(a) * r1);
    if (i < seg) {
      const k = i * 2;
      idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  if (g.attributes.normal.getY(0) < 0) {
    g.setIndex(idx.map((_, j) => idx[j - (j % 3) + [0, 2, 1][j % 3]]));
    g.computeVertexNormals();
  }
  return g;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function fontVar(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/** A placard face: conference in the display serif, committee in the figure face. */
function placardTexture(seat: Seat, anisotropy: number) {
  const W = 512;
  const H = 168;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#e8edf6";
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#081619";
  g.fillRect(0, H - 10, W, 10);
  const display = fontVar("--ff-display", "serif");
  const figure = fontVar("--ff-figure", "monospace");
  g.textAlign = "center";
  g.textBaseline = "alphabetic";
  let size = 64;
  g.font = `500 ${size}px ${display}`;
  while (g.measureText(seat.title).width > W - 48 && size > 28) {
    size -= 2;
    g.font = `500 ${size}px ${display}`;
  }
  g.fillText(seat.title, W / 2, 86);
  g.font = `400 30px ${figure}`;
  g.fillStyle = "#1f3a40";
  g.fillText(seat.sub, W / 2, 132);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  return tex;
}

/** Additive light shaft: brightest at the top, fading down and at the silhouette. */
function shaftMaterial(strength: number) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: new THREE.Color(C.accent) }, uStrength: { value: strength } },
    vertexShader: `
      varying float vY; varying vec3 vN; varying vec3 vV;
      void main() {
        vY = uv.y;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uColor; uniform float uStrength;
      varying float vY; varying vec3 vN; varying vec3 vV;
      void main() {
        float edge = pow(abs(dot(vN, vV)), 1.6);
        float a = pow(vY, 1.4) * edge * uStrength;
        gl_FragColor = vec4(uColor * a, a);
      }`,
  });
}

export class ChamberScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private placards: Placard[] = [];
  private reflector: Reflector | null = null;
  private raf = 0;
  private running = false;
  private visible = true;
  private last = performance.now();
  private flyTarget = 0;
  private fly = 0;
  private orbit = 0;
  private orbitTarget = 0;
  private hover: string | null = null;
  private w = 1;
  private h = 1;
  private io: IntersectionObserver;
  private onVis = () => this.update();
  private disposables: { dispose(): void }[] = [];
  private t0 = performance.now();
  private still: boolean;
  onFrame: ((p: Projected[]) => void) | null = null;

  constructor(private canvas: HTMLCanvasElement, seats: Seat[], opts: { still?: boolean } = {}) {
    this.still = Boolean(opts.still);
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.setClearColor(C.ground, 1);
    this.renderer = r;
    this.scene.background = new THREE.Color(C.ground);
    this.scene.fog = new THREE.FogExp2(C.ground, 0.052);
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 90);

    this.build(seats);

    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting;
      this.update();
    });
    this.io.observe(canvas);
    document.addEventListener("visibilitychange", this.onVis);
  }

  private track<T extends { dispose(): void }>(x: T) {
    this.disposables.push(x);
    return x;
  }

  private std(color: number, rough = 0.8, metal = 0.05) {
    return this.track(new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal }));
  }

  private build(seats: Seat[]) {
    const s = this.scene;
    const aniso = this.renderer.capabilities.getMaxAnisotropy();

    // Light: a cool ambient, a key over the dais, a wash over the floor.
    s.add(new THREE.HemisphereLight(0x9cb9ea, 0x081619, 0.55));
    const key = new THREE.SpotLight(0xdfe8ff, 60, 30, Math.PI / 7, 0.6, 1.4);
    key.position.set(0, 12, -2.5);
    key.target.position.set(0, 0.6, -0.6);
    s.add(key, key.target);
    const wash = new THREE.SpotLight(0x9cb9ea, 90, 34, Math.PI / 5, 0.85, 1.3);
    wash.position.set(0, 14, 6);
    wash.target.position.set(0, 0, 4.5);
    s.add(wash, wash.target);
    // A low fill from behind the viewer so desk fronts hold their shape.
    const fill = new THREE.SpotLight(0x9cb9ea, 38, 30, Math.PI / 5, 0.9, 1.2);
    fill.position.set(0, 4.5, 15);
    fill.target.position.set(0, 0.5, 4);
    s.add(fill, fill.target);
    const rim = new THREE.PointLight(0x9cb9ea, 14, 18, 1.5);
    rim.position.set(0, 3.2, -2.6);
    s.add(rim);

    // Reflective well floor, graded down by a veil so it reads as polished stone, not a mirror.
    const floorGeo = this.track(new THREE.CircleGeometry(15, 96, Math.PI, Math.PI));
    const refl = new Reflector(floorGeo, {
      textureWidth: Math.min(1024, Math.round(window.innerWidth * 0.6)),
      textureHeight: Math.min(1024, Math.round(window.innerHeight * 0.6)),
      color: new THREE.Color(0x7d9aa0),
      clipBias: 0.003,
    });
    refl.rotation.x = -Math.PI / 2;
    refl.position.set(0, 0, -1.6);
    s.add(refl);
    this.reflector = refl;
    const veil = new THREE.Mesh(
      floorGeo,
      this.track(new THREE.MeshBasicMaterial({ color: C.ground, transparent: true, opacity: 0.72, depthWrite: false })),
    );
    veil.rotation.x = -Math.PI / 2;
    veil.position.set(0, 0.004, -1.6);
    s.add(veil);

    // Floor markings: hairline arcs, the plan of the room.
    const ringMat = this.track(new THREE.LineBasicMaterial({ color: C.hairline, transparent: true, opacity: 0.9 }));
    for (const r of [2.2, 3.3, 4.4, 5.45]) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 80; i++) {
        const a = -1.35 + (i / 80) * 2.7;
        pts.push(new THREE.Vector3(Math.sin(a) * r, 0.01, Math.cos(a) * r));
      }
      s.add(new THREE.Line(this.track(new THREE.BufferGeometry().setFromPoints(pts)), ringMat));
    }

    // Terraces: the outer seat tier and the empty steps above it (architecture, not seats).
    const tierMat = this.std(C.raised, 0.86);
    tierMat.side = THREE.DoubleSide;
    const riserMat = this.std(0x0c1c20, 0.9);
    const edgeMat = this.track(new THREE.LineBasicMaterial({ color: 0x2b4c53 }));
    const tiers = [
      { r0: 5.5, r1: 7.6, y: 0.34 },
      { r0: 7.6, r1: 9.4, y: 0.68 },
      { r0: 9.4, r1: 11.2, y: 1.02 },
      { r0: 11.2, r1: 13.0, y: 1.36 },
    ];
    const span = 2.75;
    for (const t of tiers) {
      const top = new THREE.Mesh(this.track(sector(t.r0, t.r1, t.y, span, 72)), tierMat);
      s.add(top);
      const riser = new THREE.Mesh(
        this.track(new THREE.CylinderGeometry(t.r0, t.r0, t.y, 72, 1, true, -span / 2, span)),
        riserMat,
      );
      riser.position.y = t.y / 2;
      s.add(riser);
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 72; i++) {
        const a = -span / 2 + (i / 72) * span;
        pts.push(new THREE.Vector3(Math.sin(a) * t.r0, t.y + 0.002, Math.cos(a) * t.r0));
      }
      s.add(new THREE.Line(this.track(new THREE.BufferGeometry().setFromPoints(pts)), edgeMat));
    }

    // Colonnade: a curved wall with pilasters, closing the room behind the tiers.
    const wallMat = this.std(0x0a1b1f, 0.95);
    const wall = new THREE.Mesh(this.track(new THREE.CylinderGeometry(13.6, 13.6, 7, 128, 1, true)), wallMat);
    wall.material.side = THREE.BackSide;
    wall.position.y = 3.5;
    s.add(wall);
    const pilGeo = this.track(new THREE.BoxGeometry(0.36, 7, 0.4));
    const pilMat = this.std(0x12292e, 0.8);
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      const p = new THREE.Mesh(pilGeo, pilMat);
      p.position.set(Math.sin(a) * 13.3, 3.5, Math.cos(a) * 13.3);
      p.rotation.y = a;
      s.add(p);
    }

    // Dais: platform, long desk, a slatted back wall.
    const dais = new THREE.Mesh(this.track(new THREE.BoxGeometry(7.4, 0.62, 2.4)), this.std(0x10262b, 0.7));
    dais.position.set(0, 0.31, -1.5);
    s.add(dais);
    const daisEdge = new THREE.LineSegments(this.track(new THREE.EdgesGeometry(dais.geometry)), edgeMat);
    daisEdge.position.copy(dais.position);
    s.add(daisEdge);
    const backMat = this.std(0x0d2226, 0.9);
    for (let i = -10; i <= 10; i++) {
      const slat = new THREE.Mesh(this.track(new THREE.BoxGeometry(0.22, 6, 0.2)), backMat);
      slat.position.set(i * 0.5, 3, -3.4);
      s.add(slat);
    }
    const lintel = new THREE.Mesh(this.track(new THREE.BoxGeometry(11, 0.18, 0.4)), this.std(0x173238, 0.6));
    lintel.position.set(0, 6.05, -3.3);
    s.add(lintel);

    // Light shafts: three over the dais, one broad one over the well.
    const shafts: [number, number, number, number, number][] = [
      [-1.7, -0.9, 0.55, 1.1, 0.07],
      [0, -0.9, 0.55, 1.1, 0.08],
      [1.7, -0.9, 0.55, 1.1, 0.07],
      [0, 3.6, 3.6, 4.2, 0.035],
    ];
    for (const [x, z, rTop, rBottom, a] of shafts) {
      const geo = this.track(new THREE.CylinderGeometry(rTop * 0.35, rBottom, 11, 48, 1, true));
      const m = new THREE.Mesh(geo, this.track(shaftMaterial(a)));
      m.position.set(x, 5.5, z);
      m.renderOrder = 10;
      s.add(m);
    }

    // Seats: desk + placard (raised on hover), one per real seat.
    const deskGeo = this.track(new THREE.BoxGeometry(1.15, 0.74, 0.55));
    const deskTopGeo = this.track(new THREE.BoxGeometry(1.25, 0.04, 0.62));
    const deskMat = this.std(0x1a3940, 0.6, 0.1);
    const deskTopMat = this.std(0x1d3d44, 0.35, 0.2);
    const benchGeo = this.track(new THREE.BoxGeometry(0.6, 0.74, 3.6));
    const placW = 0.78;
    const placH = 0.26;
    const placGeo = this.track(new THREE.PlaneGeometry(placW, placH));
    const backGeo = this.track(new THREE.BoxGeometry(placW, placH, 0.012));
    const edgeGeo = this.track(new THREE.EdgesGeometry(new THREE.BoxGeometry(placW + 0.04, placH + 0.04, 0.03)));

    const benchSeats = seats.filter((x) => x.kind === "bench");
    if (benchSeats.length) {
      const zs = benchSeats.map((x) => x.z);
      const bench = new THREE.Mesh(benchGeo, deskMat);
      bench.scale.z = (Math.max(...zs) - Math.min(...zs) + 1.4) / 3.6;
      bench.position.set(benchSeats[0].x, benchSeats[0].y + 0.37, (Math.max(...zs) + Math.min(...zs)) / 2);
      s.add(bench);
      const plinth = new THREE.Mesh(this.track(new THREE.BoxGeometry(1.6, benchSeats[0].y, 4.4)), this.std(0x10262b, 0.7));
      plinth.position.set(benchSeats[0].x + 0.2, benchSeats[0].y / 2, bench.position.z);
      s.add(plinth);
    }
    const daisDesk = new THREE.Mesh(this.track(new THREE.BoxGeometry(6.2, 0.74, 0.6)), deskMat);
    daisDesk.position.set(0, 0.62 + 0.37, -0.95);
    s.add(daisDesk);

    for (const seat of seats) {
      const group = new THREE.Group();
      group.position.set(seat.x, seat.y, seat.z);
      group.rotation.y = seat.face + Math.PI;
      if (seat.kind === "floor") {
        const desk = new THREE.Mesh(deskGeo, deskMat);
        desk.position.y = 0.37;
        group.add(desk);
        const top = new THREE.Mesh(deskTopGeo, deskTopMat);
        top.position.y = 0.76;
        group.add(top);
      }
      const lift = new THREE.Group();
      lift.position.y = 0.78 + placH / 2 + 0.02;
      group.add(lift);
      const tex = this.track(placardTexture(seat, aniso));
      const mat = this.track(new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(1, 1, 1), fog: true }));
      const front = new THREE.Mesh(placGeo, mat);
      front.position.z = 0.007;
      const back = new THREE.Mesh(placGeo, mat);
      back.rotation.y = Math.PI;
      back.position.z = -0.007;
      const core = new THREE.Mesh(backGeo, this.std(0x0b1a1d, 0.6));
      lift.add(core, front, back);
      const edgeMatP = this.track(new THREE.LineBasicMaterial({ color: C.accent, transparent: true, opacity: 0 }));
      const edge = new THREE.LineSegments(edgeGeo, edgeMatP);
      lift.add(edge);
      this.scene.add(group);
      this.placards.push({ seat, group, lift, mat, edge, edgeMat: edgeMatP, pos: 0, vel: 0, dim: 1, dimTarget: 1, raised: false, width: placW });
    }
    this.applyColours();
  }

  private applyColours() {
    for (const p of this.placards) {
      const lit = p.raised ? 1.15 : p.seat.glow;
      // sRGB, so brightness steps read as they are set; a filtered-out placard drops to 14%.
      const v = Math.min(1, lit) * (0.14 + 0.86 * p.dim);
      p.mat.color.setRGB(v, v, Math.min(1, v * 1.02), THREE.SRGBColorSpace);
      p.edgeMat.opacity = p.raised ? 1 : 0;
    }
  }

  resize(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // Narrow viewports pull the lens wider so the hemicycle still fills the frame.
    this.camera.fov = w / h < 1.2 ? 56 : 40;
    this.camera.updateProjectionMatrix();
    this.reflector?.getRenderTarget().setSize(Math.min(1024, Math.round(w * 0.6)), Math.min(1024, Math.round(h * 0.6)));
    if (!this.running) this.render(0);
  }

  /** 0 = overhead plan, 1 = delegate eye level. Scroll sets it; the camera follows, damped. */
  setFly(t: number) {
    this.flyTarget = Math.max(0, Math.min(1, t));
    if (this.still) this.fly = this.flyTarget;
    this.kick();
  }
  orbitBy(dxPx: number) {
    this.orbitTarget = Math.max(-ORBIT_MAX, Math.min(ORBIT_MAX, this.orbitTarget - (dxPx / this.w) * 1.4));
    this.kick();
  }
  setHover(id: string | null) {
    this.hover = id;
    for (const p of this.placards) p.raised = p.seat.id === id;
    if (this.still) {
      for (const p of this.placards) p.pos = p.raised ? 1 : 0;
    }
    this.applyColours();
    this.kick();
  }
  setLit(test: (s: Seat) => boolean) {
    for (const p of this.placards) {
      p.dimTarget = test(p.seat) ? 1 : 0;
      if (this.still) p.dim = p.dimTarget;
    }
    this.applyColours();
    this.kick();
  }

  private kick() {
    if (!this.running) this.render(0);
  }

  start() {
    this.update();
  }

  private update() {
    const should = this.visible && !document.hidden && !this.still;
    if (should && !this.running) {
      this.running = true;
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.frame);
    } else if (!should && this.running) {
      this.running = false;
      cancelAnimationFrame(this.raf);
    }
  }

  private frame = (now: number) => {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.render(dt);
    this.raf = requestAnimationFrame(this.frame);
  };

  private render(dt: number) {
    // Damped follow of scroll and drag.
    const f = 1 - Math.exp(-dt / 0.35);
    this.fly += (this.flyTarget - this.fly) * (dt ? f : 1);
    this.orbit += (this.orbitTarget - this.orbit) * (dt ? 1 - Math.exp(-dt / 0.18) : 1);

    // Placards: spring lift with one overshoot; dimming eases.
    let changed = false;
    for (const p of this.placards) {
      const target = p.raised ? 1 : 0;
      if (dt) {
        const k = 170;
        const c = 2 * 0.5 * Math.sqrt(k);
        p.vel += (k * (target - p.pos) - c * p.vel) * dt;
        p.pos += p.vel * dt;
        const nd = p.dim + (p.dimTarget - p.dim) * (1 - Math.exp(-dt / 0.2));
        if (Math.abs(nd - p.dim) > 1e-4) changed = true;
        p.dim = nd;
      }
      p.lift.position.y = 0.78 + 0.15 + p.pos * 0.42;
      p.lift.rotation.x = -p.pos * 0.12;
      p.lift.scale.setScalar(1 + p.pos * 0.22);
    }
    if (changed) this.applyColours();

    const e = easeInOut(this.fly);
    const time = (performance.now() - this.t0) / 1000;
    const pos = bezier(
      new THREE.Vector3(0, 25, 3.6),
      new THREE.Vector3(-7, 19, 13),
      new THREE.Vector3(-3.5, 6, 15.5),
      new THREE.Vector3(0, 2.75, 12.6),
      e,
    );
    const target = new THREE.Vector3(0, 0, 3.2).lerp(new THREE.Vector3(0, 0.55, 0.6), e);
    // Orbit about the room's centre, only once at eye level; a slow breath when idle.
    const breathe = this.still ? 0 : Math.sin(time * 0.25) * 0.02;
    const a = (this.orbit + breathe) * e;
    pos.sub(CENTRE).applyAxisAngle(new THREE.Vector3(0, 1, 0), a).add(CENTRE);
    this.camera.position.copy(pos);
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(target);

    this.renderer.render(this.scene, this.camera);
    this.onFrame?.(this.project());
  }

  /** Screen boxes of every placard, for the DOM buttons and the readout. */
  private project(): Projected[] {
    const v = new THREE.Vector3();
    const out: Projected[] = [];
    const W = this.w;
    const H = this.h;
    for (const p of this.placards) {
      p.lift.updateWorldMatrix(true, false);
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      let behind = false;
      for (const [x, y] of [[-0.42, -0.5], [0.42, -0.5], [-0.42, 0.18], [0.42, 0.18]]) {
        v.set(x, y, 0).applyMatrix4(p.lift.matrixWorld).project(this.camera);
        if (v.z > 1) behind = true;
        const sx = (v.x * 0.5 + 0.5) * W;
        const sy = (-v.y * 0.5 + 0.5) * H;
        minX = Math.min(minX, sx); maxX = Math.max(maxX, sx);
        minY = Math.min(minY, sy); maxY = Math.max(maxY, sy);
      }
      const w = Math.max(44, maxX - minX);
      const h = Math.max(44, maxY - minY);
      out.push({ x: (minX + maxX) / 2, y: (minY + maxY) / 2, w, h, top: minY, on: !behind });
    }
    return out;
  }

  /** The placard under a screen point (for taps that miss the DOM buttons). */
  get flyProgress() {
    return this.fly;
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.io.disconnect();
    document.removeEventListener("visibilitychange", this.onVis);
    this.reflector?.dispose();
    for (const d of this.disposables) d.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
