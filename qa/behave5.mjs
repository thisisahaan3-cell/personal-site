import { chromium } from "playwright";
const out="qa/screenshots/round-1-behaviour/";
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const L=console.log;
p.on("pageerror",e=>L("PAGEERROR",e.message));
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(3500);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=700){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(80)}
const scrollToEl=async(sel,off=-150)=>{const m=sel.match(/h3:has-text\("(.*)"\)/);await p.evaluate(([t,o])=>{const e=[...document.querySelectorAll('#mun h3')].find(h=>h.textContent.includes(t));scrollTo({top:e.getBoundingClientRect().top+scrollY+o,behavior:"instant"})},[m[1],off]);await p.waitForTimeout(900)};
// ---- MUN
const rows=()=>p.evaluate(()=>{const t=document.querySelectorAll('#mun table')[1];const trs=[...t.querySelectorAll('tbody tr')];return {n:trs.length,vis:trs.filter(r=>getComputedStyle(r).display!=='none').length,first:trs.slice(0,3).map(r=>r.textContent.trim().replace(/\s+/g,' ').slice(0,60)),ops:[...new Set(trs.map(r=>getComputedStyle(r).opacity))]}});
L("MUN tables",await p.evaluate(()=>[...document.querySelectorAll('#mun table')].map(t=>t.querySelectorAll('tbody tr').length+" rows; headers "+[...t.querySelectorAll('th')].map(h=>h.textContent.trim()+(h.getAttribute('aria-sort')?'['+h.getAttribute('aria-sort')+']':'')).join(','))));
L("default",JSON.stringify(await rows()));
await scrollToEl('#mun h3:has-text("Delegate awards")',-50);
// tally filter
const tally=p.getByRole("button",{name:/^2024/});
await tally.click();await p.waitForTimeout(900);L("tally 2024",JSON.stringify(await rows()),"pressed",await tally.getAttribute("aria-pressed"));
await p.screenshot({path:out+"mun-tally-2024.png"});
await tally.click();await p.waitForTimeout(900);L("tally cleared",JSON.stringify(await rows()),"pressed",await tally.getAttribute("aria-pressed"));
// sort by award
const sortBtns=p.locator('#mun table th button:visible').filter({hasText:/^Award$/});
L("award sort buttons",await sortBtns.count());
await sortBtns.first().click();await p.waitForTimeout(1200);
L("sort award",JSON.stringify(await rows()));
L("group rows",await p.evaluate(()=>[...document.querySelectorAll('#mun table')[1].querySelectorAll('tr')].filter(r=>/\d+ awards?|, \d+$/.test(r.textContent.trim())&&r.querySelectorAll('td').length<=2).map(r=>r.textContent.trim()).slice(0,12)));
await p.screenshot({path:out+"mun-sort-award.png"});
await p.locator('#mun table th button:visible').filter({hasText:/^Committee$/}).first().click();await p.waitForTimeout(1200);
L("sort committee",JSON.stringify(await rows()));
L("group rows",await p.evaluate(()=>[...document.querySelectorAll('#mun table')[1].querySelectorAll('tr')].filter(r=>r.querySelectorAll('td').length<=2).map(r=>r.textContent.trim()).slice(0,14)));
await p.screenshot({path:out+"mun-sort-committee.png"});
await p.locator('#mun table th button:visible').filter({hasText:/^Year/}).first().click();await p.waitForTimeout(900);
// placard
await scrollToEl('#mun h3:has-text("Geopolitics")',-100);
const placard=()=>p.evaluate(()=>{const e=[...document.querySelectorAll('#mun *')].find(x=>x.children.length===0&&/awards? in the record/.test(x.textContent));return e?e.textContent:null});
L("placard default",await placard());
for(const c of ["WHO","FIA","ECOSOC"]){await p.getByRole("button",{name:c,exact:true}).first().click();await p.waitForTimeout(900);L("placard",c,await placard());}
await p.screenshot({path:out+"mun-placard-ECOSOC.png"});
await scrollToEl('#mun h3:has-text("Delegate awards")',-50);
await p.screenshot({path:out+"mun-dim.png"});
L("dim ops",JSON.stringify(await rows()));
await p.getByRole("button",{name:"ECOSOC",exact:true}).first().click();await p.waitForTimeout(500);
await b.close();
