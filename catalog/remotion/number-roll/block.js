// A Remotion composition played inside the page by @remotion/player: every digit rolls up through 0-9 to its place, the unit and one line follow.
export const css = `
.b-remotion-number-roll .rm { position: absolute; left: 0; right: 0; top: calc(50% + var(--top) / 2); aspect-ratio: 16 / 9; transform: translateY(-50%); max-height: 100%; }
.cs-frame[data-shape="tall"] .b-remotion-number-roll .rm { aspect-ratio: 4 / 5; }
`;
export default function mount(el, p, cx) {
  el.innerHTML = `<div class="rm"></div>`;
  const tok = (n) => getComputedStyle(el).getPropertyValue(n).trim();
  return cx.fromRemotion(el.querySelector('.rm'), 'remotion/number-roll', {value: p.value, unit: p.unit || '', label: p.label || '', kicker: p.kicker || '', ink: tok('--ink'), accent: tok('--gold2'), gold: tok('--gold'), dim: tok('--dim')},
    cx.shape === 'tall' ? {width: 1080, height: 1350} : null);
}
