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
      <a href="board.html?board=noticeboard">수내점 공지문 / 뉴스</a>
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

    const hasBoard =
      Array
        .from(menu.querySelectorAll("a"))
        .some(link=>link.getAttribute("href") === "board.html");

    if(hasBoard) return;

    const item = document.createElement("li");
    item.className = "board-menu-link";
    item.innerHTML = `<a href="board.html">게시판</a>`;

    const loginItem =
      menu.querySelector(".login-menu, #userMenu");

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
})();
