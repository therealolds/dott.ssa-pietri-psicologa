/* Filtri servizi */
(function () {
  const filtersEl = document.querySelector('.service-filters');
  if (!filtersEl) return;

  const cards = document.querySelectorAll('.service-card');
  const state = { persone: '', modalita: '' };

  filtersEl.addEventListener('click', function (e) {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    const group = btn.dataset.group;
    const value = btn.dataset.value;

    state[group] = (state[group] === value && value !== '') ? '' : value;

    filtersEl.querySelectorAll(`.filter-btn[data-group="${group}"]`).forEach(function (b) {
      b.classList.toggle('active', b.dataset.value === state[group]);
    });

    cards.forEach(function (card) {
      const pillTags = Array.from(card.querySelectorAll('.tag--pill')).map(function (t) { return t.textContent.trim(); });
      const rectTags = Array.from(card.querySelectorAll('.tag--rect')).map(function (t) { return t.textContent.trim(); });

      const matchPersone  = !state.persone  || pillTags.includes(state.persone);
      const matchModalita = !state.modalita || rectTags.includes(state.modalita);

      card.style.display = (matchPersone && matchModalita) ? '' : 'none';
    });
  });
})();

/* Menu hamburger mobile */
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const nav    = document.getElementById('main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
    toggle.textContent = isOpen ? '✕' : '☰';
  });

  /* Chiudi il menu cliccando fuori */
  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';
    }
  });
})();
