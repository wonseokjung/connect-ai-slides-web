// pro/stat: one number counts up, thin and very large, the unit in gold, the meaning beside it.
export const css = `
.b-pro-stat .pro-body { display: flex; align-items: center; gap: calc(var(--gap) * 1.6); }
.b-pro-stat .sn { flex: none; display: flex; align-items: baseline; font-size: calc(var(--hero) * 1.5); }
.b-pro-stat .sn .pro-num { font-size: 1em; }
.b-pro-stat .sn .u { font-size: 0.42em; font-weight: var(--thin); color: var(--gold2); margin-left: 0.08em; letter-spacing: -0.02em; }
.b-pro-stat .sm { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.55); min-width: 0; max-width: 40%; }
.b-pro-stat .sm i { display: block; width: 100%; height: 1px; background: var(--gold); transform-origin: 0 50%; }
.b-pro-stat .sl { font-size: var(--lead); color: var(--ivory); line-height: 1.28; }
.b-pro-stat .sx { font-size: calc(var(--label) * 1.0); color: var(--dim); letter-spacing: 0.04em; line-height: 1.4; }
.cs-frame[data-shape="tall"] .b-pro-stat .pro-body { flex-direction: column; align-items: flex-start; justify-content: center; gap: var(--gap); }
.cs-frame[data-shape="tall"] .b-pro-stat .sm { max-width: 100%; }
.cs-frame[data-shape="tall"] .b-pro-stat .sn { font-size: calc(var(--hero) * 1.3); }
`;
export default function mount(el, p, cx) {
  const P = cx.pro, info = P.num(p.value);
  const raw = String(p.value == null ? '' : p.value);
  const shown = info ? info.pre + P.fmt(info.n, info.dec, info.comma) : raw;
  const unit = info ? info.suf : '';
  el.innerHTML = `<i class="pro-glow" style="--gx:24%;--gy:50%"></i><div class="pro-wrap">${P.head(p)}<div class="pro-body">
    <div class="sn"><span class="pro-num cs-num">${cx.esc(shown)}</span>${unit ? `<span class="u">${cx.esc(unit)}</span>` : ''}</div>
    <div class="sm"><i aria-hidden="true"></i><p class="sl">${cx.esc(p.label || '')}</p>${p.note ? `<p class="sx">${cx.esc(p.note)}</p>` : ''}</div>
  </div>${P.foot(cx)}</div>`;
  const q = (s) => el.querySelector(s), tl = cx.gsap.timeline({paused: true});
  const t = P.headIn(tl, el);
  tl.fromTo(q('.sn'), {opacity: 0, y: 50}, {opacity: 1, y: 0, duration: 1.1, ease: 'expo.out'}, t);
  if (info) { const n = q('.sn .pro-num'); const o = {v: 0}; tl.to(o, {v: info.n, duration: 1.5, ease: 'power3.out', onUpdate: () => { n.textContent = info.pre + P.fmt(o.v, info.dec, info.comma); }}, t); }
  tl.fromTo(q('.sm i'), {scaleX: 0}, {scaleX: 1, duration: 1.0, ease: 'expo.inOut'}, t + 0.4);
  P.rise(tl, el.querySelectorAll('.sl, .sx'), t + 0.6, {y: 18});
  return P.clip(cx, tl, el);
}
