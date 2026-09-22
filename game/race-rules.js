// Pure competition rules: no renderer, local storage or player-position catch-up.
export const PERKS=['CHARGE','SHIELD','OVERDRIVE','REPAIR'];
export const PERK_COLORS=[0xe9b967,0x78b7ca,0xf16d43,0x94ac72];
export function tickPerks(r,dt){r.shield=Math.max(0,(r.shield||0)-dt);r.overdrive=Math.max(0,(r.overdrive||0)-dt);}
export function applyPerk(r,type){if(type==='SHIELD')r.shield=9;else if(type==='OVERDRIVE')r.overdrive=5;else if(type==='REPAIR'){r.boost=Math.min(100,r.boost+35);r.shield=Math.max(r.shield||0,3);}else r.boost=Math.min(100,r.boost+60);r.claimed=(r.claimed||0)+1;}
// Time of first circle entry on the swept movement segment; tunneling cannot skip a pickup.
export function entryTime(from,to,p,radius=4.7){const x=from.x-p.x,z=from.z-p.z,dx=to.x-from.x,dz=to.z-from.z,c=x*x+z*z-radius*radius;if(c<=0)return 0;const a=dx*dx+dz*dz;if(a<1e-10)return Infinity;const b=2*(x*dx+z*dz),d=b*b-4*a*c;if(d<0)return Infinity;const t=(-b-Math.sqrt(d))/(2*a);return t>=0&&t<=1?t:Infinity;}
export function resolvePickups(pickups,racers){const claims=[];for(const p of pickups){if(p.collected)continue;let winner=null,time=Infinity;for(const r of racers){const t=entryTime(r.previous,r,p.position);if(t<time||(t===time&&Number.isFinite(t)&&r.id<(winner?.id??'~'))){winner=r;time=t;}}if(winner){p.collected=true;p.owner=winner.id;applyPerk(winner,p.type);claims.push({pickup:p,racer:winner,time});}}return claims;}
export function stepAI(r,spec,course,pickups,dt,time,difficulty,traffic=[]){
 r.previous={x:r.x,z:r.z};if(r.finished){r.speed=0;r.boosting=false;return;}tickPerks(r,dt);
 let target=r.homeLane,nearest=240;
 for(const p of pickups){const d=p.s-r.s,value=p.type==='CHARGE'&&r.boost<60?32:p.type==='OVERDRIVE'&&r.overdrive<1?30:p.type==='REPAIR'&&r.boost<75?18:0,score=d+Math.abs(p.offset-r.lane)*2-value;if(!p.collected&&d>5&&d<180&&score<nearest){nearest=score;target=p.offset;}}
 // A brief imperfect line every ~23 seconds gives skilled players overtaking opportunities.
 const error=Math.sin(time*.27+r.index*2.1)> .98?3.5:0;
 for(const b of traffic){if(b===r)continue;const gap=b.s-r.s;if(gap>0&&gap<14&&Math.abs(b.lane-target)<4.8)target=b.lane+(r.homeLane>=b.lane?5.4:-5.4);}
 target=Math.max(-21,Math.min(21,target));
 target+=Math.sin(time*.43+r.index)*.65+error;
 r.lane+=(target-r.lane)*Math.min(1,dt*1.5);
 const a=course.at(r.s),b=course.at(r.s+38),turn=Math.abs(Math.atan2(Math.sin(b.heading-a.heading),Math.cos(b.heading-a.heading)));
 r.boostLock=Math.max(0,(r.boostLock||0)-dt);
 if(r.boost<2)r.boostLock=2.5;
 const use=r.boostLock===0&&r.boost>2&&turn<.23&&(r.boost>55||r.burst>0);
 if(use){r.burst=Math.max(0,(r.burst||2)-dt);r.boost=Math.max(0,r.boost-dt*22);}else{r.burst=0;r.boost=Math.min(100,r.boost+dt*5.5);}
 r.boosting=use;
 const corner=Math.max(.8,1-turn*.46);const trafficLoss=r.shield>0?1:traffic.some(b=>b!==r&&Math.abs(b.s-r.s)<7&&Math.abs(b.lane-r.lane)<4.6)?.85:1;
 const targetSpeed=spec.speed*(.99+difficulty*.008)*corner*trafficLoss*(use?spec.boost:1)*(r.overdrive>0?1.12:1);
 r.speed+=(targetSpeed-r.speed)*(1-Math.exp(-dt*.85));r.s+=r.speed*dt;if(r.s>=course.length){r.s=course.length;r.finished=true;}
 const point=course.at(r.s,r.lane);r.x=point.p.x;r.z=point.p.z;r.heading=point.heading;
}
