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
| `assets/menue.js`       | Burger-Menü unter 768 px (auf allen Seiten)                  |
| `assets/consent.js`     | Cookie-Banner und Google Analytics (auf allen Seiten)         |
| `bilder/`               | Bilder (PNG als Rückfallebene, WebP für die Auslieferung)     |
| `arrow-narrow-right.svg`| Pfeil-Icon als eigenständige Datei                            |
| `CNAME`                 | Eigene Domain für GitHub Pages                                |
| `.nojekyll`             | Schaltet die Jekyll-Verarbeitung von GitHub Pages ab          |
| `robots.txt`, `sitemap.xml` | Für Suchmaschinen                                         |

## QR-Codes

Zwei Landepunkte, je einer pro QR-Code:

| Adresse für den QR-Code | Landet auf | Zweck |
| --- | --- | --- |
| `https://annikasoto.de/startseite-qr` | Startseite | allgemeiner Code |
| `https://annikasoto.de/entwurf-qr` | Startseite, Abschnitt Entwurf | Code direkt aufs Formular |

Beide leiten sofort weiter und hängen UTM-Parameter an. Der Umweg über einen
eigenen Pfad hat einen Grund: Der Aufruf wird von Cloudflare gezählt, bevor
der Cookie-Hinweis erscheint. Die Zahl der Scans steht damit unabhängig von
einer Einwilligung in **Cloudflare → Analytics & Logs → Traffic**, aufgeschlüsselt
nach Pfad. In Google Analytics tauchen sie zusätzlich als Kampagne
`startseite` bzw. `entwurf` auf — dort aber nur für Besucher, die zugestimmt
haben.

Weitere Codes: in `build-scripts/qr_weiterleitungen.py` eine Zeile zur Liste
`ZIELE` hinzufügen und neu bauen. Wird ein Pfad dort umbenannt oder
gestrichen, entfernt der nächste Lauf den alten Ordner von selbst — erkannt
an einem Marker in der Datei, andere Ordner bleiben unberührt.

## Cache und Fingerabdrücke

Cloudflare und die Browser cachen CSS und JavaScript vier Stunden. Damit
Änderungen trotzdem sofort ankommen, hängt der Build an jede dieser Adressen
einen Fingerabdruck des Dateiinhalts:

```html
<link rel="stylesheet" href="assets/style.css?v=c3b5f91a">
```

Ändert sich der Inhalt, ändert sich die Adresse – alle sehen die neue Fassung
sofort, ohne Cache-Leerung. Ändert sich nichts, bleibt die Adresse gleich und
der Cache greift weiter. HTML wird von Cloudflare ohnehin nicht gecacht
(`cf-cache-status: DYNAMIC`), Textänderungen sind also immer sofort sichtbar.

Bilder tragen keinen Fingerabdruck. Wird ein Bild ausgetauscht, entweder den
Dateinamen ändern oder in Cloudflare unter Caching → Configuration einmal
"Purge Everything" drücken.

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
gab (Tastaturbedienung, Trefferflächen, Burger-Menü), stehen gesammelt oben
in der Datei und sind dort einzeln kommentiert.

### Menü auf schmalen Bildschirmen

Die Navigation hat fünf Einträge und umbricht unter rund 710 px auf drei
Zeilen. Unter **768 px** wandert sie deshalb hinter einen Burger-Knopf und
klappt darunter auf – die Kopfzeile bleibt einzeilig (70 statt 184 px) und
kann klebend bleiben. Am Desktop-Aussehen ändert sich nichts.

Das Menü schließt bei Klick auf einen Eintrag, mit Escape und beim Tippen
daneben. Geöffnet wird über `data-menue="offen"` an der Kopfzeile, das
Aussehen steckt vollständig in `assets/style.css`.

## Was noch zu tun ist

Die folgenden Schritte brauchen Zugriff auf die Konten und sind bewusst nicht
vorweggenommen.

### 1. Repository und GitHub Pages — erledigt

Das Repository ist [ANNSO3/KMU-website](https://github.com/ANNSO3/KMU-website),
öffentlich, Branch `main`. GitHub Pages ist aktiv (Source `main` / root), die
eigene Domain `annikasoto.de` ist eingetragen und `CNAME` liegt im
Wurzelverzeichnis.

In den Pages-Einstellungen steht dauerhaft die Fehlermeldung *„Both
annikasoto.de and its alternate name are improperly configured"*, und
**„Enforce HTTPS" bleibt ausgegraut. Beides ist erwartet und kann ignoriert
werden.** Seit die Domain über Cloudflare läuft (siehe Schritt 2), sieht
GitHubs Prüfung Cloudflare-Adressen statt der eigenen und meldet deshalb
Fehlkonfiguration. Das Zertifikat kommt von Cloudflare, GitHubs eigenes wird
nicht gebraucht.

Die Datei `CNAME` muss trotzdem im Wurzelverzeichnis bleiben – daran erkennt
GitHub, welche Seite unter diesem Domainnamen auszuliefern ist.

### 2. DNS und HTTPS — läuft über Cloudflare

**Wichtig, wenn Einträge geändert werden:** Die Nameserver der Domain zeigen
auf `apollo.ns.cloudflare.com` und `paris.ns.cloudflare.com`. Damit ist
Cloudflare autoritativ — alle Einträge gehören ins Cloudflare-Dashboard.
Einträge, die beim Registrar angelegt werden, haben keinerlei Wirkung, weil
sie nie abgefragt werden. Der Registrar hält nur die Delegation, also die
Angabe, welche Nameserver zuständig sind.

Soll-Zustand der Zone:

| Typ     | Name  | Ziel                    | Proxy        |
| ------- | ----- | ----------------------- | ------------ |
| `A`     | `@`   | `185.199.108.153`       | **Proxied**  |
| `A`     | `@`   | `185.199.109.153`       | **Proxied**  |
| `A`     | `@`   | `185.199.110.153`       | **Proxied**  |
| `A`     | `@`   | `185.199.111.153`       | **Proxied**  |
| `AAAA`  | `@`   | `2606:50c0:8000::153`   | **Proxied**  |
| `AAAA`  | `@`   | `2606:50c0:8001::153`   | **Proxied**  |
| `AAAA`  | `@`   | `2606:50c0:8002::153`   | **Proxied**  |
| `AAAA`  | `@`   | `2606:50c0:8003::153`   | **Proxied**  |
| `CNAME` | `www` | `annso3.github.io`      | **Proxied**  |
| `MX`, `TXT` | –  | IONOS, siehe Schritt 3  | DNS only     |

**HTTPS kommt von Cloudflare, nicht von GitHub.** GitHub hat für diese Domain
über Tage kein Zertifikat ausgestellt – die Prüfung schlug trotz nachweislich
korrektem DNS immer wieder fehl. Deshalb läuft der Verkehr jetzt durch
Cloudflare, das sein eigenes Zertifikat ausliefert.

Zugehörige Einstellungen:

- SSL/TLS → Overview → Encryption mode: **Full**
  Nicht „Flexible" (Strecke zu GitHub unverschlüsselt) und nicht
  „Full (strict)" – strict scheitert, weil GitHubs Zertifikat nicht auf diese
  Domain lautet. „Full" verschlüsselt die Strecke, prüft das Zertifikat aber
  nicht.
- SSL/TLS → Edge Certificates → **Always Use HTTPS**: an.

Sollte GitHub irgendwann doch ein Zertifikat ausstellen, kann auf
**Full (strict)** hochgestuft werden.

### 3. E-Mail — erledigt, läuft über IONOS

**Cloudflare Email Routing wird nicht gebraucht und darf nicht eingerichtet
werden.** Die Domain ist mailseitig bereits vollständig bei IONOS aufgesetzt:

```
MX     10 mx00.ionos.de
MX     10 mx01.ionos.de
SPF    v=spf1 include:_spf-eu.ionos.com ~all
DMARC  v=DMARC1; p=none;
```

Email Routing würde diese MX-Einträge ersetzen und damit das bestehende
Postfach vom Netz nehmen. Im Cloudflare-DNS also nichts an MX, SPF oder DMARC
ändern.

`anfrage@annikasoto.de` ist im IONOS-Kundenmenü angelegt. Kein DNS-Eingriff
nötig, Post von dieser Adresse ist durch das bestehende SPF gedeckt.

Zwei optionale Verbesserungen, beide im IONOS-Kundenmenü:

- **DKIM einschalten.** Derzeit ist keiner der üblichen Selektoren gesetzt.
  DKIM verbessert die Zustellbarkeit deutlich, gerade bei Erstkontakt-Mails an
  Firmen, die schärfer filtern.
- **DMARC später verschärfen.** `p=none` beobachtet nur und schützt nicht. Ein
  Wechsel auf `p=quarantine` lohnt sich, sobald DKIM läuft — vorher nicht,
  sonst landet eigene Post im Spam.

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

- **Vier AAAA-Einträge fehlen in Cloudflare.** Solange sie fehlen, geht
  GitHubs Domain-Prüfung nicht durch und die Zertifikatsanfrage startet nicht.
  Werte stehen in Schritt 2.
- **Drei Einstellungen im Google-Konto** fehlen noch: Aufbewahrungsdauer,
  Auftragsverarbeitungsvertrag, Google-Signale. Siehe Schritt 5 oben. Ohne sie
  stimmt Abschnitt 8 der Datenschutzerklärung nicht mit der Wirklichkeit
  überein.
- **Datenschutzerklärung, Abschnitt 8 (Google Analytics).** An die tatsächliche
  Umsetzung angepasst: Einwilligung nach § 25 Abs. 1 TDDDG, Widerruf über die
  Fußzeile, 14 Monate Aufbewahrung, abgeschaltete Werbefunktionen. Bitte
  gegenlesen und prüfen, ob die Angaben zu deinem GA-Konto passen.
- **Datenschutzerklärung, Abschnitt 3 (Hosting).** Beschreibt GitHub Pages,
  Fastly und Cloudflare in seiner tatsächlichen Rolle als CDN im Anfrageweg,
  einschließlich des Hinweises, dass die Verschlüsselung bei Cloudflare endet.
  Bitte gegenlesen und prüfen, ob zu allen dreien ein
  Auftragsverarbeitungsvertrag vorliegt — bei Cloudflare unter
  Konto → Rechtliches, bei GitHub in den Kontoeinstellungen.
- **Schriftart.** Inter Tight wird von Google Fonts geladen, wie im Entwurf
  angelegt; Abschnitt 7 der Datenschutzerklärung deckt das ab. Wer ganz ohne
  Verbindung zu Google auskommen möchte, legt die Schrift nach `assets/` und
  bindet sie per `@font-face` ein.
- **`bilder/mockup-showcase.png`** wird von keiner Seite verwendet.
  `mockup-hero.png` dient als Vorschaubild beim Teilen.
