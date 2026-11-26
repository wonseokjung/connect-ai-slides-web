// pro/stats: two to four numbers count up in a row, each over a hairline and its meaning.
export const css = `
.b-pro-stats .pro-body { display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 1.1); }
.b-pro-stats .row { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); gap: calc(var(--gap) * 1.2); }
.b-pro-stats .it { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.45); min-width: 0; }
.b-pro-stats .v { display: flex; align-items: baseline; font-size: calc(var(--hero) * 0.86); }
.b-pro-stats .v .u { font-size: 0.42em; color: var(--gold2); font-weight: var(--thin); margin-left: 0.06em; }
.b-pro-stats .it i { display: block; height: 1px; background: var(--line); transform-origin: 0 50%; }
.b-pro-stats .it i::after { content: ""; display: block; width: 30%; height: 100%; background: var(--gold); }
.b-pro-stats .l { font-size: var(--body); color: var(--ivory); line-height: 1.35; }
.b-pro-stats .nt { font-size: calc(var(--body) * 0.8); color: var(--dim); letter-spacing: 0.04em; }
.cs-frame[data-shape="tall"] .b-pro-stats .row { grid-template-columns: 1fr; gap: calc(var(--gap) * 0.9); }
.cs-frame[data-shape="tall"] .b-pro-stats .v { font-size: calc(var(--hero) * 0.8); }
`;
export default function mount(el, p, cx) {
  const P = cx.pro, items = (p.items || []).slice(0, 4);
  el.style.setProperty('--n', items.length || 1);
  const parts = items.map((it) => { const info = P.num(it.value); return {info, shown: info ? info.pre + P.fmt(info.n, info.dec, info.comma) : String(it.value), unit: info ? info.suf : '', label: it.label}; });
  el.innerHTML = `<i class="pro-glow" style="--gx:50%;--gy:100%"></i><div class="pro-wrap">${P.head(p)}<div class="pro-body"><div class="row">${parts.map((x) => `<div class="it"><div class="v"><span class="pro-num cs-num">${cx.esc(x.shown)}</span>${x.unit ? `<span class="u">${cx.esc(x.unit)}</span>` : ''}</div><i aria-hidden="true"></i><p class="l">${cx.esc(x.label || '')}</p></div>`).join('')}</div>${p.note ? `<p class="nt">${cx.esc(p.note)}</p>` : ''}</div>${P.foot(cx)}</div>`;
  const tl = cx.gsap.timeline({paused: true});
  const t = P.headIn(tl, el);
  el.querySelectorAll('.it').forEach((it, i) => {
    const at = t + i * 0.18, x = parts[i];
    tl.fromTo(it.querySelector('.v'), {opacity: 0, y: 40}, {opacity: 1, y: 0, duration: 1.0, ease: 'expo.out'}, at);
    if (x.info) { const n = it.querySelector('.pro-num'), o = {v: 0}; tl.to(o, {v: x.info.n, duration: 1.4, ease: 'power3.out', onUpdate: () => { n.textContent = x.info.pre + P.fmt(o.v, x.info.dec, x.info.comma); }}, at); }
    tl.fromTo(it.querySelector('i'), {scaleX: 0}, {scaleX: 1, duration: 0.9, ease: 'expo.inOut'}, at + 0.25);
    P.rise(tl, it.querySelector('.l'), at + 0.4, {y: 14});
  });
  P.rise(tl, el.querySelector('.nt'), t + 1.2, {y: 10});
  return P.clip(cx, tl, el);
}
