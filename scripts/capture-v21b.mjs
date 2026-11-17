#!/usr/bin/env node
/**
 * Version 2.1, run B frames (software WebGL, so judge composition, not speed).
 *   node scripts/capture-v21b.mjs <base-url> <out-dir> <group...>
 * Groups: academics, leadership, phone, reduced.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const [base = "http://localhost:3200", out = "qa/screenshots/v21-b1", ...groups] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const errors = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function open(path, { w = 1440, h = 900, reduced = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: reduced ? "reduce" : "no-preference" });
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push(`${path} ${w}: ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`${path} ${w}: ${e.message}`));
  await page.goto(base + path, { waitUntil: "load" });
  return { page, ctx };
}
const shot = (page, name, full = false) =>
  page.screenshot({ path: `${out}/${name}.png`, timeout: 120000, fullPage: full }).catch((e) => errors.push(`shot ${name}: ${e.message.split("\n")[0]}`));

/** Scroll so that a section is at progress p of its pinned span. */
async function scrollTo(page, selector, p) {
  await page.evaluate(
    ([sel, p]) => {
      const el = document.querySelector(sel);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const top = r.top + window.scrollY;
      const spanPx = Math.max(0, r.height - window.innerHeight);
      window.scrollTo({ top: top + spanPx * p, behavior: "instant" });
    },
    [selector, p],
  );
}
const waitReady = (page, sel, t = 90000) =>
  page.waitForSelector(`${sel}[data-ready]`, { timeout: t }).catch(() => errors.push(`not ready: ${sel}`));
const top = (page, sel, dy = 0) =>
  page.evaluate(([s, dy]) => window.scrollTo({ top: document.querySelector(s).getBoundingClientRect().top + scrollY + dy, behavior: "instant" }), [sel, dy]);

const G = {
  async academics() {
    const { page, ctx } = await open("/academics");
    await scrollTo(page, ".tape", 0.85);
    await sleep(2500);
    await shot(page, "academics-tape");
    await scrollTo(page, ".topper", 0.02);
    await waitReady(page, ".topper");
    await sleep(2500);
    await shot(page, "academics-desk-cold");
    await scrollTo(page, ".topper", 0.42);
    await sleep(3000);
    await shot(page, "academics-desk-mid");
    await scrollTo(page, ".topper", 1);
    await sleep(3500);
    await page.click(".topper__hotspots .hotspot:nth-child(4) .hotspot__label", { force: true }).catch((e) => errors.push("click: " + e.message.split("\n")[0]));
    await sleep(800);
    await shot(page, "academics-desk-open");
    await top(page, ".results", -40);
    await sleep(1200);
    await shot(page, "academics-results");
    await top(page, ".results__kicker--other", -60);
    await sleep(800);
    await shot(page, "academics-other");
    await ctx.close();
  },
  async leadership() {
    const { page, ctx } = await open("/leadership");
    await sleep(2500);
    await shot(page, "leadership-cold");
    await scrollTo(page, ".dossiers", 0.0);
    await waitReady(page, ".dossiers");
    await sleep(3000);
    await shot(page, "leadership-flypast-1");
    for (const [p, n] of [
      [0.075, "leadership-open-1"],
      [0.2, "leadership-flypast-2"],
      [0.5, "leadership-open-4"],
      [0.93, "leadership-open-7"],
    ]) {
      await scrollTo(page, ".dossiers", p);
      await sleep(3200);
      await shot(page, n);
    }
    await top(page, ".worklist", -40);
    await sleep(1000);
    await shot(page, "leadership-list");
    await ctx.close();
  },
  async phone() {
    for (const path of ["/", "/academics", "/leadership"]) {
      const name = path === "/" ? "home" : path.slice(1);
      const { page, ctx } = await open(path, { w: 390, h: 844 });
      await sleep(4500);
      await shot(page, `phone-${name}-top`);
      if (name === "academics") {
        await scrollTo(page, ".topper", 1);
        await waitReady(page, ".topper");
        await sleep(3500);
        await shot(page, "phone-academics-desk");
        await top(page, ".results", -20);
        await sleep(800);
        await shot(page, "phone-academics-results");
      }
      if (name === "leadership") {
        await top(page, ".drawer", 0);
        await sleep(1200);
        await shot(page, "phone-leadership-dossiers");
      }
      await ctx.close();
    }
  },
  async reduced() {
    for (const [path, sel] of [
      ["/", null],
      ["/academics", ".topper"],
      ["/leadership", ".drawer"],
    ]) {
      const name = path === "/" ? "home" : path.slice(1);
      const { page, ctx } = await open(path, { reduced: true });
      await sleep(3000);
      if (sel) {
        await top(page, sel, 0);
        if (name === "academics") await waitReady(page, sel);
        await sleep(2500);
      }
      await shot(page, `reduced-${name}`);
      await ctx.close();
    }
  },
};

for (const g of groups) await G[g]();
await browser.close();
console.log(errors.length ? errors.join("\n") : "no console errors");
