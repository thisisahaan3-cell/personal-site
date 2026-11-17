/**
 * Contact, "The desk at night" (design/v2.1-addendum.md §4). A metal office desk in the dark;
 * the arm lamp clicks on (one flicker, then it warms over 400 ms) and becomes the key light,
 * with the "warm interior" HDRI at 0.25 for reflections. Every object is a link: the laptop
 * (its screen shows the email address) is Email, the clipboard is the Resume, his portrait in
 * the standing frame is LinkedIn, the postcards are Instagram. Hover lifts an object 1 cm and
 * brings a small warm light over it; the binder notebook is only set dressing.
 */
import * as THREE from "three";
import { HDRI, MODELS, SIZE_KB } from "@/lib/three/assets";
import type { Engine } from "@/components/three/engine";
import { Spring, bounds, damp, kelvin, shiftFrame } from "@/components/three/kit";

export type DeskOptions = {
  element: HTMLElement;
  /** The floating label, positioned over the hovered object. */
  label: HTMLElement;
  email: string;
  portrait: string;
  motion: boolean;
  fonts: { display: string; text: string };
};

export const DESK_IDS = ["email", "resume", "linkedin", "instagram"] as const;
export type DeskId = (typeof DESK_IDS)[number];

function materialsOf(o: THREE.Object3D) {
  const out: THREE.MeshStandardMaterial[] = [];
  o.traverse((c) => {
    const m = c as THREE.Mesh;
    if (!m.isMesh) return;
    for (const x of Array.isArray(m.material) ? m.material : [m.material]) out.push(x as THREE.MeshStandardMaterial);
  });
  return out;
}

/** Centre of the vertices drawn with the material whose name matches (world space). */
function centreOfMaterial(o: THREE.Object3D, test: RegExp) {
  const sum = new THREE.Vector3();
  let n = 0;
  const v = new THREE.Vector3();
  o.updateWorldMatrix(true, true);
  o.traverse((c) => {
    const m = c as THREE.Mesh;
    if (!m.isMesh) return;
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    const pos = m.geometry.attributes.position;
    const idx = m.geometry.index;
    const ranges =
      mats.length > 1
        ? m.geometry.groups.filter((g) => test.test(mats[g.materialIndex ?? 0].name))
        : test.test(mats[0].name)
          ? [{ start: 0, count: idx ? idx.count : pos.count }]
          : [];
    for (const r of ranges) {
      for (let i = r.start; i < r.start + r.count; i += 3) {
        v.fromBufferAttribute(pos, idx ? idx.getX(i) : i).applyMatrix4(m.matrixWorld);
        sum.add(v);
        n++;
      }
    }
  });
  return n ? sum.divideScalar(n) : null;
}

/** The size of the region drawn with a material (in the mesh's own space). */
function sizeOfMaterial(o: THREE.Object3D, test: RegExp) {
  const box = new THREE.Box3();
  const v = new THREE.Vector3();
  o.updateWorldMatrix(true, true);
  o.traverse((c) => {
    const m = c as THREE.Mesh;
    if (!m.isMesh) return;
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    const pos = m.geometry.attributes.position;
    const idx = m.geometry.index;
    const ranges = mats.length > 1 ? m.geometry.groups.filter((g) => test.test(mats[g.materialIndex ?? 0].name)) : test.test(mats[0].name) ? [{ start: 0, count: idx ? idx.count : pos.count }] : [];
    for (const r of ranges)
      for (let i = r.start; i < r.start + r.count; i++) box.expandByPoint(v.fromBufferAttribute(pos, idx ? idx.getX(i) : i).applyMatrix4(m.matrixWorld));
  });
  return box.getSize(new THREE.Vector3());
}

/** The laptop screen: the email address in the display italic, as if open in a mail client. */
function screenTexture(email: string, fonts: DeskOptions["fonts"]) {
  const w = 1024;
  const h = 640;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  const grd = g.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, "#152039");
  grd.addColorStop(1, "#0b1224");
  g.fillStyle = grd;
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#e8695c";
  g.fillRect(96, 250, 56, 4);
  g.fillStyle = "#f1eee8";
  g.font = `italic 500 70px ${fonts.display}`;
  let size = 70;
  while (g.measureText(email).width > w - 192 && size > 30) {
    size -= 2;
    g.font = `italic 500 ${size}px ${fonts.display}`;
  }
  g.fillText(email, 96, 340);
  g.fillStyle = "rgba(241,238,232,0.08)";
  for (let y = 0; y < h; y += 3) g.fillRect(0, y, w, 1);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.flipY = false; // glTF UV convention
  return t;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** The portrait, cropped to the frame's opening (cover, centred a little high for the face). */
function portraitTexture(img: HTMLImageElement, aspect: number) {
  const h = 1024;
  const w = Math.round(h * aspect);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  const s = Math.max(w / img.width, h / img.height);
  const dw = img.width * s;
  const dh = img.height * s;
  g.drawImage(img, (w - dw) / 2, Math.min(0, (h - dh) * 0.3), dw, dh);
  const t = new THREE.CanvasTexture(c);
  t.flipY = false; // glTF UV convention
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export async function buildDesk(engine: Engine, o: DeskOptions) {
  const q = engine.quality;
  const [env, desk, lamp, laptop, frame, postcards, clipboard, binder, portrait] = await Promise.all([
    engine.loadEnvironment(HDRI.warmInterior, SIZE_KB[HDRI.warmInterior]),
    engine.loadModel(MODELS.officeDesk, SIZE_KB[MODELS.officeDesk]),
    engine.loadModel(MODELS.deskLamp, SIZE_KB[MODELS.deskLamp]),
    engine.loadModel(MODELS.laptop, SIZE_KB[MODELS.laptop]),
    engine.loadModel(MODELS.standingFrame, SIZE_KB[MODELS.standingFrame]),
    engine.loadModel(MODELS.postcards, SIZE_KB[MODELS.postcards]),
    engine.loadModel(MODELS.clipboard, SIZE_KB[MODELS.clipboard]),
    engine.loadModel(MODELS.binder, SIZE_KB[MODELS.binder]),
    loadImage(o.portrait),
  ]);

  const scene = new THREE.Scene();
  scene.environment = env;
  scene.environmentIntensity = o.motion ? 0.03 : 0.25;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 20);
  const camPos = new THREE.Vector3(0.36, 1.5, 1.8);
  const camTarget = new THREE.Vector3(0.12, 0.94, -0.1);

  // ── The desk ──
  const deskB = bounds(desk);
  desk.position.x -= (deskB.min.x + deskB.max.x) / 2;
  desk.position.z -= (deskB.min.z + deskB.max.z) / 2 + 0.1;
  desk.position.y -= deskB.min.y;
  scene.add(desk);
  const TOP = deskB.max.y - deskB.min.y;

  /** Put an object on the desk top at (x, z), turned by yaw. Returns its holder (for the hover lift). */
  const place = (obj: THREE.Object3D, x: number, z: number, yaw: number) => {
    const holder = new THREE.Group();
    const inner = new THREE.Group();
    inner.add(obj);
    inner.rotation.y = yaw;
    holder.add(inner);
    scene.add(holder);
    const b = bounds(obj);
    obj.position.x -= (b.min.x + b.max.x) / 2;
    obj.position.z -= (b.min.z + b.max.z) / 2;
    obj.position.y += TOP - b.min.y + 0.0005;
    holder.position.set(x, 0, z);
    return holder;
  };

  // Postcards are a flat sheet standing up: lay them on the desk first.
  postcards.rotation.x = -Math.PI / 2;
  postcards.scale.setScalar(0.42);
  // The source laptop is modelled at about twice life size; bring it to a 34 cm machine.
  laptop.scale.multiplyScalar(0.52);
  lamp.scale.multiplyScalar(0.7);
  // The frame's glass is a dark mirror in the source; make it clear glass over the portrait.
  for (const m of materialsOf(frame))
    if (/glass/i.test(m.name)) {
      m.transparent = true;
      m.opacity = 0.12;
      m.roughness = 0.05;
      m.metalness = 0;
      m.depthWrite = false;
      m.needsUpdate = true;
    }
  binder.rotation.y = 0;

  // Laptop screen: the email address, glowing.
  const screen = screenTexture(o.email, o.fonts);
  const screenMat = new THREE.MeshStandardMaterial({
    map: screen,
    emissiveMap: screen,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: o.motion ? 0 : 0.9,
    roughness: 0.22,
    side: THREE.DoubleSide,
  });
  laptop.traverse((c) => {
    const m = c as THREE.Mesh;
    if (m.isMesh && /screen/i.test((m.material as THREE.Material).name)) m.material = screenMat;
  });
  // The portrait in the frame.
  const art = /artwork/i;
  const artSize = sizeOfMaterial(frame, art);
  const aspect = artSize.x > 0 && artSize.y > 0 ? Math.max(artSize.x, artSize.z) / artSize.y : 0.75;
  const pTex = portraitTexture(portrait, aspect);
  for (const m of materialsOf(frame))
    if (art.test(m.name)) {
      m.map = pTex;
      m.color = new THREE.Color(0xffffff);
      m.roughness = 0.6;
      m.needsUpdate = true;
    }

  const objects: Record<DeskId, THREE.Group> = {
    email: place(laptop, 0.14, -0.14, -0.22),
    resume: place(clipboard, 0.42, 0.2, -0.32),
    // The frame's picture faces +X in the source: turn it to face the camera.
    linkedin: place(frame, -0.2, -0.3, -1.3),
    instagram: place(postcards, -0.18, 0.2, 0.28),
  };
  // The lamp's head reaches toward -Z in the source: turn it to lean over the middle of the desk.
  const lampHolder = place(lamp, -0.4, -0.4, -2.5);
  place(binder, -0.66, -0.26, 0.42);
  const lifts = Object.fromEntries(DESK_IDS.map((id) => [id, new Spring(0, 90, 0.7)])) as Record<DeskId, Spring>;
  for (const id of DESK_IDS) objects[id].traverse((c) => (c.userData.deskId = id));

  scene.traverse((c) => {
    const m = c as THREE.Mesh;
    if (m.isMesh) {
      m.castShadow = q.shadows;
      m.receiveShadow = q.shadows;
    }
  });

  // ── Light ──
  const lampColour = kelvin(2700);
  scene.updateMatrixWorld(true);
  const bulb = centreOfMaterial(lampHolder, /light/i) ?? bounds(lamp).getCenter(new THREE.Vector3()).setY(TOP + 0.4);
  const bulbMats = materialsOf(lamp).filter((m) => /light/i.test(m.name));
  for (const m of bulbMats) {
    m.emissive = lampColour.clone();
    m.emissiveIntensity = 0;
  }
  const key = new THREE.SpotLight(lampColour, 0, 0, 0.62, 0.9, 2);
  key.position.copy(bulb).add(new THREE.Vector3(0, -0.02, 0));
  key.target.position.set(0.22, TOP, 0.04);
  key.castShadow = q.shadows;
  key.shadow.mapSize.set(q.shadowMapSize, q.shadowMapSize);
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.003;
  key.shadow.camera.near = 0.05;
  key.shadow.camera.far = 3;
  scene.add(key, key.target);
  const glow = new THREE.PointLight(lampColour, 0, 1.4, 2);
  glow.position.copy(bulb);
  scene.add(glow);

  const night = new THREE.HemisphereLight(0x3a4a78, 0x070b16, 0.32);
  scene.add(night);
  const moon = new THREE.DirectionalLight(0x9aa9d6, 0.5);
  moon.position.set(-1.5, 2.2, -1.8);
  scene.add(moon);
  const screenGlow = new THREE.PointLight(0x9fb4ff, 0, 0.9, 2);
  {
    const b = bounds(objects.email);
    screenGlow.position.set((b.min.x + b.max.x) / 2, TOP + 0.14, b.max.z + 0.05);
  }
  scene.add(screenGlow);

  const hoverLight = new THREE.PointLight(0xffc98a, 0, 0.6, 2);
  scene.add(hoverLight);

  // ── Choreography ──
  let hovered: DeskId | null = null;
  const hoverAmt = new Spring(0, 60, 0.8);
  let t = o.motion ? 0 : 10;
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  let size = { w: 1, h: 1 };
  const tmp = new THREE.Vector3();

  /** Lamp level over time: off, a flicker, then warming up over 400 ms. */
  const lampLevel = (s: number) => {
    if (s < 0.45) return 0;
    if (s < 0.52) return 0.75;
    if (s < 0.6) return 0.08;
    const u = Math.min(1, (s - 0.6) / 0.4);
    return 0.55 + 0.45 * (1 - Math.pow(1 - u, 3));
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
      t += dt;
      let moving = t < 1.9;
      const L = lampLevel(t);
      key.intensity = 13 * L;
      glow.intensity = 0.8 * L;
      for (const m of bulbMats) m.emissiveIntensity = 6 * L;
      scene.environmentIntensity = 0.03 + 0.22 * L;
      const S = Math.min(1, Math.max(0, (t - 0.9) / 0.5));
      screenGlow.intensity = 0.35 * S;
      screenMat.emissiveIntensity = 0.9 * S;

      pointer.sx = damp(pointer.sx, pointer.x, 0.35, dt);
      pointer.sy = damp(pointer.sy, pointer.y, 0.35, dt);
      if (Math.abs(pointer.sx - pointer.x) > 1e-3 || Math.abs(pointer.sy - pointer.y) > 1e-3) moving = true;

      for (const id of DESK_IDS) {
        lifts[id].target = hovered === id ? 0.01 : 0;
        if (lifts[id].step(dt)) moving = true;
        objects[id].position.y = lifts[id].value;
      }
      hoverAmt.target = hovered ? 1 : 0;
      if (hoverAmt.step(dt)) moving = true;
      if (hovered) {
        const b = bounds(objects[hovered]);
        b.getCenter(tmp);
        hoverLight.position.set(tmp.x, b.max.y + 0.16, tmp.z + 0.08);
      }
      hoverLight.intensity = 0.9 * hoverAmt.value;

      camera.position.copy(camPos);
      camera.position.x += pointer.sx * 0.05;
      camera.position.y += pointer.sy * 0.025;
      camera.lookAt(camTarget);
      camera.updateProjectionMatrix();
      const narrow = size.w / size.h < 1.15;
      shiftFrame(camera, narrow ? 0 : 0.24, 0.02);
      return moving;
    },
    afterRender: (s) => {
      const el = o.label;
      if (!hovered) {
        el.dataset.on = "false";
        return;
      }
      const b = bounds(objects[hovered]);
      b.getCenter(tmp);
      tmp.y = b.max.y + 0.02;
      tmp.project(camera);
      el.style.setProperty("--lx", `${((tmp.x * 0.5 + 0.5) * s.w).toFixed(1)}px`);
      el.style.setProperty("--ly", `${((-tmp.y * 0.5 + 0.5) * s.h).toFixed(1)}px`);
      el.dataset.on = "true";
    },
  });

  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  return {
    dispose: () => {
      remove();
      screen.dispose();
      screenMat.dispose();
      pTex.dispose();
    },
    hover: (id: DeskId | null) => {
      if (id === hovered) return;
      hovered = id;
      engine.invalidate();
    },
    pick: (x: number, y: number): DeskId | null => {
      ndc.set(x, y);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(
        DESK_IDS.map((id) => objects[id]),
        true,
      )[0];
      return (hit?.object.userData.deskId as DeskId | undefined) ?? null;
    },
    pointer: (x: number, y: number) => {
      pointer.x = x;
      pointer.y = y;
      engine.invalidate();
    },
  };
}
