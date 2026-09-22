from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
source=r'''// Original procedural spacecraft, informed by the Atlas concept recorded in docs/SPACECRAFT.md.
export default function generate(THREE) {
 const kind=KIND;
 const craft=new THREE.Group(),body=new THREE.Group();body.name='static-body';craft.add(body);
 const material=(name,color,roughness,metalness)=>{const m=new THREE.MeshStandardMaterial({color,roughness,metalness});m.name=name;return m;};
 const ivory=material('ivory',0xe4e6df,.3,.28),paint=material('paint',0xff694e,.3,.3),dark=material('carbon',0x172a32,.45,.55),trim=material('trim',0x637a83,.28,.8),glass=material('glass',0x052834,.13,.65);
 const glow=material('energy',0x061f25,.5,0);glow.emissive.setHex(0x0eacdf);glow.emissiveIntensity=2.5;
 function mesh(geo,m,x=0,y=0,z=0,parent=body){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function box(x,y,z,w,h,d,m,parent=body){return mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,parent);}
 function rod(a,b,r,m,parent=body){const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),v=q.clone().sub(p);const o=mesh(new THREE.CylinderGeometry(r,r,v.length(),6),m,0,0,0,parent);o.position.copy(p.add(q).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
 function line(points,r,m,parent=body){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(p[0],p[1],p[2]*(kind===2?.8:kind===1?1.1:1)))),20,r,5,false),m,0,0,0,parent);}
 function spindle(x,y,z,w,h,length,m){const profile=[];for(let i=0;i<=24;i++){const u=i/24;profile.push(new THREE.Vector2(Math.pow(Math.sin(u*Math.PI),.72)*(1-.28*u),(u-.5)*length));}const geo=new THREE.LatheGeometry(profile,28);geo.rotateX(Math.PI/2);geo.scale(w,h,1);return mesh(geo,m,x,y,z);}
 function plate(shape,y,thickness,m){const geo=new THREE.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:true,bevelThickness:.07,bevelSize:.09,bevelSegments:2,curveSegments:12,steps:1});geo.rotateX(Math.PI/2);return mesh(geo,m,0,y,0);}
 function wing(sign,m=ivory){const s=new THREE.Shape();
  if(kind===0){s.moveTo(sign*.55,2.3);s.bezierCurveTo(sign*1.1,1.9,sign*1.9,.2,sign*2.12,-.8);s.quadraticCurveTo(sign*2.3,-1.8,sign*1.9,-2.6);s.lineTo(sign*.5,-2.9);s.closePath();}
  else if(kind===1){s.moveTo(sign*.45,1.8);s.quadraticCurveTo(sign*1.1,.2,sign*2.05,-1.1);s.lineTo(sign*2.02,-2.4);s.quadraticCurveTo(sign*1.2,-1.8,sign*.4,-2.6);s.closePath();}
  else{s.moveTo(sign*.45,2.1);s.bezierCurveTo(sign*1.5,2.25,sign*2.7,.9,sign*2.55,-.8);s.quadraticCurveTo(sign*2.1,-.1,sign*1.8,-.25);s.quadraticCurveTo(sign*1.3,-1.8,sign*.55,-2.45);s.closePath();}
  return plate(s,1.37,.22,m);
 }
 const length=kind===1?8.8:kind===2?6.4:7.8,width=kind===1?.9:kind===2?1.3:1.15;
 spindle(0,1.25,0,width,.55,length,dark);
 spindle(0,1.5,.1,width*.97,.62,length*.98,ivory);
 for(const sign of [-1,1])wing(sign);
 // Flush teardrop canopy, sitting inside a raised perimeter gasket.
 const canopy=mesh(new THREE.SphereGeometry(1,28,14),glass,0,1.93,kind===2?.6:1);
 canopy.scale.set(kind===2?.67:.57,.44,kind===1?1.55:kind===2?1.25:1.65);
 const gasket=mesh(new THREE.TorusGeometry(.59,.032,5,40),dark,0,1.99,kind===2?.6:1);gasket.rotation.x=Math.PI/2;gasket.scale.y=kind===2?2.05:2.8;
 // A narrow centre seam, service panels, side vents and luminous navigation rails.
 line([[0,1.72,3.6],[0,1.95,2.8],[0,2.2,2]],.018,trim);
 for(const sign of [-1,1]){
  line([[sign*.32,1.68,3.35],[sign*.72,1.87,1.8],[sign*.85,1.9,.2],[sign*.65,1.91,-1.5]],.025,paint);
  line([[sign*.55,1.22,2.7],[sign*.98,1.25,1.1],[sign*1.07,1.22,-.8]],.021,glow);
  for(let i=0;i<7;i++){const vent=box(sign*.83,1.99,-.1-i*.16,.22,.035,.065,dark);vent.rotation.z=sign*.22;}
  const shoulder=spindle(sign*(kind===2?1.15:.86),1.58,-1.2,.38,.21,2.1,paint);
  for(let i=0;i<5;i++){const z=1.4-i*.8;mesh(new THREE.SphereGeometry(.034,6,4),trim,sign*.9,1.82,z);}
  line([[sign*.8,1.51,-1.6],[sign*1.4,1.46,-1.3],[sign*(kind===2?2.45:2.0),1.43,-.7]],.024,dark);
 }
 // Enclosed recessed engines, no exposed propellers.
 const engines=kind===2?[-.72,0,.72]:kind===1?[-1.55,1.55]:[-.9,.9];
 for(const [i,x] of engines.entries()){
  const r=kind===1?.52:kind===2?.29:.43,z=kind===1?-3.2:kind===2?-3.05:-2.8;
  if(kind===1)spindle(x,1.38,-1.55,.66,.58,3.3,ivory);else spindle(x,1.45,z+.55,r*1.25,r*1.2,1.9,ivory);
  const shell=mesh(new THREE.CylinderGeometry(r*1.1,r*1.2,.6,24,1,true),trim,x,1.45,z);shell.rotation.x=Math.PI/2;
  const well=mesh(new THREE.CylinderGeometry(r*.85,r*.85,.58,24),dark,x,1.45,z-.02);well.rotation.x=Math.PI/2;
  const ring=mesh(new THREE.TorusGeometry(r*.92,.052,7,28),glow,x,1.45,z-.32);
  const core=mesh(new THREE.CircleGeometry(r*.42,24),glow,x,1.45,z-.34);core.rotation.y=Math.PI;
  for(let k=0;k<6;k++){const a=k/6*Math.PI*2;rod([x+Math.cos(a)*r*.45,1.45+Math.sin(a)*r*.45,z-.35],[x+Math.cos(a)*r*.76,1.45+Math.sin(a)*r*.76,z-.35],.018,trim);}
  const plumeMat=new THREE.MeshBasicMaterial({color:0x54e9f3,transparent:true,opacity:.16,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});plumeMat.name='exhaust';
  const geo=new THREE.ConeGeometry(r*.64,1.5,16,1,true);geo.rotateX(-Math.PI/2);geo.translate(0,0,-.75);
  const plume=mesh(geo,plumeMat,x,1.45,z-.37,craft);plume.name='plume-'+i;plume.castShadow=plume.receiveShadow=false;
 }
 // Distinct dorsal elements and segmented trailing edges.
 if(kind===1){const s=new THREE.Shape();s.moveTo(-2.8,0);s.lineTo(-1.9,.8);s.quadraticCurveTo(-.9,.9,-.5,0);s.closePath();const geo=new THREE.ExtrudeGeometry(s,{depth:.08,bevelEnabled:true,bevelSize:.05,bevelThickness:.05,bevelSegments:2});geo.rotateY(Math.PI/2);mesh(geo,ivory,0,1.85,-.6);}
 if(kind===2)for(const sign of [-1,1])for(let k=0;k<5;k++){const fin=box(sign*(.9+k*.27),1.41,-1.7+k*.22,.24,.1,.5,dark);fin.rotation.y=sign*.25;}
 // Two retractable foil assemblies retain their pivots outside the static body.
 for(const sign of [-1,1]){
  const foil=new THREE.Group();foil.name=sign<0?'foil-left':'foil-right';foil.position.set(sign*(kind===2?1.38:1.2),1.2,-.55);craft.add(foil);
  rod([0,0,.8],[sign*.3,-1.03,.35],.075,trim,foil);rod([0,0,-1.05],[sign*.3,-1.03,-.5],.075,trim,foil);
  box(sign*.3,-1.09,-.1,.44,.12,2.65,dark,foil);box(sign*.3,-1.015,.03,.48,.035,1.5,paint,foil);
  const hinge=mesh(new THREE.CylinderGeometry(.13,.13,.25,12),trim,0,-.03,0,foil);hinge.rotation.z=Math.PI/2;
 }
 craft.userData.craftKind=kind;
 const bounds=new THREE.Box3().setFromObject(craft);const center=bounds.getCenter(new THREE.Vector3());craft.children.forEach(o=>{o.position.x-=center.x;o.position.y-=bounds.min.y;o.position.z-=center.z;});
 return craft;
}
'''
for kind,name in enumerate(['kestrel','albatross','manta']):
 (ROOT/'game/assets'/f'{name}.js').write_text(source.replace('KIND',str(kind)))
