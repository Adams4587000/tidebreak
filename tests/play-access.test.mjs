import test from 'node:test';import assert from 'node:assert/strict';
import {createPlayAccess,PREVIEW_SAVE_KEY} from '../game/play-access.js';
import {SAVE_KEY,LEGACY_SAVE_KEY} from '../game/campaign.js';
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};
test('temporary preview opens all six real territories and craft without accepting invalid choices',()=>{
 storage.clear();const p=createPlayAccess(true),s=p.loadSave();for(let i=0;i<6;i++){assert.ok(p.unlocked(s,i));assert.ok(p.boatUnlocked(s,i));}for(const i of [-1,6,1.5,NaN]){assert.equal(p.unlocked(s,i),false);assert.equal(p.boatUnlocked(s,i),false);}
});
test('preview results stay separate and switching it off restores the earned career',()=>{
 storage.clear();const career=createPlayAccess(false),preview=createPlayAccess(true);
 let earned=career.recordResult(career.loadSave(),0,{finished:true,time:150,place:4,pickups:2},'race');const original=storage.get(SAVE_KEY);
 storage.set(LEGACY_SAVE_KEY,JSON.stringify({wins:20,reputation:9999}));assert.equal(preview.loadSave().reputation,0,'preview does not inherit career or legacy earnings');
 const run=preview.recordResult(preview.loadSave(),5,{finished:true,time:90,place:1,pickups:20},'race');assert.equal(run.finishes,1);assert.ok(storage.has(PREVIEW_SAVE_KEY));assert.equal(storage.get(SAVE_KEY),original);
 assert.deepEqual(career.loadSave(),earned);assert.equal(career.unlocked(earned,1),true);assert.equal(career.unlocked(earned,5),false);assert.equal(career.boatUnlocked(earned,5),false);
});
