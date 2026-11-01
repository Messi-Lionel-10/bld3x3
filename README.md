# BLD Memo Trainer — iPad web app

A static, installable website for practising 3×3 Old Pochmann memo. The interface has been redesigned around the light, minimal CubeTime-style layout shown in the supplied iPad screenshots: compact session panel, centered scramble, large reveal control, and floating cube-net/status cards.

## What is in the folder

- `index.html` — app screen and controls
- `styles.css` — responsive iPad/iPhone/desktop styling
- `app.js` — cube-state, lettering, memo, cycle-alternative and verification logic
- `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png` — installable web-app support

## Easiest way to put it on your iPad

You need to publish the folder once. The easiest free option is GitHub Pages.

### A. Create the GitHub repository

1. On your iPad, open Safari and go to https://github.com/new (sign in or create a GitHub account).
2. Repository name: `bld-memo-trainer`.
3. Choose **Public** (GitHub Pages is simplest on a public free repository).
4. Select **Add a README file** if GitHub offers that option, then create the repository.
5. Open the new repository and choose **Add file → Upload files**.
6. Upload the *contents* of this folder — `index.html`, `styles.css`, `app.js`, `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`, and `README.md`. Make sure `index.html` is at the repository root, not inside another nested folder.
7. Commit the upload.

### B. Turn on GitHub Pages

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select branch **main** and folder **/(root)**, then Save.
4. Wait a minute or two. GitHub will show a published address similar to `https://YOUR-USERNAME.github.io/bld-memo-trainer/`.
5. Open that address in Safari on the iPad.

### C. Add it to the iPad Home Screen

1. In Safari, open the published website.
2. Tap the **Share** icon (square with an upward arrow).
3. Scroll and choose **Add to Home Screen**.
4. Name it `BLD Memo`, then tap **Add**.
5. Launch it from the new Home Screen icon.

If **Add to Home Screen** is not visible, scroll to the bottom of the Share sheet and tap **Edit Actions** to enable it. Use Safari rather than an in-app browser.

## Updating the app later

When I provide replacement files, upload them to the same repository and choose **Commit changes**. Keep the filenames the same and replace the old files. Reopen the app; if an old version remains cached, close the Home Screen app fully and reopen it, or refresh the Safari page once. The service worker caches the app shell, but scramble generation still needs internet access.

## Important scramble note

The current code requests a random-state 3×3 scramble from the cubing.js generator. This is suitable for practice, but the library's own documentation notes that its WCA scramble filtering is not yet implemented. Therefore, do **not** treat these as officially generated TNoodle-WCA competition scrambles. The app should only be labelled WCA-official after the generator is replaced with the official TNoodle-WCA implementation/service.

## Notes

- The app needs an internet connection for the scramble generator CDN.
- The cube net is generated from the exact scramble shown on screen.
- The memo uses the supplied green-front/white-top lettering scheme and the two J Perm examples as regression tests.
- The stopwatch and solve-history features are intentionally not included yet; they can be added as a later section.
