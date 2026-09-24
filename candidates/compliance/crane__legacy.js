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

 box(0,1,0,13,2,13,stone);box(0,2.3,0,11,.5,11,ivory);
 for(const x of [-4,4])for(const z of [-4,4]){box(x,11,z,.8,18,.8,paint);if(strategy===1)rod([x,3,z],[x*.2,20,z*.2],.45,paint);}
 for(let y=4;y<20;y+=4){for(const z of [-4,4]){rod([-4,y,z],[4,y+4,z],.14,dark);rod([4,y,z],[-4,y+4,z],.14,dark);}for(const x of [-4,4])rod([x,y,-4],[x,y+4,4],.14,dark);}
 box(0,21,0,11,2,11,paint);box(1.8,23,2,4,3,4,ivory);box(1.8,23.4,4.04,3,1.5,.08,dark);
 box(0,25,5,2.1,1,36,paint);for(let z=-12;z<22;z+=3){rod([-1,25,z],[1,28,z+3],.13,dark);rod([1,25,z],[-1,28,z+3],.13,dark);}
 rod([0,28,-9],[0,35,-3],.25,paint);rod([0,35,-3],[0,26,20],.055,dark);rod([0,25,18],[0,8,18],.045,dark);box(0,7.5,18,3,1,2,dark);
 return finish();

}
