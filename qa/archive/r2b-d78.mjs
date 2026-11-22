import { chromium } from "playwright";
const out="qa/screenshots/round-2b/";
const b=await chromium.launch();
{const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});const p=await ctx.newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2500);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);for(let y=0;y<H;y+=300){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(40)}
const info=await p.evaluate(()=>{const t=[...document.querySelectorAll('text,span,p,div,li')].filter(e=>e.children.length===0&&/Sector 2|S2|^2$/i.test(e.textContent.trim()));return t.map(e=>[e.tagName,e.className&&e.className.baseVal!==undefined?e.className.baseVal:e.className,e.textContent.trim(),JSON.stringify(e.getBoundingClientRect()),e.closest('section')?.id])});
console.log(JSON.stringify(info));
const el=await p.evaluate(()=>{const e=[...document.querySelectorAll('text,span,p,div,li')].find(e=>e.children.length===0&&/Sector 2/i.test(e.textContent.trim()));if(!e)return null;e.scrollIntoView({block:'center'});return true});
await p.waitForTimeout(1500);
const g=await p.evaluate(()=>{const e=[...document.querySelectorAll('text,span,p,div,li')].find(e=>e.children.length===0&&/Sector 2/i.test(e.textContent.trim()));const tr=e.getBoundingClientRect();const svg=e.closest('svg');let paths=[];if(svg){paths=[...svg.querySelectorAll('path')].filter(p=>p.getAttribute('d')).map(p=>{const L=p.getTotalLength();let best=1e9;const m=p.getScreenCTM();for(let i=0;i<=400;i++){const pt=p.getPointAtLength(L*i/400);const x=m.a*pt.x+m.c*pt.y+m.e,y=m.b*pt.x+m.d*pt.y+m.f;
 // distance from text rect
 const dx=Math.max(tr.left-x,0,x-tr.right),dy=Math.max(tr.top-y,0,y-tr.bottom);best=Math.min(best,Math.hypot(dx,dy))}return [p.getAttribute('class'),Math.round(best*10)/10,p.getAttribute('stroke-width')]})}
 return {tr:[tr.x,tr.y,tr.width,tr.height],paths}});
console.log(JSON.stringify(g));
await p.screenshot({path:out+'motorsport-390.png'});
await ctx.close();}
// D8
for(const [w,h] of [[1440,900],[390,844]]){
const ctx=await b.newContext({viewport:{width:w,height:h},reducedMotion:"reduce",hasTouch:w<800,isMobile:w<800});const p=await ctx.newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2500);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);for(let y=0;y<H;y+=400){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(30)}
await p.evaluate(()=>scrollTo({top:0,behavior:"instant"}));await p.waitForTimeout(800);
const d=await p.evaluate(()=>[...document.querySelectorAll('.hero-tip,.mark-dot')].map(e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);return [e.className.toString(),cs.opacity,Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height),cs.display,cs.visibility]}));
console.log('RM',w,JSON.stringify(d));
await p.screenshot({path:`${out}rm-top-${w}.png`});
await ctx.close();}
await b.close();
