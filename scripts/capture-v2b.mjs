// Frame captures for the v2 Academics, Leadership and Contact pages, for judging motion.
// Usage: node scripts/capture-v2b.mjs <academics|leadership|contact|mun> [baseUrl] [--only=desktop,phone,reduced,tablet]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const [which = "academics", base = "http://localhost:3200", ...flags] = process.argv.slice(2);
const outDir = `qa/screenshots/v2-${which === "mun" ? "model-un" : which}`;
const only = flags.find((f) => f.startsWith("--only="))?.slice(7).split(",");
const want = (k) => !only || only.includes(k);
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const problems = [];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function open(viewport, opts = {}) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, ...opts });
  const page = await context.newPage();
  const tag = `${viewport.width}${opts.reducedMotion ? "-rm" : ""}`;
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") problems.push(`[${tag}] console ${m.type()}: ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`[${tag}] page error: ${e.message}`));
  page.on("response", (r) => r.status() >= 400 && problems.push(`[${tag}] HTTP ${r.status()} ${r.url()}`));
  return { context, page };
}
const shot = (page, name, full = false) => page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: full });
const scrollTo = (page, y) => page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
const overflow = (page, tag) =>
  page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth).then((d) => {
    if (d > 0) problems.push(`[${tag}] horizontal overflow ${d}px`);
  });
async function span(page, sel) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    const r = el.getBoundingClientRect();
    return { top: r.top + window.scrollY, span: r.height - window.innerHeight, height: r.height };
  }, sel);
}
async function toEl(page, sel, offset = 0) {
  const s = await span(page, sel);
  await scrollTo(page, s.top + offset);
}

async function academics(page, prefix, phone) {
  await page.goto(base + "/academics", { waitUntil: "networkidle" });
  await wait(1500);
  await shot(page, `${prefix}cold-open`);
  const t = await span(page, ".tape");
  // Step through the roll gradually so the spring follows, as a reader's scroll would.
  for (let p = 0; p <= 0.3; p += 0.05) {
    await scrollTo(page, t.top + p * t.span);
    await wait(90);
  }
  await shot(page, `${prefix}tape-mid-roll`);
  for (let p = 0.3; p <= 0.7; p += 0.05) {
    await scrollTo(page, t.top + p * t.span);
    await wait(70);
  }
  await wait(260);
  await shot(page, `${prefix}tape-overshoot`);
  await wait(2600);
  await shot(page, `${prefix}tape-settled`);
  if (!phone) {
    const b = await page.evaluate(() => {
      const r = document.querySelector(".tape__band").getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    await page.mouse.move(b.x, b.y);
    await page.mouse.down();
    await page.mouse.move(b.x, b.y + 160, { steps: 8 });
    await wait(150);
    await shot(page, `${prefix}tape-dragged`);
    await page.mouse.up();
    await wait(260);
    await shot(page, `${prefix}tape-springback`);
  }
  await toEl(page, ".school", -80);
  await wait(500);
  await shot(page, `${prefix}school`);
  await toEl(page, ".courses", -40);
  await wait(900);
  await shot(page, `${prefix}courses-1`);
  await toEl(page, ".course--law", -120);
  await wait(700);
  await shot(page, `${prefix}courses-2`);
  await toEl(page, ".contests__quiz", -140);
  await wait(500);
  await shot(page, `${prefix}quiz-before`);
  await page.click(".quiz__option >> nth=1");
  await wait(250);
  await shot(page, `${prefix}quiz-answer-moment`);
  await wait(900);
  await shot(page, `${prefix}quiz-after`);
  await page.keyboard.press("Enter");
  await wait(300);
  await page.keyboard.press("c");
  await wait(900);
  await shot(page, `${prefix}quiz-second`);
  await page.click(".more__summary");
  await wait(700);
  await toEl(page, ".more", -300);
  await wait(400);
  await shot(page, `${prefix}more-open`);
  await overflow(page, prefix);
}

for (const [fn, name] of [[academics, "academics"]]) {
  if (which !== name) continue;
  if (want("desktop")) {
    const { context, page } = await open({ width: 1440, height: 900 });
    await fn(page, "d-", false);
    await context.close();
  }
  if (want("tablet")) {
    const { context, page } = await open({ width: 834, height: 1112 });
    await fn(page, "t-", false);
    await context.close();
  }
  if (want("phone")) {
    const { context, page } = await open({ width: 390, height: 844 }, { isMobile: true, hasTouch: true });
    await fn(page, "p-", true);
    await context.close();
  }
  if (want("reduced")) {
    const { context, page } = await open({ width: 1440, height: 900 }, { reducedMotion: "reduce" });
    await page.goto(base + "/" + name, { waitUntil: "networkidle" });
    await wait(800);
    await shot(page, "rm-full", true);
    await context.close();
  }
}

await browser.close();
console.log(problems.length ? problems.join("\n") : "no console errors, failed requests or overflow");
