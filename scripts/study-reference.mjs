// Studies a reference site: for the home page and each internal page it records the
// animation technology in use (libraries, canvases, videos, CSS keyframes, running
// animations), the media it loads, and timed screenshots of the entrance and scroll.
// Usage: node scripts/study-reference.mjs <origin> <outDir>
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const [origin = "https://aaravjuneja.in", out = "design/reference-study/shots"] = process.argv.slice(2);
await mkdir(out, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();

const reqs = [];
page.on("request", (r) => {
  const u = r.url();
  if (/\.(js|mjs|mp4|webm|glb|gltf|wasm|lottie|riv)(\?|$)/.test(u) || r.resourceType() === "media")
    reqs.push(r.resourceType() + " " + u.replace(origin, ""));
});

async function probe(label) {
  const info = await page.evaluate(() => {
    const kf = new Set();
    let rules = 0;
    let viewTransitions = false;
    for (const ss of document.styleSheets) {
      try {
        for (const r of ss.cssRules) {
          rules++;
          if (r.type === 7) kf.add(r.name);
          if (/view-transition/.test(r.cssText)) viewTransitions = true;
        }
      } catch {}
    }
    const all = [...document.querySelectorAll("*")];
    const attrNames = new Set(all.flatMap((e) => [...e.attributes].map((a) => a.name)));
    return {
      url: location.pathname,
      title: document.title,
      generator: document.querySelector("meta[name=generator]")?.content,
      libs: {
        THREE: !!window.THREE,
        gsap: !!window.gsap,
        astro: [...attrNames].some((n) => n.startsWith("data-astro")) || !!document.querySelector("astro-island"),
        next: !!window.__NEXT_DATA__ || !!document.querySelector("#__next"),
      },
      canvases: [...document.querySelectorAll("canvas")].map((c) => ({ w: c.width, h: c.height, cls: String(c.className).slice(0, 40) })),
      videos: [...document.querySelectorAll("video")].map((v) => ({
        src: (v.currentSrc || v.querySelector("source")?.src || "").replace(location.origin, ""),
        autoplay: v.autoplay, loop: v.loop, muted: v.muted, w: v.clientWidth, h: v.clientHeight,
      })),
      imgs: document.querySelectorAll("img").length,
      svgs: document.querySelectorAll("svg").length,
      iframes: [...document.querySelectorAll("iframe")].map((i) => i.src.slice(0, 80)),
      runningAnimations: document.getAnimations().map(
        (a) => (a.animationName || a.transitionProperty || a.constructor.name) + ":" + (a.effect?.target?.tagName || "") + "." + String(a.effect?.target?.className || "").slice(0, 30),
      ).slice(0, 30),
      keyframes: [...kf].slice(0, 60),
      cssRules: rules,
      viewTransitions,
      height: document.documentElement.scrollHeight,
      headings: [...document.querySelectorAll("h1,h2,h3")].map((h) => h.tagName + ":" + h.innerText.trim().replace(/\s+/g, " ").slice(0, 70)).slice(0, 40),
      links: [...new Set([...document.querySelectorAll("a[href^='/']")].map((a) => a.getAttribute("href")))].slice(0, 40),
      dataAttrs: [...attrNames].filter((n) => n.startsWith("data-") && !n.startsWith("data-astro-cid")).slice(0, 40),
    };
  });
  console.log("\n##### " + label);
  console.log(JSON.stringify(info));
  return info;
}

// Home: timed frames of the entrance.
await page.goto(origin + "/", { waitUntil: "commit" });
let last = 0;
for (const t of [250, 700, 1300, 2200, 3500]) {
  await page.waitForTimeout(t - last);
  last = t;
  await page.screenshot({ path: `${out}/home-t${t}.png` });
}
await page.waitForLoadState("networkidle").catch(() => {});
const home = await probe("HOME");
console.log("REQUESTS(home): " + JSON.stringify([...new Set(reqs)].slice(0, 60)));

// Hover one large link on the home page.
for (const link of await page.$$("a[href^='/']")) {
  const box = await link.boundingBox();
  if (box && box.width > 300 && box.y > 400) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${out}/home-hover.png` });
    break;
  }
}

const paths = home.links.filter((l) => l !== "/" && !/\.(pdf|png|jpg|webp)$/.test(l)).slice(0, 8);
console.log("PATHS " + JSON.stringify(paths));
let n = 0;
for (const p of paths) {
  reqs.length = 0;
  try {
    await page.goto(origin + p, { waitUntil: "commit" });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${out}/p${n}-t600.png` });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${out}/p${n}-top.png` });
    const info = await probe("PAGE " + p);
    console.log("REQUESTS: " + JSON.stringify([...new Set(reqs)].slice(0, 40)));
    let k = 0;
    for (let y = 900; y < Math.min(info.height, 900 * 7); y += 900) {
      await page.mouse.wheel(0, 900);
      await page.waitForTimeout(900);
      await page.screenshot({ path: `${out}/p${n}-s${++k}.png` });
    }
  } catch (e) {
    console.log("FAILED " + p + " " + e.message.split("\n")[0]);
  }
  n++;
}
await browser.close();
