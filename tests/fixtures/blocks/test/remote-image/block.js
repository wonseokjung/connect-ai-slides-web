// wrong on purpose: a picture from the internet
export default function mount(el, p, cx) {
  el.innerHTML = `<div class="cs-pad"><h2 class="cs-title">${cx.esc(p.text || 'Title')}</h2><img src="https://example.com/picture.png" alt="remote" style="width:20%"></div>`;
  return cx.fromFn(0.5, () => {});
}
