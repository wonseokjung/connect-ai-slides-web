// vis/equation: a formula that assembles in depth. Every term flies in from far away and out of focus into its place,
// a band of light passes over the finished formula, a cases brace draws and each case lights in turn, and the
// symbols are tied to their meaning by lines that draw themselves.
export const css = `
.b-vis-equation .pro-body { position: relative; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: calc(var(--gap) * 1.3); perspective: 1400px; }
.b-vis-equation .eq-stage { position: relative; transform-style: preserve-3d; }
.b-vis-equation .eq { display: flex; flex-wrap: wrap; justify-content: center; align-items: baseline; gap: 0 0.3em; font-size: calc(var(--title) * 1.35); font-weight: var(--thin); color: var(--ink); line-height: 1.15; transform-style: preserve-3d; }
.b-vis-equation .eq.long { font-size: calc(var(--title) * 0.95); }
.b-vis-equation .tok { display: inline-block; will-change: transform, filter, opacity; }
.b-vis-equation .tok.op { color: var(--gold2); }
.b-vis-equation .cs { display: flex; align-items: center; gap: 0.35em; font-size: calc(var(--title) * 0.86); font-weight: var(--thin); color: var(--ink); transform-style: preserve-3d; }
.b-vis-equation .cs svg { flex: none; width: 0.45em; align-self: stretch; overflow: visible; }
.b-vis-equation .cs path { fill: none; stroke: var(--gold2); stroke-width: 3; }
.b-vis-equation .rows { display: grid; grid-template-columns: auto auto; column-gap: 0.8em; row-gap: 0.12em; align-items: baseline; }
.b-vis-equation .rw { display: contents; }
.b-vis-equation .rows .v { color: var(--gold2); text-align: right; }
.b-vis-equation .rows .w { font-size: 0.8em; color: var(--ivory); white-space: nowrap; position: relative; }
.b-vis-equation .rows .w small { font-size: 0.6em; color: var(--dim); margin-right: 0.5em; letter-spacing: 0.08em; }
.b-vis-equation .rows .w .lit { position: absolute; left: -0.4em; right: -0.4em; top: 0.05em; bottom: 0.05em; border-radius: 0.2em; background: linear-gradient(90deg, color-mix(in srgb, var(--gold) 28%, transparent), transparent); z-index: -1; opacity: 0; }
.b-vis-equation .scan { position: absolute; top: -12%; bottom: -12%; width: 26%; left: 0; pointer-events: none; background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--gold2) 30%, transparent), transparent); mix-blend-mode: screen; opacity: 0; filter: blur(6px); }
.look-white .b-vis-equation .scan, .look-ivory .b-vis-equation .scan, .look-paper .b-vis-equation .scan { mix-blend-mode: multiply; background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--gold) 22%, transparent), transparent); }
.b-vis-equation .tm { display: flex; flex-wrap: wrap; justify-content: center; gap: calc(var(--gap) * 0.6) calc(var(--gap) * 1.6); position: relative; z-index: 2; }
.b-vis-equation .t { display: flex; flex-direction: column; align-items: center; gap: 0.25em; min-width: 7em; font-size: var(--body); text-align: center; }
.b-vis-equation .t .s { font-size: calc(var(--lead) * 1.1); color: var(--gold2); }
.b-vis-equation .t .x { color: var(--ivory); font-size: var(--lead); }
.b-vis-equation .leads { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.b-vis-equation .leads path { fill: none; stroke: var(--gold); stroke-width: 1.6; opacity: 0.7; }
.b-vis-equation .leads circle { fill: var(--gold2); }
.b-vis-equation .nt { text-align: center; font-size: calc(var(--body) * 0.8); color: var(--dim); }
.cs-frame[data-shape="tall"] .b-vis-equation .eq { font-size: calc(var(--title) * 1.05); }
.cs-frame[data-shape="tall"] .b-vis-equation .cs { font-size: calc(var(--title) * 0.8); }
.cs-frame[data-shape="tall"] .b-vis-equation .rows .w { font-size: 0.72em; }
.cs-frame[data-shape="tall"] .b-vis-equation .rows .w { white-space: normal; }
.cs-frame[data-shape="tall"] .b-vis-equation .t .x { font-size: var(--lead); }
.cs-frame[data-shape="tall"] .b-vis-equation .t .s { font-size: calc(var(--lead) * 1.25); }
`;
export default function mount(el, p, cx) {
  const P = cx.pro, esc = cx.esc;
  const toks = String(p.eq || '').trim().split(/\s+/).filter(Boolean);
  const cases = (p.cases || []).slice(0, 3);
  const isOp = (s) => /^([=+\-·×÷<>≤≥→]|<=|>=|->|\*|≦|≧)$/.test(s);
  const long = String(p.eq || '').length > 22;
  const eqHtml = toks.length ? `<div class="eq${long ? ' long' : ''}">${toks.map((s) => `<span class="tok${isOp(s) ? ' op' : ''}" data-raw="${esc(s)}">${P.math(s)}</span>`).join('')}</div>` : '';
  const csHtml = cases.length ? `<div class="cs">${p.lhs ? `<span class="tok lhs" data-raw="${esc(p.lhs)}">${P.math(p.lhs)} <span class="pro-gold">=</span></span>` : ''}<svg viewBox="0 0 10 100" preserveAspectRatio="none" aria-hidden="true"><path d="M9 2 C4 2 5 10 5 20 L5 40 C5 47 3 50 1 50 C3 50 5 53 5 60 L5 80 C5 90 4 98 9 98"/></svg><div class="rows">${cases.map((c) => `<span class="v tok">${P.math(c.value)}</span><span class="w tok" data-raw="${esc(c.when)}"><i class="lit" aria-hidden="true"></i><small>${/[가-힣]/.test(c.when || '') ? '' : 'if'}</small>${P.math(c.when)}</span>`).join('')}</div></div>` : '';
  const terms = (p.terms || []).slice(0, 4);
  el.innerHTML = `<i class="pro-glow" style="--gx:50%;--gy:42%"></i><div class="pro-wrap">${P.head(p)}<div class="pro-body vis-l2"><div class="eq-stage">${eqHtml}${csHtml}<i class="scan" aria-hidden="true"></i></div>
    ${terms.length ? `<div class="tm">${terms.map((t) => `<div class="t" data-sym="${esc(t.sym)}"><span class="s">${P.math(t.sym)}</span><span class="x">${/[가-힣]/.test(t.text || '') ? esc(t.text || '') : P.math(t.text || '')}</span></div>`).join('')}</div>` : ''}
    ${p.note ? `<p class="nt">${esc(p.note)}</p>` : ''}<svg class="leads" aria-hidden="true"></svg></div>${P.foot(cx)}</div>`;
  el.querySelectorAll('.rows .w small').forEach((s) => { if (!s.textContent) s.remove(); });
  const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)];
  // leader lines: from the first term of the formula that holds the symbol down to its explanation
  const body = q('.pro-body'), k = el.getBoundingClientRect().width / (el.offsetWidth || 1) || 1, bb = body.getBoundingClientRect();
  const rel = (r) => ({x: (r.left - bb.left) / k, y: (r.top - bb.top) / k, w: r.width / k, h: r.height / k});
  const leads = q('.leads'), toksEls = qa('.eq-stage .tok');
  leads.setAttribute('viewBox', `0 0 ${bb.width / k} ${bb.height / k}`);
  const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, '');
  const lines = [];
  const SUBN = {'₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9'}, GR = {theta: 'θ', sigma: 'σ', alpha: 'α', beta: 'β', lambda: 'λ', mu: 'μ', pi: 'π', delta: 'δ'};
  const canon = (s) => norm(s).replace(/[₀-₉]/g, (c) => SUBN[c]).replace(/theta|sigma|alpha|beta|lambda|mu|pi|delta/g, (m) => GR[m]).replace(/[()]/g, '');
  const vars = qa('.eq-stage .pro-var');
  qa('.t').forEach((tEl) => {
    const sym = canon(tEl.dataset.sym);
    const hit = [...vars].reverse().find((x) => canon(x.textContent) === sym) || toksEls.find((x) => canon(x.dataset.raw || x.textContent).includes(sym)) || null;
    if (!hit || !sym) return;
    const a = rel(hit.getBoundingClientRect()), b = rel(tEl.querySelector('.s').getBoundingClientRect());
    const x1 = a.x + a.w / 2, y1 = a.y + a.h + 6, x2 = b.x + b.w / 2, y2 = b.y - 10, my = (y1 + y2) / 2;
    leads.insertAdjacentHTML('beforeend', `<path d="M${x1} ${y1} C${x1} ${my} ${x2} ${my} ${x2} ${y2}"/><circle cx="${x1}" cy="${y1}" r="4"/>`);
    lines.push(leads.lastElementChild.previousElementSibling);
  });
  lines.forEach((ln) => { const L = ln.getTotalLength(); ln.style.strokeDasharray = L; ln.style.strokeDashoffset = L; ln.dataset.l = L; });
  // the entrance: each term flies in from depth (fixed scatter, no randomness)
  const tl = cx.gsap.timeline({paused: true});
  let t = P.headIn(tl, el);
  const fly = qa('.eq .tok, .cs .lhs, .rows .v, .rows .w');
  const hsh = (i) => { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); };
  fly.forEach((e, i) => {
    tl.fromTo(e, {opacity: 0, x: (hsh(i) - 0.5) * 520, y: (hsh(i + 7) - 0.5) * 260, z: -900 - hsh(i + 3) * 600, rotationY: (hsh(i + 11) - 0.5) * 70, rotationX: (hsh(i + 5) - 0.5) * 40, filter: 'blur(18px)'},
      {opacity: 1, x: 0, y: 0, z: 0, rotationY: 0, rotationX: 0, filter: 'blur(0px)', duration: 1.25, ease: 'expo.out'}, t + i * Math.min(0.11, 1.0 / fly.length));
  });
  t += Math.min(0.11, 1.0 / Math.max(1, fly.length)) * fly.length + 0.6;
  if (cases.length) { const bp = q('.cs path'); tl.fromTo(bp, {opacity: 0, scaleY: 0.1, transformOrigin: '50% 50%'}, {opacity: 1, scaleY: 1, duration: 0.9, ease: 'expo.out'}, t - 0.7); }
  qa('.t').forEach((x, i) => P.rise(tl, x, t + 0.2 + i * 0.14, {y: 24}));
  lines.forEach((ln, i) => tl.to(ln, {strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut'}, t + i * 0.14));
  tl.fromTo(leads.querySelectorAll('circle'), {scale: 0, transformOrigin: '50% 50%'}, {scale: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.1}, t);
  P.rise(tl, q('.nt'), t + 0.5, {y: 10});
  const END = t + 0.9;
  const scan = q('.scan'), lits = qa('.rows .w .lit');
  function draw(tt) {
    // a band of light passes over the formula, again every few seconds
    const u = tt - (END + 0.4), per = 4.2, ph = u < 0 ? -1 : (u % per) / 1.4;
    if (ph >= 0 && ph <= 1) { scan.style.opacity = Math.sin(Math.PI * ph) * (u < per ? 1 : 0.7); scan.style.left = (-30 + 110 * ph) + '%'; } else scan.style.opacity = 0;
    // each case lights in turn
    lits.forEach((l, i) => { const c = u < 0 ? 0 : Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, ((u * 0.55) % lits.length) - i)))); l.style.opacity = c; });
  }
  draw(0);
  return cx.vis.ambient(tl, el, draw, {dur: END + 0.2});
}
