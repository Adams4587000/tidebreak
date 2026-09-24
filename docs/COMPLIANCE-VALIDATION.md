# Local compliance validation — 24 September 2026

Scope: preserve the approved six-territory combat racer, repair recipe pipeline gaps, and save locally. No hosting, remote or submission is configured. Canonical recipe commit: `4effad311c5e137bca316257259fe5bffd6737de`.

## Changes verified

Visible Quick Race starts the full starter combat race through the unchanged jam harness's supported start selector. The requested dock and territory menus remain primary. Six inline scenery families now use canonical ASSET modules. Twenty-four shipping objects have three independently constructed candidates, inspected five-view renders, recorded selections and scale expectations. Three placeholder props were replaced. All 23 shipping media files retain Atlas provenance. The chase camera now follows frame displacement before easing its relative offset, correcting excess turbo lag without changing racing rules.

The retrospective comparison is explicitly labeled; it does not invent a historical one-pass floor or erase previous process gaps. AGENTS.md and the integrity guard define continuing production requirements.

## Completed checks

- Pure rules/combat tests: 19/19 pass.
- Canonical asset verifier: all 24 shipping objects pass; 63/72 candidate attempts pass, with rejected warnings preserved.
- Canonical ship check: 41 modules and one HTML page, clean.
- Canonical recipe self-tests: pass, including negative fixtures and hierarchy behavior.
- Provenance guard and mutation self-test: 24 assets, 72 candidates and 23 media entries; zero failures.
- Normal title/dock/arena flow: four desktop/phone viewports pass, including locked selections, orbit and countdown.
- Combat touch: fire, shield, simultaneous steer/boost, pause/resume and returning to the dock pass.
- Quick Race: three viewports pass after the camera fix, including fresh starter state, five rivals, real countdown and sustained turbo. Camera-to-craft distance stays below 20 m.
- Fresh-save full combat race after scenery extraction: finished first in 112.70 s, earned unlocks normally, collected 11 supplies; sampled peaks 715 draws / 1,268,194 triangles. This run precedes the camera correction; subsequent quick-race and six-course checks cover the corrected camera.

All six full-course runs passed after the camera correction, with zero browser errors. The final stock gate is recorded below. The arena driver explicitly unlocks later arenas in a test fixture, then drives each entire course with keyboard events. It does not prove earning all career unlocks. No test injects progress or teleports to finish.

## Visual review and limits

See `compliance/scene-review.md` and raw anonymous-pair critiques. Independent Atlas criticism still favors the commercial reference for environment variety and material richness. The camera bug is fixed; this is not a claim of AAA photorealism, human playtesting or visual parity.

Local Chromium uses the Mac's Metal backend. Emulated phone/touch/4G results are not physical-device measurements. A final public-URL gate tied to the published source commit remains required before submission, at the user's direction.

## Complete-course results

Real keyboard driving, explicitly unlocked time-trial fixture; every course crossed all six checkpoints and finished. Peaks are sampled render counts, not a guarantee for every possible combat/camera state.

| Arena | Race seconds | Peak draws | Peak triangles |
|---|---:|---:|---:|
| meridian | 112.46 | 344 | 847,164 |
| blackwater | 117.21 | 248 | 825,454 |
| splitstone | 128.78 | 217 | 401,636 |
| ember | 114.16 | 254 | 608,378 |
| sluice | 112.60 | 320 | 671,586 |
| atlantic | 120.98 | 261 | 338,498 |
