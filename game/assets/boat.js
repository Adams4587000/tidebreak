export default function generate(THREE){
 const strategy=0;

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

}
