import * as THREE from 'three';
import {ASSET,bakeStatic} from './assetlib.js';
import {applySurfaces} from './surfaces.js';
import {rng} from './course.js';
import {ENGINE_COLORS} from './combat.js';
import {PERKS,PERK_COLORS} from './race-rules.js';
const craftNames=['kestrel','albatross','manta','brimstone','spectre','ironclad'];
const names=[...craftNames,'rock','mangrove','crane','gate','buoy','ramp','lighthouse','quay','stadium','wreck','spillway','caldera','edge-buoy','barrier','bridge','dock','supply','lethal-supply'];
export async function loadArt(onProgress){const prototypes={};let done=0;await Promise.all(names.map(async name=>{const moving=craftNames.includes(name);const o=await ASSET(`./assets/${name}.js`,{keepHierarchy:moving||['bridge','lethal-supply'].includes(name)});
if(moving)applySurfaces(THREE,{traverse:visit=>o.traverse(n=>{if(n.isMesh&&n.material.name==='fabric')visit(n);})},{only:'fabric',size:128,normalScale:.25});
if(moving)for(const partName of ['static-body','foil-left','foil-right','rider']){const part=o.getObjectByName(partName);if(!part)throw Error(`Missing spacecraft part: ${partName}`);const local=part.clone(true);local.position.set(0,0,0);local.rotation.set(0,0,0);local.scale.set(1,1,1);local.updateMatrixWorld(true);const batched=bakeStatic(local);part.clear();part.add(batched);}
let meshes=0;o.traverse(n=>{if(n.isMesh)meshes++;});if(!meshes)throw Error(`The ${name} asset did not load.`);prototypes[name]=o;onProgress(++done/(names.length+14));}));const loader=new THREE.TextureLoader();const textures={};await Promise.all(['armory','water-normal','basalt','basalt-normal','bark','bark-normal','concrete','concrete-normal','carbon','carbon-normal','carbon-roughness','steel','steel-normal','steel-roughness'].map(async name=>{const tex=await loader.loadAsync(`./media/${name}.webp`);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.anisotropy=4;if(name.startsWith('carbon')||name.startsWith('steel'))tex.repeat.set(3,3);if(!name.endsWith('normal')&&!name.endsWith('roughness'))tex.colorSpace=THREE.SRGBColorSpace;textures[name]=tex;onProgress(++done/(names.length+14));}));return{prototypes,textures};}
function surface(material,map,normal,scale){const m=material.clone();m.map=map;m.normalMap=normal;m.normalScale.set(.48,.48);m.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 surfaceP;varying vec3 surfaceN;').replace('#include <begin_vertex>','#include <begin_vertex>\nsurfaceP=(modelMatrix*vec4(position,1.)).xyz;surfaceN=normalize(mat3(modelMatrix)*normal);');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 surfaceP;varying vec3 surfaceN;').replace('#include <map_fragment>',`vec3 sw=pow(abs(surfaceN),vec3(4.));sw/=max(dot(sw,vec3(1.)),.001);vec3 sp=surfaceP*${scale.toFixed(4)};vec4 texelColor=texture2D(map,sp.yz)*sw.x+texture2D(map,sp.xz)*sw.y+texture2D(map,sp.xy)*sw.z;float macro=texture2D(map,sp.xz*.11).r;diffuseColor*=vec4(texelColor.rgb*(.88+macro*.3),1.);`);};m.customProgramCacheKey=()=>`triplanar-${scale}`;return m;}
// Existing Atlas PBR maps are sampled in craft-local metres so wear follows the hull.
const FINISHES=[
 {paint:0xe3c38b,metal:0x737d83,rough:.36,metalness:.48,wear:.14,scale:1.2},
 {paint:0xdee8e6,metal:0x496779,rough:.28,metalness:.62,wear:.07,scale:1.8},
 {paint:0x73885a,metal:0x485b42,rough:.72,metalness:.22,wear:.24,scale:1.4},
 {paint:0xa94327,metal:0x5b4540,rough:.6,metalness:.42,wear:.32,scale:1},
 {paint:0x58627e,metal:0x30374b,rough:.31,metalness:.5,wear:.08,scale:2},
 {paint:0xc2cbd0,metal:0x899399,rough:.43,metalness:.8,wear:.18,scale:.85},
];
function fleetSurface(m,texture,finish){
 m.map=texture;m.normalMap=null;m.roughnessMap=null;
 m.onBeforeCompile=shader=>{
 shader.uniforms.wearMap={value:texture};
 shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 hullP;varying vec3 hullN;').replace('#include <begin_vertex>','#include <begin_vertex>\nhullP=position;hullN=normal;');
 shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 hullP;varying vec3 hullN;');
 shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`vec3 weights=pow(abs(hullN),vec3(5.));weights/=max(dot(weights,vec3(1.)),.001);vec3 q=hullP*${finish.scale.toFixed(2)};vec3 grain=texture2D(map,q.yz).rgb*weights.x+texture2D(map,q.xz).rgb*weights.y+texture2D(map,q.xy).rgb*weights.z;float wear=dot(grain,vec3(.299,.587,.114));diffuseColor.rgb*=mix(1.,.6+wear*.65,${finish.wear.toFixed(2)});`);
 shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`float roughnessFactor=clamp(roughness+(wear-.5)*.18,.16,.94);`);
 };m.customProgramCacheKey=()=>`fleet-local-${finish.scale}-${finish.wear}`;
}
export function createBoat(art,color,env,index=0){
 const boat=art.prototypes[craftNames[index%6]].clone(true),materials=new Map(),finish=FINISHES[index%6];
 boat.traverse(o=>{if(!o.isMesh)return;const old=o.material;if(!materials.has(old.uuid)){const m=old.clone();m.envMap=env;m.envMapIntensity=old.name==='visor'?1.1:.65;
 if(['paint','armor','metal','trim'].includes(old.name)){m.color.setHex(old.name==='paint'?finish.paint:old.name==='armor'?finish.paint:finish.metal);if(old.name==='armor')m.color.multiplyScalar(.65);m.roughness=old.name==='trim'?.3:finish.rough;m.metalness=old.name==='metal'||old.name==='trim'?.82:finish.metalness;fleetSurface(m,art.textures.steel,finish);}
 if(old.name==='carbon'){m.color.setHex(index===4?0x33394a:0x414a50);m.roughness=index===4?.3:.52;m.metalness=.24;fleetSurface(m,art.textures.carbon,{...finish,scale:3.4,wear:.38});}
 if(old.name==='weapon'){m.map=null;m.color.setHex(0x57636b);m.roughness=.37;m.metalness=.8;fleetSurface(m,art.textures.steel,{...finish,scale:2.2,wear:.12});}
 if(old.name==='exhaust'){m.color.setHex(ENGINE_COLORS[index]);m.emissive.setHex(ENGINE_COLORS[index]);}m.name=old.name;materials.set(old.uuid,m);}o.material=materials.get(old.uuid);o.castShadow=o.material.name!=='exhaust';});
 boat.userData.rider=boat.getObjectByName('rider');boat.userData.foils=[boat.getObjectByName('foil-left'),boat.getObjectByName('foil-right')];boat.userData.energy=[...materials.values()].filter(m=>m.name==='energy');boat.userData.plumes=[];boat.traverse(o=>{if(o.name.startsWith('plume-'))boat.userData.plumes.push(o);});return boat;
}
export function animateCraft(boat,speed,boost,steering,air,dt,time){
 speed=Math.abs(speed);
 if(boat.userData.rider){boat.userData.rider.rotation.z=THREE.MathUtils.lerp(boat.userData.rider.rotation.z,-steering*.16,1-Math.exp(-dt*6));boat.userData.rider.rotation.x=Math.sin(time*(speed>5?9:1.6))*.012+(boost?.06:0);}
 const deployment=THREE.MathUtils.clamp(speed/20,0,1)*(air>.5?0:1),blend=1-Math.exp(-dt*8);
 boat.userData.foils.forEach((f,i)=>{const side=i===0?-1:1;const target=side*(deployment-1)*1.05+steering*.12;f.rotation.z=THREE.MathUtils.lerp(f.rotation.z,target,blend);});
 boat.userData.energy.forEach(m=>m.emissiveIntensity=1.4+speed*.025+(boost?2.5:0)+Math.sin(time*17)*.035);
 boat.userData.plumes.forEach((p,i)=>{p.scale.z=.2+speed*.016+(boost?1.4:0);p.material.opacity=.07+Math.min(speed/50,1)*.10+(boost?.15:0);p.rotation.y=steering*.08;});
}
function textPlane(text,width=12,height=2,color='#e4ede8',bg='#17333d'){const c=document.createElement('canvas');c.width=1024;c.height=128;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,1024,128);x.fillStyle=color;x.font='bold 64px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(text,512,69);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:t,side:THREE.FrontSide}));return mesh;}
export function buildWorld(course,art){
 const root=new THREE.Group(),dynamic=new THREE.Group();root.add(dynamic);
 const random=rng(course.config.seed),count=Math.ceil(course.length/100),chunks=Array.from({length:count},()=>new THREE.Group()),materialCache=new Map(),pickups=[],ramps=[],surges=[],obstacles=[];
 const chunkIndex=s=>Math.floor((((s/course.length)%1+1)%1)*count);
 function clone(name,kind){const o=art.prototypes[name].clone(true);o.traverse(n=>{if(!n.isMesh)return;const old=n.material,key=old.uuid+kind;if(!materialCache.has(key)){let m=old.clone();if(old.name==='stone'){m=surface(old,art.textures[name==='rock'||name==='caldera'?'basalt':'concrete'],art.textures[name==='rock'||name==='caldera'?'basalt-normal':'concrete-normal'],.13);m.color.setHex(kind==='volcano'?0x77716a:kind==='swamp'?0x868775:0xa5aaa5);m.roughness=.87;if(kind==='volcano'&&name==='rock'){const compile=m.onBeforeCompile;m.onBeforeCompile=shader=>{compile(shader);shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>\nfloat crack=abs(sin(surfaceP.x*.22+sin(surfaceP.y*.3))*sin(surfaceP.z*.26+cos(surfaceP.y*.21)));float ember=(1.-smoothstep(.0015,.006,crack))*(1.-smoothstep(3.,11.,surfaceP.y));totalEmissiveRadiance+=vec3(1.,.055,.002)*ember*1.6;`);};m.customProgramCacheKey=()=> 'caldera-fissures';}}if(old.name==='timber'){m=surface(old,art.textures.bark,art.textures['bark-normal'],.2);m.color.setHex(0x8b8d77);}if(old.name==='foliage'){m.color.setHex(0x48523b);m.roughness=1;}if(['metal','paint','ivory'].includes(old.name)){m.map=art.textures.steel;m.normalMap=art.textures['steel-normal'];m.roughnessMap=art.textures['steel-roughness'];m.color.multiplyScalar(.6);m.roughness=.85;}materialCache.set(key,m);}n.material=materialCache.get(key);});return o;}
 function place(name,s,lateral,scale=1,y=0,rot=0,dyn=false){const kind=course.environment(s).kind,o=clone(name,kind),a=course.at(s,lateral);o.position.copy(a.p);o.position.y=y;o.rotation.y=a.heading+rot;if(Array.isArray(scale))o.scale.set(...scale);else o.scale.setScalar(scale);(dyn?dynamic:chunks[chunkIndex(s)]).add(o);return o;}
 const spacing=course.config.arena===1?40:32;
 for(let s=0;s<course.length;s+=spacing){const kind=course.environment(s).kind;for(const side of [-1,1]){
  if(kind==='ocean'&&side===1)continue;
  const offset=side*(course.width+16+random()*7);
  const scales=kind==='swamp'?[2.4,.3,2]:kind==='harbour'||kind==='sluice'?[2.5,.45,2.2]:kind==='gorge'?[2.7,3.4+random()*2,2.8]:kind==='volcano'?[2.6,.45+random()*.6,2.5]:[2.8,1.5+random()*3,2.6];
  place('rock',s,offset,scales,-5,random()*6.28);
  if(kind==='swamp'){place('mangrove',s,side*(course.width+13+random()*5),1.8+random()*.7,-1,random()*6.28);if(Math.floor(s/spacing)%2===0)place('mangrove',s+18,side*(course.width+42),2.3+random()*.4,-1,random()*6.28);if(Math.floor(s/spacing)%4===0)place('wreck',s,offset+side*12,.35,-2,1.1);}
  if(kind==='harbour'){const arena=s<course.length*.16||s>course.length*.85;if(!arena)place('quay',s,side*(course.width+21),[1,.8,1],-3.5,side===1?0:Math.PI);if(Math.floor(s/32)%4===0)place('crane',s,side*(course.width+65),1.5,0,Math.PI*.5);if(arena&&Math.floor(s/32)%2===0)place('stadium',s,side*(course.width+29),1,-1,side<0?Math.PI:0);}
  if(kind==='sluice')place('quay',s,side*(course.width+20),[1,1.9,1],-5,side===1?0:Math.PI);
  if(kind==='volcano'&&Math.floor(s/32)%3===0)place('caldera',s,side*(course.width+75),.45+random()*.4,-4,random()*6);
  if(kind==='ocean'&&Math.floor(s/32)%4===0)place('wreck',s,offset+side*14,.8+random()*.55,-3,side*.8);
 }}
 // Each biome has a landmark and a physically continuous, unobstructed racing corridor.
 for(let sector=0;sector<6;sector++){
  const start=sector*course.length/6;
  for(let k=0;k<2;k++){
   const s=start+course.length/6*(.25+k*.45);
   if(course.config.arena===2){const arch=place('rock',s,0,[1.4,4.7,2],40,0);arch.rotation.z=Math.PI/2;}
   if(course.config.arena===4)place('spillway',s,0,[course.width/28,1,1],-2);
   if(course.config.arena===0)place('gate',s,0,[course.width/17,1.2,1],-1);
   if(course.config.arena===3)place('caldera',s,course.width+210,2.4,-12);
   if(course.config.arena===1){place('wreck',s,course.width+3,.65,-2,1.3);place('mangrove',s,-course.width-15,2.2,-1);}
   if(course.config.arena===5){place('wreck',s,course.width+15,1.6,-3,1.1);if(k===0)place('lighthouse',s,-course.width-45,2,1);}
  }
  const s=start+35,a=course.at(s);const sign=textPlane(course.config.legs[sector]+' / '+String(sector+1).padStart(2,'0'),25,2.2,'#ded0b3','#242622');sign.position.copy(a.p);sign.position.y=13;sign.rotation.y=a.heading+Math.PI;chunks[chunkIndex(s)].add(sign);
 }
 for(let s=0;s<course.length;s+=35)for(const side of [-1,1])place('edge-buoy',s,side*(course.width-2),1,-.8);
 // 460 m gives a supply row every ~6.5 s at a typical 71 m/s race pace.
 const arsenal=['AMMO','SEEKER','LASER','MINE','BOMB'];
 for(let i=0,s=180;s<course.length-70;i++,s+=460)for(let j=0;j<4;j++){
  const offset=[-18,-6,6,18][j],a=course.at(s,offset),types=['CHARGE','SHIELD',arsenal[i%5],i>3&&i%5===4?'DEATH':i%3===0?'OVERDRIVE':i%3===1?'AMMO':'REPAIR'],type=types[(j+i)%4],pi=PERKS.indexOf(type);
  const o=art.prototypes[type==='DEATH'?'lethal-supply':'supply'].clone(true);o.position.copy(a.p);o.position.y=.5;o.rotation.y=a.heading+Math.PI;
  o.traverse(n=>{if(n.isMesh&&n.material.name==='signal'){n.material=n.material.clone();n.material.color.setHex(PERK_COLORS[pi]);n.material.emissive.setHex(PERK_COLORS[pi]);}});
  const label=textPlane(type==='DEATH'?'☠ LETHAL':type,7.5,1.2,type==='DEATH'?'#ff5266':'#f5f5ed','#101315');label.position.y=5.7;o.add(label);
  o.userData.label=label;dynamic.add(o);pickups.push({s,offset,position:{x:a.p.x,z:a.p.z},obj:o,collected:false,type,owner:null});
 }
 // Three marked channels under service bridges; concrete piers and offset wreck barriers are solid.
 for(let sector=0;sector<6;sector++){
  for(const frac of (course.config.arena===5?[.55]:[.18,.55])){const s=(sector+frac)*course.length/6;if(course.config.arena===1){place('mangrove',s,-course.width-8,2.5,-1);place('wreck',s,course.width+5,.5,-2,.8);continue;}if(course.config.arena===2){place('rock',s,-course.width-12,[2,5,3],-3);place('rock',s,course.width+12,[2,4,3],-3);continue;}const bridge=place('bridge',s,0,1,-2);bridge.getObjectByName('deck').scale.x=(course.width*2+8)/68;for(const side of [-30,30])bridge.getObjectByName('side-'+side).position.x=Math.sign(side)*course.width;for(const z of [-3,3])bridge.getObjectByName('rail-'+z).scale.x=course.width/30;for(const offset of [-14,14])obstacles.push({s,offset,radius:2.2,halfWidth:1.8,halfLength:2.5,height:12,kind:'PIER'});}
  for(const frac of [.39,.79]){const s=(sector+frac)*course.length/6,offset=frac<.5?-14:14;const name=[1,5].includes(course.config.arena)?'wreck':[2,3].includes(course.config.arena)?'rock':'barrier',scale=name==='wreck'?[.38,.45,.4]:name==='rock'?[.5,.35,.5]:[1,1,1],y=name==='barrier'?-.2:-1;place(name,s,offset,scale,y);const size=new THREE.Box3().setFromObject(art.prototypes[name]).getSize(new THREE.Vector3());obstacles.push({s,offset,radius:size.x*scale[0]/2,halfWidth:size.x*scale[0]/2,halfLength:size.z*scale[2]/2,height:size.y*scale[1]+y,kind:'BARRIER'});const warning=textPlane(offset<0?'» » KEEP RIGHT » »':'« « KEEP LEFT « «',13,1.5,'#eee6cf','#292d2c');warning.position.copy(course.at(s-2,offset).p);warning.position.y=4;warning.rotation.y=course.at(s).heading+Math.PI;chunks[chunkIndex(s)].add(warning);}
 }
 // Thin lane strips are runtime course markings, not scenery objects.
 const light=new THREE.MeshBasicMaterial({color:0xe5e6d9}),stripeGeo=new THREE.PlaneGeometry(.15,5).rotateX(-Math.PI/2);
 for(let s=45;s<course.length;s+=50)for(const offset of [-10,10]){const a=course.at(s,offset),o=new THREE.Mesh(stripeGeo,light);o.position.copy(a.p);o.position.y=.22;o.rotation.y=a.heading;chunks[chunkIndex(s)].add(o);}
 course.obstacles=obstacles;course.ramps=ramps;
 for(let sector=0;sector<6;sector++)for(const u of [.32,.71]){const s=(sector+u)*course.length/6;const o=place('ramp',s,0,1,-.35,0,true);const a=course.at(s);ramps.push({s,obj:o,used:false,x:a.p.x,z:a.p.z,heading:a.heading,halfWidth:6.8,halfLength:8.5,base:.65,slope:.16});obstacles.push({s:s+8.7,offset:0,radius:6.8,halfWidth:6.8,halfLength:.2,height:3.4,rampS:s,kind:'RAMP BACK'});}
 for(let i=0;i<(course.config.arena===4?10:0);i++){const s=(.06+i*.09)*course.length,a=course.at(s);const bar=new THREE.Mesh(new THREE.BoxGeometry(course.width*1.65,.25,.4),new THREE.MeshBasicMaterial({color:0x83cab9}));bar.position.copy(a.p);bar.position.y=12;bar.rotation.y=a.heading;dynamic.add(bar);surges.push({s,phase:i*1.7,bar,used:false,open:true});}
 for(const o of obstacles){const a=course.at(o.s,o.offset);o.x=a.p.x;o.z=a.p.z;o.heading=a.heading;}
 const finish=course.at(0),banner=textPlane('TIDEBREAK // START — FINISH',31,2.6,'#e0c391','#262621');banner.position.copy(finish.p);banner.position.y=12;banner.rotation.y=finish.heading+Math.PI;dynamic.add(banner);
 const batches=chunks.map((c,i)=>{const b=bakeStatic(c);b.userData.s=(i+.5)/count*course.length;root.add(b);return b;});
 return{root,pickups,ramps,surges,obstacles,reflectionHidden(s){return batches.filter(b=>{let d=Math.abs(b.userData.s-s);d=Math.min(d,course.length-d);return d>180;});},reset(){pickups.forEach(p=>{p.collected=false;p.owner=null;p.obj.visible=true;});ramps.forEach(r=>r.used=false);surges.forEach(g=>g.used=false);},update(t,s=0){for(const b of batches){let d=Math.abs(b.userData.s-s);d=Math.min(d,course.length-d);b.visible=d<(course.environment(b.userData.s).kind==='swamp'?220:360);}for(const p of pickups){let d=Math.abs(p.s-s);d=Math.min(d,course.length-d);p.obj.visible=!p.collected&&d<300;if(p.obj.visible){p.obj.position.y=.6+Math.sin(t*2+p.s)*.3;const ring=p.obj.getObjectByName('ring'),core=p.obj.getObjectByName('core');if(ring)ring.rotation.y=t*.6;if(core)core.rotation.y=-t;p.obj.traverse(n=>{if(n.isMesh&&n.material.name==='signal')n.material.emissiveIntensity=.85+Math.sin(t*4)*.2;});}}for(const r of ramps)r.obj.visible=Math.abs(r.s-s)<480;for(const gate of surges){gate.bar.visible=Math.abs(gate.s-s)<480;gate.open=(t+gate.phase)%10<7;gate.bar.material.color.setHex(gate.open?0x83cab9:0xe4703d);}},dispose(){const sharedG=new Set(),sharedM=new Set(),sharedT=new Set(Object.values(art.textures));Object.values(art.prototypes).forEach(p=>p.traverse(o=>{if(o.isMesh){sharedG.add(o.geometry);sharedM.add(o.material);}}));const gs=new Set(),ms=new Set();root.traverse(o=>{if(o.isMesh){gs.add(o.geometry);ms.add(o.material);}});for(const g of gs)if(!sharedG.has(g))g.dispose();for(const m of ms)if(!sharedM.has(m)){if(m.map&&!sharedT.has(m.map))m.map.dispose();m.dispose();}}};
}
