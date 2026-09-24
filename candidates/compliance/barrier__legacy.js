export default function generate(THREE){
 const root=new THREE.Group();
 const mat=(name,color,roughness=.7,metalness=0)=>{const m=new THREE.MeshStandardMaterial({color,roughness,metalness});m.name=name;return m;};
 const stone=mat('stone',0x575b59,.9),metal=mat('metal',0x282e30,.65,.6),light=mat('signal',0xe5e6d9,.5);light.emissive.setHex(0xe5e6d9);light.emissiveIntensity=.7;
 const add=(geometry,material,x=0,y=0,z=0,name='')=>{const o=new THREE.Mesh(geometry,material);o.position.set(x,y,z);o.name=name;o.castShadow=o.receiveShadow=true;root.add(o);return o;};
 const box=(x,y,z,w,h,d,m=stone,name='')=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z,name);
box(0,1,0,12,2,5);
 const bounds=new THREE.Box3(),v=new THREE.Vector3();root.updateMatrixWorld(true);root.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)bounds.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});const c=bounds.getCenter(new THREE.Vector3());root.children.forEach(o=>{o.position.x-=c.x;o.position.y-=bounds.min.y;o.position.z-=c.z;});return root;
}