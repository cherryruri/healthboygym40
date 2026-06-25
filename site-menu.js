(function(){
  const MENU_HTML = `
    <div class="mobile-auth-panel">
      <button type="button" class="mobile-close" aria-label="메뉴 닫기"></button>
      <label class="mobile-profile-upload" id="mobileProfileUploadLabel" aria-label="프로필 사진 변경">
        <input type="file" id="mobileProfileInput" accept="image/*">
        <span class="mobile-profile-avatar" id="mobileProfileAvatar">
          <img id="mobileProfileImage" alt="" hidden>
          <span class="mobile-profile-placeholder" id="mobileProfilePlaceholder"></span>
        </span>
        <span class="mobile-profile-camera" aria-hidden="true"></span>
      </label>
      <button type="button" class="mobile-profile-delete" id="mobileProfileDelete" hidden>사진 삭제</button>
      <a href="login.html" class="mobile-auth-title" id="mobileProfileName">로그인 하기</a>
      <p id="mobileProfileText" class="mobile-auth-sub">회원 전용 메뉴를 이용해보세요.</p>
      <div class="mobile-auth-links" id="mobileGuestActions">
        <a href="login.html">회원가입 하기</a>
        <span>|</span>
        <a href="change-password.html">P/W 변경</a>
      </div>
      <div class="mobile-auth-links" id="mobileUserActions" hidden>
        <button type="button" id="mobileLogoutBtn">로그아웃 하기</button>
        <span>|</span>
        <a href="mypage.html">MY PAGE</a>
      </div>
      <a href="login.html" id="mobileLoginLink" hidden>LOGIN</a>
    </div>
    <nav class="mobile-menu-list" aria-label="모바일 메뉴">
      <span class="mobile-menu-section-title">헬스보이짐 수내점 소개</span>
      <a href="index.html#about">센터 소개</a>
      <a href="index.html#brand">브랜드 소개</a>
      <a href="index.html#pass">올패스 안내</a>
      <a href="index.html#facility">시설 투어</a>
      <a href="index.html#trainer">트레이너 소개</a>
      <a href="index.html#hours">운영시간</a>
      <a href="index.html#location">오시는 길</a>
      <a href="index.html#faq">자주 묻는 질문</a>
      <span class="mobile-menu-section-title member">수내점 회원 전용</span>
      <a href="board.html?board=free">자유게시판</a>
      <a href="board.html?board=noticeboard">공지문 / 뉴스</a>
    </nav>
  `;

  function ensureMobilePieces(navbar){
    let button = navbar.querySelector(".mobile-menu-btn");
    if(!button){
      button = document.createElement("button");
      button.type = "button";
      button.className = "mobile-menu-btn";
      button.setAttribute("aria-label", "메뉴 열기");
      navbar.appendChild(button);
    }

    button.textContent = "";
    const toggleMenu = event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      const isOpen = document.body.classList.toggle("menu-open");
      button.setAttribute("aria-expanded", String(isOpen));
    };

    button.onclick = toggleMenu;
    button.addEventListener("click", toggleMenu, true);

    let overlay = navbar.querySelector(".mobile-menu-overlay");
    if(!overlay){
      overlay = document.createElement("div");
      overlay.className = "mobile-menu-overlay";
      navbar.appendChild(overlay);
    }

    let side = navbar.querySelector(".mobile-side-menu");
    if(!side){
      side = document.createElement("div");
      side.className = "mobile-side-menu";
      navbar.appendChild(side);
    }

    side.innerHTML = MENU_HTML;

    const closeButton = side.querySelector(".mobile-close");

    if(closeButton){
      closeButton.onclick = event=>{
        event.preventDefault();
        event.stopPropagation();
        closeMenu();
      };
    }

    overlay.onclick = closeMenu;
  }

  function ensureDesktopBoard(menu){
    if(!menu) return;

    menu
      .querySelectorAll("a")
      .forEach(link=>{
        const text = link.textContent.trim();

        if(text === "FAQ" || text === "F&Q"){
          link.textContent = "자주 묻는 질문";
        }

        if(link.getAttribute("href") === "#brand" && text.includes("올패스")){
          link.setAttribute("href", "#pass");
        }
      });

    const links = Array.from(menu.querySelectorAll("a"));
    const hasBoard = links.some(link=>link.getAttribute("href") === "board.html");
    const hasNotice = links.some(link=>link.getAttribute("href") === "board.html?board=noticeboard");

    const loginItem =
      menu.querySelector(".login-menu, #userMenu");

    if(!hasNotice){
      const noticeItem = document.createElement("li");
      noticeItem.className = "notice-menu-link";
      noticeItem.innerHTML = `<a href="board.html?board=noticeboard">공지문/뉴스</a>`;
      menu.insertBefore(noticeItem, loginItem || null);
    }

    if(hasBoard) return;

    const item = document.createElement("li");
    item.className = "board-menu-link";
    item.innerHTML = `<a href="board.html">게시판</a>`;

    menu.insertBefore(item, loginItem || null);
  }

  function closeMenu(){
    document.body.classList.remove("menu-open");
    document
      .querySelectorAll(".mobile-menu-btn")
      .forEach(button=>button.setAttribute("aria-expanded", "false"));
  }

  function initSiteMenu(){
    if(document.documentElement.dataset.siteMenuReady === "true") return;
    document.documentElement.dataset.siteMenuReady = "true";

    document.querySelectorAll(".navbar").forEach(navbar=>{
      ensureDesktopBoard(navbar.querySelector(".menu"));
      ensureMobilePieces(navbar);
    });

    document.addEventListener("click", event=>{
      if(event.target.closest(".mobile-menu-btn")){
        return;
      }

      if(event.target.closest(".mobile-close") || event.target.closest(".mobile-menu-overlay")){
        closeMenu();
        return;
      }

      if(event.target.closest(".mobile-menu-list a")){
        closeMenu();
      }
    });
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", initSiteMenu);
  }else{
    initSiteMenu();
  }

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

  function isAllPassTypingActive(){
    if(!isMobile()) return false;

    const line = document.querySelector("[data-allpass-typing]");
    return Boolean(line && line.dataset.typed === "true" && line.dataset.typingComplete !== "true");
  }

  function revealPassLocatorAfterTyping(){
    if(!isMobile()) return;

    const line = document.querySelector("[data-allpass-typing]");
    const locator = document.querySelector("[data-pass-locator]");

    if(!line || !locator || line.dataset.typingComplete !== "true") return;

    locator.classList.add("is-revealed");
    root.classList.remove("pass-reveal-playing");
    root.classList.add("pass-reveal-complete");

    const transition = document.querySelector("[data-pass-transition]");
    if(transition){
      transition.classList.remove("is-playing");
      transition.classList.add("is-complete");
      transition.style.setProperty("--pass-transition-opacity", "1");
      transition.style.setProperty("--pass-transition-scale", "1");
    }

    if(window.ScrollTrigger){
      requestAnimationFrame(()=>window.ScrollTrigger.refresh());
    }
  }

  function injectMobileScrollStyle(){
    if(document.getElementById("mobile-scroll-fix-style")) return;

    const style = document.createElement("style");
    style.id = "mobile-scroll-fix-style";
    style.textContent = `
      @media (max-width: 768px){
        .intro{
          height:430vh !important;
          --hero-stage-bg:#fff;
        }
        .hero-expand-sticky,
        .hero-expand-sticky::before{
          background:var(--hero-stage-bg, #fff) !important;
        }
        .hero-video-frame{
          background:#050505 !important;
          backface-visibility:hidden;
          transform:translate3d(-50%, 0, 0);
        }
        .intro-video{
          display:block !important;
          opacity:1 !important;
          background:#050505;
          backface-visibility:hidden;
          transform:translateZ(0);
          will-change:transform;
        }
        .pass-transition-panel{
          display:none !important;
        }
        .pass-locator-section{
          position:relative !important;
          inset:auto !important;
          z-index:auto !important;
          height:0 !important;
          min-height:0 !important;
          margin:0 !important;
          padding:0 !important;
          overflow:hidden !important;
          opacity:0 !important;
          visibility:hidden !important;
          pointer-events:none !important;
          transform:translateY(22px) !important;
          transition:opacity .55s ease, transform .55s ease, visibility .55s ease !important;
        }
        .pass-locator-section.is-revealed{
          height:auto !important;
          min-height:100svh !important;
          padding:72px 0 84px !important;
          overflow:visible !important;
          opacity:1 !important;
          visibility:visible !important;
          pointer-events:auto !important;
          transform:none !important;
        }
        .pass-locator-section .pass-locator-container,
        .pass-locator-section .pass-locator-controls,
        .pass-locator-section .pass-locator-map-shell,
        .pass-locator-section .pass-selected-block,
        .pass-locator-section .pass-recommend-panel,
        .pass-locator-section .pass-result-card{
          opacity:0 !important;
          visibility:hidden !important;
          pointer-events:none !important;
          transform:translateY(20px) !important;
          transition:opacity .55s ease, transform .55s ease, visibility .55s ease !important;
        }
        .pass-locator-section.is-revealed .pass-locator-container,
        .pass-locator-section.is-revealed .pass-locator-controls,
        .pass-locator-section.is-revealed .pass-locator-map-shell,
        .pass-locator-section.is-revealed .pass-selected-block,
        .pass-locator-section.is-revealed .pass-recommend-panel,
        .pass-locator-section.is-revealed .pass-result-card{
          opacity:1 !important;
          visibility:visible !important;
          pointer-events:auto !important;
          transform:none !important;
        }
        html.hero-caption-scroll-locked,
        html.hero-caption-scroll-locked body,
        html.allpass-scroll-locked,
        html.allpass-scroll-locked body,
        html.pass-reveal-playing,
        html.pass-reveal-playing body,
        html.pass-reveal-complete,
        html.pass-reveal-complete body{
          overflow-y:auto !important;
          overflow-x:hidden !important;
          overscroll-behavior:auto !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function clearMobileScrollLocks(){
    if(!isMobile()) return;

    const keepAllPassTypingLock = isAllPassTypingActive();
    const removableClasses = keepAllPassTypingLock
      ? lockClasses.filter(className=>className !== "allpass-scroll-locked")
      : lockClasses;
    const hadLock = removableClasses.some(className=>root.classList.contains(className));
    const body = document.body;

    removableClasses.forEach(className=>root.classList.remove(className));
    if(body){
      body.classList.remove("hero-mobile-snap-playing");
      body.style.overflow = "";
    }
    root.style.overflow = "";

    if(!keepAllPassTypingLock){
      window.__skipAllPassRevealUntil = Date.now() + 1800;
    }

    const transition = document.querySelector("[data-pass-transition]");
    if(transition){
      transition.classList.remove("is-playing", "is-complete");
      transition.style.setProperty("--pass-transition-opacity", "0");
      transition.style.setProperty("--pass-transition-scale", ".2");
    }

    if(hadLock && !keepAllPassTypingLock){
      document.dispatchEvent(new CustomEvent("allpassReleaseScrollLock"));
    }
  }

  function pageTop(element){
    if(!element) return null;
    return element.getBoundingClientRect().top + window.pageYOffset;
  }

  function isMobileException(target){
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

  function shouldBypassScrollHijack(event){
    if(!isMobile() || isMobileException(event.target)) return false;
    if(isAllPassTypingActive() && root.classList.contains("allpass-scroll-locked")) return false;
    return lockClasses.some(className=>root.classList.contains(className)) || isInHeroOrAllPassScene();
  }

  function bypassScrollHijack(event){
    if(!shouldBypassScrollHijack(event)) return;
    clearMobileScrollLocks();
    event.stopImmediatePropagation();
  }

  function bypassScrollKey(event){
    if(!scrollKeys.has(event.key)) return;
    bypassScrollHijack(event);
  }

  function hasMobileScrollLock(){
    const body = document.body;
    const watchedClasses = isAllPassTypingActive()
      ? lockClasses.filter(className=>className !== "allpass-scroll-locked")
      : lockClasses;

    return watchedClasses.some(className=>root.classList.contains(className)) ||
      Boolean(body && body.classList.contains("hero-mobile-snap-playing"));
  }

  function watchMobileScrollLocks(){
    if(!("MutationObserver" in window)) return;

    const releaseIfLocked = ()=>{
      if(!isMobile() || !hasMobileScrollLock()) return;
      requestAnimationFrame(clearMobileScrollLocks);
    };

    const observer = new MutationObserver(releaseIfLocked);
    observer.observe(root, {attributes:true, attributeFilter:["class", "style"]});
    if(document.body){
      observer.observe(document.body, {attributes:true, attributeFilter:["class", "style"]});
    }
  }

  let reviewStatsHoldStartedAt = 0;
  let reviewStatsHoldDone = false;
  let reviewStatsHoldTicking = false;
  let reviewStatsHoldReleaseQueued = false;
  let reviewProofHoldStartedAt = 0;
  let reviewProofHoldDone = false;
  let reviewProofHoldTicking = false;
  let reviewProofHoldReleaseQueued = false;
  let introVideoGuardTicking = false;

  function numberFromCss(value){
    const number = Number.parseFloat(value);
    return Number.isFinite(number) ? number : 0;
  }

  function getHeroProgress(hero){
    return numberFromCss(
      hero.style.getPropertyValue("--hero-progress") ||
      getComputedStyle(hero).getPropertyValue("--hero-progress")
    );
  }

  function reviewStatsReachedTargets(stats){
    if(!stats.length) return false;

    return stats.every(stat=>{
      const target = Number(stat.dataset.target);
      const current = Number((stat.textContent || "").replace(/[^\d.-]/g, ""));

      return Number.isFinite(target) &&
        Number.isFinite(current) &&
        current >= target;
    });
  }

  function forceReviewStatsVisible(hero){
    const mobile = isMobile();

    hero.style.setProperty("--review-content-y", "0px");
    hero.style.setProperty("--review-stats-opacity", "1");
    hero.style.setProperty("--review-proof-opacity", "0");
    hero.style.setProperty("--review-proof-divider-opacity", "0");
    hero.style.setProperty("--review-proof-divider-width", "0px");
    hero.style.setProperty("--review-cards-opacity", "0");
    hero.style.setProperty("--review-cards-y", `${mobile ? 560 : 520}px`);
    hero.style.setProperty("--review-cards-x", `${mobile ? 220 : 340}px`);
  }

  function releaseReviewStatsHold(){
    if(reviewStatsHoldReleaseQueued) return;

    reviewStatsHoldReleaseQueued = true;
    setTimeout(()=>{
      reviewStatsHoldReleaseQueued = false;
      window.dispatchEvent(new Event("scroll"));
    }, 0);
  }

  function forceReviewProofVisible(hero){
    const mobile = isMobile();

    hero.style.setProperty("--review-content-y", "0px");
    hero.style.setProperty("--review-stats-opacity", "0");
    hero.style.setProperty("--review-proof-opacity", "1");
    hero.style.setProperty("--review-proof-y", "0px");
    hero.style.setProperty("--review-proof-scale", "1");
    hero.style.setProperty("--review-proof-gap", `${mobile ? 14 : 18}px`);
    hero.style.setProperty("--review-proof-divider-opacity", "1");
    hero.style.setProperty("--review-proof-divider-width", `${mobile ? 46 : 110}px`);
    hero.style.setProperty("--review-cards-opacity", "0");
    hero.style.setProperty("--review-cards-y", `${mobile ? 560 : 520}px`);
    hero.style.setProperty("--review-cards-x", `${mobile ? 220 : 340}px`);
  }

  function releaseReviewProofHold(){
    if(reviewProofHoldReleaseQueued) return;

    reviewProofHoldReleaseQueued = true;
    setTimeout(()=>{
      reviewProofHoldReleaseQueued = false;
      window.dispatchEvent(new Event("scroll"));
    }, 0);
  }

  function applyReviewProofHold(){
    reviewProofHoldTicking = false;

    const hero = document.querySelector(".hero-expand-section");
    if(!hero) return;

    const progress = getHeroProgress(hero);
    const mobile = isMobile();
    const holdStart = mobile ? 0.958 : 0.954;
    const resetBefore = holdStart - 0.055;
    const minHoldMs = mobile ? 4200 : 3400;

    if(progress < resetBefore){
      reviewProofHoldStartedAt = 0;
      reviewProofHoldDone = false;
      return;
    }

    if(progress < holdStart || reviewProofHoldDone || !reviewStatsHoldDone) return;

    if(!reviewProofHoldStartedAt){
      reviewProofHoldStartedAt = performance.now();
    }

    if(performance.now() - reviewProofHoldStartedAt < (mobile ? 700 : minHoldMs)){
      forceReviewProofVisible(hero);
      setTimeout(queueReviewProofHold, 120);
      return;
    }

    reviewProofHoldDone = true;
    releaseReviewProofHold();
  }

  function queueReviewProofHold(){
    if(reviewProofHoldTicking) return;

    reviewProofHoldTicking = true;
    requestAnimationFrame(applyReviewProofHold);
  }

  function applyReviewStatsHold(){
    reviewStatsHoldTicking = false;

    const hero = document.querySelector(".hero-expand-section");
    if(!hero) return;

    const stats =
      Array.from(hero.querySelectorAll(".review-stats-section .stat-number"));

    if(!stats.length) return;

    const progress = getHeroProgress(hero);
    const mobile = isMobile();
    const holdStart = mobile ? 0.705 : 0.79;
    const resetBefore = holdStart - 0.05;
    const minHoldMs = mobile ? 500 : 1900;
    const maxHoldMs = mobile ? 900 : 2800;

    if(progress < resetBefore){
      reviewStatsHoldStartedAt = 0;
      reviewStatsHoldDone = false;
      reviewProofHoldStartedAt = 0;
      reviewProofHoldDone = false;
      return;
    }

    if(progress < holdStart || reviewStatsHoldDone) return;

    if(!reviewStatsHoldStartedAt){
      reviewStatsHoldStartedAt = performance.now();
    }

    const elapsed = performance.now() - reviewStatsHoldStartedAt;
    const reachedTargets = reviewStatsReachedTargets(stats);
    const shouldHold = elapsed < minHoldMs || (!reachedTargets && elapsed < maxHoldMs);

    if(shouldHold){
      forceReviewStatsVisible(hero);
      setTimeout(queueReviewStatsHold, 120);
      return;
    }

    reviewStatsHoldDone = true;
    releaseReviewStatsHold();
  }

  function queueReviewStatsHold(){
    if(reviewStatsHoldTicking) return;

    reviewStatsHoldTicking = true;
    requestAnimationFrame(applyReviewStatsHold);
  }

  function keepIntroVideoWarm(){
    if(!isMobile() || document.hidden) return;

    const video = document.querySelector(".intro-video");
    if(!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");

    if(video.readyState === 0){
      video.load();
    }

    const play = ()=>{
      const promise = video.play();
      if(promise && typeof promise.catch === "function"){
        promise.catch(()=>{});
      }
    };

    if(video.paused || video.readyState < 2){
      play();
      video.addEventListener("loadeddata", play, {once:true});
      video.addEventListener("canplay", play, {once:true});
    }
  }

  function updateHeroStageBackground(){
    const hero = document.querySelector(".hero-expand-section");
    if(!hero) return;

    if(!isMobile()){
      hero.style.removeProperty("--hero-stage-bg");
      return;
    }

    const progress = getHeroProgress(hero);
    hero.style.setProperty(
      "--hero-stage-bg",
      progress >= 0.255 ? "#050505" : "#fff"
    );
  }

  function queueIntroVideoGuard(){
    if(introVideoGuardTicking) return;

    introVideoGuardTicking = true;
    requestAnimationFrame(()=>{
      introVideoGuardTicking = false;
      keepIntroVideoWarm();
      updateHeroStageBackground();
    });
  }

  injectMobileScrollStyle();
  clearMobileScrollLocks();
  watchMobileScrollLocks();
  queueReviewStatsHold();
  queueReviewProofHold();
  queueIntroVideoGuard();

  window.addEventListener("touchmove", bypassScrollHijack, {capture:true, passive:true});
  window.addEventListener("wheel", bypassScrollHijack, {capture:true, passive:true});
  window.addEventListener("keydown", bypassScrollKey, {capture:true});
  window.addEventListener("scroll", queueReviewStatsHold, {passive:true});
  window.addEventListener("scroll", queueReviewProofHold, {passive:true});
  window.addEventListener("scroll", queueIntroVideoGuard, {passive:true});
  window.addEventListener("resize", clearMobileScrollLocks, {passive:true});
  window.addEventListener("resize", queueReviewStatsHold, {passive:true});
  window.addEventListener("resize", queueReviewProofHold, {passive:true});
  window.addEventListener("resize", queueIntroVideoGuard, {passive:true});
  window.addEventListener("pageshow", clearMobileScrollLocks, {passive:true});
  window.addEventListener("pageshow", queueIntroVideoGuard, {passive:true});
  document.addEventListener("visibilitychange", queueIntroVideoGuard);
  document.addEventListener("allpassTypingComplete", ()=>{
    setTimeout(revealPassLocatorAfterTyping, 80);
  });
  document.addEventListener("DOMContentLoaded", clearMobileScrollLocks);
  document.addEventListener("DOMContentLoaded", queueReviewStatsHold);
  document.addEventListener("DOMContentLoaded", queueReviewProofHold);
  document.addEventListener("DOMContentLoaded", queueIntroVideoGuard);
  setTimeout(clearMobileScrollLocks, 600);
  setTimeout(clearMobileScrollLocks, 1800);
  setTimeout(clearMobileScrollLocks, 3200);
  setTimeout(queueReviewStatsHold, 800);
  setTimeout(queueReviewStatsHold, 2000);
  setTimeout(queueReviewProofHold, 1200);
  setTimeout(queueReviewProofHold, 2400);
  setTimeout(queueIntroVideoGuard, 0);
  setTimeout(queueIntroVideoGuard, 120);
  setTimeout(queueIntroVideoGuard, 430);
  setTimeout(queueIntroVideoGuard, 900);
  setTimeout(queueIntroVideoGuard, 1800);
  setTimeout(queueIntroVideoGuard, 3200);
  setTimeout(revealPassLocatorAfterTyping, 3200);
})();
