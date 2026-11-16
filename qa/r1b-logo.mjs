import { chromium } from "playwright";
const b=await chromium.launch();
for(const [w,h,m] of [[390,844,true],[1440,900,false],[834,1112,false]]){
const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:m,isMobile:m});
const p=await ctx.newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2500);
const r=await p.evaluate(()=>[...document.querySelectorAll('img[src*="lotus-valley"]')].map(i=>{const li=i.closest('li,tr,details,section');return {sec:i.closest('section')?.id,ctx:(li?.textContent||'').slice(0,110),vis:i.getBoundingClientRect().width>0,tag:li?.tagName}}));
console.log(w,JSON.stringify(r,null,1));
await ctx.close();}
await b.close();
