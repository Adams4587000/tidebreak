# RUST 17 - improvements made beyond the 404 game recipe

The 404-game-recipe (GAME.md) specifies only the METHOD: the prompt (fan out, /loop, harsh
critic, blind compare), the style-lock, "every object comes from 404", the harness contract
(`__READY__`/`__START__`/`__GAME__`), and a list of traps. It says outright that architecture,
engineering and build order are left to you. Everything below is what RUST 17 added on top,
distilled to be reusable by another agent building a different game. Grounded in the shipped
build (~/cod_derrick, 24 rounds) and its handoff docs.

## Process and harness (extend the recipe's gate)
1. Build a REAL motion gate, not just forward-drive. The recipe's playtest only walks forward and
   cannot test touch. RUST 17 added a gate that drives with real mouse+keyboard AND real
   multi-touch on a phone viewport (`fpstest.mjs --touch`). A build shipped unstartable on phones
   for weeks when only the debug-hook path was tested; drive real input events.
2. Blind-critic panels with the key withheld (`blindpairs.py`), a FRESH critic each round, judging
   in-motion filmstrips never stills, and the critic must be able to FAIL the round. A reviewer
   that only writes notes is not a gate.
3. Turn the reference into machine-checkable CLAIMS plus a measurement script, and let the critic
   REJECT the metric. A bad statistic certifies failure (a two-temperature metric once scored the
   build above the real photo while it plainly failed by eye). Caveat learned: skip measurements
   when the capture camera is pitched, the numbers are meaningless then.
4. Hard budget gate every round, as a first-class citizen: draw calls, triangle count, MB, load
   time, measured on both desktop and touch. Rule: anything added needs headroom bought FIRST
   (instance repeated props, atlas the cards). Budgets were the constant constraint.
5. Snapshot + cache-busting publish. Snapshot game/ into rounds/rN/ with filmstrips + verdict each
   round. Publish stamps a `?v=rN-time` on every module import AND the index.html script tag,
   because GitHub Pages caches ~10 min and phones served stale builds. After publishing, curl the
   live file and grep for the string you changed, publish "green" does not mean live.
6. Stopping rule up front: pick a round count before starting. A critic that fails twice for the
   SAME structural reason is not asking for another round, it is telling you to change the plan,
   the subject, or accept the limit. Spend rounds on the one property that decided the comparison,
   not the whole critic list.

## Rendering and lighting (the biggest quality levers)
7. Two colour temperatures in every frame (warm key, cool fill), enforced as a standing critic
   rule. Single-temperature lighting was the deciding failure in early rounds.
8. Sky-to-ground handshake. Fit the atmosphere/haze/fog stops to the ACTUAL rendered sky (sample
   sky colour a few degrees off the sun, invert through the renderer's ACES at the exposure) so
   aerial perspective, far hills and haze fade toward the sky that is actually behind them. Kills
   the pale seam where far ground meets sky.
9. The ground-lighting trap, named to the critic every round: lights that emit without coupling to
   the surfaces around them leave the world lit and the floor dark. It went unfixed for rounds
   while being correctly diagnosed every time, so make it a standing check.
10. Restrained, A/B-toggleable screen-space polish, each pass with a `?flag=0`: depth-only SSAO (no
    second scene pass), contact shadows (a short second AO sweep only where the wide one found
    occlusion), distance dust haze on the lower frame only, heat shimmer past 25 m, and a three-way
    colour grade (shadows cooler, mids warm, highlights straw) instead of a LUT so nothing extra
    ships. Avoid generic bloom and film grain.
11. Threshold bloom in linear HDR (~0.85) so only genuinely sunlit surfaces lift, not the whole
    frame.
12. Ground skirt to the horizon. Extend the ground from the map bounds out to ~400 m, starting at
    the terrain height sampled ON the boundary and settling lower, so the sky/panorama ground does
    not show as a "lake" or white band beyond the edge and there is no vertical wall at the seam.
13. Far band for the mid-distance. ONE merged mesh (no colliders, no shadows) of distant landmarks
    at ~120-300 m to fill the space the haze eats. Place them closer and bigger than intuition says
    or the haze makes them invisible.

## Materials (what moved it off "not AAA")
14. Triplanar material system: tint by asset colour, shared per recipe set (so per-block static
    baking stays per-set), basecolor on `material.map` so baking works.
15. Macro variation to kill visible tiling: read the same tile at 1/9 frequency on the dominant
    projection and modulate albedo ~35% and roughness ~25% by luminance vs the tile mean.
16. Curvature/edge wear in the SHADER, not geometry: off-axis normals (1 minus the max triplanar
    blend weight) read lighter and smoother, so edges wear without extra tris.
17. Damage as GEOMETRY for hero props, not decals: punched craters (ring on the surface, torn
    collar, dark floor), dents as moved vertices, torn door flaps. Flat decals on curved or
    obliquely-viewed surfaces crease and lift.
18. 2K PBR sets for hero surfaces; 512 px was a named root cause of the "not AAA" verdict.

## Decals (hard-won rules)
19. Never put a flat quad decal on a curved surface (tanks, drums, pipes). It creases and lifts at
    an angle whatever the snap does. Judge every decal from an ANGLE, never head-on.
20. Place decals by material rule, not blanket: notices/cracks on concrete only, seepage only where
    there is no cladding, rust runs on containers. Blanket placement reads as stickers.

## Asset pipeline and geometry
21. Never decimate a mesh. Reduce segment counts at generation time. Decimation shreds silhouettes.
    (Weld + meshopt only for optimisation, no client-side decimation.)
22. Copy the canonical loader (`assetlib.js` + `surfaces.js`), never rewrite it. Anything animated
    loads per instance with `keepHierarchy`, never `.clone(true)` - clones lose joints silently.
23. Bake static scenery per BLOCK, never the whole world. Whole-world baking garbles GLBs into dark
    blocks and loses per-object separability.
24. Chamfer boxes cheaply and everywhere via a THREE Proxy that returns a 1.5 cm RoundedBoxGeometry
    for any box whose smallest side is >= 25 cm (about 12 to 60 tris each). Hard box edges were a
    named "not AAA" cause.
25. Ground the props. Contact fillets (a rounded sand skirt where a prop meets terrain) plus a ~4 cm
    sink, instead of shelf pads with visible lips. For props on legs over uneven ground, drop a
    pier from the prop's OWN geometry footprint into the ground.
26. When a note is about how something LOOKS or where it SITS, measure the asset's geometry, never
    guess an offset. Guessing offsets cost multiple failed rounds ("use the geometry, not guess").

## Placement and world
27. Author hero placement by hand; do not rely on placement rules for composition. Rules cannot
    compose a readable scene; the good frames came from hardcoded coordinates.
28. Paint worn paths into the terrain: a "disturbed sand" third tile along door-to-cover and
    spawn-to-door lines via a per-vertex mask, with ruts as terrain relief rather than decals.

## Audio
29. Full spatial audio from generated SFX: distance gain + stereo pan, far shots swap to a distinct
    "distant" recording, positioned loops for machinery, an ambience bed, and music crossfades.
    Gate the first audio on a user gesture (browsers require one; on a title screen the only gesture
    is the Deploy button, so open audio there).

## Mobile and perf
30. Measure the touch build separately every round (draws and tris differ from desktop) and shed
    clutter on phones (e.g. keep every second grass tuft). Never trust software-renderer FPS as
    evidence of phone performance.

---
Note: many of items 21 to 23 and "two colour temperatures" are rules the recipe's own traps hint
at; the value here is that RUST 17 turned them into enforced, tooled, per-round gates rather than
advice. The genuinely new engineering is the sky-to-ground fit (8), macro variation + shader edge
wear (15,16), damage-as-geometry (17), the horizon skirt and far band (12,13), grounding via
measured-geometry fillets and piers (25,26), and the touch motion gate (1).
