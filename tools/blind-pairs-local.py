"""Local image-only pair compositor for review while the race gate owns Chromium.
No image synthesis/retouching. Like canonical pairs: seeded side shuffle, equal
letterbox, bottom crop, separate key. Critic receives only pair_NN.png.
"""
from pathlib import Path
from PIL import Image
import argparse,random,json
p=argparse.ArgumentParser();p.add_argument('--mine',nargs='+',required=True);p.add_argument('--ref',nargs='+',required=True);p.add_argument('--out',required=True);p.add_argument('--seed',type=int,required=True);a=p.parse_args()
out=Path(a.out);out.mkdir(parents=True,exist_ok=True);rng=random.Random(a.seed);key={};sheets=[]
for i,m in enumerate(a.mine):
 r=a.ref[i%len(a.ref)];left=rng.choice([True,False]);names=[m,r] if left else [r,m];sheet=Image.new('RGB',(1928,540),'#0c0c0c')
 for col,name in enumerate(names):
  im=Image.open(name).convert('RGB');im.thumbnail((960,540),Image.Resampling.LANCZOS);x=col*968+(960-im.width)//2;y=(540-im.height)//2
  im=im.crop((0,0,im.width,round(im.height*.93)));sheet.paste(im,(x,y))
 name=f'pair_{i+1:02}.png';sheet.save(out/name);key[name]={'build':'left' if left else 'right','build_file':m,'ref_file':r};sheets.append(sheet)
(out/'KEY.json').write_text(json.dumps(key,indent=2));contact=Image.new('RGB',(1928,540*len(sheets)))
for i,s in enumerate(sheets):contact.paste(s,(0,i*540))
contact.save(out/'CONTACT-local.jpg');print('Built',len(sheets),'decoded pairs. Withhold KEY.json from critic.')
