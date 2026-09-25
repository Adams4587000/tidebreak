// Change pixel cost only after sustained slow frames; never change race rules.
export function createRenderQuality({mobile=false,dpr=1,width=1280,height=720}={}){
 const maxRatio=Math.min(dpr,mobile?1.15:1.5,Math.sqrt((mobile?850000:1800000)/(width*height)));
 const floor=Math.min(maxRatio,mobile?.75:.85);let ratio=maxRatio,total=0,frames=0,cooldown=0;
 return{get ratio(){return ratio;},sample(ms){
  if(ms<=0||ms>250)return null; // loading, background tabs and debugger pauses
  total+=ms;frames++;if(total<2000)return null;
  const average=total/frames;cooldown=Math.max(0,cooldown-total);total=0;frames=0;
  if(cooldown)return null;
  const next=average>23?Math.max(floor,ratio-.1):average<17.5?Math.min(maxRatio,ratio+.05):ratio;
  if(Math.abs(next-ratio)<.01)return null;ratio=next;cooldown=average>23?3000:10000;return ratio;
 },reset(){total=0;frames=0;}};
}
