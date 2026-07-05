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
})();
