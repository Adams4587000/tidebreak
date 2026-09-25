// Fresh-save run driven only by keyboard. Telemetry is read, never mutated.
import puppeteer from '../../404-game-recipe/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import fs from 'node:fs';import assert from 'node:assert/strict';
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});const page=await browser.newPage();await page.setViewport({width:1100,height:720});
const report={errors:[],checks:[],frames:[]},held=new Set();page.on('pageerror',e=>report.errors.push(e.message));page.on('console',e=>{if(e.type()==='error')report.errors.push(e.text());});
async function key(k,on){if(on&&!held.has(k)){await page.keyboard.down(k);held.add(k);}if(!on&&held.has(k)){await page.keyboard.up(k);held.delete(k);}}
try{await page.goto('http://localhost:4173/');await page.waitForFunction('window.__READY__',{timeout:60000});await page.evaluate(async()=>{const {CHAPTERS}=await import('./campaign.js'),{makeCourse}=await import('./course.js');window.driveCourse=makeCourse(CHAPTERS[0]);});await page.click('#enterdock');await page.click('#arenasb');await page.click('[data-mode="time"]');await page.click('#startb');await page.waitForFunction('window.__GAME__.state==="race"',{timeout:60000});
 let stage='pier',impact=null,jumped=false,landed=false,pickup=false,maxAir=0,lastLog=0;const start=Date.now();
 while(Date.now()-start<600000){const t=await page.evaluate(()=>window.__GAME__),s=t.progress*t.courseLength;
  if(t.state==='results'){report.result=t;break;}
  let offset=stage==='pier'?14:0;
  if(stage==='pier'&&t.collisions>0){impact={s,lateral:t.lateral,speed:t.speed};report.checks.push({name:'solid pier contact',...impact});const pier=t.obstacleAhead.find(o=>o.kind==='PIER'&&o.offset>0);assert.ok(pier&&pier.s-s<14,'stopped on the approach side of a pier');await page.screenshot({path:'evidence/refit/pier-contact.png'});stage='ramp';}
  if(stage==='ramp'&&t.air>1){maxAir=Math.max(maxAir,t.air);if(t.air>4&&!jumped){jumped=true;report.checks.push({name:'ramp takeoff',air:t.air,s});await page.screenshot({path:'evidence/refit/ramp-takeoff.png'});}}
  if(jumped&&t.jumps>0&&!landed){landed=true;stage='race';report.checks.push({name:'ramp landing',jumps:t.jumps,maxAir});}
  if(process.argv.includes('--contact-only')&&landed&&s>650){report.result=t;break;}
  if(stage==='race'){const p=t.nextPickup;if(p&&p.s-s<150)offset=p.offset;for(const o of t.obstacleAhead||[])if(o.s-s<100&&!o.kind.startsWith('RAMP')&&Math.abs(offset-o.offset)<o.radius+4)offset=o.offset+(offset>=o.offset?1:-1)*(o.radius+6);for(const r of t.rampsAhead||[])if(r.s-s<95)offset=0;}
  if(t.pickups>0&&!pickup){pickup=true;report.checks.push({name:'pickup collected',count:t.pickups});await page.screenshot({path:'evidence/refit/pickup.png'});}
  const target=await page.evaluate(({s,offset,speed,pos})=>{const p=window.driveCourse.at(s+Math.max(18,speed*.4),offset).p;return Math.atan2(p.x-pos[0],p.z-pos[1]);},{s,offset,speed:t.speed,pos:t.pos});const d=Math.atan2(Math.sin(target-t.heading),Math.cos(target-t.heading));await key('ArrowLeft',d>.018);await key('ArrowRight',d<-.018);await key('Space',stage!=='pier'&&Math.abs(d)<.25&&t.boost>2);await key('ArrowDown',Math.abs(d)>.7&&t.speed>28);
  if(t.elapsed-lastLog>15){lastLog=t.elapsed;console.log(stage,s.toFixed(1),'elapsed',t.elapsed.toFixed(1),'air',t.air.toFixed(1),'collisions',t.collisions);}
  await new Promise(r=>setTimeout(r,55));
 }
 assert.ok(impact,'hit the pier');assert.ok(jumped&&landed,'ride and land the ramp');assert.ok(pickup,'collect a supply');assert.ok(report.result,'complete race');assert.equal(report.result.weapons.eliminated,false);assert.equal(report.errors.length,0);report.passed=true;
}catch(e){report.failure=e.stack;process.exitCode=1;console.error(e);}finally{fs.writeFileSync(process.argv.includes('--contact-only')?'evidence/refit/contact-final.json':'evidence/refit/drive.json',JSON.stringify(report,null,2));await browser.close();}
