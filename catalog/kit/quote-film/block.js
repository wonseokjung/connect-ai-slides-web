// What he really said, next to the clip where he says it. The clip of the person fills one side (60 %), framed on the face;
// on the other side the words of that moment arrive phrase by phrase, thin and large, with one word in gold and a small source line.
// Nothing is drawn on the person: give the face box (and the body box) and the words stay in their own column.
export const css = `
.b-kit-quote-film .media { position: absolute; top: 0; bottom: 0; left: 0; width: 60%; overflow: hidden; background: #000; }
.b-kit-quote-film.flip .media { left: auto; right: 0; }
.b-kit-quote-film .media > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-kit-quote-film .edge { position: absolute; top: 0; bottom: 0; left: 60%; width: 2px; background: var(--gold); transform-origin: 50% 0; }
.b-kit-quote-film.flip .edge { left: 40%; margin-left: -2px; }
.b-kit-quote-film .copy { position: absolute; top: var(--top); bottom: 0; right: 0; width: 40%; padding: var(--pad) calc(var(--pad) * 0.8) var(--pad) calc(var(--pad) * 0.66); display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.7); }
.b-kit-quote-film.flip .copy { right: auto; left: 0; padding: var(--pad) calc(var(--pad) * 0.66) var(--pad) calc(var(--pad) * 0.8); }
.b-kit-quote-film .qm { font-family: var(--serif); font-size: calc(var(--lead) * 1.9); line-height: 0.6; height: 0.42em; color: var(--gold2); }
.b-kit-quote-film .lines { display: flex; flex-direction: column; gap: 0.14em; font-size: calc(var(--title) * 0.66); font-weight: var(--thin); letter-spacing: -0.022em; line-height: 1.12; color: var(--ink); }
.b-kit-quote-film .lines.many { font-size: calc(var(--title) * 0.54); }
.b-kit-quote-film .ln { display: block; word-break: keep-all; overflow-wrap: break-word; text-wrap: balance; will-change: clip-path, transform, opacity; }
.b-kit-quote-film .src { display: flex; align-items: center; gap: 0.9em; margin-top: calc(var(--gap) * 0.3); }
.b-kit-quote-film .src i { display: block; flex: none; width: 2.6em; height: 1px; background: var(--gold); transform-origin: 0 50%; }
.cs-frame[data-shape="tall"] .b-kit-quote-film .media { left: 0; right: 0; width: auto; top: var(--top); bottom: auto; height: 46%; }
.cs-frame[data-shape="tall"] .b-kit-quote-film .edge { left: 0; right: 0; width: auto; margin: 0; top: calc(46% + var(--top)); bottom: auto; height: 2px; transform-origin: 0 50%; }
.cs-frame[data-shape="tall"] .b-kit-quote-film .copy { top: calc(46% + var(--top)); left: 0; right: 0; width: auto; padding: calc(var(--pad) * 1.1) var(--pad) var(--pad); justify-content: flex-start; gap: calc(var(--gap) * 0.9); }
.cs-frame[data-shape="tall"] .b-kit-quote-film .lines { font-size: calc(var(--title) * 0.92); }
.cs-frame[data-shape="tall"] .b-kit-quote-film .lines.many { font-size: calc(var(--title) * 0.76); }
`;
export default function mount(el, p, cx) {
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || ''), face = p.face || null, tall = cx.shape === 'tall';
  if (p.side === 'left') el.classList.add('flip');
  const lines = [].concat(p.lines || []).map(String).filter(Boolean).slice(0, 4), gold = [].concat(p.gold || []).map(String).filter(Boolean);
  // the gold words: every place where one of them stands in a line
  const paint = (s) => {
    if (!gold.length) return cx.esc(s);
    const re = new RegExp('(' + gold.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'g');
    return s.split(re).map((part, i) => (i % 2 ? `<span class="cs-gold">${cx.esc(part)}</span>` : cx.esc(part))).join('');
  };
  const tag = isVideo
    ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || 'Video of the speaker')}"></video>`
    : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || 'Photo of the speaker')}">`;
  el.innerHTML = `
    <div class="media">${tag}</div>
    <i class="edge" aria-hidden="true"></i>
    <div class="copy">
      <div class="qm" aria-hidden="true">&ldquo;</div>
      <blockquote class="lines${lines.length > 2 ? ' many' : ''}">${lines.map((l) => `<span class="ln">${paint(l)}</span>`).join('')}</blockquote>
      ${p.source ? `<div class="src"><i></i><span class="cs-label">${cx.esc(p.source)}</span></div>` : ''}
    </div>`;
  const q = (s) => el.querySelector(s), m = q('.media > *'), box = q('.media');
  // frame the picture on the face: its centre goes to the middle of the panel, a little above half height
  const place = () => {
    const mw = m.videoWidth || m.naturalWidth || 16, mh = m.videoHeight || m.naturalHeight || 9, bw = box.offsetWidth, bh = box.offsetHeight;
    if (!bw || !bh) return;
    const s = Math.max(bw / mw, bh / mh), w = mw * s, h = mh * s, fx = face ? face[0] + face[2] / 2 : 0.5, fy = face ? face[1] + face[3] / 2 : 0.42;
    const px = w - bw > 1 ? cx.clamp((fx * w - bw / 2) / (w - bw), 0, 1) : 0.5, py = h - bh > 1 ? cx.clamp((fy * h - bh * 0.42) / (h - bh), 0, 1) : 0.5;
    m.style.objectPosition = (px * 100).toFixed(2) + '% ' + (py * 100).toFixed(2) + '%';
  };
  place(); m.addEventListener(isVideo ? 'loadedmetadata' : 'load', place);
  if (face) cx.face(m, face);
  if (p.body) cx.face(m, p.body, 'body');
  const open = tall ? ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'] : p.side === 'left' ? ['inset(0 0 0 100%)', 'inset(0 0 0 0%)'] : ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'];
  cx.wa(box, [{clipPath: open[0]}, {clipPath: open[1]}], {duration: 1.2, ease: 'cubic-bezier(.7,0,.2,1)'});
  cx.wa(q('.edge'), [{transform: tall ? 'scaleX(0)' : 'scaleY(0)'}, {transform: 'none'}], {duration: 0.9, delay: 0.5});
  cx.wa(q('.qm'), [{opacity: 0, transform: 'translateY(0.2em)'}, {opacity: 1, transform: 'none'}], {duration: 0.6, delay: 0.4, ease: 'ease-out'});
  // the phrases arrive one after another, each written in from the left, like speech
  const lns = el.querySelectorAll('.ln'), gap = lns.length > 1 ? Math.min(0.45, 1.2 / (lns.length - 1)) : 0;
  cx.wa(lns, [{opacity: 0, clipPath: 'inset(-0.3em 100% -0.3em 0)', transform: 'translateX(-0.25em)'}, {opacity: 1, clipPath: 'inset(-0.3em 68% -0.3em 0)', transform: 'translateX(-0.17em)', offset: 0.28}, {opacity: 1, clipPath: 'inset(-0.3em -2% -0.3em 0)', transform: 'none'}], {duration: 0.95, delay: 0.55, stagger: gap, ease: 'cubic-bezier(.3,.1,.2,1)'});
  const t1 = 0.55 + gap * (lns.length - 1) + 0.35;
  if (q('.src')) { cx.wa(q('.src i'), [{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: 0.7, delay: t1}); cx.wa(q('.src span'), [{opacity: 0}, {opacity: 1}], {duration: 0.5, delay: t1 + 0.05, ease: 'ease-out'}); }
  const text = Object.assign(cx.fromWaapi(el), {fit: place});
  return isVideo ? Object.assign(cx.all(text, cx.fromVideo(m)), {fit: place}) : text;
}
