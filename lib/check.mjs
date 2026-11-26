// check: open the built deck and site in a real browser, measure what is on screen, and say what is wrong in sentences.
// Three frames: the deck at 1920x1080, the website at 1440x900, the website on a 390x844 phone. MIT, CONNECT AI LAB.
import fs from 'node:fs';
import path from 'node:path';
import {NAME, RUN, findChrome, readPng} from './tools.mjs';
import {build} from './build.mjs';
import {byKind} from './catalog.mjs';
import {openBrowser, closeBrowser, openStage, firstScreen, FRAMES, ffmpeg} from './shoot.mjs';
import {eyesAvailable, measureEyes, eyeVerdict, EYES} from './eyes.mjs';
import os from 'node:os';
import {findFfmpeg} from './tools.mjs';

export const LIMITS = {
  deck: {fontError: 22, fontAdvice: 28, wordsError: 45, wordsAdvice: 28, edge: 0.03},
  web: {fontError: 12, bodyAdvice: 16, bodyWords: 8, wordsAdvice: 70, tap: 44},
  contrast: {normal: 4.5, large: 3.0, largePx: 32, boldPx: 24, percentile: 0.1, ghost: 0.3},
  motion: {readable: 2.8, step: 4, long: 8, scrubMin: 0.5, scrubMax: 4},
  family: 2, folderMB: 25, typeRun: 3, eyes: EYES, firstKB: 1500,
  design: {empty: 0.16, crowded: 0.86, crowdedWords: 20, sizes: 5, cell: 12, clash: 0.2},
};

// Hangul, Han and kana have no spaces between "words": 2.5 characters count as one word
export function countWords(str) {
  const s = String(str || '');
  const cjk = (s.match(/[぀-ヿ㐀-䶿一-鿿가-힯]/g) || []).length;
  const rest = s.replace(/[぀-ヿ㐀-䶿一-鿿가-힯]/g, ' ').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  return rest + Math.ceil(cjk / 2.5);
}

const lum = (c) => { const a = [c[0], c[1], c[2]].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]; };
export const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

// contrast of one text box against the pixels really behind it; the unlucky 10 % decides
export function contrastOf(t, png, k) {
  // the line box of large type is taller than its ink: leave out the empty band above and below, or a rule under a big number counts as its background
  const fs = Math.min(t.px || t.size || 0, t.h), top = t.y + fs * 0.15, bot = t.y + t.h - fs * 0.14;
  const x0 = Math.max(0, Math.floor(t.x * k) + 1), y0 = Math.max(0, Math.floor(top * k) + 1), x1 = Math.min(png.w - 1, Math.ceil((t.x + t.w) * k) - 1), y1 = Math.min(png.h - 1, Math.ceil(bot * k) - 1);
  if (x1 <= x0 || y1 <= y0) return null;
  const nx = Math.min(24, x1 - x0), ny = Math.min(8, y1 - y0), list = [];
  for (let iy = 0; iy <= ny; iy++) for (let ix = 0; ix <= nx; ix++) {
    const px = Math.round(x0 + ((x1 - x0) * ix) / Math.max(1, nx)), py = Math.round(y0 + ((y1 - y0) * iy) / Math.max(1, ny)), o = (py * png.w + px) * png.ch;
    const bg = [png.data[o], png.data[o + 1], png.data[o + 2]], a = Math.min(1, t.alpha);
    const fg = [0, 1, 2].map((i) => t.color[i] * a + bg[i] * (1 - a));
    list.push(ratio(fg, bg));
  }
  list.sort((p, q) => p - q);
  return list[Math.floor((list.length - 1) * LIMITS.contrast.percentile)];
}

const overlap = (a, b) => Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > 2 && Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > 2;
const short = (s, n = 44) => { s = String(s || '').trim(); return s.length > n ? s.slice(0, n - 1).trim() + '...' : s; };
const px = (v) => (Math.round(v * 10) / 10) + ' px';
const isMedia = (s) => typeof s === 'string' && /\.(mp4|webm|mov|m4v|jpe?g|png|webp|avif|gif|svg)$/i.test(s);
const isVideo = (s) => typeof s === 'string' && /\.(mp4|webm|mov|m4v)$/i.test(s);
function folderSize(dir) { let n = 0; if (!fs.existsSync(dir)) return 0; for (const e of fs.readdirSync(dir, {withFileTypes: true})) { const p = path.join(dir, e.name); n += e.isDirectory() ? folderSize(p) : fs.statSync(p).size; } return n; }
const FRAME_WORD = {deck: 'deck', site: 'web', phone: 'phone'};

export async function check(projectDir, opts = {}) {
  const frames = opts.frames && opts.frames.length ? opts.frames : ['deck', 'site', 'phone'];
  const R = {ok: false, errors: [], advice: [], facts: [], scenes: [], frames, report: null};
  const seen = new Set();
  const add = (level, what, msg, at = {}) => {
    const key = level + '|' + what + '|' + (at.scene || 0) + '|' + (at.frame || '') + '|' + msg;
    if (seen.has(key)) return; seen.add(key);
    (level === 'ERROR' ? R.errors : R.advice).push({level, what, msg, ...at});
  };
  let b;
  try { b = opts.built || await build(projectDir, {stages: [...new Set(frames.map((f) => FRAMES[f].stage))], ...(opts.build || {})}); }
  catch (e) {
    for (const p of e.problems || [e.message]) add('ERROR', 'story', p);
    return finish(R, opts.out || (fs.existsSync(projectDir) && fs.statSync(projectDir).isDirectory() ? path.join(projectDir, 'out') : path.dirname(projectDir)), null, opts);
  }
  const story = b.story, K = byKind(b.catalog);
  const where = (i, sc, f) => ({scene: i + 1, id: sc.id, kind: sc.kind, frame: f});
  const tag = (i, sc, f) => `scene ${i + 1} "${sc.id}" (${sc.kind}${f ? ', ' + FRAME_WORD[f] : ''})`;

  // ---- things that need no browser ----
  for (const stage of [...new Set(frames.map((f) => FRAMES[f].stage))]) {
    const scenes = story.scenes.filter((s) => s.only !== (stage === 'deck' ? 'site' : 'deck'));
    const fam = {};
    scenes.forEach((s, i) => { const m = K[s.kind]; if (!m) return; (fam[m.family] = fam[m.family] || []).push(i + 1); });
    // one design many times reads flat; in a longer deck a design may come back once every four slides
    const allow = Math.max(LIMITS.family, Math.ceil(scenes.length / 4));
    for (const [f, list] of Object.entries(fam)) if (list.length > allow) add('ADVICE', 'repeat', `The ${stage === 'deck' ? 'deck' : 'website'} uses the design "${f}" ${list.length} times (scenes ${list.join(', ')}). Up to ${allow} reads better for ${scenes.length} scenes: give scene ${list.slice(allow).join(', ')} another block (run \`${RUN} catalog\`).`, {frame: stage === 'deck' ? 'deck' : 'site'});
    // the same design twice in a row looks like a mistake, except chapter openers
    scenes.forEach((s, i) => { if (!i) return; const a = K[scenes[i - 1].kind], m = K[s.kind]; if (a && m && a.family === m.family && m.use !== 'chapter') add('ADVICE', 'repeat', `Scenes ${i} and ${i + 1} use the same design "${m.family}" back to back. Change one of them, or put a picture, a chart or a chapter between them.`, {frame: stage === 'deck' ? 'deck' : 'site'}); });
    // words only, three screens in a row: the audience needs something to look at
    { let run = []; const flush = () => { if (run.length >= LIMITS.typeRun) add('ADVICE', 'pictures', `Scenes ${run.join(', ')} of the ${stage === 'deck' ? 'deck' : 'website'} are words only, ${run.length} in a row. Put a picture, a clip, a chart or a diagram between them: blocks marked "picture" in \`${RUN} catalog\`.`, {frame: stage === 'deck' ? 'deck' : 'site'}); run = []; };
      scenes.forEach((s, i) => { const m = K[s.kind]; if (m && m.lead === 'type') run.push(i + 1); else flush(); }); flush(); }
    if (stage === 'deck') {
      const none = scenes.map((s, i) => (s.notes ? null : i + 1)).filter(Boolean);
      if (none.length) add('ADVICE', 'notes', none.length === scenes.length ? 'No scene has speaker notes. Put what you will say in "notes": it shows in the presenter view (press S) and in the PPTX.' : `Scenes ${none.join(', ')} have no speaker notes ("notes").`, {frame: 'deck'});
    }
    scenes.forEach((s, i) => {
      const m = K[s.kind] || {};
      if (m.use === 'person' && isMedia(s.src) && !s.face) add('ADVICE', 'face', `${tag(i, s)}: the picture has no "face" box. Write "face": [x, y, w, h] (0 to 1 of the picture) and the check will keep text off the face.`, where(i, s));
      if (isVideo(s.src) && !s.poster) add('ADVICE', 'poster', `${tag(i, s)}: the video has no "poster". Add a still so phones in low power mode, which do not autoplay, still show a picture.`, where(i, s));
    });
  }

  // ---- people: eyes open and on the camera, where this computer can tell (macOS with Swift) ----
  const eyeJobs = [], eyeTmp = [];      // {file, scene index, sc, which, fix}
  const canEyes = opts.eyes !== false && eyesAvailable();
  if (canEyes) {
    const seenFile = new Set();
    story.scenes.forEach((sc, i) => {
      const walk = (o) => {
        if (!o || typeof o !== 'object') return;
        if (Array.isArray(o)) return o.forEach(walk);
        if (o.face && typeof o.src === 'string') {
          const still = isVideo(o.src) ? o.poster : o.src;
          if (typeof still === 'string' && /\.(jpe?g|png|webp)$/i.test(still) && !seenFile.has(i + still)) { seenFile.add(i + still); eyeJobs.push({file: path.join(story.__dir, still), i, sc, which: (isVideo(o.src) ? 'the poster' : 'the picture') + ' "' + still + '"', fix: isVideo(o.src) ? 'Take the poster from a frame where the eyes are open and on the camera.' : 'Use a picture where the eyes are open and on the camera.'}); }
          if (isVideo(o.src) && findFfmpeg() && fs.existsSync(path.join(story.__dir, o.src)) && !seenFile.has(i + o.src)) {
            seenFile.add(i + o.src);
            const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'cs-eyes-')), 'first.jpg'); eyeTmp.push(path.dirname(f));
            try { ffmpeg(['-i', path.join(story.__dir, o.src), '-frames:v', '1', '-q:v', '3', f]); eyeJobs.push({file: f, i, sc, which: 'the first frame of "' + o.src + '"', fix: 'Trim the start of the clip so that it opens with the eyes open and on the camera (Jay: a clip that starts looking down is a weak start).'}); } catch {}
          }
        }
        for (const v of Object.values(o)) if (v && typeof v === 'object') walk(v);
      };
      walk(sc);
    });
  }

  // ---- the browser ----
  const chrome = findChrome();
  if (!chrome) { add('ERROR', 'chrome', 'No Chrome was found, so nothing could be measured. Install Google Chrome (or Edge / Chromium), or set CONNECT_AI_CHROME to a Chrome binary.'); return finish(R, b.out, b, opts); }
  const browser = opts.browser || await openBrowser();
  const table = {};
  try {
    for (const f of frames) {
      const st = await openStage(browser, b.out, f);
      const {page, plan, frame: fr} = st, sched = plan.schedule, deck = fr.stage === 'deck';
      const scenes = story.scenes.filter((s) => s.only !== (deck ? 'site' : 'deck'));
      const k = fr.dpr;     // css px -> screenshot px
      const ref = [];       // visible text count a person sees on arrival (for the reduced-motion pass)
      R.facts.push(`${fr.label}: ${sched.length} scenes, ${plan.duration.toFixed(1)} s when it plays by itself`);
      for (let i = 0; i < sched.length; i++) {
        const sc = scenes[i], m = K[sc.kind] || {}, at = where(i, sc, f), T = tag(i, sc, f), row = (table[sc.id] = table[sc.id] || {id: sc.id, kind: sc.kind, n: story.scenes.indexOf(sc) + 1});
        if (sched[i].error) { add('ERROR', 'block', `${T}: the block stopped with "${sched[i].error}". Check the scene's props against \`${RUN} catalog\`.`, at); continue; }
        const flow = m.overflow === 'flow';
        // half way: only the face rule (nothing may cross the face while it moves)
        await page.evaluate((i) => CS.capture.goto(i, 0.5), i);
        const mid = await page.evaluate((i) => CS.measure(document.querySelectorAll('.cs-frame')[i]), i);
        faceRule(mid, 'while it moves', true);
        // the finished screen
        await page.evaluate((i) => CS.capture.goto(i, 1), i);
        const M = await page.evaluate((i) => CS.measure(document.querySelectorAll('.cs-frame')[i]), i);
        const F = M.frames[i] || {x: 0, y: 0, w: M.vw, h: M.vh};
        const texts = M.texts.filter((t) => t.frame === i && t.cut < 0.97);
        const real = texts.filter((t) => !t.deco);
        faceRule(M, 'on the finished screen');
        if (canEyes && !row.eyes) {
          row.eyes = 1;
          for (const [n, fc] of M.faces.filter((x) => x.frame === i && x.what !== 'body').entries()) {
            const gx = fc.w * 0.3, gy = fc.h * 0.3, cx0 = Math.max(0, fc.x - gx), cy0 = Math.max(0, fc.y - gy), cw = Math.min(M.vw, fc.x + fc.w + gx) - cx0, ch = Math.min(M.vh, fc.y + fc.h + gy) - cy0;
            if (cw < 40 || ch < 40) continue;
            const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cs-eyes-')); eyeTmp.push(dir);
            const file = path.join(dir, 'shown.png');
            try { await page.screenshot({path: file, type: 'png', clip: {x: cx0, y: cy0, width: cw, height: ch}}); eyeJobs.push({file, i: story.scenes.indexOf(sc), sc, which: deck ? 'the finished slide (the frame that goes into the PDF, the PPTX and a thumbnail)' : 'the finished screen', fix: 'Trim the clip, or use a still, so that this frame has the eyes open and on the camera.'}); } catch {}
          }
        }
        for (const p of M.problems) add('ERROR', 'media', `${T}: ${p}. Re-encode the file as H.264 mp4 (yuv420p) and try again.`, at);
        for (const im of M.imgs) { if (im.broken) add('ERROR', 'broken', `${T}: the picture "${im.src}" does not load. Check the path in story.json (paths are relative to the story folder).`, at); else if (im.alt == null) add('ADVICE', 'alt', `${T}: the picture "${im.src}" has no alt text. Say what it shows in "alt".`, at); }
        for (const v of M.videos) if (v.broken) add('ERROR', 'broken', `${T}: the video "${v.src}" does not play. Use H.264 mp4 or webm.`, at);

        // words on one screen
        // in a chart or a table the numbers are part of the picture, not words to read
        const words = real.reduce((n, t) => n + countWords(m.lead === 'picture' ? String(t.text).replace(/(^|\s)[-+]?[\d.,%]{1,5}(?=\s|$)/g, ' ') : t.text), 0);
        if (deck) {
          if (words > LIMITS.deck.wordsError) add('ERROR', 'words', `${T}: ${words} words on one slide. A slide carries one message: keep up to ${LIMITS.deck.wordsAdvice}, move the rest to "notes" or split the scene in two.`, at);
          else if (words > LIMITS.deck.wordsAdvice) add('ADVICE', 'words', `${T}: ${words} words on one slide. Under ${LIMITS.deck.wordsAdvice} is easier to take in while you talk.`, at);
        } else if (words > LIMITS.web.wordsAdvice) add('ADVICE', 'words', `${T}: ${words} words on one screen. Split it into two scenes or cut it under ${LIMITS.web.wordsAdvice}.`, at);

        // type size
        const norm = deck ? 1920 / (F.w || 1920) : 1;
        const sized = real.filter((t) => !t.outline).map((t) => ({...t, px: t.size * norm}));
        let minPx = Infinity;
        for (const t of sized) minPx = Math.min(minPx, t.px);
        if (deck) {
          const bad = sized.filter((t) => t.px < LIMITS.deck.fontError).sort((p, q) => p.px - q.px), soft = sized.filter((t) => t.px >= LIMITS.deck.fontError && t.px < LIMITS.deck.fontAdvice).sort((p, q) => p.px - q.px);
          if (bad.length) add('ERROR', 'font', `${T}: "${short(bad[0].text)}" is ${px(bad[0].px)} on a 1920x1080 slide${bad.length > 1 ? ' (and ' + (bad.length - 1) + ' more under ' + LIMITS.deck.fontError + ' px)' : ''}. The back row cannot read under ${LIMITS.deck.fontError} px: shorten the text, use fewer items, or pick a block with larger type.`, at);
          else if (soft.length) add('ADVICE', 'font', `${T}: "${short(soft[0].text)}" is ${px(soft[0].px)} on a 1920x1080 slide${soft.length > 1 ? ' (and ' + (soft.length - 1) + ' more under ' + LIMITS.deck.fontAdvice + ' px)' : ''}. Fine for a label; body text should be ${LIMITS.deck.fontAdvice} px or more.`, at);
        } else {
          const bad = sized.filter((t) => t.px < LIMITS.web.fontError - 0.05).sort((p, q) => p.px - q.px), soft = sized.filter((t) => t.px >= LIMITS.web.fontError - 0.05 && t.px < LIMITS.web.bodyAdvice - 0.05 && countWords(t.text) >= LIMITS.web.bodyWords);
          if (bad.length) add('ERROR', 'font', `${T}: the text "${short(bad[0].text)}" is ${px(bad[0].px)} on a ${fr.w} px ${f === 'phone' ? 'phone' : 'screen'}${bad.length > 1 ? ' (and ' + (bad.length - 1) + ' more under ' + LIMITS.web.fontError + ' px)' : ''}. Shorten it or use a block with fewer columns.`, at);
          if (soft.length) add('ADVICE', 'font', `${T}: the sentence "${short(soft[0].text)}" is ${px(soft[0].px)}. Body text reads best at ${LIMITS.web.bodyAdvice} px or more.`, at);
        }

        // words on words: two pieces of text from different boxes drawn on top of each other (a layout that collapsed)
        { const ink = (t) => ({x: t.x, y: t.y + t.h * 0.18, w: t.w, h: t.h * 0.64});
          const solid = real.filter((t) => !t.outline && t.alpha >= 0.5 && t.box != null);
          let clash = null;
          for (let a = 0; a < solid.length && !clash; a++) for (let c = a + 1; c < solid.length; c++) {
            const A = ink(solid[a]), B = ink(solid[c]); if (solid[a].box === solid[c].box) continue;
            const ix = Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x), iy = Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y);
            if (ix > 2 && iy > 2 && ix * iy > LIMITS.design.clash * Math.min(A.w * A.h, B.w * B.h)) { clash = [solid[a], solid[c]]; break; }
          }
          if (clash) add('ERROR', 'overlap', `${T}: "${short(clash[0].text)}" and "${short(clash[1].text)}" are drawn on top of each other. The layout has no room for them in this frame: use fewer or shorter items, or another block.`, at); }

        // cut off, edges
        if (!flow) {
          // cutY is measured on the ink of the lines, not on their taller boxes (see CS.measure)
          const cut = real.filter((t) => (t.cutX > 0.03 && t.w * t.cutX > 2) || t.cutY > 0.04);
          if (cut.length) add('ERROR', 'cut', `${T}: "${short(cut[0].text)}" is cut off at the edge of the ${deck ? 'slide' : 'screen'}${cut.length > 1 ? ' (and ' + (cut.length - 1) + ' more)' : ''}. Shorten the text or use fewer items.`, at);
          const gone = M.texts.filter((t) => t.frame === i && !t.deco && t.cut >= 0.97);
          if (gone.length) add('ERROR', 'cut', `${T}: "${short(gone[0].text)}" ends up outside the ${deck ? 'slide' : 'screen'} and is never seen${gone.length > 1 ? ' (and ' + (gone.length - 1) + ' more)' : ''}. Use fewer items or a block that fits them.`, at);
          if (deck) {
            const ex = F.w * LIMITS.deck.edge, ey = F.h * LIMITS.deck.edge;
            const edge = real.filter((t) => t.cutX <= 0.03 && t.cutY <= 0.04 && (t.x < F.x + ex - 1 || t.y < F.y + ey - 1 || t.x + t.w > F.x + F.w - ex + 1 || t.y + t.h > F.y + F.h - ey + 1));
            if (edge.length) add('ADVICE', 'edge', `${T}: "${short(edge[0].text)}" sits in the outer 3 % of the slide. Some projectors crop the edge.`, at);
          }
        }

        // contrast, against the real pixels behind the glyphs
        await page.evaluate(() => CS.hideText(true));
        const png = readPng(Buffer.from(await page.screenshot({type: 'png'})));
        await page.evaluate(() => CS.hideText(false));
        let minC = Infinity, worst = null, ghosts = [];
        for (const t of sized) {
          if (t.outline) continue;
          if (t.alpha < LIMITS.contrast.ghost) { if (countWords(t.text) >= 3) ghosts.push(t); continue; }
          const c = contrastOf(t, png, k); if (c == null) continue;
          const large = t.px >= LIMITS.contrast.largePx || (t.weight >= 600 && t.px >= LIMITS.contrast.boldPx), need = large ? LIMITS.contrast.large : LIMITS.contrast.normal;
          if (c < minC) minC = c;
          if (c < need && (!worst || c / need < worst.c / worst.need)) worst = {t, c, need, large};
        }
        if (worst) add('ERROR', 'contrast', `${T}: "${short(worst.t.text)}" has a contrast of ${worst.c.toFixed(1)} against what is behind it (needs ${worst.need}${worst.large ? ' for large type' : ''}). Use the look's ink colour for it, or put it on the plain side of the picture.`, at);
        if (ghosts.length) add('ADVICE', 'contrast', `${T}: "${short(ghosts[0].text)}" is drawn very faint (${Math.round(ghosts[0].alpha * 100)} % opacity). If people must read it, it is too light.`, at);

        // design: how much of the slide carries something (pictures, lines, words), and how many type sizes
        if (deck) {
          const D = LIMITS.design, GX = 32, GY = 18, used = new Uint8Array(GX * GY), cw = F.w / GX, ch = F.h / GY;
          const lum = (o) => 0.2126 * png.data[o] + 0.7152 * png.data[o + 1] + 0.0722 * png.data[o + 2];
          const means = [];
          for (let gy = 0; gy < GY; gy++) for (let gx = 0; gx < GX; gx++) {
            let n = 0, sum = 0, sq = 0;
            for (let sy = 0; sy < 6; sy++) for (let sx = 0; sx < 6; sx++) {
              const px = Math.min(png.w - 1, Math.max(0, Math.round((F.x + (gx + (sx + 0.5) / 6) * cw) * k))), py = Math.min(png.h - 1, Math.max(0, Math.round((F.y + (gy + (sy + 0.5) / 6) * ch) * k)));
              const v = lum((py * png.w + px) * png.ch); n++; sum += v; sq += v * v;
            }
            const mean = sum / n, sd = Math.sqrt(Math.max(0, sq / n - mean * mean));
            means.push(mean); if (sd > D.cell) used[gy * GX + gx] = 1;
          }
          const bgMean = [...means].sort((p, q) => p - q)[Math.floor(means.length / 2)];
          means.forEach((mv, j) => { if (Math.abs(mv - bgMean) > 22) used[j] = 1; });
          for (const t of real) { const x0 = Math.floor((t.x - F.x) / cw), x1 = Math.floor((t.x + t.w - F.x) / cw), y0 = Math.floor((t.y - F.y) / ch), y1 = Math.floor((t.y + t.h - F.y) / ch); for (let gy = Math.max(0, y0); gy <= Math.min(GY - 1, y1); gy++) for (let gx = Math.max(0, x0); gx <= Math.min(GX - 1, x1); gx++) used[gy * GX + gx] = 1; }
          // the footer band (brand and page number) is not content
          let n = 0, tot = 0, bx0 = GX, bx1 = -1, by0 = GY, by1 = -1;
          for (let gy = 0; gy < GY - 2; gy++) for (let gx = 0; gx < GX; gx++) { tot++; if (used[gy * GX + gx]) { n++; bx0 = Math.min(bx0, gx); bx1 = Math.max(bx1, gx); by0 = Math.min(by0, gy); by1 = Math.max(by1, gy); } }
          const fill = n / tot, spanW = bx1 >= bx0 ? (bx1 - bx0 + 1) / GX : 0, spanH = by1 >= by0 ? (by1 - by0 + 1) / (GY - 2) : 0;
          row.__fill = Math.round(fill * 100);
          if (fill < D.empty) add('ADVICE', 'empty', `${T}: the slide looks empty, things fill ${Math.round(fill * 100)} % of it (they span ${Math.round(spanW * 100)} % of the width, ${Math.round(spanH * 100)} % of the height). Use a block that fills the frame (a picture, a chart, larger type), or join this slide with the next.`, at);
          else if (fill > D.crowded && words > D.crowdedWords) add('ADVICE', 'crowded', `${T}: the slide is crowded, things fill ${Math.round(fill * 100)} % of it with ${words} words. Give it room: move words into "notes" or split it.`, at);
          const sizes = [...new Set(real.filter((t) => !t.outline).map((t) => Math.round((t.size * norm) / 6) * 6))];
          if (sizes.length > D.sizes) add('ADVICE', 'type', `${T}: ${sizes.length} different type sizes on one slide (${sizes.sort((p, q) => q - p).map((v) => v + ' px').join(', ')}). Three or four read calmer: a title, a body size and a label.`, at);
        }

        // phone: sideways scroll, things to tap
        if (f === 'phone') {
          if (M.scrollW > M.vw + 1) add('ERROR', 'overflow', `The page is ${M.scrollW} px wide on a ${M.vw} px phone, so it scrolls sideways (seen at ${tag(i, sc)}). A long word or a wide row does not fit: shorten it or use fewer columns.`, {frame: f});
          for (const a of M.taps) if (a.w < LIMITS.web.tap - 0.5 || a.h < LIMITS.web.tap - 0.5) add('ERROR', 'tap', `${a.nav ? 'The header link' : T + ': the link'} "${short(a.text, 30)}" is ${Math.round(a.w)}x${Math.round(a.h)} px. A finger needs ${LIMITS.web.tap}x${LIMITS.web.tap} px.`, a.nav ? {frame: f} : at);
        }

        // motion (measured once, on the first frame that shows the scene)
        if (row.motion == null) {
          const stops = sched[i].stops || [sched[i].clipDur];
          row.dur = sched[i].clipDur; row.lib = sched[i].lib; row.steps = stops.length - 1;
          if (stops.length > 1) {
            let prev = 0, longest = 0; for (const s of stops) { longest = Math.max(longest, s - prev); prev = s; }
            row.motion = longest;
            if (longest > LIMITS.motion.step) add('ADVICE', 'motion', `${tag(i, sc)}: one click step plays for ${longest.toFixed(1)} s. Over ${LIMITS.motion.step} s the room waits for the slide.`, where(i, sc));
          } else {
            const rd = await page.evaluate((i) => CS.readable(i), i);
            row.motion = rd.t;
            if (rd.t > LIMITS.motion.readable && !(sched[i].mode === 'scrub')) add('ADVICE', 'motion', `${tag(i, sc)}: the text is fully readable only after ${rd.t.toFixed(1)} s. Over ${LIMITS.motion.readable} s the audience waits: use a shorter block, or one with click steps.`, where(i, sc));
            if (sched[i].clipDur > LIMITS.motion.long) add('ADVICE', 'motion', `${tag(i, sc)}: the animation runs ${sched[i].clipDur.toFixed(1)} s with no click steps. Over ${LIMITS.motion.long} s is long for one slide.`, where(i, sc));
          }
        }
        if (!deck && sched[i].mode === 'scrub' && (sched[i].len < LIMITS.motion.scrubMin || sched[i].len > LIMITS.motion.scrubMax)) add('ADVICE', 'motion', `${tag(i, sc)}: it stays pinned for ${sched[i].len} screens of scrolling ("site": {"len"}). Between ${LIMITS.motion.scrubMin} and ${LIMITS.motion.scrubMax} feels right.`, where(i, sc));

        // what a person sees on arrival, for the reduced-motion pass
        if (deck && (sched[i].stops || []).length > 1) { await page.evaluate((i, w) => CS.capture.goto(i, w), i, sched[i].stops[0] / sched[i].clipDur); const m0 = await page.evaluate((i) => CS.measure(document.querySelectorAll('.cs-frame')[i]), i); ref[i] = m0.texts.filter((t) => t.frame === i && !t.deco && t.alpha >= 0.5 && t.cut < 0.97).length; }
        else ref[i] = real.filter((t) => t.alpha >= 0.5).length;

        row[f] = {words, minPx: isFinite(minPx) ? Math.round(minPx * 10) / 10 : null, minContrast: isFinite(minC) ? Math.round(minC * 10) / 10 : null, ...(deck && row.__fill != null ? {fill: row.__fill} : {})}; delete row.__fill;

        function faceRule(mm, when, moving) {
          for (const face of mm.faces.filter((x) => x.frame === i)) {
            const hit = mm.texts.filter((t) => t.frame === i && t.cut < 0.97 && overlap(t, face));
            const body = face.what === 'body';
            if (hit.length) add('ERROR', 'face', body ? `${T}: "${short(hit[0].text)}" is on the person ${when}. Nothing goes on a person: put the words on the other side ("side"), or check the "body" box.` : `${T}: "${short(hit[0].text)}" is on the face ${when}. Nothing goes on a face: put the words on the other side ("side"), or check the "face" box.`, at);
            const sh = mm.shapes.filter((s) => s.frame === i && !(moving && s.cover));      // a background-coloured cover that is opening is a reveal
            if (sh.length && !hit.length) add('ERROR', 'face', `${T}: a graphic (<${sh[0].tag}>${sh[0].cls ? ' .' + sh[0].cls.split(' ')[0] : ''}) is drawn over the ${body ? 'person' : 'face'} ${when}. Nothing goes on a ${body ? 'person' : 'face'}: change "side", or check the "${body ? 'body' : 'face'}" box.`, at);
          }
        }
      }
      // page level
      for (const e of [...new Set(st.log.errors)].filter((e) => !/Failed to load resource/.test(e)).slice(0, 6)) add('ERROR', 'page', `The ${FRAME_WORD[f]} page reported an error: ${short(e, 200)}`, {frame: f});
      for (const u of [...new Set(st.log.external)].slice(0, 6)) add('ERROR', 'external', `The ${deck ? 'deck' : 'website'} asks the internet for ${short(u, 120)}. Everything must be inside the folder (no CDN, no remote fonts or pictures): put the file in the project and use its path.`, {frame: deck ? 'deck' : 'site'});
      for (const u of [...new Set(st.log.failed)].slice(0, 6)) add('ERROR', 'missing', `A file was not found: ${u}. Check the path in story.json (paths are relative to the story folder).`, {frame: deck ? 'deck' : 'site'});
      await page.close();

      // the phone's first screen: how much it downloads before the page is there
      if (f === 'phone' && opts.weight !== false) {
        try {
          const w = await firstScreen(browser, b.out, 'phone');
          const kb = Math.round(w.bytes / 1024);
          const top = Object.entries(w.kinds).sort((a, c) => c[1] - a[1]).slice(0, 3).map(([k, v]) => `${k} ${Math.round(v / 1024)} KB`).join(', ');
          R.firstScreen = {kb, ...w};
          R.facts.push(`phone first screen: ${kb} KB in ${w.files - w.videos} files before the page is there (${top}${w.videos ? `; ${w.videos} video${w.videos > 1 ? 's' : ''} stream after` : ''}; from disk, a server that compresses sends less)`);
          if (w.bytes > LIMITS.firstKB * 1024) add('ADVICE', 'weight', `On a phone the website loads ${kb} KB before it can be seen (over ${LIMITS.firstKB} KB): ${top}. Make big pictures smaller (1600 px wide is plenty), use a video with a poster instead of a large GIF, or move heavy scenes lower.`, {frame: 'phone'});
        } catch (e) { R.facts.push('phone first screen: not measured (' + short(String(e.message || e), 80) + ')'); }
      }

      // reduced motion: the same words must be there without any animation (once per stage)
      if (f !== 'phone' && opts.reduced !== false) {
        const rs = await openStage(browser, b.out, f, {query: '&reduced=1'});
        for (let i = 0; i < sched.length; i++) {
          await rs.page.evaluate((i) => CS.capture.visit(i), i);
          const m = await rs.page.evaluate((i) => CS.measure(document.querySelectorAll('.cs-frame')[i]), i);
          const n = m.texts.filter((t) => t.frame === i && !t.deco && t.alpha >= 0.5 && t.cut < 0.97).length;
          if (n < ref[i]) add('ERROR', 'reduced', `${tag(i, scenes[i], f)}: with "reduce motion" switched on, ${ref[i] - n} of ${ref[i]} pieces of text stay hidden. The block must show its finished screen at seek(dur): fix the block or use another one.`, where(i, scenes[i], f));
        }
        await rs.page.close();
      }
    }
  } finally { if (!opts.browser) await closeBrowser(browser); }

  // ---- eyes ----
  const people = story.scenes.some((sc) => JSON.stringify(sc).includes('"face"'));
  if (canEyes && eyeJobs.length) {
    const res = measureEyes(eyeJobs.map((j) => j.file)); let judged = 0, good = 0;
    for (const j of eyeJobs) {
      const m = res[j.file], v = eyeVerdict(m); if (!v) continue; judged++;
      if (v === 'ok') { good++; continue; }
      const T = `scene ${j.i + 1} "${j.sc.id}" (${j.sc.kind})`;
      if (v === 'half') add('ADVICE', 'eyes', `${T}: the eyes are half closed in ${j.which}, probably a blink (eye opening ${m.open.toFixed(2)}, open eyes measure ${LIMITS.eyes.open} or more). ${j.fix}`, {scene: j.i + 1, id: j.sc.id, kind: j.sc.kind});
      else if (v === 'closed') add('ADVICE', 'eyes', `${T}: the eyes look closed in ${j.which} (eye opening ${m.open.toFixed(2)}, open eyes measure ${LIMITS.eyes.closed} or more). ${j.fix}`, {scene: j.i + 1, id: j.sc.id, kind: j.sc.kind});
      else add('ADVICE', 'eyes', `${T}: the person seems to look down, not at the camera, in ${j.which} (pupil height ${m.py.toFixed(2)}, on the camera is about ${LIMITS.eyes.down} or more). ${j.fix}`, {scene: j.i + 1, id: j.sc.id, kind: j.sc.kind});
    }
    R.facts.push(judged ? `eye check: ${judged} pictures of people measured (poster, first frame, finished screen), ${good} with open eyes on the camera` : `eye check: ${eyeJobs.length} pictures looked at, no face found to judge (a drawing, a back view or a very small face). Look at them yourself: eyes open, on the camera.`);
  } else if (people && opts.eyes !== false) R.facts.push('eye check: skipped (it needs macOS with Swift for face landmarks). Look at the posters and first frames of people yourself: eyes open, on the camera.');
  for (const d of eyeTmp) fs.rmSync(d, {recursive: true, force: true});

  const sources = [...new Set(story.scenes.map((s) => (K[s.kind] || {source: {}}).source.type).filter(Boolean))];
  R.facts.unshift(`${story.scenes.length} scenes from ${sources.length} sources: ${sources.join(', ')}`);
  for (const stage of ['deck', 'site']) { const d = path.join(b.out, stage); if (!fs.existsSync(d)) continue; const mb = folderSize(d) / 1e6; R.facts.push(`out/${stage} is ${mb.toFixed(1)} MB`); if (mb > LIMITS.folderMB) add('ADVICE', 'size', `out/${stage} is ${mb.toFixed(1)} MB. Over ${LIMITS.folderMB} MB loads slowly on a phone: shorten or re-encode the videos.`, {frame: stage}); }
  R.facts.push('browser: ' + path.basename(chrome).replace(/\.exe$/, ''));
  R.scenes = Object.values(table).sort((a, b2) => a.n - b2.n);
  return finish(R, b.out, b, opts);
}

function finish(R, outDir, b, opts) {
  R.ok = R.errors.length === 0;
  const L = [];
  L.push(`# ${NAME} check`, '');
  L.push(R.ok ? `**PASS**: 0 errors, ${R.advice.length} ${R.advice.length === 1 ? 'piece' : 'pieces'} of advice.` : `**FAIL**: ${R.errors.length} ${R.errors.length === 1 ? 'error' : 'errors'}, ${R.advice.length} ${R.advice.length === 1 ? 'piece' : 'pieces'} of advice. Fix every ERROR in story.json, then run check again.`, '');
  if (R.errors.length) { L.push('## Errors', ''); for (const e of R.errors) L.push('- ERROR ' + e.msg); L.push(''); }
  if (R.advice.length) { L.push('## Advice', ''); for (const e of R.advice) L.push('- ADVICE ' + e.msg); L.push(''); }
  if (R.facts.length) { L.push('## Facts', ''); for (const f of R.facts) L.push('- ' + f); L.push(''); }
  if (R.scenes.length) {
    const cell = (v) => (v == null ? '' : v);
    L.push('## Scenes', '', '| # | id | block | motion | steps | words (deck) | fill (deck) | smallest type deck / web / phone | lowest contrast |', '|---|---|---|---|---|---|---|---|---|');
    for (const s of R.scenes) L.push(`| ${s.n} | ${s.id} | ${s.kind} | ${s.dur != null ? s.dur.toFixed(1) + ' s' : ''} | ${cell(s.steps)} | ${cell((s.deck || s.site || {}).words)} | ${s.deck && s.deck.fill != null ? s.deck.fill + ' %' : ''} | ${['deck', 'site', 'phone'].map((f) => (s[f] && s[f].minPx != null ? s[f].minPx : '-')).join(' / ')} | ${cell(Math.min(...['deck', 'site', 'phone'].map((f) => (s[f] && s[f].minContrast != null ? s[f].minContrast : Infinity))) === Infinity ? '' : Math.min(...['deck', 'site', 'phone'].map((f) => (s[f] && s[f].minContrast != null ? s[f].minContrast : Infinity))))} |`);
    L.push('');
  }
  L.push('## What this check cannot see', '', '- The real room: projector brightness, screen size, the back row.', '- A real phone: open the site on yours (`' + RUN + ' serve <project>` prints an address for the same Wi-Fi).', '- Whether the words are true. Only you know that.', '');
  R.text = L.join('\n');
  if (opts.write !== false) {
    try { fs.mkdirSync(outDir, {recursive: true}); fs.writeFileSync(path.join(outDir, 'report.md'), R.text); fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify({ok: R.ok, errors: R.errors, advice: R.advice, facts: R.facts, scenes: R.scenes, frames: R.frames}, null, 2)); R.report = path.join(outDir, 'report.md'); } catch {}
  }
  return R;
}
