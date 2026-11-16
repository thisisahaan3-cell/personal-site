// Captures the v2 home intro as a frame sequence plus interaction states, for judging motion.
// Usage: node scripts/capture-home.mjs [baseUrl] [outDir] [--only=intro,interact,phone,reduced,transition]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const [base = "http://localhost:3200", outDir = "qa/screenshots/v2-home", ...flags] = process.argv.slice(2);
const only = flags.find((f) => f.startsWith("--only="))?.slice(7).split(",");
const want = (k) => !only || only.includes(k);
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const problems = [];
const shot = (page, name) => page.screenshot({ path: path.join(outDir, `${name}.png`), type: "png" });

async function open(viewport, opts = {}) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, ...opts });
  const page = await context.newPage();
  const tag = `${viewport.width}`;
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") problems.push(`[${tag}] console ${m.type()}: ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`[${tag}] page error: ${e.message}`));
  page.on("response", (r) => r.status() >= 400 && problems.push(`[${tag}] HTTP ${r.status()} ${r.url()}`));
  return { context, page };
}

async function introStart(page) {
  await page.waitForSelector(".home[data-state='playing']", { timeout: 15000 });
  return Date.now();
}

/**
 * Deterministic time: the page runs on Playwright's fake clock (rAF, performance.now), paused
 * once the intro starts; CSS animations are paused and seeked to the same moment.
 */
async function frozenIntro(page) {
  await page.clock.install();
  await page.goto(base + "/", { waitUntil: "domcontentloaded" });
  const fakeNow = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(fakeNow + 1000);
  // Step 16ms at a time until the wall starts its intro (images decode in real time meanwhile).
  for (let i = 0; i < 2000 && !(await page.$("canvas[data-intro-start]")); i++) {
    await page.clock.runFor(16);
    await page.waitForTimeout(10);
  }
  const start = Number(await page.getAttribute("canvas", "data-intro-start"));
  return async (t) => {
    const now = await page.evaluate(() => performance.now());
    const delta = Math.round(start + t * 1000 - now);
    if (delta > 0) await page.clock.runFor(delta);
    await page.evaluate((ms) => {
      for (const a of document.getAnimations()) {
        a.pause();
        a.currentTime = ms;
      }
    }, t * 1000);
  };
}

if (want("intro")) {
  const { context, page } = await open({ width: 1440, height: 900 });
  const seek = await frozenIntro(page);
  console.log("mode", await page.getAttribute(".home", "data-mode"));
  for (const t of [0.3, 0.8, 1.2, 1.6, 2.0, 2.4, 2.9, 4.0, 8.0]) {
    await seek(t);
    await shot(page, `intro-${t.toFixed(1)}s`);
    console.log(`intro ${t}s`);
  }
  await context.close();
}

if (want("interact")) {
  const { context, page } = await open({ width: 1440, height: 900 });
  await page.goto(base + "/", { waitUntil: "commit" });
  await introStart(page);
  await page.waitForTimeout(3600);
  // Lens over the face.
  const face = await page.evaluate(() => {
    const r = document.querySelector(".home__frame").getBoundingClientRect();
    return { x: r.left + r.width * 0.52, y: r.top + r.height * 0.42 };
  });
  await page.mouse.move(face.x - 200, face.y + 100);
  await page.mouse.move(face.x, face.y, { steps: 8 });
  await page.waitForTimeout(500);
  await shot(page, "lens-face");
  // Fast sweep: capture mid-sweep and just after.
  await page.mouse.move(face.x - 500, face.y + 60);
  await page.waitForTimeout(150);
  await page.mouse.move(face.x + 200, face.y - 60, { steps: 4 });
  await shot(page, "sweep-fast");
  await page.waitForTimeout(700);
  await shot(page, "sweep-after-700ms");
  // Destination hovered.
  await page.hover(".dest-row__item:nth-child(1) .dest");
  await page.waitForTimeout(450);
  await shot(page, "dest-hover");
  // Click replay on the wall.
  await page.mouse.move(400, 300);
  await page.waitForTimeout(300);
  await page.mouse.click(400, 300);
  await page.waitForTimeout(180);
  await shot(page, "replay-180ms");
  await page.waitForTimeout(320);
  await shot(page, "replay-500ms");
  await page.waitForTimeout(700);
  await shot(page, "replay-1200ms");
  await context.close();
}

if (want("transition")) {
  const { context, page } = await open({ width: 1440, height: 900 });
  await page.goto(base + "/", { waitUntil: "commit" });
  await introStart(page);
  await page.waitForTimeout(3500);
  await page.click(".dest-row__item:nth-child(3) .dest");
  const t = Date.now();
  for (const ms of [200, 480, 760]) {
    const wait = t + ms - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    await shot(page, `transition-${ms}ms`);
  }
  await page.waitForTimeout(900);
  await shot(page, "page-academics");
  console.log("url after transition", page.url());
  await context.close();
}

if (want("phone")) {
  const { context, page } = await open({ width: 390, height: 844 }, { isMobile: true, hasTouch: true });
  await page.goto(base + "/", { waitUntil: "commit" });
  await introStart(page);
  await page.waitForTimeout(3800);
  await shot(page, "phone-home");
  await page.waitForTimeout(4600);
  await shot(page, "phone-idle-lens");
  await page.click(".board__menu");
  await page.waitForTimeout(700);
  await shot(page, "phone-board");
  await context.close();
  const p2 = await open({ width: 390, height: 844 }, { isMobile: true, hasTouch: true });
  await p2.page.goto(base + "/finance", { waitUntil: "networkidle" });
  await p2.page.waitForTimeout(1200);
  await shot(p2.page, "phone-finance");
  await p2.context.close();
}

if (want("reduced")) {
  const { context, page } = await open({ width: 1440, height: 900 }, { reducedMotion: "reduce" });
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  console.log("reduced mode", await page.getAttribute(".home", "data-mode"));
  await shot(page, "reduced-home");
  const face = await page.evaluate(() => {
    const r = document.querySelector(".home__frame").getBoundingClientRect();
    return { x: r.left + r.width * 0.52, y: r.top + r.height * 0.42 };
  });
  await page.mouse.move(face.x, face.y, { steps: 4 });
  await page.waitForTimeout(300);
  await shot(page, "reduced-lens");
  await context.close();
  const d = await open({ width: 1440, height: 900 });
  await d.page.goto(base + "/finance", { waitUntil: "networkidle" });
  await d.page.waitForTimeout(1500);
  await shot(d.page, "page-finance");
  await d.page.goto(base + "/model-un", { waitUntil: "networkidle" });
  await d.page.waitForTimeout(1500);
  await shot(d.page, "page-model-un");
  await d.page.goto(base + "/contact", { waitUntil: "networkidle" });
  await d.page.waitForTimeout(1500);
  await shot(d.page, "page-contact");
  await d.context.close();
}

await browser.close();
console.log(problems.length ? "\nProblems:\n - " + [...new Set(problems)].join("\n - ") : "\nNo console errors or failed requests.");
