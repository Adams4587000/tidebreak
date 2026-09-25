# Smooth launch and dock ignition

The reported countdown/launch freeze was reproduced with real Quick Race input. Before changes, the 390×844 phone viewport with 4× CPU slowdown had a 1,483 ms countdown frame and a 200 ms launch frame; desktop had 633 ms and 250 ms respectively. The first instancing revision removed >100 ms frames from the countdown and first ten seconds of racing in both profiles. These are desktop browser emulation results, not measurements on a physical phone.

## Changes

- Reuse six prepared craft instead of rebuilding and disposing the entire fleet at each race start. Reset flight/contact state on restart and dock return.
- Compile race/effect shaders and allocate/draw the lens refraction target behind loading feedback. Set the chase camera and paint the HUD before beginning the countdown; the first splash no longer creates its render target during acceleration.
- Share repeated scenery geometry through short instanced chunks; upload instance transforms instead of another copy of every rock/building. Freeze static transforms and cache repeated label textures. Canonical assets/helpers remain unchanged.
- Use per-material uniforms for distinct fleet finishes, allowing shader programs to be shared without removing their albedo/normal/roughness detail.
- Overlap texture and object requests. Yield between course/chunk construction steps. Stop rendering the obscured 3D world on title and territory screens.
- Bound mobile race resolution, disable mobile canvas MSAA, reduce shadow/reflection resolution and update frequency, and adapt resolution gradually when frames remain slow. The dock uses a sharper single-craft view. Mobile water uses a 192-segment grid; the physics and wave function are unchanged.
- Hold **Ignite Engine** or **R** in the dock for stationary revving, exhaust flicker and an engine pitch/gain ramp. Touch release/cancel, keyboard release, blur and page changes release the throttle. Enter/Space and assistive clicks also work.
- Add a brief startup sound on the first permitted interaction, plus mechanical navigation, craft-selection, back and launch cues. Browser autoplay rules require a gesture; the title offers **Enable Startup Sound** during loading. All sound respects mute.

## Boost and opponent pace

Cruise speeds are 14% higher for every craft, with each original boosted top speed preserved. Kestrel now cruises at 258.6 km/h instead of 226.8 km/h; boost still reaches 333.4 km/h before shared pursuit/drafting/perks. When thrust drops, the shared player/AI engine model coasts at 4 m/s² instead of rapidly interpolating down. Braking, weapon hits and obstacle contact still remove speed immediately.

Rivals cannot queue a reserve burst during free launch/nitro, wait briefly afterward, and choose finite bursts with recovery intervals. Their lateral lane changes now spend the travel distance budget. Difficulty, imperfect racing lines, shared supplies, drafting and pursuit remain. The 15-second starting boost, 10-second manual reserve, 10-second refill and five-second nitro remain intact. An in-game cue explains how to use the reserve after launch.

## Validation records

`evidence/performance/before/` records the original release. `after/` and `after-instancing/` record intermediate performance measurements. The full-course driver tests the shared-geometry revision with explicit isolated unlock fixtures; subsequent dock camera, exhaust and loader refinements are checked separately against the final working tree. Final control, flow, gate and source-hash records are kept under `evidence/performance/final/`.

No scenery asset is replaced or imported. The runtime geometry inventory is updated deliberately; unchanged asset verification receipts remain valid. Screenshots were reviewed locally for control placement, craft visibility and flame appearance. This is not an independent commercial-art comparison or a claim of physical-phone validation. The previous public verdict remains tied to its original source commit until this revision is deployed and tested against the live URL.

## Final local results

- 53 rule tests pass, including frame-rate independent coasting, unchanged boosted speed ceilings, finite AI bursts, and lateral travel cost.
- Provenance guard and canonical ship pass: 24 unchanged asset modules, 72 recorded candidates, 23 media files; 44 shipping modules parse.
- Desktop and 390×844 touch emulation at 4× CPU slowdown: no countdown/launch frames over 100 ms; both peaked at approximately 16.8 ms. Local readiness was 0.98 s desktop and 2.37 s phone emulation. Network-throttled live results are recorded separately.
- Dock rev, six distinct craft, keyboard Space/hold, touch release, sound cues, mute, restart and return to dock pass on desktop, 390×844, 390×667 and 844×390 viewports. Screenshots prompted moving the portrait rotation hint above the craft information.
- Real-keyboard combat race: first place, 92.33 seconds, all six checkpoints, 17 supplies, earned territory/craft unlocks persisted after reload. Peaks: 633 draws and 1,192,858 triangles; zero browser errors. This is one seeded race, not a claim that every player will win.
- Post-balance real-keyboard time trials also finished Splitstone (112.36 s) and Sluice (110.13 s), surviving all checkpoints with supplies and no browser errors. Later-territory unlock fixtures are explicitly isolated test data.
