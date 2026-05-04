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

setInterval(()=>{
  movePilates(1);
}, 4500);


/* ================= 모바일 메뉴 ================= */
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileCloseBtn = document.getElementById("mobileCloseBtn");
const mobileOverlay = document.getElementById("mobileMenuOverlay");
const mobileLinks = document.querySelectorAll(".mobile-side-menu a");

function openMobileMenu(){
  document.body.classList.add("menu-open");
}

function closeMobileMenu(){
  document.body.classList.remove("menu-open");
}

if(mobileMenuBtn){
  mobileMenuBtn.addEventListener("click", openMobileMenu);
}

if(mobileCloseBtn){
  mobileCloseBtn.addEventListener("click", closeMobileMenu);
}

if(mobileOverlay){
  mobileOverlay.addEventListener("click", closeMobileMenu);
}

mobileLinks.forEach(link=>{
  link.addEventListener("click", closeMobileMenu);
});


/* ================= 로고 타이핑 ================= */
const text="HEALTHBOYGYM";
let i=0;
const logo=document.getElementById("logo-text");

function startSite(){
  const logoScreen = document.querySelector('.logo-screen');
  const mainContent = document.querySelector('.main-content');

  if(logoScreen) logoScreen.classList.add('zoom-out');

  setTimeout(()=>{
    if(logoScreen) logoScreen.style.display='none';
    if(mainContent) mainContent.style.display='block';

    document.body.classList.add("loaded");

    fadeIn();
    startTyping();
    observeCounter();
    startBrandTyping();
    observeFacilityColor();
    forceFacilityColorMobile();
  },600);
}

if(logo){
  const typing=setInterval(()=>{
    if(i<text.length){
      logo.textContent+=text[i];
      i++;
    }else{
      clearInterval(typing);
      setTimeout(startSite,500);
    }
  },60);
}else{
  const mainContent = document.querySelector('.main-content');
  if(mainContent) mainContent.style.display='block';

  document.body.classList.add("loaded");

  fadeIn();
  startTyping();
  observeCounter();
  startBrandTyping();
  observeFacilityColor();
  forceFacilityColorMobile();
}


/* ================= fade 애니메이션 ================= */
function fadeIn(){
  const els=document.querySelectorAll('.fade');

  const observer=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('show');
      }
    });
  },{threshold:0.2});

  els.forEach(el=>observer.observe(el));
}


/* ================= 숫자 카운터 ================= */
let counted = false;

function startCounter(){
  if(counted) return;

  const stats = document.querySelectorAll('.stat-number');

  stats.forEach(stat => {
    const target = Number(stat.dataset.target);
    let count = 0;
    const speed = 80;
    const increment = Math.ceil(target / speed);

    const counter = setInterval(() => {
      count += increment;

      if(count >= target){
        count = target;
        clearInterval(counter);
      }

      stat.textContent = count.toLocaleString();
    }, 20);
  });

  counted = true;
}

function observeCounter(){
  const statsSection = document.querySelector('.stats-section');
  if(!statsSection) return;

  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        startCounter();
      }
    });
  },{threshold:0.4});

  observer.observe(statsSection);
}


/* ================= 위치 타이핑 안내 ================= */
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

  let i=0;
  const el=document.getElementById("typing-text");
  if(!el) return;

  el.textContent="";

  function type(){
    if(i<content.length){
      el.textContent+=content[i];
      i++;
      setTimeout(type,20);
    }
  }

  type();
}


/* ================= 브랜드 타이핑 ================= */
function startBrandTyping(){
  const brandHighlight = document.querySelector(".brand-highlight");
  if(!brandHighlight) return;

  const brandText = brandHighlight.innerText
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join("\n");

  brandHighlight.innerHTML = "";
  brandHighlight.classList.add("show","typing");

  let i = 0;

  function type(){
    if(i < brandText.length){

      if(brandText[i] === "\n"){
        brandHighlight.innerHTML += "<br>";
      }else{
        brandHighlight.innerHTML += brandText[i];
      }

      i++;
      const speed = 22 + Math.random()*18;
      setTimeout(type, speed);

    }else{
      brandHighlight.classList.remove("typing");
    }
  }

  type();
}


/* ================= 모바일 시설투어 컬러 전환 ================= */
function observeFacilityColor(){
  const items = document.querySelectorAll(".facility-item");
  if(!items.length) return;

  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add("color-on");
      }else{
        entry.target.classList.remove("color-on");
      }
    });
  },{
    threshold:0.35
  });

  items.forEach(item=>{
    observer.observe(item);
  });
}

function forceFacilityColorMobile(){
  const items = document.querySelectorAll(".facility-item");

  items.forEach(item=>{
    const rect = item.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if(rect.top < windowHeight * 0.75 && rect.bottom > windowHeight * 0.2){
      item.classList.add("color-on");
    }
  });
}

window.addEventListener("scroll", forceFacilityColorMobile);
window.addEventListener("resize", forceFacilityColorMobile);
window.addEventListener("load", forceFacilityColorMobile);

setTimeout(forceFacilityColorMobile, 800);
setTimeout(forceFacilityColorMobile, 1600);


/* ================= FAQ 클릭 ================= */
const faqItems = document.querySelectorAll(".faq-new-item");

faqItems.forEach(item=>{
  item.addEventListener("click", function(){
    this.classList.toggle("active");
  });
});


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

  images.forEach((img, index)=>{
    img.addEventListener("click", ()=>{
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

});