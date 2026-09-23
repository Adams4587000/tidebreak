import * as THREE from 'three';
import {ASSET,bakeStatic} from './assetlib.js';
import {applySurfaces} from './surfaces.js';
import {rng} from './course.js';
import {SECTORS} from './campaign.js';
import {ENGINE_COLORS} from './combat.js';
import {PERKS,PERK_COLORS} from './race-rules.js';
const craftNames=['kestrel','albatross','manta','brimstone','spectre','ironclad'];
const names=[...craftNames,'rock','mangrove','crane','gate','buoy','ramp','lighthouse','quay','stadium','wreck','spillway','caldera'];
export async function loadArt(onProgress){const prototypes={};let done=0;await Promise.all(names.map(async name=>{const moving=craftNames.includes(name);const o=await ASSET(`./assets/${name}.js`,{keepHierarchy:moving});
if(moving)applySurfaces(THREE,{traverse:visit=>o.traverse(n=>{if(n.isMesh&&n.material.name==='fabric')visit(n);})},{only:'fabric',size:128,normalScale:.25});
if(moving)for(const partName of ['static-body','foil-left','foil-right','rider']){const part=o.getObjectByName(partName);if(!part)throw Error(`Missing spacecraft part: ${partName}`);const local=part.clone(true);local.position.set(0,0,0);local.rotation.set(0,0,0);local.scale.set(1,1,1);local.updateMatrixWorld(true);const batched=bakeStatic(local);part.clear();part.add(batched);}
let meshes=0;o.traverse(n=>{if(n.isMesh)meshes++;});if(!meshes)throw Error(`The ${name} asset did not load.`);prototypes[name]=o;onProgress(++done/(names.length+14));}));const loader=new THREE.TextureLoader();const textures={};await Promise.all(['armory','water-normal','basalt','basalt-normal','bark','bark-normal','concrete','concrete-normal','carbon','carbon-normal','carbon-roughness','steel','steel-normal','steel-roughness'].map(async name=>{const tex=await loader.loadAsync(`./media/${name}.webp`);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.anisotropy=4;if(name.startsWith('carbon')||name.startsWith('steel'))tex.repeat.set(3,3);if(!name.endsWith('normal')&&!name.endsWith('roughness'))tex.colorSpace=THREE.SRGBColorSpace;textures[name]=tex;onProgress(++done/(names.length+14));}));return{prototypes,textures};}
function surface(material,map,normal,scale){const m=material.clone();m.map=map;m.normalMap=normal;m.normalScale.set(.48,.48);m.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 surfaceP;varying vec3 surfaceN;').replace('#include <begin_vertex>','#include <begin_vertex>\nsurfaceP=(modelMatrix*vec4(position,1.)).xyz;surfaceN=normalize(mat3(modelMatrix)*normal);');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 surfaceP;varying vec3 surfaceN;').replace('#include <map_fragment>',`vec3 sw=pow(abs(surfaceN),vec3(4.));sw/=max(dot(sw,vec3(1.)),.001);vec3 sp=surfaceP*${scale.toFixed(4)};vec4 texelColor=texture2D(map,sp.yz)*sw.x+texture2D(map,sp.xz)*sw.y+texture2D(map,sp.xy)*sw.z;float macro=texture2D(map,sp.xz*.11).r;diffuseColor*=vec4(texelColor.rgb*(.88+macro*.3),1.);`);};m.customProgramCacheKey=()=>`triplanar-${scale}`;return m;}
export function createBoat(art,color,env,index=0){
 const boat=art.prototypes[craftNames[index%6]].clone(true),materials=new Map();
 boat.traverse(o=>{if(!o.isMesh)return;const old=o.material;if(!materials.has(old.uuid)){let m;m=old.clone();m.envMap=env;m.envMapIntensity=old.name==='visor'?.7:.3;if(['paint','armor','metal','trim'].includes(old.name)){m.map=art.textures.steel;m.normalMap=art.textures['steel-normal'];m.normalScale.set(.22,.22);m.roughnessMap=art.textures['steel-roughness'];m.roughness=.66;m.metalness=Math.min(m.metalness,.5);if(old.name==='paint')m.color.setHex(color).multiplyScalar(1.7);}if(old.name==='carbon'){m.color.setHex(0xbbc6cc);m.map=art.textures.carbon;m.normalMap=art.textures['carbon-normal'];m.normalScale.set(.18,.18);m.roughnessMap=art.textures['carbon-roughness'];m.roughness=.55;m.metalness=.2;}if(old.name==='weapon'){m.map=art.textures.armory;m.color.setHex(0x7b8186);m.roughness=.65;}if(old.name==='exhaust'){m.color.setHex(ENGINE_COLORS[index]);m.emissive.setHex(ENGINE_COLORS[index]);}m.name=old.name;materials.set(old.uuid,m);}o.material=materials.get(old.uuid);o.castShadow=o.material.name!=='exhaust';});
 boat.userData.rider=boat.getObjectByName('rider');boat.userData.foils=[boat.getObjectByName('foil-left'),boat.getObjectByName('foil-right')];boat.userData.energy=[...materials.values()].filter(m=>m.name==='energy');boat.userData.plumes=[];boat.traverse(o=>{if(o.name.startsWith('plume-'))boat.userData.plumes.push(o);});return boat;
}
export function animateCraft(boat,speed,boost,steering,air,dt,time){
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
 for(let s=0;s<course.length;s+=32){const kind=course.environment(s).kind;for(const side of [-1,1]){
  if(kind==='ocean'&&side===1)continue;
  const offset=side*(course.width+16+random()*7);
  const scales=kind==='swamp'?[2.4,.3,2]:kind==='harbour'||kind==='sluice'?[2.5,.45,2.2]:kind==='gorge'?[2.7,3.4+random()*2,2.8]:kind==='volcano'?[2.6,.45+random()*.6,2.5]:[2.8,1.5+random()*3,2.6];
  place('rock',s,offset,scales,-5,random()*6.28);
  if(kind==='swamp'){for(let j=0;j<2;j++)place('mangrove',s+j*9,offset+side*(5+random()*29),1.2+random()*.8,-1,random()*6.28);if(Math.floor(s/32)%4===0)place('wreck',s,offset+side*12,.35,-2,1.1);}
  if(kind==='harbour'){const arena=s<course.length/12;if(!arena)place('quay',s,side*(course.width+21),[1,.8,1],-3.5,side===1?0:Math.PI);if(Math.floor(s/32)%4===0)place('crane',s,side*(course.width+65),1.5,0,Math.PI*.5);if(arena&&Math.floor(s/32)%2===0)place('stadium',s,side*(course.width+29),1,-1,side<0?Math.PI:0);}
  if(kind==='sluice')place('quay',s,side*(course.width+20),[1,1.9,1],-5,side===1?0:Math.PI);
  if(kind==='volcano'&&Math.floor(s/32)%3===0)place('caldera',s,side*(course.width+75),.45+random()*.4,-4,random()*6);
  if(kind==='ocean'&&Math.floor(s/32)%4===0)place('wreck',s,offset+side*14,.8+random()*.55,-3,side*.8);
 }}
 // Each biome has a landmark and a physically continuous, unobstructed racing corridor.
 for(let sector=0;sector<6;sector++){
  const start=sector*course.length/6;
  for(let k=0;k<2;k++){
   const s=start+course.length/6*(.25+k*.45);
   if(sector===2){const arch=place('rock',s,0,[1.4,4.7,2],40,0);arch.rotation.z=Math.PI/2;}
   if(sector===4)place('spillway',s,0,[course.width/28,1,1],-2);
   if(sector===0)place('gate',s,0,[course.width/17,1.2,1],-1);
   if(sector===3)place('caldera',s,course.width+210,2.4,-12);
  }
  const s=start+35,a=course.at(s);const sign=textPlane(SECTORS[sector].short+' / '+String(sector+1).padStart(2,'0'),25,2.2,'#ded0b3','#242622');sign.position.copy(a.p);sign.position.y=13;sign.rotation.y=a.heading+Math.PI;chunks[chunkIndex(s)].add(sign);
 }
 const edgeGeo=new THREE.CylinderGeometry(.5,.7,1.8,8),edgeMat=new THREE.MeshStandardMaterial({color:0x9c652f,emissive:0x694312,emissiveIntensity:.25,roughness:.8});
 for(let s=0;s<course.length;s+=35){for(const side of [-1,1]){const a=course.at(s,side*(course.width-2)),o=new THREE.Mesh(edgeGeo,edgeMat);o.position.copy(a.p);o.position.y=.1;chunks[chunkIndex(s)].add(o);}}
 // 460 m gives a supply row every ~6.5 s at a typical 71 m/s race pace.
 const arsenal=['AMMO','SEEKER','LASER','MINE','BOMB'];
 for(let i=0,s=180;s<course.length-70;i++,s+=460)for(let j=0;j<4;j++){
  const offset=[-18,-6,6,18][j],a=course.at(s,offset),types=['CHARGE','SHIELD',arsenal[i%5],i>3&&i%5===4?'DEATH':i%3===0?'OVERDRIVE':i%3===1?'AMMO':'REPAIR'],type=types[(j+i)%4],pi=PERKS.indexOf(type),m=new THREE.MeshStandardMaterial({color:PERK_COLORS[pi],emissive:PERK_COLORS[pi],emissiveIntensity:1,metalness:.45,roughness:.3});
  const o=new THREE.Group();o.position.copy(a.p);o.rotation.y=a.heading+Math.PI;
  const ring=new THREE.Mesh(new THREE.TorusGeometry(type==='DEATH'?1.5:1.25,.12,6,type==='DEATH'?3:20),m);ring.position.y=2;o.add(ring);
  const capsule=new THREE.Mesh(type==='DEATH'?new THREE.IcosahedronGeometry(.8,0):new THREE.OctahedronGeometry(.6),m);capsule.position.y=2;o.add(capsule);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(.8,1.1,.4,10),new THREE.MeshStandardMaterial({color:0x252b29,roughness:.7}));base.position.y=.15;o.add(base);
  const label=textPlane(type==='DEATH'?'☠ LETHAL':type,5.8,.75,type==='DEATH'?'#ff5266':'#f5f5ed','#101315');label.position.y=4;o.add(label);
  dynamic.add(o);pickups.push({s,offset,position:{x:a.p.x,z:a.p.z},obj:o,collected:false,type,owner:null});
 }
 // Three marked channels under service bridges; concrete piers and offset wreck barriers are solid.
 const concrete=new THREE.MeshStandardMaterial({color:0x575b59,map:art.textures.concrete,roughness:.9}),rail=new THREE.MeshStandardMaterial({color:0x282e30,metalness:.6,roughness:.65}),light=new THREE.MeshBasicMaterial({color:0xe5e6d9});
 function structure(s,offset,y,w,h,d,mat=concrete){const a=course.at(s,offset),o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);o.position.copy(a.p);o.position.y=y;o.rotation.y=a.heading;o.castShadow=o.receiveShadow=true;chunks[chunkIndex(s)].add(o);return o;}
 for(let sector=0;sector<6;sector++){
  for(const frac of [.18,.55]){const s=(sector+frac)*course.length/6;structure(s,0,11,course.width*2+8,1.6,8);for(const offset of [-14,14]){structure(s,offset,4,3.6,12,5);obstacles.push({s,offset,radius:3.5,kind:'PIER'});structure(s-3,offset,2.5,4.3,.25,.2,light);}for(const offset of [-course.width,course.width])structure(s,offset,13,.2,3,8,rail);for(const dz of [-3,3])structure(s+dz,0,13,course.width*2, .2,.15,rail);for(let k=-3;k<=3;k++)structure(s,k*8,14,.18,5,.18,rail);}
  for(const frac of [.39,.79]){const s=(sector+frac)*course.length/6,offset=frac<.5?-14:14;structure(s,offset,.8,12,2,5);obstacles.push({s,offset,radius:7,kind:'BARRIER'});const warning=textPlane(offset<0?'» » KEEP RIGHT » »':'« « KEEP LEFT « «',13,1.5,'#eee6cf','#292d2c');warning.position.copy(course.at(s-2,offset).p);warning.position.y=4;warning.rotation.y=course.at(s).heading+Math.PI;chunks[chunkIndex(s)].add(warning);}
 }
 for(let s=45;s<course.length;s+=50)for(const offset of [-10,10])structure(s,offset,.16,.15,.12,5,light);
 course.obstacles=obstacles;
 for(let sector=0;sector<6;sector++)for(const u of [.32,.71]){const s=(sector+u)*course.length/6;const o=place('ramp',s,0,1,-.35,0,true);ramps.push({s,obj:o,used:false});}
 for(let i=0;i<4;i++){const s=(4+.12+i*.23)*course.length/6,a=course.at(s);const bar=new THREE.Mesh(new THREE.BoxGeometry(course.width*1.65,.25,.4),new THREE.MeshBasicMaterial({color:0x83cab9}));bar.position.copy(a.p);bar.position.y=12;bar.rotation.y=a.heading;dynamic.add(bar);surges.push({s,phase:i*1.7,bar,used:false,open:true});}
 const finish=course.at(0),banner=textPlane('TIDEBREAK // START — FINISH',31,2.6,'#e0c391','#262621');banner.position.copy(finish.p);banner.position.y=12;banner.rotation.y=finish.heading+Math.PI;dynamic.add(banner);
 const batches=chunks.map((c,i)=>{const b=bakeStatic(c);b.userData.s=(i+.5)/count*course.length;root.add(b);return b;});
 return{root,pickups,ramps,surges,obstacles,reflectionHidden(s){return batches.filter(b=>{let d=Math.abs(b.userData.s-s);d=Math.min(d,course.length-d);return d>180;});},reset(){pickups.forEach(p=>{p.collected=false;p.owner=null;p.obj.visible=true;});ramps.forEach(r=>r.used=false);surges.forEach(g=>g.used=false);},update(t,s=0){for(const b of batches){let d=Math.abs(b.userData.s-s);d=Math.min(d,course.length-d);b.visible=d<(course.environment(b.userData.s).kind==='swamp'?220:360);}for(const p of pickups){let d=Math.abs(p.s-s);d=Math.min(d,course.length-d);p.obj.visible=!p.collected&&d<300;if(p.obj.visible){p.obj.position.y=Math.sin(t*2+p.s)*.15;p.obj.children[0].rotation.y=t*.6;p.obj.children[1].rotation.y=-t;}}for(const r of ramps)r.obj.visible=Math.abs(r.s-s)<480;for(const gate of surges){gate.bar.visible=Math.abs(gate.s-s)<480;gate.open=(t+gate.phase)%10<7;gate.bar.material.color.setHex(gate.open?0x83cab9:0xe4703d);}},dispose(){const sharedG=new Set(),sharedM=new Set(),sharedT=new Set(Object.values(art.textures));Object.values(art.prototypes).forEach(p=>p.traverse(o=>{if(o.isMesh){sharedG.add(o.geometry);sharedM.add(o.material);}}));const gs=new Set(),ms=new Set();root.traverse(o=>{if(o.isMesh){gs.add(o.geometry);ms.add(o.material);}});for(const g of gs)if(!sharedG.has(g))g.dispose();for(const m of ms)if(!sharedM.has(m)){if(m.map&&!sharedT.has(m.map))m.map.dispose();m.dispose();}}};
}
