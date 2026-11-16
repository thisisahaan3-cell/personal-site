import { chromium } from "playwright";
const out="qa/screenshots/round-1-sections/";
const b=await chromium.launch();
for(const [w,h,mob,tag] of [[1024,768,false,"w1024"],[360,740,true,"w360"]]){
const p=await (await b.newContext({viewport:{width:w,height:h},isMobile:mob,hasTouch:mob})).newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(4000);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=h*0.6){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(100)}
for(const id of ["top","mun","competitions","quizzing"]){
 await p.evaluate(i=>{const e=document.getElementById(i);scrollTo({top:e.getBoundingClientRect().top+scrollY+(i==="mun"||i==="competitions"?250:0),behavior:"instant"})},id);await p.waitForTimeout(1000);
 await p.screenshot({path:`${out}${tag}-${id}.png`});}
}
await b.close();
