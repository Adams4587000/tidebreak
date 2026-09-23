import puppeteer from '../../404-game-recipe/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import fs from 'node:fs';import assert from 'node:assert/strict';
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--no-proxy-server']});
const page=await browser.newPage(),errors=[],report={viewports:[],errors};page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try{
 for(const vp of [{width:1440,height:900,deviceScaleFactor:1},{width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true},{width:390,height:667,deviceScaleFactor:1,isMobile:true,hasTouch:true},{width:844,height:390,deviceScaleFactor:1,isMobile:true,hasTouch:true}]){
  await page.setViewport(vp);await page.goto('http://localhost:4173/');await page.waitForFunction('window.__READY__',{timeout:60000});await wait(1200);
  const name=vp.width+'x'+vp.height,tap=async sel=>{await page.$eval(sel,e=>e.scrollIntoView({block:'center'}));await wait(150);if(vp.hasTouch)await page.tap(sel);else await page.click(sel);};
  assert.equal(await page.evaluate(()=>window.__GAME__.state),'title');assert.equal(await page.$eval('#menu',e=>e.hidden),true);await page.screenshot({path:`evidence/territory-title-${name}.png`});
  await tap('#enterdock');await wait(1600);assert.equal(await page.evaluate(()=>window.__GAME__.menuStep),'dock');
  await tap('[data-boat="5"]');assert.equal(await page.$eval('#arenasb',e=>e.disabled),true);await tap('[data-boat="0"]');assert.equal(await page.$eval('#arenasb',e=>e.disabled),false);
  const bounds=await page.evaluate(()=>{const rect=id=>{const r=document.querySelector(id).getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};};return{crew:rect('.crew-detail'),footer:rect('.dock-footer'),orbit:rect('#orbit-zone'),button:rect('#arenasb')};});
  assert.ok(bounds.crew.y+bounds.crew.h<=bounds.footer.y+2,'crew detail does not overlap roster');assert.ok(bounds.button.y+bounds.button.h<=vp.height,'continue visible');assert.ok(bounds.orbit.h>60,'real 3D inspection area');
  if(!vp.hasTouch){const yaw=await page.evaluate(()=>window.__GAME__.orbit.yaw),r=bounds.orbit;await page.mouse.move(r.x+r.w*.4,r.y+r.h*.5);await page.mouse.down();await page.mouse.move(r.x+r.w*.7,r.y+r.h*.5,{steps:12});await page.mouse.up();await wait(500);assert.ok(Math.abs((await page.evaluate(()=>window.__GAME__.orbit.yaw))-yaw)>1);}
  await page.screenshot({path:`evidence/territory-dock-${name}.png`});await tap('#arenasb');await wait(600);
  assert.equal(await page.$$eval('.arena-card.locked',e=>e.length),5);assert.equal(await page.$$eval('.arena-card.locked .lock-icon',e=>e.length),5);
  await tap('[data-course="3"]');assert.equal(await page.$eval('#startb',e=>e.disabled),true);assert.match(await page.$eval('#course-objective',e=>e.textContent),/LOCKED/);assert.equal(await page.evaluate(()=>window.__GAME__.arena),'meridian');
  await tap('[data-course="0"]');assert.equal(await page.$eval('#startb',e=>e.disabled),false);await page.screenshot({path:`evidence/territory-arenas-${name}.png`});
  await tap('#backdockb');assert.equal(await page.$eval('#dock-page',e=>e.hidden),false);await tap('#arenasb');await tap('#startb');await page.waitForFunction('window.__GAME__.state==="countdown"');assert.match(await page.$eval('#countdown',e=>e.textContent),/[123]/);await page.waitForFunction('window.__GAME__.state==="race"');await wait(2200);const t=await page.evaluate(()=>window.__GAME__);assert.equal(t.arena,'meridian');assert.equal(t.sector,0);assert.ok(t.speed>40);await page.screenshot({path:`evidence/territory-race-${name}.png`});report.viewports.push({name,bounds,draws:t.draws,tris:t.tris,speed:t.speed});
 }
 assert.equal(errors.length,0);report.passed=true;console.log('FLOW PASS',JSON.stringify(report));
}catch(e){report.failure=e.stack;process.exitCode=1;console.error(e);}finally{fs.writeFileSync('evidence/territory-flow-check.json',JSON.stringify(report,null,2));await browser.close();}
