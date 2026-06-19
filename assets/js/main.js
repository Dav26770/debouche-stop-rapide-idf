/* ============================================================
   DÉBOUCHE STOP RAPIDE IDF — main.js (vanilla, zéro dépendance)
   header scroll · menu mobile · scroll progress · reveals ·
   marquee seamless · compteurs · boutons magnétiques · curseur lime
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ----- année ----- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ----- header compact au scroll + barre de progression ----- */
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

  /* ----- menu mobile ----- */
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
    $$('#mobile-menu a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  /* ----- smooth scroll ancres ----- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = $(id);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
    });
  });

  /* ----- scroll-reveal ----- */
  var revealEls = $$('.reveal, .reveal-x, .reveal-stagger');
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  } else {
    $$('.reveal-stagger').forEach(function (group) {
      Array.prototype.slice.call(group.children).forEach(function (c, i) {
        c.style.setProperty('--i', i);
      });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in-view'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ----- compteurs animés ----- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = target + suffix; return; }
    var dur = 1500, start = null;
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
        entries.forEach(function (en) {
          if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (c) { cio.observe(c); });
    }
  }

  /* ----- marquee seamless (duplique le contenu) ----- */
  $$('.marquee__track').forEach(function (track) {
    if (reduce) return;
    track.innerHTML += track.innerHTML;
    var speed = parseFloat(track.getAttribute('data-speed')) || 70;
    var w = track.scrollWidth / 2;
    track.style.animationDuration = (w / speed) + 's';
  });

  /* ----- boutons magnétiques ----- */
  if (!reduce && window.matchMedia('(pointer:fine)').matches) {
    $$('.btn-primary, .btn-call').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width / 2;
        var my = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + mx * 0.22 + 'px,' + (my * 0.3 - 3) + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });

    /* ----- halo lime sur le hero ----- */
    var hero = $('.hero');
    if (hero) {
      var glow = document.createElement('div');
      glow.className = 'hero-glow';
      hero.appendChild(glow);
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        glow.style.left = (e.clientX - r.left) + 'px';
        glow.style.top = (e.clientY - r.top) + 'px';
        glow.style.opacity = '1';
      });
      hero.addEventListener('mouseleave', function () { glow.style.opacity = '0'; });
    }

    /* ----- effet curseur sur les cartes ----- */
    $$('.card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }
})();
