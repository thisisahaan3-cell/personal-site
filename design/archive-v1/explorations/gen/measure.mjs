// Prints font metrics used to place the hero type on the boards.
import { chromium } from 'playwright';
const html = `<!doctype html><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..600,0..100;1,9..144,300..600,0..100&family=Hanken+Grotesk:wght@400;500&family=IBM+Plex+Mono:wght@400;500&family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Spline+Sans+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<body><span style="font-family:'Instrument Serif'">a<i>a</i></span><span style="font-family:Fraunces;font-variation-settings:'opsz' 144,'SOFT' 0;font-weight:340">a<i>a</i></span><span style="font-family:'Bricolage Grotesque';font-weight:800;font-variation-settings:'wdth' 75">A</span><span style="font-family:Geist">a</span><span style="font-family:'Geist Mono'">a</span></body>`;
const b = await chromium.launch(); const p = await b.newPage();
await p.setContent(html, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
const out = await p.evaluate(() => {
  const c = document.createElement('canvas').getContext('2d');
  const m = (font, text, extra) => { c.font = font; if (extra) Object.assign(c, extra); const t = c.measureText(text); return { w: +t.width.toFixed(1), up: +t.actualBoundingBoxAscent.toFixed(1), down: +t.actualBoundingBoxDescent.toFixed(1), fa: +t.fontBoundingBoxAscent.toFixed(1), fd: +t.fontBoundingBoxDescent.toFixed(1), l: +t.actualBoundingBoxLeft.toFixed(1) }; };
  return {
    is_Ahaan: m('200px "Instrument Serif"', 'Ahaan'), is_x: m('200px "Instrument Serif"', 'x'), is_A: m('200px "Instrument Serif"', 'A'),
    is_Gupta_it: m('italic 200px "Instrument Serif"', 'Gupta'), is_glyphs: m('96px "Instrument Serif"', '0123456789 % + · –'),
    fr_Ahaan: m('340 168px Fraunces', 'Ahaan'), fr_Gupta: m('italic 340 168px Fraunces', 'Gupta'), fr_x: m('340 168px Fraunces', 'x'), fr_A: m('340 168px Fraunces', 'A'),
    loaded: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.style + ' ' + f.weight).filter((v, i, a) => a.indexOf(v) === i),
  };
});
console.log(JSON.stringify(out, null, 1));
// Bricolage needs font-variation-settings, so measure with DOM
const br = await p.evaluate(() => { const r = {}; for (const w of ['AHAAN', 'GUPTA', 'H']) { const s = document.createElement('span'); s.textContent = w; s.style.cssText = "font:800 400px 'Bricolage Grotesque';font-variation-settings:'wdth' 75,'opsz' 96;letter-spacing:-0.02em;position:absolute;white-space:nowrap;line-height:1"; document.body.append(s); r[w] = s.getBoundingClientRect().width; } const c = document.createElement('canvas').getContext('2d'); c.font = "800 400px 'Bricolage Grotesque'"; const t = c.measureText('H'); r.capH_wdth100 = t.actualBoundingBoxAscent; return r; });
console.log(JSON.stringify(br));
await b.close();
