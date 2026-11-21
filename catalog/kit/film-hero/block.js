// A film still that fills the whole frame and a large thin title on the empty side of it.
// Give the face box (and the body box if you have it): the block finds the wider free side, stacks the words there
// from the top (the name goes to the foot of the column) and darkens only that strip, fading out before the person. Nothing is drawn on the person. Without a face box the words sit in a band at the bottom.
export const css = `
.b-kit-film-hero { background: #000; }
.b-kit-film-hero .media { position: absolute; inset: 0; overflow: hidden; background: #000; }
.b-kit-film-hero .media > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-kit-film-hero .scrim { position: absolute; top: 0; bottom: 0; left: 0; width: var(--free, 30%); pointer-events: none;
  background: linear-gradient(90deg, rgba(8, 7, 5, 0.86) 0%, rgba(8, 7, 5, 0.8) 28%, rgba(8, 7, 5, 0.66) 46%, rgba(8, 7, 5, 0.46) 61%, rgba(8, 7, 5, 0.26) 73%, rgba(8, 7, 5, 0.11) 82%, rgba(8, 7, 5, 0.03) 89%, rgba(8, 7, 5, 0) 94%); }
.b-kit-film-hero.right .scrim { left: auto; right: 0; transform: scaleX(-1); }
.b-kit-film-hero .copy { position: absolute; top: var(--top); bottom: 0; left: 0; width: var(--free, 30%); padding: calc(var(--pad) * 0.62) calc(var(--gap) * 0.5) calc(var(--pad) * 0.62) calc(var(--pad) * 0.5);
  display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.72); }
.b-kit-film-hero.right .copy { left: auto; right: 0; padding-left: calc(var(--gap) * 0.5); padding-right: calc(var(--pad) * 0.5); }
.b-kit-film-hero.at-top .copy { justify-content: flex-start; }
.b-kit-film-hero.at-top .who { margin-top: auto; }
.b-kit-film-hero.at-bottom .copy { justify-content: flex-end; }
.b-kit-film-hero .kick { display: flex; align-items: center; gap: calc(var(--label) * 0.6); }
.b-kit-film-hero .kick i { flex: none; display: block; width: calc(var(--label) * 1.5); height: 1px; background: var(--gold2); transform-origin: 0 50%; }
.b-kit-film-hero .cs-kicker { letter-spacing: 0.3em; }
.cs-frame[data-stage="deck"] .b-kit-film-hero .cs-kicker, .cs-frame[data-stage="deck"] .b-kit-film-hero .who { font-size: calc(var(--label) * 0.82); }
.b-kit-film-hero .ttl { font-size: calc(var(--hero) * var(--fk, 0.44)); font-weight: var(--thin); letter-spacing: -0.035em; line-height: 0.98; color: var(--ink); text-shadow: 0 0 0.6em rgba(8, 7, 5, 0.55); }
.b-kit-film-hero .rule { display: block; width: 100%; height: 1px; background: var(--gold); transform-origin: 0 50%; }
.b-kit-film-hero .sub { font-size: var(--body); font-weight: var(--light); line-height: 1.36; color: var(--ivory); text-wrap: pretty; text-shadow: 0 0 0.6em rgba(8, 7, 5, 0.55); }
.b-kit-film-hero .who { letter-spacing: 0.3em; color: var(--ivory); }

/* no face box: the words go in a band at the bottom of the picture */
.b-kit-film-hero.band .scrim { top: auto; left: 0; right: 0; width: auto; height: 58%; transform: none;
  background: linear-gradient(0deg, rgba(8, 7, 5, 0.9) 0%, rgba(8, 7, 5, 0.8) 42%, rgba(8, 7, 5, 0.4) 76%, rgba(8, 7, 5, 0) 100%); }
.b-kit-film-hero.band .copy { top: auto; left: 0; right: 0; width: auto; padding: calc(var(--pad) * 0.62) var(--pad); justify-content: flex-end; }
.b-kit-film-hero.band .ttl { font-size: calc(var(--hero) * 0.58); text-wrap: balance; }
.b-kit-film-hero.band .rule { width: calc(var(--title) * 1.4); }

/* phone: the picture on top (framed on the face), the words under it on black */
.cs-frame[data-shape="tall"] .b-kit-film-hero { background: var(--bg); }
.cs-frame[data-shape="tall"] .b-kit-film-hero .media { top: var(--top); bottom: auto; height: calc(59% - var(--top)); }
.cs-frame[data-shape="tall"] .b-kit-film-hero .scrim { display: none; }
.cs-frame[data-shape="tall"] .b-kit-film-hero .copy { top: 59%; bottom: 0; left: 0; right: 0; width: auto; padding: var(--pad); justify-content: center; gap: calc(var(--gap) * 0.9); }
.cs-frame[data-shape="tall"] .b-kit-film-hero .ttl { font-size: calc(var(--title) * 1.16); line-height: 1.02; text-shadow: none; text-wrap: balance; }
.cs-frame[data-shape="tall"] .b-kit-film-hero .sub { text-shadow: none; }
.cs-frame[data-shape="tall"] .b-kit-film-hero .rule { width: calc(var(--title) * 1.4); }
`;
export default function mount(el, p, cx) {
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || '');
  const face = Array.isArray(p.face) ? p.face : null, body = Array.isArray(p.body) ? p.body : null, tall = cx.shape === 'tall';
  // the room a person takes: the body box, or (face only) shoulders guessed from the face
  const person = body || (face ? [face[0] - face[2] * 0.6, face[1], face[2] * 2.2, 1 - face[1]] : null);
  if (!person) el.classList.add('band');
  if (person && !tall && p.align !== 'middle') el.classList.add(p.align === 'bottom' ? 'at-bottom' : 'at-top');
  const tag = isVideo
    ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || p.title || 'Video')}"></video>`
    : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || p.title || 'Picture')}">`;
  el.innerHTML = `
    <div class="media">${tag}</div>
    <i class="scrim" aria-hidden="true"></i>
    <div class="copy">
      ${p.kicker ? `<div class="kick"><i aria-hidden="true"></i><span class="cs-kicker">${cx.esc(p.kicker)}</span></div>` : ''}
      <h1 class="ttl">${cx.spans(p.title, 'cs-w')}</h1>
      <i class="rule" aria-hidden="true"></i>
      ${p.sub ? `<p class="sub">${cx.esc(p.sub)}</p>` : ''}
      ${p.name ? `<div class="who cs-label">${cx.esc(p.name)}</div>` : ''}
    </div>`;
  const q = (s) => el.querySelector(s), m = q('.media > *'), box = q('.media'), ttl = q('.ttl'), copy = q('.copy'), words = el.querySelectorAll('.cs-w');
  const place = () => {
    const bw = box.offsetWidth, bh = box.offsetHeight; if (!bw || !bh) return;
    const mw = m.videoWidth || m.naturalWidth || 16, mh = m.videoHeight || m.naturalHeight || 9;
    const s = Math.max(bw / mw, bh / mh), w = mw * s, h = mh * s, fx = face ? face[0] + face[2] / 2 : 0.5, fy = face ? face[1] + face[3] / 2 : 0.42;
    const px = w - bw > 1 ? cx.clamp((fx * w - bw / 2) / (w - bw), 0, 1) : 0.5, py = h - bh > 1 ? cx.clamp((fy * h - bh * 0.42) / (h - bh), 0, 1) : 0.5;
    m.style.objectPosition = (px * 100).toFixed(2) + '% ' + (py * 100).toFixed(2) + '%';
    if (tall || !person) { el.style.removeProperty('--free'); el.style.removeProperty('--fk'); return; }
    // free room left and right of the person, in frame px
    const x0 = (bw - w) * px, L = Math.max(0, x0 + person[0] * w), R = Math.max(0, bw - (x0 + (person[0] + person[2]) * w));
    const right = p.side ? p.side === 'right' : R > L + 2;
    el.classList.toggle('right', right);
    const free = Math.max(Math.floor(right ? R : L) - 2, bw * 0.16);
    el.style.setProperty('--free', free + 'px');
    // the largest thin type whose longest word fits the column and whose stack fits the height
    const st = getComputedStyle(copy), colW = free - parseFloat(st.paddingLeft) - parseFloat(st.paddingRight), maxH = (el.offsetHeight - parseFloat(st.paddingTop) - parseFloat(st.paddingBottom)) * 0.56;
    let fk = 0.72; const n = words.length, maxLines = Math.max(Math.ceil(n / 2), Math.min(n, 3));
    for (let i = 0; i < 16; i++) {
      el.style.setProperty('--fk', fk.toFixed(3));
      let widest = 0; words.forEach((wd) => { widest = Math.max(widest, wd.offsetWidth); });
      const lines = Math.round(ttl.offsetHeight / (parseFloat(getComputedStyle(ttl).lineHeight) || 1));
      if ((widest <= colW && lines <= maxLines && ttl.offsetHeight <= maxH) || fk <= 0.24) break;
      fk *= 0.94;
    }
  };
  place(); m.addEventListener(isVideo ? 'loadedmetadata' : 'load', place);
  if (face) cx.face(m, face);
  if (body) cx.face(m, body, 'body');
  // the film opens like a gate, then the words arrive one by one
  cx.wa(box, [{opacity: 0, clipPath: 'inset(11% 0 11% 0)'}, {opacity: 1, clipPath: 'inset(0% 0 0% 0)'}], {duration: 1.5, ease: 'cubic-bezier(.3,0,.1,1)'});
  cx.wa(q('.scrim'), [{opacity: 0}, {opacity: 1}], {duration: 1.1, delay: 0.25, ease: 'ease-out'});
  if (q('.kick')) { cx.wa(q('.kick i'), [{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: 0.7, delay: 0.45}); cx.wa(q('.cs-kicker'), [{opacity: 0, letterSpacing: '0.5em'}, {opacity: 1, letterSpacing: '0.3em'}], {duration: 0.9, delay: 0.5}); }
  const each = Math.min(0.11, 0.8 / Math.max(1, words.length));
  cx.wa(words, [{opacity: 0, filter: 'blur(18px)', transform: 'translateY(0.28em)'}, {opacity: 1, filter: 'blur(0px)', transform: 'none'}], {duration: 0.85, delay: 0.65, stagger: each});
  const t1 = 0.65 + each * words.length + 0.25;
  cx.wa(q('.rule'), [{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: 0.9, delay: t1 - 0.1});
  if (q('.sub')) cx.wa(q('.sub'), [{opacity: 0, transform: 'translateY(16px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: t1 + 0.1});
  if (q('.who')) cx.wa(q('.who'), [{opacity: 0}, {opacity: 1}], {duration: 0.7, delay: t1 + 0.3, ease: 'ease-out'});
  const text = Object.assign(cx.fromWaapi(el), {fit: place});
  return isVideo ? cx.all(text, cx.fromVideo(m)) : text;
}
