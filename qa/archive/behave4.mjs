import { chromium } from "playwright";
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(3500);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
const mark=async()=>p.evaluate(()=>{const h=document.querySelector('header');const t=[...h.querySelectorAll('a,button,span')].map(e=>e.textContent.trim()).filter(Boolean);return t.join("|")+" navTop="+Math.round(h.getBoundingClientRect().top)});
// natural wheel scroll downward, log the mark every ~900px
let y=0;const rows=[];
for(let i=0;i<32;i++){await p.mouse.wheel(0,850);await p.waitForTimeout(450);const sy=await p.evaluate(()=>Math.round(scrollY));rows.push(sy+": "+await mark());}
console.log(rows.join("\n"));
await b.close();
