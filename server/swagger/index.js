function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((_mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

// Force change the Swagger logo in the header
waitForElm(".topbar-wrapper").then((elm) => {
  elm.innerHTML = `<img href='${window.location.origin}' src='${window.location.origin}/api/system/logo' width='150'/>`;
});
