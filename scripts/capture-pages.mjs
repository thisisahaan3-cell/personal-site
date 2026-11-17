// Frame captures for the v2 section pages (Finance, Model UN), for judging motion.
// Usage: node scripts/capture-pages.mjs <finance|model-un|home> [baseUrl] [outDir] [--only=desktop,phone,reduced]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const [which = "finance", base = "http://localhost:3200", outArg, ...flags] = process.argv.slice(2);
const outDir = outArg ?? `qa/screenshots/v2-${which}`;
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

async function sectionSpan(page, sel) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    const r = el.getBoundingClientRect();
    return { top: r.top + window.scrollY, span: r.height - window.innerHeight, height: r.height };
  }, sel);
}

async function finance(page, prefix, phone) {
  await page.goto(base + "/finance", { waitUntil: "networkidle" });
  await wait(1600);
  await shot(page, `${prefix}cold-open`);
  const f = await sectionSpan(page, ".field");
  await scrollTo(page, f.top - 300);
  await wait(250);
  await shot(page, `${prefix}field-0-arriving`);
  for (let s = 0; s < 5; s++) {
    await scrollTo(page, f.top + ((s + 0.5) / 5) * f.span);
    await wait(phone ? 450 : 550);
    await shot(page, `${prefix}field-${s}-mid`);
    await wait(2600);
    await shot(page, `${prefix}field-${s}-settled`);
    if (!phone && (s === 1 || s === 3)) {
      const pt = await page.evaluate((s) => {
        const st = document.querySelector(".field__stage").getBoundingClientRect();
        return s === 1 ? { x: st.width * 0.71, y: st.height * 0.45 } : { x: st.width * 0.62, y: 0 };
      }, s);
      if (s === 3) {
        const ry = await page.evaluate(() => {
          const r = document.querySelector(".field__rule");
          return r ? r.getBoundingClientRect().top : 400;
        });
        pt.y = ry;
      }
      await page.mouse.move(pt.x - 40, pt.y - 20);
      await page.mouse.move(pt.x, pt.y, { steps: 6 });
      await wait(400);
      await shot(page, `${prefix}field-${s}-pointer`);
      await page.mouse.move(5, 5);
    }
  }
  const a = await sectionSpan(page, ".artha");
  await scrollTo(page, a.top + 100);
  await wait(900);
  await shot(page, `${prefix}artha`);
  await scrollTo(page, a.top + a.height * 0.45);
  await wait(900);
  await shot(page, `${prefix}artha-2`);
  const o = await sectionSpan(page, ".ongoing");
  await scrollTo(page, o.top - 80);
  await wait(900);
  await shot(page, `${prefix}record`);
  await overflow(page, prefix);
}

if (which === "finance") {
  if (want("desktop")) {
    const { context, page } = await open({ width: 1440, height: 900 });
    await finance(page, "d-", false);
    await context.close();
  }
  if (want("phone")) {
    const { context, page } = await open({ width: 390, height: 844 }, { isMobile: true, hasTouch: true });
    await finance(page, "p-", true);
    await context.close();
  }
  if (want("reduced")) {
    const { context, page } = await open({ width: 1440, height: 900 }, { reducedMotion: "reduce" });
    await page.goto(base + "/finance", { waitUntil: "networkidle" });
    await wait(800);
    const f = await sectionSpan(page, ".field");
    await scrollTo(page, f.top + 60);
    await wait(500);
    await shot(page, "rm-field");
    await context.close();
  }
}

if (which === "model-un") {
  const munFrames = async (page, prefix, phone) => {
    await page.goto(base + "/model-un", { waitUntil: "networkidle" });
    await wait(1600);
    await shot(page, `${prefix}cold-open`);
    const c = await sectionSpan(page, ".chamber");
    if (!phone) {
      for (const [i, p] of [0, 0.18, 0.4].entries()) {
        await scrollTo(page, c.top + p * c.span);
        await wait(1400);
        await shot(page, `${prefix}chamber-fly-${i}`);
      }
      await scrollTo(page, c.top + 0.75 * c.span);
      await wait(4000);
      await shot(page, `${prefix}chamber-settled`);
      const seat = await page.$$(".chamber__seat");
      if (seat[0]) {
        const b = await seat[2].boundingBox();
        await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 4 });
        await wait(1800);
        await shot(page, `${prefix}chamber-raised`);
        await page.mouse.move(10, 400);
      }
      const box = await page.$(".chamber__stage");
      const bb = await box.boundingBox();
      await page.mouse.move(bb.x + bb.width * 0.5, bb.y + bb.height * 0.6);
      await page.mouse.down();
      await page.mouse.move(bb.x + bb.width * 0.5 + 360, bb.y + bb.height * 0.6, { steps: 12 });
      await page.mouse.up();
      await wait(600);
      await shot(page, `${prefix}chamber-orbit`);
      await page.click(".chamber__filter[data-filter='level:Best Delegate']");
      await wait(2500);
      await shot(page, `${prefix}chamber-filter`);
    } else {
      await scrollTo(page, c.top + 40);
      await wait(900);
      await shot(page, `${prefix}chamber-plan`);
      const seat = await page.$$(".plan__seat");
      if (seat[1]) {
        await seat[1].tap();
        await wait(500);
        await shot(page, `${prefix}chamber-plan-tap`);
      }
    }
    const d = await sectionSpan(page, ".docket");
    await scrollTo(page, d.top - 40);
    await wait(900);
    await shot(page, `${prefix}docket`);
    await scrollTo(page, d.top + d.height * 0.55);
    await wait(700);
    await shot(page, `${prefix}docket-2`);
    await overflow(page, prefix);
  };
  if (want("desktop")) {
    const { context, page } = await open({ width: 1440, height: 900 });
    await munFrames(page, "d-", false);
    await context.close();
  }
  if (want("phone")) {
    const { context, page } = await open({ width: 390, height: 844 }, { isMobile: true, hasTouch: true });
    await munFrames(page, "p-", true);
    await context.close();
  }
  if (want("reduced")) {
    const { context, page } = await open({ width: 1440, height: 900 }, { reducedMotion: "reduce" });
    await page.goto(base + "/model-un", { waitUntil: "networkidle" });
    await wait(800);
    const c = await sectionSpan(page, ".chamber");
    await scrollTo(page, c.top + 20);
    await wait(500);
    await shot(page, "rm-chamber");
    await context.close();
  }
}

if (which === "home") {
  const { context, page } = await open({ width: 1440, height: 900 });
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await wait(6500);
  await shot(page, "home-rest");
  await page.hover(".dest-row__item:first-child .dest");
  await wait(900);
  await shot(page, "home-dest-hover");
  await context.close();
  const p2 = await open({ width: 390, height: 844 }, { isMobile: true, hasTouch: true });
  await p2.page.goto(base + "/", { waitUntil: "networkidle" });
  await wait(6000);
  await shot(p2.page, "home-rest-phone");
  await p2.context.close();
}

await browser.close();
console.log(problems.length ? problems.join("\n") : "no problems");
