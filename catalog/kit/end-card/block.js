// The last screen: one large line, one to three links as buttons (they work on the slide too), the brand line under them.
export const css = `
.b-kit-end-card .cs-hero { font-size: calc(var(--hero) * 0.8); max-width: 12em; }
.b-kit-end-card .cs-w { margin: 0 0.11em; }
.b-kit-end-card .cs-lead { max-width: 24em; }
.b-kit-end-card .btns { display: flex; flex-wrap: wrap; justify-content: center; gap: calc(var(--gap) * 0.6); margin-top: calc(var(--gap) * 0.3); }
.b-kit-end-card .cs-btn { min-height: 48px; }
.b-kit-end-card .brand { display: flex; align-items: center; gap: 1.2em; margin-top: calc(var(--gap) * 0.5); }
.b-kit-end-card .brand i { display: block; width: calc(var(--label) * 3); height: 1px; background: var(--gold); }
.b-kit-end-card .brand i:first-child { transform-origin: 100% 50%; }
.b-kit-end-card .brand i:last-child { transform-origin: 0 50%; }
.cs-frame[data-shape="tall"] .b-kit-end-card .cs-hero { font-size: var(--title); }
.cs-frame[data-shape="tall"] .b-kit-end-card .btns { flex-direction: column; align-self: stretch; }
.cs-frame[data-shape="tall"] .b-kit-end-card .cs-btn { width: 100%; }
`;
export default function mount(el, p, cx) {
  const links = (p.links || []).slice(0, 3);
  const safe = (h) => (/^\s*(javascript|data|vbscript):/i.test(String(h || '')) ? '#' : String(h || '#'));
  el.innerHTML = `<div class="cs-pad cs-center">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    <h2 class="cs-hero">${cx.spans(p.title, 'cs-w')}</h2>
    ${p.sub ? `<p class="cs-lead">${cx.esc(p.sub)}</p>` : ''}
    ${links.length ? `<div class="btns">${links.map((l, i) => `<a class="cs-btn${i ? ' cs-ghost' : ''}" href="${cx.esc(safe(l.href))}"${/^https?:/i.test(l.href || '') ? ' target="_blank" rel="noopener"' : ''}>${cx.esc(l.label)}</a>`).join('')}</div>` : ''}
    ${p.brand ? `<div class="brand"><i aria-hidden="true"></i><span class="cs-label">${cx.esc(p.brand)}</span><i aria-hidden="true"></i></div>` : ''}
  </div>`;
  const q = (s) => el.querySelector(s), ws = el.querySelectorAll('.cs-w'), t1 = 0.2 + 0.07 * ws.length;
  if (q('.cs-kicker')) cx.wa(q('.cs-kicker'), [{opacity: 0}, {opacity: 1}], {duration: 0.6, ease: 'ease-out'});
  cx.wa(ws, [{opacity: 0, transform: 'translateY(0.5em)'}, {opacity: 1, transform: 'none'}], {duration: 0.8, delay: 0.2, stagger: 0.07});
  if (q('.cs-lead')) cx.wa(q('.cs-lead'), [{opacity: 0, transform: 'translateY(16px)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: t1 + 0.25});
  cx.wa(el.querySelectorAll('.cs-btn'), [{opacity: 0, transform: 'translateY(22px) scale(0.96)'}, {opacity: 1, transform: 'none'}], {duration: 0.7, delay: t1 + 0.5, stagger: 0.12});
  if (q('.brand')) {
    cx.wa(el.querySelectorAll('.brand i'), [{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: 0.9, delay: t1 + 0.95});
    cx.wa(q('.brand span'), [{opacity: 0, letterSpacing: '0.5em'}, {opacity: 1, letterSpacing: '0.22em'}], {duration: 0.9, delay: t1 + 0.95});
  }
  return cx.fromWaapi(el);
}
