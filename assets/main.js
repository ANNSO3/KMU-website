/* =========================================================================
   Annika Soto – annikasoto.de
   Verhalten der Startseite. Entspricht der Komponentenlogik des
   Design-Canvas-Prototyps, ohne Framework und ohne Build-Schritt.
   ========================================================================= */
(function () {
  'use strict';

  var EMAIL = 'anfrage@annikasoto.de';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------------------------------------------------------------- Einblenden
     Abschnitte mit [data-reveal] blenden beim Scrollen ein. Ohne
     IntersectionObserver bleibt alles sofort sichtbar. */
  function initReveal() {
    var nodes = $$('[data-reveal]');
    if (!nodes.length || !('IntersectionObserver' in window) || reduceMotion) return;

    var root = document.documentElement;
    root.classList.add('js-reveal');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    nodes.forEach(function (n) { io.observe(n); });

    // Sicherheitsnetz: nichts darf dauerhaft unsichtbar bleiben.
    window.setTimeout(function () {
      nodes.forEach(function (n) {
        n.classList.add('is-in');
        if (window.getComputedStyle(n).opacity !== '1') {
          n.style.transition = 'none';
          n.style.opacity = '1';
          n.style.transform = 'none';
        }
      });
    }, 1200);
  }

  /* ---------------------------------------------------------------- Referenzen */
  function initSlider() {
    var slides = $$('[data-slide]');
    if (slides.length < 2) return;

    var dots = $$('.slider-dot');
    var counter = $('[data-slider-counter]');
    var index = 0;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.hidden = n !== index; });
      dots.forEach(function (d, n) { d.setAttribute('aria-current', n === index ? 'true' : 'false'); });
      if (counter) counter.textContent = (index + 1) + ' / ' + slides.length;
    }

    document.addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-action="prev"], [data-action="next"], [data-go]');
      if (!btn) return;
      if (btn.hasAttribute('data-go')) show(parseInt(btn.getAttribute('data-go'), 10));
      else show(index + (btn.getAttribute('data-action') === 'next' ? 1 : -1));
    });

    show(0);
  }

  /* ---------------------------------------------------------------- Häufige Fragen
     Eine Antwort ist offen; ein erneuter Klick schließt sie wieder. */
  function initFaq() {
    var heads = $$('[data-faq]');
    if (!heads.length) return;

    function open(i) {
      heads.forEach(function (head) {
        var n = parseInt(head.getAttribute('data-faq'), 10);
        var on = n === i;
        head.setAttribute('aria-expanded', on ? 'true' : 'false');
        var panel = $('[data-faq-panel="' + n + '"]');
        if (panel) panel.hidden = !on;
        var sign = $('[data-faq-sign="' + n + '"]', head);
        if (sign) sign.textContent = on ? '−' : '+';
      });
    }

    heads.forEach(function (head) {
      var n = parseInt(head.getAttribute('data-faq'), 10);
      function toggle() { open(head.getAttribute('aria-expanded') === 'true' ? -1 : n); }
      head.addEventListener('click', toggle);
      head.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') {
          ev.preventDefault();
          toggle();
        }
      });
    });

    open(0);
  }

  /* ---------------------------------------------------------------- Kontakt-Umschalter */
  function initTabs() {
    var tabs = $$('.kontakt-tab');
    if (!tabs.length) return;

    function select(name) {
      tabs.forEach(function (tab) {
        var on = tab.getAttribute('data-tab') === name;
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.setAttribute('tabindex', on ? '0' : '-1');
        var panel = document.getElementById(tab.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab.getAttribute('data-tab')); });
      tab.addEventListener('keydown', function (ev) {
        var dir = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
        if (!dir) return;
        ev.preventDefault();
        var next = tabs[(i + dir + tabs.length) % tabs.length];
        select(next.getAttribute('data-tab'));
        next.focus();
      });
    });

    select('termin');
  }

  /* ---------------------------------------------------------------- Formulare
     Beide Formulare stellen die Anfrage im E-Mail-Programm der Besucherin
     oder des Besuchers zusammen; es werden keine Daten auf dieser Website
     gespeichert (siehe Datenschutzerklärung, Abschnitt „Anfrage über das
     Formular"). */
  function feldFehler(feld, text) {
    var vorhandenes = feld.parentNode.querySelector('.feld-fehler');
    if (text) {
      feld.setAttribute('aria-invalid', 'true');
      if (!vorhandenes) {
        var p = document.createElement('div');
        p.className = 'feld-fehler';
        p.textContent = text;
        feld.parentNode.appendChild(p);
      } else {
        vorhandenes.textContent = text;
      }
    } else {
      feld.removeAttribute('aria-invalid');
      if (vorhandenes) vorhandenes.remove();
    }
  }

  function pruefen(form) {
    var erstes = null;
    $$('input, textarea', form).forEach(function (feld) {
      var text = '';
      if (feld.required && !feld.value.trim()) text = 'Bitte ausfüllen.';
      else if (feld.type === 'email' && feld.value.trim() && !feld.checkValidity()) text = 'Bitte eine gültige E-Mail-Adresse angeben.';
      feldFehler(feld, text);
      if (text && !erstes) erstes = feld;
    });
    if (erstes) erstes.focus();
    return !erstes;
  }

  function mailtoOeffnen(betreff, zeilen) {
    window.location.href = 'mailto:' + EMAIL +
      '?subject=' + encodeURIComponent(betreff) +
      '&body=' + encodeURIComponent(zeilen.join('\n'));
  }

  function initFormular(formId, betreff, zeilenBauen) {
    var form = document.getElementById(formId);
    if (!form) return;

    var karte = form.closest('[data-state]').parentNode;
    var formBlock = form.closest('[data-state]');
    var dankBlock = $('[data-state$="-sent"]', karte);

    function absenden() {
      if (!pruefen(form)) return;

      var daten = new FormData(form);
      var g = function (k) { return (daten.get(k) || '').toString().trim(); };
      mailtoOeffnen(betreff, zeilenBauen(g));

      if (dankBlock) {
        formBlock.hidden = true;
        dankBlock.hidden = false;
        dankBlock.setAttribute('tabindex', '-1');
        dankBlock.focus();
      }
    }

    // Der Absendeknopf ist bewusst ein type="button": ohne JavaScript gäbe es
    // kein Ziel, und ein echtes Absenden würde die Eingaben in die URL und
    // damit in die Server-Protokolle schreiben.
    var knopf = $('[data-absenden]', form);
    if (knopf) knopf.addEventListener('click', absenden);

    form.addEventListener('submit', function (ev) { ev.preventDefault(); absenden(); });

    // Eingabetaste in einem einzeiligen Feld sendet ebenfalls.
    form.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Enter' || ev.target.tagName === 'TEXTAREA') return;
      ev.preventDefault();
      absenden();
    });

    $$('input, textarea', form).forEach(function (feld) {
      feld.addEventListener('input', function () {
        if (feld.getAttribute('aria-invalid') === 'true') feldFehler(feld, '');
      });
    });

    var zurueck = $('[data-action$="-reset"]', karte);
    if (zurueck && dankBlock) {
      zurueck.addEventListener('click', function () {
        form.reset();
        $$('input, textarea', form).forEach(function (f) { feldFehler(f, ''); });
        dankBlock.hidden = true;
        formBlock.hidden = false;
        var erstes = $('input', form);
        if (erstes) erstes.focus();
      });
    }
  }

  function initFormulare() {
    initFormular('form-entwurf', 'Kostenloser Entwurf über annikasoto.de', function (g) {
      return [
        'Unternehmen: ' + g('unternehmen'),
        'Ansprechpartner: ' + g('name'),
        'E-Mail: ' + g('email'),
        'Bestehende Website: ' + (g('website') || '—'),
        '',
        'Was die Website erreichen soll:',
        g('ziel') || '—'
      ];
    });

    initFormular('form-nachricht', 'Nachricht über annikasoto.de', function (g) {
      return [
        'Name: ' + g('name'),
        'E-Mail: ' + g('email'),
        'Telefon: ' + (g('telefon') || '—'),
        '',
        g('nachricht')
      ];
    });
  }

  /* ---------------------------------------------------------------- Cal.com
     Der Buchungskalender wird erst geladen, wenn der Kontaktabschnitt in
     Sichtweite kommt – bis dahin wird nichts an Cal.com übertragen. */
  function calLaden() {
    var el = document.getElementById('cal-erstgespraech');
    if (!el || el.dataset.geladen) return;
    el.dataset.geladen = '1';

    var link = el.getAttribute('data-cal-link') || 'annikasoto/30min';
    var platzhalter = el.firstElementChild;

    (function (C, A) {
      var p = function (a, ar) { a.q.push(ar); };
      var d = C.document;
      C.Cal = C.Cal || function () {
        var cal = C.Cal, ar = arguments;
        if (!cal.loaded) {
          cal.ns = {};
          cal.q = cal.q || [];
          d.head.appendChild(d.createElement('script')).src = A;
          cal.loaded = true;
        }
        if (ar[0] === 'init') {
          var api = function () { p(api, arguments); };
          var nm = ar[1];
          api.q = api.q || [];
          if (typeof nm === 'string') { (cal.ns[nm] = api) && p(api, ar); } else { p(cal, ar); }
          return;
        }
        p(cal, ar);
      };
    })(window, 'https://app.cal.com/embed/embed.js');

    window.Cal('init', { origin: 'https://app.cal.com' });
    window.Cal('inline', {
      elementOrSelector: '#cal-erstgespraech',
      calLink: link,
      config: { layout: 'month_view' }
    });
    window.Cal('ui', {
      theme: 'light',
      cssVarsPerTheme: { light: { 'cal-brand': '#174EA6' } },
      hideEventTypeDetails: false,
      layout: 'month_view'
    });

    var wacht = window.setInterval(function () {
      if (!el.querySelector('iframe')) return;
      window.clearInterval(wacht);
      wacht = null;
      if (platzhalter) platzhalter.style.display = 'none';
    }, 300);

    window.setTimeout(function () {
      if (wacht) window.clearInterval(wacht);
      if (el.querySelector('iframe') || !platzhalter) return;
      platzhalter.innerHTML =
        '<div style="font: 500 15px/22px \'Inter Tight\', sans-serif; color: #242426;">Kalender nicht erreichbar</div>' +
        '<div>Schreiben Sie mir kurz an <a href="mailto:' + EMAIL + '">' + EMAIL + '</a> oder rufen Sie an: ' +
        '<a href="tel:+4915222302562">+49 152 223 025 62</a>. Ich melde mich mit zwei Terminvorschlägen.</div>';
    }, 12000);
  }

  function initCal() {
    var kontakt = document.getElementById('kontakt');
    if (!kontakt) return;
    if (!('IntersectionObserver' in window)) { calLaden(); return; }

    var io = new IntersectionObserver(function (entries) {
      if (!entries.some(function (e) { return e.isIntersecting; })) return;
      io.disconnect();
      calLaden();
    }, { rootMargin: '200px 0px' });
    io.observe(kontakt);
  }

  /* ---------------------------------------------------------------- Start */
  function init() {
    initReveal();
    initSlider();
    initFaq();
    initTabs();
    initFormulare();
    initCal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
