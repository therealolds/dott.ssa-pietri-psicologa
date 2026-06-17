/* Termometro dell'ansia */
(function () {
  var levelsEl = document.getElementById('therm-levels');
  if (!levelsEl) return;

  var fillEl  = document.getElementById('therm-fill');
  var bulbEl  = document.getElementById('therm-bulb');
  var infoEl  = document.getElementById('therm-info');

  fetch('resources/anxiety.json')
    .then(function (r) { return r.json(); })
    .then(function (data) { init(data.levels); });

  function init(levels) {
    levels.forEach(function (lvl) {
      var btn = document.createElement('button');
      btn.className = 'therm-level-btn';
      btn.dataset.level = lvl.level;
      btn.innerHTML =
        '<span class="therm-level-num">' + lvl.level + '</span>' +
        '<span class="therm-level-label">' + lvl.label + '</span>';
      btn.addEventListener('click', function () { select(lvl); });
      levelsEl.appendChild(btn);
    });
  }

  function select(lvl) {
    /* Aggiorna bottoni */
    levelsEl.querySelectorAll('.therm-level-btn').forEach(function (b) {
      var active = +b.dataset.level === lvl.level;
      b.classList.toggle('active', active);
      b.querySelector('.therm-level-num').style.color   = active ? lvl.color : '';
      b.querySelector('.therm-level-label').style.color = active ? lvl.color : '';
    });

    /* Aggiorna termometro */
    var pct = (lvl.level / 10) * 100;
    fillEl.style.height          = pct + '%';
    fillEl.style.backgroundColor = lvl.color;
    bulbEl.style.backgroundColor = lvl.color;

    /* Aggiorna pannello info */
    infoEl.style.backgroundColor = lvl.color + '18'; /* 18 = ~10% opacity hex */
    infoEl.innerHTML =
      '<p class="therm-info-title" style="color:' + lvl.color + '">' +
        lvl.level + ' &ndash; ' + lvl.label +
      '</p>' +
      '<p class="therm-info-body"><strong>Corpo:</strong> ' + lvl.physical + '</p>' +
      '<p class="therm-info-body"><strong>Mente:</strong> ' + lvl.emotional + '</p>';
  }
})();
