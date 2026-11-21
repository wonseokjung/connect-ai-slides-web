// Motion (motion.dev): a statement appears word by word out of a blur. One word can be gold.
export const css = `
.b-motion-blur-words .cs-title { max-width: 15em; }
.b-motion-blur-words .cs-w { margin-right: 0.24em; }
.b-motion-blur-words .cs-w.on { color: var(--gold2); }
.b-motion-blur-words.short .cs-title { font-size: calc(var(--hero) * 0.86); max-width: 12em; line-height: 1.0; letter-spacing: -0.035em; }
.cs-frame[data-shape="tall"] .b-motion-blur-words.short .cs-title { font-size: calc(var(--title) * 1.25); }
`;
export default function mount(el, p, cx) {
  const {animate, stagger} = cx.motion;
  const gold = String(p.gold || '').toLowerCase().split(/\s+/).filter(Boolean);
  const words = String(p.text).split(/\s+/).map((w) => `<span class="cs-w${gold.includes(w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')) ? ' on' : ''}">${cx.esc(w)}</span>`).join('');
  if (String(p.text).trim().split(/\s+/).length <= 6) el.classList.add('short');   // a short statement can be large
  el.innerHTML = `<div class="cs-pad">
    ${p.kicker ? `<div class="cs-kicker">${cx.esc(p.kicker)}</div>` : ''}
    <p class="cs-title">${words}</p>
    ${p.by ? `<div class="cs-label">${cx.esc(p.by)}</div>` : ''}
  </div>`;
  const list = [];
  const ws = el.querySelectorAll('.cs-w');
  if (el.querySelector('.cs-kicker')) list.push(animate(el.querySelector('.cs-kicker'), {opacity: [0, 1]}, {duration: 0.5, ease: 'easeOut'}));
  list.push(animate(ws, {opacity: [0, 1], filter: ['blur(18px)', 'blur(0px)'], y: [18, 0]}, {duration: 0.7, delay: stagger(0.09, {startDelay: 0.2}), ease: [0.16, 1, 0.3, 1]}));
  const end = 0.2 + 0.09 * ws.length + 0.7;
  if (el.querySelector('.cs-label')) list.push(animate(el.querySelector('.cs-label'), {opacity: [0, 1], y: [10, 0]}, {duration: 0.6, delay: end - 0.4, ease: 'easeOut'}));
  return cx.fromMotion(list, {dur: end + 0.25});
}
