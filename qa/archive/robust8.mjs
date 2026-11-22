import { chromium } from "playwright";
import fs from "node:fs";
const out="qa/screenshots/round-1-behaviour/";
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(3000);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=700){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(60)}
await p.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"}));await p.waitForTimeout(1500);
await p.mouse.move(5,5);await p.waitForTimeout(600);
const clip={x:200,y:150,width:1000,height:620};
await p.screenshot({path:out+"hov-base.png",clip});
const targets={email:p.getByRole("link",{name:"thisisahaan@gmail.com"}),dl:p.getByRole("link",{name:/Download resume/}),copy:p.getByRole("button",{name:/Copy email/}),back:p.getByRole("link",{name:"Back to top"})};
for(const [k,l] of Object.entries(targets)){await l.hover();await p.waitForTimeout(700);await p.screenshot({path:out+`hov-${k}.png`,clip});}
await b.close();
