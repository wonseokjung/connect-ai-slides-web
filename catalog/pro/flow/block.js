// pro/flow: steps in a row joined by gold arrows that draw; a signal travels the whole way at the end.
export const css = `
.b-pro-flow .pro-body { display: flex; flex-direction: column; justify-content: center; gap: var(--gap); }
.b-pro-flow .row { position: relative; display: flex; align-items: stretch; }
.b-pro-flow .st { flex: 1 1 0; min-width: 0; min-height: 34cqh; display: flex; flex-direction: column; justify-content: flex-end; gap: calc(var(--gap) * 0.35); padding: calc(var(--gap) * 0.8) calc(var(--gap) * 0.7); border: 1px solid var(--line); border-radius: calc(var(--radius) * 0.6); background: var(--card); }
.b-pro-flow .st.last { border-color: color-mix(in srgb, var(--gold) 60%, transparent); }
.b-pro-flow .sn { font-size: calc(var(--title) * 0.5); font-weight: var(--thin); color: var(--gold2); line-height: 1; margin-bottom: auto; }
.b-pro-flow .stt { font-size: var(--lead); color: var(--ink); line-height: 1.15; font-weight: var(--light); }
.b-pro-flow .stx { font-size: var(--body); color: var(--dim); line-height: 1.38; }
.b-pro-flow .ar { flex: none; align-self: center; width: calc(var(--gap) * 1.3); height: 1em; font-size: var(--lead); position: relative; }
.b-pro-flow .ar i { position: absolute; left: 12%; right: 12%; top: 50%; height: 1.5px; background: var(--gold); transform-origin: 0 50%; }
.b-pro-flow .ar b { position: absolute; right: 12%; top: 50%; width: 0.36em; height: 0.36em; border-top: 1.5px solid var(--gold); border-right: 1.5px solid var(--gold); transform: translate(0, -50%) rotate(45deg); }
.b-pro-flow .sig { position: absolute; top: 0; left: 0; width: 0.5em; height: 0.5em; margin: -0.25em 0 0 -0.25em; border-radius: 50%; background: var(--gold2); font-size: var(--lead); box-shadow: 0 0 0.8em color-mix(in srgb, var(--gold2) 70%, transparent); }
.b-pro-flow .nt { font-size: calc(var(--body) * 0.8); color: var(--dim); letter-spacing: 0.04em; }
.cs-frame[data-shape="tall"] .b-pro-flow .row { flex-direction: column; }
.cs-frame[data-shape="tall"] .b-pro-flow .ar { width: 1em; height: calc(var(--gap) * 1.1); align-self: flex-start; margin-left: 1.2em; }
.cs-frame[data-shape="tall"] .b-pro-flow .ar i { left: 50%; right: auto; top: 10%; bottom: 10%; width: 1.5px; height: auto; transform-origin: 50% 0; }
.cs-frame[data-shape="tall"] .b-pro-flow .ar b { right: auto; left: 50%; top: auto; bottom: 10%; transform: translate(-50%, 0) rotate(135deg); }
.cs-frame[data-shape="tall"] .b-pro-flow .sn { font-size: var(--lead); margin-bottom: 0; }
.cs-frame[data-shape="tall"] .b-pro-flow .st { flex: none; min-height: 0; padding: calc(var(--gap) * 0.5) calc(var(--gap) * 0.6); }
.cs-frame[data-shape="tall"] .b-pro-flow .sig { display: none; }
`;
export default function mount(el, p, cx) {
  const P = cx.pro;
  const steps = (p.steps || p.items || []).slice(0, 5).map((it) => { if (typeof it !== 'string') return it; const m = /^([^:：]{1,40})[:：]\s*(.+)$/.exec(it); return m ? {title: m[1], text: m[2]} : {title: it}; });
  const k = steps.length;
  el.innerHTML = `<i class="pro-glow" style="--gx:85%;--gy:70%"></i><div class="pro-wrap">${P.head(p)}<div class="pro-body"><div class="row">${steps.map((s, i) => `${i ? '<div class="ar" aria-hidden="true"><i></i><b></b></div>' : ''}<div class="st${i === k - 1 ? ' last' : ''}"><div class="sn cs-num">${String(i + 1).padStart(2, '0')}</div><h3 class="stt">${cx.esc(s.title || '')}</h3>${s.text ? `<p class="stx">${cx.esc(s.text)}</p>` : ''}</div>`).join('')}<i class="sig" aria-hidden="true"></i></div>${p.note ? `<p class="nt">${cx.esc(p.note)}</p>` : ''}</div>${P.foot(cx)}</div>`;
  const tl = cx.gsap.timeline({paused: true});
  const t = P.headIn(tl, el), tall = cx.shape === 'tall';
  const sts = el.querySelectorAll('.st'), ars = el.querySelectorAll('.ar');
  const gap = p.build ? 1.0 : 0.32;
  sts.forEach((st, i) => {
    const at = t + i * gap;
    if (p.build && i > 0) tl.addLabel('step' + i, at - 0.35);
    if (i > 0) { const a = ars[i - 1]; tl.fromTo(a.querySelector('i'), tall ? {scaleY: 0} : {scaleX: 0}, tall ? {scaleY: 1, duration: 0.45, ease: 'power2.inOut'} : {scaleX: 1, duration: 0.45, ease: 'power2.inOut'}, at - 0.3); tl.fromTo(a.querySelector('b'), {opacity: 0}, {opacity: 1, duration: 0.2}, at - 0.05); }
    tl.fromTo(st, {opacity: 0, y: 26}, {opacity: 1, y: 0, duration: 0.8, ease: 'expo.out'}, at);
  });
  const sig = el.querySelector('.sig'), end = t + (k - 1) * gap + 0.8;
  if (!tall && k > 1) {
    const row = el.querySelector('.row'), rr = row.getBoundingClientRect(), sc = rr.width / (row.offsetWidth || 1) || 1;
    const xs = [...sts].map((s) => { const r = s.getBoundingClientRect(); return [(r.left - rr.left) / sc, (r.left - rr.left + r.width) / sc]; });
    const y = row.offsetHeight / 2;
    tl.set(sig, {x: xs[0][0], y, opacity: 0}, 0);
    tl.to(sig, {opacity: 1, duration: 0.2}, end);
    tl.to(sig, {x: xs[k - 1][1], duration: 0.5 * k, ease: 'power1.inOut'}, end);
    tl.to(sig, {opacity: 0, duration: 0.25}, end + 0.5 * k - 0.15);
    tl.fromTo(sts[k - 1], {backgroundColor: 'var(--card)'}, {backgroundColor: 'color-mix(in srgb, var(--gold) 14%, transparent)', duration: 0.5}, end + 0.5 * k - 0.2);
  } else tl.set(sig, {opacity: 0}, 0);
  P.rise(tl, el.querySelector('.nt'), end, {y: 10});
  return P.clip(cx, tl, el);
}
