// Six complete real-keyboard time trials. A named unlock fixture exposes later arenas;
// it is not evidence of earning their unlocks (campaign tests cover that separately).
import puppeteer from '../../404-game-recipe/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import fs from 'node:fs';import assert from 'node:assert/strict';
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--no-proxy-server']});
const page=await browser.newPage();await page.setViewport({width:1280,height:800,deviceScaleFactor:1});
const selected=process.env.ARENAS?process.env.ARENAS.split(',').map(Number):[0,1,2,3,4,5],reportPath='evidence/territory-races'+(process.env.ARENAS?'-'+selected.join('-'):'')+'-check.json';
const errors=[],report={fixture:'All territories unlocked for isolated full-course time trials; no race progress is injected.',routes:[],errors},held=new Set();
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
async function key(k,on){if(on&&!held.has(k)){await page.keyboard.down(k);held.add(k);}else if(!on&&held.has(k)){await page.keyboard.up(k);held.delete(k);}}
try{
 await page.goto('http://localhost:4173/');await page.waitForFunction('window.__READY__',{timeout:60000});
 await page.evaluate(async()=>{const {SAVE_KEY,loadSave}=await import('./campaign.js');const s=loadSave();s.cleared=Array(6).fill(true);localStorage.setItem(SAVE_KEY,JSON.stringify(s));});
 await page.reload();await page.waitForFunction('window.__READY__',{timeout:60000});await page.click('#enterdock');
 const geometry=await page.evaluate(async()=>{const {CHAPTERS}=await import('./campaign.js'),{makeCourse}=await import('./course.js');return CHAPTERS.map(c=>{const route=makeCourse(c);let maxError=0,maxTurn=0;for(let s=0;s<route.length;s+=40){const a=route.at(s),n=route.nearest(a.p.x,a.p.z,s),b=route.at(s+20);maxError=Math.max(maxError,n.distance);maxTurn=Math.max(maxTurn,Math.abs(Math.atan2(Math.sin(b.heading-a.heading),Math.cos(b.heading-a.heading))));if(route.sector(s)!==c.arena)throw Error('Mixed biome');}return{id:c.id,length:route.length,maxError,maxTurn};});});
 report.geometry=geometry;for(const r of geometry){assert.ok(r.length>7500&&r.length<13000);assert.ok(r.maxError<.1);assert.ok(r.maxTurn<.6,'no unsteerable hairpin');}
 for(const arena of selected){
  await page.click('#arenasb');await page.click(`[data-course="${arena}"]`);await page.click('[data-mode="time"]');
  await page.evaluate(async i=>{const {CHAPTERS}=await import('./campaign.js'),{makeCourse}=await import('./course.js');window.testCourse=makeCourse(CHAPTERS[i]);},arena);
  await page.click('#startb');await page.waitForFunction('window.__GAME__.state==="race"',{timeout:60000});
  const run={arena,id:geometry[arena].id,checkpoints:[],peaks:{draws:0,tris:0},lensMax:0},seen=new Set();report.routes.push(run);const deadline=Date.now()+330000;let result;
  while(Date.now()<deadline){
   const t=await page.evaluate(()=>{const t=window.__GAME__,c=window.testCourse,s=t.progress*c.length,pick=t.nextPickup;let offset=0;if(pick&&pick.s-s<180&&pick.s>s)offset=pick.offset;for(const o of t.obstacleAhead||[])if(o.s-s<130&&Math.abs(offset-o.offset)<o.radius+4)offset=o.offset+(offset>=o.offset?1:-1)*(o.radius+6);if(t.lethalAhead?.distance<130&&Math.abs(offset-t.lethalAhead.offset)<7)offset=t.lethalAhead.offset>0?-6:6;const p=c.at(s+Math.max(20,t.speed*.58),offset).p;return{...t,target:Math.atan2(p.x-t.pos[0],p.z-t.pos[1])};});
   run.peaks.draws=Math.max(run.peaks.draws,t.draws);run.peaks.tris=Math.max(run.peaks.tris,t.tris);run.lensMax=Math.max(run.lensMax,t.lensDrops);assert.equal(t.sector,arena,'environment stays in the selected territory');
   if(t.state==='results'){result=t;break;}
   const d=Math.atan2(Math.sin(t.target-t.heading),Math.cos(t.target-t.heading));await key('ArrowLeft',d>.025);await key('ArrowRight',d<-.025);await key('Space',Math.abs(d)<.28&&t.boost>4);await key('ArrowDown',Math.abs(d)>.65&&t.speed>29);
   if(t.lethalAhead?.distance<85&&t.weapons.defenses>0&&t.weapons.shield<=0)await page.keyboard.press('KeyE');
   if(!seen.has(t.checkpoint)&&t.progress>(t.checkpoint+.3)/6){seen.add(t.checkpoint);await page.screenshot({path:`evidence/territory-${run.id}-${t.checkpoint}.png`});run.checkpoints.push({checkpoint:t.checkpoint,elapsed:t.elapsed,draws:t.draws,tris:t.tris});console.log(run.id,'checkpoint',t.checkpoint,'elapsed',t.elapsed.toFixed(1));}
   await new Promise(r=>setTimeout(r,65));
  }
  for(const k of [...held])await key(k,false);
  run.result=result;assert.ok(result,'complete course');assert.equal(result.weapons.eliminated,false,'driver survives every course');assert.equal(seen.size,6);assert.ok(result.elapsed>90);assert.ok(run.peaks.draws<=900);assert.ok(run.peaks.tris<=1500000);assert.ok(run.lensMax>0);assert.ok(result.pickups>0);await page.screenshot({path:`evidence/territory-${run.id}-finish.png`});console.log('FINISH',run.id,result.elapsed.toFixed(2),run.peaks);fs.writeFileSync(reportPath,JSON.stringify(report,null,2));await page.click('#dockb');
 }
 assert.equal(errors.length,0);report.passed=true;
}catch(e){report.failure=e.stack;process.exitCode=1;console.error(e);}finally{fs.writeFileSync(reportPath,JSON.stringify(report,null,2));await browser.close();}
