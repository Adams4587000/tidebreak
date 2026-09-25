# Shield clearance and ramp flight — local preview

The shield effect is not a solid collider. Obstacle sweeps now use each craft's measured static body footprint and center, excluding the separate shield and exhaust effects. The hull still collides with pillars and barriers. The previous estimated hull dimensions could stop a craft before its visible body reached the obstacle.

Ramp flight integrates vertical position in world coordinates, independent of animated water height. Launch velocity is bounded by speed, the craft pitches smoothly along its trajectory, and landing feedback uses a smaller splash and softer sound. Both player and opponents share the flight rules. Restart resets flight and ramp state.

The hard-coded eight-second starting shield is removed. Crews retain two deployable shield charges; pickups and combat recovery keep their existing protection rules. Every crew receives 15 seconds of launch assistance without draining the regular 10-second boost reserve. Normal boost refill remains 10 seconds and partial charges remain usable.

Validation is recorded in `evidence/flight-shield/`: 38 pure tests, canonical ship parsing, provenance self-tests, real-input shield clearance and flight checks, and a completed combat race with all six final standings and 17 collected supplies. The flight check measures the ballistic arc and rendered height, verifies manual shield overlap with a pillar without hull contact, and checks the free launch reserve across the 15-second boundary.

Keyboard/touch reverse, both ramp edges, slow ramp entry and reverse downhill passed. The driving check no longer stalls its input loop for a screenshot while crossing the short ramp at launch speed. Touch missile/shield buttons, simultaneous steering/boost, pause/resume and time trial also passed. The unchanged local phone/4G gate passed: 11.5 seconds ready, 6.6 MB, 491 peak draws, 991,628 peak triangles and zero errors. This is browser emulation, not physical-phone validation.

Temporary environment and craft preview unlocks remain enabled. No new external media, model geometry, deployment or commit is included.
