// Capture actual showroom controls and moving race frames; no game-state mutation.
import puppeteer from '../../404-game-recipe/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import fs from 'node:fs';import assert from 'node:assert/strict';
const out=process.env.EVIDENCE_DIR||'evidence/material-fix/after';fs.mkdirSync(out,{recursive:true});
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--no-proxy-server']});
const page=await browser.newPage(),errors=[],report={errors,craft:[],frames:[]};page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(e.type()==='error')errors.push(e.text());});const wait=ms=>new Promise(r=>setTimeout(r,ms));
try{
 await page.setViewport({width:1440,height:900});await page.goto('http://localhost:4173/');await page.waitForFunction('window.__READY__',{timeout:60000});await page.click('#enterdock');
 // Stop the automatic orbit with the public drag control, then move in for hull inspection.
 const zone=await page.$eval('#orbit-zone',e=>{const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};});await page.mouse.move(zone.x,zone.y);await page.mouse.down();await page.mouse.move(zone.x+1,zone.y);await page.mouse.up();await page.mouse.wheel({deltaY:-350});await wait(700);
 for(let i=0;i<6;i++){await page.click(`[data-boat="${i}"]`);await wait(650);await page.screenshot({path:`${out}/craft-${i}.png`});report.craft.push(await page.evaluate(()=>({name:window.__GAME__.craft,orbit:window.__GAME__.orbit,cameraDistance:window.__GAME__.cameraDistance})));}
 await page.click('[data-boat="0"]');await page.mouse.move(zone.x,zone.y);await page.mouse.down();await page.mouse.move(zone.x+200,zone.y,{steps:20});await page.mouse.up();await wait(650);await page.screenshot({path:`${out}/craft-0-side.png`});
 await page.click('#arenasb');await page.click('[data-mode="time"]');await page.click('#startb');await page.waitForFunction('window.__GAME__.state==="race"',{timeout:30000});
 for(const seconds of [1,2,3]){await wait(1000);await page.screenshot({path:`${out}/race-${seconds}.png`});report.frames.push(await page.evaluate(()=>window.__GAME__));}
 if(!process.argv.includes('--desktop-only')){await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});await page.reload();await page.waitForFunction('window.__READY__',{timeout:60000});await page.tap('#quickraceb');await page.waitForFunction('window.__GAME__.state==="race"');await wait(1800);await page.screenshot({path:`${out}/phone-race.png`});report.phone=await page.evaluate(()=>window.__GAME__);}
 assert.equal(errors.length,0,'no shader or browser errors');report.passed=true;console.log('MATERIAL PREVIEW PASS: six craft, orbit inspection, moving race frames.');
}catch(e){report.failure=e.stack;process.exitCode=1;console.error(e);}finally{fs.writeFileSync(`${out}/preview.json`,JSON.stringify(report,null,2));await browser.close();}
