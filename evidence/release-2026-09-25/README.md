# Final release validation — 25 September 2026

This directory records the final local build with earned progression restored. `game-sha256.json` identifies every shipping file tested before commit. Historical preview/refit receipts remain in their own directories.

- Pure rules: 46/46 pass.
- Release guard and canonical ship: pass; 43 modules, one page, 24 assets, 72 candidates, 23 media records; preview unlocks disabled.
- Canonical asset verifier: 24/24 clean.
- Real-input menu/progression flow and Quick Race: pass across desktop, portrait phone, small phone and landscape layouts.
- Combat endurance: completed normal career race, earned progression saved, zero browser errors.
- All six territory time trials: pass with six checkpoints and pickups each, zero browser errors. These later-territory tests explicitly use an isolated unlock fixture, not evidence of earning those unlocks.
- Requested exclusions and high-confidence secret audit: zero findings; historical objects and best-effort raster OCR are covered in the audit reports.

| Circuit | Completion (seconds) | Peak draws | Peak triangles |
|---|---:|---:|---:|
| meridian | 117.98 | 347 | 869,184 |
| blackwater | 101.83 | 260 | 840,046 |
| splitstone | 123.46 | 221 | 420,818 |
| ember | 105.56 | 258 | 623,994 |
| sluice | 111.36 | 321 | 685,456 |
| atlantic | 114.70 | 262 | 349,444 |

These are local browser checks, not physical-phone measurements. The unchanged live jam gate must be run after deployment; its receipts belong in `evidence/live-release/`.
