(() => {
  const story = document.querySelector('.trainer-pt-story');
  if (!story) return;
  const svg = story.querySelector('svg');
  const path = svg.querySelector('path');
  const dot = svg.querySelector('ellipse');
  const length = path.getTotalLength();
  let pending = false;

  function render() {
    pending = false;
    const rect = svg.getBoundingClientRect();
    if (!rect.height) return;
    // Follow the vertical scroll position, including when the visitor scrolls back up.
    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
    const startLine = rect.top - story.getBoundingClientRect().top + headerHeight;
    const focusY = Math.min(innerHeight * .68, startLine);
    const y = Math.max(0, Math.min(1528, (focusY - rect.top) / rect.height * 1536));
    let low = 0;
    let high = length;
    for (let i = 0; i < 18; i++) {
      const mid = (low + high) / 2;
      if (path.getPointAtLength(mid).y < y) low = mid;
      else high = mid;
    }
    const progress = y === 0 ? 0 : y === 1528 ? length : (low + high) / 2;
    const point = path.getPointAtLength(progress);
    const radius = rect.width < 200 ? 10 : 15;
    path.style.strokeDasharray = `${progress} ${length + 1}`;
    dot.setAttribute('cx', point.x);
    dot.setAttribute('cy', point.y);
    dot.setAttribute('rx', radius * 326 / rect.width);
    dot.setAttribute('ry', radius * 1536 / rect.height);
  }
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(render);
  }
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', schedule);
  addEventListener('pageshow', schedule);
  new ResizeObserver(schedule).observe(story);
  render();
})();
