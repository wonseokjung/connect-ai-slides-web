// vis/quote: someone's own words. With their clip: the person stands full height on one side (only framed), the quote on
// the free side, a gold quotation mark draws itself and a highlight passes over the words like a voice reading them.
// Without a picture: the quote centred in serif with a slow light behind.
export const css = `
.b-vis-quote { overflow: hidden; }
.b-vis-quote .vq-pic { position: absolute; z-index: 1; top: var(--top); bottom: 0; width: 46%; overflow: hidden; }
.b-vis-quote[data-pic="left"] .vq-pic { left: 0; -webkit-mask-image: linear-gradient(90deg, #000 78%, transparent); mask-image: linear-gradient(90deg, #000 78%, transparent); }
.b-vis-quote[data-pic="right"] .vq-pic { right: 0; -webkit-mask-image: linear-gradient(270deg, #000 78%, transparent); mask-image: linear-gradient(270deg, #000 78%, transparent); }
.b-vis-quote .vq-pic > img, .b-vis-quote .vq-pic > video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-vis-quote .vq-words { position: absolute; z-index: 2; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.6); padding: calc(var(--pad) * 0.8 + var(--top)) var(--pad) var(--pad); }
.b-vis-quote[data-pic="left"] .vq-words { left: 47%; right: 0; padding-left: calc(var(--pad) * 0.4); padding-right: calc(var(--pad) * 0.7); }
.b-vis-quote[data-pic="right"] .vq-words { left: 0; right: 47%; padding-right: calc(var(--pad) * 0.4); padding-left: calc(var(--pad) * 0.7); }
.b-vis-quote[data-pic="none"] .vq-words { left: 0; right: 0; align-items: center; text-align: center; }
.b-vis-quote .vq-mark { width: calc(var(--hero) * 0.7); height: calc(var(--hero) * 0.55); overflow: visible; }
.b-vis-quote .vq-mark path { fill: var(--gold2); fill-opacity: 0; stroke: var(--gold2); stroke-width: 3; stroke-linecap: round; }
.b-vis-quote .vq-t { font-family: var(--serif); font-weight: 400; font-size: calc(var(--title) * 0.86); line-height: 1.22; color: var(--ink); max-width: 18em; text-wrap: pretty; word-break: keep-all; overflow-wrap: anywhere; }
.b-vis-quote .vq-t.long { font-size: calc(var(--title) * 0.54); line-height: 1.32; max-width: 22em; }
.b-vis-quote .vq-words:has(.vq-t.long) { gap: calc(var(--gap) * 0.4); padding-top: calc(var(--pad) * 0.5 + var(--top)); padding-bottom: calc(var(--pad) * 0.6); }
.b-vis-quote .vq-words:has(.vq-t.long) .vq-mark { width: calc(var(--hero) * 0.46); height: calc(var(--hero) * 0.36); }
.b-vis-quote .vq-t.short { font-size: calc(var(--title) * 1.15); }
.b-vis-quote .vq-w { display: inline; color: var(--ink); }
.b-vis-quote .vq-w.g { color: var(--gold2); font-style: italic; }
.b-vis-quote .vq-gk { white-space: nowrap; }
.b-vis-quote .vq-by { display: flex; align-items: center; gap: 1em; font-size: var(--label); letter-spacing: 0.22em; text-transform: uppercase; color: var(--dim); }
.b-vis-quote .vq-by i { width: 3em; height: 1px; background: var(--gold); transform-origin: 0 50%; }
.b-vis-quote .vq-by b { font-weight: 400; color: var(--ink); }
.b-vis-quote .vq-light { position: absolute; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(40% 55% at var(--lx, 30%) 50%, color-mix(in srgb, var(--gold) 18%, transparent), transparent 75%); }
.cs-frame[data-shape="tall"] .b-vis-quote .vq-pic { width: 100%; top: var(--top); bottom: 54%; -webkit-mask-image: linear-gradient(180deg, #000 74%, transparent); mask-image: linear-gradient(180deg, #000 74%, transparent); }
.cs-frame[data-shape="tall"] .b-vis-quote .vq-words { left: 0; right: 0; top: 46%; padding: calc(var(--pad) * 0.4) var(--pad) var(--pad); justify-content: flex-start; gap: calc(var(--gap) * 0.4); }
.cs-frame[data-shape="tall"] .b-vis-quote[data-pic="none"] .vq-words { top: 0; justify-content: center; }
.cs-frame[data-shape="tall"] .b-vis-quote .vq-mark { width: calc(var(--hero) * 0.5); height: calc(var(--hero) * 0.4); }
.cs-frame[data-shape="tall"] .b-vis-quote .vq-t.long { font-size: calc(var(--title) * 0.66); line-height: 1.34; }
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
// balanced lines, measured: the narrowest box that keeps the same number of lines, so no last word sits alone
function balanceBox(t) {
  const box = t.parentElement, key = box ? box.clientWidth : 0; if (!key || t.__bal === key) return; t.__bal = key;
  t.style.maxWidth = ''; const w = t.offsetWidth, h0 = t.offsetHeight; if (!w || !h0) { t.__bal = 0; return; }
  let lo = w * 0.55, hi = w;
  for (let i = 0; i < 9; i++) { const mid = (lo + hi) / 2; t.style.maxWidth = mid + 'px'; if (t.offsetHeight > h0 + 1) lo = mid; else hi = mid; }
  t.style.maxWidth = Math.ceil(hi + 1) + 'px';
}
export default function mount(el, p, cx) {
  const P = cx.pro, pic = !!p.src;
  const textSide = pic ? (p.face ? P.freeSide(p.face, 'right') : 'right') : 'none';
  el.dataset.pic = pic ? (textSide === 'left' ? 'right' : 'left') : 'none';
  const text = String(p.text || ''), gold = [].concat(p.gold || []).filter(Boolean).map(String);
  const marks = []; gold.forEach((g) => { const i = text.indexOf(g); if (i >= 0) marks.push([i, i + g.length]); });
  let pos = 0, html = '';
  // a gold phrase never breaks over two lines
  let open = false;
  text.split(/(\s+)/).forEach((w) => { const a = pos; pos += w.length; if (!w) return; if (/^\s+$/.test(w)) { html += ' '; return; } const g = marks.some((m) => a < m[1] && pos > m[0]); if (g && !open) { html += '<span class="vq-gk">'; open = true; } if (!g && open) { html = html.replace(/ $/, '') + '</span> '; open = false; } html += `<span class="vq-w${g ? ' g' : ''}">${cx.esc(w)}</span>`; });
  if (open) html += '</span>';
  const n = text.replace(/\s/g, '').length, ko = /[가-힣]/.test(text);
  const size = n > (ko ? 60 : 120) ? ' long' : n < (ko ? 18 : 36) ? ' short' : '';
  const ppos = p.pos || (p.face ? `${((p.face[0] + p.face[2] / 2) * 100).toFixed(1)}% ${((p.face[1] + p.face[3] / 2) * 100).toFixed(1)}%` : '50% 40%');
  el.innerHTML = `<i class="vq-light" aria-hidden="true" data-face-ok></i>${pic ? `<div class="vq-pic vis-l2">${P.media({...p, pos: ppos}, 'vq-m', p.by || '')}</div>` : ''}
  <div class="vq-words vis-l1"><svg class="vq-mark" viewBox="0 0 120 90" aria-hidden="true" data-deco><path d="M48 12 C 22 22, 10 42, 12 66 C 14 80, 30 84, 38 76 C 46 68, 42 54, 30 54 C 24 54, 20 56, 18 58" /><path d="M106 12 C 80 22, 68 42, 70 66 C 72 80, 88 84, 96 76 C 104 68, 100 54, 88 54 C 82 54, 78 56, 76 58" /></svg>
    <blockquote class="vq-t${size}">${html}</blockquote>${p.by ? `<div class="vq-by"><i></i><span><b>${cx.esc(p.by)}</b>${p.role ? ' &nbsp;' + cx.esc(p.role) : ''}</span></div>` : ''}</div>`;
  const q = (s) => el.querySelector(s), tl = cx.gsap.timeline({paused: true});
  const m = q('.vq-m');
  if (m) { if (p.face) cx.face(m, p.face); if (p.body) cx.face(m, p.body, 'body'); if (!p.face && !p.body) m.style.transformOrigin = ppos; tl.fromTo(q('.vq-pic'), {clipPath: 'inset(0 0 100% 0)'}, {clipPath: 'inset(0 0 0% 0)', duration: 1.4, ease: 'expo.inOut'}, 0); }
  el.style.setProperty('--lx', el.dataset.pic === 'left' ? '72%' : el.dataset.pic === 'right' ? '28%' : '50%');
  el.querySelectorAll('.vq-mark path').forEach((path, i) => { const L = path.getTotalLength ? path.getTotalLength() : 200; path.style.strokeDasharray = L; tl.fromTo(path, {strokeDashoffset: L}, {strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut'}, 0.3 + i * 0.2); tl.to(path, {fillOpacity: 1, duration: 0.6}, 1.2 + i * 0.1); });
  const ws = el.querySelectorAll('.vq-w');
  const st = Math.min(0.09, 1.8 / Math.max(1, ws.length));
  tl.fromTo(ws, {opacity: 0.14}, {opacity: 1, duration: 0.5, ease: 'power1.out', stagger: st}, 0.6);
  tl.fromTo(ws, {textShadow: '0 0 0px rgba(242,180,90,0)'}, {keyframes: [{textShadow: '0 0 18px rgba(242,180,90,0.55)', duration: 0.25}, {textShadow: '0 0 0px rgba(242,180,90,0)', duration: 0.5}], stagger: st}, 0.6);
  if (q('.vq-by')) { tl.fromTo(q('.vq-by i'), {scaleX: 0}, {scaleX: 1, duration: 0.9, ease: 'expo.out'}, 0.8 + ws.length * st); P.rise(tl, q('.vq-by span'), 0.9 + ws.length * st, {y: 12}); }
  const light = q('.vq-light'), qt = q('.vq-t');
  return cx.vis.ambient(tl, el, (t) => {
    balanceBox(qt);
    light.style.opacity = (cx.prog(t, 0, 1.5, 'out') * (0.8 + 0.2 * Math.sin(t * 0.6))).toFixed(3);
    if (m && (p.face || p.body)) aim(m, p.face, p.body);
    if (m) m.style.transform = `scale(${(1.08 - 0.08 * cx.prog(t, 0, 2.2, 'out') + Math.min(0.06, 0.003 * Math.max(0, t - 2.2))).toFixed(4)})`;
  });
}
