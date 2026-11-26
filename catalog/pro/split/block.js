// pro/split: half photo (wiped in from the edge), half words on hairlines.
export const css = `
.b-pro-split .sp { position: absolute; top: 0; bottom: 0; width: 50%; z-index: 0; overflow: hidden; }
.b-pro-split[data-side="left"] .sp { left: 0; } .b-pro-split[data-side="right"] .sp { right: 0; }
.b-pro-split .sp > img, .b-pro-split .sp > video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-pro-split .pro-wrap { left: 50%; } .b-pro-split[data-side="right"] .pro-wrap { left: 0; right: 50%; }
.b-pro-split .pro-wrap { padding-left: calc(var(--pad) * 0.8); padding-right: calc(var(--pad) * 0.8); }
.b-pro-split .pro-body { display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.8); }
.b-pro-split .sk { display: flex; align-items: center; gap: 0.9em; font-size: var(--label); letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold2); }
.b-pro-split .sk i { display: block; width: 2.2em; height: 1px; background: var(--gold); transform-origin: 0 50%; }
.b-pro-split .stt { font-size: calc(var(--title) * 0.8); font-weight: var(--thin); letter-spacing: -0.028em; line-height: 1.08; color: var(--ink); text-wrap: balance; }
.b-pro-split .sx { font-size: var(--lead); color: var(--ivory); line-height: 1.32; }
.b-pro-split ul { display: flex; flex-direction: column; }
.b-pro-split li { position: relative; display: grid; grid-template-columns: 2.4em 1fr; column-gap: 0.6em; padding: 0.7em 0; font-size: var(--body); }
.b-pro-split li .rl { position: absolute; left: 0; right: 0; top: 0; height: 1px; background: var(--line); transform-origin: 0 50%; }
.b-pro-split li .n { color: var(--gold2); font-size: var(--body); }
.b-pro-split li .tt { font-size: var(--lead); color: var(--ink); line-height: 1.2; }
.b-pro-split li .tx { grid-column: 2; color: var(--dim); line-height: 1.38; margin-top: 0.2em; }
.cs-frame[data-shape="tall"] .b-pro-split .sp { width: 100%; height: 42%; bottom: auto; }
.cs-frame[data-shape="tall"] .b-pro-split .pro-wrap { left: 0; right: 0; top: 42%; padding-top: calc(var(--pad) * 0.5); }
`;
export default function mount(el, p, cx) {
  const P = cx.pro;
  let side = ['left', 'right'].includes(p.side) ? p.side : 'left';
  el.dataset.side = side;
  const items = (p.items || []).slice(0, 4).map((it) => { if (typeof it !== 'string') return it; const m = /^([^:：]{1,40})[:：]\s*(.+)$/.exec(it); return m ? {title: m[1], text: m[2]} : {title: it}; });
  el.innerHTML = `<div class="sp">${P.media(p, 'sm', p.title)}</div><div class="pro-wrap"><div class="pro-body">
    ${p.kicker ? `<div class="sk"><i></i><span>${cx.esc(p.kicker)}</span></div>` : ''}<h2 class="stt">${P.words(p.title, p.gold)}</h2>
    ${items.length ? `<ul>${items.map((it, i) => `<li><i class="rl" aria-hidden="true"></i><span class="n cs-num">${String(i + 1).padStart(2, '0')}</span><span class="tt">${cx.esc(it.title || '')}</span>${it.text ? `<span class="tx">${cx.esc(it.text)}</span>` : ''}</li>`).join('')}</ul>` : ''}
    ${p.text ? `<p class="sx">${cx.esc(p.text)}</p>` : ''}
  </div>${P.foot(cx)}</div>`;
  const q = (s) => el.querySelector(s), m = q('.sm'), tl = cx.gsap.timeline({paused: true}), tall = cx.shape === 'tall';
  if (m) { if (p.face) cx.face(m, p.face); if (p.body) cx.face(m, p.body, 'body'); }
  const from = tall ? 'inset(0 0 100% 0)' : side === 'left' ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)';
  tl.fromTo(q('.sp'), {clipPath: from}, {clipPath: 'inset(0 0% 0 0%)', duration: 1.2, ease: 'expo.inOut'}, 0);
  if (m) tl.fromTo(m, {scale: 1.15}, {scale: 1, duration: 2.2, ease: 'power2.out'}, 0);
  if (q('.sk')) { tl.fromTo(q('.sk i'), {scaleX: 0}, {scaleX: 1, duration: 0.8, ease: 'expo.out'}, 0.5); P.rise(tl, q('.sk span'), 0.6, {y: 10}); }
  P.wordsIn(tl, q('.stt'), 0.65);
  el.querySelectorAll('li').forEach((li, i) => { const at = 1.1 + i * 0.14; tl.fromTo(li.querySelector('.rl'), {scaleX: 0}, {scaleX: 1, duration: 0.8, ease: 'expo.inOut'}, at); P.rise(tl, li.querySelectorAll('.n, .tt, .tx'), at + 0.1, {y: 14, stagger: 0.04}); });
  P.rise(tl, q('.sx'), 1.1, {y: 14});
  if (q('.pro-foot')) tl.fromTo(q('.pro-foot'), {opacity: 0}, {opacity: 1, duration: 0.8}, 0.9);
  return P.clip(cx, tl, el);
}
