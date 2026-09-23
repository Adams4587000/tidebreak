// Renderer-independent rules shared by the human and every AI crew.
export const WEAPONS = ['MISSILE','SEEKER','LASER','MINE','BOMB'];
export const ENGINE_COLORS = [0x56d9ff,0xffce72,0x9cfa77,0xff6845,0xb29aff,0xe9f4ff];
export const live = r => !r.eliminated && !r.finished;
export const distance = r => r.progress ?? r.s;
export const lane = r => r.lateral ?? r.lane ?? 0;
export function armRacer(r,seed=1){Object.assign(r,{hits:0,ammo:4,special:null,specialAmmo:0,defenses:2,shield:8,invulnerable:0,slow:0,fireCooldown:0,eliminated:false,finished:false,finishTime:null,eliminationTime:null,kills:0,shots:0,damageDealt:0,launch:5,decision:10+(seed%7),randomState:seed||1});}
export function random(r){let x=r.randomState||1;x^=x<<13;x^=x>>>17;x^=x<<5;r.randomState=x>>>0;return (x>>>0)/4294967296;}
export function tickCombat(r,dt){for(const k of ['invulnerable','slow','fireCooldown','launch'])r[k]=Math.max(0,(r[k]||0)-dt);}
export function defend(r){if(!live(r)||r.defenses<=0)return false;r.defenses--;r.shield=5;r.slow=0;return true;}
export function hit(r,source,time,lethal=false){
 if(!live(r)||r.invulnerable>0||r.shield>0)return false;
 r.hits=Math.min(3,(r.hits||0)+(lethal?3:1));r.speed*=.55;r.slow=2.2;r.invulnerable=6;
 if(source){source.damageDealt=(source.damageDealt||0)+1;}
 if(r.hits>=3){r.eliminated=true;r.eliminationTime=time;r.speed=0;r.boosting=false;if(source)source.kills=(source.kills||0)+1;}
 return true;
}
export function targetFor(r,racers,range=340){return racers.filter(b=>b!==r&&live(b)&&distance(b)>distance(r)+4&&distance(b)-distance(r)<range).sort((a,b)=>distance(a)-distance(b))[0]||null;}
export function pace(r,racers){
 const others=racers.filter(b=>b!==r&&live(b)),lead=Math.max(distance(r),...others.map(distance));
 // Explicit pursuit power and drafting work identically for all crews; never move a racer.
 r.pursuit=Math.min(.14,Math.max(0,(lead-distance(r)-70)/1200));
 r.drafting=others.some(b=>distance(b)-distance(r)>7&&distance(b)-distance(r)<85&&Math.abs(lane(b)-lane(r))<6);
 return (1+r.pursuit)*(r.drafting?1.12:1)*(r.slow>0?.65:1);
}
export function standings(racers){return [...racers].sort((a,b)=>{
 if(a.finished!==b.finished)return a.finished?-1:1;
 if(a.finished)return a.finishTime-b.finishTime;
 if(a.eliminated!==b.eliminated)return a.eliminated?1:-1;
 if(a.eliminated)return b.eliminationTime-a.eliminationTime;
 return distance(b)-distance(a);
});}
export function createCombat(){
 let serial=0;const shots=[],events=[];
 function fire(r,racers,time,special=false){
  if(!live(r)||r.fireCooldown>0||time<3)return false;
  const type=special?r.special:'MISSILE';if(!type||(special?r.specialAmmo:r.ammo)<=0)return false;
  const target=targetFor(r,racers,type==='SEEKER'?520:340);
  if(!target&&!['MINE','BOMB'].includes(type))return false;
  if(special){r.specialAmmo--;if(!r.specialAmmo)r.special=null;}else r.ammo--;
  r.shots++;r.fireCooldown=2.4;
  shots.push({id:++serial,owner:r.id,target:target?.id,type,s:distance(r)+(type==='MINE'?-14:2),lane:lane(r),age:0,life:type==='MINE'?20:6,speed:type==='LASER'?240:type==='SEEKER'?185:160,lockedLane:target?lane(target):lane(r),blastS:distance(r)+95});
  events.push({type:'fire',racer:r,weapon:type,time});return true;
 }
 function update(dt,racers,time,obstacles=[]){
  for(let i=shots.length-1;i>=0;i--){const p=shots[i],owner=racers.find(r=>r.id===p.owner),target=racers.find(r=>r.id===p.target);p.age+=dt;const oldS=p.s,oldLane=p.lane;
   if(p.type==='BOMB'){p.s=Math.min(p.blastS,p.s+100*dt);if(p.age>1.5){for(const r of racers)if(r!==owner&&Math.abs(distance(r)-p.s)<18&&Math.abs(lane(r)-p.lane)<12)if(hit(r,owner,time))events.push({type:'hit',racer:r,source:owner,weapon:p.type,time});events.push({type:'blast',s:p.s,lane:p.lane,time});shots.splice(i,1);continue;}}
   else if(p.type!=='MINE'){
    p.s+=(p.age<.65?Math.max(20,(owner?.speed||60)*.3):p.speed)*dt;
    if(target&&live(target)&&(p.age<.65||distance(target)-p.s>55)&&p.type!=='LASER'){const desired=lane(target),rate=p.type==='SEEKER'?35:23;p.lane+=Math.max(-rate*dt,Math.min(rate*dt,desired-p.lane));}
    else if(p.type==='LASER')p.lane+=(p.lockedLane-p.lane)*Math.min(1,dt*4);
   }
   let consumed=false;
   if(p.age>(p.type==='MINE'?.6:.25))for(const r of racers){
    if(r===owner||!live(r))continue;
    const rs=distance(r),previousS=rs-r.speed*dt,a=oldS-previousS,b=p.s-rs,t=Math.max(0,Math.min(1,-a/(b-a||1))),gap=a+(b-a)*t;
    if(Math.abs(gap)<(p.type==='MINE'?5:5.5)&&Math.abs(oldLane+(p.lane-oldLane)*t-lane(r))<(p.type==='MINE'?4.2:3.6)){
     const damaged=hit(r,owner,time);events.push({type:damaged?'hit':'blocked',racer:r,source:owner,weapon:p.type,time});consumed=true;break;
    }
   }
   if(!consumed&&p.type!=='MINE')consumed=obstacles.some(o=>oldS<o.s&&p.s>=o.s&&Math.abs(p.lane-o.offset)<o.radius);
   if(consumed||p.age>p.life)shots.splice(i,1);
  }
 }
 function ai(r,racers,dt,time){
  if(!live(r))return;
  const incoming=shots.find(p=>p.owner!==r.id&&(p.target===r.id||Math.abs(p.lane-lane(r))<5)&&distance(r)-p.s>0&&distance(r)-p.s<110);
  if(incoming){if(r.lastThreat!==incoming.id){r.lastThreat=incoming.id;r.react=random(r)<.64;}if(r.defenses>0&&r.shield<=0&&random(r)<dt*1.7)defend(r);r.evade=r.react&&incoming.age>.55?(lane(r)>0?-1:1)*9:0;}
  else r.evade=0;
  r.decision-=dt;if(r.decision>0)return;
  const personality=r.spec??r.index??0;r.decision=12+random(r)*12+(personality===2?5:0);
  if(r.special&&(['MINE','BOMB'].includes(r.special)||targetFor(r,racers)))fire(r,racers,time,true);
  else fire(r,racers,time);
 }
 return{shots,events,fire,update,ai,reset(){shots.length=events.length=0;serial=0;}};
}
