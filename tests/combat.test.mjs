import test from 'node:test';
import assert from 'node:assert/strict';
import {armRacer,hit,defend,tickCombat,createCombat,pace,standings,damageReaction} from '../game/combat.js';
import {applyPerk,stepAI,tickPerks} from '../game/race-rules.js';
import {stepBoost} from '../game/handling.js';
test('every crew starts without an active shield and receives fifteen seconds of free launch boost',()=>{
 for(const id of ['player','rival-1']){
  const r={id,boost:100,ramp:2,flightY:8,flightVelocity:3};armRacer(r,1);assert.equal(r.ramp,null);assert.equal(r.flightY,null);assert.equal(r.flightVelocity,0);assert.equal(r.shield,0);assert.equal(r.invulnerable,0);assert.equal(r.defenses,2);assert.equal(r.launch,15);
  for(let i=0;i<30;i++){assert.equal(stepBoost(r,false,false,.5),true);tickCombat(r,.5);}
  assert.equal(r.launch,0);assert.equal(r.boost,100);assert.equal(stepBoost(r,false,false,.1),false);
  assert.equal(defend(r),true);assert.equal(r.shield,5);assert.equal(r.defenses,1);
 }
});
const racer=(id,s=0,lane=0)=>{const r={id,s,lane,speed:70,boost:100,x:lane,z:s,index:0,homeLane:lane};armRacer(r,53);r.shield=0;return r;};
test('a damaging hit recoils visibly, settles and preserves the hull position',()=>{
 const a=racer('attacker',0,-2),b=racer('target',40,2),position={x:b.x,z:b.z,s:b.s,lane:b.lane};
 assert.equal(damageReaction(b,9).active,false);hit(b,a,10);const initial=damageReaction(b,10);
 assert.ok(initial.roll>.3);assert.ok(initial.pitch<-.1);assert.equal(initial.flash,1);assert.ok(initial.rider>.2);
 const later=damageReaction(b,10.8);assert.ok(Math.abs(later.roll)<.05);assert.equal(later.flash,0);
 assert.deepEqual(damageReaction(b,10.8),later,'same race time freezes the pose on pause');
 assert.equal(damageReaction(b,11.3).active,false);assert.deepEqual({x:b.x,z:b.z,s:b.s,lane:b.lane},position);
 assert.equal(hit(b,a,10.1),false);assert.equal(b.impactAt,10,'recovery blocks another flinch');
});
test('shield blocks do not recoil the hull; elimination has a finite sinking reaction and restart clears it',()=>{
 const a=racer('a'),b=racer('b');b.shield=5;assert.equal(hit(b,a,10),false);assert.equal(damageReaction(b,10).active,false);
 b.shield=0;hit(b,a,11,true);assert.equal(b.eliminated,true);const pose=damageReaction(b,12);
 assert.ok(pose.active&&Math.abs(pose.roll)>1&&pose.lift< -1);assert.equal(damageReaction(b,13).active,false);
 armRacer(b);assert.equal(b.impactAt,null);assert.equal(damageReaction(b,13).active,false);
});
test('three separate damaging hits eliminate; recovery prevents a chain kill',()=>{
 const a=racer('a'),b=racer('b');assert.equal(hit(a,b,10),true);assert.equal(a.hits,1);assert.ok(a.speed<70);assert.equal(hit(a,b,10.1),false);tickCombat(a,6.1);assert.equal(hit(a,b,17),true);tickCombat(a,6.1);hit(a,b,24);assert.equal(a.eliminated,true);assert.equal(a.speed,0);assert.equal(b.kills,1);assert.equal(hit(a,b,25),false);
});
test('shields block damage, have finite charges, and supplies do not erase three-hit history',()=>{
 const r=racer('r');defend(r);assert.equal(hit(r,null,10),false);assert.equal(r.defenses,1);tickPerks(r,6);hit(r,null,17);applyPerk(r,'REPAIR');assert.equal(r.hits,1);assert.ok(r.shield>0);defend(r);assert.equal(defend(r),false);
});
test('weapon ammunition, target eligibility and cooldown apply equally to both IDs',()=>{
 for(const id of ['player','rival-1']){const a=racer(id),b=racer('target',80),c=createCombat();assert.equal(c.fire(a,[a,b],1),false);assert.equal(a.ammo,4);assert.equal(c.fire(a,[a,b],10),true);assert.equal(a.ammo,3);assert.equal(c.fire(a,[a,b],10.1),false);tickCombat(a,3);b.eliminated=true;assert.equal(c.fire(a,[a,b],14),true);assert.equal(a.ammo,2);assert.equal(c.shots.at(-1).target,undefined);}
});
test('missiles use swept collision; changing lanes after final approach dodges them',()=>{
 for(const dodge of [false,true]){const a=racer('a'),b=racer('b',100),c=createCombat();c.fire(a,[a,b],10);for(let i=0;i<40;i++){if(dodge&&c.shots[0]?.s>55)b.lane=15;c.update(.05,[a,b],10+i*.05);}assert.equal(b.hits,dodge?0:1);}
});
test('close-range missiles hit moving rivals instead of passing through during arming',()=>{
 for(const dt of [1/120,1/60,.05])for(const gap of [5,8,15,60]){
  const a=racer('a'),b=racer('b',gap);a.speed=b.speed=90;const c=createCombat();c.fire(a,[a,b],4);
  for(let t=0;t<3;t+=dt){a.s+=a.speed*dt;b.s+=b.speed*dt;c.update(dt,[a,b],4+t);}
  assert.equal(b.hits,1,`gap ${gap}, dt ${dt}`);assert.equal(a.hits,0);assert.equal(c.events.filter(e=>e.type==='hit').length,1);
 }
});
test('free fire spends one missile, expires visibly, and guided specials still need a target',()=>{
 const a=racer('a'),c=createCombat();assert.equal(c.fire(a,[a],4),true);assert.equal(a.ammo,3);assert.equal(c.shots[0].target,undefined);assert.ok(c.events[0].shot);
 for(let i=0;i<130;i++)c.update(.05,[a],4+i*.05);
 assert.equal(c.shots.length,0);assert.equal(c.events.filter(e=>e.type==='miss').length,1);
 tickCombat(a,3);a.special='SEEKER';a.specialAmmo=2;assert.equal(c.fire(a,[a],12,true),false);assert.equal(a.specialAmmo,2);
});
test('shield and scenery stops report a blocked shot without inventing hull damage',()=>{
 const a=racer('a'),b=racer('b',15),c=createCombat();b.shield=5;c.fire(a,[a,b],4);
 for(let i=0;i<20;i++)c.update(.05,[a,b],4+i*.05);
 assert.equal(b.hits,0);assert.equal(c.events.filter(e=>e.type==='blocked').length,1);assert.equal(c.events.filter(e=>e.type==='miss').length,0);
 const x=racer('x'),d=createCombat();d.fire(x,[x],4);for(let i=0;i<30;i++)d.update(.05,[x],4+i*.05,[{s:30,offset:1.65,radius:2}]);
 assert.equal(d.shots.length,0);assert.equal(d.events.find(e=>e.type==='blast').reason,'OBSTACLE');assert.equal(d.events.find(e=>e.type==='blast').source,x);
});
test('red hazards eliminate unprotected racers, shields provide counterplay',()=>{
 const a=racer('a'),b=racer('b');defend(b);applyPerk(a,'DEATH');applyPerk(b,'DEATH');assert.equal(a.eliminated,true);assert.equal(b.eliminated,false);
});
test('pursuit and slipstream depend on race geometry, never human identity',()=>{
 const a=racer('player'),b=racer('rival',200);const p=pace(a,[a,b]);assert.ok(p>1&&p<=1.14);assert.equal(pace(b,[a,b]),1);a.id='rival';b.id='player';assert.equal(pace(a,[a,b]),p);b.s=50;assert.ok(pace(a,[a,b])>1.1);assert.equal(a.drafting,true);
});
test('finishers rank by crossing time, active racers by distance, eliminated racers by survival',()=>{
 const a=racer('a',100),b=racer('b',900),c=racer('c',500),d=racer('d',700);a.finished=true;a.finishTime=20;b.eliminated=true;b.eliminationTime=12;d.eliminated=true;d.eliminationTime=19;assert.deepEqual(standings([b,c,d,a]).map(r=>r.id),['a','c','d','b']);
});
test('seeded opponents attack each other and outcomes vary across races',()=>{
 const winners=new Set();let hits=0,eliminations=0;
 for(let seed=1;seed<=8;seed++){
  const course={width:30,length:9000,at:(s,lane=0)=>({p:{x:lane,z:s},heading:Math.sin(s/500)*.12})};
  const rs=Array.from({length:6},(_,i)=>{const r=racer('r'+i,i*10,(i-2.5)*6);r.index=r.spec=i;armRacer(r,seed*719+i*401);return r;});const combat=createCombat();
  for(let n=0;n<5000&&rs.some(r=>!r.finished&&!r.eliminated);n++){const time=n*.05;for(const r of rs){tickCombat(r,.05);stepAI(r,{speed:63,boost:1.47},course,[],.05,time,0,rs);combat.ai(r,rs,.05,time);}combat.update(.05,rs,time);combat.events.length=0;}
  winners.add(standings(rs)[0].id);hits+=rs.reduce((sum,r)=>sum+r.damageDealt,0);eliminations+=rs.filter(r=>r.eliminated).length;assert.ok(rs.every(r=>r.s<=course.length));
 }
 assert.ok(winners.size>1,'no preordained winner');assert.ok(hits>10,'AI fights AI');assert.ok(eliminations>0,'AI can be eliminated');
});

test('mines arm behind the owner and bombs damage rivals inside their marked area',()=>{
 const a=racer('a',100),b=racer('b',80);a.special='MINE';a.specialAmmo=2;const c=createCombat();assert.equal(c.fire(a,[a,b],10,true),true);for(let i=0;i<14;i++)c.update(.05,[a,b],10+i*.05);b.s=87;c.update(.05,[a,b],11);assert.equal(b.hits,1);assert.equal(a.hits,0);
 const x=racer('x'),y=racer('y',95);x.special='BOMB';x.specialAmmo=1;const d=createCombat();d.fire(x,[x,y],10,true);for(let i=0;i<32;i++)d.update(.05,[x,y],10+i*.05);assert.equal(y.hits,1);assert.equal(x.special,null);
});
test('laser has a visible ignition interval and can hit a moving target after charging',()=>{
 const a=racer('a'),b=racer('b',40);a.special='LASER';a.specialAmmo=1;const c=createCombat();c.fire(a,[a,b],10,true);for(let i=0;i<40;i++){b.s+=b.speed*.05;c.update(.05,[a,b],10+i*.05);if(i<8)assert.equal(b.hits,0);}assert.equal(b.hits,1);
});
