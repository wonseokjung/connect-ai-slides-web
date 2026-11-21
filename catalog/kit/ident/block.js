// A brand ident: a wide-tracked wordmark lights up letter by letter, a thin gold rule draws from the centre, one small line settles under it.
export const css = `
.b-kit-ident .wrap { position: absolute; inset: 0; padding: var(--top) var(--pad) 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: calc(var(--gap) * 0.95); text-align: center; }
.b-kit-ident .name { font-size: min(calc(var(--title) * 0.62), 3.5cqw); font-weight: var(--light); letter-spacing: 0.42em; text-indent: 0.42em; text-transform: uppercase; color: var(--ink); white-space: nowrap; line-height: 1.1; }
.b-kit-ident .ch { display: inline-block; will-change: opacity, filter; }
.b-kit-ident .rule { display: block; height: 1px; width: min(34cqw, calc(var(--title) * 4)); background: var(--gold); }
.b-kit-ident .line { font-size: var(--label); font-weight: 400; letter-spacing: 0.34em; text-indent: 0.34em; text-transform: uppercase; color: var(--ivory); line-height: 1.5; max-width: 30em; }
.b-kit-ident .small { font-size: var(--label); font-weight: 400; letter-spacing: 0.5em; text-indent: 0.5em; text-transform: uppercase; color: var(--gold2); line-height: 1.3; margin-top: calc(var(--gap) * 0.6); }
.cs-frame[data-shape="tall"] .b-kit-ident .name { font-size: 4.5cqw; letter-spacing: 0.36em; text-indent: 0.36em; }
.cs-frame[data-shape="tall"] .b-kit-ident .rule { width: 46cqw; }
.cs-frame[data-shape="tall"] .b-kit-ident .line { letter-spacing: 0.22em; text-indent: 0.22em; }
`;
export default function mount(el, p, cx) {
  el.innerHTML = `<div class="wrap">
    <h2 class="name" aria-label="${cx.esc(p.name)}">${cx.spans(p.name, 'ch', 'chars')}</h2>
    <i class="rule" aria-hidden="true"></i>
    ${p.line ? `<p class="line">${cx.esc(p.line)}</p>` : ''}
    ${p.small ? `<p class="small">${cx.esc(p.small)}</p>` : ''}
  </div>`;
  const q = (s) => el.querySelector(s), chars = el.querySelectorAll('.ch'), n = chars.length;
  const each = Math.min(0.06, 0.9 / Math.max(1, n)), t1 = 0.25 + each * n;
  cx.wa(chars, [{opacity: 0, filter: 'blur(8px)'}, {opacity: 1, filter: 'blur(0px)'}], {duration: 0.9, delay: 0.25, stagger: each, ease: 'cubic-bezier(.2,.7,.2,1)'});
  cx.wa(q('.rule'), [{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: 1.2, delay: t1 + 0.1, ease: 'cubic-bezier(.65,0,.2,1)'});
  if (q('.line')) cx.wa(q('.line'), [{opacity: 0, transform: 'translateY(10px)'}, {opacity: 1, transform: 'none'}], {duration: 0.9, delay: t1 + 0.55});
  if (q('.small')) cx.wa(q('.small'), [{opacity: 0}, {opacity: 1}], {duration: 0.9, delay: t1 + 0.95, ease: 'ease-out'});
  return cx.fromWaapi(el);
}
