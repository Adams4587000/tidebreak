import * as THREE from 'three';
import {SECTORS} from './campaign.js';
export function makeCourse(config){
 const pts=[];for(let i=0;i<96;i++){const a=i/96*Math.PI*2;const r=config.radius*(1+Math.sin(a*config.harmonics+config.seed)*config.bend+Math.cos(a*2)*.06+Math.sin(a*9+config.seed)*config.ripple+Math.cos(a*13)*config.ripple*.6);pts.push(new THREE.Vector3(Math.sin(a)*r,0,Math.cos(a)*r*config.stretch));}
 const curve=new THREE.CatmullRomCurve3(pts,true,'centripetal');curve.arcLengthDivisions=8000;const length=curve.getLength(),count=4000;
 const samples=Array.from({length:count},(_,i)=>curve.getPointAt(i/count));
 function at(s,offset=0){const u=((s/length)%1+1)%1,p=curve.getPointAt(u),t=curve.getTangentAt(u).normalize();p.x+=t.z*offset;p.z-=t.x*offset;return{p,t,heading:Math.atan2(t.x,t.z)};}
 function nearest(x,z,hint=0){
  // Project onto segments on both sides of the hint. Choosing a vertex and only
  // its following segment causes ~1 m progress jumps before every sample.
  let best=Infinity,result;const center=Math.round(hint/length*count);
  for(let k=-24;k<=24;k++){
   const j=((center+k)%count+count)%count,p=samples[j],n=samples[(j+1)%count],dx=n.x-p.x,dz=n.z-p.z;
   const q=Math.max(0,Math.min(1,((x-p.x)*dx+(z-p.z)*dz)/(dx*dx+dz*dz))),px=p.x+dx*q,pz=p.z+dz*q,d=(x-px)**2+(z-pz)**2;
   if(d<best){best=d;result={s:((j+q)%count)/count*length,distance:Math.sqrt(d),lateral:Math.sqrt(d)*Math.sign((x-px)*dz-(z-pz)*dx),p:new THREE.Vector3(px,0,pz),heading:Math.atan2(dx,dz)};}
  }return result;
 }
 function sector(){return config.arena;}
 function leg(s){return Math.min(5,Math.floor(Math.max(0,s)/length*6));}
 function environment(s){return SECTORS[sector(s)];}
 return{curve,length,samples,at,nearest,sector,leg,environment,width:config.width,config};
}
export function waveHeight(x,z,t,a=1){return a*(Math.sin(x*.063+z*.045+t*1.45)*.47+Math.sin(x*.12-z*.095+t*2.1)*.21+Math.sin(z*.22+t*1.7)*.09);}
export function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
