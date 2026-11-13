(() => {
  const stage = document.querySelector(".coach-mindset-stage");
  const demo = stage?.querySelector(".coach-rappo");
  if (!demo) return;

  const statement = stage.querySelector(".coach-statement");
  const video = demo.querySelector("video");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let revealTimer;
  let fadeTimer;
  let revealed = false;

  function reveal() {
    revealed = true;
    statement.setAttribute("aria-hidden", "true");
    demo.removeAttribute("aria-hidden");
    demo.inert = false;
    stage.classList.add("is-rappo");
    if (!reducedMotion.matches) video.play().catch(() => {});
  }

  new IntersectionObserver(([entry]) => {
    clearTimeout(revealTimer);
    if (entry.intersectionRatio >= .8) {
      if (revealed) {
        if (!reducedMotion.matches) video.play().catch(() => {});
        return;
      }
      if (!video.getAttribute("src")) video.src = video.dataset.src;
      revealTimer = setTimeout(() => {
        stage.classList.add("is-statement-fading");
        fadeTimer = setTimeout(reveal, reducedMotion.matches ? 0 : 650);
      }, 3500);
    } else {
      clearTimeout(fadeTimer);
      video.pause();
      if (!revealed) stage.classList.remove("is-statement-fading");
    }
  }, { threshold: .8 }).observe(stage);
})();
