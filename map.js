/* Eglise Saint-Seraphim-de-Sarov — Leaflet map
   Carto Positron tiles (light grey, elegant) + custom gold marker. */
(function () {
  var el = document.getElementById('map');
  if (!el || typeof L === 'undefined') return;

  var LAT = 48.7143853;
  var LON = 2.4517886;

  var map = L.map(el, {
    center: [LAT, LON],
    zoom: 16,
    scrollWheelZoom: false,
    zoomControl: true,
    attributionControl: false,
  });
  // Custom attribution control without the Leaflet flag prefix
  L.control.attribution({ prefix: false }).addTo(map);

  // Carto Positron (light, neutral grey). HTTPS, free.
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  }).addTo(map);

  // Custom gold SVG marker (Orthodox cross silhouette in a teardrop)
  var goldPin = L.divIcon({
    className: 'gold-pin',
    html:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 56" width="40" height="56" aria-hidden="true">' +
      '  <defs>' +
      '    <filter id="goldShadow" x="-30%" y="-30%" width="160%" height="160%">' +
      '      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.35"/>' +
      '    </filter>' +
      '  </defs>' +
      '  <path filter="url(#goldShadow)" fill="#C9A84C" stroke="#6B5320" stroke-width="1.2" d="M20 2 C9 2 2 10 2 20 c0 13 18 34 18 34 s18 -21 18 -34 c0 -10 -7 -18 -18 -18 z"/>' +
      '  <g stroke="#3A2A0E" stroke-width="1.6" stroke-linecap="round" fill="none">' +
      '    <line x1="20" y1="9"  x2="20" y2="29"/>' +
      '    <line x1="15" y1="14" x2="25" y2="14"/>' +
      '    <line x1="13" y1="19" x2="27" y2="19"/>' +
      '    <line x1="15" y1="25" x2="25" y2="23"/>' +
      '  </g>' +
      '</svg>',
    iconSize: [40, 56],
    iconAnchor: [20, 54],
    popupAnchor: [0, -48],
  });

  var marker = L.marker([LAT, LON], { icon: goldPin, title: 'Eglise Saint-Seraphim-de-Sarov' }).addTo(map);

  var isRu = document.documentElement.lang === 'ru';
  var label = isRu
    ? '<strong>Храм св. Серафима Саровского</strong><br><span style="font-size:.85em;color:#6B5A4E;">Rue du Moulin de Senlis<br>91230 Монжерон</span>'
    : '<strong>Église Saint-Séraphim-de-Sarov</strong><br><span style="font-size:.85em;color:#6B5A4E;">Rue du Moulin de Senlis<br>91230 Montgeron</span>';
  marker.bindPopup(label).openPopup();

  // Re-enable scroll-wheel zoom only after user clicks the map (UX best practice)
  map.once('click', function () { map.scrollWheelZoom.enable(); });
})();
