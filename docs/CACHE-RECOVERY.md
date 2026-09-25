# Local loading recovery

The reported `reflection.invalidate is not a function` error came from mixing the newer main module with an older cached `atmosphere.js`. The earlier query-string fix updated only the entry, audio and one stylesheet, leaving transitive dependencies at their old URLs.

`tools/version-game.mjs` now generates content-hashed URLs for all 45 JavaScript modules and three stylesheets in the existing index/import map. Relative imports, Three.js aliases and canonical ASSET dynamic imports resolve to the corresponding current module. The canonical helpers and asset files are unchanged. `npm run cache:update` regenerates the map; both release checks reject stale versions rather than publishing a partial update.

`python3 tools/serve.py` serves the local game with `Cache-Control: no-store` and avoids stale conditional 304 responses. `npm start` refreshes versions and starts this server. No career saves, unlocks or browser-wide data are cleared.

The isolated browser-cache regression fixture seeds the historical renderer with a long HTTP cache lifetime. With the old partial import map it reproduces the exact reported error from a cached response. With the complete map, the same fixture loads, plays dock audio, revs through real R-key input, and enters a race through the regular buttons. Receipts: `evidence/cache-recovery/`. This is local validation, not a new public release verdict.
