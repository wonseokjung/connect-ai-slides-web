# Write a block

A block is one folder: `catalog/<source>/<name>/` with `block.js` and `meta.json`. It draws one screen (a slide, or one screen of a web page) and returns a clip the stage can seek. Your own blocks can live anywhere: point at the folder with `"blocks": ["./my-blocks"]` in `story.json` (same layout: `my-blocks/<source>/<name>/`).

## block.js

```js
// no imports: libraries come through cx
export const css = `
.b-gsap-split-title .cs-rule { width: calc(var(--hero) * 1.1); }
.cs-frame[data-shape="tall"] .b-gsap-split-title .cs-hero { font-size: var(--title); }
`;
export default function mount(el, p, cx) {
  el.innerHTML = `<div class="cs-pad"><h2 class="cs-hero">${cx.esc(p.title)}</h2><i class="cs-rule"></i></div>`;
  const tl = cx.gsap.timeline({paused: true});
  tl.fromTo(el.querySelector('.cs-hero'), {opacity: 0, y: 40}, {opacity: 1, y: 0, duration: 0.9, ease: 'expo.out'}, 0);
  tl.fromTo(el.querySelector('.cs-rule'), {scaleX: 0}, {scaleX: 1, duration: 0.9, ease: 'expo.out'}, 0.5);
  return cx.fromGsap(tl);
}
```

- `el`: the block root. It already has the classes `cs-block b-<source>-<name>` and fills the frame.
- `p`: the scene from `story.json` (your props).
- `cx`: everything else (below).
- Return a clip: `{ dur, seek(t), steps }`. Use an adapter, do not start anything yourself.

### The one rule: `seek(t)` is the only clock
`t = 0` is the state before anything appears, `t = dur` is the finished, readable screen. No `requestAnimationFrame`, no `setTimeout`, no `autoplay`, no infinite loops, no `Math.random()` (use fixed numbers). The stage calls `seek` for you: on slide enter, on click, on scroll, and frame by frame when recording.

### Adapters (`cx.…`)
| Library | How | Returns |
|---|---|---|
| GSAP | `const tl = cx.gsap.timeline({paused: true}); … cx.fromGsap(tl)` | labels named `step1`, `step2`… become click steps |
| GSAP plugins | `const [SplitText, DrawSVGPlugin] = cx.plugin('SplitText', 'DrawSVGPlugin')` and list them in `meta.source.uses` | registered plugins |
| Motion | `const {animate, stagger} = cx.motion; cx.fromMotion([animate(…), animate(…)], {dur: 2.1, steps: []})` | `dur` is required (delays are not in `controls.duration`) |
| anime.js v4 | `const tl = cx.anime.createTimeline({autoplay: false}); tl.add(…); cx.fromAnime(tl, {steps: [1.2]})` | times inside anime are ms, `steps` in seconds |
| Lottie | `const a = cx.lottie.loadAnimation({container, renderer: 'svg', loop: false, autoplay: false, animationData}); cx.fromLottie(a, {at: 0.4, speed: 1})` | |
| CSS @keyframes | write `animation: …` in `css`, then `cx.fromWaapi(el)` | every CSS animation under `el`, paused and seeked |
| Web Animations | `cx.wa(els, [{opacity: 0}, {opacity: 1}], {duration: 0.8, delay: 0.2, stagger: 0.08, ease: 'cubic-bezier(.16,1,.3,1)'})`, then `cx.fromWaapi(el)` | seconds |
| Video | `cx.fromVideo(videoEl)` | plays muted by itself when live, exact frame when recording |
| HyperFrames block | `cx.fromHyperframes(el, html, {canvas: [1200, 360], dur: 2.4, text: {'.title': p.text}})` | the block's own GSAP timeline |
| Remotion | `cx.fromRemotion(el, 'remotion/<name>', props)` with `"component": "Comp.tsx"` in meta | `@remotion/player`, seeked by frame |
| Plain function | `cx.fromFn(2.4, (t) => { … })` | |
| Several | `cx.all(a, b, c)` | one clip |

Other helpers: `cx.esc(text)` (always escape props), `cx.spans(text, 'cs-w')` (one span per word; `'chars'` as third argument for letters), `cx.prog(t, start, duration, 'out' | 'expo' | 'inOut' | 'in' | 'lin')` → 0..1, `cx.clamp`, `cx.stage` (`'deck'` or `'site'`), `cx.shape` (`'wide'` or `'tall'`), `cx.w`, `cx.h` (frame size in layout px), `cx.meta.data['file']` (files listed in `meta.data`), `cx.face(mediaEl, [x, y, w, h])` (declare a face in a picture so `check` can guard it; `cx.face(mediaEl, box, 'body')` declares the body, guarded the same way but not used for the eye check), `cx.reduced` (true when the viewer asked for reduced motion: show the finished screen), `cx.capturing` (true while `record` or `check` is taking frames).

## One block, three frames
The same block must look right in: a 1920×1080 slide (`data-stage="deck"`), a desktop web screen (`data-stage="site" data-shape="wide"`, for example 1440×900) and a phone screen (`data-shape="tall"`, 390×844).

- **Type sizes only from tokens**: `--hero`, `--title`, `--lead`, `--body`, `--label` (use `calc(var(--title) * 0.8)` for in-between sizes, never a px font size). Ready classes: `cs-kicker`, `cs-hero`, `cs-title`, `cs-lead`, `cs-text`, `cs-label`, `cs-rule`, `cs-card`, `cs-num`, `cs-serif`, `cs-btn`, `cs-shot`, `cs-media`.
- **Spacing** from `--pad`, `--gap`, `--radius`, or `em` / `%` / `cqw` / `cqh` (the frame is a size container). `cs-pad` is the standard padded, vertically centred column; `cs-pad cs-center` centres it. On a web page the top `--top` px are under the site header: `cs-pad` already leaves that room.
- **Tall layout**: add rules under `.cs-frame[data-shape="tall"] .b-…` (stack columns, fewer items per row). Do not hide content on the phone.
- **Fill the frame.** On the slide the content should use most of the width or height. A small cluster in a corner of an empty slide is a failed design.
- **Colours only from tokens**: `--ink` (thin white), `--ivory`, `--dim`, `--gold`, `--gold2`, `--line`, `--card`, `--bg`, and the content colours `--c1`, `--c2`, `--c3` (one colour = one meaning). No neon, no glow, no particles, no emoji, no mascots.
- **Scope CSS** with `.b-<source>-<name>`; keyframe names start with `b-`.
- Decoration that repeats words (a ghost copy, a marquee) gets `aria-hidden="true" data-deco`.
- People: never put anything over a face. If the block shows a photo or video of a person, take a `face` prop, call `cx.face(mediaEl, p.face)` and lay the text out beside the picture.

## Steps and scroll
- Slide clicks: give step times (GSAP labels `step1`…, or `steps: [seconds]`). The clip plays to the first step on enter, then one step per click. Without steps it plays through once.
- Web: default `play` (plays once when the screen is 45 % visible). If the block reads well when scrubbed by the scroll, set `"site": {"mode": "scrub", "len": 2}` in meta (`len` = extra screens it stays pinned).

## meta.json
```json
{
  "kind": "gsap/split-title",
  "title": "Split title",
  "description": "One sentence: what moves, and with which library feature.",
  "source": {"type": "gsap", "package": "gsap", "version": "3.15.0", "uses": ["SplitText"]},
  "license": "GSAP standard license",
  "use": "title",
  "lead": "type",
  "family": "split-rise",
  "props": {"title": "required, 2-7 words", "kicker": "small caps above, 1-4 words"},
  "example": {"kicker": "Visual Vibe Coding", "title": "Motion, beyond video"},
  "dur": 1.9
}
```
- `use`: one of title, statement, person, number, steps, list, compare, quote, media, diagram, chart, timeline, ident, cta, chapter, background.
- `lead`: `picture` when a picture (video, photo, device, chart, diagram) carries the screen, `type` when the words do. Required. The check advises when three `type` screens come in a row.
- `family`: the name of the design. `check` warns when one family appears more than twice in a story.
- `props`: start a description with `required` for the ones that must be there.
- `example`: real props. The catalog page, the gallery and the tests render it. Only true statements, no invented numbers.
- `license`: MIT for kit, motion, anime, css, lottie blocks; `GSAP standard license` for gsap; add `+ Remotion License` for remotion blocks.

## Try it
```bash
npx connect-ai-slides-web gallery --blocks ./my-blocks --only mine/my-block --out try     # your block from its example, in the three frames
```
It prints page errors and writes `try/out/sheet_deck.jpg`, `sheet_site.jpg`, `sheet_phone.jpg`. Look at all three. Then use the block in a story (`"blocks": ["./my-blocks"]`) and run `check`: it measures your block like any other.

In a clone of the repository there is also a developer tool that shows the half-way state:
```bash
node tools/dev-block.mjs gsap/split-title          # one block, the three frames, at 50 % and 100 %
node tools/dev-block.mjs gsap/                      # a whole source
```

## Two cautions

- **Class names.** The deck engine (reveal.js) styles some short class names of its own (`.roll`, `.fragment`, `.present`, `.past`, `.future`, `.stack`, `.slides`, `.controls`, `.progress`). Prefix every class in your block (`.b-<source>-<name> .x`, or the `cs-` ready classes) so the deck does not restyle it.
- **anime.js first state.** An anime.js timeline does not apply its "from" values until it is first seeked. `cx.fromAnime(tl)` seeks it to the end and back once, so `t = 0` really is the empty state; keep using the adapter rather than calling `tl.seek` yourself.
