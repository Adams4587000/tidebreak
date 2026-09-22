// Original constructor-authored geometry. Atlas references and material provenance: docs/DYSTOPIA.md.
export default function generate(THREE){
 const kind=5;
 const root=new THREE.Group(),body=new THREE.Group(),rider=new THREE.Group();body.name='static-body';rider.name='rider';root.add(body,rider);
 const mat=(name,color,roughness=.65,metalness=.3)=>{const m=new THREE.MeshStandardMaterial({color,roughness,metalness});m.name=name;return m;};
 const paint=mat('paint',[0xad5535,0xbcb4a2,0x626e4c,0x842f23,0x4b6470,0x8b826c][kind]),metal=mat('metal',0x596168,.38,.78),dark=mat('carbon',0x1d2528,.73,.3),edge=mat('trim',0x968575,.42,.7),rubber=mat('rubber',0x111716,.95,0),fabric=mat('fabric',[0x3c3e35,0x484b51,0x414a32,0x3e2926,0x303d48,0x555447][kind],.96,0),armor=mat('armor',[0x756657,0xaaa99d,0x5a664c,0x70392e,0x506671,0x848273][kind],.54,.55),visor=mat('visor',[0xbba277,0xc5a36b,0x839c85,0xb95e38,0x548a99,0x9ca79c][kind],.17,.87),glow=mat('energy',0x163138,.4,.1);
 glow.emissive.setHex([0x68b2c5,0xc49c54,0x829b5d,0xe45c26,0x68a6c6,0xa3c1a5][kind]);glow.emissiveIntensity=1.5;
 const add=(g,m,x=0,y=0,z=0,parent=body)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;};
 const box=(x,y,z,w,h,d,m=paint,parent=body,bevel=.035)=>{const s=new THREE.Shape(),a=w/2,b=h/2;s.moveTo(-a,-b);s.lineTo(a,-b);s.lineTo(a,b);s.lineTo(-a,b);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:3,steps:1});g.translate(0,0,-d/2);return add(g,m,x,y,z,parent);};
 const rod=(a,b,r,m=metal,parent=body,r2=r,segments=8)=>{const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),v=q.clone().sub(p),o=add(new THREE.CylinderGeometry(r2,r,v.length(),segments),m,0,0,0,parent);o.position.copy(p.add(q).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;};
 const ball=(x,y,z,sx,sy,sz,m,parent=body)=>{const o=add(new THREE.SphereGeometry(1,16,10),m,x,y,z,parent);o.scale.set(sx,sy,sz);return o;};
 const hose=(pts,r=.035,m=rubber,parent=body)=>add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p))),16,r,6,false),m,0,0,0,parent);
 const plate=(pts,y,h,m=paint)=>{const s=new THREE.Shape();pts.forEach(([x,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z));s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelThickness:.05,bevelSize:.07,bevelSegments:2,steps:1});g.rotateX(-Math.PI/2);return add(g,m,0,y,0);};
 const pod=(x,y,z,w,h,len,m=paint)=>{const p=[];for(let i=0;i<=18;i++){const u=i/18;p.push(new THREE.Vector2(Math.pow(Math.sin(u*Math.PI),.52)*(1-.2*u),(u-.5)*len));}const g=new THREE.LatheGeometry(p,20);g.rotateX(Math.PI/2);g.scale(w,h,1);return add(g,m,x,y,z);};
 const turbine=(x,y,z,r)=>{const g=new THREE.CylinderGeometry(r*.83,r,1.75,20,1,true);g.rotateX(Math.PI/2);const shell=add(g,metal,x,y,z);shell.material.side=THREE.DoubleSide;for(const dz of [-.78,.45])add(new THREE.TorusGeometry(r*.95,.065,6,24),edge,x,y,z+dz);add(new THREE.CircleGeometry(r*.82,24),dark,x,y,z-.8).rotation.y=Math.PI;add(new THREE.TorusGeometry(r*.65,.07,6,24),glow,x,y,z-.84);for(let j=0;j<10;j++){const a=j/10*Math.PI*2;const blade=box(x+Math.cos(a)*r*.51,y+Math.sin(a)*r*.51,z-.87,.075,r*.56,.055,metal,body,.008);blade.rotation.z=a+.7;}add(new THREE.SphereGeometry(r*.22,12,8),glow,x,y,z-.9);const m=new THREE.MeshStandardMaterial({color:0x7ccad8,emissive:glow.emissive,emissiveIntensity:2,transparent:true,opacity:.15,depthWrite:false,side:THREE.DoubleSide});m.name='exhaust';const plume=add(new THREE.ConeGeometry(r*.58,1.5,16,1,true).rotateX(-Math.PI/2).translate(0,0,-.75),m,x,y,z-.92,root);plume.name='plume-'+x;};
 // Six structural archetypes, not six repaints of one shell.
 if(kind===0){plate([[-.76,-2.8],[-1,-.4],[-.88,2.9],[-.3,3.55],[.3,3.55],[.88,2.9],[1,-.4],[.76,-2.8]],.85,.55);for(const s of [-1,1]){box(s*.72,1.48,1.9,.55,.48,2.45);box(s*1.22,.98,-.75,.5,.55,3,metal);hose([[s*.9,1.1,2.6],[s*1.34,.7,1.8],[s*1.25,.65,-1.8]],.095,metal);turbine(s*.68,1.1,-2.6,.48);}}
 if(kind===1){pod(0,1.1,.2,.68,.4,8.4);for(const s of [-1,1]){pod(s*1.7,.95,-.9,.36,.36,5.1);rod([s*.45,1.1,.8],[s*1.7,.95,-1.2],.11);rod([s*.45,.95,-2.5],[s*1.7,.95,-1.9],.1);turbine(s*1.7,1,-2.9,.32);}const fin=box(0,1.9,-2.65,.1,1.5,1.7);fin.rotation.x=-.27;}
 if(kind===2){plate([[-.7,3],[-1.7,2.1],[-2.85,.2],[-2.6,-1.8],[-1.8,-.8],[-.65,-2.5],[.65,-2.5],[1.8,-.8],[2.6,-1.8],[2.85,.2],[1.7,2.1],[.7,3]],.9,.3);pod(0,1.3,.4,.72,.43,5.8);for(const s of [-1,1]){box(s*1.6,1.27,.3,1.15,.15,1.35);for(let j=0;j<6;j++)box(s*(1.2+j*.21),1.28,-.7-j*.12,.1,.09,.6,dark);turbine(s*.71,1.13,-2.35,.39);}}
 if(kind===3){box(0,1.05,.15,1.35,.6,5.6);for(const s of [-1,1]){pod(s*1.45,1.3,-.4,.73,.72,4.9);turbine(s*1.45,1.3,-2.25,.65);for(let j=0;j<4;j++)add(new THREE.TorusGeometry(.73,.055,6,20),dark,s*1.45,1.3,-1.35+j*.67);hose([[s*.5,1.5,1.9],[s*1.2,1.9,1.35],[s*1.5,1.9,-.1]],.1,edge);box(s*.45,1.52,2,.65,.42,2);}}
 if(kind===4){plate([[-.65,-3],[-1.25,-1],[-.65,3.6],[.35,3.9],[.78,1.2],[1,-2.5]],.86,.48);pod(-1.22,1.03,-.5,.45,.4,5.4,dark);box(1.1,1.27,-.5,.7,.65,2.8);turbine(-1.2,1.07,-2.5,.44);turbine(.55,1.09,-2.3,.4);rod([1.18,1.6,-1.4],[1.3,3.05,-1.5],.027);box(1.3,2.7,-1.5,.08,.55,.16,metal);}
 if(kind===5){for(const s of [-1,1]){plate([[s*.8,-3],[s*2.45,-2.4],[s*2.25,2.5],[s*1.45,3.15],[s*.9,2.3]],.8,.65);box(s*1.55,1.49,.6,1,.3,3.7);turbine(s*1.64,1.1,-2.7,.57);rod([s*.5,1,.1],[s*1.45,.7,1.5],.17,metal);rod([s*.5,1,-1.7],[s*1.7,.8,-1.7],.17,metal);}box(0,1.02,-.1,2.9,.3,3,dark);box(0,1.5,1.8,1.3,.55,1.9);}
 // Readable maintenance hatches, ribbed intakes and abrasion rails on the forward hull.
 for(const side of [-1,1]){
  const x=side*(kind===5?1.5:kind===2?1.5:kind===1?.38:.68),z=kind===1?2.65:kind===2?1.0:1.95,y=kind===2?1.31:kind===1?1.32:1.77;
  box(x,y,z,kind===1?.42:.52,.022,.72,dark,body,.015);box(x,y+.023,z,kind===1?.35:.43,.025,.61,paint,body,.012);
  for(const dz of [-.24,.24])for(const dx of [-.16,.16])add(new THREE.CylinderGeometry(.025,.025,.025,6),edge,x+dx,y+.05,z+dz);
  if(kind===0||kind===3||kind===5){const front=kind===0?3.17:kind===3?3.04:2.81;box(x,1.46,front,.44,.32,.035,dark,body,.015);for(let j=0;j<5;j++)box(x-.16+j*.08,1.46,front+.03,.025,.26,.027,edge,body,.003);box(x,1.81,front-.8,.48,.025,.04,edge,body,.004);}
  hose([[side*.54,1.5,2.65],[side*.58,1.6,2.35],[side*.59,1.62,1.7]],.028,dark);
 }
 // Common engineered cockpit: exposed saddle, tank, steering yoke, foot pegs.
 box(0,1.38,-.35,.7,.35,2,rubber);box(0,1.68,-.4,.67,.15,1.5,rubber);box(0,1.6,1.05,.74,.48,.9);box(0,1.9,.96,.48,.09,.35,dark);box(0,1.95,1.04,.32,.025,.15,glow);
 rod([0,1.45,.65],[0,2.04,1.1],.07);rod([-.66,2.05,1.12],[.66,2.05,1.12],.045,metal);for(const s of [-1,1]){rod([s*.43,2.05,1.12],[s*.69,2.05,1.12],.065,rubber);box(s*.75,.94,-.12,.4,.08,.8,dark);rod([s*.4,.95,-.12],[s*.8,.95,-.12],.09);}
 // Layered panels, seam rails, recessed grills, fasteners and service equipment.
 for(const s of [-1,1]){
  for(let j=0;j<7;j++){box(s*.63,1.64,1.5+j*.16,.22,.028,.055,dark,body,.005);}
  for(let j=0;j<4;j++){const z=-1.8+j*.88;box(s*.74,1.32,z,.06,.28,.57,dark,body,.008);box(s*.78,1.32,z,.025,.2,.47,paint,body,.005);for(const dz of [-.19,.19])add(new THREE.CylinderGeometry(.029,.029,.03,6).rotateZ(Math.PI/2),edge,s*.805,1.36,z+dz);}
  hose([[s*.42,.7,2.8],[s*.67,.59,1.8],[s*.71,.62,-2.35]],.045,edge);
  for(let j=0;j<3;j++)box(s*.6,1.61,-1.5-j*.25,.13,.12,.12,edge,body,.01);
  box(s*.78,1.76,-1.6,.31,.29,.62,dark);rod([s*.78,1.73,-1.3],[s*.78,1.73,-1.9],.07,edge);
  add(new THREE.SphereGeometry(.075,8,6),glow,s*.85,1.33,2.52);
 }
 // Rider: articulated anatomy in a forward riding posture. Seat/boots/grips meet the machine.
 // Legs stay with the saddle; upper-body pivot leans subtly with steering and impacts.
 for(const s of [-1,1]){
  rod([s*.23,1.92,-.64],[s*.47,1.4,.05],.17,fabric,body,.2,12);
  ball(s*.47,1.37,.05,.2,.22,.2,armor);
  rod([s*.47,1.32,.03],[s*.64,1.02,-.16],.12,fabric,body,.14,12);
  box(s*.64,1.02,.05,.25,.19,.52,rubber,body,.045);box(s*.66,1.14,-.1,.28,.19,.2,armor);
  for(let j=0;j<3;j++)box(s*.48,1.5+j*.07,.07,.26,.033,.2,dark,body,.009);
 }
 rider.position.set(0,1.91,-.6);
 ball(0,.11,0,.31,.25,.24,fabric,rider);
 const torso=ball(0,.53,.27,.34,.43,.24,fabric,rider);torso.rotation.x=.38;for(let j=0;j<4;j++){const rib=box(0,.26+j*.095,.43+j*.037,.44,.045,.11,armor,rider,.025);rib.rotation.x=.38;}
 const chest=box(0,.57,.51,.49,.44,.12,armor,rider,.065);chest.rotation.x=.38;
 for(const s of [-1,1]){
  rod([s*.29,.69,.39],[s*.48,.39,.84],.12,fabric,rider,.145,12);
  ball(s*.33,.65,.41,.2,.14,.17,armor,rider);
  rod([s*.48,.39,.84],[s*.55,.15,1.71],.085,fabric,rider,.11,12);
  box(s*.5,.27,1.17,.17,.17,.35,armor,rider,.045).rotation.x=-.2;
  ball(s*.55,.14,1.72,.095,.09,.13,rubber,rider);
  for(let j=0;j<3;j++)box(s*(.52+j*.032),.14,1.8,.024,.06,.09,armor,rider,.009);
  box(s*.24,.25,.39,.15,.24,.12,dark,rider,.025);
  rod([s*.21,.75,.17],[s*.21,.17,.02],.03,edge,rider);
 }
 rod([0,.84,.45],[0,.95,.53],.115,fabric,rider);
 // Helmet silhouettes: aviator mask, aerodynamic crest, respirator, furnace plates, hood, industrial square.
 const helmet=ball(0,1.1,.62,kind===5?.29:.265,.285,kind===1?.35:.29,armor,rider);
 if(kind===5){helmet.scale.set(.25,.25,.27);box(0,1.12,.65,.53,.4,.48,armor,rider,.055);}
 if(kind===4){ball(0,1.14,.56,.32,.33,.32,fabric,rider);}
 const face=add(new THREE.SphereGeometry(1,18,8,0,Math.PI,Math.PI*.28,Math.PI*.42),visor,0,1.13,.64,rider);face.scale.set(.267,.24,.3);face.rotation.y=0;
 box(0,1.13,.903,.4,kind===3?.08:.11,.025,visor,rider,.023);box(0,1.145,.927,.33,.018,.012,glow,rider,.006);
 box(0,.98,.84,kind===2?.29:.2,.14,.15,dark,rider,.03);
 if(kind===2)for(const s of [-1,1])add(new THREE.CylinderGeometry(.085,.1,.1,12).rotateX(Math.PI/2),metal,s*.17,.99,.85,rider);
 if(kind===1)box(0,1.38,.56,.045,.12,.59,edge,rider,.025);
 if(kind===3)for(const s of [-1,1]){box(s*.2,1.26,.74,.1,.21,.12,metal,rider,.025).rotation.z=s*.35;}
 if(kind===0){const brow=add(new THREE.SphereGeometry(1,20,10,0,Math.PI*2,0,Math.PI*.44),dark,0,1.12,.62,rider);brow.scale.set(.285,.29,.31);}
 for(const s of [-1,1])add(new THREE.CylinderGeometry(.095,.095,.065,12).rotateZ(Math.PI/2),dark,s*.27,1.11,.62,rider);
 // Armor overlaps, respirator fasteners, flexible joints and stitched harness fittings.
 for(const side of [-1,1]){
  for(let k=0;k<3;k++){const guard=box(side*(.34+k*.018),.72-k*.06,.43+k*.035,.22,.055,.27,armor,rider,.025);guard.rotation.z=side*.25;}
  ball(side*.48,.39,.84,.13,.13,.13,dark,rider);
  for(let k=0;k<4;k++)rod([side*.48-.085,.32-k*.036,.94+k*.11],[side*.48+.085,.32-k*.036,.94+k*.11],.014,edge,rider);
  for(let k=0;k<3;k++){box(side*.22,.39+k*.105,.505+k*.03,.055,.065,.035,edge,rider,.009);}
  for(let k=0;k<3;k++)add(new THREE.SphereGeometry(.022,6,4),edge,side*.2,1.02+k*.1,.84,rider);
  const ear=add(new THREE.TorusGeometry(.074,.018,5,14),metal,side*.31,1.11,.62,rider);ear.rotation.y=Math.PI/2;
  for(let k=0;k<4;k++)box(side*.64,1.13,-.13+k*.09,.27,.02,.023,edge,body,.004);
 }
 // Back-mounted life support, straps, hoses and unique gear.
 box(0,.52,-.02,.42,.5,.22,dark,rider,.05);
 for(let j=0;j<4;j++)box(0,.37+j*.08,-.155,.29,.025,.055,metal,rider,.005);
 hose([[.17,.48,-.09],[.34,.45,.1],[.3,.85,.7],[.15,.99,.83]],.035,rubber,rider);
 box(-.24,.17,.08,.14,.18,.14,edge,rider,.02);
 if(kind===2||kind===5){rod([-.24,.3,-.1],[-.24,.78,-.1],.09,metal,rider);rod([.24,.3,-.1],[.24,.78,-.1],.09,metal,rider);}
 if(kind===4){rod([-.18,.67,-.12],[-.18,1.45,-.12],.013,metal,rider);box(.1,.62,-.18,.2,.15,.04,glow,rider,.01);}
 if(kind===3){for(const s of [-1,1])box(s*.32,.7,.39,.24,.17,.3,armor,rider,.04);}
 // Folding hydrofoils with visible pivots and hydraulic cylinders.
 for(const s of [-1,1]){const f=new THREE.Group();f.name=s<0?'foil-left':'foil-right';f.position.set(s*(kind===2?1.75:kind===5?1.7:1),.97,-.2);root.add(f);rod([0,0,.9],[s*.25,-.76,.45],.065,metal,f);rod([0,0,-1],[s*.25,-.76,-.6],.065,metal,f);box(s*.25,-.79,-.15,.38,.07,2.45,dark,f,.01);rod([0,-.07,.5],[s*.21,-.56,.22],.085,dark,f);rod([s*.21,-.56,.22],[s*.27,-.75,.15],.04,edge,f);}
 const bounds=new THREE.Box3(),v=new THREE.Vector3();root.updateMatrixWorld(true);root.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)bounds.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});const c=bounds.getCenter(new THREE.Vector3());root.children.forEach(o=>{o.position.x-=c.x;o.position.y-=bounds.min.y;o.position.z-=c.z;});return root;
}
