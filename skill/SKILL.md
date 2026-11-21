---
name: connect-ai-slides-web
description: Make a presentation deck and a one-page website from one story, with code-made motion graphics (GSAP, Motion, anime.js, Lottie, CSS, HyperFrames, Remotion blocks from a catalog), then measure the real screen and fix what the check reports. Use when the user says "make a deck", "make slides", "make a presentation", "make a landing page", "make a one-page website", "turn this into slides and a site", "발표 자료 만들어 줘", "슬라이드 만들어 줘", "PPT 만들어 줘", "웹사이트 한 장 만들어 줘", "랜딩 페이지 만들어 줘". Output is two static folders that open by double click, plus PDF, PPTX and mp4 on request.
---

# connect-ai-slides-web

You turn what the user tells you into `story.json`. The kit builds `out/deck/index.html` (a reveal.js deck) and `out/site/index.html` (a one-page website) from it, the same scenes on both, and `check` measures them in a real browser at three sizes: slide 1920x1080, web 1440x900, phone 390x844.

The kit is at the path in `.connect-ai-slides-web.json` next to this file (`kit`). Run its CLI with `node <kit>/bin/cli.mjs` (or `npx connect-ai-slides-web` inside a project that installed it).

## Rules you must keep
- **Only what the user gave you.** Every sentence, name and number on screen comes from the user or from material they pointed at. Never invent numbers, results, quotes, dates or claims. If something is missing, ask or leave it out. Mark anything you are unsure of in your report.
- **One scene, one message.** Up to three key items per scene, up to about 28 words on a slide. Everything else the speaker would say goes into `"notes"`, not on screen. A long text becomes more scenes, not smaller type.
- **Only catalog kinds.** Run `catalog` and use the `kind` names it prints. Do not invent a kind or a prop, and do not put HTML into text fields.
- **One design at most twice.** Each block has a `family`; `check` warns from the third use. Mix sources.
- **Faces.** Nothing goes on a face. For a picture or video of a person, look at the picture yourself and write `"face": [x, y, w, h]` (0 to 1 of the picture: left, top, width, height). Never guess a box. Add `"body": [x, y, w, h]` too on blocks that list `body` in their props, so the words stay off the shoulders as well. If the user has run `connect-ai-video-motion analyze`, read the box from its `work/face.json`. Never edit the person's pixels.
- **Eyes open, looking at the camera.** The poster and the first frame of a person's video are what the audience sees first. Pick a poster frame and a clip start where the eyes are open and look at the camera. On a Mac the check measures this and gives an ADVICE line for closed, half-closed or downcast eyes: choose another frame, do not ignore it.
- **Pictures lead.** Prefer blocks marked `lead: picture` in `catalog` (a video, a photo, a device mockup, a chart or a diagram fills the screen). Do not put three text-only screens in a row: the check advises against it.
- **Only true words.** Titles, quotes and numbers come from the user. Do not invent a quote, a statistic, a year or a testimonial. A quote is the person's own sentence, word for word.
- **Everything is local.** No CDN, no remote fonts, no hotlinked pictures or videos, no emoji as graphics. Media files go into the project's `media/` folder and are referenced by relative path.
- **Edit only `story.json` (and files in `media/`).** Never edit `out/`, `assets/vendor/` or the kit's `catalog/`: they are rebuilt. A new design is a new block in the user's own folder (see `BLOCKS.md` next to this file).
- Videos need `"poster"` (a still); pictures need `"alt"`.

## Steps (always in this order)
1. `node <kit>/bin/cli.mjs catalog` and read it: kind, use (title, statement, person, number, steps, list, compare, quote, media, diagram, chart, timeline, ident, cta, chapter, background), props (`*` = required), lead (`picture` or `type`), and whether it plays once or follows the scroll on the website.
2. Write an outline: one line per scene (message, kind, what goes in notes) plus the look (`connect` dark gold, `night`, `paper` light). **Show the outline to the user and wait for their OK.**
3. `node <kit>/bin/cli.mjs new <project>` if there is no project, put media into `<project>/media/`, then write `<project>/story.json`.
4. `node <kit>/bin/cli.mjs build <project>`.
5. `node <kit>/bin/cli.mjs check <project>`. Read `out/report.md`. Fix every ERROR the way its sentence says (shorten, split the scene, change the block, fix a path, move the text off the face), build and check again until it says PASS. If the same ERROR is still there after three tries, stop and tell the user what it is. ADVICE lines are judgment calls: follow them unless the user wants otherwise.
6. Look at the screens yourself: `node <kit>/bin/cli.mjs record <project> --sheet-only` writes `out/sheet_deck.jpg`, `out/sheet_site.jpg`, `out/sheet_phone.jpg` (one still per scene; without ffmpeg the stills are in `out/stills/`). Open the three sheets. Fix what looks wrong even if the check passed (an empty-looking slide, an awkward line break).
7. Only if asked: `record` (mp4 of the deck playing, the site scrolling, the phone), `export <project> --pdf --pptx`. Say honestly what they are: PDF and PPTX hold the finished screen of each slide as a picture plus the speaker notes; the motion lives in the HTML deck.
8. Report to the user in two lists:
   - **Checked by the tool**: the PASS line, how many scenes, which blocks, the files (`out/deck/index.html`, `out/site/index.html`, anything exported).
   - **For you to look at**: the room (projector, back row), a real phone (`serve <project>` prints an address for the same Wi-Fi), anything you were unsure of, any ADVICE you did not follow and why. Say "exported" or "recorded" only for files you really made.

## story.json
```json
{
  "title": "My talk",
  "description": "One sentence for search and link previews.",
  "lang": "en",
  "look": "connect",
  "colors": ["#D6892A", "#7FB2D0", "#D07A63"],
  "brand": {"name": "MY NAME", "links": [{"label": "Contact", "href": "mailto:me@example.com"}]},
  "scenes": [
    {"id": "open", "kind": "kit/film-hero", "src": "media/me.mp4", "poster": "media/me.jpg", "face": [0.38, 0.14, 0.22, 0.45], "body": [0.24, 0.1, 0.5, 0.9], "kicker": "MY NAME", "title": "What this talk is about", "notes": "What I will say here."},
    {"id": "why", "kind": "motion/blur-words", "text": "One sentence the room should remember.", "gold": "remember", "notes": "The story behind it."},
    {"id": "how", "kind": "anime/line-steps", "title": "Three steps", "steps": [{"title": "First", "text": "One line."}, {"title": "Then", "text": "One line."}, {"title": "Finally", "text": "One line."}]}
  ]
}
```
- One scene = one slide in the deck and one screen on the website. `"only": "deck"` or `"only": "site"` keeps a scene on one stage.
- `"notes"`: speaker notes (press S in the deck; they also go into the PPTX).
- `"site": {"mode": "scrub", "len": 2}` pins a scene and lets the scroll drive it; `"mode": "play"` plays it once when seen. Each block has a sensible default.
- `"hold"`: seconds a scene stays after its animation in a recording (default 1.1).
- `"colors"`: up to three content colours, one meaning each. The gold and the ink come from the look.
- `"blocks": ["./my-blocks"]`: folders with the user's own blocks.
- The user's own material: a Lottie file `{"kind": "lottie/player", "src": "media/anim.json"}`, a HyperFrames block `{"kind": "hyperframes/player", "src": "media/block.html"}`, a Remotion component `{"kind": "remotion/player", "component": "./My.tsx", "durationInFrames": 90}`, a clip made with connect-ai-video-motion as a video `src`. Check `catalog` for the exact props.

## When something fails
- `doctor` says what is missing (Chrome for check, record and export; ffmpeg only for record and sheets; Remotion only for `remotion/*` blocks).
- "unknown kind": you made a name up. Use `catalog`.
- A file "was not found": paths are relative to the folder of `story.json`.
- The website looks different on the user's phone: ask them to open the address `serve` prints and tell you what they see. The check emulates a phone, it is not their phone.
