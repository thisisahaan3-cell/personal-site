import { chromium } from "playwright";
const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2500);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=300){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(30)}
await p.evaluate(()=>document.getElementById('leadership').scrollIntoView({behavior:"instant"}));await p.waitForTimeout(3000);
await p.screenshot({path:"qa/screenshots/round-2-behaviour/leadership-ticks.png",clip:{x:0,y:400,width:500,height:500}});
console.log(JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('#leadership .r-tick')].map(e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);return [Math.round(r.y),s.opacity,s.backgroundColor,s.transform]}))));
await b.close();
