// usage: node pexels-search.mjs "<query>" [videos|photos]
import { chromium } from 'playwright';
const [q, kind = 'videos'] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36' });
await p.goto(`https://www.pexels.com/search/${kind}/${encodeURIComponent(q)}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
await p.waitForTimeout(3500);
const links = await p.$$eval(`a[href*="/${kind === 'videos' ? 'video' : 'photo'}/"]`, as => [...new Set(as.map(a => a.href + ' | ' + (a.getAttribute('title') || a.querySelector('img,video')?.getAttribute('alt') || '')))]);
console.log(links.slice(0, 25).join('\n'));
await b.close();
