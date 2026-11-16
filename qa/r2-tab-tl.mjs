import { chromium } from "playwright";
const out="qa/screenshots/round-2-behaviour/";
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:834,height:1112},hasTouch:true,isMobile:true,deviceScaleFactor:2});
const p=await ctx.newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2500);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=400){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(40)}
for(const name of ["Lotus Young Leaders Summit","Rasmanjari Interschool Competition","Student Council: Environment Committee"]){
 const d=p.locator('#timeline details').filter({hasText:name}).first();
 await d.scrollIntoViewIfNeeded();await d.locator('summary').tap();await p.waitForTimeout(700);await d.scrollIntoViewIfNeeded();
 const imgs=await d.locator('img').count();
 console.log(name,"imgs",imgs);
 await p.screenshot({path:out+`ttl-${name.slice(0,8).replace(/\W/g,'')}.png`});
}
await b.close();
