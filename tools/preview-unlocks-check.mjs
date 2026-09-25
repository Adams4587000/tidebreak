// User-requested preview mode: actual menu selections and race input, no state edits.
import puppeteer from '../../404-game-recipe/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import fs from 'node:fs';import assert from 'node:assert/strict';
const out='evidence/preview-unlocks';fs.mkdirSync(out,{recursive:true});const report={errors:[],runs:[],selectionChecks:0};
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--no-proxy-server']});
try{const page=await browser.newPage();await page.setViewport({width:1440,height:900});page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 await page.goto('http://localhost:4173/');await page.waitForFunction('window.__READY__',{timeout:60000});const career=await page.evaluate(()=>localStorage.getItem('tidebreak.territories.v3'));await page.click('#enterdock');
 const names=['KESTREL','ALBATROSS','MANTA','BRIMSTONE','SPECTRE','IRONCLAD'],arenas=['meridian','blackwater','splitstone','ember','sluice','atlantic'];
 for(let i=0;i<6;i++){
  await page.click(`[data-boat="${i}"]`);assert.equal(await page.$eval('#arenasb',e=>e.disabled),false);await page.click('#arenasb');
  for(let j=0;j<6;j++){await page.click(`[data-course="${j}"]`);assert.equal(await page.$eval('#startb',e=>e.disabled),false);report.selectionChecks++;}
  await page.click(`[data-course="${i}"]`);if(i===0)await page.screenshot({path:`${out}/all-territories.png`});await page.click('#startb');await page.waitForFunction('window.__GAME__.state==="race"',{timeout:60000});await page.keyboard.down('Space');await page.waitForFunction('window.__GAME__.elapsed>1.5',{timeout:20000});await page.keyboard.up('Space');const t=await page.evaluate(()=>window.__GAME__);
  assert.equal(t.previewUnlocks,true);assert.equal(t.arena,arenas[i]);assert.equal(t.craft,names[i]);assert.ok(t.unlocked.every(Boolean)&&t.roster.every(Boolean));assert.ok(t.speed>0&&t.progress>0);report.runs.push({arena:t.arena,craft:t.craft,speed:t.speed,progress:t.progress});await page.screenshot({path:`${out}/${arenas[i]}.png`});console.log('PREVIEW',t.arena,t.craft,'PASS');
  await page.click('#pauseb');await page.click('#exitb');
 }
 assert.equal(await page.evaluate(()=>localStorage.getItem('tidebreak.territories.v3')),career,'career stays unchanged');assert.equal(report.errors.length,0);await page.screenshot({path:`${out}/all-craft.png`});report.passed=true;console.log('PREVIEW PASS: all 36 selection combinations available; six environments launched and driven with six craft.');
}catch(e){report.failure=e.stack;console.error(e);process.exitCode=1;}finally{fs.writeFileSync(`${out}/check.json`,JSON.stringify(report,null,2));await browser.close();}
