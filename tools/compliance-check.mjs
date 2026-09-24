#!/usr/bin/env node
// Evidence integrity guard. It checks coverage and stale receipts, not aesthetic quality.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.resolve(root,p));const sha=p=>crypto.createHash('sha256').update(read(p)).digest('hex');
const json=p=>JSON.parse(read(p));const files=dir=>fs.readdirSync(path.resolve(root,dir),{withFileTypes:true}).flatMap(d=>d.isDirectory()?files(dir+'/'+d.name):[dir+'/'+d.name]);
const ledger=json('docs/compliance/asset-ledger.json'),lock=json('docs/compliance/pipeline-lock.json');
function validate(book){const failures=[];const require=(condition,msg)=>{if(!condition)failures.push(msg);};const match=(p,h)=>{try{require(sha(p)===h,`stale or altered: ${p}`);}catch{failures.push(`missing: ${p}`);}};
 const assets=files('game/assets').filter(p=>/^game\/assets\/[^/]+\.js$/.test(p));require(assets.length===book.assets.length,'asset ledger coverage changed');
 for(const file of assets)require(book.assets.some(a=>a.shipping===file),'unreviewed asset: '+file);
 for(const a of book.assets){match(a.shipping,a.sha256);match(a.reference.path,a.reference.sha256);require(Boolean(a.reference.atlas_fid),'missing Atlas reference: '+a.name);require(a.candidates.length===3,'need three constructions: '+a.name);require(new Set(a.candidates.map(c=>c.sha256)).size===3,'duplicate candidates: '+a.name);require(new Set(a.candidates.map(c=>c.strategy)).size===3,'duplicate strategies: '+a.name);for(const c of a.candidates){match(c.path,c.sha256);require(fs.existsSync(path.resolve(root,c.render)),'missing multi-angle render: '+c.path);}require(a.decision.length>40,'missing visual decision: '+a.name);require(a.candidates.some(c=>c.strategy===a.selected&&c.verifier_ok),'selected candidate did not verify: '+a.name);require(fs.existsSync(path.resolve(root,a.shipping.replace('.js','.expect.json'))),'missing scale expectation: '+a.name);}
 for(const [p,h] of Object.entries(lock.canonical))match(p,h);
 for(const [p,h] of Object.entries(lock.shippingHelpers)){match(p,h);require(sha(p)===sha('../404-game-recipe/harness/'+path.basename(p)),'canonical helper differs: '+p);}
 for(const a of lock.media){match(a.path,a.sha256);require(Boolean(a.atlas_fid),'media lacks Atlas provenance: '+a.path);}
 const media=files('game/media');require(media.length===lock.media.length&&media.every(p=>lock.media.some(m=>m.path===p)),'unrecorded shipping media');
 for(const a of lock.runtimeGeometry)match(a.path,a.sha256);
 const inventoried=new Set([...book.assets.map(a=>a.shipping),...lock.runtimeGeometry.map(a=>a.path),...Object.keys(lock.shippingHelpers)]);
 for(const p of files('game').filter(p=>!p.includes('/vendor/')&&!p.includes('/_verify/'))){require(!/\.(glb|gltf|obj|fbx|stl|ply|blend)$/i.test(p),'imported mesh: '+p);if(!/\.(js|html|css|json)$/.test(p))continue;const s=read(p).toString();require(!/atk_[A-Za-z0-9_-]{18,}/.test(s),'possible workspace credential in '+p);if(/new THREE\.(?:\w+Geometry|Mesh|Points|InstancedMesh)\b/.test(s))require(inventoried.has(p),'unreviewed runtime geometry: '+p);}
 return failures;
}
let failures=validate(ledger);
if(process.argv.includes('--selftest')){const bad=structuredClone(ledger);bad.assets[0].sha256='0'.repeat(64);if(!validate(bad).some(x=>x.startsWith('stale or altered:')))failures.push('selftest did not catch changed asset');const missing=structuredClone(ledger);missing.assets.pop();if(!validate(missing).some(x=>x.startsWith('unreviewed asset:')))failures.push('selftest did not catch missing asset record');}
const report={checked_at:new Date().toISOString(),assets:ledger.assets.length,candidates:ledger.assets.length*3,media:lock.media.length,failures,passed:failures.length===0,scope:'Local provenance/integrity guard; not visual certification or live submission verdict.'};
fs.mkdirSync(path.resolve(root,'evidence/compliance'),{recursive:true});fs.writeFileSync(path.resolve(root,'evidence/compliance/integrity-check.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(failures.length)process.exitCode=1;
