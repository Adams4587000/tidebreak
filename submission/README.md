# 404 jam submission

This directory prepares the entry. Its presence does not mean the game has been submitted.

1. Confirm the entrant handles, public judging contact and eligibility/rights declarations.
2. Push the validated source to `Adams4587000/tidebreak:main` without replacing its genuine history.
3. Enable GitHub Pages with GitHub Actions as the source. The workflow publishes only `game/`, after rule tests and the release guard pass.
4. Record the deployed source SHA and verify the live URL. Run the unchanged recipe gate with the visible Quick Race control:
   `node ../404-game-recipe/harness/jam.mjs https://adams4587000.github.io/tidebreak/ --start=#quickraceb --commit=<deployed-source-sha> --out=evidence/performance/live`
5. Fill `entry.draft.json` with the real deployed commit and contact. Fork `404-Repo/404-game-jam`; add only `entries/tidebreak.json` using the official schema.
6. Open the entry pull request. Include the exact unedited live verdict block, team and source links, the three-sentence description and truthful declarations from the official PR template.
7. Save the PR URL. The organizers rerun the gate before merging; an open PR is not an accepted entry.

Deadline: 25 September 2026, 23:59 UTC. The source of truth is https://github.com/404-Repo/404-game-jam/blob/main/README.md. The wallet can be supplied later.

The draft names the release source commit; its contact is still an explicit placeholder and must be supplied before submission. The earlier coding model is not documented; the entry discloses that instead of guessing.

## Current status

- Source release `63a395872acde9304ae559ccc25d13a9ec44e8d3` is public on `main`.
- GitHub Actions run [36141563834](https://github.com/Adams4587000/tidebreak/actions/runs/36141563834) validated and deployed the game.
- The owner confirmed Adams4587000 is the sole entrant and meets the eligibility rules. They will provide the contact later; explicit rights confirmation is also still needed.
- Submission fork: https://github.com/Adams4587000/404-game-jam. No entry PR has been opened.

The live gate passed. `verdict.txt` is the exact unedited block; `pull-request.draft.md` is prepared from the official template. Check its declarations only after confirming each is true, then supply the contact in `entry.draft.json`, copy it as the sole change `entries/tidebreak.json` in the fork, and open the entry PR. The deadline remains 25 September at 23:59 UTC.

Documentation/evidence commits do not redeploy Pages: the deployed source remains the SHA named in the verdict. A future game, tooling or workflow change must be validated, deployed and gated again with its new SHA before updating the entry.
