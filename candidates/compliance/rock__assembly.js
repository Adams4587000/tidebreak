export default function generate(THREE){
 const root=new THREE.Group();
 const material=(name,color,r=.75,m=.15)=>{const a=new THREE.MeshStandardMaterial({color,roughness:r,metalness:m});a.name=name;return a;};
 const stone=material('stone',0x77796f,.92,0),metal=material('metal',0x596168,.6,.6),dark=material('carbon',0x252b2a,.8,.3),paint=material('paint',0xad5535,.7,.4),leaf=material('foliage',0x626e4c,.95,0),bark=material('timber',0x554e40,.9,0),signal=material('signal',0x9dcab8,.45);signal.emissive.setHex(0x83b9aa);signal.emissiveIntensity=.7;
 const add=(geo,m,x=0,y=0,z=0,parent=root)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;};
 const box=(x,y,z,w,h,d,m=stone,p=root)=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z,p);
 const rod=(a,b,r,m=metal,p=root,top=r)=>{const x=new THREE.Vector3(...a),y=new THREE.Vector3(...b),v=y.clone().sub(x),o=add(new THREE.CylinderGeometry(top,r,v.length(),8),m,0,0,0,p);o.position.copy(x.add(y).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;};
 const profile=(pts,depth,m=stone,x=0,y=0,z=0,p=root)=>{const s=new THREE.Shape();pts.forEach((q,i)=>i?s.lineTo(...q):s.moveTo(...q));s.closePath();const geo=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:false});geo.translate(0,0,-depth/2);return add(geo,m,x,y,z,p);};
 const lathe=(pts,m=metal,x=0,y=0,z=0,p=root)=>add(new THREE.LatheGeometry(pts.map(q=>new THREE.Vector2(...q)),20),m,x,y,z,p);
 const ball=(x,y,z,a,b,c,m=stone,p=root)=>{const o=add(new THREE.SphereGeometry(1,14,9),m,x,y,z,p);o.scale.set(a,b,c);return o;};
 const tube=(pts,r,m=metal,p=root)=>add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(q=>new THREE.Vector3(...q))),16,r,6,false),m,0,0,0,p);
// Segmented columnar jointing, separate split blocks; not a displaced solid.
 for(let i=0;i<37;i++){const a=i*2.399,r=Math.sqrt(i/37)*6,h=8+10*(1-r/9)+Math.sin(i*3)*2,x=Math.cos(a)*r,z=Math.sin(a)*r;add(new THREE.CylinderGeometry(.8,1.05,h,6),stone,x,h/2,z);for(let j=0;j<3;j++)add(new THREE.CylinderGeometry(.83,1,.17,6),dark,x,h*(.2+j*.24),z);}for(let i=0;i<15;i++){const a=i*2.1,o=box(Math.cos(a)*7,1,Math.sin(a)*5,2,2.1,2.8);o.rotation.set(i*.1,i*.7,i*.13);}

 const bounds=new THREE.Box3(),v=new THREE.Vector3();root.updateMatrixWorld(true);root.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)bounds.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});const c=bounds.getCenter(new THREE.Vector3());root.children.forEach(o=>{o.position.x-=c.x;o.position.y-=bounds.min.y;o.position.z-=c.z;});return root;
}