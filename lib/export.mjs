// export: the deck as PDF and PPTX. Honest about what they are: the finished screen of every slide as a picture,
// plus your speaker notes. The motion stays in the HTML deck. MIT, CONNECT AI LAB.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileUrl, findFfmpeg} from './tools.mjs';
import {spawnSync} from 'node:child_process';
import {build, sceneText} from './build.mjs';
import {openBrowser, closeBrowser, openStage, stillsOf, recordStage} from './shoot.mjs';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

export async function exportDeck(projectDir, opts = {}) {
  if (!opts.pdf && !opts.pptx) opts = {...opts, pdf: true, pptx: true};
  const b = opts.built || await build(projectDir, {stages: ['deck']});
  const scenes = b.story.scenes.filter((s) => s.only !== 'site');
  const browser = opts.browser || await openBrowser();
  const res = {out: b.out, slides: scenes.length, notes: []};
  try {
    const st = await openStage(browser, b.out, 'deck');
    const dir = path.join(b.out, 'export');
    fs.rmSync(dir, {recursive: true, force: true});
    const stills = await stillsOf(st, dir, {where: [1]});
    // a 1920x1080 PNG is about 0.8 MB: a high-quality JPEG of the same screen keeps the PDF and the PPTX a few MB instead of 10+
    const ff = findFfmpeg();
    if (ff && !opts.png) for (const s of stills) {
      const jpg = s.file.replace(/\.png$/i, '.jpg');
      const r = spawnSync(ff, ['-v', 'error', '-y', '-i', s.file, '-q:v', '2', jpg]);
      if (r.status === 0 && fs.existsSync(jpg)) s.file = jpg;
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
      const mod = createRequire(import.meta.url)('pptxgenjs'); const Pptx = mod.default || mod;      // its ES build is not loadable by Node as it is, the CommonJS one is
      const pptx = new Pptx();
      pptx.layout = 'LAYOUT_WIDE'; pptx.title = b.story.title || 'Deck'; pptx.company = (b.story.brand && b.story.brand.name) || ''; pptx.author = pptx.company;
      let videos = 0;
      for (let i = 0; i < scenes.length; i++) {
        const slide = pptx.addSlide(); slide.background = {color: '0B0A08'};
        const alt = sceneText(scenes[i]).join('. ').slice(0, 900);
        let video = null;
        if (opts.pptxVideo && findFfmpeg()) {
          const s = st.plan.schedule[i]; video = path.join(dir, `slide_${String(i + 1).padStart(2, '0')}.mp4`);
          await recordStage(st, video, {from: s.at, to: s.at + s.clipDur + 0.2, crf: 20});
        }
        if (video) { slide.addMedia({type: 'video', path: video, cover: (/\.jpg$/i.test(stills[i].file) ? 'data:image/jpeg;base64,' : 'data:image/png;base64,') + fs.readFileSync(stills[i].file).toString('base64'), x: 0, y: 0, w: 13.333, h: 7.5}); videos++; }
        else slide.addImage({path: stills[i].file, x: 0, y: 0, w: 13.333, h: 7.5, altText: alt});
        const notes = [scenes[i].notes, video ? '' : null].filter(Boolean).join('\n');
        if (notes) slide.addNotes(notes);
      }
      res.pptx = path.join(b.out, 'deck.pptx');
      await pptx.writeFile({fileName: res.pptx});
      res.videos = videos;
      if (opts.pptxVideo && !findFfmpeg()) res.notes.push('--pptx-video was skipped: ffmpeg was not found.');
    }
    await st.page.close();
  } finally { if (!opts.browser) await closeBrowser(browser); }
  res.notes.unshift('PDF and PPTX hold the finished screen of every slide as a picture' + (res.pptx ? ', and the PPTX has your speaker notes' : '') + '. The text is not editable there and the motion is not in them: present from out/deck/index.html.');
  if (res.videos) res.notes.push(`--pptx-video: ${res.videos} slides carry their animation as an embedded mp4 (click to play in PowerPoint or Keynote; this part is experimental, open the file once before you present).`);
  return res;
}
