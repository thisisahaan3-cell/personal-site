import { chromium } from "playwright";
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const errs=[];p.on("console",m=>{if(m.type()==="error"||m.type()==="warning")errs.push(m.type()+": "+m.text())});p.on("pageerror",e=>errs.push("pageerror "+e.message));
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(3500);
const r=await p.evaluate(()=>{
 const o={};
 o.title=document.title;o.desc=document.querySelector('meta[name=description]')?.content;o.lang=document.documentElement.lang;
 o.h1=[...document.querySelectorAll('h1')].map(h=>h.textContent);
 o.headings=[...document.querySelectorAll('h1,h2,h3,h4')].map(h=>h.tagName+":"+h.textContent.trim().slice(0,40));
 o.imgs=[...document.querySelectorAll('img')].map(i=>({src:i.getAttribute('src'),alt:i.alt,w:i.getAttribute('width'),h:i.getAttribute('height'),loading:i.loading,nat:i.naturalWidth,cw:Math.round(i.getBoundingClientRect().width)}));
 o.buttons=[...document.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent.trim()).slice(0,40)).join(' | ');
 o.links=[...document.querySelectorAll('a')].map(a=>a.textContent.trim().slice(0,30)+" -> "+a.getAttribute('href')+(a.hasAttribute('download')?' [download]':'')+(a.target?' ['+a.target+']':'')+(a.rel?' rel='+a.rel:''));
 o.sections=[...document.querySelectorAll('section')].map(s=>s.id+":"+s.getAttribute('aria-labelledby'));
 o.landmarks=[...document.querySelectorAll('header,main,footer,nav,[role=dialog]')].map(e=>e.tagName+(e.getAttribute('aria-label')?'['+e.getAttribute('aria-label')+']':''));
 return o;});
console.log(JSON.stringify(r,null,1));console.log("CONSOLE",errs);
await b.close();
