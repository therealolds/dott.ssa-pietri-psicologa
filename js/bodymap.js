(function () {
  'use strict';

  var svgEl = document.getElementById('bm-svg');
  if (!svgEl) return;

  var NS = 'http://www.w3.org/2000/svg';

  var ZONES = [
    { id: 'head',    label: 'testa',              shape: 'circle', attrs: { cx:100, cy:36,  r:30 } },
    { id: 'neck',    label: 'collo',              shape: 'rect',   attrs: { x:87,  y:68,  width:26, height:20, rx:5 } },
    { id: 'chest',   label: 'petto',              shape: 'rect',   attrs: { x:55,  y:90,  width:90, height:58, rx:8 } },
    { id: 'abdomen', label: 'addome',             shape: 'rect',   attrs: { x:57,  y:150, width:86, height:52, rx:8 } },
    { id: 'pelvis',  label: 'bacino',             shape: 'rect',   attrs: { x:57,  y:204, width:86, height:36, rx:8 } },
    { id: 'l-arm',   label: 'braccio sinistro',   shape: 'rect',   attrs: { x:20,  y:90,  width:33, height:100, rx:10 } },
    { id: 'r-arm',   label: 'braccio destro',     shape: 'rect',   attrs: { x:147, y:90,  width:33, height:100, rx:10 } },
    { id: 'l-hand',  label: 'mano sinistra',      shape: 'rect',   attrs: { x:14,  y:192, width:38, height:28, rx:8 } },
    { id: 'r-hand',  label: 'mano destra',        shape: 'rect',   attrs: { x:148, y:192, width:38, height:28, rx:8 } },
    { id: 'l-thigh', label: 'coscia sinistra',    shape: 'rect',   attrs: { x:57,  y:242, width:38, height:78, rx:8 } },
    { id: 'r-thigh', label: 'coscia destra',      shape: 'rect',   attrs: { x:105, y:242, width:38, height:78, rx:8 } },
    { id: 'l-calf',  label: 'polpaccio sinistro', shape: 'rect',   attrs: { x:59,  y:322, width:34, height:72, rx:8 } },
    { id: 'r-calf',  label: 'polpaccio destro',   shape: 'rect',   attrs: { x:107, y:322, width:34, height:72, rx:8 } },
    { id: 'l-foot',  label: 'piede sinistro',     shape: 'rect',   attrs: { x:42,  y:396, width:50, height:24, rx:8 } },
    { id: 'r-foot',  label: 'piede destro',       shape: 'rect',   attrs: { x:108, y:396, width:50, height:24, rx:8 } },
  ];

  var SENSATIONS = [
    { id: 'tensione',    label: 'Tensione',    color: '#C0392B' },
    { id: 'calore',      label: 'Calore',      color: '#E8934A' },
    { id: 'peso',        label: 'Peso',        color: '#5D6D7E' },
    { id: 'formicolio',  label: 'Formicolio',  color: '#8E44AD' },
    { id: 'vuoto',       label: 'Vuoto',       color: '#2471A3' },
    { id: 'costrizione', label: 'Costrizione', color: '#1E8449' },
  ];

  var BASE_COLOR  = '#E0DAD3';
  var currentSens = SENSATIONS[0].id;
  var state       = {};  // zone id → sensation id | null
  var elMap       = {};  // zone id → SVG element

  ZONES.forEach(function (z) { state[z.id] = null; });

  function sensColor(sensId) {
    if (!sensId) return BASE_COLOR;
    for (var i = 0; i < SENSATIONS.length; i++) {
      if (SENSATIONS[i].id === sensId) return SENSATIONS[i].color;
    }
    return BASE_COLOR;
  }

  // ── Sensation selector ───────────────────────────────────────────────────────
  function buildSelector() {
    var container = document.getElementById('bm-sensations');
    if (!container) return;

    SENSATIONS.forEach(function (s) {
      var btn = document.createElement('button');
      btn.className = 'bm-sens-btn' + (s.id === currentSens ? ' active' : '');
      btn.dataset.id = s.id;
      btn.style.setProperty('--sens-color', s.color);

      var dot = document.createElement('span');
      dot.className        = 'bm-sens-dot';
      dot.style.background = s.color;
      btn.appendChild(dot);
      btn.appendChild(document.createTextNode(s.label));

      btn.addEventListener('click', function () {
        currentSens = s.id;
        container.querySelectorAll('.bm-sens-btn').forEach(function (b) {
          b.classList.toggle('active', b.dataset.id === currentSens);
        });
      });

      container.appendChild(btn);
    });
  }

  // ── SVG body ─────────────────────────────────────────────────────────────────
  function svgNode(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (k) { e.setAttribute(k, String(attrs[k])); });
    return e;
  }

  function buildSVG() {
    svgEl.innerHTML = '';
    ZONES.forEach(function (z) {
      var el = svgNode(z.shape, Object.assign({}, z.attrs, {
        fill:           BASE_COLOR,
        stroke:         '#C8C0B8',
        'stroke-width': '1',
      }));
      el.style.cursor     = 'pointer';
      el.style.transition = 'fill 0.18s';

      el.addEventListener('click', function () {
        state[z.id] = (state[z.id] === currentSens) ? null : currentSens;
        el.setAttribute('fill', sensColor(state[z.id]));
        if (window.Checkin && window.Checkin.update) window.Checkin.update();
      });

      svgEl.appendChild(el);
      elMap[z.id] = el;
    });
  }

  // ── Init ─────────────────────────────────────────────────────────────────────
  buildSelector();
  buildSVG();

  // Checkin integration
  window.Checkin = window.Checkin || {};
  window.Checkin.getBodyText = function () {
    var groups = {};
    SENSATIONS.forEach(function (s) { groups[s.id] = []; });
    ZONES.forEach(function (z) {
      if (state[z.id]) groups[state[z.id]].push(z.label);
    });
    var lines = [];
    SENSATIONS.forEach(function (s) {
      if (groups[s.id].length > 0) lines.push(s.label + ': ' + groups[s.id].join(', '));
    });
    return lines.length ? lines.join('\n') : null;
  };
  window.Checkin.resetBody = function () {
    ZONES.forEach(function (z) {
      state[z.id] = null;
      if (elMap[z.id]) elMap[z.id].setAttribute('fill', BASE_COLOR);
    });
  };
}());
