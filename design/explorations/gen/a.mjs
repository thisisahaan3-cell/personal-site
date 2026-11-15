// Generates design/explorations/01-almanac.html (compact board: hero, palette and type, one motif).
// Run: node design/explorations/gen/a.mjs
import { write, mollweide, runs, f, committees, bodySentence, schoolLine } from './lib.mjs';

const col = n => 120 + (n - 1) * 102, R = 1320, C3 = col(3);
const IMG = '../../public/images/';
const label = (n, name, note) => `<header class="plabel"><b>Panel ${n}. ${name}</b><span>${note}</span></header>`;

/* ---------- hero ---------- */
const contents = [['About', 2], ['Academics', 3], ['Timeline', 4], ['Model UN', 5], ['Leadership', 6], ['Competitions', 7], ['Interests', 8], ['Contact', 9]];
const hero = `
<section class="frame" style="height:900px">
  <div class="abs rule-ink" style="left:120px;top:64px;width:1200px"></div>
  <div class="abs mono" style="left:120px;top:38px">Folio 1</div>
  <div class="abs mono" style="left:${C3}px;top:38px">Contents and plates</div>
  <div class="abs mono" style="right:120px;top:38px">Gurugram</div>
  <h1 class="abs disp name" style="left:${C3 - 3}px;top:128px">Ahaan<br><i>Gupta</i></h1>
  <p class="abs school" style="left:${C3}px;top:500px">${schoolLine}</p>
  <figure class="abs plate" style="left:${R - 376}px;top:104px"><img alt="Portrait of Ahaan Gupta" src="${IMG}portrait.webp" width="360" height="450"><figcaption><span class="mono ox">Plate I</span><span>Ahaan Gupta</span></figcaption></figure>
  <div class="abs mono" style="left:120px;top:669px">Contents</div>
  <ol class="abs toc" style="left:${C3}px;top:652px;width:${R - C3}px">${contents.map(([n, p]) => `<li><span>${n}</span><i></i><b>${p}</b></li>`).join('')}</ol>
  <div class="abs strip" style="left:0;top:752px;width:1440px;height:148px">
    <div class="abs mono amber" style="left:120px;top:36px">From the record</div>
    <dl class="abs" style="left:${C3}px;top:20px;width:${R - C3}px">
      <div><dt class="disp">99.4%</dt><dd>in CBSE Grade X Secondary Examinations (2025–26)</dd></div>
      <div><dt class="disp">16</dt><dd>delegate awards in the resume's table, 2023 to 2026</dd></div>
      <div><dt class="disp">400+</dt><dd>books read across fiction, non-fiction and philosophy</dd></div>
    </dl>
  </div>
</section>`;

/* ---------- palette and type ---------- */
const tokens = [
  ['Paper', '#EFEADD', 'Page ground', 'light'], ['Ink', '#16181A', 'Text, rules', 'dark'], ['Margin', '#5E5A50', 'Secondary text', 'dark'], ['Rule', '#CFC8B6', 'Hairlines, table rules', 'light'],
  ['Oxblood', '#8C2B1E', 'The one accent: plate numbers, the active timeline entry, links', 'dark'], ['Bottle', '#1F4D3A', 'Second ink, inside plates only', 'dark'],
  ['Panel', '#14171A', 'The single dark element, the instrument strip', 'dark'], ['Amber', '#E8B04A', 'Text on Panel only', 'dark'],
];
const palette = `<div class="swatches">${tokens.map(([n, h, r, k]) => `<div class="sw"><div class="chip ${k}" style="background:${h}"></div><b>${n}</b><span class="mono">${h}</span><p>${r}</p></div>`).join('')}</div>`;
const spec = (meta, body) => `<div class="spec"><div class="meta mono">${meta}</div><div>${body}</div></div>`;
const glyphs = '0 1 2 3 4 5 6 7 8 9 &nbsp; % &nbsp; + &nbsp; · &nbsp; –';
const type = `
${spec('Display<br>Fraunces 340<br>opsz 144, SOFT 0<br>168 / 150', `<div class="disp" style="font-size:168px;line-height:176px;letter-spacing:-.03em;margin-left:-4px">Ahaan <i>Gupta</i></div>`)}
${spec('Section title<br>Fraunces 340<br>72 / 76', `<div class="disp" style="font-size:72px;line-height:84px;letter-spacing:-.02em">Model UN and <i>public speaking</i></div>`)}
${spec('Body<br>Hanken Grotesk 400<br>17 / 28', `<p style="max-width:640px">${bodySentence}</p>`)}
${spec('Data label<br>IBM Plex Mono 500<br>11 / 16, tracked .12em', `<div class="mono" style="color:var(--ink)">Plate VII &nbsp; Folio 5 &nbsp; Delegate awards, 2023 to 2026</div>`)}
${spec('Numerals, display<br>Fraunces 340<br>roman, then italic', `<div class="disp" style="font-size:64px;line-height:76px">${glyphs}<br><i>${glyphs}</i></div>`)}
${spec('Table figures<br>Fraunces 400, 28<br>optical size auto<br>and IBM Plex Mono 18', `<div class="disp sm" style="font-size:28px;line-height:40px;font-variant-numeric:tabular-nums">${glyphs}</div><div style="font:400 18px/32px 'IBM Plex Mono',monospace">${glyphs}</div>`)}`;

/* ---------- motif: the graticule plate ---------- */
const proj = { R: 108, cx: 644, cy: 452 };
let grat = '';
for (let lon = -150; lon <= 150; lon += 30) { const s = []; for (let lat = -90; lat <= 90; lat += 2) s.push(mollweide(lat, lon, proj)); grat += runs(s); }
for (let lat = -75; lat <= 75; lat += 15) { const a = mollweide(lat, -180, proj), b = mollweide(lat, 180, proj); grat += `M${f(a.x)} ${f(a.y)}L${f(b.x)} ${f(b.y)}`; }
const rad = d => d * Math.PI / 180;
const gc = (a, b, n = 72) => {
  const v = ([lat, lon]) => [Math.cos(rad(lat)) * Math.cos(rad(lon)), Math.cos(rad(lat)) * Math.sin(rad(lon)), Math.sin(rad(lat))];
  const A = v(a), B = v(b), om = Math.acos(A[0] * B[0] + A[1] * B[1] + A[2] * B[2]), s = [];
  for (let i = 0; i <= n; i++) { const t = i / n, k1 = Math.sin((1 - t) * om) / Math.sin(om), k2 = Math.sin(t * om) / Math.sin(om), p = [k1 * A[0] + k2 * B[0], k1 * A[1] + k2 * B[1], k1 * A[2] + k2 * B[2]]; s.push(mollweide(Math.asin(p[2]) * 180 / Math.PI, Math.atan2(p[1], p[0]) * 180 / Math.PI, proj)); }
  return runs(s);
};
const P = { a: [50, -120], b: [38, 14], c: [-25, 128], d: [12, 72], e: [-32, -52], g: [58, 104] };
const arcs = [['a', 'b'], ['d', 'c'], ['e', 'b'], ['b', 'g']].map(([p, q]) => `<path class="eng" d="${gc(P[p], P[q])}"/>`).join('') + `<path class="eng ox" d="${gc(P.b, P.d)}"/>`;
const dots = Object.entries(P).map(([k, p]) => { const s = mollweide(p[0], p[1], proj); return `<circle class="${k === 'b' ? 'pt ox' : 'pt'}" cx="${f(s.x)}" cy="${f(s.y)}" r="${k === 'b' ? 4 : 3}"/>`; }).join('');
const hw = 2 * Math.SQRT2 * proj.R, hh = Math.SQRT2 * proj.R, H = 724;
const motif = `
<section class="frame" style="height:${H}px">
  <div class="abs rule-ink" style="left:120px;top:48px;width:1200px"></div>
  <div class="abs mono ox" style="left:120px;top:70px">Plate VII</div>
  <div class="abs mono" style="left:120px;top:92px">Folio 8</div>
  <h2 class="abs disp ch" style="left:${C3 - 2}px;top:62px">Model UN and <i>geopolitics</i></h2>
  <p class="abs" style="left:${C3}px;top:158px;width:620px">20+ conferences and 19+ awards, in the resume's own summary. Its table lists 16 delegate awards from 2023 to 2026.</p>
  <svg class="abs" style="left:0;top:0" width="1440" height="${H}" viewBox="0 0 1440 ${H}">
    <rect class="key" x="${C3}" y="256" width="640" height="392"/><rect class="key2" x="${C3 + 6}" y="262" width="628" height="380"/>
    <ellipse class="sea" cx="${proj.cx}" cy="${proj.cy}" rx="${f(hw)}" ry="${f(hh)}"/>
    <path class="grat" d="${grat}"/>
    <ellipse class="eng" cx="${proj.cx}" cy="${proj.cy}" rx="${f(hw)}" ry="${f(hh)}"/>
    ${arcs}${dots}
  </svg>
  <p class="abs cap" style="left:${C3}px;top:662px;width:640px">A graticule with great-circle arcs. No borders are drawn and the points are unnamed.</p>
  <div class="abs roll" style="left:${col(10)}px;top:256px;width:${R - col(10)}px"><div class="mono">Roll of committees</div><ol>${committees.map(c => `<li class="disp sm">${c}</li>`).join('')}</ol></div>
  <div class="abs memo" style="left:120px;top:470px;width:168px"><div class="mono">Memoranda</div><p class="disp sm"><i>[Placeholder. His note on Model UN, to be written by Ahaan.]</i></p><i></i><i></i><i></i></div>
</section>`;

const css = `
:root{--paper:#EFEADD;--ink:#16181A;--margin:#5E5A50;--rule:#CFC8B6;--ox:#8C2B1E;--bottle:#1F4D3A;--panel:#14171A;--amber:#E8B04A}
*{box-sizing:border-box;margin:0;padding:0}
html{background:var(--paper)}
body{width:1440px;margin:0 auto;background:var(--paper);color:var(--ink);font:400 17px/28px "Hanken Grotesk",sans-serif;-webkit-font-smoothing:antialiased}
.disp{font-family:"Fraunces",serif;font-weight:340;font-variation-settings:"opsz" 144,"SOFT" 0}
.disp.sm{font-variation-settings:"SOFT" 0;font-optical-sizing:auto;font-weight:400}
.mono{font:500 11px/16px "IBM Plex Mono",monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--margin)}
.mono.ox,.ox{color:var(--ox)}.mono.amber{color:var(--amber)}
.abs{position:absolute}
.board-head{padding:72px 120px 8px;display:grid;grid-template-columns:1fr 486px;column-gap:48px;align-items:end}
.board-head h1{font-size:96px;line-height:96px;letter-spacing:-.03em}
.board-head p{font-size:16px;line-height:26px;color:var(--margin)}
.board-head .mono{margin-bottom:20px}
.plabel{margin:104px 120px 0;padding:18px 0;border-top:1px solid var(--ink);display:flex;gap:28px;align-items:baseline;font-size:14px;line-height:22px}
.plabel b{font-weight:500;white-space:nowrap}.plabel span{color:var(--margin)}
.frame{position:relative;width:1440px;overflow:hidden;border-top:1px solid var(--rule);border-bottom:1px solid var(--rule)}
.rule-ink{height:1px;background:var(--ink)}
.name{font-size:168px;line-height:150px;letter-spacing:-.035em;white-space:nowrap}
.school{font-size:17px;line-height:28px}
.plate{padding:7px;border:1px solid var(--ink)}
.plate img{display:block;object-fit:cover;object-position:50% 20%}
.plate figcaption{position:absolute;left:0;top:100%;margin-top:12px;display:flex;gap:14px;align-items:baseline;font-size:14px;line-height:20px;color:var(--margin);white-space:nowrap}
.toc{list-style:none;display:flex;gap:22px;padding:14px 0;border-top:1px solid var(--rule);border-bottom:1px solid var(--rule);font-size:14px;line-height:22px}
.toc li{flex:1;display:flex;align-items:baseline;gap:5px;min-width:0}
.toc li i{flex:1;border-bottom:1px dotted var(--margin);transform:translateY(-4px)}
.toc li b{font:500 12px/22px "IBM Plex Mono",monospace;color:var(--ox)}
.strip{background:var(--panel);color:var(--paper)}
.strip dl{display:grid;grid-template-columns:repeat(3,1fr);column-gap:24px}
.strip dt{font-size:54px;line-height:56px;color:var(--amber);letter-spacing:-.02em}
.strip dd{font-size:14px;line-height:20px;margin-top:6px;max-width:250px}
.swatches{margin:0 120px;display:grid;grid-template-columns:repeat(4,1fr);gap:36px 24px}
.sw .chip{height:96px;margin-bottom:12px}.sw .chip.light{border:1px solid var(--rule)}
.sw b{display:block;font-weight:500;font-size:15px;line-height:22px}.sw p{font-size:13px;line-height:19px;color:var(--margin);margin-top:6px}
.spec{margin:0 120px;padding:28px 0;border-top:1px solid var(--rule);display:grid;grid-template-columns:204px 1fr;align-items:center}
.spec .meta{line-height:19px}
.ch{font-size:64px;line-height:72px;letter-spacing:-.02em;white-space:nowrap}
.cap{font-size:13px;line-height:19px;color:var(--margin)}
.key{fill:none;stroke:var(--ink);stroke-width:1}.key2{fill:none;stroke:var(--rule);stroke-width:1}
.sea{fill:var(--bottle);fill-opacity:.12}
.grat{fill:none;stroke:var(--ink);stroke-width:.6;stroke-opacity:.55}
.eng{fill:none;stroke:var(--ink);stroke-width:1}
.eng.ox{stroke:var(--ox);stroke-width:1.5}
.pt{fill:var(--ink);stroke:var(--paper);stroke-width:1.5}.pt.ox{fill:var(--ox)}
.roll ol{list-style:none;margin-top:10px;border-top:1px solid var(--ink)}
.roll li{font-size:22px;line-height:30px;border-bottom:1px solid var(--rule);padding:0 0 1px}
.memo p{font-size:15px;line-height:21px;color:var(--margin);margin:8px 0 2px}
.memo>i{display:block;height:22px;border-bottom:1px dotted var(--margin)}
.foot{margin:104px 120px 0;padding:18px 0 72px;border-top:1px solid var(--ink);font-size:14px;line-height:22px;color:var(--margin)}
`;

write('01-almanac.html', `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>01 Almanac: direction board for Ahaan Gupta's portfolio</title>
<meta name="viewport" content="width=1440">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..600,0..100;1,9..144,300..600,0..100&family=Hanken+Grotesk:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>
<header class="board-head">
  <div><div class="mono">Reference board 01, direction A. Compact static study, not final</div><h1 class="disp">Almanac</h1></div>
  <p>The site as a single-subject reference volume: one person set out the way an almanac sets out a year, with plates, tables and marginal notes.</p>
</header>

${label(1, 'Hero at 1440 × 900', 'End state of the entrance.')}
${hero}

${label(2, 'Palette and type', 'Every token as a flat swatch, then the scale.')}
${palette}
<div style="height:64px"></div>
${type}

${label(3, 'One interest study: Model UN and geopolitics', 'A numbered plate in the engraving style, with the committees set as a roll and the placeholder as a memoranda block.')}
${motif}

<footer class="foot">Compact board: the awards record, the 390 hero and the finance and aviation plates are not drawn here. Facts from content/research/facts.md.</footer>
</body>
</html>
`);
