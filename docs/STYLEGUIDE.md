# OpenWarnDE - Styleguide der App

Dieser Leitfaden beschreibt die visuellen und interaktiven Grundsätze für die OpenWarnDE-App. Ziel ist eine klare, strukturierte und operative Oberfläche für zwei Nutzergruppen:

- die breite Öffentlichkeit
- Feuerwehren und Katastrophenschutzteams (Behörden)

Die Oberfläche soll auf Mobilgeräten, Tablets und im Web gut funktionieren und die Karte stets in den Mittelpunkt stellen.

## Grundprinzipien des Designs

OpenWarnDE soll wirken:

- einfach und strukturiert
- gut lesbar in stressigen Situationen
- ruhig statt laut
- operativ nutzbar
- konsistent über alle Geräte hinweg

Das Design soll sowohl öffentliche Warnungen als auch spezialisierte Modusansichten unterstützen, ohne visuell überladen zu wirken.

## Visuelle Sprache

Die App nutzt ein begrenztes und zentrales Farbsystem.

### Basisfarben

| Verwendung                 | Information                       | Light Background | Light Hover            | Light Text         | Dark Background          | Dark Hover                     | Dark Text               |
| -------------------------- | --------------------------------- | ---------------- | ---------------------- | ------------------ | ------------------------ | ------------------------------ | ----------------------- |
| **Primär** (Blau)          | Navigation und Hauptaktionen      | `bg-blue-700`    | `hover:bg-blue-800`    | `text-white`       | `dark:bg-blue-600`       | `dark:hover:bg-blue-700`       | `dark:text-white`       |
| **Sekundär** (Grau)        | Struktur und Panels               | `bg-gray-100`    | `hover:bg-gray-200`    | `text-gray-900`    | `dark:bg-gray-800`       | `dark:hover:bg-gray-700`       | `dark:text-gray-100`    |
| **Erfolg** (Grün)          | Sichere oder normale Zustände     | `bg-emerald-50`  | `hover:bg-emerald-100` | `text-emerald-700` | `dark:bg-emerald-950/50` | `dark:hover:bg-emerald-900/50` | `dark:text-emerald-400` |
| **Warnung** (Orange)       | Erhöhte Gefahr / Alerts           | `bg-amber-50`    | `hover:bg-amber-100`   | `text-amber-800`   | `dark:bg-amber-950/50`   | `dark:hover:bg-amber-900/50`   | `dark:text-amber-400`   |
| **Gefahr** (Rot)           | Kritische Warnungen / Fehler      | `bg-rose-50`     | `hover:bg-rose-100`    | `text-rose-700`    | `dark:bg-rose-950/50`    | `dark:hover:bg-rose-900/50`    | `dark:text-rose-400`    |
| **Information** (Hellblau) | Neutrale Informationen / Hinweise | `bg-blue-50`     | `hover:bg-blue-100`    | `text-blue-700`    | `dark:bg-blue-950/50`    | `dark:hover:bg-blue-900/50`    | `dark:text-blue-400`    |


Regeln:

- nur vordefinierte Farben verwenden (Basisfarbentabelle)
- Farbverwendung über Module hinweg konsistent halten
- dekorative Verläufe und übermäßige Effekte vermeiden

## Karten-first-Erfahrung

Die Karte ist das primäre Interfacelement.

Anforderungen:

- die Karte bleibt die dominante sichtbare Ebene
- Overlay-Steuerelemente dürfen wichtige Karteninhalte nicht blockieren
- die Karte soll 3D-Gelände und vereinfachte 3D-Gebäude unterstützen
- das Karten-Design soll sich an Licht- und Dunkelmodus anpassen

## Layoutprinzipien

- mobile-first Layout
- Tablets nutzen Split- oder Seitenpanel-Layouts
- Desktop kann Mehrpanel-Layouts verwenden


## Kartensteuerungen

Kartensteuerungen sollten an vorhersehbaren und ergonomischen Stellen platziert werden. Dadurch bleiben die wichtigsten Aktionen schnell erreichbar, ohne das Sichtfeld auf der Karte zu überladen.

| Steuerungselement         | Position     | Bedingungen / Modus     | Steuerungstyp      | Flowbite Icon Name(n)                       |
| ------------------------- | ------------ | ----------------------- | ------------------ | ------------------------------------------- |
| **Zoom (In / Out)**       | Rechts unten | Immer sichtbar          | Button-Duo (+/-)   | `plus-outline` & `minus-outline`            |
| **Karten-Info & Quellen** | Links unten  | Immer sichtbar          | Info-Button / Text | `info-circle-outline`                       |
| **Mein Standort**         | Mittig unten | GPS verfügbar           | Button (Toggle)    | `locate-outline` oder `map-pin-alt-outline` |
| **Kompass (Ausrichtung)** | Mittig unten | Immer sichtbar          | Anzeige / Button   | `compass-outline`                           |
| **Pitch-Control (3D)**    | Mittig unten | 3D-Ansicht verfügbar    | Button (Toggle)    | `cube-outline` oder `layers-outline`        |
| **Ereignis-Standort**     | Mittig unten | Nur im **Einsatzmodus** | Aktions-Button     | `map-pin-outline`                           |


## Interaktionsprinzipien

- klare Priorisierung kritischer Warnungen
- einfache Navigation zwischen Karte, Warnungen und modusbezogenen Ansichten
- schnelle Reaktion auf Touch- und Pointer-Eingaben
- vorhersehbares Verhalten in Standard- und Einsatzmodus

## Design des Einsatzmodus

Der Einsatzmodus sollte dieselbe visuelle Struktur wie der öffentliche Modus nutzen. Nur Inhalte, Layer und Werkzeuge ändern sich. Dadurch bleibt das System verständlich und wartbar.

## Regeln für UI-Komponenten

- einfache systemnahe Icons bevorzugen
- dekorative Icon-Sets vermeiden
- einheitliche Beschriftungen und Statusdarstellungen verwenden
- Panels kompakt und funktional halten

## Zusammenfassung

Die OpenWarnDE-Oberfläche soll immer wirken:

- sauber
- strukturiert
- zuverlässig
- leicht verständlich
- geeignet für öffentliche und operative Nutzung