import { chromium } from "playwright";
const out="qa/screenshots/round-1-behaviour/";
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:900}});
const p=await ctx.newPage();
const L=console.log;
p.on("pageerror",e=>L("PAGEERROR",e.message));
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(3500);
const go=async(id)=>{await p.evaluate(i=>{const e=document.getElementById(i);window.scrollTo({top:e.getBoundingClientRect().top+scrollY,behavior:"instant"})},id);await p.waitForTimeout(1200)};
// ---- Timeline
await go("timeline");
const panel=async()=>p.evaluate(()=>{const l=document.querySelector('#timeline [aria-live=polite]');return l?l.textContent.trim().slice(0,90):null});
L("tl panel start",await panel(),"y",await p.evaluate(()=>scrollY));
const entries=p.locator('#timeline button[tabindex]').filter({hasText:/./});
const tabs=await p.evaluate(()=>[...document.querySelectorAll('#timeline button')].map(b=>b.tabIndex+":"+b.textContent.trim().slice(0,18)));
L("tl buttons tabindex",tabs.join(" | "));
// focus first entry
await p.locator('#timeline button[tabindex="0"]').first().focus();
for(let i=0;i<4;i++){await p.keyboard.press("ArrowRight");await p.waitForTimeout(700);L("ArrowRight ->",await panel(),"y",await p.evaluate(()=>scrollY));}
await p.screenshot({path:out+"timeline-arrow4.png"});
await p.keyboard.press("End");await p.waitForTimeout(1200);L("End ->",await panel(),"y",await p.evaluate(()=>scrollY));
await p.screenshot({path:out+"timeline-end.png"});
await p.keyboard.press("Home");await p.waitForTimeout(1200);L("Home ->",await panel(),"y",await p.evaluate(()=>scrollY));
// focus outline
await p.locator('#timeline button[tabindex="0"]').first().focus();await p.keyboard.press("ArrowRight");await p.waitForTimeout(700);
await p.screenshot({path:out+"timeline-focus.png"});
// filter
await p.getByRole("button",{name:"MUN and debate"}).click();await p.waitForTimeout(900);
await p.screenshot({path:out+"timeline-filter-mun.png"});
L("filter MUN panel",await panel(),"pressed",await p.evaluate(()=>[...document.querySelectorAll('#timeline button[aria-pressed]')].map(b=>b.textContent.trim()+"="+b.getAttribute('aria-pressed')).join(",")));
await p.locator('#timeline button[tabindex="0"]').first().focus();await p.keyboard.press("ArrowRight");await p.waitForTimeout(800);L("filter MUN arrow ->",await panel());
await p.getByRole("button",{name:"All",exact:true}).first().click();await p.waitForTimeout(500);
// drag
const y0=await p.evaluate(()=>scrollY);
await p.mouse.move(900,440);await p.mouse.down();await p.mouse.move(600,440,{steps:12});await p.mouse.up();await p.waitForTimeout(1200);
L("drag scrollY",y0,"->",await p.evaluate(()=>scrollY),"panel",await panel());
// click entry
const clickTarget=p.locator('#timeline button[tabindex]').nth(10);
try{await clickTarget.click({timeout:3000});await p.waitForTimeout(1200);L("click entry ->",await panel());}catch(e){L("click entry failed",e.message.split("\n")[0])}
// scroll through pin: capture at mid and end
for(const dy of [600,700,800]){await p.mouse.wheel(0,dy);await p.waitForTimeout(900);}
await p.screenshot({path:out+"timeline-late.png"});
L("late panel",await panel());
// after pin end: In progress
await p.mouse.wheel(0,1000);await p.waitForTimeout(1200);
await p.screenshot({path:out+"timeline-exit.png"});
// Scroll-pin continuity: the stage
await b.close();
