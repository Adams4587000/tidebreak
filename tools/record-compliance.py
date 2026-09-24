"""Record the explicit visual decisions from the 23 September remediation review.
This tool records hashes; it never determines visual quality. Change decisions
only after rerendering and reviewing candidates. See asset-review-plan.md.
"""
from pathlib import Path
from PIL import Image
import json,hashlib,shutil
ROOT=Path(__file__).resolve().parents[1]
def sha(p):return hashlib.sha256((ROOT/p).read_bytes()).hexdigest()
boards={
'afc1abe7-e79f-4290-a430-32f73c479cab':['kestrel','albatross','manta','brimstone'],
'89d18628-e3d4-4dfd-a682-188ace9c52de':['spectre','ironclad','stadium','caldera'],
'5ee41243-20d9-4f8a-afc8-fb051b04c79e':['rock','mangrove','wreck','lighthouse'],
'c952a2c6-a9ff-4808-8508-2431d8b6b0ea':['crane','gate','quay','spillway'],
'b2421666-980e-4193-be48-349d2e93fb17':['ramp','buoy','bridge','barrier'],
'79887437-e107-4310-a8a0-3233491d5561':['dock','supply','lethal-supply','edge-buoy']}
refs={}
for fid,names in boards.items():
 im=Image.open(ROOT/f'references/{fid}.png');w,h=im.size
 for i,name in enumerate(names):
  rect=[i%2*w//2,i//2*h//2,(i%2+1)*w//2,(i//2+1)*h//2];dest=f'references/compliance/{name}.png';im.crop(rect).save(ROOT/dest);refs[name]={'path':dest,'atlas_fid':fid,'crop':rect}
for name,fid in {'caldera':'34267a9b-0eb4-4be1-8c6f-276a89cfcbe7','kestrel':'e3c4c2be-653c-4fbd-943f-9988b5121449','ironclad':'afaf3c07-366d-423c-855b-080930b646d4'}.items():
 dest=f'references/compliance/{name}.png';shutil.copy2(ROOT/f'references/{fid}.png',ROOT/dest);refs[name]={'path':dest,'atlas_fid':fid,'crop':None,'note':'Supplemental corrected reference received after fresh candidates were constructed; earlier fleet/biome references supplied the initial form. No retroactive reference-first claim.'}
reasons={
'albatross':'Legacy needle hull, tapered outriggers, complete nozzle blades and articulated rider beat the boxy assembly pods and oversimplified swept option.',
'barrier':'Profile candidate separates four interlocking units and readable orange inset stripes. Legacy is a bare cuboid; assembly has a better shoulder but stripes disappear into its slope.',
'bridge':'Legacy preserves three navigable channels, visible pier warning bands and exposed railing rhythm. Assembly loses end-face detail; profile adds pipes but weakens channel marking. Preserve physical pier spacing.',
'brimstone':'Legacy has recessed turbines, distinct furnace helmet, side ribs and supported armory. Assembly reads as two unshaped tubes; profile loses rear blade and rider detail.',
'buoy':'Legacy ring marker has the clearest distinct silhouette. Assembly is a generic lantern and profile a turned chess-piece shape. This full-size prototype is retained but currently unplaced.',
'caldera':'Legacy irregular rim, radial veins and broken side columns outperform the stacked-ring assembly and smoother profile. Neither alternate earns replacement of the approved volcanic scenery.',
'crane':'Legacy bracing, cabin glazing and boom counterweight are readable on all sides. Assembly has thin supports; profile exposes four disconnected-looking boom rods.',
'dock':'Legacy retains the current user-approved showroom framing. Alternatives improve outlines in isolation but add enclosing arches or floor segmentation that competes with the machine.',
'edge-buoy':'Profile cage, lamp, cap and pontoon replace a bare tapered cylinder. Assembly turned bands add shape but lack a navigational light. Keep amber signal and course-edge placement.',
'gate':'Legacy banded pillars and wide open portal maintain race readability. Assembly truss is credible but dark; profile offers a cleaner soffit but less pillar articulation.',
'ironclad':'Legacy distinct broad pontoons, ribbed deck panels and heavy rider outperform assembly spike bows and the alternative swollen top shells. No tracks or wheels adopted.',
'kestrel':'Legacy layered nose, grilled missile pods, exposed machinery, rider and back-mounted gear retain the best complete craft. Assembly oversimplifies the wedge nose; profile narrows it too far and loses rider specificity.',
'lethal-supply':'Profile has an unmistakable downward red triangle, luminous core and layered pedestal. Legacy is crude and sideways; assembly darkens the danger frame. Add named ring/core pivots for existing animation only.',
'lighthouse':'Legacy clearly separates base, tapered shaft, balcony and lantern from every side. Assembly has a weak/occluded beacon; profile staircase adds clutter. Atlas grime remains applied at runtime.',
'mangrove':'Legacy leaf silhouettes and sparse branches preserve the approved swamp. Assembly pillowy canopy is too stylized and heavier; profile leaf fans look planar and sparse edge-on.',
'manta':'Legacy clean broad delta hull, layered intakes and unique respirator are strongest. Assembly detached triangle wings look assembled; profile captures silhouette but loses equipment and rider detail.',
'quay':'Legacy sawtooth roof, warehouse side windows, tires, ribs and street lights beat both fresh simpler warehouses. Neither alternative resolves repetitive placement by itself.',
'ramp':'Legacy open underside, clear forward rise and contrasting stripes are easier to read at speed. Assembly has a featureless end; profile is a heavy solid wedge with fewer structural cues.',
'rock':'Legacy continuous eroded bank remains the general-purpose shoreline. Assembly is a useful future columnar-basalt variant but changes every biome if substituted globally; profile repeats obvious horizontal terraces. Retain as alternatives, not automatic replacements.',
'spectre':'Legacy asymmetric side pod/equipment box, mast, hood and blue visor remain distinct. Fresh variants approximate the asymmetry but share generic riders and simpler weapon detail.',
'spillway':'Legacy twin pressure housings, pipe banks and hoists read coherently from front/back. Assembly round towers lose the industrial pipe detail; profile offers buttresses but less readable machinery.',
'stadium':'Legacy has the only fully detailed service rear, roof ribbing, light banks and stairs. Both fresh variants trigger an incomplete-side warning and simplify the rear to a blank/open support face.',
'supply':'Legacy entire illuminated ring reads from both sides. Assembly rear ring is dark; profile broken ring and rectangular core weaken recognition. Preserve good pickup silhouette and original finite ownership behavior.',
'wreck':'Legacy has the strongest complete hull silhouette with torn ribs and collapsed deckhouse. Assembly is an exposed skeleton; profile flat side sheets omit structural complexity. Both fresh variants warn about side detail.'}
choices={'barrier':'profile','edge-buoy':'profile','lethal-supply':'profile'}
report=json.loads((ROOT/'evidence/compliance/candidate-report.json').read_text());byname={r['name']:r for r in report};assets=[]
for p in sorted((ROOT/'game/assets').glob('*.js')):
 name=p.stem;ref=refs[name];ref['sha256']=sha(ref['path']);candidates=[]
 for kind in ['legacy','assembly','profile']:
  path=f'candidates/compliance/{name}__{kind}.js';r=byname[name+'__'+kind]
  candidates.append({'path':path,'sha256':sha(path),'strategy':kind,'verifier_ok':r['ok'],'warnings':r['problems'],'render':f'candidates/compliance/_verify/{name}__{kind}.png'})
 assets.append({'name':name,'shipping':f'game/assets/{name}.js','sha256':sha(f'game/assets/{name}.js'),'reference':ref,'candidates':candidates,'selected':choices.get(name,'legacy'),'decision':reasons[name],'integration_delta':'Named ring and core animation pivots; no visual geometry change.' if name=='lethal-supply' else None})
(ROOT/'docs/compliance/asset-ledger.json').write_text(json.dumps({'baseline':'c777a49','review_kind':'retrospective; legacy plus two fresh constructions','reviewer':'primary coding agent, non-blind object review','assets':assets},indent=2))
# Expected real-world proportions: record reviewed measured bounds with 8% tolerance.
current=json.loads((ROOT/'game/assets/_verify/report.json').read_text())
for a in current:
 (ROOT/f'game/assets/{a["name"]}.expect.json').write_text(json.dumps(dict(zip(['width','height','depth'],a['size']))|{'tolerance':.08},indent=2))
shutil.copy2(ROOT/'game/assets/_verify/report.json',ROOT/'evidence/compliance/asset-report.json')
print('Recorded',len(assets),'explicit decisions and reference hashes.')
