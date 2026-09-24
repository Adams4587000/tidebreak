"""Retrospective candidate review: preserve legacy, then two fresh constructions.
These are alternatives, never recolors or segment-count variations. Each branch
below has a different part breakdown and/or geometry construction. Only an
explicit visual selection may be copied into game/assets.
"""
from pathlib import Path
import shutil
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'candidates/compliance';OUT.mkdir(parents=True,exist_ok=True)
HEAD='''export default function generate(THREE){
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
'''
FOOT='''
 const bounds=new THREE.Box3(),v=new THREE.Vector3();root.updateMatrixWorld(true);root.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)bounds.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});const c=bounds.getCenter(new THREE.Vector3());root.children.forEach(o=>{o.position.x-=c.x;o.position.y-=bounds.min.y;o.position.z-=c.z;});return root;
}'''
B={}
B['rock']=(
'''// Segmented columnar jointing, separate split blocks; not a displaced solid.
 for(let i=0;i<37;i++){const a=i*2.399,r=Math.sqrt(i/37)*6,h=8+10*(1-r/9)+Math.sin(i*3)*2,x=Math.cos(a)*r,z=Math.sin(a)*r;add(new THREE.CylinderGeometry(.8,1.05,h,6),stone,x,h/2,z);for(let j=0;j<3;j++)add(new THREE.CylinderGeometry(.83,1,.17,6),dark,x,h*(.2+j*.24),z);}for(let i=0;i<15;i++){const a=i*2.1,o=box(Math.cos(a)*7,1,Math.sin(a)*5,2,2.1,2.8);o.rotation.set(i*.1,i*.7,i*.13);}
''',
'''// Contour strata extrusions: each layer has its own broken outline.
 for(let j=0;j<12;j++){const pts=[],r=6.7*(1-j*.035);for(let i=0;i<18;i++){const a=i/18*Math.PI*2,k=r*(1+.14*Math.sin(i*3.1+j*.7));pts.push([Math.cos(a)*k,Math.sin(a)*k*.8]);}const o=profile(pts,1.7,stone,Math.sin(j)*.4,1+j*1.45,0);o.rotation.x=-Math.PI/2;}for(let i=0;i<9;i++){const a=i*2.3;const o=profile([[-1,0],[1,0],[.6,4],[-.8,5]],2,stone,Math.cos(a)*6,0,Math.sin(a)*5);o.rotation.y=a;}
''')
B['mangrove']=(
'''// Curving trunk and continuous aerial roots, separate umbrella clusters.
 tube([[0,0,0],[.4,3,.2],[-.2,6,.1],[.8,9,0]],.65,bark);for(let i=0;i<11;i++){const a=i*2.399,x=Math.cos(a)*4,z=Math.sin(a)*4;tube([[0,4,0],[x*.6,2.8,z*.6],[x,.2,z]],.18,bark);}for(let i=0;i<10;i++){const a=i*2.399,x=Math.cos(a)*4,z=Math.sin(a)*4,y=8+i%3;tube([[0,5,0],[x*.6,y-1,z*.6],[x,y,z]],.14,bark);for(let j=0;j<5;j++)ball(x+Math.cos(j*2)*1.4,y+Math.sin(j)*.4,z+Math.sin(j*2)*1.2,1.8,.85,1.7,leaf);}
''',
'''// Forked structural branches and layered broad leaf fans instead of canopy balls.
 for(const s of [-1,1]){rod([0,0,0],[s*.5,5,0],.55,bark,root,.32);rod([s*.5,5,0],[s*2,9,1],.28,bark,root,.1);}for(let i=0;i<14;i++){const a=i*2.4,x=Math.cos(a)*4,z=Math.sin(a)*4;rod([0,3,0],[x*.6,1.4,z*.6],.18,bark);rod([x*.6,1.4,z*.6],[x,0,z],.13,bark);const y=8+i%3;rod([0,6,0],[x,y,z],.13,bark);for(let j=0;j<8;j++){const a2=j*.8,o=profile([[-2,0],[-1,1],[1.6,.5],[2.2,0],[.2,-.7]],.09,leaf,x+Math.cos(a2),y+j*.045,z+Math.sin(a2));o.rotation.set(-Math.PI/2,.1,a2);}}
''')
B['crane']=(
'''// A-frame legs and boxed cantilever boom.
 box(0,1,0,14,2,12);for(const s of [-1,1])for(const z of [-4,4]){rod([s*5,2,z],[s*2,22,z*.5],.4,paint);rod([s*5,2,z],[-s*2,22,z*.5],.12,metal);}box(0,23,0,8,2,7,paint);box(2,25,0,4,3,4);for(let z=-13;z<23;z+=3){box(0,26,z,2,.6,3,paint);rod([-1,26,z],[1,29,z+3],.13);rod([1,26,z],[-1,29,z+3],.13);}rod([0,24,0],[0,36,-4],.23);rod([0,36,-4],[0,27,22],.06);rod([0,26,20],[0,9,20],.04);add(new THREE.TorusGeometry(.7,.15,6,16,Math.PI*1.5),metal,0,8.5,20);box(2,25,2.05,2.7,1.5,.1,dark);
''',
'''// Hollow extruded tower frame with triangulated side panels and tubular jib.
 for(const z of [-3,3]){profile([[-4,0],[-3,0],[-1,22],[1,22],[3,0],[4,0],[2,25],[-2,25]],.6,paint,0,2,z);for(let j=0;j<5;j++){rod([-3+j*.2,3+j*4,z],[3-j*.2,7+j*4,z],.12);rod([3-j*.2,3+j*4,z],[-3+j*.2,7+j*4,z],.12);}}box(0,1,0,13,2,12);box(0,24,0,8,1,8,metal);profile([[-2,0],[2,0],[2,3],[-1,4],[-2,2]],5,stone,1,25,0);for(const x of [-1,1]){rod([x,28,-13],[x,28,23],.22,paint);rod([x,31,-13],[x,31,23],.22,paint);for(let j=0;j<12;j++)rod([x,28,-13+j*3],[x,31,-10+j*3],.1);}rod([0,28,21],[0,8,21],.04);add(new THREE.TorusGeometry(.75,.14,6,18,Math.PI*1.6),metal,0,7.5,21);
''')
B['gate']=(
'''// Paired battered pylons with suspended open steel truss.
 for(const s of [-1,1]){box(s*19,1.5,0,8,3,11);box(s*19,13,0,5.6,23,8);box(s*19,26,0,7.5,2,10);for(let y=5;y<25;y+=5)box(s*19,y,4.1,5,.3,.3,metal);box(s*19,28,0,3,3,4,metal);}for(const z of [-3,3]){rod([-20,25,z],[20,25,z],.35);rod([-20,29,z],[20,29,z],.18);for(let x=-20;x<20;x+=4){rod([x,25,z],[x+4,29,z],.12);rod([x,25,z],[x,29,z],.09);}}box(0,25,0,42,.6,7,metal);
''',
'''// Extruded portal section with a chamfered soffit, service galleries both sides.
 profile([[-23,0],[-15,0],[-15,19],[-11,23],[11,23],[15,19],[15,0],[23,0],[23,28],[-23,28]],8,stone);for(const z of [-4.6,4.6]){box(0,27,z,46,.5,2,metal);rod([-22,29,z],[22,29,z],.08);for(let x=-22;x<=22;x+=4)rod([x,27,z],[x,29,z],.07);}for(const s of [-1,1]){box(s*19,30,0,4,4,5,metal);box(s*19,30,2.6,3,1,.15,dark);}
''')
B['lighthouse']=(
'''// Entire tapered wall from stepped radial profile; separate lantern frame.
 lathe([[0,0],[5,0],[5,2],[3.8,3],[2.5,24],[4,24],[4,25],[2.3,25],[2.3,29],[0,29]],stone);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;rod([Math.cos(a)*2.5,25,Math.sin(a)*2.5],[Math.cos(a)*2.5,29,Math.sin(a)*2.5],.08);rod([Math.cos(a)*3.8,25,Math.sin(a)*3.8],[Math.cos(a)*3.8,27,Math.sin(a)*3.8],.06);}add(new THREE.ConeGeometry(3.3,2.8,20),metal,0,30.2,0);add(new THREE.CylinderGeometry(1.3,1.3,2.5,16),signal,0,27,0);for(let y=2;y<24;y+=.65)rod([-1,y,4-y*.06],[1,y,4-y*.06],.05);box(0,2,4.2,1.6,3,.1,dark);
''',
'''// Octagonal masonry stack with battered corners and external stair landings.
 for(let j=0;j<12;j++){const r=3.9-j*.12;add(new THREE.CylinderGeometry(r-.12,r,2,8),j%4===0?paint:stone,0,1+j*2,0);}add(new THREE.CylinderGeometry(4,4,.6,8),metal,0,24.3,0);for(const x of [-1.7,1.7])for(const z of [-1.7,1.7])rod([x,24,z],[x,29,z],.12);box(0,27,0,2.8,3,2.8,signal);add(new THREE.ConeGeometry(3.6,2.5,8),metal,0,30,0);for(let i=0;i<36;i++){const a=i*.3,x=Math.cos(a)*4,z=Math.sin(a)*4;const o=box(x,.7+i*.63,z,1.7,.15,.8,metal);o.rotation.y=-a;rod([x,1.2+i*.63,z],[x,2.2+i*.63,z],.045);}
''')
B['buoy']=(
'''// Navigation mast, float ring, caged lantern; assembled cylinders.
 add(new THREE.CylinderGeometry(1,1.2,.5,16),metal,0,.25,0);add(new THREE.TorusGeometry(1,.18,6,20),dark,0,.45,0).rotation.x=Math.PI/2;add(new THREE.CylinderGeometry(.35,.55,2.2,12),paint,0,1.5,0);add(new THREE.CylinderGeometry(.32,.32,.7,12),signal,0,3,0);for(let i=0;i<4;i++){const a=i*Math.PI/2;rod([Math.cos(a)*.4,2.5,Math.sin(a)*.4],[Math.cos(a)*.4,3.5,Math.sin(a)*.4],.04);}add(new THREE.ConeGeometry(.55,.6,12),metal,0,3.8,0);
''',
'''// Turned float/mast silhouette and polygonal beacon cap.
 lathe([[0,0],[1.1,0],[1.2,.3],[1,.6],[.55,.7],[.35,2.7],[.6,2.8],[.6,3],[.3,3],[.3,3.6],[0,4]],paint);add(new THREE.TorusGeometry(.45,.12,8,20),signal,0,3.4,0).rotation.x=Math.PI/2;for(const s of [-1,1])tube([[s*.55,.6,0],[s*.8,1,0],[s*.6,1.5,0]],.05,metal);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;rod([Math.cos(a)*.52,2.8,Math.sin(a)*.52],[Math.cos(a)*.4,3.7,Math.sin(a)*.4],.035);}
''')
B['ramp']=(
'''// Extruded side-profile wedge with longitudinal deck slats and pontoon supports.
 for(const x of [-5,5]){const o=profile([[-8,0],[8,0],[8,3.1],[-8,.4]],.4,metal);o.rotation.y=Math.PI/2;o.position.x=x;}for(let i=0;i<12;i++){const z=-7.5+i*1.35,o=box(0,.45+(z+8)*.17,z,14,.15,1.25,metal);o.rotation.x=-.17;}for(const x of [-6.7,6.7]){rod([x,1,-8],[x,3.7,8],.13,paint);rod([x,1.9,-8],[x,4.6,8],.07);for(let z=-8;z<=8;z+=4)rod([x,.5+(z+8)*.17,z],[x,1.9+(z+8)*.17,z],.055);}
''',
'''// Curved rising deck swept through longitudinal cross sections; tubular frame.
 const pts=[];for(let i=0;i<=12;i++){const z=-8+i*16/12;pts.push([z,.3+3*Math.pow(i/12,1.45)]);}pts.push([8,0],[-8,0]);const o=profile(pts,14,metal);o.rotation.y=Math.PI/2;for(const x of [-6.5,6.5]){tube([ [x,1,-8],[x,1.9,0],[x,4.2,8]],.12,paint);for(let i=0;i<5;i++)rod([x,0,-8+i*4],[x,1+3*Math.pow(i/4,1.45),-8+i*4],.075);}for(let i=0;i<6;i++)box(0,.43+3*Math.pow((i*2.5+1)/16,1.45),-7+i*2.5,12,.04,.35,signal);
''')
B['quay']=(
'''// Piled wharf rather than solid block, lean-to warehouse and two container stacks.
 box(0,3,0,44,1,38);for(const x of [-20,0,20])for(let z=-17;z<=17;z+=8.5)add(new THREE.CylinderGeometry(.7,.9,6,10),stone,x,0,z);box(11,9,0,16,11,33);const roof=box(11,15,0,18,.35,35,metal);roof.rotation.z=.14;for(let z=-13;z<=13;z+=6.5){box(2.8,10,z,.1,4,4,dark);add(new THREE.TorusGeometry(.8,.25,6,16),dark,-22,1.5,z).rotation.y=Math.PI/2;}for(let k=0;k<4;k++){const x=-12+(k%2)*7,z=(k<2?-8:8);box(x,5.2,z,5,3.5,12,paint);for(let j=0;j<9;j++)box(x-2.6,5.3,z-5+j*1.2,.1,3.2,.12,metal);}
''',
'''// Profiled retaining wall and continuous sawtooth roof shell.
 const wall=profile([[-22,0],[-18,0],[-18,5],[22,5],[22,7],[-22,7]],38,stone);box(12,13,0,16,12,34,stone);const roof=[];roof.push([-17,0]);for(let i=0;i<7;i++)roof.push([-17+i*5,1],[-12+i*5,2]);roof.push([18,0]);const o=profile(roof,17,metal,12,19,0);o.rotation.y=Math.PI/2;for(let z=-14;z<=14;z+=7){box(3.9,13,z,.15,4,4,dark);for(const x of [-14,-6]){profile([[-2.7,0],[2.7,0],[2.7,3.5],[-2.7,3.5]],11,paint,x,7,z);for(let i=0;i<8;i++)box(x-2.75,8.7,z-4.5+i*1.2,.1,3,.1,metal);}add(new THREE.TorusGeometry(.85,.25,6,18),dark,-22.4,4,z).rotation.y=Math.PI/2;}
''')
B['stadium']=(
'''// Extruded stepped bleacher section; repeated cantilever triangular roof frames.
 const pts=[[0,0],[24,0],[24,17]];for(let i=15;i>=0;i--){pts.push([i*1.5,(i+1)]);pts.push([i*1.5,i]);}profile(pts,58,stone);for(let i=0;i<16;i++)for(let z=-27;z<=27;z+=3)box(i*1.5+.5,i+1.2,z,.7,.2,1.9,dark);for(const z of [-27,-9,9,27]){rod([23,0,z],[23,23,z],.4);rod([23,22,z],[0,24,z],.15);rod([23,17,z],[0,24,z],.13);}const roof=box(12,24,0,26,.3,60,metal);roof.rotation.z=-.08;for(const z of [-22,22]){rod([23,22,z],[23,30,z],.15);box(23,30,z,1,2,6,signal);}
''',
'''// Modular pre-cast seating trays carried by exposed raker beams, open underneath.
 for(let r=0;r<16;r++){box(r*1.4,1+r,0,1.3,.25,58);box(r*1.4+.6,1.4+r,0,.15,.7,58);for(let z=-25;z<=25;z+=3.2)box(r*1.4,1.3+r,z,.7,.12,1.5,dark);}for(const z of [-27,-9,9,27]){rod([0,.5,z],[22,16.5,z],.45,stone);rod([22,0,z],[22,25,z],.5);tube([[22,17,z],[22,24,z],[0,25,z]],.18,metal);}for(let z=-27;z<=27;z+=6){const o=profile([[-1,0],[24,0],[24,.8],[-1,.3]],5.8,metal,0,24,z);o.rotation.z=-.08;}for(const z of [-23,23]){rod([21,22,z],[21,30,z],.15);box(21,29,z,1,2,6,dark);for(let j=-2;j<=2;j++)ball(20.4,29,z+j, .15,.5,.4,signal);}
''')
B['wreck']=(
'''// Open rib skeleton from curved frames and separate torn side plates.
 for(let i=0;i<18;i++){const z=-19+i*2.4,w=5.5*(1-Math.pow(Math.max(0,(z-9)/15),2)*.8);tube([[-w,7,z],[-w*.8,2,z],[0,.5,z],[w*.8,2,z],[w,7,z]],.2,paint);if(i%4!==2)for(const s of [-1,1]){const o=box(s*w*.94,4.8,z,.2,4.2,2.25,paint);o.rotation.z=-s*.2;}}box(0,4,-10,8,.5,15,dark);box(0,7,-12,7,5,6,paint);box(0,10,-12,8,.3,7,metal);for(const x of [-2.4,0,2.4])box(x,8,-8.9,1.6,1.4,.1,dark);rod([0,10,-12],[0,22,-10],.2);rod([0,20,-10],[0,13,10],.05);
''',
'''// Port/starboard longitudinal hull profiles, exposed internal decks and broken bow.
 for(const s of [-1,1]){const o=profile([[-18,0],[15,0],[24,6],[17,8],[-18,6]],.35,paint,s*5,1,0);o.rotation.y=Math.PI/2;for(let i=0;i<13;i++)rod([s*5,2,-17+i*3],[s*5,8,-17+i*3],.1,metal);}for(const z of [-15,-8,0,8,15])rod([-5,3,z],[5,3,z],.2);for(let i=0;i<5;i++)box(-2+i,3,-8,.85,.25,14,metal);profile([[-4,0],[4,0],[3.5,7],[-3.5,7]],7,paint,0,4,-11);box(0,11,-11,8,.4,8,metal);for(const x of [-2.5,0,2.5])box(x,9,-7.45,1.7,1.3,.12,dark);rod([0,11,-12],[1,23,-9],.16);for(let i=0;i<4;i++){const o=box(i-1,3.4,4+i,2,.2,6,paint);o.rotation.y=i*.5;}
''')
B['spillway']=(
'''// Cylindrical pressure towers flanking a raised maintenance bridge; open race channel.
 for(const s of [-1,1]){add(new THREE.CylinderGeometry(7,9,36,16),stone,s*36,18,0);add(new THREE.CylinderGeometry(9.5,9.5,1.2,20),metal,s*36,36,0);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;rod([s*36+Math.cos(a)*9,36,Math.sin(a)*9],[s*36+Math.cos(a)*9,39,Math.sin(a)*9],.09);}box(s*36,39,0,6,5,6,metal);for(let y=5;y<35;y+=6)add(new THREE.TorusGeometry(8.5-y*.04,.16,6,24),paint,s*36,y,0).rotation.x=Math.PI/2;}box(0,30,0,74,3,12);for(const z of [-6,6]){rod([-44,34,z],[44,34,z],.1);for(let x=-44;x<=44;x+=4)rod([x,31,z],[x,34,z],.08);}for(const x of [-20,0,20])box(x,33,0,5,3,7,metal);
''',
'''// Buttressed rectangular gatehouse, extruded tower profiles and exposed pipe banks.
 for(const s of [-1,1]){profile([[-8,0],[8,0],[6,30],[8,32],[8,38],[-8,38],[-8,32],[-6,30]],19,stone,s*36,0,0);for(const z of [-12,12]){const o=profile([[-4,0],[4,0],[1,28],[-1,28]],4,stone,s*36,0,z);o.rotation.y=Math.PI/2;}for(let j=0;j<3;j++)tube([[s*(31+j*4),2,-12],[s*(31+j*4),32,-12],[s*(31+j*4),34,-8]],.8,paint);}box(0,29,0,58,4,12);box(0,32,0,90,.6,16,metal);for(const z of [-7,7]){rod([-44,35,z],[44,35,z],.09);for(let x=-44;x<=44;x+=4)rod([x,32,z],[x,35,z],.07);}for(const x of [-21,0,21]){add(new THREE.CylinderGeometry(1.4,1.4,6,16).rotateX(Math.PI/2),metal,x,35,0);rod([x,28,2],[x,18,2],.1);}
''')
B['caldera']=(
'''// Layered irregular radial contour rings with open throat, instead of cone deformation.
 for(let j=0;j<14;j++){const pts=[],r=45-j*2.4;for(let i=0;i<32;i++){const a=i/32*Math.PI*2;pts.push(new THREE.Vector2((r+Math.sin(i*2.3+j)*1.3),0));}const geo=new THREE.TorusGeometry(r,2.1,6,40);geo.rotateX(Math.PI/2);const o=add(geo,stone,0,2+j*2.8,0);o.scale.y=1.1;}signal.color.setHex(0xb44917);signal.emissive.setHex(0xff5314);add(new THREE.CircleGeometry(11,32).rotateX(-Math.PI/2),signal,0,34,0);for(let i=0;i<12;i++){const a=i*2.399;add(new THREE.CylinderGeometry(2,3,6+i%4,6),stone,Math.cos(a)*40,3,Math.sin(a)*40);}
''',
'''// Fluted eroded radial wall from a closed lathed cross-section with procedural joint offsets.
 const pts=[[44,0],[46,2],[37,10],[31,18],[25,26],[18,35],[11,42],[8,41],[10,35],[14,32],[14,0],[44,0]];const geo=new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(...p)),48),p=geo.attributes.position;for(let i=0;i<p.count;i++){const a=Math.atan2(p.getZ(i),p.getX(i)),f=1+.035*Math.sin(a*17)+.028*Math.cos(a*9+p.getY(i)*.35);p.setX(i,p.getX(i)*f);p.setZ(i,p.getZ(i)*f);}geo.computeVertexNormals();add(geo,stone);signal.color.setHex(0x942f16);signal.emissive.setHex(0xfa4010);add(new THREE.CircleGeometry(10,32).rotateX(-Math.PI/2),signal,0,35,0);for(let j=0;j<7;j++){const a=j*.9;const points=[];for(let k=0;k<12;k++){const y=k*3.3,r=45-y*.82,angle=a+Math.sin(k)*.025;points.push([Math.cos(angle)*r,y,Math.sin(angle)*r]);}tube(points,.16,signal);}
''')
# The six extracted objects receive genuinely different structural attempts too.
B['barrier']=(
'''// Jersey section with chamfered foot, separate end connectors and recessed panels.
 const section=[[-2.5,0],[2.5,0],[2.5,.3],[1.2,.9],[.9,2],[-.9,2],[-1.2,.9],[-2.5,.3]];const o=profile(section,12,stone);o.rotation.y=Math.PI/2;for(const x of [-4,0,4]){box(x,1.25,1.03,2.8,.3,.08,paint);box(x,1.25,-1.03,2.8,.3,.08,paint);}for(const s of [-1,1])for(const z of [-1.7,1.7])add(new THREE.CylinderGeometry(.16,.16,.3,8).rotateZ(Math.PI/2),metal,s*6,.55,z);
''',
'''// Interlocking concrete units with angled shoulder blocks and inset warning rail.
 for(const x of [-4.5,-1.5,1.5,4.5]){box(x,.2,0,2.9,.4,5);box(x,1.1,0,2.9,1.8,1.8);for(const s of [-1,1]){const o=box(x,.6,s*1.5,2.9,.3,2);o.rotation.x=s*.55;box(x,1.4,s*.93,2.4,.25,.08,paint);}}for(const x of [-6,6])add(new THREE.CylinderGeometry(.2,.2,3,10).rotateX(Math.PI/2),metal,x,.4,0);
''')
B['edge-buoy']=(
'''// Turned tapered marker, protective base and cap. Amber remains navigational color.
 paint.color.setHex(0x9c652f);lathe([[0,0],[.7,0],[.7,.2],[.5,.3],[.3,1.45],[.4,1.5],[.4,1.65],[.2,1.8],[0,1.8]],paint);for(const y of [.4,.95,1.5])add(new THREE.TorusGeometry(.55-y*.17,.025,4,12),metal,0,y,0).rotation.x=Math.PI/2;
''',
'''// Pontoon base and central caged amber light, rather than a solid cone.
 add(new THREE.CylinderGeometry(.55,.7,.3,12),dark,0,.15,0);add(new THREE.CylinderGeometry(.25,.35,1,12),paint,0,.8,0);signal.color.setHex(0xc89143);signal.emissive.setHex(0x694312);add(new THREE.CylinderGeometry(.22,.22,.4,12),signal,0,1.45,0);for(let i=0;i<4;i++){const a=i*Math.PI/2;rod([Math.cos(a)*.3,1.2,Math.sin(a)*.3],[Math.cos(a)*.3,1.7,Math.sin(a)*.3],.035);}add(new THREE.ConeGeometry(.35,.2,8),metal,0,1.8,0);
''')
B['bridge']=(
'''// Open steel truss deck on battered concrete piers, separate support bearings.
 box(0,11,0,68,1,8);for(const x of [-14,14]){profile([[-1.8,-2],[1.8,-2],[1.4,9],[-1.4,9]],5,stone,x);box(x,9.8,0,5,.7,6,metal);}for(const z of [-3.8,3.8]){rod([-33,11,z],[33,11,z],.18);rod([-33,14,z],[33,14,z],.12);for(let x=-32;x<32;x+=4){rod([x,11,z],[x+4,14,z],.1);rod([x,11,z],[x,14,z],.08);}}for(const x of [-25,0,25])box(x,10.1,0,5,.5,9,metal);
''',
'''// Profiled I-girders and independent service-pipe rack above a slab deck.
 for(const z of [-3,3])profile([[-34,0],[34,0],[34,.3],[-34,.3]],.35,metal,0,10,z);box(0,11,0,68,.7,8);for(const x of [-14,14]){box(x,4,0,3.6,12,5);box(x,9.8,0,5,.5,6,metal);}for(const z of [-2,0,2])tube([[-33,12,z],[-30,13,z],[30,13,z],[33,12,z]],.3,metal);for(const z of [-4,4]){rod([-34,14,z],[34,14,z],.07);for(let x=-32;x<=32;x+=4)rod([x,11,z],[x,14,z],.06);}
''')
B['dock']=(
'''// Raised annular platform with radial ribs and open arch gantries.
 lathe([[0,0],[22,0],[22,.4],[20,.6],[0,.6]],dark);for(const r of [6,10,17])add(new THREE.TorusGeometry(r,.035,4,80),signal,0,.62,0).rotation.x=-Math.PI/2;for(let i=0;i<24;i++){const a=i/24*Math.PI*2;rod([Math.cos(a)*6,.63,Math.sin(a)*6],[Math.cos(a)*21,.63,Math.sin(a)*21],.035,metal);}for(const z of [-14,0,14]){tube([[-18,0,z],[-18,11,z],[-14,13,z],[14,13,z],[18,11,z],[18,0,z]],.3,metal);for(const x of [-17,17])rod([x,3,z],[x,10,z],.08,signal);}
''',
'''// Polygonal maintenance dais under triangulated modular frame.
 add(new THREE.CylinderGeometry(22,22,.5,12),dark,0,.25,0);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const o=box(Math.cos(a)*16,.6,Math.sin(a)*16,6,.15,2,metal);o.rotation.y=-a;rod([Math.cos(a)*20,.6,Math.sin(a)*20],[Math.cos(a+.5)*20,.6,Math.sin(a+.5)*20],.045,signal);}for(const z of [-14,-7,0,7,14])for(const s of [-1,1]){rod([s*18,0,z],[s*18,12,z],.23);rod([s*18,12,z],[0,13,z],.17);rod([s*18,8,z],[s*10,12,z],.1);box(s*17.7,6,z,.07,7,.1,signal);}for(const r of [6,10,17])add(new THREE.TorusGeometry(r,.035,4,80),signal,0,.55,0).rotation.x=-Math.PI/2;
''')
for lethal,name in [(False,'supply'),(True,'lethal-supply')]:
 prefix="signal.color.setHex(0xff5266);signal.emissive.setHex(0xe43747);" if lethal else ''
 B[name]=(prefix+'''// Layered hexagonal pedestal with bracketed polygonal frame.
 add(new THREE.CylinderGeometry(.8,1.1,.3,6),metal,0,.15,0);add(new THREE.CylinderGeometry(.6,.8,.2,6),dark,0,.4,0);
 '''+('''const pts=[[-1.3,2.8],[1.3,2.8],[0,.55]];for(let i=0;i<3;i++)rod([...pts[i],0],[...pts[(i+1)%3],0],.13,metal);add(new THREE.IcosahedronGeometry(.55,1),signal,0,1.8,0);''' if lethal else '''add(new THREE.TorusGeometry(1.25,.15,8,24),metal,0,2,0);add(new THREE.TorusGeometry(1.24,.05,6,24),signal,0,2,.13);add(new THREE.OctahedronGeometry(.7),signal,0,2,0);''')+'''for(let i=0;i<6;i++){const a=i/6*Math.PI*2;add(new THREE.SphereGeometry(.055,6,4),signal,Math.cos(a)*.75,.48,Math.sin(a)*.75);}
''',prefix+'''// Turned stepped plinth and separated floating frame segments.
 lathe([[0,0],[1.1,0],[1.1,.2],[.85,.35],[.85,.45],[.6,.5],[0,.5]],dark);
 '''+('''const pts=[[-1.25,2.9],[1.25,2.9],[0,.65]];for(let i=0;i<3;i++){const a=pts[i],b=pts[(i+1)%3];tube([[a[0],a[1],0],[(a[0]+b[0])*.5,(a[1]+b[1])*.5,.12],[b[0],b[1],0]],.11,signal);}ball(0,1.85,0,.55,.55,.55,signal);''' if lethal else '''for(let i=0;i<8;i++){const o=add(new THREE.TorusGeometry(1.2,.13,6,6,Math.PI*.22),metal,0,2,0);o.rotation.z=i*Math.PI/4;}profile([[0,-.7],[.6,0],[0,.7],[-.6,0]],.5,signal,0,2,0);''')+'''for(const s of [-1,1])box(s*.8,.45,0,.15,.1,.5,signal);
''')
# Write only immutable first snapshots of the approved legacy; reruns never replace them.
for p in sorted((ROOT/'game/assets').glob('*.js')):
 legacy=OUT/(p.stem+'__legacy.js')
 if not legacy.exists():shutil.copy2(p,legacy)
for name,(a,b) in B.items():
 for label,body in [('assembly',a),('profile',b)]:
  (OUT/(name+'__'+label+'.js')).write_text(HEAD+body+FOOT)
if __name__=='__main__':print('Wrote',len(B)*2,'new independent scenery candidates; preserved legacy snapshots.')
