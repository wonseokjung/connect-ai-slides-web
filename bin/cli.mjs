#!/usr/bin/env node
// connect-ai-slides-web: one story, a deck and a website, with motion from every library, checked on the real screen.
// MIT, CONNECT AI LAB.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {KIT, NAME, readJson, findChrome, findFfmpeg} from '../lib/tools.mjs';

const argv = process.argv.slice(2);
const cmd = argv[0] && !argv[0].startsWith('-') ? argv.shift() : argv.includes('--version') || argv.includes('-v') ? 'version' : argv.includes('--help') || argv.includes('-h') ? 'help' : '';
const has = (n) => { const i = argv.indexOf(n); if (i < 0) return false; argv.splice(i, 1); return true; };
const val = (n, d = null) => { const i = argv.indexOf(n); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, 2); return v == null || v.startsWith('--') ? d : v; };
const say = (...a) => console.log(...a);
const rel = (p) => { const r = path.relative(process.cwd(), p); return r && !r.startsWith('..') && r.length < p.length ? r : p; };
const VERSION = readJson(path.join(KIT, 'package.json')).version;

const HELP = `${NAME} ${VERSION}
One story, a deck and a website. Motion from GSAP, Motion, anime.js, Lottie, CSS, HyperFrames and Remotion, checked on the real screen.

  npx ${NAME} demo [folder] [--open]        the sample, start to finish (deck + website + report)
  npx ${NAME} new <folder>                  a three-scene starter story
  npx ${NAME} catalog [--use x] [--source x] [--json]
                                            every block you can call
  npx ${NAME} build <project> [--deck|--site]
                                            story.json -> out/deck/index.html and out/site/index.html
  npx ${NAME} check <project> [--deck] [--site] [--phone]
                                            measure the real screen, write out/report.md
  npx ${NAME} serve <project> [--port 4173] look at it in a browser, or on your phone (same Wi-Fi)
  npx ${NAME} record <project> [--deck] [--site] [--phone] [--sheet] [--fps 30] [--jobs 2]
                                            out/deck.mp4, out/site.mp4, out/phone.mp4
                                            (--sheet-only: just out/sheet_*.jpg, one still per scene)
  npx ${NAME} export <project> [--pdf] [--pptx] [--pptx-video]
                                            out/deck.pdf, out/deck.pptx (finished screens + notes)
  npx ${NAME} gallery [--out dir] [--clips] [--only kind,kind] [--map file.json] [--blocks dir]
                                            every catalog block from its example (--blocks: your own too)
  npx ${NAME} install-skill [--claude|--codex|--agents] [--project dir] [--remove]
                                            teach your coding agent to use this kit
  npx ${NAME} doctor                        is this computer ready?

A project is a folder with story.json (and media/). Docs: README.md, docs/BLOCKS.md (write your own block).`;

function projectArg(what) {
  const p = argv.find((a) => !a.startsWith('-'));
  if (!p) throw new Error(`Give the project folder: npx ${NAME} ${what} <project>   (a folder with story.json; make one with \`npx ${NAME} new my-talk\`)`);
  argv.splice(argv.indexOf(p), 1);
  const abs = path.resolve(p);
  if (!fs.existsSync(abs)) throw new Error(`There is no folder or file at ${p}. Make a project with \`npx ${NAME} new ${p}\`.`);
  return abs;
}
const framesArg = (dflt) => { const f = []; if (has('--deck')) f.push('deck'); if (has('--site') || has('--web')) f.push('site'); if (has('--phone')) f.push('phone'); return f.length ? f : dflt; };
function openFile(p) { const c = process.platform === 'darwin' ? ['open', [p]] : process.platform === 'win32' ? ['cmd', ['/c', 'start', '', p]] : ['xdg-open', [p]]; try { spawn(c[0], c[1], {stdio: 'ignore', detached: true}).unref(); } catch {} }

function printBuilt(b) {
  if (b.deck) say(`  deck     ${rel(b.deck.index)}   (${b.deck.scenes} slides; open it by double click)`);
  if (b.site) say(`  website  ${rel(b.site.index)}   (${b.site.scenes} screens)`);
}
function printCheck(r) {
  say(r.ok ? `check: PASS (0 errors, ${r.advice.length} advice)` : `check: FAIL (${r.errors.length} ${r.errors.length === 1 ? 'error' : 'errors'}, ${r.advice.length} advice)`);
  for (const e of r.errors) say('  ERROR  ' + e.msg);
  for (const e of r.advice.slice(0, 12)) say('  advice ' + e.msg);
  if (r.advice.length > 12) say(`  ... and ${r.advice.length - 12} more in the report`);
  if (r.report) say('  report   ' + rel(r.report));
}

const STARTER = (name) => ({
  title: name, description: '', lang: 'en', look: 'connect',
  brand: {name, links: [{label: 'Contact', href: 'mailto:you@example.com'}]},
  scenes: [
    {id: 'open', kind: 'gsap/split-title', kicker: 'Your name or brand', title: 'Your title in a few words', sub: 'One line that says what this is about.', notes: 'What you will say on this slide.'},
    {id: 'points', kind: 'kit/flow-diagram', kicker: 'The idea', title: 'How it works, in one picture', from: [{title: 'What goes in', text: 'One short line.'}], hub: 'Your idea', to: [{title: 'Result one', text: 'One short line.'}, {title: 'Result two', text: 'One short line.'}], notes: 'A picture between two slides of words. Put your own photo or clip in media/ and try kit/photo-frame or kit/film-hero.'},
    {id: 'end', kind: 'css/light-sweep', kicker: 'Thank you', word: 'The end', sub: 'How people can reach you.', notes: 'Close.'},
  ],
});

async function main() {
  if (cmd === 'version') return say(VERSION);
  if (cmd === 'help') return say(HELP);
  if (!cmd) { say(HELP); say(`\nNew here? Run:  npx ${NAME} demo`); return; }

  if (cmd === 'doctor') { const {doctor} = await import('../lib/doctor.mjs'); const ok = await doctor(); process.exitCode = ok ? 0 : 1; return; }

  if (cmd === 'catalog') {
    const {loadCatalog} = await import('../lib/catalog.mjs');
    const use = val('--use'), source = val('--source'), json = has('--json');
    let cat = loadCatalog();
    if (use) cat = cat.filter((m) => m.use === use);
    if (source) cat = cat.filter((m) => m.kind.startsWith(source + '/'));
    if (json) return say(JSON.stringify(cat.map(({dir, errors, ...m}) => ({...m, problems: errors})), null, 2));
    const ready = cat.filter((m) => m.status === 'ok' && !m.errors.length);
    say(`${ready.length} blocks ready${cat.length - ready.length ? ` (${cat.length - ready.length} not usable, reasons below)` : ''}, ${ready.filter((m) => m.lead === 'picture').length} led by a picture. One line in story.json each: {"kind": "<kind>", ...props}\nColumns: kind, use, lead (picture or type), plays once or follows the scroll, licence, title.\n`);
    let last = '';
    for (const m of cat) {
      const src = m.kind.split('/')[0];
      if (src !== last) { last = src; say(`${src}`); }
      const ok = m.status === 'ok' && !m.errors.length;
      say(`  ${m.kind.padEnd(28)} ${String(m.use || '').padEnd(10)} ${String(m.lead || '').padEnd(8)} ${ok ? (m.site && m.site.mode === 'scrub' ? 'scroll' : 'play  ') : 'NO    '} ${String(m.license || '').padEnd(30)} ${m.title || ''}`);
      if (!ok) say(`      not usable: ${(m.errors.length ? m.errors : m.reasons || []).join('; ')}`);
      else { say(`      ${m.description}`); say(`      props: ${Object.entries(m.props || {}).map(([k, v]) => (String(v).startsWith('required') ? k + '*' : k)).join(', ')}   (* = required)`); }
    }
    say(`\nuse = what it is for (--use title|statement|person|number|steps|list|compare|quote|media|diagram|chart|timeline|ident|cta|chapter|background)`);
    say(`play = plays once when seen; scroll = follows the scroll on the website. Details of one block: catalog --json`);
    return;
  }

  if (cmd === 'new') {
    const p = argv.find((a) => !a.startsWith('-'));
    if (!p) throw new Error(`Give a folder name: npx ${NAME} new my-talk`);
    const dir = path.resolve(p);
    if (fs.existsSync(path.join(dir, 'story.json'))) throw new Error(`${p}/story.json is already there. Pick another folder name, or edit that story.`);
    fs.mkdirSync(path.join(dir, 'media'), {recursive: true});
    fs.writeFileSync(path.join(dir, 'story.json'), JSON.stringify(STARTER(path.basename(dir)), null, 2) + '\n');
    say(`Made ${rel(path.join(dir, 'story.json'))} (3 scenes) and ${rel(path.join(dir, 'media'))}/ for your pictures and videos.`);
    say(`Next:\n  npx ${NAME} catalog              pick blocks\n  npx ${NAME} build ${p}\n  npx ${NAME} check ${p}`);
    return;
  }

  if (cmd === 'demo') {
    const open = has('--open'), noCheck = has('--no-check');
    const p = argv.find((a) => !a.startsWith('-')) || NAME + '-demo';
    const dir = path.resolve(p);
    fs.mkdirSync(path.join(dir, 'media'), {recursive: true});
    fs.copyFileSync(path.join(KIT, 'examples', 'sample', 'story.json'), path.join(dir, 'story.json'));
    for (const f of fs.readdirSync(path.join(KIT, 'examples', 'media'))) fs.copyFileSync(path.join(KIT, 'examples', 'media', f), path.join(dir, 'media', f));
    say(`Sample project: ${rel(dir)} (story.json + media/). The person in it is a drawn stand-in.`);
    const {build} = await import('../lib/build.mjs');
    const b = await build(dir);
    printBuilt(b);
    if (!noCheck) {
      if (findChrome()) { const {check} = await import('../lib/check.mjs'); printCheck(await check(dir, {built: b})); }
      else say('check: skipped (no Chrome found; install Chrome, Edge or Chromium to measure the screen).');
    }
    if (open) { openFile(b.deck.index); openFile(b.site.index); } else say(`Open them: double click the two index.html files, or run this again with --open.`);
    say(`Now change ${rel(path.join(dir, 'story.json'))}, or ask your coding agent to (npx ${NAME} install-skill).`);
    return;
  }

  if (cmd === 'build') {
    const dir = projectArg('build'), only = framesArg(null);
    const {build} = await import('../lib/build.mjs');
    const b = await build(dir, only ? {stages: [...new Set(only.map((f) => (f === 'deck' ? 'deck' : 'site')))]} : {});
    say('Built:'); printBuilt(b);
    say(`Next: npx ${NAME} check ${rel(dir)}`);
    return;
  }

  if (cmd === 'check') {
    const dir = projectArg('check'), frames = framesArg(['deck', 'site', 'phone']);
    const {check} = await import('../lib/check.mjs');
    const r = await check(dir, {frames});
    printCheck(r);
    process.exitCode = r.ok ? 0 : 1;
    return;
  }

  if (cmd === 'record') {
    const sheetOnly = has('--sheet-only'), sheet = has('--sheet') || sheetOnly, fps = +val('--fps', 30), jobs = +val('--jobs', 2), frames = framesArg(sheetOnly ? ['deck', 'site', 'phone'] : ['deck', 'site']), dir = projectArg('record');
    const {record} = await import('../lib/record.mjs');
    let last = '';
    const r = await record(dir, {frames, sheet, sheetOnly, fps, jobs, onProgress: (f, a, n) => { const s = `  ${f} ${Math.round((100 * a) / n)} %`; if (s !== last && process.stdout.isTTY) { process.stdout.write('\r' + s + '   '); last = s; } }});
    if (process.stdout.isTTY) process.stdout.write('\r');
    for (const f of r.files) say(`  ${f.frame.padEnd(5)} ${rel(f.file)}   ${f.width}x${f.height}, ${f.seconds.toFixed(1)} s, ${f.frames} frames`);
    for (const s of r.sheets) say(`  sheet ${rel(s)}`);
    if (r.files.length) say('Every frame was seeked and captured one by one. Watch the clip once before you post it.');
    return;
  }

  if (cmd === 'export') {
    const dir = projectArg('export'), pdf = has('--pdf'), pptx = has('--pptx'), pptxVideo = has('--pptx-video');
    const {exportDeck} = await import('../lib/export.mjs');
    const r = await exportDeck(dir, {pdf, pptx: pptx || pptxVideo, pptxVideo});
    if (r.pdf) say(`  pdf   ${rel(r.pdf)}   (${r.slides} pages)`);
    if (r.pptx) say(`  pptx  ${rel(r.pptx)}   (${r.slides} slides)`);
    for (const n of r.notes) say('  ' + n);
    return;
  }

  if (cmd === 'gallery') {
    const out = val('--out'), clips = has('--clips'), only = (val('--only') || '').split(',').filter(Boolean), map = val('--map'), jobs = +val('--jobs', 2), fr = (val('--frames') || '').split(',').filter(Boolean), look = val('--look'), blocks = val('--blocks');
    const {gallery} = await import('../lib/gallery.mjs');
    const r = await gallery({out, clips, only, map: map ? path.resolve(map) : null, jobs, frames: fr, look, extraCatalog: blocks ? [path.resolve(blocks)] : [], onProgress: (k) => say('  clip ' + k)});
    say(`${r.items.length} blocks in ${rel(r.project)}`);
    say(`  deck     ${rel(path.join(r.out, 'deck', 'index.html'))}`);
    if (fs.existsSync(path.join(r.out, 'site'))) say(`  website  ${rel(path.join(r.out, 'site', 'index.html'))}`);
    for (const [f, s] of Object.entries(r.sheets)) say(`  sheet    ${rel(s)}   (${f})`);
    if (clips) say(`  clips    ${rel(path.join(r.out, 'clips'))}/`);
    say(`  data     ${rel(r.json)}`);
    for (const s of r.skipped) say(`  not shown: ${s.kind} (${s.reasons.join('; ')})`);
    for (const p of r.problems) say('  PROBLEM ' + p);
    process.exitCode = r.problems.length ? 1 : 0;
    return;
  }

  if (cmd === 'serve') {
    const dir = projectArg('serve'), port = +val('--port', 4173);
    const root = fs.statSync(dir).isFile() ? path.join(path.dirname(dir), 'out') : path.join(dir, 'out');
    if (!fs.existsSync(path.join(root, 'deck', 'index.html')) && !fs.existsSync(path.join(root, 'site', 'index.html'))) { const {build} = await import('../lib/build.mjs'); await build(dir); }
    const TYPES = {html: 'text/html; charset=utf-8', js: 'text/javascript; charset=utf-8', css: 'text/css; charset=utf-8', json: 'application/json', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', avif: 'image/avif', gif: 'image/gif', mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', txt: 'text/plain; charset=utf-8', md: 'text/plain; charset=utf-8', pdf: 'application/pdf', woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf'};
    const server = http.createServer((req, res) => {
      let u; try { u = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400); return res.end(); }
      let file = path.join(root, path.normalize(u).replace(/^([/\\]|\.\.)+/, ''));
      if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
      if (u === '/') { res.writeHead(200, {'content-type': TYPES.html}); return res.end(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${NAME}</title><body style="background:#0B0A08;color:#EBE2D2;font:300 20px -apple-system,Segoe UI,sans-serif;padding:8vw"><p style="letter-spacing:.3em;font-size:12px;color:#F2B45A">${NAME.toUpperCase()}</p>${['deck', 'site'].filter((s) => fs.existsSync(path.join(root, s, 'index.html'))).map((s) => `<p><a style="color:#fff" href="/${s}/">${s === 'deck' ? 'Deck' : 'Website'}</a></p>`).join('')}</body>`); }
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) { if (!u.endsWith('/')) { res.writeHead(301, {location: u + '/'}); return res.end(); } file = path.join(file, 'index.html'); }
      if (!fs.existsSync(file)) { res.writeHead(404, {'content-type': 'text/plain'}); return res.end('not found'); }
      const size = fs.statSync(file).size, type = TYPES[path.extname(file).slice(1).toLowerCase()] || 'application/octet-stream', range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
      if (range) {   // phones ask for videos in pieces
        const a = range[1] ? +range[1] : 0, b = range[2] ? Math.min(+range[2], size - 1) : size - 1;
        if (a > b || a >= size) { res.writeHead(416, {'content-range': `bytes */${size}`}); return res.end(); }
        res.writeHead(206, {'content-type': type, 'content-range': `bytes ${a}-${b}/${size}`, 'accept-ranges': 'bytes', 'content-length': b - a + 1, 'cache-control': 'no-store'});
        return fs.createReadStream(file, {start: a, end: b}).pipe(res);
      }
      res.writeHead(200, {'content-type': type, 'content-length': size, 'accept-ranges': 'bytes', 'cache-control': 'no-store'});
      fs.createReadStream(file).pipe(res);
    });
    server.on('error', (e) => { console.error(e.code === 'EADDRINUSE' ? `\n  Port ${port} is taken. Try: npx ${NAME} serve ${rel(dir)} --port ${port + 1}\n` : '\n  ' + e.message + '\n'); process.exit(1); });
    server.listen(port, '0.0.0.0', () => {
      say(`Serving ${rel(root)}  (Ctrl+C to stop)`);
      say(`  this computer   http://localhost:${port}/deck/   http://localhost:${port}/site/`);
      for (const list of Object.values(os.networkInterfaces())) for (const n of list || []) if (n.family === 'IPv4' && !n.internal && !n.address.startsWith('169.254.')) say(`  phone, same Wi-Fi   http://${n.address}:${port}/site/`);
      say('After you change story.json, run build again and reload.');
    });
    return;
  }

  if (cmd === 'install-skill') {
    const {installSkill, removeSkill} = await import('../lib/install.mjs');
    const remove = has('--remove'), dryRun = has('--dry-run'), project = argv.includes('--project') ? val('--project', true) : null, dirOpt = val('--dir');
    let agent = val('--agent', 'all');
    if (has('--claude')) agent = 'claude'; if (has('--codex')) agent = 'codex'; if (has('--agents')) agent = 'agents';
    say(remove ? 'Removing the skill:' : 'Installing the skill (a folder copy; your agent settings are not touched):');
    if (remove) removeSkill({agent, dir: dirOpt, project, dryRun});
    else { const list = installSkill({agent, dir: dirOpt, project, dryRun}); if (list.some((t) => t.action === 'install' || t.action === 'update')) say(`Now ask your agent: "make a deck and a one-page website about <your topic> with ${NAME}".`); }
    return;
  }

  throw new Error(`"${cmd}" is not a command. Run \`npx ${NAME} --help\`.`);
}

// leave only after stdout is flushed (a long `catalog --json` through a pipe), and do not wait for a slow Chrome
main().then(() => { if (cmd !== 'serve') process.stdout.write('', () => process.exit(process.exitCode || 0)); }).catch((e) => {
  console.error('\n  ' + String(e && e.message ? e.message : e).split('\n').join('\n  ') + '\n');
  if (process.env.CONNECT_AI_DEBUG) console.error(e);
  process.exit(1);
});
