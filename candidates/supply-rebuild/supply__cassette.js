export default function generate(THREE){
 const root=new THREE.Group();
 const mat=(name,color,roughness,metalness)=>{const m=new THREE.MeshStandardMaterial({color,roughness,metalness});m.name=name;return m;};
 const shell=mat('case',0xc6cccb,.38,.65),dark=mat('metal',0x253139,.58,.7),rubber=mat('rubber',0x131a1c,.9,0),signal=mat('signal',0x64f5d5,.25,.35);signal.emissive.setHex(0x64f5d5);signal.emissiveIntensity=1.8;
 const add=(geo,m,x,y,z)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);root.add(o);return o;};
 const box=(x,y,z,w,h,d,m)=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const cyl=(x,y,z,r,h,m,n=12)=>add(new THREE.CylinderGeometry(r,r,h,n),m,x,y,z);
// Armored rectangular field cassette, shock feet, twin pressure cells, corner tie rods.
 box(0,.3,0,4.3,.6,3.1,dark);box(0,2.7,0,4.3,.35,3.1,shell);
 for(const x of [-1.9,1.9])for(const z of [-1.3,1.3]){box(x,.12,z,.65,.24,.7,rubber);box(x,1.5,z,.32,2.6,.32,shell);cyl(x,2.95,z,.19,.2,dark,8);}
 for(const x of [-.95,.95]){cyl(x,1.5,0,.68,2.15,dark,16);for(const y of [.65,2.25])cyl(x,y,0,.73,.25,shell,16);for(const z of [-.65,.65])box(x,1.5,z,.5,1.15,.1,signal);cyl(x,2.55,0,.22,.35,shell);}
 for(const z of [-1.56,1.56]){box(0,1.43,z,3.6,.65,.12,dark);box(0,1.43,z*1.01,1.2,.2,.07,signal);for(const x of [-1.55,1.55])box(x,1.43,z*1.02,.25,.95,.15,shell);}
 for(const x of [-2.18,2.18]){box(x,1.5,0,.13,1.4,1.8,dark);for(const z of [-.55,0,.55])box(x*1.015,1.5,z,.06,1,.14,signal);}
 box(0,3.13,0,1.8,.18,.3,dark);for(const x of [-.8,.8])box(x,3,0,.18,.4,.3,dark);

 const bounds=new THREE.Box3(),v=new THREE.Vector3();root.updateMatrixWorld(true);root.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)bounds.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});const c=bounds.getCenter(new THREE.Vector3());root.children.forEach(o=>{o.position.x-=c.x;o.position.y-=bounds.min.y;o.position.z-=c.z;});return root;
}
