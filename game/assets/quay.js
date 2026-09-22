// Original modular waterfront, constructed in metres. Canal-facing edge is -X.
export default function generate(THREE){
 const g=new THREE.Group();
 const stone=new THREE.MeshStandardMaterial({color:0xb0a48c,roughness:.92});stone.name='stone';
 const metal=new THREE.MeshStandardMaterial({color:0x243a3d,roughness:.55,metalness:.35});metal.name='metal';
 const paint=new THREE.MeshStandardMaterial({color:0xb65736,roughness:.64,metalness:.2});paint.name='paint';
 const teal=new THREE.MeshStandardMaterial({color:0x316267,roughness:.63,metalness:.2});
 const glass=new THREE.MeshStandardMaterial({color:0x10292f,roughness:.2,metalness:.65});
 function box(x,y,z,w,h,d,m){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o;}
 box(0,0,0,44,7,38,stone);box(-20.7,3.65,0,2.7,.4,38,stone);
 for(let z=-17;z<=17;z+=4.25){box(-22.2,.5,z,.6,6,.7,metal);const tire=new THREE.Mesh(new THREE.TorusGeometry(.7,.23,6,14),metal);tire.position.set(-22.7,.8,z);tire.rotation.y=Math.PI/2;g.add(tire);box(-19.5,4.2,z,.2,1.2,.2,metal);box(-19.5,4.75,z,.18,.18,4.25,metal);}
 // Ribbed shipping containers and an articulated sawtooth warehouse roof.
 for(let k=0;k<3;k++){const x=-12+k*8,z=(k%2)*8-4,m=k%2?teal:paint;box(x,5.2,z,5.2,3.4,12,m);box(x,7,z,5.4,.18,12.1,metal);for(let r=0;r<13;r++)box(x-2.64,5.2,z-5.5+r*.9,.1,3,.12,metal);for(const q of [-1,1])box(x+q*2,5.2,z-6.05,.09,3,.1,metal);}
 box(12,10,0,16,13,35,stone);for(let z=-15;z<16;z+=5){box(3.85,11,z,.2,5,3.6,glass);box(3.7,9.5,z,.3,.2,3.8,metal);const roof=box(12,17.6,z,17,.35,5.3,metal);roof.rotation.x=.16;}
 for(let z=-12;z<=12;z+=12){box(-17,8.8,z,.18,10.5,.18,metal);box(-15.5,14,z,3.2,.2,.2,metal);box(-14,13.8,z,.7,.18,.6,new THREE.MeshStandardMaterial({color:0xffd492,emissive:0xffbf70,emissiveIntensity:.5}));}
 for(let z=-15;z<=15;z+=5){box(20.08,10,z,.2,4,3.6,glass);box(20.22,10,z,.25,.2,3.8,metal);box(20.22,10,z,.25,4,.13,metal);}
 g.children.forEach(o=>o.position.y+=3.5);g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return g;
}
