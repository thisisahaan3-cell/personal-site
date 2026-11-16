import { chromium } from "playwright";
const out="qa/screenshots/round-1b/";
const b=await chromium.launch();
for(const [w,h] of [[834,1112],[1024,768]]){
  const p=await (await b.newContext({viewport:{width:w,height:h}})).newPage();
  await p.goto("http://localhost:3101",{waitUntil:"networkidle"});await p.waitForTimeout(3000);
  const H=await p.evaluate(()=>document.documentElement.scrollHeight);
  for(let y=0;y<H;y+=400){await p.evaluate(t=>scrollTo({top:t,behavior:"instant"}),y);await p.waitForTimeout(60)}
  const info=await p.evaluate(()=>{const s=document.querySelector('#mun, #model-un, #geopolitics');return s?{id:s.id,top:s.getBoundingClientRect().top+scrollY,h:s.getBoundingClientRect().height}:null});
  console.log(w,JSON.stringify(info));
  // find globe and geopolitics heading
  const g=await p.evaluate(()=>{const hs=[...document.querySelectorAll('h2,h3')].filter(h=>/Geopolitics/.test(h.textContent));return hs.map(h=>({t:h.textContent,y:h.getBoundingClientRect().top+scrollY,x:h.getBoundingClientRect().x,sec:h.closest('section')?.id}))});
  console.log(JSON.stringify(g));
  if(g[0]){
    for(let i=-1;i<3;i++){
      await p.evaluate(y=>scrollTo({top:y,behavior:"instant"}),g[0].y-250+i*(h*0.8)+ (i<0?-h*0.2:0));await p.waitForTimeout(900);
      await p.screenshot({path:out+`mun-${w}-${i+1}.png`});
    }
  }
}
await b.close();
