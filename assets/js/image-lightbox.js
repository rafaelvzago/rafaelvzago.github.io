(function () {
  function labels() {
    var body = document.body;
    return {
      close: (body && body.dataset.lightboxClose) || "Close",
      dialog: (body && body.dataset.lightboxDialog) || "Expanded image",
    };
  }

  function ensureDialog() {
    var existing = document.getElementById("image-lightbox");
    if (existing) {
      return existing;
    }

    var t = labels();
    var dialog = document.createElement("dialog");
    dialog.id = "image-lightbox";
    dialog.className = "image-lightbox";
    dialog.setAttribute("aria-label", t.dialog);

    var close = document.createElement("button");
    close.type = "button";
    close.className = "image-lightbox__close";
    close.setAttribute("aria-label", t.close);
    close.textContent = "×";

    var img = document.createElement("img");
    img.className = "image-lightbox__img";
    img.alt = "";
    img.dataset.lightboxSkip = "1";

    dialog.appendChild(close);
    dialog.appendChild(img);
    document.body.appendChild(dialog);

    close.addEventListener("click", function () {
      dialog.close();
    });

    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) {
        dialog.close();
      }
    });

    dialog.addEventListener("close", function () {
      img.removeAttribute("src");
      img.alt = "";
    });

    return dialog;
  }

  function openLightbox(src, alt) {
    var dialog = ensureDialog();
    var img = dialog.querySelector(".image-lightbox__img");
    img.src = src;
    img.alt = alt || "";
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      window.open(src, "_blank", "noopener");
    }
  }

  function bindAnchor(anchor) {
    if (anchor.dataset.lightboxBound) {
      return;
    }
    anchor.dataset.lightboxBound = "1";
    anchor.addEventListener("click", function (event) {
      var img = anchor.querySelector("img");
      var src = anchor.getAttribute("href") || (img && img.currentSrc) || (img && img.src);
      if (!src) {
        return;
      }
      event.preventDefault();
      openLightbox(src, (img && img.alt) || "");
    });
  }

  function wrapBareImage(img) {
    if (
      img.dataset.lightboxSkip === "1" ||
      img.closest("a.img-lightbox") ||
      img.closest("#image-lightbox") ||
      img.closest("a.soc")
    ) {
      return;
    }
    var src = img.currentSrc || img.src;
    if (!src) {
      return;
    }
    var anchor = document.createElement("a");
    anchor.href = src;
    anchor.className = "img-lightbox";
    anchor.setAttribute("data-lightbox", "");
    img.parentNode.insertBefore(anchor, img);
    anchor.appendChild(img);
    bindAnchor(anchor);
  }

  function init() {
    document.querySelectorAll("a.img-lightbox[data-lightbox]").forEach(bindAnchor);
    document.querySelectorAll("img").forEach(wrapBareImage);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
