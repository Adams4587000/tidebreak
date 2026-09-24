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
// Extruded stepped bleacher section; repeated cantilever triangular roof frames.
 const pts=[[0,0],[24,0],[24,17]];for(let i=15;i>=0;i--){pts.push([i*1.5,(i+1)]);pts.push([i*1.5,i]);}profile(pts,58,stone);for(let i=0;i<16;i++)for(let z=-27;z<=27;z+=3)box(i*1.5+.5,i+1.2,z,.7,.2,1.9,dark);for(const z of [-27,-9,9,27]){rod([23,0,z],[23,23,z],.4);rod([23,22,z],[0,24,z],.15);rod([23,17,z],[0,24,z],.13);}const roof=box(12,24,0,26,.3,60,metal);roof.rotation.z=-.08;for(const z of [-22,22]){rod([23,22,z],[23,30,z],.15);box(23,30,z,1,2,6,signal);}

 const bounds=new THREE.Box3(),v=new THREE.Vector3();root.updateMatrixWorld(true);root.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)bounds.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});const c=bounds.getCenter(new THREE.Vector3());root.children.forEach(o=>{o.position.x-=c.x;o.position.y-=bounds.min.y;o.position.z-=c.z;});return root;
}