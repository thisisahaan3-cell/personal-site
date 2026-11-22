import { chromium } from "playwright";
const out="qa/screenshots/round-2-behaviour/";
const b=await chromium.launch();
// entrance
{const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const t0=Date.now();await p.goto("http://localhost:3101",{waitUntil:"commit"});
for(const ms of [300,1000,2500]){const w=ms-(Date.now()-t0);if(w>0)await p.waitForTimeout(w);await p.screenshot({path:out+`entrance-${ms}ms.png`});}
await p.close();}
// header label + contents + quiz
const ctx=await b.newContext({viewport:{width:1440,height:900}});
const p=await ctx.newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(3000);
const lab=()=>p.evaluate(()=>document.querySelector('.bar-current')?.textContent.trim());
const jump=async(id)=>{await p.evaluate(id=>document.getElementById(id).scrollIntoView({behavior:"instant"}),id);await p.waitForTimeout(1200);return lab()};
for(const id of ["about","mun","reading","competitions","law","contact","top"]){console.log("jump",id,"->",JSON.stringify(await jump(id)))}
// hash link navigation via contents
await p.evaluate(()=>scrollTo({top:0,behavior:"instant"}));await p.waitForTimeout(800);
await p.evaluate(()=>scrollTo({top:7000,behavior:"instant"}));await p.waitForTimeout(800);
console.log("scrolled 7000 ->",await lab());
await p.evaluate(()=>document.getElementById('contact').scrollIntoView({behavior:"instant"}));await p.waitForTimeout(800);
const btt=p.getByText(/Back to top/i).first();
await btt.click();await p.waitForTimeout(3000);
console.log("after Back to top: scrollY",await p.evaluate(()=>scrollY),"label",JSON.stringify(await lab()));
await p.screenshot({path:out+"after-btt.png"});
// contents overlay
await p.evaluate(()=>scrollTo({top:5200,behavior:"instant"}));await p.waitForTimeout(800);
await p.mouse.wheel(0,-150);await p.waitForTimeout(900);const cb=p.getByRole("button",{name:/Contents/i}).first();console.log("bar y",JSON.stringify(await cb.boundingBox()));await cb.click();await p.waitForTimeout(1500);
await p.screenshot({path:out+"contents-open.png"});
const items=await p.evaluate(()=>[...document.querySelectorAll('[role=dialog] a')].map(a=>a.textContent.trim().replace(/\s+/g,' ')+"|"+a.getAttribute('href')+"|"+(a.getAttribute('aria-current')||'')));
console.log("contents",JSON.stringify(items));
console.log("focus in dialog",await p.evaluate(()=>!!document.activeElement.closest('[role=dialog]')));
await p.keyboard.press("Tab");await p.keyboard.press("Tab");
await p.keyboard.press("Escape");await p.waitForTimeout(900);
console.log("after Esc dialog",await p.evaluate(()=>!!document.querySelector('[role=dialog]')),"focus",await p.evaluate(()=>document.activeElement.textContent.trim().slice(0,20)));
await p.mouse.wheel(0,-100);await p.waitForTimeout(900);await cb.click();await p.waitForTimeout(1200);
const target=p.locator('[role=dialog] a[href="#law"]').first();
await target.click();await p.waitForTimeout(3000);
console.log("after contents->law: scrollY",await p.evaluate(()=>scrollY),"lawTop",await p.evaluate(()=>Math.round(document.getElementById('law').getBoundingClientRect().top)),"label",JSON.stringify(await lab()));
await p.screenshot({path:out+"contents-to-law.png"});
await b.close();
