// Genuine game controls; telemetry recording does not modify game state.
import puppeteer from '../../404-game-recipe/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import fs from 'node:fs';import assert from 'node:assert/strict';
const out=process.env.EVIDENCE_DIR||'evidence/flight-shield';fs.mkdirSync(out,{recursive:true});
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--no-proxy-server']});
const report={errors:[],frames:[]},held=new Set();let page;
async function key(k,on){if(on&&!held.has(k)){held.add(k);await page.keyboard.down(k);}else if(!on&&held.has(k)){held.delete(k);await page.keyboard.up(k);}}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try{page=await browser.newPage();await page.setViewport({width:1100,height:720});page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});await page.goto('http://localhost:4173/');await page.waitForFunction('window.__READY__',{timeout:60000});
 await page.evaluate(async()=>{const {CHAPTERS}=await import('./campaign.js'),{makeCourse}=await import('./course.js');window.testCourse=makeCourse(CHAPTERS[0]);});await page.click('#enterdock');await page.click('#arenasb');await page.click('[data-mode="time"]');await page.click('#startb');await page.waitForFunction('window.__GAME__.state==="countdown"');const grid=await page.evaluate(()=>window.__GAME__);assert.equal(grid.weapons.shield,0);assert.equal(grid.weapons.invulnerable,0);assert.equal(grid.launch,15);assert.ok(grid.rivals.every(r=>r.shield===0&&r.launch===15));report.grid=grid;await page.screenshot({path:`${out}/unshielded-grid.png`});
 await page.waitForFunction('window.__GAME__.state==="race"');const started=Date.now();let activated=false,passedPier=false,tookOff=false,landed=false,previous=null,samples=0,peak=0;
 while(Date.now()-started<150000){const t=await page.evaluate(()=>window.__GAME__),s=t.progress*t.courseLength,pier=t.courseLength*.18/6;
  if(!activated&&s>pier-85){assert.equal(t.weapons.shield,0,'no free opening protection');await page.keyboard.press('KeyE');activated=true;}
  if(!passedPier&&Math.abs(s-pier)<5){assert.ok(t.weapons.shield>0);assert.equal(t.barrierContact,false);assert.equal(t.collisions,0);assert.ok(t.lateral>9.2&&t.lateral<10.8);report.shieldClearance=t;await page.screenshot({path:`${out}/shield-through-pillar.png`});}
  if(s>pier+15)passedPier=true;
  if(t.ramp==null&&t.flightY!=null&&t.air>1.5){if(!tookOff){tookOff=true;await page.screenshot({path:`${out}/ramp-flight.png`});}peak=Math.max(peak,t.air);
   if(previous&&previous.ramp==null&&previous.flightY!=null&&previous.verticalSpeed!==0){const dt=t.elapsed-previous.elapsed;if(dt>0&&dt<.5){const expected=previous.flightY+previous.verticalSpeed*dt-4.5*dt*dt;assert.ok(Math.abs(t.flightY-expected)<.025,'airborne world height follows one uninterrupted arc');assert.ok(Math.abs(t.renderY-(t.flightY-.12))<.001,'rendering does not add wave bobbing');samples++;}}
  }
  if(tookOff&&t.jumps>0&&!landed){landed=true;report.landing=t;await page.screenshot({path:`${out}/smooth-landing.png`});}
  if(t.elapsed>14&&t.elapsed<14.5){assert.ok(t.launch>0&&t.boost===100);report.lateLaunch=t;}
  report.frames.push({elapsed:t.elapsed,s,air:t.air,y:t.flightY,vy:t.verticalSpeed,pitch:t.pitch,speed:t.speed,launch:t.launch,boost:t.boost,ramp:t.ramp,collisions:t.collisions});
  if(t.elapsed>15.3&&landed){assert.equal(t.launch,0);assert.equal(t.boost,100,'launch leaves manual boost intact');report.afterLaunch=t;break;}
  let offset=passedPier?0:10;const target=await page.evaluate(({s,offset,speed,pos})=>{const p=window.testCourse.at(s+Math.max(16,speed*.4),offset).p;return Math.atan2(p.x-pos[0],p.z-pos[1]);},{s,offset,speed:t.speed,pos:t.pos});const d=Math.atan2(Math.sin(target-t.heading),Math.cos(target-t.heading));await key('ArrowLeft',d>.018);await key('ArrowRight',d<-.018);previous=t;await wait(40);
 }
 assert.ok(report.shieldClearance,'bubble crossed the pillar while body passed beside it');assert.ok(tookOff&&landed&&samples>5);assert.ok(peak<10,'controlled launch height');assert.ok(report.lateLaunch&&report.afterLaunch);assert.equal(report.errors.length,0);report.arcSamples=samples;report.peakAir=peak;report.passed=true;console.log('FLIGHT/SHIELD PASS: no shield on grid, manual shield clips through pillar, smooth airborne arc and landing, fifteen-second free launch.');
}catch(e){report.failure=e.stack;process.exitCode=1;console.error(e);}finally{fs.writeFileSync(`${out}/flight-shield-check.json`,JSON.stringify(report,null,2));await browser.close();}
