(() => {
  const mobileQuery = window.matchMedia("(max-width: 768px)");

  const syncMobileBoardControls = () => {
    const shell = document.querySelector(".board-content-shell");
    const toolbar = shell?.querySelector(".board-toolbar");
    const pagination = shell?.querySelector(".pagination");
    const controls =
      shell?.querySelector(".board-bottom") ||
      toolbar?.querySelector(".board-bottom");

    if (!shell || !toolbar || !pagination || !controls) return;

    if (mobileQuery.matches) {
      if (controls.previousElementSibling !== pagination) {
        pagination.insertAdjacentElement("afterend", controls);
      }
      return;
    }

    if (controls.parentElement !== toolbar) {
      toolbar.appendChild(controls);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", syncMobileBoardControls, {
      once: true,
    });
  } else {
    syncMobileBoardControls();
  }

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", syncMobileBoardControls);
  } else {
    mobileQuery.addListener(syncMobileBoardControls);
  }

  window.addEventListener("pageshow", syncMobileBoardControls);
})();
