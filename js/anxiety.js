/* Termometro dell'ansia */
(function () {
  var levelsEl = document.getElementById('therm-levels');
  if (!levelsEl) return;

  var fillEl     = document.getElementById('therm-fill');
  var bulbEl     = document.getElementById('therm-bulb');
  var infoEl     = document.getElementById('therm-info');
  var selectedLvl = null;

  var BTN_H       = 28;  /* px — matches .therm-level-btn height in CSS */
  var BULB_OFFSET = 32;  /* bulb height (40px) - tube overlap (8px)     */
  var maxLevel    = 10;  /* overwritten once JSON loads                  */

  fetch('resources/anxiety.json')
    .then(function (r) { return r.json(); })
    .then(function (data) { init(data.levels); });

  function init(levels) {
    maxLevel = levels[levels.length - 1].level;

    /* Size the tube and align the label list to the tube, not the bulb */
    var tubeEl = document.querySelector('.therm-tube');
    if (tubeEl) tubeEl.style.height = (levels.length * BTN_H) + 'px';
    levelsEl.style.paddingBottom = BULB_OFFSET + 'px';

    levels.forEach(function (lvl) {
      var btn = document.createElement('button');
      btn.className = 'therm-level-btn';
      btn.dataset.level = lvl.level;

      var numEl = document.createElement('span');
      numEl.className = 'therm-level-num';
      numEl.textContent = lvl.level;

      var labelEl = document.createElement('span');
      labelEl.className = 'therm-level-label';
      labelEl.textContent = lvl.label;

      btn.appendChild(numEl);
      btn.appendChild(labelEl);
      btn.addEventListener('click', function () { select(lvl); });
      levelsEl.appendChild(btn);
    });
  }

  function select(lvl) {
    selectedLvl = lvl;
    if (window.Checkin && window.Checkin.update) window.Checkin.update();
    /* Aggiorna bottoni */
    levelsEl.querySelectorAll('.therm-level-btn').forEach(function (b) {
      var active = +b.dataset.level === lvl.level;
      b.classList.toggle('active', active);
      b.querySelector('.therm-level-num').style.color   = active ? lvl.color : '';
      b.querySelector('.therm-level-label').style.color = active ? lvl.color : '';
    });

    /* Aggiorna termometro */
    fillEl.style.height          = (lvl.level / maxLevel * 100) + '%';
    fillEl.style.backgroundColor = lvl.color;
    bulbEl.style.backgroundColor = lvl.color;

    /* Aggiorna pannello info */
    infoEl.style.backgroundColor = lvl.color + '18'; /* 18 = ~10% opacity hex */
    infoEl.innerHTML = '';

    var title = document.createElement('p');
    title.className = 'therm-info-title';
    title.style.color = lvl.color;
    title.textContent = lvl.level + ' – ' + lvl.label;
    infoEl.appendChild(title);

    [['Corpo', lvl.physical], ['Mente', lvl.emotional]].forEach(function (pair) {
      var p = document.createElement('p');
      p.className = 'therm-info-body';
      var strong = document.createElement('strong');
      strong.textContent = pair[0] + ':';
      p.appendChild(strong);
      p.appendChild(document.createTextNode(' ' + pair[1]));
      infoEl.appendChild(p);
    });
  }

  window.Checkin = window.Checkin || {};
  window.Checkin.getThermText = function () {
    if (!selectedLvl) return null;
    return selectedLvl.level + '/10 – ' + selectedLvl.label;
  };
  window.Checkin.resetTherm = function () {
    selectedLvl = null;
    levelsEl.querySelectorAll('.therm-level-btn').forEach(function (b) {
      b.classList.remove('active');
      b.querySelector('.therm-level-num').style.color   = '';
      b.querySelector('.therm-level-label').style.color = '';
    });
    fillEl.style.height          = '0%';
    fillEl.style.backgroundColor = '';
    bulbEl.style.backgroundColor = '';
    infoEl.innerHTML = '<p class="therm-hint">Seleziona un livello per vedere la descrizione</p>';
  };
})();
