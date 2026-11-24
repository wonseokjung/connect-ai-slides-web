// Look inside a .pptx without PowerPoint: per slide, the editable text boxes and their words, pictures, video clips,
// whether a clip starts by itself, and the speaker notes. Used by `inspect` and by the tests. MIT, CONNECT AI LAB.
import fs from 'node:fs';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const unxml = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
const words = (xml) => [...xml.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map((m) => unxml(m[1]));

export async function inspectPptx(file) {
  const JSZip = require('jszip');
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const names = Object.keys(zip.files);
  const slideFiles = names.filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n)).sort((a, b) => +a.match(/(\d+)\.xml$/)[1] - +b.match(/(\d+)\.xml$/)[1]);
  const slides = [];
  for (const f of slideFiles) {
    const xml = await zip.file(f).async('string');
    const n = +f.match(/(\d+)\.xml$/)[1];
    const rels = zip.file(`ppt/slides/_rels/slide${n}.xml.rels`) ? await zip.file(`ppt/slides/_rels/slide${n}.xml.rels`).async('string') : '';
    const boxes = [...xml.matchAll(/<p:sp>([\s\S]*?)<\/p:sp>/g)].map((m) => m[1]).filter((sp) => /<p:txBody>/.test(sp)).map((sp) => sp.split('</a:p>').map((para) => words(para).join('')).filter(Boolean).join(' ').trim()).filter(Boolean);
    const videos = (xml.match(/<a:videoFile /g) || []).length;
    const pictures = (xml.match(/<p:pic>/g) || []).length - videos;
    const autoplay = /<p:timing>[\s\S]*cmd="playFrom\(/.test(xml);
    const noteRel = /relationships\/notesSlide" Target="\.\.\/notesSlides\/(notesSlide\d+\.xml)"/.exec(rels) || /Target="\.\.\/notesSlides\/(notesSlide\d+\.xml)"[^>]*relationships\/notesSlide/.exec(rels);
    let notes = '';
    if (noteRel && zip.file('ppt/notesSlides/' + noteRel[1])) {
      const nx = await zip.file('ppt/notesSlides/' + noteRel[1]).async('string');
      const body = /<p:ph type="body"[\s\S]*?<\/p:sp>/.exec(nx);
      notes = body ? words(body[0]).join('').trim() : '';
    }
    const media = [...rels.matchAll(/Target="\.\.\/media\/([^"]+\.(mp4|m4v|mov))"/g)].map((m) => m[1]);
    slides.push({slide: n, boxes, videos, pictures, autoplay, notes, media: [...new Set(media)]});
  }
  const mediaBytes = names.filter((n) => /^ppt\/media\/.*\.(mp4|m4v|mov)$/.test(n)).reduce((a, n) => a + (zip.files[n]._data ? zip.files[n]._data.uncompressedSize || 0 : 0), 0);
  return {file, size: fs.statSync(file).size, slides, mediaBytes,
    totals: {slides: slides.length, boxes: slides.reduce((a, s) => a + s.boxes.length, 0), videos: slides.reduce((a, s) => a + s.videos, 0), autoplay: slides.filter((s) => s.autoplay).length, notes: slides.filter((s) => s.notes).length}};
}

export function printInspect(r, say = console.log) {
  const t = r.totals;
  say(`${r.file}  ${(r.size / 1e6).toFixed(1)} MB`);
  say(`  ${t.slides} slides, ${t.boxes} text boxes you can edit, ${t.videos} video clips (${t.autoplay} start by themselves), notes on ${t.notes} slides`);
  for (const s of r.slides) say(`  ${String(s.slide).padStart(2)}  ${String(s.boxes.length).padStart(2)} text  ${s.videos ? (s.autoplay ? 'clip, auto ' : 'clip, click') : s.pictures ? 'picture    ' : '           '}  ${s.notes ? 'notes' : '     '}  ${(s.boxes[0] || '').slice(0, 48)}`);
}
