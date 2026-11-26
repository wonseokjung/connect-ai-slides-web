// pro/equation: a formula set large, terms arrive one by one; cases get a brace that draws; symbols explained under it.
export const css = `
.b-pro-equation .pro-body { display: flex; flex-direction: column; justify-content: center; align-items: center; gap: calc(var(--gap) * 1.5); }
.b-pro-equation .eq { justify-content: center; font-size: calc(var(--title) * 1.3); font-weight: var(--thin); color: var(--ink); line-height: 1.2; letter-spacing: 0; display: flex; flex-wrap: wrap; align-items: baseline; gap: 0 0.28em; }
.b-pro-equation .eq.long { font-size: calc(var(--title) * 0.9); }
.b-pro-equation .eq .op { color: var(--gold2); }
.b-pro-equation .cs { display: flex; align-items: center; gap: 0.35em; font-size: calc(var(--title) * 1.0); font-weight: var(--thin); color: var(--ink); }
.b-pro-equation .cs .lhs { white-space: nowrap; }
.b-pro-equation .cs svg { flex: none; width: 0.42em; align-self: stretch; overflow: visible; }
.b-pro-equation .cs path { fill: none; stroke: var(--gold2); stroke-width: 1.6; vector-effect: non-scaling-stroke; }
.b-pro-equation .rows { display: grid; grid-template-columns: auto auto; column-gap: 0.9em; row-gap: 0.2em; align-items: baseline; }
.b-pro-equation .rows .v { color: var(--gold2); text-align: right; }
.b-pro-equation .rows .w { font-size: 0.78em; color: var(--ivory); white-space: nowrap; }
.b-pro-equation .rows .w small { font-size: 0.66em; color: var(--dim); margin-right: 0.5em; letter-spacing: 0.08em; }
.b-pro-equation .tm { display: flex; flex-wrap: wrap; justify-content: center; gap: calc(var(--gap) * 0.6) calc(var(--gap) * 1.4); }
.b-pro-equation .t { display: flex; flex-direction: column; gap: 0.3em; padding-top: calc(var(--gap) * 0.45); border-top: 1px solid var(--line); min-width: 8em; font-size: var(--body); }
.b-pro-equation .t .s { font-size: var(--lead); color: var(--gold2); }
.b-pro-equation .t .x { color: var(--ivory); font-size: var(--lead); }
.b-pro-equation .nt { text-align: center; font-size: calc(var(--body) * 0.8); color: var(--dim); letter-spacing: 0.04em; }
.cs-frame[data-shape="tall"] .b-pro-equation .eq { font-size: calc(var(--title) * 0.72); }
.cs-frame[data-shape="tall"] .b-pro-equation .cs { font-size: calc(var(--title) * 0.62); }
.cs-frame[data-shape="tall"] .b-pro-equation .rows .w small { font-size: 0.9em; }
.cs-frame[data-shape="tall"] .b-pro-equation .rows .w { white-space: normal; }
`;
export default function mount(el, p, cx) {
  const P = cx.pro;
  const toks = String(p.eq || '').trim().split(/\s+/).filter(Boolean);
  const cases = (p.cases || []).slice(0, 3);
  const isOp = (s) => /^([=+\-·×÷<>≤≥→]|<=|>=|->|\*|≦|≧)$/.test(s);
  const long = String(p.eq || '').length > 22;
  const eqHtml = toks.length ? `<div class="eq${long ? ' long' : ''}">${toks.map((s) => `<span class="tok${isOp(s) ? ' op' : ''}">${P.math(s)}</span>`).join('')}</div>` : '';
  const csHtml = cases.length ? `<div class="cs">${p.lhs ? `<span class="lhs">${P.math(p.lhs)} <span class="pro-gold">=</span></span>` : ''}<svg viewBox="0 0 10 100" preserveAspectRatio="none" aria-hidden="true"><path d="M9 2 C4 2 5 10 5 20 L5 40 C5 47 3 50 1 50 C3 50 5 53 5 60 L5 80 C5 90 4 98 9 98"/></svg><div class="rows">${cases.map((c) => `<span class="v">${P.math(c.value)}</span><span class="w"><small>${/[가-힣]/.test(c.when || '') ? '' : 'if'}</small>${P.math(c.when)}</span>`).join('')}</div></div>` : '';
  const terms = (p.terms || []).slice(0, 4);
  el.innerHTML = `<i class="pro-glow" style="--gx:50%;--gy:45%"></i><div class="pro-wrap">${P.head(p)}<div class="pro-body">${eqHtml}${csHtml}
    ${terms.length ? `<div class="tm">${terms.map((t) => `<div class="t"><span class="s">${P.math(t.sym)}</span><span class="x">${/[가-힣]/.test(t.text || '') ? cx.esc(t.text || '') : P.math(t.text || '')}</span></div>`).join('')}</div>` : ''}
    ${p.note ? `<p class="nt">${cx.esc(p.note)}</p>` : ''}</div>${P.foot(cx)}</div>`;
  el.querySelectorAll('.rows .w small').forEach((s) => { if (!s.textContent) s.remove(); });
  const tl = cx.gsap.timeline({paused: true});
  let t = P.headIn(tl, el);
  const tk = el.querySelectorAll('.tok');
  if (tk.length) { tl.fromTo(tk, {opacity: 0, y: 40}, {opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: Math.min(0.14, 1.1 / tk.length)}, t); t += Math.min(0.14, 1.1 / tk.length) * tk.length + 0.3; }
  if (cases.length) {
    P.rise(tl, el.querySelector('.lhs'), t, {y: 20});
    tl.fromTo(el.querySelector('.cs path'), {opacity: 0, scaleY: 0.2, transformOrigin: '50% 50%'}, {opacity: 1, scaleY: 1, duration: 0.8, ease: 'expo.out'}, t + 0.15);
    el.querySelectorAll('.rows').forEach((r) => { const kids = r.children; for (let i = 0; i < kids.length; i += 2) P.rise(tl, [kids[i], kids[i + 1]], t + 0.35 + (i / 2) * 0.3, {y: 22, stagger: 0.06}); });
    t += 0.35 + cases.length * 0.3 + 0.3;
  }
  el.querySelectorAll('.t').forEach((x, i) => P.rise(tl, x, t + i * 0.12, {y: 18}));
  P.rise(tl, el.querySelector('.nt'), t + 0.4, {y: 10});
  return P.clip(cx, tl, el);
}
