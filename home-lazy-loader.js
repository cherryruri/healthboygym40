(function(){
  var currentScript =
    document.currentScript;
  var authSrc =
    currentScript ? currentScript.getAttribute("data-auth-src") : "";
  var newsSrc =
    currentScript ? currentScript.getAttribute("data-news-src") : "";
  var authPromise =
    null;
  var newsPromise =
    null;

  function resolveUrl(src){
    return new URL(src, document.baseURI).href;
  }

  function loadModule(src, stateName){
    if(!src) return Promise.resolve();

    document.documentElement.setAttribute(stateName, "loading");

    return import(resolveUrl(src))
      .then(function(module){
        document.documentElement.setAttribute(stateName, "ready");
        return module;
      })
      .catch(function(error){
        document.documentElement.setAttribute(stateName, "error");
        console.error(error);
      });
  }

  function loadAuth(){
    if(!authPromise){
      authPromise =
        loadModule(authSrc, "data-home-auth-module");
    }

    return authPromise;
  }

  function loadNews(){
    if(!newsPromise){
      newsPromise =
        loadModule(newsSrc, "data-home-news-module");
    }

    return newsPromise;
  }

  function onIdle(callback, timeout){
    if("requestIdleCallback" in window){
      window.requestIdleCallback(callback, {timeout:timeout});
      return;
    }

    window.setTimeout(callback, Math.min(timeout, 3200));
  }

  function watchNewsSection(){
    var section =
      document.querySelector("#newsHub");

    if(!section){
      onIdle(loadNews, 5200);
      return;
    }

    if(!("IntersectionObserver" in window)){
      onIdle(loadNews, 5200);
      return;
    }

    var observer =
      new IntersectionObserver(function(entries){
        if(!entries.some(function(entry){ return entry.isIntersecting; })) return;

        observer.disconnect();
        loadNews();
      }, {
        root:null,
        rootMargin:"1100px 0px",
        threshold:0
      });

    observer.observe(section);
  }

  document.addEventListener("click", function(event){
    if(!event.target.closest(".mobile-menu-btn, #loginLink, #logoutBtn, #mypageBtn, #mobileLoginLink, #mobileLogoutBtn, #mobileProfileName, #mobileProfileDelete, #mobileProfileInput")) return;

    loadAuth();
  }, {capture:true});

  document.addEventListener("pointerdown", function(event){
    if(!event.target.closest(".mobile-menu-btn")) return;

    loadAuth();
  }, {capture:true, passive:true});

  document.addEventListener("change", function(event){
    if(!event.target.closest("#mobileProfileInput")) return;

    loadAuth();
  }, {capture:true});

  window.setTimeout(function(){
    onIdle(loadAuth, 3000);
  }, 6000);

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", watchNewsSection, {once:true});
  }else{
    watchNewsSection();
  }
})();
