# BLD Memo Trainer — compact CubeTime-style iPad web app

A static, installable website for practising 3×3 Old Pochmann memo. The interface is compacted for iPad: the New Scramble control is on the home screen, the 2D cube net is larger, memo option cards wrap into five columns on iPad (six on wider screens), the reference-check badge wraps safely, and parity is displayed as a prominent YES/NO pill.

## Important: offline WCA/TNoodle scramble sets

The app no longer downloads a scramble library at runtime. Once the site has been opened online and its service worker has cached the app shell, it can run offline.

To use genuine TNoodle-WCA 3×3 scramble sequences offline, import a plain-text file containing one 3×3 scramble per line. Prepare that file from the current official TNoodle-WCA release (currently 1.2.3 according to the WCA Scrambles page). The app stores the imported set in this browser on this iPad and chooses randomly without replacement until the set is exhausted; it then reshuffles the pool. No Wi-Fi is needed after import.

**The app itself is not an official WCA scramble program.** TNoodle-WCA is the WCA's official scramble program; these imported sequences are for personal practice only, not for running a competition. Always check the WCA site for the current release before preparing a new set.

### Prepare an import file

1. On a computer, download and run the official TNoodle-WCA program from the WCA Scrambles page: https://www.worldcubeassociation.org/regulations/scrambles/ . The WCA currently lists TNoodle-WCA 1.2.3.
2. Generate a 3×3 practice set with plenty of attempts.
3. Copy the 3×3 scramble sequences from the generated computer-display/scramble output into a plain-text file named `tnoodle-333.txt`, with **one complete scramble per line**. Keep standard move notation (for example `R U2 F' ...`). Remove headings, event labels and commentary.
4. On the iPad, open BLD Memo Trainer, tap the ••• menu → **Import TNoodle set**, and select `tnoodle-333.txt` from Files.
5. The app validates the move notation, stores the pool locally, and starts a scramble. The menu's **Clear imported set** action removes the local pool.

The app tracks used scrambles within the imported set to avoid repeats until the set is exhausted. The pool is stored in this browser's local storage; importing it on another device is a separate step.

## Publish and install on iPad

1. Create a GitHub repository named `bld-memo-trainer`.
2. Upload the contents of this folder to the repository root: `index.html`, `styles.css`, `app.js`, `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`, and `README.md`.
3. In repository **Settings → Pages**, choose **Deploy from a branch**, branch `main`, folder `/(root)`, then Save.
4. Open the published HTTPS address in Safari on the iPad while online once. Wait for the page to load fully so the service worker can cache the app shell.
5. Safari Share → **Add to Home Screen** → Add.
6. Import your TNoodle text set once. Thereafter, the cached app and imported scrambles work offline.

## Updating an existing installation

Replace the files in the same GitHub repository and commit. The service worker cache version is incremented to `v2`; reopen the hosted page once while online so the new files are cached. The imported scramble pool remains in local storage unless you clear website data or use **Clear imported set**.

## Features

- User-supplied green-front/white-top A–X lettering scheme.
- Edge and corner memo with pairs and selectable cycle-start alternatives.
- Setup-efficiency ranking, orientation correction choices and parity display.
- Matching 2D net calculated from the exact displayed scramble.
- Reference regression checks using the two supplied J Perm examples.
- Offline app shell and locally stored imported TNoodle practice scramble set.
- Stopwatch and solve history are reserved for a later update.
