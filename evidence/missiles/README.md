# Missile correction — local preview

Reproduced a close-range collision defect: a missile fired at a rival 8 m ahead at 90 m/s passed through during the previous 0.25-second collision delay. Ordinary missiles also refused to launch without a rival ahead, while UI feedback did not clearly explain that restriction.

Ordinary missiles now allow unguided firing and collide with other racers immediately; owner exclusion prevents self-hits. Guided specials still require targets, and mines retain their arming delay. Launch flashes, height-aligned projectile effects and persistent weapon-panel outcomes distinguish launch, hit, shield block, scenery impact and miss. All existing ammunition, cooldown and three-hit elimination rules remain.

Validation:
- 44 pure tests passed, including close-range moving targets at 120/60/20 Hz, finite unguided shots, shield blocks and scenery impacts.
- Actual F input launched an unguided missile in time trial and reported its scenery impact. A normal race then fired at a rival 28.9 m ahead and confirmed one damaging hit. Screenshots and read-only telemetry accompany the passing report.
- Actual touch missile/shield controls, simultaneous steering/boost, pause/resume and time trial passed.
- Canonical ship parsing and provenance integrity/self-tests passed.
- Unmodified local phone/4G gate passed: 11.4 s ready, 6.6 MB, 476 peak draws, 972,932 peak triangles and zero errors. This is browser emulation, not physical-device validation or deployment.

Source hashes are recorded separately. Preview unlocks remain enabled, and the changes are uncommitted.
