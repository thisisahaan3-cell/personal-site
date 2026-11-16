import { chromium } from "playwright";
const b=await chromium.launch();
const L=console.log;
// tap targets on phone
{
const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await ctx.newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2500);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=600){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(60)}
const small=await p.evaluate(()=>{const out=[];document.querySelectorAll('a,button,summary,[role=button],input').forEach(e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);if(r.width===0||r.height===0||cs.visibility==='hidden')return;if(r.width<44||r.height<44)out.push((e.textContent.trim().replace(/\s+/g,' ').slice(0,26)||e.getAttribute('aria-label')||e.tagName)+" "+Math.round(r.width)+"x"+Math.round(r.height)+" in "+(e.closest('section')?.id||e.closest('header,footer')?.tagName))});return out});
L("PHONE SMALL TARGETS",small.length);L(small.join("\n"));
await ctx.close();}
// contrast & line-colour text
{
const ctx=await b.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(3000);
const res=await p.evaluate(()=>{
 const parse=c=>{const m=c.match(/rgba?\(([^)]+)\)/);if(!m)return null;const a=m[1].split(/[ ,\/]+/).map(Number);return {r:a[0],g:a[1],b:a[2],a:a[3]===undefined?1:a[3]}};
 const lum=({r,g,b})=>{const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return .2126*f(r)+.7152*f(g)+.0722*f(b)};
 const bgOf=e=>{let a=e;while(a){const c=parse(getComputedStyle(a).backgroundColor);if(c&&c.a>0.9)return c;a=a.parentElement}return {r:245,g:243,b:239,a:1}};
 const groups={};
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 let n;while(n=walker.nextNode()){const t=n.textContent.trim();if(!t)continue;const e=n.parentElement;if(e.closest('svg,script,style,noscript'))continue;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.display==='none')continue;
  const fg=parse(cs.color);const bg=bgOf(e);const op=parseFloat(cs.opacity);
  const l1=lum(fg),l2=lum(bg);const cr=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);
  const key=cs.color+" on "+`rgb(${bg.r},${bg.g},${bg.b})`+" "+cs.fontSize;
  if(!groups[key])groups[key]={cr:cr.toFixed(2),n:0,ex:t.slice(0,30),size:cs.fontSize,sec:e.closest('section')?.id};groups[key].n++;}
 return Object.entries(groups).filter(([k,v])=>parseFloat(v.cr)<4.8).map(([k,v])=>k+" CR="+v.cr+" n="+v.n+" e.g. '"+v.ex+"' in "+v.sec);
});
L("LOW/EDGE CONTRAST");L(res.join("\n"));
const lineText=await p.evaluate(()=>{const out=new Set();const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=walker.nextNode()){const t=n.textContent.trim();if(!t)continue;const e=n.parentElement;if(e.closest('svg'))continue;const cs=getComputedStyle(e);const c=cs.color;const m=c.match(/\d+/g).map(Number);if(m[0]>140&&m[1]<110&&m[2]<80)out.add(c+" '"+t.slice(0,30)+"' "+(e.closest('section')?.id||e.closest('header,footer,[role=dialog]')?.tagName)+" deco="+cs.textDecorationLine+" "+cs.textDecorationColor)}return [...out]});
L("ORANGE-ISH TEXT");L(lineText.join("\n"));
const css=await p.evaluate(()=>{const r=getComputedStyle(document.documentElement);return ['--line','--line-ink','--line-night','--stone','--navy','--slate'].map(k=>k+"="+r.getPropertyValue(k).trim()).join(" ")});L(css);
await ctx.close();}
await b.close();
