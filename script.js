document.addEventListener("DOMContentLoaded", function(){

/* ================= 로고 타이핑 ================= */
const text = "HEALTHBOYGYM";
let i = 0;
const logo = document.getElementById("logo-text");

function openSite(){
  const logoScreen = document.querySelector(".logo-screen");
  const mainContent = document.querySelector(".main-content");

  if(logoScreen) logoScreen.classList.add("zoom-out");

  setTimeout(()=>{
    if(logoScreen) logoScreen.style.display = "none";
    if(mainContent) mainContent.style.display = "block";

    document.body.classList.add("loaded");

    fadeIn();
    startCounter();
    observeFacility();
    faqInit();
  },600);
}

if(logo){
  const typing = setInterval(()=>{
    if(i < text.length){
      logo.textContent += text[i];
      i++;
    } else {
      clearInterval(typing);
      setTimeout(openSite,500);
    }
  },60);
} else {
  openSite();
}


/* ================= fade ================= */
function fadeIn(){
  const els = document.querySelectorAll(".fade");

  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add("show");
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

  stats.forEach(stat=>{
    const target = Number(stat.dataset.target);
    let count = 0;
    const speed = 80;
    const increment = Math.ceil(target / speed);

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


/* ================= 시설 컬러 ================= */
function observeFacility(){
  const items = document.querySelectorAll(".facility-item");

  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add("color-on");
      }
    });
  },{threshold:0.3});

  items.forEach(item=>observer.observe(item));
}


/* ================= 스크롤 ================= */
const scrollDown = document.querySelector(".scroll-down");

if(scrollDown){
  scrollDown.addEventListener("click",()=>{
    const about = document.querySelector("#about");
    if(about){
      about.scrollIntoView({behavior:"smooth"});
    }
  });
}

document.querySelectorAll('a[href^="#"]').forEach(link=>{
  link.addEventListener("click",function(e){
    const target = document.querySelector(this.getAttribute("href"));

    if(target){
      e.preventDefault();
      target.scrollIntoView({behavior:"smooth"});
    }
  });
});


/* ================= FAQ ================= */
function faqInit(){
  const items = document.querySelectorAll(".faq-new-item");
  const buttons = document.querySelectorAll(".faq-new-category button");
  const search = document.getElementById("faqSearch");

  // 열고닫기
  items.forEach(item=>{
    item.addEventListener("click",()=>{
      items.forEach(i=>{ if(i!==item) i.classList.remove("active"); });
      item.classList.toggle("active");
    });
  });

  // 카테고리
  buttons.forEach(btn=>{
    btn.addEventListener("click",()=>{
      const cat = btn.dataset.category;

      buttons.forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");

      items.forEach(item=>{
        item.classList.remove("active");

        if(cat === "all" || item.dataset.category === cat){
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });
    });
  });

  // 검색
  if(search){
    search.addEventListener("input",()=>{
      const val = search.value.toLowerCase();

      items.forEach(item=>{
        const text = item.innerText.toLowerCase();
        item.style.display = text.includes(val) ? "block" : "none";
      });
    });
  }
}

});