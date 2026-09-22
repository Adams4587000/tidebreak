# Tidebreak

An original arcade hydroplane racer: earn passage through six Atlantic environments by completing a different challenge in each one. Built in Three.js using the 404 game recipe's asset pipeline and checks, with original Atlas references, PBR textures, music and water audio.

## Play locally

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory game
```

Open http://localhost:4173/. No build step or runtime API keys. All game dependencies are bundled in `game/`. Serve that directory to deploy.

- Auto acceleration; A/D or left/right arrows steer, S/down brakes, Space boosts.
- R returns the boat to the racing line; Escape pauses.
- Phone: drag the steering pad; hold Boost or Brake with another finger.
- Three handling presets, five AI opponents, ramps, boost pickups, pause/restart, optional time trials and local best times.
- Progress saves in this browser. Clearing browser storage resets it.

## The Atlantic Run

| Chapter | Clearance task |
|---|---|
| Port Meridian | Finish in the top three |
| Drowned Reach | Recover four signal buoys and finish |
| Splitstone Passage | Land two ramp jumps and finish |
| Ember Basin | Finish top three and use boost three times |
| The Sluice | Catch two active surge gates and finish |
| Outer Atlantic | Win the final |

Completed courses remain replayable. Time trials save records but do not grant campaign clearances.

## Checks

Install the adjacent recipe's test dependencies with `npm install` in `../404-game-recipe`, then:

```sh
node --test tests/campaign.test.mjs
node ../404-game-recipe/harness/verify.mjs game/assets
node ../404-game-recipe/harness/ship.mjs game
node tools/check.mjs
node tools/campaign-check.mjs
node ../404-game-recipe/harness/jam.mjs http://localhost:4173/ --out=evidence/jam-local
```

The two browser checks require the local server. The campaign check starts with empty storage and uses real keyboard inputs to earn every clearance, then reloads and checks persistence. It never sets the player's position or unlocks in the game.

`evidence/` contains screenshots and measured checks. The jam report is a **local rehearsal**, not the required deployed-URL entry verdict. This game has not been published or submitted.

The game is playable but remains a first iteration. Stylized generated geometry, one short circuit per environment, and shared base boat geometry are current limits. Broad device testing and a deployed entry gate remain release work.

See [campaign](docs/CAMPAIGN.md), [art direction](docs/STYLE.md), [asset provenance](docs/CREDITS.md), and [quality checks](docs/QUALITY.md), and [validation record](docs/VALIDATION.md).
