import * as THREE from 'three';
export function createWater(normalMap){
 const uniforms={time:{value:0},amplitude:{value:.3},waterColor:{value:new THREE.Color('#087e8b')},deepColor:{value:new THREE.Color('#063d50')},skyColor:{value:new THREE.Color('#adc8cd')},sunDirection:{value:new THREE.Vector3(-.6,.45,-.4).normalize()},normalMap:{value:normalMap},fogDensity:{value:.0015}};
 const material=new THREE.ShaderMaterial({uniforms,vertexShader:`
 varying vec3 vWorld;uniform float time;uniform float amplitude;
 void main(){vec3 p=position;vec4 w=modelMatrix*vec4(p,1.);w.y+=amplitude*(sin(w.x*.063+w.z*.045+time*1.45)*.47+sin(w.x*.12-w.z*.095+time*2.1)*.21+sin(w.z*.22+time*1.7)*.09);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
 fragmentShader:`
 uniform float time,amplitude,fogDensity;uniform vec3 waterColor,deepColor,skyColor,sunDirection;uniform sampler2D normalMap;varying vec3 vWorld;
 void main(){vec2 uv=vWorld.xz;vec3 a=texture2D(normalMap,uv*.022+vec2(time*.009,time*.006)).xyz*2.-1.;vec3 b=texture2D(normalMap,uv.yx*.037+vec2(-time*.005,time*.011)).xyz*2.-1.;float dx=amplitude*(cos(uv.x*.063+uv.y*.045+time*1.45)*.02961+cos(uv.x*.12-uv.y*.095+time*2.1)*.0252);float dz=amplitude*(cos(uv.x*.063+uv.y*.045+time*1.45)*.02115-cos(uv.x*.12-uv.y*.095+time*2.1)*.01995+cos(uv.y*.22+time*1.7)*.0198);vec3 n=normalize(vec3(-dx+(a.x+b.y)*.18,1.,-dz+(a.y+b.x)*.18));vec3 v=normalize(cameraPosition-vWorld);float fres=pow(1.-max(dot(n,v),0.),4.);vec3 refl=reflect(-v,n);vec3 sky=mix(skyColor,vec3(.055,.17,.28),clamp(refl.y*1.5,0.,1.));float s=pow(max(dot(reflect(-sunDirection,n),v),0.),180.);float wide=pow(max(dot(reflect(-sunDirection,n),v),0.),14.);float variation=sin(uv.x*.012+sin(uv.y*.023))*sin(uv.y*.019);vec3 base=mix(deepColor,waterColor,.55+variation*.14);vec3 color=mix(base,sky,.08+fres*.48);color+=vec3(1.,.87,.63)*(s*2.3+wide*.08);float d=length(cameraPosition-vWorld);float fog=1.-exp(-pow(d*fogDensity,2.));color=mix(color,skyColor,clamp(fog,0.,1.));gl_FragColor=vec4(color,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});
 const geometry=new THREE.PlaneGeometry(2800,2800,320,320);geometry.rotateX(-Math.PI/2);const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;mesh.renderOrder=-1;return{mesh,uniforms};
}
export function createWake(count=260){
 const geo=new THREE.PlaneGeometry(1,1,4,4);geo.rotateX(-Math.PI/2);
 const mat=new THREE.MeshBasicMaterial({color:0xd6f5ed,transparent:true,opacity:.48,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true});
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const c=canvas.getContext('2d');const gr=c.createRadialGradient(64,64,2,64,64,62);gr.addColorStop(0,'#ddd');gr.addColorStop(.3,'#777');gr.addColorStop(.7,'#222');gr.addColorStop(1,'#000');c.fillStyle=gr;c.fillRect(0,0,128,128);mat.alphaMap=new THREE.CanvasTexture(canvas);
 const fade=new THREE.InstancedBufferAttribute(new Float32Array(count),1);geo.setAttribute('wakeFade',fade);
 const motion={time:{value:0},amp:{value:.3}};
 mat.onBeforeCompile=shader=>{shader.uniforms.wakeTime=motion.time;shader.uniforms.wakeAmp=motion.amp;shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float wakeTime,wakeAmp;attribute float wakeFade;varying float vFade;').replace('#include <project_vertex>',`#include <project_vertex>
 vec4 wp=modelMatrix*instanceMatrix*vec4(transformed,1.);wp.y=wakeAmp*(sin(wp.x*.063+wp.z*.045+wakeTime*1.45)*.47+sin(wp.x*.12-wp.z*.095+wakeTime*2.1)*.21+sin(wp.z*.22+wakeTime*1.7)*.09)+.16;gl_Position=projectionMatrix*viewMatrix*wp;vFade=wakeFade;`);shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vFade;').replace('#include <alphamap_fragment>','#include <alphamap_fragment>\ndiffuseColor.a*=vFade;');};
 const mesh=new THREE.InstancedMesh(geo,mat,count);mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.renderOrder=2;const dummy=new THREE.Object3D(),parts=Array.from({length:count},()=>({age:100,x:0,z:0,y:0,dir:0,speed:0}));let cursor=0;
 function emit(x,y,z,dir,speed){const p=parts[cursor++%count];Object.assign(p,{age:0,x,y,z,dir,speed});}
 function update(dt,t,amp){motion.time.value=t;motion.amp.value=amp;for(let i=0;i<count;i++){const p=parts[i];p.age+=dt;const life=Math.max(0,1-p.age/3.8);dummy.position.set(p.x,p.y+.035,p.z);dummy.rotation.y=p.dir;dummy.scale.set((2+p.age*2.4)*(life>0?1:0),1,(4+p.age*2)*(life>0?1:0));fade.setX(i,life*life);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);}mesh.instanceMatrix.needsUpdate=true;fade.needsUpdate=true;}
 return{mesh,emit,update,clear(){parts.forEach(p=>p.age=100);}};
}
export function createSpray(count=500){
 const positions=new Float32Array(count*3),colors=new Float32Array(count*3),life=new Float32Array(count),vel=new Float32Array(count*3);positions.fill(-10000);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));geo.setAttribute('color',new THREE.BufferAttribute(colors,3));const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;const ctx=canvas.getContext('2d');const gradient=ctx.createRadialGradient(16,16,0,16,16,16);gradient.addColorStop(0,'#fff');gradient.addColorStop(1,'#000');ctx.fillStyle=gradient;ctx.fillRect(0,0,32,32);const mat=new THREE.PointsMaterial({alphaMap:new THREE.CanvasTexture(canvas),size:.25,color:0xcbeee9,vertexColors:true,transparent:true,opacity:.7,depthWrite:false,sizeAttenuation:true});const mesh=new THREE.Points(geo,mat);mesh.frustumCulled=false;let cursor=0;
 function emit(x,y,z,vx,vz,boost){for(let k=0;k<(boost?8:4);k++){const i=cursor++%count,j=i*3;positions[j]=x+(Math.random()-.5)*2;positions[j+1]=y;positions[j+2]=z+(Math.random()-.5)*2;vel[j]=vx+(Math.random()-.5)*4;vel[j+1]=1+Math.random()*3;vel[j+2]=vz+(Math.random()-.5)*4;life[i]=1;colors[j]=colors[j+1]=colors[j+2]=.8;}}
 function update(dt){for(let i=0;i<count;i++){const j=i*3;if(life[i]>0){life[i]-=dt*.85;vel[j+1]-=dt*8;for(let k=0;k<3;k++)positions[j+k]+=vel[j+k]*dt;if(positions[j+1]<-.1)life[i]=0;colors[j]=colors[j+1]=colors[j+2]=Math.max(0,life[i]);}else positions[j+1]=-10000;}geo.attributes.position.needsUpdate=true;geo.attributes.color.needsUpdate=true;}
 return{mesh,emit,update};
}
