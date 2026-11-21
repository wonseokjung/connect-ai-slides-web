// Plain CSS @keyframes, no library: a still (or a clip) fills the whole frame and the camera pushes in very slowly (the Ken Burns move).
// A thin caption band at the bottom carries a label and one line; only the band is darkened.
// For a photo of a person give the face box (and the body box if you have it): the caption becomes a corner column on the free
// side of the person, so nothing is on the face or the body, and the picture is never shown above its own size.
export const css = `
.b-css-ken-burns { background: #000; }
.b-css-ken-burns .pic { position: absolute; inset: 0; overflow: hidden; background: #000; animation: b-kb-in 1.1s ease-out both; }
.b-css-ken-burns .pic img, .b-css-ken-burns .pic video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transform-origin: var(--ox, 50%) var(--oy, 50%); will-change: transform;
  animation: b-kb-push var(--kbd, 6s) cubic-bezier(.3, .1, .45, 1) both; }
.b-css-ken-burns .band { position: absolute; left: 0; right: 0; bottom: 0; padding: calc(var(--pad) * 1.15) var(--pad) calc(var(--pad) * 0.5); display: grid; grid-template-columns: auto 1fr; align-items: end; column-gap: calc(var(--gap) * 1.2); row-gap: calc(var(--gap) * 0.4);
  background: linear-gradient(0deg, rgba(8, 7, 5, 0.9) 0%, rgba(8, 7, 5, 0.84) 44%, rgba(8, 7, 5, 0.56) 66%, rgba(8, 7, 5, 0.22) 84%, rgba(8, 7, 5, 0) 100%);
  animation: b-kb-in 0.9s ease-out 0.45s both; }
/* a person in the picture: the caption is a column in the bottom corner of the free side, it ends before the person */
.b-css-ken-burns.person .band { right: auto; width: var(--free, 26%); grid-template-columns: minmax(0, 1fr); row-gap: calc(var(--gap) * 0.5); padding: calc(var(--pad) * 1.6) calc(var(--gap) * 0.9) calc(var(--pad) * 0.56) calc(var(--pad) * 0.5);
  background: linear-gradient(90deg, rgba(8, 7, 5, 0.88) 0%, rgba(8, 7, 5, 0.8) 34%, rgba(8, 7, 5, 0.6) 56%, rgba(8, 7, 5, 0.3) 74%, rgba(8, 7, 5, 0.08) 87%, rgba(8, 7, 5, 0) 94%);
  -webkit-mask-image: linear-gradient(0deg, #000 0%, #000 58%, transparent 100%); mask-image: linear-gradient(0deg, #000 0%, #000 58%, transparent 100%); }
.b-css-ken-burns.person.right .band { left: auto; right: 0; padding-left: calc(var(--gap) * 0.9); padding-right: calc(var(--pad) * 0.5);
  background: linear-gradient(270deg, rgba(8, 7, 5, 0.88) 0%, rgba(8, 7, 5, 0.8) 34%, rgba(8, 7, 5, 0.6) 56%, rgba(8, 7, 5, 0.3) 74%, rgba(8, 7, 5, 0.08) 87%, rgba(8, 7, 5, 0) 94%); }
.b-css-ken-burns.person .line { text-align: left; text-shadow: 0 0 0.6em rgba(8, 7, 5, 0.55); }
.b-css-ken-burns.person .cs-kicker { white-space: normal; padding-bottom: 0; }
.b-css-ken-burns .rule { grid-column: 1 / -1; display: block; height: 1px; background: var(--gold); transform-origin: 0 50%; animation: b-kb-line 1.1s cubic-bezier(.16, 1, .3, 1) 0.7s both; }
.b-css-ken-burns .cs-kicker { letter-spacing: 0.3em; white-space: nowrap; padding-bottom: 0.5em; animation: b-kb-up 0.8s cubic-bezier(.16, 1, .3, 1) 0.95s both; }
.b-css-ken-burns .line { font-size: calc(var(--lead) * 1.08); font-weight: var(--thin); letter-spacing: -0.015em; line-height: 1.12; color: var(--ink); text-wrap: balance; text-align: right; animation: b-kb-up 0.8s cubic-bezier(.16, 1, .3, 1) 1.1s both; }
/* phone: a wide picture is shown whole (not cropped to a sliver), the caption sits under it on the page colour */
.cs-frame[data-shape="tall"] .b-css-ken-burns { background: var(--bg); }
.cs-frame[data-shape="tall"] .b-css-ken-burns .pic { top: calc(var(--top) + 17cqh); bottom: auto; height: var(--ph, 56.25cqw); }
.cs-frame[data-shape="tall"] .b-css-ken-burns .band { grid-template-columns: 1fr; top: calc(var(--top) + 17cqh + var(--ph, 56.25cqw)); bottom: auto; background: none; padding: var(--pad); }
.cs-frame[data-shape="tall"] .b-css-ken-burns.person .pic { top: var(--top); }
.cs-frame[data-shape="tall"] .b-css-ken-burns.person .pic { bottom: auto; height: calc(66% - var(--top)); }
.cs-frame[data-shape="tall"] .b-css-ken-burns.person .band { top: 66%; bottom: 0; right: 0; width: auto; align-content: center; padding: var(--pad); background: none; -webkit-mask-image: none; mask-image: none; }
.cs-frame[data-shape="tall"] .b-css-ken-burns.person .line { text-shadow: none; }
.cs-frame[data-shape="tall"] .b-css-ken-burns .line { text-align: left; font-size: calc(var(--lead) * 1.2); }
.cs-frame[data-shape="tall"] .b-css-ken-burns .cs-kicker { white-space: normal; padding-bottom: 0; }
@keyframes b-kb-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes b-kb-push { from { transform: translate(var(--dx, 0%), var(--dy, 0%)) scale(var(--k0, 1)); } to { transform: translate(0%, 0%) scale(var(--k1, 1.08)); } }
@keyframes b-kb-line { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes b-kb-up { from { opacity: 0; transform: translateY(0.5em); } to { opacity: 1; transform: none; } }
`;
// The browser makes CSS animations again whenever a hidden slide is shown, so they are collected at every seek (cx.fromWaapi does that).
export default function mount(el, p, cx) {
  const face = Array.isArray(p.face) ? p.face : null, body = Array.isArray(p.body) ? p.body : null, tall = cx.shape === 'tall';
  // the room a person takes: the body box, or (face only) shoulders guessed from the face
  const person = body || (face ? [face[0] - face[2] * 0.6, face[1], face[2] * 2.2, 1 - face[1]] : null);
  if (person) el.classList.add('person');
  const focus = Array.isArray(p.focus) ? p.focus : face ? [face[0] + face[2] / 2, face[1] + face[3] / 2] : [0.5, 0.5];
  const isVideo = /\.(mp4|webm|mov)$/i.test(p.src || '');
  const secs = cx.clamp(Number(p.seconds) || 6, 3, 20);
  el.style.setProperty('--kbd', secs + 's');
  el.innerHTML = `
    <div class="pic">${isVideo ? `<video src="${cx.esc(p.src)}" ${p.poster ? `poster="${cx.esc(p.poster)}"` : ''} muted loop playsinline preload="auto" aria-label="${cx.esc(p.alt || p.text || 'Clip')}"></video>` : `<img src="${cx.esc(p.src)}" alt="${cx.esc(p.alt || p.text || 'Picture')}">`}</div>
    <div class="band">
      <i class="rule" aria-hidden="true"></i>
      ${p.label ? `<div class="cs-kicker">${cx.esc(p.label)}</div>` : '<span></span>'}
      ${p.text ? `<p class="line">${cx.esc(p.text)}</p>` : ''}
    </div>`;
  const q = (s) => el.querySelector(s), m = q('.pic > *'), box = q('.pic');
  const place = () => {
    if (tall && !person) { const r0 = (m.videoHeight || m.naturalHeight || 9) / (m.videoWidth || m.naturalWidth || 16); el.style.setProperty('--ph', Math.min(r0 * 100, 110).toFixed(2) + 'cqw'); }
    const bw = box.offsetWidth, bh = box.offsetHeight; if (!bw || !bh) return;
    const mw = m.videoWidth || m.naturalWidth || 16, mh = m.videoHeight || m.naturalHeight || 9, s = Math.max(bw / mw, bh / mh), w = mw * s, h = mh * s;
    const px = w - bw > 1 ? cx.clamp((focus[0] * w - bw / 2) / (w - bw), 0, 1) : 0.5, py = h - bh > 1 ? cx.clamp((focus[1] * h - bh / 2) / (h - bh), 0, 1) : 0.5;
    m.style.objectPosition = (px * 100).toFixed(2) + '% ' + (py * 100).toFixed(2) + '%';
    const x0 = (bw - w) * px, y0 = (bh - h) * py;
    el.style.setProperty('--ox', cx.clamp((x0 + focus[0] * w) / bw * 100, 0, 100).toFixed(2) + '%');
    el.style.setProperty('--oy', cx.clamp((y0 + focus[1] * h) / bh * 100, 0, 100).toFixed(2) + '%');
    // a drawing or a result still may push in by 8 %; a person is never shown above the picture's own size
    const k1 = face ? cx.clamp(1 / s, 1, 1.08) : 1.08, k0 = 1 + (k1 - 1) * 0.3;
    el.style.setProperty('--k1', k1.toFixed(4)); el.style.setProperty('--k0', k0.toFixed(4));
    el.style.setProperty('--dx', ((k0 - 1) * (focus[0] < 0.5 ? 40 : -40)).toFixed(3) + '%'); el.style.setProperty('--dy', ((k0 - 1) * 30).toFixed(3) + '%');
    if (person && !tall) {
      // free room beside the person at the end of the push (the picture grows around the focus point): the caption column gets the wider side
      const fxp = x0 + focus[0] * w, L = Math.max(0, fxp - (fxp - (x0 + person[0] * w)) * k1), R = Math.max(0, bw - (fxp + (x0 + (person[0] + person[2]) * w - fxp) * k1));
      const right = p.side ? p.side === 'right' : R > L + 2;
      el.classList.toggle('right', right);
      el.style.setProperty('--free', Math.max(Math.floor(right ? R : L) - 2, bw * 0.14) + 'px');
    } else el.style.removeProperty('--free');
  };
  place(); m.addEventListener(isVideo ? 'loadedmetadata' : 'load', place);
  if (face) cx.face(m, face);
  if (body) cx.face(m, body, 'body');
  const move = cx.fromWaapi(el);
  return Object.assign(isVideo ? cx.all(move, cx.fromVideo(m)) : move, {fit: place});
}
