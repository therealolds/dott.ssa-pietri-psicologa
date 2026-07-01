(function () {
  'use strict';

  var pageName = location.pathname.split('/').pop() || 'index.html';

  Promise.all([
    fetch('resources/config.json').then(function (r) { return r.json(); }),
    fetch('_header.html').then(function (r) { return r.text(); }),
    fetch('_footer.html').then(function (r) { return r.text(); })
  ]).then(function (results) {
    var cfg        = results[0];
    var headerHTML = results[1];
    var footerHTML = results[2];

    injectHeader(headerHTML, pageName);
    injectFooter(footerHTML);
    applyConfig(cfg);
    updateTitle(cfg);
    injectFavicon(cfg);
    injectMetaDescription(cfg, pageName);
    injectSocialMeta(cfg, pageName);
    injectSchema(cfg);
  }).catch(function (err) {
    console.error('Site init failed:', err);
  });

  function injectHeader(html, page) {
    var el = document.getElementById('site-header');
    if (!el) return;
    el.outerHTML = html;

    document.querySelectorAll('#main-nav a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === page || (!page && href === 'index.html')) {
        a.classList.add('active');
      }
    });

    var toggle = document.querySelector('.nav-toggle');
    var nav    = document.getElementById('main-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
      toggle.textContent = isOpen ? '✕' : '☰';
    });

    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
      }
    });
  }

  function injectFooter(html) {
    var el = document.getElementById('site-footer');
    if (el) el.outerHTML = html;
  }

  function applyConfig(cfg) {
    document.querySelectorAll('[data-cfg]').forEach(function (el) {
      var key = el.dataset.cfg;
      if (cfg[key] !== undefined) el.textContent = cfg[key];
    });
    document.querySelectorAll('[data-cfg-href]').forEach(function (el) {
      var key = el.dataset.cfgHref;
      if (cfg[key] !== undefined) el.href = cfg[key];
    });
    document.querySelectorAll('[data-cfg-src]').forEach(function (el) {
      var key = el.dataset.cfgSrc;
      if (cfg[key] !== undefined) el.src = cfg[key];
    });
    document.querySelectorAll('[data-cfg-alt]').forEach(function (el) {
      var key = el.dataset.cfgAlt;
      if (cfg[key] !== undefined) el.alt = cfg[key];
    });
    renderHours(cfg);
    var yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  function renderHours(cfg) {
    var list = document.querySelector('[data-cfg-hours]');
    if (!list || !Array.isArray(cfg.hours)) return;
    list.innerHTML = '';
    cfg.hours.forEach(function (h) {
      var li  = document.createElement('li');
      var day = document.createElement('span');
      day.className   = 'day';
      day.textContent = h.day;
      var time = document.createElement('span');
      time.textContent = h.time;
      if (h.closed) time.className = 'closed';
      li.appendChild(day);
      li.appendChild(time);
      list.appendChild(li);
    });
  }

  function updateTitle(cfg) {
    if (cfg.name && document.title.indexOf('Nome Cognome') !== -1) {
      document.title = document.title.replace('Nome Cognome', cfg.name);
    }
  }

  function injectFavicon(cfg) {
    if (!cfg.favicon) return;
    var link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = cfg.favicon;
  }

  function injectMetaDescription(cfg, page) {
    var desc = cfg.page_descriptions && cfg.page_descriptions[page];
    if (!desc) return;
    var meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = desc;
  }

  // Open Graph (anteprima nelle condivisioni social/WhatsApp) + theme-color
  function injectSocialMeta(cfg, page) {
    var desc = (cfg.page_descriptions && cfg.page_descriptions[page]) || cfg.subtitle || '';
    var tags = {
      'og:title':       document.title,
      'og:description': desc,
      'og:type':        'website',
      'og:url':         location.href,
      'og:image':       new URL('graphics/profilepic.jpg', location.href).href
    };
    Object.keys(tags).forEach(function (prop) {
      var meta = document.querySelector('meta[property="' + prop + '"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', prop);
        document.head.appendChild(meta);
      }
      meta.content = tags[prop];
    });

    var theme = document.querySelector('meta[name="theme-color"]');
    if (!theme) {
      theme = document.createElement('meta');
      theme.name = 'theme-color';
      document.head.appendChild(theme);
    }
    theme.content = '#FFFFFF'; // come lo sfondo dell'header sticky
  }

  function injectSchema(cfg) {
    var schema = {
      '@context': 'https://schema.org',
      '@type': 'Psychologist',
      'name': cfg.name,
      'description': cfg.subtitle,
      'telephone': cfg.phone,
      'email': cfg.email,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': cfg.address_street,
        'addressLocality': cfg.city,
        'addressCountry': 'IT'
      }
    };
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(schema);
    document.head.appendChild(s);
  }
})();
