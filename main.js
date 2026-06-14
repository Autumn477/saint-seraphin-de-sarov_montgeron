/* ============================================================
   Saint-Séraphim-de-Sarov — Main JS
   Mobile nav, scroll reveals, parallax, lightbox, progress bar
   ============================================================ */

(function () {
  'use strict';

  // ── Prechargeur : tracage de la silhouette de l'eglise ───────
  // La silhouette (assets/church-silhouette.svg) se dessine au trait
  // dore puis se remplit en vert. Croix orthodoxe en secours si le
  // SVG ne charge pas. Injecte ici -> toutes les pages FR + RU.
  (function initLoader() {
    // Affichage UNE FOIS PAR SESSION : animation complete a la 1re arrivee,
    // navigation instantanee ensuite (le drapeau survit aux rechargements
    // du meme onglet, se reinitialise a la fermeture de l'onglet).
    try {
      if (sessionStorage.getItem('ssp_loaded')) return;
      sessionStorage.setItem('ssp_loaded', '1');
    } catch (e) { /* sessionStorage indispo : on affiche quand meme */ }

    var loader = document.createElement('div');
    loader.className = 'site-loader';
    loader.setAttribute('role', 'status');
    loader.setAttribute('aria-label', 'Chargement du site');
    loader.innerHTML =
      '<div class="site-loader-inner">' +
        '<div class="site-loader-art-wrap"></div>' +
        '<div class="site-loader-name">Saint-Séraphim-de-Sarov</div>' +
        '<div class="site-loader-sub">Paroisse orthodoxe · Montgeron</div>' +
      '</div>';
    document.body.prepend(loader);

    var wrap = loader.querySelector('.site-loader-art-wrap');
    var prefersReduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Tracage : on fige d'abord l'etat "non dessine" SANS transition,
    // on force un reflow, puis on relance la transition vers dashoffset 0.
    function drawPaths(paths, stagger) {
      paths.forEach(function (p) {
        var len = p.getTotalLength();
        p.style.transition = 'none';
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
      });
      loader.getBoundingClientRect(); // reflow : fige l'etat initial
      requestAnimationFrame(function () {
        paths.forEach(function (p, i) {
          p.style.transition = '';                       // reprend la duree du CSS
          p.style.transitionDelay = (0.1 + i * stagger) + 's';
          p.style.strokeDashoffset = '0';                // -> le trait se dessine
        });
      });
    }

    // Croix orthodoxe — secours si la silhouette ne charge pas
    function injectCross() {
      wrap.innerHTML =
        '<svg class="site-loader-cross" viewBox="0 0 60 84" aria-hidden="true">' +
          '<path d="M30 4 L30 80"/><path d="M16 11.5 L44 11.5"/>' +
          '<path d="M6 32 L54 32"/><path d="M14 64 L46 70"/>' +
        '</svg>';
      if (!prefersReduced) drawPaths(wrap.querySelectorAll('path'), 0.3);
    }

    // Silhouette de l'eglise
    fetch('assets/church-silhouette.svg')
      .then(function (r) { if (!r.ok) throw new Error('http'); return r.text(); })
      .then(function (txt) {
        wrap.innerHTML = txt;
        var svg = wrap.querySelector('svg');
        if (!svg) throw new Error('no svg');
        svg.classList.add('site-loader-art');
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        svg.setAttribute('aria-hidden', 'true');
        var paths = svg.querySelectorAll('path');
        if (prefersReduced) return; // contour affiche statiquement (pas de trace)
        drawPaths(paths, 0.28); // trace sequentiel cinematique (decalage 0.28s/trait)
      })
      .catch(injectCross);

    var start = (window.performance && performance.now) ? performance.now() : 0;
    var minVisible = prefersReduced ? 300 : 4600;
    var hidden = false;

    function hideLoader() {
      if (hidden) return;
      hidden = true;
      loader.classList.add('is-hidden');
      setTimeout(function () {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 800);
    }

    function scheduleHide() {
      var elapsed = ((window.performance && performance.now) ? performance.now() : 0) - start;
      setTimeout(hideLoader, Math.max(0, minVisible - elapsed));
    }

    if (document.readyState === 'complete') scheduleHide();
    else window.addEventListener('load', scheduleHide);
    setTimeout(hideLoader, 7000); // failsafe : ne jamais rester bloque
  })();

  // ── Scroll progress bar ──────────────────────────────────────
  var progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.prepend(progressBar);

  function updateProgress() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  // ── Nav scroll state (backdrop blur) ─────────────────────────
  var nav = document.querySelector('nav');

  function updateNavState() {
    if (!nav) return;
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  // ── Hero parallax ────────────────────────────────────────────
  var heroBg = document.querySelector('.hero-bg');

  function updateParallax() {
    if (!heroBg) return;
    var scrollTop = window.scrollY;
    var heroHeight = heroBg.parentElement.offsetHeight;
    if (scrollTop < heroHeight) {
      heroBg.style.transform = 'translateY(' + (scrollTop * 0.3) + 'px) scale(1.03)';
    }
  }

  // ── Scroll event (throttled via rAF) ─────────────────────────
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        updateProgress();
        updateNavState();
        updateParallax();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Init on load
  updateProgress();
  updateNavState();

  // ── Mobile nav toggle (animated hamburger) ───────────────────
  var toggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── Scroll reveal (IntersectionObserver) ─────────────────────
  function initReveal() {
    var targets = document.querySelectorAll('.section, .card, .timeline-item, .bank-box, .contact-grid, .gallery, .prose, .donate-hero, .page-header, .banner, .histoire-showcase, .histoire-split, .histoire-cinematic, .tl, .tl-event, .tl-center, .tl-center-event, .quote-section');

    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    targets.forEach(function (el) {
      if (!el.classList.contains('reveal') &&
          !el.classList.contains('reveal-left') &&
          !el.classList.contains('reveal-right') &&
          !el.classList.contains('histoire-showcase') &&
          !el.classList.contains('tl') &&
          !el.classList.contains('tl-event') &&
          !el.classList.contains('tl-center') &&
          !el.classList.contains('tl-center-event') &&
          !el.classList.contains('histoire-split') &&
          !el.classList.contains('histoire-cinematic') &&
          !el.classList.contains('quote-section')) {
        el.classList.add('reveal');
      }
    });

    // Cards get stagger on their parent grid
    document.querySelectorAll('.card-grid').forEach(function (grid) {
      grid.classList.add('reveal-stagger');
      grid.classList.remove('reveal');
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    var revealSel = '.reveal, .reveal-left, .reveal-right, .reveal-stagger, .tl, .tl-event, .tl-center, .tl-center-event, .histoire-showcase, .histoire-split, .histoire-cinematic, .quote-section';
    document.querySelectorAll(revealSel).forEach(function (el) {
      // If element is already above or within the viewport at page load
      // (e.g. after a refresh on a scrolled page), mark it visible immediately
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 40) {
        el.classList.add('visible');
      } else {
        observer.observe(el);
      }
    });

    // Failsafe: never leave content stuck at opacity:0 if the observer
    // misfires (e.g. some mobile browsers, restored scroll, layout shifts).
    function revealAll() {
      document.querySelectorAll(revealSel).forEach(function (el) {
        el.classList.add('visible');
      });
    }
    window.addEventListener('load', function () { setTimeout(revealAll, 1200); });
    setTimeout(revealAll, 2500);
  }

  initReveal();

  // ── Animate stat numbers ──────────────────────────────────────
  document.querySelectorAll('.histoire-split-stat-num').forEach(function(el) {
    var text = el.textContent;
    var num = parseInt(text);
    if (isNaN(num)) return;
    var suffix = text.replace(num, '');
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var start = 0;
          var duration = 1500;
          var startTime = null;
          function animate(time) {
            if (!startTime) startTime = time;
            var progress = Math.min((time - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * num) + suffix;
            if (progress < 1) requestAnimationFrame(animate);
          }
          requestAnimationFrame(animate);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(el);
  });

  // ── Animate progress bar (donation page) ─────────────────────
  var fill = document.querySelector('.progress-fill');
  if (fill) {
    var target = fill.dataset.percent || '0';
    fill.style.width = '0%';
    setTimeout(function () {
      fill.style.width = target + '%';
    }, 600);
  }

  // ── Smooth scroll for anchor links ────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var el = document.querySelector(a.getAttribute('href'));
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Copy bank details ─────────────────────────────────────────
  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.dataset.copy;
      if (!text || text.includes('[')) return;
      navigator.clipboard.writeText(text).then(function () {
        var orig = btn.textContent;
        btn.textContent = '\u2713';
        btn.style.color = '#4CAF50';
        setTimeout(function () {
          btn.textContent = orig;
          btn.style.color = '';
        }, 1500);
      });
    });
  });

  // ── Gallery lightbox ──────────────────────────────────────────
  function initLightbox() {
    var images = document.querySelectorAll('.gallery-item img');
    if (!images.length) return;

    // Create overlay
    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = '<button class="lightbox-close" aria-label="Fermer">&times;</button><img src="" alt=""/><div class="lightbox-caption"></div>';
    document.body.appendChild(overlay);

    var lbImg = overlay.querySelector('img');
    var lbCaption = overlay.querySelector('.lightbox-caption');
    var lbClose = overlay.querySelector('.lightbox-close');

    function openLightbox(src, alt) {
      lbImg.src = src;
      lbImg.alt = alt;
      lbCaption.textContent = alt;
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    images.forEach(function (img) {
      img.addEventListener('click', function () {
        openLightbox(img.src, img.alt);
      });
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target === lbClose) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  initLightbox();

  // ── Back to top button ────────────────────────────────────────
  var backBtn = document.querySelector('.back-to-top');
  if (backBtn) {
    function updateBackToTop() {
      if (window.scrollY > 400) {
        backBtn.classList.add('visible');
      } else {
        backBtn.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', updateBackToTop, { passive: true });
    updateBackToTop();

    backBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
