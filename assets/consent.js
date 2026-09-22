/* =========================================================================
   Annika Soto – annikasoto.de
   Cookie-Hinweis mit zwei Ebenen und Google Analytics 4.

   Grundsatz: Vor einer aktiven Zustimmung wird nichts von Google geladen,
   kein Skript, kein Pixel, kein Cookie. Der Hinweis erscheint deshalb auch
   erst, wenn unten eine Mess-ID eingetragen ist – ohne ID setzt die Seite
   keine Cookies und ein Einwilligungsbanner wäre gegenstandslos.

   ------------------------------------------------------------------------
   HIER EINTRAGEN: die GA4-Mess-ID, Form "G-XXXXXXXXXX".
   Zu finden in Google Analytics unter
   Verwaltung → Datenstreams → Web-Datenstream → Mess-ID.
   Solange das Feld leer ist, bleibt die Website vollständig cookiefrei.
   ------------------------------------------------------------------------ */
var GA_MESS_ID = 'G-LWBW3FDEYD';

(function () {
  'use strict';

  var SPEICHER = 'as-einwilligung';
  var STAND = 2;              // hochzählen, wenn sich der Umfang ändert –
                              // dann wird erneut gefragt

  // Die Fehlerseite verlinkt absolut, die übrigen Seiten relativ. Statt das
  // zu raten, wird der Pfad von einem vorhandenen Link der Seite übernommen.
  function datenschutzUrl() {
    var vorhanden = document.querySelector('a[href$="datenschutz.html"]');
    return vorhanden ? vorhanden.getAttribute('href') : 'datenschutz.html';
  }

  /* ------------------------------------------------------------- Kategorien
     "Notwendig" steht nur zur Erklärung da – es gibt nichts abzuwählen und
     nichts einzuwilligen. Weitere Dienste kämen als zusätzlicher Eintrag
     dazu, die Einstellungen bauen sich aus dieser Liste auf. */
  var KATEGORIEN = [
    {
      schluessel: 'notwendig',
      titel: 'Notwendig',
      immerAn: true,
      text: 'Speichert allein Ihre Entscheidung aus diesem Hinweis, damit er ' +
            'nicht bei jedem Besuch erneut erscheint. Ohne diese Speicherung ' +
            'ließe sich Ihre Wahl nicht beachten.'
    },
    {
      schluessel: 'analyse',
      titel: 'Analyse',
      immerAn: false,
      text: 'Google Analytics zeigt mir, welche Seiten gelesen werden, damit ' +
            'ich sie verbessern kann. Dabei werden Cookies gesetzt und Daten ' +
            'an Google übertragen, auch in die USA.'
    }
  ];

  /* ------------------------------------------------------- Entscheidung merken
     Die Speicherung der Entscheidung ist selbst einwilligungsfrei (§ 25
     Abs. 2 Nr. 2 TDDDG). Im privaten Fenster kann der Zugriff scheitern –
     dann gilt schlicht "noch nicht gefragt". */
  function lesen() {
    try {
      var roh = window.localStorage.getItem(SPEICHER);
      if (!roh) return null;
      var wert = JSON.parse(roh);
      return wert && wert.stand === STAND ? wert : null;
    } catch (e) {
      return null;
    }
  }

  function schreiben(auswahl) {
    try {
      window.localStorage.setItem(SPEICHER, JSON.stringify({
        stand: STAND,
        zeit: new Date().toISOString(),
        kategorien: auswahl
      }));
    } catch (e) { /* ohne Speicher wird beim nächsten Aufruf erneut gefragt */ }
  }

  function analyseErlaubt() {
    var stand = lesen();
    return !!(stand && stand.kategorien && stand.kategorien.analyse);
  }

  /* ------------------------------------------------------------------ Google */
  var gaGeladen = false;

  function gaLaden() {
    if (gaGeladen || !GA_MESS_ID) return;
    gaGeladen = true;

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MESS_ID);
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_MESS_ID, {
      anonymize_ip: true,
      allow_google_signals: false,      // keine Werbe- und Zielgruppenfunktionen
      allow_ad_personalization_signals: false
    });
  }

  /* Beim Widerruf die bereits gesetzten Google-Cookies entfernen. Sie liegen
     je nach Einstiegspunkt auf der Domain und auf der Punkt-Variante. */
  function gaCookiesLoeschen() {
    var teile = window.location.hostname.split('.');
    var domains = [null];
    for (var i = 0; i < teile.length - 1; i++) domains.push('.' + teile.slice(i).join('.'));

    document.cookie.split(';').forEach(function (eintrag) {
      var name = eintrag.split('=')[0].trim();
      if (!/^(_ga|_gid|_gat)/.test(name)) return;
      domains.forEach(function (d) {
        document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT' +
          (d ? '; domain=' + d : '');
      });
    });
  }

  /* -------------------------------------------------------------- Bausteine */
  var FONT = "'Inter Tight', Helvetica, Arial, sans-serif";

  function el(tag, css, text) {
    var n = document.createElement(tag);
    if (css) n.setAttribute('style', css);
    if (text) n.textContent = text;
    return n;
  }

  var KNOPF_BASIS = 'font: 500 16px/20px ' + FONT + '; padding: 14px 24px; ' +
                    'border-radius: 999px; cursor: pointer; transition: background 200ms ease;';

  // "Nur notwendige" und "Alle akzeptieren" sind gleich groß und gleich gut
  // sichtbar – eine zurückhaltend gestaltete Ablehnung wäre keine echte Wahl.
  // "Einstellungen" führt weder zu Zustimmung noch zu Ablehnung und darf
  // deshalb schlichter auftreten.
  var KNOPF_ARTEN = {
    ablehnen: { aus: '#FFFFFF', auf: '#EBEFF5', schrift: '#242426', rand: '#242426' },
    annehmen: { aus: '#174EA6', auf: '#123C7F', schrift: '#FFFFFF', rand: '#174EA6' },
    still:    { aus: 'transparent', auf: '#EBEFF5', schrift: '#4D4F57', rand: 'transparent' }
  };

  function knopf(text, art) {
    var b = el('button', null, text);
    b.type = 'button';
    var s = KNOPF_ARTEN[art];

    function setzen(hintergrund) {
      b.setAttribute('style', KNOPF_BASIS +
        ' background: ' + hintergrund + '; color: ' + s.schrift +
        '; border: 1px solid ' + s.rand + ';' +
        (art === 'still' ? ' text-decoration: underline; text-underline-offset: 3px;'
                         : ' flex: 1 1 auto; min-width: 150px;'));
    }
    setzen(s.aus);
    b.addEventListener('mouseenter', function () { setzen(s.auf); });
    b.addEventListener('mouseleave', function () { setzen(s.aus); });
    return b;
  }

  function ueberschrift(text) {
    var h = el('h2', 'margin: 0; font: 400 clamp(20px, 2.2vw, 24px)/1.2 ' + FONT +
                     '; letter-spacing: -0.03em;', text);
    h.id = 'cookie-hinweis-titel';
    return h;
  }

  function knopfreihe() {
    return el('div', 'display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-top: 2px;');
  }

  /* ---------------------------------------------------------------- Oberfläche */
  var banner = null;
  var karte = null;
  var vorherFokussiert = null;
  var ausFusszeile = false;

  function karteLeeren() {
    while (karte.firstChild) karte.removeChild(karte.firstChild);
  }

  /* --------- Ebene 1: der Hinweis */
  function ebeneHinweis() {
    karteLeeren();

    var text = el('div', 'font: 400 16px/26px ' + FONT + '; color: #4D4F57;');
    text.appendChild(document.createTextNode(
      'Ich verwende notwendige Cookies für den Betrieb der Website. Mit Ihrer ' +
      'Einwilligung verwende ich zusätzlich Cookies zur Analyse und ' +
      'Verbesserung meines Angebots. '));
    var mehr = el('a', 'color: #174EA6;', 'Mehr in der Datenschutzerklärung');
    mehr.href = datenschutzUrl();
    text.appendChild(mehr);
    text.appendChild(document.createTextNode('.'));

    var reihe = knopfreihe();
    var nurNotwendig = knopf('Nur notwendige', 'ablehnen');
    var alle = knopf('Alle akzeptieren', 'annehmen');
    var einstellungen = knopf('Einstellungen', 'still');

    nurNotwendig.addEventListener('click', function () { speichern({ analyse: false }); });
    alle.addEventListener('click', function () { speichern({ analyse: true }); });
    einstellungen.addEventListener('click', ebeneEinstellungen);

    reihe.appendChild(nurNotwendig);
    reihe.appendChild(alle);
    reihe.appendChild(einstellungen);

    karte.appendChild(ueberschrift('Cookies'));
    karte.appendChild(text);
    karte.appendChild(reihe);
    nurNotwendig.focus();
  }

  /* --------- Ebene 2: die Einstellungen */
  function ebeneEinstellungen() {
    karteLeeren();
    var stand = lesen();

    var liste = el('div', 'display: flex; flex-direction: column;');
    var schalter = {};

    KATEGORIEN.forEach(function (kat, i) {
      var zeile = el('div', 'border-top: 1px solid rgba(36,36,38,0.12); padding: 18px 0;' +
        (i === KATEGORIEN.length - 1 ? ' border-bottom: 1px solid rgba(36,36,38,0.12);' : ''));

      var kopf = el('label', 'display: flex; align-items: center; gap: 12px; cursor: ' +
        (kat.immerAn ? 'default' : 'pointer') + ';');

      var haken = document.createElement('input');
      haken.type = 'checkbox';
      haken.setAttribute('style', 'width: 18px; height: 18px; margin: 0; flex: none; ' +
        'accent-color: #174EA6; cursor: ' + (kat.immerAn ? 'default' : 'pointer') + ';');
      if (kat.immerAn) {
        haken.checked = true;
        haken.disabled = true;
      } else {
        // Keine Vorauswahl: ohne gespeicherte Einwilligung bleibt der Haken leer.
        haken.checked = !!(stand && stand.kategorien && stand.kategorien[kat.schluessel]);
        schalter[kat.schluessel] = haken;
      }

      kopf.appendChild(haken);
      kopf.appendChild(el('span', 'font: 500 17px/24px ' + FONT + '; color: #242426;', kat.titel));
      if (kat.immerAn) {
        kopf.appendChild(el('span', 'font: 400 15px/24px ' + FONT + '; color: #9A9CA4;', 'immer aktiv'));
      }

      zeile.appendChild(kopf);
      zeile.appendChild(el('div', 'font: 400 15px/24px ' + FONT + '; color: #4D4F57; ' +
        'margin-top: 8px; padding-left: 30px;', kat.text));
      liste.appendChild(zeile);
    });

    var reihe = knopfreihe();
    var sichern = knopf('Auswahl speichern', 'ablehnen');
    var alle = knopf('Alle akzeptieren', 'annehmen');
    var zurueck = knopf(ausFusszeile ? 'Schließen' : 'Zurück', 'still');

    sichern.addEventListener('click', function () {
      speichern({ analyse: !!(schalter.analyse && schalter.analyse.checked) });
    });
    alle.addEventListener('click', function () { speichern({ analyse: true }); });
    zurueck.addEventListener('click', function () {
      if (ausFusszeile) bannerSchliessen(); else ebeneHinweis();
    });

    reihe.appendChild(sichern);
    reihe.appendChild(alle);
    reihe.appendChild(zurueck);

    karte.appendChild(ueberschrift('Einstellungen'));
    karte.appendChild(liste);
    karte.appendChild(reihe);

    var ersterSchalter = liste.querySelector('input:not([disabled])');
    (ersterSchalter || sichern).focus();
  }

  /* --------- Rahmen */
  function bannerZeigen(beiEinstellungen) {
    if (banner) return;
    ausFusszeile = !!beiEinstellungen;
    vorherFokussiert = document.activeElement;

    banner = el('div', 'position: fixed; left: 0; right: 0; bottom: 0; z-index: 60; ' +
                       'padding: 16px; display: flex; justify-content: center; pointer-events: none;');
    banner.id = 'cookie-hinweis';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-labelledby', 'cookie-hinweis-titel');

    karte = el('div', 'pointer-events: auto; width: 100%; max-width: 720px; box-sizing: border-box; ' +
                      'max-height: calc(100vh - 32px); overflow-y: auto; ' +
                      'background: #FFFFFF; border: 1px solid rgba(36,36,38,0.12); border-radius: 24px; ' +
                      'padding: clamp(20px, 3vw, 28px); display: flex; flex-direction: column; gap: 16px; ' +
                      'font-family: ' + FONT + '; color: #242426; ' +
                      'box-shadow: 0 1px 3px rgba(36,36,38,0.08), 0 30px 80px -40px rgba(36,36,38,0.45);');

    banner.appendChild(karte);
    document.body.appendChild(banner);

    if (beiEinstellungen) ebeneEinstellungen(); else ebeneHinweis();
  }

  function bannerSchliessen() {
    if (!banner) return;
    banner.remove();
    banner = null;
    karte = null;
    if (vorherFokussiert && vorherFokussiert.focus) vorherFokussiert.focus();
  }

  function speichern(auswahl) {
    var vorherErlaubt = analyseErlaubt();
    schreiben(auswahl);
    bannerSchliessen();

    if (auswahl.analyse) {
      gaLaden();
    } else {
      gaCookiesLoeschen();
      // Widerruf innerhalb derselben Sitzung: neu laden, damit nichts von
      // Google im Speicher zurückbleibt.
      if (vorherErlaubt && gaGeladen) { window.location.reload(); return; }
    }
    einstellungsLinkAktualisieren();
  }

  /* ------------------------------------------- Widerruf: Link in der Fußzeile
     Der Widerruf muss so einfach sein wie die Zustimmung. Der Link entsteht
     nur, wenn es tatsächlich etwas zu widerrufen gibt. */
  function einstellungsLinkAktualisieren() {
    var stand = lesen();
    document.querySelectorAll('[data-rechtslinks]').forEach(function (anker) {
      var vorhanden = anker.querySelector('[data-cookie-einstellungen]');
      if (vorhanden) vorhanden.remove();
      if (!stand) return;

      var k = el('button', null, 'Cookie-Einstellungen');
      k.type = 'button';
      k.setAttribute('data-cookie-einstellungen', '');

      // Optisch wie die Links daneben, damit die Fußzeile ruhig bleibt.
      var nachbar = anker.parentNode.querySelector('a');
      var farbe = nachbar ? window.getComputedStyle(nachbar).color : '#4D4F57';
      k.setAttribute('style', 'background: none; border: none; padding: 0; margin: 0; ' +
                              'cursor: pointer; font: inherit; text-align: left; color: ' + farbe + ';');

      k.addEventListener('click', function () { if (!banner) bannerZeigen(true); });
      anker.appendChild(k);
    });
  }

  /* ------------------------------------------------------------------- Start */
  function start() {
    // Ohne Mess-ID gibt es nichts, wofür eingewilligt werden müsste.
    if (!GA_MESS_ID) return;

    var stand = lesen();
    if (analyseErlaubt()) gaLaden();
    einstellungsLinkAktualisieren();
    if (!stand) bannerZeigen(false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  // Für Tests und für eine spätere Erweiterung um weitere Dienste.
  window.asEinwilligung = {
    stand: lesen,
    zeigen: bannerZeigen,
    setzen: speichern
  };
})();
