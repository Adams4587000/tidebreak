export default function generate(THREE){
 const root=new THREE.Group();
 const mat=(name,c,r=.8,m=.1)=>{const a=new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});a.name=name;return a;};
 const stone=mat('stone',0x7f8178),metal=mat('metal',0x4a4b44,.65,.65),rust=mat('paint',0x79503b,.82,.4),dark=mat('metal',0x252b2a,.65,.5);
 const glow=mat('lava',0x8d2608,.8,0);glow.emissive.setHex(0xff480c);glow.emissiveIntensity=2;
 const mesh=(g,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;root.add(o);return o;};
 const box=(x,y,z,w,h,d,m=stone)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const rod=(a,b,r,m=metal)=>{const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),v=q.clone().sub(p),o=mesh(new THREE.CylinderGeometry(r,r,v.length(),6),m);o.position.copy(p.add(q).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;};

 // Bank-aligned stepped grandstand, aisle rails, cantilever roof and floodlights.
 for(let r=0;r<16;r++){box(r*1.4,1+r*.95,0,1.6,.7,57);for(let j=0;j<26;j++){if((j+r)%13===0)continue;box(r*1.4,1.56+r*.95,-27+j*2.1,.8,.18,1.2,(j+r)%5===0?rust:dark);}}
 for(const z of [-28,-10,10,28]){rod([-1,2,z],[23,18,z],.07);for(let r=0;r<8;r++)rod([r*3,1+r*2,z],[r*3,3+r*2,z],.07);box(22,9,z,1.2,18,1.2);rod([22,18,z],[2,22,z],.2);rod([22,12,z],[7,21,z],.16);}
 for(let z=-27;z<=27;z+=6){const roof=box(12,22,z,24,.25,5.8,metal);roof.rotation.z=-.13;}
 for(let z=-26;z<=26;z+=7){box(23,5,z,1,10,1);box(23.55,8,z,.25,3.5,3,dark);rod([23.7,1,z],[23.7,13,z+5],.12);rod([23.7,13,z],[23.7,1,z+5],.12);}
 for(let z=-24;z<=24;z+=8){box(23.7,6,z,.3,5,4,rust);for(let k=0;k<8;k++)box(23.9,4+k*.52,z,.16,.18,3.8,dark);rod([23.8,14,z],[23.8,14,z+6],.09);rod([23.8,11,z],[23.8,14,z],.09);box(12,23,z,4,1.4,3,dark);for(let k=0;k<5;k++)box(10.4+k*.8,23.76,z,.2,.13,2.8,metal);}
 for(let k=0;k<18;k++){box(25,1+k*.7,-25+k*.7,3,.22,.9,stone);rod([26.4,2+k*.7,-25+k*.7],[26.4,3+k*.7,-25+k*.7],.055);}
 for(const z of [-21,21]){rod([18,18,z],[18,30,z],.2);box(18,29,z,1,2,7,dark);for(let j=0;j<5;j++){const lamp=mat('lamp',0xd3d0b7,.4,0);lamp.emissive.setHex(0xb6bfac);lamp.emissiveIntensity=.6;box(17.44,29,z-2.6+j*1.3,.08,1,1,lamp);}}
 
 const bounds=new THREE.Box3(),v=new THREE.Vector3();root.updateMatrixWorld(true);root.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)bounds.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});const c=bounds.getCenter(new THREE.Vector3());root.children.forEach(o=>{o.position.x-=c.x;o.position.y-=bounds.min.y;o.position.z-=c.z;});return root;
}