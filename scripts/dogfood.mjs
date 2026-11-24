// Dogfood gate before a release: our own tools on our own things.
//   node scripts/dogfood.mjs <out-folder>            (CONNECT_AI_WRITER=<connect-ai-writer folder> adds its checker)
// 1. our copy keeps the house rules: no corner brackets, no long dashes, no emoji
// 2. connect-ai-writer's humanize + check (AI tells, translationese, banned phrases) on the Korean docs, when it is there
// 3. a deck from the Korean sample talk, all the way to deck.pptx, then inspect: every slide has words as text boxes and
//    notes, no shape shares an id, every picture is named for its format
// Exit 2 if anything needs a fix. MIT, CONNECT AI LAB.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath, pathToFileURL} from 'node:url';

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.resolve(process.argv[2] || 'dogfood-out');
fs.rmSync(out, {recursive: true, force: true}); fs.mkdirSync(out, {recursive: true});
const log = []; let fixes = 0;
const say = (l) => { log.push(l); console.log(l); };

// 1. house rules
const copy = ['README.md', 'README.ko.md', 'docs/guide.md', 'docs/guide.ko.md', 'skill/SKILL.md'].filter((f) => fs.existsSync(path.join(KIT, f)));
for (const f of copy) {
  const t = fs.readFileSync(path.join(KIT, f), 'utf8').replace(/```[\s\S]*?```/g, '');
  const bad = [];
  if (/[「」『』]/.test(t)) bad.push('corner brackets');
  if (/—/.test(t)) bad.push('a long dash');
  if (/\p{Extended_Pictographic}/u.test(t.replace(/[©®™]/g, ''))) bad.push('an emoji');
  fixes += bad.length;
  say(`rules     ${f}: ${bad.length ? 'FIX ' + bad.join(', ') : 'ok'}`);
}

// 2. connect-ai-writer's checker
const writer = process.env.CONNECT_AI_WRITER;
if (writer && fs.existsSync(path.join(writer, 'lib', 'humanize.mjs'))) {
  const {analyze, loadPatterns} = await import(pathToFileURL(path.join(writer, 'lib', 'humanize.mjs')).href);
  const {checkPost} = await import(pathToFileURL(path.join(writer, 'lib', 'check.mjs')).href);
  const rules = JSON.parse(fs.readFileSync(path.join(writer, 'rules.json'), 'utf8'));
  for (const k of ['numbersInSource', 'quotesInSource', 'noImages', 'firstPartImage', 'limits', 'placeholder', 'hooks', 'seo', 'sources', 'email', 'generatedImages']) rules[k] = 'off';
  const banned = JSON.parse(fs.readFileSync(path.join(writer, 'banned.json'), 'utf8'));
  const patterns = loadPatterns(writer);
  const extra = (process.env.DOGFOOD_EXTRA || '').split(path.delimiter).filter(Boolean);
  for (const f of ['README.ko.md', 'docs/guide.ko.md', ...extra]) {
    const file = path.isAbsolute(f) ? f : path.join(KIT, f);
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '').replace(/<[^>]+>/g, ' ');
    const h = analyze(text, {patterns});
    const c = checkPost({key: f, post: {title: f, parts: [{text: text.replace(/"[^"\n]+"|“[^”\n]+”/g, '""'), images: []}], tags: []}, platform: {name: 'doc', kind: 'article', count: 'chars', maxChars: 1e9, maxImages: 1e9}, source: {lines: []}, rules, banned});
    const strong = h.findings.filter((x) => x.severity === 'strong'), fail = c.filter((x) => x.level === 'fail');
    fixes += strong.length + fail.length;
    say(`writer    ${path.basename(f)}: humanize ${h.score} per 1,000 letters (${h.grade}), ${strong.length} strong, check ${fail.length} FIX, ${c.filter((x) => x.level === 'warn').length} LOOK`);
    for (const x of strong) say(`            strong: ${x.label || x.id || ''} "${(x.text || x.match || '').slice(0, 60)}"`);
    for (const x of c) say(`            ${x.level === 'fail' ? 'FIX ' : 'LOOK'} ${x.message}`);
  }
} else say('writer    skipped: set CONNECT_AI_WRITER to a connect-ai-writer folder to add its checker');

// 3. our own deck, to a PowerPoint file
const cli = path.join(KIT, 'bin', 'cli.mjs');
const run = (args) => spawnSync(process.execPath, [cli, ...args, '--quiet'], {cwd: out, encoding: 'utf8', timeout: 15 * 60 * 1000, shell: false, windowsHide: true});
let r = run(['ppt', '--ko']);
if (r.status !== 0) { fixes++; say('ppt       FIX the sample talk was not written: ' + (r.stderr || r.stdout).trim().split('\n').pop()); }
else {
  r = run(['ppt', 'my-talk.md', ...(process.argv.includes('--video') ? [] : ['--no-video'])]);
  const deck = path.join(out, 'my-talk-deck', 'out', 'deck.pptx');
  if (r.status !== 0 || !fs.existsSync(deck)) { fixes++; say('ppt       FIX no deck.pptx: ' + (r.stderr || r.stdout).trim().split('\n').slice(-2).join(' ')); }
  else {
    const {inspectPptx} = await import(pathToFileURL(path.join(KIT, 'lib', 'inspect-pptx.mjs')).href);
    const x = await inspectPptx(deck);
    const empty = x.slides.filter((s) => !s.boxes.length).map((s) => s.slide), noNotes = x.slides.filter((s) => !s.notes).map((s) => s.slide);
    const bad = [...x.problems, ...(empty.length ? [`no text box on slide ${empty.join(', ')}`] : []), ...(noNotes.length ? [`no notes on slide ${noNotes.join(', ')}`] : [])];
    fixes += bad.length;
    say(`pptx      ${x.totals.slides} slides, ${x.totals.boxes} text boxes, ${x.totals.videos} clips, notes on ${x.totals.notes}: ${bad.length ? 'FIX ' + bad.join('; ') : 'ok'}`);
  }
}
say(fixes ? `DOGFOOD FAIL: ${fixes} FIX` : 'DOGFOOD PASS: 0 FIX');
fs.writeFileSync(path.join(out, 'dogfood.txt'), log.join('\n') + '\n');
if (fixes) process.exitCode = 2;
