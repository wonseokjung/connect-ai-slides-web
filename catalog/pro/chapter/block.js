// pro/chapter: a large thin gold number, a hairline that grows, the title rises beside it.
export const css = `
.b-pro-chapter .pro-body { display: flex; align-items: center; gap: calc(var(--gap) * 1.6); }
.b-pro-chapter .ch-n { flex: none; font-size: calc(var(--hero) * 1.85); font-weight: var(--thin); letter-spacing: -0.05em; line-height: 0.8; color: var(--gold2); font-variant-numeric: lining-nums; }
.b-pro-chapter .ch-bar { flex: none; width: 1px; align-self: stretch; margin: 12% 0; background: var(--gold); transform-origin: 50% 0%; }
.b-pro-chapter .ch-txt { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.55); min-width: 0; }
.b-pro-chapter .ch-k { font-size: var(--label); letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold2); }
.b-pro-chapter .ch-t { font-size: var(--title); font-weight: var(--thin); letter-spacing: -0.03em; line-height: 1.04; color: var(--ink); text-wrap: balance; }
.b-pro-chapter .ch-s { font-size: var(--lead); color: var(--dim); line-height: 1.3; }
.cs-frame[data-shape="tall"] .b-pro-chapter .pro-body { flex-direction: column; align-items: flex-start; justify-content: center; gap: var(--gap); }
.cs-frame[data-shape="tall"] .b-pro-chapter .ch-bar { width: 30%; height: 1px; align-self: auto; margin: 0; transform-origin: 0 50%; }
.cs-frame[data-shape="tall"] .b-pro-chapter .ch-n { font-size: calc(var(--hero) * 1.6); }
`;
export default function mount(el, p, cx) {
  const P = cx.pro;
  el.innerHTML = `<i class="pro-glow" style="--gx:18%;--gy:50%"></i><div class="pro-wrap"><div class="pro-body">
    ${p.number != null && p.number !== '' ? `<div class="ch-n cs-num">${cx.esc(p.number)}</div><i class="ch-bar" aria-hidden="true"></i>` : ''}
    <div class="ch-txt">${p.kicker ? `<div class="ch-k">${cx.esc(p.kicker)}</div>` : ''}<h2 class="ch-t">${P.words(p.title, p.gold)}</h2>${p.sub ? `<p class="ch-s">${cx.esc(p.sub)}</p>` : ''}</div>
  </div>${P.foot(cx)}</div>`;
  const q = (s) => el.querySelector(s), tl = cx.gsap.timeline({paused: true});
  if (q('.ch-n')) tl.fromTo(q('.ch-n'), {opacity: 0, y: 60}, {opacity: 1, y: 0, duration: 1.3, ease: 'expo.out'}, 0);
  if (q('.ch-bar')) tl.fromTo(q('.ch-bar'), cx.shape === 'tall' ? {scaleX: 0} : {scaleY: 0}, cx.shape === 'tall' ? {scaleX: 1, duration: 1.0, ease: 'expo.inOut'} : {scaleY: 1, duration: 1.0, ease: 'expo.inOut'}, 0.2);
  P.rise(tl, q('.ch-k'), 0.45, {y: 14});
  P.wordsIn(tl, q('.ch-t'), 0.55);
  P.rise(tl, q('.ch-s'), 1.0);
  if (q('.pro-foot')) tl.fromTo(q('.pro-foot'), {opacity: 0}, {opacity: 1, duration: 0.8}, 0.8);
  return P.clip(cx, tl, el);
}
