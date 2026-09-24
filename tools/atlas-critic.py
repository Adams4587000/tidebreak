"""Send ONLY anonymous pair images to the independent stateless Atlas critic.
Never reads KEY.json, source files or implementation notes. Uses the authenticated
Atlas-exported API contract, not the platform agent's suggested HTTP example.
"""
import os,json,sys,urllib.request,urllib.error,uuid,hashlib
from pathlib import Path
BASE='https://api.prod-market.atlas.design/0.2'
API='1a4169b3-4200-44ae-b9c5-0778344a8105'
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*a,**kw):return None
opener=urllib.request.build_opener(NoRedirect)
def post(path,data,content):
 req=urllib.request.Request(BASE+path,data=data,headers={'Authorization':'Bearer '+os.environ['ATLAS_API_KEY'],'Content-Type':content},method='POST')
 try:
  with opener.open(req,timeout=240) as response:return json.load(response)
 except urllib.error.HTTPError as e:
  raise RuntimeError(str(e.code)+' '+e.read().decode()[:1500]) from None
for arg in sys.argv[1:]:
 p=Path(arg)
 if not p.name.startswith('pair_') or p.suffix not in ['.png','.jpg']:raise ValueError('Only anonymous pair images may be sent')
 dest=p.with_suffix('.critique.json')
 if dest.exists():print('Existing critique retained:',dest);continue
 boundary='atlas-'+uuid.uuid4().hex;blob=p.read_bytes();mime='image/png' if p.suffix=='.png' else 'image/jpeg'
 body=(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="pair{p.suffix}"\r\nContent-Type: {mime}\r\n\r\n').encode()+blob+f'\r\n--{boundary}--\r\n'.encode()
 receipt=p.with_suffix('.upload.json')
 if receipt.exists():upload=json.loads(receipt.read_text())
 else:
  upload=post('/upload',body,'multipart/form-data; boundary='+boundary);receipt.write_text(json.dumps(upload))
 fid=upload['file_id']
 result=post('/api_execute/'+API,json.dumps({'pair':fid}).encode(),'application/json')
 dest.write_text(json.dumps({'image_sha256':hashlib.sha256(blob).hexdigest(),'atlas_project':'32eab797-f7fb-4ffb-a8a3-b72b165737c4','api_id':API,'uploaded_pair':fid,'result':result},indent=2))
 print(p.name,json.dumps(result))
