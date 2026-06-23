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

  function injectMobileScrollStyle(){
    if(document.getElementById("mobile-scroll-fix-style")) return;

    const style = document.createElement("style");
    style.id = "mobile-scroll-fix-style";
    style.textContent = `
      @media (max-width: 768px){
        .intro{height:760vh !important;}
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

    const hadLock = lockClasses.some(className=>root.classList.contains(className));
    const body = document.body;

    lockClasses.forEach(className=>root.classList.remove(className));
    if(body){
      body.classList.remove("hero-mobile-snap-playing");
      body.style.overflow = "";
    }
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
    return lockClasses.some(className=>root.classList.contains(className)) ||
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
    const minHoldMs = mobile ? 2400 : 1900;
    const maxHoldMs = mobile ? 3400 : 2800;

    if(progress < resetBefore){
      reviewStatsHoldStartedAt = 0;
      reviewStatsHoldDone = false;
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

  injectMobileScrollStyle();
  clearMobileScrollLocks();
  watchMobileScrollLocks();
  queueReviewStatsHold();

  window.addEventListener("touchmove", bypassScrollHijack, {capture:true, passive:true});
  window.addEventListener("wheel", bypassScrollHijack, {capture:true, passive:true});
  window.addEventListener("keydown", bypassScrollKey, {capture:true});
  window.addEventListener("scroll", queueReviewStatsHold, {passive:true});
  window.addEventListener("resize", clearMobileScrollLocks, {passive:true});
  window.addEventListener("resize", queueReviewStatsHold, {passive:true});
  window.addEventListener("pageshow", clearMobileScrollLocks, {passive:true});
  document.addEventListener("DOMContentLoaded", clearMobileScrollLocks);
  document.addEventListener("DOMContentLoaded", queueReviewStatsHold);
  setTimeout(clearMobileScrollLocks, 600);
  setTimeout(clearMobileScrollLocks, 1800);
  setTimeout(clearMobileScrollLocks, 3200);
  setTimeout(queueReviewStatsHold, 800);
  setTimeout(queueReviewStatsHold, 2000);
})();
