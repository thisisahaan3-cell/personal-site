/**
 * Interests, "The turntable" (design/v2.1-addendum.md §4). A walnut turntable on a gallery
 * plinth carries four real models, one per interest: the B737-800 on a display rod, the 1967
 * Ferrari 312, the encyclopedia set with round spectacles, and the tennis racket with its ball.
 * Selecting one turns the table 90 degrees per step; the chosen object comes forward under the
 * spot (tinted 20% toward its colour) with a rim light in its colour, rises and follows the
 * pointer. The airliner banks, the car rolls forward on spinning wheels, the spectacles lift,
 * the racket stands and the ball drops and bounces. A worn bookshelf stands behind, filled with
 * the encyclopedia sets, warming up when Reading is chosen.
 *
 * Models are at true relative scale inside each station, then each station is scaled to read
 * as a collector's piece of about 45 cm (the car and airliner are display models).
 */
import * as THREE from "three";
import { HDRI, MODELS, SIZE_KB } from "@/lib/three/assets";
import type { Engine } from "@/components/three/engine";
import { Spring, bounds, damp, instanced, meshesOf, radialFade, shiftFrame } from "@/components/three/kit";

export type TurntableOptions = {
  element: HTMLElement;
  ids: string[];
  colours: Record<string, string>;
  initial: number;
};

const TOP = 0.7275; // turntable surface height
const R = 0.33; // station radius
const DISC = 0.6;
const GROUND = new THREE.Color("#0d0d10");

function rand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Walnut veneer: colour and roughness maps drawn once (straight grain with a little figure). */
function walnut() {
  const n = 1024;
  const mk = () => {
    const c = document.createElement("canvas");
    c.width = c.height = n;
    return c;
  };
  const col = mk();
  const rough = mk();
  const g = col.getContext("2d")!;
  const h = rough.getContext("2d")!;
  const r = rand(11);
  g.fillStyle = "#4a2b19";
  g.fillRect(0, 0, n, n);
  h.fillStyle = "#6a6a6a";
  h.fillRect(0, 0, n, n);
  for (let i = 0; i < 520; i++) {
    const y0 = r() * n;
    const amp = 2 + r() * 10;
    const freq = 0.002 + r() * 0.006;
    const ph = r() * 6.28;
    const dark = r() > 0.42;
    const a = 0.05 + r() * 0.16;
    g.strokeStyle = dark ? `rgba(28,14,6,${a})` : `rgba(140,90,52,${a * 0.8})`;
    h.strokeStyle = dark ? `rgba(150,150,150,${a})` : `rgba(70,70,70,${a})`;
    const w = 0.6 + r() * 2.6;
    g.lineWidth = h.lineWidth = w;
    g.beginPath();
    h.beginPath();
    for (let x = 0; x <= n; x += 8) {
      const y = y0 + Math.sin(x * freq + ph) * amp + Math.sin(x * freq * 3.1 + ph * 2) * amp * 0.3;
      if (x === 0) {
        g.moveTo(x, y);
        h.moveTo(x, y);
      } else {
        g.lineTo(x, y);
        h.lineTo(x, y);
      }
    }
    g.stroke();
    h.stroke();
  }
  // Pores.
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = `rgba(20,10,4,${0.12 + r() * 0.2})`;
    g.fillRect(r() * n, r() * n, 1 + r() * 2.5, 1);
  }
  const map = new THREE.CanvasTexture(col);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  const roughness = new THREE.CanvasTexture(rough);
  return { map, roughness };
}

/** Uniformly scale an object so its longest horizontal side is `l` metres. */
function fitLength(o: THREE.Object3D, l: number) {
  const b = bounds(o);
  const cur = Math.max(b.max.x - b.min.x, b.max.z - b.min.z);
  if (cur > 0) o.scale.multiplyScalar(l / cur);
}

/** Centre an object's footprint on its parent's origin with its base at y. */
function seat(o: THREE.Object3D, y = 0) {
  o.updateWorldMatrix(true, true);
  const parent = o.parent;
  const inv = parent ? parent.matrixWorld.clone().invert() : new THREE.Matrix4();
  const b = new THREE.Box3().setFromObject(o).applyMatrix4(inv);
  const c = b.getCenter(new THREE.Vector3());
  o.position.x -= c.x;
  o.position.z -= c.z;
  o.position.y += y - b.min.y;
}

/** Centre an object fully (x, y, z) on its parent's origin. */
function centre(o: THREE.Object3D) {
  o.updateWorldMatrix(true, true);
  const parent = o.parent;
  const inv = parent ? parent.matrixWorld.clone().invert() : new THREE.Matrix4();
  const b = new THREE.Box3().setFromObject(o).applyMatrix4(inv);
  o.position.sub(b.getCenter(new THREE.Vector3()));
  return b.getSize(new THREE.Vector3());
}

const WHEEL = /SPIN|rimblur|FERLIP|67FS|67TREAD|HUBNUT|FERHUB|FERSPOKE|BDISC/;
const BLUR = /SPIN|rimblur/;

/**
 * The car's wheel meshes each hold all four wheels. Split them by corner into four pivots set
 * at each axle centre, so the wheels can turn. Done once, before the car is scaled.
 */
function splitWheels(car: THREE.Object3D) {
  car.updateWorldMatrix(true, true);
  const inv = car.matrixWorld.clone().invert();
  type Part = { geo: THREE.BufferGeometry; mat: THREE.Material | THREE.Material[]; q: number; blur: boolean };
  const parts: Part[] = [];
  const v = new THREE.Vector3();
  const nn = new THREE.Vector3();
  for (const m of meshesOf(car)) {
    const mat = m.material as THREE.Material;
    if (!WHEEL.test(mat.name)) continue;
    const M = new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld);
    const N = new THREE.Matrix3().getNormalMatrix(M);
    const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry;
    const P = g.attributes.position;
    const Nr = g.attributes.normal;
    const U = g.attributes.uv;
    const out = [0, 1, 2, 3].map(() => ({ p: [] as number[], n: [] as number[], u: [] as number[] }));
    const tri = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
    for (let i = 0; i + 2 < P.count; i += 3) {
      v.set(0, 0, 0);
      for (let k = 0; k < 3; k++) {
        tri[k].fromBufferAttribute(P, i + k).applyMatrix4(M);
        v.add(tri[k]);
      }
      const q = (v.x > 0 ? 1 : 0) + (v.z > 0 ? 2 : 0);
      const o = out[q];
      for (let k = 0; k < 3; k++) {
        o.p.push(tri[k].x, tri[k].y, tri[k].z);
        if (Nr) {
          nn.fromBufferAttribute(Nr, i + k).applyMatrix3(N).normalize();
          o.n.push(nn.x, nn.y, nn.z);
        }
        if (U) o.u.push(U.getX(i + k), U.getY(i + k));
      }
    }
    out.forEach((o, q) => {
      if (!o.p.length) return;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(o.p, 3));
      if (o.n.length) geo.setAttribute("normal", new THREE.Float32BufferAttribute(o.n, 3));
      if (o.u.length) geo.setAttribute("uv", new THREE.Float32BufferAttribute(o.u, 2));
      parts.push({ geo, mat: m.material, q, blur: BLUR.test(mat.name) });
    });
    if (g !== m.geometry) g.dispose();
    m.removeFromParent();
  }
  const wheels: { pivot: THREE.Group; radius: number; blur: THREE.Mesh[] }[] = [];
  for (let q = 0; q < 4; q++) {
    const mine = parts.filter((p) => p.q === q);
    if (!mine.length) continue;
    const box = new THREE.Box3();
    mine.forEach((p) => {
      p.geo.computeBoundingBox();
      box.union(p.geo.boundingBox!);
    });
    const c = box.getCenter(new THREE.Vector3());
    const pivot = new THREE.Group();
    pivot.position.copy(c);
    const blur: THREE.Mesh[] = [];
    for (const p of mine) {
      p.geo.translate(-c.x, -c.y, -c.z);
      const mesh = new THREE.Mesh(p.geo, p.mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (p.blur) {
        mesh.visible = false;
        blur.push(mesh);
      }
      pivot.add(mesh);
    }
    car.add(pivot);
    wheels.push({ pivot, radius: (box.max.y - box.min.y) / 2, blur });
  }
  return wheels;
}

type Station = {
  root: THREE.Group; // on the disc, faces outward (+Z)
  holder: THREE.Group; // comes forward, rises, scales
  spin: THREE.Group; // follows the pointer
  focus: Spring;
  base: number; // resting yaw
};

export async function buildTurntable(engine: Engine, o: TurntableOptions) {
  const q = engine.quality;
  const [env, airliner, car, books, specs, racket, ball, shelf] = await Promise.all([
    engine.loadEnvironment(HDRI.studio, SIZE_KB[HDRI.studio]),
    engine.loadModel(MODELS.airliner, SIZE_KB[MODELS.airliner]),
    engine.loadModel(MODELS.formulaCar, SIZE_KB[MODELS.formulaCar]),
    engine.loadModel(MODELS.encyclopedia, SIZE_KB[MODELS.encyclopedia]),
    engine.loadModel(MODELS.spectacles, SIZE_KB[MODELS.spectacles]),
    engine.loadModel(MODELS.tennisRacket, SIZE_KB[MODELS.tennisRacket]),
    engine.loadModel(MODELS.tennisBall, SIZE_KB[MODELS.tennisBall]),
    engine.loadModel(MODELS.bookshelf, SIZE_KB[MODELS.bookshelf]),
  ]);

  const scene = new THREE.Scene();
  scene.environment = env;
  scene.environmentIntensity = 0.42;
  const bg = GROUND.clone();
  scene.background = bg;
  scene.fog = new THREE.Fog(bg, 2.6, 5.4);

  const camera = new THREE.PerspectiveCamera(28, 1, 0.05, 30);
  const camPos = new THREE.Vector3(0, 1.55, 2.55);
  const camTarget = new THREE.Vector3(0, 0.86, 0.2);

  // ── Room: floor, plinth, turntable ──
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 4).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x18171b, roughness: 0.62, metalness: 0, alphaMap: radialFade(), transparent: true }),
  );
  floor.receiveShadow = true;
  floor.position.z = -0.4;
  scene.add(floor);

  const plinth = new THREE.Mesh(
    new THREE.LatheGeometry(
      [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.5, 0),
        new THREE.Vector2(0.5, 0.012),
        new THREE.Vector2(0.48, 0.02),
        new THREE.Vector2(0.48, 0.69),
        new THREE.Vector2(0.5, 0.698),
        new THREE.Vector2(0.5, 0.705),
        new THREE.Vector2(0, 0.705),
      ],
      96,
    ),
    new THREE.MeshPhysicalMaterial({ color: 0x141317, roughness: 0.38, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.35 }),
  );
  plinth.castShadow = plinth.receiveShadow = true;
  scene.add(plinth);

  const wood = walnut();
  const disc = new THREE.Group();
  disc.position.y = TOP;
  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(DISC, DISC - 0.004, 0.045, 160),
    new THREE.MeshPhysicalMaterial({
      map: wood.map,
      roughnessMap: wood.roughness,
      roughness: 0.55,
      clearcoat: 0.6,
      clearcoatRoughness: 0.22,
    }),
  );
  top.position.y = -0.0225;
  top.castShadow = top.receiveShadow = true;
  const brass = new THREE.MeshStandardMaterial({ color: 0xc89a4a, metalness: 1, roughness: 0.28 });
  const inlay = new THREE.Mesh(new THREE.TorusGeometry(DISC - 0.035, 0.0022, 8, 200).rotateX(Math.PI / 2), brass);
  inlay.position.y = 0.0002;
  inlay.scale.y = 0.25;
  disc.add(top, inlay);
  scene.add(disc);

  // ── Stations ──
  const N = o.ids.length;
  const stations: Station[] = o.ids.map((id, i) => {
    const a = (i / N) * Math.PI * 2;
    const root = new THREE.Group();
    root.position.set(Math.sin(a) * R, 0, Math.cos(a) * R);
    root.rotation.y = a;
    const holder = new THREE.Group();
    const spin = new THREE.Group();
    holder.add(spin);
    root.add(holder);
    disc.add(root);
    root.traverse((c) => (c.userData.station = i));
    return { root, holder, spin, focus: new Spring(i === o.initial ? 1 : 0, 36, 0.8), base: 0 };
  });
  const st = (id: string) => stations[o.ids.indexOf(id)];

  // Aviation: the airliner on a brass display rod.
  const plane = new THREE.Group();
  fitLength(airliner, 0.42);
  plane.add(airliner);
  centre(airliner);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.0032, 0.0032, 1, 16), brass);
  rod.geometry.translate(0, 0.5, 0);
  const rodBase = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.012, 48), new THREE.MeshPhysicalMaterial({ color: 0x0f0f12, roughness: 0.3, clearcoat: 0.8 }));
  rodBase.position.y = 0.006;
  const av = st("aviation");
  av.base = -0.7;
  av.spin.add(plane, rod, rodBase);

  // Formula 1: the car, wheels on pivots.
  const wheels = splitWheels(car);
  const carRoll = new THREE.Group();
  const carYaw = new THREE.Group();
  fitLength(car, 0.36);
  carRoll.add(car);
  carYaw.add(carRoll);
  const f1 = st("formula1");
  f1.base = 0.62;
  f1.spin.add(carYaw);
  seat(car, 0);
  const wheelScale = car.scale.x;

  // Reading: the encyclopedia set and the round spectacles.
  const read = st("reading");
  read.base = 0;
  const readGroup = new THREE.Group();
  books.scale.multiplyScalar(0.66);
  specs.scale.multiplyScalar(0.72);
  readGroup.add(books);
  seat(books, 0);
  books.position.z -= 0.04;
  const specHolder = new THREE.Group();
  specHolder.add(specs);
  seat(specs, 0);
  specHolder.position.set(0.03, 0, 0.1);
  specHolder.rotation.y = -0.25;
  readGroup.add(specHolder);
  const bookTop = (() => {
    const b = bounds(books);
    return (b.max.y - b.min.y) / Math.max(1e-6, books.parent!.getWorldScale(new THREE.Vector3()).y) + 0.002;
  })();
  read.spin.add(readGroup);

  // Tennis: the racket lies flat, then stands facing the camera; the ball bounces at its foot.
  const ten = st("tennis");
  ten.base = 0.35;
  racket.scale.multiplyScalar(0.62);
  ball.scale.multiplyScalar(0.62);
  const racketTilt = new THREE.Group(); // rotates about Z to raise the head
  const racketFace = new THREE.Group(); // rotates about X so the face turns to the camera
  racketFace.add(racket);
  racketTilt.add(racketFace);
  const rSize = centre(racket);
  const ballHolder = new THREE.Group();
  ballHolder.add(ball);
  const bSize = centre(ball);
  const ballR = bSize.y / 2;
  ballHolder.position.set(0.15, ballR, 0.08);
  ten.spin.add(racketTilt, ballHolder);

  // Shadow casting on the station models.
  for (const s of stations)
    s.root.traverse((c) => {
      const m = c as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = q.shadows;
        m.receiveShadow = q.shadows;
      }
    });

  // ── The bookshelf behind, holding encyclopedia sets ──
  const shelfGroup = new THREE.Group();
  shelfGroup.add(shelf);
  seat(shelf, 0);
  shelfGroup.position.set(0.35, 0, -2.0);
  scene.add(shelfGroup);
  scene.updateMatrixWorld(true);
  {
    const sb = bounds(shelf);
    const ray = new THREE.Raycaster();
    const tops: number[] = [];
    const nrm = new THREE.Vector3();
    ray.set(new THREE.Vector3(shelfGroup.position.x - 0.25, sb.max.y + 0.5, (sb.min.z + sb.max.z) / 2), new THREE.Vector3(0, -1, 0));
    for (const h of ray.intersectObject(shelf, true)) {
      if (!h.face) continue;
      nrm.copy(h.face.normal).transformDirection(h.object.matrixWorld);
      if (nrm.y > 0.7 && (tops.length === 0 || tops[tops.length - 1] - h.point.y > 0.05)) tops.push(h.point.y);
    }
    // Rows that have room for a standing book (or the top of the case).
    const rows = tops.filter((y, i) => i === 0 || tops[i - 1] - y > 0.27).filter((y) => y > 0.8 && y < 1.75);
    const proto = books.clone();
    proto.scale.setScalar(1);
    proto.position.set(0, 0, 0);
    proto.rotation.set(0, 0, 0);
    const bw = bounds(proto);
    const bookW = bw.max.x - bw.min.x;
    const placements: { x: number; y: number; z: number; yaw: number }[] = [];
    const innerW = sb.max.x - sb.min.x - 0.12;
    const per = Math.max(1, Math.floor(innerW / bookW));
    rows.forEach((y, ri) => {
      for (let k = 0; k < per; k++) {
        if ((ri + k) % 5 === 3) continue; // a gap here and there, as on a shelf in use
        const x = sb.min.x + 0.06 + bookW * (k + 0.5) + (innerW - per * bookW) / 2;
        placements.push({ x, y: y + 0.001, z: (sb.min.z + sb.max.z) / 2 + 0.02, yaw: 0 });
      }
    });
    if (placements.length) {
      const set = instanced(proto, placements);
      set.traverse((c) => {
        const m = c as THREE.Mesh;
        if (m.isMesh) {
          m.castShadow = false;
          m.receiveShadow = q.shadows;
        }
      });
      scene.add(set);
    }
  }

  // ── Light ──
  const warm = new THREE.Color("#fff1dc");
  const key = new THREE.SpotLight(warm, 26, 0, 0.34, 0.65, 1.6);
  key.position.set(0.55, 2.9, 1.55);
  key.target.position.set(0, TOP + 0.12, R + 0.1);
  key.castShadow = q.shadows;
  key.shadow.mapSize.set(q.shadowMapSize, q.shadowMapSize);
  key.shadow.bias = -0.0002;
  key.shadow.normalBias = 0.003;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 5;
  scene.add(key, key.target);

  const rim = new THREE.SpotLight(0xffffff, 18, 0, 0.5, 0.7, 1.4);
  rim.position.set(-1.1, 1.9, -0.9);
  rim.target.position.set(0, TOP + 0.15, R);
  scene.add(rim, rim.target);

  const fill = new THREE.HemisphereLight(0xbfc4d6, 0x0d0d10, 0.28);
  scene.add(fill);

  const shelfLight = new THREE.SpotLight(new THREE.Color("#e6a06a"), 4, 0, 0.55, 0.8, 1.2);
  shelfLight.position.set(1.4, 2.6, -0.2);
  shelfLight.target.position.set(0.35, 1.2, -2.0);
  scene.add(shelfLight, shelfLight.target);

  // ── Choreography ──
  let sel = o.initial;
  const turn = new Spring(-sel * (Math.PI * 2) / N, 26, 0.82);
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  const colour = new THREE.Color();
  const keyCol = warm.clone();
  const rimCol = new THREE.Color(o.colours[o.ids[sel]]);
  const bgTarget = new THREE.Color();
  const ga = { r: 0, g: 0, b: 0 };
  const ca = { r: 0, g: 0, b: 0 };
  let shelfOn = o.ids[sel] === "reading" ? 1 : 0;
  // Per-interest motion state.
  let roll = 0; // car travel along its nose (m, before station scale)
  let lastRoll = 0;
  let wheelAngle = 0;
  const ballSim = { y: ballR, vy: 0, spin: 0 };
  const dropBall = () => {
    ballSim.y = ballR + 0.34;
    ballSim.vy = 0;
  };
  if (o.ids[sel] === "tennis") dropBall();
  let size = { w: 1, h: 1 };
  let selT = 0; // seconds since the last selection or pointer move (real time, so slow devices still come to rest)
  let lastInput = performance.now() / 1000;
  let tAnim = 0; // the idle motions' clock: it slows to a stop 6s after the last interaction (render on demand)

  const remove = engine.addView({
    element: o.element,
    scene,
    camera,
    resize: (s) => {
      size = s;
      camera.aspect = s.w / s.h;
    },
    // A colour background clears this view's box only, but leaves the renderer's clear colour
    // opaque: put it back, so the rest of the page canvas stays transparent.
    afterRender: () => engine.renderer.setClearColor(0x000000, 0),
    update: (dt) => {
      const nowS = performance.now() / 1000;
      selT = nowS - lastInput;
      const alive = 1 - Math.min(1, Math.max(0, (selT - 5) / 2));
      tAnim += dt * alive;
      const time = tAnim;
      pointer.sx = damp(pointer.sx, pointer.x, 0.3, dt);
      pointer.sy = damp(pointer.sy, pointer.y, 0.3, dt);
      let moving = turn.step(dt);
      disc.rotation.y = turn.value;

      // Colour: the spot tints 20% toward the object, the rim takes its colour, the ground 6%.
      colour.set(o.colours[o.ids[sel]]);
      const k = 1 - Math.exp(-dt / 0.35);
      keyCol.lerp(warm.clone().lerp(colour, 0.2), k);
      rimCol.lerp(colour, k);
      key.color.copy(keyCol);
      rim.color.copy(rimCol);
      // Mix in sRGB (as the eye sees the page ground), not in linear light.
      GROUND.getRGB(ga, THREE.SRGBColorSpace);
      colour.getRGB(ca, THREE.SRGBColorSpace);
      bgTarget.setRGB(ga.r + (ca.r - ga.r) * 0.06, ga.g + (ca.g - ga.g) * 0.06, ga.b + (ca.b - ga.b) * 0.06, THREE.SRGBColorSpace);
      bg.lerp(bgTarget, k);
      (scene.fog as THREE.Fog).color.copy(bg);
      shelfOn = damp(shelfOn, o.ids[sel] === "reading" ? 1 : 0, 0.4, dt);
      // The back light takes the object's colour too, so each interest washes the room.
      shelfLight.color.copy(rimCol);
      shelfLight.intensity = 7 + 11 * shelfOn;

      stations.forEach((s, i) => {
        s.focus.target = i === sel ? 1 : 0;
        if (s.focus.step(dt)) moving = true;
        const f = s.focus.value;
        s.holder.position.z = 0.16 * f;
        s.holder.scale.setScalar(1 + 0.4 * f);
        const px = i === sel ? pointer.sx : 0;
        const py = i === sel ? pointer.sy : 0;
        s.spin.rotation.y = s.base + px * 0.75;
        s.spin.rotation.x = -py * 0.12 * f;
      });

      // Aviation: rises on its rod and banks.
      {
        const f = av.focus.value;
        const h = 0.17 + 0.13 * f;
        plane.position.y = h;
        rod.scale.y = Math.max(0.01, h - 0.02);
        plane.rotation.z = f * (Math.sin(time * 0.7) * 0.16 + 0.1);
        plane.rotation.x = f * Math.sin(time * 0.45) * 0.05;
        plane.rotation.y = f * Math.sin(time * 0.3) * 0.12;
      }
      // Formula 1: rolls forward when chosen, back when left; the wheels turn with the travel.
      {
        const f = f1.focus.value;
        roll = -0.07 + 0.14 * f;
        carRoll.position.z = roll;
        const d = (roll - lastRoll) / Math.max(1e-6, carYaw.scale.x);
        lastRoll = roll;
        if (wheels.length) wheelAngle += d / Math.max(1e-6, wheels[0].radius * wheelScale);
        for (const w of wheels) w.pivot.rotation.x = wheelAngle;
      }
      // Reading: the spectacles lift and turn to the camera.
      {
        const f = read.focus.value;
        // They lift off the turntable and settle folded open on top of the books.
        specHolder.position.set(0.03 - 0.05 * f, bookTop * f + Math.sin(time * 0.9) * 0.004 * f, 0.1 - 0.13 * f);
        specHolder.rotation.x = -0.08 * f;
        specHolder.rotation.y = -0.25 - 0.25 * f;
      }
      // Tennis: the racket stands, the ball bounces with damping.
      {
        const f = ten.focus.value;
        racketFace.rotation.x = (Math.PI / 2) * f;
        racketTilt.rotation.z = 1.32 * f;
        racketTilt.position.set(-0.03 * f, rSize.y / 2 + (rSize.x / 2 + 0.03) * f * 0.92, -0.02);
        if (ballSim.y > ballR || ballSim.vy !== 0) {
          ballSim.vy -= 4.2 * dt;
          ballSim.y += ballSim.vy * dt;
          if (ballSim.y < ballR) {
            ballSim.y = ballR;
            ballSim.vy = -ballSim.vy * 0.64;
            if (ballSim.vy < 0.09) ballSim.vy = 0;
          }
          ballSim.spin += dt * 3;
          moving = true;
        }
        ballHolder.position.y = ballSim.y;
        ball.rotation.x = ballSim.spin;
      }

      camera.position.copy(camPos);
      camera.position.x += pointer.sx * 0.06;
      camera.position.y += pointer.sy * 0.03;
      camera.lookAt(camTarget);
      camera.updateProjectionMatrix();
      const narrow = size.w / size.h < 1.15;
      shiftFrame(camera, narrow ? 0 : 0.17, narrow ? 0.1 : -0.03);
      return moving || alive > 0 || Math.abs(pointer.sx - pointer.x) > 1e-3 || Math.abs(pointer.sy - pointer.y) > 1e-3;
    },
  });

  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const pick = (x: number, y: number) => {
    ndc.set(x, y);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(
      stations.map((s) => s.root),
      true,
    )[0];
    return hit ? ((hit.object.userData.station as number | undefined) ?? -1) : -1;
  };
  // userData.station was set before the models were added; tag them now.
  stations.forEach((s, i) => s.root.traverse((c) => (c.userData.station = i)));

  return {
    dispose: () => {
      remove();
      wood.map.dispose();
      wood.roughness.dispose();
    },
    select: (i: number) => {
      if (i === sel) {
        if (o.ids[i] === "tennis") dropBall();
        lastInput = performance.now() / 1000;
        engine.invalidate();
        return;
      }
      let d = (((i - sel) % N) + N) % N;
      if (d > N / 2) d -= N;
      sel = i;
      turn.target -= d * ((Math.PI * 2) / N);
      if (o.ids[i] === "tennis") dropBall();
      lastInput = performance.now() / 1000;
      engine.invalidate();
    },
    pointer: (x: number, y: number) => {
      pointer.x = x;
      pointer.y = y;
      lastInput = Math.max(lastInput, performance.now() / 1000 - 4);
      engine.invalidate();
    },
    pick,
  };
}
