/* ============================================================
   Saint-Séraphim-de-Sarov — Main JS
   Mobile nav, scroll reveals, parallax, lightbox, progress bar
   ============================================================ */

(function () {
  'use strict';

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

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-stagger, .tl, .tl-event, .tl-center, .tl-center-event, .histoire-showcase, .histoire-split, .histoire-cinematic, .quote-section').forEach(function (el) {
      observer.observe(el);
    });
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
