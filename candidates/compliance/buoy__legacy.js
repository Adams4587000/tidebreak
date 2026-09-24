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

 mesh(new THREE.CylinderGeometry(.8,1.2,.6,12),dark,0,.3,0);mesh(new THREE.CylinderGeometry(.36,.7,1.4,12),paint,0,1.3,0);mesh(new THREE.CylinderGeometry(.1,.13,1.7,8),ivory,0,2.6,0);
 const m=mat(0x54f1db,.3,.1);m.emissive.setHex(0x168b75);m.emissiveIntensity=2;
 const crown=mesh(strategy===1?new THREE.OctahedronGeometry(.65):new THREE.TorusGeometry(.65,.1,6,16),m,0,3.4,0);if(strategy===2)crown.rotation.y=Math.PI/2;
 mesh(new THREE.ConeGeometry(.38,.55,8),ivory,0,3.85,0);return finish();

}
