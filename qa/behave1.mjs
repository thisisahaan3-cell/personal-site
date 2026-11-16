import { chromium } from "playwright";
const out="qa/screenshots/round-1-behaviour/";
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:900},acceptDownloads:true,permissions:["clipboard-read","clipboard-write"]});
const p=await ctx.newPage();
const log=[];const L=(...a)=>{console.log(...a)};
p.on("pageerror",e=>L("PAGEERROR",e.message));
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(3500);
// Nav hide/show
const navState=async()=>p.evaluate(()=>{const h=document.querySelector('header');const r=h.getBoundingClientRect();const cs=getComputedStyle(h);return {top:Math.round(r.top),op:cs.opacity,tr:cs.transform}});
L("nav top",await navState());
await p.mouse.move(700,400);
await p.mouse.wheel(0,1500);await p.waitForTimeout(1200);L("nav after scroll down",await navState(),"scrollY",await p.evaluate(()=>scrollY));
await p.mouse.wheel(0,-300);await p.waitForTimeout(1200);L("nav after scroll up",await navState());
await p.screenshot({path:out+"nav-after-scrollup.png"});
// Contents overlay
await p.getByRole("button",{name:"Contents"}).click();await p.waitForTimeout(900);
await p.screenshot({path:out+"overlay-open.png"});
const dlg=await p.evaluate(()=>{const d=document.querySelector('[role=dialog]');return d?{label:d.getAttribute('aria-label')||d.getAttribute('aria-labelledby'),modal:d.getAttribute('aria-modal'),active:document.activeElement.tagName+":"+document.activeElement.textContent.trim().slice(0,30),links:[...d.querySelectorAll('a,button')].map(x=>x.textContent.trim())}:null});
L("dialog",JSON.stringify(dlg));
// focus trap: tab 30 times, check active inside dialog
let outside=0;
for(let i=0;i<30;i++){await p.keyboard.press("Tab");const inside=await p.evaluate(()=>!!document.activeElement.closest('[role=dialog]'));if(!inside){outside++;L("focus escaped at tab",i+1,await p.evaluate(()=>document.activeElement.tagName+":"+document.activeElement.textContent.trim().slice(0,30)));break;}}
L("focus escape count",outside);
for(let i=0;i<5;i++){await p.keyboard.press("Shift+Tab");const inside=await p.evaluate(()=>!!document.activeElement.closest('[role=dialog]'));if(!inside){L("shift-tab escaped");break;}}
await p.keyboard.press("Escape");await p.waitForTimeout(800);
L("after escape dialog present",await p.evaluate(()=>!!document.querySelector('[role=dialog]')&&getComputedStyle(document.querySelector('[role=dialog]')).visibility),"active",await p.evaluate(()=>document.activeElement.textContent.trim().slice(0,30)));
// jump to anchors from overlay
for(const name of ["Law","Contact","Timeline","Model UN and public speaking"]){
  await p.mouse.wheel(0,-120);await p.waitForTimeout(900);
  await p.getByRole("button",{name:"Contents"}).click();await p.waitForTimeout(700);
  const link=p.locator('[role=dialog] a',{hasText:name}).first();
  if(!(await link.count())){L("overlay link missing",name);await p.keyboard.press("Escape");continue;}
  await link.click();await p.waitForTimeout(2500);
  const info=await p.evaluate(()=>{const ids=['about','academics','timeline','mun','leadership','competitions','aviation','motorsport','law','quizzing','reading','contact'];return {y:Math.round(scrollY),dlg:!!document.querySelector('[role=dialog]')&&getComputedStyle(document.querySelector('[role=dialog]')).visibility,tops:Object.fromEntries(ids.map(i=>[i,Math.round(document.getElementById(i).getBoundingClientRect().top)]))}});
  L("jump",name,JSON.stringify(info.tops),"dlg",info.dlg);
  await p.screenshot({path:out+"jump-"+name.split(" ")[0]+".png"});
}
// resume download link
const resp=await p.request.get("http://localhost:3101/Ahaan-Gupta-Resume.pdf");
L("pdf",resp.status(),resp.headers()["content-type"],(await resp.body()).length);
await p.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"}));await p.waitForTimeout(1500);
const [dl]=await Promise.all([p.waitForEvent("download"),p.getByRole("link",{name:/Download resume/}).click()]);
L("download",dl.suggestedFilename());
// copy
await p.getByRole("button",{name:"Copy email address"}).click();await p.waitForTimeout(600);
L("clipboard",await p.evaluate(()=>navigator.clipboard.readText()),"btn text now",await p.getByRole("button",{name:/Cop/}).first().textContent());
await p.screenshot({path:out+"copy-state.png"});
L("live",await p.evaluate(()=>[...document.querySelectorAll('[aria-live]')].map(e=>e.getAttribute('aria-live')+':'+e.textContent.trim().slice(0,50))));
await b.close();
