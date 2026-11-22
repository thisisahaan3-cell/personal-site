import { chromium } from "playwright";
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2500);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=400){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(50)}
await p.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"}));await p.waitForTimeout(1200);
const a=p.locator('#contact a[href^="mailto"]').first();const bb=await a.boundingBox();
await p.evaluate(()=>{window.__s=[];const d=document.querySelector('.email-dot');const t=()=>{window.__s.push([Math.round(performance.now()),Math.round(d.getBoundingClientRect().x*10)/10,getComputedStyle(d).transform]);requestAnimationFrame(t)};t()});
await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await p.waitForTimeout(1200);
const s=await p.evaluate(()=>window.__s);const xs=[...new Set(s.map(r=>r[1]))];console.log("distinct x",xs.join(","));
await b.close();
