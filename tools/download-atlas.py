import sys,os,json,urllib.request,urllib.error,pathlib,concurrent.futures
ROOT=pathlib.Path(__file__).resolve().parents[1]
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args,**kwargs): return None
opener=urllib.request.build_opener(NoRedirect())
def get(item):
 url=item['download']['url']
 if not url.startswith('https://api.prod-market.atlas.design/'): raise ValueError('Unexpected download host')
 req=urllib.request.Request(url,headers={'Authorization':'Bearer '+os.environ['ATLAS_API_KEY']})
 try:
  with opener.open(req,timeout=90) as r: data=r.read()
 except urllib.error.HTTPError as e:
  if e.code not in (301,302,303,307,308): raise
  with urllib.request.urlopen(e.headers['Location'],timeout=90) as r:data=r.read()
 p=ROOT/'references'/(item['fid']+'.png');p.write_bytes(data);print(item['name'],p.name,len(data))
items=json.loads((pathlib.Path(sys.argv[1]) if len(sys.argv)>1 else ROOT/'references/atlas-assets.json').read_text())
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(get,[x for x in items if not (ROOT/'references'/(x['fid']+'.png')).exists()]))
