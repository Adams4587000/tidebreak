# Asset and source provenance

All shipping 3D shapes are original Three.js constructor/operation geometry. No meshes, textures, music, names or source code were taken from Hydro Thunder or Beach Buggy Racing. They informed the requested arcade handling and challenge-unlock structure.

## Atlas MCP

Visual project: `29d918d9-ef79-4b7a-9519-575ad93f2405`.

| Use | Atlas backend | Original output FID |
|---|---|---|
| Hero boat reference | FLUX.2 Max | 8a1f8d45-14f4-4a25-a431-d217b242648a |
| Environment reference sheet | FLUX.2 Max | 854ee824-9f5f-427a-b72d-e831c4cdf8d3 |
| Water normal | PATINA PBR material maps | 307f7e33-6598-4595-a985-c8004215d53e |
| Basalt albedo / normal | PATINA PBR material maps | ccba411d-492a-448b-ba2b-35eabd22aef3 / f82f4cfc-4386-4978-bb5c-970e2a1e09a5 |
| Concrete albedo / normal | PATINA PBR material maps | a9514937-6730-48cc-83eb-9bf5f5b81bce / 0f5fc873-cfe4-4e00-b60d-dc4f18c891c1 |
| Mangrove bark albedo / normal | PATINA PBR material maps | 40db7883-a1a5-4d19-ad99-c0d6e82d744f / f09b1413-2ded-40a3-b5c6-ffb78418f664 |

PNG maps converted to WebP for transfer size. Full-size sources and workspace asset metadata are in `references/`. The reference sheet contains four compositions; the remaining environment compositions are authored in code.

Audio project: `b262a6a3-f626-439d-ac59-cff4f28ad907`.

- Instrumental breakbeat: ElevenLabs Music via Atlas, FID `d84e447b-f1aa-40c9-84fb-e72b8e735cb7`.
- Water/wake loop: ElevenLabs SFX v2 via Atlas, FID `5c72eecd-4f7c-46c0-8efa-e044096c4174`.
- Engine and feedback tones: original Web Audio synthesis.

The visuals use triplanar albedo blending, macro texture variation, tangent-space normals, custom water shading and animated foam. Atlas is used during production; the shipped browser game does not contact Atlas or require authentication.

## Dependencies and reference documents

- Three.js r169: MIT, license in `game/vendor/LICENSE`.
- Canonical `assetlib.js`, `surfaces.js`, `rig.js`: copied from [404-game-recipe](https://github.com/404-Repo/404-game-recipe), local checkout commit `4effad3`. `rig.js` is retained but not currently loaded.
- User-provided Rust17 improvement document: design/quality reference only, retained in `docs/RUST17_REFERENCE.md`; no prior game source copied.

Candidate previews and verifier receipts document structural checks. Passing the verifier or jam harness is not a measure of visual quality or a claim of completing every step of the longest recipe workflow.
