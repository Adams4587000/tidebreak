export default function generate(THREE){
 const root=new THREE.Group(),bark=new THREE.MeshStandardMaterial({color:0x5c5b47,roughness:.96}),leaves=[0x4b5b37,0x667348,0x394b32].map(color=>new THREE.MeshStandardMaterial({color,roughness:.9,side:THREE.DoubleSide}));bark.name='timber';leaves.forEach(m=>m.name='foliage');
 const mesh=(g,m)=>{const o=new THREE.Mesh(g,m);o.castShadow=o.receiveShadow=true;root.add(o);return o;};
 const tube=(pts,r,steps=12)=>mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p))),steps,r,5,false),bark);
 const branch=(a,b,r)=>{const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),d=q.clone().sub(p),o=mesh(new THREE.CylinderGeometry(r*.35,r,d.length(),7),bark);o.position.copy(p.add(q).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());};
 branch([0,0,0],[.5,9,0],.55);
 for(let i=0;i<11;i++){const a=i*2.399,x=Math.cos(a),z=Math.sin(a);tube([[.2,3.8,0],[x*1.8,2.6,z*1.8],[x*3.6,.5,z*3.6],[x*4.3,0,z*4.3]],.13);}
 const shape=new THREE.Shape();shape.moveTo(0,-.45);shape.quadraticCurveTo(.24,-.08,0,.45);shape.quadraticCurveTo(-.24,-.08,0,-.45);const leafGeo=new THREE.ShapeGeometry(shape,2);
 const p=leafGeo.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,.1*Math.sin(p.getY(i)*6));leafGeo.computeVertexNormals();
 for(let i=0;i<14;i++){const a=i*2.399,r=3+(i%4)*.65,x=Math.cos(a)*r,z=Math.sin(a)*r,y=7+(i%4)*.65;branch([.35,4.5,0],[x,y,z],.16);for(let j=0;j<4;j++){const t=j*1.6+i,bx=x+Math.cos(t)*1.5,bz=z+Math.sin(t)*1.5,by=y+.5;branch([x,y,z],[bx,by,bz],.06);for(let k=0;k<8;k++){const q=k*2.399+i,rr=.3+(k%4)*.36;const o=mesh(leafGeo,leaves[(i+j+k)%3]);o.position.set(bx+Math.sin(q)*rr,by+Math.cos(q*2)*.45,bz+Math.cos(q)*rr);o.rotation.set(-1.1+Math.sin(q)*.4,q,Math.sin(k)*.3);o.scale.setScalar(1.5+(k%3)*.3);}}if(i%2===0)tube([[x,y,z],[x+.1,y-2,z],[x+.2,y-4,z+.1]],.025,5);}
 const bounds=new THREE.Box3(),v=new THREE.Vector3();root.updateMatrixWorld(true);root.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)bounds.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});const c=bounds.getCenter(new THREE.Vector3());root.children.forEach(o=>{o.position.x-=c.x;o.position.y-=bounds.min.y;o.position.z-=c.z;});return root;
}
