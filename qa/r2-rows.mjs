import { chromium } from "playwright";
const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2000);
const rows=await p.evaluate(()=>[...document.querySelectorAll('#mun table.record tbody tr')].filter(r=>r.children.length>=4).map(r=>[...r.children].map(c=>c.textContent.trim().replace(/\s+/g,' ')).join(' | ')));
console.log(rows.length);console.log(rows.sort().join("\n"));
// placeholders
const ph=await p.evaluate(()=>{const t=document.body.innerText;return (t.match(/In Ahaan's words, to come/g)||[]).length});
console.log("placeholder lines visible text count",ph);
// non-placeholder check: Line colour text
const col=await p.evaluate(()=>{const out=[];const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=walker.nextNode()){const t=n.textContent.trim();if(!t)continue;const e=n.parentElement;const c=getComputedStyle(e).color;if(/rgb\(184, ?51, ?15\)|rgb\(2[0-9]{2}, ?\d+, ?\d+\)/.test(c)||/rgb\(184/.test(c)){out.push(c+" "+e.tagName+"."+e.className+" "+t.slice(0,30))}}return out.slice(0,20)});
console.log("orange text",JSON.stringify(col));
await b.close();
