// Captures full-page screenshots of the site at desktop, tablet and mobile sizes.
// Usage: node scripts/screenshot.mjs <url> <outDir> [--reduced-motion] [--only=desktop,mobile]
// The page is scrolled top to bottom first so scroll-triggered content has revealed.
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const [url = "http://localhost:3000", outDir = "qa/screenshots/latest", ...flags] =
  process.argv.slice(2);
const reducedMotion = flags.includes("--reduced-motion");
const only = flags.find((f) => f.startsWith("--only="))?.slice(7).split(",");

const viewports = [
  { name: "desktop", width: 1440, height: 900, mobile: false },
  { name: "tablet", width: 834, height: 1112, mobile: true },
  { name: "mobile", width: 390, height: 844, mobile: true },
].filter((v) => !only || only.includes(v.name));

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const problems = [];

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    reducedMotion: reducedMotion ? "reduce" : "no-preference",
  });
  const page = await context.newPage();
  page.on("console", (msg) => {
    // Failed resource loads are reported with their URL by the response listener below.
    if (msg.type() === "error" && !msg.text().startsWith("Failed to load resource"))
      problems.push(`[${vp.name}] console error: ${msg.text()}`);
  });
  page.on("response", (res) => {
    if (res.status() >= 400) problems.push(`[${vp.name}] HTTP ${res.status()}: ${res.url()}`);
  });
  page.on("pageerror", (err) => problems.push(`[${vp.name}] page error: ${err.message}`));
  page.on("requestfailed", (req) =>
    problems.push(`[${vp.name}] request failed: ${req.url()}`),
  );

  await page.goto(url, { waitUntil: "networkidle" });
  // Let the entrance sequence finish, then capture the first screen.
  await page.waitForTimeout(4500);
  await page.screenshot({ path: path.join(outDir, `${vp.name}-first-screen.png`) });

  // Scroll through the page in steps so reveals fire, then return to the top.
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += Math.round(vp.height * 0.6)) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
    await page.waitForTimeout(350);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(800);

  await page.screenshot({ path: path.join(outDir, `${vp.name}-full.png`), fullPage: true });

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  if (overflow > 0) problems.push(`[${vp.name}] horizontal overflow of ${overflow}px`);

  console.log(`${vp.name}: ${vp.width}x${vp.height}, page height ${height}px`);
  await context.close();
}

await browser.close();
if (problems.length) {
  console.log("\nProblems found:");
  for (const p of problems) console.log(" - " + p);
} else {
  console.log("\nNo console errors, failed requests or horizontal overflow.");
}
