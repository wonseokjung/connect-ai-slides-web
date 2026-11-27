// vis/cover: the first slide as a film title. Gold silk light flows in a living shader behind; the title rises letter by
// letter out of a mask while it comes into focus, a gold hairline draws, the kicker scrambles in. A photo or clip sits in a
// tall cinematic frame on the free side and slowly pushes in (scale only; a person is never tilted or covered).
export const css = `
.b-vis-cover { overflow: hidden; }
.b-vis-cover .vc-media { position: absolute; z-index: 1; top: var(--top); bottom: 0; width: 48%; overflow: hidden; }
.b-vis-cover[data-media="right"] .vc-media { right: 0; -webkit-mask-image: linear-gradient(270deg, #000 80%, transparent); mask-image: linear-gradient(270deg, #000 80%, transparent); }
.b-vis-cover[data-media="left"] .vc-media { left: 0; -webkit-mask-image: linear-gradient(90deg, #000 80%, transparent); mask-image: linear-gradient(90deg, #000 80%, transparent); }
.b-vis-cover .vc-media > img, .b-vis-cover .vc-media > video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-vis-cover .vc-words { position: absolute; z-index: 2; inset: 0; padding: calc(var(--pad) * 0.8 + var(--top)) var(--pad) calc(var(--pad) * 0.8); display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.55); }
.b-vis-cover[data-media="right"] .vc-words { right: 48%; padding-right: calc(var(--pad) * 0.25); padding-left: calc(var(--pad) * 0.5); }
.b-vis-cover[data-media="left"] .vc-words { left: 48%; padding-left: calc(var(--pad) * 0.25); padding-right: calc(var(--pad) * 0.5); }
.b-vis-cover[data-media="none"] .vc-words { align-items: center; text-align: center; }
.b-vis-cover .vc-k { font-size: var(--label); letter-spacing: 0.36em; text-transform: uppercase; color: var(--gold2); font-weight: 400; min-height: 1.3em; white-space: nowrap; }
.b-vis-cover { --cap: calc(var(--hero) * 0.92); --cw: calc(52cqw - var(--pad) * 0.75); }
.b-vis-cover[data-media="none"] { --cap: calc(var(--hero) * 1.08); --cw: calc(92cqw - var(--pad) * 2); }
.b-vis-cover .vc-t { font-family: var(--serif); font-weight: 400; font-size: min(var(--cap), calc(var(--cw) / var(--n, 8))); line-height: 1.1; letter-spacing: -0.012em; color: var(--ink); }
.b-vis-cover .vc-l { display: block; white-space: nowrap; }
.b-vis-cover .vc-w { display: inline-block; overflow: hidden; padding: 0.04em 0.02em 0.14em; margin-bottom: -0.1em; vertical-align: top; }
.b-vis-cover .vc-c { display: inline-block; will-change: transform, opacity, filter; }
.b-vis-cover .vc-gold .vc-c { color: var(--gold2); }
.b-vis-cover .vc-rule { display: block; width: min(62%, 14em); height: 1.5px; background: linear-gradient(90deg, var(--gold2), color-mix(in srgb, var(--gold) 20%, transparent)); transform-origin: 0 50%; font-size: var(--lead); }
.b-vis-cover[data-media="none"] .vc-rule { transform-origin: 50% 50%; background: linear-gradient(90deg, transparent, var(--gold2), transparent); }
.b-vis-cover .vc-s { font-size: var(--lead); font-weight: var(--light); color: var(--ivory); line-height: 1.3; max-width: 26em; }
.b-vis-cover .vc-by { font-size: calc(var(--label) * 0.95); letter-spacing: 0.24em; text-transform: uppercase; color: var(--dim); margin-top: calc(var(--gap) * 0.4); }
.b-vis-cover .vc-shade { position: absolute; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(56% 80% at 26% 46%, color-mix(in srgb, var(--bg) 84%, transparent), color-mix(in srgb, var(--bg) 50%, transparent) 60%, transparent 90%); }
.b-vis-cover[data-media="left"] .vc-shade { background: radial-gradient(56% 80% at 74% 46%, color-mix(in srgb, var(--bg) 84%, transparent), color-mix(in srgb, var(--bg) 50%, transparent) 60%, transparent 90%); }
.b-vis-cover[data-media="none"] .vc-shade { background: radial-gradient(60% 50% at 50% 50%, color-mix(in srgb, var(--bg) 50%, transparent), transparent 75%); }
.cs-frame[data-shape="tall"] .b-vis-cover .vc-media { left: 0; right: 0; width: auto; top: var(--top); bottom: 44%; -webkit-mask-image: linear-gradient(180deg, #000 72%, transparent); mask-image: linear-gradient(180deg, #000 72%, transparent); }
.cs-frame[data-shape="tall"] .b-vis-cover .vc-words { left: 0; right: 0; top: 56%; justify-content: flex-start; padding: calc(var(--pad) * 0.3) var(--pad) var(--pad); }
.cs-frame[data-shape="tall"] .b-vis-cover[data-media="none"] .vc-words { top: 0; justify-content: center; }
.cs-frame[data-shape="tall"] .b-vis-cover { --cap: calc(var(--hero) * 0.92); --cw: calc(100cqw - var(--pad) * 2); }
.cs-frame[data-shape="tall"] .b-vis-cover .vc-shade { background: linear-gradient(0deg, color-mix(in srgb, var(--bg) 60%, transparent), transparent 60%); }
`;
const FRAG = `
float hgt(vec2 p, float t){
  vec2 q = vec2(noise(p * 0.8 + vec2(t, -t * 0.5)), noise(p * 0.8 + vec2(-t * 0.6, t * 0.8) + 4.2));
  return 0.35 * noise(p * 0.9 + q * 1.6) + 0.6 * sin(p.x * 1.3 - p.y * 2.1 + q.x * 2.6 + q.y * 1.4 + t * 2.0) + 0.25 * sin(p.x * 0.7 + p.y * 1.1 - q.y * 2.0 - t * 1.3);
}
void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = uv * vec2(u_res.x / u_res.y, 1.0) * 2.1;
  float t = u_t * 0.045;
  float e = 0.02;
  float h = hgt(p, t);
  vec3 n = normalize(vec3(hgt(p + vec2(e, 0.0), t) - h, hgt(p + vec2(0.0, e), t) - h, 0.016));
  vec3 L = normalize(vec3(-0.5, 0.6, 0.62));
  float diff = max(dot(n, L), 0.0);
  float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 10.0);
  float band = smoothstep(0.0, 1.0, 1.0 - abs(uv.y - 0.62 + (uv.x - 0.5) * 0.55) * 1.6);
  float vig = smoothstep(1.3, 0.3, length((uv - vec2(0.55, 0.55)) * vec2(1.0, 1.25)));
  vec3 col;
  if (u_light > 0.5) {
    vec3 warm = vec3(1.0, 0.95, 0.86);
    col = mix(u_bg * 0.95, mix(u_bg, warm, 0.6), pow(diff, 1.5) * (0.5 + 0.5 * band));
    col += u_gold * 0.10 * spec * band;
    col = mix(u_bg * 0.96, col, 0.75 + 0.25 * vig);
  } else {
    float lit = pow(diff, 2.2) * (0.25 + 0.95 * band) * vig;
    col = u_bg * 0.7 + u_gold * 0.42 * lit + u_gold2 * (0.55 * spec * band * vig + 0.12 * lit * lit);
  }
  col = mix(u_bg, col, u_p);
  gl_FragColor = vec4(col, 1.0);
}`;
// a person stays centred in the window of its box with the head inside (object-fit: cover; measured once the slide has a size)
// width of a line in em (Hangul and CJK about 1, capitals 0.64, others 0.52, a space 0.27)
const wid = (s) => Array.from(String(s)).reduce((a, c) => a + (/[가-힣ㄱ-ㅎ一-龥ぁ-ゟ゠-ヿ]/.test(c) ? 0.96 : /[A-Z]/.test(c) ? 0.64 : /\s/.test(c) ? 0.27 : /[.,:;!'’"]/.test(c) ? 0.3 : 0.52), 0);
// words into k lines with the widest line as narrow as possible: balanced lines, never one short word alone
function balance(words, k) {
  k = Math.max(1, Math.min(k, words.length)); if (k === 1) return [words.join(' ')];
  let best = null;
  const go = (at, left, acc) => {
    if (left === 1) { const ln = acc.concat([words.slice(at).join(' ')]), m = Math.max(...ln.map(wid)); if (!best || m < best.m - 1e-6) best = {m, ln}; return; }
    for (let i = at + 1; i <= words.length - left + 1; i++) go(i, left - 1, acc.concat([words.slice(at, i).join(' ')]));
  };
  go(0, k, []);
  return best.ln;
}
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
  const P = cx.pro, tall = cx.shape === 'tall', pic = !!p.src;
  const textSide = P.freeSide(p.face, 'left');
  const media = pic ? (textSide === 'left' ? 'right' : 'left') : 'none';
  el.dataset.media = media;
  const title = String(p.title || ''), W = wid(title), lim = tall ? [5.5, 11] : media === 'none' ? [10, 24] : [7, 20];
  const lines = balance(title.split(/\s+/).filter(Boolean), W <= lim[0] ? 1 : W <= lim[1] ? 2 : 3);
  el.style.setProperty('--n', (Math.max(3, ...lines.map(wid)) * 1.04).toFixed(2));
  const gold = [].concat(p.gold || []).filter(Boolean).map(String);
  const word = (w) => `<span class="vc-w${gold.some((g) => g.split(/\s+/).includes(w)) ? ' vc-gold' : ''}">${Array.from(w).map((c) => `<span class="vc-c">${cx.esc(c)}</span>`).join('')}</span>`;
  const words = lines.map((ln) => `<span class="vc-l">${ln.split(' ').map(word).join(' ')}</span>`).join('');
  const pos = p.pos || (p.face ? `${((p.face[0] + p.face[2] / 2) * 100).toFixed(1)}% ${((p.face[1] + p.face[3] / 2) * 100).toFixed(1)}%` : '50% 50%');
  el.innerHTML = `${pic ? `<div class="vc-media vis-l2">${P.media({...p, pos}, 'vc-m', title)}</div>` : ''}<i class="vc-shade" aria-hidden="true" data-face-ok></i>
  <div class="vc-words vis-l1">
    ${p.kicker ? `<div class="vc-k"><span>${cx.esc(p.kicker)}</span></div>` : ''}
    <h1 class="vc-t">${words}</h1>
    <i class="vc-rule" aria-hidden="true"></i>
    ${p.sub ? `<p class="vc-s">${cx.esc(p.sub)}</p>` : ''}
    ${p.by ? `<p class="vc-by">${cx.esc(p.by)}</p>` : ''}
  </div>`;
  const q = (s) => el.querySelector(s);
  const gl = cx.vis.shader(el, FRAG);
  gl.canvas.setAttribute('data-face-ok', ''); // the light is drawn behind the picture, never on it
  const tl = cx.gsap.timeline({paused: true});
  const m = q('.vc-m');
  if (m) {
    if (p.face) cx.face(m, p.face); if (p.body) cx.face(m, p.body, 'body');
    if (!p.face && !p.body) m.style.transformOrigin = pos;
    tl.fromTo(q('.vc-media'), {clipPath: tall ? 'inset(100% 0 0 0)' : 'inset(0 0 100% 0)'}, {clipPath: 'inset(0% 0 0% 0)', duration: 1.6, ease: 'expo.inOut'}, 0.1);
  }
  const kick = q('.vc-k span');
  if (kick) {
    try { cx.plugin('ScrambleTextPlugin'); tl.fromTo(kick, {opacity: 0}, {opacity: 1, duration: 0.3}, 0.2); tl.to(kick, {duration: 1.2, scrambleText: {text: p.kicker, chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', revealDelay: 0.35, speed: 0.5}}, 0.2); }
    catch (e) { tl.fromTo(kick, {opacity: 0, x: -12}, {opacity: 1, x: 0, duration: 0.8}, 0.2); }
  }
  const cs = el.querySelectorAll('.vc-c');
  tl.fromTo(cs, {yPercent: 115, opacity: 0, filter: 'blur(14px)'}, {yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1.25, ease: 'expo.out', stagger: Math.min(0.05, 1.1 / Math.max(1, cs.length))}, 0.45);
  tl.fromTo(q('.vc-rule'), {scaleX: 0}, {scaleX: 1, duration: 1.3, ease: 'expo.inOut'}, 0.9);
  P.rise(tl, q('.vc-s'), 1.25, {y: 22});
  P.rise(tl, q('.vc-by'), 1.5, {y: 12});
  const dur = tl.duration();
  return cx.vis.ambient(tl, el, (t) => {
    gl.draw(t + 3, Math.min(1, t / 1.2));
    if (m && (p.face || p.body)) aim(m, p.face, p.body);
    if (m) m.style.transform = `scale(${(1.16 - 0.12 * cx.prog(t, 0, 2.4, 'out') + 0.0025 * Math.max(0, t - 2.4)).toFixed(4)})`;
  }, {dispose: gl.dispose, dur});
}
