// vis/photo: one picture fills the frame. It opens with a diagonal mask, the camera dollies in from wide and keeps
// drifting; the title and a line slide in on a soft band of shade (on the side away from a face).
export const css = `
.b-vis-photo { overflow: hidden; }
.b-vis-photo .vo-pic { position: absolute; inset: 0; z-index: 1; overflow: hidden; }
.b-vis-photo .vo-pic > img, .b-vis-photo .vo-pic > video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-vis-photo .vo-shade { position: absolute; z-index: 2; inset: 0; pointer-events: none; }
.b-vis-photo[data-side="bottom"] .vo-shade { background: linear-gradient(0deg, rgba(8, 7, 5, 0.9) 0%, rgba(8, 7, 5, 0.72) 32%, rgba(8, 7, 5, 0.3) 52%, transparent 68%); }
.b-vis-photo[data-side="left"] .vo-shade { background: linear-gradient(90deg, rgba(8, 7, 5, 0.85) 0%, rgba(8, 7, 5, 0.45) 32%, transparent 52%); }
.b-vis-photo[data-side="right"] .vo-shade { background: linear-gradient(270deg, rgba(8, 7, 5, 0.85) 0%, rgba(8, 7, 5, 0.45) 32%, transparent 52%); }
.b-vis-photo .vo-words { position: absolute; z-index: 3; display: flex; flex-direction: column; gap: calc(var(--gap) * 0.4); color: #F6F3EC; }
.b-vis-photo[data-side="bottom"] .vo-words { left: var(--pad); right: var(--pad); bottom: calc(var(--pad) * 0.7); }
.b-vis-photo[data-side="left"] .vo-words { left: var(--pad); width: 44%; top: 0; bottom: 0; justify-content: center; }
.b-vis-photo[data-side="right"] .vo-words { right: var(--pad); width: 44%; top: 0; bottom: 0; justify-content: center; }
.b-vis-photo .vo-k { display: flex; align-items: center; gap: 0.9em; font-size: var(--label); letter-spacing: 0.32em; text-transform: uppercase; color: #F2B45A; }
.b-vis-photo .vo-k i { width: 2.6em; height: 1px; background: #D6892A; transform-origin: 0 50%; }
.b-vis-photo .vo-t { font-family: var(--serif); font-weight: 400; font-size: calc(var(--hero) * 0.62); line-height: 1.04; color: #F6F3EC; max-width: 14em; text-wrap: balance; text-shadow: 0 4px 40px rgba(0, 0, 0, 0.35); }
.b-vis-photo .vo-x { font-size: var(--lead); color: rgba(246, 243, 236, 0.86); line-height: 1.3; max-width: 26em; word-break: keep-all; text-wrap: balance; }
.b-vis-photo .vo-edge { position: absolute; z-index: 2; top: -10%; bottom: -10%; width: 3px; background: linear-gradient(180deg, transparent, #F2B45A, transparent); box-shadow: 0 0 40px 8px rgba(214, 137, 42, 0.5); transform: rotate(14deg); pointer-events: none; }
.b-vis-photo.person .vo-pic { inset: var(--top) auto 0 auto; width: 57%; }
.b-vis-photo.person[data-side="right"] .vo-pic { left: 0; -webkit-mask-image: linear-gradient(90deg, #000 78%, transparent); mask-image: linear-gradient(90deg, #000 78%, transparent); }
.b-vis-photo.person[data-side="left"] .vo-pic { right: 0; -webkit-mask-image: linear-gradient(270deg, #000 78%, transparent); mask-image: linear-gradient(270deg, #000 78%, transparent); }
.b-vis-photo.person .vo-shade, .b-vis-photo.person .vo-edge { display: none; }
.b-vis-photo.person .vo-words { width: 45%; color: var(--ink); }
.b-vis-photo.person[data-side="right"] .vo-words { right: 0; padding: 0 var(--pad) 0 calc(var(--pad) * 0.2); }
.b-vis-photo.person[data-side="left"] .vo-words { left: 0; padding: 0 calc(var(--pad) * 0.2) 0 var(--pad); }
.b-vis-photo.person .vo-k { color: var(--gold2); } .b-vis-photo.person .vo-k i { background: var(--gold); }
.b-vis-photo.person .vo-t { color: var(--ink); text-shadow: none; font-size: calc(var(--hero) * 0.56); word-break: keep-all; }
.b-vis-photo.person .vo-x { color: var(--ivory); }
.b-vis-photo .vo-light { position: absolute; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(38% 60% at var(--lx, 78%) 50%, color-mix(in srgb, var(--gold) 16%, transparent), transparent 75%); }
.cs-frame[data-shape="tall"] .b-vis-photo .vo-words { left: var(--pad); right: var(--pad); width: auto; top: auto; bottom: calc(var(--pad) * 0.8); justify-content: flex-end; }
.cs-frame[data-shape="tall"] .b-vis-photo .vo-shade { background: linear-gradient(0deg, rgba(8, 7, 5, 0.9) 0%, rgba(8, 7, 5, 0.7) 38%, rgba(8, 7, 5, 0.3) 56%, transparent 70%); }
.cs-frame[data-shape="tall"] .b-vis-photo .vo-t { font-size: calc(var(--hero) * 0.7); }
.cs-frame[data-shape="tall"] .b-vis-photo.person .vo-pic { left: 0; right: 0; width: auto; bottom: 34%; -webkit-mask-image: linear-gradient(180deg, #000 76%, transparent); mask-image: linear-gradient(180deg, #000 76%, transparent); }
.cs-frame[data-shape="tall"] .b-vis-photo.person .vo-words { left: 0; right: 0; width: auto; padding: 0 var(--pad); bottom: calc(var(--pad) * 0.8); }
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
  const P = cx.pro;
  let side = ['left', 'right', 'bottom'].includes(p.side) ? p.side : (p.face || p.body ? P.freeSide(p.face || p.body, 'left') : 'bottom');
  el.dataset.side = side; const person = !!(p.face || p.body) && side !== 'bottom'; el.classList.toggle('person', person);
  el.style.setProperty('--lx', side === 'left' ? '22%' : '78%');
  const pos = p.pos || (p.face ? `${((p.face[0] + p.face[2] / 2) * 100).toFixed(1)}% ${((p.face[1] + p.face[3] / 2) * 100).toFixed(1)}%` : '50% 50%');
  el.innerHTML = `${person ? '<i class="vo-light" aria-hidden="true" data-face-ok></i>' : ''}<div class="vo-pic vis-l2">${P.media({...p, pos}, 'vo-m', p.title)}</div><i class="vo-shade" aria-hidden="true"></i><i class="vo-edge" aria-hidden="true"></i>
  <div class="vo-words vis-l1">${p.kicker ? `<div class="vo-k"><i></i><span>${cx.esc(p.kicker)}</span></div>` : ''}${p.title ? `<h2 class="vo-t">${P.words(p.title, p.gold)}</h2>` : ''}${p.text ? `<p class="vo-x">${cx.esc(p.text)}</p>` : ''}</div>`;
  const q = (s) => el.querySelector(s), m = q('.vo-m'), tl = cx.gsap.timeline({paused: true});
  if (m) { if (p.face) cx.face(m, p.face); if (p.body) cx.face(m, p.body, 'body'); if (!person) m.style.transformOrigin = pos; }
  tl.fromTo(q('.vo-pic'), {clipPath: 'polygon(0% 0%, 0% 0%, -30% 100%, -30% 100%)'}, {clipPath: 'polygon(0% 0%, 130% 0%, 100% 100%, -30% 100%)', duration: 1.5, ease: 'expo.inOut'}, 0);
  tl.fromTo(q('.vo-edge'), {left: '-5%', opacity: 1}, {left: '112%', duration: 1.5, ease: 'expo.inOut'}, 0);
  tl.fromTo(q('.vo-shade'), {opacity: 0}, {opacity: 1, duration: 1.0}, 0.8);
  if (q('.vo-k')) { tl.fromTo(q('.vo-k i'), {scaleX: 0}, {scaleX: 1, duration: 0.9, ease: 'expo.out'}, 1.0); P.rise(tl, q('.vo-k span'), 1.05, {y: 10}); }
  if (q('.vo-t')) P.wordsIn(tl, q('.vo-t'), 1.1);
  P.rise(tl, q('.vo-x'), 1.5, {y: 18});
  return cx.vis.ambient(tl, el, (t) => {
    if (!m) return;
    if (person) aim(m, p.face, p.body);
    const k = cx.prog(t, 0, 3.2, 'out'), drift = Math.max(0, t - 3.2);
    const s = 1.22 - 0.18 * k + Math.min(0.06, drift * 0.004);
    const x = person ? 0 : (2.2 - 2.2 * k + Math.sin(drift * 0.12) * 0.8);
    m.style.transform = `translate(${x.toFixed(3)}%, 0) scale(${s.toFixed(4)})`;
  });
}
