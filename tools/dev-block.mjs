// dev: render catalog blocks from their meta.example in the three frames. node tools/dev-block.mjs <kind|source/> [...] [--where 0.5,1] [--out dir]
import fs from 'node:fs';
import path from 'node:path';
import {KIT} from '../lib/tools.mjs';
import {loadCatalog} from '../lib/catalog.mjs';
import {build} from '../lib/build.mjs';
import {openBrowser, openStage, stillsOf, contactSheet} from '../lib/shoot.mjs';
const args = process.argv.slice(2), flag = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args.splice(i, 2)[1] : d; };
const where = flag('--where', '0.5,1').split(',').map(Number), frames = flag('--frames', 'deck,site,phone').split(',');
const nameArg = flag('--name', null), outArg = flag('--out', null);
const cat = loadCatalog();
const picks = cat.filter((m) => !args.length || args.some((a) => m.kind === a || m.kind.startsWith(a.replace(/\/?$/, '/'))));
if (!picks.length) { console.log('no block matches', args); process.exit(1); }
const tag = nameArg || (args.length ? args.join('_').replace(/[^a-z0-9]+/gi, '-') : 'all');
const proj = outArg || path.join(KIT, 'work', 'dev', tag);
fs.mkdirSync(proj, {recursive: true});
for (const m of picks) if (m.errors.length) console.log('META', m.kind, m.errors);
// examples may point at media in examples/media
fs.cpSync(path.join(KIT, 'examples', 'media'), path.join(proj, 'media'), {recursive: true});
const story = {title: 'dev ' + tag, look: process.env.LOOK || 'connect', brand: {name: 'CONNECT AI LAB', links: [{label: 'YouTube', href: 'https://www.youtube.com/@CONNECT-AI-LAB'}, {label: 'Courses', href: 'https://www.aicitybuilders.com'}]},
  scenes: picks.filter((m) => m.status === 'ok').map((m) => ({kind: m.kind, id: m.kind.replace('/', '-'), ...m.example}))};
fs.writeFileSync(path.join(proj, 'story.json'), JSON.stringify(story, null, 2));
const b = await build(proj);
const br = await openBrowser();
for (const f of frames) {
  const st = await openStage(br, b.out, f);
  const stills = await stillsOf(st, path.join(b.out, 'stills'), {where});
  if (st.log.errors.length) console.log(f, 'PAGE ERRORS', [...new Set(st.log.errors)].slice(0, 10));
  if (st.log.failed.length) console.log(f, 'MISSING FILES', [...new Set(st.log.failed)].slice(0, 10));
  const sheet = path.join(b.out, `sheet_${f}.jpg`);
  contactSheet(stills.map((s) => ({file: s.file, caption: `${s.kind} @${s.where}`})), sheet, f === 'phone' ? {cols: Math.min(8, stills.length), cellW: 234, cellH: 506} : {cols: Math.min(4, stills.length), cellW: 640, cellH: f === 'deck' ? 360 : 400});
  console.log(f, st.plan.schedule.map((s) => s.kind + ' ' + s.clipDur.toFixed(1) + 's').join(' | '));
  console.log('  sheet', sheet);
  await st.page.close();
}
await br.close().catch(() => {});
process.exit(0);
