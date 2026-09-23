# Six territories of the Drowned Frontier

The territory campaign supersedes the three continuous multi-biome contracts. Each arena is a complete race with one atmosphere, one continuous circuit, six named checkpoints, a starting grid and a finish line. Biomes do not change during a race. The route preview is drawn from the actual course spline.

| Territory | Length | Race identity | Requirement to clear |
|---|---:|---|---|
| Meridian | 8.45 km | Flooded stadium opening and return, quays, crane yards, harbour bridges | Finish |
| Drowned Reach | 9.15 km | Mangroves, blackwater bends, drowned wrecks, organic crossings | Top four |
| Splitstone | 9.83 km | Tall slate banks, overhead stone arches, technical canyon turns | Podium |
| Ember Basin | 8.76 km | Glowing basalt fissures, caldera spires, broken causeways | Podium |
| The Sluice | 9.31 km | Concrete channels, monumental spillways, ten timed surge windows | Top two |
| Outer Atlantic | 9.41 km | Rough swell, wreck fields, sea stacks, lighthouse landmarks | Win |

Each clearance opens only the next territory. Only Meridian is available on a fresh territory campaign. All locked territories can be previewed, including art, route, conditions and the exact prerequisite; their race button remains disabled. Practice is available only on unlocked territories and never grants campaign clearance.

## Game flow

The game name and Atlas title artwork appear during asset loading. The progress bar becomes **Enter the dock** only once the game is ready. The title never starts a race automatically.

The dock is solely for choosing a rider/machine pair and inspecting the live 3D model. **Choose territory** opens a separate arena screen. **Back to crew** preserves the selected crew. Locked crews remain inspectable but cannot proceed to arena selection. Each crew retains its original colors, geometry, equipment and unlock milestones.

The arena screen shows all six territories, illustrated cards, lock icons, the selected route, race conditions, personal best and objective. **Race this territory** builds the selected world, then starts the original 3–2–1 countdown. Results retain all competitor standings; **Back to dock** prepares the next available territory without silently starting it.

## Career and persistence

The new key is `tidebreak.territories.v3`. On first use, career totals migrate from `tidebreak.endurance.v2`: finishes, podiums, wins, completed-race pickups, reputation, takedowns and starts. Those totals retain earned crews. Old contract times and clearances do not become records on different new circuits. The legacy save remains untouched. Subsequent saves use the v3 key.

Rook / Kestrel is the starter. Vesper unlocks after one finish or 180 reputation; Moss after 12 completed-race supplies or 350 reputation; Cinder after two podiums or 700 reputation; Echo after four finishes or 1,000 reputation; Marshal after one win or 1,800 reputation. Elimination earns participation reputation without faking a finish. Aborted runs grant nothing. Time trials save best times only.

## Shared combat

The original missile, shield, special, three-hit elimination, pursuit, drafting and finite supply rules remain in [COMBAT.md](COMBAT.md). Supply rows stay 460 m apart. Difficulty increases gradually from 0 to 2 across the campaign, rather than accidentally doubling the old opponent speed escalation when expanding from three events to six.

Rival crews still use independent decisions on route coordinates and can fight, miss, collect, fail and finish. Scenery obstacles affect any crew that strikes them. The player retains free steering, buoyancy, ramps, recovery and lens splashes.

## Implementation

`campaign.js` defines objectives, independent route parameters and six local checkpoint names for each territory. `course.js` separates the constant environment index from checkpoint progress. Nearest-position projection considers both adjacent segments, removing the old roughly one-metre sampling error. `world.js` constructs the entire selected environment, uses arena-specific crossings and obstructions, and puts timed surge gates only in the Sluice. Scenery remains spatially batched and culled through the canonical 404 helpers.

Atlas arena images are menu illustrations, not screenshots or a claim of matching photorealistic runtime geometry. The race uses original procedural 3D assets and Atlas material maps.
