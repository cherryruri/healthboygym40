(function(){
  var isMobile =
    window.matchMedia &&
    window.matchMedia("(max-width: 768px)").matches;

  if(isMobile) return;

  document.documentElement.setAttribute("data-home-device", "desktop");
  window.HEALTHBOY_HOME_DEVICE =
    "desktop";

  window.HEALTHBOY_HOME_CONFIG = {
    device:"desktop",
    video:{
      loadHeroVideo:true,
      sourceDelay:1200,
      idleTimeout:2600,
      fallbackDelay:1600
    },
    bridge:{
      statsTargetProgress:0.60,
      reviewHoldTargetProgress:0.925,
      lead:0.14,
      exit:0.04
    },
    reviewPanel:{
      start:0.50,
      end:0.58,
      coveredAt:0.94
    },
    heroTimings:{
      statsIntroStart:0.50,
      statsIntroEnd:0.58,
      messageExitStart:0.46,
      messageExitEnd:0.55,
      statsFadeStart:0.66,
      statsFadeEnd:0.72,
      reviewDarkStart:0.66,
      reviewDarkEnd:0.84,
      frameReturnStart:0.70,
      frameReturnEnd:0.84,
      cardsStart:0.845,
      cardsEnd:0.915,
      proofStart:0.68,
      proofEnd:0.74,
      lineFadeStart:0.80,
      lineFadeEnd:0.86,
      proofLiftStart:0.74,
      proofLiftEnd:0.86,
      counterForceFinishProgress:0.76
    }
  };
})();
