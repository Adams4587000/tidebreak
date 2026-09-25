# Race soundtrack

Active racing now uses an original 148 BPM electronic score with breakbeat percussion, a syncopated bass line, a delayed synth arpeggio and four chord sections. `game/race-score.js` renders sixteen bars once through OfflineAudioContext at 24 kHz, folds the release tails across the loop boundary, normalizes the peak to 0.85 and plays one looping buffer. This adds no media downloads or per-frame note scheduler.

The existing Atlas recording remains in the dock, countdown, pause and results screens. Race start/resume crossfade to the new score; pause/exit crossfade back. Both tracks use the shared master mute and limiter. Engines, pickup sounds and weapon effects retain their separate existing mix. If score rendering fails, the existing music remains available as fallback.

`tools/race-music-check.mjs` passed desktop and portrait mobile emulation with actual clicks/taps: dock audio, race gain transition, pause, resume, restart without duplicate loops, and entering a race while muted. A passive analyser checked the audible output; the buffer check verified finite peak, nonzero RMS and a small loop-boundary step. This does not certify subjective listening quality or physical speakers. The first two test attempts mistakenly observed the offline render destination instead of the live output; their reports are retained. The corrected observer explicitly excludes OfflineAudioContext, including in the dock ignition check.

All 53 pure tests and the integrity/ship check passed. The unchanged phone/4G jam harness passed locally: 12.1 seconds ready, 6.6 MB transferred, 507 peak draws, 994,368 peak triangles, zero errors. Reports are in `evidence/race-music/`. Those receipts describe the local preview with territory unlocks enabled; the subsequent commit restores earned progression.

## Race mix presence correction

The user found the race score too quiet and muffled. Its playback gain is now 0.65 instead of 0.26 (about 8 dB higher). A baked +4 dB high shelf above 1.6 kHz brings out percussion and synth detail, while a -2 dB low shelf below 220 Hz reduces bass masking. The rendered loop still has a normalized 0.85 peak and uses the existing master limiter. Dock/pause music and engine/effect levels are unchanged. The transition/mute regression now requires the louder race gain; the follow-up receipts are in `evidence/race-music-presence/`.
