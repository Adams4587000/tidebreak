# Current standalone territory build

The latest campaign, menu-flow and full-route evidence is in [TERRITORY-VALIDATION.md](TERRITORY-VALIDATION.md). The records below describe earlier prototypes and the superseded continuous-frontier campaign; their historical measurements do not describe the current menu flow. Current evidence files are identified in the new record.

# Validation record — 22 September 2026

The campaign check completed all six chapters from a fresh browser profile using keyboard input, then reloaded and verified every clearance and the championship. No position or progression mutations are used by that check.

| Chapter | Earned result | Peak draws | Peak triangles |
|---|---|---:|---:|
| Port Meridian | Place 1; 0 signals; 2 jumps; 5 boosts; 0 surge gates | 135 | 405,630 |
| Drowned Reach | Place 1; 16 signals; 1 jumps; 10 boosts; 0 surge gates | 123 | 1,247,668 |
| Splitstone Passage | Place 1; 0 signals; 3 jumps; 6 boosts; 0 surge gates | 84 | 273,866 |
| Ember Basin | Place 1; 0 signals; 2 jumps; 6 boosts; 0 surge gates | 82 | 270,434 |
| The Sluice | Place 1; 0 signals; 2 jumps; 6 boosts; 2 surge gates | 144 | 393,662 |
| Outer Atlantic | Place 1; 0 signals; 2 jumps; 6 boosts; 0 surge gates | 80 | 286,408 |

Four campaign unit tests pass: chapter-specific requirements, unfinished runs, time-trial exclusion, best-time persistence, corrupt storage and sequential access.

A separate real-touch browser check verifies simultaneous steering and boost, pause freezes race time, resume works, returning to the dock works and time trial removes race opponents.

The scenery check uses an explicitly unlocked visual fixture to inspect volcanic surface fissures and the ocean scenery after the complete campaign run. It provides no evidence of earning unlocks; the campaign check does that separately. These final scenery edits do not change track geometry, opponents, input, objectives or saved progression.

Initial full-course profiling caught a swamp peak above 1.5 million triangles. Smaller canopy meshes and independent horizon culling brought it within budget without reducing tree coverage. The failed measurement is retained as `swamp-budget-before.json`.

The jam verdict in `evidence/jam-local/` is for localhost. A public deployed URL, public source repository and final entry submission remain outstanding. FPS readings come from this Mac’s automated Chrome, not a representative range of phones.

## Original hydroplane build: local phone gate

Source commit `8b46f409fb3c92720d06a86e7a5c454871c6ee1d`, 22 September 2026, 20:00 UTC. Unmodified recipe harness, 390×844 at 3×, touch events, 4 Mbps down / 1 Mbps up, 60 ms latency, CPU throttled 2×.

- Ready: 7.4 seconds.
- Transfer: 4.8 MB.
- Movement during held control: 136.7 metres.
- Peak: 84 draw calls, 326,700 triangles during the opening phone segment.
- Browser errors / missing files: 0 / 0.
- Median measured FPS: approximately 60 on this Mac’s ANGLE Metal renderer.
- Result: PASS. Nine of nine shipping modules also pass the geometry verifier; all 21 JavaScript modules parse and stay within the game folder.

This gate checks the opening phone segment. The table above records separate full-course measurements, including the substantially heavier swamp.

## Spacecraft fleet validation

The current build replaces the single hydroplane with Kestrel, Albatross and Manta geometry. Foils retain their animation pivots while static body sections are batched. All three craft pass selection and animation checks: folded foils at rest, deployed foils while racing, and increased engine emission and exhaust length during boost. Original Atlas carbon-composite maps are applied to the underside and foil surfaces.

The complete six-course keyboard replay passed again with spacecraft opponents and updated hull clearances. The test uses the visible gate timing information to brake and wait for active surge windows, rather than relying on a lucky arrival. All unlocks and championship status persist after reload.

| Chapter | Peak draws | Peak triangles |
|---|---:|---:|
| Harbour | 188 | 435,916 |
| Swamp | 191 | 1,297,912 |
| Gorge | 158 | 333,850 |
| Volcano | 140 | 328,834 |
| Sluice | 219 | 452,794 |
| Atlantic | 131 | 309,374 |

Final spacecraft phone gate: source commit `38193cf2e2b2fe1ed146d68ac92a5957711f6c97`, 22 September 2026 at 21:01 UTC. Ready in 8.2 s on the recipe's 4G / CPU 2× profile; 5.3 MB loaded; 136.8 m of touch-driven movement; opening-segment peaks 145 draws / 385,580 triangles; zero browser errors or missing files. PASS. All 11 geometry modules pass structural verification, and all 23 shipping JavaScript modules parse. Separate touch and spacecraft-animation checks also pass on the final build.

## Drowned Frontier overhaul (2026-09-22; supersedes short chapters)

The preceding reports apply to historical builds. This revision replaces separate short chapter circuits with continuous endurance routes and six exposed rider–machine pairs. Current evidence is named `endurance-*`, `roster-*`, `dystopia-assets.*`, and `jam-dystopia*`.

Development review caught and corrected an invisible dock silhouette, overly pristine steel, excessive swamp triangles, a featureless grandstand rear, supply starvation in the single-lane layout, and overbroad volcanic glow. Rejected Atlas textures remain recorded in the provenance. Static batching remains spatially bounded; swamp draw distance is limited inside its fog.

The standalone rule tests cover starter-only access, practice/abort exclusion, crew milestones and persistence, contract conditions, malformed saves, earliest swept pickup ownership independent of iteration order, pickup tunneling, and finite AI energy. The AI is not adjusted downward inside any browser test.

The full-run driver sends real keyboard events. It neither teleports nor injects progression. It asserts all six sectors are visited, endurance duration exceeds four minutes, both player and rivals collect supplies, lens droplets occur, render counts remain within the jam ceilings, and the completed race unlock persists after reload. This is functional and performance evidence, not proof that the game is balanced for every player or that the visuals match commercial AAA titles.

The canonical 404 helper files were hash-compared to the recipe checkout and remain byte-identical. The shipping check parses 32 modules and finds no paths escaping the game folder.

Final endurance regression: **PASS**, 14.2 km in **254.323 seconds (4:14.323)**, fourth of six, all six sectors recorded, 140 player pickups, opponent pickups verified, lens droplets verified, and earned crew/contract access persisted after reload. Peak **673 draws / 1,343,600 triangles**. See `evidence/endurance-check.json` for raw telemetry. The test did not require or force a win.

Final roster and touch regressions: **PASS**. All six crews are inspectable, five initially locked; portrait phone selectors do not overlap; simultaneous steering and boost work; pause freezes race time; resume, dock and practice work. Final asset verifier: **18/18 clean**. Pure progression/competition tests: **7/7 pass**.

Official local phone/4G gate on source commit `8ad34e2d12e9025bf0763009f967cde6c3ec1d89`: **PASS**. 390×844 @3x, real touch, 4 Mbps/1 Mbps, 60 ms latency, CPU 2× slowdown. Ready **11.7 s**; body weight **6.1 MB**; real-touch movement **138.0 m**; peak **582 draws / 1,020,636 triangles**; **0 errors and 0 missing files**. Median measured fps **59.8** on ANGLE Metal / Apple M4; this is browser emulation, not a physical-phone benchmark. All runtime files came from the game folder. Raw verdict and screenshots: `evidence/jam-dystopia/`.

The gate URL was localhost. A hosted URL, hosted gate receipt and competition submission remain separate release steps.


## Turbo combat expansion (2026-09-23)

Game source: `acd1c38043f0577348c9798272a88233aee2a4a8`. Earlier endurance receipts remain historical. Current evidence uses `combat-*` and `jam-combat/`.

- Pure progression, pickup, combat and AI rules: **18/18 pass**. Tests cover finite ammo, cooldowns, three-hit elimination, recovery protection, shields, missile evasion, laser ignition, mines, bombs, lethal hazards, pursuit symmetry, result ordering, reputation on elimination and varied seeded AI outcomes.
- Canonical 404 asset verifier: **18/18 clean**, including all six newly armed spacecraft. The multi-angle sheet was visually inspected.
- Ship validator: **35 modules / 1 page**, all parse and all paths remain inside the shipping folder.
- Canonical `assetlib.js`, `surfaces.js`, `rig.js` are byte-identical to the recipe's harness copies.
- Real pointer drag rotates the dock camera; all six crew previews remain available and five start locked. Phone crew/contract selectors and six race controls fit without overlap.
- Real phone touch launches a missile and consumes a shield charge; simultaneous steering and boost, frozen pause time, resume and practice all pass.

The first combat endurance run exceeded the triangle ceiling at 1,518,396 triangles. Distant scenery was then excluded from the lower-resolution reflection pass while retaining its main-view range. A following real-keyboard run completed all six sectors in **3:08.209**, first place, 26 supplies, 21 shots, five damaging hits and one player takedown. Rivals fired 30 shots; four rival crews were eliminated. Peak **637 draws / 1,197,986 triangles**. No AI values, race positions, ammo or unlocks were injected by the driver. Final-source confirmation and final classification are recorded in `evidence/combat-endurance-check.json`.

Official recipe phone/4G gate on the final source above: **PASS**. 390×844 @3x, real touch, 4 Mbps down / 1 Mbps up, 60 ms latency, CPU 2×. Ready **15.030 s**, body **6.387 MB**, touch displacement **263.37 m** (353.75 m path), peak **443 draws / 929,886 triangles**, median **51.2 fps** on Apple M4 / ANGLE Metal, **zero errors or missing files**, no runtime external dependencies. This is throttled browser emulation, not a physical-phone benchmark. The preceding gate receipt is retained in `jam-combat-initial/`.

The gate address is localhost. Publishing and competition submission have not been performed. All receipt details and screenshots are in `evidence/jam-combat/`.

Final-source endurance confirmation: **PASS**, all six sectors, **3:08.059**, first place with Vesper finishing **1.783 seconds later**. The player recovered from sixth during the opening sector. **25 supplies, 17 shots, six damaging hits, two takedowns**; rivals fired 24 shots, and four rivals were eliminated. Peak **666 draws / 1,376,162 triangles**. The final table lists all six crews and their true finish/elimination status. The run earned 301 reputation; finish count, reputation and crew/contract unlocks survived reload. Raw data: `combat-endurance-check.json`.

A separate observed run ended in player elimination on a lethal supply mine at 79.2% progress. Its telemetry is retained in `combat-elimination-observed.json`; the old test's assumption that every combat run must survive caused that assertion failure. The game correctly ended the run. A subsequent refinement added an explicit warning for lethal mines in the player's lane. The test now distinguishes a legitimate elimination from a software failure, and still requires all six sectors for a completed race. The final run above completed normally.
