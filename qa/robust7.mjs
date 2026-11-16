import { chromium } from "playwright";
const out="qa/screenshots/round-1-behaviour/";
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(3000);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=700){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(60)}
await p.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"}));await p.waitForTimeout(1500);
const dot=async()=>p.evaluate(()=>{const c=[...document.querySelectorAll('#contact circle')].pop()||null;return c?c.getBoundingClientRect().x:null});
const dot0=await dot();
await p.getByRole("link",{name:"thisisahaan@gmail.com"}).hover();await p.waitForTimeout(700);const dot1=await dot();
console.log("email end dot x",dot0,"->",dot1);
await p.screenshot({path:out+"hover-email.png",clip:{x:200,y:300,width:1000,height:500}});
const bs=async(n)=>p.evaluate(n=>{const e=[...document.querySelectorAll('a,button')].find(x=>x.textContent.includes(n));const cs=getComputedStyle(e);return cs.backgroundColor+" | "+cs.color+" | op "+cs.opacity+" | tr "+cs.transitionProperty+" "+cs.transitionDuration},n);
console.log("download before",await bs("Download resume (PDF)"));
await p.getByRole("link",{name:/Download resume/}).hover();await p.waitForTimeout(500);console.log("download hover",await bs("Download resume (PDF)"));
console.log("copy before",await bs("Copy email address"));
await p.getByRole("button",{name:/Copy email/}).hover();await p.waitForTimeout(500);console.log("copy hover",await bs("Copy email address"));
// transitions audit: any element with transition on disallowed props
const bad=await p.evaluate(()=>{const s=new Set();document.querySelectorAll('*').forEach(e=>{const t=getComputedStyle(e).transitionProperty;const d=getComputedStyle(e).transitionDuration;if(t&&t!=='all'&&t!=='none'&&d!=='0s'){t.split(',').forEach(x=>{x=x.trim();if(!['opacity','transform','none'].includes(x))s.add(x)})}if(t==='all'&&d!=='0s')s.add('ALL on '+e.tagName+'.'+(e.className||'').toString().slice(0,20))});return [...s]});
console.log("transition props other than opacity/transform:",JSON.stringify(bad.slice(0,20)));
await b.close();
