(function(){
  const mobileQuery = window.matchMedia("(max-width: 768px)");
  const root = document.documentElement;
  const lockClasses = [
    "hero-caption-scroll-locked",
    "hero-mobile-snap-playing",
    "hero-stats-bridge-playing",
    "allpass-scroll-locked",
    "pass-reveal-playing",
    "pass-reveal-complete"
  ];
  const scrollKeys = new Set(["ArrowDown", "PageDown", " ", "Spacebar", "End", "ArrowUp", "PageUp", "Home"]);

  function isMobile(){
    return mobileQuery.matches;
  }

  function injectStyle(){
    if(document.getElementById("mobile-scroll-fix-style")) return;

    const style = document.createElement("style");
    style.id = "mobile-scroll-fix-style";
    style.textContent = `
      @media (max-width: 768px){
        .intro{height:420vh !important;}
        html.hero-caption-scroll-locked,
        html.hero-caption-scroll-locked body,
        html.allpass-scroll-locked,
        html.allpass-scroll-locked body,
        html.pass-reveal-playing,
        html.pass-reveal-playing body,
        html.pass-reveal-complete body{
          overflow-y:auto !important;
          overflow-x:hidden !important;
          overscroll-behavior:auto !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function clearMobileLocks(){
    if(!isMobile()) return;

    const hadLock = lockClasses.some(className=>root.classList.contains(className));
    lockClasses.forEach(className=>root.classList.remove(className));
    document.body.classList.remove("hero-mobile-snap-playing");
    document.body.style.overflow = "";
    root.style.overflow = "";
    window.__skipAllPassRevealUntil = Date.now() + 1800;

    const locator = document.querySelector("[data-pass-locator]");
    if(locator){
      locator.classList.remove("is-revealed");
    }

    const transition = document.querySelector("[data-pass-transition]");
    if(transition){
      transition.classList.remove("is-playing", "is-complete");
      transition.style.setProperty("--pass-transition-opacity", "0");
      transition.style.setProperty("--pass-transition-scale", ".2");
    }

    if(hadLock){
      document.dispatchEvent(new CustomEvent("allpassReleaseScrollLock"));
    }
  }

  function pageTop(element){
    if(!element) return null;
    return element.getBoundingClientRect().top + window.pageYOffset;
  }

  function isInsideMobileException(target){
    if(!target || !target.closest) return false;
    return Boolean(target.closest(".mobile-side-menu, .facility-photo-modal.is-open, [data-pass-locator].is-revealed"));
  }

  function isInHeroOrAllPassScene(){
    const y = window.pageYOffset;
    const hero = document.querySelector(".hero-expand-section");
    const heroTop = pageTop(hero);

    if(hero && heroTop !== null && y >= heroTop - 2 && y <= heroTop + hero.offsetHeight + 8){
      return true;
    }

    const brandCross = document.querySelector("#brand #inc01 .brand-cross");
    const brandTop = pageTop(brandCross);
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;

    return Boolean(
      brandCross &&
      brandTop !== null &&
      y >= brandTop - viewportHeight * 0.2 &&
      y <= brandTop + viewportHeight * 1.25
    );
  }

  function shouldBypassHijack(event){
    if(!isMobile() || isInsideMobileException(event.target)) return false;
    return lockClasses.some(className=>root.classList.contains(className)) || isInHeroOrAllPassScene();
  }

  function bypassHijack(event){
    if(!shouldBypassHijack(event)) return;
    clearMobileLocks();
    event.stopImmediatePropagation();
  }

  function onKeyDown(event){
    if(!scrollKeys.has(event.key)) return;
    bypassHijack(event);
  }

  injectStyle();
  clearMobileLocks();

  window.addEventListener("touchmove", bypassHijack, {capture:true, passive:true});
  window.addEventListener("wheel", bypassHijack, {capture:true, passive:true});
  window.addEventListener("keydown", onKeyDown, {capture:true});
  window.addEventListener("resize", clearMobileLocks, {passive:true});
  document.addEventListener("DOMContentLoaded", clearMobileLocks);
})();
