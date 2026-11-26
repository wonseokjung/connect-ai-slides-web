// pro/ring: a thin gold ring draws to the share while the percentage counts inside.
export const css = `
.b-pro-ring .pro-body { display: flex; align-items: center; gap: calc(var(--gap) * 1.8); }
.b-pro-ring .rg { position: relative; flex: none; height: min(100%, 34cqw); aspect-ratio: 1; }
.b-pro-ring svg { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
.b-pro-ring .tr { fill: none; stroke: var(--line); stroke-width: 1.2; }
.b-pro-ring .ac { fill: none; stroke: var(--gold2); stroke-width: 2.4; stroke-linecap: round; }
.b-pro-ring .in { position: absolute; inset: 0; display: grid; place-items: center; }
.b-pro-ring .pc { display: flex; align-items: baseline; font-size: calc(var(--hero) * 0.92); }
.b-pro-ring .pc .u { font-size: 0.4em; color: var(--gold2); font-weight: var(--thin); margin-left: 0.04em; }
.b-pro-ring .sm { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.55); max-width: 42%; }
.b-pro-ring .sm i { display: block; width: 4em; height: 1px; background: var(--gold); transform-origin: 0 50%; font-size: var(--lead); }
.b-pro-ring .sl { font-size: var(--lead); color: var(--ivory); line-height: 1.3; }
.b-pro-ring .sx { font-size: var(--label); color: var(--dim); letter-spacing: 0.04em; line-height: 1.4; }
.cs-frame[data-shape="tall"] .b-pro-ring .pro-body { flex-direction: column; align-items: flex-start; justify-content: center; }
.cs-frame[data-shape="tall"] .b-pro-ring .rg { height: auto; width: 70%; }
.cs-frame[data-shape="tall"] .b-pro-ring .sm { max-width: 100%; }
.cs-frame[data-shape="tall"] .b-pro-ring .pc { font-size: calc(var(--hero) * 0.8); }
`;
export default function mount(el, p, cx) {
  const P = cx.pro, v = Math.max(0, Math.min(100, Number(String(p.value).replace('%', '')) || 0)), dec = (String(p.value).split('.')[1] || '').replace('%', '').length;
  el.innerHTML = `<i class="pro-glow" style="--gx:26%;--gy:50%"></i><div class="pro-wrap">${P.head(p)}<div class="pro-body">
    <div class="rg"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="tr" cx="50" cy="50" r="46"/><circle class="ac" cx="50" cy="50" r="46" pathLength="100"/></svg><div class="in"><div class="pc"><span class="pro-num cs-num n">${P.fmt(v, dec)}</span><span class="u">%</span></div></div></div>
    <div class="sm"><i aria-hidden="true"></i><p class="sl">${cx.esc(p.label || '')}</p>${p.note ? `<p class="sx">${cx.esc(p.note)}</p>` : ''}</div>
  </div>${P.foot(cx)}</div>`;
  const q = (s) => el.querySelector(s), tl = cx.gsap.timeline({paused: true});
  const t = P.headIn(tl, el);
  tl.fromTo(q('.tr'), {opacity: 0}, {opacity: 1, duration: 0.6}, t - 0.2);
  tl.fromTo(q('.ac'), {strokeDasharray: '0 100'}, {strokeDasharray: v + ' 100', duration: 1.6, ease: 'expo.inOut'}, t);
  const n = q('.n'), o = {v: 0}; tl.to(o, {v, duration: 1.6, ease: 'expo.inOut', onUpdate: () => { n.textContent = P.fmt(o.v, dec); }}, t);
  tl.fromTo(q('.pc'), {opacity: 0, scale: 0.92}, {opacity: 1, scale: 1, duration: 0.9, ease: 'expo.out'}, t);
  tl.fromTo(q('.sm i'), {scaleX: 0}, {scaleX: 1, duration: 0.9, ease: 'expo.inOut'}, t + 0.5);
  P.rise(tl, el.querySelectorAll('.sl, .sx'), t + 0.7, {y: 16});
  return P.clip(cx, tl, el);
}
