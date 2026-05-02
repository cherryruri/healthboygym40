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


/* ================= 로고 타이핑 ================= */
const text="HEALTHBOYGYM";
let i=0;
const logo=document.getElementById("logo-text");

if(logo){
  const typing=setInterval(()=>{
    if(i<text.length){
      logo.textContent+=text[i];
      i++;
    }else{
      clearInterval(typing);
      setTimeout(()=>{
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
          startBrandTyping(); // 👈 추가
        },600);

      },500);
    }
  },60);
}


/* ================= fade 애니메이션 ================= */
function fadeIn(){
  const els=document.querySelectorAll('.fade');
  const observer=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      entry.target.classList.toggle('show', entry.isIntersecting);
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


/* ================= 타이핑 안내 ================= */
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


/* ================= 브랜드 타이핑 (핵심) ================= */
function startBrandTyping(){

  const brandHighlight = document.querySelector(".brand-highlight");
  if(!brandHighlight) return;

  const text = brandHighlight.innerText
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join("\n");

  brandHighlight.innerHTML = "";
  brandHighlight.classList.add("show","typing");

  let i = 0;

  function type(){
    if(i < text.length){

      if(text[i] === "\n"){
        brandHighlight.innerHTML += "<br>";
      }else{
        brandHighlight.innerHTML += text[i];
      }

      i++;
      const speed = 22 + Math.random()*18;
      setTimeout(type, speed);

    }else{
      brandHighlight.classList.add("typing");
    }
  }

  type();
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

/* ================= 모바일 사이드 메뉴 생성 ================= */
document.addEventListener("DOMContentLoaded", function(){

  const navbar = document.querySelector(".navbar");
  const menu = document.querySelector(".menu");

  if(!navbar || !menu) return;
  if(document.querySelector(".mobile-menu-btn")) return;

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

  menuBtn.addEventListener("click", function(){
    document.body.classList.add("menu-open");
  });

  overlay.addEventListener("click", function(){
    document.body.classList.remove("menu-open");
  });

  sideMenu.querySelector(".mobile-close").addEventListener("click", function(){
    document.body.classList.remove("menu-open");
  });

  sideMenu.querySelectorAll("a").forEach(link=>{
    link.addEventListener("click", function(){
      document.body.classList.remove("menu-open");
    });
  });

});
/* 모바일 시설투어 사진 스크롤 컬러 전환 */
const facilityColorItems = document.querySelectorAll(".facility-item");

const facilityColorObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("color-on");
    }
  });
},{
  threshold:0.35
});

facilityColorItems.forEach(item=>{
  facilityColorObserver.observe(item);
});
