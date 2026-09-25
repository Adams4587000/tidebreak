# Visible hit reaction — local preview

Damaging hits drive a separate visual pivot for 1.2 seconds: hull rock/pitch/lift, rider lurch, orange material flash and sparks. The pivot does not move collision coordinates or change steering. Shields and recovery protection do not trigger hull recoil. Eliminated craft tip and sink for 1.6 seconds before becoming invisible. No geometry asset or external media was added.

Validation:
- 46 pure tests passed, including settling, deterministic paused poses, unchanged hull coordinates, shield protection, finite elimination and restart reset.
- Actual race inputs caused a confirmed missile hit. Read-only telemetry recorded 0.36 rad initial roll, -0.16 rad pitch, full flash and rider recoil, then verified all reaction offsets returned to zero. Screenshots capture the struck craft and subsequent recovery.
- Actual touch weapon controls, simultaneous steering/boost, pause/resume and time trial passed.
- Canonical ship parsing and provenance integrity/self-tests passed.
- The unmodified local phone/4G gate passed: 12.3 s ready, 6.6 MB, 489 peak draws, 991,628 peak triangles, zero errors. Emulated median FPS was 29.9; this is not a physical-device measurement or deployment.

Hashes are in source-manifest.json. Temporary preview unlocks remain enabled; no commit was made.
