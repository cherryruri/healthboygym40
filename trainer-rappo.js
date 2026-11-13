(() => {
  const stage = document.querySelector(".coach-mindset-stage");
  const demo = stage?.querySelector(".coach-rappo");
  if (!demo) return;

  const statement = stage.querySelector(".coach-statement");
  const video = demo.querySelector("video");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let revealTimer;
  let revealed = false;

  function reveal() {
    revealed = true;
    statement.setAttribute("aria-hidden", "true");
    demo.removeAttribute("aria-hidden");
    demo.inert = false;
    stage.classList.add("is-rappo");
    video.src = video.dataset.src;
    if (!reducedMotion.matches) video.play().catch(() => {});
  }

  new IntersectionObserver(([entry]) => {
    clearTimeout(revealTimer);
    if (entry.intersectionRatio >= .8) {
      if (!revealed) revealTimer = setTimeout(reveal, 3000);
    } else {
      video.pause();
    }
  }, { threshold: .8 }).observe(stage);
})();
