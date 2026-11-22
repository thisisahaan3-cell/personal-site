import { chromium } from "playwright";
const out="qa/screenshots/round-1b/";
const b=await chromium.launch();
for(const [w,h] of [[390,844],[360,780],[320,700]]){
  const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true,deviceScaleFactor:2});
  const p=await ctx.newPage();
  p.on("console",m=>{if(m.type()==="error")console.log("CONSOLE",w,m.text())});
  await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(3000);
  const H=await p.evaluate(()=>document.documentElement.scrollHeight);
  for(let y=0;y<H;y+=500){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(60)}
  // locate the quiz figure svg
  const shot=async(name)=>{
    const box=await p.evaluate(()=>{const s=document.querySelector('#quizzing');const svg=[...s.querySelectorAll('svg')].sort((a,b)=>b.getBoundingClientRect().height-a.getBoundingClientRect().height)[0];svg.scrollIntoView({block:"center"});const r=svg.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}});
    await p.waitForTimeout(900);
    const r=await p.evaluate(()=>{const s=document.querySelector('#quizzing');const svg=[...s.querySelectorAll('svg')].sort((a,b)=>b.getBoundingClientRect().height-a.getBoundingClientRect().height)[0];const r=svg.getBoundingClientRect();return {x:Math.max(0,r.x),y:Math.max(0,r.y),w:Math.min(r.width,innerWidth),h:Math.min(r.height,innerHeight)}});
    await p.screenshot({path:out+name,clip:{x:r.x,y:r.y,width:r.w,height:r.h}});
  };
  await shot(`quiz-${w}-q0.png`);
  for(let q=1;q<=6;q++){
    await p.evaluate(()=>{const o=[...document.querySelectorAll('#quizzing button')].find(b=>/^A/.test(b.textContent.trim())&&!/^(All|Academics)/.test(b.textContent.trim()));o.scrollIntoView({block:"center"})});
    await p.waitForTimeout(400);
    const opts=p.locator('#quizzing button').filter({hasText:/^[ABCD]/}).filter({hasNotText:/^(All|Academics)/});
    await opts.nth(q%4).tap();await p.waitForTimeout(700);
    await shot(`quiz-${w}-q${q}.png`);
    const next=p.getByRole("button",{name:/Next question|See|Finish/});
    if(await next.count()){await next.first().tap();await p.waitForTimeout(800)}
  }
  await ctx.close();
}
await b.close();
