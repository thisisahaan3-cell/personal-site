import { chromium } from "playwright";
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});
const p=await ctx.newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2500);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=400){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(50)}
await p.evaluate(()=>scrollTo({top:8780,behavior:"instant"}));await p.waitForTimeout(900);
await p.screenshot({path:"qa/screenshots/round-1b/sort-390.png"});
const v=await p.evaluate(()=>[...document.querySelectorAll('#mun button')].filter(b=>/^(Committee|Award|Year)/.test(b.textContent.trim())).map(b=>{let e=b,hidden=false;while(e){const s=getComputedStyle(e);if(s.display==='none'||s.visibility==='hidden'||s.opacity==='0'||e.hasAttribute('hidden')||e.getAttribute('aria-hidden')==='true')hidden=true;e=e.parentElement}return [b.textContent.trim(),hidden,b.getBoundingClientRect().height]}));
console.log(JSON.stringify(v));
await b.close();
