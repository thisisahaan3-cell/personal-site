// Generates design/explorations/03-meridian.html (static, no script in the output).
// Run: node design/explorations/gen/c.mjs
import { write, fillet, rng, graticule, greatCircle, ortho, f, esc, awards8, committees, bodySentence, schoolLine } from './lib.mjs';

const M = 210;                                   // the meridian: boundary of columns 1 and 2
const col = n => 120 + (n - 1) * 102;            // left edge of column n (78 wide, 24 gutter)
const R = 1320;                                  // right edge of the content
const IMG = '../../public/images/';

const label = (n, name, note) => `<header class="plabel"><b>Panel ${n}. ${name}</b><span>${note}</span></header>`;
const sub = (name, note) => `<header class="plabel sub"><b>${name}</b><span>${note}</span></header>`;
const vlabel = (y, text, night) => `<text class="m${night ? ' on-night' : ''}" transform="translate(${M - 10} ${y}) rotate(-90)">${esc(text)}</text>`;

/* ---------- Panel 1: hero at 1440 ---------- */
const heroY1 = 590, heroR = 52, heroY2 = heroY1 + heroR * 2;
const heroLine = `M${col(2)} ${heroY1}H${R + 12}A${heroR} ${heroR} 0 0 1 ${R + 12} ${heroY2}H${M + 24}A24 24 0 0 0 ${M} ${heroY2 + 24}V840`;
const hero = `
<section class="frame" style="height:900px">
  <nav class="abs nav" style="right:120px;top:44px"><span>Record</span><span>Projects</span><span>Contact</span><span>Resume</span></nav>
  <svg class="fig" width="1440" height="900" viewBox="0 0 1440 900"><path class="ln" d="${heroLine}"/><circle class="dot" cx="${M}" cy="840" r="4.5"/></svg>
  <h1 class="abs serif name" style="left:${col(2) - 4}px;top:196px">Ahaan<br><i>Gupta</i></h1>
  <p class="abs school" style="left:${col(2)}px;top:${heroY1 + 37}px">${schoolLine}</p>
  <img class="abs" alt="Portrait of Ahaan Gupta" src="${IMG}portrait.webp" style="left:${col(9)}px;top:248px;width:384px;height:480px;object-fit:cover;object-position:50% 20%">
</section>`;

/* ---------- Panel 2: hero at 390 ---------- */
const mLine = `M20 262H338A24 24 0 0 1 362 286V600A24 24 0 0 1 338 624H44A24 24 0 0 0 20 648V812`;
const mobile = `
<div class="p2">
  <div class="phone">
    <div class="abs nav" style="right:20px;top:26px"><span>Menu</span></div>
    <svg class="fig" width="390" height="844" viewBox="0 0 390 844"><path class="ln" d="${mLine}"/><circle class="dot" cx="20" cy="812" r="4"/></svg>
    <h1 class="abs serif name" style="left:18px;top:96px;font-size:76px;line-height:66px">Ahaan<br><i>Gupta</i></h1>
    <p class="abs school" style="left:20px;top:280px;width:290px;font-size:15px;line-height:22px">${schoolLine}</p>
    <img class="abs" alt="Portrait of Ahaan Gupta" src="${IMG}portrait.webp" style="left:56px;top:356px;width:334px;height:417.5px;object-fit:cover;object-position:50% 20%">
  </div>
  <div class="notes">
    <h3 class="serif">What the two heroes show</h3>
    <p>The end state of the entrance. The line starts as the rule under the name, passes behind the portrait, turns in the right margin, comes back behind the portrait and settles on the meridian, where it stops at a dot.</p>
    <p>The portrait is in columns 9 to 12 at 384 px, cropped 4:5. The source file is 797 px wide, so it stays sharp at this size; it ends above a 900 px fold instead of running past it.</p>
    <p>At 390 the meridian is 20 px from the left edge for the whole page. The name starts on it, the portrait is inset 56 px so the line can run beside it, and the line's turn is hidden behind the portrait.</p>
    <p>Nothing else is on the hero: no tagline, no index, no figures.</p>
  </div>
</div>`;

/* ---------- Panel 3: palette and type ---------- */
const tokens = [
  ['Stone', '#F6F5F1', 'Page ground', 'light'], ['Navy', '#0F1B2D', 'All text', 'dark'], ['Slate', '#55606F', 'Secondary text', 'dark'],
  ['Hairline', '#D9D8D2', 'Grids, table rules, graticules', 'light'], ['Sky', '#E9EEF3', 'Quiet fill behind a figure', 'light'],
  ['Line', '#E8451E', 'The line, and nothing else. Never text', 'dark'], ['Line ink', '#B8330F', 'The same hue for text: links, active labels', 'dark'],
  ['Night', '#0B1424', 'Ground of the one dark chapter', 'dark'], ['Night text', '#E9EDF2', 'Text on Night', 'light'],
  ['Night secondary', '#9AA6B5', 'Secondary text on Night', 'light'], ['Line on Night', '#FF6A3D', 'The line on Night', 'dark'],
];
const palette = `<div class="swatches">${tokens.map(([n, h, r, k]) => `<div class="sw"><div class="chip ${k}" style="background:${h}"></div><b>${n}</b><span class="mono">${h}</span><p>${r}</p></div>`).join('')}</div>`;
const spec = (meta, body) => `<div class="spec"><div class="meta mono">${meta}</div><div>${body}</div></div>`;
const glyphs = '0 1 2 3 4 5 6 7 8 9 &nbsp; % &nbsp; + &nbsp; · &nbsp; –';
const type = `
${spec('Display<br>Instrument Serif 400<br>200 / 172<br>roman and italic', `<div class="serif" style="font-size:200px;line-height:190px;letter-spacing:-.01em;margin-left:-6px">Ahaan <i>Gupta</i></div>`)}
${spec('Chapter title<br>Instrument Serif<br>96 / 96', `<div class="serif" style="font-size:96px;line-height:104px">Model UN and <i>geopolitics</i></div>`)}
${spec('Body<br>Geist 400<br>18 / 30', `<p style="font-size:18px;line-height:30px;max-width:660px">${bodySentence}</p>`)}
${spec('Data label<br>Geist Mono 400<br>12 / 16, tracked .06em', `<div class="mono">Delegate awards, cumulative, 2023 to 2026</div>`)}
${spec('Numerals, display<br>Instrument Serif<br>roman, then italic', `<div class="serif" style="font-size:72px;line-height:84px">${glyphs}<br><i>${glyphs}</i></div>`)}
${spec('Numerals, data<br>Geist Mono 400 and 500<br>24 / 32', `<div style="font:400 24px/36px 'Geist Mono',monospace;letter-spacing:.04em">${glyphs}<br><span style="font-weight:500">${glyphs}</span></div>`)}
${spec('Law only<br>Instrument Serif<br>at text size, 24 / 34', `<p class="serif" style="font-size:24px;line-height:34px;max-width:660px">Completed an 8-week course on introductory legal concepts.</p>`)}`;

/* ---------- Panel 4: the record ---------- */
const recH = 880;
const record = `
<section class="frame" style="height:${recH}px">
  <svg class="fig" width="1440" height="${recH}" viewBox="0 0 1440 ${recH}"><path class="ln" d="M${M} 0V${recH}"/>${vlabel(250, 'Model UN and public speaking')}</svg>
  <h2 class="abs serif ch" style="left:${col(2)}px;top:56px">The <i>record</i></h2>
  <p class="abs txt" style="left:${col(7)}px;top:76px;width:560px">The resume's table lists 16 delegate awards from 2023 to 2026. Rows 1 to 8 are shown here in the resume's order; rows 9 to 16 follow in the build.</p>
  <div class="abs sort" style="left:${col(2)}px;top:186px">Sort by <u>resume order</u><span>year</span><span>level</span><span>committee</span></div>
  <table class="abs rec" style="left:${col(2)}px;top:226px;width:${R - col(2)}px">
    <thead><tr><th style="width:44%">Conference</th><th style="width:22%">Committee</th><th style="width:22%">Award</th><th class="r">Year</th></tr></thead>
    <tbody>${awards8.map(([c, k, a, y]) => {
      const m = c.match(/^(.*?)\s*\((.*)\)$/); const m2 = k.match(/^(.*?)\s*\((.*)\)$/);
      return `<tr><td class="serif conf">${m ? `${m[1]} <small>${m[2]}</small>` : c}</td><td class="com">${m2 ? `${m2[1]} <small>${m2[2]}</small>` : k}</td><td>${a}</td><td class="serif yr r">${y}</td></tr>`;
    }).join('')}</tbody>
  </table>
</section>`;

/* ---------- Panel 5a: finance, the stepped series ---------- */
const finH = 900, B = 500, U = 18, lev = v => B - U * v;
const xs = [282, 412, 542, 672, 802], vals = [2, 7, 13, 16], adds = ['+2', '+5', '+6', '+3'];
let step = `M${M} 0V${B - 24}A24 24 0 0 0 ${M + 24} ${B}H${xs[0]}`;
vals.forEach((v, i) => { step += `V${lev(v)}H${i < 3 ? xs[i + 1] : 1010}`; });
step += `A30 30 0 0 1 1040 ${lev(16) + 30}V530A30 30 0 0 1 1010 560H${M + 24}A24 24 0 0 0 ${M} 584V${finH}`;
const grid = [4, 8, 12, 16].map(v => `<path class="hl" d="M${xs[0]} ${lev(v)}H${xs[4]}"/><text class="m" x="${xs[0] - 12}" y="${lev(v) + 4}" text-anchor="end">${v}</text>`).join('')
  + `<path class="hl" d="M${xs[0]} ${B}H${xs[4]}"/>` + xs.map(x => `<path class="hl" d="M${x} ${B}v7"/>`).join('');
const stepLabels = vals.map((v, i) => `<text x="${xs[i] + 14}" y="${lev(v) - 14}"><tspan class="num">${v}</tspan><tspan class="m" dx="10" dy="-1">${adds[i]}</tspan></text><text class="m" x="${(xs[i] + xs[i + 1]) / 2}" y="${B + 26}" text-anchor="middle">${2023 + i}</text>`).join('');
const finance = `
<section class="frame" style="height:${finH}px">
  <svg class="fig" width="1440" height="${finH}" viewBox="0 0 1440 ${finH}">
    ${grid}
    <path class="ln" d="${step}"/>
    ${stepLabels}
    <text class="m" x="${xs[0]}" y="172">Delegate awards, cumulative</text>
    ${vlabel(300, 'Competitions and projects')}
  </svg>
  <h2 class="abs serif ch" style="left:${col(2)}px;top:48px">Finance and <i>economics</i></h2>
  <img class="abs shot" alt="Home page of Artha, the finance website he built" src="${IMG}artha-home.webp" style="left:${col(8)}px;top:300px;width:486px;height:303.75px">
  <table class="abs res" style="left:${col(2)}px;top:636px;width:588px">
    <thead><tr><th>Competition</th><th>Result</th></tr></thead>
    <tbody>
      <tr><td rowspan="2">National Finance Olympiad 2025</td><td class="serif">AIR 10 <small>round 1</small></td></tr>
      <tr><td class="serif">AIR 54 of 10,000+ <small>nationals</small></td></tr>
      <tr><td>SRCC Finance Olympiad 2025</td><td class="serif">AIR 46</td></tr>
      <tr><td>SRCC FIC fellowship</td><td class="serif">100 chosen from 2,000</td></tr>
    </tbody>
  </table>
  <div class="abs txt" style="left:${col(8)}px;top:636px;width:486px"><h3 class="serif">Artha</h3><p>A finance website he built as a portfolio project.</p><p><a>artha-finance.netlify.app</a></p></div>
</section>`;

/* ---------- Panel 5b: aviation on Night ---------- */
const avH = 700;
const F = [1090, 250], P3 = [800, 300];
const dl = Math.hypot(F[0] - P3[0], F[1] - P3[1]), d = [(F[0] - P3[0]) / dl, (F[1] - P3[1]) / dl], nr = [-d[1], d[0]];
const rho = 32, L = 150;
const hA = [F[0] + 2 * rho * nr[0], F[1] + 2 * rho * nr[1]];          // after the first 180
const hB = [hA[0] - L * d[0], hA[1] - L * d[1]];                       // end of the outbound leg
const hC = [F[0] - L * d[0], F[1] - L * d[1]];                         // back on the inbound course
const P5 = [F[0] + 150 * d[0], F[1] + 150 * d[1]];
const routeA = fillet([[M, 0], [M, 150, 120], [500, 318, 10], [P3[0], P3[1], 10], [F[0], F[1]]]);
const hold = `M${f(F[0])} ${f(F[1])}A${rho} ${rho} 0 0 1 ${f(hA[0])} ${f(hA[1])}L${f(hB[0])} ${f(hB[1])}A${rho} ${rho} 0 0 1 ${f(hC[0])} ${f(hC[1])}`;
const routeB = fillet([[F[0], F[1]], [P5[0], P5[1], 70], [1250, 470, 90], [960, 612, 120], [M, 612, 24], [M, avH]]);
const tri = (x, y, s = 9) => `<path class="wp" d="M${f(x)} ${f(y - s)}L${f(x + s * 0.92)} ${f(y + s * 0.62)}L${f(x - s * 0.92)} ${f(y + s * 0.62)}Z"/>`;
const rings = [170, 340, 510, 680, 850, 1020].map(r => `<circle class="nh" cx="${M}" cy="96" r="${r}"/>`).join('');
let tape = `<path class="nh2" d="M${col(2)} 44H${R}"/>`;
for (let i = 0; i <= 36; i++) { const x = col(2) + (R - col(2)) * i / 36, major = i % 9 === 0, mid = i % 3 === 0; tape += `<path class="nh2" d="M${f(x)} 44v${major ? 16 : mid ? 10 : 6}"/>`; }
tape += ['W', 'NW', 'N', 'NE', 'E'].map((t, i) => `<text class="m on-night" x="${f(col(2) + (R - col(2)) * i / 4)}" y="80" text-anchor="${i === 0 ? 'start' : i === 4 ? 'end' : 'middle'}">${t}</text>`).join('');
tape += `<path class="caret" d="M${(col(2) + R) / 2 - 6} 30h12l-6 9z"/>`;
const aviation = `
<section class="frame night" style="height:${avH}px">
  <svg class="fig" width="1440" height="${avH}" viewBox="0 0 1440 ${avH}">
    ${rings}
    <path class="nh2" d="M${M - 7} 96h14"/>
    ${tape}
    <path class="ln" d="${routeA}"/><path class="ln" d="${hold}"/><path class="ln" d="${routeB}"/>
    ${tri(500, 318)}${tri(P3[0], P3[1])}${tri(F[0], F[1])}${tri(1113, 537)}${tri(640, 612)}
    ${vlabel(132, 'Night', true)}
  </svg>
  <h2 class="abs serif ch" style="left:${col(2)}px;top:376px">Aviation</h2>
  <div class="abs txt" style="left:${col(2)}px;top:476px;width:400px"><p>IIT Madras certification, Fundamentals of Aerospace, 2025. An 8-week course on introductory aerospace concepts.</p></div>
  <p class="abs cap" style="right:120px;bottom:28px;width:250px;text-align:right">Schematic route. The waypoints are unnamed and no journey is shown.</p>
</section>`;

/* ---------- Panel 5c: MUN and geopolitics ---------- */
const munH = 920, proj = { lat0: 24, lon0: 0, R: 300, cx: M, cy: 380 };
const pts = { a: [58, -22], b: [44, 52], c: [8, 14], d: [-18, 58], e: [26, 70], g: [-34, 4] };
const arcs = [['a', 'b'], ['c', 'e'], ['g', 'd'], ['c', 'b']].map(([p, q]) => `<path class="gc" d="${greatCircle(pts[p], pts[q], proj)}"/>`).join('');
const dots = Object.values(pts).map(p => { const s = ortho(p[0], p[1], proj); return `<circle class="pt" cx="${f(s.x)}" cy="${f(s.y)}" r="3.5"/>`; }).join('');
const plY = 754, plW = 320, plH = 124;
const mun = `
<section class="frame" style="height:${munH}px">
  <svg class="fig" width="1440" height="${munH}" viewBox="0 0 1440 ${munH}">
    <path class="hl" d="${graticule(proj, { skipLon: [0, -180] })}"/>
    <circle class="limb" cx="${proj.cx}" cy="${proj.cy}" r="${proj.R}"/>
    ${arcs}
    <path class="ln" d="M${M} 0V${munH}"/>
    ${dots}
    <rect class="plac" x="${M - plW / 2}" y="${plY}" width="${plW}" height="${plH}"/>
    <rect class="plac-in" x="${M - plW / 2 + 7}" y="${plY + 7}" width="${plW - 14}" height="${plH - 14}"/>
    <text class="plac-t" x="${M}" y="${plY + 86}" text-anchor="middle">UNGA</text>
  </svg>
  <h2 class="abs serif ch" style="left:${col(6)}px;top:150px">Model UN and <i>geopolitics</i></h2>
  <div class="abs txt" style="left:${col(6)}px;top:262px;width:520px">
    <p>20+ conferences and 19+ awards, in the resume's own summary. Its table lists 16 delegate awards from 2023 to 2026, six of them Best Delegate.</p>
    <p>Three Executive Board roles, in WHO, UNESCO and ECOSOC.</p>
  </div>
  <div class="abs" style="left:${col(5)}px;top:${plY + 22}px;width:760px">
    <p class="cap" style="margin-bottom:12px">One placard. Its face changes through the committees he has sat in or chaired.</p>
    <p class="mono roll">${committees.map((c, i) => i === 0 ? `<u>${c}</u>` : `<span>${c}</span>`).join('')}</p>
  </div>
</section>`;

/* ---------- Panel 6: continuity strip ---------- */
const strip = `
<section class="frame" style="height:480px">
  <div class="abs" style="left:0;top:160px;width:1440px;height:160px;background:var(--night)"></div>
  <svg class="fig" width="1440" height="480" viewBox="0 0 1440 480">
    <path class="ln" d="M900 96H${M + 24}A24 24 0 0 0 ${M} 120V160"/>
    <path class="ln on-night" d="M${M} 160V320"/>
    <path class="ln" d="M${M} 320V480"/>
    <path class="hl" d="M60 392H1014"/>
    ${vlabel(138, 'Projects')}${vlabel(268, 'Night', true)}${vlabel(456, 'Law')}
  </svg>
  <p class="abs cap" style="left:${col(8)}px;top:44px;width:420px">Competitions and projects ends. The line comes back from its last figure and rejoins the meridian before the section closes.</p>
  <p class="abs cap on-night" style="left:${col(2)}px;top:210px;width:420px">Night begins. The line keeps its position and changes to its Night colour at the boundary. This chapter is shortened here to its two joins.</p>
  <p class="abs cap" style="left:${col(2)}px;top:416px;width:520px">Law begins. The meridian carries on as the margin rule of the document.</p>
  <p class="abs mono" style="right:120px;top:416px;color:var(--slate)">x = 210 at 1440 &nbsp; x = 20 at 390</p>
</section>`;

/* ---------- Panel 7a: motorsport, the circuit ---------- */
const moH = 840, SY = 630;
const track = [[360, SY, 70], [1100, SY, 64], [1152, 496, 40], [1058, 448, 30], [1040, 356, 30], [1192, 316, 28], [1160, 246, 28], [770, 274, 70], [706, 392, 24], [612, 368, 24], [566, 262, 44], [404, 276, 64], [330, 450, 90]];
const entry = `M${M} 0V${SY - 50}A50 50 0 0 0 ${M + 50} ${SY}H440`;
const pit = `M940 ${SY}A46 46 0 0 1 940 ${SY + 92}`;
const lo = SY + 92, hi = SY + 52;
const tr = [[940, lo], [908, lo, 5], [880, hi + 4, 5], [786, hi + 26, 5], [770, lo - 6, 5], [690, lo - 6, 5], [668, hi, 5], [560, hi + 30, 5], [544, lo, 5], [520, lo, 5], [500, hi + 12, 5], [430, hi + 30, 5], [416, lo - 4, 5], [330, lo - 4, 5], [310, hi + 8, 5], [270, hi + 20, 5], [258, lo, 5], [M, lo, 24], [M, moH]];
const tick = (x, y, dx, dy, s = 9) => { const l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l; return `<path class="mk" d="M${f(x - nx * s)} ${f(y - ny * s)}L${f(x + nx * s)} ${f(y + ny * s)}"/>`; };
const motorsport = `
<section class="frame night" style="height:${moH}px">
  <svg class="fig" width="1440" height="${moH}" viewBox="0 0 1440 ${moH}">
    <path class="nh2" d="M${M + 24} ${SY + 106}H940"/>
    <path class="ln" d="${entry}"/><path class="ln" d="${fillet(track, { closed: true })}"/><path class="ln" d="${pit}"/><path class="ln" d="${fillet(tr)}"/>
    <path class="mk" d="M600 ${SY - 10}v20M606 ${SY - 10}v20"/>
    ${tick(1126, 563, 52, -134)}${tick(965, 260, -390, 28)}
    <text class="m on-night" x="618" y="${SY - 14}">S3</text><text class="m on-night" x="1150" y="570">S1</text><text class="m on-night" x="965" y="240" text-anchor="middle">S2</text>
    <circle class="car" cx="860" cy="267.5" r="5.5"/>
    <text class="m on-night" x="1010" y="${SY + 96}">Trace, schematic</text>
    ${vlabel(132, 'Night', true)}
  </svg>
  <h2 class="abs serif ch" style="left:${col(2)}px;top:48px">Motorsport</h2>
  <div class="abs txt" style="left:${col(2)}px;top:148px;width:420px"><p>Formula 1 is one of the interests listed in his resume.</p></div>
  <p class="abs cap" style="right:120px;top:64px;width:250px;text-align:right">An invented circuit. Three sector marks, no times, no place.</p>
</section>`;

/* ---------- Panel 7b: law, the margin rule ---------- */
const lawH = 860, dx = 270, dw = 640, cxDoc = (col(2) + 1014) / 2;
const law = `
<section class="frame" style="height:${lawH}px">
  <svg class="fig" width="1440" height="${lawH}" viewBox="0 0 1440 ${lawH}">
    <path class="hl" d="M60 210H1014"/><path class="hl" d="M60 792H1014"/>
    <path class="hl" d="M${cxDoc - 36} 372H${cxDoc + 36}"/>
    <path class="ln" d="M${M} 0V${lawH}"/>
    <text class="m" x="${col(2)}" y="198">Law</text><text class="m" x="1014" y="198" text-anchor="end">IIT Madras certification, 2026</text>
    <text class="m" x="${col(2)}" y="814">Page 1</text>
  </svg>
  <h2 class="abs serif ch" style="left:${col(2)}px;top:48px">Law</h2>
  <div class="abs doc-head serif" style="left:${col(2)}px;top:262px;width:${1014 - col(2)}px"><div class="caps">Introduction to Law</div><div class="it">A course of eight weeks</div></div>
  <ol class="abs doc serif" style="left:${col(2)}px;top:412px;width:${dx - col(2) + dw}px">
    <li><span>1.</span><p>Completed an 8-week course on introductory legal concepts.</p></li>
    <li><span>2.</span><p>Earned a Completion Certificate and a Certificate for Exemplary Performance in the take-home project.</p></li>
    <li><span>3.</span><div class="ph"><div class="mono">In Ahaan's words, to come</div><i></i><i></i><i></i></div></li>
  </ol>
  <div class="abs side" style="left:36px;top:418px;width:156px">The course</div>
  <div class="abs side" style="left:36px;top:486px;width:156px">Two certificates</div>
  <div class="abs side" style="left:36px;top:590px;width:156px">Placeholder. His own description of the interest will be set here as the body of the page.</div>
</section>`;

/* ---------- Panel 7c: reading and tennis, the end of the line ---------- */
const coH = 660, S1 = 270, S2 = 360, CY = 520, rand = rng(400);
let ticks = '';
for (const [row, y] of [[0, S1], [1, S2]]) for (let i = 0; i < 200; i++) {
  const x = 250.5 + 5 * (row ? 199 - i : i), h = 15 + Math.round(rand() * 22);
  ticks += `M${x} ${y - 1}v-${h}`;
}
const counts = [50, 100, 150, 200].map((n, i) => `<text class="m" x="${250 + 5 * n - 3}" y="${S1 + 18}" text-anchor="end">${n}</text><text class="m" x="${250 + 5 * (200 - n) + 3}" y="${S2 + 18}">${200 + n}</text>`).join('');
const coda = `
<section class="frame" style="height:${coH}px">
  <svg class="fig" width="1440" height="${coH}" viewBox="0 0 1440 ${coH}">
    <path class="bk" d="${ticks}"/>
    <path class="hl2" d="M${M + 36} ${CY - 96}V${CY}M${M} ${CY - 96}h36"/>
    <path class="ln" d="M${M} 0V${S1 - 24}A24 24 0 0 0 ${M + 24} ${S1}H${R}A45 45 0 0 1 ${R} ${S2}H${M + 24}A24 24 0 0 0 ${M} ${S2 + 24}V${CY}H950"/>
    <circle class="dot" cx="950" cy="${CY}" r="4.5"/>
    ${counts}
    <text class="m" x="${M + 48}" y="${CY - 84}">Tennis</text>
    ${vlabel(170, 'Reading and tennis')}
  </svg>
  <h2 class="abs serif ch" style="left:${col(2)}px;top:48px">400+ <i>books</i></h2>
  <div class="abs txt" style="left:${col(7)}px;top:76px;width:500px"><p>Read across fiction, non-fiction and philosophy. One tick for each of the first 400, in two rows of 200; the shelf runs on.</p></div>
  <div class="abs serif mail" style="left:${col(4)}px;top:${CY - 72}px">thisisahaan@gmail.com</div>
  <p class="abs cap" style="left:${col(4)}px;top:${CY + 22}px;width:520px">The line makes its one square corner, the corner of a court, and ends under the email address.</p>
</section>`;

/* ---------- page ---------- */
const css = `
:root{--stone:#F6F5F1;--navy:#0F1B2D;--slate:#55606F;--hair:#D9D8D2;--sky:#E9EEF3;--line:#E8451E;--lineink:#B8330F;--night:#0B1424;--ntext:#E9EDF2;--n2:#9AA6B5;--lnight:#FF6A3D}
*{box-sizing:border-box;margin:0;padding:0}
html{background:var(--stone)}
body{width:1440px;margin:0 auto;background:var(--stone);color:var(--navy);font:400 18px/30px "Geist",sans-serif;-webkit-font-smoothing:antialiased}
.serif{font-family:"Instrument Serif",serif;font-weight:400}
.mono{font:400 12px/16px "Geist Mono",monospace;letter-spacing:.06em;text-transform:uppercase}
.abs{position:absolute}
.board-head{padding:72px 120px 8px;display:grid;grid-template-columns:1fr 486px;column-gap:48px;align-items:end}
.board-head h1{font-size:96px;line-height:96px}
.board-head p{font-size:16px;line-height:26px;color:var(--slate)}
.board-head .mono{color:var(--slate);margin-bottom:20px}
.plabel{margin:104px 120px 0;padding:18px 0;border-top:1px solid var(--navy);display:flex;gap:28px;align-items:baseline;font-size:14px;line-height:22px}
.plabel b{font-weight:500;white-space:nowrap}.plabel span{color:var(--slate)}
.plabel.sub{margin-top:56px;border-top-color:var(--hair)}
.frame{position:relative;width:1440px;overflow:hidden;border-top:1px solid var(--hair);border-bottom:1px solid var(--hair)}
.frame.night{background:var(--night);color:var(--ntext);border-color:var(--night)}
svg.fig{position:absolute;left:0;top:0}
.ln{fill:none;stroke:var(--line);stroke-width:1.5}
.night .ln,.ln.on-night{stroke:var(--lnight)}
.dot{fill:var(--line)}
.hl{fill:none;stroke:var(--hair);stroke-width:1}
.hl2{fill:none;stroke:#B9BBB9;stroke-width:1}
.nh{fill:none;stroke:#1B2940;stroke-width:1}
.nh2{fill:none;stroke:#3A4960;stroke-width:1}
.caret{fill:var(--ntext)}
.wp{fill:var(--night);stroke:var(--ntext);stroke-width:1.25}
.mk{fill:none;stroke:var(--ntext);stroke-width:1.25}
.car{fill:var(--ntext);stroke:var(--night);stroke-width:3}
.bk{fill:none;stroke:var(--navy);stroke-width:1}
.gc{fill:none;stroke:var(--navy);stroke-width:1}
.pt{fill:var(--navy);stroke:var(--stone);stroke-width:2}
.limb{fill:none;stroke:#B9BBB9;stroke-width:1}
.plac{fill:var(--stone);stroke:var(--navy);stroke-width:1}
.plac-in{fill:none;stroke:var(--hair);stroke-width:1}
.plac-t{font:400 78px "Instrument Serif",serif;letter-spacing:.06em;fill:var(--navy)}
text.m,tspan.m{font:400 12px "Geist Mono",monospace;letter-spacing:.06em;text-transform:uppercase;fill:var(--slate)}
text.m.on-night{fill:var(--n2)}
text.num,tspan.num{font:400 46px "Instrument Serif",serif;fill:var(--navy)}
.nav{display:flex;gap:36px;font-size:14px;line-height:20px;color:var(--slate)}
.name{font-size:200px;line-height:172px;letter-spacing:-.01em;white-space:nowrap}
.school{font-size:18px;line-height:30px;color:var(--navy)}
.ch{font-size:72px;line-height:76px;white-space:nowrap}
.txt{font-size:17px;line-height:28px}
.txt p+p{margin-top:12px}
.txt h3{font-size:36px;line-height:40px;margin-bottom:8px}
.txt a{color:var(--lineink);text-decoration:underline;text-underline-offset:4px;text-decoration-thickness:1px}
.night .txt{color:var(--n2)}
.cap{font-size:14px;line-height:22px;color:var(--slate)}
.night .cap,.cap.on-night{color:var(--n2)}
.p2{margin-top:24px;padding:0 120px 0 222px;display:flex;gap:120px;align-items:flex-start}
.phone{position:relative;flex:none;width:392px;height:846px;border:1px solid var(--hair);overflow:hidden}
.notes{max-width:500px;padding-top:40px}
.notes h3{font-size:40px;line-height:44px;margin-bottom:20px}
.notes p{font-size:16px;line-height:26px;color:var(--slate);margin-bottom:14px}
.swatches{margin:0 120px;display:grid;grid-template-columns:repeat(6,1fr);gap:36px 24px}
.sw .chip{height:96px;margin-bottom:12px}.sw .chip.light{border:1px solid var(--hair)}
.sw b{display:block;font-weight:500;font-size:15px;line-height:22px}.sw .mono{color:var(--slate)}.sw p{font-size:13px;line-height:19px;color:var(--slate);margin-top:6px}
.spec{margin:0 120px;padding:28px 0;border-top:1px solid var(--hair);display:grid;grid-template-columns:204px 1fr;align-items:center}

.spec .meta{color:var(--slate);line-height:19px}
.sort{font-size:14px;line-height:20px;color:var(--slate);display:flex;gap:20px}
.sort u{color:var(--lineink);text-underline-offset:5px;text-decoration-thickness:1px}
table{border-collapse:collapse}
th{font:400 12px/16px "Geist Mono",monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--slate);text-align:left;padding:0 0 10px;border-bottom:1px solid var(--navy)}
.r{text-align:right}
.rec td{height:70px;border-bottom:1px solid var(--hair);font-size:16px;line-height:22px;vertical-align:middle;padding-right:24px}
.rec td.r{padding-right:0}
.rec .conf{font-size:30px;line-height:34px}.rec .conf small{font:400 13px/18px "Geist",sans-serif;color:var(--slate);margin-left:8px;white-space:nowrap}
.rec .com{font:400 13px/18px "Geist Mono",monospace;letter-spacing:.06em;text-transform:uppercase}
.rec .com small{font:400 13px/18px "Geist",sans-serif;letter-spacing:0;text-transform:none;color:var(--slate);margin-left:6px}
.rec .yr{font-size:30px;line-height:34px;font-variant-numeric:tabular-nums}
.res td{height:50px;border-bottom:1px solid var(--hair);font-size:16px;line-height:22px;vertical-align:middle}
.res td.serif{font-size:28px;line-height:32px;width:300px}
.res td.serif small{font:400 13px/18px "Geist",sans-serif;color:var(--slate);margin-left:8px}
.res th:last-child{width:300px}
.shot{display:block;outline:1px solid var(--hair)}
.roll{display:flex;flex-wrap:wrap;gap:6px 22px;color:var(--slate)}
.roll u{color:var(--lineink);text-underline-offset:5px;text-decoration-thickness:1px}
.doc-head{text-align:center}
.doc-head .caps{font-size:40px;line-height:48px;letter-spacing:.08em;text-transform:uppercase}
.doc-head .it{font-size:24px;line-height:34px;font-style:italic;color:var(--slate)}
.doc{list-style:none;font-size:24px;line-height:34px}
.doc li{display:grid;grid-template-columns:${dx - col(2)}px 1fr;margin-bottom:22px}
.ph{padding-top:6px}.ph .mono{color:var(--slate)}
.ph i{display:block;height:34px;border-bottom:1px solid var(--hair)}
.side{font-size:13px;line-height:19px;color:var(--slate);text-align:right}
.mail{font-size:64px;line-height:72px;white-space:nowrap}
.foot{margin:104px 120px 0;padding:18px 0 72px;border-top:1px solid var(--navy);font-size:14px;line-height:22px;color:var(--slate)}
`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>03 Meridian: direction board for Ahaan Gupta's portfolio</title>
<meta name="viewport" content="width=1440">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>
<header class="board-head">
  <div><div class="mono">Reference board 03, direction C. Static study, not final</div><h1 class="serif">Meridian</h1></div>
  <p>One hairline starts as the rule under his name and runs to the bottom of the page. On the way it becomes a price series, a route, a circuit, a margin rule, a line of longitude, a shelf and the underline of his email address.</p>
</header>

${label(1, 'Hero at 1440 × 900', 'End state of the entrance.')}
${hero}

${label(2, 'Hero at 390 × 844', 'True size, no device chrome.')}
${mobile}

${label(3, 'Palette and type', 'Every token as a flat swatch, then the scale.')}
${palette}
<div style="height:64px"></div>
${type}

${label(4, 'The awards record', 'Rows 1 to 8 of the delegate awards table, in the resume\'s order.')}
${record}

${label(5, 'Three interest studies', 'Each is a section excerpt at full width. The line enters and leaves on the meridian.')}
${sub('Finance', 'The line as a stepped series of his own data: cumulative delegate awards, 2, 7, 13 and 16. It returns behind the Artha screenshot.')}
${finance}
${sub('Aviation', 'The line as a schematic route on Night: departure curve, waypoints, one hold, range rings and a heading tape.')}
${aviation}
${sub('Model UN and geopolitics', 'The line is the central meridian of a graticule. One placard stands on it.')}
${mun}

${label(6, 'Continuity', 'The line through three consecutive sections, at the meridian position.')}
${strip}

${label(7, 'The other three shapes', 'Motorsport, law, and the coda where the line ends.')}
${sub('Motorsport', 'The line joins a schematic circuit, leaves it by the pit lane and comes back as a trace with no values.')}
${motorsport}
${sub('Law', 'The meridian is the margin rule of a case document. The placeholder is the body of the page.')}
${law}
${sub('Reading and tennis', 'A shelf of 400 ticks, one square corner, and the end of the line.')}
${coda}

<footer class="foot">Facts from content/research/facts.md. Every drawn value is his: 2, 7, 13 and 16 are the cumulative rows of the delegate awards table; the shelf has 400 ticks. Everything else is schematic.</footer>
</body>
</html>
`;
write('03-meridian.html', html);
