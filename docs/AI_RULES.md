# KI-Regeln für OpenWarnDE

Bei Änderungen an diesem Repository gilt:

## IMMER

- zuerst die vorhandene Struktur analysieren
- die kartenbasierte Architektur erhalten
- die Trennung zwischen App- und Server-Verantwortlichkeiten bewahren
- sowohl öffentliche als auch operative Anwendungsfälle unterstützen
- immer öffentliche, offene und kostenlose Datenquellen verwenden
- das Design an den Styleguide anlehnen
- neue Funktionen modular und erweiterbar gestalten
- in jeder funktion einen boolean wert legen das man die Funktion auch deaktivieren kann und dennoch alles funktioniert
- neue Kommunikationswege zwischen App und Server dokumentieren
- neue Architektur änderungen auch in den zuständigen [/docs](/docs/) files anpassen
- bei Umsetzung einer Anforderung aus [MAP_REQUIREMENTS.md](MAP_REQUIREMENTS.md) die zugehörige Checkbox abhaken
- [README.md](/README.md) immer aktuell halten
- Performance prüfen

## NIEMALS

- keine proprietären oder kostenpflichtigen Datenabhängigkeiten ohne Bedarf einführen
- die Karte nicht als primäre Oberfläche entfernen
- keine reinen Demo- oder Platzhalterfunktionen als Grundlage entwickeln
- operative Logik nicht ohne klare Erweiterungspunkte hart kodieren
- öffentliches und geschütztes Betriebsverhalten so mischen, dass die Sicherheit schwächt

## PRIORITÄT

1. Kartenfunktionen
2. Warnungsfunktion
3. UI-Overlays basis Layout
4. Web und Mobil haben den selben stand
5. Modi und operatives Framework
6. serverseitige Datenfusion und Kommunikationsflüsse
7. UI-Overlays detailversionen