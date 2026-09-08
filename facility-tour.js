(() => {
  const tour = document.querySelector('#facilityTour');
  if (!tour) return;
  const scene = tour.querySelector('.cont');
  const stage = tour.querySelector('.img_inner');
  const slides = [...tour.querySelectorAll('.img_box > li')];
  const texts = [...tour.querySelectorAll('.txt_box > li')];
  if (!scene || !stage || !slides.length || !texts.length) return;
  scene.id = 'facility-title-scroll';
  const title = document.createElement('h2');
  title.className = 'facility-title-copy';
  title.textContent = '시설, 얼마나 좋길래?';
  stage.append(title);
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const v = clamp(value); return v * v * (3 - 2 * v); };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let ticking = false;
  const render = () => {
    ticking = false;
    const sceneTop = scene.getBoundingClientRect().top;
    const firstTop = texts[0].getBoundingClientRect().top;
    const travel = Math.max(1, firstTop - sceneTop);
    const p = clamp(-sceneTop / travel);
    const mobile = innerWidth <= 768;
    const settle = smooth(p / .36);
    const reveal = smooth((p - .34) / .58);
    const set = (name, value) => tour.style.setProperty('--facility-' + name, String(value));
    set('title-opacity', 1 - reveal);
    set('title-scale', (mobile ? 1.28 : 1.58) + ((mobile ? .32 : .36) - (mobile ? 1.28 : 1.58)) * settle);
    set('title-y', ((mobile ? 40 : 48) * (1 - settle) - reveal * 7) + 'vh');
    set('title-blur', (reduceMotion.matches ? 0 : reveal * 24) + 'px');
    set('image-scale', reduceMotion.matches ? 1 : (mobile ? .3 : .22) + (mobile ? .7 : .78) * reveal);
    set('image-y', (reduceMotion.matches ? 0 : (mobile ? 70 : 68) * (1 - reveal)) + '%');
    set('image-opacity', smooth((p - .33) / .15));
    set('image-radius', ((mobile ? 22 : 28) * (1 - reveal)) + 'px');
    set('caption-opacity', smooth((p - .78) / .14));

    // Measure the real caption spacing; mobile browser bars can change innerHeight.
    let from = 0;
    while (from < texts.length - 1 && texts[from + 1].getBoundingClientRect().top <= 0) from++;
    const to = Math.min(from + 1, slides.length - 1);
    const fromTop = texts[from].getBoundingClientRect().top;
    const distance = to === from ? 1 : texts[to].getBoundingClientRect().top - fromTop;
    const blend = smooth((clamp(-fromTop / Math.max(distance, 1)) - .18) / .64);
    slides.forEach((slide, index) => {
      // Keep the outgoing photo opaque under the incoming photo to avoid a dark dip.
      slide.style.setProperty('--facility-crossfade-opacity', index === from ? '1' : index === to ? String(blend) : '0');
      slide.style.setProperty('--facility-layer', index === to && to !== from ? '2' : index === from ? '1' : '0');
    });
  };
  const requestRender = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(render);
  };
  addEventListener('scroll', requestRender, { passive: true });
  addEventListener('resize', requestRender, { passive: true });
  addEventListener('pageshow', requestRender);
  if (window.ResizeObserver) new ResizeObserver(requestRender).observe(scene);
  document.fonts?.ready.then(requestRender);
  render();
})();
