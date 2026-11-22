import { chromium } from "playwright";
const out="qa/screenshots/round-1-behaviour/";
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const L=console.log;
p.on("pageerror",e=>L("PAGEERROR",e.message));
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(3500);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=700){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(80)}
const scrollH=async(sec,text,off)=>{await p.evaluate(([s,t,o])=>{const e=[...document.querySelectorAll(s+' h2,'+s+' h3')].find(h=>h.textContent.includes(t));scrollTo({top:e.getBoundingClientRect().top+scrollY+o,behavior:"instant"})},[sec,text,off]);await p.waitForTimeout(1000)};
// ---- quiz by mouse
await p.evaluate(()=>{const e=[...document.querySelectorAll('#quizzing button')].find(b=>/^A/.test(b.textContent));scrollTo({top:e.getBoundingClientRect().top+scrollY-500,behavior:"instant"})});await p.waitForTimeout(800);
const qstate=async()=>p.evaluate(()=>{const s=document.querySelector('#quizzing');return s.innerText.replace(/\n+/g,' / ').slice(s.innerText.indexOf('Question')-20,s.innerText.indexOf('Question')+600)});


const choose=[1,0,3,1,2,1]; // q2 wrong(A vs C), q4 wrong (B vs A)
for(let q=0;q<6;q++){
  const opts=p.locator('#quizzing button').filter({hasText:/^[ABCD]/}).filter({hasNotText:/^(All|Academics)/});
  const n=await opts.count();
  await opts.nth(choose[q]).click();await p.waitForTimeout(700);
  const st=await qstate();L("Q"+(q+1),"opts",n,"->",st.slice(0,420));
  if(q===1||q===0) await p.screenshot({path:out+`quiz-q${q+1}-answered.png`});
  const next=p.getByRole("button",{name:/Next question/});
  await next.click();await p.waitForTimeout(900);
}
L("final",await qstate());
await p.screenshot({path:out+"quiz-final.png"});
L("live region",await p.evaluate(()=>[...document.querySelectorAll('#quizzing [aria-live]')].map(e=>e.textContent)));
await p.getByRole("button",{name:/Start again/}).click();await p.waitForTimeout(800);L("after restart",(await qstate()).slice(0,120));
// ---- quiz by keyboard
const first=p.locator('#quizzing button').filter({hasText:/^A1921|^A/}).first();
await first.focus();
for(let q=0;q<6;q++){
  await p.keyboard.press("Tab"); // move to B
  await p.keyboard.press("Enter");await p.waitForTimeout(600);
  const ae=await p.evaluate(()=>document.activeElement.textContent.trim().slice(0,30));
  L("kbd Q"+(q+1),"active after answer:",ae);
  if(true){const nxt=p.getByRole("button",{name:/Next question/});await nxt.focus();await p.keyboard.press("Enter");await p.waitForTimeout(800);
    const a=await p.evaluate(()=>document.activeElement.textContent.trim().slice(0,20));L("  after next focus on:",a);
    await p.locator('#quizzing button').filter({hasText:/^A/}).first().focus();}
}
L("kbd final",(await qstate()).slice(0,200));
await b.close();
