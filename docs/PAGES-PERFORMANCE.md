# GitHub Pages performance audit — 25 September 2026

The owner paused competition submission to check live performance. No entry pull request has been opened. The contact is recorded as adamsleonard010@gmail.com; resuming submission and the remaining rights declaration are still pending.

The tested live game is `a68cfc56fe1b317cf3cd44844b7a4266c8c17dac`, merged through source PR #1 and deployed by Actions run 36162110947. All 97 published files match that source. Runtime code and graphics quality were not changed during this audit.

## Live gate and opening-race profiles

The unchanged jam gate passed against GitHub Pages: 11.7 s ready under the official phone/4G profile, 6.6 MB decoded body bytes (5.4 MB transferred), approximately 60 FPS, 507 peak draws, 994,368 peak triangles, zero errors or missing files. Receipts: `evidence/dock-race-release/live/` and `public-files.json`.

Separate startup profiling at 390×844, DPR 3 and 4× CPU slowdown found no countdown/launch frame above 100 ms; the maximum countdown frame was 33.3 ms and maximum launch frame 16.8 ms. Desktop startup also passed. This browser uses the host Apple M5 GPU, not a simulated low-end phone GPU.

All six territories were then driven for thirty seconds each on desktop and portrait mobile emulation. The mobile driver uses real touch events for steering, boost, missiles and shield. The desktop driver uses real keys. Later territories use an explicitly isolated unlocked save fixture; this is not evidence of earned progression. Each run traverses ramps and pickups with the full rival field. The production preview switch remains off.

| Territory | Desktop average FPS | Mobile average FPS, 4× CPU slowdown |
|---|---:|---:|
| Meridian | 59.63 | 59.89 |
| Drowned Reach | 60.00 | 60.00 |
| Splitstone | 60.00 | 60.00 |
| Ember Basin | 59.97 | 60.00 |
| The Sluice | 60.00 | 59.78 |
| Outer Atlantic | 60.00 | 59.45 |

All racing 95th-percentile frame times were at or below 16.8 ms. The test display runs at 60 Hz; these results do not establish a maximum above 60 FPS. Mobile stayed at its original render scale without needing adaptive reductions.

## Spikes and test limitations

The initial desktop run contained isolated 83–267 ms frame intervals, plus one 200 ms interval at the preparation/countdown boundary. Targeted fresh-browser rechecks of Meridian and Ember, with tracing enabled, had no racing/countdown interval above 16.8 ms. The original spikes remain recorded; their cause was not established, and they are not silently removed from the initial measurements. Mobile runs had a few isolated 50–100 ms intervals but none above 100 ms.

The first combined test timed out during the mobile fixture reload with no console errors; a fresh browser completed the mobile follow-up. Two initial portrait taps hit Ember while the card strip was scrolling; those duplicate runs are excluded from the combined six-territory result. The corrected driver settles the card position and checks the selected territory. Original attempt reports remain intact.

The evidence supports near-60-FPS gameplay on the tested host and emulation profiles. It does not prove zero lag on every device, physical-phone thermal performance, or 90/120/144 Hz rendering. No speculative reduction in art quality or gameplay was made to claim a higher score.

Reports, frame intervals, test drivers and trace summaries: `evidence/pages-performance/`. Full Chrome traces are retained locally outside the repository.

## Complete live combat race

A real-keyboard Meridian combat race finished first in 92.35 seconds, crossed all six checkpoints, collected 17 supplies and saved the earned territory/crew unlock after reload. Peaks were 633 draw calls and 1,191,236 triangles, with zero console errors. The full race averaged 60.00 FPS; its 95th-percentile interval was 16.7 ms, maximum 16.8 ms, with 0 intervals above 100 ms. Screenshots were disabled during this measurement to avoid introducing capture pauses. The full report is `evidence/pages-performance/endurance/combat-endurance-check.json`.
