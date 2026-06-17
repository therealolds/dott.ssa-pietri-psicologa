/* Respirazione guidata */
(function () {
  const circle      = document.getElementById('breath-circle');
  if (!circle) return;

  const ring        = document.querySelector('.breath-ring');
  const phaseEl     = document.getElementById('breath-phase');
  const instrEl     = document.getElementById('breath-instruction');
  const startBtn    = document.getElementById('breath-start');
  const cyclesEl    = document.getElementById('breath-cycles');
  const descEl      = document.getElementById('breath-desc');

  const patternDesc = {
    box:  'Quattro fasi da 4 secondi ciascuna. Utile per gestire lo stress acuto e ritrovare la concentrazione.',
    '478': 'Inspiro breve, lunga ritenzione, espiro prolungato. Aiuta a calmare il sistema nervoso e a ridurre l\'ansia.'
  };

  /* Durate in secondi per ogni fase (0 = fase saltata) */
  const patterns = {
    box: [
      { name: 'Inspira',   secs: 4, scale: 1.55, ring: 1.9, bg: '#EBF0EC', instr: 'Inspira lentamente dal naso...' },
      { name: 'Trattieni', secs: 4, scale: 1.55, ring: 1.9, bg: '#EBF0EC', instr: 'Trattieni il respiro...' },
      { name: 'Espira',    secs: 4, scale: 1,    ring: 1.1, bg: '#f0f5f1', instr: 'Espira lentamente dalla bocca...' },
      { name: 'Pausa',     secs: 4, scale: 1,    ring: 1.1, bg: '#f0f5f1', instr: 'Pausa... poi ricomincia.' }
    ],
    '478': [
      { name: 'Inspira',   secs: 4, scale: 1.55, ring: 1.9, bg: '#EBF0EC', instr: 'Inspira lentamente dal naso...' },
      { name: 'Trattieni', secs: 7, scale: 1.55, ring: 1.9, bg: '#EBF0EC', instr: 'Trattieni il respiro...' },
      { name: 'Espira',    secs: 8, scale: 1,    ring: 1.1, bg: '#f0f5f1', instr: 'Espira lentamente dalla bocca...' }
    ]
  };

  let running  = false;
  let timer    = null;
  let cycles   = 0;
  let pattern  = 'box';

  function setDesc(p) {
    descEl.textContent = patternDesc[p] || '';
  }

  setDesc(pattern);

  /* Selezione pattern */
  document.querySelectorAll('.breath-pattern-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (running) return;
      document.querySelectorAll('.breath-pattern-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      pattern = btn.dataset.pattern;
      setDesc(pattern);
    });
  });

  function applyPhase(phase) {
    circle.style.transition = 'transform ' + phase.secs + 's ease-in-out, background 0.6s';
    circle.style.transform  = 'scale(' + phase.scale + ')';
    circle.style.background = phase.bg;
    ring.style.transition   = 'transform ' + phase.secs + 's ease-in-out';
    ring.style.transform    = 'scale(' + phase.ring + ')';
    phaseEl.textContent     = phase.name;
    instrEl.textContent     = phase.instr;
  }

  function runCycle() {
    var phases = patterns[pattern];
    var i = 0;

    function next() {
      if (!running) return;
      if (i >= phases.length) {
        cycles++;
        cyclesEl.textContent = cycles === 1 ? '1 ciclo completato' : cycles + ' cicli completati';
        i = 0;
      }
      applyPhase(phases[i]);
      timer = setTimeout(next, phases[i].secs * 1000);
      i++;
    }

    next();
  }

  function reset() {
    running = false;
    clearTimeout(timer);
    circle.style.transition = 'transform 0.8s ease, background 0.6s';
    circle.style.transform  = 'scale(1)';
    circle.style.background = '';
    ring.style.transition   = 'transform 0.8s ease';
    ring.style.transform    = 'scale(1)';
    phaseEl.textContent     = '—';
    instrEl.innerHTML       = 'Scegli un ritmo e premi <em>Inizia</em>';
    startBtn.textContent    = 'Inizia';
    cyclesEl.textContent    = '';
    cycles = 0;
  }

  startBtn.addEventListener('click', function () {
    if (running) {
      reset();
    } else {
      running = true;
      cycles  = 0;
      startBtn.textContent = 'Ferma';
      runCycle();
    }
  });
})();
