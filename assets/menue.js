/* =========================================================================
   Annika Soto – annikasoto.de
   Menü für schmale Bildschirme: unter 768 Pixeln liegt die Navigation hinter
   einem Burger-Knopf. Eigene Datei, weil die Rechtstexte dieselbe Kopfzeile
   haben, aber main.js nicht laden.

   Geöffnet wird nur über ein Attribut an der Kopfzeile – das Aussehen bleibt
   vollständig in assets/style.css.
   ========================================================================= */
(function () {
  'use strict';

  function init() {
    var knopf = document.querySelector('.menue-knopf');
    if (!knopf) return;
    var kopf = knopf.closest('header');
    var navi = document.getElementById('hauptnavigation');
    if (!kopf || !navi) return;

    function istOffen() {
      return kopf.getAttribute('data-menue') === 'offen';
    }

    function setzen(offen) {
      if (offen) kopf.setAttribute('data-menue', 'offen');
      else kopf.removeAttribute('data-menue');
      knopf.setAttribute('aria-expanded', offen ? 'true' : 'false');
      knopf.setAttribute('aria-label', offen ? 'Menü schließen' : 'Menü öffnen');
    }

    knopf.addEventListener('click', function () {
      setzen(!istOffen());
    });

    // Nach der Wahl eines Ziels schließen – sonst verdeckt das Menü genau die
    // Stelle, zu der gesprungen wurde.
    navi.addEventListener('click', function (ev) {
      if (ev.target.closest('a')) setzen(false);
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Escape' || !istOffen()) return;
      setzen(false);
      knopf.focus();
    });

    // Tippen neben die Kopfzeile schließt ebenfalls. Der Knopf selbst liegt
    // innerhalb und wird deshalb hier nicht erfasst.
    document.addEventListener('click', function (ev) {
      if (!istOffen() || kopf.contains(ev.target)) return;
      setzen(false);
    });

    // Wird das Fenster breit genug, übernimmt wieder die normale Navigation.
    window.addEventListener('resize', function () {
      if (istOffen() && window.innerWidth > 767) setzen(false);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
