import type { Map as MapLibreMap } from "maplibre-gl";

const BUILDING_2D_LAYER_ID = "custom-buildings-2d";

export function setBuildings3DVisible(
  map: MapLibreMap,
 visible: boolean,
) {
  const layers = map.getStyle().layers ?? [];

  // 3D-Layer umschalten
  layers.forEach((layer) => {
    if (layer.type !== "fill-extrusion") return;

    map.setLayoutProperty(
      layer.id,
      "visibility",
      visible ? "visible" : "none",
    );
  });

  if (visible) {
    removeBuildings2DLayer(map);
  } else {
    addBuildings2DLayer(map);
  }
}

function addBuildings2DLayer(map: MapLibreMap) {
  if (map.getLayer(BUILDING_2D_LAYER_ID)) return;

  map.addLayer({
    id: BUILDING_2D_LAYER_ID,
    type: "fill",
    source: "openmaptiles",
    "source-layer": "building",
    paint: {
      "fill-color": "#d9d9d9",
      "fill-opacity": 0.9,
      "fill-outline-color": "#b5b5b5",
    },
  });
}

function removeBuildings2DLayer(map: MapLibreMap) {
  if (map.getLayer(BUILDING_2D_LAYER_ID)) {
    map.removeLayer(BUILDING_2D_LAYER_ID);
  }
}