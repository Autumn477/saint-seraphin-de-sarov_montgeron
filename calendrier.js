/* ============================================================
   Saint-Séraphim-de-Sarov — Calendrier orthodoxe (ancien style / julien)
   Carêmes + grandes fêtes, recalculés automatiquement chaque année.
   Bilingue : la langue est lue sur <html lang="fr|ru">.
   ============================================================ */
(function () {
  'use strict';

  // ── Pâque orthodoxe (Paschalion julien) -> date civile (grégorienne) ──
  function paschaGregorian(year) {
    var a = year % 4, b = year % 7, c = year % 19;
    var d = (19 * c + 15) % 30;
    var e = (2 * a + 4 * b - d + 34) % 7;
    var month = Math.floor((d + e + 114) / 31);      // 3 = mars, 4 = avril
    var day = ((d + e + 114) % 31) + 1;
    var off = Math.floor(year / 100) - Math.floor(year / 400) - 2; // julien -> grégorien (13j en 1900-2099)
    var dt = new Date(Date.UTC(year, month - 1, day));
    dt.setUTCDate(dt.getUTCDate() + off);
    return dt;
  }
  function addDays(dt, n) { var x = new Date(dt.getTime()); x.setUTCDate(x.getUTCDate() + n); return x; }
  function gd(year, m, day) { return new Date(Date.UTC(year, m - 1, day)); } // fête fixe (date civile constante)
  function dayCount(a, b) { return Math.round((b - a) / 86400000) + 1; }

  // ── Données calculées pour une année ──────────────────────────
  function calendar(year) {
    var p = paschaGregorian(year);
    var palm = addDays(p, -7), ascension = addDays(p, 39), pentecost = addDays(p, 49);

    var fasts = [
      { key: 'great',     start: addDays(p, -48), end: addDays(p, -1) },     // Grand Carême + Semaine Sainte
      { key: 'apostles',  start: addDays(p, 57),  end: gd(year, 7, 11) },    // jusqu'à la veille des sts Pierre et Paul
      { key: 'dormition', start: gd(year, 8, 14), end: gd(year, 8, 27) },    // 14-27 août
      { key: 'nativity',  start: gd(year, 11, 28), end: gd(year + 1, 1, 6) } // Avent orthodoxe
    ];

    var feasts = [
      { key: 'nativityTheotokos', date: gd(year, 9, 21) },
      { key: 'crossExaltation',   date: gd(year, 9, 27) },
      { key: 'entryTheotokos',    date: gd(year, 12, 4) },
      { key: 'nativityChrist',    date: gd(year, 1, 7) },
      { key: 'theophany',         date: gd(year, 1, 19) },
      { key: 'meeting',           date: gd(year, 2, 15) },
      { key: 'palmSunday',        date: palm,            movable: true },
      { key: 'annunciation',      date: gd(year, 4, 7) },
      { key: 'ascension',         date: ascension,       movable: true },
      { key: 'pentecost',         date: pentecost,       movable: true },
      { key: 'transfiguration',   date: gd(year, 8, 19) },
      { key: 'dormition',         date: gd(year, 8, 28) }
    ].sort(function (x, y) { return x.date - y.date; });

    var patronal = [
      { key: 'seraphimRepose', date: gd(year, 1, 15) },
      { key: 'seraphimRelics', date: gd(year, 8, 1) }
    ];

    return { year: year, pascha: p, fasts: fasts, feasts: feasts, patronal: patronal };
  }

  // ── Libellés FR / RU ──────────────────────────────────────────
  var MONTHS = {
    fr: ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],
    ru: ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
  };
  var WEEKDAYS = {
    fr: ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'],
    ru: ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота']
  };
  var L = {
    fr: {
      eyebrow: 'Ancien style · calendrier julien',
      title: 'Calendrier <em>orthodoxe</em>',
      subtitle: 'Carêmes et grandes fêtes, mis à jour automatiquement chaque année.',
      current: 'année en cours',
      paschaLabel: 'Pâques — Sainte Résurrection du Christ',
      upcoming: 'Prochaine grande fête',
      fastsTitle: 'Les quatre Carêmes',
      feastsTitle: 'Les douze Grandes Fêtes',
      patronalTitle: 'Saint Séraphim de Sarov — fêtes patronales',
      movable: 'mobile', days: 'jours', from: 'du', to: 'au',
      note: 'Calendrier julien (ancien style) de la tradition russe. Les dates sont indiquées dans le calendrier civil et se recalculent automatiquement chaque année à partir de la date de Pâques. Les fêtes signalées « mobiles » dépendent de la date de Pâques.',
      fasts: {
        great: 'Grand Carême', apostles: 'Carême des Apôtres',
        dormition: 'Carême de la Dormition', nativity: 'Carême de la Nativité'
      },
      fastNotes: {
        great: 'Du Lundi pur à la Résurrection (Semaine Sainte incluse).',
        apostles: 'De la Toussaint orthodoxe à la veille des saints Pierre et Paul.',
        dormition: 'Les deux semaines précédant la Dormition de la Mère de Dieu.',
        nativity: 'L’Avent orthodoxe, avant la Nativité du Christ.'
      },
      feasts: {
        nativityTheotokos: 'Nativité de la Mère de Dieu', crossExaltation: 'Exaltation de la Sainte Croix',
        entryTheotokos: 'Entrée au Temple de la Mère de Dieu', nativityChrist: 'Nativité du Christ (Noël)',
        theophany: 'Théophanie (Baptême du Seigneur)', meeting: 'Présentation du Seigneur (Rencontre)',
        palmSunday: 'Entrée à Jérusalem (Rameaux)', annunciation: 'Annonciation',
        ascension: 'Ascension du Seigneur', pentecost: 'Pentecôte (Sainte Trinité)',
        transfiguration: 'Transfiguration du Seigneur', dormition: 'Dormition de la Mère de Dieu'
      },
      patronal: {
        seraphimRepose: 'Saint Séraphim de Sarov — sa dormition',
        seraphimRelics: 'Saint Séraphim de Sarov — translation des reliques'
      }
    },
    ru: {
      eyebrow: 'Старый стиль · юлианский календарь',
      title: 'Православный <em>календарь</em>',
      subtitle: 'Посты и великие праздники, обновляются автоматически каждый год.',
      current: 'текущий год',
      paschaLabel: 'Пасха — Светлое Христово Воскресение',
      upcoming: 'Ближайший великий праздник',
      fastsTitle: 'Четыре поста',
      feastsTitle: 'Двунадесятые праздники',
      patronalTitle: 'Преподобный Серафим Саровский — престольные праздники',
      movable: 'переходящий', days: 'дней', from: 'с', to: 'по',
      note: 'Юлианский календарь (старый стиль) русской традиции. Даты приведены по гражданскому календарю и пересчитываются автоматически каждый год от даты Пасхи. Праздники, отмеченные «переходящий», зависят от даты Пасхи.',
      fasts: {
        great: 'Великий пост', apostles: 'Петров пост',
        dormition: 'Успенский пост', nativity: 'Рождественский пост'
      },
      fastNotes: {
        great: 'От Чистого понедельника до Воскресения (включая Страстную седмицу).',
        apostles: 'От недели Всех святых до кануна святых Петра и Павла.',
        dormition: 'Две недели перед Успением Пресвятой Богородицы.',
        nativity: 'Рождественский (Филиппов) пост перед Рождеством Христовым.'
      },
      feasts: {
        nativityTheotokos: 'Рождество Пресвятой Богородицы', crossExaltation: 'Воздвижение Креста Господня',
        entryTheotokos: 'Введение во храм Пресвятой Богородицы', nativityChrist: 'Рождество Христово',
        theophany: 'Богоявление (Крещение Господне)', meeting: 'Сретение Господне',
        palmSunday: 'Вход Господень в Иерусалим', annunciation: 'Благовещение Пресвятой Богородицы',
        ascension: 'Вознесение Господне', pentecost: 'День Святой Троицы (Пятидесятница)',
        transfiguration: 'Преображение Господне', dormition: 'Успение Пресвятой Богородицы'
      },
      patronal: {
        seraphimRepose: 'Преставление преподобного Серафима Саровского',
        seraphimRelics: 'Обретение мощей преподобного Серафима Саровского'
      }
    }
  };

  // ── Formatage ─────────────────────────────────────────────────
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function fmt(lang, dt, opts) {
    opts = opts || {};
    var s = '';
    if (opts.wd) s += cap(WEEKDAYS[lang][dt.getUTCDay()]) + ' ';
    s += dt.getUTCDate() + ' ' + MONTHS[lang][dt.getUTCMonth()];
    if (opts.year) s += ' ' + dt.getUTCFullYear();
    return s;
  }

  // ── Rendu ─────────────────────────────────────────────────────
  function render(root, lang, year) {
    var t = L[lang] || L.fr;
    var c = calendar(year);
    var now = new Date();
    var nowU = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    var isCurrent = year === now.getFullYear();

    // prochaine grande fête (si année courante)
    var upcomingHtml = '';
    if (isCurrent) {
      var next = null;
      var pool = c.feasts.concat([{ key: '__pascha', date: c.pascha, pascha: true }])
        .sort(function (a, b) { return a.date - b.date; });
      for (var i = 0; i < pool.length; i++) { if (pool[i].date >= nowU) { next = pool[i]; break; } }
      if (next) {
        var nm = next.pascha ? t.paschaLabel : t.feasts[next.key];
        upcomingHtml =
          '<div class="cal-upcoming"><span class="cal-upcoming-label">' + t.upcoming + '</span>' +
          '<span class="cal-upcoming-name">' + nm + '</span>' +
          '<span class="cal-upcoming-date">' + fmt(lang, next.date, { wd: true }) + '</span></div>';
      }
    }

    var fastsHtml = c.fasts.map(function (f) {
      var n = dayCount(f.start, f.end);
      return '<article class="cal-fast">' +
        '<h3 class="cal-fast-name">' + t.fasts[f.key] + '</h3>' +
        '<div class="cal-fast-range">' + cap(t.from) + ' ' + fmt(lang, f.start, { year: true }) +
        ' ' + t.to + ' ' + fmt(lang, f.end, { year: true }) + '</div>' +
        '<div class="cal-fast-len">' + n + ' ' + t.days + '</div>' +
        '<p class="cal-fast-note">' + t.fastNotes[f.key] + '</p>' +
        '</article>';
    }).join('');

    var feastsHtml = c.feasts.map(function (f) {
      return '<div class="cal-feast">' +
        '<span class="cal-feast-date">' + fmt(lang, f.date, { wd: true }) + '</span>' +
        '<span class="cal-feast-name">' + t.feasts[f.key] +
        (f.movable ? ' <span class="cal-badge">' + t.movable + '</span>' : '') + '</span>' +
        '</div>';
    }).join('');

    var patronalHtml = c.patronal.map(function (f) {
      return '<div class="cal-feast cal-feast-patronal">' +
        '<span class="cal-feast-date">' + fmt(lang, f.date, { wd: true }) + '</span>' +
        '<span class="cal-feast-name">' + t.patronal[f.key] + '</span></div>';
    }).join('');

    root.innerHTML =
      '<div class="cal-yearbar">' +
        '<button class="cal-nav" data-cal-prev aria-label="Année précédente">‹</button>' +
        '<div class="cal-year">' + year + (isCurrent ? '<span class="cal-year-tag">' + t.current + '</span>' : '') + '</div>' +
        '<button class="cal-nav" data-cal-next aria-label="Année suivante">›</button>' +
      '</div>' +
      '<div class="cal-pascha">' +
        '<span class="cal-pascha-label">' + t.paschaLabel + '</span>' +
        '<span class="cal-pascha-date">' + fmt(lang, c.pascha, { wd: true }) + '</span>' +
      '</div>' +
      upcomingHtml +
      '<h2 class="cal-h2">' + t.fastsTitle + '</h2>' +
      '<div class="cal-fasts">' + fastsHtml + '</div>' +
      '<h2 class="cal-h2">' + t.feastsTitle + '</h2>' +
      '<div class="cal-feasts">' + feastsHtml + '</div>' +
      '<h2 class="cal-h2">' + t.patronalTitle + '</h2>' +
      '<div class="cal-feasts">' + patronalHtml + '</div>' +
      '<p class="cal-note">' + t.note + '</p>';

    root.querySelector('[data-cal-prev]').addEventListener('click', function () { render(root, lang, year - 1); });
    root.querySelector('[data-cal-next]').addEventListener('click', function () { render(root, lang, year + 1); });
  }

  function init() {
    var root = document.querySelector('[data-calendar]');
    if (!root) return;
    var lang = (document.documentElement.getAttribute('lang') || 'fr').slice(0, 2);
    if (!L[lang]) lang = 'fr';
    render(root, lang, new Date().getFullYear());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
