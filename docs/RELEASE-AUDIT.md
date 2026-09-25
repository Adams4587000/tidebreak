# 404 jam release audit — 25 September 2026

Rules checked against the live https://game.404.xyz page and the governing jam repository at commit `cef9c34754ec0109cb23a404343bf6bb1ddb50dd`. The current recipe HEAD remains the pinned `4effad311c5e137bca316257259fe5bffd6737de`; its canonical helpers and harness are unchanged.

| Requirement | Finding |
|---|---|
| Public source and real development history | Existing public `Adams4587000/tidebreak` has 18 development commits beginning 22 September, after the 11 September cutoff. Preserve that history. |
| Geometry built through the recipe | 24 shipping asset modules pass canonical verification. All shipping modules parse; no imported mesh formats or flagged geometry arrays. Provenance covers 24 assets, 72 construction candidates and 23 media files. |
| Original game, no copied reference-game assets/code | Original constructor assets and gameplay; an exact-file comparison with the recipe’s bundled warehouse example matched only the explicitly permitted canonical `assetlib.js` and `surfaces.js` helpers. Reference screenshots and learning notes remain outside the shipped game. |
| Named art and tools | Atlas model/output provenance and original procedural art/audio are documented in CREDITS.md. Submission draft names known tools and models, and discloses that the earlier coding-model identifier is not recorded. |
| Earned release progression | Temporary preview access is off. Career and preview saves remain separate. Rule tests, locked menu flow and a real completed combat race verify earned unlocks. |
| Self-contained public deployment | GitHub access is verified and Pages is enabled with Actions as its source. The workflow publishes only `game/`. Deployment and its exact-commit live gate are next. |
| Live phone/4G gate | Must be run against the public deployment and recorded source SHA. Historical/local passes are not substituted for that verdict. |
| Entrant/team/rights declarations | Owner confirmation and public judging contact are pending. No eligibility claim or entry PR has been made on their behalf yet. |
| Submission | Prepared official-schema entry draft and step-by-step procedure in `submission/`. Final entry must contain real contact, source SHA and the unedited live verdict before 25 September, 23:59 UTC. |
| Requested name exclusions | No matches in working files or any reachable historical object, path or commit metadata. Best-effort OCR found no matches in 659 unique current/historical images. The report omits the excluded strings themselves. No history rewrite is needed. |
| Credentials | No high-confidence credentials found in current tracked/pending files or reachable Git history. API keys and login credentials are not included in evidence or deployment. |

Current release receipts are in `evidence/release-2026-09-25/`. Earlier refit notes and preview receipts describe their state when recorded; they are retained as history, not rewritten to claim they tested this release.

The historical artistic-method limitations in COMPLIANCE.md remain explicit. We do not claim commercial visual parity, physical-phone testing, independent review of the latest changes, an organizer verdict, or prize eligibility from local automation.
