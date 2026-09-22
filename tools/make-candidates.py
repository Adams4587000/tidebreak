from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
common='''
 const g=new THREE.Group();
 const mat=(color,roughness=.55,metalness=.12)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
 const paint=mat(0xff653f,.28,.45);paint.name='paint';
 const ivory=mat(0xf4eee0,.35,.3);ivory.name='ivory';
 const dark=mat(0x172c31,.4,.45);dark.name='metal';
 const stone=mat(0xa99c83,.88,0);stone.name='stone';
 const leaf=mat(0x52654a,.85,0);leaf.name='foliage';
 const bark=mat(0x544e3f,.9,0);bark.name='timber';
 const mesh=(geo,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);g.add(o);return o;};
 const box=(x,y,z,w,h,d,m)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const rod=(a,b,r,m,s=8)=>{const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),delta=vb.clone().sub(va);const o=mesh(new THREE.CylinderGeometry(r*.8,r,delta.length(),s),m);o.position.copy(va.add(vb).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return o;};
 const finish=()=>{g.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(g),c=b.getCenter(new THREE.Vector3());g.children.forEach(o=>{o.position.x-=c.x;o.position.z-=c.z;o.position.y-=b.min.y;});g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return g;};
'''
boat='''
 function hull(x,w,length,y,m){
  if(strategy===0){const s=new THREE.Shape();s.moveTo(0,length*.51);s.quadraticCurveTo(w*.43,length*.22,w*.49,-length*.3);s.lineTo(w*.37,-length*.49);s.lineTo(-w*.37,-length*.49);s.lineTo(-w*.49,-length*.3);s.quadraticCurveTo(-w*.43,length*.22,0,length*.51);const geo=new THREE.ExtrudeGeometry(s,{depth:.38,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.11,bevelThickness:.13,curveSegments:10});geo.rotateX(Math.PI/2);return mesh(geo,m,x,y,0);}
  if(strategy===1){const geo=new THREE.SphereGeometry(1,20,10);geo.scale(w*.51,.34,length*.5);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const z=p.getZ(i);p.setX(i,p.getX(i)*(1-.28*Math.max(0,z)/(length*.5)));}geo.computeVertexNormals();return mesh(geo,m,x,y-.1,0);}
  const geo=new THREE.BoxGeometry(w,.6,length,2,2,12);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const z=p.getZ(i),f=(z/length+.5);p.setX(i,p.getX(i)*(1-.91*Math.pow(f,3)));p.setY(i,p.getY(i)+.25*f*f);}geo.computeVertexNormals();return mesh(geo,m,x,y-.1,0);
 }
 hull(-1.25,.92,7,.7,paint);hull(1.25,.92,7,.7,paint);hull(0,1.38,6.5,.94,ivory);
 for(const sign of [-1,1]){hull(sign*1.25,.65,6.1,.82,ivory);box(sign*.82,.6,-.25,.9,.26,3.1,dark);box(sign*1.25,.2,-.5,.62,.14,4.7,dark);box(sign*1.23,.92,-1.5,.48,.06,1.3,paint);for(let k=0;k<9;k++)box(sign*1.26,.98,-1.92+k*.12,.39,.04,.035,dark);}
 const glass=mat(0x08282f,.12,.82);glass.name='glass';
 const cabin=mesh(new THREE.SphereGeometry(1,24,12),glass,0,1.02,.45);cabin.scale.set(.59,.5,1.37);
 const rim=mesh(new THREE.TorusGeometry(.61,.037,5,28),ivory,0,.91,.4);rim.rotation.x=Math.PI/2;rim.scale.y=2.13;
 rod([-.48,1.09,.6],[.48,1.09,.6],.024,ivory);box(0,.94,2,.28,.05,.87,paint);
 for(const sign of [-1,1]){const t=mesh(new THREE.CylinderGeometry(.36,.43,1.3,16),dark,sign*.68,.96,-2.4);t.rotation.x=Math.PI/2;const ring=mesh(new THREE.TorusGeometry(.38,.065,6,18),ivory,sign*.68,.96,-3.06);const core=mesh(new THREE.CylinderGeometry(.21,.21,.18,12),dark,sign*.68,.96,-3.08);core.rotation.x=Math.PI/2;for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const fin=box(sign*.68+Math.cos(a)*.24,.96+Math.sin(a)*.24,-3.08,.25,.035,.05,ivory);fin.rotation.z=a+.5;}box(sign*.9,1.25,-2.23,.18,.62,.4,paint);}
 const wing=box(0,1.68,-2.65,3.5,.12,.65,dark);wing.rotation.x=-.08;
 for(const sign of [-1,1]){box(sign*1.72,1.82,-2.65,.065,.43,.78,paint);rod([sign*.48,.98,-1.55],[sign*.75,1.65,-2.6],.055,ivory);box(sign*1.52,.89,1.4,.12,.035,.75,dark);for(let i=0;i<7;i++)mesh(new THREE.SphereGeometry(.024,5,4),dark,sign*1.55,.85,i*.6-1.8);}
 return finish();
'''
rock='''
 const geo=strategy===0?new THREE.IcosahedronGeometry(1,2):strategy===1?new THREE.DodecahedronGeometry(1,1):new THREE.SphereGeometry(1,13,9);
 const p=geo.attributes.position;for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);const n=1+.13*Math.sin(x*9+z*8)*Math.cos(y*11)+.07*Math.sin(z*17-y*9);p.setXYZ(i,x*n*7,y*n*10,z*n*6);}geo.computeVertexNormals();stone.color.setHex(0x666960);stone.flatShading=true;mesh(geo,stone,0,7,0);
 for(let i=0;i<5;i++){const a=i*2.4;const o=mesh(new THREE.CylinderGeometry(1.5,2,5+i,5),stone,Math.cos(a)*5,3,Math.sin(a)*4);o.rotation.z=.15*Math.sin(i);}
 return finish();
'''
tree='''
 const trunkH=8+strategy;
 rod([0,0,0],[.5,trunkH,0],.63,bark,9);
 for(let i=0;i<9;i++){const a=i/9*Math.PI*2;const dx=Math.cos(a),dz=Math.sin(a);if(strategy===1){const path=new THREE.QuadraticBezierCurve3(new THREE.Vector3(.2,4,0),new THREE.Vector3(dx*4,2,dz*4),new THREE.Vector3(dx*4,0,dz*4));mesh(new THREE.TubeGeometry(path,8,.18,5,false),bark);}else{rod([.2,3.5,0],[dx*2,2,dz*2],.24,bark);rod([dx*2,2,dz*2],[dx*4,0,dz*4],.18,bark);}}
 for(let i=0;i<8;i++){const a=i*2.4,r=3.5+(i%3),y=trunkH-1+(i%3)*1.2;const x=Math.cos(a)*r,z=Math.sin(a)*r;rod([.3,5,0],[x,y,z],.18,bark);const canopy=mesh(strategy===2?new THREE.SphereGeometry(1,9,6):new THREE.IcosahedronGeometry(1,1),leaf,x,y,z);canopy.scale.set(3.2,1.55,2.9);for(let k=0;k<4;k++){const small=mesh(new THREE.IcosahedronGeometry(1,0),leaf,x+Math.cos(k*2)*2,y+.4,z+Math.sin(k*2)*2);small.scale.set(1.5,.8,1.4);}}
 return finish();
'''
port='''
 box(0,1,0,13,2,13,stone);box(0,2.3,0,11,.5,11,ivory);
 for(const x of [-4,4])for(const z of [-4,4]){box(x,11,z,.8,18,.8,paint);if(strategy===1)rod([x,3,z],[x*.2,20,z*.2],.45,paint);}
 for(let y=4;y<20;y+=4){for(const z of [-4,4]){rod([-4,y,z],[4,y+4,z],.14,dark);rod([4,y,z],[-4,y+4,z],.14,dark);}for(const x of [-4,4])rod([x,y,-4],[x,y+4,4],.14,dark);}
 box(0,21,0,11,2,11,paint);box(1.8,23,2,4,3,4,ivory);box(1.8,23.4,4.04,3,1.5,.08,dark);
 box(0,25,5,2.1,1,36,paint);for(let z=-12;z<22;z+=3){rod([-1,25,z],[1,28,z+3],.13,dark);rod([1,25,z],[-1,28,z+3],.13,dark);}
 rod([0,28,-9],[0,35,-3],.25,paint);rod([0,35,-3],[0,26,20],.055,dark);rod([0,25,18],[0,8,18],.045,dark);box(0,7.5,18,3,1,2,dark);
 return finish();
'''
gate='''
 for(const side of [-1,1]){box(side*19,12,0,6,24,9,stone);box(side*19,25,0,7,2,10,ivory);for(let y=3;y<24;y+=5)box(side*19,y,4.6,5,.45,.5,dark);box(side*19,20,4.8,2,4,.4,paint);}
 box(0,24,0,43,3,7,stone);box(0,26,0,45,.5,8,ivory);
 for(let x=-19;x<=19;x+=4){box(x,28,3.3,.12,3,.12,dark);box(x,28,-3.3,.12,3,.12,dark);}
 rod([-20,29,3.3],[20,29,3.3],.08,dark);rod([-20,29,-3.3],[20,29,-3.3],.08,dark);
 if(strategy===1){const a=mesh(new THREE.TorusGeometry(18,1.2,5,24,Math.PI),ivory,0,5,0);a.rotation.z=0;}else if(strategy===2){for(const s of [-1,1])rod([s*18,4,0],[s*6,24,0],1.2,ivory);}
 return finish();
'''
buoy='''
 mesh(new THREE.CylinderGeometry(.8,1.2,.6,12),dark,0,.3,0);mesh(new THREE.CylinderGeometry(.36,.7,1.4,12),paint,0,1.3,0);mesh(new THREE.CylinderGeometry(.1,.13,1.7,8),ivory,0,2.6,0);
 const m=mat(0x54f1db,.3,.1);m.emissive.setHex(0x168b75);m.emissiveIntensity=2;
 const crown=mesh(strategy===1?new THREE.OctahedronGeometry(.65):new THREE.TorusGeometry(.65,.1,6,16),m,0,3.4,0);if(strategy===2)crown.rotation.y=Math.PI/2;
 mesh(new THREE.ConeGeometry(.38,.55,8),ivory,0,3.85,0);return finish();
'''
ramp='''
 const geo=new THREE.BoxGeometry(14,.6,17,1,1,1);const p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,p.getY(i)+(p.getZ(i)+8.5)*.16);geo.computeVertexNormals();mesh(geo,dark,0,.5,0);
 for(const s of [-1,1]){const rail=box(s*6.8,2,0,.35,.35,17,paint);rail.rotation.x=-.16;for(let i=0;i<4;i++)box(s*5.5,.3+i*.8,-6+i*4,.5,1+i*.8,.5,ivory);}
 for(let i=0;i<5;i++){const stripe=box(0,.8+i*.42,-7+i*2.65,11,.04,.45,ivory);stripe.rotation.x=-.16;}
 return finish();
'''
lighthouse='''
 mesh(new THREE.CylinderGeometry(4,6,3,12),stone,0,1.5,0);mesh(new THREE.CylinderGeometry(2.3,3.8,22,strategy===1?8:18),ivory,0,14,0);
 for(const y of [8,16,23])mesh(new THREE.CylinderGeometry(3.8-(y-3)*.069,3.8-(y-3)*.069,1.4,18),paint,0,y,0);
 mesh(new THREE.CylinderGeometry(4,4,1,18),dark,0,25,0);mesh(new THREE.CylinderGeometry(2.3,2.3,4,12),dark,0,27,0);
 const light=mat(0xffecc1,.2,.1);light.emissive.setHex(0xffcb78);light.emissiveIntensity=2;mesh(new THREE.CylinderGeometry(1.95,1.95,2.3,12),light,0,27,0);
 mesh(new THREE.ConeGeometry(3.2,3,16),paint,0,30.5,0);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;rod([Math.cos(a)*3.8,25,Math.sin(a)*3.8],[Math.cos(a)*3.8,27,Math.sin(a)*3.8],.06,dark);}mesh(new THREE.TorusGeometry(3.8,.065,5,24),dark,0,27,0).rotation.x=Math.PI/2;return finish();
'''
for name,body in [('boat',boat),('rock',rock),('mangrove',tree),('crane',port),('gate',gate),('buoy',buoy),('ramp',ramp),('lighthouse',lighthouse)]:
 for i in range(3):
  text='export default function generate(THREE){\n const strategy='+str(i)+';\n'+common+body+'\n}\n'
  (ROOT/'work/candidates'/f'{name}_{i}.js').write_text(text)
