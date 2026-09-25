# Local dock control correction

The previous ignition button lived beneath the equipment list in the right-hand detail panel. At 1512×820, 1440×700, 1280×720 and 1920×800, the crew selector covered its click target. The prior checks at 1440×900 and phone sizes missed this laptop-height failure.

The owner's requested correction places a large **REV ENGINE** button under **YOUR RIDE. YOUR RULES.**, separate from the details and crew selector. Its touch target is above the rotation region; the heading's other content still lets pointer input pass through. Hold the button or R to rev, and release to idle. The details panel scrolls within its available height.

The rotation/zoom strip also says **HOLD R TO REV ENGINE**.

Holding R while dragging previously made the browser draw a circular focus outline around the rotation region. Focus now underlines the rotation hint, and dragging cannot select its text. Dock throttle response is quicker, with brighter turbine harmonics and a separate exhaust-noise mix that fades out when leaving the dock. Race engine settings are unchanged. The `evidence/rev-energy/` check exercises simultaneous drag and R, verifies the focus hint without the circle, and checks dock audio, mute, touch revving and race entry.

The sound button now reports enabled/running state and retries a suspended or interrupted audio context. Enabling sound plays confirmation. Entering the dock explicitly activates audio. Existing music and water recordings are decoded into the same unlocked Web Audio context as the effects; an independent HTML media player is no longer required. A gentle synthesized turbine idle continues in the dock, with stronger midrange harmonics during revving. The R shortcut also retries audio activation. Mute controls the entire mix. Updated entry/CSS/audio module URLs prevent an older cached script from retaining race-only playback. No media, geometry or external assets were added.

The control check now covers the failing laptop dimensions as well as desktop, portrait and landscape phone emulation. The newer `evidence/dock-audio/` run enters the dock directly, without enabling title sound or starting a race, and verifies the music loop is playing. A passive analyser measures the combined audio output during idle/revving and silence after muting; this checks the audio graph, not physical speakers. The first touch attempt caught the rotation layer intercepting the new button; its failure is preserved under `evidence/dock-controls/attempt-1/`. The corrected run and screenshots are in `evidence/dock-controls/`.

This is a local follow-up to the published 63a3958 release. The existing public gate and submission draft still name that published release.
