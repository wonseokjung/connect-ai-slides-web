// The catalog: one folder per block, one meta.json contract. MIT, CONNECT AI LAB.
import fs from 'node:fs';
import path from 'node:path';
import {KIT, readJson} from './tools.mjs';

export const USES = ['title', 'statement', 'person', 'number', 'steps', 'list', 'compare', 'quote', 'media', 'diagram', 'chart', 'timeline', 'ident', 'cta', 'chapter', 'background'];
export const LEADS = ['picture', 'type'];
export const SOURCES = ['kit', 'three', 'vis', 'gsap', 'motion', 'anime', 'css', 'lottie', 'hyperframes', 'remotion', 'clip'];

export function validateMeta(m, dir) {
  const e = [];
  if (!m.kind || !/^[a-z]+\/[a-z0-9-]+$/.test(m.kind)) e.push('kind must look like "source/name"');
  if (!m.title) e.push('title is missing');
  if (!m.description) e.push('description is missing');
  if (!m.license) e.push('license is missing');
  if (!m.source || !m.source.type) e.push('source.type is missing');
  if (!USES.includes(m.use)) e.push('use must be one of: ' + USES.join(', '));
  if (!m.family) e.push('family is missing (repeat check)');
  if (!LEADS.includes(m.lead)) e.push('lead must be "picture" (a photo, clip, device, chart or diagram is the star of the screen) or "type" (words are the star)');
  if (!m.props || typeof m.props !== 'object') e.push('props is missing');
  if (!m.example || typeof m.example !== 'object') e.push('example is missing (the catalog renders it)');
  if (!['ok', 'unsupported', 'needs-download'].includes(m.status || 'ok')) e.push('status must be ok, unsupported or needs-download');
  if ((m.status || 'ok') !== 'ok' && !(m.reasons && m.reasons.length)) e.push('a block that is not ok needs reasons');
  if (m.site && !['play', 'scrub'].includes(m.site.mode)) e.push('site.mode must be play or scrub');
  if (dir && (m.status || 'ok') === 'ok' && !fs.existsSync(path.join(dir, 'block.js'))) e.push('block.js is missing');
  return e;
}

export function loadCatalog(extraDirs = []) {
  const out = [];
  const roots = [path.join(KIT, 'catalog'), ...extraDirs];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    for (const src of fs.readdirSync(root).sort()) {
      const sd = path.join(root, src); if (!fs.statSync(sd).isDirectory()) continue;
      for (const name of fs.readdirSync(sd).sort()) {
        const dir = path.join(sd, name), mp = path.join(dir, 'meta.json');
        if (!fs.existsSync(mp)) continue;
        let m; try { m = readJson(mp); } catch (err) { out.push({kind: src + '/' + name, dir, status: 'unsupported', reasons: ['meta.json is not valid JSON: ' + err.message], errors: ['bad json']}); continue; }
        m.dir = dir; m.status = m.status || 'ok'; m.errors = validateMeta(m, dir);
        out.push(m);
      }
    }
  }
  return out;
}
export function byKind(cat) { return Object.fromEntries(cat.map((m) => [m.kind, m])); }

// block.js is written as a tiny ES module with no imports. For a folder that opens by double click (file://)
// it is wrapped into a classic script that registers itself.
export function wrapBlock(m) {
  let code = fs.readFileSync(path.join(m.dir, 'block.js'), 'utf8');
  if (/^\s*import\s/m.test(code)) throw new Error(m.kind + ': block.js must not import (libraries come through cx)');
  code = code.replace(/export\s+const\s+css\s*=/, 'const css =').replace(/export\s+default\s+(async\s+)?function\s*\w*\s*\(/, 'const __mount = $1function mount(');
  if (!/__mount/.test(code)) throw new Error(m.kind + ': block.js needs "export default function mount(el, p, cx)"');
  const meta = {kind: m.kind, title: m.title, use: m.use, family: m.family, lead: m.lead || null, site: m.site || null, dur: m.dur || null, source: m.source, license: m.license, data: {}};
  for (const f of m.data || []) { const p = path.join(m.dir, f); meta.data[f] = /\.json$/.test(f) ? JSON.parse(fs.readFileSync(p, 'utf8')) : fs.readFileSync(p, 'utf8'); }
  return '/* ' + m.kind + ' */\n(function(){\n' + code + '\nCS.register(' + JSON.stringify(m.kind) + ', __mount, typeof css === "string" ? css : "", ' + JSON.stringify(meta).replace(/<\/script/gi, '<\\/script') + ');\n})();\n';
}
