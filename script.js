
document.addEventListener("DOMContentLoaded", function(){

/* 필라테스 슬라이드 */
let pilatesIndex = 0;

function movePilates(direction){
  const track = document.getElementById("pilatesTrack");
  if(!track) return;

  const total = track.children.length;
  if(total <= 1) return;

  pilatesIndex += direction;
  if(pilatesIndex < 0) pilatesIndex = total - 1;
  if(pilatesIndex >= total) pilatesIndex = 0;

  track.style.transform = `translateX(-${pilatesIndex * 100}%)`;
}

setInterval(()=> movePilates(1), 4500);


/* 로고 타이핑 */
const text = "HEALTHBOYGYM";
let logoIndex = 0;
const logo = document.getElementById("logo-text");

function openMain(){
  const logoScreen = document.querySelector(".logo-screen");
  const mainContent = document.querySelector(".main-content");

  if(logoScreen) logoScreen.classList.add("zoom-out");

  setTimeout(()=>{
    if(logoScreen) logoScreen.style.display = "none";
    if(mainContent) mainContent.style.display = "block";
    document.body.classList.add("loaded");

    fadeIn();
    startTyping();
    observeCounter();
    startBrandTyping();
  },600);
}

if(logo){
  const typing = setInterval(()=>{
    if(logoIndex < text.length){
      logo.textContent += text[logoIndex];
      logoIndex++;
    }else{
      clearInterval(typing);
      setTimeout(openMain, 500);
    }
  },60);
}else{
  openMain();
}


/* fade */
function fadeIn(){
  const els = document.querySelectorAll(".fade");
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      entry.target.classList.toggle("show", entry.isIntersecting);
    });
  },{threshold:0.2});

  els.forEach(el=>observer.observe(el));
}


/* 숫자 카운터 */
let counted = false;

function startCounter(){
  if(counted) return;

  document.querySelectorAll(".stat-number").forEach(stat=>{
    const target = Number(stat.dataset.target);
    let count = 0;
    const increment = Math.ceil(target / 80);

    const counter = setInterval(()=>{
      count += increment;

      if(count >= target){
        count = target;
        clearInterval(counter);
      }

      stat.textContent = count.toLocaleString();
    },20);
  });

  counted = true;
}

function observeCounter(){
  const statsSection = document.querySelector(".stats-section");
  if(!statsSection) return;

  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting) startCounter();
    });
  },{threshold:0.4});

  observer.observe(statsSection);
}


/* 위치 안내 타이핑 */
function startTyping(){
  const content=` 
주차 안내
건물 내 지하 2층, 3층 주차장으로 이용 가능합니다.

[ 차량 이용 시 ]
수내역 1번 출구에서 267m  
지하 2층, 3층 주차 후  
엘리베이터를 통해 5층으로 이동

[ 도보 방문 시 ]
배떼엠 옆 입구 이용`;

  let i = 0;
  const el = document.getElementById("typing-text");
  if(!el) return;

  el.textContent = "";

  function type(){
    if(i < content.length){
      el.textContent += content[i];
      i++;
      setTimeout(type,20);
    }
  }

  type();
}


/* 브랜드 타이핑 */
function startBrandTyping(){
  const typingEl = document.getElementById("typing-brand");
  if(!typingEl) return;

  const brandText = `대한민국 NO.1 피트니스 브랜드 헬스보이짐입니다.
단순한 운동 공간을 넘어, 삶의 변화를 만들어가는 프리미엄 공간을 제공합니다.
지금 이 순간에도 더 나은 당신을 위한 변화는 여기서 시작됩니다.`;

  let j = 0;
  let started = false;

  function typingEffect(){
    if(j < brandText.length){
      typingEl.innerHTML += brandText[j] === "\n" ? "<br>" : brandText[j];
      j++;

      const speed = brandText[j] === " " ? 10 : 32;
      setTimeout(typingEffect, speed);
    }
  }

  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting && !started){
        started = true;
        typingEl.innerHTML = "";
        typingEffect();
        observer.disconnect();
      }
    });
  },{threshold:0.4});

  observer.observe(typingEl);
}


/* 이미지 모달 */
const images = Array.from(document.querySelectorAll(".facility-slide img"));
let currentIndex = 0;

if(images.length){
  const modal = document.createElement("div");
  modal.className = "image-modal";

  modal.innerHTML = `
    <span class="close-btn">&times;</span>
    <span class="modal-btn modal-prev">&#10094;</span>
    <img src="">
    <span class="modal-btn modal-next">&#10095;</span>
  `;

  document.body.appendChild(modal);

  const modalImg = modal.querySelector("img");

  function showImage(){
    modalImg.src = images[currentIndex].src;
  }

  function next(){
    currentIndex = (currentIndex + 1) % images.length;
    showImage();
  }

  function prev(){
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage();
  }

  images.forEach((img,index)=>{
    img.addEventListener("click",()=>{
      currentIndex = index;
      showImage();
      modal.style.display = "flex";
    });
  });

  modal.querySelector(".modal-next").onclick = next;
  modal.querySelector(".modal-prev").onclick = prev;

  modal.querySelector(".close-btn").onclick = ()=>{
    modal.style.display = "none";
    modal.classList.remove("zoom");
  };

  modal.onclick = (e)=>{
    if(e.target === modal){
      modal.style.display = "none";
      modal.classList.remove("zoom");
    }
  };

  modalImg.onclick = ()=>{
    modal.classList.toggle("zoom");
  };
}


/* 모바일 사이드 메뉴 */
const navbar = document.querySelector(".navbar");
const menu = document.querySelector(".menu");

if(navbar && menu && !document.querySelector(".mobile-menu-btn")){
  const menuBtn = document.createElement("button");
  menuBtn.className = "mobile-menu-btn";
  menuBtn.innerHTML = "☰";

  const overlay = document.createElement("div");
  overlay.className = "mobile-menu-overlay";

  const sideMenu = document.createElement("div");
  sideMenu.className = "mobile-side-menu";

  sideMenu.innerHTML = `
    <div class="mobile-side-top">
      <div class="mobile-side-logo">HEALTHBOYGYM</div>
      <button class="mobile-close">×</button>
    </div>

    <a href="#about">센터 소개</a>
    <a href="#history">브랜드소개</a>
    <a href="#facility">시설 투어</a>
    <a href="#pilates">필라테스 안내</a>
    <a href="#pass">올패스 안내</a>
    <a href="#trainer">트레이너 소개</a>
    <a href="#hours">운영 시간</a>
    <a href="#location">오시는 길</a>
    <a href="#faq">FAQ</a>

    <a class="mobile-side-reserve" href="https://map.naver.com" target="_blank">
      네이버 문의 및 예약 바로가기
    </a>
  `;

  navbar.appendChild(menuBtn);
  document.body.appendChild(overlay);
  document.body.appendChild(sideMenu);

  menuBtn.onclick = ()=> document.body.classList.add("menu-open");
  overlay.onclick = ()=> document.body.classList.remove("menu-open");
  sideMenu.querySelector(".mobile-close").onclick = ()=> document.body.classList.remove("menu-open");

  sideMenu.querySelectorAll("a").forEach(link=>{
    link.addEventListener("click",()=>{
      document.body.classList.remove("menu-open");
    });
  });
}


/* 스크롤 이동 */
const scrollDown = document.querySelector(".scroll-down");

if(scrollDown){
  scrollDown.addEventListener("click",()=>{
    const about = document.querySelector("#about");
    if(about) about.scrollIntoView({behavior:"smooth", block:"start"});
  });
}

document.querySelectorAll('a[href^="#"]').forEach(link=>{
  link.addEventListener("click",function(e){
    const target = document.querySelector(this.getAttribute("href"));
    if(target){
      e.preventDefault();
      target.classList.add("show");
      target.scrollIntoView({behavior:"smooth", block:"start"});
    }
  });
});


/* 모바일 시설투어 컬러 */
/* 모바일 시설투어 사진 스크롤 컬러 전환 */
function checkFacilityColor(){
  const items = document.querySelectorAll(".facility-item");

  items.forEach(item=>{
    const rect = item.getBoundingClientRect();
    const windowH = window.innerHeight;

    if(rect.top < windowH * 0.75 && rect.bottom > 0){
      item.classList.add("color-on");
    }
  });
}

window.addEventListener("scroll", checkFacilityColor);
window.addEventListener("resize", checkFacilityColor);
setTimeout(checkFacilityColor, 800);
setTimeout(checkFacilityColor, 1800);



/* FAQ */
const items = document.querySelectorAll(".faq-new-item");
const buttons = document.querySelectorAll(".faq-new-category button");
const search = document.getElementById("faqSearch");

items.forEach(item=>{
  item.addEventListener("click",()=>{
    item.classList.toggle("active");
  });
});

buttons.forEach(btn=>{
  btn.addEventListener("click",()=>{
    const cat = btn.dataset.category;

    buttons.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");

    items.forEach(item=>{
      item.style.display = "block";

      if(cat === "all" || item.dataset.category === cat){
        item.classList.remove("faq-dim");
      }else{
        item.classList.add("faq-dim");
      }
    });
  });
});

if(search){
  search.addEventListener("input",()=>{
    const val = search.value.toLowerCase();

    items.forEach(item=>{
      const text = item.innerText.toLowerCase();
      item.style.display = "block";

      if(text.includes(val)){
        item.classList.remove("faq-dim");
      }else{
        item.classList.add("faq-dim");
      }
    });
  });
}



});



document.addEventListener('DOMContentLoaded', () => {
  const box = document.querySelector(".box-history");
  const slice = box.querySelector("#slice-history");

  // 초기 화면용 innerText → data-text sync
  slice.dataset.text = slice.innerText;

  document.addEventListener('mousemove', (e) => {
    const y = e.clientY / window.innerHeight;

    let top = y * 100;
    top = Math.min(70, Math.max(30, top));
    const bottom = top + 14;

    box.style.setProperty('--cut-top', `${top}%`);
    box.style.setProperty('--cut-bottom', `${bottom}%`);
  });

  // contenteditable 업데이트
  slice.addEventListener("input", () => {
    slice.dataset.text = slice.innerText;
  });
});


document.addEventListener('DOMContentLoaded', () => {
  const box = document.querySelector(".box-history");

  // 모바일에서만 동작
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    const boxTop = box.getBoundingClientRect().top + window.scrollY;
    const boxHeight = box.offsetHeight;

    document.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      let ratio = (scrollY - boxTop + window.innerHeight / 2) / boxHeight;
      ratio = Math.min(1, Math.max(0, ratio)); // 0~1 제한
      box.style.setProperty('--cut-top', `${ratio*100}%`);
      box.style.setProperty('--cut-bottom', `${ratio*100 + 14}%`);
    });
  }
});













