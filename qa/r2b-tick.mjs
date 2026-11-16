import { chromium } from "playwright";
const b=await chromium.launch();
for(const dpr of [1,2]){
const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:dpr});const p=await ctx.newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2500);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);for(let y=0;y<H;y+=300){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(30)}
await p.evaluate(()=>document.getElementById('leadership').scrollIntoView({behavior:"instant"}));await p.waitForTimeout(3000);
const ys=await p.evaluate(()=>[...document.querySelectorAll('#leadership .r-tick')].map(e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width]}));
for(let i=0;i<ys.length;i++){const [x,y,w]=ys[i];if(y<0||y>880)continue;
 await p.screenshot({path:`qa/screenshots/round-2b/tick-${dpr}x-${i}.png`,clip:{x:Math.round(x),y:Math.floor(y)-4,width:Math.round(w),height:10}});}
console.log(dpr,JSON.stringify(ys));
await ctx.close();}
await b.close();
