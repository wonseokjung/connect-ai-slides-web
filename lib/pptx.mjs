// A real PowerPoint file from the deck: every word is an editable text box at the place it has on the slide, the
// motion of each slide plays as a video clip behind the words, and your speaker notes come along.
//   editable (default)  text boxes + the slide's motion as an mp4 clip that starts by itself (Start: Automatically)
//   --click             the clip starts on a click instead
//   --no-video          text boxes on a still picture of the slide (no clips)
//   google              text boxes on a still picture: Google Slides imports text and pictures, not videos in a .pptx
//   pictures            one finished screen per slide as a picture (the 0.2 export; words are not editable)
// How: the finished slide is read in Chrome (lib/pagetext.js: lines, colours, sizes), the words are hidden, and what
// is left (the "plate") is captured as a still and, frame by frame, as a clip. MIT, CONNECT AI LAB.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {findFfmpeg, readPng} from './tools.mjs';
import {recordStage} from './shoot.mjs';
import {sceneText} from './build.mjs';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const IN = 13.333333 / 1920;          // inches per slide pixel (LAYOUT_WIDE is 13.333 x 7.5 in)
const PT = 0.5;                       // points per slide pixel

// font names PowerPoint and Keynote understand, by weight
const NAMED = {
  Pretendard: {100: 'Thin', 200: 'ExtraLight', 300: 'Light', 500: 'Medium', 600: 'SemiBold', 800: 'ExtraBold', 900: 'Black'},
  Inter: {100: 'Thin', 200: 'ExtraLight', 300: 'Light', 500: 'Medium', 600: 'SemiBold', 800: 'ExtraBold', 900: 'Black'},
  'Apple SD Gothic Neo': {100: 'Thin', 200: 'UltraLight', 300: 'Light', 500: 'Medium', 600: 'SemiBold', 800: 'ExtraBold', 900: 'Heavy'},
  'Helvetica Neue': {100: 'UltraLight', 200: 'Thin', 300: 'Light', 500: 'Medium', 600: 'Medium'},
  'Noto Sans KR': {100: 'Thin', 200: 'ExtraLight', 300: 'Light', 500: 'Medium', 600: 'SemiBold', 800: 'ExtraBold', 900: 'Black'},
};
const SYSTEM = /^(\.SF|SF Pro|System Font|\.AppleSystem|-apple-system|BlinkMacSystemFont)/i;
const CJK = /Pretendard|Gothic|Noto Sans (KR|CJK)|Malgun|Nanum|Myeongjo|Spoqa|SUIT|Batang|Dotum|Gulim/i;
const HANGUL = /[ㄱ-ㆎ가-힣]/;

export function faceFor(family, weight) {
  let fam = SYSTEM.test(family) ? 'Helvetica Neue' : family;
  const w = Math.round((+weight || 400) / 100) * 100;
  const table = NAMED[fam];
  if (!table || w === 400 || w >= 700 && !table[w]) return {face: fam, bold: w >= 700};
  const name = table[w] || table[w - 100] || table[w + 100];
  return {face: name ? `${fam} ${name}` : fam, bold: !name && w >= 700};
}

// which installed font Chrome really drew each box with (the CSS list names fonts a computer may not have)
async function platformFonts(page, tags) {
  const out = {};
  let cdp;
  try {
    cdp = await page.createCDPSession();
    await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
    const {root} = await cdp.send('DOM.getDocument', {depth: 0});
    for (const t of tags) {
      const {nodeId} = await cdp.send('DOM.querySelector', {nodeId: root.nodeId, selector: `[data-cs-pptx="${t.tag}"]`});
      if (!nodeId) continue;
      const {fonts} = await cdp.send('CSS.getPlatformFontsForNode', {nodeId});
      if (!fonts || !fonts.length) continue;
      const text = t.lines.flatMap((l) => l.runs.map((r) => r.text)).join('');
      const pick = HANGUL.test(text) ? (fonts.find((f) => CJK.test(f.familyName)) || fonts[0]) : fonts.slice().sort((a, b) => b.glyphCount - a.glyphCount)[0];
      out[t.tag] = pick.familyName;
    }
  } catch { /* an old Chrome without these calls: the CSS names are used */ }
  finally { if (cdp) await cdp.detach().catch(() => {}); }
  return out;
}

const firstFamily = (css) => String(css || '').split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).find((s) => s && !/^(-apple-system|BlinkMacSystemFont|system-ui|sans-serif|serif)$/i.test(s)) || 'Helvetica Neue';

// one text box from what pagetext.js measured
export function textBox(t, {font = null, family = null} = {}) {
  const fam = font || family || firstFamily(t.family);
  const runs = [];
  t.lines.forEach((L, li) => {
    L.runs.forEach((r, ri) => {
      const f = faceFor(fam, r.weight);
      const o = {fontFace: String(f.face).replace(/[&<>"']/g, ''), fontSize: +(r.size * PT).toFixed(2), color: r.color, bold: f.bold, italic: !!r.italic};
      if (r.alpha < 0.99) o.transparency = Math.round((1 - r.alpha) * 100);
      if (Math.abs(r.spacing) > 0.05) o.charSpacing = +(r.spacing * PT).toFixed(2);
      if (ri === L.runs.length - 1 && li < t.lines.length - 1) o.breakLine = true;
      runs.push({text: r.text, options: o});
    });
  });
  // a little room so a line never wraps in another app; the box grows away from the side it is aligned to
  const slack = Math.max(t.w * 0.08, t.size * 0.6);
  let x = t.x, w = t.w + slack;
  if (t.align === 'center') x -= slack / 2; else if (t.align === 'right') x -= slack;
  x = Math.max(0, x); w = Math.min(w, 1920 - x);
  const lh = t.lh > 0 ? t.lh : t.size * 1.2;
  const y = Math.max(0, t.y - Math.max(0, (lh - t.firstH) / 2));
  const h = Math.min(1080 - y, lh * t.lines.length + 2);
  return {runs, opts: {x: x * IN, y: y * IN, w: w * IN, h: h * IN, margin: 0, align: t.align, valign: 'top', fit: 'none', wrap: true, lineSpacing: +(lh * PT).toFixed(2), paraSpaceBefore: 0, paraSpaceAfter: 0, isTextBox: true}};
}

// does the plate move at all? (a slide whose only motion is its words needs no clip)
function moves(pngs) {
  const imgs = pngs.map((b) => readPng(b));
  let diff = 0, n = 0;
  for (let k = 1; k < imgs.length; k++) {
    const a = imgs[0], b = imgs[k];
    if (a.w !== b.w || a.h !== b.h) return true;
    for (let y = 0; y < a.h; y += 12) for (let x = 0; x < a.w; x += 12) {
      const i = (y * a.w + x) * a.ch, j = (y * b.w + x) * b.ch;
      diff += Math.abs(a.data[i] - b.data[j]) + Math.abs(a.data[i + 1] - b.data[j + 1]) + Math.abs(a.data[i + 2] - b.data[j + 2]); n += 3;
    }
  }
  return n ? diff / n > 0.6 : true;
}

// The slide's timeline in PowerPoint's own words (p:timing): the clip starts by itself (Start: Automatically) and each
// text box fades in at the moment its words appear in the HTML deck. PptxGenJS writes no timing, so we add it.
// clip: {spid, ms, auto} or null (auto false = it plays when clicked); builds: [{spid, delay}] in ms from the slide's start.
export function slideTiming({clip = null, builds = []} = {}) {
  if (!clip && !builds.length) return '';
  const auto = clip && clip.auto !== false;
  let id = 1;
  const seqs = [];
  if (auto || builds.length) {
    const main = ++id, p1 = ++id, p2 = ++id;
    const effects = [];
    if (auto) {
      effects.push(`<p:par><p:cTn id="${++id}" presetID="1" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="afterEffect"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>` +
        `<p:cmd type="call" cmd="playFrom(0.0)"><p:cBhvr><p:cTn id="${++id}" dur="${Math.max(1, Math.round(clip.ms))}" fill="hold"/><p:tgtEl><p:spTgt spid="${clip.spid}"/></p:tgtEl></p:cBhvr></p:cmd></p:childTnLst></p:cTn></p:par>`);
    }
    builds.forEach((b, k) => {
      const node = !auto && k === 0 ? 'afterEffect' : 'withEffect';
      effects.push(`<p:par><p:cTn id="${++id}" presetID="10" presetClass="entr" presetSubtype="0" fill="hold" grpId="0" nodeType="${node}"><p:stCondLst><p:cond delay="${Math.max(0, Math.round(b.delay))}"/></p:stCondLst><p:childTnLst>` +
        `<p:set><p:cBhvr><p:cTn id="${++id}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="${b.spid}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>` +
        `<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="${++id}" dur="${Math.round(b.dur || 500)}"/><p:tgtEl><p:spTgt spid="${b.spid}"/></p:tgtEl></p:cBhvr></p:animEffect></p:childTnLst></p:cTn></p:par>`);
    });
    seqs.push(`<p:seq concurrent="1" nextAc="seek"><p:cTn id="${main}" dur="indefinite" nodeType="mainSeq"><p:childTnLst>` +
      `<p:par><p:cTn id="${p1}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="${main}"/></p:cond></p:stCondLst><p:childTnLst>` +
      `<p:par><p:cTn id="${p2}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>` + effects.join('') + '</p:childTnLst></p:cTn></p:par>' +
      '</p:childTnLst></p:cTn></p:par>' +
      '</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst><p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>');
  }
  if (clip && !auto) {
    // what PowerPoint writes for a video set to play When Clicked On: a click on the video plays or pauses it
    const t = `<p:tgtEl><p:spTgt spid="${clip.spid}"/></p:tgtEl>`;
    seqs.push(`<p:seq concurrent="1" nextAc="seek"><p:cTn id="${++id}" restart="whenNotActive" fill="hold" evtFilter="cancelBubble" nodeType="interactiveSeq"><p:stCondLst><p:cond evt="onClick" delay="0">${t}</p:cond></p:stCondLst><p:endSync evt="end" delay="0"><p:rtn val="all"/></p:endSync><p:childTnLst>` +
      `<p:par><p:cTn id="${++id}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:par><p:cTn id="${++id}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>` +
      `<p:par><p:cTn id="${++id}" presetID="2" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="clickEffect"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:cmd type="call" cmd="togglePause"><p:cBhvr><p:cTn id="${++id}" dur="1" fill="hold"/>${t}</p:cBhvr></p:cmd></p:childTnLst></p:cTn></p:par>` +
      `</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn><p:nextCondLst><p:cond evt="onClick" delay="0">${t}</p:cond></p:nextCondLst></p:seq>`);
  }
  const media = clip ? `<p:video><p:cMediaNode vol="80000"><p:cTn id="${++id}" fill="hold" display="0"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="${clip.spid}"/></p:tgtEl></p:cMediaNode></p:video>` : '';
  return '<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>' +
    seqs.join('') + media + '</p:childTnLst></p:cTn></p:par></p:tnLst>' +
    (builds.length ? '<p:bldLst>' + builds.map((b) => `<p:bldP spid="${b.spid}" grpId="0" animBg="1"/>`).join('') + '</p:bldLst>' : '') + '</p:timing>';
}

// slides: [{slide, clipMs, builds: [{box, delay}]}] -> the same file with timing in those slides
// After PptxGenJS: (1) every shape on a slide gets its own id (PptxGenJS gives a video and the next shape the same one),
// (2) pictures that are JPEG inside get a .jpeg name (PptxGenJS names a video cover .png whatever it holds),
// (3) the timing: clips that start by themselves and words that fade in. slides: [{slide, clipMs, builds}]
export async function patchTiming(buf, slides = []) {
  const JSZip = require('jszip');
  const zip = await JSZip.loadAsync(buf);
  const ren = {};
  for (const n of Object.keys(zip.files).filter((n) => /^ppt\/media\/[^/]+\.png$/i.test(n))) {
    const head = await zip.file(n).async('uint8array');
    if (head[0] === 0xff && head[1] === 0xd8) { const to = n.replace(/\.png$/i, '.jpeg'); zip.file(to, head); zip.remove(n); ren[n.slice('ppt/media/'.length)] = to.slice('ppt/media/'.length); }
  }
  if (Object.keys(ren).length) for (const n of Object.keys(zip.files).filter((n) => /\.rels$/.test(n))) {
    let x = await zip.file(n).async('string'), y = x;
    for (const [a, c] of Object.entries(ren)) y = y.split('/media/' + a + '"').join('/media/' + c + '"');
    if (y !== x) zip.file(n, y);
  }
  const ct = await zip.file('[Content_Types].xml').async('string');
  zip.file('[Content_Types].xml', ct.replace('ContentType="image/jpg"', 'ContentType="image/jpeg"'));
  const meta = new Map(slides.map((s) => [s.slide, s]));
  for (const f of Object.keys(zip.files).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))) {
    let xml = await zip.file(f).async('string');
    let k = 1;
    xml = xml.replace(/<p:cNvPr id="\d+"/g, () => `<p:cNvPr id="${k++}"`);
    const s = meta.get(+f.match(/(\d+)\.xml$/)[1]);
    if (s && !/<p:timing>/.test(xml)) {
      const clipId = s.clipMs ? (/<p:cNvPr id="(\d+)" name="Motion clip"/.exec(xml) || [])[1] : null;
      const ids = {};
      for (const m of xml.matchAll(/<p:cNvPr id="(\d+)" name="Words (\d+)"/g)) ids[m[2]] = m[1];
      const builds = (s.builds || []).filter((b) => ids[b.box]).map((b) => ({spid: ids[b.box], delay: b.delay, dur: b.dur}));
      const t = slideTiming({clip: clipId ? {spid: clipId, ms: s.clipMs, auto: s.auto !== false} : null, builds});
      if (t) xml = xml.replace('</p:sld>', t + '</p:sld>');
    }
    zip.file(f, xml);
  }
  return zip.generateAsync({type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: {level: 6}});
}

function newDeck(story) {
  const mod = require('pptxgenjs'); const Pptx = mod.default || mod;      // its ES build is not loadable by Node as it is, the CommonJS one is
  const p = new Pptx();
  p.layout = 'LAYOUT_WIDE'; p.title = story.title || 'Deck';
  p.company = (story.brand && story.brand.name) || ''; p.author = p.company;
  return p;
}
const dataUrl = (file) => (/\.jpe?g$/i.test(file) ? 'data:image/jpeg;base64,' : 'data:image/png;base64,') + fs.readFileSync(file).toString('base64');

// st: an open deck stage (shoot.openStage). stills: finished screens (for "pictures").
export async function writePptx({b, st, scenes, dir, stills, mode = 'editable', video = true, autoplay = true, builds = true, google = false, font = null, log = () => {}}) {
  const res = {slides: scenes.length, boxes: 0, clips: 0, builds: 0, pictureOnly: [], files: {}, fonts: new Set()};
  const bg = (getComputedBg(b.story) || '0B0A08');
  if (mode === 'pictures') {
    const p = newDeck(b.story);
    scenes.forEach((s, i) => {
      const slide = p.addSlide(); slide.background = {color: bg};
      slide.addImage({path: stills[i].file, x: 0, y: 0, w: 13.333, h: 7.5, altText: sceneText(s).join('. ').slice(0, 900)});
      if (s.notes) slide.addNotes(s.notes);
    });
    res.files.pptx = path.join(b.out, 'deck.pptx');
    fs.writeFileSync(res.files.pptx, await patchTiming(await p.write({outputType: 'nodebuffer'})));
    return res;
  }
  const ff = findFfmpeg();
  const withClips = video && !!ff;
  if (video && !ff) res.noFfmpeg = true;
  const main = newDeck(b.story), gdeck = google ? newDeck(b.story) : null;
  const page = st.page;
  await page.addScriptTag({content: fs.readFileSync(path.join(HERE, 'pagetext.js'), 'utf8')});
  const clipsMeta = [];
  fs.mkdirSync(dir, {recursive: true});
  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i], sch = st.plan.schedule[i];
    log(`slide ${i + 1}/${scenes.length}`);
    await page.evaluate(() => window.__csPageTextShow());
    await page.evaluate((i) => CS.capture.goto(i, 1), i);
    const boxes = await page.evaluate((i) => window.__csPageText(i), i);
    // when do the words appear in the HTML deck? (so PowerPoint can fade them in at the same moment)
    const appear = boxes.map(() => null);
    if (builds && sch.clipDur > 0.25 && boxes.length) {
      const N = 24, tags = boxes.map((t) => t.tag);
      for (let k = 0; k <= N; k++) {
        await page.evaluate((i, w) => CS.capture.goto(i, w), i, k / N);
        const al = await page.evaluate((tags) => window.__csAlpha(tags), tags);
        al.forEach((a, j) => { if (appear[j] == null && a > 0.5) appear[j] = k / N * sch.clipDur; });
      }
      await page.evaluate((i) => CS.capture.goto(i, 1), i);
    }
    const fonts = font ? {} : await platformFonts(page, boxes);
    await new Promise((r) => setTimeout(r, 30));
    const plate = path.join(dir, `plate_${String(i + 1).padStart(2, '0')}.jpg`);
    const endPng = await page.screenshot({type: 'png'});
    fs.writeFileSync(plate, await page.screenshot({type: 'jpeg', quality: 92}));
    let clip = null, clipSec = 0;
    if (withClips && sch.clipDur > 0.25) {
      const probe = [];
      for (const w of [0.35, 0.7]) { await page.evaluate((i, w) => CS.capture.goto(i, w), i, w); probe.push(await page.screenshot({type: 'png'})); }
      probe.push(endPng);
      if (moves(probe)) {
        clip = path.join(dir, `clip_${String(i + 1).padStart(2, '0')}.mp4`);
        // never past this slide's own time on the deck timeline (the next slide would leak into the last frames)
        const rec = await recordStage(st, clip, {from: sch.at, to: sch.at + Math.min(sch.clipDur + 0.1, sch.dur || sch.clipDur), crf: 22});
        clipSec = rec.seconds;
      }
      await page.evaluate((i) => CS.capture.goto(i, 1), i);
    }
    const alt = sceneText(s).join('. ').slice(0, 900);
    for (const [deck, useClip] of [[main, !!clip], ...(gdeck ? [[gdeck, false]] : [])]) {
      const slide = deck.addSlide(); slide.background = {color: bg};
      if (useClip) slide.addMedia({type: 'video', path: clip, cover: dataUrl(plate), x: 0, y: 0, w: 13.333, h: 7.5, objectName: 'Motion clip'});
      else slide.addImage({path: plate, x: 0, y: 0, w: 13.333, h: 7.5, altText: alt, objectName: 'Slide picture'});
      boxes.forEach((t, j) => {
        const fam = font || fonts[t.tag] || null;
        const tb = textBox(t, {font: fam});
        tb.runs.forEach((r) => res.fonts.add(r.options.fontFace));
        slide.addText(tb.runs, {...tb.opts, objectName: `Words ${j + 1}`});
      });
      if (s.notes) slide.addNotes(s.notes);
    }
    res.boxes += boxes.length;
    if (!boxes.length && sceneText(s).length) res.pictureOnly.push(i + 1);
    if (clip) res.clips++;
    const fades = appear.map((t, j) => (t != null && t > 0.05 ? {box: j + 1, delay: Math.max(0, t - 0.25) * 1000, dur: 500} : null)).filter(Boolean);
    res.builds += fades.length;
    if (clip || fades.length) clipsMeta.push({slide: i + 1, clipMs: clip ? clipSec * 1000 : 0, auto: autoplay, builds: fades});
  }
  await page.evaluate(() => window.__csPageTextShow());
  let buf = await main.write({outputType: 'nodebuffer'});
  buf = await patchTiming(buf, clipsMeta);
  res.files.pptx = path.join(b.out, 'deck.pptx');
  fs.writeFileSync(res.files.pptx, buf);
  if (gdeck) { res.files.google = path.join(b.out, 'deck_google.pptx'); fs.writeFileSync(res.files.google, await patchTiming(await gdeck.write({outputType: 'nodebuffer'}))); }
  res.autoplay = autoplay && res.clips > 0;
  res.fonts = [...res.fonts];
  return res;
}

function getComputedBg(story) {
  const looks = {connect: '0B0A08', night: '101216', paper: 'F3EEE3'};
  return looks[story.look || 'connect'] || '0B0A08';
}
