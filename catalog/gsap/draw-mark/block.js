// GSAP DrawSVG: one sentence; a hand-drawn ring (or underline) is drawn around one key word, which turns gold.
export const css = `
.b-gsap-draw-mark .sent { font-size: calc(var(--title) * 1.12); font-weight: var(--thin); letter-spacing: -0.028em; line-height: 1.16; color: var(--ink); max-width: 13.5em; text-wrap: balance; }
.b-gsap-draw-mark .cs-w { margin-right: 0; }
.b-gsap-draw-mark .key { position: relative; display: inline-block; white-space: nowrap; margin: 0 0.1em; }
.b-gsap-draw-mark .key svg { position: absolute; left: 0; top: 0; overflow: visible; pointer-events: none; }
.b-gsap-draw-mark .key path { opacity: 0; fill: none; stroke: var(--gold); stroke-linecap: round; stroke-linejoin: round; }
.cs-frame[data-shape="tall"] .b-gsap-draw-mark .sent { font-size: calc(var(--title) * 1.05); }
`;
export default function mount(el, p, cx) {
  cx.plugin('DrawSVGPlugin');
  const g = cx.gsap, text = String(p.text || ''), key = String(p.mark || '').trim();
  const at = key ? text.toLowerCase().indexOf(key.toLowerCase()) : -1;
  const sent = at < 0 ? cx.spans(text, 'cs-w')
    : cx.spans(text.slice(0, at), 'cs-w') + `<span class="key"><span class="kw">${cx.esc(text.slice(at, at + key.length))}</span><svg aria-hidden="true"><path d="M0 0"/></svg></span>` + cx.spans(text.slice(at + key.length), 'cs-w');
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    <p class="sent">${sent}</p>
    ${p.by ? `<div class="cs-label">${cx.esc(p.by)}</div>` : ''}
  </div>`;
  const q = (s) => el.querySelector(s), keyEl = q('.key'), under = p.style === 'underline';
  function shape() {
    if (!keyEl) return;
    const w = keyEl.offsetWidth, h = keyEl.offsetHeight, svg = keyEl.querySelector('svg'), path = svg.querySelector('path');
    svg.setAttribute('width', w); svg.setAttribute('height', h); svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    const sw = Math.max(2, h * 0.04); path.style.strokeWidth = sw + 'px';
    let d = '';
    if (under) {
      const y = h * 0.98;
      d = `M${-w * 0.02} ${y} C${w * 0.3} ${y - h * 0.07}, ${w * 0.7} ${y + h * 0.05}, ${w * 1.03} ${y - h * 0.03} C${w * 0.75} ${y + h * 0.1}, ${w * 0.45} ${y + h * 0.1}, ${w * 0.16} ${y + h * 0.14}`;
    } else {
      // a ring drawn by hand: a little more than one turn, the end passes the start
      const cxp = w / 2, cyp = h * 0.53, rx = w / 2 + h * 0.17, ry = h * 0.55, n = 64, a0 = -2.5, turn = Math.PI * 2 * 1.07;
      for (let i = 0; i <= n; i++) {
        const k = i / n, a = a0 + turn * k, grow = 1 + 0.05 * k, wob = 1 + 0.025 * Math.sin(a * 3 + 0.6);
        d += (i ? 'L' : 'M') + (cxp + rx * grow * wob * Math.cos(a)).toFixed(1) + ' ' + (cyp + ry * grow * (2 - wob) * Math.sin(a)).toFixed(1);
      }
    }
    path.setAttribute('d', d);
  }
  let tl = null, cur = 0;
  function make() {
    if (tl) tl.kill();
    shape();
    tl = g.timeline({paused: true});
    if (q('.cs-kicker')) tl.fromTo(q('.cs-kicker'), {opacity: 0, x: -20}, {opacity: 1, x: 0, duration: 0.6, ease: 'power3.out'}, 0);
    const parts = el.querySelectorAll('.sent > .cs-w, .sent > .key');
    tl.fromTo(parts, {opacity: 0, y: 30}, {opacity: 1, y: 0, duration: 0.75, ease: 'expo.out', stagger: 0.055}, 0.12);
    const t1 = 0.12 + 0.055 * parts.length + 0.45;
    if (keyEl) {
      tl.set(keyEl.querySelector('path'), {opacity: 1}, t1);
      tl.fromTo(keyEl.querySelector('path'), {drawSVG: '0%'}, {drawSVG: '100%', duration: 0.85, ease: 'power2.inOut'}, t1);
      tl.fromTo(keyEl.querySelector('.kw'), {color: 'inherit'}, {color: getComputedStyle(el).getPropertyValue('--gold2').trim() || '#F2B45A', duration: 0.5, ease: 'power1.out'}, t1 + 0.2);
    }
    if (q('.cs-label')) tl.fromTo(q('.cs-label'), {opacity: 0, y: 12}, {opacity: 1, y: 0, duration: 0.6, ease: 'power3.out'}, t1 + 0.7);
    tl.time(Math.min(cur, tl.duration()), false);
  }
  make();
  return {lib: 'gsap', dur: tl.duration(), steps: [], seek(t) { cur = t; tl.time(Math.min(t, tl.duration()), false); }, fit() { make(); }, dispose() { tl.kill(); }};
}
