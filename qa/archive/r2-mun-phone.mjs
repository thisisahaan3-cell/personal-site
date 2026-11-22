import { chromium } from "playwright";
const b=await chromium.launch();
for (const [w,h,tag] of [[390,844,"390"],[360,800,"360"],[834,1112,"834"]]){
const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true});
const p=await ctx.newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2500);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=300){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(40)}
await p.waitForTimeout(1500);
const info=await p.evaluate(()=>{const ts=[...document.querySelectorAll('#mun table')];return ts.map(t=>{const r=t.getBoundingClientRect();const cs=getComputedStyle(t);return {w:r.width,x:r.x,layout:cs.tableLayout,cols:[...t.querySelectorAll('col')].map(c=>c.getAttribute('style')||c.className),cls:t.className,parentW:t.parentElement.getBoundingClientRect().width,disp:cs.display}})});
console.log(tag,JSON.stringify(info,null,1));
const t=p.locator('#mun table').last();
await t.scrollIntoViewIfNeeded();
await p.evaluate(()=>scrollBy(0,-100));await p.waitForTimeout(800);
await p.screenshot({path:`qa/screenshots/round-2-sections/mun-awards-${tag}.png`});
await ctx.close();}
await b.close();
