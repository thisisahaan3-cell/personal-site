#!/usr/bin/env node
// Download a Sketchfab model by uid and optimise it into ONE GLB in public/models/.
//
//   SKETCHFAB_TOKEN=... NODE_USE_ENV_PROXY=1 node scripts/fetch-sketchfab.mjs <uid> <output-name> [--length <metres>] [--simplify 0.5] [--texture-size 2048]
// - --length rescales the model so its longest bounding-box side is that many metres (many Sketchfab models use arbitrary units).
//
// - The API token is read from the environment variable SKETCHFAB_TOKEN only. Never put it in a file.
// - NODE_USE_ENV_PROXY=1 is needed in sandboxes where outbound HTTPS goes through a proxy.
// - <output-name> is the file name without extension (written to public/models/<output-name>.glb).
// - The archive is treated as untrusted data: it is unzipped into a fresh temp folder and nothing in it is executed.
// - Prints the model's title, author, licence, faces and viewer URL so they can be recorded in
//   content/research/assets.md and src/content/credits.ts. Only CC0 and CC BY models should be used.

import { mkdtempSync, writeFileSync, readdirSync, statSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { getBounds } from "@gltf-transform/functions";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const [uid, outName] = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
const simplify = flag("simplify", null);
const textureSize = flag("texture-size", "2048");
const length = flag("length", null);

const token = process.env.SKETCHFAB_TOKEN;
if (!token) throw new Error("Set SKETCHFAB_TOKEN in the environment.");
if (!uid || !outName) throw new Error("Usage: fetch-sketchfab.mjs <uid> <output-name> [--simplify ratio] [--texture-size px]");

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const api = "https://api.sketchfab.com/v3";
const auth = { Authorization: `Token ${token}` };

const meta = await (await fetch(`${api}/models/${uid}`, { headers: auth })).json();
console.log(
  JSON.stringify(
    {
      title: meta.name,
      author: meta.user?.displayName,
      licence: meta.license?.label,
      faces: meta.faceCount,
      viewerUrl: meta.viewerUrl,
    },
    null,
    2,
  ),
);
if (!/^(CC Attribution|CC0|Public Domain)/.test(meta.license?.label ?? "")) {
  throw new Error(`Licence "${meta.license?.label}" is not CC BY or CC0: refusing to download.`);
}

const dl = await fetch(`${api}/models/${uid}/download`, { headers: auth });
if (!dl.ok) throw new Error(`download endpoint: HTTP ${dl.status}`);
const links = await dl.json();

const work = mkdtempSync(join(process.env.TMPDIR || tmpdir(), `sketchfab-${uid.slice(0, 8)}-`));
let input;
if (links.glb?.url) {
  input = join(work, "model.glb");
  // Temporary signed URL: fetch it WITHOUT the token.
  writeFileSync(input, Buffer.from(await (await fetch(links.glb.url)).arrayBuffer()));
} else if (links.gltf?.url) {
  const zip = join(work, "model.zip");
  writeFileSync(zip, Buffer.from(await (await fetch(links.gltf.url)).arrayBuffer()));
  const dir = join(work, "unzipped");
  mkdirSync(dir);
  execFileSync("unzip", ["-q", "-o", zip, "-d", dir]);
  const find = (d) =>
    readdirSync(d).flatMap((f) => {
      const p = join(d, f);
      return statSync(p).isDirectory() ? find(p) : p.endsWith(".gltf") ? [p] : [];
    });
  [input] = find(dir);
  if (!input) throw new Error("No .gltf found in the archive.");
} else {
  throw new Error("No glb or gltf download offered for this model.");
}

if (length) {
  // Wrap the scene in a scaled node so the longest side equals --length metres.
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const doc = await io.read(input);
  const scene = doc.getRoot().listScenes()[0];
  const b = getBounds(scene);
  const longest = Math.max(...b.max.map((v, i) => v - b.min[i]));
  const k = Number(length) / longest;
  const wrapper = doc.createNode("scale-to-metres").setScale([k, k, k]);
  for (const child of scene.listChildren()) {
    scene.removeChild(child);
    wrapper.addChild(child);
  }
  scene.addChild(wrapper);
  input = join(work, "scaled.glb");
  await io.write(input, doc);
  console.log(`Scaled by ${k.toFixed(5)} (longest side ${longest.toFixed(3)} -> ${length} m)`);
}

const out = join(root, "public", "models", `${outName}.glb`);
mkdirSync(dirname(out), { recursive: true });
const opt = ["@gltf-transform/cli", "optimize", input, out, "--texture-compress", "webp", "--texture-size", textureSize, "--compress", "meshopt"];
if (simplify) opt.push("--simplify", "true", "--simplify-ratio", simplify, "--simplify-error", "0.001");
execFileSync("npx", ["--yes", ...opt], { stdio: "inherit" });
console.log(`Wrote ${out} (${(statSync(out).size / 1024).toFixed(0)} kB). Inspect with: node scripts/inspect-models.mjs`);
