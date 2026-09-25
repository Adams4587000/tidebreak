# Local gameplay and presentation refit

Follow-ups: [reverse and rideable ramp-edge correction](HANDLING-FIX.md); [watercraft material correction](MATERIALS-FIX.md).

Requested 24 September 2026: solid pillars and ramps, substantial collectible supplies, territory-specific frames and race instruments, visible shields and collection effects, missile launch feedback, quieter engines, ten-second boost/recharge, and distinct fleet finishes. This is a local collaboration change; no commit, push or deployment is implied.

## Behavior

- Swept oriented solids stop and separate the craft at pillars, barriers and ramp sides/back. Barrier extents follow the placed asset dimensions. Low-speed ramp travel follows the deck; forward travel off its lip launches the craft. Shield protection does not bypass solids.
- Boost holds ten seconds of energy and refills at one second of capacity per second. Partial reserves can be used. An exhausted held trigger must be released to rearm, avoiding a boost/recharge stutter. The existing five-second race-start assistance is separate and labeled on the meter. AI uses the same energy function.
- The field supply is a six-cell industrial magazine with manifold plates, valve caps and illuminated bands. Its type is conveyed by a colored signal and text. Collection produces a colored expanding pulse, particles, a named award readout and a four-note cue. Supplies retain finite shared ownership.
- Shield and recovery states drive an animated translucent hull envelope; the HUD displays the remaining shield time. Missiles leave alternating launcher sides with inherited speed, accelerate, show a metal body/fins and exhaust, and orient along their movement. The existing laser ignition interval remains intact.
- Engine and wash levels are reduced and duck under effects. Original Web Audio provides launch, impact, pickup, shield, boost, landing, recovery and selection feedback. No new external audio is introduced.
- Six finishes use existing Atlas material sources sampled in object-local metres, with separate paint/armor/metal/composite roles, controlled wear and distinct roughness/metalness. This removes the same brown paint image from every surface. No new generated texture set or scanned material is claimed.
- Gold/harbor, green/mangrove, ice/canyon, ember/caldera, teal/spillway and violet/Atlantic frames have separate crests. The user's supplied UI references informed the original SVG/CSS borders and layered instruments; no reference artwork is shipped.

## Supply review

The existing Atlas supply reference was inspected before construction. The user explicitly rejected its ring/diamond silhouette. Three new independent structures were built: rectangular shock-mounted cassette, radial pressure-cell magazine, spherical pressure vessel. All three passed canonical verification and all five views were inspected. The radial magazine won for equal readability from every side. Candidate sources, renders and logs remain outside game/. The prior comparison remains in Git history and candidates/compliance; it is not rewritten as new work.

## Review scope

Visual review in this change is self-review, not an independent blind review. Three passes cover (1) solid contact, ramp travel and supply visibility; (2) fleet finishes and desktop territory/race framing; (3) phone layout, combat input and audio/boost feedback. Browser test results are stored in evidence/refit. These replace no historical release receipts. No physical-phone performance, new independent Atlas critique or live competition verdict is claimed.

### Findings during validation

The first combat pass exposed a rival trapped inside a ramp rail while its avoidance target moved outside the ramp. That run is preserved as `evidence/refit/round1-combat*`. The correction commits AI to the deck or an outside lane before the ramp begins and gives opponents actual ramp support/airborne state instead of a proximity-based jump animation. A regression test checks that a rival already on the ramp steers inward, and the full combat run is repeated on the corrected build.

The first fleet preview caught a shader declaration error, which was corrected before the error-free browser pass. The final contact pass uses the full hull nose clearance and confirms both separation at a pillar and a physical ramp takeoff/landing.


## Final local validation

- 28 pure rule tests pass, including swept collision, ramp support, ten-second boost/recharge, partial use and AI clearance regressions.
- Canonical asset verification: 24/24 clean at the project's standard 560-pixel inspection size. A preliminary 420-pixel run warned on the unchanged quay's front-face edge density; that diagnostic remains in assets-420.log. The rebuilt supply passed at both sizes and all three candidates passed their independent construction checks.
- Fresh-save keyboard time trial completed with 15 supplies and 12 landings; a targeted follow-up confirmed full nose clearance at a pier and ramp takeoff/landing.
- Final keyboard combat race completed, all six racers reached final classification, progression persisted, and real inputs fired 13 shots. Rivals fired 23. Peak cost was 700 draws and 1,273,906 triangles.
- Real touch events exercised missile fire, shield activation, simultaneous steering/boost, pause/resume and return to the dock. Quick Race passed portrait, landscape and desktop checks with no browser errors.
- All six craft names fit at four viewport sizes. The final landscape review moved speed/shield instruments away from touch controls.
- Unmodified local 4G phone gate: PASS, 11.707 seconds ready, 6.59 MB body transfer, zero errors. This is browser/device emulation on the local machine, not a physical-phone or live deployment verdict. Source commit is explicitly unstamped because these edits are uncommitted; source-manifest.json records the tested files.
- Canonical shipping parse/path check and provenance self-test pass. No canonical helper or harness was modified.

A second combat review found a side-scraping rival losing all forward speed and steering back toward a barrier before its stern cleared. Both were corrected: impacts now scale speed loss by the face normal, and avoidance remains active until the complete hull clears. The unsuccessful review is preserved in round2-combat*; the final pass is combat-endurance-check.json.
