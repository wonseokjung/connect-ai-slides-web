// gallery: every catalog block rendered from its own example, as one deck + one site, sheets, and (optionally) one clip each.
// The catalog page and the tests are made from this. MIT, CONNECT AI LAB.
import fs from 'node:fs';
import path from 'node:path';
import {KIT, readJson, findFfmpeg} from './tools.mjs';
import {loadCatalog} from './catalog.mjs';
import {build} from './build.mjs';
import {openBrowser, closeBrowser, openStage, stillsOf, contactSheet, FRAMES} from './shoot.mjs';
import {recordBlock, NO_FFMPEG} from './record.mjs';

// a map swaps the stand-in media of the examples for real files (used for a showcase with your own footage):
// { "default": { "media/person.svg": {"src": "/abs/me.jpg", "face": [x, y, w, h], "body": [x, y, w, h]} }, "kinds": { "motion/media-card": { ... } },
//   "props": { "kit/quote-film": {"lines": ["..."]} } }      props: your own words for one block, laid over its example
function applyMap(scene, kind, map, proj) {
  if (!map) return scene;
  const table = {...(map.default || {}), ...((map.kinds || {})[kind] || {})};
  const out = JSON.parse(JSON.stringify(scene));
  const swap = (o) => {
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (typeof v === 'string' && table[v]) {
        const t = table[v];
        if (!fs.existsSync(t.src)) throw new Error('The media map points at a file that does not exist: ' + t.src);
        const rel = 'media/' + path.basename(t.src); fs.mkdirSync(path.join(proj, 'media'), {recursive: true}); fs.copyFileSync(t.src, path.join(proj, rel));
        o[k] = rel;
        if (t.face && (k === 'src' || o.face)) o.face = t.face;
        if (k === 'src') { if (t.body) o.body = t.body; else if (t.face) delete o.body; if (t.face === null) { delete o.face; delete o.body; } }
        for (const extra of ['clip', 'seconds']) if (t[extra] != null && k === 'src') { if (extra === 'clip') { const cr = 'media/' + path.basename(t.clip); fs.copyFileSync(t.clip, path.join(proj, cr)); o.clip = cr; } else o[extra] = t[extra]; }
        if (t.poster && k === 'src') { const pr = 'media/' + path.basename(t.poster); fs.copyFileSync(t.poster, path.join(proj, pr)); o.poster = pr; }
        if (t.alt && k === 'src') o.alt = t.alt;
      } else if (v && typeof v === 'object') swap(v);
    }
  };
  swap(out);
  return out;
}

export async function gallery(opts = {}) {
  const cat = loadCatalog(opts.extraCatalog || []);
  const only = opts.only && opts.only.length ? opts.only : null;
  const picks = cat.filter((m) => m.status === 'ok' && !m.errors.length && (!only || only.some((o) => m.kind === o || m.kind.startsWith(o.replace(/\/?$/, '/')))));
  const skipped = cat.filter((m) => m.status !== 'ok' || m.errors.length).map((m) => ({kind: m.kind, status: m.status, reasons: m.errors.length ? m.errors : m.reasons || []}));
  if (!picks.length) throw new Error('No catalog block matches ' + JSON.stringify(only) + '. Run `catalog` for the list.');
  const proj = path.resolve(opts.out || path.join(process.cwd(), 'connect-ai-slides-web-gallery'));
  fs.mkdirSync(proj, {recursive: true});
  fs.cpSync(path.join(KIT, 'examples', 'media'), path.join(proj, 'media'), {recursive: true});
  const map = opts.map ? (typeof opts.map === 'string' ? readJson(opts.map) : opts.map) : null;
  const frames = opts.frames && opts.frames.length ? opts.frames : ['deck', 'site', 'phone'];
  const story = {
    title: 'connect-ai-slides-web catalog', look: opts.look || 'connect', lang: 'en', hold: 1.0,
    brand: {name: 'CONNECT AI LAB', links: [{label: 'YouTube', href: 'https://www.youtube.com/@CONNECT-AI-LAB'}, {label: 'Courses', href: 'https://www.aicitybuilders.com'}]},
    scenes: picks.map((m) => applyMap({kind: m.kind, id: m.kind.replace('/', '-'), ...m.example, ...((map && map.props && map.props[m.kind]) || {})}, m.kind, map, proj)),
  };
  fs.writeFileSync(path.join(proj, 'story.json'), JSON.stringify(story, null, 2));
  const b = await build(proj, {stages: [...new Set(frames.map((f) => FRAMES[f].stage))], extraCatalog: opts.extraCatalog});
  const browser = opts.browser || await openBrowser();
  const items = picks.map((m) => ({kind: m.kind, title: m.title, use: m.use, lead: m.lead, source: m.source, license: m.license, family: m.family, dur: m.dur || null, description: m.description, props: m.props, example: m.example, site: m.site || null, stills: {}, clip: null}));
  const res = {project: proj, out: b.out, items, skipped, sheets: {}, problems: []};
  try {
    for (const f of frames) {
      const st = await openStage(browser, b.out, f);
      const stills = await stillsOf(st, path.join(b.out, 'stills'), {where: [1], type: 'jpeg'});
      stills.forEach((s) => { items[s.i].stills[f] = path.relative(proj, s.file).split(path.sep).join('/'); items[s.i].dur = st.plan.schedule[s.i].clipDur; items[s.i].steps = (st.plan.schedule[s.i].stops || []).length - 1; if (st.plan.schedule[s.i].error) res.problems.push(`${items[s.i].kind} (${f}): ${st.plan.schedule[s.i].error}`); });
      for (const e of [...new Set(st.log.errors)]) res.problems.push(`${f}: ${e}`);
      for (const e of [...new Set(st.log.failed)]) res.problems.push(`${f}: file not found ${e}`);
      const sheet = path.join(b.out, `sheet_${f}.jpg`);
      if (findFfmpeg()) { contactSheet(stills.map((s) => ({file: s.file, caption: s.kind})), sheet, f === 'phone' ? {cols: Math.min(10, stills.length), cellW: 234, cellH: 506} : {cols: Math.min(5, stills.length), cellW: 480, cellH: f === 'deck' ? 270 : 300}); res.sheets[f] = sheet; }
      await st.page.close();
    }
    if (opts.clips) {
      if (!findFfmpeg()) throw new Error(NO_FFMPEG);
      const dir = path.join(b.out, 'clips'); fs.mkdirSync(dir, {recursive: true});
      const jobs = Math.max(1, Math.min(opts.jobs || 2, items.length));
      // one browser per job: a page in a background tab gets no animation frames
      const pages = [], extra = [];
      for (let j = 0; j < jobs; j++) { const br = j === 0 ? browser : await openBrowser(); if (j) extra.push(br); pages.push(await openStage(br, b.out, 'deck')); }
      let next = 0;
      await Promise.all(pages.map(async (st) => {
        for (;;) { const i = next++; if (i >= items.length) break; const file = path.join(dir, items[i].kind.replace('/', '-') + '.mp4'); await recordBlock(st, i, file, {size: opts.size || [960, 540]}); items[i].clip = path.relative(proj, file).split(path.sep).join('/'); if (opts.onProgress) opts.onProgress(items[i].kind); }
      }));
      for (const st of pages) await st.page.close();
      for (const br of extra) await closeBrowser(br);
    }
  } finally { if (!opts.browser) await closeBrowser(browser); }
  fs.writeFileSync(path.join(proj, 'gallery.json'), JSON.stringify({made: new Date().toISOString().slice(0, 10), count: items.length, items, skipped}, null, 2));
  res.json = path.join(proj, 'gallery.json');
  return res;
}
