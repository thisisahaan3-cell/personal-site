import { chromium } from "playwright";
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(3000);
await p.evaluate(()=>scrollTo({top:3700,behavior:"instant"}));await p.waitForTimeout(600);
const rows=[];
for(let i=0;i<30;i++){await p.mouse.wheel(0,40);await p.waitForTimeout(160);rows.push(await p.evaluate(()=>{const e=document.getElementById('timeline');const r=e.getBoundingClientRect();const h=document.querySelector('#timeline h2').getBoundingClientRect();return Math.round(scrollY)+" sec.top="+Math.round(r.top)+" h2.top="+Math.round(h.top)}))}
console.log(rows.join("\n"));
await b.close();
