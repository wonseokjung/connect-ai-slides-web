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
//
// More, for the pro design (the default since 0.5):
//   **gold words** in a sentence  those words are gold on the slide
//   | Label | Value |  (a table)  numbers in the second column: a chart (columns; a line when the labels are in
//                                  time order); words: a clean table. Two tables in one part sit side by side
//   $$ A = XW + B $$              a formula set large (x1 -> x with a small 1, theta -> θ)
//   $$ / y = 0 if ... / 1 if ... / $$   a formula in cases, with a brace
//   plot: step, sigmoid, relu     function curves on axes (step, sigmoid, relu, tanh, linear, parabola)
//   A -> B -> C                   a process flow (2 to 5 steps); Input [x1 x2] -> Hidden [a1 a2 a3] -> Output [y]
//                                  with brackets: a network diagram
//   Before: a, b, c / After: x, y, z   two lines with a label and a colon: before and after, side by side
//   2 to 4 pictures in one part   a photo gallery; one picture with a list: photo and words side by side
//   ![cover](photo.jpg) under the # title   the cover gets that picture
import fs from 'node:fs';
import path from 'node:path';

const HANGUL = /[ㄱ-ㆎ가-힣]/;
const wordsOf = (t) => String(t).trim().split(/\s+/).filter(Boolean);
const strip = (t) => String(t).replace(/\*\*|__|`/g, '').trim();

// Marp, Slidev and reveal.js markdown: slides split by --- lines, a front matter block on top, a heading on each
// slide, speaker notes in HTML comments (Marp, Slidev) or after Note: (reveal.js). This turns such a file into the
// markdown above, so a deck people already wrote in those tools comes in as it is. Only the form changes: every word
// of the slides and notes stays, directives and layout settings (theme, class, layout, paginate ...) are dropped.
const FM_KEYS = new Set(['marp', 'theme', 'class', '_class', 'paginate', '_paginate', 'header', '_header', 'footer', '_footer', 'size', 'math', 'headingdivider', 'style', 'backgroundcolor', '_backgroundcolor', 'backgroundimage', '_backgroundimage', 'color', '_color', 'title', 'description', 'author', 'keywords', 'url', 'image', 'lang', 'layout', 'background', 'transition', 'clicks', 'hideintoc', 'level', 'src', 'info', 'drawings', 'routermode', 'aspectratio', 'canvaswidth', 'fonts', 'highlighter', 'linenumbers', 'colorschema', 'download', 'exportfilename', 'mdc', 'preload', 'zoom', 'dragpos', 'hide', 'disabled', 'record', 'presenter', 'selectable', 'monaco', 'favicon', 'titletemplate', 'addons', 'defaults', 'export', 'htmlattrs', 'seoMeta', 'seometa', 'twoslash', 'wakelock', 'remoteassets', 'plantumlserver', 'contextmenu', 'themeconfig', 'comark', 'routeralias', 'name', 'fit', 'imagesrc', 'backgroundsize', 'backgroundposition', 'backgroundrepeat', 'mermaid', 'lineheight']);
const keyOf = (l) => { const m = /^\s*([A-Za-z_][\w-]*)\s*:(?:\s|$)/.exec(l); return m ? m[1].toLowerCase() : null; };
const settingsOnly = (rows) => { const r = rows.filter((l) => l.trim()); return r.length > 0 && r.every((l) => /^\s+\S/.test(l) || /^\s*-\s/.test(l) || (keyOf(l) && FM_KEYS.has(keyOf(l)))) && FM_KEYS.has(keyOf(r[0]) || ''); };

export function fromDeckMarkdown(text) {
  let src = String(text).replace(/\r\n?/g, '\n');
  let fmTitle = '', fm = false;
  const head = /^---[ \t]*\n([\s\S]*?)\n---[ \t]*(\n|$)/.exec(src);
  if (head && (settingsOnly(head[1].split('\n')) || /^marp:\s*true\s*$/m.test(head[1]))) { fm = true; const t = /^title:\s*(.+)$/m.exec(head[1]); if (t) fmTitle = t[1].trim().replace(/^['"]|['"]$/g, ''); src = src.slice(head[0].length); }
  // split on --- (and reveal.js vertical --), never inside a code fence
  const chunks = [[]];
  let fence = null, prev = '';
  for (const l of src.split('\n')) {
    const fm = /^\s*(`{3,}|~{3,})/.exec(l);
    if (fm) { if (!fence) fence = fm[1]; else if (fm[1][0] === fence[0] && fm[1].length >= fence.length && /^\s*[`~]+\s*$/.test(l)) fence = null; }
    else if (!fence && /^(---|--)\s*$/.test(l) && !(prev.trim() && !/^\s*([-*+>|<!#`~]|\d+[.)]\s|-->)/.test(prev) && /^---/.test(l) && !settingsOnly(chunks[chunks.length - 1]))) { chunks.push([]); prev = ''; continue; }
    chunks[chunks.length - 1].push(l); prev = l;
  }
  const marp = fm && /^marp:\s*true/m.test(head ? head[1] : '');
  if (!fm && chunks.length < 3) return null;      // not a slide-deck file: read it the normal way
  const out = [];
  let first = true;
  for (let rows of chunks) {
    if (settingsOnly(rows)) continue;              // Slidev per-slide settings between two --- lines
    let body = rows.join('\n');
    const notes = [];
    body = body.replace(/<!--([\s\S]*?)-->/g, (m, c) => {
      const t = c.trim();
      if (!t || /^\.(element|slide)\b/.test(t) || /^@/.test(t) || (/^_?[A-Za-z]+\s*:/.test(t) && !/\n/.test(t) && FM_KEYS.has((keyOf(t.replace(/^_/, '_')) || '')))) return '';
      notes.push(t.replace(/\s*\n\s*/g, ' '));
      return '';
    });
    body = body.replace(/<(style|script)\b[\s\S]*?<\/\1>/gi, '').replace(/^\s*::[\w-]+::\s*$/gm, '').replace(/<\/?[A-Za-z][\w-]*(?:\s[^>]*)?\/?>/g, '').replace(/\s*\{[.#][^}]*\}\s*$/gm, '');
    let lines = body.split('\n').map((l) => l.replace(/\s+$/, '')).filter((l) => !/^\s*(```|~~~)/.test(l));
    // a background picture or a line written above the slide's heading still belongs to that slide
    const hi = lines.findIndex((l) => /^\s*#{1,6}\s+\S/.test(l));
    if (hi > 0) lines = [lines[hi], ...lines.slice(0, hi), ...lines.slice(hi + 1)];
    if (!lines.some((l) => l.trim()) && !notes.length) continue;
    let headed = false;
    for (let l of lines) {
      const h = /^\s*(#{1,6})\s+(.+)$/.exec(l);
      if (h) {
        if (first && h[1].length === 1 && !headed) { out.push('# ' + h[2].trim()); headed = true; first = false; continue; }
        out.push('', '## ' + h[2].trim()); headed = true; first = false; continue;
      }
      if (!headed && l.trim()) {
        if (first && fmTitle) { out.push('# ' + fmTitle); first = false; }
        out.push('', '##');
        headed = true; first = false;
      }
      // Marp image size and background words are settings, not alt text
      l = l.replace(/!\[((?:bg|w:\S+|h:\S+|width:\S+|height:\S+|fit|contain|cover|auto|left|right|top|bottom|blur|sepia|grayscale|brightness:\S+|opacity:\S+|\d+%|\s)+)\]\(/gi, '![](');
      out.push(l);
    }
    for (const n of notes) out.push('Note: ' + n);
  }
  if (first && fmTitle) out.unshift('# ' + fmTitle);
  void marp;
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

export function parseTalk(text, {name = 'talk'} = {}) {
  text = fromDeckMarkdown(text) || text;
  const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
  const isMd = lines.some((l) => /^#{1,2}(\s|$)/.test(l));
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
  let cur = null, inQuote = false, inMath = null;
  for (const raw of lines) {
    const l = raw.trim();
    if (inMath) { if (/^\$\$\s*$/.test(l)) { if (cur) cur.math.push({lines: inMath}); inMath = null; } else if (l) inMath.push(l); continue; }
    if (/^---+$/.test(l)) continue;
    let m;
    const wasPara = cur && cur.lastPara; if (cur && !/^\|.*\|$/.test(l)) cur.lastPara = false; else if (cur) cur.lastPara = wasPara;
    if (cur && /^\$\$\s*$/.test(l)) { inMath = []; continue; }
    if (cur && (m = /^\$\$\s*(.+?)\s*\$\$$/.exec(l))) { cur.math.push({eq: m[1]}); continue; }
    if (cur && (m = /^(?:plot|그래프)\s*[:：]\s*(.+)$/i.exec(l))) { cur.plot = m[1].split(/[,·\s]+/).map((x) => x.trim()).filter(Boolean); continue; }
    if (cur && /^\|.*\|$/.test(l)) {
      if (/^\|[\s:|-]+\|$/.test(l)) { const tb = cur.tables[cur.tables.length - 1]; if (tb && tb.length === 1 && !cur.tableBreak) tb.head = true; continue; }
      const cells = l.slice(1, -1).split('|').map((c) => strip(c));
      if (!cur.tables.length || cur.tableBreak) {
        const tb = []; const last = cur.paras[cur.paras.length - 1], cap = last != null && cur.lastPara && /^(.{1,40})[:：]$/.exec(last);
        if (cap) { tb.title = cap[1].trim(); cur.paras.pop(); }
        cur.tables.push(tb); cur.tableBreak = false;
      }
      cur.tables[cur.tables.length - 1].push(cells); continue;
    }
    if (cur && cur.tables.length && !cur.tableBreak) cur.tableBreak = true;
    if (cur && !/^[-*•>]|^\d+[.)]\s/.test(l) && /\s(->|→)\s/.test(l) && l.split(/\s(?:->|→)\s/).length >= 2 && l.split(/\s(?:->|→)\s/).length <= 6) { cur.flow = l.split(/\s(?:->|→)\s/).map((x) => strip(x)); continue; }
    if (!cur && (m = /^!\[([^\]]*)\]\(<?((?:[^()\s<>]|\([^()\s]*\))+)>?\)\s*$/.exec(l))) { talk.cover = {alt: m[1], src: m[2]}; continue; }
    if ((m = /^kicker:\s*(.+)$/i.exec(l)) && !cur) { talk.kicker = strip(m[1]); continue; }
    if ((m = /^#\s+(.+)$/.exec(l))) { talk.title = strip(m[1]); cur = null; continue; }
    if ((m = /^##+(?:\s+(.*))?$/.exec(l))) { cur = blank(strip(m[1] || '')); talk.slides.push(cur); inQuote = false; continue; }
    if (!l) { inQuote = false; continue; }
    if ((m = /^(note|notes|노트|메모)\s*[:：]\s*(.*)$/i.exec(l))) { (cur || talk).notes = ((cur || talk).notes || []).concat(m[2]); continue; }
    if (!cur) { if (!talk.sub) talk.sub = strip(l); else talk.sub += ' ' + strip(l); continue; }
    if ((m = /^!\[([^\]]*)\]\(<?((?:[^()\s<>]|\([^()\s]*\))+)>?\)\s*(.*)$/.exec(l))) {
      const onlyPics = cur.images.length && !cur.paras.length && !cur.bullets.length && !cur.steps.length && !cur.quote.length && !cur.number;
      if (busy(cur) && !onlyPics) { cur = blank(''); talk.slides.push(cur); }
      cur.images.push({alt: m[1], src: m[2]});
      if (m[3].trim()) cur.paras.push(strip(m[3]));        // words after the picture are its caption
      continue;
    }
    if ((m = /^>\s?(.*)$/.exec(l))) {
      // a quote right under one picture stays with it (the picture goes beside the words)
      const onePic = cur.images.length === 1 && !cur.paras.length && !cur.bullets.length && !cur.steps.length && !cur.quote.length && !cur.number;
      if (!inQuote && busy(cur) && !onePic) { cur = blank(''); talk.slides.push(cur); }
      const t = m[1].trim();
      if (/^[-–]\s*\S/.test(t) && cur.quote.length) cur.by = strip(t.replace(/^[-–]\s*/, ''));
      else if (t) cur.quote.push(strip(t));
      inQuote = true; continue;
    }
    if ((m = /^\d+[.)]\s+(.+)$/.exec(l))) { cur.steps.push(strip(m[1])); continue; }
    if ((m = /^[-*•]\s+(.+)$/.exec(l))) {
      const lk = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(m[1].trim());
      if (lk) cur.links.push({label: lk[1], href: lk[2]});
      else if (inQuote && cur.quote.length && !cur.by) cur.by = strip(m[1]);      // "- name" right under a quote says who
      else cur.bullets.push(strip(m[1]));
      continue;
    }
    const links = [...l.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)];
    if (links.length && l.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '').replace(/[\s,·|]/g, '') === '') { for (const k of links) cur.links.push({label: k[1], href: k[2]}); continue; }
    if ((m = /^\*\*([^*]{1,12})\*\*\s*[:：|-]?\s*(.*)$/.exec(l)) && /\d/.test(m[1]) && (!cur.number || cur.numbers.length)) { const nb = {value: m[1].trim(), text: strip(m[2])}; if (!cur.number) cur.number = nb; cur.numbers.push(nb); continue; }
    for (const g of l.matchAll(/\*\*([^*]+)\*\*/g)) cur.gold.push(g[1].trim());
    cur.paras.push(strip(l.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '$1')));
    cur.lastPara = true; continue;
  }
  return talk;
}
// one section can hold more than one block can show (a paragraph and a list, a quote and a list, links in the middle
// of the talk): it becomes more than one slide, in the order of the section, so no word is lost
function splitSlide(sl, isLast) {
  const part = (o) => ({...blank(sl.heading), ...o});
  const has = (c) => busy(c) || c.links.length;
  if (!isLast && sl.links.length) { sl = {...sl, paras: [...sl.paras, sl.links.map((k) => k.label).join(' · ')], links: []}; }
  let main, rest;
  if (sl.images.length) {
    main = part({images: [sl.images[0]], paras: sl.paras});
    const more = sl.images.slice(1).map((im) => part({images: [im]}));
    rest = part({bullets: sl.bullets, steps: sl.steps, quote: sl.quote, by: sl.by, number: sl.number, links: sl.links});
    return [main, ...more, ...(has(rest) ? splitSlide(rest, isLast) : [])].map((x, i) => (i ? {...x, notes: []} : {...x, notes: sl.notes}));
  }
  if (sl.quote.length) {
    main = part({quote: sl.quote, by: sl.by});
    rest = part({paras: sl.paras, bullets: sl.bullets, steps: sl.steps, number: sl.number, links: sl.links});
  } else if (sl.number) {
    const own = !sl.number.text && !sl.links.length;
    main = part({number: sl.number, paras: own ? sl.paras : []});
    rest = part({paras: own ? [] : sl.paras, bullets: sl.bullets, steps: sl.steps, links: sl.links});
  } else if (sl.steps.length >= 2 || sl.bullets.length >= 2) {
    const key = sl.steps.length >= 2 ? 'steps' : 'bullets';
    const lead = sl.paras.length ? [part({paras: sl.paras})] : [];       // the sentence before a list is its own slide
    main = part({[key]: sl[key]});
    rest = part({bullets: key === 'steps' ? sl.bullets : [], steps: key === 'bullets' ? sl.steps : [], links: sl.links});
    return [...lead, main, ...(has(rest) ? splitSlide(rest, isLast) : [])].map((x, i) => ({...x, notes: i === lead.length ? sl.notes : []}));
  } else return [sl];
  return [main, ...(has(rest) ? splitSlide(rest, isLast) : [])].map((x, i) => ({...x, notes: i ? [] : sl.notes}));
}

const busy = (c) => c.paras.length || c.bullets.length || c.steps.length || c.quote.length || c.images.length || c.number;
function blank(heading) { return {heading, paras: [], bullets: [], steps: [], quote: [], by: '', images: [], links: [], number: null, notes: [], numbers: [], gold: [], math: [], tables: [], plot: null, flow: null}; }

// the option used least so far (the first one on a tie): designs spread out instead of one repeating
const pick = (used, list) => list.reduce((best, k) => ((used.get(k) || 0) < (used.get(best) || 0) ? k : best), list[0]);
const pair = (t) => { if (/^\d{1,2}:\d{2}\b/.test(t)) { const m = /^(\d{1,2}:\d{2})\s+(.+)$/.exec(t); return m ? {title: m[1], text: m[2].trim()} : null; } const m = /^([^:：]{1,40})[:：]\s*(.+)$/.exec(t); return m ? {title: m[1].trim(), text: m[2].trim()} : null; };

// talk -> story.json scenes
export function talkToStory(talk, {look = 'connect', brand = '', design = 'visual', kinds = null, leads = null} = {}) {
  if (design === 'visual') return talkToVisualStory(talk, {look, brand, kinds, leads});
  if (design !== 'classic') return talkToProStory(talk, {look, brand});
  const used = new Map(), scenes = [];
  const add = (s, notes) => { used.set(s.kind, (used.get(s.kind) || 0) + 1); s.id = 's' + (scenes.length + 1); if (notes) s.notes = notes; scenes.push(s); };
  const say = (sl) => (sl.notes.length ? sl.notes.join(' ') : [sl.heading, ...sl.paras, ...sl.bullets, ...sl.steps, ...sl.quote].filter(Boolean).join(' '));
  // opening
  const tw = wordsOf(talk.title).length;
  const titleKind = pick(used, tw <= 3 ? ['anime/letter-wave', 'gsap/split-title'] : tw <= 6 ? ['lottie/stroke-title', 'gsap/split-title'] : ['gsap/split-title']);
  add(titleKind === 'anime/letter-wave' ? {kind: titleKind, word: talk.title, kicker: talk.kicker || undefined, sub: talk.sub || undefined}
    : {kind: titleKind, title: talk.title, kicker: talk.kicker || undefined, sub: talk.sub || undefined}, (talk.notes || []).join(' ') || [talk.title, talk.sub].filter(Boolean).join(' '));
  const slides = talk.slides.flatMap((sl, i) => splitSlide(sl, i === talk.slides.length - 1));
  slides.forEach((sl, i) => {
    const last = i === slides.length - 1, heading = sl.heading, notes = say(sl);
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
      // a counter only for a real number (1,200 / 3.5 / 42%), never for 1.2.3 or a date
      const m = /^(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)([^\d.,].*)?$/.exec(v);
      const real = m && Number.isFinite(+m[1].replace(/,/g, ''));
      const k = pick(used, [...(v.length <= 4 ? ['css/big-number'] : []), ...(real ? ['gsap/counter'] : []), 'motion/blur-words', 'gsap/parallax-words']);
      if (k === 'css/big-number') add({kind: k, value: v, kicker, text: sl.number.text || sl.paras.join(' ') || undefined}, notes);
      else if (k === 'gsap/counter') add({kind: k, value: +m[1].replace(/,/g, ''), unit: m[2] || undefined, kicker, label: sl.number.text || sl.paras.join(' ') || undefined, decimals: (m[1].split('.')[1] || '').length || undefined}, notes);
      else add({kind: k, text: [v, sl.number.text].filter(Boolean).join(' '), kicker}, notes);
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
    const options = [...(shortLines ? ['css/type-stack'] : []), ...(w <= 14 ? ['motion/blur-words'] : []), ...(w <= 9 ? ['gsap/parallax-words'] : []), ...(w <= 12 ? ['gsap/draw-mark'] : []), ...(w >= 2 && w <= 5 ? ['hyperframes/split-words'] : []), 'motion/blur-words'];
    const k = pick(used, options);
    if (k === 'css/type-stack') add({kind: k, lines: sl.paras, kicker}, notes);
    else if (k === 'hyperframes/split-words') add({kind: k, text, kicker}, notes);
    else if (k === 'gsap/parallax-words') add({kind: k, text, kicker}, notes);
    else if (k === 'gsap/draw-mark') add({kind: k, text, kicker}, notes);
    else add({kind: 'motion/blur-words', text, kicker}, notes);
    if (w > 14) console.warn(`  "${heading || text.slice(0, 20)}": ${w} words on one slide. Shorter reads better; the rest can go in Note:.`);
  });
  for (const s of scenes) for (const k of Object.keys(s)) if (s[k] === undefined) delete s[k];
  return {title: talk.title, description: talk.sub || '', lang: talk.lang, look, brand: {name: brand || talk.kicker || talk.title}, scenes};
}

// ---------------------------------------------------------------- pro design (default since 0.5)
// One design system for the whole deck: the same header place, footer, hairlines and motion language on every slide.
// The part of the talk picks a layout by what it holds; pictures, numbers, tables, formulas and flows get a picture-led
// slide. Every word still comes from the talk.
const TIME = /^(\d{4}|\d{1,2}[월日]|q[1-4]|h[12]|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*|(mon|tue|wed|thu|fri|sat|sun)[a-z]*|week\s*\d+|\d+\s*(주|주차|week)|(lessons?|steps?|days?|weeks?|parts?|강|일차)\s*\d+|\d+\s*([-–~]\s*\d+\s*)?(강|일차|주))\b/i;
const numOf = (v) => { const m = /^[^\d-]*(-?\d{1,3}(?:,\d{3})+(?:\.\d+)?|-?\d+(?:\.\d+)?)\s*([^\d]*)$/.exec(String(v).trim()); return m ? {n: +m[1].replace(/,/g, ''), unit: m[2].trim(), dec: (m[1].split('.')[1] || '').length} : null; };
const FN_NAME = {step: 'Step', sigmoid: 'Sigmoid', relu: 'ReLU', tanh: 'tanh', linear: 'Linear', parabola: 'Parabola'};

const sceneWords = (s) => { const out = []; const walk = (v, k) => { if (typeof v === 'string') { if (!['kind', 'id', 'src', 'alt', 'href', 'poster', 'fn'].includes(k) && !/\.(jpe?g|png|webp|mp4|webm|svg)$/i.test(v)) out.push(v); } else if (Array.isArray(v)) v.forEach((x) => walk(x, k)); else if (v && typeof v === 'object') Object.entries(v).forEach(([kk, x]) => walk(x, kk)); }; walk(s, ''); return out.filter((x) => !/^\d{1,2}$/.test(x)).join(' ').slice(0, 600); };

export function talkToProStory(talk, {look = 'connect', brand = ''} = {}) {
  const scenes = [];
  const add = (s, notes) => { s.id = 's' + (scenes.length + 1); if (notes) s.notes = notes; for (const k of Object.keys(s)) if (s[k] === undefined || (Array.isArray(s[k]) && !s[k].length && k !== 'items')) delete s[k]; scenes.push(s); };
  const say = (sl) => (sl.notes.length ? sl.notes.join(' ') : [sl.heading, ...sl.paras, ...sl.bullets, ...sl.steps, ...sl.quote].filter(Boolean).join(' '));
  const pairOrTitle = (t) => pair(t) || {title: t};
  const goldIn = (sl, text) => sl.gold.filter((g) => text.includes(g));
  // cover
  add({kind: 'pro/cover', title: talk.title, sub: talk.sub || undefined, kicker: talk.kicker || undefined, src: talk.cover && talk.cover.src, alt: talk.cover && (talk.cover.alt || talk.title)}, (talk.notes || []).join(' ') || [talk.title, talk.sub].filter(Boolean).join(' '));
  const all = talk.slides;
  const chapters = all.filter((sl) => !busy(sl) && !sl.links.length && !sl.math.length && !sl.tables.length && !sl.plot && !sl.flow && sl.heading);
  if (chapters.length >= 3 && all.length >= 7) add({kind: 'pro/agenda', items: chapters.slice(0, 7).map((c) => c.heading), kicker: talk.kicker || undefined}, chapters.map((c) => c.heading).join(', '));
  let chap = 0;
  all.forEach((sl, idx) => {
    const last = idx === all.length - 1, H = sl.heading || undefined, notes = say(sl);
    let first = true;
    // the first slide of a part carries the part's notes; the others say their own words (so the presenter view is never empty)
    const put = (s) => { add(s, first ? notes : sceneWords(s) || notes); first = false; };
    const visuals = sl.math.length + sl.tables.length + (sl.plot ? 1 : 0) + (sl.flow ? 1 : 0) + (sl.images.length ? 1 : 0) + (sl.numbers.length ? 1 : 0) + (sl.quote.length ? 1 : 0);
    let paras = sl.paras.slice(), bullets = sl.bullets.slice(), steps = sl.steps.slice();
    // before / after: two lines "Label: a, b, c"
    const cmp = !visuals && !bullets.length && !steps.length && paras.length === 2 && paras.every((x) => /^[^:：]{1,24}[:：]\s*\S/.test(x));
    if (cmp) {
      const side = (x) => { const m = /^([^:：]{1,24})[:：]\s*(.+)$/.exec(x); const items = m[2].split(/\s*[,·;]\s*/).filter(Boolean); return items.length >= 2 ? {label: m[1].trim(), items: items.slice(0, 4)} : {label: m[1].trim(), text: m[2].trim()}; };
      put({kind: 'pro/compare', title: H, left: side(paras[0]), right: side(paras[1])});
      return;
    }
    // last part with links: the closing slide
    if (last && sl.links.length && !visuals) { put({kind: 'pro/closing', title: H || talk.title, sub: paras.join(' ') || undefined, links: sl.links.slice(0, 3), kicker: talk.kicker || brand || undefined}); return; }
    // the words before a picture: short ones ride along as its note, long ones get their own slide first
    const pj = paras.join(' '), pwords = wordsOf(pj.replace(/[가-힣]+/g, ' ')).length + Math.ceil((pj.match(/[가-힣]/g) || []).length / 2.5);
    const lead = paras.length && (visuals || bullets.length >= 2 || steps.length >= 2);
    let note;
    if (lead) {
      if (pwords <= 12 && visuals) { note = paras.join(' '); }
      else put({kind: 'pro/statement', text: paras.join(' '), gold: goldIn(sl, paras.join(' ')), kicker: H});
      paras = [];
    }
    // formulas
    for (const m of sl.math) {
      const terms = [];
      if (bullets.length && bullets.every((b) => pair(b))) { for (const b of bullets.slice(0, 4)) { const q = pair(b); terms.push({sym: q.title, text: q.text}); } bullets = []; }
      if (m.eq) { put({kind: 'pro/equation', eq: m.eq, terms, title: H, note}); note = undefined; continue; }
      const L = m.lines, cases = [];
      let lhs = '';
      L.forEach((ln, k) => {
        let x = ln;
        if (k === 0) { const e = /^(.{1,12}?)\s*=\s*(.+)$/.exec(x); if (e && /(\bif\b|\bwhen\b|\(|일 때)/i.test(e[2])) { lhs = e[1]; x = e[2]; } }
        const c = /^(.+?)\s+(?:if|when)\s+(.+)$/i.exec(x) || /^(\S+)\s*\((.+)\)\s*$/.exec(x) || /^(.+?)\s*\((.+)\)\s*$/.exec(x);
        if (c) cases.push({value: c[1].trim(), when: c[2].trim()});
      });
      if (cases.length >= 2 && cases.length === L.length) put({kind: 'pro/equation', lhs: lhs || undefined, cases: cases.slice(0, 3), terms, title: H, note});
      else for (const ln of L.slice(0, 2)) put({kind: 'pro/equation', eq: ln, terms, title: H, note});
      note = undefined;
    }
    // tables: a chart when they hold numbers, a clean table when they hold words
    if (sl.tables.length) {
      const words = [];
      for (const tb of sl.tables) {
        const head = tb.head ? tb[0] : null, rows = tb.head ? tb.slice(1) : tb.slice();
        const chart = rows.length >= 2 && rows.every((r) => r.length === 2 && numOf(r[1]));
        if (chart && rows.length <= 12) {
          const vals = rows.map((r) => numOf(r[1])), unit = vals[0].unit || (head && head[1] && !numOf(head[1]) ? head[1] : '');
          const time = rows.filter((r) => TIME.test(r[0])).length >= rows.length - 1;
          const kind = time && rows.length >= 3 || rows.length > 8 ? 'pro/line' : 'pro/bars';
          const pts = rows.map((r, i) => ({label: r[0], value: vals[i].n}));
          put(kind === 'pro/line' ? {kind, points: pts, unit: unit || undefined, title: tb.title || H, note, decimals: Math.max(...vals.map((v) => v.dec)) || undefined}
            : {kind, items: pts, unit: unit || undefined, title: tb.title || H, note, decimals: Math.max(...vals.map((v) => v.dec)) || undefined});
          note = undefined;
        } else words.push({title: tb.title, head: head || undefined, rows: rows.slice(0, 8)});
      }
      for (let k = 0; k < words.length; k += 2) { put({kind: 'pro/table', tables: words.slice(k, k + 2), title: H, note, gold: words[k].head && words[k].head.length === 3 && words[k].rows.every((r) => r.every((c) => /^[01]$/.test(c))) ? 0 : undefined}); note = undefined; }
    }
    if (sl.plot) { put({kind: 'pro/plot', curves: sl.plot.slice(0, 3).map((f) => ({fn: f.toLowerCase(), label: FN_NAME[f.toLowerCase()] || f})), title: H, note}); note = undefined; }
    if (sl.flow) {
      const parts = sl.flow.map((x) => { const b = /^(.*?)\s*\[([^\]]+)\]\s*$/.exec(x) || /^(.*?)\s*\((\d)\)\s*$/.exec(x); return b ? {label: b[1].trim(), nodes: /^\d+$/.test(b[2].trim()) ? +b[2] : b[2].split(/[\s,]+/).filter(Boolean)} : {label: x}; });
      if (parts.filter((x) => x.nodes).length >= 2) put({kind: 'pro/network', layers: parts.map((x) => ({label: x.label, nodes: x.nodes || 1})).slice(0, 5), title: H, note});
      else put({kind: 'pro/flow', steps: sl.flow.slice(0, 5).map(pairOrTitle), title: H, note});
      note = undefined;
    }
    if (sl.numbers.length) {
      const ns = sl.numbers;
      if (ns.length === 1) put({kind: 'pro/stat', value: ns[0].value, label: ns[0].text || paras.join(' ') || H || '', kicker: H && ns[0].text ? H : undefined, note});
      else put({kind: 'pro/stats', items: ns.slice(0, 4).map((x) => ({value: x.value, label: x.text})), title: H, note});
      if (ns.length === 1 && !ns[0].text) paras = [];
      note = undefined;
    }
    // a quote with one picture: the picture stands beside the words (a person or the place the words are about)
    let qpic = null;
    if (sl.quote.length && sl.images.length === 1 && !bullets.length && !steps.length) qpic = sl.images[0];
    if (sl.quote.length) { put({kind: 'pro/quote', text: sl.quote.join(' '), by: sl.by || undefined, kicker: H, gold: goldIn(sl, sl.quote.join(' ')), ...(qpic ? {src: qpic.src, alt: qpic.alt || H || talk.title} : {})}); }
    if (sl.images.length && !qpic) {
      const ims = sl.images;
      const list = bullets.length >= 2 ? bullets : steps.length >= 2 ? steps : null;
      if (ims.length === 1 && list && list.length <= 4) { put({kind: 'pro/split', src: ims[0].src, alt: ims[0].alt || H || talk.title, title: H || ims[0].alt || talk.title, items: list.map(pairOrTitle)}); if (list === bullets) bullets = []; else steps = []; }
      else if (ims.length === 1) put({kind: 'pro/photo', src: ims[0].src, alt: ims[0].alt || H || talk.title, title: H, text: note || paras.join(' ') || undefined, kicker: undefined});
      else for (let k = 0; k < ims.length; k += 4) put({kind: 'pro/gallery', items: ims.slice(k, k + 4).map((im) => ({src: im.src, alt: im.alt || H || talk.title, caption: im.alt || undefined})), title: H});
      if (ims.length === 1 && !list) paras = [];
      note = undefined;
    }
    // lists
    if (steps.length >= 2) {
      const ps = steps.map(pairOrTitle);
      const timely = ps.length >= 3 && ps.every((x) => x.text && TIME.test(x.title));
      if (timely && ps.length <= 6) put({kind: 'pro/timeline', items: ps.map((x) => ({when: x.title, title: x.text})), title: H});
      else if (ps.length <= 5) put({kind: 'pro/flow', steps: ps, title: H, note});
      else put({kind: 'pro/agenda', items: steps.slice(0, 7), title: H});
      note = undefined; steps = [];
    }
    if (bullets.length >= 2) {
      if (bullets.length <= 4) put({kind: 'pro/points', items: bullets.map(pairOrTitle), title: H});
      else for (let k = 0; k < bullets.length; k += 7) put({kind: 'pro/agenda', items: bullets.slice(k, k + 7), title: H});
      bullets = [];
    }
    const rest = [...paras, ...bullets, ...steps].join(' ').trim();
    if (rest) {
      const chunks = paras.length >= 2 && wordsOf(rest).length > 24 ? [...paras, ...bullets, ...steps] : [rest];
      for (const c of chunks) put({kind: 'pro/statement', text: c, gold: goldIn(sl, c), kicker: H});
      if (wordsOf(rest).length > 30 && chunks.length === 1) console.warn(`  "${H || rest.slice(0, 20)}": ${wordsOf(rest).length} words on one slide. Shorter reads better; the rest can go in Note:.`);
    }
    if (last && sl.links.length && visuals) put({kind: 'pro/closing', title: talk.title, links: sl.links.slice(0, 3), kicker: talk.kicker || brand || undefined});
    else if (!last && sl.links.length) put({kind: 'pro/statement', text: sl.links.map((k) => k.label).join(' · '), kicker: H});
    if (first) { chap += 1; put({kind: 'pro/chapter', number: String(chap).padStart(2, '0'), title: H || talk.title}); }
  });
  return {title: talk.title, description: talk.sub || '', lang: talk.lang, look, design: 'pro', brand: {name: brand || talk.kicker || talk.title}, scenes};
}


// ---------- the visual design (the default since 0.6): every slide a picture or motion first ----------
// The same reading of the talk as the pro design, then each slide gets the picture-first block that shows its message
// (3D, a living light, a chart that moves, a diagram with signals flowing). Every block is used once per deck: when it
// is taken, the next one in line, and only then the quiet pro block. Every word still comes from the talk.
const MODEL_FILE = /\.glb$/i;
const pad2 = (i) => String(i).padStart(2, '0');
function visualCandidates(s) {
  const T = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && !(Array.isArray(v) && !v.length)));
  const base = {notes: s.notes, id: s.id};
  switch (s.kind) {
    case 'pro/cover':
      if (s.src && MODEL_FILE.test(s.src)) return [T({...base, kind: 'three/model', model: s.src, title: s.title, sub: s.sub, kicker: s.kicker})];
      return [T({...base, kind: 'vis/cover', title: s.title, sub: s.sub, kicker: s.kicker, src: s.src, alt: s.alt, poster: s.poster, face: s.face, body: s.body})];
    case 'pro/statement': return [T({...base, kind: 'vis/statement', text: s.text, gold: s.gold, kicker: s.kicker}), T({...base, kind: 'vis/scramble', text: s.text, gold: s.gold, kicker: s.kicker})];
    case 'pro/split':
      if (MODEL_FILE.test(s.src || '')) return [T({...base, kind: 'three/model', model: s.src, title: s.title, items: s.items})];
      return [T({...base, kind: 'vis/split', src: s.src, alt: s.alt, title: s.title, items: s.items, text: s.text, face: s.face, body: s.body, poster: s.poster})];
    case 'pro/photo':
      if (MODEL_FILE.test(s.src || '')) return [T({...base, kind: 'three/model', model: s.src, title: s.title, sub: s.text})];
      return [T({...base, kind: 'vis/photo', src: s.src, alt: s.alt, title: s.title, text: s.text, kicker: s.kicker, face: s.face, body: s.body, poster: s.poster}),
        ...(/\.(mp4|webm|mov)$/i.test(s.src || '') && !s.face ? [T({...base, kind: 'vis/device', src: s.src, poster: s.poster, alt: s.alt, title: s.title, caption: s.text})] : [])];
    case 'pro/gallery': return [T({...base, kind: 'vis/gallery', items: s.items, title: s.title, kicker: s.kicker})];
    case 'pro/quote': return [T({...base, kind: 'vis/quote', text: s.text, gold: s.gold, by: s.by, role: s.role, kicker: s.kicker, src: s.src, poster: s.poster, face: s.face, body: s.body, alt: s.alt})];
    case 'pro/compare': return [T({...base, kind: 'vis/compare', left: s.left, right: s.right, title: s.title, kicker: s.kicker})];
    case 'pro/closing': return [T({...base, kind: 'vis/closing', title: s.title, sub: s.sub, links: s.links, kicker: s.kicker})];
    case 'pro/points': return [T({...base, kind: 'vis/points', items: s.items, title: s.title, kicker: s.kicker})];
    case 'pro/chapter': return [T({...base, kind: 'vis/chapter', number: s.number, title: s.title, kicker: s.kicker})];
    case 'pro/bars': return [T({...base, kind: 'three/bars', items: s.items, unit: s.unit, title: s.title, kicker: s.kicker, note: s.note, decimals: s.decimals}),
      ...((s.items || []).length >= 3 ? [T({...base, kind: 'vis/line', points: s.items, unit: s.unit, title: s.title, kicker: s.kicker, note: s.note, decimals: s.decimals})] : [])];
    case 'pro/line': return [T({...base, kind: 'vis/line', points: s.points, unit: s.unit, title: s.title, kicker: s.kicker, note: s.note, decimals: s.decimals}),
      ...((s.points || []).length <= 8 ? [T({...base, kind: 'three/bars', items: s.points, unit: s.unit, title: s.title, kicker: s.kicker, note: s.note, decimals: s.decimals})] : [])];
    case 'pro/stat': return [T({...base, kind: 'vis/stats', items: [{value: s.value, label: s.label}], title: s.kicker, note: s.note})];
    case 'pro/stats': return [T({...base, kind: 'vis/stats', items: s.items, title: s.title, kicker: s.kicker, note: s.note})];
    case 'pro/flow': return [T({...base, kind: 'vis/flow', steps: s.steps, title: s.title, kicker: s.kicker, note: s.note}),
      ...((s.steps || []).length >= 3 ? [T({...base, kind: 'vis/map', stops: s.steps.map((x) => ({when: x.title, title: x.text || ''})), title: s.title, kicker: s.kicker})] : [])];
    case 'pro/timeline': return [T({...base, kind: 'vis/map', stops: (s.items || []).map((x) => ({when: x.when, title: x.title})), title: s.title, kicker: s.kicker}),
      T({...base, kind: 'vis/flow', steps: (s.items || []).map((x) => ({title: x.when, text: x.title})), title: s.title, kicker: s.kicker})];
    case 'pro/agenda': return (s.items || []).length >= 3 ? [T({...base, kind: 'vis/map', stops: s.items.slice(0, 8).map((t, i) => ({when: pad2(i + 1), title: t})), title: s.title, kicker: s.kicker})] : [];
    case 'pro/table': {
      const truth = (s.tables || []).length && s.tables.every((t) => t.head && t.head.length === 3 && t.rows.length === 4 && t.rows.every((r) => r.length === 3 && r.every((c) => /^[01]$/.test(c))));
      const tb = T({...base, kind: 'vis/table', tables: s.tables, gold: s.gold, title: s.title, kicker: s.kicker, note: s.note});
      return truth ? [T({...base, kind: 'vis/boundary', tables: s.tables, title: s.title, kicker: s.kicker, note: s.note}), tb] : [tb];
    }
    case 'pro/plot': return [T({...base, kind: 'vis/plot', curves: s.curves, title: s.title, kicker: s.kicker, note: s.note})];
    case 'pro/network': return [T({...base, kind: 'three/network', layers: s.layers, title: s.title, kicker: s.kicker, note: s.note})];
    case 'pro/equation': {
      const all = [s.eq, s.lhs, ...(s.cases || []).map((c) => c.value + ' ' + c.when)].filter(Boolean).join(' ');
      const out = [];
      if (s.eq && /^\s*[A-Z]\s*=\s*[A-Z]{1,3}\b/.test(s.eq)) out.push(T({...base, kind: 'vis/matrix', eq: s.eq, terms: s.terms, title: s.title, kicker: s.kicker, note: s.note}));
      out.push(T({...base, kind: 'vis/equation', eq: s.eq, lhs: s.lhs, cases: s.cases, terms: s.terms, title: s.title, kicker: s.kicker, note: s.note}));
      const xs = [...new Set(all.match(/(?<![A-Za-z])x\d(?!\d)/g) || [])], ws = [...new Set(all.match(/(?<![A-Za-z])w\d(?!\d)/g) || [])];
      if (xs.length >= 1 && xs.length <= 4 && ws.length) {
        const eq = s.eq || ((s.lhs ? s.lhs + ' = ' : '') + (s.cases || []).map((c) => c.value + ' if ' + c.when).join(', '));
        out.push(T({...base, kind: 'vis/neuron', inputs: xs, weights: ws.length === xs.length ? ws : undefined, bias: /\bbias\b/.test(all) ? 'bias' : /\bb\b/.test(all) ? 'b' : undefined, eq, title: s.title, kicker: s.kicker, note: s.note}));
      }
      return out;
    }
    default: return [];
  }
}
// kinds the kit has (a missing optional block falls back to the pro one)
// blocks whose screen is led by words (meta "lead": "type"); used when the caller passes no catalog leads
const TYPE_LED = new Set(['vis/statement', 'vis/scramble', 'vis/compare', 'vis/points', 'vis/chapter', 'pro/agenda', 'pro/chapter', 'pro/cover', 'pro/points', 'pro/quote', 'pro/stat', 'pro/statement', 'pro/stats']);

export function talkToVisualStory(talk, {look = 'connect', brand = '', kinds = null, leads = null} = {}) {
  const story = talkToProStory(talk, {look, brand});
  const has = (k) => !kinds || kinds.has(k);
  const words = (k) => (leads && leads.has(k) ? leads.get(k) === 'type' : TYPE_LED.has(k));
  const used = new Set();
  let run = 0;
  story.scenes = story.scenes.map((s) => {
    const cands = visualCandidates(s).filter((c) => has(c.kind) && !used.has(c.kind));
    // a rule, not advice: never three words-only slides in a row. When this one would be the third, take a picture
    // candidate, then the pro block if its screen is a picture, then a journey (vis/map) for a list of 3 to 8 items
    let pick = cands[0];
    if (run >= 2 && (!pick || words(pick.kind)) && (pick || words(s.kind))) {
      const pic = cands.find((c) => !words(c.kind));
      if (pic) pick = pic;
      else if (!words(s.kind)) pick = null;
      else if (s.kind === 'pro/points' && has('vis/map') && !used.has('vis/map') && (s.items || []).length >= 3 && s.items.length <= 8)
        pick = {notes: s.notes, id: s.id, kind: 'vis/map', title: s.title, kicker: s.kicker, stops: s.items.map((it, i) => ({when: pad2(i + 1), title: typeof it === 'string' ? it : [it.title, it.text].filter(Boolean).join(': ')}))};
    }
    const out = pick || s;
    if (pick) { used.add(pick.kind); if (!pick.notes) delete pick.notes; }
    run = words(out.kind) ? run + 1 : 0;
    return out;
  });
  story.design = 'visual';
  return story;
}

// copy the pictures the talk points to into the project's media/ and point the scenes there
export function bringMedia(story, fromDir, projectDir) {
  const missing = [], taken = new Map();
  const mediaDir = path.join(projectDir, 'media');
  const holders = [];
  // a picture or clip (src) or a 3D model (model, on three/* blocks)
  const walk = (o) => { if (!o || typeof o !== 'object') return; if (Array.isArray(o)) { o.forEach(walk); return; } for (const key of ['src', 'model']) if (typeof o[key] === 'string') holders.push([o, key]); for (const k of Object.keys(o)) if (k !== 'src' && k !== 'model' && o[k] && typeof o[k] === 'object') walk(o[k]); };
  story.scenes.forEach(walk);
  for (const [s, key] of holders) {
    if (!s[key] || /^https?:/.test(s[key])) continue;
    const src = path.resolve(fromDir, s[key]);
    let real = null;
    try { real = fs.realpathSync(src); } catch {}
    if (!real || !fs.statSync(real).isFile()) { missing.push(s[key]); continue; }
    // two different pictures with the same name (a/logo.png, b/logo.png) both stay: the second becomes logo-2.png
    let name = taken.get(real);
    if (!name) {
      const ext = path.extname(real), base = path.basename(real, ext).replace(/[^\p{L}\p{N}._-]+/gu, '-') || 'picture';
      const used = new Set(taken.values());
      name = base + ext;
      for (let k = 2; used.has(name); k++) name = `${base}-${k}${ext}`;
      taken.set(real, name);
      fs.mkdirSync(mediaDir, {recursive: true});
      const to = path.join(mediaDir, name);
      if (fs.existsSync(to) && fs.lstatSync(to).isSymbolicLink()) throw new Error(`${to} is a link: not writing through it.`);
      if (path.resolve(real) !== path.resolve(to)) fs.copyFileSync(real, to);
    }
    s[key] = 'media/' + name;
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
