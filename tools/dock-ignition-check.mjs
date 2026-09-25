import puppeteer from '../../404-game-recipe/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import assert from 'node:assert/strict';import fs from 'node:fs';
const out=process.env.EVIDENCE_DIR||'evidence/performance/controls';fs.mkdirSync(out,{recursive:true});
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']}),report={views:[],errors:[]};
try{for(const [width,height,mobile] of [[1440,900,false],[390,844,true],[390,667,true],[844,390,true]]){
 const page=await browser.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('console',e=>{if(e.type()==='error')report.errors.push(e.text());});page.on('response',r=>{if(r.status()>=400)report.errors.push(`${r.status()} ${r.url()}`);});await page.setViewport({width,height,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?3:1});
 await page.goto(process.env.GAME_URL||'http://localhost:4173/');await page.waitForFunction('window.__READY__',{timeout:60000});
 const click=async selector=>mobile?page.tap(selector):page.click(selector);
 await click('#startup-audio');await click('#enterdock');await page.waitForFunction('window.__GAME__?.state==="menu"');
 const before=await page.evaluate(()=>window.__GAME__);assert.equal(before.audio.startupPlayed,true);assert.equal(before.audio.state,'running');
 const fleets=[];for(const i of width===1440?[0,1,2,3,4,5]:[0]){
  await click(`[data-boat="${i}"]`);await new Promise(r=>setTimeout(r,150));
  const r=await page.$eval('#revb',el=>{const r=el.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height,visible:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===el||el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))};});
  assert.ok(r.visible&&r.h>=44&&r.y>0&&r.y<height,'rev control is reachable');
  if(mobile)await page.touchscreen.touchStart(r.x,r.y);else{await page.mouse.move(r.x,r.y);await page.mouse.down();}
  await page.waitForFunction('window.__GAME__.rev>.9');const rev=await page.evaluate(()=>window.__GAME__);assert.equal(rev.speed,0);assert.ok(rev.exhaustScale>2);assert.ok(rev.audio.engineGain>.02);assert.equal(rev.audio.lastCue,'CRAFT');
  await page.screenshot({path:`${out}/rev-${width}x${height}-${i}.png`});fleets.push({craft:rev.craft,rev:rev.rev,exhaust:rev.exhaustScale,gain:rev.audio.engineGain});
  if(mobile)await page.touchscreen.touchEnd();else await page.mouse.up();await page.waitForFunction('window.__GAME__.rev<.08',{timeout:5000});
 }
 await click('[data-boat="0"]');if(!mobile){await page.focus('#revb');await page.keyboard.down('Space');await page.waitForFunction('window.__GAME__.rev>.9');await page.keyboard.up('Space');await page.waitForFunction('window.__GAME__.rev<.08');}await click('#soundb');await page.waitForFunction('window.__GAME__.audio.enabled===false&&window.__GAME__.audio.masterGain<.001');await click('#soundb');await page.waitForFunction('window.__GAME__.audio.enabled===true');
 await click('#arenasb');await click('#startb');await page.waitForFunction('window.__GAME__.state==="race"',{timeout:60000});await page.waitForFunction('window.__GAME__.speed>25');
 let g=await page.evaluate(()=>window.__GAME__);assert.equal(g.audio.lastCue,'LAUNCH');assert.ok(g.audio.selectionCount>=5);assert.equal(g.previewUnlocks,false);
 await click('#pauseb');await click('#restartb');await page.waitForFunction('window.__GAME__.state==="countdown"',{timeout:60000});g=await page.evaluate(()=>window.__GAME__);assert.equal(g.speed,0);assert.equal(g.air,0);assert.equal(g.weapons.shield,0);
 await page.waitForFunction('window.__GAME__.state==="race"');await click('#pauseb');await click('#exitb');await page.waitForFunction('window.__GAME__.state==="menu"');g=await page.evaluate(()=>window.__GAME__);assert.equal(g.speed,0);
 report.views.push({width,height,mobile,fleets,passed:true});await page.close();
}assert.deepEqual(report.errors,[]);report.passed=true;}catch(e){report.failure=e.stack;process.exitCode=1;}finally{fs.writeFileSync(`${out}/dock-ignition.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));await browser.close();}
