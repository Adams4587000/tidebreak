# Tidebreak — The Drowned Frontier

An original dystopian hydro-speeder endurance racer built with Three.js, the 404 game recipe asset pipeline and Atlas MCP art production. Six exposed rider–machine pairs compete across one continuous frontier: flooded stadium, mangrove swamp, wet gorge, volcanic caldera, decaying spillway and Atlantic wreck field.

## Play locally

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory game
```

Open http://localhost:4173/. No build step, runtime services or API keys. Serve the self-contained `game/` directory to deploy.

- Auto acceleration; A/D or arrows steer, S/down brakes, Space boosts. Everyone launches with five seconds of turbo.
- F fires missiles, Q deploys the held special, E activates a shield. Everyone starts with four missiles and two shield charges. Three damaging hits eliminate a racer.
- R recovers to the racing line; Escape pauses. Phone controls include steering, turbo, brake, fire, special and shield.
- Dock: drag to rotate the actual 3D spacecraft, scroll to zoom, or inspect the rider closely. All six crews can be inspected; only Rook / Kestrel starts unlocked.
- Three contracts each traverse all six environments along a roughly 14–16 km route at turbo pace. Shared supply rows, bridges, marked channels, offset barriers and ramps create racing decisions.
- Rivals spend ammunition and energy, fight each other, collect finite supplies and make mistakes. Visible drafting and pursuit power help keep the field catchable.
- Live rival labels, gaps, hull damage, incoming warnings and a six-crew result classification. Remaining racers continue while results are displayed.
- Finishing milestones and reputation unlock crews. Eliminated runs earn participation reputation; existing saves and unlocks are preserved. Practice earns best times only.
- Atlas materials, original procedural spacecraft, scene reflections, foam wakes, colored exhaust and refractive lens water.

The detailed weapon rules, rewards and primary-source research are in [the combat design](docs/COMBAT.md).

## Production and checks

The canonical recipe helpers remain unchanged. Shipping models use original Three.js constructor geometry; Atlas supplies references and texture maps. Material and lighting choices are reviewed in the moving build. There are no imported meshes.

With dependencies installed in adjacent `../404-game-recipe`:

```sh
node --test tests/*.test.mjs
node ../404-game-recipe/harness/verify.mjs game/assets --size=560
node ../404-game-recipe/harness/ship.mjs game
node tools/combat-roster-check.mjs
node tools/combat-touch-check.mjs
node tools/combat-endurance-check.mjs
node ../404-game-recipe/harness/jam.mjs http://localhost:4173/ --out=evidence/jam-combat
```

Browser checks run sequentially and require the local server. The endurance driver uses actual keyboard events from a fresh save, traverses all sectors, contests supplies, checks performance, finishes, and reloads to verify earned unlocks. It does not teleport or give itself progress. Older chapter and spacecraft test evidence is historical and applies to the superseded prototype.

This remains a browser game with procedural geometry, not demonstrated commercial AAA photorealism. Water reflections use a limited-resolution planar render; scenery repeats modular assets; AI follows route coordinates rather than the player's full free-steering physics. Broad physical-phone testing and a deployed competition gate are still needed. No publication or submission has been performed.

See [production scope](docs/DYSTOPIA.md), [campaign](docs/CAMPAIGN.md), [style](docs/STYLE.md), [provenance](docs/CREDITS.md) and [validation](docs/VALIDATION.md).
