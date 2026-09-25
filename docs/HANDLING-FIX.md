# Reverse and ramp-edge correction

Follow-up to the local refit, 25 September 2026. All changes remain local and uncommitted.

Hold S / Down, or the phone's BRAKE / REV button, to brake to a complete stop and then reverse. Reverse thrust tops out at 12 m/s (43 km/h). Release to accelerate forward. Steering responds to the direction of travel; course steering assistance and boost cannot fight reverse input. Speed instrumentation identifies reverse, and engine/water audio and craft animation use the speed magnitude.

Ramp support now includes hull overlap at both side edges, with blended entry at the front and outer edge. The former full-height side collision boxes are removed; hulls ride those edges as part of the ramp surface. Grounded craft follow the deck height when moving downhill. The raised rear face, bridge pillars and course barriers remain solid. Swept collision still prevents tunneling, including reverse approaches. Course-distance correction wraps correctly when backing across the starting line.

Impact feedback plays only for a meaningful inward impact at the start of a contact episode. Holding throttle against a wall or briefly separating due to collision resolution does not repeatedly play the effect. After a quarter-second of separation, a new impact can sound again.

Validation uses genuine keyboard and touch input through the ordinary title, dock and territory menus. `tools/handling-check.mjs` drives into a pillar, holds throttle against it, reverses away, checks reverse steering and the boost interlock, rides both ramp edges, makes a slow edge approach, backs downhill, and checks touch cancellation restores forward thrust. No game positions, progress, unlocks or private start hooks are changed by the test.

Final verification receipts are in `evidence/handling-fix/verified/`. Earlier passes in the parent directory and `final/` predate the final adjustment to downhill deck support. They are retained as intermediate evidence. This is a local browser check, not a physical-device or deployment claim. No geometry assets were replaced.

Final results: 33/33 pure rule tests; keyboard/touch handling and combat-control checks passed; full Meridian combat race passed with all six racers classified and no browser errors. The unchanged local phone/4G gate passed: 11.5 seconds ready, 6.6 MB transferred, 493 peak draws, 997,340 peak triangles, zero errors. The runtime source hashes are recorded in `verified/source-manifest.json`. Shipping parse/path and provenance integrity checks passed.
