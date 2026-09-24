export default function generate(THREE){
 const root=new THREE.Group();
 const mat=(name,c,r=.8,m=.1)=>{const a=new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});a.name=name;return a;};
 const stone=mat('stone',0x7f8178),metal=mat('metal',0x4a4b44,.65,.65),rust=mat('paint',0x79503b,.82,.4),dark=mat('metal',0x252b2a,.65,.5);
 const glow=mat('lava',0x8d2608,.8,0);glow.emissive.setHex(0xff480c);glow.emissiveIntensity=2;
 const mesh=(g,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;root.add(o);return o;};
 const box=(x,y,z,w,h,d,m=stone)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const rod=(a,b,r,m=metal)=>{const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),v=q.clone().sub(p),o=mesh(new THREE.CylinderGeometry(r,r,v.length(),6),m);o.position.copy(p.add(q).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;};

 // Ribbed open ship hull with collapsed deckhouse; deck gaps expose the framing.
 const shape=new THREE.Shape();shape.moveTo(-5,-17);shape.lineTo(-6,10);shape.quadraticCurveTo(-5,20,0,24);shape.quadraticCurveTo(5,20,6,10);shape.lineTo(5,-17);shape.closePath();
 const hull=new THREE.ExtrudeGeometry(shape,{depth:.5,bevelEnabled:false});hull.rotateX(Math.PI/2);mesh(hull,rust,0,3,0);
 for(const s of [-1,1]){for(let j=0;j<16;j++){const z=-18+j*2.4,x=s*(z>10?6-(z-10)*.24:5.7);rod([x*.5,1,z],[x,6,z],.18);rod([x,6,z],[x,8,z],.075);if(j%5!==2)box(x,5.2,z,.25,3,2.3,rust);}}
 box(0,4.2,-8,9,.5,13,dark);box(0,7,-10,7,5,7,rust);box(0,10,-10,8,.35,8,metal);for(const x of [-2.5,0,2.5])box(x,8,-6.45,1.9,1.4,.08,dark);
 for(const s of [-1,1]){rod([s*3.3,10,-10],[s*3.3,16,-10],.12);rod([s*3.3,16,-10],[-s*3.3,16,-10],.1);}
 rod([0,10,-12],[0,23,-9],.22);rod([0,20,-9],[0,16,8],.06);for(let j=0;j<5;j++)box(-2+j,4.65,0,.9,.2,6,metal);
 for(let j=0;j<6;j++){const o=box(Math.sin(j*3)*3,4.7,5+j,2,.25,4,rust);o.rotation.y=j*.7;o.rotation.z=.2;}
 
 const bounds=new THREE.Box3(),v=new THREE.Vector3();root.updateMatrixWorld(true);root.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)bounds.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});const c=bounds.getCenter(new THREE.Vector3());root.children.forEach(o=>{o.position.x-=c.x;o.position.y-=bounds.min.y;o.position.z-=c.z;});return root;
}