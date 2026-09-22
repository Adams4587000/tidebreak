import puppeteer from '../../404-game-recipe/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('../../',import.meta.url)));
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--no-proxy-server']});
const page=await browser.newPage();await page.setViewport({width:1440,height:900,deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await page.goto('http://localhost:4173',{waitUntil:'networkidle0'});await page.waitForFunction('window.__READY__',{timeout:60000});await new Promise(r=>setTimeout(r,2500));await page.screenshot({path:'tidebreak/evidence/menu-desktop.png'});console.log('initial',await page.evaluate(()=>window.__GAME__));await page.click('#startb');await new Promise(r=>setTimeout(r,6500));await page.screenshot({path:'tidebreak/evidence/race-desktop.png'});console.log('race',await page.evaluate(()=>window.__GAME__));console.log('errors',errors);await browser.close();
