// Targeted checks for review 1 fixes: element screenshots, overflow, console errors, hit areas.
// Usage: node scripts/fix-check.mjs <url> <outDir>
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const [url = "http://localhost:3200", outDir = "qa/screenshots/fix-1a"] = process.argv.slice(2);
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const report = [];

async function open(width, height) {
  const mobile = width < 768;
  const ctx = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(url, { waitUntil: "networkidle" });
  // Scroll through so scroll-driven reveals have run.
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += Math.round(height * 0.6)) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(600);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  report.push(`${width}x${height}: overflow ${overflow}px, console errors ${errors.length}${errors.length ? " " + errors.join(" | ") : ""}`);
  return { ctx, page };
}

async function shot(page, selector, name, pad = 0) {
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  const b = await el.boundingBox();
  if (!b) return report.push(`${name}: not found`);
  const vp = page.viewportSize();
  await page.screenshot({
    path: `${outDir}/${name}.png`,
    fullPage: true,
    clip: { x: 0, y: Math.max(0, b.y + (await page.evaluate(() => scrollY)) - pad), width: vp.width, height: b.height + 2 * pad },
  });
}

// Phone Quizzing: label clearance against rings and the drawn path.
async function quizClearance(page, w) {
  const r = await page.evaluate(() => {
    const fig = document.querySelector("#quizzing .figure.fig-phone");
    const lab = fig.querySelector(".quiz-current-name");
    const lb = lab.getBoundingClientRect();
    const fb = fig.getBoundingClientRect();
    let min = Infinity;
    for (const ring of fig.querySelectorAll(".mark-ring")) {
      const rb = ring.getBoundingClientRect();
      const dx = Math.max(lb.left - rb.right, rb.left - lb.right, 0);
      const dy = Math.max(lb.top - rb.bottom, rb.top - lb.bottom, 0);
      min = Math.min(min, Math.hypot(dx, dy));
    }
    let minPath = Infinity;
    for (const path of fig.querySelectorAll("path.ln")) {
      const svg = path.ownerSVGElement;
      const ctm = path.getScreenCTM();
      const len = path.getTotalLength();
      for (let s = 0; s <= len; s += 1) {
        const p = svg.createSVGPoint();
        const q = path.getPointAtLength(s);
        p.x = q.x;
        p.y = q.y;
        const t = p.matrixTransform(ctm);
        const dx = Math.max(lb.left - t.x, t.x - lb.right, 0);
        const dy = Math.max(lb.top - t.y, t.y - lb.bottom, 0);
        minPath = Math.min(minPath, Math.hypot(dx, dy) - 0.75);
      }
    }
    return {
      text: lab.textContent,
      left: Math.round(lb.left),
      baselineish: Math.round(lb.bottom - fb.top),
      ring: Math.round(min * 10) / 10,
      path: Math.round(minPath * 10) / 10,
      nodeLabels: fig.querySelectorAll(".node-label").length,
    };
  });
  report.push(`quiz ${w}: ${JSON.stringify(r)}`);
}

// 390 phone
{
  const { ctx, page } = await open(390, 844);
  await quizClearance(page, 390);
  await shot(page, "#quizzing .quiz-fig", "quiz-390", 24);
  // Answer one question so the dot moves; label must follow.
  await page.locator("#quizzing .quiz-opt").first().click();
  await page.waitForTimeout(600);
  await quizClearance(page, 390);
  await shot(page, "#quizzing .quiz-fig", "quiz-390-answered", 24);
  const hits = await page.evaluate(() => {
    const h = (s) => [...document.querySelectorAll(s)].map((e) => Math.round(e.getBoundingClientRect().height));
    return { sort: h(".record-sort .tbtn"), email: h(".email-link"), top: h(".footer-top") };
  });
  report.push(`hit heights 390: ${JSON.stringify(hits)}`);
  await shot(page, ".record-sort", "mun-sort-390", 32);
  await shot(page, "#contact", "contact-390", 0);
  await shot(page, ".site-footer", "footer-390", 16);
  await ctx.close();
}
// 360 and 320 phone
for (const [w, h] of [
  [360, 780],
  [320, 700],
]) {
  const { ctx, page } = await open(w, h);
  await quizClearance(page, w);
  if (w === 360) await shot(page, "#quizzing .quiz-fig", "quiz-360", 24);
  await ctx.close();
}
// Tablet Model UN
{
  const { ctx, page } = await open(834, 1112);
  const g = await page.evaluate(() => {
    const side = document.querySelector(".globe-side");
    const fig = document.querySelector(".globe-block .figure.fig-desk");
    const block = document.querySelector(".globe-block");
    const kid = side.querySelector("h3").getBoundingClientRect();
    const fb = fig.getBoundingClientRect();
    const pl = side.querySelector(".placard").getBoundingClientRect();
    return {
      sideLeft: Math.round(kid.left),
      sideTopFromGlobe: Math.round(side.getBoundingClientRect().top - fb.top),
      placard: [Math.round(pl.left), Math.round(pl.right), Math.round(pl.height)],
      globeH: Math.round(fb.height),
      blockH: Math.round(block.getBoundingClientRect().height),
      sideBottomFromGlobe: Math.round(side.getBoundingClientRect().bottom - fb.top),
      limbX: Math.round(fb.left + (360 / 1110) * fb.width),
    };
  });
  report.push(`mun tablet: ${JSON.stringify(g)}`);
  await shot(page, ".globe-block", "mun-834", 24);
  await ctx.close();
}
// Desktop fellowship + email nudge
{
  const { ctx, page } = await open(1440, 900);
  await shot(page, "#competitions table.ruled", "fellowship-1440", 16);
  const email = page.locator(".email-link");
  await email.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await email.hover();
  await page.waitForTimeout(150);
  const mid = await page.evaluate(() => getComputedStyle(document.querySelector(".email-dot")).translate);
  await page.waitForTimeout(400);
  const end = await page.evaluate(() => getComputedStyle(document.querySelector(".email-dot")).translate);
  report.push(`email dot translate on hover: mid ${mid}, end ${end}`);
  const color = await page.evaluate(() => [...document.querySelectorAll(".ilink")].map((a) => getComputedStyle(a).color));
  report.push(`ilink colours: ${color.join(", ")}`);
  await ctx.close();
}

await browser.close();
console.log(report.join("\n"));
