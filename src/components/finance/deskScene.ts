/**
 * Finance, Artha on the desk (design/v2.1-addendum.md §4): the classic laptop on the wooden
 * table, lit by the arm lamp, with his Artha screenshot as the glowing screen. The
 * laptop's lid is not a separate node in this model, so scroll dollies the camera in from the
 * desk to the screen instead of opening the lid. The "Open Artha" hotspot is a real link.
 *
 * Models: MODELS.laptop, MODELS.sideTable, MODELS.deskLamp (src/lib/three/assets.ts).
 * The screen texture is /images/artha-home.webp (his own screenshot).
 */
import * as THREE from "three";
import { HDRI, MODELS, SIZE_KB } from "@/lib/three/assets";
import type { Engine } from "@/components/three/engine";
import { bakeContactShadow, bounds, CameraRig, clamp01, extremeVertex, HotspotProjector, kelvin, meshesOf, placeOnFloor, radialFade, shiftFrame, type Key } from "@/components/three/kit";

export type DeskOptions = {
  element: HTMLElement;
  section: HTMLElement;
  hotspots: () => (HTMLElement | null)[];
  motion: boolean;
  screenshot: string;
};

/** A real classic laptop is about 0.33 m wide; the model is drawn larger. */
const LAPTOP_WIDTH = 0.36;

function loadTexture(url: string) {
  return new Promise<THREE.Texture>((resolve, reject) => new THREE.TextureLoader().load(url, resolve, undefined, reject));
}

export async function buildDesk(engine: Engine, o: DeskOptions) {
  const q = engine.quality;
  const [table, laptop, lamp, env, shot] = await Promise.all([
    engine.loadModel(MODELS.sideTable, SIZE_KB[MODELS.sideTable]),
    engine.loadModel(MODELS.laptop, SIZE_KB[MODELS.laptop]),
    engine.loadModel(MODELS.deskLamp, SIZE_KB[MODELS.deskLamp]),
    engine.loadEnvironment(HDRI.hall),
    loadTexture(o.screenshot),
  ]);

  const scene = new THREE.Scene();
  scene.environment = env;
  scene.environmentIntensity = 0.35;
  const camera = new THREE.PerspectiveCamera(32, 1, 0.02, 40);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(2.6, 64).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x06140e, roughness: 0.9, transparent: true, alphaMap: radialFade(), depthWrite: false }),
  );
  floor.receiveShadow = true;
  scene.add(floor);

  // The small wooden table, scaled up to a writing table (about 0.7 m square, 0.75 m high).
  const tb = bounds(table);
  table.scale.set(0.7 / (tb.max.x - tb.min.x), 0.75 / (tb.max.y - tb.min.y), 0.7 / (tb.max.z - tb.min.z));
  placeOnFloor(table, 0, 0, 0);
  scene.add(table);
  const tbb = bounds(table);
  const top = tbb.max.y;

  // The laptop, scaled to real size, turned a little toward the viewer at the table's front.
  const lb = bounds(laptop);
  laptop.scale.multiplyScalar(LAPTOP_WIDTH / (lb.max.x - lb.min.x));
  laptop.rotation.y = -0.32;
  placeOnFloor(laptop, 0.04, top, 0.08);
  scene.add(laptop);

  // The screen: his Artha screenshot, cropped to the screen's shape, self-lit (not tone mapped).
  let screen: THREE.Mesh | null = null;
  for (const m of meshesOf(laptop)) {
    const mat = m.material as THREE.Material;
    if (/screen/i.test(mat.name)) screen = m;
  }
  const screenAnchor = new THREE.Object3D();
  if (screen) {
    const g = screen.geometry;
    g.computeBoundingBox();
    const bb = g.boundingBox!;
    const w = bb.max.x - bb.min.x;
    const h = bb.max.y - bb.min.y;
    const imgAspect = (shot.image as HTMLImageElement).width / (shot.image as HTMLImageElement).height;
    const crop = Math.min(1, w / h / imgAspect); // fraction of the image width shown
    const pos = g.attributes.position;
    const uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      const u = (pos.getX(i) - bb.min.x) / w;
      const v = (pos.getY(i) - bb.min.y) / h;
      uv[i * 2] = 0.5 + (u - 0.5) * crop;
      uv[i * 2 + 1] = v;
    }
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    shot.colorSpace = THREE.SRGBColorSpace;
    shot.anisotropy = engine.renderer.capabilities.getMaxAnisotropy();
    screen.material = new THREE.MeshBasicMaterial({ map: shot, toneMapped: false, color: new THREE.Color(0.92, 0.92, 0.92) });
    screen.castShadow = false;
    screenAnchor.position.set(bb.max.x, bb.max.y, bb.max.z + 0.002);
    screen.add(screenAnchor);
  } else {
    laptop.add(screenAnchor);
  }

  // The arm lamp clamped to the table's back-right edge, its arm turned so the head is over the laptop.
  placeOnFloor(lamp, 0, 0, 0);
  const headL = extremeVertex(lamp, new THREE.Vector3(0, 1, 0));
  const clampL = extremeVertex(lamp, new THREE.Vector3(0, -1, 0));
  // Back-left of the table, so the whole lamp stays in frame beside the copy.
  const clampAt = new THREE.Vector2(tbb.min.x + 0.14, tbb.min.z + 0.12);
  const lapAt = bounds(laptop).getCenter(new THREE.Vector3());
  const have = Math.atan2(headL.x - clampL.x, headL.z - clampL.z);
  const want = Math.atan2(lapAt.x - clampAt.x, lapAt.z - clampAt.y);
  lamp.rotation.y = want - have;
  lamp.updateMatrixWorld(true);
  const clampW = extremeVertex(lamp, new THREE.Vector3(0, -1, 0));
  lamp.position.x += clampAt.x - clampW.x;
  lamp.position.z += clampAt.y - clampW.z;
  lamp.position.y += top - 0.06 - clampW.y;
  scene.add(lamp);
  for (const m of meshesOf(lamp)) {
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    for (const mat of mats as THREE.MeshStandardMaterial[]) {
      if (/light/i.test(mat.name)) {
        mat.emissive = kelvin(2700);
        mat.emissiveIntensity = 6;
      }
    }
  }
  scene.add(
    bakeContactShadow(engine.renderer, [laptop], { width: 0.7, depth: 0.7, x: 0, y: top, z: 0, height: 0.2, darkness: 2, opacity: 0.85, blur: 1.4 }),
  );
  scene.add(bakeContactShadow(engine.renderer, [table], { width: 1.6, depth: 1.6, y: 0, height: 0.8, darkness: 1.1, opacity: 0.8, blur: 3 }));

  // Lights: the lamp is the key (2700K, soft shadows); the screen spills a little cool light.
  const lb2 = bounds(lamp);
  const lampHead = new THREE.Vector3((lb2.min.x + lb2.max.x) / 2, lb2.max.y - 0.08, (lb2.min.z + lb2.max.z) / 2);
  const key = new THREE.SpotLight(kelvin(2700), 9, 0, 0.75, 0.9, 2);
  key.position.copy(lampHead);
  const lap = bounds(laptop).getCenter(new THREE.Vector3());
  key.target.position.set(lap.x - 0.05, top, lap.z + 0.05);
  key.castShadow = q.shadows;
  key.shadow.mapSize.set(q.shadowMapSize, q.shadowMapSize);
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.01;
  scene.add(key, key.target);
  const spill = new THREE.PointLight(0x9fc4ff, 0.5, 1.2, 2);
  spill.position.set(lap.x + 0.05, top + 0.18, lap.z + 0.25);
  scene.add(spill);
  // Green rim from low behind: an edge on the laptop and lamp, never a wash over the table top.
  const rim = new THREE.SpotLight(0x3fd08f, 10, 0, 0.45, 0.8, 2);
  rim.position.set(-1.4, top + 0.25, -1.9);
  rim.target.position.copy(lap);
  scene.add(rim, rim.target);

  // Camera: from the desk to the screen.
  const sc = new THREE.Vector3();
  (screen ?? laptop).getWorldPosition(sc);
  if (screen) bounds(screen).getCenter(sc);
  const facing = new THREE.Vector3(Math.sin(-0.32), 0, Math.cos(-0.32));
  const keys: Key[] = [
    { at: 0, shot: { pos: [lap.x + 1.05, top + 0.62, lap.z + 1.45], target: [lap.x - 0.12, top - 0.05, lap.z - 0.05], fov: 34 } },
    { at: 0.5, shot: { pos: sc.clone().addScaledVector(facing, 1.05).add(new THREE.Vector3(0.25, 0.25, 0)).toArray(), target: [sc.x - 0.02, sc.y - 0.04, sc.z], fov: 32 } },
    { at: 1, shot: { pos: sc.clone().addScaledVector(facing, 0.64).add(new THREE.Vector3(0.03, 0.04, 0)).toArray(), target: sc.toArray(), fov: 30 } },
  ];
  const rig = new CameraRig(camera, keys, 0.2);
  const projector = new HotspotProjector(camera, [screenAnchor], o.hotspots);
  const still = !o.motion;
  let size = { w: 1, h: 1 };

  const progress = () => {
    if (still) return 0.8;
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
    update: (dt) => {
      const moving = rig.update(progress(), dt, still);
      const phone = size.w < 760;
      shiftFrame(camera, phone ? 0 : 0.2, phone ? 0.14 : 0);
      return moving;
    },
    afterRender: (s) => projector.project(s),
  });

  return { dispose: () => remove() };
}
