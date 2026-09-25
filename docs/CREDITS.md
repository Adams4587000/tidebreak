# Asset and source provenance

All shipping 3D shapes are original Three.js constructor/operation geometry. No meshes, textures, music, names or source code were taken from Hydro Thunder or Beach Buggy Racing. They informed the requested arcade handling and challenge-unlock structure.

## Atlas MCP

Visual project: `29d918d9-ef79-4b7a-9519-575ad93f2405`.

### Territory menu production — 23 September 2026

Seven separate FLUX.2 Max images generated through Atlas MCP, 2048×1152 originals. The turn reported 170 total credits, including seven 19-credit image executions. The game ships resized WebP copies: 1600×900 title, 960×540 arena illustrations, approximately 0.76 MB combined. Originals and authenticated asset descriptors are kept outside `game/`; no API key is stored there or shipped.

| Shipping use | Output FID |
|---|---|
| Title artwork | `84361585-e17a-44d4-82bb-3137e849eb96` |
| Meridian illustration | `ea757122-f254-498c-b9f9-f4aca64dade9` |
| Drowned Reach illustration | `1ad53525-f86d-4097-aa99-8392be3fed4a` |
| Splitstone illustration | `2532ccb9-c9f7-4d6d-9ef9-94e3555d2852` |
| Ember Basin illustration | `bc9db419-43fd-487b-915f-1a018fcb47f4` |
| Sluice illustration | `c2e89306-724e-4a86-adc2-6b79e69abdce` |
| Atlantic illustration | `5b0fdebb-6092-453c-8c6a-1bbd9b20b663` |

These are illustrated menu assets, not runtime screenshots or imported 3D geometry. Existing Atlas steel, carbon, terrain, water, armory and audio assets remain in use.

### Earlier production assets

| Use | Atlas backend | Original output FID |
|---|---|---|
| Retired hydroplane reference | FLUX.2 Max | 8a1f8d45-14f4-4a25-a431-d217b242648a |
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

The current spacecraft references and their Atlas output identifiers are recorded in [SPACECRAFT.md](SPACECRAFT.md).

Spacecraft carbon composite material: PATINA via Atlas, node `ede3802a`. Basecolor `a8d902c2-2c42-4788-8892-0d8d857c0f22`, tangent-space normal `b62131a3-f4ae-489f-8cc9-949d96e7c626`, roughness `9a6f0a04-cc1e-40e8-9dbc-eea50dcdffff`. Converted to WebP and applied to the craft's graphite composite surfaces.

## Drowned Frontier overhaul — Atlas MCP

All generated through the same visual workspace project; raw outputs and authenticated-download metadata are preserved in `references/atlas-dystopia.json`, `atlas-salvage.json` and `atlas-wear.json`. These contain no API key.

- Fleet reference, FLUX.2 Max: `d719f862-67c4-44b3-993a-0981ccea626d`. Requested six pairs but produced four visible designs; used for the first four silhouettes and shared material/anatomy direction.
- Additional Echo / Marshal reference, FLUX.2 Max: `779757ac-c2ca-45e5-8a27-7cb63a2c4024`. Its wheels were not adopted; gameplay machines use hydrofoils.
- Six-biome reference, FLUX.2 Max: `e6c915b6-c787-4b2c-a611-f5a1a4ad5006`.
- First steel material: `d457705c-3a83-402d-9650-bd618b1e3faf` base, `b67e8630-e36a-4ed6-abf6-4c47453ef473` normal, `aef37871-ef2a-425f-9b95-2f6c3df53e52` roughness. Rejected for excessively subtle wear.
- Second PATINA steel material: `bab82518-196f-4987-96dc-cc9b035f9e21` base, `bd36d931-76d8-4a94-93cc-d06fb5b7c382` normal, `1d0d13ed-5ab3-44fa-96a5-4bfd4fcd8c3a` roughness. Fine normal/roughness retained; base remained too pristine.
- Final chipped-paint albedo, FLUX.2 Max: `589618c1-498d-40bb-8c49-0fc44f750510`, resized to 1024 and converted to WebP. Used with the fine steel normal/roughness as an artistic material combination, not a photogrammetrically matched PBR scan.

The three overhaul Atlas turns reported 77, 47 and 46 settled credits respectively (170 total). Generation success was followed by inspection; two texture outputs were explicitly rejected as visually unsuitable rather than accepted solely because generation succeeded.

The procedural spacecraft generator is `tools/dystopia-craft.template.js`; the six independent hull archetypes share rider/equipment construction helpers. `tools/make-dystopia-props.py` authors the stadium, wreck, spillway and caldera modules. The previous spacecraft generator is historical and should not be rerun over the current assets.

Rider fabric receives the canonical 404 `surfaces.js` fabric recipe at load time for fine weave and roughness. Atlas material maps supply the metal, composite, terrain and water surfaces. No procedural surface helper was modified.

## Combat expansion (September 2026)

Atlas MCP / FLUX.2 Max generated the inspected weapon fleet reference `58240817-84a8-4568-9ada-b7e73a3d6e24` and armory panel image `2b0c6b06-4096-4793-acc2-2ee748d371e4`. The panel ships at 768 px as `game/media/armory.webp`; the full images and metadata remain in references. The turn reported 76 credits. It generated four visible reference machines, not six complete models. The six game craft remain original constructor geometry, extended with weapon hardpoints in the existing template. Original synthesized weapon/impact effects supplement the existing Atlas music and water loops. See COMBAT.md for source-linked gameplay research.

## Recipe compliance remediation

Reference boards generated through Atlas MCP: FLEET_A `afc1abe7-e79f-4290-a430-32f73c479cab`, FLEET_B `89d18628-e3d4-4dfd-a682-188ace9c52de`, NATURE `5ee41243-20d9-4f8a-afc8-fb051b04c79e`, PORT `c952a2c6-a9ff-4808-8508-2431d8b6b0ea`, TRACK `b2421666-980e-4193-be48-349d2e93fb17`, DOCK_SUPPLY `79887437-e107-4310-a8a0-3233491d5561`. Originals, rejected retries and descriptors: `references/atlas-compliance.json`. These are reference-only; no extra image downloads are added to the game. Atlas reported 198 credits for six final board executions; that excludes earlier retries and agent costs, so it is not the total turn cost (transport closed before the aggregate receipt).

Corrected isolated references: caldera `34267a9b-0eb4-4be1-8c6f-276a89cfcbe7`, Kestrel `e3c4c2be-653c-4fbd-943f-9988b5121449`, Ironclad `afaf3c07-366d-423c-855b-080930b646d4`. The correction turn reported 76 credits, including three 19-credit images. Caldera's floating platform/towers were rejected, and craft decals/wire artifacts are not reproduced. Metadata: `references/atlas-compliance-fixes.json`.

Independent comparison images come from [Vector Unit's official Riptide GP: Renegade gallery](https://www.vectorunit.com/riptide-gp-renegade). Copyright remains with Vector Unit. Files and precise source URLs live only in `references/review`, outside the shipped game, and are used for visual criticism; no art, geometry or game source is copied into Tidebreak.

Atlas private critic project: `32eab797-f7fb-4ffb-a8a3-b72b165737c4`, using the workspace-allowed Seed 2.0 Lite vision model. Anonymous paired images are its only inputs; the pair key, game code and implementation notes are withheld. This is model critique, not a claim of human playtesting.

## Local gameplay refit
The 24 September refit reuses the existing Atlas steel/carbon media; craft-local mapping and distinct physical finishes replace the shared brown overlay. The supply magazine is original constructor geometry selected from three new candidates using the inspected existing Atlas supply reference. SVG interface ornament, collectible pulses, shield shaders and missile effects are original code; Web Audio feedback is original synthesis. See REFIT.md and candidates/supply-rebuild. No new external media or mesh is shipped.

### Watercraft material correction — 25 September 2026
The existing Atlas steel/carbon albedo, normal and roughness images now share hull-local projection coordinates. Original shader code restores surface normals, uses physical roughness variation, and derives thin paint relief from the visible chip mask. Coated panels, bare alloy and woven composite have separate responses. No external image, texture, audio or model was added. See MATERIALS-FIX.md.

### Nitro supply — 25 September 2026
Nitro reuses the reviewed supply pressure-vessel model and existing collectible/exhaust effect geometry. Its turquoise material/label, timer and ignition sound are original runtime code and Web Audio synthesis. No external media or new model is added.

### Smooth launch and dock ignition — 25 September 2026
Startup and mechanical menu cues are original Web Audio synthesis. Stationary revving animates the existing reviewed exhaust geometry with an original procedural flame shader; no new external image, audio or model is introduced. Per-material uniforms preserve fleet finishes while sharing shader programs. Repeated scenery shares canonical ASSET geometry through per-chunk GPU instances; this changes storage/draw submission, not the source asset constructors. See PERFORMANCE.md for measurements and limitations.
