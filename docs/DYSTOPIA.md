# Tidebreak: the drowned frontier

The Atlantic Authority abandoned its flooded territories. Six outlaw crews race the maintenance artery that still links them. Clearance comes from finishing dangerous contracts, and machines are earned by racing, never purchased.

## Scope of this rebuild

Every event traverses one continuous course: Meridian's decaying water stadium → Drowned Reach mangroves → Splitstone gorge → Ember Basin caldera → Authority spillway → Atlantic wreck field. Target duration is four to six minutes. Sector transitions happen during the race; there is no finish screen between biomes. Three endurance contracts increase the competitive standard. All scenery is original constructor-generated Three.js geometry loaded and batched through the 404 recipe.

The six original pairs are Rook / Kestrel (salvage interceptor, starter), Vesper / Albatross (needle with outriggers), Moss / Manta (crescent marsh skimmer), Cinder / Brimstone (twin turbine hotrod), Echo / Spectre (asymmetric reconnaissance machine), and Marshal / Ironclad (armored catamaran). Each has an exposed saddle, handlebars, foot supports, visible forward-leaning rider, distinct helmet and equipment. Silhouette differences take priority over paint differences. Rivets, hatches, layered armor, cooling vents, hoses and propulsion assemblies provide scale.

One starter is available on a clean save. Locked pairs can be inspected in the dock, with their exact requirements. Finishes, podiums, pickup mastery and wins unlock the others. Aborting, restarting, or time trial practice earns no roster progress. Saves use a new version; the earlier prototype's chapter flags do not grant free machines.

## Competition

Opponents have finite boost reserves, the same vehicle specifications and pickup rules, anticipatory lines and lane movement. They seek unclaimed pickups and contest space. No position-dependent speed teleportation or guaranteed player victory. Pickups have one owner, determined by earliest swept intersection in the simulation step; player iteration order must not confer priority. Boost, shield, overdrive and repair/charge perks are legible by color and HUD labels. Real mistakes cost speed; recovery cannot advance race progress.

## Visual hierarchy

Wet weathered metal and layered fabric replace pristine white shells. Cooler overcast light in the port shifts through humid green swamp haze and black basalt to ember-lit volcanic steam. Navigable water remains distinct from lava. Atlas supplies original visual references and material maps. The near-camera vehicle and water get the highest detail; distant geometry is spatially culled. Lens droplets accompany landings, rough water and rival wake crossings; they drain away and never permanently obscure steering information.

## Acceptance

- Inspect all six silhouettes and riders from multiple angles using the recipe verifier and in-game dock.
- Exercise countdown, real keyboard and simultaneous touch, braking, boost, pause/resume, restart and finish.
- Drive a complete continuous event through all six sectors. Record sector changes and performance peaks.
- Verify locked selection, earned unlocks, persistence and practice exclusion.
- Test contested pickup order independently of participant iteration and frame size.
- Check a baseline unattended racer loses; compare competent driving without weakening AI for tests.
- Run recipe selftest, asset verification, shipping checks and local mobile gate. A local result does not substitute for the competition's deployed-URL verdict.

Photorealism is an artistic target, not a test result. Screenshots and moving playtests must describe remaining limitations honestly.

## Review changes

Early moving reviews rejected flat steel textures and an excessively dark dock view. Atlas generated a stronger chipped-paint albedo, and the dock received a dedicated fill light plus a close rider inspection view. The first continuous drive exposed excessive swamp triangles; spatial batches now disappear within the region's fog, and redundant distant trees were removed. Supplies became four-lane stations after the leading pack consumed the original single-file layout. Rivals now value charge and overdrive according to their current reserves. The player starts in the second grid row with two rivals alongside, avoiding a permanent resource deficit from placing all five opponents in front.
