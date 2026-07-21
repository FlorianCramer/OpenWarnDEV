# Basiskarten-Anforderungen - OpenWarnDE

Diese Liste sammelt alle Anforderungen an die **Basiskarte** selbst (also die Kartenebenen/-inhalte in [/app](/app/),
unabhängig von Modi, Live-Daten oder Systemlogik). Erledigte Punkte werden in der Spalte "Eingebaut" mit `[x]`
abgehakt.

> Hinweis für KI-Tools (siehe auch [AI_RULES.md](/docs/AI_RULES.md)): Wird eine hier gelistete Anforderung umgesetzt,
> muss das zugehörige `[ ]` in der Tabelle auf `[x]` gesetzt werden. Neue Basiskarten-Anforderungen sind unter
> der passenden Kategorie als neue Tabellenzeile zu ergänzen. Anforderungen zu Modi, Live-Daten-Layern oder
> Systemlogik gehören NICHT in diese Datei.

# Basis

- [x] Kartenbasis von [OpenStreetMap](https://www.openstreetmap.org/)
- [ ] 3D-Gelände von [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/examples/3d-terrain/)
- [x] 3D-Gebäude von [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/examples/display-buildings-in-3d/)
- [ ] 3D-Brücken (an Gelände angepasst) aus OpenStreetMap-Daten
- [ ] 3D-Bäume aus OpenStreetMap-Daten (natural=tree, tree_row)
- [ ] 3D-Pflanzen und Vegetation aus OpenStreetMap-Daten (natural=scrub, grassland, heath, etc.)
- [x] Kartensteuerungs-Buttons (Zoom In/Out, Kompass-Reset, Pitch-Reset, Nutzerstandort via Capacitor Geolocation)
- [x] Info- & Urheberrechts-Modal (Attribution, Markenrechte & Notfallhinweise)
- [ ] 3D-Straßen (Brücken und Tunnel) aus OpenStreetMap-Daten
- [ ] 3D-Gewässer aus OpenStreetMap-Daten mit 2D Animationen in Fließrichtung (OpenStreetMap-Daten)
- [ ] 3D-Bäume und Vegetation per Instanced Rendering
- [ ] Automatische Höhenanpassung aller 3D-Objekte an das Terrain