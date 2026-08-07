(function(){
  var isMobile =
    window.matchMedia &&
    window.matchMedia("(max-width: 768px)").matches;

  if(!isMobile) return;

  document.documentElement.setAttribute("data-home-device", "mobile");
  window.HEALTHBOY_HOME_DEVICE =
    "mobile";

  window.HEALTHBOY_HOME_CONFIG = {
    device:"mobile",
    video:{
      loadHeroVideo:false
    },
    bridge:{
      statsTargetProgress:0.48,
      reviewHoldTargetProgress:0.955,
      lead:0.13,
      exit:0.04
    },
    reviewPanel:{
      start:0.40,
      end:0.48,
      coveredAt:0.94
    },
    heroTimings:{
      statsIntroStart:0.40,
      statsIntroEnd:0.48,
      messageExitStart:0.37,
      messageExitEnd:0.47,
      statsFadeStart:0.52,
      statsFadeEnd:0.60,
      reviewDarkStart:0.46,
      reviewDarkEnd:0.80,
      frameReturnStart:0.62,
      frameReturnEnd:0.88,
      cardsStart:0.875,
      cardsEnd:0.945,
      proofStart:0.54,
      proofEnd:0.63,
      lineFadeStart:0.75,
      lineFadeEnd:0.86,
      proofLiftStart:0.70,
      proofLiftEnd:0.88,
      counterForceFinishProgress:0.54
    }
  };

  function installContinuousReviewSlider(){
    if(window.HEALTHBOY_REVIEW_SWIPER_PATCHED) return;
    window.HEALTHBOY_REVIEW_SWIPER_PATCHED = true;

    function isReviewTarget(target){
      if(typeof target === "string") return target.indexOf("all_slider") !== -1;
      return !!(
        target &&
        target.classList &&
        target.classList.contains("all_slider")
      );
    }

    function tuneOptions(target, options){
      if(!isReviewTarget(target) || !options) return options;

      options.speed = 6500;
      options.centeredSlides = false;
      options.loopAdditionalSlides = Math.max(options.loopAdditionalSlides || 0, 6);
      options.autoplay = Object.assign({}, options.autoplay || {}, {
        delay:0,
        disableOnInteraction:false,
        pauseOnMouseEnter:false
      });
      options.freeMode = true;
      options.freeModeMomentum = false;

      return options;
    }

    function wrapSwiper(SwiperCtor){
      if(!SwiperCtor || SwiperCtor.__healthboyContinuousReview) return SwiperCtor;

      function ReviewSwiper(target, options){
        return new SwiperCtor(target, tuneOptions(target, options));
      }

      Object.keys(SwiperCtor).forEach(function(key){
        try{
          ReviewSwiper[key] = SwiperCtor[key];
        }catch(error){}
      });

      ReviewSwiper.prototype = SwiperCtor.prototype;
      ReviewSwiper.__healthboyContinuousReview = true;
      return ReviewSwiper;
    }

    var descriptor = Object.getOwnPropertyDescriptor(window, "Swiper");
    var currentSwiper = window.Swiper;

    if(descriptor && descriptor.configurable === false){
      if(currentSwiper) window.Swiper = wrapSwiper(currentSwiper);
      return;
    }

    try{
      Object.defineProperty(window, "Swiper", {
        configurable:true,
        get:function(){
          return currentSwiper;
        },
        set:function(value){
          currentSwiper = wrapSwiper(value);
        }
      });

      if(currentSwiper) currentSwiper = wrapSwiper(currentSwiper);
    }catch(error){
      if(currentSwiper) window.Swiper = wrapSwiper(currentSwiper);
    }
  }

  installContinuousReviewSlider();

  function lockMobileBronzeBackground(){
    var intro =
      document.querySelector(".intro");

    if(!intro) return;

    intro.style.setProperty(
      "--hero-stage-bg",
      "#030303 url('assets/mobile-intro-bronze-wave.svg') center top / cover no-repeat",
      "important"
    );
  }

  if(document.readyState === "loading"){
    document.addEventListener(
      "DOMContentLoaded",
      lockMobileBronzeBackground,
      { once:true }
    );
  }else{
    lockMobileBronzeBackground();
  }

  window.addEventListener(
    "load",
    lockMobileBronzeBackground,
    { once:true }
  );
})();
