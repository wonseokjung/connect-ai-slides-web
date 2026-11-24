// macOS only. Open a .pptx in Keynote and see it the way Keynote shows it:
//   node tools/keynote-check.mjs out/deck.pptx [outFolder]
// writes <out>/keynote_NN.png (every slide), keynote.pdf, keynote.m4v (the deck playing by itself, 540p) and
// <out>/autoplay.txt: for every slide with a clip, whether the picture moves in the first seconds of that slide
// (it moves = the clip started by itself). The first run asks once to let Terminal control Keynote: say OK.
// Keynote is sandboxed: keep the .pptx and the out folder outside Desktop / Documents / Downloads, or allow access.
// MIT, CONNECT AI LAB.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const {inspectPptx} = await import(path.join(KIT, 'lib', 'inspect-pptx.mjs'));
const file = path.resolve(process.argv[2] || '');
if (!/\.pptx$/i.test(file) || !fs.existsSync(file)) { console.error('Give a .pptx file: node tools/keynote-check.mjs out/deck.pptx'); process.exit(1); }
if (process.platform !== 'darwin') { console.error('Keynote is macOS only.'); process.exit(1); }
const out = path.resolve(process.argv[3] || path.join(path.dirname(file), 'keynote'));
fs.mkdirSync(out, {recursive: true});
const info = await inspectPptx(file);
const HOLD = 4;   // seconds each slide stays in the movie
const script = `
on run argv
  set src to POSIX file (item 1 of argv)
  set outdir to item 2 of argv
  tell application "Keynote"
    with timeout of 600 seconds
      set d to open src
      delay 2
      repeat with s in slides of d
        set transition properties of s to {automatic transition:true, transition delay:${HOLD}, transition duration:0.01}
      end repeat
      export d to (POSIX file outdir) as slide images with properties {image format:PNG, skipped slides:false}
      export d to (POSIX file (outdir & "/keynote.pdf")) as PDF
      export d to (POSIX file (outdir & "/keynote.m4v")) as QuickTime movie with properties {movie format:format540p}
      close d saving no
    end timeout
  end tell
end run`;
const scr = path.join(out, '.keynote-check.applescript');
fs.writeFileSync(scr, script);
console.log('Keynote: opening ' + file + ' (allow Terminal to control Keynote if macOS asks)');
const r = spawnSync('osascript', [scr, file, out], {encoding: 'utf8', timeout: 15 * 60 * 1000, shell: false});
fs.rmSync(scr, {force: true});
if (r.status !== 0) { console.error('Keynote did not answer: ' + (r.stderr || r.error || '').toString().trim()); process.exit(1); }
const imgs = fs.readdirSync(out).filter((f) => /\.png$/i.test(f)).sort();
console.log(`  ${imgs.length} slide images, keynote.pdf, keynote.m4v in ${out}`);
// autoplay: in the movie, slide k starts at about k*HOLD s. Compare a frame near its start with one 1.5 s later.
const movie = path.join(out, 'keynote.m4v');
const lines = [];
const frame = (t) => { const f = path.join(out, `.f_${t.toFixed(2)}.raw`); spawnSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(t), '-i', movie, '-frames:v', '1', '-vf', 'scale=160:90', '-f', 'rawvideo', '-pix_fmt', 'gray', f], {shell: false}); const b = fs.existsSync(f) ? fs.readFileSync(f) : null; fs.rmSync(f, {force: true}); return b; };
for (const s of info.slides) {
  if (!s.videos) continue;
  const t0 = (s.slide - 1) * HOLD;
  const a = frame(t0 + 0.25), b = frame(t0 + 1.75);
  let d = 0; if (a && b) for (let i = 0; i < a.length; i++) d += Math.abs(a[i] - b[i]);
  const mean = a && b ? d / a.length : -1;
  lines.push(`slide ${s.slide}: clip ${s.autoplay ? 'marked auto' : 'marked click'}; picture change in its first 1.5 s = ${mean.toFixed(2)} -> ${mean > 1.5 ? 'MOVES (plays by itself)' : 'still'}`);
}
fs.writeFileSync(path.join(out, 'autoplay.txt'), lines.join('\n') + '\n');
for (const l of lines) console.log('  ' + l);
