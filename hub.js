// hub.js — shared behaviour for design-protos hub pages: search filter + thumbnail scaling.
(function () {
  var CARD_SEL = ".pcard, .doccard, .dtile, .feature, .card-link, .card-soon";

  // ── Search / filter ──────────────────────────────────────────────────────
  var q = document.getElementById("hubSearch");
  var empty = document.getElementById("searchEmpty");
  if (q) {
    var groups = [].slice.call(document.querySelectorAll("[data-group]"));
    q.addEventListener("input", function () {
      var t = q.value.trim().toLowerCase();
      var anyHit = false;
      groups.forEach(function (g) {
        var cards = [].slice.call(g.querySelectorAll(CARD_SEL));
        var any = false;
        cards.forEach(function (c) {
          var hit = !t || c.textContent.toLowerCase().indexOf(t) !== -1;
          c.style.display = hit ? "" : "none";
          if (hit) any = true;
        });
        g.style.display = (cards.length === 0 || any) ? "" : "none";
        if (any && cards.length) anyHit = true;
      });
      if (empty) empty.style.display = (t && !anyHit) ? "block" : "none";
    });
  }

  // ── Thumbnail scaling — fit each 1280px-wide iframe into its card ─────────
  function fit(box) {
    var f = box.querySelector("iframe");
    if (f && box.clientWidth) f.style.transform = "scale(" + (box.clientWidth / 1280) + ")";
  }
  var thumbs = [].slice.call(document.querySelectorAll(".pthumb"));
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(function (entries) {
      entries.forEach(function (e) { fit(e.target); });
    });
    thumbs.forEach(function (b) { ro.observe(b); });
  } else {
    var fitAll = function () { thumbs.forEach(fit); };
    window.addEventListener("resize", fitAll);
    window.addEventListener("load", fitAll);
    fitAll();
  }
})();
