// GSAP: two columns side by side. The left one is there first; a gold line travels across and the right one is revealed behind it.
export const css = `
.b-gsap-compare-wipe .cmp { position: relative; display: grid; grid-template-columns: 1fr 1fr; }
.b-gsap-compare-wipe .side { display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.7); padding: calc(var(--gap) * 1.5) calc(var(--gap) * 1.6); min-height: 46cqh; }
.b-gsap-compare-wipe .a { padding-left: 0; }
.b-gsap-compare-wipe .b { position: relative; --p: 0; background: var(--card); border-radius: 0 var(--radius) var(--radius) 0; clip-path: inset(0 calc((1 - var(--p)) * 100%) 0 0); }
.b-gsap-compare-wipe .tag { font-size: var(--label); letter-spacing: 0.3em; text-transform: uppercase; color: var(--dim); }
.b-gsap-compare-wipe .b .tag { color: var(--gold2); }
.b-gsap-compare-wipe .hd { font-size: calc(var(--title) * 1.08); font-weight: var(--thin); letter-spacing: -0.025em; line-height: 1.05; color: var(--ivory); }
.b-gsap-compare-wipe .b .hd { color: var(--ink); }
.b-gsap-compare-wipe ul { display: flex; flex-direction: column; gap: calc(var(--gap) * 0.42); margin-top: calc(var(--gap) * 0.2); }
.b-gsap-compare-wipe li { display: flex; gap: 0.7em; align-items: baseline; font-size: var(--lead); line-height: 1.26; color: var(--dim); }
.b-gsap-compare-wipe .b li { color: var(--ivory); }
.b-gsap-compare-wipe li::before { content: ""; flex: none; width: 0.7em; height: 1px; background: var(--dim); transform: translateY(-0.3em); }
.b-gsap-compare-wipe .b li::before { height: 2px; background: var(--gold); }
.b-gsap-compare-wipe .mid { position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; margin-left: -1px; background: var(--gold); transform-origin: 50% 0; }
.b-gsap-compare-wipe .wipe { position: absolute; top: 0; bottom: 0; left: calc(50% + 50% * var(--p, 0)); width: 2px; margin-left: -1px; background: var(--gold2); }
.cs-frame[data-shape="tall"] .b-gsap-compare-wipe .cmp { grid-template-columns: 1fr; }
.cs-frame[data-shape="tall"] .b-gsap-compare-wipe .side { padding: calc(var(--gap) * 1.1) calc(var(--gap) * 0.9); min-height: 0; gap: calc(var(--gap) * 0.5); }
.cs-frame[data-shape="tall"] .b-gsap-compare-wipe li { font-size: calc(var(--lead) * 0.9); }
.cs-frame[data-shape="tall"] .b-gsap-compare-wipe .hd { font-size: var(--title); }
.cs-frame[data-shape="tall"] .b-gsap-compare-wipe .a { padding-left: 0; padding-top: 0; }
.cs-frame[data-shape="tall"] .b-gsap-compare-wipe .b { border-radius: 0 0 var(--radius) var(--radius); clip-path: inset(0 0 calc((1 - var(--p)) * 100%) 0); }
.cs-frame[data-shape="tall"] .b-gsap-compare-wipe .mid { display: none; }
.cs-frame[data-shape="tall"] .b-gsap-compare-wipe .wipe { display: none; }
.cs-frame[data-shape="tall"] .b-gsap-compare-wipe .b::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 2px; background: var(--gold); }
`;
export default function mount(el, p, cx) {
  const g = cx.gsap, L = p.left || {}, R = p.right || {};
  const side = (s, cls) => `<div class="side ${cls}">
      ${s.tag ? `<div class="tag">${cx.esc(s.tag)}</div>` : ''}
      <h3 class="hd">${cx.esc(s.title || '')}</h3>
      <ul>${(s.items || []).slice(0, 4).map((t) => `<li><span>${cx.esc(t)}</span></li>`).join('')}</ul>
    </div>`;
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    ${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}
    <div class="cmp">${side(L, 'a')}${side(R, 'b')}<i class="mid" aria-hidden="true"></i><i class="wipe" aria-hidden="true"></i></div>
  </div>`;
  const q = (s) => el.querySelector(s), tl = g.timeline({paused: true}), cmp = q('.cmp'), b = q('.b');
  const head = el.querySelectorAll('.cs-kicker, .cs-title');
  if (head.length) tl.fromTo(head, {opacity: 0, y: 24}, {opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1}, 0);
  tl.fromTo(el.querySelectorAll('.a .tag, .a .hd, .a li'), {opacity: 0, x: -24}, {opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08}, 0.3);
  tl.fromTo(q('.mid'), {scaleY: 0}, {scaleY: 1, duration: 0.7, ease: 'expo.out'}, 0.7);
  tl.addLabel('step1', 1.5);
  tl.fromTo(q('.wipe'), {opacity: 0}, {opacity: 1, duration: 0.15}, 1.5);
  tl.fromTo([cmp, b], {'--p': 0}, {'--p': 1, duration: 1.1, ease: 'power2.inOut'}, 1.55);
  tl.fromTo(el.querySelectorAll('.b .tag, .b .hd, .b li'), {opacity: 0, x: -20}, {opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', stagger: 0.09}, 1.85);
  tl.to(q('.wipe'), {opacity: 0, duration: 0.3}, 2.65);
  return cx.fromGsap(tl);
}
