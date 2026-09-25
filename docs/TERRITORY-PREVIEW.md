# Territory preview and disappearing craft

The user renewed local preview access on 25 September. That preview enabled all six territories and crews through the existing preview mode. Preview results use their own save key and do not overwrite career progress. Preview is now complete: `PREVIEW_UNLOCKS=false` is restored for the requested commit, and cache versions are regenerated. The release guard rejects enabled preview access.

Choosing a former opponent's craft in the dock changed the selected hero but left the previous race roster in memory. On switching territories, `changeCourse()` hid that old roster, including the newly selected hero. The race continued moving its hidden body and camera past visible supply canisters. This reproduced with Albatross in Drowned Reach; the before screenshot is in `evidence/territory-preview/before/`.

Course changes now set visibility from the currently selected hero instead of the stale opponent list. Rebuilding the starting roster also explicitly shows the selected craft. All territories use this shared transition, movement, camera and pickup code. Their terrain, wave strength and course layouts retain their intended differences.

`tools/territory-preview-check.mjs` uses real menu selections, keyboard driving and mobile taps. A passive scene observer checks actual craft/rider visibility and supply transforms. It switches both crew and territory for all six locations, observes twenty seconds of desktop racing through launch-boost expiry, fires a missile, checks collected supplies, and restarts. Each location also gets a mobile landscape start/restart check. Reports and screenshots live in `evidence/territory-preview/`.

These are targeted transition and opening-race checks, not six new full-race completions or physical-phone certification. The pure suite covers the shared handling, flight, collision, combat and progression rules. The standard local integrity/ship check and unchanged jam harness are run separately; local preview evidence is not a deployment or submission verdict.
