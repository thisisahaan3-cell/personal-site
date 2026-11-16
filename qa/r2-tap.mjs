import { chromium } from "playwright";
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const p=await ctx.newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2000);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=400){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(30)}
const r=await p.evaluate(()=>{const vis=e=>{let x=e;while(x){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;x=x.parentElement}return e.getBoundingClientRect().width>0};
return [...document.querySelectorAll('a,button,summary,input')].filter(vis).map(e=>{const r=e.getBoundingClientRect();return {t:(e.textContent||'').trim().slice(0,26),w:Math.round(r.width),h:Math.round(r.height),sec:e.closest('section')?.id||'-'}}).filter(x=>x.h<44)});
console.log(JSON.stringify(r));
await b.close();
