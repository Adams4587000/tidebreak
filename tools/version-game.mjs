// Keep one import map for the complete module graph, including dynamic ASSET imports.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../game');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.name==='_verify'?[]:e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const files=walk(root).filter(p=>/\.(js|css)$/.test(p)).sort(),versions=new Map(files.map(p=>{const rel='./'+path.relative(root,p).split(path.sep).join('/');return[rel,rel+'?v='+crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').slice(0,16)];}));
const imports={three:versions.get('./vendor/three.module.js'),'three/addons/':'./vendor/'};
for(const [file,url] of versions)if(file.endsWith('.js')){imports[file]=url;if(file.startsWith('./vendor/')&&file!=='./vendor/three.module.js')imports['three/addons/'+file.slice('./vendor/'.length)]=url;}
const index=path.join(root,'index.html'),original=fs.readFileSync(index,'utf8');
const updated=original.replace(/<script type="importmap">[\s\S]*?<\/script>/,`<script type="importmap">${JSON.stringify({imports})}</script>`).replace(/(href|src)="(\.\/[^"?]+\.(?:css|js))(?:\?[^"\s]*)?"/g,(all,attr,file)=>versions.has(file)?`${attr}="${versions.get(file)}"`:all);
if(process.argv.includes('--check')){if(updated!==original){console.error('Game cache versions are stale. Run npm run cache:update.');process.exitCode=1;}else console.log(`Cache versions match ${versions.size} scripts/styles.`);}else{fs.writeFileSync(index,updated);console.log(`Versioned ${versions.size} scripts/styles.`);}
