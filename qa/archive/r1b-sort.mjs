import { chromium } from "playwright";
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});
const p=await ctx.newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2500);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=400){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(50)}
const r=await p.evaluate(()=>[...document.querySelectorAll('#mun button')].filter(b=>/^(Committee|Award|Year)/.test(b.textContent.trim())).map(b=>{const r=b.getBoundingClientRect();const cs=getComputedStyle(b);const af=getComputedStyle(b,'::after');return {t:b.textContent.trim(),w:r.width,h:r.height,y:Math.round(r.top+scrollY),vis:r.width>0&&cs.visibility!=='hidden'&&cs.display!=='none',par:b.parentElement.className.slice(0,40),afH:af.height,afMinH:af.minHeight,afContent:af.content,pad:cs.padding,minH:cs.minHeight,aria:b.getAttribute('aria-label')}}));
console.log(JSON.stringify(r,null,1));
await b.close();
