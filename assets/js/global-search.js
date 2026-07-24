(function () {
  function isTypingTarget(el) {
    if (!el) {
      return false;
    }
    var tag = el.tagName;
    return (
      el.isContentEditable ||
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT"
    );
  }

  function goToSearch() {
    if (document.querySelector("[data-search-root]")) {
      return false;
    }
    var url = document.body && document.body.dataset.searchUrl;
    if (!url) {
      return false;
    }
    window.location.href = url;
    return true;
  }

  document.addEventListener("keydown", function (event) {
    if (event.defaultPrevented || isTypingTarget(document.activeElement)) {
      return;
    }

    var slash = event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey;
    var modK =
      (event.key === "k" || event.key === "K") &&
      (event.ctrlKey || event.metaKey) &&
      !event.altKey;

    if (!slash && !modK) {
      return;
    }

    if (goToSearch()) {
      event.preventDefault();
    }
  });
})();
