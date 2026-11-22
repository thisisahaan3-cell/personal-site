import { chromium } from "playwright";
const out="qa/screenshots/round-1-behaviour/";
const b=await chromium.launch();
const L=console.log;
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(3500);
const stops=[];
let noOutline=[];
for(let i=0;i<75;i++){
  await p.keyboard.press("Tab");await p.waitForTimeout(120);
  const s=await p.evaluate(()=>{const e=document.activeElement;if(!e||e===document.body)return null;const cs=getComputedStyle(e);const r=e.getBoundingClientRect();return {t:(e.getAttribute('aria-label')||e.textContent.trim().replace(/\s+/g,' ')).slice(0,28),tag:e.tagName,out:cs.outlineStyle+" "+cs.outlineWidth+" "+cs.outlineColor,sh:cs.boxShadow!=='none',vis:r.bottom>0&&r.top<innerHeight,sec:e.closest('section')?.id||e.closest('header,footer')?.tagName}});
  stops.push(s);
  if(s&&/^none/.test(s.out)&&!s.sh)noOutline.push(s.t);
  if(i===2||i===12||i===60)await p.screenshot({path:out+`focus-tab${i+1}.png`});
}
L(stops.map((s,i)=>(i+1)+" "+(s?s.sec+": "+s.t+" ["+s.out.replace('rgb','')+"]"+(s.vis?"":" OFFSCREEN"):"null")).join("\n"));
L("NO OUTLINE:",noOutline.join(" | "));
await b.close();
