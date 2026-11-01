# BLD Memo Trainer — CubeTime-style iPad web app

A static, installable website for practising 3×3 Old Pochmann memo. The home screen is compacted to fit the iPad viewport, with the scramble controls, reveal control, cube net and training checks all visible without scrolling.

## Scramble generation

The app generates a fresh 3×3 random-state scramble online using the browser module documented by cubing.js:

`https://cdn.cubing.net/v0/js/cubing/scramble`

The app therefore needs an internet connection for every new scramble. If generation fails, check the connection and tap **New Scramble** again. The scramble string is passed through the app's cube-state model, so the 2D net is calculated from the exact scramble shown.

**WCA status clarification:** cubing.js documents random-state scrambles for 3×3 and says its scrambles follow WCA Regulation 4b3 where required, but it also states that TNoodle's full scramble filtering is not yet implemented. The official WCA scramble program remains TNoodle-WCA. These are suitable random-state practice scrambles, but must not be described as official TNoodle output or used for official competition scrambling. See https://js.cubing.net/cubing/scramble/ and https://www.worldcubeassociation.org/regulations/scrambles/ .

## Publish and install on iPad

1. Create a GitHub repository named `bld-memo-trainer`.
2. Upload the contents of this folder to the repository root: `index.html`, `styles.css`, `app.js`, `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`, and `README.md`.
3. In repository **Settings → Pages**, choose **Deploy from a branch**, branch `main`, folder `/(root)`, then Save.
4. Open the published HTTPS address in Safari on the iPad while online.
5. Safari Share → **Add to Home Screen** → Add.
6. Keep an internet connection when generating new scrambles.

## Updating an existing installation

Replace the files in the same GitHub repository and commit. Reopen the hosted page in Safari while online. The service worker uses network-first updates for same-origin app files; the external cubing.js scramble module is loaded online from its CDN.

## Features

- User-supplied green-front/white-top A–X lettering scheme.
- Edge and corner memo with pairs and selectable cycle-start alternatives.
- Setup-efficiency ranking, orientation correction choices and parity display.
- Matching 2D net calculated from the exact displayed scramble.
- Reference regression checks using the two supplied J Perm examples.
- Online random-state scramble generation; internet required.
- Stopwatch and solve history reserved for a later update.
