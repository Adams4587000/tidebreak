import * as THREE from 'three';
import {CHAPTERS,SECTORS,BOATS,objectivePassed,objectiveProgress,formatTime} from './campaign.js';
import {PREVIEW_UNLOCKS,loadSave,unlocked,boatUnlocked,recordResult} from './play-access.js';
import {makeCourse,waveHeight} from './course.js';
import {loadArt,buildWorld,createBoat,animateCraft,animateDamage} from './world.js';
import {createWater,createWake,createSpray} from './water.js';
import {stepAI,resolvePickups,tickPerks} from './race-rules.js';
import {createAtmosphere,createLens,createReflection} from './atmosphere.js';
import {createCombat,armRacer,tickCombat,defend,pace,standings,targetFor,distance,lane,live,damageReaction,ENGINE_COLORS} from './combat.js';
import {createCombatFX} from './combat-fx.js';
import {createDock} from './dock.js';
import {stepBoost,stepDrive,courseDelta,barrierImpact,sweepHull,rampContact,stepFlight,launchVelocity} from './handling.js';
import {RaceAudio} from './audio.js';
import {createRenderQuality} from './render-quality.js';
const $=id=>document.getElementById(id),clamp=THREE.MathUtils.clamp,lerp=THREE.MathUtils.lerp;
const angle=x=>Math.atan2(Math.sin(x),Math.cos(x));
let renderer,scene,camera,art,water,world,course,hero,sky,sun,env,hemi,atmosphere,lens,reflection,fill,rim;
let combatFX,dock,orbitYaw=.85,orbitPitch=.3,orbitZoom=12.5,orbitTouched=false,raceSeed=1;const combat=createCombat();
let fleet=[],quality,previewRev=0,revHeld=false,revUntil=0,preparing=false,shadowAt=-1;
const nextPaint=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
let menuStep='dock',previewArena=0,currentLeg=-1;
const inFront=()=>state==='menu'||state==='title'||state==='loading';
const routes=[];
let pickupUntil=0;
let weaponFeedback={text:'',kind:'',until:0};
function weaponNotice(text,kind='launch'){weaponFeedback={text,kind,until:clock+2.8};}
let currentSector=0,ambientAmp=.48,inspectRider=false;
let state='loading',chapter=0,boatIndex=0,mode='race',save=loadSave(),elapsed=0,clock=0,countdown=0,boostHeld=false,brakeHeld=false,stick=0,steering=0,wasBoosting=false,boostCooldown=0,air=0,airVelocity=0,pendingJump=false,lastWake=0,announcementUntil=0,toastUntil=0,previous=performance.now(),fps=60,nextHud=0;
let pausedFrom='race';const mobile=matchMedia('(pointer:coarse)').matches||innerWidth<700;
const keys=new Set(),opponents=[],race={finished:false,time:0,place:6,signals:0,pickups:0,jumps:0,boosts:0,surges:0,collisions:0};
const player={id:"player",claimed:0,shield:0,overdrive:0,x:0,z:0,heading:0,speed:0,progress:0,s:0,lateral:0,boost:100,vy:0};
const audio=new RaceAudio(),wake=createWake(mobile?480:720),spray=createSpray(mobile?800:1600);
function syncSound(){const ready=audio.enabled&&audio.ctx?.state==='running'&&!audio.musicError;$('soundlabel').textContent=ready?'ON':audio.enabled?(audio.musicError?'RETRY':'ENABLE'):'MUTED';$('soundb').setAttribute('aria-pressed',String(ready));$('soundb').setAttribute('aria-label',ready?'Mute game sound':'Enable game sound');$('startup-audio').textContent=ready?'◖ SOUND READY':'◖ ENABLE SOUND';}
audio.onStateChange=syncSound;
const enableAudio=()=>audio.activate().then(syncSound).catch(()=>{syncSound();$('startup-audio').textContent='◖ TAP TO RETRY SOUND';});
const firstAudioGesture=e=>{if(!e.target.closest?.('#soundb'))enableAudio();};
document.addEventListener('pointerdown',firstAudioGesture,{capture:true,once:true});document.addEventListener('keydown',firstAudioGesture,{capture:true,once:true});$('startup-audio').onclick=()=>{audio.setEnabled(true);enableAudio();};
function fatal(e){console.error(e);$('loading').hidden=true;$('error').hidden=false;$('error-text').textContent=e.message||String(e);}
window.addEventListener('error',e=>{if(state==='loading')fatal(e.error||e.message);});
function announce(text,duration=3){$('announcement').textContent=text;announcementUntil=clock+duration;}
function toast(text){$('checkpoint-toast').textContent=text;toastUntil=clock+1.5;}
const lockIcon='<svg class="lock-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5z"/><circle cx="12" cy="15" r="1"/></svg>';
const crests=[
 '<path d="M5 28h30M9 27V13h22v14M7 13l13-8 13 8M15 16v8m10-8v8"/>',
 '<path d="M20 32V17m0 7L8 16m12 4 12-12M20 18l-4-9M6 10q13-7 14 9Q34 4 35 5q2 17-15 18Q7 24 6 10Z"/>',
 '<path d="m5 31 11-22 6 12 5-9 9 19ZM16 9l2 14-8 3m17-14-1 13 10 6"/>',
 '<path d="M20 4q4 11 11 14 8 16-9 18Q4 36 9 22l5-10 2 12q8-5 4-20Z"/>',
 '<path d="M7 6h26v10H7ZM12 16v8m8-8v12m8-12v8M5 31q6-7 15 0t15 0"/>',
 '<path d="m23 3-15 20h12l-3 14 16-22H21ZM5 31q5-4 10 0m12 0q5-4 10 0"/>'
];
const frameArt='<svg class="card-frame" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true"><path d="M23 5H83L100 15l17-10h60l18 18v254l-18 18h-60l-17-10-17 10H23L5 277V23Z"/><path d="M28 12h48m48 0h48l16 16v244l-16 16h-48m-48 0H28l-16-16V28M5 48q23-6 23-30M5 252q23 6 23 30m167-234q-23-6-23-30m23 234q-23 6-23 30"/></svg>';
function showPickup(type){const descriptions={NITRO:['NITRO BOOST','5 SEC AUTO BOOST · RESERVE SAVED','»'],CHARGE:['ENERGY CELLS','+6.0 SECONDS OF BOOST','ϟ'],SHIELD:['PULSE SHIELD','5 SEC PROTECTION · +1 CHARGE','⬡'],OVERDRIVE:['OVERDRIVE','5 SEC ENGINE OVERDRIVE','»'],REPAIR:['REPAIR KIT','RECOVERY + ENERGY RESTORED','✚'],AMMO:['MISSILE MAGAZINE','+2 MISSILES','➶'],SEEKER:['SEEKER POD','2 HOMING ROUNDS','⌖'],LASER:['LASER CAPACITOR','2 PULSE SHOTS','ϟ'],MINE:['MINE CANISTER','2 DEPLOYABLE MINES','✦'],BOMB:['DEPTH CHARGE','2 AREA CHARGES','●'],DEATH:['CONTRABAND MINE','LETHAL CONTACT','☠']};const [name,detail,icon]=descriptions[type];$('pickup-name').textContent=name;$('pickup-detail').textContent=detail;$('pickup-icon').textContent=icon;$('pickup-notice').hidden=false;pickupUntil=clock+2.5;$('pickup-notice').classList.remove('collected');void $('pickup-notice').offsetWidth;$('pickup-notice').classList.add('collected');}
function syncArena(){
 const c=CHAPTERS[previewArena],available=unlocked(save,previewArena),route=routes[previewArena];
 $('arena-page').style.setProperty('--arena-color',c.accent);document.body.style.setProperty('--theme',c.accent);document.body.dataset.territory=c.id;
 $('arena-backdrop').style.backgroundImage=`url('./media/arena-${c.id}.webp')`;
 document.querySelector('.arena-grid').innerHTML=CHAPTERS.map((c,i)=>`<button data-course="${i}" style="--arena-color:${c.accent};--arena-image:url('./media/arena-${c.id}.webp')" class="arena-card ${i===previewArena?'active ':''}${unlocked(save,i)?'':'locked'}" aria-pressed="${i===previewArena}" aria-label="${c.name}${unlocked(save,i)?' available':' locked. '+CHAPTERS[i-1].objective}">${frameArt}<span class="territory-crest"><svg viewBox="0 0 40 40" aria-hidden="true">${crests[i]}</svg></span><span class="arena-number">${String(i+1).padStart(2,'0')}</span><span class="arena-state">${save.cleared[i]?'✓ CLAIMED':unlocked(save,i)?'OPEN WATER':lockIcon+'LOCKED'}</span><span class="arena-card-title">${c.short}<small>${c.subtitle}</small></span></button>`).join('');
 document.querySelectorAll('[data-course]').forEach(b=>b.onclick=()=>{previewArena=+b.dataset.course;syncArena();});
 $('arena-name').textContent=c.name;$('arena-subtitle').textContent=c.subtitle;$('course-story').textContent=c.story;
 $('course-distance').textContent=(route.length/1000).toFixed(1)+' KM / FULL RACE';$('arena-condition').textContent=['COASTAL / FAST & OPEN','SWAMP / LOW VISIBILITY','CANYON / TECHNICAL','VOLCANIC / HIGH RISK','SPILLWAYS / TIMED SURGES','OCEAN / HEAVY SWELL'][previewArena];
 $('course-objective').textContent=PREVIEW_UNLOCKS?'PREVIEW · ALL TERRITORIES UNLOCKED':available?(mode==='time'?'Solo practice · no territory unlocks':c.objective):'LOCKED · '+CHAPTERS[previewArena-1].objective;
 $('startb').disabled=!available||!boatUnlocked(save,boatIndex);$('startb').firstElementChild.textContent=available?'RACE THIS TERRITORY':'TERRITORY LOCKED';
 $('arena-record').textContent=save.best[previewArena]?'PERSONAL BEST '+formatTime(save.best[previewArena]):'NO RECORD YET · MAKE YOUR MARK';
 const ps=route.samples.filter((_,i)=>i%40===0),xs=ps.map(p=>p.x),zs=ps.map(p=>p.z),xmin=Math.min(...xs),xmax=Math.max(...xs),zmin=Math.min(...zs),zmax=Math.max(...zs),scale=Math.min(190/(xmax-xmin),125/(zmax-zmin));
 const xy=p=>[110+(p.x-(xmin+xmax)/2)*scale,80-(p.z-(zmin+zmax)/2)*scale];
 const path=ps.map((p,i)=>(i?'L':'M')+xy(p).join(',')).join(' ')+'Z',start=xy(ps[0]);
 $('route-svg').innerHTML=`<path class="route-shadow" d="${path}"/><path class="route-line" d="${path}"/><circle cx="${start[0]}" cy="${start[1]}" r="5"/><text x="${start[0]+9}" y="${start[1]+4}">START</text>`;
}
function syncMenu(){
 const b=BOATS[boatIndex],available=boatUnlocked(save,boatIndex);
 $('boatname').textContent=b.name;$('boattype').textContent=b.type;$('ridername').textContent=b.rider+' / '+b.title;$('riderbio').textContent=b.bio;$('unlock-status').textContent=available?'✓ CREW READY · '+b.rider+' / '+b.name:b.unlock;
 $('arenasb').disabled=!available;$('arenasb').firstElementChild.textContent=available?'CHOOSE TERRITORY':'CREW LOCKED';
 ['speed','control','boost'].forEach((k,i)=>$('stat-'+k).style.width=b.stats[i]*100+'%');
 document.querySelector('.boat-options').innerHTML=BOATS.map((b,i)=>`<button data-boat="${i}" style="--paint:#${b.color.toString(16).padStart(6,'0')}" class="${i===boatIndex?'selected ':''}${boatUnlocked(save,i)?'':'locked'}" aria-label="Inspect ${b.rider} and ${b.name}${boatUnlocked(save,i)?'':' locked'}" aria-pressed="${i===boatIndex}"><span class="crew-number">${String(i+1).padStart(2,'0')}</span><span class="crew-label">${b.rider}<small>${b.name}</small></span><span class="crew-state">${boatUnlocked(save,i)?'↗':lockIcon}</span></button>`).join('');
 document.querySelectorAll('[data-boat]').forEach(b=>b.onclick=()=>{boatIndex=+b.dataset.boat;makeHero();syncMenu();});
 $('career').textContent=PREVIEW_UNLOCKS?'PREVIEW · ALL CREWS UNLOCKED':`${save.finishes} FINISHES / ${save.wins} WINS / ${save.reputation||0} REP`;
 syncArena();
}
function showSetup(step){revHeld=false;revUntil=0;menuStep=step;state='menu';$('loading').hidden=true;$('menu').hidden=false;$('dock-page').hidden=step!=='dock';$('arena-page').hidden=step!=='arenas';$('menu').classList.toggle('choosing-arena',step==='arenas');$('nav-dock').classList.toggle('current',step==='dock');$('nav-arena').classList.toggle('current',step==='arenas');syncMenu();if(step==='dock'){renderer.setPixelRatio(mobile?Math.min(devicePixelRatio,1.5):quality.ratio);updateBoats(0);updateCamera(100);}}
async function launchArena(){
 if(!unlocked(save,previewArena)||!boatUnlocked(save,boatIndex))return;
 $('startb').disabled=true;$('startb').firstElementChild.textContent='PREPARING WATER…';
 // Paint the loading feedback before building the selected world.
 await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 try{if(chapter!==previewArena){chapter=previewArena;await changeCourse();}await start();}catch(e){fatal(e);}
}
async function quickRace(){
 if(state!=='title'||!window.__READY__)return;
 boatIndex=0;previewArena=0;mode='race';makeHero();
 document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('selected',b.dataset.mode===mode));
 if(chapter!==0){chapter=0;await changeCourse();}
 start();
}
function disposeWorld(){if(!world)return;scene.remove(world.root);world.dispose();}
async function changeCourse(){
 disposeWorld();world=null;course=routes[chapter];world=await buildWorld(course,art);scene.add(world.root);currentSector=chapter;currentLeg=-1;const c=SECTORS[chapter];ambientAmp=c.waves;scene.fog=new THREE.FogExp2(c.sky,c.fog);scene.background=new THREE.Color(c.sky);water.uniforms.waterColor.value.set(c.water);water.uniforms.deepColor.value.set(c.deep);water.uniforms.skyColor.value.set(c.sky);water.uniforms.amplitude.value=c.waves;water.uniforms.fogDensity.value=c.fog;
 const phi=THREE.MathUtils.degToRad(90-c.sun),theta=THREE.MathUtils.degToRad(240);const dir=new THREE.Vector3().setFromSphericalCoords(1,phi,theta);if(sky.material.uniforms.sunPosition)sky.material.uniforms.sunPosition.value.copy(dir);water.uniforms.sunDirection.value.copy(dir);sun.userData.dir=dir;
 const start=course.at(180);Object.assign(player,{x:start.p.x,z:start.p.z,heading:start.heading,speed:0,progress:0,s:180,lateral:0,boost:100});if(dock){dock.position.copy(start.p);dock.rotation.y=start.heading;}if(hero)hero.position.set(player.x,0,player.z);opponents.forEach((b,i)=>{b.s=12+i*7;b.speed=0;});fleet.forEach(mesh=>mesh.visible=mesh===hero);wake.clear();camera.position.copy(start.p).add(new THREE.Vector3(18,8,-12));syncMenu();
}
function makeHero(){
 if(!fleet.length){fleet=BOATS.map((b,i)=>createBoat(art,b.color,env,i));scene.add(...fleet);}
 fleet.forEach(o=>o.visible=false);hero=fleet[boatIndex];hero.visible=true;hero.rotation.set(0,0,0);animateDamage(hero,{},0);previewRev=0;revHeld=false;revUntil=0;
}
async function prepareRaceRender(){
 world.update(clock,player.s);world.root.visible=true;water.mesh.visible=true;wake.mesh.visible=spray.mesh.visible=true;dock.visible=false;combatFX.group.visible=true;atmosphere.mist.visible=true;
 updateBoats(0);updateCamera(100);scene.updateMatrixWorld(true);
 await renderer.compileAsync(scene,camera);
 await combatFX.prepare(renderer,camera);
 renderer.shadowMap.needsUpdate=true;reflection.invalidate();reflection.update(scene,camera,water.mesh,[wake.mesh,spray.mesh,combatFX.group,...world.reflectionHidden(player.s)],clock);
 await lens.prepare(scene,camera); // Allocate and draw refraction now, before the first wake splash.
 await nextPaint();
}
function clearInput(){revHeld=false;revUntil=0;previewRev=0;document.body.classList.remove('boosting');keys.clear();boostHeld=false;brakeHeld=false;stick=0;$('stick').firstElementChild.style.transform='';}
async function start(){if(preparing||!window.__READY__||!unlocked(save,chapter)||!boatUnlocked(save,boatIndex))return;preparing=true;state='preparing';renderer.setPixelRatio(quality.ratio);$('race-loading').hidden=false;$('loading').hidden=true;$('menu').hidden=true;$('results').hidden=true;$('pause').hidden=true;$('hud').hidden=false;$('countdown').textContent='3';await nextPaint();try{weaponFeedback={text:'',kind:'',until:0};audio.init().catch(()=>{});if(!audio.music)audio.loadMusic('./media/music.mp3');clearInput();document.body.style.setProperty('--theme',CHAPTERS[chapter].accent);document.body.dataset.territory=CHAPTERS[chapter].id;$('pickup-notice').hidden=true;world.reset();wake.clear();lens.clear();combat.reset();combatFX.clear();setupOpponents();raceSeed=crypto.getRandomValues(new Uint32Array(1))[0];Object.assign(race,{finished:false,time:0,place:mode==='race'?4:1,signals:0,pickups:0,jumps:0,boosts:0,surges:0,collisions:0});const a=course.at(0);Object.assign(player,{x:a.p.x,z:a.p.z,heading:a.heading,speed:0,progress:0,s:0,lateral:0,boost:100,boostEmpty:false,barrierClear:1,barrierContact:false,flightY:null,flightVelocity:0,ramp:null,shield:0,overdrive:0,claimed:0});air=0;airVelocity=0;steering=0;pendingJump=false;elapsed=0;countdown=3;boostCooldown=0;wasBoosting=false;opponents.forEach((b,i)=>{b.s=i<3?10:-3;b.speed=0;b.boost=100;b.boostEmpty=false;b.air=0;b.airVelocity=0;b.flightY=null;b.flightVelocity=0;b.ramp=null;b.lastRamp=null;b.barrierClear=1;b.barrierContact=false;b.claimed=0;b.shield=0;b.overdrive=0;b.lane=b.homeLane;b.mesh.visible=mode==='race';const a=course.at(b.s,b.lane);b.x=a.p.x;b.z=a.p.z;});armRacer(player,raceSeed);player.spec=boatIndex;opponents.forEach((b,i)=>armRacer(b,(raceSeed+i*7919)>>>0));race.eliminated=false;currentSector=-1;scene.fog.color.set(SECTORS[chapter].sky);scene.fog.density=SECTORS[chapter].fog;await prepareRaceRender();quality.reset();previous=performance.now();state='countdown';$('countdown').textContent='3';$('race-loading').hidden=true;$('loading').hidden=true;$('menu').hidden=true;$('results').hidden=true;$('pause').hidden=true;$('hud').hidden=false;$('touch').hidden=!mobile;$('sector-label').textContent=CHAPTERS[chapter].name;$('map-name').textContent=CHAPTERS[chapter].short;$('position-label').textContent=mode==='race'?'POSITION':'TIME TRIAL';$('field-size').textContent=mode==='race'?'/ 6':'/ 1';$('progress-label').textContent='CHECKPOINT 01 / 06';announce(PREVIEW_UNLOCKS?'PREVIEW · '+CHAPTERS[chapter].name:CHAPTERS[chapter].objective.toUpperCase(),5);audio.tone(400,.1);}catch(e){$('race-loading').hidden=true;fatal(e);}finally{preparing=false;}}
window.__START__=start;
function finish(eliminated=false){
 race.finished=!eliminated;race.eliminated=eliminated;race.time=elapsed;race.distance=player.progress;race.kills=player.kills;player.finished=!eliminated;if(!eliminated)player.finishTime=elapsed;player.speed=0;wasBoosting=false;
 race.place=mode==='time'?1:standings([player,...opponents]).indexOf(player)+1;
 const beforeRep=save.reputation||0,passed=mode==='race'&&objectivePassed(chapter,race);save=recordResult(save,chapter,race,mode);state='results';clearInput();$('touch').hidden=true;$('results').hidden=false;
 $('result-title').innerHTML=eliminated?'HULL LOST.<br>RUN ENDED.':PREVIEW_UNLOCKS?'PREVIEW RUN.<br>COMPLETE.':passed?'TERRITORY<br>CLAIMED.':'FINISH LINE.<br>STILL ALIVE.';
 $('result-position').textContent=mode==='race'?race.place+' / 6':'SOLO';$('result-time').textContent=formatTime(elapsed);$('result-best').textContent='PERSONAL BEST · '+(save.best[chapter]?formatTime(save.best[chapter]):'—');
 $('result-detail').textContent=PREVIEW_UNLOCKS?'PREVIEW RUN · Results saved separately from your career.':mode==='time'?'Practice time saved. Career rewards are earned in races.':`${eliminated?'Three hits. Crew evacuated.':passed?'Territory cleared.':'Finish recorded.'} +${(save.reputation||0)-beforeRep} reputation · ${player.kills} takedowns · ${race.pickups} supplies. Crew unlocks and previous records are preserved.`;
 $('result-kicker').textContent=CHAPTERS[chapter].name+' / '+(eliminated?'ELIMINATED':'FINISHED');updateStandings();audio.tone(passed?880:180,.6);
}
function updateStandings(){const rows=standings(mode==='time'?[player]:[player,...opponents]);$('standings').innerHTML=rows.map((r,i)=>`<li class="${r===player?'you':''}"><b>${i+1}</b><span>${BOATS[r.spec].rider}${r===player?' / YOU':''}<small>${BOATS[r.spec].name}</small></span><em>${r.finished?formatTime(r.finishTime):r.eliminated?'ELIMINATED · '+Math.round(distance(r)/course.length*100)+'%':Math.round(distance(r)/course.length*100)+'% · RACING'}</em><i>${'●'.repeat(Math.max(0,3-(r.hits||0)))}${'○'.repeat(r.hits||0)}</i></li>`).join('');$('standings-note').textContent=rows.some(live)?'LIVE CLASSIFICATION · Remaining crews are still racing.':'FINAL CLASSIFICATION · All crews accounted for.';}
function racers(){return mode==='race'?[player,...opponents]:[player];}
function fireWeapon(special=false){if(state!=='race')return;if(!combat.fire(player,racers(),elapsed,special)){audio.effect('EMPTY');const reason=elapsed<3?'WEAPONS ARMING':player.fireCooldown>0?'RELOADING · '+player.fireCooldown.toFixed(1)+'s':special&&!player.special?'NO SPECIAL EQUIPPED':!special&&player.ammo<=0?'MISSILES EMPTY · COLLECT AMMO':'NO TARGET IN RANGE';weaponNotice(reason,'blocked');toast(reason);}}
function shield(){if(state==='race'){if(defend(player)){toast('COUNTERMEASURE SHIELD · 5 SECONDS');audio.effect('SHIELD');}else{toast('NO SHIELD CHARGES');audio.effect('EMPTY');}}}
function updateRivals(dt){if(mode!=='race')return;for(const b of opponents){
 if(!live(b))continue;tickCombat(b,dt);b.raceTime=elapsed;stepAI(b,BOATS[b.spec],course,world.pickups,dt,elapsed,CHAPTERS[chapter].difficulty,racers());combat.ai(b,racers(),dt,elapsed);
 const waterY=waveHeight(b.x,b.z,clock,ambientAmp),flight=stepFlight(b,waterY,dt);b.air=flight.air;b.airVelocity=flight.velocity;b.ramp=null;
 for(const ramp of world.ramps){const support=rampContact(b.previous,b,ramp,b.mesh.userData.hull.halfWidth,b.air);if(!support)continue;
  b.ramp=ramp.s;b.flightY=support.launch?Math.max(b.flightY??waterY,support.height+.12):support.height+.12;b.air=Math.max(0,b.flightY-waterY);
  if(support.launch&&b.speed>8&&b.lastRamp!==ramp.s){b.lastRamp=ramp.s;b.flightVelocity=b.airVelocity=launchVelocity(b.speed);}else if(!support.launch)b.flightVelocity=b.airVelocity=0;
 }
}}
function obstacles(dt){for(const r of racers()){if(!live(r))continue;let contact=false,impact=0,closingSpeed=0;
 for(const o of world.obstacles){if(Math.abs(courseDelta(distance(r),o.s,course.length))>35)continue;
 const altitude=(r===player?air:r.air||0)+waveHeight(r.x,r.z,clock,ambientAmp);if(altitude>o.height+.15||o.kind==='RAMP BACK'&&r.ramp===o.rampS)continue;
 const result=sweepHull(r.previous||r,r,o,(r===player?hero:r.mesh).userData.hull);
 if(!result.hit)continue;r.x=result.x;r.z=result.z;contact=true;const closing=Math.max(0,-r.speed*(Math.sin(r.heading)*result.normal.x+Math.cos(r.heading)*result.normal.z));closingSpeed=Math.max(closingSpeed,closing);impact=Math.max(impact,closing/Math.max(.001,Math.abs(r.speed)));
 const n=course.nearest(r.x,r.z,r.s);if(r===player){let d=courseDelta(n.s,player.s,course.length);if(Math.abs(d)<100)player.progress+=d;player.s=n.s;player.lateral=n.lateral;}else{r.s=n.s;r.lane=n.lateral;}
 }
 if(contact){r.speed*=1-.78*impact;if(impact>.25)r.slow=Math.max(r.slow||0,.45);}
 if(barrierImpact(r,contact,closingSpeed,dt)&&r===player){race.collisions++;lens.splash(.45);toast(mobile?'HULL CONTACT · HOLD BRAKE TO REVERSE':'HULL CONTACT · HOLD S / ↓ TO REVERSE');audio.effect('IMPACT');}
}}
function updateCombat(dt){combat.update(dt,racers(),elapsed,world.obstacles);for(const event of combat.events.splice(0)){
 if(event.type==='fire'){combatFX.launch(event.racer,event.shot,course);if(event.racer===player){audio.weapon(event.weapon);weaponNotice(event.weapon+' AWAY'+(event.weapon==='MISSILE'?(event.shot.target?' · TARGET LOCKED':' · UNGUIDED'):''));}}
 else if(event.type==='blast'){combatFX.burst(event.s,event.lane,course);if(event.source===player&&event.reason==='OBSTACLE'){weaponNotice(event.weapon+' HIT SCENERY','blocked');audio.weapon('IMPACT');}}
 else if(event.type==='miss'){if(event.source===player){weaponNotice(event.weapon+' MISSED','miss');audio.tone(220,.12,0,.07,'sine',160);}}
 else{const r=event.racer;if(event.type==='blocked')combatFX.collect({s:distance(r),offset:lane(r),type:'SHIELD'},course);else combatFX.burst(distance(r),lane(r),course,(r===player?player.visualY:r.mesh?.position.y??0)+2.2);if(r===player){if(event.type==='hit'){lens.splash(.6);audio.weapon('IMPACT');toast(r.eliminated?'CRITICAL HULL FAILURE':`HULL HIT ${r.hits} / 3 · RECOVERY SHIELD`);}else{toast('INCOMING BLOCKED');audio.effect('BLOCK');}}else if(event.source===player){const message=event.type==='blocked'?'SHIELD BLOCKED · NO DAMAGE':r.eliminated?BOATS[r.spec].rider+' ELIMINATED':'HIT CONFIRMED · '+BOATS[r.spec].rider+' · '+r.hits+'/3';weaponNotice(message,event.type==='blocked'?'blocked':'hit');toast(message);audio.effect(event.type==='blocked'?'BLOCK':'IMPACT');}}
 }if(state==='race'&&player.eliminated)finish(true);}
function toDock(){
 state='menu';lens.clear();combatFX.clear();wasBoosting=false;steering=0;air=airVelocity=0;player.flightY=null;player.flightVelocity=0;player.ramp=null;clearInput();
 $('hud').hidden=true;$('touch').hidden=true;$('results').hidden=true;$('pause').hidden=true;
 const next=CHAPTERS.findIndex((_,i)=>!save.cleared[i]&&unlocked(save,i));if(next>=0&&save.cleared[chapter])previewArena=next;
 const a=course.at(180);Object.assign(player,{x:a.p.x,z:a.p.z,heading:a.heading,speed:0,progress:0,s:180});
 dock.position.set(player.x,0,player.z);dock.rotation.y=player.heading;showSetup('dock');
}
function pause(){if(state==='race'||state==='countdown'){pausedFrom=state;audio.update(0,false,false);state='paused';clearInput();$('pause').hidden=false;$('touch').hidden=true;}else if(state==='paused'){state=pausedFrom;$('pause').hidden=true;$('touch').hidden=!mobile;previous=performance.now();}}
function recover(){if(state!=='race')return;const a=course.at(player.s);player.x=a.p.x;player.z=a.p.z;player.heading=a.heading;player.speed=8;air=airVelocity=0;player.flightY=null;player.flightVelocity=0;pendingJump=false;toast('BACK ON COURSE');audio.effect('RECOVER');}
function control(){return clamp((keys.has('ArrowLeft')||keys.has('KeyA')?1:0)-(keys.has('ArrowRight')||keys.has('KeyD')?1:0)-stick,-1,1);}
function nextSurge(){if(!world||!course||course.sector(player.s)!==4)return null;let nearest=null;for(const g of world.surges){if(g.used)continue;const distance=((g.s-player.s)%course.length+course.length)%course.length;if(distance>course.length*.8)continue;const phase=(clock+g.phase)%10;const info={distance,open:phase<7,closesIn:phase<7?7-phase:0,opensIn:phase<7?0:10-phase};if(!nearest||distance<nearest.distance)nearest=info;}return nearest;}
function updateRace(dt){
 player.previous={x:player.x,z:player.z};const launching=player.launch>0;tickPerks(player,dt);tickCombat(player,dt);player.raceTime=elapsed;
 if(launching&&player.launch===0)toast(mobile?'LAUNCH COMPLETE · HOLD BOOST FOR 10 MORE SECONDS':'LAUNCH COMPLETE · HOLD SPACE FOR 10 MORE SECONDS');
 const boat=BOATS[boatIndex];steering=lerp(steering,control(),1-Math.exp(-dt*7));const braking=brakeHeld||keys.has('ArrowDown')||keys.has('KeyS'),wantsBoost=boostHeld||keys.has('Space');
 const boosting=stepBoost(player,wantsBoost,braking||player.speed<0,dt);
 if(boosting&&!wasBoosting){race.boosts++;audio.effect('BOOST');}wasBoosting=boosting;
 const max=boat.speed*pace(player,racers())*(boosting?boat.boost:1)*(player.overdrive>0||player.nitro>0?1.12:1);player.speed=stepDrive(player.speed,max,braking,dt,player.launch>0);
 player.heading+=steering*boat.turn*(.3+.7*clamp(Math.abs(player.speed)/30,0,1))*clamp(player.speed/.8,-1,1)*dt*(air>.3?.7:1);
 if(Math.abs(steering)<.08&&air<.3&&player.speed>0&&!braking){const guide=course.at(player.s+20);player.heading+=angle(guide.heading-player.heading)*dt*.62;}
 player.x+=Math.sin(player.heading)*player.speed*dt;player.z+=Math.cos(player.heading)*player.speed*dt;
 const n=course.nearest(player.x,player.z,player.s);let delta=n.s-player.s;if(delta<-course.length/2)delta+=course.length;if(delta>course.length/2)delta-=course.length;if(Math.abs(delta)<100){player.progress+=delta;player.s=n.s;}player.lateral=n.lateral;
 if(n.distance>course.width-2){const push=clamp((n.distance-course.width+2)*dt*4,0,1);player.x=lerp(player.x,n.p.x,push*.35);player.z=lerp(player.z,n.p.z,push*.35);player.speed*=Math.pow(.25,dt);player.heading+=angle(n.heading-player.heading)*dt*.85;if(n.distance>course.width+8&&Math.abs(steering)<.1)player.heading=n.heading;}
 if(n.distance>course.width*2){recover();race.collisions++;}
 elapsed+=dt;
 const waterY=waveHeight(player.x,player.z,clock,ambientAmp),flight=stepFlight(player,waterY,dt);air=flight.air;airVelocity=flight.velocity;
 if(flight.landed&&pendingJump){pendingJump=false;race.jumps++;lens.splash(.25);toast('CLEAN LANDING');audio.effect('LAND');}
 player.ramp=null;for(const r of world.ramps){
  const support=rampContact(player.previous,player,r,hero.userData.hull.halfWidth,air);if(!support)continue;player.ramp=r.s;
  player.flightY=support.launch?Math.max(player.flightY??waterY,support.height+.12):support.height+.12;air=Math.max(0,player.flightY-waterY);
  if(support.launch&&player.speed>8&&!r.used){r.used=true;player.flightVelocity=airVelocity=launchVelocity(player.speed);pendingJump=true;audio.effect('RAMP');}else if(!support.launch)player.flightVelocity=airVelocity=0;
 }
 updateRivals(dt);obstacles(dt);
 const claims=resolvePickups(world.pickups,mode==='race'?[player,...opponents.filter(b=>!b.finished)]:[player]);
 for(const {pickup:p,racer:r} of claims){p.obj.visible=false;if(r===player){if(p.type!=='DEATH')race.pickups++;toast(p.type==='DEATH'?(player.eliminated?'LETHAL MINE':'MINE BLOCKED'):p.type+' CLAIMED');combatFX.collect(p,course);audio.pickup(p.type);showPickup(p.type);}}
 for(const g of world.surges){let d=player.s-g.s;if(d<-course.length/2)d+=course.length;if(!g.used&&Math.abs(d)<7&&g.open){g.used=true;race.surges++;player.boost=100;player.speed+=9;toast('SURGE WINDOW CAUGHT');audio.effect('BOOST');}}
 // Soft hull contacts: preserve control while preventing boats passing through each other.
 if(mode==='race'&&air<1.2)for(const [i,b] of opponents.entries()){
  if(!live(b))continue;
  const dx=player.x-b.mesh.position.x,dz=player.z-b.mesh.position.z,h=b.mesh.rotation.y;
  const longitudinal=dx*Math.sin(h)+dz*Math.cos(h),lateral=dx*Math.cos(h)-dz*Math.sin(h);
  const clearance=hero.userData.hull.halfWidth+b.mesh.userData.hull.halfWidth;
  if(Math.abs(longitudinal)<5.5&&Math.abs(lateral)<clearance){const side=Math.sign(lateral)||(i%2?1:-1),push=(clearance-Math.abs(lateral))*Math.min(1,dt*9);player.x+=Math.cos(h)*side*push;player.z-=Math.sin(h)*side*push;if(player.shield<=0)player.speed*=Math.pow(.65,dt);if(b.shield<=0)b.speed*=Math.pow(.75,dt);if(clock-(b.contact||-10)>.7){race.collisions++;b.contact=clock;}}
 }
 race.place=mode==='time'?1:standings(racers()).indexOf(player)+1;
 document.body.classList.toggle('boosting',boosting);audio.update(player.speed,boosting,true);
 if(player.speed>30&&air<.1){const closeWake=mode==='race'&&opponents.some(b=>b.s-player.progress>3&&b.s-player.progress<20&&Math.abs(b.lane-player.lateral)<4);if(closeWake&&clock-lens.last>2.3)lens.splash(.45);else if(ambientAmp>.65&&clock-lens.last>7&&Math.sin(clock*1.7)>.96)lens.splash(.3);}
 updateCombat(dt);if(state==='race'&&player.progress>=course.length&&elapsed>10)finish();
}
function updateBoats(dt){player.air=air;const amp=ambientAmp;const height=waveHeight(player.x,player.z,clock,amp);hero.position.set(player.x,height-.12+air,player.z);player.visualY=hero.position.y;hero.rotation.y=player.heading;const forward=waveHeight(player.x+Math.sin(player.heading)*2,player.z+Math.cos(player.heading)*2,clock,amp),back=waveHeight(player.x-Math.sin(player.heading)*2,player.z-Math.cos(player.heading)*2,clock,amp);const pitch=player.ramp!==null&&player.ramp!==undefined?-Math.atan(.16):air>.3?-Math.atan2(airVelocity,Math.max(20,Math.abs(player.speed))):-(forward-back)/4-player.speed*.0012;hero.rotation.x=lerp(hero.rotation.x,pitch,1-Math.exp(-dt*4.5));hero.rotation.z=lerp(hero.rotation.z,-steering*.17*player.speed/38,1-Math.exp(-dt*5));
 animateCraft(hero,player.speed,wasBoosting,steering,air,dt,clock,previewRev);animateDamage(hero,inFront()?{}:player,elapsed);if(inFront()){fleet.forEach(o=>o.visible=o===hero);return;}
 opponents.forEach((b,i)=>{const a=course.at(b.s,b.lane);b.mesh.position.copy(a.p);const jump=b.air||0;b.mesh.position.y=waveHeight(a.p.x,a.p.z,clock,amp)-.12+jump;const pitch=b.ramp!==null?-Math.atan(.16):jump>.3?-Math.atan2(b.airVelocity||0,Math.max(20,b.speed)):-b.speed*.001;b.mesh.rotation.set(lerp(b.mesh.rotation.x,pitch,1-Math.exp(-dt*4.5)),a.heading,Math.sin(clock+i)*.035);animateCraft(b.mesh,b.speed,b.boosting,0,jump,dt,clock+i);animateDamage(b.mesh,b,elapsed);b.mesh.visible=mode==='race'&&!inFront()&&Math.abs(b.s-player.progress)<500&&b.s<course.length&&(!b.eliminated||damageReaction(b,elapsed).active);b.mesh.scale.setScalar(1);if(state==='race'&&live(b)&&b.mesh.visible&&clock-lastWake>.06&&mode==='race'){for(const side of [-1,1])wake.emit(a.p.x-Math.sin(a.heading)*3+Math.cos(a.heading)*side*1.2,.08,a.p.z-Math.cos(a.heading)*3-Math.sin(a.heading)*side*1.2,a.heading+side*.15,b.speed);};});
 if(Math.abs(player.speed)>3&&clock-lastWake>.06&&state==='race'){lastWake=clock;const travelHeading=player.heading+(player.speed<0?Math.PI:0),sx=Math.sin(travelHeading),sz=Math.cos(travelHeading);for(const side of [-1,1])wake.emit(player.x-sx*3.5+sz*side*1.1,.05,player.z-sz*3.5-sx*side*1.1,travelHeading+side*.15,Math.abs(player.speed));if(air<.5)for(const side of [-1,1])spray.emit(player.x-sx*1.5+sz*side*1.1,.2,player.z-sz*1.5-sx*side*1.1,-sx*9+sz*side*7,-sz*9-sx*side*7,wasBoosting);}
 wake.update(dt,clock,amp);spray.update(dt);
}
const cameraTarget=new THREE.Vector3(),look=new THREE.Vector3(),lastCameraHero=new THREE.Vector3(),cameraMotion=new THREE.Vector3();
function updateCamera(dt){const dir=new THREE.Vector3(Math.sin(player.heading),0,Math.cos(player.heading)),side=new THREE.Vector3(dir.z,0,-dir.x);if(inFront()){if(!orbitTouched)orbitYaw+=dt*.065;const yaw=player.heading+orbitYaw,radius=inspectRider?(mobile?7.5:6):orbitZoom*(mobile?(innerWidth>innerHeight?.86:1.32):1);cameraTarget.set(hero.position.x+Math.sin(yaw)*radius,hero.position.y+Math.sin(orbitPitch)*radius+1.7,hero.position.z+Math.cos(yaw)*radius);look.copy(hero.position);look.y+=inspectRider?2.1:1.3;}else{cameraTarget.copy(hero.position).addScaledVector(dir,-(mobile?12:10.5)-Math.abs(player.speed)*.035);cameraTarget.y=hero.position.y+4.1;look.copy(hero.position).addScaledVector(dir,15);look.y=hero.position.y+1.4;}
 // Follow the actual displacement before smoothing the relative chase offset.
 // Smoothing world position alone adds speed/5 metres of lag during turbo.
 cameraMotion.set(hero.position.x-lastCameraHero.x,0,hero.position.z-lastCameraHero.z);
 if(!inFront()&&state!=='countdown'&&cameraMotion.lengthSq()<400)camera.position.add(cameraMotion);
 lastCameraHero.copy(hero.position);
 camera.position.lerp(cameraTarget,1-Math.exp(-dt*(inFront()?1.7:5)));camera.lookAt(look);camera.fov=lerp(camera.fov,(mobile?66:58)+(wasBoosting?12:0),1-Math.exp(-dt*3));camera.updateProjectionMatrix();
 fill.position.copy(hero.position).add(new THREE.Vector3(5,8,6));fill.target.position.copy(hero.position);fill.target.updateMatrixWorld();fill.intensity=inFront()?6:1.4;rim.position.copy(hero.position).add(new THREE.Vector3(-5,5,-8));rim.target.position.copy(hero.position);rim.target.updateMatrixWorld();
 sun.position.copy(hero.position).addScaledVector(sun.userData.dir,160);sun.target.position.copy(hero.position);sun.target.updateMatrixWorld();water.mesh.position.x=Math.round(player.x/100)*100;water.mesh.position.z=Math.round(player.z/100)*100;
}
function drawMap(){const canvas=$('minimap'),ctx=canvas.getContext('2d'),size=240;ctx.clearRect(0,0,size,size);const pts=course.samples;let max=0;for(const p of pts)max=Math.max(max,Math.abs(p.x),Math.abs(p.z));const scale=90/max;const xy=(x,z)=>[120+x*scale,120-z*scale];ctx.lineJoin='round';ctx.beginPath();pts.forEach((p,i)=>{const a=xy(p.x,p.z);i?ctx.lineTo(...a):ctx.moveTo(...a);});ctx.closePath();ctx.strokeStyle='#08283399';ctx.lineWidth=13;ctx.stroke();ctx.strokeStyle='#e9f4ee88';ctx.lineWidth=3;ctx.stroke();if(mode==='race')for(const b of opponents){const p=course.at(b.s).p;ctx.beginPath();ctx.arc(...xy(p.x,p.z),3,0,Math.PI*2);ctx.fillStyle=b.eliminated?'#514e50':'#'+ENGINE_COLORS[b.spec].toString(16).padStart(6,'0');ctx.fill();}const p=xy(player.x,player.z);ctx.save();ctx.translate(...p);ctx.rotate(player.heading);ctx.beginPath();ctx.moveTo(0,-7);ctx.lineTo(-4,5);ctx.lineTo(4,5);ctx.closePath();ctx.fillStyle='#ff7854';ctx.fill();ctx.restore();}
function updateHud(){if(inFront()||state==='loading')return;$('speed').textContent=String(Math.round(Math.abs(player.speed)*3.6)).padStart(3,'0');$('speed-unit').textContent=player.speed<-.5?'REV · KM/H':'KM/H';$('brakeb').textContent=player.speed<-.5?'REVERSE':'BRAKE / REV';$('timer').textContent=formatTime(elapsed);$('position').textContent=race.place;$('boostfill').style.width=player.boost+'%';$('boost-time').innerHTML=(player.boost/10).toFixed(1)+'<small> / 10s</small>';document.querySelector('.boost-meter').setAttribute('aria-valuenow',(player.boost/10).toFixed(1));$('boost-status').textContent=player.nitro>0?'NITRO '+player.nitro.toFixed(1)+'s · RESERVE SAVED':player.launch>0?'LAUNCH ASSIST '+player.launch.toFixed(1)+'s':wasBoosting?'BOOST ENGAGED':player.boostEmpty&&(boostHeld||keys.has('Space'))?'RELEASE TO REARM':player.boost<100?'REFILL '+((100-player.boost)/10).toFixed(1)+'s · HOLD SPACE':'READY · HOLD SPACE';$('shield-status').hidden=player.shield<=0;$('shield-time').textContent=player.shield.toFixed(1)+'s';$('shield-fill').style.width=Math.min(100,player.shield/5*100)+'%';if(clock>pickupUntil)$('pickup-notice').hidden=true;$('progressfill').style.width=clamp(player.progress/course.length*100,0,100)+'%';$('objective-hud').innerHTML=mode==='race'?'<b>'+objectiveProgress(chapter,race)+'</b><br>'+(PREVIEW_UNLOCKS?'PREVIEW RUN · ALL CONTENT AVAILABLE':CHAPTERS[chapter].objective):'BEAT YOUR BEST · '+(save.best[chapter]?formatTime(save.best[chapter]):'SET A TIME');const gate=nextSurge();if(gate&&gate.distance<180)$('objective-hud').innerHTML+='<br><b>'+Math.round(gate.distance)+' M · '+(gate.open?'OPEN '+gate.closesIn.toFixed(1)+' S':'OPENS IN '+gate.opensIn.toFixed(1)+' S · BRAKE TO WAIT')+'</b>';drawMap();updateCombatHud();}
function lethalAhead(){return world.pickups.find(p=>p.type==='DEATH'&&!p.collected&&p.s-player.progress>0&&p.s-player.progress<120&&Math.abs(p.offset-player.lateral)<7);}
function updateCombatHud(){
 if(state==='results'){updateStandings();return;}
 const hazard=lethalAhead(),all=racers(),target=targetFor(player,all),incoming=combat.shots.find(p=>p.owner!==player.id&&(p.target===player.id||Math.abs(p.lane-player.lateral)<5)&&player.progress-p.s>0&&player.progress-p.s<160);
 $('fireb').disabled=player.ammo<=0||player.fireCooldown>0||elapsed<3;$('specialb').disabled=!player.special||player.fireCooldown>0||elapsed<3||(!['MINE','BOMB'].includes(player.special)&&!targetFor(player,all,player.special==='SEEKER'?520:340));$('shieldb').disabled=player.defenses<=0;
 $('hull').textContent='●'.repeat(Math.max(0,3-(player.hits||0)))+'○'.repeat(player.hits||0);$('hull').classList.toggle('critical',player.hits===2);
 $('ammo').textContent=player.ammo??4;$('special-label').textContent=player.special?player.special+' ×'+player.specialAmmo:'SPECIAL';$('shield-count').textContent=player.defenses??2;
 const feedback=clock<weaponFeedback.until;
 $('weapon-target').textContent=feedback?weaponFeedback.text:elapsed<3?'WEAPONS ARMING · '+Math.ceil(3-elapsed)+'s':player.ammo<=0?'MISSILES EMPTY · COLLECT AMMO':player.fireCooldown>0?'RELOADING · '+player.fireCooldown.toFixed(1)+'s':target?'LOCK · '+BOATS[target.spec].rider+' / '+Math.round(distance(target)-player.progress)+' M':mobile?'NO LOCK · TAP MISSILE TO FIRE AHEAD':'NO LOCK · F TO FIRE AHEAD';
 $('weapon-target').dataset.feedback=feedback?weaponFeedback.kind:'';
 $('incoming').textContent=hazard?'LETHAL MINE AHEAD · CHANGE LANE / E SHIELD':incoming?'MISSILE INBOUND · CHANGE LANE / E SHIELD':player.invulnerable>0?'RECOVERY SHIELD '+Math.ceil(player.invulnerable)+' S':player.shield>0?'SHIELD ACTIVE '+Math.ceil(player.shield)+' S':player.drafting?'SLIPSTREAM +12%':player.pursuit>.01?'PURSUIT POWER +'+Math.round(player.pursuit*100)+'%':'';
 $('incoming').classList.toggle('danger',!!incoming||!!hazard);
 $('rival-list').innerHTML=standings(all).map((r,i)=>`<div class="${r===player?'self':''} ${r.eliminated?'out':''}"><b>${i+1}</b><span style="color:#${ENGINE_COLORS[r.spec??0].toString(16).padStart(6,'0')}">${r===player?'YOU':BOATS[r.spec].rider}</span><em>${r.eliminated?'OUT':r.finished?'FIN':r===player?'●'.repeat(3-(r.hits||0)):((distance(r)-player.progress)>0?'+':'')+Math.round(distance(r)-player.progress)+'m'}</em></div>`).join('');
 $('rival-tags').innerHTML=mode!=='race'?'':opponents.filter(b=>live(b)&&b.mesh.visible&&b.s-player.progress>-12&&b.s-player.progress<350).map(b=>{const v=b.mesh.position.clone();v.y+=4.6;v.project(camera);if(v.z>1||Math.abs(v.x)>1.1||Math.abs(v.y)>1.1)return '';return `<span class="rival-tag ${target===b?'locked':''} ${damageReaction(b,elapsed).active?'damaged':''}" style="left:${(v.x*.5+.5)*100}%;top:${(-v.y*.5+.5)*100}%"><b>${BOATS[b.spec].rider}</b> ${Math.round(b.s-player.progress)}m<small>${damageReaction(b,elapsed).active?'HIT · ':b.shield>0?'SHIELD · ':b.invulnerable>0?'RECOVERY · ':''}${'●'.repeat(3-b.hits)}${'○'.repeat(b.hits)}</small></span>`;}).join('');
 const row=world.pickups.find(p=>!p.collected&&p.s>player.progress);$('supply-distance').textContent=row?'SUPPLY LINE · '+Math.round(row.s-player.progress)+' M':'FINAL APPROACH';
}
function frame(now){requestAnimationFrame(frame);const raw=(now-previous)/1000;previous=now;const dt=Math.min(.05,raw);fps=lerp(fps,1/Math.max(raw,.001),.05);if(!hero||!world||preparing){if(window.__GAME__)window.__GAME__.state=state;return;}if((state==='title'||(state==='menu'&&menuStep==='arenas'))&&window.__GAME__){window.__GAME__.state=state;window.__GAME__.menuStep=menuStep;audio.update(0,false,false);return;}if(state==='race'){const ratio=quality.sample(raw*1000);if(ratio)renderer.setPixelRatio(ratio);}const revving=state==='menu'&&menuStep==='dock'&&(revHeld||keys.has('KeyR')||clock<revUntil);previewRev=lerp(previewRev,revving?1:0,1-Math.exp(-dt*(revving?9:3.5)));$('revb').setAttribute('aria-pressed',String(revving));$('revb').style.setProperty('--rev',previewRev.toFixed(3));if(state!=='paused'){clock+=dt;if(!inFront())world.update(clock,player.s);updateEnvironment(dt);lens.update(dt,clock,state);water.uniforms.time.value=clock;if(state==='countdown'){const before=Math.ceil(countdown);countdown-=dt;const after=Math.ceil(countdown);$('countdown').textContent=countdown>0?after:'GO';if(after!==before)audio.tone(after>0?400:800,.1);if(countdown<=0){state='race';announce('TURBO IGNITION · WEAPONS LIVE IN 3',2.5);setTimeout(()=>$('countdown').textContent='',650);}}if(state==='race')updateRace(dt);else{audio.update(0,false,false,previewRev,state==='menu'&&menuStep==='dock');if(state==='results'&&opponents.some(live)&&mode==='race'){elapsed+=dt;updateRivals(dt);resolvePickups(world.pickups,opponents.filter(live));obstacles(dt);updateCombat(dt);}}updateBoats(dt);updateCamera(dt);if(!inFront())combatFX.update(state==='paused'?0:dt,clock,combat,racers(),course,player,elapsed);}
 $('announcement').style.opacity=clock<announcementUntil?'1':'0';if(clock>toastUntil)$('checkpoint-toast').textContent='';world.root.visible=!inFront();water.mesh.visible=!inFront();wake.mesh.visible=spray.mesh.visible=!inFront();dock.visible=inFront();combatFX.group.visible=!inFront();atmosphere.mist.visible=!inFront();renderer.info.reset();if(now-shadowAt>(mobile?1000/15:1000/30)){renderer.shadowMap.needsUpdate=true;shadowAt=now;}if(!inFront())reflection.update(scene,camera,water.mesh,[wake.mesh,spray.mesh,combatFX.group,...world.reflectionHidden(player.s)],clock);lens.render(scene,camera);if(now>nextHud){updateHud();nextHud=now+80;}
 const guide=course.at(player.s+clamp(player.speed*.6,12,50)).p;window.__GAME__={renderScale:renderer.getPixelRatio(),rev:previewRev,audio:{state:audio.ctx?.state,enabled:audio.enabled,startupPlayed:audio.startupPlayed,selectionCount:audio.selectionCount,lastCue:audio.lastCue,engineGain:audio.engineGain?.gain.value,masterGain:audio.master?.gain.value,musicPlaying:audio.music?.playing===true,musicError:audio.musicError,dockGain:audio.dockGain?.gain.value,musicMode:audio.racing?'race':'ambient',ambientMusicGain:audio.music?.gain.gain.value,raceMusicGain:audio.raceMusic?.gain.gain.value,raceMusicReady:audio.raceMusic?.playing===true,raceMusicError:audio.raceMusicError},previewUnlocks:PREVIEW_UNLOCKS,cameraDistance:camera.position.distanceTo(hero.position),menuStep,arena:course.config.id,checkpoint:course.leg(player.progress),sector:course.sector(player.s),sectorName:course.environment(player.s).short,pickups:race.pickups,roster:BOATS.map((_,i)=>boatUnlocked(save,i)),rivals:opponents.map(b=>({id:b.id,name:BOATS[b.spec].rider,s:b.s,lane:b.lane,speed:b.speed,launch:b.launch,nitro:b.nitro,boost:b.boost,claimed:b.claimed,shield:b.shield,invulnerable:b.invulnerable,hits:b.hits,impactAt:b.impactAt,damagePose:b.mesh.userData.damagePose,visible:b.mesh.visible,ammo:b.ammo,eliminated:b.eliminated,finished:b.finished,shots:b.shots,damageDealt:b.damageDealt})),nextPickup:world.pickups.filter(p=>p.type!=='DEATH'&&!p.collected&&p.s>player.progress).sort((a,b)=>(a.s-player.progress+Math.abs(a.offset-player.lateral)*3)-(b.s-player.progress+Math.abs(b.offset-player.lateral)*3)).slice(0,1).map(p=>({s:p.s,offset:p.offset,type:p.type}))[0],lethalAhead:lethalAhead()?{distance:lethalAhead().s-player.progress,offset:lethalAhead().offset}:null,weapons:{feedback:weaponFeedback,missiles:combat.shots.filter(p=>p.owner===player.id).map(p=>({id:p.id,s:p.s,lane:p.lane,age:p.age,type:p.type,target:p.target})),ammo:player.ammo,special:player.special,specialAmmo:player.specialAmmo,defenses:player.defenses,hits:player.hits,kills:player.kills,shots:player.shots,damageDealt:player.damageDealt,shield:player.shield,invulnerable:player.invulnerable,eliminated:player.eliminated,incoming:combat.shots.some(p=>p.owner!==player.id&&(p.target===player.id||Math.abs(p.lane-player.lateral)<5)&&player.progress-p.s>0&&player.progress-p.s<160),cooldown:player.fireCooldown,projectiles:combat.shots.length,target:targetFor(player,racers())?.id,pursuit:player.pursuit,drafting:player.drafting},obstacleAhead:world.obstacles.filter(o=>o.s>player.progress&&o.s-player.progress<160),orbit:{yaw:orbitYaw,pitch:orbitPitch},lensDrops:lens.count,surgeWindow:nextSurge(),craft:BOATS[boatIndex].name,foilAngle:hero.userData.foils[0].rotation.z,engineIntensity:hero.userData.energy[0]?.emissiveIntensity,exhaustScale:hero.userData.plumes[0]?.scale.z,air,flightY:player.flightY,verticalSpeed:player.flightVelocity,renderY:hero.position.y,pitch:hero.rotation.x,hullCollider:hero.userData.hull,launch:player.launch,nitro:player.nitro,boosting:player.boosting,ramp:player.ramp,barrierContact:player.barrierContact,reversing:player.speed<-.5,collisions:race.collisions,rampsAhead:world.ramps.filter(r=>r.s>player.progress-15&&r.s<player.progress+180).map(r=>({s:r.s,used:r.used})),pos:[player.x,player.z],fps,speed:player.speed,score:race.signals+race.jumps+race.surges,over:state==='results',draws:renderer.info.render.calls,tris:renderer.info.render.triangles,progress:Math.max(0,player.progress/course.length),heading:player.heading,guideHeading:Math.atan2(guide.x-player.x,guide.z-player.z),lateral:player.lateral,boost:player.boost,boosts:race.boosts,jumps:race.jumps,signals:race.signals,surges:race.surges,place:race.place,chapter,state,unlocked:CHAPTERS.map((_,i)=>unlocked(save,i)),elapsed,courseLength:course.length};
}
function bindInput(){
 document.addEventListener('click',e=>{const b=e.target.closest('button:not(:disabled)');if(!b||b.id==='revb'||b.id==='startup-audio'||b.id==='soundb')return;const kind=b.hasAttribute('data-boat')?'CRAFT':['startb','quickraceb','againb','restartb'].includes(b.id)?'LAUNCH':['homeb','backdockb','dockb','exitb'].includes(b.id)?'BACK':'NAVIGATE';audio.activate().then(()=>audio.select(kind)).catch(()=>{});},{capture:true});
 const rev=$('revb');let revPointer=null;rev.onpointerdown=e=>{e.preventDefault();revPointer=e.pointerId;rev.setPointerCapture(e.pointerId);revHeld=true;revUntil=clock+.65;enableAudio();};const stopRev=()=>{revHeld=false;revPointer=null;};rev.onpointerup=stopRev;rev.onpointercancel=()=>{stopRev();revUntil=0;};rev.onlostpointercapture=()=>{if(revPointer!==null){stopRev();revUntil=0;}};rev.onkeydown=e=>{if(['Space','Enter'].includes(e.code)){e.preventDefault();revHeld=true;enableAudio();}};rev.onkeyup=e=>{if(['Space','Enter'].includes(e.code)){e.preventDefault();stopRev();}};rev.onblur=()=>{stopRev();revUntil=0;};rev.onclick=e=>{if(e.detail===0){revUntil=clock+1.5;enableAudio();}};

 window.addEventListener('keydown',e=>{if((state==='race'||state==='countdown')&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(e.code==='Escape'&&!e.repeat)pause();if(e.code==='KeyR'&&!e.repeat){if(state==='menu'&&menuStep==='dock')enableAudio();else recover();}if(e.code==='KeyF'&&!e.repeat)fireWeapon();if(e.code==='KeyQ'&&!e.repeat)fireWeapon(true);if(e.code==='KeyE'&&!e.repeat)shield();keys.add(e.code);});window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{clearInput();if(state==='race'||state==='countdown')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&(state==='race'||state==='countdown'))pause();});
 const stickEl=$('stick');let pointer=null;const setStick=e=>{const r=stickEl.getBoundingClientRect();stick=clamp((e.clientX-r.left-r.width/2)/(r.width*.36),-1,1);stickEl.firstElementChild.style.transform=`translate(${stick*30}px, ${clamp(e.clientY-r.top-r.height/2,-25,25)}px)`;stickEl.setAttribute('aria-valuenow',stick.toFixed(2));};stickEl.onpointerdown=e=>{e.preventDefault();pointer=e.pointerId;stickEl.setPointerCapture(pointer);setStick(e);};stickEl.onpointermove=e=>{if(e.pointerId===pointer)setStick(e);};const release=()=>{pointer=null;stick=0;stickEl.firstElementChild.style.transform='';};stickEl.onpointerup=release;stickEl.onpointercancel=release;stickEl.onlostpointercapture=release;
 for(const [id,set] of [['boostb',v=>boostHeld=v],['brakeb',v=>brakeHeld=v]]){const b=$(id);b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);set(true);};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>set(false);}
 $('fireb').onclick=()=>fireWeapon();$('specialb').onclick=()=>fireWeapon(true);$('shieldb').onclick=shield;
 const zone=$('orbit-zone');let orbitPointer=null,lastX=0,lastY=0;zone.onpointerdown=e=>{orbitPointer=e.pointerId;zone.setPointerCapture(e.pointerId);lastX=e.clientX;lastY=e.clientY;orbitTouched=true;};zone.onpointermove=e=>{if(e.pointerId!==orbitPointer)return;orbitYaw-=(e.clientX-lastX)*.009;orbitPitch=clamp(orbitPitch+(e.clientY-lastY)*.005,.08,.85);lastX=e.clientX;lastY=e.clientY;zone.setAttribute('aria-valuenow',Math.round(((orbitYaw*180/Math.PI)%360+360)%360));};zone.onpointerup=zone.onpointercancel=()=>orbitPointer=null;zone.onwheel=e=>{e.preventDefault();orbitZoom=clamp(orbitZoom+e.deltaY*.012,8,21);};zone.onkeydown=e=>{if(['ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='ArrowLeft')orbitYaw-=.2;if(e.code==='ArrowRight')orbitYaw+=.2;orbitTouched=true;};
 $('quickraceb').onclick=quickRace;$('enterdock').onclick=()=>{enableAudio();showSetup('dock');};$('arenasb').onclick=()=>{if(boatUnlocked(save,boatIndex))showSetup('arenas');};$('backdockb').onclick=()=>showSetup('dock');$('homeb').onclick=()=>{revHeld=false;revUntil=0;previewRev=0;state='title';$('menu').hidden=true;$('loading').hidden=false;};
 $('inspectb').onclick=()=>{inspectRider=!inspectRider;$('inspectb').textContent=inspectRider?'VIEW MACHINE ↗':'RIDER DETAIL ↗';};$('startb').onclick=launchArena;$('againb').onclick=start;$('restartb').onclick=start;$('dockb').onclick=toDock;$('exitb').onclick=toDock;$('pauseb').onclick=pause;$('resumeb').onclick=pause;$('soundb').onclick=()=>{if(audio.enabled&&audio.ctx?.state==='running'&&!audio.musicError)audio.setEnabled(false);else{audio.setEnabled(true);enableAudio().then(()=>audio.select('NAVIGATE'));}syncSound();};
 document.querySelectorAll('[data-boat]').forEach(b=>b.onclick=()=>{boatIndex=+b.dataset.boat;makeHero();syncMenu();});document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;document.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('selected',x===b));opponents.forEach(o=>o.mesh.visible=false);syncArena();});
 window.addEventListener('resize',()=>{quality=createRenderQuality({mobile,dpr:devicePixelRatio,width:innerWidth,height:innerHeight});renderer.setPixelRatio(state==='menu'&&menuStep==='dock'&&mobile?Math.min(devicePixelRatio,1.5):quality.ratio);renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});
}

function setupOpponents(){
 // A dock selection can reuse a former rival. Rebuild visibility from the current crew.
 fleet.forEach(mesh=>mesh.visible=mesh===hero);
 opponents.length=0;
 BOATS.forEach((spec,index)=>{if(index===boatIndex)return;const i=opponents.length,mesh=fleet[index];mesh.visible=false;mesh.rotation.set(0,0,0);animateDamage(mesh,{},0);opponents.push({id:'rival-'+index,index:i,spec:index,mesh,s:i<3?10:-3,speed:0,boost:100,claimed:0,lane:[-16,0,16,-12,12][i],homeLane:[-16,0,16,-12,12][i],shield:0,overdrive:0,x:0,z:0});});
}
function updateEnvironment(dt){
 const n=course.sector(player.s),c=SECTORS[n],blend=1-Math.exp(-dt*.4);
 if(n!==currentSector)currentSector=n;const leg=course.leg(player.progress);if(leg!==currentLeg){currentLeg=leg;if(state==='race'){announce(CHAPTERS[chapter].legs[leg],3);audio.tone(360,.2);}$('sector-label').textContent=c.short;$('progress-label').textContent='CHECKPOINT '+String(leg+1).padStart(2,'0')+' / 06 · '+CHAPTERS[chapter].legs[leg];}
 scene.fog.color.lerp(new THREE.Color(c.sky),blend);scene.fog.density=lerp(scene.fog.density,c.fog,blend);water.uniforms.skyColor.value.copy(scene.fog.color);water.uniforms.fogDensity.value=scene.fog.density;
 water.uniforms.waterColor.value.lerp(new THREE.Color(c.water),blend);water.uniforms.deepColor.value.lerp(new THREE.Color(c.deep),blend);ambientAmp=lerp(ambientAmp,c.waves,blend);water.uniforms.amplitude.value=ambientAmp;
 atmosphere.update(clock,player,inFront()?new THREE.Color('#17191b'):scene.fog.color,n);if(inFront()){scene.fog.color.set('#17191b');scene.fog.density=.007;}sun.color.lerp(new THREE.Color(n===3?0xf9a473:0xe3d8bf),blend);sun.intensity=lerp(sun.intensity,n===1?1.1:n===3?1.6:2.1,blend);hemi.intensity=lerp(hemi.intensity,n===1?1.7:2.2,blend);
}

async function init(){
 quality=createRenderQuality({mobile,dpr:devicePixelRatio,width:innerWidth,height:innerHeight});renderer=new THREE.WebGLRenderer({canvas:$('scene'),antialias:!mobile,powerPreference:'high-performance'});renderer.setPixelRatio(quality.ratio);renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.92;renderer.shadowMap.enabled=true;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.type=THREE.PCFSoftShadowMap;scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.3,2300);
 atmosphere=createAtmosphere();sky=atmosphere.sky;scene.add(sky,atmosphere.mist);lens=createLens(renderer,mobile);combatFX=createCombatFX(scene);
 const pmrem=new THREE.PMREMGenerator(renderer);env=pmrem.fromScene(scene,.04,.1,10000).texture;scene.environment=env;scene.environmentIntensity=.12;pmrem.dispose();
 hemi=new THREE.HemisphereLight(0xc0cfda,0x626255,2.2);scene.add(hemi);sun=new THREE.DirectionalLight(0xf0d6b4,2.1);sun.castShadow=true;sun.shadow.mapSize.set(mobile?512:1024,mobile?512:1024);sun.shadow.camera.left=-75;sun.shadow.camera.right=75;sun.shadow.camera.top=75;sun.shadow.camera.bottom=-75;sun.shadow.camera.near=1;sun.shadow.camera.far=350;sun.shadow.bias=-.0004;sun.shadow.normalBias=.04;scene.add(sun,sun.target);
 fill=new THREE.DirectionalLight(0xc1d7de,2.1);rim=new THREE.DirectionalLight(0xf3c18a,1.1);scene.add(fill,fill.target,rim,rim.target);
 for(const c of CHAPTERS){routes.push(makeCourse(c));await new Promise(requestAnimationFrame);}
 art=await loadArt(p=>{$('loadfill').style.width=(10+p*75)+'%';$('loadtext').textContent=p<.55?'Preparing your machine…':'Charting the Atlantic…';});
 dock=createDock(art);scene.add(dock);
 water=createWater(art.textures['water-normal'],mobile);scene.add(water.mesh,wake.mesh,spray.mesh);reflection=createReflection(renderer,water,mobile);renderer.info.autoReset=false;makeHero();setupOpponents();await changeCourse();$('loadtext').textContent='Warming engines & effects…';$('loadfill').style.width='90%';state='preparing';const first=course.at(0);Object.assign(player,{x:first.p.x,z:first.p.z,s:0,heading:first.heading});await prepareRaceRender();const berth=course.at(180);Object.assign(player,{x:berth.p.x,z:berth.p.z,s:180,heading:berth.heading});fleet.forEach(o=>o.visible=o===hero);bindInput();state='title';$('loadfill').style.width='100%';previous=performance.now();requestAnimationFrame(frame);$('loading-status').hidden=true;$('enterdock').hidden=false;$('quickraceb').hidden=false;$('menu').hidden=true;syncMenu();window.__READY__=true;
}
init().catch(fatal);
