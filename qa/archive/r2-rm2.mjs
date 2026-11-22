import { chromium } from "playwright";
const b=await chromium.launch();
for(const [w,h] of [[1440,900],[390,844]]){
const ctx=await b.newContext({viewport:{width:w,height:h},reducedMotion:"reduce"});
const p=await ctx.newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{const e=[...document.querySelectorAll('p.t-small.fg2.measure')].find(x=>/Begins at Lotus/.test(x.textContent));const chain=[];let x=e;while(x&&x!==document.body){const s=getComputedStyle(x);chain.push(x.tagName+"."+(x.className||'')+" op="+s.opacity+" disp="+s.display+" vis="+s.visibility+" hidden="+x.hidden+" open="+(x.open));x=x.parentElement}return chain});
console.log(w,JSON.stringify(r,null,1));
await ctx.close();}
await b.close();
