import { chromium } from "playwright";
const out="qa/screenshots/round-1b/";
const b=await chromium.launch();
const L=console.log;
// phone
{
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});
const p=await ctx.newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(3000);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=400){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(50)}
const m=await p.evaluate(()=>{
 const r=e=>{const b=e.getBoundingClientRect();return [Math.round(b.width*10)/10,Math.round(b.height*10)/10]};
 const res={};
 res.sort=[...document.querySelectorAll('#mun button')].filter(b=>/Committee|Award|Year/.test(b.textContent)&&b.getBoundingClientRect().height<80).map(b=>[b.textContent.trim().slice(0,20),...r(b)]);
 const em=document.querySelector('#contact a[href^="mailto"]');res.email=[em.textContent.trim(),...r(em),getComputedStyle(em).color];
 const bt=[...document.querySelectorAll('a')].find(a=>/Back to top/i.test(a.textContent));res.back=[...r(bt),getComputedStyle(bt).color,getComputedStyle(bt).textDecorationColor];
 return res});
L("PHONE",JSON.stringify(m));
// logos on rows
const rows=await p.evaluate(()=>{
 const out=[];
 document.querySelectorAll('tr, li, [role=row]').forEach(r=>{const t=r.textContent;if(/Rasmanjari|Lotus Young Leaders/.test(t)&&t.length<600){out.push({t:t.slice(0,70),imgs:[...r.querySelectorAll('img')].map(i=>i.getAttribute('src')+'|'+i.alt)})}});
 return out});
L("ROWS",JSON.stringify(rows));
await ctx.close();
}
// desktop
{
const ctx=await b.newContext({viewport:{width:1440,height:900}});
const p=await ctx.newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(3000);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=400){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(50)}
const rows=await p.evaluate(()=>{const out=[];document.querySelectorAll('tr, li').forEach(r=>{const t=r.textContent;if(/Rasmanjari|Lotus Young Leaders/.test(t)&&t.length<600)out.push({t:t.slice(0,70),imgs:[...r.querySelectorAll('img')].map(i=>i.getAttribute('src'))})});return out});
L("ROWS-D",JSON.stringify(rows));
for(const [name,re] of [["rasmanjari",/Rasmanjari/],["summit",/Lotus Young Leaders/]]){
  await p.evaluate(s=>{const e=[...document.querySelectorAll('#leadership tr, #academics tr, #leadership li, #academics li, tr')].find(r=>new RegExp(s).test(r.textContent)&&r.textContent.length<600);e.scrollIntoView({block:"center"})},re.source);
  await p.waitForTimeout(900);
  await p.screenshot({path:out+`logo-${name}-1440.png`});
}
// links
await p.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"}));await p.waitForTimeout(900);
const bt=await p.evaluate(()=>{const a=[...document.querySelectorAll('a')].find(a=>/Back to top/i.test(a.textContent));const s=getComputedStyle(a);return [s.color,s.textDecorationColor,s.borderBottomColor]});
L("BACKTOTOP",bt);
await p.screenshot({path:out+"footer-1440.png"});
// email hover end dot
const em=p.locator('#contact a[href^="mailto"]').first();
await em.scrollIntoViewIfNeeded();await p.waitForTimeout(800);
const dotBefore=await p.screenshot({path:out+"email-before.png"});
await em.hover();await p.waitForTimeout(900);
await p.screenshot({path:out+"email-after.png"});
// quiz source link
await p.evaluate(()=>{const o=[...document.querySelectorAll('#quizzing button')].find(b=>/^A/.test(b.textContent.trim())&&!/^(All|Academics)/.test(b.textContent.trim()));o.scrollIntoView({block:"center"})});await p.waitForTimeout(500);
await p.locator('#quizzing button').filter({hasText:/^[ABCD]/}).filter({hasNotText:/^(All|Academics)/}).nth(1).click();await p.waitForTimeout(800);
const ql=await p.evaluate(()=>[...document.querySelectorAll('#quizzing a')].map(a=>[a.textContent.trim().slice(0,30),getComputedStyle(a).color,getComputedStyle(a).textDecorationColor,getComputedStyle(a).borderBottomColor]));
L("QUIZLINKS",JSON.stringify(ql));
await p.screenshot({path:out+"quiz-source-1440.png"});
// overlay
await p.evaluate(()=>scrollTo({top:0,behavior:"instant"}));await p.waitForTimeout(600);
await p.getByRole("button",{name:/Contents/}).first().click();await p.waitForTimeout(1200);
const ol=await p.evaluate(()=>[...document.querySelectorAll('[role=dialog] a')].filter(a=>/mailto/.test(a.href)).map(a=>[a.textContent.trim(),getComputedStyle(a).color,getComputedStyle(a).textDecorationColor,getComputedStyle(a).borderBottomColor]));
L("OVERLAYEMAIL",JSON.stringify(ol));
await p.screenshot({path:out+"overlay-1440.png"});
await ctx.close();
}
await b.close();
