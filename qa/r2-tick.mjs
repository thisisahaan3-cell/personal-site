import { chromium } from "playwright";
const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2500);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=300){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(30)}
await p.evaluate(()=>document.getElementById('leadership').scrollIntoView({behavior:"instant"}));await p.waitForTimeout(1500);
console.log(JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('#leadership [class*=tick], #leadership [class*=note]')].slice(0,30).map(e=>{const s=getComputedStyle(e);return e.className+" | "+e.textContent.trim().slice(0,22)+" | op="+s.opacity+" bg="+s.backgroundColor+" bt="+s.borderTopColor+" w="+Math.round(e.getBoundingClientRect().width)})),null,1));
await b.close();
