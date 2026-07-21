# Architekturübersicht - OpenWarnDE

## Grundkonzept

OpenWarnDE ist eine modulare Karten- Warn- und Lageanzeigeplattform für Deutschland. Sie ist als zweigeteiltes System angelegt:

- eine Client-Anwendung für Bürgerinnen und Bürger sowie Einsatzkräfte
- ein zentraler Server, der Warnungen bewertet und verteilt

Die Architektur basiert auf fünf Kernaufgaben:

- Kartendarstellung
- modespezifisches Betriebsverhalten
- Datenintegration
- Warnungserzeugung
- Nutzerkommunikation

## Hauptkomponenten

### 1. App

Die App ist die nutzerseitige Schicht. Sie soll laufen als:

- Mobile App
- Web-App
- späterer App-Store-Einsatz

Ihre Aufgaben sind:

- Darstellung der Karte und Live-Overlays
- Anzeige des aktuellen Nutzerstandorts
- Empfang und Darstellung von Warnungen
- Verarbeitung von Hintergrund-Push-Nachrichten
- Wechsel zwischen Standardmodus und Einsatzmodus

Die App wird mit CapacitorJS umgesetzt. Dazu werden Capacitor-Plugins verwendet für:

- Geolocation zur Standortabfrage
- Push Notifications für Warnmeldungen
- native Funktionen für Web, Android und iOS

### 2. Server

Der Server ist die Intelligenzschicht. Er soll später zentral betrieben werden und Aufgaben übernehmen wie:

- Datenbeschaffung aus öffentlichen Quellen
- Normalisierung und Anreicherung
- regionale Zusammenführung und Bewertung
- Schwellenwertprüfung
- Versand von Push-Nachrichten
- Konfigurations- und Datenquellenverwaltung

Der Server wird mit Python entwickelt.

### 3. Datenschicht

Das System nutzt öffentliche und freie Datenquellen wie:

- Wetterwarnungen
- Radar- und Niederschlagsdaten
- Hochwasser- und Pegelinformationen
- Geländedaten und Höhenmodelle
- Waldbrand- und Feuergefahreninformationen
- Infrastruktur- und Expositionsdaten

Diese Daten werden zu einem regionalen Risikomodell zusammengeführt.

### 4. Warnschicht

Wenn ein berechneter Wert einen konfigurierten Schwellenwert überschreitet, sendet der Server eine Warnung über einen Push-Dienst. Die App empfängt die Benachrichtigung und kann die relevante Warnung direkt auf der Karte darstellen.

### 5. Web-Administrationsoberfläche

Der Server stellt eine Weboberfläche bereit, über die:

- Datenquellen
- Schwellenwerte und Regeln
- regionale Konfigurationen
- operative Einstellungen

verwaltet werden können.

Diese Oberfläche ist im Server-Netzwerk über Port 3000 erreichbar.

## Datenfluss

1. Öffentliche Datenquellen werden vom Server abgefragt.
2. Der Server normalisiert jede Quelle in eine gemeinsame Struktur.
3. Die Daten werden pro Region oder Kachel zusammengeführt.
4. Ein Risikowert wird für jedes Gebiet berechnet.
5. Warnungen werden erzeugt, wenn Schwellenwerte überschritten werden.
6. Push-Nachrichten werden an die App verteilt.
7. Die App zeigt die aktuelle Lage auf der Karte an.

## Kartenanforderungen

Die Karte ist die primäre Oberfläche. Sie soll unterstützen:

- 3D-Geländedarstellung
- vereinfachte 3D-Gebäude
- stilisierte, nicht texturierte Gebäudedarstellung
- klare Trennung von Warnlayern und operativen Overlays

## Erweiterbarkeit

Das System soll einfach erweiterbar bleiben. Neue Datenquellen, Warnmodelle, Kartenlayer und Betriebsmodi sollen über getrennte Module eingebunden werden statt über harte Kodierung.

## Betriebsmodus

Die App enthält einen Einsatzmodus, der über einen Schlüssel aktiviert werden kann. Dieser Modus bietet spezielle Ansichten für Feuerwehr, Katastrophenschutz und andere Einsatzorganisationen bei gleichbleibender Basisarchitektur.