// Usage: node design/explorations/capture.mjs <board.html> [more.html ...]
// Renders each board at 1440x900 to design/explorations/shots/<name>.png
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const files = process.argv.slice(2);
if (!files.length) { console.error('no board given'); process.exit(1); }

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const failed = [];
page.on('requestfailed', r => failed.push(`${r.url()} — ${r.failure()?.errorText}`));
for (const f of files) {
  const abs = path.resolve(f);
  await page.goto(pathToFileURL(abs).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const report = await page.evaluate(() => ({
    loaded: [...new Set([...document.fonts].filter(x => x.status === 'loaded').map(x => x.family.replace(/"/g, '')))],
    notLoaded: [...new Set([...document.fonts].filter(x => x.status === 'error').map(x => x.family.replace(/"/g, '')))],
    overflowX: document.documentElement.scrollWidth > innerWidth,
    overflowY: document.documentElement.scrollHeight > innerHeight,
    clipped: [...document.querySelectorAll('.name,.strip,.onpaper,.fact')].filter(e => e.scrollWidth > e.clientWidth + 1 || e.getBoundingClientRect().right > innerWidth).map(e => e.className + ' in ' + e.closest('section')?.className),
  }));
  const out = path.join(here, 'shots', path.basename(abs, '.html') + '.png');
  await page.screenshot({ path: out });
  console.log(out, JSON.stringify(report, null, 1));
}
if (failed.length) console.log('FAILED REQUESTS', failed);
await browser.close();
