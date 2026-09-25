import test from 'node:test';
import assert from 'node:assert/strict';
import {createRenderQuality} from '../game/render-quality.js';
test('high-density phones start within the pixel budget',()=>{
 const q=createRenderQuality({mobile:true,dpr:3,width:390,height:844});
 assert.ok(q.ratio<=1.15);assert.ok(390*844*q.ratio*q.ratio<=850000);
});
test('sustained slow rendering reduces resolution without crossing the floor',()=>{
 const q=createRenderQuality({mobile:true,dpr:3,width:390,height:844}),initial=q.ratio;
 for(let i=0;i<2400;i++)q.sample(35);
 assert.ok(q.ratio<initial);assert.ok(q.ratio>=.75);
});
test('a background-tab gap does not lower quality and recovery is gradual',()=>{
 const q=createRenderQuality({mobile:true,dpr:3,width:390,height:844}),initial=q.ratio;
 for(let i=0;i<10;i++)q.sample(2000);assert.equal(q.ratio,initial);
 for(let i=0;i<90;i++)q.sample(35);const reduced=q.ratio;
 for(let i=0;i<60;i++)q.sample(16.7);assert.equal(q.ratio,reduced);
 for(let i=0;i<1800;i++)q.sample(16.7);assert.ok(q.ratio>reduced);assert.ok(q.ratio<=initial);
});
