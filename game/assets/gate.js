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

 for(const side of [-1,1]){box(side*19,12,0,6,24,9,stone);box(side*19,25,0,7,2,10,ivory);for(let y=3;y<24;y+=5)box(side*19,y,4.6,5,.45,.5,dark);box(side*19,20,4.8,2,4,.4,paint);}
 box(0,24,0,43,3,7,stone);box(0,26,0,45,.5,8,ivory);
 for(let x=-19;x<=19;x+=4){box(x,28,3.3,.12,3,.12,dark);box(x,28,-3.3,.12,3,.12,dark);}
 rod([-20,29,3.3],[20,29,3.3],.08,dark);rod([-20,29,-3.3],[20,29,-3.3],.08,dark);
 if(strategy===1){const a=mesh(new THREE.TorusGeometry(18,1.2,5,24,Math.PI),ivory,0,5,0);a.rotation.z=0;}else if(strategy===2){for(const s of [-1,1])rod([s*18,4,0],[s*6,24,0],1.2,ivory);}
 return finish();

}
