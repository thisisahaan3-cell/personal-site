import { chromium } from "playwright";
const b=await chromium.launch();
for (const [w,h] of [[390,844],[360,780],[320,700],[834,1112],[1440,900]]){
const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:w<800,isMobile:w<800});
const p=await ctx.newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2500);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=300){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(40)}
const geo=()=>p.evaluate(()=>{const t=document.querySelector('#mun table.record');const r=t.getBoundingClientRect();const rows=[...t.querySelectorAll('tbody tr')].filter(x=>x.getBoundingClientRect().height>0);
 const awards=rows.filter(x=>!x.classList.contains('group')&&x.children.length>=1);
 return {x:Math.round(r.x),w:Math.round(r.width),h:Math.round(r.height),rows:rows.length,cells:[...t.querySelectorAll('tbody td,tbody th')].filter(c=>c.getBoundingClientRect().width>0).slice(0,5).map(c=>Math.round(c.getBoundingClientRect().x)+':'+Math.round(c.getBoundingClientRect().width)),txt:t.innerText.replace(/\s+/g,' ').slice(0,2000)}});
const snap=async(name)=>{
 await p.evaluate(()=>{const t=document.querySelector('#mun table.record');scrollTo({top:t.getBoundingClientRect().top+scrollY-100,behavior:'instant'})});
 await p.waitForTimeout(800);
 const g=await geo();
 console.log(w,name,JSON.stringify({...g,txt:undefined}), 'rows-with-text',g.txt.length);
 const full=await p.evaluate(()=>{const t=document.querySelector('#mun table.record');const r=t.getBoundingClientRect();return {top:r.top+scrollY,h:r.height}});
 await p.setViewportSize({width:w,height:Math.max(h,Math.round(full.h+200))});await p.waitForTimeout(400);
 await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}),full.top-90);await p.waitForTimeout(600);
 await p.screenshot({path:`qa/screenshots/round-2b/mun-${w}-${name}.png`,clip:{x:0,y:0,width:w,height:Math.min(full.h+180,Math.round(full.h+200))}});
 await p.setViewportSize({width:w,height:h});await p.waitForTimeout(300);
 return g;
};
const d=await snap('default');
if(w===390) console.log(d.txt);
// sort buttons visible
const clickBtn=async(re)=>{const l=p.locator('#mun button').filter({hasText:re}).filter({visible:true});console.log(w,'count',re,await l.count());await l.first().scrollIntoViewIfNeeded();await l.first().click();await p.waitForTimeout(800)};
await clickBtn(/^Award$/); await snap('sort-award');
await clickBtn(/^Committee$/); await snap('sort-committee');
await clickBtn(/^2024/); await snap('filter-2024');
await ctx.close();}
await b.close();
