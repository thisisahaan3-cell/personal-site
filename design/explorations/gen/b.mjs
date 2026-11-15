// Generates design/explorations/02-placard.html (compact board: hero, palette and type, one motif).
// Run: node design/explorations/gen/b.mjs
import { write, awards8, committees, bodySentence, schoolLine } from './lib.mjs';

const IMG = '../../public/images/';
const L = 40, W = 1360, colW = (W - 7 * 20) / 8;                 // 8 slots, 20 gutter
const label = (n, name, note) => `<header class="plabel"><b>Panel ${n}. ${name}</b><span>${note}</span></header>`;

/* ---------- hero ---------- */
const FS = 392, CAP = Math.round(FS * 0.672), top1 = 96, base1 = top1 + CAP, base2 = base1 + 28 + CAP;
const pW = colW * 3 + 40, pL = L + W - pW;
const face = 'CBSE GRADE X   99.4%   SCHOOL TOPPER';
const flaps = [...face].map((ch, i) => `<span class="fl${i >= 15 && i <= 19 ? ' sig' : ''}">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
const hero = `
<section class="frame" style="height:900px">
  <nav class="abs mono nav" style="right:${L}px;top:36px"><span>Record</span><span>Projects</span><span>Contact</span><span>Resume</span></nav>
  <svg class="abs" style="left:0;top:0" width="1440" height="760" viewBox="0 0 1440 760" role="img" aria-label="Ahaan Gupta">
    <text class="nm" x="${L - 1}" y="${base1}">AHAAN</text><text class="nm" x="${L - 4}" y="${base2}">GUPTA</text>
  </svg>
  <img class="abs" alt="Portrait of Ahaan Gupta" src="${IMG}portrait.webp" style="left:${pL}px;top:${top1}px;width:${pW}px;height:${base2 - top1}px;object-fit:cover;object-position:50% 18%">
  <p class="abs school" style="left:${L}px;top:${base2 + 24}px">${schoolLine}</p>
  <div class="abs board" style="left:0;top:742px;width:1440px;height:158px">
    <div class="abs flrow" style="left:${L}px;top:26px">${flaps}</div>
    <div class="abs mono legend" style="left:${L}px;top:104px"><span class="chip">Face 1 of 3</span><span><b>Next</b> National Finance Olympiad 2025, AIR 54 of 10,000+ (nationals)</span><span><b>Then</b> 16 delegate awards in the resume's table, 2023 to 2026</span></div>
  </div>
</section>`;

/* ---------- palette and type ---------- */
const tokens = [
  ['Bone', '#F2F0EA', 'Page ground', 'light'], ['Black', '#0B0B0C', 'Type and full-bleed board bands', 'dark'], ['Grey', '#5F5F5C', 'Secondary text', 'dark'],
  ['Line', '#D8D5CC', 'Dividers', 'light'], ['Signal', '#FFC400', 'Board highlights and the active state. Never text on Bone', 'dark'], ['Cobalt', '#1F3FD6', 'Placard face and links', 'dark'],
];
const palette = `<div class="swatches">${tokens.map(([n, h, r, k]) => `<div class="sw"><div class="chipc ${k}" style="background:${h}"></div><b>${n}</b><span class="mono">${h}</span><p>${r}</p></div>`).join('')}</div>`;
const spec = (meta, body) => `<div class="spec"><div class="meta mono">${meta}</div><div>${body}</div></div>`;
const glyphs = '0 1 2 3 4 5 6 7 8 9 &nbsp; % &nbsp; + &nbsp; · &nbsp; –';
const type = `
${spec('Display<br>Bricolage Grotesque 800<br>width 75, capitals<br>shown at 200', `<div class="disp" style="font-size:200px;line-height:176px;margin-left:-4px">AHAAN GUPTA</div>`)}
${spec('Section title<br>Bricolage Grotesque 800<br>88 / 84', `<div class="disp" style="font-size:88px;line-height:92px">MODEL UN AND GEOPOLITICS</div>`)}
${spec('Body<br>Newsreader 400<br>18 / 29', `<p style="max-width:640px">${bodySentence}</p>`)}
${spec('Data label<br>Spline Sans Mono 500<br>13 / 18, tracked .06em', `<div class="mono" style="color:var(--black)">Year &nbsp; Conference &nbsp; Committee &nbsp; Award</div>`)}
${spec('Numerals, display<br>Bricolage Grotesque<br>700 and 800', `<div class="disp" style="font-size:72px;line-height:80px"><span style="font-weight:700">${glyphs}</span><br>${glyphs}</div>`)}
${spec('Numerals, data<br>Spline Sans Mono<br>400 and 500, 24 / 34', `<div style="font:400 24px/34px 'Spline Sans Mono',monospace">${glyphs}<br><span style="font-weight:500">${glyphs}</span></div>`)}`;

/* ---------- motif: the placard ---------- */
const rows = awards8.slice(0, 6).map(([c, k, a, y]) => `<tr><td>${y}</td><td>${c}</td><td>${k}</td><td>${a === 'Best Delegate' ? `<span class="sig">${a}</span>` : a}</td></tr>`).join('');
const motif = `
<section class="frame" style="height:1010px">
  <h2 class="abs disp" style="left:${L - 3}px;top:44px;font-size:88px;line-height:88px">MODEL UN AND GEOPOLITICS</h2>
  <p class="abs" style="left:${L + 5 * (colW + 20)}px;top:44px;width:${3 * colW + 40}px">20+ conferences and 19+ awards, in the resume's own summary. Its table lists 16 delegate awards from 2023 to 2026.</p>
  <div class="abs placard" style="left:${L}px;top:168px;width:${W}px;height:360px">
    <span class="abs mono" style="left:24px;top:20px">Committee</span><span class="abs mono" style="right:24px;top:20px">1 of 12</span>
    <svg class="abs" style="left:0;top:0" width="${W}" height="360" viewBox="0 0 ${W} 360"><text class="pl" x="${W / 2}" y="296" text-anchor="middle">UNGA</text></svg>
  </div>
  <ol class="abs slots mono" style="left:${L}px;top:528px;width:${W}px">${committees.map((c, i) => `<li${i === 0 ? ' class="on"' : ''}>${c}</li>`).join('')}</ol>
  <div class="abs board" style="left:0;top:612px;width:1440px;height:398px">
    <table class="abs rec" style="left:${L}px;top:30px;width:${W}px">
      <thead><tr><th style="width:150px">Year</th><th>Conference</th><th style="width:300px">Committee</th><th style="width:280px">Award</th></tr></thead>
      <tbody>${rows}<tr class="ph"><td>Placeholder</td><td>Ahaan's note on Model UN</td><td>To be written by Ahaan</td><td><span class="wait">Awaited</span></td></tr></tbody>
    </table>
  </div>
</section>`;

const css = `
:root{--bone:#F2F0EA;--black:#0B0B0C;--grey:#5F5F5C;--line:#D8D5CC;--signal:#FFC400;--cobalt:#1F3FD6}
*{box-sizing:border-box;margin:0;padding:0}
html{background:var(--bone)}
body{width:1440px;margin:0 auto;background:var(--bone);color:var(--black);font:400 18px/29px "Newsreader",serif;-webkit-font-smoothing:antialiased}
.disp,.nm,.pl{font-family:"Bricolage Grotesque",sans-serif;font-weight:800;font-variation-settings:"wdth" 75,"opsz" 96;letter-spacing:-.02em;text-transform:uppercase}
.disp{white-space:nowrap}
.mono{font:500 13px/18px "Spline Sans Mono",monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--grey)}
.abs{position:absolute}
.board-head{padding:72px 120px 8px;display:grid;grid-template-columns:1fr 486px;column-gap:48px;align-items:end}
.board-head h1{font-size:112px;line-height:96px}
.board-head p{font-size:17px;line-height:26px;color:var(--grey)}
.board-head .mono{margin-bottom:20px}
.plabel{margin:104px 120px 0;padding:18px 0;border-top:1px solid var(--black);display:flex;gap:28px;align-items:baseline;font:400 15px/22px "Newsreader",serif}
.plabel b{font-weight:500;white-space:nowrap}.plabel span{color:var(--grey)}
.frame{position:relative;width:1440px;overflow:hidden;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.nav{display:flex;gap:32px}
.nm{font-size:${FS}px;fill:var(--black)}
.school{font-size:18px;line-height:29px}
.board{background:var(--black);color:var(--bone)}
.flrow{display:flex;gap:3px}
.fl{position:relative;isolation:isolate;display:block;width:34px;height:54px;background:#1B1B1D;color:var(--bone);font:500 30px/54px "Spline Sans Mono",monospace;text-align:center}
.fl::after{content:"";position:absolute;left:0;right:0;top:26px;height:2px;background:var(--black);z-index:-1}
.fl.sig::after{background:#D9A700}
.fl.sig{background:var(--signal);color:var(--black)}
.legend{display:flex;gap:36px;align-items:center;color:var(--line)}
.legend b{font-weight:500;color:var(--signal);margin-right:10px}
.legend .chip{border:1px solid var(--line);padding:3px 10px}
.swatches{margin:0 120px;display:grid;grid-template-columns:repeat(6,1fr);gap:36px 24px}
.sw .chipc{height:96px;margin-bottom:12px}.sw .chipc.light{border:1px solid var(--line)}
.sw b{display:block;font:500 16px/22px "Newsreader",serif}.sw p{font-size:14px;line-height:19px;color:var(--grey);margin-top:6px}
.spec{margin:0 120px;padding:28px 0;border-top:1px solid var(--line);display:grid;grid-template-columns:230px 1fr;align-items:center}
.spec .meta{line-height:20px}
.placard{background:var(--cobalt);color:var(--bone)}
.placard .mono{color:var(--bone)}
.pl{font-size:330px;fill:var(--bone)}
.slots{list-style:none;display:grid;grid-template-columns:repeat(12,1fr);border-bottom:1px solid var(--line)}
.slots li{height:52px;line-height:52px;text-align:center;color:var(--black);border-left:1px solid var(--line)}
.slots li:last-child{border-right:1px solid var(--line)}
.slots li.on{background:var(--signal)}
table{border-collapse:collapse}
.rec th{font:500 13px/18px "Spline Sans Mono",monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--line);text-align:left;padding-bottom:12px;border-bottom:1px solid #3A3A3C}
.rec td{height:44px;font:400 15px/20px "Spline Sans Mono",monospace;letter-spacing:.04em;text-transform:uppercase;border-bottom:1px solid #2A2A2C;white-space:nowrap}
.rec .sig{background:var(--signal);color:var(--black);padding:4px 10px;font-weight:500}
.rec .ph td{color:var(--line);border-bottom:0}
.rec .wait{border:1px solid var(--signal);color:var(--signal);padding:3px 9px}
.foot{margin:104px 120px 0;padding:18px 0 72px;border-top:1px solid var(--black);font:400 15px/22px "Newsreader",serif;color:var(--grey)}
`;

write('02-placard.html', `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>02 Placard: direction board for Ahaan Gupta's portfolio</title>
<meta name="viewport" content="width=1440">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Spline+Sans+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>
<header class="board-head">
  <div><div class="mono">Reference board 02, direction B. Compact static study, not final</div><h1 class="disp">PLACARD</h1></div>
  <p>Everything he has done, set in the language of public information systems: the conference placard, the departures board and the timing tower.</p>
</header>

${label(1, 'Hero at 1440 × 900', 'End state of the entrance. The board row shows the first of its three faces.')}
${hero}

${label(2, 'Palette and type', 'Every token as a flat swatch, then the scale.')}
${palette}
<div style="height:64px"></div>
${type}

${label(3, 'One interest study: Model UN and geopolitics', 'The Cobalt placard at full width, the committees as slots, and six rows of the awards table as a board with the placeholder as its last row.')}
${motif}

<footer class="foot">Compact board: the 390 hero, the ranking board and the departures board are not drawn here. Facts from content/research/facts.md.</footer>
</body>
</html>
`);
