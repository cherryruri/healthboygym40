document.addEventListener("DOMContentLoaded", function(){

  /* 로더 */
  function openMain(){

    const loader =
      document.querySelector(".logo-screen");

    const mainContent =
      document.querySelector(".main-content");

    if(loader){
      loader.classList.add("zoom-out");
    }

    setTimeout(()=>{

      if(loader){
        loader.style.display = "none";
      }

      if(mainContent){
        mainContent.style.display = "block";
      }

      document.body.classList.add("loaded");

      fadeIn();
      observeCounter();
      startTyping();
      startBrandTyping();
      initBrandAbout();
      initCoBrandExperience();
      initFacilityTour();

    },600);

  }

  setTimeout(openMain, 800);




  /* fade */
  function fadeIn(){

    const els =
      document.querySelectorAll(".fade");

    const observer =
      new IntersectionObserver((entries)=>{

        entries.forEach(entry=>{

          if(entry.isIntersecting){
            entry.target.classList.add("show");
          }

        });

      },{threshold:0.15});

    els.forEach(el=>observer.observe(el));

  }




  /* 숫자 카운터 */
  let counted = false;

  function startCounter(){

    if(counted) return;

    document
      .querySelectorAll(".stat-number")
      .forEach(stat=>{

        const target =
          Number(stat.dataset.target);

        let count = 0;

        const increment =
          Math.ceil(target / 80);

        const counter =
          setInterval(()=>{

            count += increment;

            if(count >= target){

              count = target;

              clearInterval(counter);

            }

            stat.textContent =
              count.toLocaleString();

          },20);

      });

    counted = true;

  }

  function observeCounter(){

    const statsSection =
      document.querySelector(".stats-section");

    if(!statsSection) return;

    const observer =
      new IntersectionObserver((entries)=>{

        entries.forEach(entry=>{

          if(entry.isIntersecting){

            startCounter();

          }

        });

      },{threshold:0.4});

    observer.observe(statsSection);

  }




  /* 위치안내 타이핑 */
  function startTyping(){

    const content = `
주차 안내
건물 내 지하 2층, 3층 주차장 이용 가능합니다.

[ 차량 이용 시 ]
수내역 1번 출구에서 267m

[ 도보 방문 시 ]
배떼엠 옆 입구 이용`;

    let i = 0;

    const el =
      document.getElementById("typing-text");

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

    const typingEl =
      document.getElementById("typing-brand");

    if(!typingEl) return;

    const text = `대한민국 NO.1 피트니스 브랜드 헬스보이짐입니다.`;

    let i = 0;

    function type(){

      if(i < text.length){

        typingEl.innerHTML += text[i];

        i++;

        setTimeout(type,35);

      }

    }

    const observer =
      new IntersectionObserver((entries)=>{

        entries.forEach(entry=>{

          if(entry.isIntersecting){

            typingEl.innerHTML = "";

            type();

            observer.disconnect();

          }

        });

      },{threshold:0.4});

    observer.observe(typingEl);

  }




  /* 브랜드 ABOUT */
  function initBrandAbout(){

    const brandAbout =
      document.querySelector(".brand-about-section");

    if(!brandAbout) return;

    function update(){

      const rect =
        brandAbout.getBoundingClientRect();

      const windowH =
        window.innerHeight;

      let progress =
        (windowH * 0.15 - rect.top)
        / (windowH * 2.1);

      progress =
        Math.max(0, Math.min(1, progress));

      brandAbout.style.setProperty(
        "--brand-progress",
        progress
      );

      if(progress < 0.68){

        brandAbout.dataset.copy = "0";

      }else if(progress < 0.80){

        brandAbout.dataset.copy = "1";

      }else if(progress < 0.92){

        brandAbout.dataset.copy = "2";

      }else{

        brandAbout.dataset.copy = "3";

      }

    }

    window.addEventListener(
      "scroll",
      update,
      { passive:true }
    );

    window.addEventListener(
      "resize",
      update
    );

    update();

  }




  /* co1162-res 브랜드 섹션 */
  function initCoBrandExperience(){

    const section =
      document.querySelector("#brand #inc01");

    if(!section) return;

    if(window.Swiper){
      new Swiper("#brand #inc01 .all_slider", {
        loop:true,
        speed:1000,
        slidesPerView:1.5,
        spaceBetween:20,
        slideActiveClass:"on",
        centeredSlides:true,
        autoplay:{
          delay:2500,
          disableOnInteraction:false,
        },
        breakpoints:{
          481:{
            slidesPerView:2,
            spaceBetween:30,
          },
          769:{
            slidesPerView:3.5,
            spaceBetween:30,
          },
          1025:{
            slidesPerView:4,
            spaceBetween:40,
          },
          1441:{
            slidesPerView:4.5,
            spaceBetween:50,
          },
        },
      });
    }

    if(window.feather){
      feather.replace();
    }

    if(!window.gsap || !window.ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    gsap.to("#brand #inc01 .brand-cross .txt", {
      x:0,
      scrollTrigger:{
        trigger:"#brand #inc01 .brand-cross",
        start:"top bottom",
        end:"center center",
        scrub:1,
      },
    });

  }



  /* 시설 투어 */
  function initFacilityTour(){

    const section =
      document.querySelector("#facilityTour");

    if(!section || !window.gsap || !window.ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    const imgs =
      document.querySelectorAll("#facilityTour .img_box li");

    const texts =
      document.querySelectorAll("#facilityTour .txt_box li");

    if(!imgs.length || !texts.length) return;

    imgs.forEach(img=>{

      const photos =
        img.querySelectorAll("span");

      if(!photos.length) return;

      photos[0].classList.add("photo-on");

    });

    const lastIndex =
      texts.length - 1;

    function setActive(index){

      imgs.forEach(img=>img.classList.remove("on"));
      texts.forEach(text=>text.classList.remove("on"));

      if(imgs[index]){
        imgs[index].classList.add("on");
      }

      if(texts[index]){
        texts[index].classList.add("on");
      }

    }

    setActive(0);

    texts.forEach((text, i)=>{

      ScrollTrigger.create({
        trigger:text,
        start:"top 40%",
        end:"bottom 0%",
        onEnterBack:()=>setActive(i),
        onLeave:()=>{
          if(i < lastIndex){
            setActive(i + 1);
          }
        },
      });

    });

    const modal =
      document.querySelector(".facility-photo-modal");

    const modalImg =
      modal && modal.querySelector("img");

    const modalCaption =
      modal && modal.querySelector("p");

    const modalClose =
      modal && modal.querySelector(".facility-modal-close");

    const modalPrev =
      modal && modal.querySelector(".facility-modal-nav.prev");

    const modalNext =
      modal && modal.querySelector(".facility-modal-nav.next");

    let modalPhotos = [];
    let modalPhotoIndex = 0;

    function getPhotoSrc(photo){

      const bg =
        window.getComputedStyle(photo).backgroundImage;

      return bg.replace(/^url\(["']?/, "").replace(/["']?\)$/, "");

    }

    function renderModalPhoto(){

      if(!modalImg || !modalPhotos.length) return;

      modalImg.src =
        getPhotoSrc(modalPhotos[modalPhotoIndex]);

    }

    function openFacilityModal(index){

      if(!modal || !modalImg || !modalCaption) return;

      const activeImg =
        imgs[index];

      modalPhotos =
        activeImg
          ? Array.from(activeImg.querySelectorAll("span"))
          : [];

      if(!modalPhotos.length) return;

      modalPhotoIndex = 0;
      renderModalPhoto();
      modalImg.alt =
        texts[index].querySelector("h2")?.textContent || "시설 사진";
      modalCaption.textContent = modalImg.alt;

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");

    }

    function closeFacilityModal(){

      if(!modal) return;

      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");

    }

    texts.forEach((text, index)=>{

      const button =
        text.querySelector(".facility-view-btn");

      if(button){
        button.addEventListener("click", ()=>{
          openFacilityModal(index);
        });
      }

    });

    if(modal){
      modal.addEventListener("click", (event)=>{
        if(event.target === modal){
          closeFacilityModal();
        }
      });
    }

    if(modalClose){
      modalClose.addEventListener("click", closeFacilityModal);
    }

    if(modalPrev){
      modalPrev.addEventListener("click", ()=>{
        if(!modalPhotos.length) return;
        modalPhotoIndex =
          (modalPhotoIndex - 1 + modalPhotos.length) % modalPhotos.length;
        renderModalPhoto();
      });
    }

    if(modalNext){
      modalNext.addEventListener("click", ()=>{
        if(!modalPhotos.length) return;
        modalPhotoIndex =
          (modalPhotoIndex + 1) % modalPhotos.length;
        renderModalPhoto();
      });
    }

    window.addEventListener("keydown", (event)=>{
      if(event.key === "Escape"){
        closeFacilityModal();
      }

      if(!modal || !modal.classList.contains("is-open")) return;

      if(event.key === "ArrowLeft" && modalPrev){
        modalPrev.click();
      }

      if(event.key === "ArrowRight" && modalNext){
        modalNext.click();
      }
    });

  }



  /* 모바일 메뉴 */
  const menuBtn =
    document.querySelector(".mobile-menu-btn");

  const overlay =
    document.querySelector(".mobile-menu-overlay");

  const sideMenu =
    document.querySelector(".mobile-side-menu");

  const closeBtn =
    document.querySelector(".mobile-close");

  if(menuBtn){

    menuBtn.addEventListener("click", ()=>{

      document.body.classList.add("menu-open");

    });

  }

  function closeMenu(){

    document.body.classList.remove("menu-open");

  }

  if(closeBtn){

    closeBtn.addEventListener(
      "click",
      closeMenu
    );

  }

  if(overlay){

    overlay.addEventListener(
      "click",
      closeMenu
    );

  }

  if(sideMenu){

    sideMenu
  .querySelectorAll("a")
  .forEach(link=>{

    link.addEventListener("click", ()=>{

      const href = link.getAttribute("href");

      if(href === "login.html"){
        window.location.href = "login.html";
        return;
      }

      document.body.classList.remove("menu-open");

    });

  });


  }




  /* FAQ */
  const faqItems =
    document.querySelectorAll(".faq-new-item");

  faqItems.forEach(item=>{

    item.addEventListener("click", ()=>{

      item.classList.toggle("active");

    });

  });




  /* 모바일 트레이너 */
  const trainerCards =
    document.querySelectorAll(".trainer-card");

  trainerCards.forEach(card=>{

    card.addEventListener("click", ()=>{

      trainerCards.forEach(other=>{

        if(other !== card){

          other.classList.remove("active");

        }

      });

      card.classList.toggle("active");

    });

  });
  
   

});

