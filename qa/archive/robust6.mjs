import { chromium } from "playwright";
const out="qa/screenshots/round-1-behaviour/";
const b=await chromium.launch();
const L=console.log;
for(const [w,h,mob,name] of [[1440,900,false,"desktop"],[390,844,true,"mobile"]]){
const ctx=await b.newContext({viewport:{width:w,height:h},isMobile:mob,hasTouch:mob});
const p=await ctx.newPage();
await p.addInitScript(()=>{window.__cls=0;window.__shifts=[];new PerformanceObserver(l=>{for(const e of l.getEntries()){if(!e.hadRecentInput){window.__cls+=e.value;window.__shifts.push(e.value.toFixed(4)+" "+(e.sources||[]).map(s=>s.node?.nodeName+"."+(s.node?.className||'').toString().slice(0,20)).join(","))}}}).observe({type:"layout-shift",buffered:true});
 new PerformanceObserver(l=>{window.__lcp=l.getEntries().pop()}).observe({type:"largest-contentful-paint",buffered:true});});
await p.goto("http://localhost:3101",{waitUntil:"load"});await p.waitForTimeout(4000);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=h*0.8){await p.mouse.wheel(0,h*0.8);await p.waitForTimeout(250)}
await p.waitForTimeout(800);
L(name,"CLS",await p.evaluate(()=>window.__cls.toFixed(4)),"shifts",await p.evaluate(()=>window.__shifts.slice(0,8)),"LCP",await p.evaluate(()=>window.__lcp?window.__lcp.element?.tagName+" "+Math.round(window.__lcp.startTime)+"ms":null));
const fonts=await p.evaluate(()=>[...document.fonts].map(f=>f.family+" "+f.style+" "+f.weight+" "+f.status));L(name,"fonts",fonts.join("; "));
if(!mob){L("h1 weight/style",await p.evaluate(()=>{const h=document.querySelector('h1');const cs=getComputedStyle(h);return cs.fontFamily.slice(0,40)+" "+cs.fontWeight+" size "+cs.fontSize}));}
await ctx.close();}
await b.close();
