import { chromium } from "playwright";
const out="qa/screenshots/round-2-behaviour/";
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(3000);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=300){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(30)}
await p.evaluate(()=>document.getElementById('quizzing').scrollIntoView({behavior:"instant"}));await p.waitForTimeout(800);
for(let i=0;i<6;i++){
  await p.evaluate(()=>document.querySelector('#quizzing .quiz-opt').focus());
  const q=await p.evaluate(()=>document.querySelector('#quizzing h3,#quizzing h2+*')?.textContent?.slice(0,50));
  await p.keyboard.press("ArrowDown").catch(()=>{});
  await p.keyboard.press("Enter");await p.waitForTimeout(500);
  let hops=0;
  while(hops<8){const t=await p.evaluate(()=>document.activeElement.textContent.trim());if(/^(Next question|See|Finish|Show|Restart|Start)/i.test(t))break;await p.keyboard.press("Tab");hops++}
  const t=await p.evaluate(()=>document.activeElement.tagName+":"+document.activeElement.textContent.trim().slice(0,30));
  console.log("q",i+1,"tabs to next:",hops,JSON.stringify(t));
  await p.keyboard.press("Enter");await p.waitForTimeout(900);
}
console.log(await p.locator('#quizzing').evaluate(e=>e.textContent.replace(/\s+/g,' ').slice(-400)));
await p.screenshot({path:out+"quiz-end.png"});
await b.close();
