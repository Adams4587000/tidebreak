import {createRaceScore} from './race-score.js';
export class RaceAudio{
 constructor(){this.ctx=null;this.enabled=true;this.active=false;this.duckUntil=0;this.startupPlayed=false;this.selectionCount=0;this.lastCue='';this.onStateChange=()=>{};this.musicError=null;}
 async init(){
  if(this.ctx&&this.ctx.state!=='closed'){if(this.ctx.state!=='running')await this.ctx.resume();return;}
  this.music=this.wash=this.raceMusic=null;this.racing=false;this.docked=false;this.ctx=new (window.AudioContext||window.webkitAudioContext)();const c=this.ctx;c.onstatechange=()=>this.onStateChange();
  this.master=c.createGain();this.master.gain.value=this.enabled?.5:0;
  const limiter=c.createDynamicsCompressor();limiter.threshold.value=-15;limiter.ratio.value=5;this.master.connect(limiter);limiter.connect(c.destination);
  this.engineGain=c.createGain();this.engineGain.gain.value=0;this.filter=c.createBiquadFilter();this.filter.type='lowpass';this.filter.frequency.value=400;this.filter.connect(this.engineGain);this.engineGain.connect(this.master);
  this.osc=c.createOscillator();this.osc.type='triangle';this.osc.frequency.value=42;this.osc.connect(this.filter);this.osc.start();
  this.sub=c.createOscillator();this.sub.type='sine';this.sub.frequency.value=30;this.sub.connect(this.filter);this.sub.start();
  // Midrange turbine harmonics remain audible on small speakers in the dock.
  this.dockVoice=c.createOscillator();this.dockVoice.type='sawtooth';this.dockVoice.frequency.value=160;this.dockFilter=c.createBiquadFilter();this.dockFilter.type='lowpass';this.dockFilter.frequency.value=900;this.dockGain=c.createGain();this.dockGain.gain.value=0;this.dockVoice.connect(this.dockFilter);this.dockFilter.connect(this.dockGain);this.dockGain.connect(this.master);this.dockVoice.start();
  const buffer=c.createBuffer(1,c.sampleRate*2,c.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;this.noiseBuffer=buffer;
  const noise=c.createBufferSource();noise.buffer=buffer;noise.loop=true;this.splashGain=c.createGain();this.splashGain.gain.value=0;const hp=c.createBiquadFilter();hp.type='bandpass';hp.frequency.value=1100;noise.connect(hp);hp.connect(this.splashGain);this.splashGain.connect(this.master);noise.start();
  // Dock exhaust shares the noise source, with its own bright, throttle-driven mix.
  this.dockExhaustFilter=c.createBiquadFilter();this.dockExhaustFilter.type='bandpass';this.dockExhaustFilter.frequency.value=1800;this.dockExhaustFilter.Q.value=.65;this.dockExhaustGain=c.createGain();this.dockExhaustGain.gain.value=0;noise.connect(this.dockExhaustFilter);this.dockExhaustFilter.connect(this.dockExhaustGain);this.dockExhaustGain.connect(this.master);
  this.loadRaceScore();
  if(c.state!=='running')await c.resume();
 }
 async activate(){const ready=this.init();if(this.enabled&&(!this.music||this.musicError))this.loadMusic('./media/music.mp3');await ready;if(!this.startupPlayed&&this.enabled){this.startupPlayed=true;this.lastCue='STARTUP';this.noise(.7,650,.12);this.tone(82,.85,0,.12,'triangle',164);[330,440,660].forEach((f,i)=>this.tone(f,.55,.12+i*.13,.075,'sine',f));}}
 select(kind='NAVIGATE'){if(!this.enabled)return;this.selectionCount++;this.lastCue=kind;
  if(kind==='LAUNCH'){this.noise(.4,1400,.16);this.tone(110,.45,0,.12,'triangle',440);this.tone(660,.22,.13,.08,'sine',880);}
  else if(kind==='CRAFT'){this.noise(.09,700,.10);this.tone(160,.13,0,.10,'triangle',95);this.tone(520,.13,.04,.06,'sine',650);}
  else if(kind==='BACK'){this.tone(460,.09,0,.07,'sine',300);}
  else{this.noise(.035,2200,.05);this.tone(680,.065,0,.06,'triangle',510);}
 }
 setEnabled(v){this.enabled=v;if(this.master)this.master.gain.setTargetAtTime(v?.5:0,this.ctx.currentTime,.08);this.mixMusic(this.racing,this.docked);if(!v&&this.wash)this.wash.volume=0;this.onStateChange();}
 loadRaceScore(){
  if(this.scoreLoading||this.raceMusic)return;
  const context=this.ctx;this.raceMusicError=null;
  this.scoreLoading=createRaceScore(context,this.master).then(track=>{if(context!==this.ctx||context.state==='closed'){track.source.stop();track.gain.disconnect();return;}this.raceMusic=track;this.mixMusic(this.racing,this.docked);}).catch(e=>{this.raceMusicError=e.message;}).finally(()=>{this.scoreLoading=null;});
 }
 mixMusic(running=false,docked=false){
  this.racing=running;this.docked=docked;
  if(this.music)this.music.volume=this.enabled?(running?(this.raceMusic?0:.2):docked?.28:.16):0;
  if(this.raceMusic)this.raceMusic.gain.gain.setTargetAtTime(this.enabled&&running?.65:0,this.ctx.currentTime,.22);
 }
 update(speed,boost,running,rev=0,docked=false){if(!this.ctx)return;speed=Math.max(Math.abs(speed),rev*85);const t=this.ctx.currentTime,duck=t<this.duckUntil?.4:1;
  if(this.dockVoice){const flutter=Math.sin(t*47)*rev*rev;this.dockVoice.frequency.setTargetAtTime(160+rev*600+flutter*9,t,.045);this.dockFilter.frequency.setTargetAtTime(700+rev*4900,t,.045);this.dockGain.gain.setTargetAtTime(docked?.018+rev*.082+flutter*.003:0,t,.045);}
  if(this.dockExhaustGain){this.dockExhaustFilter.frequency.setTargetAtTime(1400+rev*1800,t,.06);this.dockExhaustGain.gain.setTargetAtTime(docked?rev*rev*.13:0,t,.06);}
  this.osc.frequency.setTargetAtTime(32+speed*1.1+(boost?12:0),t,.2);this.sub.frequency.setTargetAtTime(25+speed*.42,t,.2);this.filter.frequency.setTargetAtTime(150+speed*5,t,.2);
  this.engineGain.gain.setTargetAtTime(running||rev>.01?(.025+Math.min(speed,100)*.0004+rev*.035)*duck:0,t,.1);this.splashGain.gain.setTargetAtTime(running?Math.min(.075,speed*.001)*duck:0,t,.1);
  this.mixMusic(running,docked);if(this.wash)this.wash.volume=this.enabled?(running?Math.min(.22,speed*.0032):docked?.045:0):0;
 }
 tone(freq=660,duration=.18,delay=0,volume=.16,type='sine',end=freq*1.4){if(!this.ctx||!this.enabled)return;const c=this.ctx,o=c.createOscillator(),g=c.createGain(),t=c.currentTime+delay;o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration);g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(volume,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+duration+.02);o.onended=()=>{o.disconnect();g.disconnect();};}
 noise(duration=.35,frequency=900,volume=.22){if(!this.ctx||!this.enabled)return;const c=this.ctx,n=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain(),t=c.currentTime;n.buffer=this.noiseBuffer;f.type='bandpass';f.frequency.setValueAtTime(frequency,t);f.frequency.exponentialRampToValueAtTime(100,t+duration);g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(volume,t+.025);g.gain.exponentialRampToValueAtTime(.001,t+duration);n.connect(f);f.connect(g);g.connect(this.master);n.start();n.stop(t+duration);n.onended=()=>{n.disconnect();f.disconnect();g.disconnect();};}
 pickup(type){if(type==='NITRO'){this.duckUntil=(this.ctx?.currentTime||0)+.8;this.noise(.65,1800,.22);this.tone(180,.5,0,.16,'triangle',960);this.tone(720,.25,.12,.09,'sine',1440);return;}if(type==='DEATH'){this.effect('IMPACT');return;}this.duckUntil=(this.ctx?.currentTime||0)+.65;const base={AMMO:380,SHIELD:640,CHARGE:520,REPAIR:720,OVERDRIVE:440}[type]||580;[1,1.25,1.5,2].forEach((n,i)=>this.tone(base*n,.2,i*.065,.13));this.noise(.12,2400,.13);}
 weapon(type){this.duckUntil=(this.ctx?.currentTime||0)+.5;if(type==='LASER'){this.tone(1600,.3,0,.2,'sawtooth',160);return;}if(type==='IMPACT'){this.effect('IMPACT');return;}this.noise(.48,1800,.5);this.tone(180,.35,0,.3,'triangle',38);this.tone(75,.14,0,.18,'sine',35);}
 effect(type){this.duckUntil=(this.ctx?.currentTime||0)+.45;
  if(type==='IMPACT'){this.noise(.38,500,.36);this.tone(95,.28,0,.26,'triangle',28);}
  else if(type==='LAND'){this.noise(.25,900,.15);this.tone(95,.18,0,.08,'sine',65);}
  else if(type==='SHIELD'||type==='BLOCK'){this.tone(240,.45,0,.2,'sine',1200);this.tone(720,.45,.07,.1,'triangle',360);this.noise(.2,3000,.13);}
  else if(type==='BOOST'){this.noise(.5,1600,.25);this.tone(110,.4,0,.15,'triangle',480);}
  else if(type==='SELECT')this.tone(620,.065,0,.065,'sine',760);
  else if(type==='RAMP')this.noise(.3,1800,.18);
  else{this.tone(430,.16);this.tone(680,.16,.12);}
 }
 async loadMusic(url){
  if(this.loadingMusic)return this.loadingMusic;
  const context=this.ctx;
  // Decode the existing recordings into the unlocked effects context. A separate
  // HTML media player can stay blocked even while the engine context is running.
  const loop=async(path,volume)=>{
   const track={playing:false,gain:context.createGain(),source:null,level:volume};track.gain.gain.value=volume;track.gain.connect(this.master);
   Object.defineProperty(track,'volume',{get(){return this.level;},set(v){this.level=v;this.gain.gain.setTargetAtTime(v,context.currentTime,.15);}});
   if(path===url){this.music=track;this.mixMusic(this.racing,this.docked);}else this.wash=track;
   const response=await fetch(path);if(!response.ok)throw Error('Audio unavailable: '+response.status);
   const buffer=await context.decodeAudioData(await response.arrayBuffer());
   if(context!==this.ctx||context.state==='closed')return;
   track.source=context.createBufferSource();track.source.buffer=buffer;track.source.loop=true;track.source.connect(track.gain);track.source.start();track.playing=true;
  };
  for(const track of [this.music,this.wash]){track?.source?.stop();track?.gain?.disconnect();}
  this.musicError=null;
  this.loadingMusic=Promise.allSettled([loop(url,this.enabled?.28:0),loop('./media/water-wash.mp3',0)]).then(results=>{this.musicError=results.find(result=>result.status==='rejected')?.reason.message||null;}).finally(()=>{this.loadingMusic=null;this.onStateChange();});
  return this.loadingMusic;
 }
}
