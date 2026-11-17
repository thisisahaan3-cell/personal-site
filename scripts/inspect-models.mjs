#!/usr/bin/env node
/**
 * Verify every GLB in public/models parses, and print triangles, meshes,
 * materials, textures, file size and bounding-box dimensions (metres).
 *   node scripts/inspect-models.mjs            -> markdown table
 */
import { readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { getBounds } from "@gltf-transform/functions";
import { MeshoptDecoder } from "meshoptimizer";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "models");
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.decoder": MeshoptDecoder });
const rows = [];
for (const f of readdirSync(dir).filter((n) => n.endsWith(".glb")).sort()) {
  try {
    const doc = await io.read(join(dir, f));
    const root = doc.getRoot();
    let tris = 0;
    for (const m of root.listMeshes()) for (const p of m.listPrimitives()) {
      const idx = p.getIndices(); const pos = p.getAttribute("POSITION");
      tris += (idx ? idx.getCount() : pos.getCount()) / 3;
    }
    const b = getBounds(root.getDefaultScene() ?? root.listScenes()[0]);
    const d = b.max.map((v, i) => v - b.min[i]);
    rows.push({ f, kb: statSync(join(dir, f)).size / 1024, meshes: root.listMeshes().length, mats: root.listMaterials().length, texs: root.listTextures().length, tris: Math.round(tris), w: d[0], h: d[1], dp: d[2], ok: "parses" });
  } catch (e) { rows.push({ f, ok: "ERROR " + e.message }); }
}
console.log("| file | status | size kB | triangles | meshes | materials | textures | W x H x D (m) |\n|---|---|---|---|---|---|---|---|");
for (const r of rows) console.log(r.ok !== "parses" ? `| ${r.f} | ${r.ok} |||||||` : `| ${r.f} | ${r.ok} | ${r.kb.toFixed(0)} | ${r.tris} | ${r.meshes} | ${r.mats} | ${r.texs} | ${r.w.toFixed(3)} x ${r.h.toFixed(3)} x ${r.dp.toFixed(3)} |`);
