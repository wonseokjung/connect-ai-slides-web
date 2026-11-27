// vis/split: a picture and a short list. A photo or clip sits in a 3D card that swings in from a steep angle to a gentle
// one, with a reflection on the floor on dark looks (a soft contact shadow on light ones) and a slow drift; the list arrives with big gold numbers that count.
// A person (face given) is never tilted: a tall frame opens with a vertical mask and slowly pushes in.
export const css = `
.b-vis-split { overflow: hidden; }
.b-vis-split .vp-stage { position: absolute; z-index: 1; top: 0; bottom: 0; width: 51%; perspective: 1700px; display: flex; align-items: center; justify-content: center; }
.b-vis-split[data-side="left"] .vp-stage { left: 0; } .b-vis-split[data-side="right"] .vp-stage { right: 0; }
.b-vis-split .vp-card { position: relative; width: 86%; aspect-ratio: 4 / 3; transform-style: preserve-3d; border-radius: calc(var(--radius) * 0.4); overflow: hidden; box-shadow: 0 60px 120px rgba(0, 0, 0, 0.55), 0 0 0 1px color-mix(in srgb, var(--gold2) 30%, transparent); -webkit-box-reflect: below 18px linear-gradient(transparent 62%, rgba(255, 255, 255, 0.16)); }
:is(.look-white, .look-ivory, .look-paper) .b-vis-split .vp-card { -webkit-box-reflect: unset; box-shadow: 0 46px 70px -34px rgba(60, 40, 10, 0.42), 0 10px 24px -12px rgba(60, 40, 10, 0.28), 0 0 0 1px color-mix(in srgb, var(--gold2) 22%, transparent); }
.b-vis-split .vp-card > img, .b-vis-split .vp-card > video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-vis-split .vp-shine { position: absolute; inset: 0; background: linear-gradient(115deg, transparent 30%, rgba(255, 240, 210, 0.16) 45%, transparent 60%); background-size: 260% 100%; pointer-events: none; }
.b-vis-split.person .vp-stage { top: var(--top); width: 50%; perspective: none; }
.b-vis-split.person .vp-card { width: 100%; height: 100%; aspect-ratio: auto; border-radius: 0; box-shadow: none; -webkit-box-reflect: unset; }
.b-vis-split.person[data-side="left"] .vp-card { -webkit-mask-image: linear-gradient(90deg, #000 76%, transparent); mask-image: linear-gradient(90deg, #000 76%, transparent); }
.b-vis-split.person[data-side="right"] .vp-card { -webkit-mask-image: linear-gradient(270deg, #000 76%, transparent); mask-image: linear-gradient(270deg, #000 76%, transparent); }
.b-vis-split.person .vp-words { width: 48%; }
.b-vis-split .vp-glow { position: absolute; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(45% 60% at var(--gx) 50%, color-mix(in srgb, var(--gold) 16%, transparent), transparent 72%); }
:is(.look-white, .look-ivory, .look-paper) .b-vis-split .vp-glow { opacity: 0.2; }
.cs-frame[data-shape="tall"] :is(.look-white, .look-ivory, .look-paper) .b-vis-split .vp-card, :is(.look-white, .look-ivory, .look-paper) .cs-frame[data-shape="tall"] .b-vis-split .vp-card { box-shadow: 0 24px 50px rgba(70, 45, 15, 0.2); }
.b-vis-split .vp-words { position: absolute; z-index: 2; top: 0; bottom: 0; width: 49%; display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.6); padding: calc(var(--pad) * 0.8 + var(--top)) var(--pad) calc(var(--pad) * 0.8) calc(var(--pad) * 0.4); }
.b-vis-split[data-side="left"] .vp-words { right: 0; } .b-vis-split[data-side="right"] .vp-words { left: 0; padding-left: var(--pad); padding-right: calc(var(--pad) * 0.4); }
.b-vis-split .vp-k { display: flex; align-items: center; gap: 0.9em; font-size: var(--label); letter-spacing: 0.32em; text-transform: uppercase; color: var(--gold2); }
.b-vis-split .vp-k i { width: 2.6em; height: 1px; background: var(--gold); transform-origin: 0 50%; }
/* a short title stays on one line and each point on one line: the size steps down to fit the words column */
.b-vis-split { --ww: calc(49cqw - var(--pad) * 1.4); }
.b-vis-split.person { --ww: calc(48cqw - var(--pad) * 1.4); }
.cs-frame[data-shape="tall"] .b-vis-split { --ww: calc(100cqw - var(--pad) * 2); }
.b-vis-split .vp-t { font-family: var(--serif); font-weight: 400; font-size: min(calc(var(--title) * 0.95), calc(var(--ww) / var(--tw, 4))); line-height: 1.06; color: var(--ink); text-wrap: balance; }
.b-vis-split .vp-x { font-size: var(--lead); color: var(--ivory); line-height: 1.32; }
.b-vis-split ul { display: flex; flex-direction: column; gap: 0.1em; }
.b-vis-split li { display: grid; grid-template-columns: 2.1em 1fr; align-items: baseline; column-gap: 0.4em; padding: 0.35em 0; border-top: 1px solid var(--line); font-size: max(calc(var(--lead) * 0.82), min(var(--lead), calc(var(--ww) / var(--iw, 10)))); }
.b-vis-split li .n { font-family: var(--serif); font-size: 1.25em; color: var(--gold2); line-height: 1; }
.b-vis-split li .tt { color: var(--ink); line-height: 1.2; }
.b-vis-split li .tx { grid-column: 2; font-size: calc(var(--body) * 0.95); color: var(--dim); line-height: 1.35; }
.cs-frame[data-shape="tall"] .b-vis-split .vp-stage { width: 100%; top: var(--top); bottom: 50%; }
.cs-frame[data-shape="tall"] .b-vis-split .vp-words { width: 100%; left: 0; right: 0; top: 50%; justify-content: flex-start; padding: calc(var(--pad) * 0.6) var(--pad) var(--pad); }
.cs-frame[data-shape="tall"] .b-vis-split .vp-card { -webkit-box-reflect: unset; width: 86%; }
.cs-frame[data-shape="tall"] .b-vis-split.person .vp-stage { bottom: 44%; }
.cs-frame[data-shape="tall"] .b-vis-split.person .vp-card { width: 100%; height: 100%; -webkit-mask-image: linear-gradient(180deg, #000 74%, transparent); mask-image: linear-gradient(180deg, #000 74%, transparent); }
.cs-frame[data-shape="tall"] .b-vis-split.person .vp-words { width: 100%; top: 54%; }
`;
// a person stays centred in the window of its box with the head inside (object-fit: cover; measured once the slide has a size)
function aim(m, face, body) {
  const w = m.offsetWidth, h = m.offsetHeight; if (!w || !h) return;
  const mw = m.videoWidth || m.naturalWidth || 16, mh = m.videoHeight || m.naturalHeight || 9, key = [w, h, mw, mh].join('x');
  if (m.__aim === key) return; m.__aim = key;
  const s = Math.max(w / mw, h / mh), W = mw * s, H = mh * s, f = face || body, c = f[0] + f[2] / 2;
  const px = W > w + 1 ? Math.min(1, Math.max(0, (c * W - w / 2) / (W - w))) : 0.5;
  const py = H > h + 1 ? Math.min(1, Math.max(0, ((f[1] - 0.08) * H) / (H - h))) : 0.5;
  m.style.objectPosition = `${(px * 100).toFixed(2)}% ${(py * 100).toFixed(2)}%`;
  m.style.transformOrigin = `${(c * W - px * (W - w)).toFixed(1)}px ${((f[1] + f[3] / 2) * H - py * (H - h)).toFixed(1)}px`;
}
export default function mount(el, p, cx) {
  const P = cx.pro, tall = cx.shape === 'tall', person = !!(p.face || p.body);
  let side = ['left', 'right'].includes(p.side) ? p.side : 'left';
  if (p.face && !p.side) side = P.freeSide(p.face, 'right') === 'right' ? 'left' : 'right';
  el.dataset.side = side; el.classList.toggle('person', person);
  // widths in em (Hangul about 1, capitals 0.66, small letters 0.54): the title and points size down to fit their column
  const ew = (t) => Array.from(String(t || '')).reduce((a, c) => a + (/[가-힣一-龥]/.test(c) ? 0.96 : /[A-Z]/.test(c) ? 0.66 : /\s/.test(c) ? 0.27 : 0.54), 0);
  const words = String(p.title || '').split(/\s+/).filter(Boolean);
  el.style.setProperty('--tw', Math.max(4, words.length <= 4 ? ew(p.title) : ew(p.title) / 2 + 0.6).toFixed(2));
  el.style.setProperty('--iw', Math.max(8, ...(p.items || []).map((it) => ew(typeof it === 'string' ? it : it.title) + 2.6)).toFixed(2));
  el.style.setProperty('--gx', side === 'left' ? '28%' : '72%');
  const items = (p.items || []).slice(0, 4).map((it) => { if (typeof it !== 'string') return it; const m = /^([^:：]{1,40})[:：]\s*(.+)$/.exec(it); return m ? {title: m[1], text: m[2]} : {title: it}; });
  const pos = p.pos || (p.face ? `${((p.face[0] + p.face[2] / 2) * 100).toFixed(1)}% ${((p.face[1] + p.face[3] / 2) * 100).toFixed(1)}%` : '50% 50%');
  el.innerHTML = `<i class="vp-glow" aria-hidden="true" data-face-ok></i><div class="vp-stage vis-l2"><div class="vp-card">${P.media({...p, pos}, 'vp-m', p.title)}${person ? '' : '<i class="vp-shine" aria-hidden="true"></i>'}</div></div>
  <div class="vp-words vis-l1">${p.kicker ? `<div class="vp-k"><i></i><span>${cx.esc(p.kicker)}</span></div>` : ''}<h2 class="vp-t">${P.words(p.title, p.gold)}</h2>
    ${items.length ? `<ul>${items.map((it, i) => `<li><span class="n cs-num" data-n="${i + 1}">0${i + 1}</span><span class="tt">${cx.esc(it.title || '')}</span>${it.text ? `<span class="tx">${cx.esc(it.text)}</span>` : ''}</li>`).join('')}</ul>` : ''}
    ${p.text ? `<p class="vp-x">${cx.esc(p.text)}</p>` : ''}</div>`;
  const q = (s) => el.querySelector(s), card = q('.vp-card'), m = q('.vp-m'), tl = cx.gsap.timeline({paused: true});
  if (m && p.face) cx.face(m, p.face); if (m && p.body) cx.face(m, p.body, 'body');
  const sgn = side === 'left' ? 1 : -1;
  if (person) {
    tl.fromTo(card, {clipPath: 'inset(100% 0 0 0)'}, {clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'expo.inOut'}, 0);
  } else {
    tl.fromTo(card, {rotateY: -38 * sgn, rotateX: 8, z: -500, x: -160 * sgn, opacity: 0}, {rotateY: 13 * sgn, rotateX: 3, z: 0, x: 0, opacity: 1, duration: 2.0, ease: 'expo.out'}, 0);
    tl.fromTo(q('.vp-shine'), {backgroundPosition: '130% 0'}, {backgroundPosition: '-30% 0', duration: 1.8, ease: 'power2.inOut'}, 0.6);
    if (m) tl.fromTo(m, {scale: 1.25}, {scale: 1.05, duration: 2.4, ease: 'power3.out'}, 0);
  }
  if (q('.vp-k')) { tl.fromTo(q('.vp-k i'), {scaleX: 0}, {scaleX: 1, duration: 0.9, ease: 'expo.out'}, 0.3); P.rise(tl, q('.vp-k span'), 0.35, {y: 10}); }
  P.wordsIn(tl, q('.vp-t'), 0.45);
  el.querySelectorAll('li').forEach((li, i) => {
    const at = 0.95 + i * 0.22; P.rise(tl, li, at, {y: 26});
    const n = li.querySelector('.n'), o = {v: 0};
    tl.to(o, {v: i + 1, duration: 0.7, ease: 'power2.out', onUpdate: () => { n.textContent = '0' + Math.max(0, Math.round(o.v)); }}, at);
    tl.fromTo(n, {scale: 1.8, transformOrigin: '0% 80%'}, {scale: 1, duration: 0.8, ease: 'expo.out'}, at);
  });
  P.rise(tl, q('.vp-x'), 1.1, {y: 18});
  const d = tl.duration();
  return cx.vis.ambient(tl, el, (t) => {
    if (person && m) { aim(m, p.face, p.body); m.style.transform = `scale(${(1.1 - 0.1 * cx.prog(t, 0, 2.2, 'out') + Math.min(0.06, 0.003 * Math.max(0, t - d))).toFixed(4)})`; return; }
    if (t < d) return; const k = t - d;
    card.style.transform = `rotateY(${(13 * sgn + Math.sin(k * 0.25) * 3).toFixed(3)}deg) rotateX(${(3 + Math.sin(k * 0.19) * 1.5).toFixed(3)}deg) translateY(${(Math.sin(k * 0.3) * 6).toFixed(2)}px)`;
  });
}
