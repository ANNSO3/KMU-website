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

  /* ---------------------------------------------------------------- Punkteraster
     Dekorativer Hintergrund im Hero: ein ruhiges Raster aus Punkten, das
     auf den Mauszeiger reagiert. Rein visuell, daher aria-hidden. */
  function initDotField() {
    var canvas = document.querySelector('canvas.dot-field');
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext('2d');
    var d = canvas.dataset;
    var SIZE = parseFloat(d.dotSize) || 1.6;
    var SPACING = parseFloat(d.spacing) || 28;
    var COLOR = d.color || '#174EA6';
    var GLOW = parseFloat(d.glow) || 0;
    var NOISE = parseFloat(d.noise) || 0;
    var RADIUS = parseFloat(d.waveRadius) || 280;

    var rgb = (function (hex) {
      var m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
      return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [23, 78, 166];
    })(COLOR);
    var RGB = rgb[0] + ',' + rgb[1] + ',' + rgb[2];

    var punkte = [];
    var w = 0, h = 0;
    var zeiger = { x: -1e4, y: -1e4, aktiv: false };
    var start = 0;
    var laeuft = false;
    var rafId = null;

    // Deterministisches Rauschen, damit das Raster bei jedem Aufbau gleich aussieht.
    function rauschen(i, j) {
      var n = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453;
      return n - Math.floor(n);
    }

    function aufbauen() {
      var rect = canvas.getBoundingClientRect();
      w = Math.round(rect.width);
      h = Math.round(rect.height);
      if (!w || !h) return false;

      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      spriteBauen(dpr);

      punkte = [];
      var spalten = Math.ceil(w / SPACING) + 1;
      var zeilen = Math.ceil(h / SPACING) + 1;
      var randX = (w - (spalten - 1) * SPACING) / 2;
      var randY = (h - (zeilen - 1) * SPACING) / 2;

      for (var j = 0; j < zeilen; j++) {
        for (var i = 0; i < spalten; i++) {
          var r = rauschen(i, j);
          punkte.push({
            x: randX + i * SPACING,
            y: randY + j * SPACING,
            // Rauschen variiert Helligkeit und Phase, damit das Raster lebt.
            basis: 0.34 * (1 - NOISE * r),
            phase: r * Math.PI * 2
          });
        }
      }
      return true;
    }

    // Ein Punkt samt Schein wird einmal vorgezeichnet und danach nur noch
    // kopiert. Pro Punkt shadowBlur zu setzen wäre um Größenordnungen teurer.
    var sprite = null, spriteRand = 0, spriteMass = 0;

    function spriteBauen(dpr) {
      var maxGroesse = SIZE * 1.9;
      spriteRand = GLOW * 8 + 2;
      spriteMass = maxGroesse + spriteRand * 2;

      sprite = document.createElement('canvas');
      sprite.width = Math.ceil(spriteMass * dpr);
      sprite.height = Math.ceil(spriteMass * dpr);

      var s = sprite.getContext('2d');
      s.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (GLOW > 0) {
        s.shadowBlur = GLOW * 8;
        s.shadowColor = 'rgba(' + RGB + ',1)';
      }
      s.fillStyle = 'rgba(' + RGB + ',1)';
      s.beginPath();
      s.arc(spriteMass / 2, spriteMass / 2, maxGroesse / 2, 0, Math.PI * 2);
      s.fill();
    }

    function zeichnen(t) {
      ctx.clearRect(0, 0, w, h);

      for (var k = 0; k < punkte.length; k++) {
        var p = punkte[k];
        var alpha = p.basis;
        var groesse = SIZE;

        if (!reduceMotion) {
          // Ruhige, langsam durchlaufende Welle.
          alpha *= 0.72 + 0.28 * Math.sin(t * 0.0006 + p.phase + p.x * 0.004 + p.y * 0.006);
        }

        if (zeiger.aktiv) {
          var dx = p.x - zeiger.x;
          var dy = p.y - zeiger.y;
          var dist2 = dx * dx + dy * dy;
          if (dist2 < RADIUS * RADIUS) {
            var naehe = 1 - Math.sqrt(dist2) / RADIUS;
            naehe *= naehe;
            alpha += naehe * 0.55;
            groesse += naehe * SIZE * 0.9;
          }
        }

        if (alpha <= 0.01) continue;
        // Der Sprite enthält Punkt und Schein; skaliert wird über seine Kante.
        var mass = spriteMass * (groesse / (SIZE * 1.9));
        ctx.globalAlpha = alpha < 1 ? alpha : 1;
        ctx.drawImage(sprite, p.x - mass / 2, p.y - mass / 2, mass, mass);
      }
      ctx.globalAlpha = 1;
    }

    function schleife(ts) {
      if (!start) start = ts;
      zeichnen(ts - start);
      rafId = laeuft ? window.requestAnimationFrame(schleife) : null;
    }

    function starten() {
      if (laeuft || !punkte.length) return;
      laeuft = true;
      rafId = window.requestAnimationFrame(schleife);
    }

    function stoppen() {
      laeuft = false;
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = null;
    }

    var sichtbar = true;

    // Das Raster wird aus der tatsächlichen Größe des Elements aufgebaut.
    // Beim ersten Aufruf kann die noch 0 sein, deshalb hängt der Aufbau an
    // der Größenänderung und nicht am Zeitpunkt des Skriptstarts.
    function neuAufbauen() {
      if (!aufbauen()) return;
      if (reduceMotion) zeichnen(0);
      else if (sichtbar) starten();
    }

    if ('ResizeObserver' in window) {
      var groessenTimer = null;
      new ResizeObserver(function () {
        window.clearTimeout(groessenTimer);
        groessenTimer = window.setTimeout(neuAufbauen, 120);
      }).observe(canvas);
    } else {
      window.addEventListener('resize', neuAufbauen);
    }
    neuAufbauen();

    if (!reduceMotion) {
      // Nur animieren, solange der Hero sichtbar ist.
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            sichtbar = e.isIntersecting;
            sichtbar ? starten() : stoppen();
          });
        }, { threshold: 0 }).observe(canvas);
      }
      document.addEventListener('visibilitychange', function () {
        document.hidden || !sichtbar ? stoppen() : starten();
      });
    }

    // Feinzeiger (Maus/Trackpad) reagieren; auf Touch bleibt das Raster ruhig.
    if (window.matchMedia && window.matchMedia('(pointer: fine)').matches && !reduceMotion) {
      window.addEventListener('mousemove', function (ev) {
        var rect = canvas.getBoundingClientRect();
        zeiger.x = ev.clientX - rect.left;
        zeiger.y = ev.clientY - rect.top;
        zeiger.aktiv = zeiger.x > -RADIUS && zeiger.x < rect.width + RADIUS &&
                       zeiger.y > -RADIUS && zeiger.y < rect.height + RADIUS;
      }, { passive: true });
      document.addEventListener('mouseleave', function () { zeiger.aktiv = false; });
    }
  }

  /* ---------------------------------------------------------------- Start */
  function init() {
    initReveal();
    initSlider();
    initFaq();
    initTabs();
    initFormulare();
    initCal();
    initDotField();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
