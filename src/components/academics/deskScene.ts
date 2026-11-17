/**
 * Academics, "The desk" (design/v2.1-addendum.md §4): a school desk and chair in dusk window
 * light. The encyclopedia set stands on the desk; scroll lifts five volumes out of it, one per
 * year from Grade 7 to Grade 11, each a "School topper" hotspot. Grade 10 rises last and
 * highest, turning to the viewer: 99.4%, CBSE Grade X.
 *
 * Models: MODELS.schoolDesk, MODELS.schoolChair, MODELS.encyclopedia; HDRI.warmInterior
 * (src/lib/three/assets.ts). The set is one mesh; it is split into its twenty volumes.
 */
import * as THREE from "three";
import { HDRI, MODELS, SIZE_KB } from "@/lib/three/assets";
import type { Engine } from "@/components/three/engine";
import { bakeContactShadow, bounds, CameraRig, clamp01, HotspotProjector, kelvin, placeOnFloor, radialFade, shiftFrame, smooth, type Key } from "@/components/three/kit";
import { splitPieces } from "@/components/three/volumes";

export type TopperOptions = {
  element: HTMLElement;
  section: HTMLElement;
  hotspots: () => (HTMLElement | null)[];
  motion: boolean;
  /** Called when the number of lifted volumes changes (0..5). */
  onLifted: (n: number) => void;
};

/** Which volumes of the twenty are lifted, for Grade 7, 8, 9, 10, 11. */
const PICK = [3, 7, 10, 13, 16];
/** Scroll windows: Grade 7, 8, 9 and 11 rise in turn, Grade 10 last. */
const WINDOW: [number, number][] = [
  [0.1, 0.24],
  [0.22, 0.36],
  [0.34, 0.48],
  [0.58, 0.8],
  [0.46, 0.6],
];
/** Where each lifted volume hangs over the desk (x across, y above the desk top, z toward the viewer). */
const REST: { x: number; y: number; z: number; yaw: number; roll: number }[] = [
  { x: -0.38, y: 0.27, z: 0.0, yaw: 0.35, roll: 0.1 },
  { x: -0.22, y: 0.31, z: 0.02, yaw: 0.22, roll: -0.05 },
  { x: -0.06, y: 0.34, z: 0.04, yaw: 0.1, roll: 0.06 },
  { x: 0.13, y: 0.38, z: 0.18, yaw: -0.62, roll: 0 },
  { x: 0.33, y: 0.29, z: 0.02, yaw: -0.25, roll: -0.08 },
];

/** A window for the cookie: two tall casements of three panes each, soft at the edges. */
function windowCookie() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = "#000";
  g.fillRect(0, 0, 512, 512);
  g.filter = "blur(6px)";
  g.fillStyle = "#fff";
  const x0 = 96;
  const w = 152;
  const gap = 16;
  for (let col = 0; col < 2; col++) {
    for (let row = 0; row < 3; row++) {
      g.fillRect(x0 + col * (w + gap), 70 + row * 128, w, 116);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export async function buildTopper(engine: Engine, o: TopperOptions) {
  const q = engine.quality;
  const [desk, chair, set, env] = await Promise.all([
    engine.loadModel(MODELS.schoolDesk, SIZE_KB[MODELS.schoolDesk]),
    engine.loadModel(MODELS.schoolChair, SIZE_KB[MODELS.schoolChair]),
    engine.loadModel(MODELS.encyclopedia, SIZE_KB[MODELS.encyclopedia]),
    engine.loadEnvironment(HDRI.warmInterior, SIZE_KB[HDRI.warmInterior]),
  ]);

  const scene = new THREE.Scene();
  scene.environment = env;
  scene.environmentIntensity = 0.32;
  scene.environmentRotation.y = 1.2;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 30);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(3.2, 64).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x1a1c44, roughness: 0.85, transparent: true, alphaMap: radialFade(), depthWrite: false }),
  );
  floor.receiveShadow = true;
  scene.add(floor);

  placeOnFloor(desk, 0, 0, 0);
  scene.add(desk);
  const db = bounds(desk);
  const top = db.max.y;

  // The chair tucked in on the viewer's side, turned a little as if just pushed back.
  chair.rotation.y = Math.PI + 0.18;
  placeOnFloor(chair, 0.06, 0, db.max.z + 0.12);
  scene.add(chair);

  // The set, spines to the viewer, standing at the back of the desk top.
  const vols = splitPieces(set, "x");
  vols.rotation.y = Math.PI;
  placeOnFloor(vols, 0, top, db.min.z + 0.13);
  scene.add(vols);
  vols.updateMatrixWorld(true);

  const books = PICK.map((i) => vols.children[i] as THREE.Group);
  // Lifted volumes move in world space (the set itself is turned to face the viewer).
  books.forEach((b) => scene.attach(b));
  const home = books.map((b) => b.position.clone());
  const anchors = books.map((b) => {
    const a = new THREE.Object3D();
    const s = b.userData.size as THREE.Vector3;
    a.position.set(0, s.y + 0.01, 0);
    b.add(a);
    return a;
  });

  scene.add(bakeContactShadow(engine.renderer, [desk, chair], { width: 2.2, depth: 2.2, height: 1, darkness: 1.3, opacity: 0.8, blur: 3 }));

  // Dusk through a window on the left: warm, low, cut into panes (desktop only, as the cookie
  // needs the shadow map). Indigo fill from the room, a magenta edge from behind.
  const key = new THREE.SpotLight(kelvin(2600), q.shadows ? 70 : 50, 0, 0.5, 0.35, 1.6);
  key.position.set(-2.4, 2.5, 0.9);
  key.target.position.set(0, top + 0.15, 0);
  key.castShadow = q.shadows;
  key.shadow.mapSize.set(q.shadowMapSize, q.shadowMapSize);
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.015;
  key.shadow.radius = 4;
  if (q.shadows) key.map = windowCookie();
  scene.add(key, key.target);
  scene.add(new THREE.HemisphereLight(0x6f78d8, 0x120f24, 0.55));
  const rim = new THREE.SpotLight(0xe672d9, 14, 0, 0.5, 0.7, 2);
  rim.position.set(1.6, 1.9, -1.8);
  rim.target.position.set(0, top + 0.3, 0);
  scene.add(rim, rim.target);
  // A soft lift on the lifted volumes, so their spines read in the dusk.
  const lift = new THREE.PointLight(kelvin(3400), 1.4, 2, 2);
  lift.position.set(0.3, top + 0.7, 0.8);
  scene.add(lift);

  // Camera: from the room to the lifted volumes.
  const c = new THREE.Vector3(0, top, 0);
  const keys: Key[] = [
    { at: 0, shot: { pos: [1.9, top + 0.9, 2.6], target: [c.x - 0.05, top - 0.05, c.z], fov: 32 } },
    { at: 0.45, shot: { pos: [1.4, top + 0.85, 2.15], target: [c.x, top + 0.22, c.z], fov: 30 } },
    { at: 1, shot: { pos: [1.3, top + 0.8, 2.3], target: [c.x - 0.02, top + 0.38, c.z + 0.05], fov: 31 } },
  ];
  const rig = new CameraRig(camera, keys, 0.22);
  const projector = new HotspotProjector(camera, anchors, o.hotspots);
  const still = !o.motion;
  let size = { w: 1, h: 1 };
  let lifted = -1;
  const pointer = { x: 0, y: 0 };

  const progress = () => {
    if (still) return 1;
    const r = o.section.getBoundingClientRect();
    const s = r.height - window.innerHeight;
    return s > 0 ? clamp01(-r.top / s) : 0;
  };

  const remove = engine.addView({
    element: o.element,
    scene,
    camera,
    resize: (s) => {
      size = s;
      camera.aspect = s.w / s.h;
    },
    update: (dt, time) => {
      const p = progress();
      rig.yaw.target = pointer.x * 0.08;
      rig.pitch.target = pointer.y * 0.04;
      let moving = rig.update(p, dt, still);
      const phone = size.w < 760;
      if (phone) {
        // A tall frame: step back so the desk and all five volumes fit the width.
        camera.position.sub(rig.lookAt).multiplyScalar(1.35).add(rig.lookAt);
        camera.updateMatrixWorld();
      }
      shiftFrame(camera, phone ? 0 : 0.17, phone ? -0.1 : 0);
      let n = 0;
      books.forEach((b, k) => {
        const [a, z] = WINDOW[k];
        const u = smooth(clamp01((p - a) / (z - a)));
        if (u > 0.98) n++;
        const r = REST[k];
        const h = home[k];
        // Up and out of the row first, then across to its place.
        const up = smooth(clamp01(u / 0.5));
        const across = smooth(clamp01((u - 0.3) / 0.7));
        const bob = still ? 0 : Math.sin(time * 0.9 + k * 1.7) * 0.006 * across;
        b.position.set(h.x + (c.x + r.x - h.x) * across, h.y + 0.26 * up + (r.y - 0.26) * across + bob, h.z + (0.08 + r.z) * across);
        b.rotation.set(-0.08 * across, Math.PI + r.yaw * across, r.roll * across);
      });
      if (n !== lifted) {
        lifted = n;
        o.onLifted(n);
      }
      if (!still) moving = true;
      return moving;
    },
    afterRender: (s) => projector.project(s),
  });

  return {
    dispose: () => remove(),
    pointer: (x: number, y: number) => {
      pointer.x = x;
      pointer.y = y;
      engine.invalidate();
    },
  };
}
