// pro/agenda: a large heading and the parts of the talk on hairlines; the current one is gold.
export const css = `
.b-pro-agenda .pro-wrap { flex-direction: row; flex-wrap: wrap; }
.b-pro-agenda .pro-body { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.4fr); gap: calc(var(--gap) * 1.6); align-items: center; flex-basis: 100%; }
.b-pro-agenda .pro-foot { flex-basis: 100%; }
.b-pro-agenda .ah { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.45); }
.b-pro-agenda .ak { display: flex; align-items: center; gap: 0.9em; font-size: var(--label); letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold2); }
.b-pro-agenda .ak i { display: block; width: 2.2em; height: 1px; background: var(--gold); transform-origin: 0 50%; }
.b-pro-agenda .at { font-size: var(--title); font-weight: var(--thin); letter-spacing: -0.03em; line-height: 1.04; color: var(--ink); text-wrap: balance; }
.b-pro-agenda ol { display: flex; flex-direction: column; }
.b-pro-agenda li { position: relative; display: grid; grid-template-columns: 2.6em 1fr; align-items: baseline; padding: 0.62em 0; font-size: var(--lead); color: var(--dim); line-height: 1.2; }
.b-pro-agenda.short li { padding: 0.8em 0; }
.b-pro-agenda.many li { padding: 0.42em 0; font-size: calc(var(--lead) * 0.84); }
.b-pro-agenda li .n { font-size: 0.62em; letter-spacing: 0.1em; color: var(--dim); }
.b-pro-agenda li.now { color: var(--ink); }
.b-pro-agenda li.now .n { color: var(--gold2); }
.b-pro-agenda li .rl { position: absolute; left: 0; right: 0; bottom: 0; height: 1px; background: var(--line); transform-origin: 0 50%; }
.b-pro-agenda li.now .rl { background: var(--gold); }
.b-pro-agenda.all li { color: var(--ivory); }
.cs-frame[data-shape="tall"] .b-pro-agenda .pro-body { grid-template-columns: 1fr; align-content: center; gap: var(--gap); }
.cs-frame[data-shape="tall"] .b-pro-agenda li { font-size: var(--body); }
.cs-frame[data-shape="tall"] .b-pro-agenda li .n { font-size: 0.8em; }
`;
export default function mount(el, p, cx) {
  const P = cx.pro, items = (p.items || []).slice(0, 7).map((x) => (typeof x === 'string' ? x : x.title || '')), now = (p.now | 0) - 1;
  el.classList.toggle('short', items.length <= 4); el.classList.toggle('many', items.length > 5); el.classList.toggle('all', now < 0);
  el.innerHTML = `<i class="pro-glow" style="--gx:15%;--gy:50%"></i><div class="pro-wrap"><div class="pro-body"><div class="ah">${p.kicker ? `<div class="ak"><i></i><span>${cx.esc(p.kicker)}</span></div>` : ''}${p.title ? `<h2 class="at">${P.words(p.title)}</h2>` : ''}</div>
    <ol>${items.map((x, i) => `<li class="${i === now ? 'now' : ''}"><span class="n cs-num">${String(i + 1).padStart(2, '0')}</span><span>${cx.esc(x)}</span><i class="rl" aria-hidden="true"></i></li>`).join('')}</ol></div>${P.foot(cx)}</div>`;
  const q = (s) => el.querySelector(s), tl = cx.gsap.timeline({paused: true});
  if (q('.ak')) { tl.fromTo(q('.ak i'), {scaleX: 0}, {scaleX: 1, duration: 0.8, ease: 'expo.out'}, 0); P.rise(tl, q('.ak span'), 0.1, {y: 10}); }
  if (q('.at')) P.wordsIn(tl, q('.at'), 0.15);
  el.querySelectorAll('li').forEach((li, i) => { const at = 0.45 + i * 0.12; tl.fromTo(li.querySelector('.rl'), {scaleX: 0}, {scaleX: 1, duration: 0.8, ease: 'expo.inOut'}, at); P.rise(tl, li.querySelectorAll('span'), at + 0.1, {y: 14, stagger: 0.04}); });
  if (q('.pro-foot')) tl.fromTo(q('.pro-foot'), {opacity: 0}, {opacity: 1, duration: 0.8}, 0.6);
  return P.clip(cx, tl, el);
}
