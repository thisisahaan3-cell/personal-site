// Looks at a gallery page of design sections and captures the ones named on the command line.
// Usage: node scripts/study-sections.mjs <url> <outDir> <name> [<name> ...]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const [url, out, ...names] = process.argv.slice(2);
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(5000);
console.log("title:", await page.title());
console.log("text:", (await page.evaluate(() => document.body.innerText.replace(/\s+/g, " "))).slice(0, 1500));
await page.screenshot({ path: `${out}/index.png` });

for (const name of names) {
  const link = page.getByText(new RegExp(`^\\s*${name}\\s*$`, "i")).first();
  if (!(await link.count())) {
    console.log(name, "-> not found on the page");
    continue;
  }
  await link.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  const href = await link.evaluate((el) => el.closest("a")?.href || null);
  console.log(name, "-> link:", href);
  await page.screenshot({ path: `${out}/${name.toLowerCase()}-in-gallery.png` });
  if (href) {
    const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    try {
      await p.goto(href, { waitUntil: "domcontentloaded", timeout: 60000 });
      await p.waitForTimeout(5000);
      console.log(name, "page text:", (await p.evaluate(() => document.body.innerText.replace(/\s+/g, " "))).slice(0, 700));
      console.log(name, "canvases:", await p.evaluate(() => document.querySelectorAll("canvas").length), "videos:", await p.evaluate(() => document.querySelectorAll("video").length));
      await p.screenshot({ path: `${out}/${name.toLowerCase()}-1.png` });
      await p.mouse.wheel(0, 900);
      await p.waitForTimeout(1500);
      await p.screenshot({ path: `${out}/${name.toLowerCase()}-2.png` });
    } catch (e) {
      console.log(name, "page failed:", e.message.split("\n")[0]);
    }
    await p.close();
  }
}
await browser.close();
