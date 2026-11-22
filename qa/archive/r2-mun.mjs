import { chromium } from "playwright";
const out="qa/screenshots/round-2-behaviour/";
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(3000);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=300){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(40)}
const rec=p.locator('#mun table.record');
await rec.scrollIntoViewIfNeeded();
const cols=async()=>p.evaluate(()=>{const t=document.querySelector('#mun table.record');const th=[...t.querySelectorAll('thead th')].map(e=>Math.round(e.getBoundingClientRect().x));const row=[...t.querySelectorAll('tbody tr')].filter(r=>r.children.length>=4&&r.getBoundingClientRect().height>0).slice(0,3).map(r=>[...r.children].map(c=>Math.round(c.getBoundingClientRect().x)));const groups=[...t.querySelectorAll('tbody tr')].filter(r=>r.children.length<4).map(r=>r.textContent.trim().replace(/\s+/g,' '));return {th,row,groups,w:t.getBoundingClientRect().width}});
console.log("initial",JSON.stringify(await cols()));
await p.evaluate(()=>{const t=document.querySelector('#mun table.record');scrollTo({top:t.getBoundingClientRect().top+scrollY-120,behavior:"instant"})});await p.waitForTimeout(600);
await p.screenshot({path:out+"mun-rec-year.png"});
const btn=n=>p.locator('#mun button').filter({hasText:new RegExp('^'+n)}).filter({visible:true}).first();
for(const n of ["Award","Committee","Year"]){
  await btn(n).click();await p.waitForTimeout(700);
  console.log(n,JSON.stringify(await cols()));
  await p.screenshot({path:out+`mun-rec-${n}.png`});
}
// tally filter: click year 2024 in tally
await p.evaluate(()=>{const t=[...document.querySelectorAll('#mun button')].find(b=>/2024/.test(b.textContent));t&&t.scrollIntoView({block:"center"})});
const ty=p.locator('#mun button').filter({hasText:/2024/}).first();
console.log("tally btn count",await p.locator('#mun button').filter({hasText:/2024/}).count());
await ty.click();await p.waitForTimeout(800);
console.log("tally2024",JSON.stringify(await cols()));
await p.screenshot({path:out+"mun-tally-2024.png"});
await p.evaluate(()=>{const t=document.querySelector('#mun table.record');scrollTo({top:t.getBoundingClientRect().top+scrollY-120,behavior:"instant"})});await p.waitForTimeout(700);
await p.screenshot({path:out+"mun-tally-2024-table.png"});
await b.close();
