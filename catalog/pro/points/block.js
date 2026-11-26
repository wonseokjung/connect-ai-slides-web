// pro/points: columns under gold index numbers and hairlines; with build, one click per point.
export const css = `
.b-pro-points .pro-body { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); gap: calc(var(--gap) * 1.3); align-content: center; }
.b-pro-points .pt { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.45); min-width: 0; }
.b-pro-points .pt-n { font-size: calc(var(--title) * 0.6); font-weight: var(--thin); color: var(--gold2); line-height: 1; letter-spacing: -0.02em; }
.b-pro-points .pt-l { display: block; height: 1px; background: var(--line); transform-origin: 0 50%; margin: calc(var(--gap) * 0.25) 0 calc(var(--gap) * 0.2); }
.b-pro-points .pt-l::after { content: ""; display: block; width: 22%; height: 100%; background: var(--gold); }
.b-pro-points .pt-t { font-size: var(--lead); color: var(--ink); font-weight: var(--light); line-height: 1.2; }
.b-pro-points .pt-x { font-size: var(--body); color: var(--dim); line-height: 1.42; }
.cs-frame[data-shape="tall"] .b-pro-points .pro-body { grid-template-columns: 1fr; gap: calc(var(--gap) * 0.9); align-content: start; }
.cs-frame[data-shape="tall"] .b-pro-points .pt { gap: calc(var(--gap) * 0.25); }
.cs-frame[data-shape="tall"] .b-pro-points .pt-n { font-size: calc(var(--title) * 0.5); }
`;
export default function mount(el, p, cx) {
  const P = cx.pro;
  const items = (p.items || []).slice(0, 4).map((it) => { if (typeof it !== 'string') return it; const m = /^([^:：]{1,40})[:：]\s*(.+)$/.exec(it); return m ? {title: m[1], text: m[2]} : {title: it}; });
  el.style.setProperty('--n', items.length || 1);
  el.innerHTML = `<i class="pro-glow" style="--gx:90%;--gy:16%"></i><div class="pro-wrap">${P.head(p)}<div class="pro-body">${items.map((it, i) => `<div class="pt"><div class="pt-n cs-num">${String(i + 1).padStart(2, '0')}</div><i class="pt-l" aria-hidden="true"></i><h3 class="pt-t">${cx.esc(it.title || '')}</h3>${it.text ? `<p class="pt-x">${cx.esc(it.text)}</p>` : ''}</div>`).join('')}</div>${P.foot(cx)}</div>`;
  const tl = cx.gsap.timeline({paused: true});
  let t = P.headIn(tl, el);
  el.querySelectorAll('.pt').forEach((pt, i) => {
    const at = p.build ? t + i * 1.0 : t + i * 0.16;
    if (p.build && i > 0) tl.addLabel('step' + i, at);
    tl.fromTo(pt.querySelector('.pt-n'), {opacity: 0, y: 24}, {opacity: 1, y: 0, duration: 0.8, ease: 'expo.out'}, at);
    tl.fromTo(pt.querySelector('.pt-l'), {scaleX: 0}, {scaleX: 1, duration: 0.9, ease: 'expo.inOut'}, at + 0.05);
    P.rise(tl, pt.querySelectorAll('.pt-t, .pt-x'), at + 0.2, {y: 20});
  });
  return P.clip(cx, tl, el);
}
