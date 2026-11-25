// Tests. Part A needs nothing but Node. Part B opens Chrome (skipped, not failed, when there is none):
// the sample passes its own check, stories that are wrong on purpose are caught with a sentence, and every catalog
// block mounts in the three frames. Run: node tests/run.mjs   (--fast skips the catalog-wide pass)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {KIT, NAME, readPng, findChrome, findFfmpeg, pkgDir, closeBrowser} from '../lib/tools.mjs';
import {loadCatalog, validateMeta, wrapBlock, byKind} from '../lib/catalog.mjs';
import {build, loadStory, validateStory, sceneText} from '../lib/build.mjs';
import {check, countWords, ratio, contrastOf} from '../lib/check.mjs';
import {installSkill, removeSkill, installRuntime, pinSkill} from '../lib/install.mjs';
import {parseTalk, talkToStory, fromDeckMarkdown, SAMPLE} from '../lib/markdown.mjs';
import {importPptx} from '../lib/import-pptx.mjs';
import {textBox, faceFor, slideTiming, patchTiming} from '../lib/pptx.mjs';
import {inspectPptx} from '../lib/inspect-pptx.mjs';
import {eyeVerdict, eyesAvailable, measureEyes, EYES} from '../lib/eyes.mjs';

const FAST = process.argv.includes('--fast');
let passed = 0, skipped = 0, failed = 0;
const ok = (name) => console.log(`  ok ${++passed} ${name}`);
const skip = (name, why) => { skipped++; console.log(`  SKIP ${name} (${why})`); };
async function test(name, fn) { try { const r = await fn(); ok(name + (typeof r === 'string' ? ': ' + r : '')); } catch (e) { failed++; console.log(`  FAIL ${name}\n       ${String(e.message).split('\n').slice(0, 6).join('\n       ')}`); } }
const tmp = (tag) => fs.mkdtempSync(path.join(os.tmpdir(), 'cs-test-' + tag + '-'));
const FIX = path.join(KIT, 'tests', 'fixtures', 'blocks');
function project(scenes, extra = {}) {
  const dir = tmp('p');
  fs.cpSync(path.join(KIT, 'examples', 'media'), path.join(dir, 'media'), {recursive: true});
  fs.writeFileSync(path.join(dir, 'story.json'), JSON.stringify({title: 'test', look: 'connect', brand: {name: 'TEST BRAND', links: [{label: 'Contact', href: 'mailto:a@example.com'}]}, blocks: [FIX], scenes, ...extra}, null, 2));
  return dir;
}
const cat = loadCatalog();
const ready = cat.filter((m) => m.status === 'ok' && !m.errors.length);

console.log('A. without a browser');

await test('every catalog meta follows the contract', () => {
  const bad = cat.filter((m) => m.errors.length).map((m) => m.kind + ': ' + m.errors.join('; '));
  assert.equal(bad.length, 0, bad.join('\n'));
  assert.ok(ready.length >= 60, 'at least 60 blocks, found ' + ready.length);
  return `${ready.length} blocks from ${new Set(ready.map((m) => m.kind.split('/')[0])).size} sources`;
});

await test('every block has its own design (family) and a usable example', () => {
  const fam = {};
  for (const m of ready) (fam[m.family] = fam[m.family] || []).push(m.kind);
  const dup = Object.entries(fam).filter(([, l]) => l.length > 1).map(([f, l]) => f + ' = ' + l.join(', '));
  assert.equal(dup.length, 0, 'same family twice: ' + dup.join(' | '));
  for (const m of ready) for (const [k, spec] of Object.entries(m.props)) if (/^required/.test(String(spec))) assert.ok(m.example[k] != null, `${m.kind}: the example has no "${k}"`);
});

await test('block sources keep the rules (no own clock, no imports, no px type, no remote files, no emoji)', () => {
  const rules = [
    [/^\s*import\s/m, 'an import'], [/\brequestAnimationFrame\b/, 'requestAnimationFrame'], [/\bsetTimeout\s*\(/, 'setTimeout'], [/\bsetInterval\s*\(/, 'setInterval'], [/Math\.random/, 'Math.random'],
    [/font-size:\s*[\d.]+px/, 'a px font size'], [/font:\s*[^;`]*\b\d+px/, 'a px font size (font shorthand)'], [/["'(]https?:\/\/(?!www\.w3\.org)/, 'a remote URL'], [/\p{Extended_Pictographic}/u, 'an emoji'], [/\btransition\s*:/, 'a CSS transition (cannot be seeked)'],
  ];
  const hits = [];
  for (const m of ready) { const src = fs.readFileSync(path.join(m.dir, 'block.js'), 'utf8').replace(/\/\/[^\n]*/g, ''); for (const [re, what] of rules) { if (/px font size/.test(what) && m.source.type === 'hyperframes') continue; if (re.test(src)) hits.push(`${m.kind}: ${what}`); } }      // a HyperFrames block is a fixed canvas that is scaled as a whole, px is right there
  assert.equal(hits.length, 0, hits.join('\n'));
});

await test('every block says what leads its screen, and at least half of the catalog is led by a picture', () => {
  const pic = ready.filter((m) => m.lead === 'picture'), type = ready.filter((m) => m.lead === 'type');
  assert.equal(pic.length + type.length, ready.length);
  assert.ok(pic.length * 2 >= ready.length, `${pic.length} of ${ready.length} blocks are led by a picture`);
  assert.ok(validateMeta({...ready[0], lead: 'words'}, null).some((e) => /lead must be/.test(e)), 'a wrong lead is refused');
  return `${pic.length} picture, ${type.length} type`;
});

await test('catalog examples carry brand lines and facts only (no invented slogans, no unverified years)', () => {
  const banned = [/come and learn/i, /leaves you a tool/i, /your teacher/i, /then make it/i, /\b(19|20)\d\d\b(?! x)/, /made beautifully/i, /one road/i, /three places/i, /beyond video/i, /meet the mentor/i, /\b(best|first ever|only one|number one)\b/i, /[\u300C\u300D\u2014]/];
  const hits = [];
  for (const m of ready) { const words = sceneText({kind: m.kind, ...m.example}).join(' | '); for (const re of banned) if (re.test(words)) hits.push(`${m.kind}: ${re} in "${words.slice(0, 80)}"`); }
  assert.equal(hits.length, 0, hits.join('\n'));
});

await test('eyes: closed, a blink, looking down and open eyes are told apart, and a picture without a face says nothing', () => {
  assert.equal(eyeVerdict({faces: 1, open: 0.09, py: 0.4}), 'closed');
  assert.equal(eyeVerdict({faces: 1, open: EYES.closed + 0.01, py: 0.62}), 'half');
  assert.equal(eyeVerdict({faces: 1, open: 0.3, py: 0.5}), 'down');
  assert.equal(eyeVerdict({faces: 1, open: 0.3, py: 0.62}), 'ok');
  assert.equal(eyeVerdict({faces: 0}), null); assert.equal(eyeVerdict(undefined), null); assert.equal(eyeVerdict({error: 'cannot read'}), null);
  assert.deepEqual(measureEyes([path.join(KIT, 'examples', 'media', 'person.svg'), '/nowhere/x.jpg']), {}, 'files it cannot read are left out');
  // on the author's computer: real frames with open and closed eyes (not in the package: no photo of a person ships with the kit)
  const fx = process.env.CONNECT_AI_EYE_FIXTURES;
  if (fx && eyesAvailable()) {
    const open = path.join(fx, 'open.jpg'), shut = path.join(fx, 'closed.jpg'), r = measureEyes([open, shut]);
    assert.equal(eyeVerdict(r[open]), 'ok', JSON.stringify(r[open])); assert.equal(eyeVerdict(r[shut]), 'closed', JSON.stringify(r[shut]));
    return 'measured two real frames: open ' + r[open].open + ', closed ' + r[shut].open;
  }
  return eyesAvailable() ? 'face landmarks available here' : 'no face landmarks here (the check will say it skipped)';
});

await test('wrapBlock turns a block into a classic script, and refuses imports', () => {
  const m = ready.find((x) => x.kind === 'gsap/split-title');
  const js = wrapBlock(m);
  assert.ok(/CS\.register\("gsap\/split-title", __mount/.test(js) && !/export\s/.test(js));
  new Function('CS', js);     // parses
  const d = tmp('b'); fs.writeFileSync(path.join(d, 'block.js'), "import x from 'y';\nexport default function mount() {}\n");
  assert.throws(() => wrapBlock({kind: 'x/y', dir: d}), /must not import/);
});

await test('validateMeta says what is wrong with a meta', () => {
  const e = validateMeta({kind: 'Bad Kind', use: 'nope'});
  for (const w of ['kind must look like', 'title is missing', 'license is missing', 'use must be one of', 'family is missing', 'example is missing']) assert.ok(e.some((x) => x.includes(w)), w);
});

await test('a story with an unknown kind, a missing required prop or a repeated id is refused with a sentence', async () => {
  const dir = project([{id: 'a', kind: 'gsap/does-not-exist'}, {id: 'b', kind: 'gsap/split-title'}, {id: 'b', kind: 'gsap/split-title', title: 'Two'}]);
  const errs = validateStory(loadStory(dir), cat);
  assert.ok(errs.some((e) => /unknown kind "gsap\/does-not-exist"/.test(e) && /catalog/.test(e)));
  assert.ok(errs.some((e) => /needs "title"/.test(e)));
  assert.ok(errs.some((e) => /used twice/.test(e)));
  const r = await check(dir, {frames: ['deck']});
  assert.equal(r.ok, false); assert.ok(r.errors.every((e) => e.what === 'story') && r.errors.length === 3);
  assert.ok(fs.existsSync(path.join(dir, 'out', 'report.md')));
  return r.errors[0].msg;
});

await test('words are counted the same way in English and Korean', () => {
  assert.equal(countWords('AI education for everyone, made beautifully.'), 6);
  assert.equal(countWords('모두를 위한 인공지능 교육'), 5);            // 11 Hangul letters / 2.5
  assert.equal(countWords('AI 야학당 8 PM'), 3 + 2);
  assert.equal(countWords(' - / '), 0);
});

await test('contrast: white on black is 21, the unlucky tenth decides', () => {
  assert.ok(Math.abs(ratio([255, 255, 255], [0, 0, 0]) - 21) < 0.01);
  const w = 40, h = 10, data = Buffer.alloc(w * h * 3);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = x < 8 ? 235 : 10; data.fill(v, (y * w + x) * 3, (y * w + x) * 3 + 3); }   // a bright patch under the first fifth
  const c = contrastOf({x: 0, y: 0, w, h, color: [255, 255, 255], alpha: 1}, {w, h, ch: 3, data}, 1);
  assert.ok(c < 1.5, 'white text over a bright patch must fail, got ' + c);
});

await test('readPng reads our own screenshots format (RGB and RGBA, all filters)', () => {
  const crc = (buf) => { let c, n = ~0; for (const b of buf) { c = (n ^ b) & 255; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; n = (n >>> 8) ^ c; } return ~n >>> 0; };
  const chunk = (type, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(type), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const w = 3, h = 5, ch = 4, px = Buffer.from(Array.from({length: w * h * ch}, (_, i) => (i * 37 + 11) & 255));
  const rows = [];
  for (let y = 0; y < h; y++) {      // one row per filter type 0..4
    const row = Buffer.alloc(w * ch + 1); row[0] = y;
    for (let x = 0; x < w * ch; x++) { const v = px[y * w * ch + x], a = x >= ch ? px[y * w * ch + x - ch] : 0, b = y ? px[(y - 1) * w * ch + x] : 0, c = x >= ch && y ? px[(y - 1) * w * ch + x - ch] : 0; const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c); const pred = [0, a, b, (a + b) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? b : c][y]; row[x + 1] = (v - pred) & 255; }
    rows.push(row);
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(Buffer.concat(rows))), chunk('IEND', Buffer.alloc(0))]);
  const r = readPng(png);
  assert.deepEqual([r.w, r.h, r.ch], [w, h, ch]); assert.ok(r.data.equals(px));
});

await test('build: static folders, no CDN, only the libraries the story uses, their licences inside', async () => {
  const dir = tmp('sample'); fs.cpSync(path.join(KIT, 'examples', 'sample'), dir, {recursive: true}); fs.cpSync(path.join(KIT, 'examples', 'media'), path.join(dir, 'media'), {recursive: true});
  const b = await build(dir);
  for (const stage of ['deck', 'site']) {
    const html = fs.readFileSync(path.join(b.out, stage, 'index.html'), 'utf8');
    assert.ok(!/(src|href)="https?:\/\/[^"]+\.(js|css|woff2?)/.test(html), stage + ': a script, style or font from the internet');
    assert.ok(!/<script[^>]+type="module"/.test(html), 'no ES modules (the folder must open from file://)');
    for (const m of html.matchAll(/(?:src|href)="(assets\/[^"]+)"/g)) assert.ok(fs.existsSync(path.join(b.out, stage, m[1])), 'missing ' + m[1]);
    assert.ok(fs.existsSync(path.join(b.out, stage, 'assets/vendor/licenses/README.txt')) && fs.existsSync(path.join(b.out, stage, 'README.txt')));
    assert.ok(/<noscript>[\s\S]*One story/.test(html), 'the words are in the page for readers without JavaScript');
  }
  const v = fs.readdirSync(path.join(b.out, 'deck/assets/vendor'));
  // the sample uses GSAP, Motion and Lottie blocks and no anime.js block: anime.js must stay out
  assert.ok(v.includes('reveal.js') && v.includes('gsap.min.js') && v.includes('motion.js') && v.includes('lottie_light.min.js'), 'the libraries of the sample: ' + v.join(', '));
  assert.ok(!v.includes('anime.umd.min.js'), 'anime.js is copied although no scene uses it');
  assert.ok(!v.includes('lenis.min.js') && fs.existsSync(path.join(b.out, 'site/assets/vendor/lenis.min.js')), 'lenis only on the site, reveal only on the deck');
  const blocks = fs.readFileSync(path.join(b.out, 'deck/assets/blocks.js'), 'utf8');
  assert.ok(blocks.includes('"kit/film-hero"') && !blocks.includes('"gsap/flip-grid"'), 'only used blocks are shipped');
  assert.ok(fs.readdirSync(path.join(b.out, 'deck/assets/vendor/licenses')).length >= 5);
  return `deck ${b.deck.scenes} slides, site ${b.site.scenes} screens`;
});

await test('build: your own blocks folder, your own Lottie file, back-slash paths, deck-only and site-only scenes', async () => {
  const dir = project([{id: 'mine', kind: 'test/good', text: 'My own block'}, {id: 'l', kind: 'lottie/check-list', items: ['One', 'Two'], only: 'deck'}, {id: 'h', kind: 'kit/hero-video', src: 'media\\person.svg', title: 'Back slashes are fine', face: [0.39, 0.2, 0.22, 0.4], only: 'site'}]);
  const b = await build(dir);
  assert.equal(b.deck.scenes, 2); assert.equal(b.site.scenes, 2);
  assert.ok(fs.readFileSync(path.join(b.out, 'deck/assets/blocks.js'), 'utf8').includes('"test/good"'));
  assert.ok(fs.readFileSync(path.join(b.out, 'site/index.html'), 'utf8').includes('"media/person.svg"') && fs.existsSync(path.join(b.out, 'site/media/person.svg')));
  assert.deepEqual(sceneText({kind: 'x/y', id: 'a', title: 'T', items: ['one', {title: 'two', text: 'three'}], src: 'media/a.mp4', notes: 'n', href: 'https://x.y'}), ['T', 'one', 'two', 'three']);
  if (ready.some((m) => m.kind === 'lottie/player')) {
    fs.writeFileSync(path.join(dir, 'media', 'a.json'), fs.readFileSync(path.join(KIT, 'catalog/lottie/check-list/anim.json')));
    const d2 = project([{id: 'p', kind: 'lottie/player', src: 'media/a.json', title: 'Mine'}]); fs.copyFileSync(path.join(dir, 'media', 'a.json'), path.join(d2, 'media', 'a.json'));
    const b2 = await build(d2, {stages: ['deck']});
    assert.ok(/"data":\{"v":"/.test(fs.readFileSync(path.join(b2.out, 'deck/index.html'), 'utf8')), 'the Lottie JSON is put into the page');
  }
});

await test('without the optional packages (npm install --omit=optional) the engine still builds, and remotion/* says why it cannot', async () => {
  process.env.CONNECT_AI_NO_OPTIONAL = '1';
  try {
    const dir = project([{id: 'a', kind: 'gsap/split-title', title: 'No Remotion here'}]);
    await build(dir);
    const d2 = project([{id: 'r', kind: 'remotion/kinetic-words', words: ['a', 'b', 'c']}]);
    await assert.rejects(() => build(d2, {stages: ['deck']}), /optional package/);
  } finally { delete process.env.CONNECT_AI_NO_OPTIONAL; }
});

await test('install-skill copies the skill, updates its own copy, never touches a foreign folder', () => {
  const home = tmp('home'); fs.mkdirSync(path.join(home, '.claude')); const env = {};
  const log = () => {};
  let l = installSkill({agent: 'claude', home, env, log, runtime: false});
  const dest = path.join(home, '.claude', 'skills', NAME);
  assert.equal(l[0].action, 'install'); assert.ok(fs.existsSync(path.join(dest, 'SKILL.md')) && fs.existsSync(path.join(dest, 'BLOCKS.md')));
  assert.equal(JSON.parse(fs.readFileSync(path.join(dest, '.' + NAME + '.json'), 'utf8')).kit, KIT);
  assert.equal(installSkill({agent: 'claude', home, env, log, runtime: false})[0].action, 'update');
  removeSkill({agent: 'claude', home, env, log}); assert.ok(!fs.existsSync(dest));
  fs.mkdirSync(dest, {recursive: true}); fs.writeFileSync(path.join(dest, 'theirs.txt'), 'x');
  assert.equal(installSkill({agent: 'claude', home, env, log, runtime: false})[0].action, 'skip'); assert.ok(fs.existsSync(path.join(dest, 'theirs.txt')));
  const text = fs.readFileSync(path.join(KIT, 'skill', 'SKILL.md'), 'utf8');
  assert.ok(/^---\nname: connect-ai-slides-web\ndescription: /.test(text) && !/\/Users\//.test(text));
});

await test('install-skill: a versioned runtime copy with the lock file, npm started without a shell, the skill pinned to it', () => {
  const home = tmp('rt'); fs.mkdirSync(path.join(home, '.cursor')); const env = {};
  const calls = [];
  const npm = (args, {cwd}) => { calls.push({args, cwd}); fs.mkdirSync(path.join(cwd, 'node_modules'), {recursive: true}); return {code: 0, out: ''}; };
  const l = installSkill({agent: 'all', home, env, log: () => {}, npm});
  const ver = JSON.parse(fs.readFileSync(path.join(KIT, 'package.json'), 'utf8')).version;
  const rt = path.join(home, '.connect-ai', NAME, ver);
  assert.equal(l[0].label, 'Cursor'); assert.ok(l[0].done);
  assert.ok(fs.existsSync(path.join(rt, 'bin', 'cli.mjs')) && fs.existsSync(path.join(rt, 'npm-shrinkwrap.json')), 'runtime copy with its lock');
  assert.deepEqual(calls[0].args.slice(0, 2), ['ci', '--omit=dev']);
  const md = fs.readFileSync(path.join(home, '.cursor', 'skills', NAME, 'SKILL.md'), 'utf8');
  assert.ok(md.includes(JSON.stringify(path.join(rt, 'bin', 'cli.mjs'))), 'the skill names the runtime');
  installSkill({agent: 'all', home, env, log: () => {}, npm});
  assert.equal(calls.length, 1, 'same lock: npm is not run again');
  const src = fs.readFileSync(path.join(KIT, 'lib', 'install.mjs'), 'utf8');
  assert.ok(/shell: false/.test(src) && !/shell: true|shell: process/.test(src));
  const pkg = JSON.parse(fs.readFileSync(path.join(KIT, 'package.json'), 'utf8'));
  assert.ok(pkg.files.includes('npm-shrinkwrap.json') && /^>=18\.18/.test(pkg.engines.node));
  for (const f of ['bin/cli.mjs', 'lib/shoot.mjs', 'lib/export.mjs', 'lib/tools.mjs', 'lib/eyes.mjs']) {
    const t = fs.readFileSync(path.join(KIT, f), 'utf8');
    const n = (t.match(/\bspawn(Sync)?\(/g) || []).length, m = (t.match(/shell: false/g) || []).length;
    assert.ok(m >= n, `${f}: ${n} spawns, ${m} say shell: false`);
  }
  // a runtime folder that holds someone else's files is never cleaned, and a link on the way is refused
  const home2 = tmp('rt2'); fs.mkdirSync(path.join(home2, '.cursor'));
  const rt2 = path.join(home2, '.connect-ai', NAME, ver); fs.mkdirSync(rt2, {recursive: true}); fs.writeFileSync(path.join(rt2, 'keep-me.txt'), 'mine');
  assert.throws(() => installSkill({agent: 'all', home: home2, env, log: () => {}, npm}), /not this kit/);
  assert.ok(fs.existsSync(path.join(rt2, 'keep-me.txt')), 'a foreign file is kept');
  const home3 = tmp('rt3'); fs.mkdirSync(path.join(home3, '.cursor')); const elsewhere = tmp('rt3x');
  fs.symlinkSync(elsewhere, path.join(home3, '.connect-ai'), 'dir');
  assert.throws(() => installSkill({agent: 'all', home: home3, env, log: () => {}, npm}), /is a link/);
  return 'runtime ' + path.relative(home, rt);
});

await test('markdown: every part becomes one slide, every word is kept, no block is used twice in the sample', () => {
  for (const lang of ['ko', 'en']) {
    const talk = parseTalk(SAMPLE[lang]);
    const story = talkToStory(talk);
    assert.equal(story.lang, lang);
    assert.equal(story.scenes.length, talk.slides.length + 1);
    assert.equal(validateStory(story, cat).length, 0, validateStory(story, cat).join('\n'));
    const kinds = story.scenes.map((x) => x.kind);
    assert.equal(new Set(kinds).size, kinds.length, 'a design twice: ' + kinds.join(', '));
    const all = JSON.stringify(story);
    for (const w of SAMPLE[lang].replace(/^(note|노트)\s*:.*$/gim, '').replace(/\[[^\]]*\]\([^)]*\)|[#>*\-]|\d+\.\s/g, ' ').split(/\s+/).filter((w) => w.length > 1)) assert.ok(all.includes(w.replace(/[.:]$/, '')), 'lost the word ' + w);
    assert.ok(story.scenes.every((x) => x.notes), 'every slide has notes');
    assert.ok(kinds.includes('kit/end-card') && story.scenes.at(-1).links.length === 2);
  }
  const plain = talkToStory(parseTalk('My talk\nFirst point.\n- a\n- b\nLast line.'));
  assert.equal(plain.scenes.length, 4);
  const num = talkToStory(parseTalk('# T\n## Growth\n**3강** lessons so far\n## Shot\n![my screen](shot.png)'));
  assert.equal(num.scenes[1].kind, 'css/big-number'); assert.equal(num.scenes[1].value, '3강'); assert.equal(num.scenes[2].kind, 'kit/photo-frame');
  // a section with more than one block can show is split, in order, and keeps every word
  const mixed = talkToStory(parseTalk('# Launch\n## Why\nThree reasons matter here.\n- fast\n- cheap\n- local\nNote: say it slowly\n## Pics\n![shop](media/a(1).jpg) Our shop at dawn\n## Mid\n- [Docs](https://x.y)\n## Ver\n**1.2.3** is live\n## End\nThanks\n- [Site](https://a.b)\n- [Shop](https://c.d)'));
  const mj = JSON.stringify(mixed);
  for (const w of ['Three reasons matter here.', 'fast', 'local', 'Our shop at dawn', 'Docs', '1.2.3', 'is live', 'Thanks']) assert.ok(mj.includes(w), 'lost ' + w);
  assert.equal(validateStory(JSON.parse(mj), cat).length, 0, validateStory(JSON.parse(mj), cat).join('\n'));
  assert.ok(mixed.scenes.some((x) => x.src === 'media/a(1).jpg'), 'a file name with brackets');
  assert.ok(!mixed.scenes.some((x) => x.kind === 'gsap/counter'), '1.2.3 is not a number to count');
  assert.equal(mixed.scenes.at(-1).kind, 'kit/end-card');
  return 'ko + en sample, plain text, a number, a picture, a mixed section split in order';
});

await test('Marp, Slidev and reveal.js markdown come in as they are: slides, notes, no settings on screen, --- inside code kept', () => {
  const marp = '---\nmarp: true\ntheme: gaia\npaginate: true\n---\n\n<!-- _class: lead -->\n# Our bakery\nA day at the shop\n\n---\n\n![bg right](media/p.jpg)\n\n## How we make it\n1. Dough\n2. Rise\n3. Bake\n\n<!-- Say it slowly. -->\n<!-- And smile. -->\n\n---\n\n## We open at 6\nBread first thing.\n';
  const t1 = parseTalk(marp);
  assert.equal(t1.title, 'Our bakery'); assert.equal(t1.sub, 'A day at the shop');
  assert.equal(t1.slides.length, 2);
  assert.deepEqual(t1.slides[0].steps, ['Dough', 'Rise', 'Bake']); assert.equal(t1.slides[0].images[0].src, 'media/p.jpg'); assert.equal(t1.slides[0].images[0].alt, '');
  assert.deepEqual(t1.slides[0].notes, ['Say it slowly.', 'And smile.']);
  assert.ok(!JSON.stringify(t1).includes('gaia') && !JSON.stringify(t1).includes('_class'), 'settings stay off the slides');
  const slidev = '---\ntheme: seriph\ntitle: Lesson four\n---\n\n# Lesson four\nMotion on slides\n\n---\nlayout: center\nclass: text-center\n---\n\n## Words you can edit\n\n<v-click>\n\n- One message\n- One picture\n\n</v-click>\n\n<!--\nThe part I explain.\n-->\n\n---\n\n## Code\n```js\nconst a = 1\n---\n```\n';
  const t2 = parseTalk(slidev);
  assert.equal(t2.title, 'Lesson four'); assert.equal(t2.slides.length, 2);
  assert.deepEqual(t2.slides[0].bullets, ['One message', 'One picture']); assert.deepEqual(t2.slides[0].notes, ['The part I explain.']);
  assert.ok(!JSON.stringify(t2).includes('layout') && !JSON.stringify(t2).includes('v-click'));
  assert.ok(t2.slides[1].paras.includes('const a = 1'), 'code inside a fence is one slide, not split at ---');
  const reveal = '# Talk\n\n---\n\n## One\nFirst.\nNote: the first note\n\n---\n\n## Two\nSecond.\n\n--\n\n## Two, deeper\nThird.\n';
  const t3 = parseTalk(reveal);
  assert.deepEqual(t3.slides.map((x) => x.heading), ['One', 'Two', 'Two, deeper']); assert.deepEqual(t3.slides[0].notes, ['the first note']);
  // our own markdown is read exactly as before
  assert.equal(fromDeckMarkdown(SAMPLE.ko), null); assert.equal(fromDeckMarkdown(SAMPLE.en), null);
  assert.equal(fromDeckMarkdown('Title\n---\n\nText\n\nSub\n---\n\nmore'), null, 'two underlined (Setext) headings are a normal file, not a deck');
  assert.ok(!fromDeckMarkdown('---\nmarp: true\nmy_key: 1\n---\n\n# A\n\n---\n\n## B\n').includes('my_key'), 'marp: true front matter never reaches a slide');
  assert.equal(validateStory(talkToStory(t1), cat).length, 0); assert.equal(validateStory(talkToStory(t2), cat).length, 0);
  return 'Marp 2 slides + 2 notes, Slidev 2 slides, reveal.js 3 slides';
});

// a small PowerPoint file of the kind people really have: title placeholders, bullets, a table, a picture, an icon,
// notes, a hidden slide, a group, an EMF picture, an equation and labels on a diagram
function solidPng(w, h, rgb) {
  const crcT = Array.from({length: 256}, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.alloc((w * 3 + 1) * h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) raw.set(rgb, y * (w * 3 + 1) + 1 + x * 3);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
async function oldDeck(dir) {
  const PptxGenJS = createRequire(import.meta.url)('pptxgenjs');
  const JSZip = createRequire(import.meta.url)('jszip');
  const p = new PptxGenJS(); p.layout = 'LAYOUT_WIDE';
  const png = path.join(dir, 'shop.png'); fs.writeFileSync(png, solidPng(64, 40, [214, 137, 42]));
  let s = p.addSlide(); s.addText('Opening day', {x: 1, y: 2, w: 11, h: 1.5, fontSize: 54}); s.addText('A bakery in five slides', {x: 1, y: 3.8, w: 11, h: 0.8, fontSize: 24}); s.addNotes('Hello everyone.');
  s = p.addSlide(); s.addText('How we bake', {x: 0.5, y: 0.3, w: 12, h: 1, fontSize: 40}); s.addText([{text: 'Dough at night', options: {bullet: true}}, {text: 'Rise slowly', options: {bullet: true}}, {text: 'Bake at six', options: {bullet: true}}], {x: 0.5, y: 1.6, w: 7, h: 4, fontSize: 24}); s.addText('x1', {x: 9, y: 3, w: 0.6, h: 0.4, fontSize: 14}); s.addText('w2', {x: 10, y: 3, w: 0.6, h: 0.4, fontSize: 14}); s.addNotes('The oven is the secret.');
  s = p.addSlide(); s.addText('What sells', {x: 0.5, y: 0.3, w: 12, h: 1, fontSize: 40}); s.addTable([['Bread', 'Price'], ['Salt bread', '3,000'], ['Milk loaf', '4,500']], {x: 0.5, y: 1.6, w: 8});
  s = p.addSlide(); s.addText('The shop', {x: 0.5, y: 0.3, w: 12, h: 1, fontSize: 40}); s.addImage({path: png, x: 1, y: 1.5, w: 8, h: 5, altText: 'Our shop'}); s.addImage({path: png, x: 12, y: 6.8, w: 0.5, h: 0.4}); s.addText('Open at six every morning', {x: 9.2, y: 2, w: 3.5, h: 1, fontSize: 20});
  s = p.addSlide({}); s.hidden = true; s.addText('Secret slide', {x: 0.5, y: 0.3, w: 12, h: 1, fontSize: 40});
  s = p.addSlide(); s.addText('Thanks', {x: 0.5, y: 0.3, w: 12, h: 1, fontSize: 40}); s.addText('Grouped words inside', {x: 1, y: 2, w: 5, h: 1, fontSize: 20});
  const file = path.join(dir, 'old talk 발표.pptx');
  await p.writeFile({fileName: file});
  // what PptxGenJS does not write, put in by hand: a hidden flag, a group, an EMF picture, an equation
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const n = Object.keys(zip.files).filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f)).length;
  let x5 = await zip.file('ppt/slides/slide5.xml').async('string'); if (!/show="0"/.test(x5)) x5 = x5.replace('<p:sld ', '<p:sld show="0" '); zip.file('ppt/slides/slide5.xml', x5);
  let x6 = await zip.file('ppt/slides/slide6.xml').async('string');
  const sps = [...x6.matchAll(/<p:sp>[\s\S]*?<\/p:sp>/g)].map((m) => m[0]);
  const grouped = sps[1];
  x6 = x6.replace(grouped, `<p:grpSp><p:nvGrpSpPr><p:cNvPr id="90" name="Group"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="1828800"/><a:ext cx="9144000" cy="914400"/><a:chOff x="0" y="0"/><a:chExt cx="9144000" cy="914400"/></a:xfrm></p:grpSpPr>${grouped}</p:grpSp>`);
  x6 = x6.replace('</p:spTree>', '<mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main"><mc:Choice Requires="a14"><p:sp><p:nvSpPr><p:cNvPr id="91" name="Eq"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="0" y="5000000"/><a:ext cx="3000000" cy="500000"/></a:xfrm></p:spPr><p:txBody><a:bodyPr/><a:p><a14:m><m:oMathPara xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"><m:oMath><m:r><m:t>y=wx+b</m:t></m:r></m:oMath></m:oMathPara></a14:m></a:p></p:txBody></p:sp></mc:Choice><mc:Fallback><p:pic><p:nvPicPr><p:cNvPr id="92" name="EqPic"/><p:cNvPicPr/><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="rIdEmf"/></p:blipFill><p:spPr><a:xfrm><a:off x="0" y="5000000"/><a:ext cx="6000000" cy="3000000"/></a:xfrm></p:spPr></p:pic></mc:Fallback></mc:AlternateContent></p:spTree>');
  zip.file('ppt/slides/slide6.xml', x6);
  const r6 = await zip.file('ppt/slides/_rels/slide6.xml.rels').async('string');
  zip.file('ppt/slides/_rels/slide6.xml.rels', r6.replace('</Relationships>', '<Relationship Id="rIdEmf" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/eq1.emf"/></Relationships>'));
  zip.file('ppt/media/eq1.emf', Buffer.from('not really an emf'));
  fs.writeFileSync(file, await zip.generateAsync({type: 'nodebuffer'}));
  return {file, n};
}

await test('import: an old PowerPoint becomes talk.md with its words, pictures and notes, and says what it left behind', async () => {
  const dir = tmp('imp');
  const {file, n} = await oldDeck(dir);
  assert.equal(n, 6);
  const media = path.join(dir, 'm');
  const R = await importPptx(file, {mediaDir: media, mediaRel: 'm'});
  const md = R.md;
  assert.ok(md.startsWith('# Opening day\nA bakery in five slides\nNote: Hello everyone.'), md.slice(0, 120));
  assert.ok(/## How we bake\n- Dough at night\n- Rise slowly\n- Bake at six\nNote: The oven is the secret\./.test(md), 'bullets and notes');
  assert.ok(!/\bx1\b|\bw2\b/.test(md), 'labels on a diagram stay out'); assert.ok(R.slides[1].left.some((l) => /2 short labels/.test(l)));
  assert.ok(md.includes('- Salt bread · 3,000') && md.includes('- Milk loaf · 4,500'), 'table rows');
  assert.ok(/!\[Our shop\]\(m\/slide04-\d\.(png|jpg)\)/.test(md), 'the picture with its alt text');
  assert.equal(R.media.length, 1, 'the small icon is left out: ' + R.media.join(', ')); assert.ok(R.slides[3].left.some((l) => /small picture/.test(l)));
  assert.ok(fs.existsSync(path.join(media, R.media[0])));
  assert.ok(!md.includes('Secret slide') && R.slides[4].hidden, 'hidden slide left out');
  assert.ok(md.includes('Grouped words inside'), 'words inside a group');
  assert.ok(R.slides[5].left.some((l) => /equation/.test(l)) && R.slides[5].left.some((l) => /EMF/.test(l)), 'equation and EMF reported: ' + R.slides[5].left.join(' | '));
  const all = await importPptx(file, {hidden: true});
  assert.ok(all.md.includes('Secret slide'), '--hidden takes it');
  const kept = await importPptx(file, {labels: true});
  assert.ok(/\bx1\b/.test(kept.md), '--labels keeps them');
  // the result is a story the kit accepts
  const story = talkToStory(parseTalk(md));
  assert.equal(validateStory(story, cat).length, 0, validateStory(story, cat).join('\n'));
  // the command line: never over a file that is there, a sentence for a file that is not a .pptx
  const run = (...a) => spawnSync(process.execPath, [path.join(KIT, 'bin', 'cli.mjs'), ...a], {cwd: dir, encoding: 'utf8'});
  const first = run('import', path.basename(file)); assert.equal(first.status, 0, first.stderr);
  assert.ok(fs.existsSync(path.join(dir, 'old talk 발표.md')) && fs.existsSync(path.join(dir, 'old talk 발표-media')));
  const twice = run('import', path.basename(file)); assert.equal(twice.status, 1); assert.ok(/already here/.test(twice.stderr));
  fs.writeFileSync(path.join(dir, 'fake.pptx'), 'hello');
  const fake = run('import', 'fake.pptx'); assert.equal(fake.status, 1); assert.ok(/not a \.pptx/.test(fake.stderr) && !/at .*\(.*:\d+:\d+\)/.test(fake.stderr));
  return `${R.slides.length} slides, ${R.media.length} picture, hidden / group / table / EMF / equation / labels handled`;
});

await test('pptx parts: a measured line becomes runs in points, Pretendard / Helvetica weights by name, timing XML is well formed', () => {
  const t = {tag: 'g', align: 'center', x: 100, y: 200, w: 400, h: 80, lh: 80, firstH: 60, size: 64, weight: 200, family: '"Inter", "Pretendard", sans-serif',
    lines: [{runs: [{text: 'Hello ', color: 'F6F3EC', alpha: 1, size: 64, weight: 200, italic: false, spacing: 0}, {text: 'gold', color: 'F2B45A', alpha: 0.5, size: 64, weight: 200, italic: false, spacing: 2}]}, {runs: [{text: 'line two', color: 'F6F3EC', alpha: 1, size: 64, weight: 200, italic: false, spacing: 0}]}]};
  const b = textBox(t, {font: 'Pretendard'});
  assert.equal(b.runs.length, 3); assert.equal(b.runs[0].options.fontSize, 32); assert.equal(b.runs[0].options.fontFace, 'Pretendard ExtraLight');
  assert.ok(b.runs[1].options.breakLine && !b.runs[2].options.breakLine); assert.equal(b.runs[1].options.transparency, 50); assert.equal(b.runs[1].options.charSpacing, 1);
  assert.ok(b.opts.x < 100 * 13.333333 / 1920 && b.opts.w > 400 * 13.333333 / 1920, 'centred box grows to both sides');
  assert.deepEqual(faceFor('.SF NS', 300), {face: 'Helvetica Neue Light', bold: false});
  assert.deepEqual(faceFor('Pretendard', 700), {face: 'Pretendard', bold: true});
  assert.deepEqual(faceFor('Didot', 400), {face: 'Didot', bold: false});
  const xml = slideTiming({clip: {spid: 5, ms: 2500}, builds: [{spid: 6, delay: 300}, {spid: 7, delay: 900}]});
  const stack = [];
  for (const m of xml.matchAll(/<(\/?)([\w:]+)[^>]*?(\/?)>/g)) { if (m[3]) continue; if (m[1]) assert.equal(stack.pop(), m[2]); else stack.push(m[2]); }
  assert.equal(stack.length, 0, 'balanced tags');
  const ids = [...xml.matchAll(/<p:cTn id="(\d+)"/g)].map((m) => +m[1]);
  assert.equal(new Set(ids).size, ids.length, 'unique timing ids');
  assert.ok(/nodeType="mainSeq"/.test(xml) && /cmd="playFrom\(0\.0\)"/.test(xml) && /<p:bldP spid="6" grpId="0" animBg="1"\/>/.test(xml) && /<p:cond delay="900"\/>/.test(xml));
  assert.equal(slideTiming({}), '');
  const click = slideTiming({clip: {spid: 3, ms: 2000, auto: false}});
  assert.ok(/nodeType="interactiveSeq"/.test(click) && /cmd="togglePause"/.test(click) && /<p:video>/.test(click) && !/playFrom/.test(click) && !/mainSeq/.test(click), 'a clip that plays on a click still has its media node');
});

await test('the command line answers in sentences', () => {
  const run = (...a) => spawnSync(process.execPath, [path.join(KIT, 'bin', 'cli.mjs'), ...a], {encoding: 'utf8'});
  assert.equal(run('--version').stdout.trim(), JSON.parse(fs.readFileSync(path.join(KIT, 'package.json'), 'utf8')).version);
  const bad = run('nonsense'); assert.equal(bad.status, 1); assert.ok(/is not a command/.test(bad.stderr) && !/at .*\(.*:\d+:\d+\)/.test(bad.stderr), 'no stack dump');
  const nop = run('build', path.join(os.tmpdir(), 'no-such-project-xyz')); assert.equal(nop.status, 1); assert.ok(/There is no folder/.test(nop.stderr));
  const list = JSON.parse(run('catalog', '--json').stdout); assert.equal(list.length, cat.length);
  assert.ok(new RegExp(ready.length + ' blocks ready').test(run('catalog').stdout));
  const d = path.join(tmp('new'), 'my-talk'); assert.equal(run('new', d).status, 0); assert.equal(loadStory(d).scenes.length, 3); assert.equal(validateStory(loadStory(d), cat).length, 0);
  const w = tmp('ppt'); const r = spawnSync(process.execPath, [path.join(KIT, 'bin', 'cli.mjs'), 'ppt', '--ko', '--quiet'], {cwd: w, encoding: 'utf8'});
  assert.equal(r.status, 0, r.stderr); assert.ok(fs.readFileSync(path.join(w, 'my-talk.md'), 'utf8').startsWith('# ')); assert.ok(/ppt my-talk\.md/.test(r.stdout));
  const again = spawnSync(process.execPath, [path.join(KIT, 'bin', 'cli.mjs'), 'ppt', 'nothere.md'], {cwd: w, encoding: 'utf8'}); assert.equal(again.status, 1); assert.ok(/no file at nothere\.md/.test(again.stderr));
  assert.ok(/CONNECT|██/.test(run('help').stdout) && !/██/.test(run('--version').stdout), 'banner on help, not on --version');
});

console.log('B. in Chrome');
const chrome = findChrome();
if (!chrome) for (const n of ['sample passes its own check', 'broken stories are caught', 'every catalog block in three frames', 'seek is exact', 'export', 'record']) skip(n, 'no Chrome on this computer');
else {
  const {openBrowser, openStage} = await import('../lib/shoot.mjs');
  const browser = await openBrowser();
  try {
    await test('the sample passes its own check in all three frames, and the starter story too', async () => {
      const dir = tmp('sample'); fs.cpSync(path.join(KIT, 'examples', 'sample'), dir, {recursive: true}); fs.cpSync(path.join(KIT, 'examples', 'media'), path.join(dir, 'media'), {recursive: true});
      const r = await check(dir, {browser});
      assert.equal(r.errors.length, 0, r.errors.map((e) => e.msg).join('\n'));
      assert.ok(r.scenes.every((s) => s.deck && s.site && s.phone && s.deck.words > 0 && s.deck.minContrast >= 3));
      const d = path.join(tmp('new'), 'starter'); spawnSync(process.execPath, [path.join(KIT, 'bin', 'cli.mjs'), 'new', d]);
      const r2 = await check(d, {browser}); assert.equal(r2.errors.length, 0, r2.errors.map((e) => e.msg).join('\n'));
      return `PASS, ${r.advice.length} advice, ${r.scenes.length} scenes`;
    });

    await test('stories that are wrong on purpose are caught, each with a sentence that says how to fix it', async () => {
      const long = 'This slide tries to say everything at once and keeps going with more and more words until nobody in the room can read it while also listening to the person who is speaking in front of them which is exactly what a slide should never do to people.';
      const dir = project([
        {id: 'tiny', kind: 'test/tiny-text', text: 'Small print'},
        {id: 'dim', kind: 'test/low-contrast', text: 'Dim'},
        {id: 'face', kind: 'test/on-face', src: 'media/person.svg', face: [0.39, 0.2, 0.22, 0.4], text: 'On the face'},
        {id: 'wide', kind: 'test/wide-row'},
        {id: 'remote', kind: 'test/remote-image', text: 'Remote'},
        {id: 'wordy', kind: 'motion/blur-words', text: long},
        {id: 'nofile', kind: 'kit/hero-video', src: 'media/missing.jpg', title: 'A missing picture'},
        {id: 'ok', kind: 'test/good', text: 'This one is fine'},
      ]);
      const r = await check(dir, {browser});
      const find = (what, id, frame) => r.errors.find((e) => e.what === what && (!id || e.id === id) && (!frame || e.frame === frame));
      assert.equal(r.ok, false);
      const seen = [];
      const need = (what, id, frame, re) => { const e = find(what, id, frame); assert.ok(e, `no ${what} error for ${id || 'page'} (${frame || 'any'})\n` + r.errors.map((x) => x.msg).join('\n')); if (re) assert.ok(re.test(e.msg), e.msg); seen.push(what); return e; };
      need('font', 'tiny', 'deck', /10 px on a 1920x1080 slide/);
      need('font', 'tiny', 'phone', /390 px phone/);
      need('contrast', 'dim', 'deck', /contrast of 1\.\d/);
      need('face', 'face', 'deck', /Nothing goes on a face/);
      need('cut', 'wide', 'phone', /cut off/);
      assert.ok(!find('cut', 'wide', 'deck'), 'the wide row fits the slide');
      need('external', null, null, /example\.com/);
      need('words', 'wordy', 'deck', /words on one slide/);
      const miss = r.errors.find((e) => (e.what === 'broken' || e.what === 'missing') && /missing\.jpg/.test(e.msg)); assert.ok(miss, 'the missing picture is reported');
      assert.ok(!r.errors.some((e) => e.id === 'ok'), 'the good scene has no error: ' + r.errors.filter((e) => e.id === 'ok').map((e) => e.msg).join(' | '));
      assert.ok(/FAIL/.test(fs.readFileSync(path.join(dir, 'out', 'report.md'), 'utf8')));
      return [...new Set(seen)].join(', ') + ', missing file';
    });

    await test('advice: a design used three times, no notes, a person without a face box, a video without a poster', async () => {
      const dir = project([1, 2, 3].map((n) => ({id: 't' + n, kind: 'gsap/split-title', title: 'Title number ' + n})).concat([{id: 'p', kind: 'kit/hero-video', src: 'media/person.mp4', title: 'No face box here'}]));
      const r = await check(dir, {browser, frames: ['deck']});
      for (const w of ['repeat', 'notes', 'face', 'poster']) assert.ok(r.advice.some((a) => a.what === w), 'no advice about ' + w);
    });

    await test('advice: three screens of words in a row ask for a picture, and a picture between them clears it', async () => {
      const words = (n) => ({id: 'w' + n, kind: ['gsap/split-title', 'css/type-stack', 'gsap/counter', 'motion/blur-words'][n % 4], title: 'Words number ' + n, text: 'Words number ' + n + ' here.', lines: ['One.', 'Two.', 'Three.'], value: 10, unit: 'things', notes: 'n'});
      const pic = {id: 'pic', kind: 'kit/photo-frame', src: 'media/screen.svg', alt: 'a screen', caption: 'A picture', notes: 'n'};
      const a = await check(project([words(0), words(1), words(2), pic]), {browser, frames: ['deck'], reduced: false});
      const adv = a.advice.find((x) => x.what === 'pictures'); assert.ok(adv && /Scenes 1, 2, 3/.test(adv.msg), 'three in a row: ' + a.advice.map((x) => x.what).join(','));
      const b2 = await check(project([words(0), words(1), pic, words(2)]), {browser, frames: ['deck'], reduced: false});
      assert.ok(!b2.advice.some((x) => x.what === 'pictures'), 'two, a picture, one: no advice');
    });

    await test('people: the check says in a sentence whether it could look at the eyes; body boxes are guarded like faces', async () => {
      const person = {id: 'p', kind: 'kit/film-hero', src: 'media/person.svg', face: [0.39, 0.2, 0.22, 0.4], body: [0.27, 0.16, 0.46, 0.84], title: 'A person on screen', alt: 'a drawn person', notes: 'n'};
      process.env.CONNECT_AI_NO_EYES = '1';
      let r; try { r = await check(project([person]), {browser, frames: ['deck'], reduced: false}); } finally { delete process.env.CONNECT_AI_NO_EYES; }
      assert.ok(r.facts.some((f) => /eye check: skipped/.test(f)), r.facts.join(' | '));
      assert.ok(!r.errors.some((e) => e.what === 'face'), 'the title stays off the face and the body: ' + r.errors.map((e) => e.msg).join(' | '));
      // text forced onto the body is an error
      const bad = await check(project([{...person, id: 'bad', kind: 'kit/film-hero', body: [0, 0, 1, 1]}]), {browser, frames: ['deck'], reduced: false, eyes: false});
      assert.ok(bad.errors.some((e) => e.what === 'face' && /on the person/.test(e.msg)), 'a body box over the whole picture catches the title: ' + bad.errors.map((e) => e.msg).join(' | '));
    });

    await test('a deck opened at a slide (#/2) still finds the libraries of a HyperFrames block', async () => {
      const dir = project([{id: 'a', kind: 'gsap/split-title', title: 'First slide', notes: 'n'}, {id: 'b', kind: 'hyperframes/scramble-title', ...byKind(cat)['hyperframes/scramble-title'].example, notes: 'n'}]);
      const b = await build(dir, {stages: ['deck']});
      const st = await openStage(browser, b.out, 'deck', {query: '#/1'});
      await st.page.evaluate(() => CS.capture.goto(1, 1));
      const ok = await st.page.evaluate(() => { const f = document.querySelectorAll('.cs-frame')[1].querySelector('iframe'); return !!(f && f.contentWindow.gsap && f.contentWindow.__timelines); });
      const errs = [...new Set(st.log.errors)]; await st.page.close();
      assert.ok(ok, 'GSAP did not load inside the block: ' + errs.join(' | ')); assert.equal(errs.length, 0, errs.join(' | '));
    });

    await test('embed-scene: the html page travels with the story, and a missing page stops the build with a sentence', async () => {
      const ex = byKind(cat)['kit/embed-scene'].example;
      const dir = project([{id: 'e', kind: 'kit/embed-scene', ...ex, notes: 'n'}]);
      const b = await build(dir);
      for (const stage of ['deck', 'site']) assert.ok(fs.existsSync(path.join(b.out, stage, ex.src)), stage + ' has ' + ex.src);
      await assert.rejects(build(project([{id: 'e', kind: 'kit/embed-scene', ...ex, src: 'media/not-here.html'}])), /not-here\.html" was not found/);
    });

    // one gallery project for the catalog-wide tests
    let G = null, gdir = null;
    if (FAST) skip('every catalog block in three frames', '--fast');
    else {
      await test('every catalog block mounts in the three frames with no page error, and shows its words at the end', async () => {
        const {gallery} = await import('../lib/gallery.mjs');
        gdir = tmp('gallery');
        G = await gallery({out: gdir, browser});
        assert.equal(G.problems.length, 0, G.problems.join('\n'));
        assert.equal(G.items.length, ready.length);
        const built = {story: loadStory(gdir), out: G.out, catalog: cat, deck: {}, site: {}};
        const r = await check(gdir, {browser, built});
        const hard = r.errors.filter((e) => ['page', 'block', 'missing', 'broken', 'media', 'external', 'reduced', 'story', 'face'].includes(e.what));
        const soft = r.errors.filter((e) => !hard.includes(e));
        const lines = ['# Catalog examples through check', '', `${ready.length} blocks, three frames.`, '', '## Must fix (stability, faces)', '', ...(hard.length ? hard.map((e) => '- ' + e.msg) : ['- none']), '', '## Quality errors of the examples (type size, contrast, words, cut off)', '', ...(soft.length ? soft.map((e) => '- ' + e.msg) : ['- none']), '', '## Advice', '', ...r.advice.map((e) => '- ' + e.msg), ''];
        fs.mkdirSync(path.join(KIT, 'work'), {recursive: true}); fs.writeFileSync(path.join(KIT, 'work', 'catalog-check.md'), lines.join('\n'));
        for (const e of soft) console.log('       NOTE ' + e.msg);
        assert.equal(hard.length, 0, hard.map((e) => e.msg).join('\n'));
        const silent = r.scenes.filter((s) => ['deck', 'site', 'phone'].some((f) => !s[f] || !(s[f].words > 0))).map((s) => s.kind);
        assert.equal(silent.length, 0, 'no visible words at the end in: ' + silent.join(', '));
        return `${ready.length} blocks x 3 frames, ${soft.length} quality notes (work/catalog-check.md)`;
      });

      await test('the deck gives each click step one fragment, and file:// needs no special flag (HyperFrames iframe, Lottie, video)', async () => {
        const st = await openStage(browser, G.out, 'deck');
        const bad = st.plan.schedule.filter((s) => s.fragments !== s.stops.length - 1).map((s) => `${s.kind}: ${s.fragments} fragments for ${s.stops.length - 1} steps`);
        assert.equal(bad.length, 0, bad.join('\n'));
        const stepped = st.plan.schedule.filter((s) => s.stops.length > 1).length; assert.ok(stepped >= 3);
        for (const kind of ['hyperframes/scramble-title', 'lottie/check-list']) {
          const i = st.plan.schedule.findIndex((s) => s.kind === kind); assert.ok(i >= 0, kind);
          await st.page.evaluate((i) => CS.capture.goto(i, 1), i);
          const m = await st.page.evaluate((i) => CS.measure(document.querySelectorAll('.cs-frame')[i]), i);
          assert.ok(m.texts.filter((t) => t.frame === i && t.alpha > 0.5).length > 0, kind + ' shows text at the end');
          if (kind.startsWith('hyperframes')) assert.ok(await st.page.evaluate((i) => { const f = document.querySelectorAll('.cs-frame')[i].querySelector('iframe'); return !!(f && f.contentWindow.__timelines && Object.keys(f.contentWindow.__timelines).length); }, i), 'the iframe timeline is reachable from file://');
        }
        const vi = st.plan.schedule.findIndex((s) => /video/.test(s.lib));
        if (vi >= 0) { await st.page.evaluate((i) => CS.capture.goto(i, 0.5), vi); assert.deepEqual(await st.page.evaluate(() => CS.problems), [], 'the video seeks from file://'); }
        await st.page.close();
        return `${stepped} blocks with click steps`;
      });

      await test('seek is exact: the same time gives the same picture, also after jumping away and back', async () => {
        const st = await openStage(browser, G.out, 'deck');
        const skipKinds = /scramble|video|player|nametag|split-person|photo-frame/;      // random glyphs mid-way, or a video frame
        let n = 0; const off = [];
        for (let i = 0; i < st.plan.schedule.length; i++) {
          const s = st.plan.schedule[i]; if (skipKinds.test(s.kind) || /video/.test(s.lib)) continue;
          await st.page.evaluate((i) => CS.capture.goto(i, 0.55), i); const a = readPng(Buffer.from(await st.page.screenshot({type: 'png'})));
          await st.page.evaluate((i) => CS.capture.goto(i, 1), i); await st.page.evaluate((i) => CS.capture.goto(i, 0.1), i);
          await st.page.evaluate((i) => CS.capture.goto(i, 0.55), i); const b = readPng(Buffer.from(await st.page.screenshot({type: 'png'})));
          let diff = 0; for (let k = 0; k < a.data.length; k += 97) diff += Math.abs(a.data[k] - b.data[k]);
          const mean = diff / (a.data.length / 97); if (mean > 0.6) off.push(`${s.kind} (mean difference ${mean.toFixed(2)})`);
          n++;
        }
        await st.page.close();
        assert.equal(off.length, 0, 'not the same picture at the same time: ' + off.join(', '));
        return `${n} blocks`;
      });
    }

    await test('gallery: picked blocks only, and a media map swaps the stand-in for your own file and face box', async () => {
      const {gallery} = await import('../lib/gallery.mjs');
      const dir = tmp('gmap'), mine = path.join(dir, 'me.svg'); fs.copyFileSync(path.join(KIT, 'examples', 'media', 'person.svg'), mine);
      const g = await gallery({out: path.join(dir, 'g'), browser, frames: ['deck'], only: ['kit/hero-video', 'gsap/counter'], map: {default: {'media/person.svg': {src: mine, face: [0.3, 0.2, 0.2, 0.4], alt: 'me'}}}});
      assert.deepEqual(g.items.map((i) => i.kind).sort(), ['gsap/counter', 'kit/hero-video']); assert.equal(g.problems.length, 0, g.problems.join('\n'));
      const sc = loadStory(path.join(dir, 'g')).scenes.find((x) => x.kind === 'kit/hero-video');
      assert.equal(sc.src, 'media/me.svg'); assert.deepEqual(sc.face, [0.3, 0.2, 0.2, 0.4]);
      const g2 = await gallery({out: path.join(dir, 'g2'), browser, frames: ['deck'], only: ['kit/film-hero'], map: {kinds: {'kit/film-hero': {'media/person.mp4': {src: mine, face: [0.3, 0.2, 0.2, 0.4], body: [0.2, 0.15, 0.4, 0.85]}}}, props: {'kit/film-hero': {title: 'My own headline here'}}}});
      const s2 = loadStory(path.join(dir, 'g2')).scenes[0];
      assert.deepEqual(s2.body, [0.2, 0.15, 0.4, 0.85], 'the map carries the body box'); assert.equal(s2.title, 'My own headline here', 'props are laid over the example'); assert.equal(g2.problems.length, 0, g2.problems.join('\n'));
      const j = JSON.parse(fs.readFileSync(g.json, 'utf8')); assert.ok(j.items.every((i) => i.stills.deck && fs.existsSync(path.join(dir, 'g', i.stills.deck)) && i.dur > 0));
    });

    await test('export: a PDF with one page per slide, and a real PPTX: editable words, the motion as a clip that starts by itself, fades, notes', async () => {
      const {exportDeck} = await import('../lib/export.mjs');
      const dir = tmp('exp'); fs.cpSync(path.join(KIT, 'examples', 'sample'), dir, {recursive: true}); fs.cpSync(path.join(KIT, 'examples', 'media'), path.join(dir, 'media'), {recursive: true});
      const r = await exportDeck(dir, {pdf: true, pptx: true, google: true, browser});
      const n = loadStory(dir).scenes.length;
      const pdf = fs.readFileSync(r.pdf).toString('latin1');
      assert.equal((pdf.match(/\/Type\s*\/Page(?![s\w])/g) || []).length, n, 'PDF pages');
      const x = await inspectPptx(r.pptx);
      assert.equal(x.totals.slides, n, 'PPTX slides');
      assert.deepEqual(x.problems, [], 'every shape its own id, every picture named for its format');
      assert.ok(x.totals.boxes >= n, 'text boxes: ' + x.totals.boxes);
      assert.equal(x.totals.notes, n, 'notes on every slide');
      assert.ok(x.slides[0].notes.includes('kit explaining itself'));
      const words = x.slides.flatMap((s) => s.boxes).join(' ');
      assert.ok(words.includes('One story, a deck and a website'), 'the title is a text box');
      if (findFfmpeg()) { assert.ok(x.totals.videos >= 1 && x.totals.autoplay === x.totals.videos, 'clips start by themselves'); }
      const g = await inspectPptx(r.google);
      assert.equal(g.totals.videos, 0); assert.equal(g.totals.boxes, x.totals.boxes); assert.deepEqual(g.problems, []);
      const p = await exportDeck(dir, {pptx: true, pptxMode: 'pictures', browser});
      const pi = await inspectPptx(p.pptx);
      assert.equal(pi.totals.boxes, 0); assert.ok(/not editable/.test(p.notes[0]));
      return `${n} pages; ${x.totals.boxes} text boxes, ${x.totals.videos} clips, ${r.builds} fades`;
    });

    await test('ppt: a markdown file in, a PowerPoint file out, from the command line', async () => {
      const w = tmp('md'); fs.writeFileSync(path.join(w, 'talk.md'), SAMPLE.en);
      const r = spawnSync(process.execPath, [path.join(KIT, 'bin', 'cli.mjs'), 'talk.md', '--quiet', '--no-video'], {cwd: w, encoding: 'utf8', timeout: 240000});
      assert.equal(r.status, 0, r.stderr + r.stdout);
      const x = await inspectPptx(path.join(w, 'talk-deck', 'out', 'deck.pptx'));
      assert.equal(x.totals.slides, parseTalk(SAMPLE.en).slides.length + 1);
      assert.ok(x.slides.flatMap((s) => s.boxes).join(' ').includes('Our little bakery'));
      assert.equal(x.totals.notes, x.totals.slides);
      return `${x.totals.slides} slides, ${x.totals.boxes} text boxes`;
    });

    await test('round trip: the .pptx this kit makes comes back through import with every word of the talk', async () => {
      const w = tmp('rt'); fs.writeFileSync(path.join(w, 'talk.md'), SAMPLE.ko);
      const r = spawnSync(process.execPath, [path.join(KIT, 'bin', 'cli.mjs'), 'talk.md', '--quiet', '--no-video'], {cwd: w, encoding: 'utf8', timeout: 240000});
      assert.equal(r.status, 0, r.stderr + r.stdout);
      const back = await importPptx(path.join(w, 'talk-deck', 'out', 'deck.pptx'), {labels: true});
      const flat = (t) => t.replace(/\s+/g, '');
      const got = flat(back.md);
      const lost = SAMPLE.ko.replace(/^(note|노트)\s*:.*$/gim, '').replace(/\[[^\]]*\]\([^)]*\)|[#>*\-]|\d+\.\s/g, ' ').split(/\s+/).filter((x) => x.length > 1).map((x) => x.replace(/[.:]$/, '')).filter((x) => !got.includes(flat(x)));
      assert.deepEqual(lost, [], 'words that did not come back');
      assert.ok(back.slides.every((s) => s.notes), 'notes came back on every slide');
      return `${back.slides.length} slides back, every word`;
    });

    await test('the phone first screen is measured and said in a sentence', async () => {
      const {firstScreen} = await import('../lib/shoot.mjs');
      const dir = tmp('fs'); fs.cpSync(path.join(KIT, 'examples', 'sample'), dir, {recursive: true}); fs.cpSync(path.join(KIT, 'examples', 'media'), path.join(dir, 'media'), {recursive: true});
      const b = await build(dir);
      const w = await firstScreen(browser, b.out, 'phone');
      const page = fs.statSync(path.join(b.out, 'site', 'index.html')).size;
      assert.ok(w.bytes >= page && w.kinds.page >= page && w.kinds.scripts > 0, JSON.stringify(w));
      return `${Math.round(w.bytes / 1024)} KB in ${w.files} files`;
    });

    if (!findFfmpeg()) skip('record', 'no ffmpeg on this computer');
    else await test('record: one second of the deck and of the phone as mp4, frame by frame', async () => {
      const {recordFrame} = await import('../lib/record.mjs');
      const dir = tmp('rec'); fs.cpSync(path.join(KIT, 'examples', 'sample'), dir, {recursive: true}); fs.cpSync(path.join(KIT, 'examples', 'media'), path.join(dir, 'media'), {recursive: true});
      const b = await build(dir);
      const a = await recordFrame(browser, b.out, 'deck', path.join(b.out, 'deck.mp4'), {to: 1, jobs: 1});
      const p = await recordFrame(browser, b.out, 'phone', path.join(b.out, 'phone.mp4'), {from: 2, to: 3, jobs: 1});
      for (const r of [a, p]) { assert.equal(r.frames, 30); const buf = fs.readFileSync(r.file); assert.ok(buf.length > 2000 && buf.toString('latin1', 4, 8) === 'ftyp'); }
      return '30 + 30 frames';
    });
  } finally { await closeBrowser(browser); }
}

console.log(`\n${passed} passed, ${skipped} skipped, ${failed} failed`);
process.exit(failed ? 1 : 0);
