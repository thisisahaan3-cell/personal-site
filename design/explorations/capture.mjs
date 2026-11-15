// Usage: node design/explorations/capture.mjs [--full] [--slices] <board.html> [more.html ...]
//
//   (no flag)  renders the 1440x900 viewport to shots/<name>.png
//   --full     renders the whole page, 1440 wide, deviceScaleFactor 1, to shots/<name>.png
//   --slices   also writes the page in 1440x1600 pieces to shots/slices/<name>-NN.png (for close inspection)
//
// Prints which fonts loaded, any failed requests, horizontal overflow, broken images,
// and elements inside a .frame whose text is wider than its box.
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const full = args.includes('--full');
const slices = args.includes('--slices');
const files = args.filter(a => !a.startsWith('--'));
if (!files.length) { console.error('no board given'); process.exit(1); }

const SLICE = 1600;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const failed = [];
page.on('requestfailed', r => failed.push(`${r.url()} — ${r.failure()?.errorText}`));
for (const f of files) {
  const abs = path.resolve(f);
  const name = path.basename(abs, '.html');
  await page.goto(pathToFileURL(abs).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const report = await page.evaluate(() => ({
    height: document.documentElement.scrollHeight,
    loaded: [...new Set([...document.fonts].filter(x => x.status === 'loaded').map(x => x.family.replace(/"/g, '')))],
    notLoaded: [...new Set([...document.fonts].filter(x => x.status === 'error').map(x => x.family.replace(/"/g, '')))],
    overflowX: document.documentElement.scrollWidth > innerWidth,
    brokenImages: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.getAttribute('src')),
    clipped: [...document.querySelectorAll('.name,.strip,.onpaper,.fact,.frame *')]
      .filter(e => e.children.length === 0 && e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).display !== 'inline')
      .map(e => (e.className || e.tagName) + ': ' + e.textContent.trim().slice(0, 40)),
  }));
  const out = path.join(here, 'shots', name + '.png');
  await page.screenshot({ path: out, fullPage: full });
  console.log(out, JSON.stringify(report, null, 1));
  if (slices) {
    const dir = path.join(here, 'shots', 'slices');
    fs.mkdirSync(dir, { recursive: true });
    for (const old of fs.readdirSync(dir)) if (old.startsWith(name + '-')) fs.unlinkSync(path.join(dir, old));
    for (let y = 0, i = 1; y < report.height; y += SLICE, i++) {
      const h = Math.min(SLICE, report.height - y);
      const p = path.join(dir, `${name}-${String(i).padStart(2, '0')}.png`);
      await page.screenshot({ path: p, fullPage: true, clip: { x: 0, y, width: 1440, height: h } });
      console.log('  slice', p, `y ${y} to ${y + h}`);
    }
  }
}
if (failed.length) console.log('FAILED REQUESTS', failed);
await browser.close();
