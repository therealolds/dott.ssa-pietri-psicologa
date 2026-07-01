(function () {
  'use strict';

  window.Checkin = window.Checkin || {};

  function update() {
    var output = document.getElementById('checkin-output');
    if (!output) return;

    var mmName   = window.Checkin.getMmName   && window.Checkin.getMmName();
    var thermTxt = window.Checkin.getThermText && window.Checkin.getThermText();
    var bodyTxt  = window.Checkin.getBodyText  && window.Checkin.getBodyText();

    if (!mmName && !thermTxt && !bodyTxt) { output.value = ''; return; }

    var today   = new Date();
    var dateStr = today.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
                + ', ore ' + today.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    var lines   = ['Check-in – ' + dateStr, ''];

    if (mmName)   lines.push('Emozione: ' + mmName);
    if (thermTxt) lines.push('Ansia: ' + thermTxt);
    if (bodyTxt)  bodyTxt.split('\n').forEach(function (l) { lines.push(l); });

    output.value = lines.join('\n');
  }

  window.Checkin.update = update;

  document.addEventListener('DOMContentLoaded', function () {
    var copyBtn  = document.getElementById('checkin-copy');
    var resetBtn = document.getElementById('checkin-reset');

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var output = document.getElementById('checkin-output');
        if (!output || !output.value) return;
        var btn  = this;
        var orig = btn.textContent;
        var done = function () {
          btn.textContent = 'Copiato!';
          setTimeout(function () { btn.textContent = orig; }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(output.value).then(done);
        } else {
          output.select();
          document.execCommand('copy');
          done();
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (window.Checkin.resetMm)    window.Checkin.resetMm();
        if (window.Checkin.resetTherm) window.Checkin.resetTherm();
        if (window.Checkin.resetBody)  window.Checkin.resetBody();
        update();
      });
    }
  });
}());
