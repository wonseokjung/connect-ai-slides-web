// A few lines of markdown (or plain text) -> story.json. The simple door for a beginner: write your talk the way you
// would write notes, and every part becomes one slide with a fitting motion block. No design is used twice when another
// one fits. Your words go on the slides as you wrote them: nothing is cut, nothing is added. MIT, CONNECT AI LAB.
//
//   # Title of the talk          first slide (the line under it is the subtitle)
//   ## A heading                 a new slide; what is under it picks the block:
//   - point / - point            a list            1. step / 2. step   steps
//   > words someone said          a quote (a last line "- name" says who)
//   **42%** what it means         a number
//   ![what it shows](photo.jpg)  your picture or clip in a frame
//   one sentence                  a statement
//   (nothing under the heading)  a chapter slide
//   [Label](https://...)          links: on the last slide they become buttons
//   Note: ...                     speaker notes (without it, the slide's own words are the notes)
import fs from 'node:fs';
import path from 'node:path';

const HANGUL = /[ㄱ-ㆎ가-힣]/;
const wordsOf = (t) => String(t).trim().split(/\s+/).filter(Boolean);
const strip = (t) => String(t).replace(/\*\*|__|`/g, '').trim();

export function parseTalk(text, {name = 'talk'} = {}) {
  const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
  const isMd = lines.some((l) => /^#{1,2}\s/.test(l));
  const talk = {title: '', sub: '', kicker: '', lang: HANGUL.test(text) ? 'ko' : 'en', slides: []};
  if (!isMd) {
    // plain text: the first line is the title, every other line one slide; lines starting with - are one list
    const rows = lines.map((l) => l.trim()).filter(Boolean);
    talk.title = strip(rows.shift() || name);
    let cur = null;
    for (const r of rows) {
      if (/^[-*•]\s+/.test(r)) { if (!cur || !cur.bullets.length) { cur = blank(''); talk.slides.push(cur); } cur.bullets.push(strip(r.replace(/^[-*•]\s+/, ''))); continue; }
      cur = blank(''); cur.paras.push(strip(r)); talk.slides.push(cur);
      cur = null;
    }
    return talk;
  }
  let cur = null, inQuote = false;
  for (const raw of lines) {
    const l = raw.trim();
    if (/^---+$/.test(l)) continue;
    let m;
    if ((m = /^kicker:\s*(.+)$/i.exec(l)) && !cur) { talk.kicker = strip(m[1]); continue; }
    if ((m = /^#\s+(.+)$/.exec(l))) { talk.title = strip(m[1]); cur = null; continue; }
    if ((m = /^##+\s+(.+)$/.exec(l))) { cur = blank(strip(m[1])); talk.slides.push(cur); inQuote = false; continue; }
    if (!l) { inQuote = false; continue; }
    if ((m = /^(note|notes|노트|메모)\s*[:：]\s*(.*)$/i.exec(l))) { (cur || talk).notes = ((cur || talk).notes || []).concat(m[2]); continue; }
    if (!cur) { if (!talk.sub) talk.sub = strip(l); else talk.sub += ' ' + strip(l); continue; }
    if ((m = /^!\[([^\]]*)\]\(([^)\s]+)\)/.exec(l))) { if (busy(cur)) { cur = blank(''); talk.slides.push(cur); } cur.images.push({alt: m[1], src: m[2]}); continue; }
    if ((m = /^>\s?(.*)$/.exec(l))) {
      if (!inQuote && busy(cur)) { cur = blank(''); talk.slides.push(cur); }
      const t = m[1].trim();
      if (/^[-–]\s*\S/.test(t) && cur.quote.length) cur.by = strip(t.replace(/^[-–]\s*/, ''));
      else if (t) cur.quote.push(strip(t));
      inQuote = true; continue;
    }
    if ((m = /^\d+[.)]\s+(.+)$/.exec(l))) { cur.steps.push(strip(m[1])); continue; }
    if ((m = /^[-*•]\s+(.+)$/.exec(l))) {
      const lk = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(m[1].trim());
      if (lk) cur.links.push({label: lk[1], href: lk[2]}); else cur.bullets.push(strip(m[1]));
      continue;
    }
    const links = [...l.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)];
    if (links.length && l.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '').replace(/[\s,·|]/g, '') === '') { for (const k of links) cur.links.push({label: k[1], href: k[2]}); continue; }
    if ((m = /^\*\*([^*]{1,12})\*\*\s*[:：|-]?\s*(.*)$/.exec(l)) && /\d/.test(m[1]) && !cur.number) { cur.number = {value: m[1].trim(), text: strip(m[2])}; continue; }
    cur.paras.push(strip(l.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '$1')));
  }
  return talk;
}
const busy = (c) => c.paras.length || c.bullets.length || c.steps.length || c.quote.length || c.images.length || c.number;
function blank(heading) { return {heading, paras: [], bullets: [], steps: [], quote: [], by: '', images: [], links: [], number: null, notes: []}; }

const pick = (used, list) => list.find((k) => !used.has(k)) || list[0];
const pair = (t) => { const m = /^([^:：]{1,40})[:：]\s*(.+)$/.exec(t); return m ? {title: m[1].trim(), text: m[2].trim()} : null; };

// talk -> story.json scenes
export function talkToStory(talk, {look = 'connect', brand = ''} = {}) {
  const used = new Set(), scenes = [];
  const add = (s, notes) => { used.add(s.kind); s.id = 's' + (scenes.length + 1); if (notes) s.notes = notes; scenes.push(s); };
  const say = (sl) => (sl.notes.length ? sl.notes.join(' ') : [sl.heading, ...sl.paras, ...sl.bullets, ...sl.steps, ...sl.quote].filter(Boolean).join(' '));
  // opening
  const tw = wordsOf(talk.title).length;
  const titleKind = pick(used, tw <= 3 ? ['anime/letter-wave', 'gsap/split-title'] : tw <= 6 ? ['lottie/stroke-title', 'gsap/split-title'] : ['gsap/split-title']);
  add(titleKind === 'anime/letter-wave' ? {kind: titleKind, word: talk.title, kicker: talk.kicker || undefined, sub: talk.sub || undefined}
    : {kind: titleKind, title: talk.title, kicker: talk.kicker || undefined, sub: talk.sub || undefined}, (talk.notes || []).join(' ') || [talk.title, talk.sub].filter(Boolean).join(' '));
  talk.slides.forEach((sl, i) => {
    const last = i === talk.slides.length - 1, heading = sl.heading, notes = say(sl);
    const kicker = heading || undefined;
    if (sl.images.length) {
      const im = sl.images[0];
      add({kind: 'kit/photo-frame', src: im.src, alt: im.alt || heading, kicker: heading || undefined, caption: sl.paras.join(' ') || im.alt || undefined}, notes);
      return;
    }
    if (sl.quote.length) {
      const text = sl.quote.join(' ');
      const k = pick(used, wordsOf(text).length <= 12 ? ['motion/quote', 'gsap/draw-mark'] : ['motion/quote']);
      add(k === 'motion/quote' ? {kind: k, text, by: sl.by || undefined, role: heading || undefined} : {kind: k, text, by: sl.by || undefined, kicker}, notes);
      return;
    }
    if (sl.number) {
      const v = sl.number.value.replace(/\s+/g, '');
      const numeric = /^[\d.,]+$/.test(v);
      const m = /^([\d.,]+)(.*)$/.exec(v);
      const k = pick(used, [...(v.length <= 4 ? ['css/big-number'] : []), ...(numeric || m ? ['gsap/counter'] : [])]);
      if (k === 'css/big-number') add({kind: k, value: v, kicker, text: sl.number.text || sl.paras.join(' ') || undefined}, notes);
      else if (k === 'gsap/counter') add({kind: k, value: +m[1].replace(/,/g, ''), unit: m[2] || undefined, kicker, label: sl.number.text || sl.paras.join(' ') || undefined, decimals: (m[1].split('.')[1] || '').length || undefined}, notes);
      else add({kind: 'motion/blur-words', text: [v, sl.number.text].filter(Boolean).join(' '), kicker}, notes);
      return;
    }
    if (last && sl.links.length) {
      add({kind: 'kit/end-card', title: heading || talk.title, sub: sl.paras.join(' ') || undefined, links: sl.links.slice(0, 3), kicker: talk.kicker || undefined, brand: brand || undefined}, notes);
      return;
    }
    if (sl.steps.length >= 2) {
      const steps = sl.steps.slice(0, 6).map((s) => pair(s) || s);
      const k = pick(used, [...(steps.length <= 5 ? ['anime/line-steps'] : []), 'gsap/pin-steps']);
      add({kind: k, steps: k === 'gsap/pin-steps' ? steps.map((s) => (typeof s === 'string' ? {title: s} : s)) : steps, title: heading || undefined, kicker: talk.kicker || undefined}, notes);
      if (sl.steps.length > 6) console.warn(`  "${heading}": ${sl.steps.length} steps, the slide shows 6. Split it into two slides.`);
      return;
    }
    if (sl.bullets.length >= 2) {
      const n = sl.bullets.length, items = sl.bullets.map((b) => pair(b) || b);
      const short = sl.bullets.every((b) => wordsOf(b).length <= 3);
      const options = [...(n <= 5 ? ['lottie/check-list'] : []), ...(n >= 3 && n <= 4 ? ['motion/spring-cards'] : []), ...(n >= 3 && n <= 6 ? ['gsap/flip-grid'] : []), ...(short && n >= 3 && n <= 5 ? ['gsap/scramble-tags'] : [])];
      const k = pick(used, options.length ? options : ['gsap/flip-grid']);
      if (k === 'gsap/scramble-tags') add({kind: k, tags: sl.bullets, title: heading || undefined, sub: sl.paras.join(' ') || undefined}, notes);
      else add({kind: k, items: k === 'lottie/check-list' ? sl.bullets : items.slice(0, 6), title: heading || undefined, kicker: talk.kicker || undefined}, notes);
      return;
    }
    const text = [...sl.paras, ...sl.bullets, ...sl.steps].join(' ').trim();
    if (!text) {
      const w = wordsOf(heading).length;
      const k = pick(used, w <= 2 ? ['css/light-sweep', 'hyperframes/scramble-title', 'css/outline-chapter'] : w <= 3 ? ['hyperframes/scramble-title', 'css/outline-chapter'] : ['css/outline-chapter', 'motion/blur-words']);
      if (k === 'css/light-sweep') add({kind: k, word: heading, kicker: talk.kicker || undefined}, notes);
      else if (k === 'hyperframes/scramble-title') add({kind: k, text: heading, kicker: talk.kicker || undefined}, notes);
      else if (k === 'css/outline-chapter') add({kind: k, number: String(scenes.length).padStart(2, '0'), title: heading, kicker: talk.kicker || undefined}, notes);
      else add({kind: 'motion/blur-words', text: heading}, notes);
      return;
    }
    // a statement: one sentence under a heading
    const w = wordsOf(text).length;
    const shortLines = sl.paras.length >= 2 && sl.paras.length <= 4 && sl.paras.every((p) => wordsOf(p).length <= 4);
    const options = [...(shortLines ? ['css/type-stack'] : []), ...(w <= 14 ? ['motion/blur-words'] : []), ...(w <= 9 ? ['gsap/parallax-words'] : []), ...(w <= 12 ? ['gsap/draw-mark'] : []), 'motion/blur-words'];
    const k = pick(used, options);
    if (k === 'css/type-stack') add({kind: k, lines: sl.paras, kicker}, notes);
    else if (k === 'gsap/parallax-words') add({kind: k, text, kicker}, notes);
    else if (k === 'gsap/draw-mark') add({kind: k, text, kicker}, notes);
    else add({kind: 'motion/blur-words', text, kicker}, notes);
    if (w > 14) console.warn(`  "${heading || text.slice(0, 20)}": ${w} words on one slide. Shorter reads better; the rest can go in Note:.`);
  });
  for (const s of scenes) for (const k of Object.keys(s)) if (s[k] === undefined) delete s[k];
  return {title: talk.title, description: talk.sub || '', lang: talk.lang, look, brand: {name: brand || talk.kicker || talk.title}, scenes};
}

// copy the pictures the talk points to into the project's media/ and point the scenes there
export function bringMedia(story, fromDir, projectDir) {
  const missing = [];
  for (const s of story.scenes) {
    if (!s.src || /^https?:/.test(s.src)) continue;
    const src = path.resolve(fromDir, s.src);
    if (!fs.existsSync(src)) { missing.push(s.src); continue; }
    const to = path.join(projectDir, 'media', path.basename(src));
    fs.mkdirSync(path.dirname(to), {recursive: true});
    if (path.resolve(src) !== path.resolve(to)) fs.copyFileSync(src, to);
    s.src = 'media/' + path.basename(src);
  }
  return missing;
}

export const SAMPLE = {
  ko: `# 우리 가게 소개
동네 빵집의 하루를 다섯 장으로

## 아침 6시에 문을 열어요
새벽에 구운 빵을 제일 먼저 드려요.

## 이렇게 만들어요
1. 반죽: 전날 밤에 해 둬요
2. 발효: 천천히 기다려요
3. 굽기: 아침 6시 전에

## 많이 찾는 빵
- 소금빵
- 우유식빵
- 단팥빵

> 빵 냄새 맡고 들어왔어요.
> - 단골 손님

## 오시는 길
- [지도 보기](https://example.com/map)
- [인스타그램](https://example.com/insta)
Note: 마지막 장에서는 링크를 단추로 보여 줘요.
`,
  en: `# Our little bakery
A day at the shop, in five slides

## We open at 6 AM
Bread from the oven, first thing in the morning.

## How we make it
1. Dough: made the night before
2. Rise: we wait, slowly
3. Bake: done before 6 AM

## What people ask for
- Salt bread
- Milk loaf
- Red bean bun

> I came in because of the smell.
> - A regular

## Find us
- [Map](https://example.com/map)
- [Instagram](https://example.com/insta)
Note: the last slide shows the links as buttons.
`,
};
