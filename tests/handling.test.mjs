import test from 'node:test';import assert from 'node:assert/strict';
import {stepBoost,stepDrive,courseDelta,barrierImpact,sweepSolid,sweepHull,rampContact,stepFlight,launchVelocity,REVERSE_SPEED} from '../game/handling.js';
const pier={x:0,z:0,heading:0,halfWidth:1.8,halfLength:2.5};
test('shield overlap does not enlarge the solid hull; the actual body still stops',()=>{
 const hull={halfWidth:1.5,halfLength:3.8,centerX:0,centerZ:.3};
 for(const shield of [0,5]){
  assert.equal(sweepHull({x:4,z:-12},{x:4,z:12,heading:0,shield},pier,hull).hit,false,'3.6 m shield overlaps but 1.5 m body clears');
  assert.equal(sweepHull({x:3,z:-12},{x:3,z:12,heading:0,shield},pier,hull).hit,true,'body collision remains solid');
 }
});
test('flight is a continuous world-space arc independent of the water moving underneath',()=>{
 for(const dt of [1/120,1/60,.05]){
  const r={flightY:4,flightVelocity:launchVelocity(90)};let time=0,previous=4;
  while(time<1.5){time+=dt;const water=Math.sin(time*15)*.8,result=stepFlight(r,water,dt);
   assert.equal(result.landed,false);assert.ok(Math.abs(r.flightY-(4+9*time-4.5*time*time))<1e-9);
   assert.ok(Math.abs(r.flightY-previous)<.5);previous=r.flightY;
  }
  let landings=0;for(let i=0;i<500;i++)if(stepFlight(r,0,dt).landed)landings++;
  assert.equal(landings,1);assert.equal(r.flightY,null);assert.equal(r.flightVelocity,0);
 }
});
test('holding brake stops before reversing; reverse is capped and release restores forward thrust',()=>{
 for(const dt of [1/120,1/60,.05]){let speed=90,stopped=false,reverseDistance=0;
  for(let t=0;t<4;t+=dt){speed=stepDrive(speed,65,true,dt);if(speed===0)stopped=true;if(speed<0){assert.ok(stopped);reverseDistance-=speed*dt;}assert.ok(speed>=-REVERSE_SPEED);}
  assert.ok(reverseDistance>20);assert.ok(speed<-11.5);
  for(let t=0;t<2;t+=dt)speed=stepDrive(speed,65,false,dt);
  assert.ok(speed>50);
 }
});
test('reverse movement crosses the start line without adding a lap',()=>{assert.equal(courseDelta(998,2,1000),-4);assert.equal(courseDelta(2,998,1000),4);});
test('sustained hull contact sounds once, ignores jitter and low-speed scrapes, rearms after separation',()=>{
 const r={};assert.equal(barrierImpact(r,true,40,.05),true);
 for(let i=0;i<100;i++){assert.equal(barrierImpact(r,i%4!==0,5,.05),false);}
 for(let i=0;i<6;i++)barrierImpact(r,false,0,.05);
 assert.equal(barrierImpact(r,true,0,.05),false);
 for(let i=0;i<6;i++)barrierImpact(r,false,0,.05);
 assert.equal(barrierImpact(r,true,12,.05),true);
});
test('both ramp edges carry a partly overlapping hull smoothly and allow reversing downhill',()=>{
 const ramp={x:0,z:0,heading:0,halfWidth:6.8,halfLength:8.5,base:.65,slope:.16};
 for(const side of [-1,1])for(const width of [1.5,2,3.5]){
  let prior=0;for(let z=-11.4;z<8.5;z+=.1){const p=rampContact({x:side*7,z:z-.1},{x:side*7,z},ramp,width,prior);assert.ok(p);assert.ok(p.height>=prior);assert.ok(p.height-prior<.08);prior=p.height;}
  const downhill=rampContact({x:side*7,z:4},{x:side*7,z:3.8},ramp,width,2.6);assert.ok(downhill);assert.equal(downhill.launch,false);
  const lip=rampContact({x:side*7,z:8.4},{x:side*7,z:8.6},ramp,width,prior);assert.equal(lip.launch,true);
  assert.equal(rampContact({x:side*(6.8+width+.1),z:0},{x:side*(6.8+width+.1),z:1},ramp,width),null);
 }
});
test('reverse audio uses positive engine and water levels',async()=>{
 const {RaceAudio}=await import('../game/audio.js'),a=new RaceAudio(),values=[];
 const param=()=>({setTargetAtTime:v=>values.push(v)});
 a.ctx={currentTime:10};a.osc={frequency:param()};a.sub={frequency:param()};a.filter={frequency:param()};a.engineGain={gain:param()};a.splashGain={gain:param()};a.music={};a.wash={};
 a.update(-12,false,true);assert.ok(values.every(v=>Number.isFinite(v)&&v>=0));assert.ok(a.wash.volume>0&&a.wash.volume<1);
});
test('swept hull stops at a pier even when a frame crosses the entire solid',()=>{const p=sweepSolid({x:0,z:-30},{x:0,z:30},pier,2,3);assert.equal(p.hit,true);assert.ok(p.z< -5.5);});
test('glancing contact slides along a solid face without entering it',()=>{const p=sweepSolid({x:2,z:-20},{x:5,z:8},pier,2,3);assert.equal(p.hit,true);assert.ok(p.z< -5.5);assert.equal(p.x,5);});
test('clear lanes, reverse approaches and rotated solids use the same footprint',()=>{assert.equal(sweepSolid({x:5,z:-20},{x:5,z:20},pier).hit,false);assert.ok(sweepSolid({x:0,z:20},{x:0,z:-20},pier).z>6);const p=sweepSolid({x:-30,z:0},{x:30,z:0},{...pier,heading:Math.PI/2},2,3,Math.PI/2);assert.equal(p.hit,true);assert.ok(p.x< -5.5);});
test('an overlapping hull is expelled, and a stopped hull stays outside',()=>{const p=sweepSolid({x:0,z:0},{x:0,z:0},pier);assert.equal(p.hit,true);assert.ok(Math.abs(p.x)>=3.8||Math.abs(p.z)>=6);const q=sweepSolid(p,p,pier);assert.equal(q.hit,false);});
test('boost lasts ten seconds, recharges in ten, and partial reserves work',()=>{const r={boost:100};for(let i=0;i<100;i++)assert.equal(stepBoost(r,true,false,.1),true);assert.equal(r.boost,0);assert.equal(r.boostEmpty,true);for(let i=0;i<50;i++)stepBoost(r,false,false,.1);assert.equal(r.boost,50);for(let i=0;i<20;i++)stepBoost(r,true,false,.1);assert.equal(r.boost,30);for(let i=0;i<70;i++)stepBoost(r,false,false,.1);assert.equal(r.boost,100);});
test('empty held boost cannot pulse, braking charges, launch does not drain reserve',()=>{const r={boost:0,boostEmpty:true};assert.equal(stepBoost(r,true,false,.5),false);assert.equal(stepBoost(r,true,false,.5),false);assert.equal(r.boost,10);stepBoost(r,false,true,1);assert.equal(r.boost,20);r.launch=2;assert.equal(stepBoost(r,false,false,1),true);assert.equal(r.boost,20);});
test('ramps support slow hulls, launch only off the lip and reject side misses',()=>{const ramp={x:0,z:0,heading:0,halfWidth:6.8,halfLength:8.5,base:.65,slope:.16};const a=rampContact({x:0,z:-9},{x:0,z:-8},ramp);assert.ok(a.height>.65);assert.equal(a.launch,false);const b=rampContact({x:0,z:8},{x:0,z:10},ramp,2,3);assert.equal(b.launch,true);assert.ok(b.height>3);assert.equal(rampContact({x:9,z:-8},{x:9,z:8},ramp),null);assert.equal(rampContact({x:0,z:12},{x:0,z:9},ramp),null);});

test('AI commits to the ramp deck instead of aiming through its side rail',async()=>{const {stepAI}=await import('../game/race-rules.js');const course={width:30,length:1000,at:(s,lane=0)=>({p:{x:lane,z:s},heading:0}),ramps:[{s:150,halfWidth:6.8}],obstacles:[{s:150,offset:7,radius:.35,kind:'RAMP RAIL'},{s:158,offset:0,radius:6.8,kind:'RAMP BACK'}]};const r={id:'rival',s:140,x:4,z:140,index:0,speed:60,boost:100,lane:4,homeLane:0,errorLife:0,mistakeTime:20};stepAI(r,{speed:63,boost:1.47,width:5.8},course,[],.05,12,0,[]);assert.ok(r.lane<4,'steers inward on the ramp rather than through the rail');});
test('AI stays outside a barrier until its stern clears, even after passing its center',async()=>{const {stepAI}=await import('../game/race-rules.js');const course={width:30,length:1000,at:(s,lane=0)=>({p:{x:lane,z:s},heading:0}),obstacles:[{s:150,offset:14,radius:6.2,halfLength:2.5,kind:'BARRIER'}]};const r={id:'rival',s:155,x:22.3,z:155,index:0,speed:60,boost:100,lane:22.3,homeLane:16,errorLife:0,mistakeTime:20};stepAI(r,{speed:63,boost:1.47,width:4.5},course,[],.05,12,0,[]);assert.ok(r.lane>22.3,'does not turn back into the rear half of the obstacle');});

test('boost expiry coasts at four metres per second per second across frame rates',()=>{
 for(const dt of [1/30,1/60,1/120]){
  let speed=92.61;
  for(let i=0;i<Math.round(2/dt);i++)speed=stepDrive(speed,71.82,false,dt);
  assert.ok(Math.abs(speed-84.61)<1e-7,'two seconds retain momentum');
  for(let i=0;i<Math.round(6/dt);i++)speed=stepDrive(speed,71.82,false,dt);
  assert.equal(speed,71.82,'settles at cruise without undershoot');
  assert.ok(stepDrive(92.61,71.82,true,.1)<70,'deliberate braking remains strong');
 }
});
test('every craft has a stronger cruise while retaining its original boosted top speed',async()=>{
 const {BOATS}=await import('../game/campaign.js');
 const original=[[63,1.47],[65,1.44],[61.5,1.48],[64,1.51],[62.5,1.48],[63.5,1.5]];
 BOATS.forEach((b,i)=>{assert.ok(Math.abs(b.speed*b.boost-original[i][0]*original[i][1])<1e-8);assert.ok(b.speed>=original[i][0]*1.139);assert.ok(1-1/b.boost<.25,'less than 25% speed lost at cruise');});
});
