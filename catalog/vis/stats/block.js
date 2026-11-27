// vis/stats: numbers that land like an odometer. Each digit rolls on its own strip and stops on its value, a ring
// (one number) or an arc (two to four) draws around it and a bead of light keeps running on it.
export const css = `
.b-vis-stats .pro-body { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); gap: calc(var(--gap) * 1.2); align-items: center; }
.b-vis-stats .st-it { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; min-width: 0; height: 100%; }
.b-vis-stats .st-num { position: relative; z-index: 2; display: flex; align-items: baseline; justify-content: center; font-size: calc(var(--hero) * 1.1); font-weight: var(--thin); letter-spacing: -0.04em; line-height: 1; color: var(--ink); white-space: nowrap; }
.b-vis-stats[data-n="1"] .st-num { font-size: calc(var(--hero) * 1.7); }
.b-vis-stats .st-c { position: relative; display: inline-block; }
.b-vis-stats .st-c.dg { color: transparent; height: 1em; line-height: 1; vertical-align: top; overflow: visible; }
.b-vis-stats .st-num { align-items: flex-start; }
.b-vis-stats .st-fx { align-self: flex-end; margin-bottom: 0.08em; }
.b-vis-stats .st-strip { position: absolute; left: -0.05em; right: -0.05em; top: 0; height: 1em; overflow: hidden; color: var(--ink); -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 22%, #000 78%, transparent 100%); mask-image: linear-gradient(180deg, transparent 0%, #000 22%, #000 78%, transparent 100%); }
.b-vis-stats .st-strip > span { display: flex; flex-direction: column; line-height: 1; }
.b-vis-stats .st-strip > span > i { font-style: normal; height: 1em; display: block; text-align: center; }
.b-vis-stats .st-fx { font-size: 0.5em; color: var(--gold2); letter-spacing: 0.02em; margin-left: 0.06em; }
.b-vis-stats .st-fx.pre { margin: 0 0.12em 0 0; }
.b-vis-stats .st-lab { position: relative; z-index: 2; margin-top: calc(var(--gap) * 0.05); font-size: calc(var(--lead) * 1.08); color: var(--ink); max-width: 14em; line-height: 1.3; }
.b-vis-stats[data-n="1"] .st-lab { font-size: calc(var(--lead) * 1.1); margin-top: calc(var(--gap) * 0.9); }
.b-vis-stats .st-ring { position: absolute; left: 50%; top: 50%; z-index: 1; overflow: visible; pointer-events: none; }
.b-vis-stats .st-ring.flow { position: relative; left: auto; top: auto; margin-top: calc(var(--gap) * 0.25); max-width: 100%; height: auto; }
.b-vis-stats .st-ring .tr { fill: none; stroke: var(--faint); }
.b-vis-stats .st-ring .rg { fill: none; stroke: var(--gold); stroke-linecap: round; }
.b-vis-stats .st-nt { grid-column: 1 / -1; text-align: center; font-size: calc(var(--body) * 0.8); color: var(--dim); }
.cs-frame[data-shape="tall"] .b-vis-stats .pro-body { grid-template-columns: 1fr; grid-auto-rows: minmax(0, 1fr); gap: calc(var(--gap) * 0.4); }
.cs-frame[data-shape="tall"] .b-vis-stats .st-num { font-size: calc(var(--hero) * 0.9); }
.cs-frame[data-shape="tall"] .b-vis-stats[data-n="1"] .st-num { font-size: calc(var(--hero) * 1.5); }
.cs-frame[data-shape="tall"] .b-vis-stats .st-lab { font-size: var(--body); margin-top: 0.4em; }
`;
export default function mount(el, p, cx) {
  const P = cx.pro, esc = cx.esc, tall = cx.shape === 'tall';
  const items = (p.items || []).slice(0, 4).map((x) => ({value: String(x.value == null ? '' : x.value), label: x.label || ''}));
  const n = Math.max(1, items.length);
  el.dataset.n = n; el.style.setProperty('--n', tall ? 1 : n);
  const numHtml = (v) => {
    const info = P.num(v);
    const core = info ? P.fmt(info.n, info.dec, info.comma) : v, pre = info ? info.pre.trim() : '', suf = info ? info.suf.trim() : '';
    let k = 0;
    const chars = Array.from(core).map((ch) => {
      if (!/\d/.test(ch)) return `<span class="st-c">${esc(ch)}</span>`;
      const target = +ch, turns = 1 + (k++ % 2);
      const seq = []; for (let r = 0; r <= turns; r++) for (let dd = 0; dd < 10; dd++) seq.push(dd);
      return `<span class="st-c dg" data-to="${turns * 10 + target}">${ch}<span class="st-strip" aria-hidden="true" data-deco><span>${seq.map((dd) => `<i>${dd}</i>`).join('')}</span></span></span>`;
    }).join('');
    return `<div class="st-num cs-num">${pre ? `<span class="st-fx pre">${esc(pre)}</span>` : ''}${chars}${suf ? `<span class="st-fx">${esc(suf)}</span>` : ''}</div>`;
  };
  el.innerHTML = `<i class="pro-glow" style="--gx:50%;--gy:50%"></i><div class="pro-wrap">${P.head(p)}<div class="pro-body vis-l2">
    ${items.map((it) => `<div class="st-it">${numHtml(it.value)}${it.label ? `<p class="st-lab">${esc(it.label)}</p>` : ''}</div>`).join('')}
    ${p.note ? `<p class="st-nt">${esc(p.note)}</p>` : ''}</div>${P.foot(cx)}</div>`;
  // the ring / arc: sized from the number it holds
  const k = el.getBoundingClientRect().width / (el.offsetWidth || 1) || 1;
  const rings = [...el.querySelectorAll('.st-it')].map((it, i) => {
    const nb = it.querySelector('.st-num').getBoundingClientRect(), ib = it.getBoundingClientRect();
    const w = nb.width / k, h = nb.height / k, cyOff = (nb.top + nb.height / 2 - (ib.top + ib.height / 2)) / k;
    const one = n === 1;
    const r = Math.max(w * 0.62, h * 0.95);
    const sw = one ? 3 : 2.6;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'st-ring'); svg.setAttribute('aria-hidden', 'true'); svg.dataset.deco = '';
    let d, vb, sw0, sh0;
    if (one) {
      const pt = (a) => [Math.cos(a * Math.PI / 180) * r, Math.sin(a * Math.PI / 180) * r];
      const [sx, sy] = pt(-90), [ex, ey] = pt(269.99);
      d = `M${sx} ${sy} A${r} ${r} 0 1 1 ${ex} ${ey}`; vb = `${-r - 30} ${-r - 30} ${r * 2 + 60} ${r * 2 + 60}`; sw0 = r * 2 + 60; sh0 = r * 2 + 60;
      svg.style.transform = `translate(-50%, calc(-50% + ${cyOff}px))`;
    } else {
      // several numbers: a shallow arc of light under each number, between it and its label
      const hw = Math.max(w * 0.62, h * 0.85), sag = h * 0.04;
      d = `M${-hw} 0 Q 0 ${sag * 2} ${hw} 0`; vb = `${-hw - 30} -30 ${hw * 2 + 60} ${sag * 2 + 60}`; sw0 = hw * 2 + 60; sh0 = sag * 2 + 60;
      svg.classList.add('flow');
    }
    svg.setAttribute('width', sw0); svg.setAttribute('height', sh0); svg.setAttribute('viewBox', vb);
    svg.innerHTML = `<defs><radialGradient id="stB${i}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFF4DC"/><stop offset="0.35" stop-color="var(--gold2)" stop-opacity="0.9"/><stop offset="1" stop-color="var(--gold)" stop-opacity="0"/></radialGradient><filter id="stG${i}" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="6"/></filter></defs>
      <path class="tr" d="${d}" stroke-width="${sw}"/><path class="rg glow" d="${d}" stroke-width="${sw * 5}" opacity="0.28" filter="url(#stG${i})"/><path class="rg" d="${d}" stroke-width="${sw}"/><circle class="bead" r="${one ? 22 : 16}" fill="url(#stB${i})"/>`;
    if (one) it.insertBefore(svg, it.firstChild); else it.insertBefore(svg, it.querySelector('.st-lab'));
    const paths = [...svg.querySelectorAll('.rg')], L = paths[0].getTotalLength();
    paths.forEach((q) => { q.style.strokeDasharray = L; q.style.strokeDashoffset = L; });
    return {svg, paths, L, bead: svg.querySelector('.bead'), track: svg.querySelector('.tr')};
  });
  const tl = cx.gsap.timeline({paused: true});
  const t0 = P.headIn(tl, el);
  const its = [...el.querySelectorAll('.st-it')];
  its.forEach((it, i) => {
    const at = t0 + i * 0.22;
    tl.fromTo(it.querySelector('.st-num'), {opacity: 0, scale: 0.86, filter: 'blur(14px)'}, {opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.0, ease: 'expo.out'}, at);
    it.querySelectorAll('.st-c.dg').forEach((c, j, all) => {
      const strip = c.querySelector('.st-strip > span'), to = +c.dataset.to;
      tl.fromTo(strip, {yPercent: 0}, {yPercent: -(to / ((Math.floor(to / 10) + 1) * 10)) * 100, duration: 1.6 + (all.length - j) * 0.12, ease: 'expo.out'}, at + 0.05);
    });
    tl.fromTo(it.querySelectorAll('.st-fx'), {opacity: 0, y: 12}, {opacity: 1, y: 0, duration: 0.7, ease: 'expo.out'}, at + 0.9);
    P.rise(tl, it.querySelector('.st-lab'), at + 0.7, {y: 18});
    const rg = rings[i];
    tl.fromTo(rg.track, {opacity: 0}, {opacity: 1, duration: 0.6}, at);
    tl.to(rg.paths, {strokeDashoffset: 0, duration: 1.8, ease: 'power3.inOut'}, at + 0.2);
  });
  // when the strips have landed, the real digits take over (the words a PowerPoint export reads are the real ones)
  const LAND = t0 + (n - 1) * 0.22 + 2.3;
  tl.set(el.querySelectorAll('.st-c.dg'), {color: 'var(--ink)'}, LAND);
  tl.set(el.querySelectorAll('.st-strip'), {opacity: 0}, LAND);
  P.rise(tl, el.querySelector('.st-nt'), LAND - 0.6, {y: 10});
  function draw(t) {
    rings.forEach((rg, i) => {
      const start = t0 + i * 0.22 + 0.2, f = Math.max(0, Math.min(1, (t - start) / 1.8));
      const e = f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2;
      // the bead leads the drawing, then keeps circling (a ring) or sweeping back and forth (an arc)
      let ph = e;
      if (f >= 1) { const extra = (t - start - 1.8) / (n === 1 ? 5 : 3.2); ph = n === 1 ? extra % 1 : 0.5 - 0.5 * Math.cos(Math.PI * 2 * extra + Math.PI); if (n === 1) ph = (1 + ph) % 1; }
      const pt = rg.paths[0].getPointAtLength(rg.L * ph);
      rg.bead.setAttribute('cx', pt.x); rg.bead.setAttribute('cy', pt.y);
      rg.bead.style.opacity = t < start ? 0 : 1;
    });
  }
  draw(0);
  return cx.vis.ambient(tl, el, draw, {dur: LAND + 0.3});
}
