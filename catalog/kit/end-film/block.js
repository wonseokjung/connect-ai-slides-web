// The last screen as a film frame: a result clip or picture fills the frame behind a dark veil, the closing line and the
// link buttons sit on top (real links, they work on the slide too). For results and graphics, not for footage of a person:
// the veil covers the whole picture.
export const css = `
.b-kit-end-film { background: #000; }
.b-kit-end-film .media { position: absolute; inset: 0; overflow: hidden; }
.b-kit-end-film .media > * { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-kit-end-film .veil { position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(90% 80% at 50% 52%, rgba(8, 7, 5, 0.9) 0%, rgba(8, 7, 5, 0.82) 46%, rgba(8, 7, 5, 0.68) 100%); }
.b-kit-end-film .cs-hero { font-size: calc(var(--hero) * 0.8); max-width: 12em; }
.b-kit-end-film .cs-w { margin: 0 0.11em; }
.b-kit-end-film .cs-lead { max-width: 24em; color: var(--ink); }
.b-kit-end-film .btns { display: flex; flex-wrap: wrap; justify-content: center; gap: calc(var(--gap) * 0.6); margin-top: calc(var(--gap) * 0.3); }
.b-kit-end-film .cs-btn { min-height: 48px; }
.b-kit-end-film .cs-btn.cs-ghost { background: rgba(8, 7, 5, 0.5); border-color: rgba(235, 226, 210, 0.5); }
.b-kit-end-film .brand { display: flex; align-items: center; gap: 1.2em; margin-top: calc(var(--gap) * 0.5); }
.b-kit-end-film .brand .cs-label { color: var(--ink); }
.b-kit-end-film .brand i { display: block; width: calc(var(--label) * 3); height: 1px; background: var(--gold); }
.b-kit-end-film .brand i:first-child { transform-origin: 100% 50%; }
.b-kit-end-film .brand i:last-child { transform-origin: 0 50%; }
.cs-frame[data-shape="tall"] .b-kit-end-film .cs-hero { font-size: var(--title); }
.cs-frame[data-shape="tall"] .b-kit-end-film .btns { flex-direction: column; align-self: stretch; }
.cs-frame[data-shape="tall"] .b-kit-end-film .cs-btn { width: 100%; }
`;
export default function mount(el, p, cx) {
  const links = (p.links || []).slice(0, 3);
  const safe = (h) => (/^\s*(javascript|data|vbscript):/i.test(String(h || '')) ? '#' : String(h || '#'));
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || '');
  const media = !p.src ? '' : isVideo
    ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || 'Background clip')}"></video>`
    : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || '')}">`;
  el.innerHTML = `
    <div class="media">${media}</div>
    <div class="veil"></div>
    <div class="cs-pad cs-center">
      ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
      <h2 class="cs-hero">${cx.spans(p.title, 'cs-w')}</h2>
      ${p.sub ? `<p class="cs-lead">${cx.esc(p.sub)}</p>` : ''}
      ${links.length ? `<div class="btns">${links.map((l, i) => `<a class="cs-btn${i ? ' cs-ghost' : ''}" href="${cx.esc(safe(l.href))}"${/^https?:/i.test(l.href || '') ? ' target="_blank" rel="noopener"' : ''}>${cx.esc(l.label)}</a>`).join('')}</div>` : ''}
      ${p.brand ? `<div class="brand"><i aria-hidden="true"></i><span class="cs-label">${cx.esc(p.brand)}</span><i aria-hidden="true"></i></div>` : ''}
    </div>`;
  const q = (s) => el.querySelector(s), ws = el.querySelectorAll('.cs-w'), t1 = 0.5 + 0.07 * ws.length, m = q('.media > *');
  cx.wa(q('.media'), [{opacity: 0, transform: 'scale(1.06)'}, {opacity: 1, transform: 'scale(1)'}], {duration: 1.6, ease: 'cubic-bezier(.2,.7,.2,1)'});
  cx.wa(q('.veil'), [{opacity: 0.4}, {opacity: 1}], {duration: 1.2, delay: 0.2, ease: 'ease-out'});
  if (q('.cs-kicker')) cx.wa(q('.cs-kicker'), [{opacity: 0, letterSpacing: '0.6em'}, {opacity: 1, letterSpacing: '0.34em'}], {duration: 0.8, delay: 0.3, ease: 'ease-out'});
  cx.wa(ws, [{opacity: 0, filter: 'blur(14px)', transform: 'translateY(0.3em)'}, {opacity: 1, filter: 'blur(0px)', transform: 'none'}], {duration: 0.8, delay: 0.5, stagger: 0.07});
  if (q('.cs-lead')) cx.wa(q('.cs-lead'), [{opacity: 0, transform: 'translateY(16px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: t1 + 0.25});
  cx.wa(el.querySelectorAll('.cs-btn'), [{opacity: 0, transform: 'translateY(22px) scale(0.96)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: t1 + 0.5, stagger: 0.12});
  if (q('.brand')) {
    cx.wa(el.querySelectorAll('.brand i'), [{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: 0.9, delay: t1 + 0.9});
    cx.wa(q('.brand span'), [{opacity: 0, letterSpacing: '0.5em'}, {opacity: 1, letterSpacing: '0.22em'}], {duration: 0.9, delay: t1 + 0.9});
  }
  const text = cx.fromWaapi(el);
  return isVideo ? cx.all(text, cx.fromVideo(m)) : text;
}
