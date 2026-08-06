OpenWarnDE besteht aus:

- einer App für Mobilgeräte, Web und späteren App-Store-Einsatz
- einem Server, der öffentliche Gefährdungsdaten sammelt, pro Region auswertet und Warnungen auslöst

## Produktvision

Die Plattform soll:

- Öffentliche Warninformationen für Deutschland bereitstellen
- Unterstützung für Feuerwehr und Katastrophenschutz bieten
- Eine kartenbasierte Ansicht mit Live-Daten und Nutzerstandort bereitstellen
- Eine modulare Architektur haben, die sich leicht um neue Datenquellen, Modi und Warnkonzepte erweitern lässt

## Grundprinzipien

- Alle Datenquellen müssen öffentlich, offen und kostenlos verfügbar sein
- Die App soll kostenlos bleiben
- Der Server soll später zentral gehostet werden und regionale Risikoauswertungen bereitstellen
- Die App soll sowohl als Web-App als auch als native App nutzbar sein
- Die Karte zeigt ein interaktives **3D-Gelände** (Mapterhorn Raster-DEM-Tiles, schaltbar) und **3D-Gebäude**, die sich automatisch dem Gelände anpassen
- Ein geschützter Einsatzmodus soll für autorisierte Nutzer verfügbar sein

## Ziele der App

Die App soll:

- eine detaillierte 3D Karte bieten
- den eigenen Standort des Nutzers darstellen (inkl. Genauigkeitskreis)
- intuitive Kartensteuerungen bieten (Zoom In/Out, Kompass-Nordausrichtung Reset, 3D-Pitch Neigung Reset, Standort-Ortung)
- rechtliche Transparenz über ein Urheberchts- & Quellenmodal (OpenStreetMap ODbL, OpenFreeMap, MapLibre GL JS, Markenrechte) bieten
- Live-Daten anzeigen, wenn die App geöffnet ist
- Warnungen und Live-Gefährdungsdaten auf einer Karte anzeigen
- Hintergrund-Push-Nachrichten unterstützen, wenn die App installiert ist
- eine klare und erweiterbare Struktur für zukünftige Funktionen bieten

Die App wird mit CapacitorJS gebaut und nutzt dessen Plugins für:

- `@capacitor/geolocation` zur Standortabfrage
- Push-Benachrichtigungen für Warnmeldungen
- native App-Funktionalität im Web- und Mobilbetrieb

## Öffentliche Bereitstellung

Die Webanwendung ist nun öffentlich verfügbar unter https://openwarnde.web.app/. Dieser Dienst nutzt Firebase Hosting für die Bereitstellung und ermöglicht Nutzern den direkten Zugriff auf die Karte und ihre Funktionen ohne Installation. Die App kann über einen Browser genutzt werden und ist nun unter der oben genannten URL verfügbar.

## Betriebs- und Einsatzkonzept

Die App soll einen geschützten Einsatzmodus mit Aktivierungsschlüssel unterstützen. Dieser Modus bietet spezialisierte Ansichten und Werkzeuge für Einsatzkräfte und Katastrophenschutz.

## Dokumentation

[/docs/ARCHITECTURE.md](/docs/ARCHITECTURE.md)
[/docs/STYLEGUIDE.md](/docs/STYLEGUIDE.md)

### Deutschland-Grenze aktualisieren

Die statische Grenzdatei wird mit Overpass aktualisiert und anschließend von der App lokal ausgeliefert:

```bash
cd app
npm run update:germany-boundary
```

Der Standardabstand beträgt 10 m. Für eine andere Detailstufe oder eine Zielgröße können die Optionen verwendet werden:

```bash
npm run update:germany-boundary -- --space 3
npm run update:germany-boundary -- --size 10
npm run update:germany-boundary -- --points 10000
```

`--space` erwartet Meter, `--size` eine ungefähre Dateigröße in MB und `--points` eine feste Gesamtanzahl an Grenzpunkten. Die Modi sind gegenseitig exklusiv. Overpass wird nur beim manuellen Aktualisieren angesprochen, nicht im laufenden Betrieb.
