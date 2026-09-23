import test from 'node:test';
import assert from 'node:assert/strict';
import {armRacer,hit,defend,tickCombat,createCombat,pace,standings} from '../game/combat.js';
import {applyPerk,stepAI,tickPerks} from '../game/race-rules.js';
const racer=(id,s=0,lane=0)=>{const r={id,s,lane,speed:70,boost:100,x:lane,z:s,index:0,homeLane:lane};armRacer(r,53);r.shield=0;return r;};
test('three separate damaging hits eliminate; recovery prevents a chain kill',()=>{
 const a=racer('a'),b=racer('b');assert.equal(hit(a,b,10),true);assert.equal(a.hits,1);assert.ok(a.speed<70);assert.equal(hit(a,b,10.1),false);tickCombat(a,6.1);assert.equal(hit(a,b,17),true);tickCombat(a,6.1);hit(a,b,24);assert.equal(a.eliminated,true);assert.equal(a.speed,0);assert.equal(b.kills,1);assert.equal(hit(a,b,25),false);
});
test('shields block damage, have finite charges, and supplies do not erase three-hit history',()=>{
 const r=racer('r');defend(r);assert.equal(hit(r,null,10),false);assert.equal(r.defenses,1);tickPerks(r,6);hit(r,null,17);applyPerk(r,'REPAIR');assert.equal(r.hits,1);assert.ok(r.shield>0);defend(r);assert.equal(defend(r),false);
});
test('weapon ammunition, target eligibility and cooldown apply equally to both IDs',()=>{
 for(const id of ['player','rival-1']){const a=racer(id),b=racer('target',80),c=createCombat();assert.equal(c.fire(a,[a,b],1),false);assert.equal(a.ammo,4);assert.equal(c.fire(a,[a,b],10),true);assert.equal(a.ammo,3);assert.equal(c.fire(a,[a,b],10.1),false);tickCombat(a,3);b.eliminated=true;assert.equal(c.fire(a,[a,b],14),false);assert.equal(a.ammo,3);}
});
test('missiles use swept collision; changing lanes after final approach dodges them',()=>{
 for(const dodge of [false,true]){const a=racer('a'),b=racer('b',100),c=createCombat();c.fire(a,[a,b],10);for(let i=0;i<40;i++){if(dodge&&c.shots[0]?.s>55)b.lane=15;c.update(.05,[a,b],10+i*.05);}assert.equal(b.hits,dodge?0:1);}
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
