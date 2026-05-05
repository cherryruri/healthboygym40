document.addEventListener("DOMContentLoaded", function(){

/* ================= 필라테스 슬라이드 ================= */
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


/* ================= 로고 타이핑 ================= */
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


/* ================= fade ================= */
function fadeIn(){
  const els = document.querySelectorAll(".fade");

  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      entry.target.classList.toggle("show", entry.isIntersecting);
    });
  },{threshold:0.2});

  els.forEach(el=>observer.observe(el));
}


/* ================= 숫자 카운터 ================= */
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


/* ================= 위치 타이핑 ================= */
function startTyping(){
  const content = `
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


/* ================= 브랜드 타이핑 ================= */
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


/* ================= 이미지 모달 ================= */
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


/* ================= 모바일 메뉴 ================= */
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


/* ================= 스크롤 이동 ================= */
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
      target.scrollIntoView({behavior:"smooth", block:"start"});
    }
  });
});


/* ================= 시설 컬러 전환 ================= */
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


/* ================= CHANGE YOUR LIFE 전환 ================= */
(function(){
  const brandBox = document.querySelector(".box-history");
  const slice = document.querySelector("#slice-history");
  const facilitySection = document.querySelector(".facility-section");

  if(!brandBox || !slice || !facilitySection) return;

  const newText = document.createElement("div");
  newText.textContent = "헬스보이짐은 다릅니다";

  Object.assign(newText.style,{
    position:"absolute",
    top:"55%",
    left:"50%",
    transform:"translate(-50%,-50%)",
    fontSize:"64px",
    fontWeight:"900",
    color:"#fff",
    opacity:"0",
    transition:"opacity 0.6s ease, transform 0.6s ease",
    textAlign:"center",
    zIndex:"2"
  });

  brandBox.appendChild(newText);

  function handleScroll(){
    const rect = facilitySection.getBoundingClientRect();
    const windowH = window.innerHeight;

    const trigger = windowH * 0.75;

    if(rect.top < trigger){
      slice.style.opacity = 0;
      slice.style.transform = "translateY(-10px)";

      newText.style.opacity = 1;
      newText.style.transform = "translate(-50%,-50%) scale(1)";
    }else{
      slice.style.opacity = 1;
      slice.style.transform = "translateY(0px)";

      newText.style.opacity = 0;
      newText.style.transform = "translate(-50%,-50%) scale(0.98)";
    }
  }

  window.addEventListener("scroll", handleScroll);
  window.addEventListener("resize", handleScroll);
})();
});