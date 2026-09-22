export default function generate(THREE){
 const strategy=1;

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

 const trunkH=8+strategy;
 rod([0,0,0],[.5,trunkH,0],.63,bark,9);
 for(let i=0;i<9;i++){const a=i/9*Math.PI*2;const dx=Math.cos(a),dz=Math.sin(a);if(strategy===1){const path=new THREE.QuadraticBezierCurve3(new THREE.Vector3(.2,4,0),new THREE.Vector3(dx*4,2,dz*4),new THREE.Vector3(dx*4,0,dz*4));mesh(new THREE.TubeGeometry(path,8,.18,5,false),bark);}else{rod([.2,3.5,0],[dx*2,2,dz*2],.24,bark);rod([dx*2,2,dz*2],[dx*4,0,dz*4],.18,bark);}}
 for(let i=0;i<8;i++){const a=i*2.4,r=3.5+(i%3),y=trunkH-1+(i%3)*1.2;const x=Math.cos(a)*r,z=Math.sin(a)*r;rod([.3,5,0],[x,y,z],.18,bark);const canopy=mesh(strategy===2?new THREE.SphereGeometry(1,9,6):new THREE.IcosahedronGeometry(1,1),leaf,x,y,z);canopy.scale.set(3.2,1.55,2.9);for(let k=0;k<4;k++){const small=mesh(new THREE.IcosahedronGeometry(1,0),leaf,x+Math.cos(k*2)*2,y+.4,z+Math.sin(k*2)*2);small.scale.set(1.5,.8,1.4);}}
 // Hanging roots and fine leaves break the silhouette at racing distance.
 for(let i=0;i<24;i++){const a=i*2.399,r=3+Math.sin(i*7)*2,x=Math.cos(a)*r,z=Math.sin(a)*r,y=trunkH+.5+Math.sin(i)*1.4;rod([x,y,z],[x+.2,y-2.4-(i%4)*.4,z+.1],.025,bark,4);}
 return finish();

}
