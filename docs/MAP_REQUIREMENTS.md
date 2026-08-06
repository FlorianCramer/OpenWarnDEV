# Basiskarten-Anforderungen - OpenWarnDE

Diese Liste sammelt alle Anforderungen an die **Basiskarte** selbst (also die Kartenebenen/-inhalte in [/app](/app/),
unabhängig von Modi, Live-Daten oder Systemlogik). Erledigte Punkte werden in der Spalte "Eingebaut" mit `[x]`
abgehakt.

Bei offenen Punkten steht jeweils *Quelle* (kostenlose/öffentliche Datenquelle, per TypeScript abrufbar) und
*Umsetzung* (technischer Ansatz) dabei. Gemäß [AI_RULES.md](/docs/AI_RULES.md) braucht **jede** neue Funktion
zusätzlich einen Boolean-Schalter, über den sie sich deaktivieren lässt, ohne dass etwas anderes kaputtgeht –
das gilt für alle unten genannten Punkte und wird der Kürze halber nicht bei jedem einzeln wiederholt.

> Hinweis für KI-Tools (siehe auch [AI_RULES.md](/docs/AI_RULES.md)): Wird eine hier gelistete Anforderung umgesetzt,
> muss das zugehörige `[ ]` in der Tabelle auf `[x]` gesetzt werden. Neue Basiskarten-Anforderungen sind unter
> der passenden Kategorie als neue Tabellenzeile zu ergänzen. Anforderungen zu Modi, Live-Daten-Layern oder
> Systemlogik gehören NICHT in diese Datei.

# Basis

- [x] Kartenbasis von [OpenStreetMap](https://www.openstreetmap.org/)
- [x] 3D-Gelände von [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/examples/3d-terrain/)
- [x] 3D-Gebäude von [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/examples/display-buildings-in-3d/)
- [x] Kartensteuerungs-Buttons (Zoom In/Out, Kompass-Reset, Pitch-Reset, Nutzerstandort via Capacitor Geolocation)
- [x] Info- & Urheberrechts-Modal (Attribution, Markenrechte & Notfallhinweise)

- [ ] **3D-Brücken (an Gelände angepasst) aus OpenStreetMap-Daten**
  - *Quelle:* [Overpass API](https://overpass-api.de/) (kostenlos, kein Key nötig) – Abfrage nach `way[bridge=yes]` inkl. `layer`, `min_height`, `height`-Tags.
  - *Umsetzung:* Overpass-Response in TS parsen → GeoJSON bauen → als `fill-extrusion`-Layer rendern. Basishöhe je Endpunkt per `map.queryTerrainElevation()` an das Gelände anpassen.

- [ ] **3D-Bäume aus OpenStreetMap-Daten (natural=tree, tree_row)**
  - *Quelle:* Overpass API – `node[natural=tree]` und `way[natural=tree_row]`.
  - *Umsetzung:* Nur Punktdaten, keine Höhe in OSM enthalten → sinnvolle Standardhöhe je nach `genus`/`leaf_type`-Tag schätzen. Rendering siehe Punkt "Instanced Rendering" unten – einzelne Meshes sind bei tausenden Bäumen zu teuer.

- [ ] **3D-Pflanzen und Vegetation aus OpenStreetMap-Daten (natural=scrub, grassland, heath, etc.)**
  - *Quelle:* Zuerst prüfen, ob der genutzte OpenFreeMap-Liberty-Style (bzw. dessen `openmaptiles`-Vector-Tiles) bereits eine `landcover`-Layer mit diesen Klassen mitliefert – dann reicht Styling ohne Zusatz-Request. Sonst Overpass API als Fallback.
  - *Umsetzung:* Flächen als eingefärbte `fill`-Layer mit Pattern-Textur, kein 3D nötig – passend zum stilisierten, nicht-fotorealistischen Look aus [ARCHITECTURE.md](/docs/ARCHITECTURE.md).

- [ ] **3D-Straßen (Brücken und Tunnel) aus OpenStreetMap-Daten**
  - *Quelle:* Wie bei 3D-Brücken – zuerst Vector-Tile-Properties prüfen, sonst Overpass API (`way[highway][bridge=yes]` bzw. `[tunnel=yes]`).
  - *Umsetzung:* Brücken als leicht angehobene Linien, Tunnel als gestrichelte/abgedunkelte Linie unterhalb des Geländes.

- [ ] **3D-Gewässer aus OpenStreetMap-Daten mit 2D-Animationen in Fließrichtung**
  - *Quelle:* Overpass API – `way[waterway=river]`, `way[waterway=stream]`. Fließrichtung ergibt sich aus der OSM-Linienrichtung (zeigt stromabwärts).
  - *Umsetzung:* Custom-WebGL-Shader (MapLibre `CustomLayerInterface`) mit scrollender Flow-Textur entlang der Linie.

- [ ] **3D-Bäume und Vegetation per Instanced Rendering**
  - *Quelle:* Baumdaten wie oben (Overpass), ein freies glTF-Baummodell reicht (z. B. [Poly Haven](https://polyhaven.com/), CC0).
  - *Umsetzung:* `THREE.InstancedMesh` in einem MapLibre-Custom-Layer, alternativ [deck.gl](https://deck.gl/) `ScenegraphLayer` (Instancing eingebaut). Bei tausenden Objekten ist Instancing Pflicht für die Performance.

- [ ] **Automatische Höhenanpassung aller 3D-Objekte an das Terrain**
  - *Quelle:* kein externer Request – `map.queryTerrainElevation(lngLat)` ist in MapLibre GL JS eingebaut.
  - *Umsetzung:* Zentrale Hilfsfunktion `getTerrainHeight(lng, lat)`, die alle Layer (Bäume, Brücken, Landmarken, Gebäude) einheitlich nutzen. Vermutlich verwandt mit dem bekannten Verhalten, dass sich Gebäudehöhen beim Zuschalten des 3D-Geländes aktuell unrealistisch verändern – beim Umsetzen gegenprüfen.

- [ ] **Stilisierte, nicht-texturierte Gebäude-Schattierung**
  - *Quelle:* keine externe Datenquelle, reines Styling der bestehenden 3D-Gebäude-Layer (aus dem OpenFreeMap-Liberty-Style bzw. der eigenen 2D/3D-Umschaltung in `buildingsLayer.ts`).
  - *Umsetzung:* `fill-extrusion-vertical-gradient` + `map.setLight()` mit weichem Richtungslicht statt hartem Standardlicht. Dies ist bereits explizit als Zielbild in [ARCHITECTURE.md](/docs/ARCHITECTURE.md) festgehalten ("stilisierte, nicht texturierte Gebäudedarstellung") – dieser Punkt konkretisiert nur die technische Umsetzung dafür.

- [ ] **Landmarken-Hervorhebung (Kirchen, Rathäuser, Krankenhäuser, Feuerwachen)**
  - *Quelle:* Overpass API – `building=church`, `amenity=townhall`, `amenity=hospital`, `amenity=fire_station` etc.
  - *Umsetzung:* Eigene Symbol-/Mini-Modell-Layer ab bestimmter Zoomstufe. Für alle Nutzer sichtbar (öffentlicher Nutzen), keine BOS-exklusive Funktion.

- [ ] **Weiche Kamera-Übergänge (Easing) bei Zoom, Pitch und Rotation**
  - *Quelle:* keine externe Datenquelle.
  - *Umsetzung:* `map.easeTo()`/`map.flyTo()` mit custom Easing-Funktion statt Standardsprüngen.

- [ ] **Tag-/Nachtzyklus mit dynamischem Himmel & Beleuchtung**
  - *Quelle:* keine API nötig – Sonnenstand clientseitig berechnen, z. B. mit dem freien npm-Paket [`suncalc`](https://www.npmjs.com/package/suncalc).
  - *Umsetzung:* `map.setSky()`/`map.setLight()` je nach berechnetem Sonnenstand nachführen. Zusätzlich mit dem App-weiten Light-/Dark-Mode aus [STYLEGUIDE.md](/docs/STYLEGUIDE.md) koppeln, sodass Karten- und UI-Darstellung nicht auseinanderlaufen.

- [ ] **Kartensteuerung: Satelliten-Ansicht umschaltbar**
  - *Quelle:* frei nutzbare Satelliten-/Luftbild-Kacheln, z. B. [Esri World Imagery](https://www.esri.com/en-us/arcgis/products/arcgis-image-services) (kostenlos für Web-Maps mit Attribution) – Lizenzbedingungen vor Umsetzung final prüfen.
  - *Umsetzung:* Zusätzlicher Toggle im Kartensteuerungs-Panel (siehe Steuerungs-Tabelle in [STYLEGUIDE.md](/docs/STYLEGUIDE.md)), der zwischen Vector- und Raster-Satelliten-Style wechselt.

- [x] **Fokus auf Deutschland: andere Länder ausgegraut, Navigation eingegrenzt**
  - *Quelle:* Als GeoJSON exportierte Deutschland-Grenze aus der Overpass-OSM-Relation `51477`.
  - *Umsetzung:* Die Grenze wird mit `npm run update:germany-boundary` aktualisiert und als `public/germany-boundary.json` versioniert. Standardmäßig wird die Geometrie mit maximal 10 m Punktabstand erzeugt. Für andere Detailstufen: `npm run update:germany-boundary -- --space 3`, größenorientiert `npm run update:germany-boundary -- --size 10` oder mit fester Gesamtpunktzahl `npm run update:germany-boundary -- --points 10000`. Die drei Modi sind gegenseitig exklusiv. Die App lädt ausschließlich diese statische Datei und zeichnet daraus die invertierte Maskierungs-Fläche als nativen MapLibre-`fill`-Layer; im Betrieb gibt es keinen Overpass-Request.

- [ ] **Performance-Optimierung des 3D-Geländes**
  - *Quelle:* keine neue Datenquelle – betrifft die bestehenden Mapterhorn-Terrain-Tiles.
  - *Umsetzung:* Terrain-`exaggeration` und Tile-Detailgrad zoomabhängig reduzieren, Terrain bei sehr niedrigem Zoom ggf. ganz deaktivieren (in Kombination mit dem bereits vorhandenen Terrain-Toggle in `terrainLayer.ts`).

- [ ] **Kartenausschnitte lokal cachen (Vorstufe zur Offline-Karte)**
  - *Quelle:* keine neue Datenquelle – Caching der bereits geladenen Vector-Tiles.
  - *Umsetzung:* Service-Worker-Cache (Web) bzw. Capacitor-Filesystem-Plugin (nativ) für bereits gesehene Tiles, mit sinnvollem Ablauf-/Größenlimit.

# Erweitert

- [ ] **Animierte Züge, Busse und Bahnen auf Schienen/Straßen anhand der Fahrplandaten und deren Routen**
  - *Quelle:* [GTFS.de](https://gtfs.de/) (Delfi-Verbund, deutschlandweite GTFS-Daten, kostenlos) für Fahrplan/Routen, ergänzend [DB Open Data](https://data.deutschebahn.com/) für Fernverkehr. GTFS-Realtime-Feeds für Live-Positionen.
  - *Umsetzung:* Statische GTFS-Daten (Routen-Shapes) einmalig laden/cachen. Realtime-Feed (Protobuf) mit [`gtfs-realtime-bindings`](https://www.npmjs.com/package/gtfs-realtime-bindings) parsen, Positionen zwischen Updates linear interpolieren.

# BOS Mode

- [ ] **Flurstücke**
  - *Quelle:* Bundesweit uneinheitlich – ALKIS-Katasterdaten sind Ländersache. Einige Bundesländer stellen sie als freie WFS bereit (z. B. [Open.NRW](https://www.opengeodata.nrw.de/) für NRW). Für Sachsen: [Geodatenportal Sachsen (GeoSN)](https://www.geodaten.sachsen.de/) prüfen, ob Flurstücke dort offen abrufbar sind – Lizenzstand vor Umsetzung verifizieren.
  - *Umsetzung:* Pro Bundesland eigener WFS-Adapter mit gemeinsamem GeoJSON-Zielformat, schrittweiser Rollout Bundesland für Bundesland statt auf einen bundesweiten Datensatz zu warten.

- [ ] **Hydranten & Löschwasserentnahmestellen**
  - *Quelle:* OSM/Overpass API – `node[emergency=fire_hydrant]` (Über-/Unterflurhydranten), `node[emergency=suction_point]` und `node[emergency=fire_water_pond]` (Löschwasserbrunnen/-teiche).
  - *Umsetzung:* Eigener Symbol-Layer, nur im BOS Mode sichtbar, mit unterschiedlichen Icons je Hydranten-Typ (`fire_hydrant:type`-Tag, sofern gepflegt).

- [ ] **Rettungspunkte (Wald-/Gelände-Rettungspunkte)**
  - *Quelle:* OSM/Overpass API – `node[emergency=access_point]` mit `ref`-Tag (in Deutschland verbreitetes Rettungspunkt-Schema).
  - *Umsetzung:* Symbol-Layer mit der Rettungspunkt-Kennung als Label, damit Einsatzkräfte sie direkt an die Leitstelle durchgeben können.

- [ ] **Feuerwehrzufahrten & Aufstellflächen**
  - *Quelle:* OSM/Overpass API – `highway=service` mit `service=emergency_access`, ggf. `emergency=fire_service_inlet` je nach lokalem Tagging-Stand.
  - *Umsetzung:* Eigene Linien-/Flächen-Hervorhebung, nur im BOS Mode sichtbar; Datenlage regional unterschiedlich gut gepflegt, daher als "best effort"-Layer einplanen statt als verlässliche Vollabdeckung.

- [ ] **Sammelplätze / Notfall-Treffpunkte**
  - *Quelle:* OSM/Overpass API – `node[emergency=assembly_point]`.
  - *Umsetzung:* Symbol-Layer analog zu den anderen BOS-Punkten, gemeinsame Basis-Komponente für Icon+Popup wiederverwenden statt pro Layer neu zu bauen.
