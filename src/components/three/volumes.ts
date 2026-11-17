/**
 * Split a model made of several separate objects in one mesh (the encyclopedia set is one mesh
 * holding twenty volumes) into one movable group per object, so a scene can lift a single
 * volume out of the set. Objects are found as connected pieces of the first mesh (vertices
 * welded by position), ordered along `axis`; every mesh of the model is then cut by which
 * piece each triangle's centre falls in. Attributes are shared, only the indices are new.
 */
import * as THREE from "three";

type Range = { min: number; max: number };

function pieces(geo: THREE.BufferGeometry, axis: "x" | "y" | "z"): Range[] {
  const pos = geo.attributes.position;
  const n = pos.count;
  const parent = new Int32Array(n);
  for (let i = 0; i < n; i++) parent[i] = i;
  const find = (a: number) => {
    while (parent[a] !== a) {
      parent[a] = parent[parent[a]];
      a = parent[a];
    }
    return a;
  };
  const join = (a: number, b: number) => {
    a = find(a);
    b = find(b);
    if (a !== b) parent[a] = b;
  };
  const seen = new Map<string, number>();
  for (let i = 0; i < n; i++) {
    const k = `${pos.getX(i).toFixed(4)},${pos.getY(i).toFixed(4)},${pos.getZ(i).toFixed(4)}`;
    const j = seen.get(k);
    if (j === undefined) seen.set(k, i);
    else join(i, j);
  }
  const idx = geo.index!;
  for (let t = 0; t < idx.count; t += 3) {
    join(idx.getX(t), idx.getX(t + 1));
    join(idx.getX(t), idx.getX(t + 2));
  }
  const get = axis === "x" ? (i: number) => pos.getX(i) : axis === "y" ? (i: number) => pos.getY(i) : (i: number) => pos.getZ(i);
  const ranges = new Map<number, Range>();
  for (let i = 0; i < n; i++) {
    const r = find(i);
    const v = get(i);
    const cur = ranges.get(r);
    if (!cur) ranges.set(r, { min: v, max: v });
    else {
      cur.min = Math.min(cur.min, v);
      cur.max = Math.max(cur.max, v);
    }
  }
  return [...ranges.values()].sort((a, b) => a.min - b.min);
}

/**
 * Returns a group holding one child group per piece (in order along `axis`). Each child's
 * origin is the bottom centre of its piece, so `position.y += h` lifts it and rotations turn it
 * about its own foot. The source model is left untouched.
 */
export function splitPieces(model: THREE.Object3D, axis: "x" | "y" | "z" = "x") {
  model.updateWorldMatrix(true, true);
  const toModel = new THREE.Matrix4().copy(model.matrixWorld).invert();
  const meshes: THREE.Mesh[] = [];
  model.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh);
  });
  if (!meshes.length || !meshes[0].geometry.index) throw new Error("splitPieces: an indexed mesh is needed");
  const ranges = pieces(meshes[0].geometry, axis);
  const which = (v: number) => {
    let best = 0;
    let bestD = Infinity;
    ranges.forEach((r, i) => {
      const d = v < r.min ? r.min - v : v > r.max ? v - r.max : 0;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  };

  const out = new THREE.Group();
  const parts: { mesh: THREE.Mesh; rel: THREE.Matrix4; tris: number[][] }[] = meshes.map((m) => ({
    mesh: m,
    rel: new THREE.Matrix4().multiplyMatrices(toModel, m.matrixWorld),
    tris: ranges.map(() => []),
  }));
  for (const p of parts) {
    const g = p.mesh.geometry;
    const pos = g.attributes.position;
    const idx = g.index!;
    const get = axis === "x" ? (i: number) => pos.getX(i) : axis === "y" ? (i: number) => pos.getY(i) : (i: number) => pos.getZ(i);
    for (let t = 0; t < idx.count; t += 3) {
      const a = idx.getX(t);
      const b = idx.getX(t + 1);
      const c = idx.getX(t + 2);
      p.tris[which((get(a) + get(b) + get(c)) / 3)].push(a, b, c);
    }
  }

  const v = new THREE.Vector3();
  ranges.forEach((_, k) => {
    const box = new THREE.Box3();
    for (const p of parts) {
      const pos = p.mesh.geometry.attributes.position;
      for (const i of p.tris[k]) box.expandByPoint(v.fromBufferAttribute(pos, i).applyMatrix4(p.rel));
    }
    const pivot = new THREE.Group();
    pivot.position.set((box.min.x + box.max.x) / 2, box.min.y, (box.min.z + box.max.z) / 2);
    pivot.userData.size = box.getSize(new THREE.Vector3());
    const inv = new THREE.Matrix4().makeTranslation(-pivot.position.x, -pivot.position.y, -pivot.position.z);
    for (const p of parts) {
      if (!p.tris[k].length) continue;
      const src = p.mesh.geometry;
      const g = new THREE.BufferGeometry();
      for (const name of Object.keys(src.attributes)) g.setAttribute(name, src.attributes[name]);
      g.setIndex(p.tris[k]);
      g.boundingBox = null;
      const m = new THREE.Mesh(g, p.mesh.material);
      m.castShadow = true;
      m.receiveShadow = true;
      m.matrixAutoUpdate = false;
      m.matrix.multiplyMatrices(inv, p.rel);
      pivot.add(m);
    }
    out.add(pivot);
  });
  return out;
}
