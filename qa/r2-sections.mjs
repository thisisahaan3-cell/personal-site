import { chromium } from "playwright";
const ids=["top","about","academics","timeline","mun","leadership","competitions","aviation","motorsport","law","quizzing","reading","contact"];
const jobs=[
 {w:1440,h:900,tag:"d",ids,max:3,mobile:false},
 {w:390,h:844,tag:"m",ids,max:4,mobile:true},
 {w:834,h:1112,tag:"t",ids:["mun","leadership","academics","reading"],max:3,mobile:true},
 {w:1024,h:768,tag:"w1024",ids:["mun"],max:3,mobile:false},
];
const b=await chromium.launch();
for(const j of jobs){
 const ctx=await b.newContext({viewport:{width:j.w,height:j.h},hasTouch:j.mobile,isMobile:j.mobile});
 const p=await ctx.newPage();
 await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(3000);
 const H=await p.evaluate(()=>document.documentElement.scrollHeight);
 for(let y=0;y<H;y+=300){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(40)}
 for(const id of j.ids){
  const info=await p.evaluate(id=>{const e=document.getElementById(id);if(!e)return null;const r=e.getBoundingClientRect();return {top:r.top+scrollY,h:r.height}},id);
  if(!info){console.log(j.tag,id,"MISSING");continue}
  const n=Math.min(j.max,Math.max(1,Math.ceil(info.h/(j.h*0.9))));
  console.log(j.tag,id,Math.round(info.h),"slices",n);
  for(let i=0;i<n;i++){
   await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),info.top+i*j.h*0.9);
   await p.waitForTimeout(900);
   await p.screenshot({path:`qa/screenshots/round-2-sections/${j.tag}-${id}-${i+1}.png`});
  }
 }
 await ctx.close();
}
await b.close();
