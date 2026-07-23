import type { Map as MapLibreMap } from "maplibre-gl";

const BUILDING_2D_LAYER_ID = "custom-buildings-2d";

/**
 * Setzt die Sichtbarkeit der 3D-Gebäude-Extrusion-Layer.
 * Bei aktiviertem Terrain passen sich die Gebäude automatisch dem Gelände an
 * (MapLibre GL JS berücksichtigt das Terrain für fill-extrusion automatisch).
 *
 * @param map     - MapLibre-Karteninstanz
 * @param visible - true = 3D-Gebäude sichtbar, false = 2D-Fallback
 * @param enabled - Globaler Feature-Toggle; wenn false, passiert nichts
 */
export function setBuildings3DVisible(
  map: MapLibreMap | null,
  visible: boolean,
  enabled: boolean = true
) {
  if (!enabled || !map) return;

  const style = map.getStyle();
  const layers = style?.layers ?? [];

  layers.forEach((layer) => {
    if (layer.type !== "fill-extrusion") return;

    map.setLayoutProperty(
      layer.id,
      "visibility",
      visible ? "visible" : "none"
    );
  });

  if (visible) {
    removeBuildings2DLayer(map, enabled);
  } else {
    addBuildings2DLayer(map, enabled);
  }
}

function getFirstSymbolLayerId(map: MapLibreMap): string | undefined {
  const layers = map.getStyle()?.layers;
  if (!layers) return undefined;
  for (const layer of layers) {
    if (layer.type === "symbol") {
      return layer.id;
    }
  }
  return undefined;
}

function addBuildings2DLayer(map: MapLibreMap, enabled: boolean = true) {
  if (!enabled || !map) return;
  if (map.getLayer(BUILDING_2D_LAYER_ID)) return;

  const firstSymbolId = getFirstSymbolLayerId(map);

  map.addLayer(
    {
      id: BUILDING_2D_LAYER_ID,
      type: "fill",
      source: "openmaptiles",
      "source-layer": "building",
      paint: {
        "fill-color": "#adadad",
        "fill-outline-color": "#9c9c9c",
        "fill-opacity": 0.65,
      },
    },
    firstSymbolId
  );
}

function removeBuildings2DLayer(map: MapLibreMap, enabled: boolean = true) {
  if (!enabled || !map) return;

  if (map.getLayer(BUILDING_2D_LAYER_ID)) {
    map.removeLayer(BUILDING_2D_LAYER_ID);
  }
}