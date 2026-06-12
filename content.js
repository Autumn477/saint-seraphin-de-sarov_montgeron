/* Saint-Séraphim-de-Sarov — editable content loader
   Reads content/offices.json (managed by the priest via PagesCMS) and renders
   the weekly liturgical bulletin (PDF) under the "Programme de la semaine" title.
   Pure static: no build step. Works on GitHub Pages and any static host.
*/
(function () {
  'use strict';

  const LABELS = {
    fr: {
      open: 'Ouvrir le programme (PDF)',
      download: 'Télécharger',
      updated: 'Mis à jour le',
      empty: 'Le programme de la semaine sera publié prochainement.',
    },
    ru: {
      open: 'Открыть расписание (PDF)',
      download: 'Скачать',
      updated: 'Обновлено',
      empty: 'Расписание на неделю будет опубликовано в ближайшее время.',
    },
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderBulletin(host, weekly) {
    const lang = host.getAttribute('data-lang') === 'ru' ? 'ru' : 'fr';
    const L = LABELS[lang];

    const pdf = weekly && typeof weekly.pdf === 'string' ? weekly.pdf.trim() : '';
    if (!pdf) {
      host.innerHTML = '<p class="weekly-bulletin-empty">' + esc(L.empty) + '</p>';
      return;
    }

    const title = weekly.title ? esc(weekly.title) : '';
    const dateTxt = weekly.date ? esc(weekly.date) : '';
    const href = esc(pdf);

    let html = '<div class="weekly-bulletin-card">';
    if (title) html += '<div class="weekly-bulletin-title">' + title + '</div>';
    if (dateTxt) html += '<div class="weekly-bulletin-date">' + esc(L.updated) + ' ' + dateTxt + '</div>';
    html += '<div class="weekly-bulletin-actions">' +
      '<a class="btn btn-gold" href="' + href + '" target="_blank" rel="noopener">' + esc(L.open) + '</a>' +
      '<a class="weekly-bulletin-dl" href="' + href + '" download>' + esc(L.download) + '</a>' +
      '</div>';
    // Inline preview (best-effort; mobile browsers fall back to the buttons above)
    html += '<div class="weekly-bulletin-preview"><object data="' + href + '" type="application/pdf">' +
      '<a href="' + href + '" target="_blank" rel="noopener">' + esc(L.open) + '</a></object></div>';
    html += '</div>';
    host.innerHTML = html;
  }

  function renderBulletins() {
    const hosts = document.querySelectorAll('[data-weekly-bulletin]');
    if (!hosts.length) return;

    fetch('content/offices.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        const weekly = data && data.weekly ? data.weekly : null;
        hosts.forEach(function (h) { renderBulletin(h, weekly); });
      })
      .catch(function () { /* leave the static fallback message in place */ });
  }

  // ── Editable site content (managed via PagesCMS: content/site.json) ──
  // Any element carrying data-content="section.key" has its text replaced
  // by the matching value, IF that value is non-empty. The value already
  // present in the HTML is the fallback, so the site is correct even
  // without site.json or if a field is left blank.
  function getPath(obj, path) {
    return path.split('.').reduce(function (o, k) {
      return (o && o[k] != null) ? o[k] : undefined;
    }, obj);
  }

  function applySiteContent() {
    const nodes = document.querySelectorAll('[data-content]');
    if (!nodes.length) return;

    fetch('content/site.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data) return;
        nodes.forEach(function (el) {
          const val = getPath(data, el.getAttribute('data-content'));
          if (typeof val === 'string' && val.trim() !== '') {
            el.textContent = val;
          }
        });
      })
      .catch(function () { /* keep the static HTML fallback */ });
  }

  function init() {
    renderBulletins();
    applySiteContent();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
