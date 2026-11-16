import { chromium } from "playwright";
const b=await chromium.launch();
for(const w of [390,360,320]){
const ctx=await b.newContext({viewport:{width:w,height:800},hasTouch:true,isMobile:true,deviceScaleFactor:2});const p=await ctx.newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2500);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);for(let y=0;y<H;y+=300){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(40)}
await p.evaluate(()=>{const e=[...document.querySelectorAll('#motorsport .flabel')].find(e=>e.getBoundingClientRect().width>0&&/Sector 2/.test(e.textContent));e.scrollIntoView({block:'center'})});await p.waitForTimeout(1500);
const g=await p.evaluate(()=>{const e=[...document.querySelectorAll('#motorsport .flabel')].find(e=>e.getBoundingClientRect().width>0&&/Sector 2/.test(e.textContent));const tr=e.getBoundingClientRect();
 const svgs=[...document.querySelectorAll('#motorsport svg')].filter(s=>s.getBoundingClientRect().width>0);
 const res=[];for(const svg of svgs){for(const p of svg.querySelectorAll('path,polyline,circle,line')){const cs=getComputedStyle(p);if(cs.display==='none')continue;
  if(!p.getTotalLength)continue;let L;try{L=p.getTotalLength()}catch{continue}if(!L)continue;const m=p.getScreenCTM();let best=1e9;for(let i=0;i<=600;i++){const pt=p.getPointAtLength(L*i/600);const x=m.a*pt.x+m.c*pt.y+m.e,y=m.b*pt.x+m.d*pt.y+m.f;const dx=Math.max(tr.left-x,0,x-tr.right),dy=Math.max(tr.top-y,0,y-tr.bottom);best=Math.min(best,Math.hypot(dx,dy))}
  res.push([p.tagName,p.getAttribute('class'),Math.round(best*10)/10,cs.strokeWidth])}}
 return {tr:[Math.round(tr.x),Math.round(tr.y),Math.round(tr.width),Math.round(tr.height)],paths:res.sort((a,b)=>a[2]-b[2]).slice(0,6)}});
console.log(w,JSON.stringify(g));
await p.screenshot({path:`qa/screenshots/round-2b/motorsport-${w}.png`});
await ctx.close();}
await b.close();
