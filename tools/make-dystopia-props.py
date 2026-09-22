from pathlib import Path
head='''export default function generate(THREE){
 const root=new THREE.Group();
 const mat=(name,c,r=.8,m=.1)=>{const a=new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});a.name=name;return a;};
 const stone=mat('stone',0x7f8178),metal=mat('metal',0x4a4b44,.65,.65),rust=mat('paint',0x79503b,.82,.4),dark=mat('metal',0x252b2a,.65,.5);
 const glow=mat('lava',0x8d2608,.8,0);glow.emissive.setHex(0xff480c);glow.emissiveIntensity=2;
 const mesh=(g,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;root.add(o);return o;};
 const box=(x,y,z,w,h,d,m=stone)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const rod=(a,b,r,m=metal)=>{const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),v=q.clone().sub(p),o=mesh(new THREE.CylinderGeometry(r,r,v.length(),6),m);o.position.copy(p.add(q).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;};
'''
foot='''
 const bounds=new THREE.Box3(),v=new THREE.Vector3();root.updateMatrixWorld(true);root.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)bounds.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});const c=bounds.getCenter(new THREE.Vector3());root.children.forEach(o=>{o.position.x-=c.x;o.position.y-=bounds.min.y;o.position.z-=c.z;});return root;
}'''
props={
'stadium': '''
 // Bank-aligned stepped grandstand, aisle rails, cantilever roof and floodlights.
 for(let r=0;r<16;r++){box(r*1.4,1+r*.95,0,1.6,.7,57);for(let j=0;j<26;j++){if((j+r)%13===0)continue;box(r*1.4,1.56+r*.95,-27+j*2.1,.8,.18,1.2,(j+r)%5===0?rust:dark);}}
 for(const z of [-28,-10,10,28]){rod([-1,2,z],[23,18,z],.07);for(let r=0;r<8;r++)rod([r*3,1+r*2,z],[r*3,3+r*2,z],.07);box(22,9,z,1.2,18,1.2);rod([22,18,z],[2,22,z],.2);rod([22,12,z],[7,21,z],.16);}
 for(let z=-27;z<=27;z+=6){const roof=box(12,22,z,24,.25,5.8,metal);roof.rotation.z=-.13;}
 for(let z=-26;z<=26;z+=7){box(23,5,z,1,10,1);box(23.55,8,z,.25,3.5,3,dark);rod([23.7,1,z],[23.7,13,z+5],.12);rod([23.7,13,z],[23.7,1,z+5],.12);}
 for(let z=-24;z<=24;z+=8){box(23.7,6,z,.3,5,4,rust);for(let k=0;k<8;k++)box(23.9,4+k*.52,z,.16,.18,3.8,dark);rod([23.8,14,z],[23.8,14,z+6],.09);rod([23.8,11,z],[23.8,14,z],.09);box(12,23,z,4,1.4,3,dark);for(let k=0;k<5;k++)box(10.4+k*.8,23.76,z,.2,.13,2.8,metal);}
 for(let k=0;k<18;k++){box(25,1+k*.7,-25+k*.7,3,.22,.9,stone);rod([26.4,2+k*.7,-25+k*.7],[26.4,3+k*.7,-25+k*.7],.055);}
 for(const z of [-21,21]){rod([18,18,z],[18,30,z],.2);box(18,29,z,1,2,7,dark);for(let j=0;j<5;j++){const lamp=mat('lamp',0xd3d0b7,.4,0);lamp.emissive.setHex(0xb6bfac);lamp.emissiveIntensity=.6;box(17.44,29,z-2.6+j*1.3,.08,1,1,lamp);}}
 ''',
'wreck': '''
 // Ribbed open ship hull with collapsed deckhouse; deck gaps expose the framing.
 const shape=new THREE.Shape();shape.moveTo(-5,-17);shape.lineTo(-6,10);shape.quadraticCurveTo(-5,20,0,24);shape.quadraticCurveTo(5,20,6,10);shape.lineTo(5,-17);shape.closePath();
 const hull=new THREE.ExtrudeGeometry(shape,{depth:.5,bevelEnabled:false});hull.rotateX(Math.PI/2);mesh(hull,rust,0,3,0);
 for(const s of [-1,1]){for(let j=0;j<16;j++){const z=-18+j*2.4,x=s*(z>10?6-(z-10)*.24:5.7);rod([x*.5,1,z],[x,6,z],.18);rod([x,6,z],[x,8,z],.075);if(j%5!==2)box(x,5.2,z,.25,3,2.3,rust);}}
 box(0,4.2,-8,9,.5,13,dark);box(0,7,-10,7,5,7,rust);box(0,10,-10,8,.35,8,metal);for(const x of [-2.5,0,2.5])box(x,8,-6.45,1.9,1.4,.08,dark);
 for(const s of [-1,1]){rod([s*3.3,10,-10],[s*3.3,16,-10],.12);rod([s*3.3,16,-10],[-s*3.3,16,-10],.1);}
 rod([0,10,-12],[0,23,-9],.22);rod([0,20,-9],[0,16,8],.06);for(let j=0;j<5;j++)box(-2+j,4.65,0,.9,.2,6,metal);
 for(let j=0;j<6;j++){const o=box(Math.sin(j*3)*3,4.7,5+j,2,.25,4,rust);o.rotation.y=j*.7;o.rotation.z=.2;}
 ''',
'spillway': '''
 // Open central span, pressure towers, maintenance deck, floodgate hoists and pipe banks.
 for(const s of [-1,1]){box(s*36,18,0,15,36,19);box(s*36,38,0,18,4,23);for(let j=0;j<6;j++){box(s*36,6+j*5,9.6,12,.25,.3,dark);box(s*36,6+j*5,-9.6,12,.25,.3,dark);}for(let j=0;j<3;j++){mesh(new THREE.CylinderGeometry(1.1,1.1,28,12),rust,s*(31+j*4),17,-11);mesh(new THREE.TorusGeometry(1.2,.18,6,16),metal,s*(31+j*4),5,-11).rotation.x=Math.PI/2;}}
 box(0,29,0,58,5,12);box(0,33.5,0,90,.7,16);for(const z of [-7.5,7.5]){rod([-44,36,z],[44,36,z],.12);for(let x=-44;x<45;x+=4)rod([x,34,z],[x,36,z],.09);}
 for(const x of [-21,0,21]){box(x,36,0,6,4,8,metal);mesh(new THREE.CylinderGeometry(1.5,1.5,7,16).rotateX(Math.PI/2),rust,x,38,0);rod([x,26,3],[x,18,3],.12);}
 ''',
'caldera': '''
 // Eroded crater with basalt strata and lava veins confined to land.
 const g=new THREE.CylinderGeometry(10,45,42,48,14,true),p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z,x),f=1+.09*Math.sin(a*7+y*.21)+.05*Math.cos(a*13-y*.4);p.setXYZ(i,x*f,y+Math.sin(a*9)*1.3,z*f);}g.computeVertexNormals();stone.side=THREE.DoubleSide;mesh(g,stone,0,21,0);
 mesh(new THREE.TorusGeometry(10,.9,6,48),glow,0,41,0).rotation.x=Math.PI/2;mesh(new THREE.CircleGeometry(9.7,48),glow,0,39.9,0).rotation.x=-Math.PI/2;
 for(let j=0;j<9;j++){const a=j*.71;const pts=[];for(let k=0;k<14;k++){const y=3+k*2.5,r=45-y*.8,theta=a+Math.sin(k*.8+j)*.035;pts.push(new THREE.Vector3(Math.cos(theta)*r,y,Math.sin(theta)*r));}mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),28,.22,5,false),glow);}
 for(let j=0;j<32;j++){const a=j*2.399,r=20+(j%6)*5;const o=mesh(new THREE.CylinderGeometry(1.2,1.9,4+j%9,6),stone,Math.cos(a)*r,3,Math.sin(a)*r);o.rotation.z=Math.sin(j)*.14;}
 '''}
for n,s in props.items():Path('game/assets/'+n+'.js').write_text(head+s+foot)
