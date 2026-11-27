// vis/scramble: a second statement style. The sentence is set in two or three lines, each line opened by a mask that
// wipes across with a gold edge of light while its letters scramble and settle (GSAP ScrambleText, the line's own letters).
// Behind, a slow band of aurora light drifts over a fine field of scan lines (CSS only).
export const css = `
.b-vis-scramble { overflow: hidden; perspective: 1600px; }
.b-vis-scramble .vx-bg { position: absolute; inset: 0; z-index: 0; pointer-events: none; background: linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--gold) 7%, transparent) 50%, transparent 100%); }
.b-vis-scramble .vx-aur { position: absolute; left: -30%; right: -30%; top: 22%; height: 56%; z-index: 0; pointer-events: none; border-radius: 50%; background: radial-gradient(50% 50% at 50% 50%, color-mix(in srgb, var(--gold2) 22%, transparent), color-mix(in srgb, var(--gold) 8%, transparent) 50%, transparent 72%); filter: blur(30px); }
.b-vis-scramble .vx-scan { position: absolute; inset: 0; z-index: 0; pointer-events: none; background: repeating-linear-gradient(0deg, color-mix(in srgb, var(--ink) 7%, transparent) 0 1px, transparent 1px 6px); -webkit-mask-image: radial-gradient(70% 60% at 50% 50%, #000, transparent); mask-image: radial-gradient(70% 60% at 50% 50%, #000, transparent); }
.b-vis-scramble .vx-rule { position: absolute; left: 0; right: 0; height: 1px; background: var(--line); transform-origin: 0 50%; z-index: 0; }
.b-vis-scramble .vx-wrap { position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; justify-content: center; gap: calc(var(--gap) * 0.25); padding: calc(var(--pad) * 0.9 + var(--top)) var(--pad); transform-style: preserve-3d; }
.b-vis-scramble .vx-k { font-size: var(--label); letter-spacing: 0.34em; text-transform: uppercase; color: var(--gold2); margin-bottom: calc(var(--gap) * 0.5); }
:is(.look-white, .look-ivory, .look-paper) .b-vis-scramble .vx-k { color: var(--ivory); }
.b-vis-scramble .vx-line { position: relative; display: block; width: max-content; max-width: 100%; font-size: min(calc(var(--hero) * 0.8), calc((100cqw - var(--pad) * 2) * var(--fit, 0.9) / var(--n, 10))); font-weight: var(--thin); letter-spacing: -0.03em; line-height: 1.14; color: var(--ink); white-space: nowrap; }
.b-vis-scramble .vx-line.serif { font-family: var(--serif); font-weight: 400; font-style: italic; letter-spacing: -0.01em; }
.b-vis-scramble .vx-line .gd { color: var(--gold2); }
.b-vis-scramble .vx-edge { position: absolute; top: 4%; bottom: 4%; width: 3px; left: 0; background: linear-gradient(180deg, transparent, var(--gold2), transparent); box-shadow: 0 0 30px 6px color-mix(in srgb, var(--gold) 45%, transparent); pointer-events: none; }
.b-vis-scramble.long .vx-line { font-size: min(calc(var(--hero) * 0.7), calc((100cqw - var(--pad) * 2) * var(--fit, 0.9) / var(--n, 10))); }
.cs-frame[data-shape="tall"] .b-vis-scramble .vx-line { font-size: calc(var(--hero) * 0.66); white-space: normal; width: auto; margin-left: 0 !important; }
.cs-frame[data-shape="tall"] .b-vis-scramble.long .vx-line { font-size: calc(var(--hero) * 0.5); }
`;
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
  const text = String(p.text || ''), ko = /[가-힣]/.test(text), gold = [].concat(p.gold || []).filter(Boolean).map(String);
  const words = text.split(/\s+/).filter(Boolean), total = text.replace(/\s/g, '').length, W = wid(text);
  const lines = balance(words, W <= 10 ? 1 : W <= 26 ? 2 : 3);
  el.classList.toggle('long', total > (ko ? 30 : 60));
  el.style.setProperty('--n', Math.max(4, ...lines.map(wid)).toFixed(2));
  el.style.setProperty('--fit', (0.98 - 0.06 * (lines.length - 1)).toFixed(2));
  const isGold = (ln) => gold.some((g) => ln.includes(g));
  el.innerHTML = `<i class="vx-bg" aria-hidden="true"></i><i class="vx-aur" aria-hidden="true"></i><i class="vx-scan" aria-hidden="true"></i>${lines.map((_, i) => `<i class="vx-rule" aria-hidden="true" style="top:${(50 + (i - (lines.length - 1) / 2) * 16 + 7).toFixed(1)}%"></i>`).join('')}
    <div class="vx-wrap vis-l1">${p.kicker ? `<div class="vx-k">${cx.esc(p.kicker)}</div>` : ''}${lines.map((ln, i) => `<span class="vx-line${isGold(ln) ? ' serif' : ''}"><span class="vx-txt${isGold(ln) ? ' gd' : ''}">${cx.esc(ln)}</span><i class="vx-edge" aria-hidden="true"></i></span>`).join('')}</div>`;
  const tl = cx.gsap.timeline({paused: true});
  let plug = true; try { cx.plugin('ScrambleTextPlugin'); } catch (e) { plug = false; }
  if (el.querySelector('.vx-k')) cx.pro.rise(tl, el.querySelector('.vx-k'), 0, {y: 12});
  tl.fromTo(el.querySelectorAll('.vx-rule'), {scaleX: 0}, {scaleX: 1, duration: 1.4, ease: 'expo.inOut', stagger: 0.12}, 0);
  el.querySelectorAll('.vx-line').forEach((line, i) => {
    const at = 0.3 + i * 0.55, txt = line.querySelector('.vx-txt'), edge = line.querySelector('.vx-edge'), ln = lines[i];
    tl.fromTo(line, {clipPath: 'inset(-10% 100% -10% 0)', z: -160 - i * 60, opacity: 1}, {clipPath: 'inset(-10% 0% -10% 0)', z: 0, duration: 1.1, ease: 'expo.inOut'}, at);
    tl.fromTo(edge, {left: '0%', opacity: 1}, {left: '100%', duration: 1.1, ease: 'expo.inOut'}, at);
    tl.to(edge, {opacity: 0, duration: 0.4}, at + 1.0);
    if (plug) tl.fromTo(txt, {scrambleText: {text: ln, chars: Array.from(new Set(ln.replace(/\s/g, ''))).join('') || 'X', speed: 0.6}}, {duration: 1.3, scrambleText: {text: ln, chars: Array.from(new Set(ln.replace(/\s/g, ''))).join('') || 'X', revealDelay: 0.5, speed: 0.6}}, at);
  });
  const wrap = el.querySelector('.vx-wrap'), aur = el.querySelector('.vx-aur'), scan = el.querySelector('.vx-scan');
  return cx.vis.ambient(tl, el, (t) => {
    const k = cx.prog(t, 0, 2.4, 'out');
    wrap.style.transform = `translateX(${(-0.6 * Math.max(0, t - 1)).toFixed(2)}px) rotateY(${(-2 + 1.2 * Math.sin(t * 0.15)).toFixed(3)}deg) scale(${(0.9 + 0.1 * k).toFixed(4)})`;
    aur.style.transform = `translateX(${(-18 + 18 * k + Math.sin(t * 0.17) * 6).toFixed(2)}%) rotate(${(-7 + Math.sin(t * 0.11) * 2).toFixed(3)}deg) scaleY(${(0.7 + 0.3 * k).toFixed(3)})`;
    aur.style.opacity = (cx.prog(t, 0, 1.6, 'out') * (0.85 + 0.15 * Math.sin(t * 0.5))).toFixed(3);
    scan.style.backgroundPosition = `0 ${(t * 6).toFixed(1)}px`; scan.style.opacity = (0.6 * cx.prog(t, 0, 1.2, 'out')).toFixed(3);
  });
}
