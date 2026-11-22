import { chromium } from "playwright";
const out="qa/screenshots/round-1-behaviour/";
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(3500);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=700){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(80)}
const top=4096;
console.log("timeline top",top);
for(const dy of [1000,1700,1950,2047,2150,2300]){
  await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),top+dy);await p.waitForTimeout(900);
  await p.screenshot({path:out+`tl-pin-${dy}.png`});
}
// meridian x tracking for line elements: print svg path positions of timeline
await b.close();
