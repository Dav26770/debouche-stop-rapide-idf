/* =====================================================================
   DÉBOUCHE STOP RAPIDE IDF — main.js (vanilla, sans dépendance)
   Menu mobile · header scroll · sticky call bar · scroll-reveal ·
   parallax hero · compteurs animés · marquee kinétique · micro-interactions
   ===================================================================== */
(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Menu mobile ---------- */
  (function () {
    var toggle = document.querySelector(".nav__toggle");
    var menu = document.getElementById("mobile-menu");
    if (!toggle || !menu) return;
    function close() {
      toggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("open");
      document.body.style.overflow = "";
    }
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.classList.toggle("open", !open);
      document.body.style.overflow = !open ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { close(); toggle.focus(); }
    });
  })();

  /* ---------- Header scroll state + sticky call bar ---------- */
  (function () {
    var header = document.querySelector(".site-header");
    var callbar = document.querySelector(".callbar");
    var lastY = 0, ticking = false;
    function update() {
      var y = window.pageYOffset;
      if (header) header.classList.toggle("scrolled", y > 20);
      if (callbar) callbar.classList.toggle("show", y > 460);
      lastY = y; ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  })();

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  (function () {
    var els = document.querySelectorAll(".reveal, .reveal-x, .reveal-stagger");
    if (!els.length) return;
    if (REDUCED || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in-view"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("in-view"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- Parallax hero (rAF) ---------- */
  (function () {
    if (REDUCED) return;
    var img = document.querySelector(".hero__media img");
    if (!img) return;
    var ticking = false;
    function move() {
      var y = window.pageYOffset;
      if (y < window.innerHeight * 1.3) {
        img.style.transform = "translate3d(0," + (y * 0.16).toFixed(1) + "px,0)";
      }
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { window.requestAnimationFrame(move); ticking = true; }
    }, { passive: true });
  })();

  /* ---------- Animated counters ---------- */
  (function () {
    var nums = document.querySelectorAll("[data-count]");
    if (!nums.length) return;
    function run(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var decimals = (String(target).split(".")[1] || "").length;
      if (REDUCED) { el.textContent = target.toLocaleString("fr-FR") + suffix; return; }
      var start = null, dur = 1500;
      function tick(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = (target * eased);
        el.textContent = (decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString("fr-FR")) + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = (decimals ? target.toFixed(decimals) : target.toLocaleString("fr-FR")) + suffix;
      }
      requestAnimationFrame(tick);
    }
    if (!("IntersectionObserver" in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  })();

  /* ---------- Kinetic marquee (signature : vitesse) ---------- */
  (function () {
    var tracks = document.querySelectorAll(".marquee__track");
    if (!tracks.length) return;
    tracks.forEach(function (track) {
      // duplique le contenu pour une boucle continue
      var html = track.innerHTML;
      track.innerHTML = html + html;
      if (REDUCED) return;
      var speed = parseFloat(track.getAttribute("data-speed")) || 60; // px/s
      var dir = track.getAttribute("data-dir") === "right" ? 1 : -1;
      var offset = 0, last = null, half = 0, paused = false;
      function measure() { half = track.scrollWidth / 2; }
      measure();
      window.addEventListener("resize", measure);
      track.parentElement.addEventListener("mouseenter", function () { paused = true; });
      track.parentElement.addEventListener("mouseleave", function () { paused = false; });
      function step(ts) {
        if (last === null) last = ts;
        var dt = (ts - last) / 1000; last = ts;
        if (!paused && half) {
          offset += dir * speed * dt;
          if (offset <= -half) offset += half;
          if (offset >= 0) offset -= half;
          track.style.transform = "translate3d(" + offset.toFixed(1) + "px,0,0)";
        }
        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  })();

  /* ---------- Micro-interaction : tilt léger sur cartes ---------- */
  (function () {
    if (REDUCED || window.matchMedia("(hover: none)").matches) return;
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -5;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * 5;
        el.style.transform = "perspective(700px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) translateY(-6px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  })();

  /* ---------- Année dynamique (fallback, défaut 2026) ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = "2026"; });
})();
