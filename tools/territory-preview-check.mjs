// Real menu/input regression for switching territories with a former rival selected.
// The scene observer only reads transforms; it never changes gameplay or save state.
import puppeteer from '../../404-game-recipe/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const out=process.env.EVIDENCE_DIR||'evidence/territory-preview';fs.mkdirSync(out,{recursive:true});
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']}),report={runs:[],errors:[]};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
try{for(const mobile of [false,true]){
 const page=await browser.newPage();await page.setViewport(mobile?{width:844,height:390,isMobile:true,hasTouch:true,deviceScaleFactor:1}:{width:1280,height:800});
 page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.errors.push(`${r.status()} ${r.url()}`);});
 await page.goto(process.env.GAME_URL||'http://localhost:4173/');await page.waitForFunction('window.__READY__',{timeout:60000});
 await page.evaluate(async()=>{const THREE=await import('three'),original=THREE.Object3D.prototype.updateMatrixWorld;window.observedFleet=new Set();window.observedSupplies=new Set();THREE.Object3D.prototype.updateMatrixWorld=function(...args){if(this.userData.reaction&&this.userData.hull)window.observedFleet.add(this);if(this.userData.label)window.observedSupplies.add(this);return original.apply(this,args);};const {CHAPTERS}=await import('./campaign.js'),{makeCourse}=await import('./course.js');window.observedRoutes=CHAPTERS.map(makeCourse);});
 const tap=selector=>mobile?page.tap(selector):page.click(selector),held=new Set();
 const key=async(k,on)=>{if(on&&!held.has(k)){await page.keyboard.down(k);held.add(k);}else if(!on&&held.has(k)){await page.keyboard.up(k);held.delete(k);}};
 const snapshot=()=>page.evaluate(()=>{const t=window.__GAME__,hero=[...window.observedFleet].find(o=>Math.hypot(o.position.x-t.pos[0],o.position.z-t.pos[1])<.01);return{...t,heroVisible:hero?.visible===true,riderVisible:hero?.userData.rider?.visible===true,supplies:[...window.observedSupplies].filter(o=>o.parent?.parent?.parent?.isScene).map(o=>({id:o.uuid,x:o.position.x,y:o.position.y,z:o.position.z}))};});
 await tap('#enterdock');assert.ok((await snapshot()).unlocked.every(Boolean));
 // Begin with the exact reported case, then switch crew and course on every run.
 for(const arena of [1,2,3,4,5,0]){
  await tap(`[data-boat="${arena}"]`);await tap('#arenasb');await tap(`[data-course="${arena}"]`);assert.equal(await page.$eval('#startb',e=>e.disabled),false);await tap('#startb');await page.waitForFunction('window.__GAME__.state==="countdown"',{timeout:60000});
  let t=await snapshot();assert.equal(t.chapter,arena);assert.ok(t.heroVisible&&t.riderVisible,'selected craft and rider visible on the grid');assert.equal(t.speed,0);assert.equal(t.air,0);assert.equal(t.weapons.shield,0);assert.equal(t.launch,15);assert.equal(t.rivals.length,5);
  const run={arena,mobile,craft:t.craft,start:t.pos,gridVisible:true,samples:[],shots:0,jumps:0,pickups:0},supplyStart=new Map(t.supplies.map(p=>[p.id,p]));report.runs.push(run);
  await page.waitForFunction('window.__GAME__.state==="race"');const deadline=Date.now()+60000;let fired=false,captured=false;
  while(Date.now()<deadline){
   t=await snapshot();assert.equal(t.sector,arena);assert.equal(t.state,'race');assert.ok(t.heroVisible&&t.riderVisible,'craft stays visible during the race');assert.ok(Number.isFinite(t.renderY)&&Math.abs(t.renderY)<25);assert.ok(t.cameraDistance<22,'chase camera stays attached to craft');
   for(const p of t.supplies){const old=supplyStart.get(p.id);if(old){assert.equal(p.x,old.x,'supplies stay at their course X');assert.equal(p.z,old.z,'supplies stay at their course Z');assert.ok(p.y>=.29&&p.y<=.91,'supply motion is only gentle bobbing');}}
   if(!mobile){const target=await page.evaluate(()=>{const t=window.__GAME__,s=t.progress*t.courseLength,c=window.observedRoutes[t.chapter],pick=t.nextPickup;let offset=pick&&pick.s-s<160?pick.offset:0;for(const o of t.obstacleAhead)if(o.kind!=='RAMP BACK'&&o.s-s<110&&Math.abs(offset-o.offset)<o.radius+4)offset=o.offset+(offset>=o.offset?1:-1)*(o.radius+6);const p=c.at(s+Math.max(20,t.speed*.58),offset).p;return Math.atan2(p.x-t.pos[0],p.z-t.pos[1]);});const d=Math.atan2(Math.sin(target-t.heading),Math.cos(target-t.heading));await key('ArrowLeft',d>.025);await key('ArrowRight',d<-.025);if(t.elapsed>3.4&&!fired){await page.keyboard.press('KeyF');fired=true;}}
   if(t.elapsed>2&&!captured){await page.screenshot({path:`${out}/${mobile?'mobile':'desktop'}-${t.arena}.png`});captured=true;}
   run.shots=t.weapons.shots;run.jumps=t.jumps;run.pickups=t.pickups;
   if(run.samples.length===0||t.elapsed-run.samples.at(-1).elapsed>1)run.samples.push({elapsed:t.elapsed,speed:t.speed,air:t.air,visible:t.heroVisible,camera:t.cameraDistance});
   if(t.elapsed>(mobile?3:20))break;await wait(70);
  }
  assert.ok(t.elapsed>(mobile?3:20),'race advances through the observation window');assert.ok(Math.hypot(t.pos[0]-run.start[0],t.pos[1]-run.start[1])>50);assert.ok(supplyStart.size>0,'actual pickup transforms observed');if(!mobile){assert.ok(run.shots>0,'missile input works');assert.ok(run.pickups>0,'supplies remain collectible');}
  for(const k of [...held])await key(k,false);
  await tap('#pauseb');await tap('#restartb');await page.waitForFunction('window.__GAME__.state==="countdown"');t=await snapshot();assert.ok(t.heroVisible&&t.riderVisible);assert.equal(t.speed,0);assert.equal(t.air,0);assert.equal(t.weapons.shield,0);await page.waitForFunction('window.__GAME__.state==="race"');await tap('#pauseb');await tap('#exitb');await page.waitForFunction('window.__GAME__.state==="menu"');run.passed=true;console.log('PASS',mobile?'mobile':'desktop',arena,run.craft,`${run.pickups} pickups`,`${run.jumps} jumps`);fs.writeFileSync(out+'/checks.json',JSON.stringify(report,null,2));
 }
 await page.close();
}assert.deepEqual(report.errors,[]);report.passed=true;}catch(e){report.failure=e.stack;process.exitCode=1;console.error(e);}finally{fs.writeFileSync(out+'/checks.json',JSON.stringify(report,null,2));await browser.close();}
