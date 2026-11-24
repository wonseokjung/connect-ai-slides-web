---
name: connect-ai-slides-web
description: The presentation employee. Make a real PowerPoint file (.pptx) from a few lines of text or markdown, with code-made motion graphics from a catalog of 67 blocks (GSAP, Motion, anime.js, Lottie, CSS, HyperFrames, Remotion). Every word in the .pptx is an editable text box, each slide's motion plays as a video clip that starts by itself, the words fade in when they appear, and speaker notes come along. The same story is also a deck in the browser and a one-page website, and a check measures the real screen. Use when the user says "make a PPT", "make a PowerPoint", "make slides", "make a deck", "make a presentation", "make a Keynote", "turn my notes into slides", "make a landing page", "make a one-page website", "PPT 만들어 줘", "발표자료 만들어 줘", "슬라이드 만들어 줘", "파워포인트로 만들어 줘", "키노트로", "웹사이트 한 장 만들어 줘", "랜딩 페이지 만들어 줘".
---

# connect-ai-slides-web

You turn what the user tells you into a presentation. The main thing people want is a PowerPoint file: `out/deck.pptx` (opens in PowerPoint and Keynote; words are editable text boxes, the motion of each slide is a clip behind the words, speaker notes included). The same `story.json` also builds `out/deck/index.html` (a reveal.js deck with every motion) and `out/site/index.html` (a one-page website), and `check` measures them in a real browser at three sizes: slide 1920x1080, web 1440x900, phone 390x844.
<!-- connect-ai-slides-web:runtime -->
Run the kit's CLI with `node <kit>/bin/cli.mjs`, where `<kit>` is the `kit` folder written in `.connect-ai-slides-web.json` next to this file. If that folder is gone, use `npx -y connect-ai-slides-web` instead of `node <kit>/bin/cli.mjs`.
<!-- /connect-ai-slides-web:runtime -->

## The quick way (a beginner, a few lines, "just make me a PPT")
1. Write the user's words into `talk.md`: `# Title` (the line under it is the subtitle), then `## Heading` for each slide. Under a heading: `- items` (a list), `1. steps`, `> a quote` (last line `> - who`), `**42%** what it means` (a number: only the user's real number), `![what it shows](photo.jpg)` (their picture), one sentence (a statement), nothing (a chapter slide), `- [Label](https://...)` links on the last slide (buttons), `Note: ...` for speaker notes.
2. `node <kit>/bin/cli.mjs ppt talk.md` (add `--google` for a Google Slides copy, `--pdf` for a PDF). It prints which block each slide got and writes `talk-deck/out/deck.pptx`.
3. `node <kit>/bin/cli.mjs inspect talk-deck/out/deck.pptx` lists, slide by slide, the text boxes, clips and notes. Tell the user what is in the file from this list, not from memory.
4. To change one slide's design, edit `talk-deck/story.json` (pick another `kind` from `catalog`), then `export talk-deck --pptx`.

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
7. `node <kit>/bin/cli.mjs export <project> --pptx` (add `--google`, `--pdf`). Then `inspect out/deck.pptx`. Say honestly what the file is:
   - words: editable text boxes at the place they have on the slide (words drawn inside a video, a canvas or an embedded player stay part of that picture: the export says which slides);
   - motion: each slide's motion, without its words, as an mp4 clip behind the words, set to start by itself; the text boxes fade in at the moment the words appear in the HTML deck. The words' own letter effects (scramble, letter by letter) are a simple fade in PowerPoint;
   - `--click`: clips start on a click; `--still-words`: no fades; `--no-video`: still pictures instead of clips; `--pptx-pictures`: the old way, one finished picture per slide;
   - `deck_google.pptx` (with `--google`): the same text boxes on still pictures, because Google Slides does not play videos inside a .pptx;
   - fonts: the export lists them. On a computer without them, PowerPoint or Keynote shows a similar font. `--font "Name"` sets one font for every box.
   `record` (mp4 of the deck playing, the site scrolling, the phone) only if asked.
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
