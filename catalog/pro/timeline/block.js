// pro/timeline: one gold line draws left to right; nodes land, dates and words rise; one moment can be marked.
export const css = `
.b-pro-timeline .pro-body { display: flex; flex-direction: column; justify-content: center; }
.b-pro-timeline .tlw { position: relative; display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); gap: calc(var(--gap) * 0.8); padding-top: calc(var(--gap) * 1.4); }
.b-pro-timeline .ln { position: absolute; left: 0; right: 0; top: 0; height: 1px; background: var(--line); }
.b-pro-timeline .ln i { position: absolute; inset: 0; background: var(--gold); transform-origin: 0 50%; }
.b-pro-timeline .it { position: relative; display: flex; flex-direction: column; gap: calc(var(--gap) * 0.3); min-width: 0; }
.b-pro-timeline .nd { position: absolute; top: calc(var(--gap) * -1.4); left: 0; width: 1.1em; height: 1.1em; margin: -0.55em 0 0 0; border-radius: 50%; border: 1.5px solid var(--gold2); background: var(--bg); font-size: var(--body); }
.b-pro-timeline .it.now .nd { background: var(--gold2); box-shadow: 0 0 0 0.45em color-mix(in srgb, var(--gold) 22%, transparent); }
.b-pro-timeline .w { font-size: var(--label); letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold2); }
.b-pro-timeline .tt { font-size: var(--lead); color: var(--ivory); line-height: 1.2; word-break: keep-all; overflow-wrap: normal; }
.b-pro-timeline .many .tt { font-size: calc(var(--lead) * 0.8); }
.b-pro-timeline .many .w { letter-spacing: 0.1em; white-space: nowrap; }
.b-pro-timeline .it.now .tt { color: var(--ink); }
.b-pro-timeline .tx { font-size: var(--body); color: var(--dim); line-height: 1.38; }
.cs-frame[data-shape="tall"] .b-pro-timeline .tlw { grid-template-columns: 1fr; padding-top: 0; padding-left: calc(var(--gap) * 1.3); gap: calc(var(--gap) * 0.9); }
.cs-frame[data-shape="tall"] .b-pro-timeline .ln { left: 0; top: 0; bottom: 0; width: 1px; height: auto; right: auto; }
.cs-frame[data-shape="tall"] .b-pro-timeline .ln i { transform-origin: 50% 0; }
.cs-frame[data-shape="tall"] .b-pro-timeline .nd { top: 0.35em; left: calc(var(--gap) * -1.3); margin: 0 0 0 -0.55em; }
`;
export default function mount(el, p, cx) {
  const P = cx.pro, items = (p.items || []).slice(0, 6), now = (p.now | 0) - 1;
  el.style.setProperty('--n', items.length || 1);
  el.innerHTML = `<i class="pro-glow" style="--gx:50%;--gy:90%"></i><div class="pro-wrap">${P.head(p)}<div class="pro-body"><div class="tlw${items.length > 4 ? ' many' : ''}"><div class="ln" aria-hidden="true"><i></i></div>${items.map((it, i) => `<div class="it${i === now ? ' now' : ''}"><i class="nd" aria-hidden="true"></i>${it.when ? `<div class="w">${cx.esc(it.when)}</div>` : ''}<div class="tt">${cx.esc(it.title || '')}</div>${it.text ? `<div class="tx">${cx.esc(it.text)}</div>` : ''}</div>`).join('')}</div></div>${P.foot(cx)}</div>`;
  const tl = cx.gsap.timeline({paused: true}), tall = cx.shape === 'tall';
  const t = P.headIn(tl, el), n = items.length, per = p.build ? 1.0 : 0.3;
  const line = el.querySelector('.ln i');
  el.querySelectorAll('.it').forEach((it, i) => {
    const at = t + i * per;
    if (p.build && i > 0) tl.addLabel('step' + i, at - 0.2);
    const frac = n === 1 ? 1 : (i + (i === n - 1 ? 1 : 0.5)) / n;
    tl.to(line, tall ? {scaleY: frac, duration: per, ease: 'none'} : {scaleX: frac, duration: per, ease: 'none'}, at - (i ? per : 0));
    tl.fromTo(it.querySelector('.nd'), {scale: 0}, {scale: 1, duration: 0.5, ease: 'back.out(2.4)'}, at);
    P.rise(tl, it.querySelectorAll('.w, .tt, .tx'), at + 0.08, {y: 16, stagger: 0.06});
  });
  tl.set(line, tall ? {scaleY: 0} : {scaleX: 0}, 0);
  return P.clip(cx, tl, el);
}
