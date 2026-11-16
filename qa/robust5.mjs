import { chromium } from "playwright";
const out="qa/screenshots/round-1-behaviour/";
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(3500);
for(let i=0;i<9;i++){await p.keyboard.press("Tab");await p.waitForTimeout(150)}
await p.waitForTimeout(800);
await p.screenshot({path:out+"focus-timeline-entry.png"});
console.log(await p.evaluate(()=>{const e=document.activeElement;const cs=getComputedStyle(e);const lab=e.querySelector('*');return e.textContent.slice(0,30)+" | outline "+cs.outline+" | children outline: "+[...e.querySelectorAll('*')].map(c=>getComputedStyle(c).outlineStyle).join(',')+" scrollY "+scrollY}));
// hover: committee, filters, table row, button
await p.keyboard.press("Tab");await p.waitForTimeout(500);
await p.screenshot({path:out+"focus-mun-roll.png"});
await b.close();
