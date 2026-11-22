// Usage: node design/explorations/gen/crop.mjs <board.html> <out.png> <selector> [index]
// Screenshots one element of a board (for close inspection while drawing).
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const [file, out, sel, idx = '0'] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await p.goto(pathToFileURL(path.resolve(file)).href, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.locator(sel).nth(+idx).screenshot({ path: out });
await b.close();
