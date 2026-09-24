export default function generate(THREE){
 const root=new THREE.Group();
 const mat=(name,color,roughness=.7,metalness=0)=>{const m=new THREE.MeshStandardMaterial({color,roughness,metalness});m.name=name;return m;};
 const stone=mat('stone',0x575b59,.9),metal=mat('metal',0x282e30,.65,.6),light=mat('signal',0xe5e6d9,.5);light.emissive.setHex(0xe5e6d9);light.emissiveIntensity=.7;
 const add=(geometry,material,x=0,y=0,z=0,name='')=>{const o=new THREE.Mesh(geometry,material);o.position.set(x,y,z);o.name=name;o.castShadow=o.receiveShadow=true;root.add(o);return o;};
 const box=(x,y,z,w,h,d,m=stone,name='')=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z,name);
const glow=mat('signal',0xff5266,.3,.45);glow.emissive.copy(glow.color);glow.emissiveIntensity=1;
 add(new THREE.TorusGeometry(1.5,.12,6,3),glow,0,2,0,'ring');
 add(new THREE.IcosahedronGeometry(.8,0),glow,0,2,0,'core');
 add(new THREE.CylinderGeometry(.8,1.1,.4,10),mat('metal',0x252b29),0,.15,0,'base');
 const bounds=new THREE.Box3(),v=new THREE.Vector3();root.updateMatrixWorld(true);root.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)bounds.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});const c=bounds.getCenter(new THREE.Vector3());root.children.forEach(o=>{o.position.x-=c.x;o.position.y-=bounds.min.y;o.position.z-=c.z;});return root;
}