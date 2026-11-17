/**
 * Finance set piece, "The bronze" (design/v2.1-addendum.md §4).
 *
 * The Poly Haven bull head (real PBR bronze) on a dark stone plinth, almost unlit. A 3200K spot
 * follows the pointer like a torch so highlights slide over the metal; a green rim light in the
 * page's Accent B outlines it; the "formal hall" HDRI at 0.35 gives the metal something to
 * reflect. The pointer also turns the head (±12° yaw, ±6° pitch) on a settling spring.
 *
 * Scroll (the section is pinned): the camera starts on a horn tip in darkness, pulls back with
 * a 40° orbit to a three-quarter view while the four hotspots settle in, holds, then pushes into
 * the shadow of the eye and the scene goes dark, handing over to the field.
 *
 * To swap the model, change MODELS.bullHead in src/lib/three/assets.ts. Anchors for the
 * hotspots are found from the model's own geometry (horn tips, brow, muzzle), so a similar
 * head lands its hotspots in the same places.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { HDRI, MODELS, SIZE_KB } from "@/lib/three/assets";
import type { Engine } from "@/components/three/engine";
import {
  bakeContactShadow,
  bounds,
  CameraRig,
  clamp01,
  extremeVertex,
  HotspotProjector,
  kelvin,
  placeOnFloor,
  radialFade,
  shiftFrame,
  span,
  Spring,
  type Key,
} from "@/components/three/kit";

export type BronzeOptions = {
  element: HTMLElement;
  section: HTMLElement;
  hotspots: () => (HTMLElement | null)[];
  /** Hotspot ids in DOM order: nfo, srcc, fellowship, shisfest. */
  ids: string[];
  motion: boolean;
};

export type BronzeApi = {
  pointer: (ndc: { x: number; y: number } | null) => void;
  focus: (id: string | null) => void;
  dispose: () => void;
};

const PLINTH_H = 1.05;
const TORCH_K = 3200;
const RIM = 0x3fd08f;

/** Where on the pinned scroll each hotspot settles in, and when they all leave for the push. */
const REVEAL = [0.17, 0.22, 0.27, 0.32];
const LEAVE = 0.64;

export async function buildBronze(engine: Engine, o: BronzeOptions): Promise<BronzeApi> {
  const q = engine.quality;
  const [bull, env] = await Promise.all([
    engine.loadModel(MODELS.bullHead, SIZE_KB[MODELS.bullHead]),
    engine.loadEnvironment(HDRI.hall),
  ]);

  const scene = new THREE.Scene();
  scene.environment = env;
  scene.environmentIntensity = 0.35;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 40);

  // ── The room: a floor that only shows where light falls, and a stone plinth ──
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(4, 64).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x07160f, roughness: 0.82, metalness: 0, transparent: true, alphaMap: radialFade(), depthWrite: false }),
  );
  floor.receiveShadow = true;
  scene.add(floor);

  const stone = new THREE.MeshStandardMaterial({ color: 0x040d09, roughness: 0.72, metalness: 0.02, envMapIntensity: 0.5 });
  const plinth = new THREE.Mesh(new RoundedBoxGeometry(0.3, PLINTH_H, 0.3, 3, 0.005), stone);
  plinth.position.y = PLINTH_H / 2;
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  scene.add(plinth);

  // ── The bronze, on a pivot at its base so the pointer turns it on its neck ──
  const pivot = new THREE.Group();
  pivot.position.set(0, PLINTH_H, 0);
  scene.add(pivot);
  placeOnFloor(bull, 0, 0, 0);
  pivot.add(bull);
  bull.traverse((m) => {
    const mesh = m as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    // Let the bronze hold its highlights: a touch more reflective response, nothing else changed.
    mat.envMapIntensity = 1.4;
  });

  // Contact shadows (baked once): the bronze on the plinth top, the plinth on the floor.
  const b0 = bounds(pivot);
  scene.add(
    bakeContactShadow(engine.renderer, [pivot], { width: 0.5, depth: 0.5, y: PLINTH_H, height: 0.25, darkness: 2.2, opacity: 0.9, blur: 1.6 }),
  );
  scene.add(bakeContactShadow(engine.renderer, [plinth], { width: 1.4, depth: 1.4, y: 0, height: 0.6, darkness: 1.2, opacity: 0.8, blur: 3 }));

  // ── Anchors from the model's geometry (world space, then parented to the pivot) ──
  const dims = b0.getSize(new THREE.Vector3());
  const size3 = dims;
  const centre = b0.getCenter(new THREE.Vector3());
  const upper = (v: THREE.Vector3) => v.y > b0.min.y + dims.y * 0.55;
  const hornL = extremeVertex(pivot, new THREE.Vector3(-1, 0.25, 0).normalize(), upper);
  const hornR = extremeVertex(pivot, new THREE.Vector3(1, 0.25, 0).normalize(), upper);
  const muzzle = extremeVertex(pivot, new THREE.Vector3(0, -0.2, 1).normalize(), (v) => v.y > b0.min.y + dims.y * 0.4);
  const brow = extremeVertex(pivot, new THREE.Vector3(0, 0.35, 1).normalize(), (v) => Math.abs(v.x) < dims.x * 0.1 && v.y > centre.y + dims.y * 0.14);
  const eye = extremeVertex(pivot, new THREE.Vector3(1, 0.05, 0.45).normalize(), (v) => v.y > centre.y - dims.y * 0.02 && v.y < centre.y + dims.y * 0.16 && v.z > centre.z);
  const anchor = (p: THREE.Vector3) => {
    const a = new THREE.Object3D();
    a.position.copy(pivot.worldToLocal(p.clone()));
    pivot.add(a);
    return a;
  };
  // DOM order: nfo, srcc, fellowship, shisfest.
  const anchors = [anchor(hornR), anchor(hornL), anchor(brow), anchor(muzzle)];
  const byId = new Map(o.ids.map((id, i) => [id, anchors[i]]));

  // ── Lights ──
  const torch = new THREE.SpotLight(kelvin(TORCH_K), 26, 0, 0.3, 0.85, 2);
  torch.castShadow = q.shadows;
  torch.shadow.mapSize.set(q.shadowMapSize, q.shadowMapSize);
  torch.shadow.bias = -0.0004;
  torch.shadow.normalBias = 0.015;
  torch.shadow.camera.near = 0.2;
  torch.shadow.camera.far = 6;
  scene.add(torch, torch.target);

  // Low and well behind, so the green only grazes the silhouette and never tops the plinth.
  const rim = new THREE.SpotLight(RIM, 22, 0, 0.24, 0.7, 2);
  rim.position.set(-0.95, PLINTH_H + 0.5, -1.15);
  rim.target.position.copy(centre).add(new THREE.Vector3(0, 0.08, 0));
  scene.add(rim, rim.target);
  const rim2 = new THREE.SpotLight(RIM, 6, 0, 0.22, 0.8, 2);
  rim2.position.set(0.95, PLINTH_H + 0.5, -0.85);
  rim2.target.position.copy(centre);
  scene.add(rim2, rim2.target);

  // ── Camera path ──
  const C = centre.clone();
  const at = (yawDeg: number, dist: number, lift: number): THREE.Vector3Tuple => {
    const a = THREE.MathUtils.degToRad(yawDeg);
    return [C.x + Math.sin(a) * dist, C.y + lift, C.z + Math.cos(a) * dist];
  };
  const hornOut = hornR.clone().sub(C).setY(0).normalize();
  const startPos = hornR.clone().addScaledVector(hornOut, 0.07).add(new THREE.Vector3(0, 0.03, 0.12));
  const eyeOut = new THREE.Vector3(0.85, 0.08, 0.6).normalize();
  const keys: Key[] = [
    { at: 0, shot: { pos: startPos.toArray(), target: hornR.toArray(), fov: 34 } },
    { at: 0.34, shot: { pos: at(40, 1.4, 0.1), target: [C.x, C.y + 0.02, C.z], fov: 30 } },
    { at: 0.6, shot: { pos: at(47, 1.32, 0.08), target: [C.x, C.y + 0.02, C.z], fov: 30 } },
    { at: 0.86, shot: { pos: eye.clone().addScaledVector(eyeOut, 0.09).toArray(), target: eye.toArray(), fov: 34 } },
    { at: 1, shot: { pos: eye.clone().addScaledVector(eyeOut, 0.03).toArray(), target: eye.toArray(), fov: 38 } },
  ];
  const rig = new CameraRig(camera, keys, 0.2);

  // ── State ──
  const still = !o.motion;
  const STILL_P = 0.45;
  const yaw = new Spring(0, 55, 0.6);
  const pitch = new Spring(0, 55, 0.6);
  let pointer: { x: number; y: number } | null = null;
  let focus: THREE.Object3D | null = null;
  const torchAim = new THREE.Vector3().copy(brow);
  const torchGoal = new THREE.Vector3();
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane();
  const tmp = new THREE.Vector3();
  const right = new THREE.Vector3();
  const upV = new THREE.Vector3();
  let progress = still ? STILL_P : 0;
  let veiled = "";
  let phase = "";
  let t = 0;

  const readProgress = () => {
    if (still) return STILL_P;
    const r = o.section.getBoundingClientRect();
    const spanPx = r.height - window.innerHeight;
    return spanPx > 0 ? clamp01(-r.top / spanPx) : 0;
  };

  const projector = new HotspotProjector(camera, anchors, o.hotspots);
  let size = { w: 1, h: 1 };

  const update = (dt: number) => {
    t += dt;
    progress = readProgress();
    const p = progress;
    let moving = rig.update(p, dt, still);
    const phone = size.w < 760;
    // Leave the left of the frame for the copy (desktop), the bottom for it (phone); centre for the push.
    const push = span(p, 0.64, 0.84);
    shiftFrame(camera, phone ? 0 : 0.17 * (1 - push), phone ? 0.16 * (1 - push) : 0);

    // Pointer turns the head.
    const px = pointer ? pointer.x : 0;
    const py = pointer ? pointer.y : 0;
    yaw.target = THREE.MathUtils.degToRad(12) * px;
    pitch.target = -THREE.MathUtils.degToRad(6) * py;
    moving = yaw.step(dt) || moving;
    moving = pitch.step(dt) || moving;
    pivot.rotation.set(pitch.value, yaw.value, 0);

    // The torch: held just above and to the right of the viewer, aimed where the pointer points.
    camera.updateMatrixWorld();
    right.setFromMatrixColumn(camera.matrixWorld, 0);
    upV.setFromMatrixColumn(camera.matrixWorld, 1);
    const dist = camera.position.distanceTo(C);
    torch.position.copy(camera.position).addScaledVector(right, 0.18 + dist * 0.25).addScaledVector(upV, 0.12 + dist * 0.2);
    if (focus) focus.getWorldPosition(torchGoal);
    else if (pointer && !still) {
      ray.setFromCamera(new THREE.Vector2(pointer.x, pointer.y), camera);
      plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(tmp).negate(), C);
      if (!ray.ray.intersectPlane(plane, torchGoal)) torchGoal.copy(C);
    } else if (!still) {
      // No pointer (touch, or before the first move): the torch sweeps slowly over the brow and horns.
      torchGoal.set(C.x + Math.sin(t * 0.45) * size3.x * 0.45, C.y + size3.y * 0.18 + Math.sin(t * 0.7) * 0.05, C.z + size3.z * 0.3);
    } else torchGoal.copy(brow).lerp(C, 0.2);
    const before = torchAim.clone();
    torchAim.lerp(torchGoal, still ? 1 : 1 - Math.exp(-dt / 0.16));
    torch.target.position.copy(torchAim);
    if (before.distanceToSquared(torchAim) > 1e-9) moving = true;
    if (!still && !pointer && !focus) moving = true; // the idle sweep keeps going

    // Hotspots settle in one by one, and leave for the push.
    let v = "";
    for (const r of REVEAL) v += still || (p >= r && p < LEAVE) ? "1" : "0";
    if (v !== veiled) {
      veiled = v;
      o.hotspots().forEach((el, i) => {
        if (!el) return;
        if (v[i] === "1") delete el.dataset.veiled;
        else el.dataset.veiled = "";
      });
    }
    const ph = p < 0.12 ? "horn" : p < LEAVE ? "hold" : p < 0.9 ? "push" : "dark";
    if (ph !== phase) {
      phase = ph;
      o.element.dataset.phase = ph;
    }
    return moving;
  };
  const remove = engine.addView({
    element: o.element,
    scene,
    camera,
    update: (dt, _t, s) => {
      size = s;
      return update(dt);
    },
    resize: (s) => {
      size = s;
      camera.aspect = s.w / s.h;
    },
    afterRender: (s) => projector.project(s),
    exposure: () => 1 - span(progress, 0.8, 0.96),
  });

  return {
    pointer: (ndc) => {
      pointer = ndc;
      engine.invalidate();
    },
    focus: (id) => {
      focus = id ? (byId.get(id) ?? null) : null;
      engine.invalidate();
    },
    dispose: () => {
      remove();
    },
  };
}
