# Current combat rules

The combat expansion supersedes the earlier speed, pickup frequency and reward values below. See [COMBAT.md](COMBAT.md) for the current shared arsenal, reputation unlocks, elimination and live classification. Existing saves remain compatible.

# The Drowned Frontier

Three endurance contracts each traverse the complete 14–16 km frontier. The opening Exile Run takes roughly four minutes at racing speed; mistakes and recovery extend it. All six sectors are physically present from the first event: decaying Meridian stadium, Drowned Reach mangroves, Splitstone gorge, Ember Basin, Authority Sluice and Atlantic wreck field. A sector change blends fog, water, lighting and wave amplitude while the same race continues.

- Exile Run: finish. Unlock Blackwater Contract.
- Blackwater Contract: finish on the podium. Unlock Last Authority.
- Last Authority: win. Earn the Atlantic title.

Clean saves begin with Rook / Kestrel. Vesper / Albatross requires one completed race. Moss / Manta requires twelve perks collected across completed races. Cinder / Brimstone requires two podiums. Echo / Spectre requires four completed races. Marshal / Ironclad requires one win. Locked crews can be inspected but cannot start. Each pair has a distinct hull, helmet, equipment, handling and boost profile.

Practice updates best times without granting contracts, finishes, perks or roster progress. Aborting and restarting grant nothing. Endurance progress persists in `tidebreak.endurance.v2`; prototype v1 environment clearances are retained in the browser but intentionally do not become v2 unlocks.

Supply stations offer separate lanes containing charge (+60 energy), shield (9 seconds of contact protection), overdrive (5 seconds at 12% higher target speed), or repair (+35 energy and 3 seconds of protection). Each item has one owner. Earliest swept contact wins; first array position does not. Rivals use the same effects and finite boost reserve. Supplies do not respawn during a race.

Opponents follow anticipatory course lines, seek nearby supplies, avoid another rival's lane, slow for tighter corners, expend/recharge energy and occasionally make line errors. They do not rubber-band to the player's position. Later contracts tighten their pace slightly. This is racing AI on route coordinates, not a full independent rigid-body vehicle simulation; it does not reproduce every physical effect of the player controller.
