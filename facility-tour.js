(() => {
  const section = document.querySelector('#facility');
  const tour = section?.querySelector('[data-stack-tour]');
  if (!tour) return;
  const stage = tour.querySelector('.hb-facility-stage');
  const intro = tour.querySelector('.hb-stack-intro-title');
  const cards = [...tour.querySelectorAll('.hb-facility-card')];
  const clamp = value => Math.max(0, Math.min(1, value));
  let frame = 0, entered = false, introAnimation = null, introTimer = 0;
  const labelTimers = new Map();
  function finishIntro() {
    clearTimeout(introTimer);introAnimation?.cancel();introAnimation = null;
    section.dataset.introRunning = 'false';intro.classList.add('is-settled');
  }
  function enter() {
    entered = true;intro.classList.remove('is-settled');section.dataset.introRunning = 'true';
    const scale = innerWidth <= 768 ? 4 : 4.4;
    introAnimation = intro.animate([
      {transform:`translateY(calc(-50% + 32svh)) scale(${scale})`,opacity:1},
      {transform:'translateY(-50%) scale(1)',opacity:1}
    ], {duration:1150,delay:180,easing:'cubic-bezier(.22,.61,.36,1)',fill:'both'});
    introTimer = setTimeout(finishIntro, 1330);
  }
  section.addEventListener('hb-reverse-intro', () => {
    finishIntro();
    introAnimation = intro.animate([
      {transform:'translateY(-50%) scale(1)',opacity:1},
      {transform:`translateY(calc(-50% + 32svh)) scale(${innerWidth <= 768 ? 4 : 4.4})`,opacity:1}
    ], {duration:550,easing:'cubic-bezier(.64,0,.78,.39)',fill:'forwards'});
  });
  function hideLabel(card) {
    clearTimeout(labelTimers.get(card));labelTimers.delete(card);card.classList.remove('is-caption-visible');
  }
  function revealLabel(card) {
    if (labelTimers.has(card) || card.classList.contains('is-caption-visible')) return;
    labelTimers.set(card, setTimeout(() => {labelTimers.delete(card);card.classList.add('is-caption-visible');}, 240));
  }
  function render() {
    frame = 0;
    const height = stage.getBoundingClientRect().height,rect = section.getBoundingClientRect(),step = height * .85;
    tour.style.height = `${height + step * cards.length}px`;
    const progress = Math.max(0, -rect.top / step),active = section.classList.contains('is-current');
    if (active && !entered && progress < .05) enter();
    if (progress > .05 && section.dataset.introRunning === 'true') finishIntro();
    if (rect.top > height * .6) {
      if (entered) {finishIntro();intro.classList.remove('is-settled');}
      entered = false;
    }
    cards.forEach((card, index) => {
      const amount = clamp(progress - index);
      // Each photo moves over the preceding photo and caption.
      card.style.transform = `translateY(${(1 - amount) * (height + 50)}px)`;
      card.setAttribute('aria-hidden', String(amount < .98));
      if (amount >= .995 && active) revealLabel(card);
      else if (amount < .995) hideLabel(card);
    });
  }
  function schedule() {if (!frame) frame = requestAnimationFrame(render);}
  addEventListener('scroll', schedule, {passive:true});addEventListener('resize', schedule);addEventListener('pageshow', schedule);
  new MutationObserver(schedule).observe(section, {attributes:true,attributeFilter:['class']});
  document.fonts?.ready.then(schedule);render();
})();
