import puppeteer from '../../404-game-recipe/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('../../',import.meta.url)));
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--no-proxy-server']});
const page=await browser.newPage();await page.setViewport({width:1280,height:800,deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:4173/');await page.waitForFunction('window.__READY__');
await page.evaluate(async()=>{const {CHAPTERS}=await import('./campaign.js');const {makeCourse}=await import('./course.js');window.testCourses=CHAPTERS.map(makeCourse);});
let passed=false,failure=null;const reports=[];const held=new Set();async function key(k,on){if(on&&!held.has(k)){await page.keyboard.down(k);held.add(k);}if(!on&&held.has(k)){await page.keyboard.up(k);held.delete(k);}}
try{
for(let chapter=0;chapter<6;chapter++){
 await page.click('#startb');let captured=false;const peak={draws:0,tris:0};const timeout=Date.now()+160000;
 while(Date.now()<timeout){
  const t=await page.evaluate(()=>{const t=window.__GAME__,c=window.testCourses[t.chapter];let offset=0;const s=t.progress*c.length;if(t.chapter===1){const i=Math.ceil((s/c.length-.04)/.057);if(i>=0&&i<16&&(.04+i*.057)*c.length-s<55)offset=Math.sin(i*1.7)*8;}
   const p=c.at(s+Math.max(13,t.speed*.5),offset).p;return {...t,target:Math.atan2(p.x-t.pos[0],p.z-t.pos[1])};});
  peak.draws=Math.max(peak.draws,t.draws);peak.tris=Math.max(peak.tris,t.tris);
  if(t.state==='results'){t.peak=peak;reports.push(t);console.log(JSON.stringify(t));await page.screenshot({path:`tidebreak/evidence/chapter-${chapter+1}-result.png`});break;}
  if(t.state==='race'){
   const d=Math.atan2(Math.sin(t.target-t.heading),Math.cos(t.target-t.heading));
   await key('ArrowLeft',d>.035);await key('ArrowRight',d<-.035);
   await key('Space',t.elapsed%6<3&&Math.abs(d)<.35);
   if(!captured&&t.progress>.38){await page.screenshot({path:`tidebreak/evidence/chapter-${chapter+1}-race.png`});captured=true;}
  }
  await new Promise(r=>setTimeout(r,70));
 }
 for(const k of [...held])await key(k,false);
 if(reports.length!==chapter+1)throw Error(`Chapter ${chapter+1} did not finish`);
 if(peak.draws>900||peak.tris>1500000)throw Error(`Chapter ${chapter+1} exceeds render budget`);
 if(chapter<5&&!reports.at(-1).unlocked[chapter+1])throw Error(`Chapter ${chapter+1} objective not achieved`);
 await page.click('#dockb');
}
await page.reload();await page.waitForFunction('window.__READY__');const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('tidebreak.campaign.v1')));if(!saved.champion||!saved.cleared.every(Boolean))throw Error('Campaign save did not persist');if(errors.length)throw Error('Browser errors recorded');passed=true;console.log('CAMPAIGN PASS',saved);
}catch(e){failure=e.message;console.error(e);process.exitCode=1;}finally{fs.writeFileSync('tidebreak/evidence/campaign-check.json',JSON.stringify({reports,errors,completed:passed,failure},null,2));await browser.close();}
