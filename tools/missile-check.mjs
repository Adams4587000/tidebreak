// Real controls only: free fire in time trial, then engage rivals in a normal race.
import puppeteer from '../../404-game-recipe/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import fs from 'node:fs';import assert from 'node:assert/strict';
const out=process.env.EVIDENCE_DIR||'evidence/missiles';fs.mkdirSync(out,{recursive:true});
const browser=await puppeteer.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--no-proxy-server']});
const report={errors:[],shots:[],outcomes:[]},held=new Set();let page;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function key(k,on){if(on&&!held.has(k)){held.add(k);await page.keyboard.down(k);}else if(!on&&held.has(k)){held.delete(k);await page.keyboard.up(k);}}
async function read(){return page.evaluate(()=>window.__GAME__);}
async function steer(t,offset=0){const s=t.progress*t.courseLength,target=await page.evaluate(({s,offset,speed,pos})=>{const p=window.testCourse.at(s+Math.max(16,speed*.4),offset).p;return Math.atan2(p.x-pos[0],p.z-pos[1]);},{s,offset,speed:t.speed,pos:t.pos});const d=Math.atan2(Math.sin(target-t.heading),Math.cos(target-t.heading));await key('ArrowLeft',d>.02);await key('ArrowRight',d<-.02);}
try{
 page=await browser.newPage();await page.setViewport({width:1100,height:720});page.on('pageerror',e=>report.errors.push(e.message));await page.goto('http://localhost:4173/');await page.waitForFunction('window.__READY__',{timeout:60000});await page.evaluate(async()=>{const {CHAPTERS}=await import('./campaign.js'),{makeCourse}=await import('./course.js');window.testCourse=makeCourse(CHAPTERS[0]);});
 await page.click('#enterdock');await page.click('#arenasb');await page.click('[data-mode="time"]');await page.click('#startb');await page.waitForFunction('window.__GAME__.elapsed>3.2');
 const before=await read();assert.equal(before.weapons.target,undefined);assert.equal(await page.$eval('#fireb',e=>e.disabled),false);await page.keyboard.press('KeyF');await wait(60);const free=await read();assert.equal(free.weapons.ammo,before.weapons.ammo-1);assert.ok(free.weapons.missiles.length>0);assert.match(free.weapons.feedback.text,/MISSILE AWAY · UNGUIDED/);report.free=free;await page.screenshot({path:`${out}/free-launch.png`});
 for(let i=0;i<160;i++){const t=await read();await steer(t);if(t.weapons.feedback.kind!=='launch'){report.freeOutcome=t.weapons.feedback;break;}await wait(55);}
 assert.match(report.freeOutcome?.text||'',/MISSED|HIT SCENERY/);
 for(const k of [...held])await key(k,false);await page.click('#pauseb');await page.click('#exitb');await page.click('#arenasb');await page.click('[data-mode="race"]');await page.click('#startb');await page.waitForFunction('window.__GAME__.state==="race"');
 let lastShot=-10,lastOutcome='',lastCount=0;const started=Date.now();
 while(Date.now()-started<110000){const t=await read();if(t.state!=='race')break;const target=t.rivals.find(r=>r.id===t.weapons.target),gap=target?target.s-t.progress*t.courseLength:0;
  await steer(t);await key('ArrowDown',t.elapsed>2&&!t.weapons.missiles.length&&(!target||gap<18));
  if(target&&gap>12&&gap<160&&t.elapsed>3&&t.elapsed-lastShot>2.7&&t.weapons.cooldown===0&&t.weapons.ammo>0&&target.shield<=0&&target.invulnerable<=0){await key('ArrowDown',false);report.shots.push({elapsed:t.elapsed,gap,target:target.id});await page.keyboard.press('KeyF');lastShot=t.elapsed;}
  const feedback=t.weapons.feedback;if(feedback.kind&&feedback.kind!=='launch'&&feedback.text!==lastOutcome){lastOutcome=feedback.text;report.outcomes.push({...feedback,elapsed:t.elapsed,damage:t.weapons.damageDealt});console.log(feedback.text);if(feedback.kind==='hit'){assert.ok(t.weapons.damageDealt>lastCount);report.hit=t;
   if(process.env.CHECK_REACTION==='1'){
    const victim=t.rivals.find(r=>r.damagePose?.active&&r.hits>0&&feedback.text.includes(r.name));assert.ok(victim,'the struck craft is visibly reacting');assert.ok(Math.abs(victim.damagePose.roll)>.04||Math.abs(victim.damagePose.pitch)>.04);report.reaction={id:victim.id,initial:victim,samples:[]};
    await key('ArrowDown',true);await page.screenshot({path:`${out}/hit-confirmed.png`});const deadline=Date.now()+12000;
    while(Date.now()<deadline){const current=await read(),r=current.rivals.find(r=>r.id===victim.id);report.reaction.samples.push({elapsed:current.elapsed,...r});if(current.elapsed>victim.impactAt+1.35){assert.equal(r.damagePose.active,false);assert.equal(r.damagePose.flash,0);assert.equal(r.damagePose.roll,0);break;}await wait(45);}
    assert.ok(report.reaction.samples.at(-1).elapsed>victim.impactAt+1.35,'reaction completes');await page.screenshot({path:`${out}/reaction-settled.png`});await key('ArrowDown',false);
   }else await page.screenshot({path:`${out}/hit-confirmed.png`});break;}lastCount=t.weapons.damageDealt;}
  if(t.weapons.ammo<=0&&t.weapons.missiles.length===0)break;await wait(45);
 }
 assert.ok(report.hit,'normal race delivers a confirmed damaging missile hit');assert.equal(report.errors.length,0);report.passed=true;console.log('MISSILE PASS: F launches without a target; projectile and outcome are visible; normal race confirms hull damage.');
}catch(e){report.failure=e.stack;process.exitCode=1;console.error(e);}finally{fs.writeFileSync(`${out}/missile-check.json`,JSON.stringify(report,null,2));await browser.close();}
