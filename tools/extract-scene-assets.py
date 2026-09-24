"""One-time extraction of previously inline scenery into recipe-contract modules.
Coordinates preserve the approved build; placements supply the documented y offsets.
"""
from pathlib import Path
head='''export default function generate(THREE){
 const root=new THREE.Group();
 const mat=(name,color,roughness=.7,metalness=0)=>{const m=new THREE.MeshStandardMaterial({color,roughness,metalness});m.name=name;return m;};
 const stone=mat('stone',0x575b59,.9),metal=mat('metal',0x282e30,.65,.6),light=mat('signal',0xe5e6d9,.5);light.emissive.setHex(0xe5e6d9);light.emissiveIntensity=.7;
 const add=(geometry,material,x=0,y=0,z=0,name='')=>{const o=new THREE.Mesh(geometry,material);o.position.set(x,y,z);o.name=name;o.castShadow=o.receiveShadow=true;root.add(o);return o;};
 const box=(x,y,z,w,h,d,m=stone,name='')=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z,name);
'''
foot='''
 const bounds=new THREE.Box3(),v=new THREE.Vector3();root.updateMatrixWorld(true);root.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)bounds.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});const c=bounds.getCenter(new THREE.Vector3());root.children.forEach(o=>{o.position.x-=c.x;o.position.y-=bounds.min.y;o.position.z-=c.z;});return root;
}'''
items={
'edge-buoy':"const amber=mat('signal',0x9c652f,.8);amber.emissive.setHex(0x694312);amber.emissiveIntensity=.25;add(new THREE.CylinderGeometry(.5,.7,1.8,8),amber,0,.9,0);",
'barrier':"box(0,1,0,12,2,5);",
'bridge':'''box(0,11,0,68,1.6,8,stone,'deck');for(const x of [-14,14]){box(x,4,0,3.6,12,5);box(x,2.5,-3,4.3,.25,.2,light);}
 for(const x of [-30,30])box(x,13,0,.2,3,8,metal,'side-'+x);for(const z of [-3,3])box(0,13,z,60,.2,.15,metal,'rail-'+z);for(let k=-3;k<=3;k++)box(k*8,14,0,.18,5,.18,metal);
''',
'dock':'''const steel=mat('metal',0x1c3038,.65,.55),black=mat('metal',0x0c1c25,.8),mint=mat('signal',0x71e7dc,.5);mint.emissive.setHex(0x71e7dc);mint.emissiveIntensity=.7;
 add(new THREE.CylinderGeometry(22,22,.3,80),black,0,-.45,0);for(const r of [5.7,6,10,17])add(new THREE.TorusGeometry(r,.018,4,100),mint,0,-.26,0).rotation.x=-Math.PI/2;
 for(let i=-20;i<=20;i+=2){box(i,-.27,0,.016,.015,40,steel);box(0,-.27,i,40,.015,.016,steel);}
 for(const side of [-1,1]){for(const z of [-14,-7,0,7,14]){box(side*18,6,z,.6,12,.6,steel);box(side*17.8,5,z,.04,7,.12,mint);}box(side*18,12,0,.8,.8,30,steel);}
 for(let i=-2;i<=2;i++){box(i*7,12,-14,5,.1,.2,mint);box(i*7,0,-16,3,1,1,steel);box(i*7,1,-16,2.8,.6,.8,steel);}box(0,12,-14,36,.7,.8,steel);
'''
}
for name,lethal in [('supply',False),('lethal-supply',True)]:
 items[name]=f'''const glow=mat('signal',{ '0xff5266' if lethal else '0x72e6d0'},.3,.45);glow.emissive.copy(glow.color);glow.emissiveIntensity=1;
 add(new THREE.TorusGeometry({1.5 if lethal else 1.25},.12,6,{3 if lethal else 20}),glow,0,2,0,'ring');
 add(new THREE.{'IcosahedronGeometry(.8,0)' if lethal else 'OctahedronGeometry(.6)'},glow,0,2,0,'core');
 add(new THREE.CylinderGeometry(.8,1.1,.4,10),mat('metal',0x252b29),0,.15,0,'base');'''
for name,body in items.items():Path(f'game/assets/{name}.js').write_text(head+body+foot)
