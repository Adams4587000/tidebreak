// Shared, renderer-independent energy and solid collision rules.
export const BOOST_SECONDS=10, RECHARGE_SECONDS=10;
export const LAUNCH_SECONDS=15, NITRO_SECONDS=5, FLIGHT_GRAVITY=9;
// Integrate in world height: waves must not shake a craft that is in flight.
export function stepFlight(r,waterY,dt){
 if(r.flightY==null)return{air:0,velocity:0,landed:false};
 const v=r.flightVelocity||0;
 r.flightY+=v*dt-.5*FLIGHT_GRAVITY*dt*dt;
 r.flightVelocity=v-FLIGHT_GRAVITY*dt;
 if(r.flightY<=waterY&&r.flightVelocity<=0){r.flightY=null;r.flightVelocity=0;return{air:0,velocity:0,landed:true};}
 return{air:Math.max(0,r.flightY-waterY),velocity:r.flightVelocity,landed:false};
}
export function launchVelocity(speed){return Math.max(3.8,Math.min(9,Math.abs(speed)*.11));}
export const REVERSE_SPEED=12, COAST_DECELERATION=4;
// Brake to a stop first, then apply controllable reverse thrust while held.
export function stepDrive(speed,forwardSpeed,braking,dt,launch=false){
 if(braking&&speed>0)return Math.max(0,speed-Math.max(20,speed*3.8)*dt);
 // Thrust ending is a coast, not a brake. Collisions and weapon impacts still
 // remove speed at contact; this only blends the engine's desired speed.
 if(!braking&&speed>forwardSpeed)return Math.max(forwardSpeed,speed-COAST_DECELERATION*dt);
 const target=braking?-REVERSE_SPEED:forwardSpeed,rate=braking?2.6:launch?2.8:1.35;
 return speed+(target-speed)*(1-Math.exp(-dt*rate));
}
export function courseDelta(to,from,length){return ((to-from+length/2)%length+length)%length-length/2;}
// One cue per contact episode. Brief separation from solver jitter is still contact.
export function barrierImpact(r,contact,closingSpeed,dt){
 const fresh=(r.barrierClear??1)>=.25;
 r.barrierClear=contact?0:Math.min(1,(r.barrierClear??1)+dt);
 r.barrierContact=contact;
 return contact&&fresh&&closingSpeed>3;
}
export function stepBoost(r,requested,braking,dt){
 const launch=(r.launch||0)>0&&!braking;
 // An empty held trigger stays empty until released; no rapid on/off stutter.
 if(!requested)r.boostEmpty=false;
 const free=launch||(r.nitro||0)>0&&!braking;
 const use=free||requested&&!braking&&!r.boostEmpty&&r.boost>0;
 if(!free){r.boost=Math.max(0,Math.min(100,r.boost+(use?-100/BOOST_SECONDS:100/RECHARGE_SECONDS)*dt));if(use&&r.boost<=.00001){r.boost=0;r.boostEmpty=true;}}
 r.boosting=use;return use;
}
export function localPoint(p,o){const dx=p.x-o.x,dz=p.z-o.z,c=Math.cos(o.heading),s=Math.sin(o.heading);return{x:dx*c-dz*s,z:dx*s+dz*c};}
function worldPoint(p,o){const c=Math.cos(o.heading),s=Math.sin(o.heading);return{x:o.x+p.x*c+p.z*s,z:o.z-p.x*s+p.z*c};}
// Only the measured solid body supplies this footprint; shields/exhaust do not.
export function sweepHull(from,to,o,hull){
 const offset=worldPoint({x:hull.centerX,z:hull.centerZ},{x:0,z:0,heading:to.heading});
 const result=sweepSolid({x:from.x+offset.x,z:from.z+offset.z},{x:to.x+offset.x,z:to.z+offset.z},o,hull.halfWidth,hull.halfLength,to.heading);
 return{...result,x:result.x-offset.x,z:result.z-offset.z};
}
// Sweep the hull against an oriented solid. Slide along the struck face, never tunnel.
export function sweepSolid(from,to,o,halfWidth=2,halfLength=3.5,heading=o.heading){
 const a=localPoint(from,o),b=localPoint(to,o),d={x:b.x-a.x,z:b.z-a.z},h=heading-o.heading;
 const w=o.halfWidth+Math.abs(Math.cos(h))*halfWidth+Math.abs(Math.sin(h))*halfLength;
 const l=o.halfLength+Math.abs(Math.cos(h))*halfLength+Math.abs(Math.sin(h))*halfWidth;
 let enter=0,exit=1,axis='',normal=0;
 const inside=Math.abs(a.x)<w&&Math.abs(a.z)<l;
 if(inside){axis=w-Math.abs(a.x)<l-Math.abs(a.z)?'x':'z';normal=Math.sign(a[axis])||-Math.sign(d[axis])||1;const p={...a};p[axis]=normal*((axis==='x'?w:l)+.025);return{...worldPoint(p,o),hit:true,normal:worldPoint({x:axis==='x'?normal:0,z:axis==='z'?normal:0},{...o,x:0,z:0})};}
 for(const k of ['x','z']){const extent=k==='x'?w:l;if(Math.abs(d[k])<1e-9){if(Math.abs(a[k])>=extent)return{...to,hit:false};continue;}let t1=(-extent-a[k])/d[k],t2=(extent-a[k])/d[k],n=-1;if(t1>t2){[t1,t2]=[t2,t1];n=1;}if(t1>=enter){enter=t1;axis=k;normal=n;}exit=Math.min(exit,t2);if(enter>exit)return{...to,hit:false};}
 if(!axis||enter<0||enter>1||exit<0)return{...to,hit:false};
 const p={x:b.x,z:b.z};p[axis]=normal*((axis==='x'?w:l)+.025);
 return{...worldPoint(p,o),hit:true,normal:worldPoint({x:axis==='x'?normal:0,z:axis==='z'?normal:0},{...o,x:0,z:0}),time:enter};
}
export function rampContact(previous,current,ramp,halfWidth=2,air=0){
 const a=localPoint(previous,ramp),b=localPoint(current,ramp);
 // The deck supports overlapping hulls, including its side edging. Blend at the
 // outer hull boundary and low entrance instead of treating the rails as walls.
 const side=Math.max(0,Math.min(1,(ramp.halfWidth+halfWidth-Math.abs(b.x))/halfWidth));
 const entry=Math.max(0,Math.min(1,(b.z+ramp.halfLength+3)/3));
 if(side<=0||entry<=0||a.z>ramp.halfLength+3)return null;
 const height=z=>ramp.base+Math.max(0,Math.min(ramp.halfLength*2,z+ramp.halfLength))*ramp.slope;
 if(b.z<=ramp.halfLength){const support=height(b.z+2)*side*entry;if(air>support+1.5)return null;return{height:support,launch:false};}
 if(a.z<=ramp.halfLength&&b.z>a.z&&air<height(ramp.halfLength)+1.5)return{height:height(ramp.halfLength)*side,launch:true};
 return null;
}
