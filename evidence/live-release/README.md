# Live release gate

The unchanged 404 recipe jam harness passed against https://adams4587000.github.io/tidebreak/ on source `e83d09ce01b727e6be573e104b87be04812f9bcd`.

- 390×844 phone viewport, real touch, supplied 4G profile.
- 11.9 seconds ready; 6.6 MB body bytes.
- 491 peak draws; 993,126 peak triangles.
- Zero errors, missing files, external dependencies or files outside the game folder.
- All 95 deployed files match the local source manifest.

`gate.txt` and `verdict.json` are unchanged harness output. `deployed-files.json` records the independent live-file hash comparison. The screenshots are browser emulation on a Mac, not physical-phone testing. The exact verdict block is also preserved in `submission/verdict.txt` for the entry PR.

GitHub Actions run: https://github.com/Adams4587000/tidebreak/actions/runs/36078223192.

Submission remains pending the owner's contact and remaining entrant declarations. A passing gate is not organizer acceptance.
