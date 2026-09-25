// Real keyboard/touch regression: no game-state writes or private start hooks.
import puppeteer from '../../404-game-recipe/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const out=process.env.EVIDENCE_DIR||'evidence/handling-fix';fs.mkdirSync(out,{recursive:true});
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--no-proxy-server']});
const report={errors:[],checks:[],ramps:[]},held=new Set();let page;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function key(k,on){if(on&&!held.has(k)){await page.keyboard.down(k);held.add(k);}else if(!on&&held.has(k)){await page.keyboard.up(k);held.delete(k);}}
async function release(){for(const k of [...held])await key(k,false);}
async function telemetry(){return page.evaluate(()=>window.__GAME__);}
async function start(mobile=false){page=await browser.newPage();await page.setViewport(mobile?{width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true}:{width:1100,height:720});page.on('pageerror',e=>report.errors.push(e.message));await page.goto('http://localhost:4173/');await page.waitForFunction('window.__READY__',{timeout:60000});
 await page.evaluate(async()=>{const {CHAPTERS}=await import('./campaign.js'),{makeCourse}=await import('./course.js');window.testCourse=makeCourse(CHAPTERS[0]);});
 const click=async s=>mobile?page.tap(s):page.click(s);await click('#enterdock');await click('#arenasb');await click('[data-mode="time"]');await page.$eval('#startb',e=>e.scrollIntoView({block:'center'}));await wait(150);await click('#startb');await page.waitForFunction('window.__GAME__.state==="race"',{timeout:20000});
}
async function steer(t,offset){const s=t.progress*t.courseLength;const target=await page.evaluate(({s,offset,speed,pos})=>{const p=window.testCourse.at(s+Math.max(14,Math.abs(speed)*.35),offset).p;return Math.atan2(p.x-pos[0],p.z-pos[1]);},{s,offset,speed:t.speed,pos:t.pos});const d=Math.atan2(Math.sin(target-t.heading),Math.cos(target-t.heading));await key('ArrowLeft',d>.018);await key('ArrowRight',d<-.018);await key('ArrowDown',Math.abs(d)>.7&&t.speed>28);}
try{
 await start();let t,impact;const started=Date.now();
 while(Date.now()-started<90000){t=await telemetry();if(t.barrierContact&&t.collisions){impact=t;break;}await steer(t,14);await wait(55);}
 assert.ok(impact,'drive into a solid pillar');await release();await wait(2600);t=await telemetry();assert.equal(t.collisions,impact.collisions,'holding throttle against the pillar does not repeat the impact cue');assert.ok(Math.hypot(t.pos[0]-impact.pos[0],t.pos[1]-impact.pos[1])<5,'pillar remains solid');report.checks.push({name:'sustained pillar contact',before:impact,after:t});
 await key('ArrowDown',true);await key('Space',true);await page.waitForFunction('window.__GAME__.speed < -10',{timeout:15000});const backing=await telemetry();await wait(1600);const reversed=await telemetry();assert.ok(reversed.progress<backing.progress,'reverse makes real backward progress');assert.ok(Math.hypot(reversed.pos[0]-backing.pos[0],reversed.pos[1]-backing.pos[1])>10);assert.equal(reversed.barrierContact,false,'reverse releases the hull from the pillar');assert.equal(reversed.boosts,backing.boosts,'boost does not engage in reverse');assert.equal(await page.$eval('#speed-unit',e=>e.textContent),'REV · KM/H');await page.screenshot({path:`${out}/keyboard-reverse.png`});
 await key('ArrowLeft',true);await wait(450);const turned=await telemetry();assert.ok(turned.heading<reversed.heading-.03,'steering yaw reverses with thrust');report.checks.push({name:'keyboard reverse, steering and boost interlock',backing,reversed,turned});await release();
 const rampTargets=[.32,.71].map(n=>n*t.courseLength/6);let index=0,current=null,backedDown=false;
 while(Date.now()-started<180000&&index<2){t=await telemetry();const s=t.progress*t.courseLength,target=rampTargets[index],offset=index===0?7:-7;await steer(t,offset);
  if(index===1&&s>target-80&&s<target+15)await key('ArrowDown',t.speed>8);
  if(index===1&&!backedDown&&t.ramp!=null&&s>target-3&&s<target+3){
   await release();const before=await telemetry();await key('ArrowDown',true);await page.waitForFunction('window.__GAME__.speed < -9',{timeout:15000});await wait(1300);const after=await telemetry();assert.ok(after.progress<before.progress);assert.equal(after.collisions,before.collisions);assert.equal(after.jumps,before.jumps,'reversing downhill does not launch a jump');report.checks.push({name:'slow ramp edge entry and reverse downhill',before,after});await release();backedDown=true;
  }
  if(Math.abs(s-target)<12&&t.ramp!==null&&t.ramp!==undefined){if(!current){current={side:index===0?'right':'left',target,frames:[],collisions:t.collisions};}current.frames.push({s,lateral:t.lateral,speed:t.speed,air:t.air,flightY:t.flightY,renderY:t.renderY,ramp:t.ramp,contact:t.barrierContact});}
  if(s>target+30){report.ramps.push(current);assert.ok(current&&current.frames.length>1,'edge receives deck support');assert.ok(current.frames.some(f=>Math.abs(f.lateral)>5.5&&f.air>1),'partly overlapping hull rides the edge');assert.ok(current.frames.every(f=>f.speed>2&&!f.contact),'ramp edge does not stop or collide with the hull');assert.equal(t.collisions,current.collisions,'no repeated ramp impact cues');console.log('ramp edge PASS',current.side,current.frames.length);current=null;index++;}
  await wait(55);
 }
 assert.equal(report.ramps.length,2);assert.ok(backedDown,'reverse downhill from a slow edge approach');assert.ok((await telemetry()).speed>20,'release resumes forward acceleration');await release();await page.close();
 await start(true);await page.waitForFunction('window.__GAME__.elapsed>3',{timeout:20000});const cdp=await page.createCDPSession(),brake=await page.$eval('#brakeb',e=>{const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,id:0};});await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[brake]});await page.waitForFunction('window.__GAME__.speed < -10',{timeout:15000});const touchBefore=await telemetry();await wait(1400);const touchAfter=await telemetry();assert.ok(touchAfter.progress<touchBefore.progress);await page.screenshot({path:`${out}/touch-reverse.png`});await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await page.waitForFunction('window.__GAME__.speed>20',{timeout:15000});report.checks.push({name:'touch hold reverses, canceled touch releases throttle',before:touchBefore,after:touchAfter,released:await telemetry()});
 assert.equal(report.errors.length,0);report.passed=true;console.log('HANDLING PASS: pillar holds, quiet sustained contact, keyboard/touch reverse, reverse steering, boost interlock, both ramp edges.');
}catch(e){report.failure=e.stack;process.exitCode=1;console.error(e);}finally{fs.writeFileSync(`${out}/handling-check.json`,JSON.stringify(report,null,2));await browser.close();}
