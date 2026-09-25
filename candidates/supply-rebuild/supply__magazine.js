export default function generate(THREE){
 const root=new THREE.Group();
 const mat=(name,color,roughness,metalness)=>{const m=new THREE.MeshStandardMaterial({color,roughness,metalness});m.name=name;return m;};
 const shell=mat('case',0xc6cccb,.38,.65),dark=mat('metal',0x253139,.58,.7),rubber=mat('rubber',0x131a1c,.9,0),signal=mat('signal',0x64f5d5,.25,.35);signal.emissive.setHex(0x64f5d5);signal.emissiveIntensity=1.8;
 const add=(geo,m,x,y,z)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);root.add(o);return o;};
 const box=(x,y,z,w,h,d,m)=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const cyl=(x,y,z,r,h,m,n=12)=>add(new THREE.CylinderGeometry(r,r,h,n),m,x,y,z);
// Radial magazine: six exposed pressure vessels mounted between hexagonal manifolds.
 cyl(0,.24,0,2.15,.48,dark,6);cyl(0,2.65,0,2.15,.4,shell,6);cyl(0,1.4,0,.5,2.5,dark);
 for(let i=0;i<6;i++){const a=i*Math.PI/3,x=Math.sin(a)*1.32,z=Math.cos(a)*1.32;cyl(x,1.45,z,.47,2.1,shell);for(const y of [.65,2.2])cyl(x,y,z,.52,.15,dark);cyl(x,1.5,z,.48,.75,signal);cyl(x,2.95,z,.18,.35,dark,8);}
 cyl(0,2.96,0,.7,.32,dark,8);cyl(0,3.2,0,.38,.17,signal,8);

 const bounds=new THREE.Box3(),v=new THREE.Vector3();root.updateMatrixWorld(true);root.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)bounds.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});const c=bounds.getCenter(new THREE.Vector3());root.children.forEach(o=>{o.position.x-=c.x;o.position.y-=bounds.min.y;o.position.z-=c.z;});return root;
}
