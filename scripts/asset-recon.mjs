// Reconnaissance for realistic 3D assets: lists Poly Haven (CC0) models and HDRIs that
// match the subjects the site needs, and checks whether Sketchfab's API is reachable.
// Usage: node scripts/asset-recon.mjs
const UA = { "User-Agent": "portfolio-site-builder/1.0" };
const want = /table|desk|chair|lectern|podium|microphone|book|shelf|globe|gavel|scale|plane|aircraft|jet|car|tennis|racket|ball|trophy|medal|computer|monitor|keyboard|laptop|camera|clock|lamp|flag|column|bench|stool|sofa|typewriter|telephone|radio|chess|vase|statue|bust|cabinet|drawer|frame|plant/i;

async function json(url) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(url + " -> HTTP " + res.status);
  return res.json();
}

try {
  const models = await json("https://api.polyhaven.com/assets?t=models");
  const rows = Object.entries(models)
    .filter(([id, a]) => want.test(id) || want.test(a.name) || (a.tags || []).some((t) => want.test(t)))
    .map(([id, a]) => `${id} | ${a.name} | ${(a.categories || []).join(",")} | polys:${a.polycount ?? "?"}`);
  console.log(`POLY HAVEN models: ${Object.keys(models).length} total, ${rows.length} matching`);
  console.log(rows.join("\n"));
} catch (e) {
  console.log("Poly Haven models failed: " + e.message);
}

try {
  const hdris = await json("https://api.polyhaven.com/assets?t=hdris");
  const pick = Object.entries(hdris)
    .filter(([id, a]) => /studio|hall|library|night|city|hangar|airport|court|office|lobby|museum|sunset|sky/i.test(id + " " + (a.categories || []).join(" ")))
    .slice(0, 60)
    .map(([id, a]) => `${id} (${(a.categories || []).slice(0, 4).join(",")})`);
  console.log(`\nPOLY HAVEN hdris: ${Object.keys(hdris).length} total; sample of relevant: ${pick.join("; ")}`);
} catch (e) {
  console.log("Poly Haven hdris failed: " + e.message);
}

for (const q of ["airliner", "formula race car", "tennis racket", "conference chair"]) {
  try {
    const r = await json(
      `https://api.sketchfab.com/v3/search?type=models&downloadable=true&sort_by=-likeCount&count=4&q=${encodeURIComponent(q)}`,
    );
    console.log(`\nSKETCHFAB "${q}": ` + r.results.map((m) => `${m.name} [${m.license?.label ?? "?"}] ${m.uid} faces:${m.faceCount}`).join(" || "));
  } catch (e) {
    console.log(`Sketchfab "${q}" failed: ` + e.message);
  }
}
try {
  const res = await fetch("https://api.sketchfab.com/v3/models/00000000000000000000000000000000/download", { headers: UA });
  console.log("\nSketchfab download endpoint without a token -> HTTP " + res.status);
} catch (e) {
  console.log("Sketchfab download check failed: " + e.message);
}
