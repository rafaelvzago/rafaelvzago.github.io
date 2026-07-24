(function () {
  var btn = document.querySelector(".back-to-top");
  if (!btn) {
    return;
  }

  var threshold = 400;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function update() {
    var y = window.scrollY || document.documentElement.scrollTop;
    btn.classList.toggle("is-visible", y > threshold);
  }

  function goTop() {
    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  btn.addEventListener("click", goTop);
  window.addEventListener("scroll", update, { passive: true });
  update();
})();
