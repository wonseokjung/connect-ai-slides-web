// vis/compare: before and after as two quiet cards side by side, centred under the title. A beam of light crosses the
// old card, which cools to the look's quiet colour (still readable); between the cards the beam flares and a wave of
// warm light opens the new card, whose lines rise in serif. Lines are set near title size.
export const css = `
.b-vis-compare { overflow: hidden; }
.b-vis-compare .pro-wrap { z-index: 4; pointer-events: none; }
.b-vis-compare .vm-pair { position: absolute; z-index: 1; left: var(--pad); right: var(--pad); top: calc(var(--pad) * 0.74 + var(--top) + var(--title) * 1.5); bottom: calc(var(--pad) * 0.8); display: grid; grid-template-columns: 1fr 1fr; column-gap: calc(var(--pad) * 0.5); align-content: center; align-items: stretch; }
.b-vis-compare .vm-half { position: relative; display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.45); padding: calc(var(--pad) * 0.42) calc(var(--pad) * 0.48); border-radius: var(--radius); border: 1px solid var(--line); background: var(--card); min-width: 0; }
.b-vis-compare .vm-r { border-color: color-mix(in srgb, var(--gold2) 55%, transparent); }
.b-vis-compare .vm-r::before { content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit; background: radial-gradient(90% 80% at 30% 50%, color-mix(in srgb, var(--gold) 24%, transparent), transparent 78%); opacity: var(--lit, 0); }
:is(.look-white, .look-ivory, .look-paper) .b-vis-compare .vm-r::before { background: radial-gradient(90% 80% at 30% 50%, color-mix(in srgb, var(--gold) 20%, transparent), transparent 82%); }
:is(.look-white, .look-ivory, .look-paper) .b-vis-compare .vm-r { border-color: color-mix(in srgb, var(--gold2) 75%, transparent); box-shadow: 0 24px 48px -30px color-mix(in srgb, var(--gold) 45%, transparent); }
.b-vis-compare .vm-lab { font-size: calc(var(--label) * 1.45); letter-spacing: 0.32em; margin-bottom: 0.2em; text-transform: uppercase; color: var(--dim); }
.b-vis-compare .vm-r .vm-lab { color: var(--gold2); }
:is(.look-white, .look-ivory, .look-paper) .b-vis-compare .vm-r .vm-lab { color: var(--ivory); }
.b-vis-compare .vm-ti { font-family: var(--serif); font-size: calc(var(--title) * 0.78); line-height: 1.05; color: var(--ink); }
.b-vis-compare ul { display: flex; flex-direction: column; gap: 0.12em; }
.b-vis-compare li { position: relative; max-width: 100%; font-size: calc(var(--title) * var(--fs, 0.8)); font-weight: var(--thin); letter-spacing: -0.02em; line-height: 1.18; padding: 0.1em 0; color: var(--ink); word-break: keep-all; }
.b-vis-compare .vm-l li { display: flex; align-items: baseline; }
.b-vis-compare .vm-l li::before { content: ""; flex: none; display: inline-block; width: 0.24em; height: 0.24em; margin-right: 0.5em; border-radius: 50%; border: 1px solid var(--dim); }
.b-vis-compare .vm-r li { display: flex; align-items: baseline; }
.b-vis-compare .vm-r li::before { content: ""; flex: none; display: inline-block; width: 0.24em; height: 0.24em; margin-right: 0.5em; border-radius: 50%; background: var(--gold2); vertical-align: 0.12em; }
.b-vis-compare .vm-tx { font-size: var(--lead); line-height: 1.32; color: var(--ink); }
.b-vis-compare .vm-seam { position: absolute; z-index: 3; top: 18%; bottom: 12%; width: 1px; left: 0; background: linear-gradient(180deg, transparent, var(--gold2) 22%, var(--gold2) 78%, transparent); box-shadow: 0 0 18px 2px color-mix(in srgb, var(--gold) 40%, transparent); }
:is(.look-white, .look-ivory, .look-paper) .b-vis-compare .vm-seam { box-shadow: none; }
.b-vis-compare .vm-beam { position: absolute; z-index: 3; top: -10%; bottom: -10%; left: 0; width: 30%; transform: translateX(-50%); pointer-events: none; background: radial-gradient(50% 50% at 50% 50%, color-mix(in srgb, var(--gold2) 40%, transparent), color-mix(in srgb, var(--gold) 12%, transparent) 45%, transparent 72%); opacity: 0; }
:is(.look-white, .look-ivory, .look-paper) .b-vis-compare .vm-beam { background: radial-gradient(50% 50% at 50% 50%, color-mix(in srgb, var(--gold2) 16%, transparent), color-mix(in srgb, var(--gold) 4%, transparent) 45%, transparent 72%); }
.b-vis-compare .vm-wash { position: absolute; z-index: 0; top: 0; bottom: 0; left: 44%; width: 56%; pointer-events: none; background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--gold) 22%, transparent) 16%, color-mix(in srgb, var(--gold) 7%, transparent) 48%, transparent 80%); transform-origin: 0 50%; opacity: 0; }
:is(.look-white, .look-ivory, .look-paper) .b-vis-compare .vm-wash { background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--gold) 6%, transparent) 16%, color-mix(in srgb, var(--gold) 2%, transparent) 48%, transparent 80%); }
.cs-frame[data-shape="tall"] .b-vis-compare .vm-pair { top: calc(var(--top) + var(--pad) * 0.74 + var(--title) * 2.4); bottom: calc(var(--pad) * 0.7); grid-template-columns: 1fr; grid-template-rows: auto auto; row-gap: calc(var(--pad) * 0.5); align-content: center; align-items: stretch; }
.cs-frame[data-shape="tall"] .b-vis-compare .vm-half { padding: calc(var(--pad) * 0.45) calc(var(--pad) * 0.5); }
.cs-frame[data-shape="tall"] .b-vis-compare .vm-seam { width: auto; height: 1px; left: 10%; right: 10%; top: 0; bottom: auto; background: linear-gradient(90deg, transparent, var(--gold2) 22%, var(--gold2) 78%, transparent); }
.cs-frame[data-shape="tall"] .b-vis-compare .vm-beam { top: 0; bottom: auto; left: -10%; right: -10%; width: auto; height: 26%; transform: translateY(-50%); }
.cs-frame[data-shape="tall"] .b-vis-compare .vm-wash { left: 0; width: 100%; top: 50%; height: 50%; background: linear-gradient(180deg, color-mix(in srgb, var(--gold) 22%, transparent), transparent 70%); transform-origin: 50% 0; }
:is(.look-white, .look-ivory, .look-paper) .cs-frame[data-shape="tall"] .b-vis-compare .vm-wash, .cs-frame[data-shape="tall"] :is(.look-white, .look-ivory, .look-paper) .b-vis-compare .vm-wash { background: linear-gradient(180deg, color-mix(in srgb, var(--gold) 6%, transparent), transparent 70%); }
.cs-frame[data-shape="tall"] .b-vis-compare li { font-size: calc(var(--title) * var(--fs, 0.8) * 0.78); }
`;
export default function mount(el, p, cx) {
  const P = cx.pro, tall = cx.shape === 'tall';
  const side = (s, cls) => { s = s || {}; const items = (s.items || []).slice(0, 4); return `<div class="vm-half ${cls} ${cls === 'vm-l' ? 'vis-l2' : 'vis-l2'}">${s.label ? `<div class="vm-lab">${cx.esc(s.label)}</div>` : ''}${s.title ? `<div class="vm-ti">${cx.esc(s.title)}</div>` : ''}${items.length ? `<ul>${items.map((x) => `<li><span>${cx.esc(typeof x === 'string' ? x : x.title || '')}</span></li>`).join('')}</ul>` : ''}${s.text ? `<p class="vm-tx">${cx.esc(s.text)}</p>` : ''}</div>`; };
  el.innerHTML = `<div class="pro-wrap">${P.head(p)}</div><div class="vm-pair">${side(p.left, 'vm-l')}${side(p.right, 'vm-r')}</div><i class="vm-wash" aria-hidden="true"></i><i class="vm-beam" aria-hidden="true"></i><i class="vm-seam" aria-hidden="true"></i>`;
  // the longest line decides the size, so both halves stay big and on one line where they can
  const longest = Math.max(4, ...[].concat((p.left || {}).items || [], (p.right || {}).items || []).map((x) => Array.from(String(typeof x === 'string' ? x : x.title || '')).reduce((a, c) => a + (/[가-힣一-龥]/.test(c) ? 0.96 : /\s/.test(c) ? 0.27 : 0.55), 0)));
  el.style.setProperty('--fs', Math.min(0.74, 6.6 / (longest + 1.4)).toFixed(3));
  const q = (s) => el.querySelector(s), tl = cx.gsap.timeline({paused: true});
  const t0 = P.headIn(tl, el, 0);
  const L = q('.vm-l'), R = q('.vm-r'), seam = q('.vm-seam'), beam = q('.vm-beam'), wash = q('.vm-wash');
  const css = getComputedStyle(el), ink = css.getPropertyValue('--ink').trim() || '#F4EFE6', dim = css.getPropertyValue('--dim').trim() || 'rgba(230, 225, 214, 0.75)';
  P.rise(tl, L.children, t0, {y: 24, stagger: 0.1});
  // the seam crosses the old side, cooling it, then rests between the two cards
  const go = t0 + 0.9;
  const at = tall ? 'top' : 'left', from = tall ? '30%' : '0%';
  tl.fromTo(seam, {[at]: from, opacity: 0}, {[at]: '50%', opacity: 1, duration: 1.4, ease: 'expo.inOut'}, go);
  tl.fromTo(beam, {[at]: from, opacity: 0}, {[at]: '50%', opacity: 0.9, duration: 1.4, ease: 'expo.inOut'}, go);
  // the flare where it lands, then a wave of warm light opens the new side
  tl.fromTo(beam, {scale: 1}, {keyframes: [{scale: 1.9, opacity: 1, duration: 0.35, ease: 'power2.out'}, {scale: 1.15, opacity: 0.6, duration: 1.1, ease: 'power2.inOut'}]}, go + 1.3);
  tl.fromTo(wash, {opacity: 0, [tall ? 'scaleY' : 'scaleX']: 0}, {keyframes: [{opacity: 1, [tall ? 'scaleY' : 'scaleX']: 1, duration: 0.9, ease: 'expo.out'}, {opacity: 0.45, duration: 1.2, ease: 'power1.inOut'}]}, go + 1.35);
  tl.fromTo(R, {clipPath: tall ? 'inset(0 0 100% 0)' : 'inset(0 100% 0 0)'}, {clipPath: 'inset(0 0% 0% 0)', duration: 1.0, ease: 'expo.out'}, go + 1.35);
  // the old side cools to the look's quiet colour (a colour, not a fade, so it stays readable)
  tl.fromTo(L.querySelectorAll('li, .vm-ti, .vm-tx'), {color: ink}, {color: dim, duration: 1.2, ease: 'power2.inOut', stagger: 0.08}, go + 0.25);
  tl.fromTo(R, {'--lit': 0}, {'--lit': 1, duration: 1.2, ease: 'power2.out'}, go + 1.1);
  P.rise(tl, R.querySelectorAll('.vm-lab, .vm-ti, li, .vm-tx'), go + 1.15, {y: 36, stagger: 0.12});
  return cx.vis.ambient(tl, el, (t) => { const k = Math.max(0, t - tl.duration()); if (!k) return; seam.style.filter = `brightness(${(1 + 0.25 * Math.sin(k * 1.1)).toFixed(3)})`; beam.style.opacity = (0.6 + 0.15 * Math.sin(k * 0.7)).toFixed(3); });
}
