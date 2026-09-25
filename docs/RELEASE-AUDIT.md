# 404 jam release audit — 25 September 2026

Rules checked against the live https://game.404.xyz page and the governing jam repository at commit `cef9c34754ec0109cb23a404343bf6bb1ddb50dd`. The current recipe HEAD remains the pinned `4effad311c5e137bca316257259fe5bffd6737de`; its canonical helpers and harness are unchanged.

| Requirement | Finding |
|---|---|
| Public source and real development history | Existing public `Adams4587000/tidebreak` has 18 development commits beginning 22 September, after the 11 September cutoff. Preserve that history. |
| Geometry built through the recipe | 24 shipping asset modules pass canonical verification. All shipping modules parse; no imported mesh formats or flagged geometry arrays. Provenance covers 24 assets, 72 construction candidates and 23 media files. |
| Original game, no copied reference-game assets/code | Original constructor assets and gameplay; an exact-file comparison with the recipe’s bundled warehouse example matched only the explicitly permitted canonical `assetlib.js` and `surfaces.js` helpers. Reference screenshots and learning notes remain outside the shipped game. |
| Named art and tools | Atlas model/output provenance and original procedural art/audio are documented in CREDITS.md. Submission draft names known tools and models, and discloses that the earlier coding-model identifier is not recorded. |
| Earned release progression | Temporary preview access is off. Career and preview saves remain separate. Rule tests, locked menu flow and a real completed combat race verify earned unlocks. |
| Self-contained public deployment | Published only `game/` from `e83d09ce01b727e6be573e104b87be04812f9bcd` at https://adams4587000.github.io/tidebreak/. GitHub Actions build and deployment succeeded (run 36078223192). |
| Live phone/4G gate | Unchanged live harness PASS on the deployed source SHA: 11.9 s ready, 6.6 MB, 491 draws, 993,126 triangles, real tap/hold movement, zero errors/404s/external dependencies. Exact verdict and screenshots: `evidence/live-release/`. All 95 publicly deployed files match the recorded source hashes. |
| Entrant/team/rights declarations | Owner confirmed Adams4587000 is the sole entrant and meets the eligibility rules. Public judging contact and explicit rights confirmation remain pending; the owner will provide the remaining details later. No entry PR has been opened. |
| Submission | Submission fork and official-schema entry/PR drafts prepared in `submission/`, including the exact live verdict and deployed source SHA. Contact and remaining entrant declarations must be supplied before opening the PR. Deadline: 25 September, 23:59 UTC. |
| Requested name exclusions | No matches in working files or any reachable historical object, path or commit metadata. Best-effort OCR found no matches in 659 unique current/historical images plus the three live-gate screenshots. The report omits the excluded strings themselves. No history rewrite is needed. |
| Credentials | No high-confidence credentials found in current tracked/pending files or reachable Git history. API keys and login credentials are not included in evidence or deployment. |

Current release receipts are in `evidence/release-2026-09-25/`. Earlier refit notes and preview receipts describe their state when recorded; they are retained as history, not rewritten to claim they tested this release.

The historical artistic-method limitations in COMPLIANCE.md remain explicit. We do not claim commercial visual parity, physical-phone testing, independent review of the latest changes, an organizer verdict, or prize eligibility from local automation.
