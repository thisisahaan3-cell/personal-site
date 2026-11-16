import { chromium } from "playwright";
const out="qa/screenshots/round-1-behaviour/";
const b=await chromium.launch();
const L=console.log;
{ // phone timeline
const p=await (await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true})).newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2500);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=600){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(50)}
await p.evaluate(()=>{const e=document.getElementById('timeline');scrollTo({top:e.getBoundingClientRect().top+scrollY+80,behavior:"instant"})});await p.waitForTimeout(800);
const sums=p.locator('#timeline details summary');L("phone timeline summaries",await sums.count(),"details",await p.locator('#timeline details').count());
await sums.nth(2).tap();await p.waitForTimeout(500);
L("open count",await p.locator('#timeline details[open]').count());
await p.screenshot({path:out+"phone-timeline-open.png"});
const hs=await sums.evaluateAll(a=>a.slice(0,5).map(s=>Math.round(s.getBoundingClientRect().height)));L("summary heights",hs);
await p.getByRole("button",{name:"Leadership and work"}).tap();await p.waitForTimeout(600);
L("after filter visible details",await p.evaluate(()=>[...document.querySelectorAll('#timeline details')].filter(d=>!d.hidden&&d.offsetParent!==null).length));
await p.screenshot({path:out+"phone-timeline-filter.png"});
await p.evaluate(()=>{const e=document.querySelector('#timeline');});
}
{ // desktop circuit + tape + globe pointers
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(3000);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=700){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(60)}
const to=async(id,off=0)=>{await p.evaluate(([i,o])=>{const e=document.getElementById(i);scrollTo({top:e.getBoundingClientRect().top+scrollY+o,behavior:"instant"})},[id,off]);await p.waitForTimeout(1000)};
await to("motorsport",150);
const svg=p.locator('#motorsport svg').first();const bb=await svg.boundingBox();L("circuit box",JSON.stringify(bb));
for(const f of [0.2,0.5,0.8]){await p.mouse.move(bb.x+bb.width*f,bb.y+bb.height*0.4);await p.waitForTimeout(700);await p.screenshot({path:out+`circuit-${Math.round(f*100)}.png`,clip:{x:bb.x,y:bb.y,width:bb.width,height:bb.height}});}
await to("aviation",0);
await p.mouse.move(200,400);await p.waitForTimeout(500);await p.screenshot({path:out+"tape-left.png",clip:{x:200,y:280,width:1240,height:100}});
await p.mouse.move(1300,400);await p.waitForTimeout(900);await p.screenshot({path:out+"tape-right.png",clip:{x:200,y:280,width:1240,height:100}});
}
await b.close();
