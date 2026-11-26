// pro/photo: the picture fills the slide and settles from a gentle zoom; a soft shade on the free side carries the words.
export const css = `
.b-pro-photo .ph { position: absolute; inset: 0; z-index: 0; overflow: hidden; }
.b-pro-photo .ph > img, .b-pro-photo .ph > video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-pro-photo .sh { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.b-pro-photo[data-side="left"] .sh { background: linear-gradient(90deg, color-mix(in srgb, var(--bg) 94%, transparent) 0%, color-mix(in srgb, var(--bg) 78%, transparent) 30%, color-mix(in srgb, var(--bg) 30%, transparent) 50%, transparent 66%); }
.b-pro-photo[data-side="right"] .sh { background: linear-gradient(270deg, color-mix(in srgb, var(--bg) 94%, transparent) 0%, color-mix(in srgb, var(--bg) 78%, transparent) 30%, color-mix(in srgb, var(--bg) 30%, transparent) 50%, transparent 66%); }
.b-pro-photo[data-side="bottom"] .sh { background: linear-gradient(0deg, color-mix(in srgb, var(--bg) 88%, transparent) 0%, color-mix(in srgb, var(--bg) 40%, transparent) 34%, transparent 55%); }
.b-pro-photo .pro-body { display: flex; flex-direction: column; justify-content: flex-end; gap: calc(var(--gap) * 0.55); padding-bottom: calc(var(--gap) * 0.4); }
.b-pro-photo[data-side="left"] .pro-body, .b-pro-photo[data-side="right"] .pro-body { justify-content: center; max-width: 44%; }
.b-pro-photo[data-side="right"] .pro-body { margin-left: auto; }
.b-pro-photo .pk { display: flex; align-items: center; gap: 0.9em; font-size: var(--label); letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold2); }
.b-pro-photo .pk i { display: block; width: 2.2em; height: 1px; background: var(--gold); transform-origin: 0 50%; }
.b-pro-photo .pt { font-size: calc(var(--title) * 0.92); font-weight: var(--thin); letter-spacing: -0.03em; line-height: 1.06; color: var(--ink); text-wrap: balance; }
.b-pro-photo .px { font-size: var(--lead); color: var(--ivory); line-height: 1.3; }
.cs-frame[data-shape="tall"] .b-pro-photo .pro-body { max-width: 100% !important; margin-left: 0 !important; justify-content: flex-end !important; }
.cs-frame[data-shape="tall"] .b-pro-photo .sh { background: linear-gradient(0deg, color-mix(in srgb, var(--bg) 90%, transparent) 0%, color-mix(in srgb, var(--bg) 40%, transparent) 40%, transparent 62%) !important; }
`;
export default function mount(el, p, cx) {
  const P = cx.pro;
  const side = ['left', 'right', 'bottom'].includes(p.side) ? p.side : P.freeSide(p.face, 'left');
  el.dataset.side = side;
  const words = p.title || p.text || p.kicker;
  el.innerHTML = `<div class="ph">${P.media(p, 'pm', p.title)}</div>${words ? '<i class="sh" aria-hidden="true"></i>' : ''}<div class="pro-wrap"><div class="pro-body">
    ${p.kicker ? `<div class="pk"><i></i><span>${cx.esc(p.kicker)}</span></div>` : ''}${p.title ? `<h2 class="pt">${P.words(p.title, p.gold)}</h2>` : ''}${p.text ? `<p class="px">${cx.esc(p.text)}</p>` : ''}
  </div>${P.foot(cx)}</div>`;
  const q = (s) => el.querySelector(s), m = q('.pm'), tl = cx.gsap.timeline({paused: true});
  if (m) { if (p.face) cx.face(m, p.face); if (p.body) cx.face(m, p.body, 'body'); }
  tl.fromTo(q('.ph'), {opacity: 0}, {opacity: 1, duration: 0.9, ease: 'power1.out'}, 0);
  if (m) tl.fromTo(m, {scale: 1.14}, {scale: 1.0, duration: 2.6, ease: 'power2.out'}, 0);
  if (q('.sh')) tl.fromTo(q('.sh'), {opacity: 0}, {opacity: 1, duration: 1.0}, 0.3);
  if (q('.pk')) { tl.fromTo(q('.pk i'), {scaleX: 0}, {scaleX: 1, duration: 0.8, ease: 'expo.out'}, 0.6); P.rise(tl, q('.pk span'), 0.7, {y: 10}); }
  if (q('.pt')) P.wordsIn(tl, q('.pt'), 0.75);
  P.rise(tl, q('.px'), 1.3, {y: 16});
  if (q('.pro-foot')) tl.fromTo(q('.pro-foot'), {opacity: 0}, {opacity: 1, duration: 0.8}, 1.0);
  return P.clip(cx, tl, el);
}
