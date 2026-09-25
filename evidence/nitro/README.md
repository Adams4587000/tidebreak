# Nitro — local preview validation

Nitro appears in alternating energy-supply rows across all six territories. It refreshes a five-second automatic boost, adds the existing 12% overdrive factor without multiplying overlapping Overdrive, preserves the normal reserve and respects braking. Every crew uses the same rules. The reviewed supply model and existing effect geometry are reused; no external assets were added.

- 41 pure tests passed, including finite duration, braking, first-touch pickup ownership, refresh behavior and AI thrust.
- Real-input driving collected Nitro after launch assistance expired. Speed rose from 63.65 m/s to 103.67 m/s without pressing boost, with the reserve unchanged at 100. HUD countdown, expiry and restart passed; zero browser errors.
- Touch missile/shield controls, simultaneous steering/boost, pause/resume and time trial passed.
- Canonical ship parsing and provenance integrity/self-tests passed.
- Unmodified local phone/4G gate passed: 11.5 s ready, 6.6 MB, 487 peak draws, 991,628 peak triangles and zero errors. Browser emulation is not physical-phone testing or deployment.

Source hashes are in source-manifest.json. Preview unlocks remain enabled; changes remain uncommitted.
