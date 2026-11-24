// export: the deck as a real PowerPoint file (editable words, the motion as clips, speaker notes) and as a PDF.
// MIT, CONNECT AI LAB.
import fs from 'node:fs';
import path from 'node:path';
import {fileUrl, findFfmpeg} from './tools.mjs';
import {spawnSync} from 'node:child_process';
import {build, sceneText} from './build.mjs';
import {openBrowser, closeBrowser, openStage, stillsOf} from './shoot.mjs';
import {writePptx} from './pptx.mjs';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

// opts: pdf, pptx, pptxMode ('editable' | 'pictures'), video (true), autoplay (true), builds (true), google (false), font
export async function exportDeck(projectDir, opts = {}) {
  if (!opts.pdf && !opts.pptx) opts = {...opts, pdf: true, pptx: true};
  const b = opts.built || await build(projectDir, {stages: ['deck']});
  const scenes = b.story.scenes.filter((s) => s.only !== 'site');
  const browser = opts.browser || await openBrowser();
  const res = {out: b.out, slides: scenes.length, notes: []};
  const mode = opts.pptxMode || 'editable';
  try {
    const st = await openStage(browser, b.out, 'deck');
    const dir = path.join(b.out, 'export');
    fs.rmSync(dir, {recursive: true, force: true});
    let stills = [];
    if (opts.pdf || (opts.pptx && mode === 'pictures')) {
      stills = await stillsOf(st, dir, {where: [1]});
      // a 1920x1080 PNG is about 0.8 MB: a high-quality JPEG of the same screen keeps the files a few MB instead of 10+
      const ff = findFfmpeg();
      if (ff && !opts.png) for (const s of stills) {
        const jpg = s.file.replace(/\.png$/i, '.jpg');
        const r = spawnSync(ff, ['-v', 'error', '-y', '-i', s.file, '-q:v', '2', jpg], {shell: false, windowsHide: true});
        if (r.status === 0 && fs.existsSync(jpg)) s.file = jpg;
      }
    }
    if (opts.pdf) {
      // one picture per page, with the words as an invisible text layer so the PDF can be searched and read aloud
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(b.story.title || 'Deck')}</title><style>@page{size:1920px 1080px;margin:0}html,body{margin:0;background:#000}section{position:relative;width:1920px;height:1080px;overflow:hidden;page-break-after:always;break-after:page}section:last-child{page-break-after:auto;break-after:auto}img{position:absolute;inset:0;width:1920px;height:1080px}p{position:absolute;left:40px;top:40px;right:40px;margin:0;font:20px/1.4 sans-serif;color:transparent}</style></head><body>${stills.map((s, i) => `<section><p>${esc(sceneText(scenes[i]).join(' . '))}</p><img src="${fileUrl(s.file)}" alt=""></section>`).join('')}</body></html>`;
      const hp = path.join(dir, 'print.html'); fs.writeFileSync(hp, html);
      const page = await browser.newPage();
      await page.goto(fileUrl(hp), {waitUntil: 'load'});
      await page.evaluate(() => Promise.all([...document.images].map((im) => im.decode().catch(() => {}))));
      res.pdf = path.join(b.out, 'deck.pdf');
      await page.pdf({path: res.pdf, width: '1920px', height: '1080px', printBackground: true, pageRanges: '', preferCSSPageSize: true});
      await page.close();
    }
    if (opts.pptx) {
      const r = await writePptx({b, st, scenes, dir, stills, mode, video: opts.video !== false, autoplay: opts.autoplay !== false, builds: opts.builds !== false, google: !!opts.google, font: opts.font || null, log: opts.onProgress || (() => {})});
      res.pptx = r.files.pptx; res.google = r.files.google; res.boxes = r.boxes; res.clips = r.clips; res.pictureOnly = r.pictureOnly; res.fonts = r.fonts; res.autoplay = r.autoplay; res.mode = mode; res.builds = r.builds;
      if (mode === 'pictures') res.notes.push('PPTX (pictures): the finished screen of every slide as a picture, with your speaker notes. Words are not editable there.');
      else {
        res.notes.push(`PPTX: ${r.boxes} text boxes you can edit, ${r.clips} slides with their motion as a clip${r.clips ? (r.autoplay ? ' that starts by itself' : ' that starts on a click') : ''}, ${r.builds} text boxes that fade in when their words appear in the HTML deck, speaker notes on every slide that has them.`);
        if (r.noFfmpeg) res.notes.push('No ffmpeg, so no clips: the slides have a still picture behind the words. Install ffmpeg for the motion.');
        if (r.pictureOnly.length) res.notes.push(`Slide${r.pictureOnly.length > 1 ? 's' : ''} ${r.pictureOnly.join(', ')}: the words are drawn inside the picture there (an embedded player or a canvas), so they are not text boxes.`);
        if (r.fonts.length) res.notes.push(`Fonts in the file: ${r.fonts.join(', ')}. A computer without them shows a similar font.`);
        if (res.google) res.notes.push('deck_google.pptx: the same words as text boxes on still pictures, for Google Slides (it does not play videos inside a .pptx).');
      }
    }
    await st.page.close();
  } finally { if (!opts.browser) await closeBrowser(browser); }
  if (res.pdf) res.notes.push('PDF: the finished screen of every slide, searchable.');
  return res;
}
