export default function generate(THREE){
 const root=new THREE.Group();
 const mat=(name,c,r=.8,m=.1)=>{const a=new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});a.name=name;return a;};
 const stone=mat('stone',0x7f8178),metal=mat('metal',0x4a4b44,.65,.65),rust=mat('paint',0x79503b,.82,.4),dark=mat('metal',0x252b2a,.65,.5);
 const glow=mat('lava',0x8d2608,.8,0);glow.emissive.setHex(0xff480c);glow.emissiveIntensity=2;
 const mesh=(g,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;root.add(o);return o;};
 const box=(x,y,z,w,h,d,m=stone)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const rod=(a,b,r,m=metal)=>{const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),v=q.clone().sub(p),o=mesh(new THREE.CylinderGeometry(r,r,v.length(),6),m);o.position.copy(p.add(q).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;};

 // Open central span, pressure towers, maintenance deck, floodgate hoists and pipe banks.
 for(const s of [-1,1]){box(s*36,18,0,15,36,19);box(s*36,38,0,18,4,23);for(let j=0;j<6;j++){box(s*36,6+j*5,9.6,12,.25,.3,dark);box(s*36,6+j*5,-9.6,12,.25,.3,dark);}for(let j=0;j<3;j++){mesh(new THREE.CylinderGeometry(1.1,1.1,28,12),rust,s*(31+j*4),17,-11);mesh(new THREE.TorusGeometry(1.2,.18,6,16),metal,s*(31+j*4),5,-11).rotation.x=Math.PI/2;}}
 box(0,29,0,58,5,12);box(0,33.5,0,90,.7,16);for(const z of [-7.5,7.5]){rod([-44,36,z],[44,36,z],.12);for(let x=-44;x<45;x+=4)rod([x,34,z],[x,36,z],.09);}
 for(const x of [-21,0,21]){box(x,36,0,6,4,8,metal);mesh(new THREE.CylinderGeometry(1.5,1.5,7,16).rotateX(Math.PI/2),rust,x,38,0);rod([x,26,3],[x,18,3],.12);}
 
 const bounds=new THREE.Box3(),v=new THREE.Vector3();root.updateMatrixWorld(true);root.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)bounds.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});const c=bounds.getCenter(new THREE.Vector3());root.children.forEach(o=>{o.position.x-=c.x;o.position.y-=bounds.min.y;o.position.z-=c.z;});return root;
}