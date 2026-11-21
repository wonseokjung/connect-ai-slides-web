// dev: screenshots of docs/index.html at desktop and phone width. node tools/shot-docs.mjs [outDir]
import path from 'node:path';
import fs from 'node:fs';
import {KIT, fileUrl, openBrowser} from '../lib/tools.mjs';
const out = path.resolve(process.argv[2] || path.join(KIT, 'work', 'docs-shots')); fs.mkdirSync(out, {recursive: true});
const br = await openBrowser();
for (const [name, w, h, dpr, mobile] of [['desktop', 1440, 900, 1, false], ['phone', 390, 844, 2, true]]) {
  const p = await br.newPage(); await p.setViewport({width: w, height: h, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: mobile});
  const errs = []; p.on('pageerror', (e) => errs.push(String(e))); p.on('requestfailed', (r) => errs.push('failed ' + r.url().slice(-60)));
  await p.goto(fileUrl(path.join(KIT, 'docs', 'index.html')), {waitUntil: 'load'});
  await new Promise((r) => setTimeout(r, 1500));
  // lazy media: load what a visitor would see while scrolling
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight) { scrollTo({top: y, behavior: 'instant'}); await new Promise((r) => setTimeout(r, 160)); } scrollTo({top: 0, behavior: 'instant'}); await new Promise((r) => setTimeout(r, 500)); });
  const m = await p.evaluate(() => ({sw: document.documentElement.scrollWidth, iw: innerWidth, h: document.documentElement.scrollHeight, small: [...document.querySelectorAll('a,button')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.height < 40) && !e.hidden; }).map((e) => (e.textContent || '').trim().slice(0, 20) + ' ' + Math.round(e.getBoundingClientRect().height)).slice(0, 12)}));
  await p.screenshot({path: path.join(out, name + '_top.png')});
  // a long page at 2x is past what Chrome can encode in one picture: the full-length shot is taken at 1x
  if (dpr > 1) await p.setViewport({width: w, height: h, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile});
  await p.screenshot({path: path.join(out, name + '_full.jpg'), fullPage: true, type: 'jpeg', quality: 80});
  console.log(name, JSON.stringify(m), errs.length ? 'ERRORS ' + errs.slice(0, 5).join(' | ') : 'no errors');
  await p.close();
}
await br.close(); process.exit(0);
