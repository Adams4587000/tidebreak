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

## Final local phone gate

Source commit `8b46f409fb3c92720d06a86e7a5c454871c6ee1d`, 22 September 2026, 20:00 UTC. Unmodified recipe harness, 390×844 at 3×, touch events, 4 Mbps down / 1 Mbps up, 60 ms latency, CPU throttled 2×.

- Ready: 7.4 seconds.
- Transfer: 4.8 MB.
- Movement during held control: 136.7 metres.
- Peak: 84 draw calls, 326,700 triangles during the opening phone segment.
- Browser errors / missing files: 0 / 0.
- Median measured FPS: approximately 60 on this Mac’s ANGLE Metal renderer.
- Result: PASS. Nine of nine shipping modules also pass the geometry verifier; all 21 JavaScript modules parse and stay within the game folder.

This gate checks the opening phone segment. The table above records separate full-course measurements, including the substantially heavier swamp.
