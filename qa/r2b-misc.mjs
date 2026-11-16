import { chromium } from "playwright";
const out="qa/screenshots/round-2b/";
const b=await chromium.launch();
const prep=async(p)=>{await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2500);const H=await p.evaluate(()=>document.documentElement.scrollHeight);for(let y=0;y<H;y+=300){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(40)}};
// D3
for(const [w,h] of [[390,844],[834,1112]]){
 const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true});const p=await ctx.newPage();await prep(p);
 const top=await p.evaluate(()=>{const s=document.getElementById('reading');const r=s.getBoundingClientRect();return {top:r.top+scrollY,h:r.height}});
 console.log(w,'reading',JSON.stringify(top));
 const occ=await p.evaluate(()=>{const s=document.getElementById('reading');return [...s.querySelectorAll('*')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&/400\+/.test(n.textContent))).map(e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);return e.tagName+'.'+e.className+' pos='+cs.position+' disp='+cs.display+' vis='+cs.visibility+' op='+cs.opacity+' w='+Math.round(r.width)+' aria='+e.closest('[aria-hidden=true]')+' '+e.textContent.trim().slice(0,40)})});
 console.log(w,JSON.stringify(occ));
 let i=0;for(let y=top.top-60;y<top.top+top.h;y+=h*0.8){await p.evaluate(t=>scrollTo({top:t,behavior:'instant'}),y);await p.waitForTimeout(900);
  const vis=await p.evaluate(()=>{const s=document.getElementById('reading');return [...s.querySelectorAll('*')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&/400\+/.test(n.textContent))).filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.bottom>0&&r.top<innerHeight&&getComputedStyle(e).opacity!=='0'&&getComputedStyle(e).visibility!=='hidden'}).length});
  await p.screenshot({path:`${out}reading-${w}-${i}.png`});console.log(w,'slice',i,'visible 400+ elements',vis);i++;}
 await ctx.close();}
// D6 leadership 1440
{const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2});const p=await ctx.newPage();await prep(p);
 await p.evaluate(()=>document.getElementById('leadership').scrollIntoView({behavior:"instant"}));await p.waitForTimeout(3000);
 const t=await p.evaluate(()=>[...document.querySelectorAll('#leadership .r-tick')].map(e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);return [r.y,r.height,r.width,s.opacity,s.backgroundColor,s.transform,s.height,s.top]}));
 console.log('ticks',JSON.stringify(t));
 await p.screenshot({path:out+'leadership-1440.png'});
 // zoom clip on ticks
 const xs=await p.evaluate(()=>{const e=document.querySelector('#leadership .r-tick');const r=e.getBoundingClientRect();return r.x});
 await p.screenshot({path:out+'leadership-ticks.png',clip:{x:Math.max(0,xs-80),y:0,width:260,height:900}});
 await ctx.close();}
await b.close();
