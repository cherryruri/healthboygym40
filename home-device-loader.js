(function(){
  var isMobile =
    window.matchMedia &&
    window.matchMedia("(max-width: 768px)").matches;
  var device =
    isMobile ? "mobile" : "desktop";
  var currentScript =
    document.currentScript;
  var assetVersion =
    "20260709-review-gray-flow";

  document.documentElement.setAttribute("data-home-device", device);
  window.HEALTHBOY_HOME_DEVICE =
    device;

  function getAttr(name){
    return currentScript
      ? currentScript.getAttribute(name)
      : "";
  }

  function withAssetVersion(url){
    if(!url) return "";
    return url + (url.indexOf("?") === -1 ? "?" : "&") + "hbv=" + assetVersion;
  }

  function escapeAttr(value){
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function loadStyle(href){
    if(!href) return;

    if(document.readyState === "loading"){
      document.write('<link rel="stylesheet" href="' + escapeAttr(href) + '">');
      return;
    }

    var link =
      document.createElement("link");

    link.rel =
      "stylesheet";
    link.href =
      href;
    document.head.appendChild(link);
  }

  function loadScript(src){
    if(!src) return;

    if(document.readyState === "loading"){
      document.write('<script src="' + escapeAttr(src) + '"><\/script>');
      return;
    }

    var script =
      document.createElement("script");

    script.src =
      src;
    script.async =
      false;
    document.head.appendChild(script);
  }

  loadStyle(
    withAssetVersion(
      getAttr(device === "mobile" ? "data-mobile-css" : "data-desktop-css")
    )
  );

  loadScript(
    withAssetVersion(
      getAttr(device === "mobile" ? "data-mobile-js" : "data-desktop-js")
    )
  );
})();
