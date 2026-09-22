import test from 'node:test';
import assert from 'node:assert/strict';
import {objectivePassed,unlocked,recordResult,loadSave} from '../game/campaign.js';
let value=null;globalThis.localStorage={getItem:()=>value,setItem:(_,v)=>value=v};
const success={finished:true,time:42,place:1,signals:4,jumps:2,boosts:3,surges:2};
test('every chapter requires finishing, and its specific task',()=>{
 for(let i=0;i<6;i++){assert.ok(objectivePassed(i,success));assert.equal(objectivePassed(i,{...success,finished:false}),false);}
 for(const [i,fail] of [[0,{place:4}],[1,{signals:3}],[2,{jumps:1}],[3,{place:4}],[3,{boosts:2}],[4,{surges:1}],[5,{place:2}]])assert.equal(objectivePassed(i,{...success,...fail}),false);
});
test('only a race challenge unlocks the next course; best times survive slower runs',()=>{
 value=null;let save=loadSave();assert.ok(unlocked(save,0));assert.equal(unlocked(save,1),false);
 save=recordResult(save,0,success,'time');assert.equal(unlocked(save,1),false);assert.equal(save.best[0],42);
 save=recordResult(save,0,{...success,time:45},'race');assert.ok(unlocked(save,1));assert.equal(save.best[0],42);assert.equal(unlocked(save,2),false);assert.deepEqual(loadSave(),save);
});
test('corrupted storage resets safely, and noncontiguous clearances cannot bypass chapters',()=>{
 value='invalid JSON';assert.deepEqual(loadSave().cleared,Array(6).fill(false));
 value=JSON.stringify({cleared:[true,false,true],best:[null,-1,'0']});let save=loadSave();assert.equal(unlocked(save,3),false);assert.equal(save.best[1],null);
});
test('a full completed campaign persists the championship',()=>{
 value=null;let save=loadSave();for(let i=0;i<6;i++)save=recordResult(save,i,success,'race');assert.ok(loadSave().champion);assert.ok(loadSave().cleared.every(Boolean));
});
