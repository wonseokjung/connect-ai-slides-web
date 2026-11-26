# NOTICE

connect-ai-slides-web is CONNECT AI LAB's code (MIT, see [LICENSE](LICENSE)). It connects existing motion libraries. Those libraries are installed from npm and keep their own licences.

> **Licences in one box**
>
> | What | Licence |
> |---|---|
> | This kit (stage runtime, adapters, check, record, export, look, every block in `catalog/`) | MIT, CONNECT AI LAB |
> | GSAP and its plugins | GreenSock / Webflow standard "no charge" license. **Not an OSI open-source licence.** https://gsap.com/standard-license |
> | Remotion, `@remotion/player`, `@remotion/renderer` | Remotion License. **Not MIT.** Free for individuals, for-profit organisations with up to 3 employees and non-profits. Other companies need a Company License. https://github.com/remotion-dev/remotion/blob/main/LICENSE.md |
> | Everything else that is installed | MIT, Apache-2.0, ISC, BSD-2-Clause, BSD-3-Clause, 0BSD |
>
> The deck engine, the website engine and the check run without GSAP and without Remotion. GSAP is loaded only by `gsap/*` and `hyperframes/*` blocks. Remotion is loaded only by `remotion/*` blocks.

## No third-party source code in this repository

No file in this repository is copied from another project. Every library below is a dependency in `package.json` with a pinned version, downloaded by `npm install`. There are no exceptions:

- The blocks in `catalog/hyperframes/` are written by us in the HyperFrames block format (HTML + CSS + a paused GSAP timeline). They are not taken from the HyperFrames registry. MIT.
- The Lottie files in `catalog/lottie/` are plain shape layers written by our own generator (`tools/make-lottie.mjs`). CC0.
- The Remotion compositions in `catalog/remotion/` are our own components. MIT. They need Remotion to run.

## Dependencies

"Copied into your `out/` folder" means: when you run `build`, the file is copied unchanged from `node_modules` into `out/deck/assets/vendor/` or `out/site/assets/vendor/`, so the result opens without a server and without a CDN. Only what your story uses is copied.

| Package | Version | Licence | What the kit uses it for | Copied into your `out/` folder? |
|---|---|---|---|---|
| reveal.js | 6.0.2 | MIT | The deck engine: keys, touch, overview, speaker notes | Yes, in `out/deck` (`reveal.js`, `reveal.css`, the notes plugin) |
| lenis | 1.3.27 | MIT | Smooth scroll on the website | Yes, in `out/site` (`lenis.min.js`, `lenis.css`) |
| gsap | 3.15.0 | GSAP standard "no charge" license (not OSI) | `gsap/*` blocks and `hyperframes/*` blocks | Yes, only if the story uses such a block (`gsap.min.js` and the plugins that block lists) |
| motion | 14.14.0 | MIT | `motion/*` blocks | Yes, only if used (`motion.js`; this one file also contains framer-motion, motion-dom and motion-utils, all MIT) |
| animejs | 4.5.0 | MIT | `anime/*` blocks | Yes, only if used (`anime.umd.min.js`) |
| lottie-web | 5.13.0 | MIT | `lottie/*` blocks | Yes, only if used (`lottie_light.min.js`) |
| remotion | 4.0.529 | Remotion License | `remotion/*` blocks | Yes, only if used, inside `assets/remotion.js` |
| @remotion/player | 4.0.529 | Remotion License | Plays a Remotion composition inside a slide or a page | Yes, only if used, inside `assets/remotion.js` |
| react, react-dom (and scheduler) | 19.1.0 (0.26.0) | MIT | Needed by `@remotion/player` | Yes, only if used, inside `assets/remotion.js` |
| esbuild | 0.28.1 | MIT | Bundles Remotion compositions into `assets/remotion.js` at build time | No |
| @remotion/renderer | 4.0.529 | Remotion License | Only as a place to find an ffmpeg binary when no system ffmpeg is installed | No |
| puppeteer-core | 24.43.1 | Apache-2.0 | Drives the Chrome already on your computer for `check`, `record` and `export` | No |
| pptxgenjs | 4.0.1 | MIT | Writes `deck.pptx` | No |

Remotion, `@remotion/player`, `@remotion/renderer`, React and esbuild are optional dependencies. `npm install --omit=optional` installs the kit without them; `remotion/*` blocks are then unavailable and `record` needs an ffmpeg on your PATH.

Packages that the ones above install (133 packages in total at the pinned versions) are MIT, Apache-2.0, ISC, BSD-2-Clause, BSD-3-Clause or 0BSD. Two have a compound licence field: `jszip` is "MIT OR GPL-3.0-or-later" and is used here under MIT, `pako` is "MIT AND Zlib". The ffmpeg binary inside `@remotion/compositor-*` is FFmpeg and has FFmpeg's own licence. This kit does not ship it or copy it.

Licence texts of every library that can end up in your `out/` folder are in [`licenses/`](licenses/).

## Licences in the folder you publish

Your `out/deck` and `out/site` folders contain copies of the libraries your story uses. The copied files keep their own licence header. `build` also copies each library's licence text to `assets/vendor/licenses/`. Keep that folder when you put the result online or hand it to someone.

- If your story uses a `gsap/*` or `hyperframes/*` block, the published folder contains GSAP. GSAP's licence allows using it on websites, web applications and digital interfaces at no charge, including commercial ones. It does not allow putting GSAP into a tool that lets people build animations visually without code. This kit is a code and command-line tool and has no visual editor. Read the licence yourself before you publish: https://gsap.com/standard-license
- If your story uses a `remotion/*` block, the published folder contains Remotion code. Check that you are eligible for the Remotion Free License, or get a Company License.

## Sample material

- `examples/media/person.svg` and `examples/media/person.mp4` are a drawn stand-in for a person on camera, made by us. CC0. No real person is in the npm package.
- `examples/media/photo-croissant.jpg`, `photo-cake.jpg`, `photo-tea.jpg` and `photo-table.jpg` are our own Blender Cycles renders of Poly Haven models (croissant, carrot_cake, tea_set_01, coffee_table_round_01) lit by the Poly Haven HDRI brown_photostudio_02. Models and HDRI are CC0 (polyhaven.com/license); the renders are CC0 too.
- The demo videos and pictures in `docs/` (repository only) show the author. They are there with his permission, to show the kit working. They are not licensed for reuse.

## Fonts

The kit downloads no font. It uses the system sans-serif stack and names Inter and Pretendard first, so they are used when they are already installed (both SIL Open Font License 1.1).

## What we looked at and did not bundle

Slidev and Marp (MIT) need Vue or a build step and do not give a folder that opens by double click. For impress.js, Spectacle, DeckTape, timesnap / timecut, Locomotive Scroll, AOS and Barba we checked the licence and what they do, and did not use them. SplitType (ISC in package.json, no licence file in the repository), ScrollReveal and fullPage.js (GPL-3.0) were not used. No code was copied from any of them.
