// Visual-only fixture. Campaign progression is independently earned in campaign-check.mjs.
import puppeteer from '../../404-game-recipe/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
process.chdir(fileURLToPath(new URL('../',import.meta.url)));
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--no-proxy-server']});
try{const page=await browser.newPage();await page.setViewport({width:1280,height:800});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await page.evaluateOnNewDocument(()=>localStorage.setItem('tidebreak.campaign.v1',JSON.stringify({cleared:Array(6).fill(true),best:Array(6).fill(null),champion:true})));await page.goto('http://localhost:4173/');await page.waitForFunction('window.__READY__');const records=[];
for(const chapter of [3,5]){await page.click(`[data-course="${chapter}"]`);await page.click('#startb');await new Promise(r=>setTimeout(r,7500));await page.screenshot({path:`evidence/scenery-${chapter+1}.png`});records.push(await page.evaluate(()=>window.__GAME__));await page.click('#pauseb');await page.click('#exitb');}
if(errors.length)throw Error(errors.join('\n'));fs.writeFileSync('evidence/scenery-check.json',JSON.stringify({fixture:'All courses unlocked for visual inspection only',records,errors},null,2));console.log('SCENERY PASS: volcano fissures and ocean finale render without browser errors.');}finally{await browser.close();}
