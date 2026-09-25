import {CHAPTERS,BOATS,SAVE_KEY,unlocked as earnedTerritory,boatUnlocked as earnedBoat,loadSave as loadCareer,recordResult as recordCareer} from './campaign.js';

// Temporary user-requested preview. Set false before the final build/commit.
export const PREVIEW_UNLOCKS=false;
export const PREVIEW_SAVE_KEY='tidebreak.preview.v1';
export function createPlayAccess(preview){
 const key=preview?PREVIEW_SAVE_KEY:SAVE_KEY;
 return {
  unlocked:(save,i)=>Number.isInteger(i)&&i>=0&&i<CHAPTERS.length&&(preview||earnedTerritory(save,i)),
  boatUnlocked:(save,i)=>Number.isInteger(i)&&i>=0&&i<BOATS.length&&(preview||earnedBoat(save,i)),
  loadSave:()=>loadCareer(key),
  recordResult:(save,i,result,mode)=>recordCareer(save,i,result,mode,key),
 };
}
export const {unlocked,boatUnlocked,loadSave,recordResult}=createPlayAccess(PREVIEW_UNLOCKS);
