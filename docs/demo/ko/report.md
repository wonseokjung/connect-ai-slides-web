# connect-ai-slides-web check

**PASS**: 0 errors, 8 pieces of advice.

## Advice

- ADVICE scene 1 "ident" (kit/ident): the text is fully readable only after 2.8 s. Over 2.8 s the audience waits: use a shorter block, or one with click steps.
- ADVICE scene 2 "hero" (kit/film-hero, deck): "CONNECT AI LAB" is 23.8 px on a 1920x1080 slide (and 1 more under 28 px). Fine for a label; body text should be 28 px or more.
- ADVICE scene 6 "purpose" (kit/quote-film, deck): 37 words on one slide. Under 28 is easier to take in while you talk.
- ADVICE scene 7 "course" (gsap/kinetic-type, deck): "영상" sits in the outer 3 % of the slide. Some projectors crop the edge.
- ADVICE scene 8 "formats" (kit/quote-film, deck): 32 words on one slide. Under 28 is easier to take in while you talk.
- ADVICE scene 9 "map" (gsap/lesson-map, deck): 41 words on one slide. Under 28 is easier to take in while you talk.
- ADVICE scene 10 "tools" (gsap/pin-showcase, deck): "Open source by CONNECT AI LAB" is 24.9 px on a 1920x1080 slide (and 1 more under 28 px). Fine for a label; body text should be 28 px or more.
- ADVICE scene 12 "end" (kit/end-film, deck): 29 words on one slide. Under 28 is easier to take in while you talk.

## Facts

- 12 scenes from 3 sources: kit, css, gsap
- deck 1920x1080: 12 scenes, 56.1 s when it plays by itself
- web 1440x900: 11 scenes, 58.3 s when it plays by itself
- phone 390x844: 11 scenes, 58.4 s when it plays by itself
- eye check: 16 pictures of people measured (poster, first frame, finished screen), 16 with open eyes on the camera
- out/deck is 10.9 MB
- out/site is 10.6 MB
- browser: Google Chrome

## Scenes

| # | id | block | motion | steps | words (deck) | smallest type deck / web / phone | lowest contrast |
|---|---|---|---|---|---|---|---|
| 1 | ident | kit/ident | 2.9 s | 0 | 17 | 29 / - / - | 10.7 |
| 2 | hero | kit/film-hero | 2.5 s | 0 | 17 | 23.8 / 14.1 / 13.7 | 3.4 |
| 3 | mission | css/ken-burns | 6.0 s | 0 | 12 | 29 / 14.1 / 13.7 | 10.7 |
| 4 | mentor | kit/nametag | 2.3 s | 0 | 16 | 29 / 14.1 / 13.7 | 8.5 |
| 5 | yahakdang | kit/split-person | 3.1 s | 2 | 24 | 29 / 14.1 / 13.7 | 10.7 |
| 6 | purpose | kit/quote-film | 2.8 s | 0 | 37 | 29 / 14.1 / 13.7 | 8.5 |
| 7 | course | gsap/kinetic-type | 3.0 s | 0 | 10 | 29 / 14.1 / 13.7 | 10.7 |
| 8 | formats | kit/quote-film | 2.8 s | 0 | 32 | 29 / 14.1 / 13.7 | 8.5 |
| 9 | map | gsap/lesson-map | 5.8 s | 2 | 41 | 29 / 14.1 / 12.6 | 8.5 |
| 10 | tools | gsap/pin-showcase | 7.6 s | 4 | 16 | 24.9 / 14.1 / 13.7 | 8.5 |
| 11 | site | kit/device-laptop | 1.5 s | 0 | 11 | 29 / 14.1 / 13.7 | 10.7 |
| 12 | end | kit/end-film | 2.6 s | 0 | 29 | 29 / 14.1 / 13.7 | 10.3 |

## What this check cannot see

- The real room: projector brightness, screen size, the back row.
- A real phone: open the site on yours (`npx connect-ai-slides-web serve <project>` prints an address for the same Wi-Fi).
- Whether the words are true. Only you know that.
