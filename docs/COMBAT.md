# Tidebreak: armed endurance

This expansion preserves the six original crews, their ridden hydrofoil spacecraft, the dystopian art direction, the three contracts, existing saved unlocks, and all six regions inside each continuous 14–16 km event. It changes the pace and the decisions made during the race. No imported models or copied commercial-game art are used.

## Research translated into original rules

Primary developer sources reviewed on 23 September 2026:

- [Vector Unit: projectile strategy](https://www.vectorunit.com/blog-posts/2019/5/7/bbr2-powerup-guide-projectiles) describes limited shots, straight attacks and situational slowing effects. Tidebreak uses a four-round missile reserve, a separate special slot, visible physical attacks and a recovery interval after damage.
- [Vector Unit: seekers](https://www.vectorunit.com/blog-posts/2019/5/9/bbr2-powerup-guide-seekers) explains homing attacks, the cost of wasting several shots on one opponent, and track-dependent counterplay. Tidebreak missiles have a visible launch phase and stop tracking laterally on final approach. A late lane change or a shield can defeat them; missiles are consumed even when blocked.
- [Vector Unit: globals](https://www.vectorunit.com/blog-posts/2019/5/23/bbr2-powerup-guide-globals) shows attacks aimed at racers ahead and effects that can be countered. Tidebreak selects a live rival ahead, never a finished or eliminated racer. There are no invisible guaranteed global hits.
- [Vector Unit: championship and progression update](https://www.vectorunit.com/blog-posts/2022/4/26/bbr2-update-20220420) discusses finishing-position rewards, career statistics and retained unlocks. Tidebreak keeps contract milestones and adds reputation earned through distance, supplies, takedowns and finishing position. Elimination earns participation progress without recording a false finish.
- [Gameloft: Nitro Shockwave](https://gameloft.helpshift.com/hc/en/15-asphalt-legends/faq/606-how-do-i-perform-a-nitro-shockwave/) describes a large speed burst from a charged resource. Tidebreak uses its own automatic five-second launch turbo, finite rechargeable boost, colored exhaust and camera acceleration.
- [Nintendo: Mario Kart item inventory](https://www.nintendo.com/sg/switch/aabp/item/index.html) presents limited held items. Tidebreak separates ordinary missiles, one special weapon type and shield charges so the driver can read their options quickly.

These are design influences, not claims that Tidebreak reproduces those games' physics or proprietary AI. The values below are original tuning.

## Race rules

| System | Shared rule |
| --- | --- |
| Launch | 3–2–1–GO, five seconds of automatic turbo, full energy, eight seconds of opening protection |
| Pace | 61.5–65 m/s cruise, craft-specific turbo multiplier; much faster acceleration than the preceding build |
| Starting arsenal | Four missiles, two manually activated shields, empty special slot |
| Hull | Three damaging hits eliminate a crew. Each hit slows it; six seconds of recovery immunity prevents chain kills. Hull hits remain for the run. |
| Shield | E or SHIELD: five seconds, consumes one charge. Supplies can replenish up to three charges. |
| Missiles | F or FIRE: live forward target within 340 m; finite ammunition, 2.4 s launcher cycle, visible slow ignition then acceleration; lane tracking ends within 55 m. |
| Seeker | Longer 520 m acquisition and stronger guidance; still one damage and blockable |
| Laser | Fast narrow pulse to the acquired lane; one damage, can miss after a lane change |
| Mine | Rear-laid red hazard, arms after 0.6 s, lasts 20 s; hurts one rival |
| Bomb | Forward lob with visible area marker, detonates after 1.5 s; affects rivals in the blast area |
| Pursuit | All crews receive up to 14% extra power when sufficiently far behind the leader; displayed to the player. Positions are never teleported. |
| Drafting | Same-lane following at 7–85 m grants 12% speed; displayed as SLIPSTREAM |
| Supplies | Four finite pickups across the water every 460 m, approximately 6–7 seconds at a typical 71 m/s pace. Actual time varies with braking, damage and turbo. Earliest swept contact wins. |
| Red skull | Clearly labeled lethal contraband mine mixed into occasional later rows. Eliminates an unprotected racer; shield/recovery immunity blocks it. |
| Track | Six environments, bridge piers, three marked channels, offset barriers, ramps, corners and timed sluice gates. Piers/barriers slow any crew that strikes them. |

Charge restores energy. Overdrive adds a temporary speed boost. Repair clears slowing and provides brief protection; it does not erase hull-hit history. Ammo restores two ordinary missiles up to eight. Special supplies provide two uses, up to three when matching the held type; a different type replaces that slot.

AI crews have separate random streams, lane preferences, driving errors and reactions. They spend ammunition and energy, collect the same finite supplies, shoot each other, evade threats, use shields and can be eliminated. The AI follows course coordinates; it is not a second human vehicle-physics simulation. Pure-rule tests run multiple seeds to check varied winners and AI-versus-AI damage and eliminations.

## Career and classification

The existing `tidebreak.endurance.v2` save remains in use and is extended with reputation, takedowns and starts. Existing records and unlocks remain intact.

A race result earns floor(distance / 250) reputation, 3 per supply, 25 per takedown, plus a finish award of 120 / 85 / 60 / 40 / 30 / 20 for positions 1–6. Elimination receives 10 participation points instead of a finish award. Practice and abandoned runs do not award reputation. There are no purchases, timers or loot boxes.

Crew milestones remain available. Reputation also unlocks Vesper at 180, Moss at 350, Cinder at 700, Echo at 1000 and Marshal at 1800, allowing losing racers to make eventual progress. Contract completion still requires the specified finish, podium or victory.

The result table lists all six crews, actual finish times, active progress and elimination status. Remaining AI crews continue racing while the result screen is open. Active classification is explicitly labeled LIVE; it becomes FINAL once every crew has finished or been eliminated. Finishing order uses crossing time, active order uses distance, and eliminated order uses survival time.

## Presentation and implementation

The dock is a monochrome industrial 3D inspection bay, with colored crews, missiles, launcher braces, cooling vents, laser apertures and mine cartridges. Drag rotates the camera, vertical drag changes elevation, scroll zooms, and the focused inspection area supports left/right arrows. Locked crews remain inspectable.

Colored exhaust, moving projectiles, blast rings, named rival markers, live gaps and hull status make combat readable. The lens effect samples the actual rendered scene through curved droplet normals and drains drops under gravity. It replaces the prior CSS-only droplets; it is a lightweight screen-space approximation, not a full fluid simulation.

404 canonical helpers stay unchanged. Craft geometry is authored in the existing procedural template and regenerated as self-contained asset modules. Atlas-generated references inform the weapon hardpoints; its armory texture is used on their surfaces. The dense fleet reference resolves four visible machines despite requesting six; it is not evidence of six generated models. The game retains its six original procedural designs. The generated equipment panel is used as a finite panel image, not represented as a verified seamless material.

Atlas visual project: `29d918d9-ef79-4b7a-9519-575ad93f2405`. New FLUX.2 Max outputs:
- Combat fleet reference `58240817-84a8-4568-9ada-b7e73a3d6e24`.
- Armory panel texture `2b0c6b06-4096-4793-acc2-2ee748d371e4`, shipped as 768 px WebP.
- MCP turn reported 76 credits including settled generation/agent work. Metadata: `references/atlas-combat.json`.

## Verification

Use `node --test tests/*.test.mjs`, real-input combat/inspection/touch checks, the full turbo endurance driver, recipe asset verification, ship validation, and the phone/4G jam gate. Evidence and exact measurements are recorded separately after the final source revision. A local gate verdict is not a published competition entry.
