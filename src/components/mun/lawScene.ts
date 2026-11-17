/**
 * Law & Diplomacy set piece, "The chamber", rebuilt from real models (design/v2.1-addendum.md §4).
 *
 *   Dais     the metal office desk on a low claret platform with a brass rail, three office armchairs,
 *            a desk microphone at each place and the three Executive Board placards at double
 *            size, under one brass spot (the only light that casts real-time shadows).
 *   Floor    a hemicycle of 16 school desks with school chairs (InstancedMesh), each carrying a
 *            delegate-award placard whose brightness follows the award level.
 *   Bench    two dining chairs at the side with the two parliamentary programmes.
 *   Corner   the worn bookshelf with the encyclopedia set on a shelf and the marble bust on top,
 *            a writing table with the binder and the gavel, and the arm lamp that switches on.
 *
 * Scroll (the section is pinned) moves the camera: high over the chamber, down onto the dais,
 * turn to the floor (desks light in sequence), across to the bench, then the law corner.
 * Drag orbits ±20°; the pointer adds a little spring parallax. The room sits at about 30% with
 * the "formal hall" HDRI for reflections only; the background is the page ground.
 *
 * Models: MODELS in src/lib/three/assets.ts. Placement reads each model's own bounding box and
 * surfaces (ray cast), so a replacement of similar shape lands in the right place.
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
  damp,
  extremeVertex,
  HotspotProjector,
  instanced,
  kelvin,
  meshesOf,
  placeOnFloor,
  radialFade,
  shiftFrame,
  span,
  Spring,
  type Key,
} from "@/components/three/kit";
import { DAIS_Z, type Seat } from "./seats";

export type LawPhase = "open" | "dais" | "floor" | "bench" | "corner";

export type LawOptions = {
  element: HTMLElement;
  section: HTMLElement;
  seats: Seat[];
  /** DOM buttons over the floor placards, in the order of `seats` filtered to kind "floor". */
  seatButtons: () => (HTMLElement | null)[];
  /** Hotspots in DOM order: the bench placards, then the law corner. */
  hotspots: () => (HTMLElement | null)[];
  onPhase: (p: LawPhase) => void;
  /** Screen point of the raised placard (for the readout's leader). */
  onRaised?: (pt: { x: number; y: number } | null) => void;
};

export type LawApi = {
  pointer: (ndc: { x: number; y: number } | null) => void;
  drag: (dxPx: number) => void;
  raise: (id: string | null) => void;
  lit: (test: (s: Seat) => boolean) => void;
  focus: (id: string | null) => void;
  dispose: () => void;
};

/** Where on the pinned scroll each shot sits. */
const AT = { open: 0, dais: 0.12, daisHold: 0.3, floor: 0.44, floorHold: 0.62, bench: 0.72, benchHold: 0.8, corner: 0.92, end: 1 };
const PHASE_AT: [number, LawPhase][] = [
  [0.07, "dais"],
  [0.36, "floor"],
  [0.67, "bench"],
  [0.86, "corner"],
];

const BRASS = 0xd8ae58;
const LAPIS = 0x7fa6e8;
const CLARET = 0x2a0c12;

/** Model yaw offsets: Poly Haven furniture faces +Z (front toward the viewer). */
const FACE_FIX = { desk: Math.PI, chair: 0, arm: 0, dining: 0, shelf: 0 };

function fontVar(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/** A placard face: Bodoni small caps for the conference, the figure face for the committee. */
function placardTexture(title: string, sub: string, anisotropy: number, dais: boolean) {
  const W = 1024;
  const H = 336;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#efe5d6";
  g.fillRect(0, 0, W, H);
  g.fillStyle = dais ? "#b48a3c" : "#5a1a24";
  g.fillRect(0, H - 22, W, 22);
  const display = fontVar("--ff-display", "serif");
  const figure = fontVar("--ff-figure", "monospace");
  g.textAlign = "center";
  g.textBaseline = "alphabetic";
  (g as CanvasRenderingContext2D & { fontVariantCaps?: string }).fontVariantCaps = "small-caps";
  let size = 128;
  const setTitle = () => (g.font = `800 ${size}px ${display}`);
  setTitle();
  while (g.measureText(title).width > W - 96 && size > 56) {
    size -= 4;
    setTitle();
  }
  // A thin stroke in the ink colour keeps Bodoni's hairlines from vanishing at placard size.
  g.fillStyle = g.strokeStyle = "#2a0a10";
  g.lineWidth = 3;
  g.lineJoin = "round";
  g.strokeText(title, W / 2, 168);
  g.fillText(title, W / 2, 168);
  (g as CanvasRenderingContext2D & { fontVariantCaps?: string }).fontVariantCaps = "normal";
  g.font = `500 60px ${figure}`;
  g.fillStyle = "#6b3a40";
  g.fillText(sub, W / 2, 262);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  return tex;
}

/** A tent card: two leaning faces meeting at the top, printed on both. */
function tentCard(width: number, height: number, mat: THREE.Material) {
  const g = new THREE.Group();
  const lean = 0.2;
  const face = new THREE.PlaneGeometry(width, height);
  face.translate(0, -height / 2, 0);
  const front = new THREE.Mesh(face, mat);
  front.rotation.x = -lean;
  const back = new THREE.Mesh(face, mat);
  back.rotation.set(lean, Math.PI, 0);
  for (const m of [front, back]) {
    m.castShadow = true;
    m.position.y = height * Math.cos(lean);
    g.add(m);
  }
  return g;
}

/** The highest surface of `model` under (x, z) below `fromY` (world space). */
function surfaceY(model: THREE.Object3D, x: number, z: number, fromY: number) {
  model.updateWorldMatrix(true, true);
  const ray = new THREE.Raycaster(new THREE.Vector3(x, fromY, z), new THREE.Vector3(0, -1, 0));
  const hit = ray.intersectObject(model, true)[0];
  return hit ? hit.point.y : null;
}

type Placard = {
  seat: Seat;
  group: THREE.Group;
  mat: THREE.MeshStandardMaterial;
  baseY: number;
  lift: Spring;
  glow: number;
  lit: boolean;
  order: number;
  current: number;
};

export async function buildLaw(engine: Engine, o: LawOptions): Promise<LawApi> {
  const q = engine.quality;
  const L = (k: keyof typeof MODELS) => engine.loadModel(MODELS[k], SIZE_KB[MODELS[k]]);
  const [table, arm, mic, desk, chair, dining, shelf, books, bust, binder, gavel, lamp, side, env] = await Promise.all([
    L("daisDesk"),
    L("armChair"),
    L("microphone"),
    L("schoolDesk"),
    L("schoolChair"),
    L("diningChair"),
    L("bookshelf"),
    L("encyclopedia"),
    L("bust"),
    L("binder"),
    L("gavel"),
    L("deskLamp"),
    L("sideTable"),
    engine.loadEnvironment(HDRI.hall),
    document.fonts.ready,
  ]);
  const aniso = engine.renderer.capabilities.getMaxAnisotropy();

  const scene = new THREE.Scene();
  scene.environment = env;
  scene.environmentIntensity = 0.32;
  const camera = new THREE.PerspectiveCamera(34, 1, 0.05, 60);

  // ── The room: claret carpet that exists only where light falls ──
  const carpet = new THREE.Mesh(
    new THREE.CircleGeometry(9, 72).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: CLARET, roughness: 0.96, transparent: true, alphaMap: radialFade(), depthWrite: false }),
  );
  carpet.position.set(0, 0, 1.4);
  carpet.receiveShadow = true;
  scene.add(carpet);
  scene.add(new THREE.HemisphereLight(0x5a2a32, 0x0a0405, 0.35));

  // ── Dais: a low claret platform with a brass rail ──
  const DAIS_H = 0.3;
  const dais = new THREE.Group();
  scene.add(dais);
  const platform = new THREE.Mesh(
    new RoundedBoxGeometry(3.9, DAIS_H, 2.5, 2, 0.012),
    new THREE.MeshStandardMaterial({ color: 0x3b1219, roughness: 0.5, metalness: 0 }),
  );
  platform.position.set(0, DAIS_H / 2, -0.85);
  platform.receiveShadow = true;
  platform.castShadow = true;
  dais.add(platform);
  const brass = new THREE.MeshStandardMaterial({ color: BRASS, metalness: 1, roughness: 0.28 });
  const rail = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.03, 0.012), brass);
  rail.position.set(0, DAIS_H - 0.02, 0.4 + 0.007);
  dais.add(rail);

  // The desk, its long side to the floor and its modesty panel toward the delegates.
  table.rotation.y = Math.PI;
  placeOnFloor(table, 0, DAIS_H, DAIS_Z);
  dais.add(table);
  const tb = bounds(table);
  const tableTop = surfaceY(table, 0, DAIS_Z, tb.max.y + 0.5) ?? tb.max.y;
  const tableFront = tb.max.z;

  // Three armchairs behind it, one microphone at each place.
  const board = o.seats.filter((s) => s.kind === "dais");
  board.forEach((s, i) => {
    const a = i === 0 ? arm : arm.clone(true);
    a.rotation.y = FACE_FIX.arm;
    placeOnFloor(a, s.x, DAIS_H, tb.min.z - 0.42);
    dais.add(a);
    const m = i === 0 ? mic : mic.clone(true);
    m.rotation.y = Math.PI - 0.35; // capsule toward the chair, angled in
    placeOnFloor(m, s.x + 0.24, tableTop, DAIS_Z - 0.1);
    dais.add(m);
  });

  // ── Floor: 16 desks and chairs on two arcs, facing the dais ──
  const floorSeats = o.seats.filter((s) => s.kind === "floor");
  const deskAt = floorSeats.map((s) => ({ x: s.x, y: s.y, z: s.z, yaw: s.face + FACE_FIX.desk }));
  const back = (s: Seat, d: number) => ({ x: s.x + Math.sin(s.face + Math.PI) * d, z: s.z + Math.cos(s.face + Math.PI) * d });
  const chairAt = floorSeats.map((s) => ({ ...back(s, 0.52), y: s.y, yaw: s.face + FACE_FIX.chair }));
  const deskB = bounds(desk);
  const deskH = deskB.max.y - deskB.min.y;
  // Work out the desk's writing surface once (the model is instanced, so measure the source).
  placeOnFloor(desk, 0, 0, 0);
  const deskTop = surfaceY(desk, 0, 0, deskH + 0.5) ?? deskH;
  const floorDesks = instanced(desk, deskAt);
  const floorChairs = instanced(chair, chairAt);
  const floor = new THREE.Group();
  floor.add(floorDesks, floorChairs);
  scene.add(floor);

  // ── Side bench: two dining chairs for the parliamentary programmes ──
  const benchSeats = o.seats.filter((s) => s.kind === "bench");
  const bench = new THREE.Group();
  scene.add(bench);
  placeOnFloor(dining, 0, 0, 0);
  const diningSeat = surfaceY(dining, 0, 0.02, 0.7) ?? 0.46;
  benchSeats.forEach((s, i) => {
    const c = i === 0 ? dining : dining.clone(true);
    c.rotation.y = -Math.PI / 2 + FACE_FIX.dining;
    placeOnFloor(c, s.x, 0, s.z);
    bench.add(c);
  });

  // ── The law corner, built facing +Z and then turned toward the room ──
  const corner = new THREE.Group();
  scene.add(corner);
  shelf.rotation.y = FACE_FIX.shelf;
  placeOnFloor(shelf, 0, 0, -0.75);
  corner.add(shelf);
  const sb = bounds(shelf);
  // The writing table: the small wooden table scaled to a writing table (0.9 x 0.74 x 0.6 m).
  const sideB = bounds(side);
  side.scale.set(0.9 / (sideB.max.x - sideB.min.x), 0.74 / (sideB.max.y - sideB.min.y), 0.6 / (sideB.max.z - sideB.min.z));
  placeOnFloor(side, 0.35, 0, 0.15);
  corner.add(side);
  const sideTop = bounds(side).max.y;
  // Binder open on the table, the gavel beside it.
  binder.rotation.y = 0.12;
  placeOnFloor(binder, 0.32, sideTop, 0.2);
  corner.add(binder);
  gavel.rotation.y = -1.1;
  placeOnFloor(gavel, 0.66, sideTop, 0.22);
  corner.add(gavel);
  // Encyclopedia set on the shelf nearest eye level; the bust on top.
  const shelfY = surfaceY(shelf, sb.getCenter(new THREE.Vector3()).x - 0.2, sb.getCenter(new THREE.Vector3()).z, 1.35) ?? 1.0;
  placeOnFloor(books, sb.getCenter(new THREE.Vector3()).x - 0.2, shelfY, sb.getCenter(new THREE.Vector3()).z + 0.02);
  corner.add(books);
  const shelfTop = surfaceY(shelf, sb.getCenter(new THREE.Vector3()).x + 0.25, sb.getCenter(new THREE.Vector3()).z, sb.max.y + 0.5) ?? sb.max.y;
  bust.rotation.y = 0.5;
  placeOnFloor(bust, sb.getCenter(new THREE.Vector3()).x + 0.25, shelfTop, sb.getCenter(new THREE.Vector3()).z);
  corner.add(bust);
  // The arm lamp at the table's back-left, its head turned over the binder.
  placeOnFloor(lamp, 0, 0, 0);
  const headL = extremeVertex(lamp, new THREE.Vector3(0, 1, 0));
  const footL = extremeVertex(lamp, new THREE.Vector3(0, -1, 0));
  const sideBB = bounds(side);
  // Back-left, inside the round top (the bounding box corner would be in the air).
  const sideC = sideBB.getCenter(new THREE.Vector3());
  const lampAt = new THREE.Vector2(sideC.x - 0.27, sideC.z - 0.16);
  const binderC = bounds(binder).getCenter(new THREE.Vector3());
  lamp.rotation.y = Math.atan2(binderC.x - lampAt.x, binderC.z - lampAt.y) - Math.atan2(headL.x - footL.x, headL.z - footL.z);
  lamp.updateMatrixWorld(true);
  const footW = extremeVertex(lamp, new THREE.Vector3(0, -1, 0));
  lamp.position.x += lampAt.x - footW.x;
  lamp.position.z += lampAt.y - footW.z;
  lamp.position.y += sideTop - footW.y;
  corner.add(lamp);
  const lampMats: THREE.MeshStandardMaterial[] = [];
  for (const m of meshesOf(lamp)) {
    const mats = (Array.isArray(m.material) ? m.material : [m.material]) as THREE.MeshStandardMaterial[];
    for (const mat of mats) if (/light|bulb|emiss/i.test(mat.name)) {
      mat.emissive = kelvin(2700);
      mat.emissiveIntensity = 0;
      lampMats.push(mat);
    }
  }
  const lampHeadLocal = extremeVertex(lamp, new THREE.Vector3(0, 1, 0)).clone();
  const binderLocal = bounds(binder).getCenter(new THREE.Vector3());
  // Baked while the corner is still at the origin, so its plane lands in the corner's own space.
  corner.add(bakeContactShadow(engine.renderer, [shelf, side], { width: 2.6, depth: 2.4, x: 0.1, y: 0, z: -0.3, height: 2.2, darkness: 1.2, opacity: 0.85, blur: 2.6 }));
  corner.position.set(-4.35, 0, -0.35);
  corner.rotation.y = 0.78;
  corner.updateMatrixWorld(true);

  // ── Placards ──
  const placards: Placard[] = [];
  const addPlacard = (s: Seat, parent: THREE.Object3D, pos: THREE.Vector3, yaw: number, w: number, h: number, order: number) => {
    const tex = placardTexture(s.title, s.sub, aniso, s.kind === "dais");
    const mat = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.62, side: THREE.FrontSide });
    const card = tentCard(w, h, mat);
    const g = new THREE.Group();
    g.add(card);
    g.position.copy(pos);
    g.rotation.y = yaw;
    parent.add(g);
    placards.push({ seat: s, group: g, mat, baseY: pos.y, lift: new Spring(0, 90, 0.62), glow: s.glow, lit: true, order, current: 0 });
  };
  floorSeats.forEach((s, i) => {
    // At the desk's front edge (toward the dais), facing the dais.
    const fwd = 0.16;
    addPlacard(s, scene, new THREE.Vector3(s.x + Math.sin(s.face) * fwd, s.y + deskTop + 0.002, s.z + Math.cos(s.face) * fwd), s.face, 0.3, 0.1, i);
  });
  board.forEach((s, i) => addPlacard(s, dais, new THREE.Vector3(s.x, tableTop + 0.002, tableFront - 0.16), 0, 0.6, 0.2, i));
  benchSeats.forEach((s, i) => addPlacard(s, bench, new THREE.Vector3(s.x, diningSeat + 0.002, s.z), -Math.PI / 2, 0.34, 0.11, i));
  const floorPlacards = placards.filter((p) => p.seat.kind === "floor");
  const benchPlacards = placards.filter((p) => p.seat.kind === "bench");

  // ── Contact shadows (baked once) ──
  const bake = (objs: THREE.Object3D[], opt: Parameters<typeof bakeContactShadow>[2]) => scene.add(bakeContactShadow(engine.renderer, objs, opt));
  bake([floor], { width: 12, depth: 7, x: 0, y: 0, z: 3.2, height: 1.1, darkness: 1.6, opacity: 0.85, blur: 2.4, resolution: 1024 });
  bake([platform], { width: 5.2, depth: 3.8, x: 0, y: 0, z: -0.85, height: 0.4, darkness: 1.2, opacity: 0.8, blur: 3 });
  bake([table, ...dais.children.filter((c) => c !== platform && c !== rail && c !== table)], {
    width: 4,
    depth: 2.6,
    x: 0,
    y: DAIS_H,
    z: -0.85,
    height: 1,
    darkness: 1.4,
    opacity: 0.8,
    blur: 2,
  });
  bake([bench], { width: 2, depth: 2.8, x: 4.1, y: 0, z: 0.15, height: 1, darkness: 1.4, opacity: 0.8, blur: 2 });

  // ── Lights ──
  const warm = kelvin(3100);
  const key = new THREE.SpotLight(new THREE.Color(BRASS).lerp(warm, 0.5), 340, 0, 0.36, 0.55, 2);
  key.position.set(0.9, 5.4, 2.6);
  key.target.position.set(0, tableTop, DAIS_Z - 0.2);
  key.castShadow = q.shadows;
  key.shadow.mapSize.set(q.shadowMapSize, q.shadowMapSize);
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  key.shadow.camera.near = 2;
  key.shadow.camera.far = 10;
  scene.add(key, key.target);
  const rim = new THREE.SpotLight(LAPIS, 40, 0, 0.32, 0.8, 2);
  rim.position.set(-0.6, 3.4, -4.4);
  rim.target.position.set(0, 1.25, -1.5);
  scene.add(rim, rim.target);

  const wash = new THREE.SpotLight(kelvin(3600), 0, 0, 0.62, 0.9, 2);
  wash.position.set(0, 7.2, 1.4);
  wash.target.position.set(0, 0, 3.6);
  scene.add(wash, wash.target);
  const washRim = new THREE.SpotLight(LAPIS, 0, 0, 0.7, 0.9, 2);
  washRim.position.set(0, 3.2, 9);
  washRim.target.position.set(0, 0.6, 3.2);
  scene.add(washRim, washRim.target);

  const benchLight = new THREE.SpotLight(warm, 0, 0, 0.32, 0.7, 2);
  benchLight.position.set(2.6, 4.4, 1.8);
  benchLight.target.position.set(4.1, 0.4, 0.15);
  scene.add(benchLight, benchLight.target);

  const lampHead = corner.localToWorld(lampHeadLocal.clone()).add(new THREE.Vector3(0, -0.05, 0));
  const binderW = corner.localToWorld(binderLocal.clone());
  const lampLight = new THREE.SpotLight(kelvin(2700), 0, 0, 0.85, 0.85, 2);
  lampLight.position.copy(lampHead);
  lampLight.target.position.copy(binderW);
  scene.add(lampLight, lampLight.target);
  const lampGlow = new THREE.PointLight(kelvin(2700), 0, 3, 2);
  lampGlow.position.copy(lampHead);
  scene.add(lampGlow);
  const cornerFill = new THREE.SpotLight(new THREE.Color(BRASS).lerp(warm, 0.6), 0, 0, 0.42, 0.85, 2);
  const shelfW = corner.localToWorld(sb.getCenter(new THREE.Vector3()));
  cornerFill.position.copy(shelfW).add(new THREE.Vector3(2.4, 3.2, 2.6));
  cornerFill.target.position.copy(shelfW);
  scene.add(cornerFill, cornerFill.target);

  // ── Hotspot anchors: the bench placards, then the binder ──
  const anchor = (parent: THREE.Object3D, p: THREE.Vector3) => {
    const a = new THREE.Object3D();
    a.position.copy(p);
    parent.add(a);
    return a;
  };
  const anchors = [
    ...benchPlacards.map((p) => anchor(p.group, new THREE.Vector3(0, 0.12, 0))),
    anchor(corner, binderLocal.clone().add(new THREE.Vector3(0, 0.02, 0))),
  ];
  const ids = [...benchPlacards.map((p) => p.seat.id), "course"];
  const projector = new HotspotProjector(camera, anchors, o.hotspots);

  // ── Camera path ──
  const C = (v: THREE.Vector3) => v.toArray() as THREE.Vector3Tuple;
  const benchC = new THREE.Vector3(4.05, 0.6, 0.1);
  const cornerLook = corner.localToWorld(new THREE.Vector3(0.1, 1.5, -0.45));
  const cornerEye = corner.localToWorld(new THREE.Vector3(1.0, 2.0, 4.3));
  const keys: Key[] = [
    { at: AT.open, shot: { pos: [0.4, 6.4, 10.5], target: [0, 0.4, 0.8], fov: 34 } },
    { at: AT.dais, shot: { pos: [0.55, 2.45, 5.0], target: [0, tableTop - 0.05, DAIS_Z], fov: 30 } },
    { at: AT.daisHold, shot: { pos: [0.35, 2.4, 4.7], target: [0, tableTop - 0.05, DAIS_Z], fov: 30 } },
    { at: AT.floor, shot: { pos: [0.6, 3.4, -1.0], target: [0, 0.4, 3.7], fov: 40 } },
    { at: AT.floorHold, shot: { pos: [-0.4, 3.3, -0.9], target: [0, 0.4, 3.7], fov: 40 } },
    { at: AT.bench, shot: { pos: [1.0, 1.95, 3.3], target: C(benchC), fov: 32 } },
    { at: AT.benchHold, shot: { pos: [1.15, 1.9, 3.05], target: C(benchC), fov: 32 } },
    { at: AT.corner, shot: { pos: C(cornerEye), target: C(cornerLook), fov: 36 } },
    { at: AT.end, shot: { pos: C(cornerEye.clone().lerp(cornerLook, 0.12)), target: C(cornerLook), fov: 36 } },
  ];
  const rig = new CameraRig(camera, keys, 0.24);

  // ── State ──
  let pointer: { x: number; y: number } | null = null;
  let dragYaw = 0;
  let raised: string | null = null;
  let focus: string | null = null;
  let phase: LawPhase | "" = "";
  let size = { w: 1, h: 1 };
  let floorOn = 0;
  let benchOn = 0;
  let cornerOn = 0;
  let lampOn = 0;
  let t = 0;
  const tmp = new THREE.Vector3();

  const readProgress = () => {
    const r = o.section.getBoundingClientRect();
    const s = r.height - window.innerHeight;
    return s > 0 ? clamp01(-r.top / s) : 0;
  };

  const update = (dt: number) => {
    t += dt;
    const p = readProgress();
    rig.yaw.target = THREE.MathUtils.clamp(dragYaw + (pointer ? pointer.x * 0.05 : 0), -0.35, 0.35);
    rig.pitch.target = pointer ? pointer.y * 0.025 : 0;
    let moving = rig.update(p, dt);
    const phone = size.w < 760;
    // Desktop: the dais is framed in the centre (the roles run across the bottom); the other
    // shots leave the left column for their copy.
    const left = span(p, AT.daisHold, AT.floor) * (1 + 0.4 * span(p, AT.benchHold, AT.corner));
    shiftFrame(camera, phone ? 0 : 0.14 * left, phone ? 0 : 0.2 * (1 - span(p, AT.daisHold, AT.floor)) * span(p, 0.04, AT.dais));

    let ph: LawPhase = "open";
    for (const [at, name] of PHASE_AT) if (p >= at) ph = name;
    if (ph !== phase) {
      phase = ph;
      o.element.dataset.phase = ph;
      o.onPhase(ph);
    }

    // Lights follow the shots.
    const floorT = span(p, AT.daisHold, AT.floorHold);
    // The floor is lit for its own shot; dim while the dais is on screen, a little for the overview.
    const floorWant = p > AT.daisHold && p < AT.bench + 0.04 ? 1 : p < AT.dais * 0.6 ? 0.3 : 0;
    floorOn = damp(floorOn, floorWant, 0.4, dt);
    benchOn = damp(benchOn, p > AT.floorHold ? 1 : 0, 0.4, dt);
    cornerOn = damp(cornerOn, p > AT.benchHold ? 1 : 0.15, 0.5, dt);
    const lampWant = p > AT.corner - 0.04 ? 1 : 0;
    lampOn = damp(lampOn, lampWant, lampWant ? 0.12 : 0.3, dt);
    // One flicker as the lamp comes on.
    const flick = lampOn > 0.2 && lampOn < 0.75 ? 0.55 + 0.45 * Math.sin(t * 60) : 1;
    wash.intensity = 300 * floorOn;
    washRim.intensity = 60 * floorOn;
    benchLight.intensity = 160 * benchOn;
    cornerFill.intensity = 120 * cornerOn;
    lampLight.intensity = 9 * lampOn * flick * (focus === "course" ? 1.5 : 1);
    lampGlow.intensity = 0.5 * lampOn * flick;
    for (const m of lampMats) m.emissiveIntensity = 8 * lampOn * flick;
    key.intensity = 340 * (1 - 0.55 * span(p, AT.floorHold, AT.bench));
    if (Math.abs(floorOn - floorWant) > 0.002) moving = true;
    if (Math.abs(lampOn - lampWant) > 0.002 || Math.abs(benchOn - (p > AT.floorHold ? 1 : 0)) > 0.002) moving = true;

    // Placards: desks light in sequence as the camera turns to the floor; raised on hover.
    for (const pl of placards) {
      let want: number;
      if (pl.seat.kind === "floor") {
        const seq = clamp01((floorT - (pl.order / floorPlacards.length) * 0.55) / 0.25);
        want = (0.08 + 0.55 * pl.glow * seq) * (pl.lit ? 1 : 0.12);
      } else if (pl.seat.kind === "dais") want = 0.38;
      else want = 0.08 + 0.4 * benchOn;
      if (raised === pl.seat.id || focus === pl.seat.id) want += 0.35;
      const next = damp(pl.current, want, 0.18, dt);
      if (Math.abs(next - want) > 0.002) moving = true;
      pl.current = next;
      pl.mat.emissiveIntensity = next;
      pl.mat.color.setScalar(pl.lit ? 1 : 0.35);
      pl.lift.target = raised === pl.seat.id ? 0.1 : 0;
      if (pl.lift.step(dt)) moving = true;
      pl.group.position.y = pl.baseY + pl.lift.value;
    }
    return moving;
  };

  const buttons = o.seatButtons;
  const placeButtons = () => {
    const els = buttons();
    let raisedPt: { x: number; y: number } | null = null;
    floorPlacards.forEach((pl, i) => {
      const el = els[i];
      pl.group.getWorldPosition(tmp);
      tmp.y += 0.05;
      tmp.project(camera);
      const x = (tmp.x * 0.5 + 0.5) * size.w;
      const y = (-tmp.y * 0.5 + 0.5) * size.h;
      if (raised === pl.seat.id) raisedPt = { x, y: y - 24 };
      if (!el) return;
      el.style.transform = `translate3d(${(x - 32).toFixed(1)}px, ${(y - 22).toFixed(1)}px, 0)`;
      if (tmp.z < 1 && Math.abs(tmp.x) < 1 && Math.abs(tmp.y) < 1) delete el.dataset.offscreen;
      else el.dataset.offscreen = "";
    });
    o.onRaised?.(raisedPt);
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
    afterRender: (s) => {
      projector.project(s);
      placeButtons();
    },
  });

  return {
    pointer: (ndc) => {
      pointer = ndc;
      engine.invalidate();
    },
    drag: (dx) => {
      dragYaw = THREE.MathUtils.clamp(dragYaw - dx * 0.0035, -0.35, 0.35);
      engine.invalidate();
    },
    raise: (id) => {
      raised = id;
      engine.invalidate();
    },
    lit: (test) => {
      for (const pl of placards) pl.lit = pl.seat.kind !== "floor" || test(pl.seat);
      engine.invalidate();
    },
    focus: (id) => {
      focus = id && ids.includes(id) ? id : null;
      engine.invalidate();
    },
    dispose: () => remove(),
  };
}
