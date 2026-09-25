import puppeteer from '../../404-game-recipe/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import fs from 'node:fs';import assert from 'node:assert/strict';
const out=process.env.EVIDENCE_DIR||'evidence/launch-boost';fs.mkdirSync(out,{recursive:true});
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox']}),report={runs:[],errors:[]};
try{for(const mobile of process.env.DESKTOP_ONLY?[false]:[false,true]){
 const page=await browser.newPage();await page.setViewport(mobile?{width:844,height:390,isMobile:true,hasTouch:true,deviceScaleFactor:1}:{width:1280,height:800});page.on('pageerror',e=>report.errors.push(e.message));
 const click=s=>mobile?page.tap(s):page.click(s);
 await page.goto('http://localhost:4173/');await page.waitForFunction('window.__READY__');await click('#enterdock');
 for(const arena of [0,1,2,3,4,5]){
  await click('#arenasb');await click(`[data-course="${arena}"]`);await click('#startb');await page.waitForFunction('window.__GAME__.state==="countdown"');
  const frames=await page.evaluate(()=>new Promise(resolve=>{const frames=[];let last=performance.now();function read(now){const t=window.__GAME__;frames.push({wall:now,dt:now-last,state:t.state,elapsed:t.elapsed,speed:t.speed,boosting:t.boosting,launch:t.launch,reserve:t.boost,collisions:t.collisions,pos:t.pos});last=now;if(t.elapsed>2&&t.state==='race')resolve(frames);else requestAnimationFrame(read);}requestAnimationFrame(read);}));
  const race=frames.filter(f=>f.state==='race'),first=race[0],half=race.find(f=>f.elapsed>=.5),one=race.find(f=>f.elapsed>=1);const run={arena,mobile,first,half,one,maxFrameMs:Math.max(...race.map(f=>f.dt)),toHalfSpeedMs:race.find(f=>f.speed>=45)?.wall-first.wall,frames};report.runs.push(run);
  assert.ok(race.every(f=>f.boosting===true),'automatic boost active from the first race frame');assert.ok(race.every(f=>f.reserve===100),'launch preserves the ten-second reserve');assert.ok(first.speed>0);assert.ok(half.speed>55);assert.ok(one.speed>80);console.log(JSON.stringify({...run,frames:undefined}));
  await click('#pauseb');await click('#exitb');
 }await page.close();
}assert.deepEqual(report.errors,[]);report.passed=true;}catch(e){report.failure=e.stack;process.exitCode=1;console.error(e);}finally{fs.writeFileSync(out+'/checks.json',JSON.stringify(report,null,2));await browser.close();}
