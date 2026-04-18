/* Saint-Séraphim-de-Sarov — site enhancements (v2)
   - Theme toggle (jour/nuit) with localStorage
   - Hero variants cycling (accueil only)
   - Tweaks panel (edit mode integration)
*/
(function () {
  'use strict';

  const STORE_KEY = 'sssarov.settings.v1';

  // Defaults
  const DEFAULTS = /*EDITMODE-BEGIN*/{
    "theme": "day",
    "heroVariant": "v2"
  }/*EDITMODE-END*/;

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return { ...DEFAULTS };
      return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch { return { ...DEFAULTS }; }
  }
  function save(s) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch {}
  }

  const settings = load();

  // ── Theme ──────────────────────────────────────────────────
  function applyTheme(t) {
    document.body.classList.toggle('dark', t === 'night');
  }
  applyTheme(settings.theme);

  function setTheme(t) {
    settings.theme = t;
    applyTheme(t);
    save(settings);
    updateAllUI();
    notifyHost({ theme: t });
  }

  // Wire up any .theme-toggle buttons in the page
  function wireThemeToggles() {
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        setTheme(settings.theme === 'night' ? 'day' : 'night');
      });
    });
  }

  // ── Hero variants (accueil only) ──────────────────────────
  function applyHero(v) {
    const wrap = document.querySelector('[data-hero-wrap]');
    if (!wrap) return;
    wrap.querySelectorAll('[data-hero]').forEach(el => {
      el.style.display = el.dataset.hero === v ? '' : 'none';
    });
  }

  function setHero(v) {
    settings.heroVariant = v;
    applyHero(v);
    save(settings);
    updateAllUI();
    notifyHost({ heroVariant: v });
  }

  applyHero(settings.heroVariant);

  // ── Tweaks panel ───────────────────────────────────────────
  function buildTweaksPanel() {
    if (document.querySelector('.tweaks-panel')) return;

    const panel = document.createElement('div');
    panel.className = 'tweaks-panel';
    panel.innerHTML = `
      <div class="tweaks-panel-title">Tweaks</div>
      <div class="tweaks-panel-sub">Design options</div>

      <div class="tweaks-group">
        <span class="tweaks-group-label">Thème</span>
        <div class="tweaks-options">
          <button class="tweaks-opt" data-k="theme" data-v="day"><span class="dot"></span>Jour · pierre & or</button>
          <button class="tweaks-opt" data-k="theme" data-v="night"><span class="dot"></span>Nuit · bois sombre</button>
        </div>
      </div>
    `;

    panel.addEventListener('click', e => {
      const b = e.target.closest('.tweaks-opt');
      if (!b) return;
      const k = b.dataset.k;
      const v = b.dataset.v;
      if (k === 'theme') setTheme(v);
      else if (k === 'heroVariant') setHero(v);
    });

    document.body.appendChild(panel);

    // Toggle button
    const btn = document.createElement('button');
    btn.className = 'tweaks-toggle-btn';
    btn.setAttribute('aria-label', 'Tweaks');
    btn.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="1.5"/><path d="M8 1v3M8 12v3M1 8h3M12 8h3M3 3l2 2M11 11l2 2M3 13l2-2M11 5l2-2"/></svg>`;
    btn.addEventListener('click', () => {
      panel.classList.toggle('active');
    });
    document.body.appendChild(btn);

    // Click outside to close
    document.addEventListener('click', e => {
      if (!panel.classList.contains('active')) return;
      if (panel.contains(e.target) || btn.contains(e.target)) return;
      panel.classList.remove('active');
    });
  }

  function updateAllUI() {
    // Refresh all tweak-opt active states
    document.querySelectorAll('.tweaks-opt').forEach(b => {
      const k = b.dataset.k;
      const v = b.dataset.v;
      b.classList.toggle('on', settings[k] === v);
    });
  }

  // ── Host edit-mode integration ────────────────────────────
  function notifyHost(edits) {
    try {
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*');
    } catch {}
  }

  window.addEventListener('message', e => {
    const d = e.data;
    if (!d || typeof d !== 'object') return;
    if (d.type === '__activate_edit_mode') {
      document.querySelector('.tweaks-panel')?.classList.add('active');
    } else if (d.type === '__deactivate_edit_mode') {
      document.querySelector('.tweaks-panel')?.classList.remove('active');
    }
  });

  function init() {
    buildTweaksPanel();
    wireThemeToggles();
    updateAllUI();

    try {
      window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    } catch {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
