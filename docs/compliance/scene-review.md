# Moving-frame visual review

## Method and limits

Three planned rounds. A separate stateless Atlas vision model receives anonymous paired images and a fixed critique rubric, with no source code, implementation history or pair key. Each invocation starts fresh. Real reference frames are from Vector Unit's official Riptide GP: Renegade gallery; source links and copyright are recorded outside the game. Local captures come from real keyboard/touch driving. This is a model critique, not a human usability study or proof of commercial quality.

Canonical `pairs.mjs` remains untouched. Its individual pair images decode and render correctly, but its CONTACT.png has broken image icons: the served-ID reverse map is created before the contact images are registered. A local PIL contact assembly (`CONTACT-local.jpg`) displays the actual pair PNGs without changing their content. The broken output is retained as a receipt. Only inspected individual pair images are sent to the critic. HUDs and different camera viewpoints remain imperfect blinding/matching factors; the rubric explicitly excludes HUD names/resolution as criteria.

The initial exported Atlas API returned `field_access_denied` because the model setting was unspecified. The platform agent inspected role-allowed choices and selected the permitted Seed 2.0 Lite. No restricted model/access workaround was used. Export `1a4169b3-4200-44ae-b9c5-0778344a8105` is the executed stateless critic; the earlier unexecutable export is not evidence of a review.

## Round 1 — baseline c777a49 moving frames: FAIL

Packets and raw critiques: `evidence/compliance/review-round-1/`.
After recording the answers, unblinding shows the commercial reference won all three pairs. The critic repeatedly misread Tidebreak's small central craft as a distant opponent and described the view as first-person. It also flagged repeated shoreline modules, weak water contact and uniformly muted lighting.

The factual claim that there is no player model/no wake is incorrect: both are present and animated. The repeated misidentification is nevertheless strong evidence that the chase composition fails to communicate them. Static-image judgments cannot establish that the water is actually static, and the critic's confident statements about physics are not accepted as measurements.

### Corrective action

The camera smoothed a world-space target at a rate of 5/s while the hero moved at approximately 90 m/s. This adds roughly 18 m of follow lag to the intended 14 m chase offset. Advance the camera by the hero's actual horizontal frame displacement before smoothing the relative offset. Ignore discontinuities over 20 m and countdown staging. This retains responsive corner easing, height smoothing, field of view and the approved scene; it fixes a structural tracking error rather than inventing more detail.

Add a real-input turbo assertion that the camera remains within 20 m of the hero. No gameplay speed, AI, weapons, unlock rules or race lengths change.

## Round 2 — corrected chase camera: FAIL against commercial reference

Packet: `evidence/compliance/review-round-2/`. The current 1440×900 real-input turbo capture was paired with the official Spaceport frame. The independent answer preferred the reference (right, confidence 0.9). It again flagged repeated shoreline structures, flat lighting and disconnected-looking luminous exhaust. Some terminology remained unreliable: it called the clearly visible third-person view “first-person behind-vehicle.”

The camera correction nevertheless passes the direct test: all three quick-race viewport checks sustain approximately 92 m/s while keeping camera-to-craft distance below 20 m. This addresses the measured chase lag; it does not establish parity in scenery or water finish.

The same structural art criticism has now repeated twice. For this compliance repair, explicitly retain the user's approved art and record scenery variety, foliage complexity and material richness as accepted remaining limitations. Further retries will not be used to manufacture a visual win. Round 3 checks final moving frames from complete courses and closes the review with its actual verdict.

Rounds 2 and 3 use `tools/blind-pairs-local.py` to resize, crop and shuffle decoded images while the full-race test owns Chromium. This is a documented local comparison compositor, not an altered canonical harness or synthesized scene.

## Round 3 — final full-course captures: FAIL against commercial reference

Packets: `evidence/compliance/review-round-3/`. Current real-input Meridian checkpoint 3 and Drowned Reach checkpoint 4 frames were paired against the official Spaceport and Ruins frames. Both independent answers preferred the reference (left in both pairs; confidence 0.86 and 0.82). The raw responses were saved before opening KEY.json.

The reviewer now recognized the swamp capture's centered chase camera and clear exhaust feedback, but still mislabeled Meridian as a cockpit view. It repeated concerns about symmetric scenery repetition and weak visible wake. Claims of “no markers,” “static” water or “zero variation” are overstatements: markers, animated water and placement variation exist. We accept the visible readability/material concerns, not these literal assertions or inferred motion from still images.

The planned three rounds are complete. The commercial reference won every comparison. The measured camera correction remains validated, and the unresolved scenery/wake presentation limitations remain explicit for the next art revision. This review closes process evidence; it does not award a visual-quality pass.

## Remaining visual limitations

Modular shoreline repetition, limited foliage complexity, soft planar reflections and lower craft material richness remain below the reference game's finish. Passing technical checks or this process does not establish photorealism. Repeated structural criticism must be accepted explicitly for this preserved-build remediation or addressed by a separate art/level revision; do not manufacture a winning verdict through more retries.
