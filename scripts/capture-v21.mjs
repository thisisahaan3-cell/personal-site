#!/usr/bin/env node
/**
 * Version 2.1 frames for a quick visual check (software WebGL, so judge composition, not speed).
 *   node scripts/capture-v21.mjs <base-url> <out-dir> <group...>
 * Groups: home, finance, law, nav, phone, reduced.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const [base = "http://localhost:3200", out = "qa/screenshots/v21-a", ...groups] = process.argv.slice(2);
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
const shot = (page, name) => page.screenshot({ path: `${out}/${name}.png`, timeout: 120000 }).catch((e) => errors.push(`shot ${name}: ${e.message.split("\n")[0]}`));

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
const waitReady = (page, sel, t = 60000) =>
  page.waitForSelector(`${sel}[data-ready]`, { timeout: t }).catch(() => errors.push(`not ready: ${sel}`));

const G = {
  async home() {
    const { page, ctx } = await open("/");
    await sleep(6000);
    await shot(page, "home-settled");
    await page.mouse.move(1010, 330);
    await sleep(900);
    await shot(page, "home-lens");
    await ctx.close();
  },
  async nav() {
    const { page, ctx } = await open("/academics");
    await sleep(1500);
    await page.screenshot({ path: `${out}/nav-strip.png`, clip: { x: 0, y: 0, width: 1440, height: 120 } });
    await ctx.close();
    const m = await open("/academics", { w: 390, h: 844 });
    await sleep(1200);
    await m.page.click(".board__menu");
    await sleep(800);
    await shot(m.page, "nav-phone-board");
    await m.ctx.close();
  },
  async finance() {
    const { page, ctx } = await open("/finance");
    await sleep(800);
    await scrollTo(page, ".bronze", 0.02);
    await waitReady(page, ".bronze");
    await sleep(2500);
    await shot(page, "finance-bronze-horn");
    await scrollTo(page, ".bronze", 0.42);
    await sleep(3500);
    await page.mouse.move(1300, 800);
    await sleep(2000);
    await shot(page, "finance-bronze-rest");
    await page.mouse.move(980, 300);
    await sleep(2500);
    await shot(page, "finance-bronze-lit");
    const hs = page.locator(".bronze .hotspot__label").first();
    await hs.click().catch(() => errors.push("no hotspot"));
    await sleep(2500);
    await shot(page, "finance-bronze-hotspot");
    await scrollTo(page, ".bronze", 0.8);
    await sleep(3000);
    await shot(page, "finance-bronze-push");
    await scrollTo(page, ".field", 0.1);
    await sleep(4000);
    await shot(page, "finance-field");
    await scrollTo(page, ".desk", 0.15);
    await waitReady(page, ".desk");
    await sleep(3000);
    await shot(page, "finance-desk-wide");
    await scrollTo(page, ".desk", 0.85);
    await sleep(3500);
    await shot(page, "finance-desk-laptop");
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
    await sleep(1200);
    await shot(page, "finance-foot");
    await ctx.close();
  },
  async law() {
    const { page, ctx } = await open("/law-diplomacy");
    await sleep(2800);
    await shot(page, "law-cold");
    await scrollTo(page, ".hall", 0.02);
    await waitReady(page, ".hall");
    await sleep(3000);
    await shot(page, "law-open");
    await scrollTo(page, ".hall", 0.22);
    await sleep(4500);
    await shot(page, "law-dais");
    await scrollTo(page, ".hall", 0.55);
    await sleep(5000);
    const seat = page.locator(".hall__seat").nth(3);
    await seat.hover({ force: true }).catch(() => errors.push("no seat"));
    await sleep(2500);
    await shot(page, "law-floor");
    await scrollTo(page, ".hall", 0.78);
    await sleep(4500);
    await shot(page, "law-bench");
    await scrollTo(page, ".hall", 0.97);
    await sleep(5000);
    await shot(page, "law-corner");
    await page.locator(".hall__hotspots .hotspot__label").last().click({ force: true }).catch(() => errors.push("no course hotspot"));
    await sleep(2000);
    await shot(page, "law-corner-open");
    await ctx.close();
  },
  async phone() {
    for (const [name, path, sel, ps] of [
      ["home", "/", null, []],
      ["finance", "/finance", ".bronze", [0.45]],
      ["finance-desk", "/finance", ".desk", [0.8]],
      ["law", "/law-diplomacy", null, []],
    ]) {
      const { page, ctx } = await open(path, { w: 390, h: 844 });
      await sleep(5000);
      await shot(page, `phone-${name}-top`);
      if (name === "law") {
        await page.evaluate(() => document.querySelector(".hall")?.scrollIntoView());
        await sleep(1500);
        await shot(page, "phone-law-plan");
      }
      for (const p of ps) {
        await scrollTo(page, sel, p);
        await waitReady(page, sel);
        await sleep(4500);
        await shot(page, `phone-${name}-${Math.round(p * 100)}`);
      }
      await ctx.close();
    }
  },
  async reduced() {
    for (const [name, path, sel] of [
      ["home", "/", null],
      ["finance", "/finance", ".bronze"],
      ["law", "/law-diplomacy", ".hall"],
    ]) {
      const { page, ctx } = await open(path, { reduced: true });
      await sleep(1500);
      if (sel) {
        await page.evaluate((s) => document.querySelector(s)?.scrollIntoView(), sel);
        if (sel !== ".hall") await waitReady(page, sel);
        await sleep(3000);
      }
      await shot(page, `reduced-${name}`);
      await ctx.close();
    }
  },
};

for (const g of groups) await G[g]();
await browser.close();
console.log(errors.length ? errors.join("\n") : "no console errors");
