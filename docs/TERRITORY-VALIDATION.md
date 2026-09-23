# Territory validation — 23 September 2026

Implementation source: `7ddbf286be6c062a426bbd5fcfb201ed3eecddf7`.

## Complete routes

All six standalone circuits completed through actual keyboard steering, braking and boosting. A deliberately unlocked browser fixture made later territories accessible; no positions, elapsed time or race progress were injected. These are time trials, not evidence of earning the six unlocks or of six-crew worst-case rendering. The separate combat test covers the crowded opening arena and actual career progression.

The initial six-route run preceded the final swamp density and menu polish; the changed swamp then received its own complete rerun. The table uses that newer swamp measurement. Every sampled frame retained the selected biome through the finish. Each circuit passed all six checkpoints, collected supplies and produced water on the lens. The Sluice run used eight timed surge windows.

| Territory | Finish time | Peak draws | Peak triangles | Checkpoints |
|---|---:|---:|---:|---:|
| meridian | 112.58 s | 298 | 833,720 | 6 / 6 |
| blackwater | 119.45 s | 211 | 804,206 | 6 / 6 |
| splitstone | 130.14 s | 165 | 389,832 | 6 / 6 |
| ember | 114.35 s | 202 | 592,848 | 6 / 6 |
| sluice | 115.31 s | 265 | 654,604 | 6 / 6 |
| atlantic | 124.20 s | 197 | 315,198 | 6 / 6 |

Evidence: `evidence/territory-races-check.json`, `evidence/territory-races-1-check.json`, and the per-checkpoint/finish PNGs. There were no page errors or missing files. A geometry audit samples the whole length of every route: nearest-course projection error below 0.003 m and no abrupt unsteerable turns at racing scale.

## Menu and touch flow

`territory-flow-check.json` passes at 1440×900, 390×844, 390×667 and 844×390. It checks the title/Enter button, separate dock and territory screens, real 3D drag rotation, locked crew gating, five locked territory cards with lock icons, preview without changing the active race world, back navigation, control placement, countdown and actual racing speed. No page errors or missing files were observed.

`combat-touch-check.json` passes real missile and shield taps, simultaneous steering and boost, pause with frozen time, resume, return to the dock, navigation back to the arena screen, and solo time-trial launch.

## Logic and source

19 tests pass, covering six-territory progression, exact objectives, practice exclusion, partial-run rewards, old-career migration, malformed saves, weapon fairness, three-hit elimination, shared pickup ownership and finite AI boost. The ship checker passes all 35 JavaScript modules. Canonical assetlib, surfaces and rig helper hashes match the recipe checkout exactly. Existing asset constructors are unchanged by this revision.

## Fresh-save combat and earned progression

A complete six-crew Meridian race finished fourth in **1:54.579**, 1.467 seconds behind the winner. The player fired 10 shots and landed one damaging hit; rivals fired 22 shots. Eight supplies were claimed. All six finishers were classified. The run earned 97 reputation, unlocked Drowned Reach and Vesper / Albatross, and retained those unlocks after reload. Only the next arena opened. Peak rendering was **681 draws / 1,245,894 triangles**. Evidence: `combat-endurance-check.json` and `combat-endurance-result.png`.

## Local 404 gate

`tools/territory-gate.mjs` adapts the canonical gate with actual taps through Enter the dock and Choose territory, then scrolls to the ordinary Race button. The canonical source remains unchanged. This is explicitly an adapted local verdict; the stock single-tap root-URL gate does not understand this menu flow. It is not a deployed competition verdict.

At source `7ddbf286be6c062a426bbd5fcfb201ed3eecddf7`, 390×844 @3, real touch events, 4 Mbps down / 1 Mbps up, 60 ms latency, CPU 2×:

- Ready: **14.549 s** (20 s budget).
- Body transfer: **7.17 MB** (10 MB budget).
- Touch movement: **297.68 m**, path **418.09 m**.
- Opening peak: **496 draws / 1,028,574 triangles**.
- Median observed FPS: **58.1**, Apple M4 / ANGLE Metal, under the throttled browser profile.
- Errors, missing files and external dependencies: **zero**.
- **PASS**, with the navigation adaptation above.

Evidence: `evidence/jam-territories/verdict.json` and its loaded / started / moving screenshots. This opening-segment gate does not establish every territory's crowded-race worst case; full-route time trials and the Meridian combat run are separate evidence.

## Scope

Atlas generated seven new illustrated menu images. They are not runtime screenshots. The game remains a browser implementation with modular procedural scenery, route-following rivals and limited-resolution water reflections. Browser touch/device emulation does not replace testing across physical phones. No public deployment or competition submission was made.
