import puppeteer from '../../404-game-recipe/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('../',import.meta.url)));
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--no-proxy-server']});
try{const page=await browser.newPage();await page.setViewport({width:1440,height:900});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:4173/');await page.waitForFunction('window.__READY__');const report=[];
for(const [i,name] of ['KESTREL','ALBATROSS','MANTA'].entries()){
 await page.click(`[data-boat="${i}"]`);await new Promise(r=>setTimeout(r,2600));const idle=await page.evaluate(()=>window.__GAME__);assert.equal(idle.craft,name);assert.ok(Math.abs(idle.foilAngle)>.8,'idle foils are folded');await page.screenshot({path:`evidence/spacecraft-${name.toLowerCase()}-menu.png`});
 await page.click('#startb');await new Promise(r=>setTimeout(r,5800));const race=await page.evaluate(()=>window.__GAME__);assert.ok(Math.abs(race.foilAngle)<.2,'racing foils deploy');assert.ok(race.speed>20,'craft moves');
 await page.keyboard.down('Space');await new Promise(r=>setTimeout(r,850));const boost=await page.evaluate(()=>window.__GAME__);await page.keyboard.up('Space');assert.ok(boost.engineIntensity>race.engineIntensity+1.5,'boost brightens engine');assert.ok(boost.exhaustScale>race.exhaustScale+.8,'boost lengthens exhaust');await page.screenshot({path:`evidence/spacecraft-${name.toLowerCase()}-boost.png`});report.push({name,idle,race,boost});await page.click('#pauseb');await page.click('#exitb');
}
assert.equal(errors.length,0);fs.writeFileSync('evidence/spacecraft-check.json',JSON.stringify({passed:true,report,errors},null,2));console.log('SPACECRAFT PASS: all three selections, foil articulation and boost-reactive engines.');}finally{await browser.close();}
