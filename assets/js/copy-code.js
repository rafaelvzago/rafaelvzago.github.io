(function () {
  function labels() {
    var body = document.body;
    return {
      copy: (body && body.dataset.copyLabel) || "Copy",
      copied: (body && body.dataset.copiedLabel) || "Copied!",
      aria: (body && body.dataset.copyAria) || "Copy code",
    };
  }

  function getCodeText(pre) {
    var code = pre.querySelector("code");
    return (code || pre).innerText.replace(/\n$/, "");
  }

  function wrapHighlight(pre) {
    var parent = pre.parentElement;
    if (parent && parent.classList.contains("highlight")) {
      return parent;
    }
    var wrap = document.createElement("div");
    wrap.className = "highlight code-block";
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);
    return wrap;
  }

  function addCopyButton(pre) {
    if (pre.dataset.copyBound) {
      return;
    }
    pre.dataset.copyBound = "1";

    var host = wrapHighlight(pre);
    host.classList.add("has-copy");
    var t = labels();

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-code-btn";
    btn.textContent = t.copy;
    btn.setAttribute("aria-label", t.aria);

    btn.addEventListener("click", function () {
      var text = getCodeText(pre);
      var done = function () {
        btn.textContent = t.copied;
        btn.classList.add("is-copied");
        window.setTimeout(function () {
          btn.textContent = t.copy;
          btn.classList.remove("is-copied");
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {
          fallbackCopy(text, done);
        });
      } else {
        fallbackCopy(text, done);
      }
    });

    host.appendChild(btn);
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      done();
    } finally {
      document.body.removeChild(ta);
    }
  }

  function init() {
    document.querySelectorAll("pre").forEach(addCopyButton);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
