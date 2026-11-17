/**
 * ──────────────────────────────────────────────────────────────────────────
 *  Building blocks shared by the set pieces (three.js; loaded with the engine).
 * ──────────────────────────────────────────────────────────────────────────
 *
 *   Spring           damped spring with the house "settle" overshoot (pointer rotation, lifts)
 *   CameraRig        scroll-driven camera path through keyframed shots, damped, with a pointer orbit
 *   shiftFrame       moves a scene's centre left or right in the frame (room for DOM copy)
 *   bakeContactShadow  one-off soft contact shadow under a static object (phones rely on these)
 *   placeOnFloor / fitHeight / bounds   put real-world-sized models where a scene wants them
 *   instanced        turns a one-mesh model into an InstancedMesh for repeated furniture
 *   HotspotProjector  projects 3D anchors to DOM buttons every frame they move
 */
import * as THREE from "three";
import { HorizontalBlurShader } from "three/examples/jsm/shaders/HorizontalBlurShader.js";
import { VerticalBlurShader } from "three/examples/jsm/shaders/VerticalBlurShader.js";

// ── Easing ──

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
/** 0 before a, 1 after b, smooth between. */
export const span = (p: number, a: number, b: number) => smooth((p - a) / (b - a));
/** Frame-rate independent exponential approach. */
export const damp = (current: number, target: number, tau: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-dt / tau));

// ── Spring ──

/**
 * A damped spring. Damping 0.62 gives one soft overshoot: the motion verb "settle".
 * `step` returns true while it is still moving.
 */
export class Spring {
  value: number;
  target: number;
  private v = 0;
  constructor(
    initial = 0,
    private stiffness = 70,
    private damping = 0.62,
  ) {
    this.value = initial;
    this.target = initial;
  }
  step(dt: number) {
    const k = this.stiffness;
    const c = 2 * this.damping * Math.sqrt(k);
    const n = Math.max(1, Math.ceil(dt / (1 / 120)));
    const h = dt / n;
    for (let i = 0; i < n; i++) {
      this.v += (k * (this.target - this.value) - c * this.v) * h;
      this.value += this.v * h;
    }
    const moving = Math.abs(this.v) > 1e-4 || Math.abs(this.target - this.value) > 1e-4;
    if (!moving) {
      this.value = this.target;
      this.v = 0;
    }
    return moving;
  }
  snap(v: number) {
    this.value = this.target = v;
    this.v = 0;
  }
}

// ── Camera ──

export type Shot = { pos: THREE.Vector3Tuple; target: THREE.Vector3Tuple; fov?: number };
export type Key = { at: number; shot: Shot };

/**
 * A camera path for a scroll-pinned set piece. Keys sit at scroll progress 0..1; between keys
 * the position and target follow smooth Catmull-Rom curves (eased per segment, so the camera
 * holds briefly at each shot). The camera follows the path with damping, and a pointer orbit
 * (yaw/pitch around the target) is added on top.
 */
export class CameraRig {
  private posCurve: THREE.CatmullRomCurve3;
  private targetCurve: THREE.CatmullRomCurve3;
  private pos = new THREE.Vector3();
  private target = new THREE.Vector3();
  private fov: number;
  private first = true;
  /** Extra orbit around the target, radians (set from pointer or drag). */
  readonly yaw = new Spring(0, 40, 0.8);
  readonly pitch = new Spring(0, 40, 0.8);

  constructor(
    readonly camera: THREE.PerspectiveCamera,
    private keys: Key[],
    private tau = 0.22,
  ) {
    this.posCurve = new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.shot.pos)), false, "centripetal");
    this.targetCurve = new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.shot.target)), false, "centripetal");
    this.fov = camera.fov;
  }

  /** Path parameter for scroll progress p: eased within each segment. */
  private param(p: number) {
    const k = this.keys;
    if (k.length < 2) return 0;
    if (p <= k[0].at) return 0;
    if (p >= k[k.length - 1].at) return 1;
    let i = 0;
    while (i < k.length - 2 && p > k[i + 1].at) i++;
    const u = smooth((p - k[i].at) / (k[i + 1].at - k[i].at));
    return (i + u) / (k.length - 1);
  }

  sample(p: number, outPos: THREE.Vector3, outTarget: THREE.Vector3) {
    const t = this.param(p);
    this.posCurve.getPoint(t, outPos);
    this.targetCurve.getPoint(t, outTarget);
    const k = this.keys;
    let i = 0;
    while (i < k.length - 2 && p > k[i + 1].at) i++;
    const a = k[i].shot.fov ?? this.fov;
    const b = k[Math.min(i + 1, k.length - 1)].shot.fov ?? a;
    const u = k.length > 1 ? smooth((p - k[i].at) / Math.max(1e-6, k[Math.min(i + 1, k.length - 1)].at - k[i].at)) : 0;
    return a + (b - a) * u;
  }

  private sp = new THREE.Vector3();
  private st = new THREE.Vector3();
  private off = new THREE.Vector3();
  private sph = new THREE.Spherical();

  /** Move toward the shot for progress p. `instant` jumps (reduced motion, first frame). Returns true while moving. */
  update(p: number, dt: number, instant = false) {
    const fov = this.sample(p, this.sp, this.st);
    const cam = this.camera;
    if (instant || this.first) {
      this.pos.copy(this.sp);
      this.target.copy(this.st);
      cam.fov = fov;
      this.first = false;
    } else {
      const f = 1 - Math.exp(-dt / this.tau);
      this.pos.lerp(this.sp, f);
      this.target.lerp(this.st, f);
      cam.fov += (fov - cam.fov) * f;
    }
    const m1 = this.yaw.step(dt);
    const m2 = this.pitch.step(dt);
    // Orbit the damped position around the target by the pointer yaw/pitch.
    this.off.subVectors(this.pos, this.target);
    this.sph.setFromVector3(this.off);
    this.sph.theta += this.yaw.value;
    this.sph.phi = THREE.MathUtils.clamp(this.sph.phi - this.pitch.value, 0.05, Math.PI - 0.05);
    this.off.setFromSpherical(this.sph);
    cam.position.copy(this.target).add(this.off);
    cam.lookAt(this.target);
    cam.updateProjectionMatrix();
    const moving = this.pos.distanceToSquared(this.sp) > 1e-8 || this.target.distanceToSquared(this.st) > 1e-8;
    return moving || m1 || m2;
  }

  /** The current look-at point. */
  get lookAt() {
    return this.target;
  }
}

/**
 * Shift the picture sideways in the frame without moving the camera: `sx` is a fraction of the
 * view width (positive moves the scene right). Call after `updateProjectionMatrix()`.
 */
export function shiftFrame(camera: THREE.PerspectiveCamera, sx: number, sy = 0) {
  const e = camera.projectionMatrix.elements;
  e[8] = -2 * sx;
  e[9] = -2 * sy;
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
}

// ── Placement ──

export function bounds(o: THREE.Object3D) {
  o.updateWorldMatrix(true, true);
  return new THREE.Box3().setFromObject(o);
}

/** Scale an object so its height is `h` metres. */
export function fitHeight(o: THREE.Object3D, h: number) {
  const b = bounds(o);
  const cur = b.max.y - b.min.y;
  if (cur > 0) o.scale.multiplyScalar(h / cur);
}

/** Put an object's footprint centre at (x, z) with its lowest point at y. */
export function placeOnFloor(o: THREE.Object3D, x = 0, y = 0, z = 0) {
  const b = bounds(o);
  const c = b.getCenter(new THREE.Vector3());
  o.position.x += x - c.x;
  o.position.z += z - c.z;
  o.position.y += y - b.min.y;
}

/** Every mesh in a model with its world transform. */
export function meshesOf(o: THREE.Object3D) {
  o.updateWorldMatrix(true, true);
  const out: THREE.Mesh[] = [];
  o.traverse((c) => {
    if ((c as THREE.Mesh).isMesh) out.push(c as THREE.Mesh);
  });
  return out;
}

/**
 * Repeated furniture as InstancedMesh (one draw call per material). `model` is a loaded GLB at
 * its real size, origin at its footprint; `placements` give each copy's position and yaw.
 */
export function instanced(model: THREE.Object3D, placements: { x: number; y: number; z: number; yaw: number }[]) {
  const group = new THREE.Group();
  const b = bounds(model);
  const c = b.getCenter(new THREE.Vector3());
  // Normalise: footprint centred on the origin, base at y = 0.
  const base = new THREE.Matrix4().makeTranslation(-c.x, -b.min.y, -c.z);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  for (const mesh of meshesOf(model)) {
    const local = new THREE.Matrix4().multiplyMatrices(base, mesh.matrixWorld);
    const inst = new THREE.InstancedMesh(mesh.geometry, mesh.material, placements.length);
    placements.forEach((p, i) => {
      q.setFromAxisAngle(up, p.yaw);
      m.compose(new THREE.Vector3(p.x, p.y, p.z), q, new THREE.Vector3(1, 1, 1)).multiply(local);
      inst.setMatrixAt(i, m);
    });
    inst.castShadow = true;
    inst.receiveShadow = true;
    inst.computeBoundingSphere();
    group.add(inst);
  }
  return group;
}

/** The vertex of a model furthest along a direction (world space), optionally among vertices passing a test. */
export function extremeVertex(o: THREE.Object3D, dir: THREE.Vector3, test?: (v: THREE.Vector3) => boolean) {
  const best = new THREE.Vector3();
  let bestD = -Infinity;
  const v = new THREE.Vector3();
  for (const mesh of meshesOf(o)) {
    const pos = mesh.geometry.attributes.position;
    for (let i = 0; i < pos.count; i += 3) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
      if (test && !test(v)) continue;
      const d = v.dot(dir);
      if (d > bestD) {
        bestD = d;
        best.copy(v);
      }
    }
  }
  return best;
}

// ── Contact shadows ──

/**
 * Bake a soft contact shadow for static objects onto a horizontal plane (after three.js's
 * contact-shadows example, rendered once instead of every frame). Renders the objects' depth
 * from below into a texture, blurs it twice and returns a plane to put at `y`.
 */
export function bakeContactShadow(
  renderer: THREE.WebGLRenderer,
  objects: THREE.Object3D[],
  opts: { width: number; depth: number; y?: number; x?: number; z?: number; height?: number; blur?: number; darkness?: number; opacity?: number; resolution?: number },
) {
  const { width, depth, y = 0, x = 0, z = 0, height = 0.6, blur = 2.2, darkness = 1.4, opacity = 0.85, resolution = 512 } = opts;
  const rt = new THREE.WebGLRenderTarget(resolution, resolution);
  rt.texture.generateMipmaps = false;
  const rtBlur = new THREE.WebGLRenderTarget(resolution, resolution);
  rtBlur.texture.generateMipmaps = false;

  const cam = new THREE.OrthographicCamera(-width / 2, width / 2, depth / 2, -depth / 2, 0, height);
  cam.position.set(x, y, z);
  cam.rotation.x = Math.PI / 2; // look up from the plane

  const depthMat = new THREE.MeshDepthMaterial();
  depthMat.onBeforeCompile = (shader) => {
    shader.uniforms.darkness = { value: darkness };
    shader.fragmentShader = /* glsl */ `
      uniform float darkness;
      ${shader.fragmentShader.replace(
        "gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );",
        "gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );",
      )}`;
  };
  depthMat.depthTest = false;
  depthMat.depthWrite = false;

  const tmp = new THREE.Scene();
  const parents = objects.map((o) => o.parent);
  objects.forEach((o) => tmp.attach(o));
  tmp.overrideMaterial = depthMat;

  const prevTarget = renderer.getRenderTarget();
  const prevClear = renderer.getClearAlpha();
  const prevTone = renderer.toneMapping;
  const prevScissor = renderer.getScissorTest();
  renderer.setScissorTest(false);
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setClearAlpha(0);
  renderer.setRenderTarget(rt);
  renderer.clear();
  renderer.render(tmp, cam);
  tmp.overrideMaterial = null;

  // Blur: horizontal then vertical, twice.
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
  const qScene = new THREE.Scene();
  qScene.add(quad);
  const qCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const blurMat = (src: { uniforms: Record<string, THREE.IUniform>; vertexShader: string; fragmentShader: string }) =>
    new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(src.uniforms),
      vertexShader: src.vertexShader,
      fragmentShader: src.fragmentShader,
      depthTest: false,
    });
  const h = blurMat(HorizontalBlurShader);
  const v = blurMat(VerticalBlurShader);
  const pass = (amount: number) => {
    quad.material = h;
    h.uniforms.tDiffuse.value = rt.texture;
    h.uniforms.h.value = amount / 256;
    renderer.setRenderTarget(rtBlur);
    renderer.clear();
    renderer.render(qScene, qCam);
    quad.material = v;
    v.uniforms.tDiffuse.value = rtBlur.texture;
    v.uniforms.v.value = amount / 256;
    renderer.setRenderTarget(rt);
    renderer.clear();
    renderer.render(qScene, qCam);
  };
  pass(blur);
  pass(blur * 0.4);

  renderer.setRenderTarget(prevTarget);
  renderer.setClearAlpha(prevClear);
  renderer.toneMapping = prevTone;
  renderer.setScissorTest(prevScissor);
  objects.forEach((o, i) => parents[i]?.attach(o));
  quad.geometry.dispose();
  h.dispose();
  v.dispose();
  depthMat.dispose();
  rtBlur.dispose();

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth).rotateX(Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: rt.texture, transparent: true, opacity, depthWrite: false, toneMapped: false }),
  );
  plane.scale.y = -1; // the texture was rendered looking up
  plane.position.set(x, y + 0.001, z);
  plane.renderOrder = 1;
  plane.userData.renderTarget = rt;
  return plane;
}

// ── Hotspots ──

export type ProjectedPoint = { x: number; y: number; visible: boolean };

/**
 * Projects 3D anchors to the view's CSS pixels after each draw and writes them to DOM elements
 * as a transform (no React re-render per frame). An anchor is hidden when it is behind the
 * camera or outside the frame.
 */
export class HotspotProjector {
  private v = new THREE.Vector3();
  constructor(
    private camera: THREE.Camera,
    private anchors: THREE.Object3D[],
    private elements: () => (HTMLElement | null)[],
  ) {}

  project(size: { w: number; h: number }) {
    const els = this.elements();
    const out: ProjectedPoint[] = [];
    this.anchors.forEach((a, i) => {
      a.getWorldPosition(this.v);
      this.v.project(this.camera);
      const visible = this.v.z < 1 && Math.abs(this.v.x) < 1.05 && Math.abs(this.v.y) < 1.05;
      const x = (this.v.x * 0.5 + 0.5) * size.w;
      const y = (-this.v.y * 0.5 + 0.5) * size.h;
      out.push({ x, y, visible });
      const el = els[i];
      if (!el) return;
      el.style.setProperty("--hx", `${x.toFixed(1)}px`);
      el.style.setProperty("--hy", `${y.toFixed(1)}px`);
      if (visible) delete el.dataset.offscreen;
      else el.dataset.offscreen = "";
    });
    return out;
  }
}

/** Pointer position over an element in normalised device coordinates (-1..1), y up. */
export function pointerNdc(e: { clientX: number; clientY: number }, el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -(((e.clientY - r.top) / r.height) * 2 - 1) };
}

/** Kelvin to an approximate linear RGB colour (for practical lights: 3200K torch, 2700K lamp). */
export function kelvin(k: number) {
  const t = k / 100;
  const r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592);
  const g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * Math.pow(t - 60, -0.0755148492);
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  const c = (x: number) => Math.min(255, Math.max(0, x)) / 255;
  return new THREE.Color().setRGB(c(r), c(g), c(b), THREE.SRGBColorSpace);
}
