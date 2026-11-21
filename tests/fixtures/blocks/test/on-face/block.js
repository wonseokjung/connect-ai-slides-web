// wrong on purpose: the title sits right on the face
export const css = `.b-test-on-face img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.b-test-on-face h2 { position: absolute; left: 30%; top: 30%; width: 40%; text-align: center; }`;
export default function mount(el, p, cx) {
  el.innerHTML = `<img src="${cx.esc(p.src)}" alt="a person"><h2 class="cs-title">${cx.esc(p.text || 'On the face')}</h2>`;
  cx.face(el.querySelector('img'), p.face);
  return cx.fromFn(0.5, () => {});
}
