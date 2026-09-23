// Endurance events share every sector. Progression unlocks racers, not pieces of the world.
export const SECTORS=[
 {name:'MERIDIAN // THE DROWNED STADIUM',short:'MERIDIAN',kind:'harbour',water:'#35494a',deep:'#101c20',sky:'#747c7c',fog:.0032,sun:16,waves:.48},
 {name:'DROWNED REACH // BLACKWATER',short:'DROWNED REACH',kind:'swamp',water:'#344139',deep:'#111e1a',sky:'#566359',fog:.0048,sun:8,waves:.25},
 {name:'SPLITSTONE // THE FRACTURE',short:'SPLITSTONE',kind:'gorge',water:'#334a4f',deep:'#131f26',sky:'#78878c',fog:.0036,sun:14,waves:.6},
 {name:'EMBER BASIN // THE CALDERA',short:'EMBER BASIN',kind:'volcano',water:'#423b39',deep:'#201b1e',sky:'#77594f',fog:.004,sun:6,waves:.7},
 {name:'THE SLUICE // AUTHORITY FALLS',short:'THE SLUICE',kind:'sluice',water:'#3c5154',deep:'#17272b',sky:'#788081',fog:.0032,sun:12,waves:.9},
 {name:'OUTER ATLANTIC // THE GRAVEYARD',short:'OUTER ATLANTIC',kind:'ocean',water:'#405462',deep:'#142330',sky:'#626f7e',fog:.003,sun:9,waves:1.35},
];
export const CHAPTERS=[
 {name:'EXILE RUN',short:'EXILE\nRUN',story:'One route through six dead territories. Survive the frontier and earn your first crew.',objective:'Finish the endurance race',radius:2000,stretch:1.13,bend:.12,width:30,seed:11,difficulty:0,...SECTORS[0]},
 {name:'BLACKWATER CONTRACT',short:'BLACKWATER\nCONTRACT',story:'The crews know your name. Claim a podium across the entire frontier.',objective:'Finish in the top three',radius:2070,stretch:1.1,bend:.15,width:28,seed:32,difficulty:1,...SECTORS[0]},
 {name:'LAST AUTHORITY',short:'LAST\nAUTHORITY',story:'No favors. No surrender. Beat the five outlaw captains to claim the Atlantic.',objective:'Win the endurance final',radius:2150,stretch:1.13,bend:.16,width:27,seed:73,difficulty:2,...SECTORS[0]},
].map((c,i)=>({...c,name:['EXILE RUN','BLACKWATER CONTRACT','LAST AUTHORITY'][i],short:['EXILE\nRUN','BLACKWATER\nCONTRACT','LAST\nAUTHORITY'][i]}));
export const BOATS=[
 {name:'KESTREL',rider:'ROOK',title:'THE SALVAGE RUNNER',bio:'A dock mechanic with a stolen engine and nothing left to lose.',unlock:'STARTER · AVAILABLE',width:3.8,type:'SALVAGE / INTERCEPTOR',color:0xad5535,speed:63,turn:1.08,boost:1.47,stats:[.8,.82,.8]},
 {name:'ALBATROSS',rider:'VESPER',title:'THE EXILED PILOT',bio:'An Authority defector. Precision is the only loyalty she kept.',unlock:'FINISH 1 RACE / 180 REP',width:4.3,type:'NEEDLE / OUTRIGGER',color:0xbcb4a2,speed:65,turn:.94,boost:1.44,stats:[.94,.68,.83]},
 {name:'MANTA',rider:'MOSS',title:'THE MARSH WARDEN',bio:'Raised in blackwater. Knows every current that can swallow a machine.',unlock:'12 FINISHED-RACE SUPPLIES / 350 REP',width:5.8,type:'CRESCENT / SKIMMER',color:0x626e4c,speed:61.5,turn:1.3,boost:1.48,stats:[.72,.98,.78]},
 {name:'BRIMSTONE',rider:'CINDER',title:'THE FURNACE SAINT',bio:'A caldera engineer wrapped in scavenged heat armor.',unlock:'2 PODIUMS / 700 REP',width:4.5,type:'TWIN TURBINE / HOTROD',color:0x842f23,speed:64,turn:.98,boost:1.51,stats:[.87,.72,.96]},
 {name:'SPECTRE',rider:'ECHO',title:'THE SIGNAL GHOST',bio:'A courier who erased their name from the Authority registry.',unlock:'4 FINISHES / 1000 REP',width:4.1,type:'ASYMMETRIC / SCOUT',color:0x4b6470,speed:62.5,turn:1.17,boost:1.48,stats:[.79,.91,.84]},
 {name:'IRONCLAD',rider:'MARSHAL',title:'THE LAST ENFORCER',bio:'The Authority fell. Its most feared captain still owns the water.',unlock:'WIN 1 RACE / 1800 REP',width:5.2,type:'ARMORED / CATAMARAN',color:0x8b826c,speed:63.5,turn:1.01,boost:1.5,stats:[.84,.74,.91]},
];
export function objectivePassed(i,r){return r.finished&&(i===0||i===1&&r.place<=3||i===2&&r.place===1);}
export function objectiveProgress(i,r){return `${r.pickups||0} PERKS CLAIMED · ${r.jumps||0} LANDINGS · ${r.place||6}/6`;}
export const SAVE_KEY='tidebreak.endurance.v2';
const empty=()=>({cleared:[false,false,false],best:[null,null,null],finishes:0,podiums:0,wins:0,pickups:0,reputation:0,takedowns:0,starts:0,champion:false});
export function loadSave(){const out=empty();try{const s=JSON.parse(localStorage.getItem(SAVE_KEY));if(!s)return out;for(const k of ['finishes','podiums','wins','pickups','reputation','takedowns','starts'])if(Number.isSafeInteger(s[k])&&s[k]>=0)out[k]=s[k];for(let i=0;i<3;i++){out.cleared[i]=s.cleared?.[i]===true;out.best[i]=Number.isFinite(s.best?.[i])&&s.best[i]>0?s.best[i]:null;}out.champion=out.cleared[2];}catch{}return out;}
export function unlocked(s,i){return i===0||s.cleared.slice(0,i).every(Boolean);}
export function boatUnlocked(s,i){return [true,s.finishes>=1||s.reputation>=180,s.pickups>=12||s.reputation>=350,s.podiums>=2||s.reputation>=700,s.finishes>=4||s.reputation>=1000,s.wins>=1||s.reputation>=1800][i]===true;}
export function recordResult(s,i,r,mode){const n={...s,cleared:[...s.cleared],best:[...s.best]};if(mode==='race'&&(r.finished||r.eliminated)){n.starts=(n.starts||0)+1;n.reputation=(n.reputation||0)+Math.floor((r.distance||0)/250)+(r.pickups||0)*3+(r.kills||0)*25+(r.finished?[120,85,60,40,30,20][r.place-1]:10);n.takedowns=(n.takedowns||0)+(r.kills||0);}if(r.finished){n.best[i]=Math.min(n.best[i]??Infinity,r.time);if(mode==='race'){n.finishes++;n.pickups+=r.pickups||0;if(r.place<=3)n.podiums++;if(r.place===1)n.wins++;if(objectivePassed(i,r))n.cleared[i]=true;n.champion=n.cleared[2];}}try{localStorage.setItem(SAVE_KEY,JSON.stringify(n));}catch{}return n;}
export function formatTime(t){const ms=Math.max(0,Math.round(t*1000));return `${String(Math.floor(ms/60000)).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}.${String(ms%1000).padStart(3,'0')}`;}
