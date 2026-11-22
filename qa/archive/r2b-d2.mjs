import { chromium } from "playwright";
const b=await chromium.launch();
for (const [w,h] of [[390,844],[360,780],[320,700]]){
const ctx=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true});
const p=await ctx.newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2500);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=300){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(40)}
const names=await p.evaluate(()=>[...document.querySelectorAll('#mun button')].filter(b=>/^(AAIB|UNGA|CCC|FIA|UNSC|UNHRC|AIPPM|Rajya Sabha|UNODC|WHO|UNESCO|ECOSOC)$/.test(b.textContent.trim())).map(b=>b.textContent.trim()));
const res=[];
for(let i=0;i<names.length;i++){
 await p.evaluate(i=>{const bs=[...document.querySelectorAll('#mun button')].filter(b=>/^(AAIB|UNGA|CCC|FIA|UNSC|UNHRC|AIPPM|Rajya Sabha|UNODC|WHO|UNESCO|ECOSOC)$/.test(b.textContent.trim()));bs[i].scrollIntoView({block:'center'})},i);
 await p.waitForTimeout(150);
 const r=await p.evaluate(i=>{const bs=[...document.querySelectorAll('#mun button')].filter(b=>/^(AAIB|UNGA|CCC|FIA|UNSC|UNHRC|AIPPM|Rajya Sabha|UNODC|WHO|UNESCO|ECOSOC)$/.test(b.textContent.trim()));const bt=bs[i];const r=bt.getBoundingClientRect();const cx=r.x+r.width/2,cy=r.y+r.height/2;
  const hit=(x,y)=>{const e=document.elementFromPoint(x,y);return e&&(e===bt||bt.contains(e))};
  let L=0,R=0,T=0,B=0;
  for(let d=0;d<80;d++){if(hit(cx-d,cy))L=d;else break}
  for(let d=0;d<80;d++){if(hit(cx+d,cy))R=d;else break}
  for(let d=0;d<80;d++){if(hit(cx,cy-d))T=d;else break}
  for(let d=0;d<80;d++){if(hit(cx,cy+d))B=d;else break}
  const ps=['::before','::after'].map(s=>{const c=getComputedStyle(bt,s);return c.content!=='none'?[s,c.top,c.bottom,c.left,c.right,c.width,c.height,c.position].join(','):null}).filter(Boolean);
  return {name:bt.textContent.trim(),boxW:Math.round(r.width),boxH:Math.round(r.height),hitW:L+R+1,hitH:T+B+1,ps}},i);
 res.push(r);}
console.log(w,JSON.stringify(res.map(r=>`${r.name} box ${r.boxW}x${r.boxH} hit ${r.hitW}x${r.hitH}`)),res[0].ps);
await ctx.close();}
await b.close();
