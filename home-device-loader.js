(function(){
  var isMobile =
    window.matchMedia &&
    window.matchMedia("(max-width: 768px)").matches;
  var device =
    isMobile ? "mobile" : "desktop";

  document.documentElement.setAttribute("data-home-device", device);
  window.HEALTHBOY_HOME_DEVICE =
    device;
})();
