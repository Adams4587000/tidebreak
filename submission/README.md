# 404 jam submission

The entry was submitted on 25 September 2026 at 18:23:51 UTC: [404 game jam PR #21](https://github.com/404-Repo/404-game-jam/pull/21). The PR is open; organizer validation and acceptance are pending.

1. Confirm the entrant handles, public judging contact and eligibility/rights declarations.
2. Push the validated source to `Adams4587000/tidebreak:main` without replacing its genuine history.
3. Enable GitHub Pages with GitHub Actions as the source. The workflow publishes only `game/`, after rule tests and the release guard pass.
4. Record the deployed source SHA and verify the live URL. Run the unchanged recipe gate with the visible Quick Race control:
   `node ../404-game-recipe/harness/jam.mjs https://adams4587000.github.io/tidebreak/ --start=#quickraceb --commit=<deployed-source-sha> --out=evidence/performance/live`
5. Fill `entry.draft.json` with the real deployed commit and contact. Fork `404-Repo/404-game-jam`; add only `entries/tidebreak.json` using the official schema.
6. Open the entry pull request. Include the exact unedited live verdict block, team and source links, the three-sentence description and truthful declarations from the official PR template.
7. Save the PR URL. The organizers rerun the gate before merging; an open PR is not an accepted entry.

Deadline: 25 September 2026, 23:59 UTC. The source of truth is https://github.com/404-Repo/404-game-jam/blob/main/README.md. The wallet can be supplied later.

The draft names the release source commit; its public judging contact is adamsleonard010@gmail.com. The earlier coding model is not documented; the entry discloses that instead of guessing.

## Current status

- Source release `a68cfc56fe1b317cf3cd44844b7a4266c8c17dac` is public on `main`.
- GitHub Actions run [36162110947](https://github.com/Adams4587000/tidebreak/actions/runs/36162110947) validated and deployed the game.
- The owner confirmed Adams4587000 is the sole entrant and meets the eligibility rules. The owner supplied adamsleonard010@gmail.com as the contact, confirmed reading the rules and holding the required rights, accepted the promotional licence, and authorized submission after the performance review.
- Submission fork: https://github.com/Adams4587000/404-game-jam. Entry [PR #21](https://github.com/404-Repo/404-game-jam/pull/21) adds only `entries/tidebreak.json` from branch `submit/tidebreak`, commit `cf660e6025596432c5e9e3845625b65f42103a77`.

The live gate passed. `verdict.txt` is the exact unedited block; `pull-request.draft.md` is prepared from the official template. The submitted entry matches `entry.draft.json`; the checked declarations and exact verdict are in `pull-request.draft.md`. The PR was opened before the 25 September 23:59 UTC deadline. Organizers must rerun the gate and merge the PR before the entry appears on the site.

Documentation/evidence commits do not redeploy Pages: the deployed source remains the SHA named in the verdict. A future game, tooling or workflow change must be validated, deployed and gated again with its new SHA before updating the entry.
