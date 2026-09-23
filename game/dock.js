import * as THREE from 'three';
import {bakeStatic} from './assetlib.js';
export function createDock(){
 const group=new THREE.Group(),steel=new THREE.MeshStandardMaterial({color:0x1c3038,roughness:.65,metalness:.55}),black=new THREE.MeshStandardMaterial({color:0x0c1c25,roughness:.8}),white=new THREE.MeshBasicMaterial({color:0x71e7dc});
 function box(x,y,z,w,h,d,m=steel){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.receiveShadow=true;group.add(o);return o;}
 const floor=new THREE.Mesh(new THREE.CylinderGeometry(22,22,.3,80),black);floor.position.y=-.45;floor.receiveShadow=true;group.add(floor);
 for(const r of [5.7,6,10,17]){const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.018,4,100),white);ring.rotation.x=-Math.PI/2;ring.position.y=-.26;group.add(ring);}
 for(let i=-20;i<=20;i+=2){box(i,-.27,0,.016,.015,40);box(0,-.27,i,40,.015,.016);}
 for(const side of [-1,1]){for(const z of [-14,-7,0,7,14]){box(side*18,6,z,.6,12,.6);box(side*17.8,5,z,.04,7,.12,white);}box(side*18,12,0,.8,.8,30);}
 for(let i=-2;i<=2;i++){box(i*7,12,-14,5,.1,.2,white);box(i*7,0,-16,3,1,1);box(i*7,1,-16,2.8,.6,.8);}
 box(0,12,-14,36,.7,.8);const root=bakeStatic(group);root.visible=false;return root;
}
