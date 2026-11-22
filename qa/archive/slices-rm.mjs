import { chromium } from "playwright";
const [w,h,tag,mobile] = [Number(process.argv[2]),Number(process.argv[3]),process.argv[4],process.argv[5]==="1"];
const ids=["top","about","academics","timeline","mun","leadership","competitions","aviation","motorsport","law","quizzing","reading","contact"];
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:w,height:h},isMobile:mobile,hasTouch:mobile,reducedMotion:"reduce"});
const p=await ctx.newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});
await p.waitForTimeout(4000);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
// warm through
for(let y=0;y<H;y+=h*0.6){await p.evaluate(t=>window.scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(150);}
const geo=await p.evaluate(ids=>ids.map(i=>{const e=document.getElementById(i);if(!e)return [i,null];const r=e.getBoundingClientRect();return [i,Math.round(r.top+scrollY),Math.round(r.height)]}),ids);
console.log(JSON.stringify(geo));
const max=Number(process.argv[6]||3);
for(const [id,top,height] of geo){ if(top==null) continue;
  const n=Math.min(max,Math.ceil(height/(h*0.95)));
  for(let k=0;k<n;k++){
    await p.evaluate(t=>window.scrollTo({top:t,behavior:"instant"}),top+k*h*0.95);
    await p.waitForTimeout(900);
    await p.screenshot({path:`/home/user/personal-site/qa/screenshots/round-1-sections/${tag}-${id}-${k+1}.png`});
  }
}
await b.close();
