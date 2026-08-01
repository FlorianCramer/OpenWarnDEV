import type { Map as MapLibreMap } from "maplibre-gl";

const TERRAIN_SOURCE_ID = "terrain-dem";

const TERRAIN_TILES_JSON_URL =
  "https://tiles.mapterhorn.com/tilejson.json";

/** Standard-Überhöhungsfaktor für das 3D-Gelände */
export const TERRAIN_EXAGGERATION = 1.5;

function addTerrainSource(map: MapLibreMap): void {
  if (map.getSource(TERRAIN_SOURCE_ID)) return;

  map.addSource(TERRAIN_SOURCE_ID, {
    type: "raster-dem",
    url: TERRAIN_TILES_JSON_URL,
  });
}

function removeTerrainSource(map: MapLibreMap): void {
  if (map.getSource(TERRAIN_SOURCE_ID)) {
    map.removeSource(TERRAIN_SOURCE_ID);
  }
}

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
