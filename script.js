document.addEventListener("DOMContentLoaded", function(){

  /* 로더 */
  if("scrollRestoration" in window.history){
    window.history.scrollRestoration =
      "manual";
  }

  if(!window.location.hash){
    window.scrollTo(0, 0);
  }

  let siteStarted =
    false;

  function startSite(){

    if(siteStarted) return;

    siteStarted =
      true;

    const startupSteps = [
      initMobileIntroVideo,
      placePassUnderAllPass,
      placeReviewsAfterIntro,
      prepareIntroStatementWords,
      initHeroCaptionScrollGate,
      initHeroExpand,
      initReviewCoverPanel,
      fadeIn,
      observeCounter,
      startTyping,
      startBrandTyping,
      initAllPassTyping,
      initAllPassRevealButton,
      initFacilityTour,
      initPassBranchLocator,
      initAllPassLocatorReveal,
      initPassMap,
      initBrandAbout,
      initCoBrandExperience
    ];

    startupSteps.forEach(step=>{
      try{
        step();
      }catch(error){
        console.error(error);
      }
    });

  }

  function placeReviewsAfterIntro(){

    const brandArticle =
      document.querySelector("#brand #inc01");

    const brandCross =
      brandArticle ? brandArticle.querySelector(".brand-cross") : null;

    const reviewBg =
      brandArticle ? brandArticle.querySelector(".bg_wrap") : null;

    const reviewList =
      brandArticle ? brandArticle.querySelector(".list") : null;

    const heroSticky =
      document.querySelector(".hero-expand-sticky");

    if(!brandArticle || !brandCross || !reviewList) return;

    reviewList.classList.add("review-cover-panel");

    if(heroSticky && reviewList.parentElement !== heroSticky){
      heroSticky.appendChild(reviewList);
      return;
    }

    if(heroSticky) return;

    if(reviewBg){
      brandArticle.insertBefore(reviewBg, brandCross);
    }

    brandArticle.insertBefore(reviewList, brandCross);

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

  function initPassBranchLocator(){

    const section =
      document.querySelector("[data-pass-locator]");

    if(!section || section.dataset.locatorReady === "true") return;

    const branches =
      Array.isArray(window.HEALTHBOY_PASS_BRANCHES)
        ? window.HEALTHBOY_PASS_BRANCHES.filter(branch=>branch && branch.name)
        : [];

    if(!branches.length) return;

    section.dataset.locatorReady =
      "true";

    const tierOrder =
      ["S Premium", "Premium", "Gold", "Silver", "Black"];

    const tierRank =
      tierOrder.reduce((rank, tier, index)=>{
        rank[tier] = index;
        return rank;
      }, {});

    const planInfo = [
      {tier:"S Premium", name:"S-프리미엄 올패스", price:180000, link:"https://bmarket.broj.co.kr/products/253448"},
      {tier:"Premium", name:"프리미엄 올패스", price:152000, link:"https://bmarket.broj.co.kr/products/253852"},
      {tier:"Gold", name:"골드 올패스", price:124000, link:"https://bmarket.broj.co.kr/products/254133"},
      {tier:"Silver", name:"실버 올패스", price:110000, link:"https://bmarket.broj.co.kr/products/254326"},
      {tier:"Black", name:"블랙 올패스", price:99000, link:"https://bmarket.broj.co.kr/products/254414"}
    ];

    const refs = {
      region:section.querySelector("[data-pass-region]"),
      tier:section.querySelector("[data-pass-tier]"),
      search:section.querySelector("[data-pass-search]"),
      nearby:section.querySelector("[data-pass-nearby]"),
      naverMap:section.querySelector("[data-pass-naver-map]"),
      fallbackMap:section.querySelector("[data-pass-fallback-map]"),
      fallbackMarkers:section.querySelector("[data-pass-fallback-markers]"),
      detail:section.querySelector("[data-pass-detail]"),
      detailClose:section.querySelector("[data-pass-detail-close]"),
      detailName:section.querySelector("[data-pass-detail-name]"),
      detailTier:section.querySelector("[data-pass-detail-tier]"),
      detailBadge:section.querySelector("[data-pass-detail-badge]"),
      detailAddress:section.querySelector("[data-pass-detail-address]"),
      detailHours:section.querySelector("[data-pass-detail-hours]"),
      detailParking:section.querySelector("[data-pass-detail-parking]"),
      detailLink:section.querySelector("[data-pass-detail-link]"),
      selectCurrent:section.querySelector("[data-pass-select-current]"),
      selectedCount:section.querySelector("[data-pass-selected-count]"),
      selectedList:section.querySelector("[data-pass-selected-list]"),
      recommend:section.querySelector("[data-pass-recommend]"),
      planCards:section.querySelector("[data-pass-plan-cards]"),
      resultTitle:section.querySelector("[data-pass-result-title]"),
      resultToggle:section.querySelector("[data-pass-result-toggle]"),
      resultList:section.querySelector("[data-pass-result-list]")
    };

    const regionOrder =
      ["서울", "경기", "대전", "충남", "충북", "부산", "울산", "경남", "전북", "대구"];

    const selectedIds =
      new Set();

    const naverMarkers =
      new Map();

    const fallbackMarkers =
      new Map();

    let naverMap =
      null;

    let activeBranch =
      null;

    let nearbyBranches =
      [];

    const branchById =
      new Map(branches.map(branch=>[branch.id, branch]));

    const normalize =
      value=>String(value || "").toLowerCase().replace(/\s+/g, "");

    const naverUrl =
      branch=>branch.naverUrl || `https://map.naver.com/p/search/${encodeURIComponent(branch.name)}`;

    const canUsePlan =
      (planTier, branch)=>tierRank[planTier] <= tierRank[branch.tier];

    const getRecommendedTier =
      ()=>{
        const selectedBranches =
          Array.from(selectedIds).map(id=>branchById.get(id)).filter(Boolean);

        if(!selectedBranches.length) return null;

        return selectedBranches.reduce((best, branch)=>{
          if(!best) return branch.tier;
          return tierRank[branch.tier] < tierRank[best] ? branch.tier : best;
        }, null);
      };

    const option =
      (value, label)=>new Option(label, value);

    if(refs.region){
      refs.region.append(option("all", "전체 지역"));
      regionOrder
        .filter(region=>branches.some(branch=>branch.region === region))
        .forEach(region=>refs.region.append(option(region, region)));
    }

    if(refs.tier){
      refs.tier.append(option("all", "전체 등급"));
      tierOrder.forEach(tier=>refs.tier.append(option(tier, tier)));
    }

    function createMarkerHtml(branch){
      const tierClass =
        `pass-marker-${branch.tier.toLowerCase().replace(/\s+/g, "-")}`;

      return `<button type="button" class="pass-locator-marker ${tierClass}" aria-label="${branch.name}"><strong>${branch.shortName}</strong><span>${branch.tier}</span></button>`;
    }

    function getFilteredBranches(){
      if(nearbyBranches.length){
        return nearbyBranches;
      }

      const region =
        refs.region ? refs.region.value : "all";

      const tier =
        refs.tier ? refs.tier.value : "all";

      const keyword =
        normalize(refs.search ? refs.search.value : "");

      return branches.filter(branch=>{
        const regionMatch =
          region === "all" || branch.region === region;

        const tierMatch =
          tier === "all" || branch.tier === tier;

        const searchTarget =
          normalize(`${branch.name} ${branch.shortName} ${branch.address}`);

        const keywordMatch =
          !keyword || searchTarget.includes(keyword);

        return regionMatch && tierMatch && keywordMatch;
      });
    }

    function setFallbackPosition(button, branch){
      const lngMin = 125.6;
      const lngMax = 129.75;
      const latMin = 34.95;
      const latMax = 38.05;
      const xRatio =
        (branch.lng - lngMin) / (lngMax - lngMin);
      const yRatio =
        (latMax - branch.lat) / (latMax - latMin);
      const x =
        32 + xRatio * 35;
      const y =
        8 + yRatio * 78;

      button.style.left =
        `${Math.max(4, Math.min(96, x))}%`;

      button.style.top =
        `${Math.max(4, Math.min(96, y))}%`;
    }

    function buildFallbackMarkers(){
      if(!refs.fallbackMarkers) return;

      refs.fallbackMarkers.innerHTML =
        "";

      branches.forEach(branch=>{
        const button =
          document.createElement("button");

        button.type =
          "button";

        button.className =
          `pass-locator-fallback-marker pass-marker-${branch.tier.toLowerCase().replace(/\s+/g, "-")}`;

        button.innerHTML =
          `<strong>${branch.shortName}</strong><span>${branch.tier}</span>`;

        button.setAttribute("aria-label", branch.name);
        setFallbackPosition(button, branch);
        button.addEventListener("click", ()=>focusBranch(branch));

        refs.fallbackMarkers.appendChild(button);
        fallbackMarkers.set(branch.id, button);
      });
    }

    function loadNaverMapScript(){
      if(window.naver && window.naver.maps){
        return Promise.resolve();
      }

      const existing =
        document.querySelector("script[data-pass-naver-script]");

      if(existing){
        return new Promise((resolve, reject)=>{
          existing.addEventListener("load", resolve, {once:true});
          existing.addEventListener("error", reject, {once:true});
        });
      }

      return new Promise((resolve, reject)=>{
        const script =
          document.createElement("script");

        script.src =
          "https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=b2prbr0rbm";

        script.async =
          true;

        script.dataset.passNaverScript =
          "true";

        script.onload =
          resolve;

        script.onerror =
          reject;

        document.head.appendChild(script);
      });
    }

    function initNaverMap(){
      if(!refs.naverMap) return;

      loadNaverMapScript()
        .then(()=>{
          if(!window.naver || !window.naver.maps || naverMap) return;

          naverMap =
            new window.naver.maps.Map(refs.naverMap, {
              center:new window.naver.maps.LatLng(36.35, 127.8),
              zoom:7,
              minZoom:6,
              scaleControl:false,
              mapDataControl:false,
              logoControl:true
            });

          branches.forEach(branch=>{
            const marker =
              new window.naver.maps.Marker({
                position:new window.naver.maps.LatLng(branch.lat, branch.lng),
                map:naverMap,
                icon:{
                  content:createMarkerHtml(branch),
                  anchor:new window.naver.maps.Point(42, 42)
                },
                title:branch.name
              });

            window.naver.maps.Event.addListener(marker, "click", ()=>{
              focusBranch(branch);
            });

            naverMarkers.set(branch.id, marker);
          });

          section.classList.add("is-map-ready");
          applyFilters();
        })
        .catch(()=>{
          section.classList.add("is-fallback-ready");
        });
    }

    function setMarkerVisibility(list){
      const visibleIds =
        new Set(list.map(branch=>branch.id));

      naverMarkers.forEach((marker, id)=>{
        marker.setVisible(visibleIds.has(id));
      });

      fallbackMarkers.forEach((marker, id)=>{
        marker.classList.toggle("is-hidden", !visibleIds.has(id));
      });
    }

    function setActiveMarker(branch){
      fallbackMarkers.forEach((marker, id)=>{
        marker.classList.toggle("is-active", branch && id === branch.id);
      });

      if(naverMarkers.size){
        naverMarkers.forEach((marker, id)=>{
          const markerBranch =
            branchById.get(id);

          marker.setIcon({
            content:createMarkerHtml(markerBranch),
            anchor:new window.naver.maps.Point(42, 42)
          });
        });
      }
    }

    function focusBranch(branch){
      activeBranch =
        branch;

      showDetail(branch);
      setActiveMarker(branch);

      if(naverMap && window.naver && window.naver.maps){
        naverMap.morph(
          new window.naver.maps.LatLng(branch.lat, branch.lng),
          13,
          {duration:600}
        );
      }
    }

    function showDetail(branch){
      if(!refs.detail || !branch) return;

      refs.detail.hidden =
        false;

      if(refs.detailName) refs.detailName.textContent = branch.name;
      if(refs.detailTier) refs.detailTier.textContent = branch.tier;
      if(refs.detailBadge) refs.detailBadge.textContent = branch.tier;
      if(refs.detailAddress) refs.detailAddress.textContent = branch.address;
      if(refs.detailHours){
        refs.detailHours.textContent =
          branch.open24 && branch.open24 !== "X" ? "24시간 운영" : "운영시간 확인";
      }
      if(refs.detailParking){
        refs.detailParking.textContent =
          branch.parking && branch.parking !== "X" ? `무료주차 ${branch.parking}` : "주차 정보 확인";
      }
      if(refs.detailLink){
        refs.detailLink.href =
          naverUrl(branch);
      }
      if(refs.selectCurrent){
        refs.selectCurrent.textContent =
          selectedIds.has(branch.id) ? "선택 해제" : "이 지점 선택";
      }
    }

    function hideDetail(){
      if(refs.detail){
        refs.detail.hidden =
          true;
      }

      activeBranch =
        null;

      setActiveMarker(null);
    }

    function toggleBranch(branch){
      if(selectedIds.has(branch.id)){
        selectedIds.delete(branch.id);
      } else {
        selectedIds.add(branch.id);
      }

      if(activeBranch && activeBranch.id === branch.id && refs.selectCurrent){
        refs.selectCurrent.textContent =
          selectedIds.has(branch.id) ? "선택 해제" : "이 지점 선택";
      }

      renderSelected();
      renderList(getFilteredBranches());
    }

    function renderSelected(){
      const selectedBranches =
        Array.from(selectedIds).map(id=>branchById.get(id)).filter(Boolean);

      if(refs.selectedCount){
        refs.selectedCount.textContent =
          selectedBranches.length;
      }

      if(!refs.selectedList) return;

      refs.selectedList.innerHTML =
        "";

      if(!selectedBranches.length){
        const empty =
          document.createElement("p");

        empty.innerHTML =
          '<i data-feather="info"></i>지도에서 이용할 지점을 선택하거나, 위에서 지점을 검색하여 목록에 추가해주세요.';

        refs.selectedList.appendChild(empty);
        renderRecommendation([]);

        if(window.feather){
          window.feather.replace();
        }

        return;
      }

      selectedBranches.forEach(branch=>{
        const chip =
          document.createElement("button");

        chip.type =
          "button";

        chip.className =
          "pass-selected-chip";

        chip.innerHTML =
          `<strong>${branch.shortName}</strong><span>${branch.tier}</span><i data-feather="x"></i>`;

        chip.addEventListener("click", ()=>toggleBranch(branch));
        refs.selectedList.appendChild(chip);
      });

      renderRecommendation(selectedBranches);

      if(window.feather){
        window.feather.replace();
      }
    }

    function renderRecommendation(selectedBranches){
      if(!refs.recommend || !refs.planCards) return;

      refs.planCards.innerHTML =
        "";

      if(!selectedBranches.length){
        refs.recommend.hidden =
          true;
        return;
      }

      const recommendedTier =
        getRecommendedTier();

      refs.recommend.hidden =
        false;

      planInfo.forEach(plan=>{
        const card =
          document.createElement("a");

        const available =
          selectedBranches.every(branch=>canUsePlan(plan.tier, branch));

        card.href =
          plan.link;

        card.target =
          "_blank";

        card.rel =
          "noopener";

        card.className =
          `pass-plan-card${plan.tier === recommendedTier ? " is-recommended" : ""}${available ? "" : " is-disabled"}`;

        card.innerHTML =
          `<div><strong>${plan.name}</strong><span>${plan.tier}</span></div><em>월 ${plan.price.toLocaleString()}원</em><small>${plan.tier === recommendedTier ? "AI 추천" : available ? "이용 가능" : "선택 지점 일부 제한"}</small>`;

        refs.planCards.appendChild(card);
      });
    }

    function renderList(list){
      if(refs.resultTitle){
        const hasFilter =
          nearbyBranches.length || (refs.region && refs.region.value !== "all") || (refs.tier && refs.tier.value !== "all") || (refs.search && refs.search.value.trim());

        refs.resultTitle.textContent =
          `${nearbyBranches.length ? "내 주변 지점" : hasFilter ? "검색 결과" : "전체 지점"} (${list.length})`;
      }

      if(!refs.resultList) return;

      refs.resultList.innerHTML =
        "";

      if(!list.length){
        const empty =
          document.createElement("p");

        empty.className =
          "pass-result-empty";

        empty.textContent =
          "검색 결과가 없습니다.";

        refs.resultList.appendChild(empty);
        return;
      }

      list.forEach(branch=>{
        const item =
          document.createElement("article");

        item.className =
          "pass-result-item";

        item.tabIndex =
          0;

        const info =
          document.createElement("div");

        info.className =
          "pass-result-info";

        info.innerHTML =
          `<strong>${branch.name} <em>${branch.tier}</em></strong><span>${branch.address}</span>${typeof branch.distance === "number" ? `<small>약 ${branch.distance.toFixed(1)}km</small>` : ""}`;

        const select =
          document.createElement("button");

        select.type =
          "button";

        select.textContent =
          selectedIds.has(branch.id) ? "선택 해제" : "선택";

        select.className =
          selectedIds.has(branch.id) ? "is-selected" : "";

        select.addEventListener("click", event=>{
          event.stopPropagation();
          toggleBranch(branch);
        });

        item.append(info, select);
        item.addEventListener("click", ()=>focusBranch(branch));
        item.addEventListener("keydown", event=>{
          if(event.key === "Enter" || event.key === " "){
            event.preventDefault();
            focusBranch(branch);
          }
        });

        refs.resultList.appendChild(item);
      });
    }

    function applyFilters(){
      const list =
        getFilteredBranches();

      setMarkerVisibility(list);
      renderList(list);

      if(!activeBranch || !list.some(branch=>branch.id === activeBranch.id)){
        hideDetail();
      }
    }

    function clearNearby(){
      nearbyBranches =
        [];
    }

    function distanceKm(lat1, lng1, lat2, lng2){
      const toRad =
        value=>value * Math.PI / 180;

      const dLat =
        toRad(lat2 - lat1);

      const dLng =
        toRad(lng2 - lng1);

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

      return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    if(refs.region){
      refs.region.addEventListener("change", ()=>{
        clearNearby();
        applyFilters();
      });
    }

    if(refs.tier){
      refs.tier.addEventListener("change", ()=>{
        clearNearby();
        applyFilters();
      });
    }

    if(refs.search){
      refs.search.addEventListener("input", ()=>{
        clearNearby();
        applyFilters();
      });
    }

    if(refs.nearby){
      refs.nearby.addEventListener("click", ()=>{
        if(!navigator.geolocation){
          refs.nearby.classList.add("is-error");
          return;
        }

        refs.nearby.classList.add("is-loading");
        refs.nearby.querySelector("span").textContent =
          "위치 확인 중";

        navigator.geolocation.getCurrentPosition(position=>{
          const {latitude, longitude} =
            position.coords;

          nearbyBranches =
            branches
              .map(branch=>({
                ...branch,
                distance:distanceKm(latitude, longitude, branch.lat, branch.lng)
              }))
              .filter(branch=>branch.distance <= 5)
              .sort((a, b)=>a.distance - b.distance);

          if(!nearbyBranches.length){
            nearbyBranches =
              branches
                .map(branch=>({
                  ...branch,
                  distance:distanceKm(latitude, longitude, branch.lat, branch.lng)
                }))
                .sort((a, b)=>a.distance - b.distance)
                .slice(0, 8);
          }

          if(refs.region) refs.region.value = "all";
          if(refs.tier) refs.tier.value = "all";
          if(refs.search) refs.search.value = "";

          refs.nearby.classList.remove("is-loading");
          refs.nearby.querySelector("span").textContent =
            "현재 위치로 찾기";

          applyFilters();

          if(nearbyBranches[0]){
            focusBranch(nearbyBranches[0]);
          }
        }, ()=>{
          refs.nearby.classList.remove("is-loading");
          refs.nearby.classList.add("is-error");
          refs.nearby.querySelector("span").textContent =
            "위치 사용 불가";
          setTimeout(()=>{
            refs.nearby.classList.remove("is-error");
            refs.nearby.querySelector("span").textContent =
              "현재 위치로 찾기";
          }, 1800);
        }, {
          enableHighAccuracy:true,
          timeout:10000,
          maximumAge:0
        });
      });
    }

    if(refs.selectCurrent){
      refs.selectCurrent.addEventListener("click", ()=>{
        if(activeBranch){
          toggleBranch(activeBranch);
        }
      });
    }

    if(refs.detailClose){
      refs.detailClose.addEventListener("click", hideDetail);
    }

    if(refs.resultToggle){
      refs.resultToggle.addEventListener("click", ()=>{
        const isCollapsed =
          section.classList.toggle("is-result-collapsed");

        refs.resultToggle.setAttribute("aria-expanded", String(!isCollapsed));
      });
    }

    buildFallbackMarkers();
    section.classList.add("is-fallback-ready");
    applyFilters();
    renderSelected();

  }

  function initAllPassLocatorReveal(){

    if(document.querySelector("[data-pass-reveal-trigger]")) return;

    if(window.innerWidth <= 768) return;

    const transition =
      document.querySelector("[data-pass-transition]");

    const locator =
      document.querySelector("[data-pass-locator]");

    const orb =
      transition ? transition.querySelector("[data-pass-transition-orb]") : null;

    const brandCross =
      document.querySelector("#brand #inc01 .brand-cross");

    if(!transition || !locator || !orb || !brandCross || transition.dataset.revealReady === "true") return;

    transition.dataset.revealReady =
      "true";

    const clamp =
      (value, min, max)=>Math.min(Math.max(value, min), max);

    const typingLine =
      document.querySelector("[data-allpass-typing]");

    const typingText =
      typingLine ? typingLine.querySelector(".brand-type-text") : null;

    const prefixText =
      typingLine ? String(typingLine.dataset.prefix || "").trimEnd() : "";

    const revealKeys =
      new Set(["ArrowDown", "PageDown", " ", "Spacebar", "End"]);

    const closeKeys =
      new Set(["ArrowUp", "PageUp", "Home", "Escape"]);

    const smoothStep =
      value=>value * value * (3 - 2 * value);

    const setOrbOrigin =
      ()=>{

        let targetRect =
          null;

        if(typingText && typingText.firstChild && typingText.firstChild.nodeType === Node.TEXT_NODE){
          const fullText =
            typingText.textContent || "";

          const prefixIndex =
            prefixText ? fullText.indexOf(prefixText) : -1;

          if(prefixIndex > -1){
            const characterIndex =
              Math.max(prefixIndex, prefixIndex + prefixText.length - 1);

            try{
              const range =
                document.createRange();

              range.setStart(typingText.firstChild, characterIndex);
              range.setEnd(typingText.firstChild, characterIndex + 1);
              targetRect =
                range.getBoundingClientRect();
              range.detach();
            }catch(error){
              targetRect =
                null;
            }
          }
        }

        if((!targetRect || !targetRect.width) && typingLine){
          targetRect =
            typingLine.getBoundingClientRect();
        }

        if(!targetRect) return;

        transition.style.setProperty("--pass-origin-x", `${targetRect.left + targetRect.width / 2}px`);
        transition.style.setProperty("--pass-origin-y", `${targetRect.top + targetRect.height / 2}px`);

      };

    const brandTop =
      ()=>Math.round(brandCross.getBoundingClientRect().top + window.pageYOffset);

    const keepIntroLocked =
      ()=>{
        const top =
          brandTop();

        if(Math.abs(window.pageYOffset - top) > 2){
          window.scrollTo(0, top);
        }
      };

    const isTypingComplete =
      ()=>lineIsComplete() || document.documentElement.classList.contains("allpass-typing-complete");

    function lineIsComplete(){
      return Boolean(typingLine && typingLine.dataset.typingComplete === "true");
    }

    const isIntroScene =
      ()=>{
        const rect =
          brandCross.getBoundingClientRect();

        const viewportHeight =
          window.innerHeight || document.documentElement.clientHeight || 1;

        return rect.top <= viewportHeight * .18 && rect.bottom >= viewportHeight * .52;
      };

    const applyRevealProgress =
      value=>{
        const progress =
          clamp(value, 0, 1);

        const eased =
          smoothStep(progress);

        const boxProgress =
          clamp((progress - .32) / .54, 0, 1);

        const radius =
          14 * (1 - boxProgress) + 4 * boxProgress;

        const scale =
          .16 + eased * 320;

        const opacity =
          clamp(progress * 3.4, 0, 1);

        transition.style.setProperty("--pass-transition-scale", scale.toFixed(3));
        transition.style.setProperty("--pass-transition-opacity", opacity.toFixed(3));
        transition.style.setProperty("--pass-transition-radius", `${radius.toFixed(1)}px`);
        transition.style.setProperty("--pass-transition-shadow", clamp(progress * 1.2, 0, 1).toFixed(3));

        if(progress >= .88){
          locator.classList.add("is-revealed");
        }else{
          locator.classList.remove("is-revealed");
        }
      };

    const closeReveal =
      ()=>{
        if(!revealComplete && !revealStarted) return false;

        revealStarted =
          false;
        revealComplete =
          false;
        revealProgress =
          0;
        closePull =
          0;
        nextPull =
          0;

        locator.classList.remove("is-revealed");
        transition.classList.remove("is-playing", "is-complete");
        document.documentElement.classList.remove("pass-reveal-playing", "pass-reveal-complete");
        applyRevealProgress(0);
        window.scrollTo(0, brandTop());

        return true;
      };

    const isLocatorAtTop =
      ()=>locator.scrollTop <= 2;

    const isLocatorAtBottom =
      ()=>locator.scrollTop + locator.clientHeight >= locator.scrollHeight - 4;

    const shouldExitRevealToFacility =
      ()=>window.innerWidth <= 900 || isLocatorAtBottom();

    let suppressRevealUntil =
      0;

    const revealSuppressed =
      ()=>Date.now() < suppressRevealUntil || Date.now() < (window.__skipAllPassRevealUntil || 0);

    const exitRevealTo =
      (target, behavior = "smooth")=>{
        suppressRevealUntil =
          Date.now() + 1600;

        document.dispatchEvent(new CustomEvent("allpassReleaseScrollLock"));

        revealStarted =
          false;
        revealComplete =
          false;
        revealProgress =
          0;
        closePull =
          0;
        nextPull =
          0;

        locator.classList.remove("is-revealed");
        transition.classList.remove("is-playing", "is-complete");
        document.documentElement.classList.remove("pass-reveal-playing", "pass-reveal-complete");
        applyRevealProgress(0);

        if(window.ScrollTrigger){
          window.ScrollTrigger.refresh();
        }

        if(target){
          const header =
            document.querySelector("header");

          const offset =
            header ? header.offsetHeight : 0;

          const top =
            target.getBoundingClientRect().top + window.pageYOffset - offset;

          window.scrollTo({top, behavior});

          const refreshAfterExit =
            ()=>{
              if(window.ScrollTrigger){
                window.ScrollTrigger.refresh();
              }
            };

          window.requestAnimationFrame(refreshAfterExit);
          window.setTimeout(refreshAfterExit, 160);
          window.setTimeout(refreshAfterExit, 720);
        }
      };

    window.exitAllPassRevealTo =
      exitRevealTo;

    let revealStarted =
      false;

    let revealComplete =
      false;

    let revealProgress =
      0;

    let touchStartY =
      0;

    let closePull =
      0;

    let nextPull =
      0;

    const completeReveal =
      ()=>{

        revealProgress =
          1;
        revealComplete =
          true;
        revealStarted =
          false;
        applyRevealProgress(1);
        transition.classList.add("is-complete");
        locator.classList.add("is-revealed");
        document.documentElement.classList.remove("pass-reveal-playing");
        document.documentElement.classList.add("pass-reveal-complete");
        keepIntroLocked();

      };

    const beginReveal =
      ()=>{

        if(revealSuppressed() || revealComplete || revealStarted || !isTypingComplete() || !isIntroScene()) return false;

        revealStarted =
          true;
        revealProgress =
          Math.max(revealProgress, .01);

        setOrbOrigin();
        keepIntroLocked();
        locator.scrollTop =
          0;
        locator.classList.remove("is-revealed");
        transition.classList.add("is-playing");
        document.documentElement.classList.add("pass-reveal-playing");

        return true;

      };

    const driveReveal =
      (delta, divisor = 1800)=>{

        if(!revealStarted && !beginReveal()) return false;

        const limitedDelta =
          Math.max(-220, Math.min(220, delta));

        revealProgress =
          clamp(revealProgress + limitedDelta / divisor, 0, 1);

        keepIntroLocked();
        applyRevealProgress(revealProgress);

        if(revealProgress >= 1){
          completeReveal();
        }else if(revealProgress <= 0){
          closeReveal();
        }

        return true;

      };

    const onWheel =
      event=>{
        if(revealSuppressed()) return;

        if(revealComplete){
          if(event.deltaY < 0 && isLocatorAtTop()){
            event.preventDefault();
            closePull += Math.abs(event.deltaY);
            nextPull =
              0;

            if(closePull > 900){
              closeReveal();
            }
          }else if(event.deltaY > 0 && shouldExitRevealToFacility()){
            event.preventDefault();
            nextPull += event.deltaY;
            closePull =
              0;

            if(nextPull > 180){
              exitRevealTo(document.querySelector("#facility"));
            }
          }else{
            closePull =
              0;
            nextPull =
              0;
          }
          return;
        }

        if(revealStarted){
          event.preventDefault();
          driveReveal(event.deltaY, 1900);
          return;
        }

        if(event.deltaY > 0 && isTypingComplete() && isIntroScene()){
          event.preventDefault();
          driveReveal(event.deltaY, 1900);
        }
      };

    const onTouchStart =
      event=>{
        touchStartY =
          event.touches && event.touches.length
            ? event.touches[0].clientY
            : 0;
      };

    const onTouchMove =
      event=>{
        if(revealSuppressed()) return;

        const currentY =
          event.touches && event.touches.length
            ? event.touches[0].clientY
            : touchStartY;

        if(revealComplete){
          if(currentY - touchStartY > 10 && isLocatorAtTop()){
            event.preventDefault();
            closePull += currentY - touchStartY;
            nextPull =
              0;
            touchStartY =
              currentY;

            if(closePull > 260){
              closeReveal();
            }
          }else if(touchStartY - currentY > 10 && shouldExitRevealToFacility()){
            event.preventDefault();
            nextPull += touchStartY - currentY;
            closePull =
              0;
            touchStartY =
              currentY;

            if(nextPull > 100){
              exitRevealTo(document.querySelector("#facility"));
            }
          }else{
            closePull =
              0;
            nextPull =
              0;
          }
          return;
        }

        if(revealStarted){
          event.preventDefault();
          driveReveal(touchStartY - currentY, 980);
          touchStartY =
            currentY;
          return;
        }

        if(touchStartY - currentY > 8 && isTypingComplete() && isIntroScene()){
          event.preventDefault();
          driveReveal(touchStartY - currentY, 980);
          touchStartY =
            currentY;
        }
      };

    const onKeyDown =
      event=>{
        if(revealSuppressed()) return;

        if(revealComplete){
          if(closeKeys.has(event.key) && isLocatorAtTop()){
            event.preventDefault();
            closeReveal();
          }
          if(revealKeys.has(event.key) && isLocatorAtBottom()){
            event.preventDefault();
            exitRevealTo(document.querySelector("#facility"));
          }
          return;
        }

        if(revealStarted && revealKeys.has(event.key)){
          event.preventDefault();
          driveReveal(230, 1900);
          return;
        }

        if(revealStarted && closeKeys.has(event.key)){
          event.preventDefault();
          driveReveal(-230, 1900);
          return;
        }

        if(revealKeys.has(event.key) && isTypingComplete() && isIntroScene()){
          event.preventDefault();
          driveReveal(230, 1900);
        }
      };

    const onScroll =
      ()=>{
        if(revealSuppressed()) return;

        if(revealStarted || revealComplete){
          keepIntroLocked();
          return;
        }

        const top =
          brandTop();

        const viewportHeight =
          window.innerHeight || document.documentElement.clientHeight || 1;

        if(isTypingComplete() && isIntroScene() && window.pageYOffset > top + 2 && window.pageYOffset < top + viewportHeight * 1.25){
          window.scrollTo(0, top);
          driveReveal(90, 1900);
        }
      };

    const onResize =
      ()=>{
        setOrbOrigin();

        if(revealComplete){
          applyRevealProgress(1);
          keepIntroLocked();
        }
      };

    window.addEventListener("wheel", onWheel, {passive:false});
    window.addEventListener("touchstart", onTouchStart, {passive:true});
    window.addEventListener("touchmove", onTouchMove, {passive:false});
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, {passive:true});
    window.addEventListener("resize", onResize);
    document.addEventListener("allpassTypingComplete", setOrbOrigin);

    const header =
      document.querySelector("header");

    if(header){
      header.addEventListener("click", event=>{
        const link =
          event.target.closest("a");

        if(link && revealComplete){
          closeReveal();
        }
      }, true);
    }

    setOrbOrigin();
    applyRevealProgress(0);

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

    const brandCross =
      line.closest(".brand-cross");

    const scrollLockKeys =
      new Set(["ArrowDown", "PageDown", " ", "Spacebar", "End"]);

    let releaseAllPassScrollLock =
      null;

    const startAllPassScrollLock =
      ()=>{

        if(window.innerWidth <= 768) return;

        if(!brandCross || releaseAllPassScrollLock) return;

        const lockTop =
          Math.round(brandCross.getBoundingClientRect().top + window.pageYOffset);

        let touchStartY =
          0;

        const clampToIntro =
          ()=>{
            if(window.pageYOffset > lockTop + 2){
              window.scrollTo(0, lockTop);
            }
          };

        const shouldHold =
          ()=>window.pageYOffset >= lockTop - 3;

        const onWheel =
          event=>{
            if(event.deltaY > 0 && shouldHold()){
              event.preventDefault();
              clampToIntro();
            }
          };

        const onTouchStart =
          event=>{
            touchStartY =
              event.touches && event.touches.length
                ? event.touches[0].clientY
                : 0;
          };

        const onTouchMove =
          event=>{
            const currentY =
              event.touches && event.touches.length
                ? event.touches[0].clientY
                : touchStartY;

            if(touchStartY - currentY > 0 && shouldHold()){
              event.preventDefault();
              clampToIntro();
            }
          };

        const onKeyDown =
          event=>{
            if(scrollLockKeys.has(event.key) && shouldHold()){
              event.preventDefault();
              clampToIntro();
            }
          };

        const onScroll =
          ()=>clampToIntro();

        window.scrollTo(0, lockTop);
        document.documentElement.classList.add("allpass-scroll-locked");

        window.addEventListener("wheel", onWheel, {passive:false});
        window.addEventListener("touchstart", onTouchStart, {passive:true});
        window.addEventListener("touchmove", onTouchMove, {passive:false});
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("scroll", onScroll, {passive:true});

        releaseAllPassScrollLock =
          ()=>{
            window.removeEventListener("wheel", onWheel);
            window.removeEventListener("touchstart", onTouchStart);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("scroll", onScroll);
            document.documentElement.classList.remove("allpass-scroll-locked");
            releaseAllPassScrollLock =
              null;
          };

      };

    const stopAllPassScrollLock =
      ()=>{
        if(releaseAllPassScrollLock){
          releaseAllPassScrollLock();
        }
      };

    document.addEventListener("allpassReleaseScrollLock", stopAllPassScrollLock);

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

        startAllPassScrollLock();

        textEl.textContent =
          "";

        try{

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

          line.dataset.typingComplete =
            "true";
          document.documentElement.classList.add("allpass-typing-complete");
          document.dispatchEvent(new CustomEvent("allpassTypingComplete"));

        }finally{
          stopAllPassScrollLock();
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

  function initAllPassRevealButton(){

    const trigger =
      document.querySelector("[data-pass-reveal-trigger]");

    const locator =
      document.querySelector("[data-pass-locator]");

    if(!trigger || !locator || trigger.dataset.revealReady === "true") return;

    trigger.dataset.revealReady =
      "true";

    if(!locator.id){
      locator.id =
        "allpass-locator";
    }

    trigger.setAttribute("aria-controls", locator.id);
    trigger.setAttribute("aria-expanded", "false");

    const transition =
      document.querySelector("[data-pass-transition]");

    const brandCross =
      document.querySelector("#brand #inc01 .brand-cross");

    const refreshLayout =
      ()=>{
        if(window.ScrollTrigger){
          window.ScrollTrigger.refresh();
        }

        window.dispatchEvent(new Event("resize"));
      };

    const openLocator =
      ()=>{
        document.dispatchEvent(new CustomEvent("allpassReleaseScrollLock"));
        document.documentElement.classList.remove("allpass-scroll-locked", "pass-reveal-playing");
        document.documentElement.classList.add("pass-reveal-complete");

        if(transition){
          transition.classList.remove("is-playing");
          transition.classList.add("is-complete");
          transition.style.setProperty("--pass-transition-opacity", "0");
          transition.style.setProperty("--pass-transition-scale", "1");
        }

        locator.classList.add("is-revealed");
        trigger.setAttribute("aria-expanded", "true");

        if(window.feather){
          feather.replace();
        }

        if(window.innerWidth <= 768){
          requestAnimationFrame(()=>{
            locator.scrollIntoView({block:"start", behavior:"smooth"});
          });
        }else{
          locator.scrollTop =
            0;
        }

        requestAnimationFrame(refreshLayout);
        setTimeout(refreshLayout, 240);
      };

    const closeLocator =
      ()=>{
        locator.classList.remove("is-revealed");
        trigger.setAttribute("aria-expanded", "false");
        document.documentElement.classList.remove("pass-reveal-playing", "pass-reveal-complete");

        if(transition){
          transition.classList.remove("is-playing", "is-complete");
          transition.style.setProperty("--pass-transition-opacity", "0");
          transition.style.setProperty("--pass-transition-scale", ".2");
        }

        if(window.innerWidth <= 768 && brandCross){
          const header =
            document.querySelector("header");

          const offset =
            header ? header.offsetHeight : 0;

          const top =
            brandCross.getBoundingClientRect().top + window.pageYOffset - offset;

          window.scrollTo({top, behavior:"smooth"});
        }

        requestAnimationFrame(refreshLayout);
      };

    trigger.addEventListener("click", openLocator);

    locator
      .querySelectorAll("[data-pass-locator-close]")
      .forEach(button=>button.addEventListener("click", closeLocator));

    window.addEventListener("keydown", event=>{
      if(event.key === "Escape" && locator.classList.contains("is-revealed")){
        closeLocator();
      }
    });

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

  function prepareIntroStatementWords(){

    const lines =
      document.querySelectorAll(".intro-reveal-copy .reveal-line");

    if(!lines.length) return;

    lines.forEach(line=>{

      if(line.dataset.wordPrepared === "true") return;

      const source =
        line.dataset.text || line.textContent.trim();

      if(!source) return;

      line.dataset.text =
        source;

      line.textContent =
        "";

      line.classList.add("has-word-reveal");

      source
        .split(/\s+/)
        .filter(Boolean)
        .forEach(word=>{

          const wordEl =
            document.createElement("span");

          wordEl.className =
            "reveal-word";

          wordEl.textContent =
            word;

          wordEl.style.setProperty("--word-fill", "0%");

          line.appendChild(wordEl);

        });

      line.dataset.wordPrepared =
        "true";

    });

  }

  function initMobileIntroVideo(){

    const video =
      document.querySelector(".intro-video");

    if(!video || video.dataset.mobileVideoReady === "true") return;

    video.dataset.mobileVideoReady =
      "true";

    video.muted =
      true;

    video.playsInline =
      true;

    video.preload =
      "auto";

    const playVideo =
      ()=>{

      const playPromise =
        video.play();

      if(playPromise && typeof playPromise.catch === "function"){
        playPromise.catch(()=>{});
      }

      };

    if(window.innerWidth > 768){
      playVideo();
      return;
    }

    video.load();

    if(video.readyState >= 2){
      playVideo();
    }else{
      video.addEventListener("loadeddata", playVideo, {once:true});
      video.addEventListener("canplay", playVideo, {once:true});
      window.setTimeout(playVideo, 80);
    }

  }

  function initHeroCaptionScrollGate(){

    const hero =
      document.querySelector(".hero-expand-section");

    const caption =
      document.querySelector(".intro-desc[data-caption-reveal]");

    if(!hero || !caption || caption.dataset.scrollGateReady === "true" || window.location.hash) return;

    caption.dataset.scrollGateReady =
      "true";

    if(window.innerWidth <= 768){
      document.documentElement.classList.remove(
        "hero-caption-scroll-locked",
        "hero-mobile-snap-playing",
        "hero-stats-bridge-playing"
      );

      try{
        window.localStorage.setItem("healthboygymIntroCaptionGateSeen", "1");
      }catch(error){}

      return;
    }

    const introGateSeenKey =
      "healthboygymIntroCaptionGateSeen";

    const isMobileViewport =
      ()=>window.innerWidth <= 768;

    const hasSeenIntroGate =
      ()=>{
        try{
          return window.localStorage.getItem(introGateSeenKey) === "1";
        }catch(error){
          return false;
        }
      };

    const markIntroGateSeen =
      ()=>{
        if(!isMobileViewport()) return;

        try{
          window.localStorage.setItem(introGateSeenKey, "1");
        }catch(error){}
      };

    const characters =
      Array.from(caption.querySelectorAll(".desc-char"));

    if(!characters.length) return;

    const maxCaptionIndex =
      characters.reduce((max, character)=>{
        const value =
          Number.parseFloat(character.style.getPropertyValue("--caption-index"));

        return Number.isFinite(value)
          ? Math.max(max, value)
          : max;
      }, 0);

    const holdMs =
      Math.min(3200, Math.max(1900, 580 + maxCaptionIndex * 24 + 920));

    const lockTop =
      Math.max(0, Math.round(hero.getBoundingClientRect().top + window.pageYOffset));

    const scrollLockKeys =
      new Set(["ArrowDown", "PageDown", " ", "Spacebar", "End"]);

    const scrollUpKeys =
      new Set(["ArrowUp", "PageUp", "Home"]);

    let touchStartY =
      0;

    let replayTouchStartY =
      0;

    let bridgeTouchStartY =
      0;

    let released =
      true;

    let cinematicPlaying =
      false;

    let statsBridgePlaying =
      false;

    let playTimer =
      0;

    const clamp =
      (value, min, max)=>Math.max(min, Math.min(max, value));

    const isNearHeroTop =
      ()=>window.pageYOffset <= lockTop + 10;

    const getScrollable =
      ()=>Math.max(1, hero.offsetHeight - window.innerHeight);

    const getHeroProgress =
      ()=>clamp((window.pageYOffset - lockTop) / getScrollable(), 0, 1);

    const isWithinHeroSnapRange =
      ()=>{
        const y =
          window.pageYOffset;

        return y >= lockTop - 2 && y <= lockTop + getScrollable() + 8;
      };

    const getStatementCompleteProgress =
      ()=>{
        const isMobile =
          window.innerWidth <= 768;

        const wordCount =
          hero.querySelectorAll(".intro-reveal-copy .reveal-word").length;

        const cinematicWordStart =
          isMobile ? 0.34 : 0.32;

        const cinematicWordStep =
          isMobile ? 0.032 : 0.024;

        const cinematicWordRange =
          isMobile ? 0.15 : 0.085;

        return cinematicWordStart +
          Math.max(0, wordCount - 1) * cinematicWordStep +
          cinematicWordRange;
      };

    const getStatementTargetProgress =
      ()=>{
        const isMobile =
          window.innerWidth <= 768;

        return Math.min(
          isMobile ? 0.715 : 0.60,
          Math.max(isMobile ? 0.62 : 0.53, getStatementCompleteProgress())
        );
      };

    const getStatsTargetProgress =
      ()=>{
        const isMobile =
          window.innerWidth <= 768;

        return isMobile ? 0.745 : 0.855;
      };

    const getBridgeLead =
      ()=>window.innerWidth <= 768 ? 0.09 : 0.065;

    const getBridgeExit =
      ()=>window.innerWidth <= 768 ? 0.04 : 0.04;

    const shouldLetReviewAreaScrollBack =
      progress=>window.innerWidth <= 768 &&
        progress > getStatsTargetProgress() + getBridgeExit();

    const restartCaptionReveal =
      ()=>{
        caption.classList.remove("is-replaying", "is-replay-reset");
        caption.classList.add("is-replay-reset");

        void caption.offsetWidth;

        window.requestAnimationFrame(()=>{
          caption.classList.remove("is-replay-reset");
          caption.classList.add("is-replaying");
        });
      };

    const clampToHero =
      ()=>{
        if(cinematicPlaying) return;

        if(window.pageYOffset > lockTop + 1){
          window.scrollTo(0, lockTop);
        }
      };

    const release =
      ()=>{
        if(released) return;

        released =
          true;

        window.clearTimeout(playTimer);
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("scroll", onScroll);
        document.documentElement.classList.remove("hero-caption-scroll-locked");
        document.documentElement.classList.remove("hero-mobile-snap-playing");
        markIntroGateSeen();
      };

    const armGate =
      (delay, shouldReplayCaption = false)=>{
        if(!released || cinematicPlaying || !isNearHeroTop()) return;

        released =
          false;

        if(shouldReplayCaption){
          restartCaptionReveal();
        }

        document.documentElement.classList.add("hero-caption-scroll-locked");
        window.addEventListener("wheel", onWheel, {passive:false});
        window.addEventListener("touchstart", onTouchStart, {passive:true});
        window.addEventListener("touchmove", onTouchMove, {passive:false});
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("scroll", onScroll, {passive:true});

        window.clearTimeout(playTimer);

        if(Number.isFinite(delay)){
          playTimer =
            window.setTimeout(playCinematicIntro, delay);
        }
      };

    const playCinematicIntro =
      ()=>{
        if(released) return;

        cinematicPlaying =
          true;

        const isMobile =
          window.innerWidth <= 768;

        const scrollable =
          getScrollable();

        const startY =
          window.pageYOffset;

        const targetProgress =
          getStatementTargetProgress();

        const targetY =
          Math.max(startY, lockTop + scrollable * targetProgress);

        const duration =
          isMobile ? 1850 : 2500;

        const ease =
          value=>value < 0.5
            ? 4 * value * value * value
            : 1 - Math.pow(-2 * value + 2, 3) / 2;

        const startedAt =
          performance.now();

        if(isMobile){
          document.documentElement.classList.add("hero-mobile-snap-playing");
        }

        const step =
          now=>{
            if(released) return;

            const progress =
              Math.min(1, (now - startedAt) / duration);

            const y =
              startY + (targetY - startY) * ease(progress);

            window.scrollTo(0, y);

            if(progress < 1){
              requestAnimationFrame(step);
              return;
            }

            window.scrollTo(0, targetY);
            document.documentElement.classList.remove("hero-mobile-snap-playing");

            cinematicPlaying =
              false;
            release();
          };

        requestAnimationFrame(step);
      };

    const playHeroSnap =
      targetProgress=>{
        if(statsBridgePlaying || !released || cinematicPlaying) return;

        statsBridgePlaying =
          true;

        const scrollable =
          getScrollable();

        const startY =
          window.pageYOffset;

        const targetProgressClamped =
          clamp(targetProgress, 0, 1);

        const targetY =
          lockTop + scrollable * targetProgressClamped;

        const distanceProgress =
          clamp(Math.abs(targetY - startY) / scrollable, 0, 1);

        const isMobile =
          window.innerWidth <= 768;

        const duration =
          isMobile
            ? Math.round(420 + distanceProgress * 980)
            : Math.round(520 + distanceProgress * 1450);

        const ease =
          value=>value < 0.5
            ? 4 * value * value * value
            : 1 - Math.pow(-2 * value + 2, 3) / 2;

        const startedAt =
          performance.now();

        document.documentElement.classList.add("hero-caption-scroll-locked");
        document.documentElement.classList.add("hero-stats-bridge-playing");
        document.documentElement.classList.add("hero-mobile-snap-playing");

        const step =
          now=>{
            const progress =
              Math.min(1, (now - startedAt) / duration);

            const y =
              startY + (targetY - startY) * ease(progress);

            window.scrollTo(0, y);

            if(progress < 1){
              requestAnimationFrame(step);
              return;
            }

            window.scrollTo(0, targetY);

            requestAnimationFrame(()=>{
              requestAnimationFrame(()=>{
                statsBridgePlaying =
                  false;

                document.documentElement.classList.remove("hero-caption-scroll-locked");
                document.documentElement.classList.remove("hero-stats-bridge-playing");
                document.documentElement.classList.remove("hero-mobile-snap-playing");
              });
            });
          };

        requestAnimationFrame(step);
      };

    const playStatsBridge =
      ()=>{
        const startProgress =
          getHeroProgress();

        const statementProgress =
          getStatementTargetProgress();

        const targetProgress =
          getStatsTargetProgress();

        if(startProgress < statementProgress - getBridgeLead() || startProgress > targetProgress + getBridgeExit()) return;

        playHeroSnap(targetProgress);
      };

    const playStatementBridge =
      ()=>{
        const startProgress =
          getHeroProgress();

        const statementProgress =
          getStatementTargetProgress();

        if(startProgress <= statementProgress + 0.015) return;

        playHeroSnap(statementProgress);
      };

    const playHeroTopBridge =
      ()=>{
        const startProgress =
          getHeroProgress();

        if(startProgress <= 0.025 || startProgress > getStatementTargetProgress() + 0.08) return;

        playHeroSnap(0);
      };

    const onWheel =
      event=>{
        if(event.deltaY > 0){
          event.preventDefault();
          clampToHero();
        }
      };

    const onTouchStart =
      event=>{
        touchStartY =
          event.touches && event.touches.length
            ? event.touches[0].clientY
            : 0;
      };

    const onTouchMove =
      event=>{
        const currentY =
          event.touches && event.touches.length
            ? event.touches[0].clientY
            : touchStartY;

        if(touchStartY - currentY > 0){
          event.preventDefault();
          clampToHero();
        }
      };

    const onKeyDown =
      event=>{
        if(scrollLockKeys.has(event.key)){
          event.preventDefault();
          clampToHero();
        }
      };

    const onScroll =
      ()=>clampToHero();

    const triggerReplay =
      ()=>{
        if(isMobileViewport() && hasSeenIntroGate()) return;
        if(!released || cinematicPlaying || !isNearHeroTop()) return;

        armGate(holdMs, true);
      };

    const onReplayWheel =
      event=>{
        if(event.deltaY <= 0) return;
        if(!released || cinematicPlaying || !isNearHeroTop()) return;

        event.preventDefault();
        triggerReplay();
      };

    const onReplayTouchStart =
      event=>{
        replayTouchStartY =
          event.touches && event.touches.length
            ? event.touches[0].clientY
            : 0;
      };

    const onReplayTouchMove =
      event=>{
        const currentY =
          event.touches && event.touches.length
            ? event.touches[0].clientY
            : replayTouchStartY;

        if(replayTouchStartY - currentY <= 0) return;
        if(!released || cinematicPlaying || !isNearHeroTop()) return;

        event.preventDefault();
        triggerReplay();
      };

    const onReplayKeyDown =
      event=>{
        if(!scrollLockKeys.has(event.key)) return;
        if(!released || cinematicPlaying || !isNearHeroTop()) return;

        event.preventDefault();
        triggerReplay();
      };

    const onBridgeWheel =
      event=>{
        if(statsBridgePlaying){
          event.preventDefault();
          return;
        }

        if(!released || cinematicPlaying || !isWithinHeroSnapRange()) return;

        if(event.deltaY > 0){
          const startProgress =
            getHeroProgress();

          if(startProgress < getStatementTargetProgress() - getBridgeLead() || startProgress > getStatsTargetProgress() + getBridgeExit()) return;

          event.preventDefault();
          playStatsBridge();
          return;
        }

        if(event.deltaY < 0){
          const startProgress =
            getHeroProgress();

          if(shouldLetReviewAreaScrollBack(startProgress)) return;

          if(startProgress > getStatementTargetProgress() + 0.015){
            event.preventDefault();
            playStatementBridge();
            return;
          }

          if(startProgress > 0.025){
            event.preventDefault();
            playHeroTopBridge();
          }
        }
      };

    const onBridgeTouchStart =
      event=>{
        bridgeTouchStartY =
          event.touches && event.touches.length
            ? event.touches[0].clientY
            : 0;
      };

    const onBridgeTouchMove =
      event=>{
        if(statsBridgePlaying){
          event.preventDefault();
          return;
        }

        const currentY =
          event.touches && event.touches.length
            ? event.touches[0].clientY
            : bridgeTouchStartY;

        if(!released || cinematicPlaying || !isWithinHeroSnapRange()) return;

        const travel =
          bridgeTouchStartY - currentY;

        if(Math.abs(travel) < 4) return;

        const startProgress =
          getHeroProgress();

        if(travel > 0){
          if(startProgress < getStatementTargetProgress() - getBridgeLead() || startProgress > getStatsTargetProgress() + getBridgeExit()) return;

          event.preventDefault();
          playStatsBridge();
          return;
        }

        if(shouldLetReviewAreaScrollBack(startProgress)) return;

        if(startProgress > getStatementTargetProgress() + 0.015){
          event.preventDefault();
          playStatementBridge();
          return;
        }

        if(startProgress > 0.025){
          event.preventDefault();
          playHeroTopBridge();
        }
      };

    const onBridgeKeyDown =
      event=>{
        if(statsBridgePlaying && scrollLockKeys.has(event.key)){
          event.preventDefault();
          return;
        }

        if(!released || cinematicPlaying || !isWithinHeroSnapRange()) return;

        const startProgress =
          getHeroProgress();

        if(scrollLockKeys.has(event.key)){
          if(startProgress < getStatementTargetProgress() - getBridgeLead() || startProgress > getStatsTargetProgress() + getBridgeExit()) return;

          event.preventDefault();
          playStatsBridge();
          return;
        }

        if(!scrollUpKeys.has(event.key)) return;

        if(shouldLetReviewAreaScrollBack(startProgress)) return;

        if(startProgress > getStatementTargetProgress() + 0.015){
          event.preventDefault();
          playStatementBridge();
          return;
        }

        if(startProgress > 0.025){
          event.preventDefault();
          playHeroTopBridge();
        }
      };

    window.addEventListener("wheel", onReplayWheel, {passive:false});
    window.addEventListener("touchstart", onReplayTouchStart, {passive:true});
    window.addEventListener("touchmove", onReplayTouchMove, {passive:false});
    window.addEventListener("keydown", onReplayKeyDown);
    window.addEventListener("wheel", onBridgeWheel, {passive:false});
    window.addEventListener("touchstart", onBridgeTouchStart, {passive:true});
    window.addEventListener("touchmove", onBridgeTouchMove, {passive:false});
    window.addEventListener("keydown", onBridgeKeyDown);

    if(isMobileViewport() && hasSeenIntroGate()){
      document.documentElement.classList.remove("hero-caption-scroll-locked");
    }else{
      armGate(holdMs);
    }

  }

  function initReviewCoverPanel(){

    const panel =
      document.querySelector(".hero-expand-sticky .review-cover-panel") ||
      document.querySelector("#brand #inc01 .review-cover-panel");

    if(!panel) return;

    const hero =
      document.querySelector(".hero-expand-section");

    const clamp =
      (value, min, max)=>Math.max(min, Math.min(max, value));

    const easeInOut =
      value=>value * value * (3 - 2 * value);

    function update(){

      if(!hero) return;

      const rect =
        hero.getBoundingClientRect();

      const scrollable =
        Math.max(1, hero.offsetHeight - window.innerHeight);

      const heroProgress =
        clamp(-rect.top / scrollable, 0, 1);

      const start =
        window.innerWidth <= 768 ? .61 : .84;

      const end =
        window.innerWidth <= 768 ? .69 : .90;

      const progress =
        clamp((heroProgress - start) / (end - start), 0, 1);

      const eased =
        easeInOut(progress);

      panel.style.setProperty(
        "--review-cover-y",
        "0vh"
      );

      panel.style.opacity =
        eased.toFixed(4);

      panel.classList.toggle("is-visible", progress > 0.02);
      panel.classList.toggle("is-covered", progress > .94);

    }

    update();

    window.addEventListener("scroll", update, {passive:true});
    window.addEventListener("resize", update);

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
        ? Math.min(.75, Math.max(.12, logoRect.width / loaderRect.width))
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

  function stageLoaderIntro(){

    const loader =
      document.querySelector(".logo-screen");

    if(!loader) return;

    requestAnimationFrame(()=>{

      setTimeout(()=>{
        loader.classList.add("logo-visible");
      }, 240);

      setTimeout(()=>{
        loader.classList.add("is-wiping");
      }, 1480);

    });

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

    jumpToHashTarget(targetId, "auto");

  }

  function clearAllPassOverlayForSectionJump(){

    window.__skipAllPassRevealUntil =
      Date.now() + 1800;

    document.dispatchEvent(new CustomEvent("allpassReleaseScrollLock"));

    document.documentElement.classList.remove(
      "allpass-scroll-locked",
      "pass-reveal-playing",
      "pass-reveal-complete"
    );

    const locator =
      document.querySelector("[data-pass-locator]");

    if(locator){
      locator.classList.remove("is-revealed");
    }

    const transition =
      document.querySelector("[data-pass-transition]");

    if(transition){
      transition.classList.remove("is-playing", "is-complete");
      transition.style.setProperty("--pass-transition-opacity", "0");
      transition.style.setProperty("--pass-transition-scale", ".2");
    }

    document.documentElement.style.overflow =
      "";
    document.body.style.overflow =
      "";

  }

  function jumpToHashTarget(targetId, behavior = "smooth"){

    const target =
      document.getElementById(targetId);

    if(!target) return false;

    if(targetId === "facility"){
      clearAllPassOverlayForSectionJump();
    }

    const top =
      getHashScrollTop(targetId);

    if(top === null) return false;

    window.scrollTo({
      top,
      behavior
    });

    if(targetId === "facility"){
      [80, 280, 760].forEach(delay=>{
        window.setTimeout(()=>{
          clearAllPassOverlayForSectionJump();

          const nextTop =
            getHashScrollTop(targetId);

          if(nextTop !== null){
            window.scrollTo({
              top:nextTop,
              behavior:"auto"
            });
          }

          if(window.ScrollTrigger){
            window.ScrollTrigger.refresh();
          }
        }, delay);
      });
    }

    return true;

  }

  function getHashScrollTop(targetId){

    const header =
      document.querySelector("header");

    const headerHeight =
      header ? header.offsetHeight : 0;

    if(targetId === "about"){
      const hero =
        document.querySelector(".hero-expand-section");

      if(hero){
        const heroTop =
          hero.getBoundingClientRect().top + window.pageYOffset;

        const scrollable =
          Math.max(1, hero.offsetHeight - window.innerHeight);

        const centerIntroProgress =
          window.innerWidth <= 768 ? 0.62 : 0.6;

        return Math.max(0, heroTop + scrollable * centerIntroProgress - headerHeight);
      }
    }

    const target =
      document.getElementById(targetId);

    if(!target) return null;

    return Math.max(
      0,
      target.getBoundingClientRect().top + window.pageYOffset - headerHeight
    );

  }

  function initHashNavigation(){

    document
      .querySelectorAll('a[href^="#"]')
      .forEach(link=>{

        if(link.dataset.hashNavReady === "true") return;

        link.dataset.hashNavReady =
          "true";

        link.addEventListener("click", event=>{

          const href =
            link.getAttribute("href");

          if(!href || href === "#") return;

          let targetId =
            href.slice(1);

          try{
            targetId =
              decodeURIComponent(targetId);
          }catch(error){
            targetId =
              href.slice(1);
          }

          const top =
            getHashScrollTop(targetId);

          if(top === null) return;

          const target =
            document.getElementById(targetId);

          event.preventDefault();

          if(window.history && window.history.pushState){
            window.history.pushState(null, "", `#${encodeURIComponent(targetId)}`);
          }else{
            window.location.hash =
              targetId;
          }

          document.body.classList.remove("menu-open");

          jumpToHashTarget(targetId, "smooth");

        });

      });

  }

  function queueHashScroll(){

    [80, 700, 1600].forEach(delay=>{
      setTimeout(scrollToHashTarget, delay);
    });

  }

  window.addEventListener("hashchange", scrollToHashTarget);

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
      initHashNavigation();
      queueHashScroll();
      return;
    }

    setLoaderTarget();

    const isMobileLoader =
      window.innerWidth <= 768;

    const mobileBlackLogoHold =
      isMobileLoader ? 640 : 0;

    requestAnimationFrame(()=>{

      setLoaderTarget();
      loader.classList.add("is-wiping", "logo-visible", "logo-on-white");

      setTimeout(()=>{

        document.body.classList.add("loader-docking");
        loader.classList.add("dock-to-logo");

      }, mobileBlackLogoHold);

    });

    setTimeout(()=>{

      document.body.classList.add("loaded");
      loader.classList.add("release");
      startSite();
      initHashNavigation();
      queueHashScroll();

    },1240 + mobileBlackLogoHold);

    setTimeout(()=>{

      loader.style.display = "none";

    },1880 + mobileBlackLogoHold);

  }

  window.addEventListener("resize", ()=>{

    if(!document.body.classList.contains("loaded")){
      setLoaderTarget();
    }

  });

  prepareIntroCaption();

  initMobileIntroVideo();

  stageLoaderIntro();

  setTimeout(openMain, 2860);



  /* 메인 히어로 영상 확장 */
  function initHeroExpand(){

    const hero =
      document.querySelector(".hero-expand-section");

    if(!hero) return;

    const revealWords =
      Array.from(hero.querySelectorAll(".intro-reveal-copy .reveal-word"));

    let introStats =
      Array.from(hero.querySelectorAll(".review-stats-section .stat-number"));

    let heroCounterStarted =
      false;

    let heroCounterComplete =
      false;

    const clamp =
      (value, min, max)=>Math.max(min, Math.min(max, value));

      const easeOut =
        value=>1 - Math.pow(1 - value, 3);

      const easeInOut =
        value=>value * value * (3 - 2 * value);

    let displayedHeroProgress =
      null;

    let lastHeroSmoothAt =
      0;

    let reviewProofDividerTimer =
      0;

    let reviewProofDividerTimedOut =
      false;

    function armReviewProofDividerTimer(isMobile){
      if(reviewProofDividerTimer || reviewProofDividerTimedOut) return;

      reviewProofDividerTimer =
        window.setTimeout(()=>{
          reviewProofDividerTimer =
            0;

          reviewProofDividerTimedOut =
            true;

          update();
        }, isMobile ? 1700 : 1400);
    }

    function smoothHeroProgress(rawProgress){

      const now =
        performance.now();

      if(rawProgress <= 0.001){
        displayedHeroProgress =
          0;

        lastHeroSmoothAt =
          now;

        return 0;
      }

      if(
        document.documentElement.classList.contains("hero-stats-bridge-playing") ||
        document.documentElement.classList.contains("hero-mobile-snap-playing")
      ){
        displayedHeroProgress =
          rawProgress;

        lastHeroSmoothAt =
          now;

        return rawProgress;
      }

      if(displayedHeroProgress === null){
        displayedHeroProgress =
          rawProgress;

        lastHeroSmoothAt =
          now;

        return rawProgress;
      }

      const delta =
        rawProgress - displayedHeroProgress;

      if(Math.abs(delta) < 0.00035){
        displayedHeroProgress =
          rawProgress;

        return rawProgress;
      }

      const absDelta =
        Math.abs(delta);

      const isMobile =
        window.innerWidth <= 768;

      const smoothing =
        isMobile
          ? (
              delta < 0
                ? (absDelta > 0.08 ? 0.18 : 0.24)
                : (absDelta > 0.18 ? 0.82 : (absDelta > 0.08 ? 0.62 : 0.34))
            )
          : (
              delta < 0
                ? (absDelta > 0.08 ? 0.045 : 0.07)
                : (absDelta > 0.08 ? 0.19 : 0.12)
            );

      const elapsedFrames =
        lastHeroSmoothAt
          ? clamp((now - lastHeroSmoothAt) / 16.67, 0, 4)
          : 1;

      lastHeroSmoothAt =
        now;

      const frameSmoothing =
        1 - Math.pow(1 - smoothing, elapsedFrames);

      displayedHeroProgress +=
        delta * frameSmoothing;

      return displayedHeroProgress;

    }

    function startHeroCounter(){

      if(!introStats.length){
        introStats =
          Array.from(hero.querySelectorAll(".review-stats-section .stat-number"));
      }

      if(heroCounterStarted || !introStats.length) return;

      heroCounterStarted =
        true;

      const stats =
        introStats;

      const duration =
        window.innerWidth <= 768 ? 1300 : 1500;

      const startedAt =
        performance.now();

      function updateCounter(now){

        if(heroCounterComplete) return;

        const progress =
          easeOut(clamp((now - startedAt) / duration, 0, 1));

        stats.forEach(stat=>{

          const target =
            Number(stat.dataset.target);

          if(!Number.isFinite(target)) return;

          const value =
            progress >= 1
              ? target
              : Math.floor(target * progress);

          stat.textContent =
            value.toLocaleString();

        });

        if(progress < 1){
          requestAnimationFrame(updateCounter);
        }else{
          heroCounterComplete =
            true;

          document.documentElement.classList.add("review-stats-counted");
        }

      }

      requestAnimationFrame(updateCounter);

    }

    function finishHeroCounter(){

      if(!introStats.length){
        introStats =
          Array.from(hero.querySelectorAll(".review-stats-section .stat-number"));
      }

      if(!introStats.length) return;

      introStats.forEach(stat=>{

        const target =
          Number(stat.dataset.target);

        if(!Number.isFinite(target)) return;

        stat.textContent =
          target.toLocaleString();

      });

      heroCounterStarted =
        true;

      heroCounterComplete =
        true;

      document.documentElement.classList.add("review-stats-counted");

    }

    function update(){

      const rect =
        hero.getBoundingClientRect();

      const scrollable =
        Math.max(1, hero.offsetHeight - window.innerHeight);

      const rawProgress =
        Math.max(0, Math.min(1, -rect.top / scrollable));

      const progress =
        smoothHeroProgress(rawProgress);

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
          : clamp(availableHeight * 0.46, 340, 450);

      const startBottom =
        isMobile ? -14 : -54;

      const expandEnd =
        isMobile ? 0.23 : 0.34;

      const copyStart =
        isMobile ? 0.16 : 0.27;

      const copyRange =
        isMobile ? 0.10 : 0.16;

      const lineStart =
        isMobile ? 0.18 : 0.31;

      const lineStep =
        isMobile ? 0.018 : 0.035;

      const lineRange =
        isMobile ? 0.08 : 0.18;

      const wordStart =
        isMobile ? 0.18 : 0.32;

      const wordStep =
        isMobile ? 0 : 0.024;

      const wordRange =
        isMobile ? 0.08 : 0.085;

      const underlineStart =
        lineStart + lineStep + lineRange * 0.78;

      const underlineRange =
        isMobile ? 0.12 : 0.18;

      const expand =
        easeOut(clamp(progress / expandEnd, 0, 1));

      const copyProgress =
        easeInOut(clamp((progress - copyStart) / copyRange, 0, 1));

      const statsIntroStart =
        isMobile ? 0.61 : 0.795;

      const statsIntroEnd =
        isMobile ? 0.69 : 0.855;

      const messageExitStart =
        isMobile ? 0.57 : 0.765;

      const messageExitEnd =
        isMobile ? 0.68 : 0.835;

      const statsFadeStart =
        isMobile ? 0.72 : 0.94;

      const statsFadeEnd =
        isMobile ? 0.755 : 0.952;

      const reviewDarkStart =
        isMobile ? 0.61 : 0.95;

      const reviewDarkEnd =
        isMobile ? 0.82 : 0.99;

      const frameReturnStart =
        isMobile ? 0.94 : 0.994;

      const frameReturnEnd =
        isMobile ? 0.99 : 0.9995;

      const cardsStart =
        isMobile ? 0.965 : 0.9995;

      const cardsEnd =
        isMobile ? 0.998 : 0.9999;

      const proofStart =
        isMobile ? 0.755 : 0.952;

      const proofEnd =
        isMobile ? 0.79 : 0.962;

      const lineFadeStart =
        isMobile ? 1.1 : 0.962;

      const lineFadeEnd =
        isMobile ? 1.1 : 0.999;

      const proofLiftStart =
        isMobile ? 0.93 : 0.9983;

      const proofLiftEnd =
        isMobile ? 0.965 : 0.9997;

      const statsIntroProgress =
        easeInOut(clamp((progress - statsIntroStart) / (statsIntroEnd - statsIntroStart), 0, 1));

      const messageExitProgress =
        easeInOut(clamp((progress - messageExitStart) / (messageExitEnd - messageExitStart), 0, 1));

      if(progress >= proofStart && !heroCounterComplete && !isMobile){
        finishHeroCounter();
      }

      const statsFadeProgress =
        heroCounterComplete
          ? easeInOut(clamp((progress - statsFadeStart) / (statsFadeEnd - statsFadeStart), 0, 1))
          : 0;

      const cardsProgress =
        heroCounterComplete
          ? easeInOut(clamp((progress - cardsStart) / (cardsEnd - cardsStart), 0, 1))
          : 0;

      const proofProgress =
        heroCounterComplete
          ? easeInOut(clamp((progress - proofStart) / (proofEnd - proofStart), 0, 1))
          : 0;

      const proofLiftProgress =
        heroCounterComplete
          ? easeInOut(clamp((progress - proofLiftStart) / (proofLiftEnd - proofLiftStart), 0, 1))
          : 0;

      const reviewDarkProgress =
        heroCounterComplete
          ? easeInOut(clamp((progress - reviewDarkStart) / (reviewDarkEnd - reviewDarkStart), 0, 1))
          : 0;

      const frameReturnProgress =
        heroCounterComplete
          ? easeInOut(clamp((progress - frameReturnStart) / (frameReturnEnd - frameReturnStart), 0, 1))
          : 0;

      const lineFadeProgress =
        heroCounterComplete
          ? easeInOut(clamp((progress - lineFadeStart) / (lineFadeEnd - lineFadeStart), 0, 1))
          : 0;

      const reviewStatsHoldComplete =
        document.documentElement.classList.contains("review-stats-counted");

      if(proofProgress > 0.95 && reviewStatsHoldComplete){
        armReviewProofDividerTimer(isMobile);
      }

      const proofAutoLineFade =
        reviewProofDividerTimedOut ? 1 : 0;

      const proofExitProgress =
        isMobile && heroCounterComplete
          ? easeInOut(clamp((progress - 0.94) / 0.035, 0, 1))
          : 0;

      const proofDividerAlive =
        clamp(1 - Math.max(lineFadeProgress, proofAutoLineFade), 0, 1);

      const proofDividerOpacity =
        proofProgress * clamp(proofDividerAlive / 0.22, 0, 1);

      const proofCardFade =
        isMobile
          ? clamp(cardsProgress / 0.58, 0, 1)
          : Math.max(0, cardsProgress - 0.55) / 0.45;

      const proofFadeProgress =
        Math.max(proofExitProgress, proofCardFade);

      if(statsIntroProgress > 0.12){
        startHeroCounter();
      }

      const introProgress =
        easeOut(clamp((progress - 0.06) / 0.2, 0, 1));

      const scrollProgress =
        clamp(progress / 0.18, 0, 1);

      const baseRadius =
        ((isMobile ? 20 : 28) * (1 - expand)) + (isMobile ? 20 : 28) * copyProgress;

      const fullWidth =
        window.innerWidth;

      const framedWidth =
        Math.max(
          isMobile ? 312 : 720,
          window.innerWidth - (isMobile ? 28 : 72)
        );

      const baseFrameWidth =
        startWidth + (fullWidth - startWidth) * expand - (fullWidth - framedWidth) * copyProgress;

      const fullHeight =
        availableHeight;

      const framedHeight =
        Math.max(
          isMobile ? 430 : 520,
          availableHeight - (isMobile ? 28 : 62)
        );

      const baseFrameHeight =
        startHeight + (fullHeight - startHeight) * expand - (fullHeight - framedHeight) * copyProgress;

      const baseFrameBottom =
        startBottom * (1 - expand) + (isMobile ? 14 : 31) * copyProgress;

      const frameWidth =
        baseFrameWidth + (fullWidth - baseFrameWidth) * frameReturnProgress;

      const frameHeight =
        baseFrameHeight + (fullHeight - baseFrameHeight) * frameReturnProgress;

      const frameBottom =
        baseFrameBottom * (1 - frameReturnProgress);

      const radius =
        baseRadius * (1 - frameReturnProgress);

      const lineReveal =
        index=>{
          const start =
            isMobile ? lineStart : lineStart + index * lineStep;

          return `${(easeInOut(clamp((progress - start) / lineRange, 0, 1)) * 100).toFixed(1)}%`;
        };

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
        `${-28 * introProgress}px`
      );

      hero.style.setProperty(
        "--hero-title-height",
        "62vh"
      );

      hero.style.setProperty(
        "--hero-copy-opacity",
        (copyProgress * (1 - messageExitProgress)).toFixed(4)
      );

      hero.style.setProperty(
        "--hero-copy-y",
        `${64 - 64 * copyProgress - messageExitProgress * (isMobile ? 18 : 24)}px`
      );

      hero.style.setProperty(
        "--hero-copy-scale",
        (1 - messageExitProgress * (isMobile ? 0.035 : 0.04)).toFixed(4)
      );

      hero.style.setProperty(
        "--review-content-y",
        `${(isMobile ? 132 : 92) - statsIntroProgress * (isMobile ? 132 : 92)}px`
      );

      hero.style.setProperty(
        "--review-stats-opacity",
        (clamp(statsIntroProgress / 0.8, 0, 1) * (1 - statsFadeProgress)).toFixed(4)
      );

      hero.style.setProperty(
        "--review-cards-opacity",
        cardsProgress.toFixed(4)
      );

      hero.style.setProperty(
        "--review-cards-y",
        `${(isMobile ? 560 : 520) - cardsProgress * (isMobile ? 560 : 520)}px`
      );

      hero.style.setProperty(
        "--review-cards-x",
        `${(1 - cardsProgress) * (isMobile ? 220 : 340)}px`
      );

      hero.style.setProperty(
        "--review-bg-opacity",
        (reviewDarkProgress * 0.86).toFixed(4)
      );

      hero.style.setProperty(
        "--review-proof-opacity",
        (proofProgress * (1 - proofFadeProgress)).toFixed(4)
      );

      hero.style.setProperty(
        "--review-proof-y",
        `${(isMobile ? 82 : 112) - proofProgress * (isMobile ? 82 : 112) - proofLiftProgress * (isMobile ? 92 : 150)}px`
      );

      hero.style.setProperty(
        "--review-proof-scale",
        "1"
      );

      hero.style.setProperty(
        "--review-proof-gap",
        `${(isMobile ? 8 : 16) + proofDividerAlive * (isMobile ? 5 : 14)}px`
      );

      hero.style.setProperty(
        "--review-proof-divider-opacity",
        proofDividerOpacity.toFixed(4)
      );

      hero.style.setProperty(
        "--review-proof-divider-width",
        `${(isMobile ? 38 : 150) * clamp(proofProgress * 1.18, 0, 1) * proofDividerAlive}px`
      );

      const liveReviewSlides =
        Array.from(hero.querySelectorAll(".review-cover-panel .review-slide"));

      liveReviewSlides.forEach((slide, index)=>{
        const orderMatch =
          slide.className.match(/\breview(\d+)\b/);

        const orderIndex =
          orderMatch ? Math.max(0, Number(orderMatch[1]) - 1) : index;

        const orderStep =
          isMobile ? 0.072 : 0.11;

        const slideRange =
          isMobile ? 0.44 : 0.26;

        const slideProgress =
          easeInOut(clamp((cardsProgress - orderIndex * orderStep) / slideRange, 0, 1));

        const textProgress =
          easeInOut(clamp((cardsProgress - orderIndex * orderStep - (isMobile ? 0.18 : 0.08)) / (isMobile ? 0.42 : 0.28), 0, 1));

        slide.style.setProperty(
          "--slide-opacity",
          slideProgress.toFixed(4)
        );

        slide.style.setProperty(
          "--slide-x",
          `${(1 - slideProgress) * (isMobile ? 90 : 130)}px`
        );

        slide.style.setProperty(
          "--card-text-opacity",
          textProgress.toFixed(4)
        );

        slide.style.setProperty(
          "--card-text-y",
          `${(1 - textProgress) * (isMobile ? 26 : 32)}px`
        );
      });

      for(let i = 0; i < 4; i++){
        hero.style.setProperty(
          `--hero-line-${i + 1}`,
          lineReveal(i)
        );
      }

      revealWords.forEach((word, index)=>{

        const wordProgress =
          easeInOut(clamp((progress - (wordStart + index * wordStep)) / wordRange, 0, 1));

        word.style.setProperty(
          "--word-fill",
          `${(wordProgress * 100).toFixed(1)}%`
        );

        word.style.opacity =
          (0.34 + wordProgress * 0.66).toFixed(4);

        word.style.transform =
          `translateY(${((1 - wordProgress) * 10).toFixed(2)}px)`;

      });

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
        Math.max(0.06 + 0.34 * copyProgress, reviewDarkProgress * 0.98).toFixed(4)
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

    if(statsSection.closest(".hero-expand-sticky")) return;

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

    const reviewSlider =
      document.querySelector(".review-cover-panel .all_slider") ||
      document.querySelector("#brand #inc01 .all_slider");

    if(window.Swiper && reviewSlider){
      new Swiper(reviewSlider, {
        loop:true,
        speed:1000,
        slidesPerView:"auto",
        spaceBetween:18,
        slideActiveClass:"on",
        centeredSlides:true,
        autoplay:{
          delay:2500,
          disableOnInteraction:false,
        },
        breakpoints:{
          481:{
            spaceBetween:22,
          },
          769:{
            spaceBetween:28,
          },
          1025:{
            spaceBetween:34,
          },
          1441:{
            spaceBetween:42,
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

    if(!section) return;

    const canUseScrollTrigger =
      Boolean(window.gsap && window.ScrollTrigger);

    if(canUseScrollTrigger){
      gsap.registerPlugin(ScrollTrigger);
    }

    const imgs =
      Array.from(document.querySelectorAll("#facilityTour .img_box li"));

    const texts =
      Array.from(document.querySelectorAll("#facilityTour .txt_box li"));

    if(!imgs.length || !texts.length) return;

    const facilityPhotos =
      imgs.map(img=>Array.from(img.querySelectorAll("span")));

    const photoIndexes =
      facilityPhotos.map(()=>0);

    let activeFacilityIndex =
      0;

    function getPhotoSrc(photo){

      const inlineBg =
        photo && photo.style ? photo.style.backgroundImage : "";

      const bg =
        inlineBg || (photo ? window.getComputedStyle(photo).backgroundImage : "");

      return bg.replace(/^url\(["']?/, "").replace(/["']?\)$/, "");

    }

    function setFacilityPhoto(index, photoIndex = 0){

      const photos =
        facilityPhotos[index] || [];

      if(!photos.length) return;

      const safeIndex =
        ((photoIndex % photos.length) + photos.length) % photos.length;

      photoIndexes[index] =
        safeIndex;

      photos.forEach((photo, i)=>{
        photo.classList.toggle("photo-on", i === safeIndex);
      });

      if(texts[index]){
        const src =
          getPhotoSrc(photos[safeIndex]);

        if(src){
          texts[index].style.setProperty("--facility-bg", `url("${src}")`);
        }
      }

    }

    facilityPhotos.forEach((photos, index)=>{
      if(photos.length){
        setFacilityPhoto(index, 0);
      }
    });

    section.classList.add("facility-ready");

    function setActive(index){

      const maxIndex =
        Math.min(imgs.length, texts.length) - 1;

      index =
        Math.max(0, Math.min(index, maxIndex));

      activeFacilityIndex =
        index;

      imgs.forEach(img=>img.classList.remove("on"));
      texts.forEach(text=>text.classList.remove("on"));

      if(imgs[index]){
        imgs[index].classList.add("on");
      }

      if(texts[index]){
        texts[index].classList.add("on");
      }

      setFacilityPhoto(index, photoIndexes[index] || 0);

    }

    setActive(0);

    let facilityScrollTicking =
      false;

    function getVisibleTextIndex(){

      const anchorY =
        window.innerHeight * 0.5;

      let bestIndex =
        activeFacilityIndex;

      let bestDistance =
        Number.POSITIVE_INFINITY;

      texts.forEach((text, index)=>{
        const rect =
          text.getBoundingClientRect();

        const visibleHeight =
          Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));

        if(!visibleHeight) return;

        const textCenter =
          rect.top + rect.height / 2;

        const distance =
          Math.abs(textCenter - anchorY);

        if(distance < bestDistance){
          bestDistance =
            distance;
          bestIndex =
            index;
        }
      });

      return bestIndex;

    }

    function syncActiveToVisibleText(){

      facilityScrollTicking =
        false;

      setActive(getVisibleTextIndex());

    }

    function requestFacilitySync(){

      if(facilityScrollTicking) return;

      facilityScrollTicking =
        true;

      window.requestAnimationFrame(syncActiveToVisibleText);

    }

    window.addEventListener("scroll", requestFacilitySync, {passive:true});

    window.addEventListener("resize", ()=>{
      requestFacilitySync();

      if(window.ScrollTrigger){
        window.ScrollTrigger.refresh();
      }
    }, {passive:true});

    if(canUseScrollTrigger){
      ScrollTrigger.create({
        trigger:"#facilityTour .cont",
        start:"top bottom",
        end:"bottom top",
        onEnter:requestFacilitySync,
        onEnterBack:requestFacilitySync,
        onUpdate:requestFacilitySync,
      });
    }

    [80, 320, 900].forEach(delay=>{
      window.setTimeout(requestFacilitySync, delay);
    });

    window.setInterval(()=>{
      const photos =
        facilityPhotos[activeFacilityIndex] || [];

      if(photos.length <= 1) return;

      setFacilityPhoto(
        activeFacilityIndex,
        (photoIndexes[activeFacilityIndex] || 0) + 1
      );
    }, 2600);

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

