# OpenWarnDE

OpenWarnDE besteht aus:

- einer App für Mobilgeräte, Web und späteren App-Store-Einsatz
- einem Server, der öffentliche Gefährdungsdaten sammelt, pro Region auswertet und Warnungen auslöst

## Produktvision

Die Plattform soll:

- öffentliche Warninformationen für Deutschland bereitstellen
- Unterstützung für Feuerwehr und Katastrophenschutz bieten
- eine kartenbasierte Ansicht mit Live-Daten und Nutzerstandort bereitstellen
- eine modulare Architektur haben, die sich leicht um neue Datenquellen, Modi und Warnkonzepte erweitern lässt

## Grundprinzipien

- Alle Datenquellen müssen öffentlich, offen und kostenlos verfügbar sein
- Die App soll kostenlos bleiben
- Der Server soll später zentral gehostet werden und regionale Risikoauswertungen bereitstellen
- Die App soll sowohl als Web-App als auch als native App nutzbar sein
- Die Karte soll ein detailiertes 3D-Gelände und 3D-Gebäude zeigen
- Ein geschützter Einsatzmodus soll für autorisierte Nutzer verfügbar sein

## Ziele der App

Die App soll:

- eine Detailierte 3D Karte sein
- den eigenen Standort des Nutzers darstellen
- Live-Daten anzeigen, wenn die App geöffnet ist
- Warnungen und Live-Gefährdungsdaten auf einer Karte anzeigen
- Hintergrund-Push-Nachrichten unterstützen, wenn die App installiert ist
- eine klare und erweiterbare Struktur für zukünftige Funktionen bieten

Die App wird mit CapacitorJS gebaut und nutzt dessen Plugins für:

- Standortabfrage
- Push-Benachrichtigungen
- native App-Funktionalität im Web- und Mobilbetrieb

## Ziele des Servers

Der Server soll:

- Daten aus mehreren offenen Quellen sammeln
- diese normalisieren und zusammenführen
- für Kartenbereiche oder Regionen einen Bewertungswert berechnen
- Push-Nachrichten auslösen, wenn Schwellenwerte überschritten werden
- eine Web-Oberfläche zur Verwaltung von Datenquellen und Konfigurationen auf Port 3000 bereitstellen

Der Server wird mit Python gebaut und dient als zentrale Auswertungs- und Kommunikationsschicht.

## Betriebs- und Einsatzkonzept

Die App soll einen geschützten Einsatzmodus mit Aktivierungsschlüssel unterstützen. Dieser Modus bietet spezialisierte Ansichten und Werkzeuge für Einsatzkräfte und Katastrophenschutz.

## Dokumentation

[/docs/ARCHITECTURE.md](/docs/ARCHITECTURE.md)
[/docs/STYLEGUIDE.md](/docs/STYLEGUIDE.md)