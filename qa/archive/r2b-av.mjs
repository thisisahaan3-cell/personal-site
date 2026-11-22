import { chromium } from "playwright";
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});const p=await ctx.newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2500);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);for(let y=0;y<H;y+=300){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(40)}
const t=await p.evaluate(()=>{const s=document.getElementById('aviation');return s.getBoundingClientRect().top+scrollY});
for(const [i,o] of [[0,200],[1,700]]){await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}),t+o);await p.waitForTimeout(1500);await p.screenshot({path:`qa/screenshots/round-2b/aviation-390-${i}.png`});}
await b.close();
