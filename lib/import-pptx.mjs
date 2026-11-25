// import: an old PowerPoint file (.pptx) -> talk.md in this kit's markdown, plus its pictures in a media folder.
// Then `ppt talk.md` makes it a motion deck and a new .pptx. We take the words, the pictures and the speaker notes;
// what is drawn with shapes (a diagram made of boxes and arrows, a chart) stays in the old file, and the report says
// which slides had that. Nothing is invented: every word in talk.md is a word from the file. MIT, CONNECT AI LAB.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {parseXml, kid, kids, find, findAll, textOf} from './xml-lite.mjs';

const require = createRequire(import.meta.url);
const WEB_PICTURE = /\.(png|jpe?g|gif|webp|svg|avif)$/i;
const WEB_VIDEO = /\.(mp4|webm|m4v|mov)$/i;
const SKIP_PH = new Set(['dt', 'ftr', 'sldNum', 'hdr', 'sldImg']);
const TITLE_PH = new Set(['title', 'ctrTitle']);
const wordsIn = (t) => {
  const s = String(t || ''), cjk = (s.match(/[぀-ヿ㐀-䶿一-鿿가-힯]/g) || []).length;
  return s.replace(/[぀-ヿ㐀-䶿一-鿿가-힯]/g, ' ').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length + Math.ceil(cjk / 2.5);
};
const clean = (t) => String(t || '').replace(/[\u000b ​]/g, ' ').replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').trim();
// one line of markdown per paragraph; a heading or quote marker typed into a slide is not a markdown heading here.
// A line the slide itself starts with "- " or "1. " stays a list line, which is what it meant.
const mdSafe = (t) => clean(t).replace(/\n+/g, ' ').replace(/^(#+|>)\s*/, '').trim();

const relsOf = async (zip, part) => {
  const p = path.posix.join(path.posix.dirname(part), '_rels', path.posix.basename(part) + '.rels');
  const f = zip.file(p);
  if (!f) return {};
  const x = parseXml(await f.async('string')), out = {};
  for (const r of findAll(x, 'Relationship')) out[r.a.Id] = {target: r.a.TargetMode === 'External' ? r.a.Target : (String(r.a.Target || '').startsWith('/') ? path.posix.normalize(String(r.a.Target).slice(1)) : path.posix.normalize(path.posix.join(path.posix.dirname(part), r.a.Target || ''))), type: (r.a.Type || '').split('/').pop(), external: r.a.TargetMode === 'External'};
  return out;
};

// the position of a shape: its own xfrm, else the same placeholder on the layout, else on the master
function xfrmOf(node) {
  const x = find(node, 'a:xfrm') || find(node, 'p:xfrm');
  if (!x) return null;
  const off = kid(x, 'a:off'), ext = kid(x, 'a:ext');
  if (!off || !ext) return null;
  return {x: +off.a.x || 0, y: +off.a.y || 0, w: +ext.a.cx || 0, h: +ext.a.cy || 0};
}
const phOf = (sp) => { const nv = kid(sp, 'p:nvSpPr') || kid(sp, 'p:nvPicPr') || kid(sp, 'p:nvGraphicFramePr'); const ph = nv && find(nv, 'p:ph'); return ph ? {type: ph.a.type || 'body', idx: ph.a.idx || ''} : null; };
function phBox(layoutTrees, ph) {
  for (const tree of layoutTrees) {
    for (const sp of findAll(tree, 'p:sp')) {
      const p = phOf(sp);
      if (!p) continue;
      if ((ph.idx && p.idx === ph.idx) || p.type === ph.type || (TITLE_PH.has(ph.type) && TITLE_PH.has(p.type))) { const b = xfrmOf(kid(sp, 'p:spPr')); if (b) return b; }
    }
  }
  return null;
}

// one text body -> paragraphs {text, lvl, bullet: 'auto'|'char'|null, size}
function paragraphs(txBody) {
  const out = [];
  for (const p of kids(txBody, 'a:p')) {
    const pPr = kid(p, 'a:pPr');
    const text = clean(p.c.filter((c) => typeof c === 'object').map((c) => (c.n === 'a:r' || c.n === 'a:fld' ? textOf(c) : c.n === 'a:br' ? '\n' : '')).join(''));
    if (!text) continue;
    const sizes = findAll(p, 'a:rPr').map((r) => +r.a.sz || 0).filter(Boolean);
    out.push({text, lvl: pPr ? +pPr.a.lvl || 0 : 0, bullet: pPr && kid(pPr, 'a:buAutoNum') ? 'auto' : pPr && kid(pPr, 'a:buChar') ? 'char' : pPr && kid(pPr, 'a:buNone') ? 'none' : null, size: sizes.length ? Math.max(...sizes) / 100 : 0});
  }
  return out;
}

// walk the shape tree: shapes, pictures, tables, SmartArt, groups (with their own coordinate space), alternate content
function walk(node, ctx, out, map = (b) => b) {
  for (const c of kids(node)) {
    if (c.n === 'mc:AlternateContent') {
      // one branch only: the Fallback is plain PresentationML every reader knows; an equation's Choice holds the math
      const ch = kid(c, 'mc:Choice');
      if (ch && find(ch, 'a14:m')) out.push({kind: 'equation', box: map(xfrmOf(find(ch, 'p:spPr') || ch))});
      walk(kid(c, 'mc:Fallback') || ch || c, ctx, out, map);
      continue;
    }
    if (c.n === 'p:grpSp') {
      const g = kid(c, 'p:grpSpPr'), x = g && find(g, 'a:xfrm');
      let inner = map;
      if (x) {
        const off = kid(x, 'a:off'), ext = kid(x, 'a:ext'), coff = kid(x, 'a:chOff'), cext = kid(x, 'a:chExt');
        if (off && ext && coff && cext && +cext.a.cx && +cext.a.cy) {
          const sx = +ext.a.cx / +cext.a.cx, sy = +ext.a.cy / +cext.a.cy;
          inner = (b) => (b ? map({x: +off.a.x + (b.x - +coff.a.x) * sx, y: +off.a.y + (b.y - +coff.a.y) * sy, w: b.w * sx, h: b.h * sy}) : b);
        }
      }
      walk(c, ctx, out, inner);
      continue;
    }
    if (c.n === 'p:sp' || c.n === 'p:cxnSp') {
      const ph = phOf(c);
      if (ph && SKIP_PH.has(ph.type)) continue;
      const tx = kid(c, 'p:txBody');
      const box = map(xfrmOf(kid(c, 'p:spPr')) || (ph ? phBox(ctx.layouts, ph) : null));
      if (tx) { const paras = paragraphs(tx); if (paras.length) out.push({kind: 'text', ph, box, paras, txBox: (find(c, 'p:cNvSpPr') || {a: {}}).a.txBox === '1'}); }
      else if (!ph) out.push({kind: 'shape', box});
      continue;
    }
    if (c.n === 'p:pic') {
      const blip = find(c, 'a:blip'), vid = find(c, 'a:videoFile'), mv = find(c, 'p14:media');
      const nv = find(c, 'p:cNvPr');
      const box = map(xfrmOf(kid(c, 'p:spPr')) || (phOf(c) ? phBox(ctx.layouts, phOf(c)) : null));
      const rel = (id) => (id ? ctx.rels[id] : null);
      const video = rel((vid && vid.a['r:link']) || (mv && mv.a['r:embed']));
      const svg = blip && find(blip, 'asvg:svgBlip');          // PowerPoint keeps an SVG next to its PNG copy
      const crop = find(c, 'a:srcRect');
      out.push({kind: 'picture', box, rel: rel((svg && svg.a['r:embed']) || (blip && (blip.a['r:embed'] || blip.a['r:link']))), video, cropped: !!(crop && Object.keys(crop.a).length), alt: clean(String((nv && (nv.a.descr || nv.a.title)) || '').replace(/<[^>]*>/g, ''))});
      continue;
    }
    if (c.n === 'p:graphicFrame') {
      const box = map(xfrmOf(c) || null);
      const tbl = find(c, 'a:tbl');
      if (tbl) { out.push({kind: 'table', box, rows: kids(tbl, 'a:tr').map((tr) => kids(tr, 'a:tc').map((tc) => clean(textOf(tc)).replace(/\n+/g, ' '))).filter((r) => r.some(Boolean))}); continue; }
      const dm = find(c, 'dgm:relIds');
      if (dm) { out.push({kind: 'smartart', box, rel: ctx.rels[dm.a['r:dm']]}); continue; }
      if (find(c, 'c:chart')) { out.push({kind: 'chart', box}); continue; }
      out.push({kind: 'object', box});
      continue;
    }
  }
}

const readingOrder = (H) => (a, b) => {
  const A = a.box || {x: 0, y: 1e15}, B = b.box || {x: 0, y: 1e15};
  if (Math.abs(A.y - B.y) > H * 0.04) return A.y - B.y;
  return A.x - B.x;
};

export const LIMITS = {pictureMB: 60, totalMB: 600, slides: 400};

export async function importPptx(file, {mediaDir = null, mediaRel = 'media', pictures = true, hidden = false, labels = false} = {}) {
  const JSZip = require('jszip');
  const buf = fs.readFileSync(file);
  if (buf[0] !== 0x50 || buf[1] !== 0x4b) throw new Error(`${path.basename(file)} is not a .pptx (a .pptx is a zip file). An old .ppt from before 2007: open it in PowerPoint or Keynote and save it as .pptx first.`);
  const zip = await JSZip.loadAsync(buf);
  // a .pptx from someone else is a zip from someone else: refuse one that unpacks to something huge
  let total = 0;
  for (const e of Object.values(zip.files)) total += (e._data && e._data.uncompressedSize) || 0;
  if (total > LIMITS.totalMB * 1e6) throw new Error(`${path.basename(file)} unpacks to ${(total / 1e6).toFixed(0)} MB, over the ${LIMITS.totalMB} MB this import reads. Save a copy without the big videos and try that.`);
  const presPart = 'ppt/presentation.xml';
  if (!zip.file(presPart)) throw new Error(`${path.basename(file)} has no ppt/presentation.xml. Is it a PowerPoint file?`);
  const pres = parseXml(await zip.file(presPart).async('string'));
  const presRels = await relsOf(zip, presPart);
  const sz = find(pres, 'p:sldSz');
  const W = sz ? +sz.a.cx : 12192000, H = sz ? +sz.a.cy : 6858000;
  const order = findAll(pres, 'p:sldId').map((s) => (presRels[s.a['r:id']] || {}).target || null).slice(0, LIMITS.slides);
  const R = {slides: [], media: [], left: [], title: '', sub: '', md: ''};
  const layoutCache = new Map();
  const treeOf = async (part) => { if (!layoutCache.has(part)) { const f = zip.file(part); layoutCache.set(part, f ? parseXml(await f.async('string')) : null); } return layoutCache.get(part); };
  let picN = 0;
  const savePicture = async (rel, n, alt) => {
    if (!rel || rel.external) return {left: rel && rel.external ? 'a picture linked from outside the file' : null};
    const ext = path.extname(rel.target).toLowerCase();
    if (!WEB_PICTURE.test(ext) && !WEB_VIDEO.test(ext)) return {left: `a ${ext.slice(1).toUpperCase() || 'picture'} picture (browsers cannot show it: save it as PNG and add it to the .md)`};
    const f = zip.file(rel.target.replace(/^\//, ''));
    if (!f) return {left: 'a picture that is missing from the file'};
    if (((f._data && f._data.uncompressedSize) || 0) > LIMITS.pictureMB * 1e6) return {left: `a picture or video over ${LIMITS.pictureMB} MB (too big for a web page: make it smaller and add it to the .md)`};
    const name = `slide${String(n).padStart(2, '0')}-${++picN}${ext === '.jpeg' ? '.jpg' : ext}`;
    if (mediaDir) {
      fs.mkdirSync(mediaDir, {recursive: true});
      if (fs.lstatSync(mediaDir).isSymbolicLink()) throw new Error(`${mediaDir} is a link: not writing through it.`);
      const to = path.join(mediaDir, name);
      let st = null; try { st = fs.lstatSync(to); } catch {}
      if (st && st.isSymbolicLink()) throw new Error(`${to} is a link: not writing through it.`);
      if (st) fs.rmSync(to);
      fs.writeFileSync(to, await f.async('nodebuffer'), {flag: 'wx'});
    }
    R.media.push(name);
    return {src: `${mediaRel}/${name}`, alt};
  };

  for (let i = 0; i < order.length; i++) {
    const part = order[i], n = i + 1;
    const f = part ? zip.file(part) : null;
    if (!f) { R.left.push(`slide ${n} is listed but missing from the file`); continue; }
    const xml = parseXml(await f.async('string'));
    const sld = find(xml, 'p:sld');
    const S = {n, title: '', sub: '', items: [], pictures: [], notes: '', left: [], hidden: !!(sld && sld.a.show === '0')};
    R.slides.push(S);
    if (S.hidden && !hidden) { S.left.push('hidden slide (left out; add --hidden to take it)'); continue; }
    const rels = await relsOf(zip, part);
    const layoutPart = Object.values(rels).find((r) => r.type === 'slideLayout');
    const layouts = [];
    if (layoutPart) {
      const lt = await treeOf(layoutPart.target);
      if (lt) layouts.push(lt);
      const lr = await relsOf(zip, layoutPart.target);
      const master = Object.values(lr).find((r) => r.type === 'slideMaster');
      if (master) { const mt = await treeOf(master.target); if (mt) layouts.push(mt); }
    }
    const shapes = [];
    walk(find(xml, 'p:spTree'), {rels, layouts}, shapes);
    shapes.sort(readingOrder(H));

    // the title: the title placeholder, else the biggest short text near the top
    const texts = shapes.filter((s) => s.kind === 'text');
    let titleShape = texts.find((s) => s.ph && TITLE_PH.has(s.ph.type));
    if (!titleShape) {
      const top = texts.filter((s) => (!s.box || s.box.y < H * 0.3) && wordsIn(s.paras.map((p) => p.text).join(' ')) <= 12);
      const big = top.map((s) => ({s, size: Math.max(0, ...s.paras.map((p) => p.size))})).sort((a, b) => b.size - a.size)[0];
      if (big && big.size >= 24) titleShape = big.s;
    }
    if (titleShape) S.title = mdSafe(titleShape.paras.map((p) => p.text).join(' '));
    const subShape = texts.find((s) => s.ph && s.ph.type === 'subTitle');
    if (subShape) S.sub = mdSafe(subShape.paras.map((p) => p.text).join(' '));
    let labelCount = 0, shapesDrawn = 0;
    for (const s of shapes) {
      if (s === titleShape || s === subShape) continue;
      if (s.kind === 'shape') { shapesDrawn++; continue; }
      if (s.kind === 'text') {
        const all = s.paras.map((p) => p.text).join(' ');
        const isBody = s.ph && !TITLE_PH.has(s.ph.type);
        // a short word on a diagram (x1, w2, Yes, 0) belongs to the drawing, not to the slide's message
        if (!isBody && !labels && wordsIn(all) < 2 && all.length < 14) { labelCount++; continue; }
        const listy = s.paras.length >= 2 && (isBody ? s.paras.some((p) => p.bullet !== 'none') : s.paras.some((p) => p.bullet === 'char' || p.bullet === 'auto'));
        for (const p of s.paras) {
          const t = mdSafe(p.text);
          if (!t) continue;
          if (listy) S.items.push({type: p.bullet === 'auto' ? 'step' : 'bullet', text: t, lvl: p.lvl});
          else S.items.push({type: 'para', text: t});
        }
        continue;
      }
      if (s.kind === 'table') {
        const rows = s.rows.slice(0, 8);
        for (const r of rows) S.items.push({type: 'bullet', text: mdSafe(r.filter(Boolean).join(' · '))});
        if (s.rows.length > 8) S.left.push(`${s.rows.length - 8} more table rows (the slide shows 8; the rest went to the notes)`);
        if (s.rows.length > 8) S.notes = [S.notes, s.rows.slice(8).map((r) => r.filter(Boolean).join(' · ')).join('\n')].filter(Boolean).join('\n');
        continue;
      }
      if (s.kind === 'smartart') {
        let words = [];
        if (s.rel && zip.file(s.rel.target)) {
          const d = parseXml(await zip.file(s.rel.target).async('string'));
          words = findAll(d, 'dgm:pt').map((pt) => clean(textOf(kid(pt, 'dgm:t')))).filter(Boolean);
        }
        if (words.length) for (const w of words.slice(0, 8)) S.items.push({type: 'bullet', text: mdSafe(w)});
        else S.left.push('a SmartArt graphic with no words we could read');
        continue;
      }
      if (s.kind === 'chart') { S.left.push('a chart (charts stay in the old file; write the numbers you want to show as **number** lines)'); continue; }
      if (s.kind === 'object') { S.left.push('an embedded object (a file, an old equation or a control)'); continue; }
      if (s.kind === 'equation') { S.left.push('an equation (PowerPoint math: its picture copy came along if the file has one)'); continue; }
      if (s.kind === 'picture') {
        const area = s.box ? (s.box.w * s.box.h) / (W * H) : 1;
        const target = s.video && !s.video.external ? s.video : s.rel;
        if (s.video && s.video.external) S.left.push('a video linked from outside the file (its poster picture came along)');
        if (!pictures) { S.left.push('a picture (left out with --no-pictures)'); continue; }
        if (!s.video && area < 0.04) { S.left.push('a small picture (an icon or a logo, under 4 % of the slide)'); continue; }
        const r = await savePicture(target, n, s.alt);
        if (r.src) { S.pictures.push({src: r.src, alt: r.alt || '', area}); if (s.cropped) S.left.push(`the crop of ${r.src.split('/').pop()} (PowerPoint cropped it; the whole picture came along)`); }
        else if (r.left) S.left.push(r.left);
      }
    }
    if (labelCount) S.left.push(`${labelCount} short ${labelCount === 1 ? 'label' : 'labels'} drawn on a diagram (x1, w2 ...; --labels keeps them)`);
    if (shapesDrawn >= 3) S.left.push(`${shapesDrawn} drawn shapes (boxes, arrows, lines): a diagram made of shapes stays in the old file`);
    S.pictures.sort((a, b) => b.area - a.area);
    // speaker notes
    const notesRel = Object.values(rels).find((r) => r.type === 'notesSlide');
    if (notesRel && zip.file(notesRel.target)) {
      const nx = parseXml(await zip.file(notesRel.target).async('string'));
      const body = findAll(nx, 'p:sp').filter((sp) => { const p = phOf(sp); return p && p.type === 'body'; });
      const t = body.map((sp) => paragraphs(kid(sp, 'p:txBody')).map((p) => p.text).join('\n')).join('\n').trim();
      if (t) S.notes = [clean(t), S.notes].filter(Boolean).join('\n');
    }
  }
  R.md = toMarkdown(R, path.basename(file).replace(/\.pptx$/i, ''));
  return R;
}

function toMarkdown(R, fallback) {
  const live = R.slides.filter((s) => !(s.hidden && s.left.length && !s.items.length && !s.title));
  const first = live[0];
  const L = [];
  const isEmpty = (s) => !s.title && !s.items.length && !s.pictures.length;
  const noteLine = (t) => 'Note: ' + clean(t).replace(/\n+/g, ' ');
  // the first slide is the title of the talk when it looks like one
  let rest = live;
  // (a title and at most two short lines under it, no picture: a cover slide even without PowerPoint's title layout)
  const cover = first && first.title && !first.pictures.length && first.items.length <= 2 && first.items.every((it) => it.type === 'para' && wordsIn(it.text) <= 16);
  if (first && (first.sub || cover)) {
    if (!first.sub && first.items.length) first.sub = first.items.shift().text;
    R.title = first.title || fallback; R.sub = first.sub || '';
    L.push('# ' + R.title);
    if (R.sub) L.push(R.sub);
    for (const it of first.items) L.push(it.text);
    if (first.notes) L.push(noteLine(first.notes));
    rest = live.slice(1);
  } else { R.title = fallback; L.push('# ' + fallback); }
  for (const s of rest) {
    if (isEmpty(s)) continue;
    L.push('');
    L.push('## ' + (s.title || (s.items[0] && s.items[0].type === 'para' && wordsIn(s.items[0].text) <= 8 ? s.items.shift().text : `Slide ${s.n}`)));
    for (const p of s.pictures) L.push(`![${p.alt.replace(/[[\]]/g, '')}](${p.src})`);
    let k = 0;
    for (const it of s.items) {
      if (it.type === 'bullet') L.push((it.lvl ? '  '.repeat(it.lvl) : '') + '- ' + it.text);
      else if (it.type === 'step') L.push(`${++k}. ${it.text}`);
      else L.push(it.text);
    }
    if (s.notes) L.push(noteLine(s.notes));
  }
  return L.join('\n') + '\n';
}

export function printImport(R, say, {md, mediaDir} = {}) {
  const took = R.slides.filter((s) => !s.hidden);
  say(`${R.slides.length} slides read${R.slides.length - took.length ? ` (${R.slides.length - took.length} hidden)` : ''}, ${R.media.length} pictures${mediaDir ? ' saved' : ''}.`);
  for (const s of R.slides) {
    const what = [s.title ? `"${s.title.slice(0, 40)}"` : '(no title)', s.items.length ? `${s.items.length} lines` : '', s.pictures.length ? `${s.pictures.length} picture${s.pictures.length > 1 ? 's' : ''}` : '', s.notes ? 'notes' : ''].filter(Boolean).join(', ');
    say(`  ${String(s.n).padStart(2)}  ${what}`);
    for (const l of s.left) say(`        left in the old file: ${l}`);
  }
  for (const l of R.left || []) say(`  ${l}`);
  if (md) say(`Wrote ${md}. Read it, make each slide one message (move long text into Note:), then: ppt ${path.basename(md)}`);
}
