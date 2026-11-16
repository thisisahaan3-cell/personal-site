import { chromium } from "playwright";
const b=await chromium.launch();
const L=console.log;
// 1. overflow at widths
for(const [w,h,mob] of [[1440,900,false],[1024,768,false],[834,1112,true],[390,844,true],[360,740,true],[320,640,true]]){
  const ctx=await b.newContext({viewport:{width:w,height:h},isMobile:mob,hasTouch:mob});const p=await ctx.newPage();
  const errs=[];p.on("console",m=>{if(m.type()==="error")errs.push(m.text())});p.on("requestfailed",r=>errs.push("REQFAIL "+r.url()));p.on("response",r=>{if(r.status()>=400)errs.push(r.status()+" "+r.url())});
  await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2500);
  const H=await p.evaluate(()=>document.documentElement.scrollHeight);
  for(let y=0;y<H;y+=h*0.7){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(100)}
  const r=await p.evaluate(()=>{const de=document.documentElement;const over=[];const vw=de.clientWidth;document.querySelectorAll('body *').forEach(e=>{const r=e.getBoundingClientRect();if(r.width>0&&r.right>vw+1&&!e.closest('svg')&&getComputedStyle(e).position!=='fixed'){let a=e,clipped=false;while(a=a.parentElement){const o=getComputedStyle(a).overflowX;if(o==='clip'||o==='hidden'||o==='auto'||o==='scroll'){clipped=true;break}}if(!clipped)over.push(e.tagName+"."+(e.className||'').toString().slice(0,25)+" r="+Math.round(r.right))}});return {sw:de.scrollWidth,cw:vw,bodySW:document.body.scrollWidth,over:over.slice(0,5)}});
  L(w,JSON.stringify(r),"errs",JSON.stringify(errs));
  await ctx.close();
}
await b.close();
