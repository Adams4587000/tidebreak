// An isolated HTTP-cache fixture reproduces the old-renderer/new-entry mismatch.
// Gameplay is exercised only through normal keyboard and button input.
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';import {fileURLToPath} from 'node:url';import assert from 'node:assert/strict';
import puppeteer from '../../404-game-recipe/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),game=path.join(root,'game'),out=process.env.EVIDENCE_DIR||'evidence/cache-recovery';fs.mkdirSync(out,{recursive:true});
const old=execFileSync('git',['show','e83d09c:game/atmosphere.js'],{cwd:root,encoding:'utf8'});assert.ok(!old.includes('invalidate()'));
let seed=false,legacy=false;const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost'),name=decodeURIComponent(url.pathname);
 if(name==='/seed'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Isolated cache fixture</title>');return;}
 const file=path.resolve(game,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(game+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}
 const type=file.endsWith('.js')?'application/javascript':file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':file.endsWith('.webp')?'image/webp':file.endsWith('.mp3')?'audio/mpeg':'application/octet-stream';res.setHeader('Content-Type',type);
 if(name==='/atmosphere.js'&&!url.search){res.setHeader('Cache-Control','public, max-age=31536000');res.end(seed?old:fs.readFileSync(file));return;}
 res.setHeader('Cache-Control','no-store');let body=fs.readFileSync(file);if(name==='/'&&legacy)body=body.toString().replace(/<script type="importmap">[\s\S]*?<\/script>/,'<script type="importmap">{"imports":{"three":"./vendor/three.module.js","three/addons/":"./vendor/"}}</script>');res.end(body);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}/`,browser=await puppeteer.launch({headless:true,args:['--no-sandbox']}),report={fixture:'Seed a real HTTP cache with the historical renderer, then serve current game files. No game state is injected.',runs:[]};
try{for(const mixed of [true,false]){
 legacy=mixed;seed=true;const context=await browser.createBrowserContext(),page=await context.newPage(),errors=[],rendererRequests=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(new URL(r.url()).pathname==='/atmosphere.js')rendererRequests.push({url:r.url(),fromCache:r.fromCache()});});
 await page.goto(url+'seed');await page.evaluate(()=>fetch('./atmosphere.js').then(r=>r.text()));seed=false;await page.goto(url);
 if(mixed){await page.waitForSelector('#error:not([hidden])');const message=await page.$eval('#error-text',e=>e.textContent);assert.match(message,/reflection\.invalidate is not a function/);assert.ok(rendererRequests.some(r=>r.fromCache),'old renderer actually came from the browser cache');report.runs.push({mode:'previous partial versioning',expectedFailure:message,rendererRequests});await page.screenshot({path:out+'/reproduced-error.png'});}
 else{await page.waitForFunction('window.__READY__',{timeout:60000});await page.click('#enterdock');await page.waitForFunction('window.__GAME__.audio.musicPlaying');await page.keyboard.down('KeyR');await page.waitForFunction('window.__GAME__.rev>.9');await page.keyboard.up('KeyR');await page.click('#arenasb');await page.click('#startb');await page.waitForFunction('window.__GAME__.state==="race"&&window.__GAME__.speed>20',{timeout:60000});assert.ok(rendererRequests.some(r=>new URL(r.url).searchParams.has('v')));assert.deepEqual(errors,[]);report.runs.push({mode:'complete versioning',rendererRequests,errors,state:await page.evaluate(()=>window.__GAME__.state),passed:true});await page.screenshot({path:out+'/recovered-race.png'});}
 await context.close();
}report.passed=true;}catch(e){report.failure=e.stack;process.exitCode=1;}finally{fs.writeFileSync(out+'/cache-recovery.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));await browser.close();server.close();}
