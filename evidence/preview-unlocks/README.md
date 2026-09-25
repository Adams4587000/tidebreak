# User-authorized local preview

All environments and craft are intentionally available under the user's 25 September preview request. This evidence validates preview access, not earned progression or a final release build.

`preview-unlocks-check.mjs` exercised all 36 menu combinations and launched/driven all six real environments, each with a different craft, using real menu clicks and keyboard input. The existing career storage remained unchanged. Unit tests check separate preview save writes and restoration of earned access when preview is off.

The `release-block/` failure is expected: the release guard deliberately rejects `PREVIEW_UNLOCKS=true`. Before the final commit set it to false in `game/play-access.js`, run `npm test` and `npm run check:release`, and recheck earned progression in the browser. Do not copy preview records into the career save.

Six-environment screenshots precede the final preview-only wording change to race announcements/HUD; the phone-gate screenshots and source manifest include that wording change. Gameplay/access behavior is the same.
