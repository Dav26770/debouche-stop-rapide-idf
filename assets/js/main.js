/* ============================================================
   DÉBOUCHE STOP RAPIDE IDF — main.js (vanilla, zéro dépendance)
   Élégant & sobre : header · menu mobile · fondus doux · compteurs · marquee lente
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* année */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ----- barre utilitaire élégante (injectée, toutes pages) ----- */
  var hdr = $('.site-header');
  if (hdr && !$('.topbar', hdr)) {
    var bar = document.createElement('div');
    bar.className = 'topbar';
    bar.innerHTML = '<div class="container topbar__in">' +
      '<span class="topbar__l"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> <b>Intervention d’urgence 24h/24 · 7j/7</b> &nbsp;en Île-de-France</span>' +
      '<span class="topbar__r"><a href="contact.html">Devis gratuit avant intervention</a><span class="topbar__sep"></span><a class="topbar__tel" href="tel:0651306505">06 51 30 65 05</a></span>' +
      '</div>';
    hdr.insertBefore(bar, hdr.firstChild);
  }

  /* ----- blason doré (remplace l\'ancien logo sur header + footer) ----- */
  var crest = '<circle cx="32" cy="32" r="30" fill="#23382E" stroke="#A8823C" stroke-width="1.6"/>' +
    '<circle cx="32" cy="32" r="24.5" fill="none" stroke="#A8823C" stroke-width="0.8" opacity="0.5"/>' +
    '<path d="M32 17c0 0 11 12.5 11 20a11 11 0 0 1-22 0c0-7.5 11-20 11-20z" fill="#A8823C"/>' +
    '<path d="M27.5 38.5a4.5 4.5 0 0 0 4.5 4.5" fill="none" stroke="#23382E" stroke-width="1.4" stroke-linecap="round" opacity="0.85"/>' +
    '<circle cx="32" cy="7.6" r="1.3" fill="#A8823C"/><circle cx="32" cy="56.4" r="1.3" fill="#A8823C"/>';
  $$('.brand__mark').forEach(function (svg) { svg.setAttribute('viewBox', '0 0 64 64'); svg.innerHTML = crest; });

  /* ----- signature sous le nom de marque ----- */
  $$('.brand > span').forEach(function (s) {
    if (s.dataset.enh) return; s.dataset.enh = '1';
    var name = document.createElement('span'); name.className = 'brand__name'; name.innerHTML = s.innerHTML;
    var tag = document.createElement('small'); tag.className = 'brand__tag'; tag.textContent = 'Assainissement · Paris & Île-de-France';
    s.innerHTML = ''; s.appendChild(name); s.appendChild(tag); s.classList.add('brand--stacked');
  });

  /* header compact + barre de progression (fine, or) */
  var header = $('.site-header');
  var prog = document.createElement('div');
  prog.className = 'scroll-progress';
  document.body.appendChild(prog);
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('scrolled', y > 40);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* menu mobile */
  var toggle = $('.nav__toggle');
  var menu = $('#mobile-menu');
  if (toggle && menu) {
    var setMenu = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    $$('#mobile-menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* smooth scroll ancres */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = $(id);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
    });
  });

  /* fondus doux au scroll */
  var revealEls = $$('.reveal, .reveal-x, .reveal-stagger');
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  } else {
    $$('.reveal-stagger').forEach(function (group) {
      Array.prototype.slice.call(group.children).forEach(function (c, i) { c.style.setProperty('--i', i); });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in-view'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* compteurs animés */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = target + suffix; return; }
    var dur = 1600, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$('[data-count]');
  if (counters.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      counters.forEach(animateCount);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); } });
      }, { threshold: 0.5 });
      counters.forEach(function (c) { cio.observe(c); });
    }
  }

  /* marquee lente et continue */
  $$('.marquee__track').forEach(function (track) {
    if (reduce) return;
    track.innerHTML += track.innerHTML;
    var speed = parseFloat(track.getAttribute('data-speed')) || 38;
    var w = track.scrollWidth / 2;
    track.style.animationDuration = (w / speed) + 's';
  });
})();
