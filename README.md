# Tidebreak — The Drowned Frontier

An original dystopian hydro-speeder endurance racer built with Three.js, the 404 game recipe asset pipeline and Atlas MCP art production. Six exposed rider–machine pairs compete across one continuous frontier: flooded stadium, mangrove swamp, wet gorge, volcanic caldera, decaying spillway and Atlantic wreck field.

## Play locally

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory game
```

Open http://localhost:4173/. No build step, runtime services or API keys. Serve the self-contained `game/` directory to deploy.

- Auto acceleration; A/D or left/right arrows steer, S/down brakes, Space boosts.
- R recovers to the racing line; Escape pauses.
- Phone: drag the steering pad; hold Boost or Brake with a second finger.
- Dock: inspect all six crews, including locked ones. Rider Detail moves the camera closer. Only Rook / Kestrel is available on a fresh save.
- Three contracts traverse the complete roughly 14–16 km course, targeting four to six minutes each. Finishes, podiums, wins and collected perks unlock crews. Practice earns best times without career progress.
- Five rivals seek finite shared supplies and manage boost. Charge, shield, overdrive and repair pickups belong to the first racer who reaches them.
- Wave response, folding hydrofoils, rider lean, actual scenery reflection, foam wakes, spray, transient lens droplets, countdown, pause/restart and browser-local progression.

## Production and checks

The canonical recipe helpers remain unchanged. Shipping models use original Three.js constructor geometry; Atlas supplies references and texture maps. Material and lighting choices are reviewed in the moving build. There are no imported meshes.

With dependencies installed in adjacent `../404-game-recipe`:

```sh
node --test tests/*.test.mjs
node ../404-game-recipe/harness/verify.mjs game/assets --size=560
node ../404-game-recipe/harness/ship.mjs game
node tools/roster-check.mjs
node tools/touch-check.mjs
node tools/endurance-check.mjs
node ../404-game-recipe/harness/jam.mjs http://localhost:4173/ --out=evidence/jam-dystopia
```

Browser checks run sequentially and require the local server. The endurance driver uses actual keyboard events from a fresh save, traverses all sectors, contests supplies, checks performance, finishes, and reloads to verify earned unlocks. It does not teleport or give itself progress. Older chapter and spacecraft test evidence is historical and applies to the superseded prototype.

This remains a browser game with procedural geometry, not demonstrated commercial AAA photorealism. Water reflections use a limited-resolution planar render; scenery repeats modular assets; AI follows route coordinates rather than the player's full free-steering physics. Broad physical-phone testing and a deployed competition gate are still needed. No publication or submission has been performed.

See [production scope](docs/DYSTOPIA.md), [campaign](docs/CAMPAIGN.md), [style](docs/STYLE.md), [provenance](docs/CREDITS.md) and [validation](docs/VALIDATION.md).
