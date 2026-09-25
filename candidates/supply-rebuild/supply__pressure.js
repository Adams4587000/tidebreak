export default function generate(THREE){
 const root=new THREE.Group();
 const mat=(name,color,roughness,metalness)=>{const m=new THREE.MeshStandardMaterial({color,roughness,metalness});m.name=name;return m;};
 const shell=mat('case',0xc6cccb,.38,.65),dark=mat('metal',0x253139,.58,.7),rubber=mat('rubber',0x131a1c,.9,0),signal=mat('signal',0x64f5d5,.25,.35);signal.emissive.setHex(0x64f5d5);signal.emissiveIntensity=1.8;
 const add=(geo,m,x,y,z)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);root.add(o);return o;};
 const box=(x,y,z,w,h,d,m)=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const cyl=(x,y,z,r,h,m,n=12)=>add(new THREE.CylinderGeometry(r,r,h,n),m,x,y,z);
// Spherical pressure vessel in an external exoskeleton cradle with equatorial flange.
 const body=add(new THREE.SphereGeometry(1.45,20,12),shell,0,1.7,0);body.scale.y=.85;
 for(const y of [.65,2.75])cyl(0,y,0,.8,.25,dark,12);
 const flange=add(new THREE.TorusGeometry(1.48,.14,6,24),dark,0,1.7,0);flange.rotation.x=Math.PI/2;
 for(let i=0;i<4;i++){const a=i*Math.PI/2,x=Math.sin(a)*1.7,z=Math.cos(a)*1.7;box(x,.2,z,.65,.4,.65,rubber);cyl(x,1.35,z,.14,2.4,dark,8);add(new THREE.SphereGeometry(.24,8,6),signal,x,2.6,z);}
 cyl(0,3.1,0,.4,.5,dark);cyl(0,3.4,0,.65,.15,signal);
 for(const z of [-1.3,1.3]){const port=cyl(0,1.7,z,.55,.45,dark);port.rotation.x=Math.PI/2;const lens=cyl(0,1.7,z*1.18,.4,.1,signal);lens.rotation.x=Math.PI/2;}

 const bounds=new THREE.Box3(),v=new THREE.Vector3();root.updateMatrixWorld(true);root.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)bounds.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});const c=bounds.getCenter(new THREE.Vector3());root.children.forEach(o=>{o.position.x-=c.x;o.position.y-=bounds.min.y;o.position.z-=c.z;});return root;
}
