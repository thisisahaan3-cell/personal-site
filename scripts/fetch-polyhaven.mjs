#!/usr/bin/env node
/**
 * Download Poly Haven (CC0) models and turn each into ONE optimised GLB.
 *
 *   NODE_USE_ENV_PROXY=1 node scripts/fetch-polyhaven.mjs marble_bust_01 bull_head
 *   NODE_USE_ENV_PROXY=1 node scripts/fetch-polyhaven.mjs --hdri studio_small_09 --as studio
 *
 * Models: downloads the 1k glTF and its textures to a temp folder, then runs
 *   gltf-transform optimize --texture-compress webp --texture-size 1024 --compress meshopt
 * and saves public/models/<kebab-name>.glb.
 *
 * Options (before the asset ids):
 *   --size=512        texture size for the output (default 1024)
 *   --simplify=0.5    mild mesh simplification ratio (off by default)
 *   --hdri <id>       download the 1k .hdr instead of a model
 *   --as <name>       output name for an HDRI (public/hdri/<name>.hdr)
 *
 * Writes/updates scripts/polyhaven-manifest.json with author, licence and file
 * facts for each asset. Node's fetch needs NODE_USE_ENV_PROXY=1 behind a proxy.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync, statSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const UA = { "User-Agent": "site-asset-fetch/1.0" };
const API = "https://api.polyhaven.com";
const manifestPath = join(root, "scripts", "polyhaven-manifest.json");

const args = process.argv.slice(2);
const opts = { size: "1024", simplify: null, hdri: false, as: null };
const ids = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a.startsWith("--size=")) opts.size = a.slice(7);
  else if (a.startsWith("--simplify=")) opts.simplify = a.slice(11);
  else if (a === "--hdri") opts.hdri = true;
  else if (a === "--as") opts.as = args[++i];
  else ids.push(a);
}
if (!ids.length) {
  console.error("Usage: node scripts/fetch-polyhaven.mjs [--size=1024] [--simplify=0.5] <asset_id> ...");
  process.exit(1);
}

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[_\s]+/g, "-").toLowerCase();
const getJson = async (url) => {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return r.json();
};
const download = async (url, dest) => {
  mkdirSync(dirname(dest), { recursive: true });
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
};
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};
const save = () => writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
const authorsOf = (info) => Object.keys(info.authors ?? {}).join(", ");
const run = (cmd, a) => {
  const r = spawnSync(cmd, a, { cwd: root, encoding: "utf8", shell: false });
  if (r.status !== 0) throw new Error(`${cmd} ${a.join(" ")}\n${r.stdout}\n${r.stderr}`);
  return r.stdout;
};

for (const id of ids) {
  try {
    const info = await getJson(`${API}/info/${id}`);
    if (opts.hdri) {
      const files = await getJson(`${API}/files/${id}`);
      const f = files.hdri["1k"].hdr;
      const name = opts.as ?? kebab(id);
      const dest = join(root, "public", "hdri", `${name}.hdr`);
      await download(f.url, dest);
      manifest[`hdri:${name}`] = {
        kind: "hdri", id, name: info.name, authors: authorsOf(info), license: "CC0",
        page: `https://polyhaven.com/a/${id}`, file: `public/hdri/${name}.hdr`,
        bytes: statSync(dest).size, retrieved: new Date().toISOString().slice(0, 10),
      };
      console.log(`hdri ${id} -> public/hdri/${name}.hdr (${(statSync(dest).size / 1024).toFixed(0)} kB)`);
      save();
      continue;
    }

    const files = await getJson(`${API}/files/${id}`);
    const g = files.gltf["1k"].gltf;
    const tmp = join(tmpdir(), "polyhaven", id);
    rmSync(tmp, { recursive: true, force: true });
    mkdirSync(tmp, { recursive: true });
    await download(g.url, join(tmp, `${id}.gltf`));
    for (const [rel, f] of Object.entries(g.include)) await download(f.url, join(tmp, rel));

    const name = kebab(id);
    const out = join(root, "public", "models", `${name}.glb`);
    mkdirSync(dirname(out), { recursive: true });
    const cli = ["@gltf-transform/cli", "optimize", join(tmp, `${id}.gltf`), out,
      "--texture-compress", "webp", "--texture-size", opts.size, "--compress", "meshopt"];
    if (opts.simplify) cli.push("--simplify", "true", "--simplify-ratio", opts.simplify);
    
    run("npx", cli);
    const bytes = statSync(out).size;
    manifest[`model:${name}`] = {
      kind: "model", id, name: info.name, authors: authorsOf(info), license: "CC0",
      page: `https://polyhaven.com/a/${id}`, file: `public/models/${name}.glb`, bytes,
      textureSize: Number(opts.size), simplify: opts.simplify, retrieved: new Date().toISOString().slice(0, 10),
    };
    save();
    console.log(`model ${id} -> public/models/${name}.glb (${(bytes / 1024).toFixed(0)} kB)`);
    rmSync(tmp, { recursive: true, force: true });
  } catch (e) {
    console.error(`FAILED ${id}: ${e.message}`);
    process.exitCode = 1;
  }
}
