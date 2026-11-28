<p align="center"><img src="docs/brand/banner.jpg" width="100%" alt="AI Mentor Jay, connect-ai-slides-web by CONNECT AI LAB"></p>

<p align="center">
  <b>CONNECT AI LAB</b> · AI education for everyone · 모두를 위한 AI 교육<br>
  <a href="https://www.youtube.com/@CONNECT-AI-LAB">YouTube: CONNECT AI LAB</a> · <a href="https://www.aicitybuilders.com/vibecoding">Course: Visual Vibe Coding</a> · <a href="README.ko.md">한국어</a>
</p>

# connect-ai-slides-web

**An AI presentation employee for solo founders and creators. Give it a few lines, and you get a deck that moves and a real PowerPoint file. Your old PPT works too.**

[![I gave it a deck I made in 2017, and the same words came back as a deck that moves](docs/showcase/v04/hero.webp)](docs/showcase/v04/hero.mp4)

```bash
npx github:wonseokjung/connect-ai-slides-web install-skill
```

Paste that line into your agent's chat (Claude Code, Codex, Antigravity, Cursor) and ask it to install it. Then open a new chat and say: "Make a deck about my shop." Got an old PPT? Say: "Remake this PPT so it moves."

You need [Node.js](https://nodejs.org) 18.18 or newer, Chrome and a coding agent. With ffmpeg, the motion goes into PowerPoint as video clips. Use the agent you already have; this tool itself needs no paid API key.

## 0.6: every slide leads with a picture or motion

0.5 was clean, but it looked like text. That's not visual vibe coding. So in 0.6 a few lines of markdown give you a picture or motion first on every slide.

[![Four decks made with 0.6, recorded as they play](docs/showcase/v06/hero.webp)](docs/showcase/v06/hero.mp4)

- A 3D model turns slowly on the cover. Just drop in one `.glb` file.
- A table of numbers rises as a 3D bar chart, and the values count up with the bars.
- Gold light moves behind the slide. It's drawn with a shader.
- Formulas, decision boundaries and neural networks move as pictures. Signals flow through the network.
- Your clips go full frame or inside a device. No words go over a face.
- Slides change like a film cut. Each effect is used once per deck.

Three words-only slides in a row, or more than half of the deck, is an error in the check. The agent picks a picture block first. The 3D comes from my own connect-ai-three kit.

<img src="docs/showcase/v06/perceptron_vs.jpg" width="100%" alt="Perceptron deck, 0.5 and 0.6">

Left is 0.5, right is 0.6. Same script.

<img src="docs/showcase/v06/course_vs.jpg" width="100%" alt="Course intro deck, 0.5 and 0.6">

The course intro is a sample in English.

## 0.5: a big design update

Tables become tables or charts, and formulas and a neural network come out as drawings. Every slide puts the title, the footer and the motion in the same place, so a deck reads as one piece. Black and gold by default, with light looks too (white, ivory, paper).

<img src="docs/showcase/v05/perceptron_before_after.jpg" width="100%" alt="The 2017 original, 0.4 and 0.5 Perceptron decks">

From the top: the 2017 original, 0.4, 0.5. Write a table in the markdown and you get a chart or a table, `$$` gives a formula, `A -> B` gives a flow.

<img src="docs/showcase/v05/business_decks.jpg" width="100%" alt="A cafe deck and a course intro deck">

The cafe and the course intro use sample content. The cafe numbers are examples. The photos are renders of CC0 3D models.

Before the agent shows you anything, it checks itself: an empty slide, a crowded one, words on top of words, the same design again and again. It fixes those first.

## What it does

Every picture here is from a real run.

<table>
<tr>
<td width="50%" valign="top"><img src="docs/showcase/v04/remake.jpg" width="100%" alt="Old PPT and new PPT"><br><b>Remake an old PPT</b> · v0.4<br><sub>Give it a .pptx and it pulls out the words, pictures and speaker notes, then rebuilds the deck with one message per slide. The gold dashed lines on the right are the text boxes inside the new file.</sub></td>
<td width="50%" valign="top"><img src="docs/pptx/hero.webp" width="100%" alt="Editable text boxes"><br><b>A PPT you can edit word by word</b><br><sub>All the text is in real text boxes. Each slide's motion goes in as a video clip, set to start when the slide opens, and the words appear when they do in the browser deck.</sub></td>
</tr>
<tr>
<td width="50%" valign="top"><img src="docs/showcase/v04/import.jpg" width="100%" alt="Import report"><br><b>What came in, what stayed behind</b> · v0.4<br><sub>Slide by slide. Diagrams drawn with shapes, charts, equations and hidden slides stay in the old file, and it tells you so.</sub></td>
<td width="50%" valign="top"><img src="docs/showcase/v04/phone.jpg" width="100%" alt="Phone website"><br><b>The same talk as a website</b><br><sub>The deck and a one-page website come from the same text. On a phone it moves as you scroll.</sub></td>
</tr>
<tr>
<td width="50%" valign="top"><img src="docs/showcase/v04/check.jpg" width="100%" alt="Check report"><br><b>It checks its own work</b><br><sub>It opens the deck at real screen sizes and measures type size, words per slide, contrast, and checks for cut-off text. It also checks that the words are all there with motion turned off, and how much a phone has to load first.</sub></td>
<td width="50%" valign="top"><img src="docs/showcase/v04/marp.jpg" width="100%" alt="Marp markdown"><br><b>Marp and Slidev files, as they are</b> · v0.4<br><sub>Already wrote slides in markdown with another tool? Drop the file in. Comments become speaker notes.</sub></td>
</tr>
</table>

## I tried it on my 2017 deck

This is a Perceptron deck I made in 2017 and put on GitHub. I gave it all 14 slides. The titles, sentences and table contents came in. The neural network drawn with shapes, and the small labels on it (x1, w2), stayed in the old file, and the import told me so, slide by slide. In 0.4 the agent cut it down to 9 slides using only my words; in 0.5 the same words became 12 slides, with the truth tables as tables, the formulas with their braces and the network as a drawing. Nothing I didn't say went in.

## Inside the PowerPoint file

| | |
|---|---|
| Words | Real text boxes. Click and edit |
| Motion | One video clip per slide, set to start when the slide opens (`--click`: start on a click). Without ffmpeg you get a still picture instead |
| Notes | Speaker notes on every slide |
| Slide change | A soft fade |
| Google Slides | `--google` adds a copy with still pictures instead of clips |

I checked what's inside the files with `inspect` and looked at them in Quick Look on a Mac. I haven't played them in the PowerPoint app yet, so open yours once on the computer you will present from. Try them: [Korean deck.pptx](docs/demo/ko/deck.pptx) · [English deck.pptx](docs/demo/en/deck.pptx). All 114 blocks are on the [catalog page](docs/index.html).

<!-- team:start -->
## CONNECT AI LAB's 14 AI employees · ELDO Browser

I build AI employees in the open, one by one. Grab the one you need, or browse and hire all 14 with [ELDO Browser](https://eldobrowser.com) and [`wonseokjung/eldo`](https://github.com/wonseokjung/eldo) (`npx github:wonseokjung/eldo`).

<table>
<tr><td width="34%" valign="top"><b>ELDO Browser · Open-Source Hub</b><br><a href="https://eldobrowser.com"><code>eldobrowser.com</code></a> · <a href="https://github.com/wonseokjung/eldo"><code>eldo</code></a></td><td valign="top">The free Browser for AI Agents (Apple Notarized macOS &amp; Windows). Sign in once; AI employees work in isolated gold spaces and hand off auth and payments to you.</td></tr>
<tr><td width="34%" valign="top"><b>AI autonomous company HQ</b><br><a href="https://github.com/wonseokjung/connect-ai-autonomous-company"><code>connect-ai-autonomous-company</code></a></td><td valign="top">Local AI company OS connecting your life, AI employees, automations, and ELDO browser.</td></tr>
<tr><td width="34%" valign="top"><b>AI developer</b><br><a href="https://github.com/wonseokjung/connect-ai-developer"><code>connect-ai-developer</code></a></td><td valign="top">One sentence in, a service with sign-up, database, test payments, GitHub and deploy plans out.</td></tr>
<tr><td width="34%" valign="top"><b>AI accountant</b><br><a href="https://github.com/wonseokjung/connect-ai-accountant"><code>connect-ai-accountant</code></a></td><td valign="top">Receipts, 홈택스, card and bank in. A monthly sheet and a package for your tax accountant out.</td></tr>
<tr><td width="34%" valign="top"><b>AI marketing team</b><br><a href="https://github.com/wonseokjung/connect-ai-marketer"><code>connect-ai-marketer</code></a></td><td valign="top">8 AI teammates handling replies, social listening and YouTube uploads 24/7 in your browser.</td></tr>
<tr><td width="34%" valign="top"><b>AI writer</b><br><a href="https://github.com/wonseokjung/connect-ai-writer"><code>connect-ai-writer</code></a></td><td valign="top">Give it one video or topic; it researches and writes platform posts in your voice, with pictures.</td></tr>
<tr><td width="34%" valign="top"><b>AI business analyst</b><br><a href="https://github.com/wonseokjung/reversebusiness"><code>reversebusiness</code></a></td><td valign="top">Give it a website URL, and it breaks down how that business makes money and designs your version.</td></tr>
<tr><td width="34%" valign="top"><b>AI image director</b><br><a href="https://github.com/wonseokjung/connect-ai-image"><code>connect-ai-image</code></a></td><td valign="top">Free-first local ComfyUI + FLUX or logged-in browser image series for every platform.</td></tr>
<tr><td width="34%" valign="top"><b>AI presentation slides</b> · <b>this one</b><br><a href="https://github.com/wonseokjung/connect-ai-slides-web"><code>connect-ai-slides-web</code></a></td><td valign="top">Turn a few lines or an old PPT into a motion-first 3D web deck and a real PowerPoint (.pptx) file.</td></tr>
<tr><td width="34%" valign="top"><b>AI 3D web studio</b><br><a href="https://github.com/wonseokjung/connect-ai-three"><code>connect-ai-three</code></a></td><td valign="top">Say it, get an interactive Three.js 3D web page and a frame-exact film from one spec.</td></tr>
<tr><td width="34%" valign="top"><b>AI motion designer</b><br><a href="https://github.com/wonseokjung/connect-ai-motion"><code>connect-ai-motion</code></a></td><td valign="top">Give it a few lines of text, and it makes a 16:9 and 9:16 motion graphics video. No footage needed.</td></tr>
<tr><td width="34%" valign="top"><b>AI video editor</b><br><a href="https://github.com/wonseokjung/connect-ai-video-motion"><code>connect-ai-video-motion</code></a></td><td valign="top">Give it your video, and it puts 80 body-aware motion graphics in the empty space around you.</td></tr>
<tr><td width="34%" valign="top"><b>AI XR developer</b><br><a href="https://github.com/wonseokjung/connect-ai-xr"><code>connect-ai-xr</code></a></td><td valign="top">Give it one sentence, and it makes a WebXR app for Meta Quest passthrough AR, VR, and desktop.</td></tr>
<tr><td width="34%" valign="top"><b>AI product photographer</b><br><a href="https://github.com/wonseokjung/connect-ai-product-photo"><code>connect-ai-product-photo</code></a></td><td valign="top">Drop phone product photos in a folder and get platform-ready studio shots keeping real sharp labels.</td></tr>
<tr><td width="34%" valign="top"><b>AI global localizer</b><br><a href="https://github.com/wonseokjung/connect-ai-localizer"><code>connect-ai-localizer</code></a></td><td valign="top">Rewrite your Korean post or subtitles natively for English, Japanese and Spanish in your own voice.</td></tr>
</table>
<!-- team:end -->

---

Want a quick look before you use an agent? Run `npx github:wonseokjung/connect-ai-slides-web ppt`. It writes a sample script, my-talk.md. Then run `npx github:wonseokjung/connect-ai-slides-web ppt my-talk.md` and you get the PowerPoint file. Every command and option, and what it does not do, is in [docs/guide.md](docs/guide.md).

MIT license. GSAP is under GreenSock's [free standard license](https://gsap.com/standard-license), and Remotion is free for individuals, companies of up to 3 people and non-profits; larger companies need a Remotion company license. Everything this kit uses is listed in [NOTICE.md](NOTICE.md).

I teach how to build tools like this with your own AI agent in [Visual Vibe Coding](https://www.aicitybuilders.com/vibecoding).

<table><tr>
<td width="140" valign="top"><img src="docs/brand/jay.jpg" width="128" alt="AI Mentor Jay"></td>
<td valign="top"><b>Made by AI Mentor Jay</b> · CONNECT AI LAB<br>
I'll keep releasing AI employees as open source, one by one, and show how I build them on YouTube and in my course.<br>
<a href="https://www.youtube.com/@CONNECT-AI-LAB">YouTube</a> · <a href="https://www.aicitybuilders.com/vibecoding">Visual Vibe Coding</a> · <a href="https://github.com/wonseokjung">More open source</a></td>
</tr></table>
