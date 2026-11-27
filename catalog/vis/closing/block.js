// vis/closing: the last slide. An eclipse of gold light turns slowly behind the title (a WebGL ring with a corona and a
// moving highlight), the title in big serif, the links as real buttons.
export const css = `
.b-vis-closing { overflow: hidden; }
.b-vis-closing .vz-wrap { position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: calc(var(--gap) * 0.6); padding: calc(var(--pad) * 0.8 + var(--top)) var(--pad) var(--pad); }
.b-vis-closing .vz-k { font-size: var(--label); letter-spacing: 0.4em; text-transform: uppercase; color: var(--gold2); }
.b-vis-closing { --rw: 56cqmin; }
.b-vis-closing .vz-t { font-family: var(--serif); font-weight: 400; font-size: min(calc(var(--hero) * 0.74), calc(var(--rw) / var(--n, 6))); line-height: 1.08; letter-spacing: -0.01em; color: var(--ink); }
.b-vis-closing .vz-l { display: block; white-space: nowrap; }
.b-vis-closing .vz-w { display: inline-block; overflow: hidden; padding: 0.04em 0.02em 0.14em; margin-bottom: -0.1em; vertical-align: top; }
.b-vis-closing .vz-c { display: inline-block; }
.b-vis-closing .vz-s { font-size: min(var(--lead), calc(var(--rw) / 16)); color: var(--ivory); font-weight: var(--light); max-width: min(24em, calc(var(--rw) * 0.92)); line-height: 1.32; word-break: keep-all; text-wrap: balance; }
.b-vis-closing .vz-links { display: flex; flex-wrap: wrap; justify-content: center; gap: calc(var(--gap) * 0.55); margin-top: calc(var(--gap) * 0.55); }
.b-vis-closing .vz-links .cs-btn { font-size: min(var(--lead), calc(var(--rw) / var(--ln, 20))); min-height: 44px; padding: 0.62em 1.3em; white-space: nowrap; }
.b-vis-closing .vz-links.stack { flex-direction: column; align-items: center; }
.cs-frame[data-shape="tall"] .b-vis-closing { --rw: calc(100cqw - var(--pad) * 2); }
.cs-frame[data-shape="tall"] .b-vis-closing .vz-t { font-size: min(calc(var(--hero) * 0.8), calc(var(--rw) / var(--n, 6))); }
`;
const FRAG = `
void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);
  float r = length(p), a = atan(p.y, p.x);
  float t = u_t;
  float R = (u_a.x > 0.0 ? u_a.x : 0.36) + 0.006 * sin(t * 0.4);
  float ring = exp(-pow((r - R) * 38.0, 2.0));
  float hl = pow(0.5 + 0.5 * cos(a - t * 0.35), 6.0) + 0.35 * pow(0.5 + 0.5 * cos(a + t * 0.22 + 2.4), 10.0);
  float rays = fbm(vec2(a * 3.0, r * 4.0 - t * 0.15)) * smoothstep(R - 0.02, R + 0.2, r) * smoothstep(R + 0.3, R, r);
  float corona = exp(-max(r - R, 0.0) * 11.0) * smoothstep(R - 0.06, R, r);
  float inner = smoothstep(R, 0.0, r);
  float light = ring * (0.35 + 1.4 * hl) + corona * (0.25 + 0.6 * hl) * (0.6 + 0.8 * rays);
  vec3 col;
  if (u_light > 0.5) {
    // light looks: a crisp thin gold line with a soft glow, the highlight travelling along it
    float px = 1.0 / min(u_res.x, u_res.y);
    float line = 1.0 - smoothstep(0.0012, 0.0012 + 1.6 * px, abs(r - R));
    float glow = exp(-pow((r - R) * 24.0, 2.0));
    col = mix(u_bg, vec3(1.0, 0.97, 0.9), 0.3 * inner + 0.2 * glow);
    col = mix(col, u_gold, clamp(glow * (0.1 + 0.22 * hl) + line * (0.55 + 0.45 * hl), 0.0, 0.95));
  } else {
    col = u_bg * (0.7 + 0.3 * smoothstep(1.2, 0.2, r)) + u_gold * light * 0.75 + u_gold2 * pow(light, 2.0) * 0.6;
    col = mix(col, u_bg * 0.5, inner * 0.55);
  }
  col = mix(u_bg, col, u_p);
  gl_FragColor = vec4(col, 1.0);
}`;
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
export default function mount(el, p, cx) {
  // the words always sit inside the ring: the title is set in balanced lines no wider than the ring (on a tall
  // screen the ring grows past the sides, an arc above and below the words)
  const tall = cx.shape === 'tall', title = String(p.title || ''), W = wid(title);
  const lines = balance(title.split(/\s+/).filter(Boolean), W <= (tall ? 5 : 7) ? 1 : W <= (tall ? 11 : 18) ? 2 : 3);
  el.style.setProperty('--n', (Math.max(3, ...lines.map(wid)) * 1.08).toFixed(2));
  const R = tall ? 0.62 : 0.36;
  const word = (w) => `<span class="vz-w">${Array.from(w).map((c) => `<span class="vz-c">${cx.esc(c)}</span>`).join('')}</span>`;
  const words = lines.map((ln) => `<span class="vz-l">${ln.split(' ').map(word).join(' ')}</span>`).join('');
  const links = (p.links || []).slice(0, 3);
  // the buttons stay inside the ring: their row is at most about 80 % of the ring's inner width (stacked on a phone)
  const one = Math.max(0, ...links.map((l) => wid(l.label) + 2.6)), side = links.reduce((a, l) => a + wid(l.label) + 2.6, 0) + 0.6 * Math.max(0, links.length - 1);
  const stack = tall || side / 0.8 > 26, row = stack ? one : side;
  el.style.setProperty('--ln', Math.max(12, row / 0.9).toFixed(2));
  el.innerHTML = `<div class="vz-wrap vis-l1">${p.kicker ? `<div class="vz-k">${cx.esc(p.kicker)}</div>` : ''}<h2 class="vz-t">${words}</h2>${p.sub ? `<p class="vz-s">${cx.esc(p.sub)}</p>` : ''}
    ${links.length ? `<div class="vz-links${stack ? ' stack' : ''}">${links.map((l, i) => `<a class="cs-btn${i ? ' cs-ghost' : ''}" href="${cx.esc(l.href)}"${/^https?:/.test(l.href) ? ' target="_blank" rel="noopener"' : ''}>${cx.esc(l.label)}</a>`).join('')}</div>` : ''}
    ${p.contact ? `<p class="vz-s" style="font-size:var(--label);letter-spacing:.2em;color:var(--dim)">${cx.esc(p.contact)}</p>` : ''}</div>`;
  const gl = cx.vis.shader(el, FRAG);
  const q = (s) => el.querySelector(s), tl = cx.gsap.timeline({paused: true});
  if (q('.vz-k')) tl.fromTo(q('.vz-k'), {opacity: 0, letterSpacing: '0.9em'}, {opacity: 1, letterSpacing: '0.4em', duration: 1.4, ease: 'expo.out'}, 0.3);
  const cs = el.querySelectorAll('.vz-c');
  tl.fromTo(cs, {yPercent: 110, opacity: 0, filter: 'blur(12px)'}, {yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out', stagger: Math.min(0.05, 1.0 / Math.max(1, cs.length))}, 0.6);
  cx.pro.rise(tl, q('.vz-s'), 1.3, {y: 18});
  cx.pro.rise(tl, el.querySelectorAll('.vz-links a'), 1.55, {y: 20, stagger: 0.12});
  return cx.vis.ambient(tl, el, (t) => gl.draw(t + 2, Math.min(1, t / 1.6), [R, 0, 0, 0]), {dispose: gl.dispose});
}
