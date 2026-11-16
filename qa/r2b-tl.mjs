import { chromium } from "playwright";
const out="qa/screenshots/round-2b/";
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:900}});
const p=await ctx.newPage();
const errs=[];p.on("console",m=>{if(["error","warning"].includes(m.type()))errs.push(m.type()+": "+m.text())});p.on("pageerror",e=>errs.push("pageerror "+e.message));
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(3000);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=300){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(30)}
await p.evaluate(()=>scrollTo({top:0,behavior:"instant"}));await p.waitForTimeout(800);
// keyboard before the pin: focus the first entry via Tab from a link above (academics)
const y0=await p.evaluate(()=>document.getElementById('academics').getBoundingClientRect().top+scrollY+1500);
await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y0);await p.waitForTimeout(500);
await p.evaluate(()=>{const e=document.querySelector('#timeline .tl-filters button, #timeline button');});
// tab until focus enters timeline
let hops=0;
for(;hops<60;hops++){await p.keyboard.press("Tab");const inTl=await p.evaluate(()=>!!document.activeElement?.closest('#timeline'));if(inTl)break}
await p.waitForTimeout(900);
const st=await p.evaluate(()=>({sy:scrollY,top:Math.round(document.getElementById('timeline').getBoundingClientRect().top),ae:document.activeElement.className+" | "+document.activeElement.textContent.trim().slice(0,40)}));
console.log("tab hops",hops,JSON.stringify(st));
await p.screenshot({path:out+"tl-kbd-focus.png"});
// find first entry: Tab until an .tl-entry
for(let i=0;i<12;i++){const c=await p.evaluate(()=>document.activeElement.classList.contains('tl-entry'));if(c)break;await p.keyboard.press("Tab");await p.waitForTimeout(150)}
await p.waitForTimeout(900);
console.log("focused entry",await p.evaluate(()=>({sy:scrollY,t:document.activeElement.textContent.trim().slice(0,50),top:Math.round(document.getElementById('timeline').getBoundingClientRect().top)})));
await p.screenshot({path:out+"tl-entry-first.png"});
const n=await p.evaluate(()=>document.querySelectorAll('#timeline .tl-entry').length);
console.log("entries",n);
const log=[];
for(let i=1;i<n;i++){
  await p.keyboard.press("ArrowRight");await p.waitForTimeout(650);
  const s=await p.evaluate(()=>{const a=document.activeElement;const panel=document.querySelector('#timeline .tl-panel');const pr=document.querySelector('#timeline .tl-h-progress');const lg=panel.querySelector('img');return {t:a.textContent.trim().replace(/\s+/g,' ').slice(0,45),ar:a.rect=1,panel:panel.textContent.trim().replace(/\s+/g,' ').slice(0,70),panelOp:getComputedStyle(panel).opacity,progOp:getComputedStyle(pr).opacity,logo:!!lg,logoAlt:lg?lg.alt:null,sy:Math.round(scrollY)}});
  log.push(i+" "+JSON.stringify(s));
  if([n-1,n-2,Math.floor(n/2)].includes(i)||/Summit|Rasmanjari/.test(s.t)) await p.screenshot({path:out+`tl-entry-${i}.png`});
}
console.log(log.join("\n"));
await p.keyboard.press("ArrowRight");await p.waitForTimeout(800);
console.log("past end",await p.evaluate(()=>({t:document.activeElement.textContent.trim().slice(0,30),sy:scrollY,panelOp:getComputedStyle(document.querySelector('#timeline .tl-panel')).opacity,progOp:getComputedStyle(document.querySelector('#timeline .tl-h-progress')).opacity})));
// scroll past to hand-off
const info=await p.evaluate(()=>{const e=document.getElementById('timeline');return {top:e.getBoundingClientRect().top+scrollY,h:e.offsetHeight}});console.log(JSON.stringify(info));
for(const d of [0,60,120,180,240,300,400]){
 await p.keyboard.press("End"); await p.waitForTimeout(700);
 break;}
const ends=[];
const base=await p.evaluate(()=>scrollY);
for(let d=0;d<=420;d+=60){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),base+d);await p.waitForTimeout(400);
 ends.push(await p.evaluate(()=>({sy:Math.round(scrollY),panelOp:(+getComputedStyle(document.querySelector('#timeline .tl-panel')).opacity).toFixed(2),progOp:(+getComputedStyle(document.querySelector('#timeline .tl-h-progress')).opacity).toFixed(2),pAria:document.querySelector('#timeline .tl-panel').getAttribute('aria-hidden')})));
 if(d==180||d==300)await p.screenshot({path:out+`tl-end-${d}.png`});}
console.log("handoff",JSON.stringify(ends));
console.log("errs",errs);
await b.close();
