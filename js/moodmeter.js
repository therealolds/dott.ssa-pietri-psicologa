(function () {
  'use strict';

  const GRID = [
    ['Enraged','Panicked','Stressed','Jittery','Shocked','Surprised','Upbeat','Festive','Exhilarated','Ecstatic'],
    ['Livid','Furious','Frustrated','Tense','Stunned','Hyper','Cheerful','Motivated','Inspired','Elated'],
    ['Fuming','Frightened','Angry','Nervous','Restless','Energized','Lively','Enthusiastic','Optimistic','Excited'],
    ['Anxious','Apprehensive','Worried','Irritated','Annoyed','Pleased','Happy','Focused','Proud','Thrilled'],
    ['Repulsed','Troubled','Concerned','Uneasy','Peeved','Pleasant','Joyful','Hopeful','Playful','Blissful'],
    ['Disgusted','Glum','Disappointed','Down','Apathetic','At Ease','Easygoing','Content','Loving','Fulfilled'],
    ['Pessimistic','Morose','Discouraged','Sad','Bored','Calm','Secure','Satisfied','Grateful','Touched'],
    ['Alienated','Miserable','Lonely','Disheartened','Tired','Relaxed','Chill','Restful','Blessed','Balanced'],
    ['Despondent','Depressed','Sullen','Exhausted','Fatigued','Mellow','Thoughtful','Peaceful','Comfy','Carefree'],
    ['Despair','Hopeless','Desolate','Spent','Drained','Sleepy','Complacent','Tranquil','Cozy','Serene'],
  ];

  // Corner colours [R, G, B]: TL=red, TR=yellow, BL=blue, BR=green
  var C = [
    [200,  40,  30],  // TL — alta energia, spiacevole
    [230, 170,  25],  // TR — alta energia, piacevole
    [ 50,  80, 170],  // BL — bassa energia, spiacevole
    [ 45, 140,  75],  // BR — bassa energia, piacevole
  ];

  function lerp(a, b, t) { return a + (b - a) * t; }

  // Axes: x [-5..-1, +1..+5] left→right, y [+5..+1, -1..-5] top→bottom (skip 0)
  function cellCoord(ri, ci) {
    var x = ci < 5 ? ci - 5 : ci - 4;
    var y = ri < 5 ? 5 - ri : 4 - ri;
    return (x > 0 ? '+' : '') + x + ' ' + (y > 0 ? '+' : '') + y;
  }

  // Bilinear interpolation across the grid
  function baseRGB(row, col) {
    var u = col / 9, v = row / 9;
    return [
      Math.round(lerp(lerp(C[0][0], C[1][0], u), lerp(C[2][0], C[3][0], u), v)),
      Math.round(lerp(lerp(C[0][1], C[1][1], u), lerp(C[2][1], C[3][1], u), v)),
      Math.round(lerp(lerp(C[0][2], C[1][2], u), lerp(C[2][2], C[3][2], u), v)),
    ];
  }

  // Diagonal gradient per cell: lighter top-left → base colour bottom-right
  function cellGradient(row, col) {
    var rgb = baseRGB(row, col);
    var r = rgb[0], g = rgb[1], b = rgb[2];
    var lr = Math.round(r + (255 - r) * 0.28);
    var lg = Math.round(g + (255 - g) * 0.28);
    var lb = Math.round(b + (255 - b) * 0.28);
    return 'linear-gradient(135deg,rgb(' + lr + ',' + lg + ',' + lb + ') 0%,rgb(' + r + ',' + g + ',' + b + ') 100%)';
  }

  function cellColorFlat(row, col) {
    var rgb = baseRGB(row, col);
    return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
  }

  var lang = 'it';
  var data = {};
  var selectedKey = null;
  var scale = 1, tx = 0, ty = 0;
  var hasDragged = false;
  var GRID_PX = 10 * 72 + 9 * 2; // 738

  function gridEl()  { return document.getElementById('mm-grid'); }
  function stageEl() { return document.getElementById('mm-stage'); }
  function wrapEl()  { return document.getElementById('mm-stage-wrap'); }

  // ── Render ──────────────────────────────────────────────────────────────────
  function render() {
    var grid = gridEl();
    if (!grid) return;
    grid.innerHTML = '';
    GRID.forEach(function (row, ri) {
      row.forEach(function (key, ci) {
        var entry = data[key] || {};
        var name  = entry.name ? (entry.name[lang] || key) : key;
        var cell  = document.createElement('div');
        cell.className = 'mm-cell';
        cell.style.background = cellGradient(ri, ci);
        cell.dataset.key = key;
        cell.dataset.row = ri;
        cell.dataset.col = ci;
        var span  = document.createElement('span');
        span.className = 'mm-cell-name';
        span.textContent = name;
        cell.appendChild(span);
        var coord = document.createElement('span');
        coord.className = 'mm-cell-coord';
        coord.textContent = cellCoord(ri, ci);
        cell.appendChild(coord);
        if (key === selectedKey) cell.classList.add('mm-cell--selected');
        cell.addEventListener('click', function () { selectCell(key); openModal(key, ri, ci); });
        grid.appendChild(cell);
      });
    });
  }

  // ── Modal ───────────────────────────────────────────────────────────────────
  function openModal(key, row, col) {
    if (hasDragged) { hasDragged = false; return; }
    var entry   = data[key] || {};
    var overlay = document.getElementById('mm-modal-overlay');
    var title   = document.getElementById('mm-modal-title');
    var desc    = document.getElementById('mm-modal-desc');
    var header  = document.getElementById('mm-modal-header');
    title.textContent  = entry.name        ? (entry.name[lang]        || key) : key;
    desc.textContent   = entry.description ? (entry.description[lang] || '')  : '';
    header.style.background = cellColorFlat(row, col);
    overlay.classList.add('open');
  }

  function closeModal() {
    document.getElementById('mm-modal-overlay').classList.remove('open');
  }

  // ── Selection ────────────────────────────────────────────────────────────────
  function selectCell(key) {
    if (hasDragged) return;
    selectedKey = key;
    var grid = gridEl();
    if (grid) {
      grid.querySelectorAll('.mm-cell').forEach(function (c) {
        c.classList.toggle('mm-cell--selected', c.dataset.key === key);
      });
    }
    if (window.Checkin && window.Checkin.update) window.Checkin.update();
  }

  // ── Transform ───────────────────────────────────────────────────────────────
  function applyTransform() {
    stageEl().style.transform =
      'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
  }

  function clamp() {
    var wrap = wrapEl();
    var ww = wrap.clientWidth, wh = wrap.clientHeight;
    var gw = GRID_PX * scale, gh = GRID_PX * scale;
    var pad = 20;
    tx = Math.max(pad - gw, Math.min(ww - pad, tx));
    ty = Math.max(pad - gh, Math.min(wh - pad, ty));
  }

  // ── Mouse wheel ─────────────────────────────────────────────────────────────
  function onWheel(e) {
    e.preventDefault();
    var wrap  = wrapEl();
    var rect  = wrap.getBoundingClientRect();
    var ox    = e.clientX - rect.left;
    var oy    = e.clientY - rect.top;
    var delta = e.deltaY < 0 ? 1.12 : 0.9;
    var ns    = Math.max(0.25, Math.min(5, scale * delta));
    tx = ox - (ox - tx) * (ns / scale);
    ty = oy - (oy - ty) * (ns / scale);
    scale = ns;
    clamp();
    applyTransform();
  }

  // ── Mouse drag ──────────────────────────────────────────────────────────────
  var dragging = false, dragX = 0, dragY = 0;

  function onMouseDown(e) {
    if (e.button !== 0) return;
    dragging   = true;
    hasDragged = false;
    dragX = e.clientX - tx;
    dragY = e.clientY - ty;
    e.preventDefault();
  }

  function onMouseMove(e) {
    if (!dragging) return;
    var nx = e.clientX - dragX;
    var ny = e.clientY - dragY;
    if (Math.abs(nx - tx) > 3 || Math.abs(ny - ty) > 3) hasDragged = true;
    tx = nx; ty = ny;
    clamp();
    applyTransform();
  }

  function onMouseUp() { dragging = false; }

  // ── Touch (pinch + drag) ─────────────────────────────────────────────────────
  var touches = [], lastDist = 0;

  function tDist(a, b) {
    return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
  }

  function onTouchStart(e) {
    e.preventDefault();
    touches = Array.from(e.touches);
    if (touches.length === 2) {
      lastDist = tDist(touches[0], touches[1]);
    } else if (touches.length === 1) {
      hasDragged = false;
      dragX = touches[0].clientX - tx;
      dragY = touches[0].clientY - ty;
    }
  }

  function onTouchMove(e) {
    e.preventDefault();
    var t = Array.from(e.touches);
    if (t.length === 2 && lastDist > 0) {
      var d   = tDist(t[0], t[1]);
      var mid = { x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 };
      var rect = wrapEl().getBoundingClientRect();
      var ox  = mid.x - rect.left;
      var oy  = mid.y - rect.top;
      var ns  = Math.max(0.25, Math.min(5, scale * d / lastDist));
      tx = ox - (ox - tx) * (ns / scale);
      ty = oy - (oy - ty) * (ns / scale);
      scale = ns;
      lastDist = d;
      clamp();
      applyTransform();
    } else if (t.length === 1) {
      var nx = t[0].clientX - dragX;
      var ny = t[0].clientY - dragY;
      if (Math.abs(nx - tx) > 4 || Math.abs(ny - ty) > 4) hasDragged = true;
      tx = nx; ty = ny;
      clamp();
      applyTransform();
    }
    touches = t;
  }

  function onTouchEnd(e) {
    var prev = touches;
    touches = Array.from(e.touches);

    // Tap: single finger lifted with no drag → open modal
    if (!hasDragged && prev.length === 1 && touches.length === 0 && e.changedTouches.length === 1) {
      var t  = e.changedTouches[0];
      var el = document.elementFromPoint(t.clientX, t.clientY);
      var cell = el && el.closest ? el.closest('.mm-cell') : null;
      if (cell) { selectCell(cell.dataset.key); openModal(cell.dataset.key, +cell.dataset.row, +cell.dataset.col); }
    }
  }

  // ── Zoom buttons ────────────────────────────────────────────────────────────
  function zoomBy(factor) {
    var wrap = wrapEl();
    var cx = wrap.clientWidth  / 2;
    var cy = wrap.clientHeight / 2;
    var ns = Math.max(0.25, Math.min(5, scale * factor));
    tx = cx - (cx - tx) * (ns / scale);
    ty = cy - (cy - ty) * (ns / scale);
    scale = ns;
    clamp();
    applyTransform();
  }

  function fitToStage() {
    var wrap = wrapEl();
    var ww = wrap.clientWidth, wh = wrap.clientHeight;
    scale = Math.min(ww, wh) / GRID_PX * 0.97;
    tx = (ww - GRID_PX * scale) / 2;
    ty = (wh - GRID_PX * scale) / 2;
    applyTransform();
  }

  // ── Lang toggle ─────────────────────────────────────────────────────────────
  function setLang(l) {
    lang = l;
    document.getElementById('mm-lang-it').classList.toggle('active', l === 'it');
    document.getElementById('mm-lang-en').classList.toggle('active', l === 'en');
    render();
    // Re-apply transform so stage stays in place after re-render
    applyTransform();
  }

  // ── Init ────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    var wrap = wrapEl();
    if (!wrap) return;

    fetch('resources/moodmeter.json')
      .then(function (r) { return r.json(); })
      .then(function (json) {
        data = json;
        render();
        fitToStage();
      })
      .catch(function () {
        var grid = gridEl();
        if (grid) {
          grid.style.cssText = 'padding:1.5rem;color:var(--terracotta);font-size:0.92rem;width:500px';
          grid.textContent   = 'Impossibile caricare i dati. Apri il sito tramite un server web (non direttamente dal file system).';
        }
      });

    // Stage interactions
    wrap.addEventListener('wheel',      onWheel,      { passive: false });
    wrap.addEventListener('mousedown',  onMouseDown);
    wrap.addEventListener('touchstart', onTouchStart, { passive: false });
    wrap.addEventListener('touchmove',  onTouchMove,  { passive: false });
    wrap.addEventListener('touchend',   onTouchEnd,   { passive: false });
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup',   onMouseUp);

    // Modal
    var closeBtn = document.getElementById('mm-modal-close');
    var overlay  = document.getElementById('mm-modal-overlay');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay)  overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });

    // Controls
    document.getElementById('mm-lang-it') .addEventListener('click', function () { setLang('it'); });
    document.getElementById('mm-lang-en') .addEventListener('click', function () { setLang('en'); });
    document.getElementById('mm-zoom-in') .addEventListener('click', function () { zoomBy(1.25); });
    document.getElementById('mm-zoom-out').addEventListener('click', function () { zoomBy(0.8); });
    document.getElementById('mm-zoom-fit').addEventListener('click', fitToStage);

    // Checkin integration
    window.Checkin = window.Checkin || {};
    window.Checkin.getMmName = function () {
      if (!selectedKey) return null;
      var entry = data[selectedKey] || {};
      return entry.name ? (entry.name[lang] || selectedKey) : selectedKey;
    };
    window.Checkin.resetMm = function () {
      selectedKey = null;
      var grid = gridEl();
      if (grid) grid.querySelectorAll('.mm-cell--selected').forEach(function (c) {
        c.classList.remove('mm-cell--selected');
      });
    };
  });
})();
