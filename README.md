# annikasoto.de

Statische Website von Annika Soto, freiberufliche Produktdesignerin in
Frankfurt am Main. Reines HTML, CSS und JavaScript – kein Framework, kein
Build-Schritt. Dateien bearbeiten, committen, fertig.

Erzeugt aus den Design-Canvas-Prototypen im Ordner
`design_handoff_annikasoto_website` (Stand: September 2026).

## Inhalt

| Datei / Ordner          | Zweck                                                        |
| ----------------------- | ------------------------------------------------------------ |
| `index.html`            | Startseite                                                    |
| `datenschutz.html`      | Datenschutzerklärung                                          |
| `impressum.html`        | Impressum                                                     |
| `404.html`              | Fehlerseite (GitHub Pages liefert sie automatisch aus)        |
| `assets/style.css`      | Sämtliche Stile                                               |
| `assets/main.js`        | Slider, Fragen, Kontakt-Umschalter, Formulare, Cal.com        |
| `assets/dot-field.js`   | Punkteraster im Hero (Web Component <dot-field>)              |
| `assets/consent.js`     | Cookie-Banner und Google Analytics (auf allen Seiten)         |
| `bilder/`               | Bilder (PNG als Rückfallebene, WebP für die Auslieferung)     |
| `arrow-narrow-right.svg`| Pfeil-Icon als eigenständige Datei                            |
| `CNAME`                 | Eigene Domain für GitHub Pages                                |
| `.nojekyll`             | Schaltet die Jekyll-Verarbeitung von GitHub Pages ab          |
| `robots.txt`, `sitemap.xml` | Für Suchmaschinen                                         |

## Örtlich ansehen

```bash
python -m http.server 4173
```

Danach <http://localhost:4173> aufrufen. Ein Server wird gebraucht, weil der
Cal.com-Kalender und die Sprungmarken über `file://` nicht sauber laufen.

## Wie die Stile aufgebaut sind

Im Prototyp stand jede Gestaltungsangabe als `style="…"` direkt am Element.
Für die Produktion sind diese Angaben **unverändert** in Klassen verschoben
worden:

- `.s1` … `.s182` – die früheren Inline-Styles, Wert für Wert identisch,
  gleiche Angaben nur einmal abgelegt
- `.h1` … `.h10` – die früheren `style-hover`-Angaben
- `.f1` – die frühere `style-focus`-Angabe

Wer eine Farbe oder einen Abstand ändern möchte, sucht die Klasse am Element
und ändert sie in `assets/style.css`. Ergänzungen, die es im Prototyp nicht
gab (Tastaturbedienung, Trefferflächen, Kopfzeile auf dem Handy), stehen
gesammelt oben in der Datei und sind dort einzeln kommentiert.

## Was noch zu tun ist

Die folgenden Schritte brauchen Zugriff auf die Konten und sind bewusst nicht
vorweggenommen.

### 1. Repository und GitHub Pages — erledigt

Das Repository ist [ANNSO3/KMU-website](https://github.com/ANNSO3/KMU-website),
öffentlich, Branch `main`. GitHub Pages ist aktiv (Source `main` / root), die
eigene Domain `annikasoto.de` ist eingetragen und `CNAME` liegt im
Wurzelverzeichnis.

Offen ist nur noch **„Enforce HTTPS“**: GitHub stellt das Zertifikat erst aus,
wenn die Domain eine Weile erreichbar war. Sobald der Haken anklickbar ist
(Settings → Pages), setzen.

### 2. Cloudflare DNS — steht

Zone und Nameserver (`apollo` / `paris.ns.cloudflare.com`) sind gesetzt,
`annikasoto.de` und `www` zeigen auf die vier GitHub-Pages-Adressen. Zur
Kontrolle:

| Typ     | Name | Ziel                          | Proxy |
| ------- | ---- | ----------------------------- | ----- |
| `A`     | `@`  | `185.199.108.153`             | an    |
| `A`     | `@`  | `185.199.109.153`             | an    |
| `A`     | `@`  | `185.199.110.153`             | an    |
| `A`     | `@`  | `185.199.111.153`             | an    |
| `CNAME` | `www`| `<github-benutzername>.github.io` | an |

**Der Proxy steht derzeit auf „DNS only“ (graue Wolke) – und das ist im Moment
richtig so.** GitHub stellt das Let's-Encrypt-Zertifikat nur aus, wenn es die
Domain direkt erreicht. Erst wenn „Enforce HTTPS“ aktiv ist, die orange Wolke
einschalten und den SSL/TLS-Modus auf **Full (strict)** stellen. Andersherum
bleibt das Zertifikat hängen.

### 3. E-Mail

Cloudflare Email Routing für `anfrage@annikasoto.de` auf das private Postfach
einrichten. Alternative mit echtem Postfach: mailbox.org (rund 2,50 € im Monat).

Damit weitergeleitete Post nicht im Spam landet, die von Cloudflare
vorgeschlagenen SPF- und DMARC-Einträge mit übernehmen.

### 4. Cal.com

- Auftragsverarbeitungsvertrag abschließen.
- Der Kalender ist auf das Ereignis `annikasoto/30min` verlinkt. Steht in
  `index.html` am Element `#cal-erstgespraech` im Attribut `data-cal-link` und
  lässt sich dort ohne Eingriff ins JavaScript ändern.

### 5. Google Analytics scharf schalten

Der Einwilligungsbanner ist eingebaut und **aktiv**. Die Mess-ID
`G-LWBW3FDEYD` steht oben in `assets/consent.js`:

```js
var GA_MESS_ID = 'G-LWBW3FDEYD';
```

Wird das Feld geleert, verschwindet der Banner wieder und die Website ist
vollständig cookiefrei – praktisch, falls Analytics später doch entfallen soll.

Der Hinweis hat zwei Ebenen: zuerst **Nur notwendige / Alle akzeptieren /
Einstellungen**, dahinter die Einstellungen mit den Kategorien „Notwendig“
(immer aktiv, nicht abwählbar) und „Analyse“.

Was der Hinweis tut:

- Vor einer Zustimmung wird **nichts** von Google geladen – kein Skript, kein
  Cookie, keine Anfrage. Das ist der Punkt, an dem die meisten Banner-Lösungen
  scheitern.
- „Nur notwendige“ und „Alle akzeptieren“ sind gleich groß und gleich sichtbar,
  der Tastaturfokus liegt zuerst auf „Nur notwendige“. „Einstellungen“ tritt
  schlichter auf, weil es weder Zustimmung noch Ablehnung ist.
- In den Einstellungen ist **nichts vorausgewählt**. Vorangekreuzte Haken
  wären keine wirksame Einwilligung.
- Der Widerruf über „Cookie-Einstellungen“ in der Fußzeile öffnet direkt die
  Einstellungen, löscht die `_ga`-Cookies und lädt die Seite neu, damit nichts
  von Google im Speicher bleibt.
- Die Entscheidung liegt nur lokal im Browser (`localStorage`), nicht in einem
  Cookie und nicht auf einem Server.
- Weitere Dienste später: in `assets/consent.js` einen Eintrag in `KATEGORIEN`
  ergänzen und `STAND` um eins hochzählen – dann wird erneut gefragt.

Im Google-Konto sind noch drei Dinge einzustellen, weil Abschnitt 8 der
Datenschutzerklärung sie so beschreibt:

1. **Aufbewahrungsdauer auf 14 Monate** (Verwaltung → Dateneinstellungen →
   Datenaufbewahrung). Voreingestellt sind 2 Monate.
2. **Auftragsverarbeitungsvertrag akzeptieren** (Verwaltung →
   Kontoeinstellungen → Zusatz zur Datenverarbeitung).
3. **Google-Signale aus lassen** (Verwaltung → Datenerfassung). Das Skript
   schaltet sie clientseitig ab, der Kontoschalter ist davon unabhängig.

Nach dem Livegang einmal selbst prüfen: Seite aufrufen, „Alle akzeptieren“ klicken,
in Google Analytics unter **Berichte → Echtzeit** muss der Zugriff erscheinen.
Danach in Verwaltung → Datenstreams → Tag-Einstellungen die eigene IP als
internen Traffic ausschließen, damit die eigenen Besuche die Zahlen nicht
verfälschen.

Wenn du dich später doch gegen Analytics entscheidest: Mess-ID wieder leeren,
Abschnitt 8 der Datenschutzerklärung streichen, fertig.

### 6. Nach dem Livegang prüfen

```bash
dig annikasoto.de +short
dig www.annikasoto.de +short
curl -sI https://annikasoto.de | head -1
```

Dann im Browser: <https://annikasoto.de> aufrufen, Impressum und Datenschutz
öffnen, den Kalender laden lassen und beide Formulare einmal abschicken – sie
öffnen das E-Mail-Programm mit vorbereitetem Text und versenden nichts selbst.

## Offene Punkte für Annika

- **Drei Einstellungen im Google-Konto** fehlen noch: Aufbewahrungsdauer,
  Auftragsverarbeitungsvertrag, Google-Signale. Siehe Schritt 5 oben. Ohne sie
  stimmt Abschnitt 8 der Datenschutzerklärung nicht mit der Wirklichkeit
  überein.
- **Datenschutzerklärung, Abschnitt 8 (Google Analytics).** An die tatsächliche
  Umsetzung angepasst: Einwilligung nach § 25 Abs. 1 TDDDG, Widerruf über die
  Fußzeile, 14 Monate Aufbewahrung, abgeschaltete Werbefunktionen. Bitte
  gegenlesen und prüfen, ob die Angaben zu deinem GA-Konto passen.
- **Datenschutzerklärung, Abschnitt 3 (Hosting).** Neu ergänzt, mit GitHub
  Pages, Fastly und Cloudflare. Vor dem Livegang bitte gegenlesen und prüfen,
  ob zu allen dreien tatsächlich ein Auftragsverarbeitungsvertrag vorliegt.
- **Schriftart.** Inter Tight wird von Google Fonts geladen, wie im Entwurf
  angelegt; Abschnitt 7 der Datenschutzerklärung deckt das ab. Wer ganz ohne
  Verbindung zu Google auskommen möchte, legt die Schrift nach `assets/` und
  bindet sie per `@font-face` ein.
- **`bilder/mockup-showcase.png`** wird von keiner Seite verwendet.
  `mockup-hero.png` dient als Vorschaubild beim Teilen.
