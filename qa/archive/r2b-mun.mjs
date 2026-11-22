import { chromium } from "playwright";
const b=await chromium.launch();
for (const [w,h] of [[390,844],[360,780],[320,700],[834,1112],[1440,900]]){
const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:w<800,isMobile:w<800});
const p=await ctx.newPage();
const errs=[];p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.text())});
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2500);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=300){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(40)}
await p.waitForTimeout(1000);
const info=await p.evaluate(()=>{const s=document.querySelector('#mun');const t=[...s.querySelectorAll('table')].pop();const btns=[...s.querySelectorAll('button')].map(b=>(b.textContent||'').trim().slice(0,30)+'|'+b.getAttribute('aria-pressed')+'|'+Math.round(b.getBoundingClientRect().height));return {tbl:t?{x:t.getBoundingClientRect().x,w:t.getBoundingClientRect().width,disp:getComputedStyle(t).display}:null,btns,sw:document.documentElement.scrollWidth}});
console.log(w,JSON.stringify(info),errs);
await ctx.close();}
await b.close();
