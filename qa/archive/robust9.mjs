import { chromium } from "playwright";
const out="qa/screenshots/round-1-behaviour/";
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(3000);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=700){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(60)}
await p.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"}));await p.waitForTimeout(1500);
const clip={x:900,y:400,width:300,height:120};
await p.mouse.move(5,5);await p.waitForTimeout(500);
await p.screenshot({path:out+"dot-base.png",clip});
await p.getByRole("link",{name:"thisisahaan@gmail.com"}).focus();await p.keyboard.press("Shift+Tab");await p.keyboard.press("Tab");await p.waitForTimeout(700);
await p.screenshot({path:out+"dot-focus.png",clip});
const info=await p.evaluate(()=>{const a=document.querySelector('#contact a[href^=mailto]');const sec=document.querySelector('#contact');return [...sec.querySelectorAll('svg *')].map(e=>e.tagName+" "+JSON.stringify(e.getBoundingClientRect().toJSON()).slice(0,80)+" tr="+getComputedStyle(e).transform).slice(0,6)});
console.log(info.join("\n"));
await b.close();
