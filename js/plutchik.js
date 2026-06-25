(function () {
  'use strict';

  var svgEl = document.getElementById('pw-svg');
  if (!svgEl) return;

  var NS    = 'http://www.w3.org/2000/svg';
  var CX    = 200, CY = 200;
  var R     = [48, 93, 143, 190]; // hole, mild_end, primary_end, intense_end
  var GAP   = 0.025;              // radians gap between slices
  var SLICE = Math.PI * 2 / 8;

  var EMOTIONS = [
    { name: 'Gioia',         cols: ['#FFF9C4','#FDD835','#F57F17'], levels: ['Serenità',    'Gioia',         'Estasi']       },
    { name: 'Fiducia',       cols: ['#DCEDC8','#7CB342','#33691E'], levels: ['Accettazione', 'Fiducia',       'Ammirazione']  },
    { name: 'Paura',         cols: ['#F9FBE7','#C0CA33','#9E9D24'], levels: ['Apprensione',  'Paura',         'Terrore']      },
    { name: 'Sorpresa',      cols: ['#FFF8E1','#FFD740','#FF6D00'], levels: ['Distrazione',  'Sorpresa',      'Stupore']      },
    { name: 'Tristezza',     cols: ['#BBDEFB','#42A5F5','#0D47A1'], levels: ['Malinconia',   'Tristezza',     'Dolore']       },
    { name: 'Disgusto',      cols: ['#F1F8E9','#8BC34A','#558B2F'], levels: ['Noia',         'Disgusto',      'Repulsione']   },
    { name: 'Rabbia',        cols: ['#FFCDD2','#EF5350','#B71C1C'], levels: ['Fastidio',     'Rabbia',        'Furore']       },
    { name: 'Anticipazione', cols: ['#FFE0B2','#FFA726','#E65100'], levels: ['Interesse',    'Anticipazione', 'Vigilanza']    },
  ];

  function xy(r, a) {
    return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
  }

  function f(p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }

  function arcPath(r1, r2, a1, a2) {
    var sa = a1 + GAP, ea = a2 - GAP;
    var lg = (ea - sa > Math.PI) ? 1 : 0;
    return ['M', f(xy(r2,sa)), 'A',r2,r2,0,lg,1,f(xy(r2,ea)),
            'L', f(xy(r1,ea)), 'A',r1,r1,0,lg,0,f(xy(r1,sa)), 'Z'].join(' ');
  }

  function svgEl2(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }

  function render() {
    svgEl.innerHTML = '';

    EMOTIONS.forEach(function (em, i) {
      var a1  = -Math.PI / 2 + i * SLICE;
      var a2  = a1 + SLICE;
      var mid = (a1 + a2) / 2;

      for (var ring = 0; ring < 3; ring++) {
        var path = svgEl2('path', {
          d:              arcPath(R[ring], R[ring + 1], a1, a2),
          fill:           em.cols[ring],
          stroke:         '#F7F3EE',
          'stroke-width': '1.5',
        });
        path.style.cursor = 'pointer';
        (function (emotion, r) {
          path.addEventListener('click',      function ()  { showInfo(emotion, r); });
          path.addEventListener('mouseenter', function ()  { this.style.filter = 'brightness(1.1)'; });
          path.addEventListener('mouseleave', function ()  { this.style.filter = ''; });
        }(em, ring));
        svgEl.appendChild(path);
      }

      // Labels in all three rings
      var RING_LABELS = [
        { rIdx: 0, size: '6',  fill: '#2B2B2B' },  // mild  — dark small text
        { rIdx: 1, size: '8',  fill: '#2B2B2B' },  // primary
        { rIdx: 2, size: '7.5', fill: '#ffffff' },  // intense — white on dark bg
      ];
      var RING_TEXTS = [em.levels[0], em.name, em.levels[2]];

      RING_LABELS.forEach(function (rl) {
        var lr  = (R[rl.rIdx] + R[rl.rIdx + 1]) / 2;
        var pos = xy(lr, mid);
        var deg = mid * 180 / Math.PI + 90;
        if (deg > 90 && deg <= 270) deg -= 180;

        svgEl.appendChild(svgEl2('text', {
          x:                   pos[0].toFixed(1),
          y:                   pos[1].toFixed(1),
          'text-anchor':       'middle',
          'dominant-baseline': 'middle',
          fill:                rl.fill,
          'font-size':         rl.size,
          'font-family':       'Lato, sans-serif',
          'font-weight':       '700',
          'pointer-events':    'none',
          transform: 'rotate(' + deg.toFixed(1) + ' ' + pos[0].toFixed(1) + ' ' + pos[1].toFixed(1) + ')',
        })).textContent = RING_TEXTS[rl.rIdx];
      });
    });

    // Centre disc
    svgEl.appendChild(svgEl2('circle', {
      cx: CX, cy: CY, r: R[0] - 2,
      fill:           '#F7F3EE',
      stroke:         '#E2D9D0',
      'stroke-width': '1',
    }));
  }

  function showInfo(emotion, ring) {
    var panel = document.getElementById('pw-info');
    if (!panel) return;
    panel.innerHTML = '';

    var nameEl = document.createElement('p');
    nameEl.className   = 'pw-info-name';
    nameEl.textContent = emotion.levels[ring];
    panel.appendChild(nameEl);

    var catEl = document.createElement('p');
    catEl.className   = 'pw-info-cat';
    catEl.textContent = emotion.name + ' · ' + ['Intensità lieve', 'Intensità media', 'Intensità alta'][ring];
    panel.appendChild(catEl);
  }

  render();
}());
