// Real keyboard input through the normal menus; course and telemetry reads only.
import puppeteer from '../../404-game-recipe/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import fs from 'node:fs';import assert from 'node:assert/strict';
const out=process.env.EVIDENCE_DIR||'evidence/nitro';fs.mkdirSync(out,{recursive:true});
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--no-proxy-server']});
const report={errors:[],frames:[]},held=new Set();let page;
async function key(k,on){if(on&&!held.has(k)){held.add(k);await page.keyboard.down(k);}else if(!on&&held.has(k)){held.delete(k);await page.keyboard.up(k);}}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try{
 page=await browser.newPage();await page.setViewport({width:1100,height:720});page.on('pageerror',e=>report.errors.push(e.message));await page.goto('http://localhost:4173/');await page.waitForFunction('window.__READY__',{timeout:60000});
 await page.evaluate(async()=>{const {CHAPTERS}=await import('./campaign.js'),{makeCourse}=await import('./course.js');window.testCourse=makeCourse(CHAPTERS[0]);});
 await page.click('#enterdock');await page.click('#arenasb');await page.click('[data-mode="time"]');await page.click('#startb');await page.waitForFunction('window.__GAME__.state==="race"');
 const targetSupply=180+3*460,started=Date.now();let collected=null,before=null,peak=0;
 while(Date.now()-started<120000){
  const t=await page.evaluate(()=>window.__GAME__),s=t.progress*t.courseLength;
  report.frames.push({elapsed:t.elapsed,s,speed:t.speed,nitro:t.nitro,boost:t.boost,boosting:t.boosting,launch:t.launch});
  if(!collected&&t.nitro===0&&s<targetSupply)before=t;
  if(!collected&&t.nitro>0){collected=t;report.collected=t;report.before=before;assert.equal(t.launch,0,'collect after the free starting boost');assert.ok(Math.abs(s-targetSupply)<15);assert.equal(await page.$eval('#pickup-name',e=>e.textContent),'NITRO BOOST');await page.screenshot({path:`${out}/nitro-collected.png`});}
  if(collected&&t.nitro>0&&t.elapsed-collected.elapsed>.3){assert.equal(t.boost,100,'automatic nitro preserves reserve');assert.equal(t.boosting,true);assert.match(await page.$eval('#boost-status',e=>e.textContent),/NITRO .*RESERVE SAVED/);peak=Math.max(peak,t.speed);}
  if(collected&&t.nitro===0){report.expired=t;assert.ok(t.elapsed-collected.elapsed>=4.7&&t.elapsed-collected.elapsed<5.3);assert.equal(t.boosting,false);assert.ok(peak>before.speed*1.25,'noticeable acceleration with no boost key');break;}
  const offset=s>targetSupply-260&&s<targetSupply+20?-6:0;
  const target=await page.evaluate(({s,offset,speed,pos})=>{const p=window.testCourse.at(s+Math.max(16,speed*.35),offset).p;return Math.atan2(p.x-pos[0],p.z-pos[1]);},{s,offset,speed:t.speed,pos:t.pos});
  const d=Math.atan2(Math.sin(target-t.heading),Math.cos(target-t.heading));await key('ArrowLeft',d>.018);await key('ArrowRight',d<-.018);await wait(45);
 }
 assert.ok(report.expired,'nitro collected and expired during normal driving');
 for(const k of [...held])await key(k,false);
 await page.click('#pauseb');await page.click('#exitb');await page.click('#arenasb');await page.click('#startb');await page.waitForFunction('window.__GAME__.state==="countdown"');const restart=await page.evaluate(()=>window.__GAME__);assert.equal(restart.nitro,0);assert.equal(restart.launch,15);assert.ok(restart.rivals.every(r=>r.nitro===0));
 assert.equal(report.errors.length,0);report.peak=peak;report.passed=true;console.log('NITRO PASS: real pickup, automatic acceleration, HUD countdown, reserve preserved, five-second expiry and clean restart.');
}catch(e){report.failure=e.stack;process.exitCode=1;console.error(e);}finally{fs.writeFileSync(`${out}/nitro-check.json`,JSON.stringify(report,null,2));await browser.close();}
