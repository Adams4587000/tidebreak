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

 mesh(new THREE.CylinderGeometry(4,6,3,12),stone,0,1.5,0);mesh(new THREE.CylinderGeometry(2.3,3.8,22,strategy===1?8:18),ivory,0,14,0);
 for(const y of [8,16,23])mesh(new THREE.CylinderGeometry(3.8-(y-3)*.069,3.8-(y-3)*.069,1.4,18),paint,0,y,0);
 mesh(new THREE.CylinderGeometry(4,4,1,18),dark,0,25,0);mesh(new THREE.CylinderGeometry(2.3,2.3,4,12),dark,0,27,0);
 const light=mat(0xffecc1,.2,.1);light.emissive.setHex(0xffcb78);light.emissiveIntensity=2;mesh(new THREE.CylinderGeometry(1.95,1.95,2.3,12),light,0,27,0);
 mesh(new THREE.ConeGeometry(3.2,3,16),paint,0,30.5,0);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;rod([Math.cos(a)*3.8,25,Math.sin(a)*3.8],[Math.cos(a)*3.8,27,Math.sin(a)*3.8],.06,dark);}mesh(new THREE.TorusGeometry(3.8,.065,5,24),dark,0,27,0).rotation.x=Math.PI/2;return finish();

}
