document.addEventListener("DOMContentLoaded", function(){

  /* 로더 */
  let siteStarted =
    false;

  function startSite(){

    if(siteStarted) return;

    siteStarted =
      true;

    placePassUnderAllPass();
    initHeroExpand();
    fadeIn();
    observeCounter();
    startTyping();
    startBrandTyping();
    initAllPassTyping();
    initAllPassMapReveal();
    initPassMap();
    initBrandAbout();
    initCoBrandExperience();
    initFacilityTour();

  }

  function placePassUnderAllPass(){

    const passSection =
      document.querySelector("[data-pass-map]");

    const allPassHeadline =
      document.querySelector("#brand #inc01 .brand-cross");

    if(!passSection || !allPassHeadline) return;

    if(allPassHeadline.nextElementSibling === passSection) return;

    allPassHeadline.insertAdjacentElement("afterend", passSection);

  }

  function initAllPassTyping(){

    const line =
      document.querySelector("[data-allpass-typing]");

    if(!line || line.dataset.typingReady === "true") return;

    const textEl =
      line.querySelector(".brand-type-text");

    const cursor =
      line.querySelector(".brand-type-cursor");

    if(!textEl) return;

    line.dataset.typingReady =
      "true";

    const prefix =
      line.dataset.prefix || "";

    const wrong =
      line.dataset.wrong || "";

    const rawFinalText =
      line.dataset.final || "";

    const breakAfter =
      line.dataset.breakAfter || "";

    const finalText =
      breakAfter && rawFinalText.includes(breakAfter)
        ? rawFinalText.replace(`${breakAfter} `, `${breakAfter}\n`)
        : rawFinalText;

    const wait =
      delay=>new Promise(resolve=>setTimeout(resolve, delay));

    const typeText =
      async (text, speed = 42)=>{

        for(const character of Array.from(text)){
          textEl.textContent += character;
          await wait(speed);
        }

      };

    const eraseText =
      async (count, speed = 34)=>{

        for(let i = 0; i < count; i++){
          const current =
            Array.from(textEl.textContent);

          current.pop();
          textEl.textContent =
            current.join("");

          await wait(speed);
        }

      };

    const run =
      async ()=>{

        if(line.dataset.typed === "true") return;

        line.dataset.typed =
          "true";

        textEl.textContent =
          "";

        if(cursor){
          cursor.classList.remove("is-finished");
        }

        await wait(180);
        await typeText(prefix, 38);
        await typeText(wrong, 52);

        if(cursor){
          cursor.classList.add("is-thinking");
        }

        await wait(1380);

        if(cursor){
          cursor.classList.remove("is-thinking");
        }

        await eraseText(Array.from(wrong).length, 38);
        await wait(180);
        await typeText(finalText, 32);
        await wait(500);

        if(cursor){
          cursor.classList.add("is-finished");
        }

      };

    if("IntersectionObserver" in window){
      const observer =
        new IntersectionObserver((entries)=>{

          entries.forEach(entry=>{

            if(entry.isIntersecting){
              observer.disconnect();
              run();
            }

          });

        },{threshold:.38});

      observer.observe(line);
      return;
    }

    run();

  }

  function initAllPassMapReveal(){

    const reveal =
      document.querySelector("[data-allpass-map-reveal]");

    if(!reveal || reveal.dataset.revealReady === "true") return;

    reveal.dataset.revealReady =
      "true";

    const show =
      ()=>{
        reveal.classList.add("is-visible");
      };

    if("IntersectionObserver" in window){
      const observer =
        new IntersectionObserver((entries)=>{

          entries.forEach(entry=>{

            if(entry.isIntersecting){
              observer.disconnect();
              show();
            }

          });

        },{threshold:.42});

      observer.observe(reveal);
      return;
    }

    show();

  }

  function initPassRealMap(section){

    const canvas =
      section.querySelector("[data-pass-map-canvas]");

    const emptyApi = {
      setRegion(){},
      setBranch(){}
    };

    if(!canvas || !window.L) return emptyApi;

    const regionCoordinates = {
      "서울":[37.5665, 126.9780],
      "경기":[37.4138, 127.5183],
      "대전":[36.3504, 127.3845],
      "충청":[36.6357, 127.4913],
      "대구":[35.8714, 128.6014],
      "부산":[35.1796, 129.0756],
      "경상":[35.2383, 128.6924],
      "울산":[35.5384, 129.3114],
      "전북":[35.8242, 127.1480]
    };

    const center =
      [36.35, 127.85];

    const koreaBounds =
      [[33.0, 124.45], [38.9, 130.9]];

    const map =
      L.map(canvas, {
        attributionControl:false,
        boxZoom:false,
        doubleClickZoom:false,
        keyboard:false,
        scrollWheelZoom:false,
        tap:false,
        zoomControl:false
      }).setView(center, 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom:18,
      attribution:"© OpenStreetMap"
    }).addTo(map);

    L.control.attribution({
      prefix:false,
      position:"bottomright"
    }).addAttribution("© OpenStreetMap").addTo(map);

    const createIcon =
      (region, active = false)=>L.divIcon({
        className:`pass-leaflet-marker${active ? " is-active" : ""}`,
        html:`<span></span><em>${region}</em>`,
        iconAnchor:[13, 13],
        iconSize:[26, 26]
      });

    const markers = {};

    Object.entries(regionCoordinates).forEach(([region, coordinates])=>{
      markers[region] =
        L.marker(coordinates, {
          icon:createIcon(region, region === "경기"),
          keyboard:false
        }).addTo(map);
    });

    section.classList.add("has-real-map");

    const fitKorea =
      ()=>{
        map.fitBounds(koreaBounds, {
          animate:true,
          paddingBottomRight:window.innerWidth > 900 ? [80, 86] : [32, 46],
          paddingTopLeft:window.innerWidth > 900 ? [560, 96] : [32, 46]
        });
      };

    const setMarkerState =
      region=>{
        Object.entries(markers).forEach(([markerRegion, marker])=>{
          marker.setIcon(createIcon(markerRegion, markerRegion === region));

          if(markerRegion !== region){
            marker.unbindTooltip();
          }
        });
      };

    const setRegion =
      region=>{
        if(!region || region === "전체"){
          setMarkerState("");
          fitKorea();
          return;
        }

        const coordinates =
          regionCoordinates[region];

        if(!coordinates) return;

        setMarkerState(region);
        fitKorea();
      };

    const setBranch =
      button=>{
        if(!button) return;

        const region =
          button.dataset.region;

        const branch =
          button.dataset.branch || button.textContent.trim();

        const marker =
          markers[region];

        if(!marker) return;

        setRegion(region);
        marker
          .bindTooltip(branch, {
            className:"pass-leaflet-tooltip",
            direction:"top",
            offset:[0, -18],
            permanent:true
          })
          .openTooltip();
      };

    setTimeout(()=>{
      map.invalidateSize();
      fitKorea();
    }, 250);

    window.addEventListener("resize", ()=>{
      map.invalidateSize();
      fitKorea();
    });

    return {
      setRegion,
      setBranch
    };

  }

  function initPassMap(){

    const section =
      document.querySelector("[data-pass-map]");

    if(!section || section.dataset.passMapReady === "true") return;

    const branchButtons =
      Array.from(section.querySelectorAll(".pass-branch-btn"));

    const regionTabs =
      Array.from(section.querySelectorAll(".pass-region-tab"));

    const pins =
      Array.from(section.querySelectorAll(".map-pin"));

    const placeName =
      section.querySelector("[data-pass-place-name]");

    const placeMeta =
      section.querySelector("[data-pass-place-meta]");

    const placeQuery =
      section.querySelector("[data-pass-place-query]");

    const placeLink =
      section.querySelector("[data-pass-place-link]");

    const infoLink =
      section.querySelector("[data-pass-place-info]");

    const reviewLink =
      section.querySelector("[data-pass-place-review]");

    const routeLink =
      section.querySelector("[data-pass-place-route]");

    const branchList =
      section.querySelector(".pass-branch-list");

    if(!branchButtons.length) return;

    section.dataset.passMapReady =
      "true";

    const createNaverPlaceUrl =
      query=>`https://map.naver.com/p/search/${encodeURIComponent(query)}`;

    const realMap =
      initPassRealMap(section);

    const syncRegionState =
      region=>{

        const nextRegion =
          region || "전체";

        regionTabs.forEach(tab=>{
          tab.classList.toggle(
            "is-active",
            tab.dataset.region === nextRegion
          );
        });

        pins.forEach(pin=>{
          pin.classList.toggle(
            "is-active",
            nextRegion !== "전체" && pin.dataset.region === nextRegion
          );
        });

        branchButtons.forEach(button=>{
          const shouldShow =
            nextRegion === "전체" || button.dataset.region === nextRegion;

          button.classList.toggle("is-hidden", !shouldShow);
        });

        realMap.setRegion(nextRegion);

      };

    const updatePlace =
      button=>{

        const branch =
          button.dataset.branch || button.textContent.trim();

        const region =
          button.dataset.region || "";

        const tier =
          button.dataset.tier || "";

        const query =
          button.dataset.query || `헬스보이짐 ${branch}`;

        const url =
          createNaverPlaceUrl(query);

        branchButtons.forEach(item=>{
          item.classList.toggle("is-active", item === button);
        });

        if(placeName){
          placeName.textContent =
            branch;
        }

        if(placeMeta){
          placeMeta.textContent =
            [region, tier].filter(Boolean).join(" · ");
        }

        if(placeQuery){
          placeQuery.textContent =
            query;
        }

        if(placeLink){
          placeLink.href =
            url;

          placeLink.textContent =
            `${branch} 네이버플레이스 바로가기 >`;
        }

        if(infoLink){
          infoLink.href =
            url;
        }

        if(reviewLink){
          reviewLink.href =
            `https://search.naver.com/search.naver?query=${encodeURIComponent(`${query} 리뷰`)}`;
        }

        if(routeLink){
          routeLink.href =
            url;
        }

        realMap.setBranch(button);

      };

    const selectBranch =
      (button, options = {})=>{

        if(!button) return;

        if(!options.preserveFilter){
          syncRegionState(button.dataset.region);
        }

        updatePlace(button);

      };

    const setRegion =
      region=>{

        syncRegionState(region);

        if(branchList){
          branchList.scrollTop =
            0;
        }

        const visibleButtons =
          branchButtons.filter(button=>!button.classList.contains("is-hidden"));

        const activeVisibleButton =
          visibleButtons.find(button=>button.classList.contains("is-active"));

        selectBranch(
          activeVisibleButton || visibleButtons[0],
          {preserveFilter:true}
        );

      };

    branchButtons.forEach(button=>{
      button.addEventListener("click", ()=>{
        selectBranch(button);
      });
    });

    regionTabs.forEach(tab=>{
      tab.addEventListener("click", ()=>{
        setRegion(tab.dataset.region);
      });
    });

    pins.forEach(pin=>{
      pin.addEventListener("click", ()=>{
        setRegion(pin.dataset.region);
      });
    });

    const defaultButton =
      branchButtons.find(button=>button.dataset.branch === "수내점") ||
      branchButtons[0];

    const activeDefaultButton =
      branchButtons.find(button=>button.classList.contains("is-active")) ||
      branchButtons.find(button=>button.dataset.query === "헬스보이짐 수내점") ||
      defaultButton;

    selectBranch(activeDefaultButton);

  }

  function prepareIntroCaption(){

    const caption =
      document.querySelector(".intro-desc[data-caption-reveal]");

    if(!caption || caption.dataset.prepared === "true") return;

    const lines =
      caption.querySelectorAll(".intro-desc-line");

    let captionIndex =
      0;

    lines.forEach((line, lineIndex)=>{

      const source =
        line.dataset.text || line.textContent.trim();

      line.textContent =
        "";

      line.setAttribute("aria-hidden", "true");

      Array.from(source).forEach((character)=>{

        const letter =
          document.createElement("span");

        const isSpace =
          character === " ";

        letter.className =
          isSpace ? "desc-char is-space" : "desc-char";

        letter.textContent =
          isSpace ? "\u00a0" : character;

        letter.style.setProperty(
          "--caption-index",
          captionIndex
        );

        line.appendChild(letter);

        captionIndex +=
          isSpace ? .45 : 1;

      });

      if(lineIndex < lines.length - 1){
        captionIndex +=
          5;
      }

    });

    caption.classList.add("is-split");
    caption.dataset.prepared =
      "true";

  }

  function setLoaderTarget(){

    const loader =
      document.querySelector(".logo-screen");

    const loaderLogo =
      document.querySelector(".loader-logo");

    const headerLogo =
      document.querySelector(".logo a");

    if(!loader || !loaderLogo || !headerLogo) return;

    const logoRect =
      headerLogo.getBoundingClientRect();

    const loaderRect =
      loaderLogo.getBoundingClientRect();

    const targetScale =
      loaderRect.width > 0
        ? Math.min(.75, Math.max(.2, logoRect.width / loaderRect.width))
        : .28;

    loader.style.setProperty(
      "--loader-target-x",
      `${logoRect.left + logoRect.width / 2}px`
    );

    loader.style.setProperty(
      "--loader-target-y",
      `${logoRect.top + logoRect.height / 2}px`
    );

    loader.style.setProperty(
      "--loader-target-scale",
      targetScale.toFixed(4)
    );

  }

  function scrollToHashTarget(){

    const hash =
      window.location.hash;

    if(!hash || hash.length < 2) return;

    let targetId =
      hash.slice(1);

    try{
      targetId =
        decodeURIComponent(targetId);
    }catch(error){
      targetId =
        hash.slice(1);
    }

    const target =
      document.getElementById(targetId);

    if(!target) return;

    const header =
      document.querySelector("header");

    const headerHeight =
      header ? header.offsetHeight : 0;

    const top =
      target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

    window.scrollTo({
      top:Math.max(0, top),
      behavior:"auto"
    });

  }

  function queueHashScroll(){

    [80, 700, 1600].forEach(delay=>{
      setTimeout(scrollToHashTarget, delay);
    });

  }

  function openMain(){

    const loader =
      document.querySelector(".logo-screen");

    const mainContent =
      document.querySelector(".main-content");

    if(mainContent){
      mainContent.style.display = "block";
    }

    if(!loader){
      document.body.classList.add("loaded");
      startSite();
      queueHashScroll();
      return;
    }

    setLoaderTarget();

    requestAnimationFrame(()=>{

      setLoaderTarget();
      document.body.classList.add("loader-docking");
      loader.classList.add("dock-to-logo");

    });

    setTimeout(()=>{

      document.body.classList.add("loaded");
      loader.classList.add("release");
      startSite();
      queueHashScroll();

    },1250);

    setTimeout(()=>{

      loader.style.display = "none";

    },2000);

  }

  window.addEventListener("resize", ()=>{

    if(!document.body.classList.contains("loaded")){
      setLoaderTarget();
    }

  });

  prepareIntroCaption();

  setTimeout(openMain, 1350);



  /* 메인 히어로 영상 확장 */
  function initHeroExpand(){

    const hero =
      document.querySelector(".hero-expand-section");

    if(!hero) return;

    const clamp =
      (value, min, max)=>Math.max(min, Math.min(max, value));

      const easeOut =
        value=>1 - Math.pow(1 - value, 3);

      const easeInOut =
        value=>value * value * (3 - 2 * value);

    function update(){

      const rect =
        hero.getBoundingClientRect();

      const scrollable =
        Math.max(1, hero.offsetHeight - window.innerHeight);

      const progress =
        Math.max(0, Math.min(1, -rect.top / scrollable));

      hero.style.setProperty(
        "--hero-progress",
        progress.toFixed(4)
      );

      const isMobile =
        window.innerWidth <= 768;

      const headerOffset =
        isMobile ? 76 : 80;

      const availableHeight =
        Math.max(360, window.innerHeight - headerOffset);

      const startWidth =
        Math.min(
          window.innerWidth * (isMobile ? 0.86 : 0.72),
          isMobile ? 370 : 1420
        );

      const startHeight =
        isMobile
          ? clamp(availableHeight * 0.36, 230, 270)
          : clamp(availableHeight * 0.5, 360, 480);

      const startBottom =
        isMobile ? -8 : 0;

      const expandEnd =
        isMobile ? 0.5 : 0.34;

      const copyStart =
        isMobile ? 0.52 : 0.32;

      const copyRange =
        isMobile ? 0.28 : 0.3;

      const lineStart =
        isMobile ? 0.56 : 0.38;

      const lineStep =
        isMobile ? 0.05 : 0.065;

      const lineRange =
        isMobile ? 0.32 : 0.36;

      const underlineStart =
        lineStart + lineStep + lineRange * 0.78;

      const underlineRange =
        isMobile ? 0.12 : 0.18;

      const expand =
        easeOut(clamp(progress / expandEnd, 0, 1));

      const copyProgress =
        easeInOut(clamp((progress - copyStart) / copyRange, 0, 1));

      const introProgress =
        easeOut(clamp(progress / 0.24, 0, 1));

      const scrollProgress =
        clamp(progress / 0.18, 0, 1);

      const radius =
        (isMobile ? 20 : 28) * (1 - expand);

      const frameWidth =
        startWidth + (window.innerWidth - startWidth) * expand;

      const frameHeight =
        startHeight + (availableHeight - startHeight) * expand;

      const frameBottom =
        startBottom * (1 - expand);

      const lineReveal =
        index=>`${(easeInOut(clamp((progress - (lineStart + index * lineStep)) / lineRange, 0, 1)) * 100).toFixed(1)}%`;

      const underlineProgress =
        easeInOut(clamp((progress - underlineStart) / underlineRange, 0, 1));

      hero.style.setProperty(
        "--hero-frame-width",
        `${frameWidth}px`
      );

      hero.style.setProperty(
        "--hero-frame-height",
        `${frameHeight}px`
      );

      hero.style.setProperty(
        "--hero-frame-radius",
        `${radius}px`
      );

      hero.style.setProperty(
        "--hero-frame-bottom",
        `${frameBottom}px`
      );

      hero.style.setProperty(
        "--hero-title-opacity",
        (1 - introProgress).toFixed(4)
      );

      hero.style.setProperty(
        "--hero-title-shift",
        `${-42 * introProgress}px`
      );

      hero.style.setProperty(
        "--hero-title-height",
        `${62 - 14 * introProgress}vh`
      );

      hero.style.setProperty(
        "--hero-copy-opacity",
        copyProgress.toFixed(4)
      );

      hero.style.setProperty(
        "--hero-copy-y",
        `${64 - 64 * copyProgress}px`
      );

      for(let i = 0; i < 4; i++){
        hero.style.setProperty(
          `--hero-line-${i + 1}`,
          lineReveal(i)
        );
      }

      hero.style.setProperty(
        "--hero-underline",
        underlineProgress.toFixed(4)
      );

      hero.style.setProperty(
        "--hero-scroll-opacity",
        (1 - scrollProgress).toFixed(4)
      );

      hero.style.setProperty(
        "--hero-overlay",
        (0.12 + 0.5 * copyProgress).toFixed(4)
      );

    }

    function tick(){

      update();
      requestAnimationFrame(tick);

    }

    tick();

    window.addEventListener(
      "scroll",
      update,
      { passive:true }
    );

    setInterval(update, 100);

    window.addEventListener(
      "resize",
      update
    );

  }




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

    if(window.innerWidth <= 768){

      ScrollTrigger.create({
        trigger:"#facilityTour .cont",
        start:"top top",
        end:"bottom bottom",
        pin:"#facilityTour .img_inner",
        pinSpacing:false,
        anticipatePin:1,
        invalidateOnRefresh:true,
      });

    }

    texts.forEach((text, i)=>{

      ScrollTrigger.create({
        trigger:text,
        start:"top 62%",
        end:"bottom 38%",
        onEnter:()=>setActive(i),
        onEnterBack:()=>setActive(i),
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

