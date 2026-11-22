import { chromium } from "playwright";
const out="qa/screenshots/round-1-behaviour/";
const b=await chromium.launch();
const L=console.log;
// JS disabled
for(const [w,h,name] of [[1440,900,"d"],[390,844,"m"]]){
const ctx=await b.newContext({viewport:{width:w,height:h},javaScriptEnabled:false});const p=await ctx.newPage();
await p.goto("http://localhost:3101",{waitUntil:"load"});await p.waitForTimeout(1500);
const r=await p.evaluate(()=>0).catch(()=>null);
await p.screenshot({path:out+`nojs-${name}-top.png`});
await p.screenshot({path:out+`nojs-${name}-full.png`,fullPage:true});
const html=await p.content();
const info={len:html.length};
// read visibility via CSS in static computed? JS disabled => cannot evaluate. Use locator checks instead
const texts=["Ahaan","Self-driven student","Academic profile","99.4%","Best Delegate","Executive Board","Green Captain","AIR 54","Artha","Wharton Global","Aviation","Motorsport","Introduction to Law","Reading","thisisahaan@gmail.com","Download resume"];
const vis={};
for(const t of texts){const loc=p.getByText(t).first();vis[t]=(await loc.count())?await loc.isVisible():"MISSING"}
L(name,"nojs visibility",JSON.stringify(vis));
// opacity check via locator evaluate (playwright evaluates in page even if JS disabled? it does use CDP)
const ops=await p.evaluate(()=>{const bad=[];document.querySelectorAll('h1,h2,h3,p,td,li,a,button').forEach(e=>{const cs=getComputedStyle(e);let a=e,o=1;while(a){o*=parseFloat(getComputedStyle(a).opacity);a=a.parentElement}if(o<0.9&&e.textContent.trim())bad.push(e.tagName+":"+e.textContent.trim().slice(0,25)+" op="+o.toFixed(2))});return bad.slice(0,15)}).catch(e=>"eval-failed "+e.message);
L(name,"low-opacity text without JS",JSON.stringify(ops));
L(name,"nojs page height",await p.evaluate(()=>document.documentElement.scrollHeight).catch(()=>"n/a"));
await ctx.close();}
await b.close();
