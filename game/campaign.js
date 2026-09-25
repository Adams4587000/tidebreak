// Six complete territories. Crew career totals survive the campaign migration.
export const SECTORS=[
 {name:'MERIDIAN // THE DROWNED STADIUM',short:'MERIDIAN',kind:'harbour',water:'#35494a',deep:'#101c20',sky:'#747c7c',fog:.0032,sun:16,waves:.48},
 {name:'DROWNED REACH // BLACKWATER',short:'DROWNED REACH',kind:'swamp',water:'#344139',deep:'#111e1a',sky:'#566359',fog:.0048,sun:8,waves:.25},
 {name:'SPLITSTONE // THE FRACTURE',short:'SPLITSTONE',kind:'gorge',water:'#334a4f',deep:'#131f26',sky:'#78878c',fog:.0036,sun:14,waves:.6},
 {name:'EMBER BASIN // THE CALDERA',short:'EMBER BASIN',kind:'volcano',water:'#423b39',deep:'#201b1e',sky:'#77594f',fog:.004,sun:6,waves:.7},
 {name:'THE SLUICE // AUTHORITY FALLS',short:'THE SLUICE',kind:'sluice',water:'#3c5154',deep:'#17272b',sky:'#788081',fog:.0032,sun:12,waves:.9},
 {name:'OUTER ATLANTIC // THE GRAVEYARD',short:'OUTER ATLANTIC',kind:'ocean',water:'#405462',deep:'#142330',sky:'#626f7e',fog:.003,sun:9,waves:1.35},
];
export const CHAPTERS=SECTORS.map((sector,i)=>({
 ...sector,arena:i,id:['meridian','blackwater','splitstone','ember','sluice','atlantic'][i],
 name:sector.short,short:sector.short,
 subtitle:['THE DROWNED STADIUM','BLACKWATER CIRCUIT','THE FRACTURE RUN','CALDERA CIRCUIT','AUTHORITY FALLS','THE GRAVEYARD'][i],
 accent:['#efc77e','#a3d778','#8bdcff','#ff8056','#65e2d1','#bb9bff'][i],
 story:[
  'Your first claim on the frontier. Break from the flooded grandstands into the crane yards, cross the old harbour and return to the stadium.',
  'The light disappears beneath the mangroves. Hunt through drowned settlements, root tunnels and wreck-strewn blackwater bends.',
  'A river cut through a broken mountain. Thread colossal stone arches, climb the racing line through switchbacks and escape the fracture.',
  'Dark water in the heart of a living caldera. Race between glowing basalt banks, fallen bridges and smoking volcanic spires.',
  'The Authority left its floodgates running. Read the timed surge windows beneath monumental spillways and abandoned service bridges.',
  'The last territory belongs to the storm. Ride the swell past sunken freighters, sea stacks and a lighthouse at the edge of the world.'
 ][i],
 objective:['Finish the race to unlock Blackwater','Finish in the top 4 to unlock Splitstone','Reach the podium to unlock Ember Basin','Reach the podium to unlock the Sluice','Finish in the top 2 to unlock the Atlantic','Win to become Frontier champion'][i],
 requiredPlace:[6,4,3,3,2,1][i],
 radius:[1220,1110,1190,1260,1130,1370][i],stretch:[1.13,1.32,1.43,1.08,1.5,1.12][i],
 bend:[.10,.14,.16,.12,.11,.09][i],harmonics:[3,5,3,4,2,3][i],ripple:[.010,.008,.008,.01,.006,.012][i],
 width:[30,28,29,30,29,32][i],seed:[11,32,47,73,91,127][i],difficulty:[0,.4,.8,1.2,1.6,2][i],
 legs:[
  ['STARTING BASIN','CRANE YARDS','THE BREAKWATER','OLD HARBOUR','DOCKSIDE SPRINT','STADIUM RETURN'],
  ['MARSH GATE','ROOT TUNNELS','DROWNED VILLAGE','GHOST CHANNEL','BLACKWATER BENDS','WARDEN’S REACH'],
  ['CANYON MOUTH','STONE ARCHES','THE SWITCHBACKS','SHATTERED BRIDGE','DEEP FRACTURE','RIVER’S END'],
  ['ASHEN GATE','BASALT TEETH','FURNACE CHANNEL','FALLEN CAUSEWAY','CALDERA HEART','EMBER RETURN'],
  ['LOWER LOCK','SPILLWAY ONE','SERVICE CHANNEL','FLOODGATE RUN','AUTHORITY BRIDGE','TAILRACE'],
  ['STORM GATE','FREIGHTER GRAVEYARD','SEA STACKS','DEAD LIGHTHOUSE','WHITEWATER REEF','LAST HORIZON']
 ][i]
}));
export const BOATS=[
 {name:'KESTREL',rider:'ROOK',title:'THE SALVAGE RUNNER',bio:'A dock mechanic with a stolen engine and nothing left to lose.',unlock:'STARTER · AVAILABLE',width:3.8,type:'SALVAGE / INTERCEPTOR',color:0xad5535,speed:63,turn:1.08,boost:1.47,stats:[.8,.82,.8]},
 {name:'ALBATROSS',rider:'VESPER',title:'THE EXILED PILOT',bio:'An Authority defector. Precision is the only loyalty she kept.',unlock:'FINISH 1 RACE / 180 REP',width:4.3,type:'NEEDLE / OUTRIGGER',color:0xbcb4a2,speed:65,turn:.94,boost:1.44,stats:[.94,.68,.83]},
 {name:'MANTA',rider:'MOSS',title:'THE MARSH WARDEN',bio:'Raised in blackwater. Knows every current that can swallow a machine.',unlock:'12 FINISHED-RACE SUPPLIES / 350 REP',width:5.8,type:'CRESCENT / SKIMMER',color:0x626e4c,speed:61.5,turn:1.3,boost:1.48,stats:[.72,.98,.78]},
 {name:'BRIMSTONE',rider:'CINDER',title:'THE FURNACE SAINT',bio:'A caldera engineer wrapped in scavenged heat armor.',unlock:'2 PODIUMS / 700 REP',width:4.5,type:'TWIN TURBINE / HOTROD',color:0x842f23,speed:64,turn:.98,boost:1.51,stats:[.87,.72,.96]},
 {name:'SPECTRE',rider:'ECHO',title:'THE SIGNAL GHOST',bio:'A courier who erased their name from the Authority registry.',unlock:'4 FINISHES / 1000 REP',width:4.1,type:'ASYMMETRIC / SCOUT',color:0x4b6470,speed:62.5,turn:1.17,boost:1.48,stats:[.79,.91,.84]},
 {name:'IRONCLAD',rider:'MARSHAL',title:'THE LAST ENFORCER',bio:'The Authority fell. Its most feared captain still owns the water.',unlock:'WIN 1 RACE / 1800 REP',width:5.2,type:'ARMORED / CATAMARAN',color:0x8b826c,speed:63.5,turn:1.01,boost:1.5,stats:[.84,.74,.91]},
];
export function objectivePassed(i,r){return !!r.finished&&Number.isInteger(r.place)&&r.place>=1&&r.place<=CHAPTERS[i]?.requiredPlace;}
export function objectiveProgress(i,r){return `${r.pickups||0} PERKS CLAIMED · ${r.jumps||0} LANDINGS · ${r.place||6}/6`;}
export const SAVE_KEY='tidebreak.territories.v3';
export const LEGACY_SAVE_KEY='tidebreak.endurance.v2';
const empty=()=>({cleared:Array(6).fill(false),best:Array(6).fill(null),finishes:0,podiums:0,wins:0,pickups:0,reputation:0,takedowns:0,starts:0,champion:false});
export function loadSave(key=SAVE_KEY){
 const out=empty();try{
  const raw=localStorage.getItem(key),s=JSON.parse(raw||(key===SAVE_KEY?localStorage.getItem(LEGACY_SAVE_KEY):null));if(!s)return out;
  for(const k of ['finishes','podiums','wins','pickups','reputation','takedowns','starts'])if(Number.isSafeInteger(s[k])&&s[k]>=0)out[k]=s[k];
  // Old contracts were different routes. Keep the career, start the new territories fresh.
  if(raw)for(let i=0;i<6;i++){out.cleared[i]=s.cleared?.[i]===true&&(i===0||out.cleared[i-1]);out.best[i]=Number.isFinite(s.best?.[i])&&s.best[i]>0?s.best[i]:null;}
  out.champion=out.cleared.every(Boolean);
 }catch{}return out;
}
export function unlocked(s,i){return Number.isInteger(i)&&i>=0&&i<CHAPTERS.length&&(i===0||s.cleared.slice(0,i).every(Boolean));}
export function boatUnlocked(s,i){return [true,s.finishes>=1||s.reputation>=180,s.pickups>=12||s.reputation>=350,s.podiums>=2||s.reputation>=700,s.finishes>=4||s.reputation>=1000,s.wins>=1||s.reputation>=1800][i]===true;}
export function recordResult(s,i,r,mode,key=SAVE_KEY){const n={...s,cleared:[...s.cleared],best:[...s.best]};if(mode==='race'&&(r.finished||r.eliminated)){n.starts=(n.starts||0)+1;n.reputation=(n.reputation||0)+Math.floor((r.distance||0)/250)+(r.pickups||0)*3+(r.kills||0)*25+(r.finished?[120,85,60,40,30,20][r.place-1]:10);n.takedowns=(n.takedowns||0)+(r.kills||0);}if(r.finished){n.best[i]=Math.min(n.best[i]??Infinity,r.time);if(mode==='race'){n.finishes++;n.pickups+=r.pickups||0;if(r.place<=3)n.podiums++;if(r.place===1)n.wins++;if(unlocked(s,i)&&objectivePassed(i,r))n.cleared[i]=true;n.champion=n.cleared.every(Boolean);}}try{localStorage.setItem(key,JSON.stringify(n));}catch{}return n;}
export function formatTime(t){const ms=Math.max(0,Math.round(t*1000));return `${String(Math.floor(ms/60000)).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}.${String(ms%1000).padStart(3,'0')}`;}
