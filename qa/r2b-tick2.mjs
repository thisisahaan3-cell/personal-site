import { chromium } from "playwright";
import fs from "fs";
const b=await chromium.launch();
for(const dpr of [1,2,3]){
const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:dpr});const p=await ctx.newPage();
await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(2500);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);for(let y=0;y<H;y+=300){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(30)}
const n=await p.evaluate(()=>document.querySelectorAll('#leadership .r-tick').length);
const out=[];
for(let i=0;i<n;i++){
 await p.evaluate(i=>{const e=document.querySelectorAll('#leadership .r-tick')[i];scrollTo({top:e.getBoundingClientRect().top+scrollY-450,behavior:'instant'})},i);await p.waitForTimeout(1200);
 const r=await p.evaluate(i=>{const e=document.querySelectorAll('#leadership .r-tick')[i].getBoundingClientRect();return [e.x,e.y,e.width]},i);
 const f=`qa/screenshots/round-2b/tk-${dpr}x-${i}.png`;
 await p.screenshot({path:f,clip:{x:Math.round(r[0]),y:Math.floor(r[1])-4,width:12,height:10}});out.push([f,r[1]]);}
fs.writeFileSync(`/tmp/claude-0/tk${dpr}.json`,JSON.stringify(out));
await ctx.close();}
await b.close();
