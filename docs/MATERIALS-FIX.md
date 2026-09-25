# Watercraft material correction

25 September 2026. The user reported that the refit's watercraft looked flat. The cause was in `fleetSurface`: normal and roughness maps were explicitly cleared, and albedo was reduced to a weak grayscale multiplier.

The material shader now uses the existing Atlas albedo, normal and roughness maps in aligned hull-local coordinates. Each normal projection uses its own tangent frame, so detail follows the surface through turns and animated parts without relying on stretched baked UVs. Painted panels retain their crew color and show fine abrasion plus limited exposed metal. The visible chip mask also supplies thin paint relief. Bare metal has a different reflection/roughness response, while carbon composite retains its woven albedo and relief. Six palette, scale and wear profiles remain distinct.

The models, textures, canonical helpers and gameplay controls are unchanged. No new meshes or external media were generated. `world.js` runtime provenance was updated; the original asset and media hashes remain intact. These edits are local and uncommitted.

## Visual review

Three self-review passes were used. This is not an independent blind review or a claim of commercial visual parity. Existing Vector Unit reference frames in `references/review/` informed the comparison: readable body color, restrained wear, different material highlights, and detail surviving the chase camera.

1. The before captures confirmed broad, nearly uniform panels. The first revised shader restored detail, but the chip mask covered too much paint and looked like a mottled repaint. Rejected for that reason; source and frames are preserved in `evidence/material-fix/round1/`.
2. Lower chip coverage, lighter exposed metal and a stronger bare-metal roughness response made the finish read as worn machinery. Six craft and the opposite inspection angle were checked. The side view clearly shows scratched metal highlights and carbon weave. The same shader is preserved in the final source manifest.
3. Consecutive moving desktop frames, mobile combat and the phone startup gate check readability and shader stability in actual play. The fine detail naturally becomes less visible at chase-camera distance; the finish does not alter geometry or claim photorealism.

`tools/material-preview.mjs` uses actual dock buttons, pointer orbit/zoom, normal territory selection and race input. Locked craft are inspected through the game's existing preview feature; nothing is unlocked or repositioned by the test. Captures are in `before/`, `round1/` and `round2/`; final verification receipts and runtime source hashes are in `evidence/material-fix/verified/`.

Validation: 33/33 rule tests, shipping parse/path checks and provenance integrity passed. All six craft rendered without shader/browser errors. Actual touch missile/shield controls, simultaneous steering/boost, pause/resume and normal menu flow passed. The unchanged local phone/4G gate passed at 11.6 seconds ready, 6.6 MB, 493 peak draws, 997,340 peak triangles and zero errors. These are local browser measurements, not physical-phone or deployment claims.
