// Navigation adapter for the canonical 404 gate. It changes only the two setup
// taps and scroll before the existing race-start tap. Canonical file stays untouched.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),canonical=path.resolve(root,'../404-game-recipe/harness/jam.mjs');
let source=fs.readFileSync(canonical,'utf8');
const needle='const startBox = await page.evaluate((sel) => {';
if(!source.includes(needle))throw Error('Canonical start block changed: inspect adapter before continuing.');
const setup=`// Tidebreak setup navigation: actual player controls, no game hooks.\nfor(const selector of ['#enterdock','#arenasb']){\n await page.waitForSelector(selector,{visible:true});\n await page.$eval(selector,e=>e.scrollIntoView({block:'center'}));\n const box=await page.$eval(selector,e=>{const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};});\n if(DESKTOP)await page.mouse.click(box.x,box.y);else await page.touchscreen.tap(box.x,box.y);\n await sleep(250);\n}\nawait page.$eval(START,e=>e.scrollIntoView({block:'center'}));\nawait sleep(250);\n`;
source=source.replace(needle,setup+needle);
// Resolve dependencies beside the canonical recipe without touching its files.
source=source.replace("import('puppeteer')",`import(${JSON.stringify(path.resolve(root,'../404-game-recipe/node_modules/puppeteer/lib/puppeteer/puppeteer.js'))})`);
const dir=path.join(root,'work');fs.mkdirSync(dir,{recursive:true});const adapter=path.join(dir,'territory-jam-adapter.mjs');fs.writeFileSync(adapter,source);
console.log('404 gate with explicit Tidebreak title → dock → territory navigation adapter.');
const result=spawnSync(process.execPath,[adapter,...process.argv.slice(2)],{stdio:'inherit',cwd:root});process.exitCode=result.status??1;
