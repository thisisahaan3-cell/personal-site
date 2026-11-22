import { chromium } from "playwright";
const out="qa/screenshots/round-2-behaviour/";
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const errs=[];p.on("console",m=>{if(["error","warning"].includes(m.type()))errs.push(m.text())});
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(3000);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=300){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(30)}
await p.evaluate(()=>document.getElementById('quizzing').scrollIntoView({behavior:"instant"}));await p.waitForTimeout(1000);
const q=p.locator('#quizzing');
const info=async()=>q.evaluate(e=>({q:(e.querySelector('[role=radiogroup],fieldset')||{}).textContent?.replace(/\s+/g,' ').slice(0,110),radios:[...e.querySelectorAll('input[type=radio],[role=radio],button')].map(x=>(x.textContent||x.value||'').trim().slice(0,18)).slice(0,14),active:document.activeElement.textContent.trim().slice(0,30)}));
console.log(JSON.stringify(await info()));
for(let i=0;i<7;i++){
  // focus first answer via tab until we're on an answer button inside quizzing
  for(let k=0;k<10;k++){const inq=await p.evaluate(()=>!!document.activeElement.closest('#quizzing')&&document.activeElement.tagName!=='BODY');if(inq)break;await p.keyboard.press("Tab")}
  await p.keyboard.press("Enter");await p.waitForTimeout(700);
  console.log("step",i,"focus:",await p.evaluate(()=>document.activeElement.tagName+" "+document.activeElement.textContent.trim().slice(0,40)));
  if(i==0||i==6)await p.screenshot({path:out+`quiz-step${i}.png`});
  await p.keyboard.press("Tab");await p.waitForTimeout(300);
}
console.log("final",JSON.stringify(await info()));
await p.screenshot({path:out+"quiz-final.png"});
console.log(errs);
await b.close();
