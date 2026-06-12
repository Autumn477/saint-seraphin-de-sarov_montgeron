/* Saint-Séraphim-de-Sarov — site enhancements (v2)
   - Theme toggle (jour/nuit) with localStorage
   - Hero variants cycling (accueil only)
   - Palette locked to "vert" (vert mosaique) — dev color switcher removed
*/
(function () {
  'use strict';

  const STORE_KEY = 'sssarov.settings.v3';

  // Palette is locked site-wide to "vert" (vert mosaique).
  const LOCKED_PALETTE = 'vert';

  // Defaults
  const DEFAULTS = /*EDITMODE-BEGIN*/{
    "theme": "day",
    "heroVariant": "v2",
    "palette": "vert"
  }/*EDITMODE-END*/;

  const PALETTES = [
    { id: 'vert',          label: 'Vert mosaique' },
    { id: 'vert-byzantin', label: 'Vert byzantin (olive)' },
    { id: 'vert-emeraude', label: 'Vert emeraude liturgique' },
    { id: 'vert-foret',    label: 'Vert foret profond' },
    { id: 'sauge',         label: 'Vert sauge & lin' },
  ];

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      const merged = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
      const allowed = new Set(PALETTES.map(p => p.id));
      if (!allowed.has(merged.palette)) merged.palette = DEFAULTS.palette;
      return merged;
    } catch { return { ...DEFAULTS }; }
  }
  function save(s) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch {}
  }

  const settings = load();
  // Force the locked palette regardless of any value persisted by older versions.
  settings.palette = LOCKED_PALETTE;

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

  // ── Palette (locked) ──────────────────────────────────────
  function applyPalette(p) {
    document.documentElement.setAttribute('data-palette', p);
  }
  applyPalette(LOCKED_PALETTE);

  // Remove any color switcher injected by a cached/older version of this script.
  function removePaletteSwitch() {
    document.querySelectorAll('.palette-select').forEach(el => el.remove());
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

  // Remove any leftover Tweaks UI from cached/older versions
  function removeLegacyTweaks() {
    document.querySelectorAll('.tweaks-panel, .tweaks-toggle-btn').forEach(el => el.remove());
  }

  function updateAllUI() {
    document.querySelectorAll('.tweaks-opt').forEach(b => {
      b.classList.toggle('on', settings[b.dataset.k] === b.dataset.v);
    });
  }

  // ── Host edit-mode integration ────────────────────────────
  function notifyHost(edits) {
    try {
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, window.location.origin);
    } catch {}
  }

  function setFooterYear() {
    const y = new Date().getFullYear();
    document.querySelectorAll('.fv2-year').forEach(el => { el.textContent = y; });
  }

  function init() {
    removeLegacyTweaks();
    removePaletteSwitch();
    wireThemeToggles();
    setFooterYear();
    updateAllUI();

    try {
      window.parent.postMessage({ type: '__edit_mode_available' }, window.location.origin);
    } catch {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
