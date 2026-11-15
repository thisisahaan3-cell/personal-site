// Pipeline check: console errors (with URLs), horizontal overflow, tab order.
import { chromium } from "playwright";
const url = process.argv[2] ?? "http://localhost:3101";
const browser = await chromium.launch();
for (const [name, w, h] of [["desktop",1440,900],["mobile",390,844]]) {
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
  const errors = [];
  page.on("console", m => { if (m.type()==="error") errors.push(`${m.text()} @ ${m.location().url}`); });
  page.on("response", r => { if (r.status()>=400) errors.push(`HTTP ${r.status()} ${r.url()}`); });
  page.on("pageerror", e => errors.push("pageerror " + e.message));
  await page.goto(url, { waitUntil: "networkidle" });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const stops = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    const d = await page.evaluate(() => { const e = document.activeElement; return e && e !== document.body ? `${e.tagName.toLowerCase()} "${(e.innerText||e.getAttribute("aria-label")||"").trim().slice(0,40)}"` : "body"; });
    if (stops.length && stops[0] === d) break;
    stops.push(d);
  }
  const meta = await page.evaluate(() => ({ title: document.title, desc: document.querySelector('meta[name=description]')?.content ?? null }));
  console.log(name, JSON.stringify({ overflow, errors, tabStops: stops, meta }, null, 1));
}
await browser.close();
