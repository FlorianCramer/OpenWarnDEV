import type { Map as MapLibreMap } from "maplibre-gl";

/**
 * Source-ID für die Terrain-RGB-Höhendaten.
 */
const TERRAIN_SOURCE_ID = "terrain-dem";

/**
 * Offizielle MapLibre Demo Terrain-Tiles (TileJSON-Endpoint).
 *
 * Dies ist exakt die gleiche Quelle wie im offiziellen MapLibre-Beispiel:
 * https://maplibre.org/maplibre-gl-js/docs/examples/3d-terrain/
 *
 * Datenbasis: JAXA ALOS World 3D (AW3D30) – 30m Auflösung, weltweit.
 * Encoding: mapbox (Terrain-RGB), Standard-Encoding in MapLibre.
 * Kostenlos & öffentlich, kein API-Key erforderlich.
 */
const TERRAIN_TILES_JSON_URL =
  "https://tiles.mapterhorn.com/tilejson.json";

/** Standard-Überhöhungsfaktor für das 3D-Gelände */
export const TERRAIN_EXAGGERATION = 1.5;

/**
 * Fügt die Terrain-DEM-Quelle zur Karte hinzu, falls noch nicht vorhanden.
 *
 * Nutzt TileJSON-URL (wie das offizielle MapLibre-Beispiel) für maximale
 * Kompatibilität und automatische Konfiguration (Encoding, Bounds, Attribution).
 * tileSize 512 liefert schärfere Höhendaten als 256.
 */
function addTerrainSource(map: MapLibreMap): void {
  if (map.getSource(TERRAIN_SOURCE_ID)) return;

  map.addSource(TERRAIN_SOURCE_ID, {
    type: "raster-dem",
    url: TERRAIN_TILES_JSON_URL,
    // tileSize: 512,
    // Encoding wird automatisch aus dem TileJSON geladen (mapbox/Terrain-RGB)
  });
}

/**
 * Entfernt die Terrain-DEM-Quelle von der Karte.
 * Muss nach dem Deaktivieren des Terrains aufgerufen werden.
 */
function removeTerrainSource(map: MapLibreMap): void {
  if (map.getSource(TERRAIN_SOURCE_ID)) {
    map.removeSource(TERRAIN_SOURCE_ID);
  }
}

/**
 * Aktiviert das 3D-Gelände auf der Karte.
 * Fügt die DEM-Quelle hinzu und setzt das terrain-Property der Karte.
 *
 * @param map          - MapLibre-Karteninstanz
 * @param exaggeration - Höhenübertreibungsfaktor (Standard: 1.5)
 * @param enabled      - Globaler Feature-Toggle; wenn false, passiert nichts
 */
export function enableTerrain(
  map: MapLibreMap | null,
  exaggeration: number = TERRAIN_EXAGGERATION,
  enabled: boolean = false
): void {
  if (!enabled || !map) return;

  addTerrainSource(map);

  map.setTerrain({
    source: TERRAIN_SOURCE_ID,
    exaggeration,
  });
}

/**
 * Deaktiviert das 3D-Gelände auf der Karte.
 * Entfernt das terrain-Property und die DEM-Quelle.
 *
 * @param map     - MapLibre-Karteninstanz
 * @param enabled - Globaler Feature-Toggle; wenn false, passiert nichts
 */
export function disableTerrain(
  map: MapLibreMap | null,
  enabled: boolean = true
): void {
  if (!enabled || !map) return;

  // Terrain-Property entfernen (null setzt das Gelände zurück auf flach)
  map.setTerrain(null);

  // Quelle erst nach einem Tick entfernen, damit MapLibre sie freigeben kann
  setTimeout(() => {
    try {
      removeTerrainSource(map);
    } catch {
      // Ignorieren, falls die Quelle bereits entfernt wurde
    }
  }, 100);
}

/**
 * Setzt den Terrain-Zustand abhängig vom `visible`-Flag.
 * Primäre Steuerfunktion für den Store-Reaktivitätsfluss.
 *
 * @param map          - MapLibre-Karteninstanz
 * @param visible      - true = Terrain an, false = Terrain aus
 * @param exaggeration - Höhenübertreibungsfaktor
 * @param enabled      - Globaler Feature-Toggle
 */
export function setTerrainVisible(
  map: MapLibreMap | null,
  visible: boolean,
  exaggeration: number = TERRAIN_EXAGGERATION,
  enabled: boolean = true
): void {
  if (!enabled || !map) return;

  if (visible) {
    enableTerrain(map, exaggeration, enabled);
  } else {
    disableTerrain(map, enabled);
  }
}
