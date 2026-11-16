import { chromium } from "playwright";
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2500);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=400){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(50)}
await p.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"}));await p.waitForTimeout(1200);
const snap=()=>p.evaluate(()=>{const c=document.querySelector('#contact');return [...c.querySelectorAll('svg *, [class*=dot], [data-dot], [data-end-dot]')].filter(e=>/circle|dot/i.test(e.tagName+e.className?.baseVal+e.className)).map(e=>{const r=e.getBoundingClientRect();return [e.tagName,String(e.getAttribute('class')||''),Math.round(r.x*10)/10,Math.round(r.y*10)/10,getComputedStyle(e).transform]})});
console.log("before",JSON.stringify(await snap()));
const a=p.locator('#contact a[href^="mailto"]').first();
const bb=await a.boundingBox();console.log("link bbox",JSON.stringify(bb));
await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2,{steps:5});await p.waitForTimeout(1000);
console.log("hovered?",await a.evaluate(e=>e.matches(':hover')));
console.log("after",JSON.stringify(await snap()));
await p.screenshot({path:"qa/screenshots/round-1b/email-hover2.png"});
await b.close();
