import {stepBoost,stepDrive,NITRO_SECONDS} from './handling.js';
import {hit,live,pace,random} from './combat.js';
// Competition uses the same supplies, collision radius and pursuit rules for every crew.
export const PERKS=['CHARGE','SHIELD','OVERDRIVE','REPAIR','AMMO','SEEKER','LASER','MINE','BOMB','NITRO','DEATH'];
export const PERK_COLORS=[0xffbb32,0x28c6ff,0xff5424,0x52ef87,0xff9933,0xb85cff,0x22eaff,0xc6d346,0xff7025,0x75ffed,0xff1434];
export function tickPerks(r,dt){r.nitro=Math.max(0,(r.nitro||0)-dt);r.shield=Math.max(0,(r.shield||0)-dt);r.overdrive=Math.max(0,(r.overdrive||0)-dt);}
export function applyPerk(r,type){
 if(type==='SHIELD'){r.defenses=Math.min(3,(r.defenses||0)+1);r.shield=5;}
 else if(type==='NITRO')r.nitro=NITRO_SECONDS;
 else if(type==='OVERDRIVE')r.overdrive=5;
 else if(type==='REPAIR'){r.boost=Math.min(100,r.boost+35);r.shield=Math.max(r.shield||0,4);r.slow=0;}
 else if(type==='AMMO')r.ammo=Math.min(8,(r.ammo||0)+2);
 else if(['SEEKER','LASER','MINE','BOMB'].includes(type)){r.specialAmmo=Math.min(3,(r.special===type?r.specialAmmo:0)+2);r.special=type;}
 else if(type==='DEATH'){hit(r,null,r.raceTime||0,true);return;}
 else r.boost=Math.min(100,r.boost+60);
 r.claimed=(r.claimed||0)+1;
}
// Time of first circle entry on the swept movement segment; tunneling cannot skip a pickup.
export function entryTime(from,to,p,radius=4.7){const x=from.x-p.x,z=from.z-p.z,dx=to.x-from.x,dz=to.z-from.z,c=x*x+z*z-radius*radius;if(c<=0)return 0;const a=dx*dx+dz*dz;if(a<1e-10)return Infinity;const b=2*(x*dx+z*dz),d=b*b-4*a*c;if(d<0)return Infinity;const t=(-b-Math.sqrt(d))/(2*a);return t>=0&&t<=1?t:Infinity;}
export function resolvePickups(pickups,racers){const claims=[];for(const p of pickups){if(p.collected)continue;let winner=null,time=Infinity;for(const r of racers){if(!live(r))continue;const t=entryTime(r.previous,r,p.position);if(t<time||(t===time&&Number.isFinite(t)&&r.id<(winner?.id??'~'))){winner=r;time=t;}}if(winner){p.collected=true;p.owner=winner.id;applyPerk(winner,p.type);claims.push({pickup:p,racer:winner,time});}}return claims;}
export function stepAI(r,spec,course,pickups,dt,time,difficulty,traffic=[]){
 r.previous={x:r.x,z:r.z};if(!live(r)){r.speed=0;r.boosting=false;return;}tickPerks(r,dt);
 let target=r.homeLane,nearest=240;
 for(const p of pickups){const d=p.s-r.s,value=p.type==='NITRO'&&(r.nitro||0)<1?36:p.type==='CHARGE'&&r.boost<60?32:p.type==='OVERDRIVE'&&r.overdrive<1?30:p.type==='REPAIR'&&r.boost<75?18:0,score=d+Math.abs(p.offset-r.lane)*2-value;if(p.type!=='DEATH'&&!p.collected&&d>5&&d<180&&score<nearest){nearest=score;target=p.offset;}}
 // A brief imperfect line every ~23 seconds gives skilled players overtaking opportunities.
 r.mistakeTime=(r.mistakeTime||0)-dt;if(r.mistakeTime<=0){r.mistakeTime=9+random(r)*13;r.error=(random(r)-.5)*9;r.errorLife=1+random(r)*2;}r.errorLife=Math.max(0,(r.errorLife||0)-dt);const error=r.errorLife>0?r.error:0;
 for(const b of traffic){if(b===r)continue;const gap=b.s-r.s;if(gap>0&&gap<14&&Math.abs(b.lane-target)<4.8)target=b.lane+(r.homeLane>=b.lane?5.4:-5.4);}
 target=Math.max(-21,Math.min(21,target));
 target+=Math.sin(time*.43+r.index)*.65+error+(r.evade||0);
 for(const o of course.obstacles||[]){if(o.kind?.startsWith('RAMP'))continue;const d=o.s-r.s;if(d>-(o.halfLength||5)-8&&d<130&&Math.abs(target-o.offset)<o.radius+4)target=o.offset+(r.homeLane>=o.offset?1:-1)*(o.radius+6);}
 for(const p of pickups)if(p.type==='DEATH'&&!p.collected&&p.s-r.s>0&&p.s-r.s<100&&Math.abs(target-p.offset)<7)target=p.offset+(r.homeLane>=p.offset?9:-9);
 // Commit before the rail begins: drive up the deck or stay outside it.
 for(const ramp of course.ramps||[]){const d=ramp.s-r.s;if(d> -13&&d<110)target=Math.abs(r.lane)<ramp.halfWidth+spec.width?0:Math.sign(r.lane)*(ramp.halfWidth+spec.width+1);}
 target=Math.max(-course.width+5||-21,Math.min(course.width-5||21,target));
 const oldLane=r.lane;
 const a=course.at(r.s),b=course.at(r.s+38),turn=Math.abs(Math.atan2(Math.sin(b.heading-a.heading),Math.cos(b.heading-a.heading)));
 // Free launch/nitro never queues a reserve burst. Crews choose finite bursts
 // separated by a recovery interval, using exactly the player's energy rules.
 const free=(r.launch||0)>0||(r.nitro||0)>0;
 r.boostRest=Math.max(0,(r.boostRest||0)-dt);
 if(free){r.burst=0;r.boostRest=2+(r.index||0)*.2;}
 if(!free&&r.boostRest===0&&!(r.burst>0)&&turn<.23&&r.boost>55)r.burst=7.5;
 const requested=!free&&turn<.23&&r.burst>0;
 if(requested){r.burst=Math.max(0,r.burst-dt);if(r.burst===0||r.boost<=1)r.boostRest=3;}
 else if(!free&&r.burst>0){r.burst=0;r.boostRest=3;}
 const use=stepBoost(r,requested,false,dt);
 const corner=Math.max(.8,1-turn*.46);const trafficLoss=r.shield>0?1:traffic.some(b=>b!==r&&Math.abs(b.s-r.s)<7&&Math.abs(b.lane-r.lane)<4.6)?.85:1;
 const targetSpeed=spec.speed*(.945+difficulty*.012+((r.spec||0)%3)*.004)*corner*trafficLoss*pace(r,traffic)*(r.errorLife>0?.93:1)*(use?spec.boost:1)*(r.overdrive>0||r.nitro>0?1.12:1);
 r.speed=stepDrive(r.speed,targetSpeed,false,dt,r.launch>0);
 // Lateral steering spends travel distance too; rivals cannot change lanes for free.
 const travel=r.speed*dt,lateral=Math.max(-travel*.6,Math.min(travel*.6,(target-oldLane)*Math.min(1,dt*1.5)));
 r.lane=oldLane+lateral;r.s+=Math.sqrt(Math.max(0,travel*travel-lateral*lateral));if(r.s>=course.length){r.s=course.length;r.finished=true;r.finishTime=time;r.speed=0;r.boosting=false;}
 const point=course.at(r.s,r.lane);r.x=point.p.x;r.z=point.p.z;r.heading=point.heading;
}
