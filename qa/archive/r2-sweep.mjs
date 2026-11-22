import { chromium } from "playwright";
const b=await chromium.launch();
for(const w of [1440,1024,834,390,360]){
 const ctx=await b.newContext({viewport:{width:w,height:w>800?900:844}});
 const p=await ctx.newPage();const errs=[],fail=[],warn=[];
 p.on("console",m=>{if(m.type()==="error")errs.push(m.text());if(m.type()==="warning")warn.push(m.text().slice(0,80))});
 p.on("pageerror",e=>errs.push("PE "+e.message));
 p.on("requestfailed",r=>fail.push(r.url()));
 p.on("response",r=>{if(r.status()>=400)fail.push(r.status()+" "+r.url())});
 await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2500);
 const H=await p.evaluate(()=>document.documentElement.scrollHeight);
 for(let y=0;y<H;y+=500){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(60)}
 const o=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,bw:document.body.scrollWidth}));
 console.log(w,"overflow",o.sw>o.cw||o.bw>o.cw,JSON.stringify(o),"errors",JSON.stringify(errs),"failed",JSON.stringify(fail),"warnings",warn.length);
 await ctx.close();
}
await b.close();
