"""Two new fleet constructions; approved models stay as the third, legacy candidate."""
from pathlib import Path
import runpy
ns=runpy.run_path(str(Path(__file__).with_name('compliance-candidates.py')))
HEAD,FOOT,OUT=ns['HEAD'],ns['FOOT'],ns['OUT']
# A: structural frame with modular box/cone shells. B: continuous swept hulls,
# curved tubular outriggers and layered profile armor. This changes topology and
# part decomposition, not just parameters of one old file.
A=[
"""box(0,1,0,1.5,.65,6.2,paint,body);box(0,1.45,1.5,1.3,.4,2.6,paint,body);for(const s of [-1,1]){box(s*1.05,1,-.6,.55,.6,4,metal,body);const n=add(new THREE.ConeGeometry(.75,2,4).rotateX(Math.PI/2).rotateZ(Math.PI/4),paint,0,1.2,3.7,body);rod([s*.5,.75,2.8],[s*1.25,.6,-2.6],.1,metal,body);engine(s*.7,1,-2.65,.45);}""",
"""const g=new THREE.ConeGeometry(.9,8,4).rotateX(Math.PI/2).rotateZ(Math.PI/4);g.scale(.75,.48,1);add(g,paint,0,1,.1,body);for(const s of [-1,1]){box(s*1.7,1,-.7,.55,.65,4.4,paint,body);rod([s*.4,1,.9],[s*1.7,1,-1.3],.09,metal,body);rod([s*.4,1,-2],[s*1.7,1,-2.2],.09,metal,body);engine(s*1.7,1,-2.8,.3);}const fin=box(0,2,-2.5,.1,1.5,1.2,paint,body);fin.rotation.x=-.3;""",
"""box(0,1,0,1.5,.65,5.5,paint,body);for(const s of [-1,1]){const wing=add(new THREE.ConeGeometry(1,4.6,3).rotateX(Math.PI/2),paint,s*1.3,1,.2,body);wing.scale.set(1.4,.18,1);wing.rotation.y=-s*.45;box(s*1.9,1.23,-.3,1.2,.18,1.4,dark,body);engine(s*.75,1,-2.5,.42);}""",
"""box(0,1,.2,1.35,.6,5.8,paint,body);for(const s of [-1,1]){add(new THREE.CylinderGeometry(.7,.74,4.7,16).rotateX(Math.PI/2),paint,s*1.45,1.25,-.5,body);for(const z of [-2,-1,0,1])add(new THREE.TorusGeometry(.75,.07,6,20),metal,s*1.45,1.25,z,body);box(s*.55,1.5,2,.6,.5,2,paint,body);engine(s*1.45,1.25,-2.8,.62);}""",
"""box(0,1,0,1.1,.6,6.6,paint,body);const nose=add(new THREE.ConeGeometry(.8,2.6,4).rotateX(Math.PI/2),paint,0,1,3,body);nose.scale.y=.5;add(new THREE.CylinderGeometry(.42,.48,4.9,12).rotateX(Math.PI/2),dark,-1.2,1,-.5,body);box(1.05,1.2,-.5,.75,.65,3,metal,body);engine(-1.2,1,-2.8,.43);engine(.6,1,-2.5,.37);rod([1.2,1.5,-1.4],[1.2,3,-1.4],.025,metal,body);""",
"""for(const s of [-1,1]){box(s*1.65,1,0,1.3,.7,6.3,paint,body);box(s*1.65,1.5,.2,1.2,.25,4.5,paint,body);const o=add(new THREE.ConeGeometry(.9,1.2,4).rotateX(Math.PI/2),paint,s*1.65,1,3.3,body);o.scale.y=.5;engine(s*1.65,1,-3.1,.55);}box(0,1,-.5,3.1,.4,3.4,dark,body);box(0,1.5,1.3,1.2,.5,1.8,paint,body);"""
]
B=[
"""hull(0,1,0,1,7,paint);for(const s of [-1,1]){const o=profile([[-.3,0],[.3,0],[.25,.65],[-.15,.8]],2.6,paint,s*.72,1.1,1.7,body);tube([[s*.8,1,2.8],[s*1.4,.7,1],[s*1.35,.7,-2.4]],.11,metal,body);hull(s*1.12,.9,-.8,.32,3.7,dark);engine(s*.7,1,-2.8,.45);}""",
"""hull(0,1,0,.72,8.5,paint);for(const s of [-1,1]){hull(s*1.7,1,-.9,.35,5.3,paint);tube([[s*.4,1.1,1],[s*1.2,.85,-.3],[s*1.7,1,-1.4]],.12,metal,body);engine(s*1.7,1,-3,.3);}profile([[-.8,0],[.8,0],[-.6,1.4]],.1,paint,0,1.6,-2.5,body).rotation.y=Math.PI/2;""",
"""const o=profile([[-.7,-2.8],[-2.9,-.2],[-2.5,1.8],[-1.5,.8],[-.6,2.4],[.6,2.4],[1.5,.8],[2.5,1.8],[2.9,-.2],[.7,-2.8]],.28,paint,0,1,0,body);o.rotation.x=-Math.PI/2;hull(0,1.3,.2,.72,5.8,paint);for(const s of [-1,1]){for(let j=0;j<7;j++)box(s*(1.2+j*.18),1.35,-.6-j*.08,.08,.04,.6,dark,body);engine(s*.7,1,-2.5,.4);}""",
"""hull(0,1,.2,.8,6,paint);for(const s of [-1,1]){const o=lathe([[0,-2.5],[.5,-2.5],[.75,-1.9],[.75,.8],[.65,2],[.3,2.5],[0,2.5]],paint,s*1.45,1.2,-.3,body);o.rotation.x=Math.PI/2;for(let j=0;j<4;j++)add(new THREE.TorusGeometry(.75,.04,6,20),dark,s*1.45,1.2,-1.8+j*.8,body);tube([[s*.5,1.5,2],[s*1.1,1.9,1],[s*1.45,1.9,-.2]],.1,metal,body);engine(s*1.45,1.2,-2.8,.63);}""",
"""const o=profile([[-.65,-3.6],[-1.15,.6],[-.6,3],[.7,2.7],[.85,-1.8],[.25,-3.9]],.45,paint,0,1,0,body);o.rotation.x=-Math.PI/2;hull(-1.2,1,-.5,.44,5.5,dark);profile([[-.4,0],[.4,0],[.3,.7],[-.4,.6]],3,metal,1.1,.9,-.5,body);engine(-1.2,1,-2.8,.42);engine(.55,1,-2.5,.4);tube([[1.2,1.4,-1],[1.3,2.2,-1.3],[1.3,3,-1.4]],.025,metal,body);""",
"""for(const s of [-1,1]){const o=profile([[-.8,-3],[-.9,2.5],[0,3.4],[.8,2.6],[.7,-3]],.65,paint,s*1.6,.8,0,body);o.rotation.x=-Math.PI/2;hull(s*1.6,1.35,.1,.62,5.2,paint);engine(s*1.6,1,-3,.56);}for(const z of [-1.4,1.2])tube([[-1.6,1,z],[-.5,1.2,z],[.5,1.2,z],[1.6,1,z]],.2,metal,body);box(0,1.1,0,2.9,.25,3,dark,body);"""
]
COMMON='''
 const body=new THREE.Group(),rider=new THREE.Group();body.name='static-body';rider.name='rider';root.add(body,rider);
 const fabric=material('fabric',0x41453e,.96,0),armor=material('armor',0x8c8370,.65,.4),visor=material('visor',0x526e72,.18,.75);
 const engine=(x,y,z,r)=>{const o=lathe([[0,-.55],[r,-.55],[r,.55],[r*.8,.75],[r*.65,.75],[r*.65,-.45],[0,-.45]],metal,x,y,z,body);o.rotation.x=Math.PI/2;add(new THREE.TorusGeometry(r*.72,.05,6,18),signal,x,y,z-.76,body);for(let i=0;i<8;i++){const a=i*Math.PI/4,b=box(x+Math.cos(a)*r*.4,y+Math.sin(a)*r*.4,z-.72,r*.55,.04,.05,dark,body);b.rotation.z=a+.5;}};
 const hull=(x,y,z,r,len,m)=>{const pts=[];for(let i=0;i<=16;i++){const u=i/16;pts.push([Math.pow(Math.sin(u*Math.PI),.65)*r,(u-.5)*len]);}const o=lathe(pts,m,x,y,z,body);o.rotation.x=Math.PI/2;o.scale.z=.55;return o;};
'''
GEAR='''
 box(0,1.65,-.3,.68,.25,1.8,dark,body);box(0,1.7,1,.7,.45,.8,paint,body);rod([-.65,2.08,1],[.65,2.08,1],.05,metal,body);for(const s of [-1,1]){box(s*.66,1,.05,.3,.15,.55,dark,body);rod([s*.6,1.1,1],[s*1.15,1.6,1.7],.09,metal,body);box(s*1.15,1.65,1.8,.65,.48,1.8,metal,body);for(const dx of [-.16,.16]){rod([s*1.15+dx,1.7,1],[s*1.15+dx,1.7,3],.11,dark,body);add(new THREE.TorusGeometry(.115,.025,5,12),metal,s*1.15+dx,1.7,3,body);}for(let j=0;j<5;j++)box(s*.55,1.6,1.6+j*.15,.25,.04,.045,dark,body);for(let j=0;j<4;j++){box(s*.8,1.3,-1.8+j*.8,.08,.25,.55,metal,body);for(const dz of [-.2,.2])add(new THREE.SphereGeometry(.025,6,4),dark,s*.85,1.34,-1.8+j*.8+dz,body);}const f=new THREE.Group();f.name=s<0?'foil-left':'foil-right';f.position.set(s,1,-.2);root.add(f);rod([0,0,.8],[s*.25,-.8,.4],.065,metal,f);rod([0,0,-1],[s*.25,-.8,-.6],.065,metal,f);box(s*.25,-.8,0,.38,.08,2.5,dark,f);}
 box(0,1.6,-2.2,.8,.4,.5,metal,body);for(const x of [-.24,0,.24])rod([x,1.6,-2.3],[x,1.6,-2.8],.085,metal,body);
'''
RIDER_A='''
 // Segmented armor suit on articulated cylindrical anatomy.
 rider.position.set(0,1.9,-.6);for(const s of [-1,1]){rod([s*.22,1.9,-.6],[s*.48,1.4,.1],.16,fabric,body);rod([s*.48,1.4,.1],[s*.65,1.1,-.1],.12,fabric,body);box(s*.48,1.45,.15,.26,.2,.25,armor,body);rod([s*.28,.65,.35],[s*.5,.4,.8],.13,fabric,rider);rod([s*.5,.4,.8],[s*.56,.18,1.6],.09,fabric,rider);box(s*.34,.7,.4,.3,.2,.3,armor,rider);box(s*.56,.18,1.6,.16,.16,.24,dark,rider);}const torso=box(0,.45,.2,.58,.7,.45,fabric,rider);torso.rotation.x=.35;for(let j=0;j<4;j++)box(0,.26+j*.13,.48+j*.04,.48,.09,.14,armor,rider);const helmet=add(new THREE.SphereGeometry(.28,14,10),armor,0,1.08,.61,rider);box(0,1.1,.88,.43,.1,.04,visor,rider);box(0,.96,.84,.2,.14,.17,dark,rider);box(0,.55,-.1,.45,.5,.25,dark,rider);for(let j=0;j<4;j++)box(0,.4+j*.08,-.25,.3,.03,.04,metal,rider);tube([[.2,.55,-.2],[.35,.7,.25],[.15,.98,.8]],.03,dark,rider);
'''
RIDER_B='''
 // Curved suit limbs with separate profiled chest shell and helmet crown.
 rider.position.set(0,1.9,-.6);for(const s of [-1,1]){tube([[s*.2,1.9,-.6],[s*.5,1.45,.1],[s*.65,1.1,-.1]],.14,fabric,body);ball(s*.49,1.45,.1,.18,.22,.2,armor,body);tube([[s*.25,.7,.4],[s*.5,.4,.8],[s*.56,.18,1.6]],.11,fabric,rider);ball(s*.56,.18,1.6,.09,.08,.14,dark,rider);profile([[-.15,0],[.15,0],[.18,.16],[-.1,.22]],.35,armor,s*.34,.6,.4,rider);}const torso=lathe([[0,0],[.25,0],[.32,.4],[.28,.75],[0,.8]],fabric,0,.05,.1,rider);torso.rotation.x=.35;const chest=profile([[-.26,0],[.26,0],[.31,.4],[.2,.57],[-.2,.57],[-.31,.4]],.12,armor,0,.25,.5,rider);chest.rotation.x=.35;lathe([[0,0],[.25,.03],[.28,.24],[.2,.45],[0,.49]],armor,0,.87,.6,rider);add(new THREE.TorusGeometry(.265,.055,6,18,Math.PI),visor,0,1.14,.6,rider).rotation.x=Math.PI/2;box(0,.98,.87,.24,.13,.14,dark,rider);box(0,.5,-.1,.4,.5,.2,dark,rider);for(const s of [-1,1])rod([s*.21,.2,.4],[s*.23,.7,.15],.025,metal,rider);
'''
colors=['0xad5535','0xbcb4a2','0x626e4c','0x842f23','0x4b6470','0x8b826c']
for i,name in enumerate(['kestrel','albatross','manta','brimstone','spectre','ironclad']):
 for label,body,rider in [('assembly',A[i],RIDER_A),('profile',B[i],RIDER_B)]:
  (OUT/f'{name}__{label}.js').write_text(HEAD+f'paint.color.setHex({colors[i]});\n'+COMMON+body+GEAR+rider+FOOT)
print('Wrote 12 fresh fleet candidates.')
