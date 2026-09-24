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

 const geo=new THREE.BoxGeometry(14,.6,17,1,1,1);const p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,p.getY(i)+(p.getZ(i)+8.5)*.16);geo.computeVertexNormals();mesh(geo,dark,0,.5,0);
 for(const s of [-1,1]){const rail=box(s*6.8,2.5,0,.35,.35,17,paint);rail.rotation.x=-.16;for(let i=0;i<4;i++)box(s*5.5,.3+i*.8,-6+i*4,.5,1+i*.8,.5,ivory);}
 for(let i=0;i<5;i++){const stripe=box(0,2.23+(-7+i*2.65)*.16,-7+i*2.65,11,.04,.45,ivory);stripe.rotation.x=-.16;}
 return finish();

}
