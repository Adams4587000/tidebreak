# 404 jam submission

This directory prepares the entry. Its presence does not mean the game has been submitted.

1. Confirm the entrant handles, public judging contact and eligibility/rights declarations.
2. Push the validated source to `Adams4587000/tidebreak:main` without replacing its genuine history.
3. Enable GitHub Pages with GitHub Actions as the source. The workflow publishes only `game/`, after rule tests and the release guard pass.
4. Record the deployed source SHA and verify the live URL. Run the unchanged recipe gate with the visible Quick Race control:
   `node ../404-game-recipe/harness/jam.mjs https://adams4587000.github.io/tidebreak/ --start=#quickraceb --commit=<deployed-source-sha> --out=evidence/live-release`
5. Fill `entry.draft.json` with the real deployed commit and contact. Fork `404-Repo/404-game-jam`; add only `entries/tidebreak.json` using the official schema.
6. Open the entry pull request. Include the exact unedited live verdict block, team and source links, the three-sentence description and truthful declarations from the official PR template.
7. Save the PR URL. The organizers rerun the gate before merging; an open PR is not an accepted entry.

Deadline: 25 September 2026, 23:59 UTC. The source of truth is https://github.com/404-Repo/404-game-jam/blob/main/README.md. The wallet can be supplied later.

The draft contact and commit are explicit placeholders and must not be submitted. The earlier coding model is not documented; the entry discloses that instead of guessing.
