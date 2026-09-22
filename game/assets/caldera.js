export default function generate(THREE){
 const root=new THREE.Group();
 const mat=(name,c,r=.8,m=.1)=>{const a=new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});a.name=name;return a;};
 const stone=mat('stone',0x7f8178),metal=mat('metal',0x4a4b44,.65,.65),rust=mat('paint',0x79503b,.82,.4),dark=mat('metal',0x252b2a,.65,.5);
 const glow=mat('lava',0x8d2608,.8,0);glow.emissive.setHex(0xff480c);glow.emissiveIntensity=2;
 const mesh=(g,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;root.add(o);return o;};
 const box=(x,y,z,w,h,d,m=stone)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const rod=(a,b,r,m=metal)=>{const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),v=q.clone().sub(p),o=mesh(new THREE.CylinderGeometry(r,r,v.length(),6),m);o.position.copy(p.add(q).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;};

 // Eroded crater with basalt strata and lava veins confined to land.
 const g=new THREE.CylinderGeometry(10,45,42,48,14,true),p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z,x),f=1+.09*Math.sin(a*7+y*.21)+.05*Math.cos(a*13-y*.4);p.setXYZ(i,x*f,y+Math.sin(a*9)*1.3,z*f);}g.computeVertexNormals();stone.side=THREE.DoubleSide;mesh(g,stone,0,21,0);
 mesh(new THREE.TorusGeometry(10,.9,6,48),glow,0,41,0).rotation.x=Math.PI/2;mesh(new THREE.CircleGeometry(9.7,48),glow,0,39.9,0).rotation.x=-Math.PI/2;
 for(let j=0;j<9;j++){const a=j*.71;const pts=[];for(let k=0;k<14;k++){const y=3+k*2.5,r=45-y*.8,theta=a+Math.sin(k*.8+j)*.035;pts.push(new THREE.Vector3(Math.cos(theta)*r,y,Math.sin(theta)*r));}mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),28,.22,5,false),glow);}
 for(let j=0;j<32;j++){const a=j*2.399,r=20+(j%6)*5;const o=mesh(new THREE.CylinderGeometry(1.2,1.9,4+j%9,6),stone,Math.cos(a)*r,3,Math.sin(a)*r);o.rotation.z=Math.sin(j)*.14;}
 
 const bounds=new THREE.Box3(),v=new THREE.Vector3();root.updateMatrixWorld(true);root.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)bounds.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});const c=bounds.getCenter(new THREE.Vector3());root.children.forEach(o=>{o.position.x-=c.x;o.position.y-=bounds.min.y;o.position.z-=c.z;});return root;
}