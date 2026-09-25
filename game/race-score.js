// Original 148 BPM industrial breakbeat score. Render once off the main audio
// graph, then loop a single buffer: no per-frame note scheduling or downloads.
export async function createRaceScore(context,destination){
 const rate=24000,beat=60/148,bars=16,duration=bars*4*beat,length=Math.round(duration*rate);
 const render=new OfflineAudioContext(1,length+rate,rate),bus=render.createGain();
 // Bake presence into the score so percussion and synths clear the engine/water.
 const low=render.createBiquadFilter(),presence=render.createBiquadFilter();low.type='lowshelf';low.frequency.value=220;low.gain.value=-2;presence.type='highshelf';presence.frequency.value=1600;presence.gain.value=4;bus.connect(low);low.connect(presence);presence.connect(render.destination);
 let seed=404;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const noise=render.createBuffer(1,rate,rate),samples=noise.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=random()*2-1;
 function note(time,frequency,duration,volume,type='triangle',cutoff=1800,end=frequency){
  const osc=render.createOscillator(),filter=render.createBiquadFilter(),gain=render.createGain();osc.type=type;osc.frequency.setValueAtTime(frequency,time);osc.frequency.exponentialRampToValueAtTime(end,time+duration);filter.type='lowpass';filter.frequency.value=cutoff;filter.Q.value=.5;
  gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(volume,time+.006);gain.gain.exponentialRampToValueAtTime(.0001,time+duration);osc.connect(filter);filter.connect(gain);gain.connect(bus);osc.start(time);osc.stop(time+duration+.01);
 }
 function hit(time,duration,volume,frequency,type='highpass'){
  const source=render.createBufferSource(),filter=render.createBiquadFilter(),gain=render.createGain();source.buffer=noise;filter.type=type;filter.frequency.value=frequency;filter.Q.value=.65;gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(volume,time+.002);gain.gain.exponentialRampToValueAtTime(.0001,time+duration);source.connect(filter);filter.connect(gain);gain.connect(bus);source.start(time);source.stop(time+duration+.01);
 }
 const roots=[82.4069,65.4064,73.4162,61.7354],phrase=[0,7,12,7,3,7,10,14];
 for(let bar=0;bar<bars;bar++){
  const start=bar*4*beat,root=roots[Math.floor(bar/4)],lift=bar>=8;
  for(let step=0;step<16;step++){
   const t=start+step*beat/4;
   if([0,6,8,11].includes(step)||(bar%4===3&&step===14))note(t,135,.23,.85,'sine',1600,43);
   if(step===4||step===12){hit(t,.16,.43,1700,'bandpass');note(t,185,.11,.22,'triangle',2200,125);}
   if(bar%4===3&&(step===14||step===15))hit(t,.065,.14,2100,'bandpass');
   if(step%2===0||lift)hit(t,step%4===2?.10:.038,step%2===0?.065:.025,6500);
   if([0,3,6,8,10,14].includes(step)){const f=root*(step===10?2:1);note(t,f,beat*.48,.19,'sawtooth',lift?1050:700);note(t,f/2,beat*.42,.22,'sine',500);}
   if(step%2===0){const semitone=phrase[(step/2+(bar%2?2:0))%phrase.length],f=root*4*2**(semitone/12);note(t,f,beat*.42,lift?.060:.036,'triangle',3000);note(t+beat*.75,f,beat*.34,.012,'triangle',1600);}
  }
  // Sustained fifths sit behind the percussion; four-bar phrases vary the loop.
  for(const ratio of [2,3])note(start,root*ratio,beat*3.9,.035,'triangle',900);
 }
 const rendered=await render.startRendering(),data=rendered.getChannelData(0),buffer=context.createBuffer(1,length,rate),loop=buffer.getChannelData(0);
 let peak=0;for(let i=0;i<data.length;i++)loop[i%length]+=data[i];for(const value of loop)peak=Math.max(peak,Math.abs(value));for(let i=0;i<length;i++)loop[i]*=.85/Math.max(peak,.001);
 const gain=context.createGain();gain.gain.value=0;gain.connect(destination);const source=context.createBufferSource();source.buffer=buffer;source.loop=true;source.connect(gain);source.start();
 return{gain,source,playing:true,duration:buffer.duration};
}
