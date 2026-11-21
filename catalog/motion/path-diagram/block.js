// Motion (motion.dev): a hub in the middle, nodes on both sides; each line draws out to its node and the node lights up.
export const css = `
.b-motion-path-diagram .head { position: absolute; left: var(--pad); right: var(--pad); top: calc(var(--pad) * 0.62 + var(--top)); display: flex; flex-direction: column; align-items: center; gap: calc(var(--gap) * 0.4); text-align: center; }
.b-motion-path-diagram .head .cs-title { font-size: calc(var(--title) * 0.62); }
.b-motion-path-diagram .map { position: absolute; left: var(--pad); right: var(--pad); top: calc(var(--pad) * 0.62 + var(--top) + var(--title) * 1.5); bottom: calc(var(--pad) * 0.55); }
.b-motion-path-diagram svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.b-motion-path-diagram svg path { fill: none; stroke: var(--gold); stroke-width: 1.5; opacity: 0.85; }
.b-motion-path-diagram .spine { position: absolute; left: calc(var(--gap) * 0.5); top: 0.6em; bottom: 1.2em; width: 1.5px; background: var(--gold); opacity: 0.85; transform-origin: 50% 0; display: none; }
.b-motion-path-diagram .hub { position: absolute; left: 50%; top: 50%; translate: -50% -50%; width: min(30cqh, 20cqw); aspect-ratio: 1; border-radius: 50%; border: 1.5px solid var(--gold); background: var(--bg); display: grid; place-items: center; text-align: center; padding: 0.6em; font-size: var(--lead); line-height: 1.1; color: var(--ink); box-shadow: 0 0 0 calc(var(--gap) * 0.35) var(--bg), 0 0 0 calc(var(--gap) * 0.35 + 1px) var(--line); }
.b-motion-path-diagram .node { position: absolute; translate: -50% -50%; width: 26%; padding: calc(var(--gap) * 0.5) calc(var(--gap) * 0.7); background: var(--bg2); display: flex; flex-direction: column; gap: 0.2em; }
.b-motion-path-diagram .node.l { left: 13%; text-align: right; align-items: flex-end; }
.b-motion-path-diagram .node.r { left: 87%; }
.b-motion-path-diagram .node b { font-weight: var(--light); font-size: var(--lead); color: var(--ink); line-height: 1.1; }
.b-motion-path-diagram .node span { font-size: calc(var(--body) * 0.9); color: var(--dim); line-height: 1.3; }
.cs-frame[data-shape="tall"] .b-motion-path-diagram .head { position: static; align-items: flex-start; text-align: left; }
.cs-frame[data-shape="tall"] .b-motion-path-diagram .head .cs-title { font-size: var(--title); }
.cs-frame[data-shape="tall"] .b-motion-path-diagram .map { position: relative; inset: auto; display: flex; flex-direction: column; gap: calc(var(--gap) * 0.7); padding-left: calc(var(--gap) * 1.5); }
.cs-frame[data-shape="tall"] .b-motion-path-diagram svg { display: none; }
.cs-frame[data-shape="tall"] .b-motion-path-diagram .spine { display: block; }
.cs-frame[data-shape="tall"] .b-motion-path-diagram .hub { position: relative; left: auto; top: auto; translate: none; width: auto; aspect-ratio: auto; border-radius: 999px; padding: 0.5em 1.1em; align-self: flex-start; margin-left: calc(var(--gap) * -1.5); box-shadow: none; }
.cs-frame[data-shape="tall"] .b-motion-path-diagram .node { position: relative; left: auto !important; top: auto !important; translate: none; width: auto; text-align: left; align-items: flex-start; padding: calc(var(--gap) * 0.55) calc(var(--gap) * 0.8); }
.cs-frame[data-shape="tall"] .b-motion-path-diagram .node b { font-size: var(--lead); }
.cs-frame[data-shape="tall"] .b-motion-path-diagram .node span { font-size: var(--body); }
`;
export default function mount(el, p, cx) {
  const {animate} = cx.motion, tall = cx.shape === 'tall';
  const nodes = (p.nodes || []).slice(0, 6).map((n) => (typeof n === 'string' ? {title: n} : n));
  const left = nodes.filter((_, i) => i % 2 === 0), right = nodes.filter((_, i) => i % 2 === 1);
  const ys = (k, i) => (k === 1 ? 50 : 12 + (76 / (k - 1)) * i);
  const pos = nodes.map((n, i) => { const side = i % 2 === 0 ? 'l' : 'r', grp = side === 'l' ? left : right, j = Math.floor(i / 2); return {side, y: ys(grp.length, j)}; });
  el.innerHTML = `${tall ? '<div class="cs-pad">' : ''}
    <div class="head">${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}${p.title ? `<h2 class="cs-title">${cx.esc(p.title)}</h2>` : ''}</div>
    <div class="map">
      <svg aria-hidden="true">${tall ? '' : nodes.map(() => '<path pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>').join('')}</svg><i class="spine" aria-hidden="true"></i>
      <div class="hub">${cx.esc(p.hub || '')}</div>
      ${nodes.map((n, i) => `<div class="node cs-card ${pos[i].side}" style="top:${pos[i].y}%"><b>${cx.esc(n.title)}</b>${n.text ? `<span>${cx.esc(n.text)}</span>` : ''}</div>`).join('')}
    </div>${tall ? '</div>' : ''}`;
  const list = [], head = el.querySelectorAll('.head > *');
  if (head.length) list.push(animate(head, {opacity: [0, 1], y: [18, 0]}, {duration: 0.6, delay: cx.motion.stagger(0.08), ease: [0.16, 1, 0.3, 1]}));
  list.push(animate(el.querySelector('.hub'), {opacity: [0, 1]}, {duration: 0.3, delay: 0.25}));
  list.push(animate(el.querySelector('.hub'), {scale: [0.5, 1]}, {type: 'spring', bounce: 0.35, visualDuration: 0.55, delay: 0.25}));
  const t0 = 0.7, each = 0.2, ns = el.querySelectorAll('.node'), ps = el.querySelectorAll('svg path'), map = el.querySelector('.map'), svg = el.querySelector('svg');
  // the curves are drawn in real pixels of the map, and redrawn when the page is resized
  const draw = () => { const W = map.clientWidth, H = map.clientHeight; if (!W || tall) return; svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    ps.forEach((path, i) => { const q = pos[i], x = (q.side === 'l' ? 0.26 : 0.74) * W, mx = (q.side === 'l' ? 0.38 : 0.62) * W, y = (q.y / 100) * H; path.setAttribute('d', `M${W / 2} ${H / 2} C ${mx} ${H / 2}, ${mx} ${y}, ${x} ${y}`); }); };
  draw();
  if (tall) list.push(animate(el.querySelector('.spine'), {scaleY: [0, 1]}, {duration: each * nodes.length + 0.5, delay: t0, ease: 'easeInOut'}));
  ns.forEach((n, i) => {
    if (!tall) list.push(animate(ps[i], {strokeDashoffset: [1, 0]}, {duration: 0.6, delay: t0 + each * i, ease: [0.4, 0, 0.2, 1]}));
    const dx = tall ? -18 : pos[i].side === 'l' ? 24 : -24;
    list.push(animate(n, {opacity: [0, 1], x: [dx, 0]}, {duration: 0.55, delay: t0 + each * i + (tall ? 0.15 : 0.4), ease: [0.16, 1, 0.3, 1]}));
  });
  const clip = cx.fromMotion(list, {dur: t0 + each * (nodes.length - 1) + 1.15});
  clip.fit = draw;
  return clip;
}
