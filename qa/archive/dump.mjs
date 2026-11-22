import { chromium } from "playwright";
import fs from "node:fs";
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:"reduce"})).newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(1500);
// open all details to read timeline
await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
const t=await p.evaluate(()=>document.body.innerText);
fs.writeFileSync("/tmp/claude-0/-home-user-personal-site/ce8f3abc-e9b2-5628-8049-17739167427d/scratchpad/page.txt",t);
console.log(t.length);
await b.close();
