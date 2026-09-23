import puppeteer from '../../404-game-recipe/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import fs from 'node:fs';import assert from 'node:assert/strict';
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--no-proxy-server']});
const page=await browser.newPage();await page.setViewport({width:1440,height:900,deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const report={sectors:[],peaks:{draws:0,tris:0},errors,passed:false},held=new Set();
async function key(k,on){if(on&&!held.has(k)){await page.keyboard.down(k);held.add(k);}else if(!on&&held.has(k)){await page.keyboard.up(k);held.delete(k);}}
try{
 await page.goto('http://localhost:4173/');await page.waitForFunction('window.__READY__',{timeout:60000});
 await page.evaluate(async()=>{const {CHAPTERS}=await import('./campaign.js');const {makeCourse}=await import('./course.js');window.testCourse=makeCourse(CHAPTERS[0]);});
 assert.deepEqual(await page.evaluate(()=>window.__GAME__.roster),[true,false,false,false,false,false]);
 await page.click('[data-boat="5"]');assert.equal(await page.$eval('#startb',e=>e.disabled),true);await page.click('[data-boat="0"]');await page.click('#startb');
 const deadline=Date.now()+420000;let seen=new Set(),result,lastFire=-20,lastSpecial=-20;
 while(Date.now()<deadline){
  const t=await page.evaluate(()=>{const t=window.__GAME__,c=window.testCourse;let offset=0;const s=t.progress*c.length,pick=t.nextPickup;if(pick&&pick.s-s<180&&pick.s>s)offset=pick.offset;for(const o of t.obstacleAhead||[])if(o.s-s<130&&Math.abs(offset-o.offset)<o.radius+4)offset=o.offset+(offset>=o.offset?1:-1)*(o.radius+6);const p=c.at(s+Math.max(20,t.speed*.58),offset).p;return{...t,target:Math.atan2(p.x-t.pos[0],p.z-t.pos[1])};});
  report.lensMax=Math.max(report.lensMax||0,t.lensDrops);report.peaks.draws=Math.max(report.peaks.draws,t.draws);report.peaks.tris=Math.max(report.peaks.tris,t.tris);
  if(t.state==='results'){result=t;break;}
  if(t.state==='race'){
   const d=Math.atan2(Math.sin(t.target-t.heading),Math.cos(t.target-t.heading));await key('ArrowLeft',d>.025);await key('ArrowRight',d<-.025);await key('Space',Math.abs(d)<.28&&t.boost>4);await key('ArrowDown',Math.abs(d)>.65&&t.speed>29);
   const target=t.rivals.find(r=>r.id===t.weapons.target);if(t.weapons.ammo>0&&target&&target.shield<=0&&target.invulnerable<=0&&t.elapsed-lastFire>6.5){await page.keyboard.press('KeyF');lastFire=t.elapsed;}if(t.weapons.special&&t.elapsed-lastSpecial>7){await page.keyboard.press('KeyQ');lastSpecial=t.elapsed;}if((t.weapons.incoming||t.lethalAhead?.distance<85)&&t.weapons.defenses>0&&t.weapons.shield<=0&&t.weapons.invulnerable<=0)await page.keyboard.press('KeyE');
   if(!report.actionFrame&&t.weapons.shots>0&&t.weapons.projectiles>0&&t.elapsed>10){await page.screenshot({path:'evidence/combat-action.png'});report.actionFrame=true;}
   if(!seen.has(t.sector)&&t.progress>(t.sector+.24)/6){seen.add(t.sector);await page.screenshot({path:`evidence/combat-endurance-sector-${t.sector}.png`});report.sectors.push({sector:t.sector,elapsed:t.elapsed,place:t.place,draws:t.draws,tris:t.tris,pickups:t.pickups});console.log('sector',JSON.stringify(report.sectors.at(-1)));}
  }
  await new Promise(r=>setTimeout(r,65));
 }
 for(const k of [...held])await key(k,false);
 report.result=result;assert.ok(result,'real-input driver finishes');assert.equal(seen.size,6);assert.ok(result.elapsed>140,'long turbo route');assert.equal(result.weapons.eliminated,false,'survives fair combat');assert.ok(result.weapons.shots>0,'real input fires missiles');assert.equal(await page.$$eval('#standings li',els=>els.length),6);report.combat={shots:result.weapons.shots,hits:result.weapons.damageDealt,rivalShots:result.rivals.reduce((n,r)=>n+r.shots,0)};assert.equal(result.unlocked[1],true);assert.equal(result.roster[1],true);assert.ok(result.rivals.some(r=>r.claimed>0),'rivals collect shared perks');assert.ok(report.peaks.draws<=900,'draw budget');assert.ok(report.peaks.tris<=1500000,'triangle budget');assert.ok(report.lensMax>0,'water reaches the lens');assert.ok(result.pickups>0,'player can contest supplies');assert.equal(errors.length,0);
 report.result=result;await page.waitForFunction(()=>document.getElementById('standings-note').textContent.startsWith('FINAL'),{timeout:45000});report.finalStandings=await page.$$eval('#standings li',rows=>rows.map(r=>r.innerText));assert.equal(report.finalStandings.length,6);await page.screenshot({path:'evidence/combat-endurance-result.png'});await page.click('#dockb');await page.reload();await page.waitForFunction('window.__READY__');assert.equal(await page.evaluate(()=>window.__GAME__.roster[1]),true);report.saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('tidebreak.endurance.v2')));report.passed=true;console.log('ENDURANCE PASS',JSON.stringify({elapsed:result.elapsed,place:result.place,pickups:result.pickups,peaks:report.peaks,saved:report.saved}));
}catch(e){report.failure=e.stack;process.exitCode=1;console.error(e);}finally{fs.writeFileSync('evidence/combat-endurance-check.json',JSON.stringify(report,null,2));await browser.close();}
