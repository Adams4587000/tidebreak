import test from 'node:test';import assert from 'node:assert/strict';
import {resolvePickups,entryTime,stepAI,applyPerk,tickPerks} from '../game/race-rules.js';
import {stepBoost} from '../game/handling.js';
const racer=(id,start,end)=>({id,previous:{x:start,z:0},x:end,z:0,boost:0});
test('nitro is a finite automatic boost that preserves reserve and respects braking',()=>{
 for(const id of ['player','rival']){
  const r={id,boost:23,boostEmpty:true};applyPerk(r,'NITRO');assert.equal(r.nitro,5);
  for(let i=0;i<10;i++){assert.equal(stepBoost(r,false,false,.5),true);tickPerks(r,.5);}
  assert.equal(r.nitro,0);assert.equal(r.boost,23);assert.equal(stepBoost(r,false,false,.1),false);
  applyPerk(r,'NITRO');assert.equal(stepBoost(r,true,true,.5),false);tickPerks(r,.5);assert.equal(r.nitro,4.5);
  assert.equal(stepBoost(r,false,false,.1),true);applyPerk(r,'NITRO');assert.equal(r.nitro,5,'refresh, no unlimited stacking');
 }
});
test('only the first crew reaching a nitro canister gets the boost',()=>{
 const p={position:{x:0,z:0},type:'NITRO'},a=racer('player',-20,10),b=racer('rival',-8,8);
 resolvePickups([p],[a,b]);assert.equal(p.owner,'rival');assert.equal(b.nitro,5);assert.equal(a.nitro,undefined);
 tickPerks(b,2);resolvePickups([p],[a,b]);assert.equal(b.nitro,3,'collected supply cannot be claimed again');
});
test('AI nitro provides extra thrust after launch without spending its empty reserve',()=>{
 const course={width:30,length:10000,at:(s,lane=0)=>({p:{x:lane,z:s},heading:0})},spec={speed:40,boost:1.47};
 const create=()=>({id:'rival',index:0,s:0,x:0,z:0,speed:40,boost:0,lane:0,homeLane:0,mistakeTime:99,errorLife:0,randomState:1});
 const boosted=create(),ordinary=create();applyPerk(boosted,'NITRO');
 for(let i=0;i<60;i++){stepAI(boosted,spec,course,[],.05,i*.05,0);stepAI(ordinary,spec,course,[],.05,i*.05,0);}
 assert.equal(boosted.boost,0);assert.ok(boosted.speed>ordinary.speed*1.4);assert.ok(boosted.s>ordinary.s+30);
});
test('earliest touch owns a shared pickup, independent of array ordering',()=>{for(const reverse of [false,true]){const p={position:{x:0,z:0},type:'CHARGE'},a=racer('player',-20,10),b=racer('rival',-8,8),rs=reverse?[b,a]:[a,b];resolvePickups([p],rs);assert.equal(p.owner,'rival');assert.equal(b.boost,60);assert.equal(a.boost,0);resolvePickups([p],rs);assert.equal(b.boost,60);}});
test('swept entry catches fast movement and rejects nearby misses',()=>{assert.ok(Number.isFinite(entryTime({x:-100,z:0},{x:100,z:0},{x:0,z:0})));assert.equal(entryTime({x:-100,z:7},{x:100,z:7},{x:0,z:0}),Infinity);});
test('AI has finite boost and no dependency on player position',()=>{const course={at:(s,lane=0)=>({p:{x:lane,z:s},heading:0})},r={id:'rival',index:1,s:0,x:0,z:0,boost:100,speed:0,lane:0,homeLane:0};const spec={speed:40,boost:1.47};let min=100,max=0;for(let i=0;i<1800;i++){stepAI(r,spec,course,[],1/60,i/60,2);min=Math.min(min,r.boost);max=Math.max(max,r.speed);assert.ok(r.boost>=0&&r.boost<=100);}assert.ok(min<25);assert.ok(max<spec.speed*spec.boost*1.02);assert.ok(r.s>1100);});
test('finished rivals stop and cannot lap into the active race',()=>{const course={length:12,at:(s,lane=0)=>({p:{x:lane,z:s},heading:0})},r={id:'rival',index:0,s:11,x:0,z:11,boost:100,speed:40,lane:0,homeLane:0};stepAI(r,{speed:40,boost:1.47},course,[],.1,0,0);assert.equal(r.finished,true);assert.equal(r.s,12);const energy=r.boost;stepAI(r,{speed:40,boost:1.47},course,[],1,1,0);assert.equal(r.s,12);assert.equal(r.speed,0);assert.equal(r.boost,energy);});

test('AI launch does not queue a second boost and uses the same coasting limit',()=>{
 const course={width:30,length:10000,at:(s,lane=0)=>({p:{x:lane,z:s},heading:0})},spec={speed:72,boost:1.3};
 const r={id:'rival',index:0,s:0,x:0,z:0,speed:0,boost:100,lane:0,homeLane:0,mistakeTime:99,errorLife:0,launch:15};
 for(let i=0;i<150;i++){stepAI(r,spec,course,[],.1,i*.1,0);r.launch=Math.max(0,r.launch-.1);}
 assert.equal(r.boost,100);assert.equal(r.burst,0);r.launch=0;const fast=r.speed;
 for(let i=0;i<19;i++){stepAI(r,spec,course,[],.1,15+i*.1,0);assert.equal(r.boosting,false);}
 assert.ok(Math.abs(r.speed-(fast-7.6))<1e-6);assert.equal(r.boost,100);
 for(let i=0;i<10;i++)stepAI(r,spec,course,[],.1,17+i*.1,0);
 assert.ok(r.boost<100,'a deliberate reserve burst can start after recovery');
});
test('AI lane changes consume the same distance budget as forward travel',()=>{
 const course={width:30,length:10000,at:(s,lane=0)=>({p:{x:lane,z:s},heading:0})};
 const r={id:'rival',index:0,s:0,x:-20,z:0,speed:60,boost:0,lane:-20,homeLane:20,mistakeTime:99,errorLife:0};
 const dt=.1;stepAI(r,{speed:60,boost:1.3},course,[],dt,0,0);
 assert.ok(r.lane>-20);assert.ok(Math.abs(Math.hypot(r.x+20,r.z)-r.speed*dt)<1e-8);
});
