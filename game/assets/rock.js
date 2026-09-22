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

 const geo=strategy===0?new THREE.IcosahedronGeometry(1,8):strategy===1?new THREE.DodecahedronGeometry(1,1):new THREE.SphereGeometry(1,13,9);
 const p=geo.attributes.position;for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);const n=1+.13*Math.sin(x*9+z*8)*Math.cos(y*11)+.07*Math.sin(z*17-y*9);p.setXYZ(i,x*n*7,y*n*10+Math.sin(z*12+x*8)*.2,z*n*6);}geo.computeVertexNormals();const normals=geo.attributes.normal,merged=new Map();for(let i=0;i<p.count;i++){const key=[p.getX(i).toFixed(4),p.getY(i).toFixed(4),p.getZ(i).toFixed(4)].join(',');const n=merged.get(key)||new THREE.Vector3();n.x+=normals.getX(i);n.y+=normals.getY(i);n.z+=normals.getZ(i);merged.set(key,n);}for(let i=0;i<p.count;i++){const key=[p.getX(i).toFixed(4),p.getY(i).toFixed(4),p.getZ(i).toFixed(4)].join(',');const n=merged.get(key).clone().normalize();normals.setXYZ(i,n.x,n.y,n.z);}stone.color.setHex(0x666960);stone.flatShading=false;mesh(geo,stone,0,7,0);
 for(let i=0;i<5;i++){const a=i*2.4;const o=mesh(new THREE.CylinderGeometry(1.5,2,5+i,5),stone,Math.cos(a)*5,3,Math.sin(a)*4);o.rotation.z=.15*Math.sin(i);}
 return finish();

}
