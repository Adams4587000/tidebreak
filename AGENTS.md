# Tidebreak production requirements

Read docs/COMPLIANCE.md, docs/STYLE.md, docs/QUALITY.md and docs/CREDITS.md before changing the game. Preserve the user's approved concept and normal title → dock → territories → countdown flow.

- Atlas MCP is the only external generator for images, textures and audio. Never substitute another generator when Atlas fails. Local image crops/resizes/encoding and original code/Web Audio are permitted. Never generate or import meshes.
- All scenery, vehicles and riders are original constructor/operation Three.js modules following ../404-game-recipe/docs/asset-contract.md. Load objects through canonical ASSET. Preserve animated hierarchies. Runtime shaders/particles/course markings are explicitly inventoried separately; do not hide scenery there.
- Before shipping a new/replaced object: inspect its reference, write three independent constructions (different topology/part breakdown, not recolors or parameter tweaks), run canonical verify, inspect every candidate from all sides, and record the selection/rejections. Keep candidates, references and receipts outside game/. No fabricated retrospective provenance.
- Pin and hash-check canonical assetlib.js, surfaces.js, rig.js and the upstream harness; do not edit them or substitute adapters for the submission gate.
- Run node tools/compliance-check.mjs before committing runtime changes. Update evidence deliberately when assets/media/runtime effects change. The checker must fail on missing/stale provenance rather than silently accepting it.
- Use actual keyboard/touch input in gameplay tests. Never call __START__, mutate positions, unlocks or race progress as proof of normal play. Explicit later-arena fixtures are allowed only when clearly labeled.
- Keep truthful telemetry and readiness. The public Quick Race control must remain a real user feature, use the same full race and progression, and work without test/UA/query special cases.
- After relevant changes run pure tests, ship, asset verification if geometry changed, and real-input flow/combat checks. Use the unmodified jam harness with --start=#quickraceb. A local pass is not a live submission pass.
- Review moving frames against real reference-game frames; preserve blinded pairs and critique before unblinding. Set three review rounds; a repeated structural failure requires a plan change or an explicit accepted limitation. Never call a self-review independent.
- Keep credentials outside source, evidence and shipped files. Never write API keys or saved authorization headers. Ship only game/.
- Do not claim full compliance, physical-phone performance, live deployment, public source availability, or completed blind reviews without corresponding evidence. docs/COMPLIANCE.md records open release requirements.

Preserve the existing development history in Adams4587000's GitHub repository. Follow CONTRIBUTING.md for setup and review; the current final-release authorization is recorded below.

## Temporary preview unlocks — user request, 25 September 2026
The user completed the renewed preview and requested committing the code. Keep `PREVIEW_UNLOCKS=false` in `game/play-access.js` for this release. Run `npm test` and `npm run check:release`, then check the real-input progression flow before publishing. Preview results use a separate storage key; do not copy them into the career save or delete the user’s career. This explicit preview request supersedes earned-lock requirements during local preview only.

## Final release request — 25 September 2026
The user now authorizes updating the existing GitHub repository and proceeding through the 404 jam submission workflow. Earned progression is restored (`PREVIEW_UNLOCKS=false`); keep it off in the release. Preserve the genuine development history. Publishing the game and an entry pull request are authorized, subject to working account access and truthful entrant declarations. Earlier local-only/preview statements describe historical work, not the current release scope.
