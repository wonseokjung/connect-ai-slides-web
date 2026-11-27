#!/usr/bin/env node
// connect-ai-slides-web: one story, a deck and a website, with motion from every library, checked on the real screen.
// MIT, CONNECT AI LAB.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {KIT, NAME, RUN, readJson, findChrome, findFfmpeg} from '../lib/tools.mjs';
import {NODE_FLOOR} from '../lib/name.mjs';
import {banner, gold, dimmed} from '../lib/banner.mjs';

// Node floor: say it in plain words instead of a stack trace from a newer syntax
{ const [a, b] = process.versions.node.split('.').map(Number); if (a < NODE_FLOOR[0] || (a === NODE_FLOOR[0] && b < NODE_FLOOR[1])) { console.error(`\n  ${NAME} needs Node ${NODE_FLOOR.join('.')} or newer. This computer has ${process.versions.node}. Get the LTS from nodejs.org, then run this again.\n`); process.exit(1); } }

const argv = process.argv.slice(2);
// npx connect-ai-slides-web my-talk.md  ==  npx connect-ai-slides-web ppt my-talk.md
if (argv[0] && /\.(md|markdown|txt|pptx)$/i.test(argv[0])) argv.unshift('ppt');
const cmd = argv[0] && !argv[0].startsWith('-') ? argv.shift() : argv.includes('--version') || argv.includes('-v') ? 'version' : argv.includes('--help') || argv.includes('-h') ? 'help' : '';
const has = (n) => { const i = argv.indexOf(n); if (i < 0) return false; argv.splice(i, 1); return true; };
const val = (n, d = null) => { const i = argv.indexOf(n); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, 2); return v == null || v.startsWith('--') ? d : v; };
const say = (...a) => console.log(...a);
const rel = (p) => { const r = path.relative(process.cwd(), p); return r && !r.startsWith('..') && r.length < p.length ? r : p; };
const VERSION = readJson(path.join(KIT, 'package.json')).version;

const HELP = `${NAME} ${VERSION}
Not on npm yet: type ${RUN} where it says npx ${NAME}.
One story, a deck and a website. Motion from GSAP, Motion, anime.js, Lottie, CSS, HyperFrames and Remotion, checked on the real screen.

  npx ${NAME} ppt [talk.md] [--look connect|night|white|ivory|paper] [--google] [--open] [--pro] [--classic]
                                            a markdown or text file -> a PowerPoint file (no file: a sample)
                                            tables become charts, $$ formulas, plot:, A -> B flows, pictures get layouts
  npx ${NAME} ppt old-talk.pptx            an old PowerPoint -> its words, pictures and notes -> a new motion deck
  npx ${NAME} import old-talk.pptx [--out talk.md] [--no-pictures] [--hidden] [--labels]
                                            only the first half: old-talk.md + old-talk-media/ to read and tidy
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
  npx ${NAME} export <project> [--pptx] [--pdf] [--google] [--click] [--no-video] [--still-words] [--pptx-pictures]
                                            out/deck.pptx: words you can edit, the motion as clips, notes
                                            (--google: also out/deck_google.pptx for Google Slides)
  npx ${NAME} inspect <file.pptx>           what is inside: text boxes, clips, notes
  npx ${NAME} gallery [--out dir] [--clips] [--only kind,kind] [--map file.json] [--blocks dir]
                                            every catalog block from its example (--blocks: your own too)
  npx ${NAME} install-skill [--claude|--codex|--antigravity|--cursor] [--dir folder] [--no-runtime]
                                            teach your AI agent this kit (Claude Code, Codex, Antigravity, Cursor)
  npx ${NAME} remove-skill                  take it out again
  npx ${NAME} doctor                        is this computer ready?

A project is a folder with story.json (and media/). Docs: README.md, docs/BLOCKS.md (write your own block).`;

function projectArg(what) {
  const p = argv.find((a) => !a.startsWith('-'));
  if (!p) throw new Error(`Give the project folder: ${RUN} ${what} <project>   (a folder with story.json; make one with \`${RUN} new my-talk\`)`);
  argv.splice(argv.indexOf(p), 1);
  const abs = path.resolve(p);
  if (!fs.existsSync(abs)) throw new Error(`There is no folder or file at ${p}. Make a project with \`${RUN} new ${p}\`.`);
  return abs;
}
const framesArg = (dflt) => { const f = []; if (has('--deck')) f.push('deck'); if (has('--site') || has('--web')) f.push('site'); if (has('--phone')) f.push('phone'); return f.length ? f : dflt; };
// an old .pptx -> <name>.md + <name>-media/ next to it (never over a file that is already there)
async function importToMd(file, {out = null, pictures = true, hidden = false, force = false, labels = false} = {}) {
  const {importPptx, printImport} = await import('../lib/import-pptx.mjs');
  const md = path.resolve(out || file.replace(/\.pptx$/i, '.md'));
  if (fs.existsSync(md) && !force) throw new Error(`${rel(md)} is already here. If you changed it, run: ${RUN} ppt ${rel(md)}  (or import again with --out other.md, or --force to write over it)`);
  const mediaName = path.basename(md).replace(/\.[^.]+$/, '') + '-media';
  const mediaDir = path.join(path.dirname(md), mediaName);
  const R = await importPptx(file, {mediaDir: pictures ? mediaDir : null, mediaRel: mediaName, pictures, hidden, labels});
  if (!R.slides.length) throw new Error(`${path.basename(file)} has no slides.`);
  fs.writeFileSync(md, R.md);
  printImport(R, say, {md: rel(md), mediaDir: R.media.length ? rel(mediaDir) : null});
  return md;
}

function openFile(p) { const c = process.platform === 'darwin' ? ['open', [p]] : process.platform === 'win32' ? ['explorer.exe', [p]] : ['xdg-open', [p]]; try { spawn(c[0], c[1], {stdio: 'ignore', detached: true, shell: false, windowsHide: true}).unref(); } catch {} }

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

const BANNER_CMDS = new Set(['', 'help', 'demo', 'ppt', 'pptx', 'deck', 'doctor', 'install-skill', 'catalog', 'new']);
function hello() {
  say(banner());
  say('  ' + 'Your slides, made by your AI employee. ' + gold('Words you can edit, motion that plays, a check on the real screen.') + dimmed('  내 발표자료, AI 직원이 만들어요'));
  say('');
}

async function main() {
  if (BANNER_CMDS.has(cmd) && !argv.includes('--quiet') && !argv.includes('--json')) hello();
  if (argv.includes('--quiet')) argv.splice(argv.indexOf('--quiet'), 1);
  if (cmd === 'version') return say(VERSION);
  if (cmd === 'help') return say(HELP);
  if (!cmd) { say(HELP); say(`\nNew here? Run:  ${RUN} ppt   (a sample talk you can change, then a PowerPoint file)`); return; }

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
    if (!p) throw new Error(`Give a folder name: ${RUN} new my-talk`);
    const dir = path.resolve(p);
    if (fs.existsSync(path.join(dir, 'story.json'))) throw new Error(`${p}/story.json is already there. Pick another folder name, or edit that story.`);
    fs.mkdirSync(path.join(dir, 'media'), {recursive: true});
    fs.writeFileSync(path.join(dir, 'story.json'), JSON.stringify(STARTER(path.basename(dir)), null, 2) + '\n');
    say(`Made ${rel(path.join(dir, 'story.json'))} (3 scenes) and ${rel(path.join(dir, 'media'))}/ for your pictures and videos.`);
    say(`Next:\n  ${RUN} catalog              pick blocks\n  ${RUN} build ${p}\n  ${RUN} check ${p}`);
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
    say(`Now change ${rel(path.join(dir, 'story.json'))}, or ask your coding agent to (${RUN} install-skill).`);
    return;
  }

  if (cmd === 'build') {
    const dir = projectArg('build'), only = framesArg(null);
    const {build} = await import('../lib/build.mjs');
    const b = await build(dir, only ? {stages: [...new Set(only.map((f) => (f === 'deck' ? 'deck' : 'site')))]} : {});
    say('Built:'); printBuilt(b);
    say(`Next: ${RUN} check ${rel(dir)}`);
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
    const dir = projectArg('export');
    let pdf = has('--pdf'), pptx = has('--pptx');
    const pictures = has('--pptx-pictures') || has('--pptx-images'), legacyVideo = has('--pptx-video'), google = has('--google'), noVideo = has('--no-video'), click = has('--click'), font = val('--font'), still = has('--still-words');
    if (pictures || legacyVideo || google || noVideo || click || font) pptx = true;
    const {exportDeck} = await import('../lib/export.mjs');
    const r = await exportDeck(dir, {pdf, pptx, pptxMode: pictures ? 'pictures' : 'editable', video: !noVideo, autoplay: !click, builds: !still, google, font, onProgress: (m) => { if (process.stdout.isTTY) process.stdout.write('\r  ' + m + '   '); }});
    if (process.stdout.isTTY) process.stdout.write('\r' + ' '.repeat(40) + '\r');
    if (r.pptx) say(`  pptx    ${rel(r.pptx)}   (${r.slides} slides)`);
    if (r.google) say(`  google  ${rel(r.google)}`);
    if (r.pdf) say(`  pdf     ${rel(r.pdf)}   (${r.slides} pages)`);
    for (const n of r.notes) say('  ' + n);
    return;
  }

  if (cmd === 'ppt' || cmd === 'pptx' || cmd === 'deck') {
    // the simple door: a markdown or text file in, a PowerPoint file out
    const {parseTalk, talkToStory, bringMedia, SAMPLE} = await import('../lib/markdown.mjs');
    const google = has('--google'), noVideo = has('--no-video'), click = has('--click'), still = has('--still-words'), pdf = has('--pdf'), open = has('--open'), check = has('--check'), ko = has('--ko'), en = has('--en');
    const look = val('--look', 'connect'), outOpt = val('--out'), font = val('--font');
    const file = argv.find((a) => !a.startsWith('-'));
    if (!file) {
      const lang = ko ? 'ko' : en ? 'en' : /^ko/i.test(process.env.LANG || Intl.DateTimeFormat().resolvedOptions().locale || '') ? 'ko' : 'en';
      const name = lang === 'ko' ? 'my-talk.md' : 'my-talk.md';
      if (fs.existsSync(name)) throw new Error(`${name} is already here. Run: ${RUN} ppt ${name}`);
      fs.writeFileSync(name, SAMPLE[lang]);
      say(`Made ${name}: a sample talk in ${lang === 'ko' ? 'Korean' : 'English'} (# title, ## one slide each).`);
      say(`Change the words to yours, then run:\n  ${RUN} ppt ${name}`);
      return;
    }
    let src = path.resolve(file);
    if (!fs.existsSync(src)) throw new Error(`There is no file at ${file}. Run \`${RUN} ppt\` with no file to get a sample my-talk.md.`);
    if (/\.pptx$/i.test(src)) {
      // an old PowerPoint: take its words, pictures and notes into a .md first, then the same road as a .md
      const md = await importToMd(src, {pictures: !has('--no-pictures'), hidden: has('--hidden'), labels: has('--labels')});
      say('');
      src = md;
    }
    const talk = parseTalk(fs.readFileSync(src, 'utf8'), {name: path.basename(src).replace(/\.[^.]+$/, '')});
    if (!talk.title && !talk.slides.length) throw new Error(`${file} has no words in it. Write a # title and a few ## slides.`);
    const {loadCatalog} = await import('../lib/catalog.mjs');
    const okMetas = loadCatalog().filter((m) => m.status === 'ok');
    const story = talkToStory(talk, {look, design: has('--classic') ? 'classic' : has('--pro') ? 'pro' : 'visual', kinds: new Set(okMetas.map((m) => m.kind)), leads: new Map(okMetas.map((m) => [m.kind, m.lead]))});
    const dir = path.resolve(outOpt || src.replace(/\.[^.]+$/, '') + '-deck');
    fs.mkdirSync(path.join(dir, 'media'), {recursive: true});
    const missing = bringMedia(story, path.dirname(src), dir);
    if (missing.length) throw new Error(`These pictures are not there: ${missing.join(', ')} (paths are read from the folder of ${file}).`);
    fs.writeFileSync(path.join(dir, 'story.json'), JSON.stringify(story, null, 2) + '\n');
    say(`${story.scenes.length} slides from ${rel(src)}:`);
    story.scenes.forEach((s, i) => say(`  ${String(i + 1).padStart(2)}  ${s.kind.padEnd(22)} ${String(s.title || s.word || s.text || s.value || (s.lines || [])[0] || s.caption || '').slice(0, 50)}`));
    const {build} = await import('../lib/build.mjs');
    const b = await build(dir);
    if (check) { const {check: run} = await import('../lib/check.mjs'); printCheck(await run(dir, {built: b, frames: ['deck']})); }
    if (has('--deck-only')) { say('Done (no PowerPoint file, --deck-only):'); say(`  deck    ${rel(b.deck.index)}`); say(`  site    ${rel(b.site.index)}`); return; }
    const {exportDeck} = await import('../lib/export.mjs');
    const r = await exportDeck(dir, {pdf, pptx: true, video: !noVideo, autoplay: !click, builds: !still, google, font, onProgress: (m) => { if (process.stdout.isTTY) process.stdout.write('\r  ' + m + '   '); }});
    if (process.stdout.isTTY) process.stdout.write('\r' + ' '.repeat(40) + '\r');
    say('Done:');
    say(`  pptx    ${rel(r.pptx)}   (open it in PowerPoint or Keynote)`);
    if (r.google) say(`  google  ${rel(r.google)}`);
    if (r.pdf) say(`  pdf     ${rel(r.pdf)}`);
    say(`  deck    ${rel(b.deck.index)}   (the same deck in a browser, with every motion)`);
    for (const n of r.notes) say('  ' + n);
    say(`Change a slide: edit ${rel(path.join(dir, 'story.json'))} (or the .md) and run this again.`);
    if (open) openFile(r.pptx);
    return;
  }

  if (cmd === 'import') {
    const f = argv.find((a) => !a.startsWith('-'));
    if (!f || !/\.pptx$/i.test(f)) throw new Error(`Give a .pptx file: ${RUN} import my-old-talk.pptx`);
    if (!fs.existsSync(f)) throw new Error(`There is no file at ${f}.`);
    await importToMd(path.resolve(f), {out: val('--out'), pictures: !has('--no-pictures'), hidden: has('--hidden'), force: has('--force'), labels: has('--labels')});
    return;
  }

  if (cmd === 'inspect') {
    const f = argv.find((a) => !a.startsWith('-'));
    if (!f || !/\.pptx$/i.test(f)) throw new Error(`Give a .pptx file: ${RUN} inspect out/deck.pptx`);
    const {inspectPptx, printInspect} = await import('../lib/inspect-pptx.mjs');
    const r = await inspectPptx(path.resolve(f));
    if (has('--json')) return say(JSON.stringify(r, null, 2));
    printInspect(r, say);
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
    server.on('error', (e) => { console.error(e.code === 'EADDRINUSE' ? `\n  Port ${port} is taken. Try: ${RUN} serve ${rel(dir)} --port ${port + 1}\n` : '\n  ' + e.message + '\n'); process.exit(1); });
    server.listen(port, '0.0.0.0', () => {
      say(`Serving ${rel(root)}  (Ctrl+C to stop)`);
      say(`  this computer   http://localhost:${port}/deck/   http://localhost:${port}/site/`);
      for (const list of Object.values(os.networkInterfaces())) for (const n of list || []) if (n.family === 'IPv4' && !n.internal && !n.address.startsWith('169.254.')) say(`  phone, same Wi-Fi   http://${n.address}:${port}/site/`);
      say('After you change story.json, run build again and reload.');
    });
    return;
  }

  if (cmd === 'install-skill' || cmd === 'remove-skill') {
    const {installSkill, removeSkill} = await import('../lib/install.mjs');
    const remove = cmd === 'remove-skill' || has('--remove'), dryRun = has('--dry-run'), noRuntime = has('--no-runtime'), project = has('--project'), dirOpt = val('--dir');
    let agent = val('--agent', 'all');
    for (const k of ['claude', 'codex', 'antigravity', 'cursor', 'gemini']) if (has('--' + k)) agent = agent === 'all' ? k : agent + ',' + k;
    if (has('--agents')) agent = 'codex';
    say(remove ? 'Removing the skill:' : 'Installing the skill (a folder copy; your agent settings are not touched):');
    if (remove) removeSkill({agent, dir: dirOpt, project, dryRun});
    else {
      const list = installSkill({agent, dir: dirOpt, project, dryRun, runtime: !noRuntime});
      if (list.some((t) => t.done)) {
        say('');
        say('  ' + gold('Done.') + ' Open a new chat with your agent and say:');
        say('    "make a presentation about <your topic> with connect-ai-slides-web, as a PowerPoint file"');
        say(dimmed('    "connect-ai-slides-web 로 <주제> 발표자료 PPT 만들어 줘"'));
      }
    }
    return;
  }

  throw new Error(`"${cmd}" is not a command. Run \`${RUN} --help\`.`);
}

// leave only after stdout is flushed (a long `catalog --json` through a pipe), and do not wait for a slow Chrome
main().then(() => { if (cmd !== 'serve') process.stdout.write('', () => process.exit(process.exitCode || 0)); }).catch((e) => {
  console.error('\n  ' + String(e && e.message ? e.message : e).split('\n').join('\n  ') + '\n');
  if (process.env.CONNECT_AI_DEBUG) console.error(e);
  process.exit(1);
});
