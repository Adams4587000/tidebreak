export class RaceAudio{
 constructor(){this.ctx=null;this.enabled=true;this.active=false;this.duckUntil=0;}
 async init(){
  if(this.ctx){await this.ctx.resume();return;}
  this.ctx=new (window.AudioContext||window.webkitAudioContext)();const c=this.ctx;
  this.master=c.createGain();this.master.gain.value=this.enabled?.5:0;
  const limiter=c.createDynamicsCompressor();limiter.threshold.value=-15;limiter.ratio.value=5;this.master.connect(limiter);limiter.connect(c.destination);
  this.engineGain=c.createGain();this.engineGain.gain.value=0;this.filter=c.createBiquadFilter();this.filter.type='lowpass';this.filter.frequency.value=400;this.filter.connect(this.engineGain);this.engineGain.connect(this.master);
  this.osc=c.createOscillator();this.osc.type='triangle';this.osc.frequency.value=42;this.osc.connect(this.filter);this.osc.start();
  this.sub=c.createOscillator();this.sub.type='sine';this.sub.frequency.value=30;this.sub.connect(this.filter);this.sub.start();
  const buffer=c.createBuffer(1,c.sampleRate*2,c.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;this.noiseBuffer=buffer;
  const noise=c.createBufferSource();noise.buffer=buffer;noise.loop=true;this.splashGain=c.createGain();this.splashGain.gain.value=0;const hp=c.createBiquadFilter();hp.type='bandpass';hp.frequency.value=1100;noise.connect(hp);hp.connect(this.splashGain);this.splashGain.connect(this.master);noise.start();
 }
 setEnabled(v){this.enabled=v;if(this.master)this.master.gain.setTargetAtTime(v?.5:0,this.ctx.currentTime,.08);if(this.music)this.music.volume=v?.1:0;if(this.wash)this.wash.volume=0;}
 update(speed,boost,running){if(!this.ctx)return;speed=Math.abs(speed);const t=this.ctx.currentTime,duck=t<this.duckUntil?.4:1;
  this.osc.frequency.setTargetAtTime(32+speed*1.1+(boost?12:0),t,.2);this.sub.frequency.setTargetAtTime(25+speed*.42,t,.2);this.filter.frequency.setTargetAtTime(150+speed*5,t,.2);
  this.engineGain.gain.setTargetAtTime(running?(.025+Math.min(speed,100)*.0004)*duck:0,t,.1);this.splashGain.gain.setTargetAtTime(running?Math.min(.075,speed*.001)*duck:0,t,.1);
  if(this.music)this.music.volume=this.enabled?(running?.1:.06):0;if(this.wash)this.wash.volume=this.enabled&&running?Math.min(.11,speed*.0016):0;
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
 async loadMusic(url){this.wash=new Audio('./media/water-wash.mp3');this.wash.loop=true;this.wash.volume=0;this.wash.play().catch(()=>{});this.music=new Audio(url);this.music.loop=true;this.music.volume=this.enabled?.1:0;try{await this.music.play();}catch{}}
}
