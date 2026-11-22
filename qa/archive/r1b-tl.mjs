import { chromium } from "playwright";
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});
const p=await ctx.newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2500);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=400){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(50)}
const d=p.locator('#timeline details').filter({hasText:'Lotus Young Leaders Summit'}).first();
await d.scrollIntoViewIfNeeded();await d.locator('summary').tap();await p.waitForTimeout(800);
await d.scrollIntoViewIfNeeded();
await p.screenshot({path:"qa/screenshots/round-1b/timeline-summit-390.png"});
await b.close();
