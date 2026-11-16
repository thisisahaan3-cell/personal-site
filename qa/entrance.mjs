import { chromium } from "playwright";
const b=await chromium.launch();
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const t0=Date.now();
await p.goto("http://localhost:3101",{waitUntil:"commit"});
for(const ms of [300,1000,2500]){
  const wait=ms-(Date.now()-t0); if(wait>0) await p.waitForTimeout(wait);
  await p.screenshot({path:`qa/screenshots/round-1-behaviour/entrance-${ms}ms.png`});
}
await b.close();
