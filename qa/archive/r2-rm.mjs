import { chromium } from "playwright";
const b=await chromium.launch();
for(const [w,h] of [[1440,900],[390,844]]){
const ctx=await b.newContext({viewport:{width:w,height:h},reducedMotion:"reduce",hasTouch:w<800,isMobile:w<800});
const p=await ctx.newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2000);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=400){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(40)}
await p.waitForTimeout(800);
const r=await p.evaluate(()=>{const res=[];for(const e of document.querySelectorAll('body *')){if(!e.childNodes.length)continue;const hasText=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());if(!hasText)continue;let o=1,x=e;while(x){const s=getComputedStyle(x);o*=parseFloat(s.opacity);x=x.parentElement}
const cs=getComputedStyle(e);if(o<0.9&&cs.display!=='none'&&cs.visibility!=='hidden'&&e.getBoundingClientRect().width>0&&!e.closest('[aria-hidden=true],.sr-only,[hidden],[inert]'))res.push(Math.round(o*100)/100+" "+e.tagName+"."+e.className+" "+e.textContent.trim().slice(0,30))}return res.slice(0,15)});
console.log(w,"low-opacity text under RM:",JSON.stringify(r));
const dot=await p.evaluate(()=>{const c=[...document.querySelectorAll('#top *')].filter(e=>/dot|end/i.test(e.className&&e.className.toString()));return c.map(e=>e.className+" op="+getComputedStyle(e).opacity).slice(0,6)});
console.log("hero dots",JSON.stringify(dot));
await p.evaluate(()=>scrollTo({top:0,behavior:"instant"}));await p.waitForTimeout(600);
await p.screenshot({path:`qa/screenshots/round-2-behaviour/rm-top-${w}.png`});
await ctx.close();}
await b.close();
