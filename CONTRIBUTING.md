# Working on Tidebreak

Start with [AGENTS.md](AGENTS.md), [the style direction](docs/STYLE.md) and [404 compliance](docs/COMPLIANCE.md). Preserve the approved title → dock → territory → countdown flow, six full territories, combat and earned unlocks.

## Clone and play

```sh
git clone https://github.com/Adams4587000/tidebreak.git
cd tidebreak
python3 -m http.server 4173 --bind 127.0.0.1 --directory game
```

Open http://localhost:4173/. Python 3 and a WebGL-capable browser are enough to play and edit the game. Refresh after editing files. There is no bundler, application dependency installation, Atlas login or API key required to run it. On Windows, `py -3` can replace `python3`.

The repository includes production references, candidate comparisons and validation evidence, so its download is much larger than the approximately 6.6 MB playable game. Only `game/` is the deployable application. Historical evidence includes the original machine's paths and measured results; those are records, not dependencies on that machine.

## Set up the 404 validation tools

Use Node.js 22.12 or newer (the pinned Puppeteer dependency requires it), npm and Git. From the parent folder containing your Tidebreak clone:

```sh
git clone https://github.com/404-Repo/404-game-recipe.git
git -C 404-game-recipe checkout --detach 4effad311c5e137bca316257259fe5bffd6737de
cd 404-game-recipe
npm ci
npm run selftest
cd ../tidebreak
npm test
npm run check
```

Keep these folders next to each other:

```text
workspace/
  404-game-recipe/    # pinned upstream harness and its dependencies
  tidebreak/         # this repository
```

If the recipe already exists, check its working tree before changing its checkout. Do not overwrite someone else's edits. The integrity check intentionally rejects a different canonical recipe. Puppeteer downloads its test browser during installation; on Linux, install any system libraries required by that browser if launch reports them missing.

## Find the code

| Location | Purpose |
|---|---|
| `game/main.js` | Game state, inputs, camera, HUD and race orchestration |
| `game/course.js`, `game/world.js` | Courses, scenery placement and supplies |
| `game/combat.js`, `game/race-rules.js`, `game/campaign.js` | Weapons, race rules and progression |
| `game/water.js`, `game/atmosphere.js`, `game/combat-fx.js` | Water, atmosphere and effects |
| `game/index.html`, `game/style.css`, `game/frontier.css` | Menus, controls and layout |
| `game/assets/`, `game/media/` | Shipping code-built models and Atlas media |
| `tests/`, `tools/` | Rule tests, gameplay checks and production utilities |
| `docs/` | Design, provenance, compliance and validation notes |
| `references/`, `candidates/`, `evidence/` | Production history and review receipts; do not deploy |

## Send a change

With write access, create a branch in this repository. Without write access to a public repository, click **Fork** on GitHub, clone your fork, and add the original as `upstream`:

```sh
git remote add upstream https://github.com/Adams4587000/tidebreak.git
git fetch upstream
git switch -c feature/describe-your-change upstream/main
```

Make a focused change, run the relevant checks, then:

```sh
git add <files-you-changed>
git commit -m "Describe the player-visible change"
git push -u origin feature/describe-your-change
```

Open a pull request targeting `Adams4587000/tidebreak:main`. Explain what changed, how you tested it, and include screenshots for visible changes. Coordinate edits to shared files such as `main.js` before starting. Keep `main` as the reviewed playable version; avoid force-pushing shared history.

## Validate the change

`npm test` runs the pure rules tests; `npm run check` runs the provenance/integrity self-test and canonical shipping check. Keep the local server running in a separate terminal for browser checks. Run those sequentially:

```sh
npm run verify:assets
node tools/territory-flow-check.mjs
node tools/quick-race-check.mjs
node tools/combat-touch-check.mjs
node tools/combat-endurance-check.mjs
node tools/territory-races-check.mjs
```

Choose the checks relevant to the edit; run full races for course, handling or combat changes. The later-territory driver explicitly uses unlocked test fixtures and does not demonstrate earning those unlocks. Browser checks write screenshots/reports into `evidence/`; review changes before committing them. Combat, touch, quick-race and integrity checks accept `EVIDENCE_DIR=evidence/your-change` to keep new receipts separate from historical runs. Never overwrite historical receipts just to make a failing check green.

For the local phone/4G gate, use the unchanged upstream tool and the actual source commit printed by `git rev-parse HEAD`:

```sh
node ../404-game-recipe/harness/jam.mjs http://localhost:4173/ --start=#quickraceb --commit=<source-commit> --out=evidence/local-review
```

A local pass does not replace the final public-URL competition gate. [The last validation record](docs/COMPLIANCE-VALIDATION.md) identifies the tested source commit and remaining limitations.

## Art and credentials

Atlas MCP is the only external generator for new images, textures and audio. Code-built geometry follows the 404 asset contract. New or replaced models need inspected references, three independent constructions, multi-angle verification and an explicit selection. Follow AGENTS.md for the full production rules. Historical generator scripts can overwrite approved assets; do not rerun them indiscriminately.

Ask the owner for access to the Atlas workspace when asset production is needed, and use your own authorized workspace key through an environment variable. Never share keys in commits, issues, pull requests or saved project configuration. Existing media works without any key. Third-party references retain their original rights and stay outside the shipped game; see [CREDITS.md](docs/CREDITS.md).

## Release access rules
Earned territory and craft unlocks are restored for the final build. Keep `PREVIEW_UNLOCKS=false` in `game/play-access.js`; `npm run check:release` rejects an enabled preview switch. Earlier preview results use a separate save key and are not copied into the player’s career. Only `game/` is published by the Pages workflow.
