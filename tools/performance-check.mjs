// Observe normal startup/input; never advance or replace game simulation.
import puppeteer from '../../404-game-recipe/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import fs from 'node:fs';import assert from 'node:assert/strict';
const out=process.env.EVIDENCE_DIR||'evidence/performance';fs.mkdirSync(out,{recursive:true});
const url=process.env.GAME_URL||'http://localhost:4173/';
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const report={url,runs:[]};
try{for(const mobile of [true,false]){
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(e.type()==='error')errors.push(e.text());});page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 await page.setViewport(mobile?{width:390,height:844,deviceScaleFactor:3,isMobile:true,hasTouch:true}:{width:1440,height:900,deviceScaleFactor:1});
 const session=await page.createCDPSession();await session.send('Emulation.setCPUThrottlingRate',{rate:mobile?4:1});
 await page.evaluateOnNewDocument(()=>{
  window.frameLog=[];window.longTasks=[];new PerformanceObserver(list=>window.longTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});
  let before=0;function sample(t){const g=window.__GAME__;if(before&&g)window.frameLog.push({t,dt:t-before,state:g.state,elapsed:g.elapsed,speed:g.speed,draws:g.draws,tris:g.tris});before=t;requestAnimationFrame(sample);}requestAnimationFrame(sample);
 });
 await page.goto(url);await page.waitForFunction('window.__READY__',{timeout:60000});
 const ready=await page.evaluate(()=>performance.now());
 if(mobile)await page.tap('#quickraceb');else await page.click('#quickraceb');
 await page.waitForFunction('window.__GAME__?.state==="race"',{timeout:60000});
 const raceAt=await page.evaluate(()=>performance.now());
 await new Promise(r=>setTimeout(r,10000));
 const data=await page.evaluate(()=>({frames:window.frameLog,tasks:window.longTasks,game:window.__GAME__}));
 const stats=frames=>{const sorted=frames.map(f=>f.dt).sort((a,b)=>a-b),q=p=>sorted[Math.min(sorted.length-1,Math.floor(sorted.length*p))]||0;return{frames:frames.length,medianMs:q(.5),p95Ms:q(.95),maxMs:q(1),over100ms:sorted.filter(v=>v>100).length,averageFps:frames.length*1000/frames.reduce((a,f)=>a+f.dt,0),peakDraws:Math.max(...frames.map(f=>f.draws)),peakTris:Math.max(...frames.map(f=>f.tris))};};
 report.runs.push({mobile,cpuSlowdown:mobile?4:1,readyMs:ready,raceAtMs:raceAt,countdown:stats(data.frames.filter(f=>f.state==='countdown')),launch:stats(data.frames.filter(f=>f.state==='race'&&f.elapsed<3)),racing:stats(data.frames.filter(f=>f.state==='race'&&f.elapsed>=3)),longTasks:data.tasks,errors});
 fs.writeFileSync(`${out}/${mobile?'phone':'desktop'}-frames.json`,JSON.stringify(data,null,2));await page.screenshot({path:`${out}/${mobile?'phone':'desktop'}-race.png`});await page.close();
 console.log(JSON.stringify(report.runs.at(-1)));
}fs.writeFileSync(`${out}/performance.json`,JSON.stringify(report,null,2));if(process.argv.includes('--assert-smooth'))for(const run of report.runs){assert.deepEqual(run.errors,[]);assert.ok(run.countdown.frames>60&&run.launch.frames>60);assert.equal(run.countdown.over100ms,0,'no countdown stall over 100 ms');assert.equal(run.launch.over100ms,0,'no launch stall over 100 ms');}}finally{await browser.close();}
