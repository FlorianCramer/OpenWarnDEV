import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";

let currentMarker: maplibregl.Marker | null = null;
const ACCURACY_SOURCE_ID = "user-location-accuracy-source";
const ACCURACY_LAYER_ID = "user-location-accuracy-layer";

function createGeoJSONCircle(center: [number, number], radiusInMeters: number, points = 64) {
  const coords = {
    latitude: center[1],
    longitude: center[0],
  };

  const km = radiusInMeters / 1000;

  const ret: [number, number][] = [];
  const distanceX = km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
  const distanceY = km / 110.574;

  let theta: number, x: number, y: number;
  for (let i = 0; i < points; i++) {
    theta = (i / points) * (2 * Math.PI);
    x = distanceX * Math.cos(theta);
    y = distanceY * Math.sin(theta);
    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]);

  return {
    type: "Feature" as const,
    geometry: {
      type: "Polygon" as const,
      coordinates: [ret],
    },
    properties: {},
  };
}

export function updateUserLocationMarker(
  map: MapLibreMap | null,
  lng: number,
  lat: number,
  accuracy: number = 0,
  enabled: boolean = true
) {
  if (!enabled || !map) {
    removeUserLocationMarker(map, enabled);
    return;
  }

  // 1. DOM Marker erzeugen/aktualisieren
  if (!currentMarker) {
    const el = document.createElement("div");
    el.className = "relative flex items-center justify-center w-6 h-6";

    // Pulsierender Außenring
    const pulse = document.createElement("div");
    pulse.className =
      "absolute w-full h-full rounded-full bg-blue-500/40 animate-ping";
    el.appendChild(pulse);

    // Weißer Rand + blauer Punkt
    const dot = document.createElement("div");
    dot.className =
      "relative w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md";
    el.appendChild(dot);

    currentMarker = new maplibregl.Marker({ element: el })
      .setLngLat([lng, lat])
      .addTo(map);
  } else {
    currentMarker.setLngLat([lng, lat]);
  }

  // 2. Genauigkeitskreis-Source & Layer
  if (accuracy && accuracy > 0) {
    const circleData = createGeoJSONCircle([lng, lat], accuracy);

    const existingSource = map.getSource(ACCURACY_SOURCE_ID) as maplibregl.GeoJSONSource;
    if (existingSource) {
      existingSource.setData(circleData);
    } else {
      map.addSource(ACCURACY_SOURCE_ID, {
        type: "geojson",
        data: circleData,
      });

      map.addLayer({
        id: ACCURACY_LAYER_ID,
        type: "fill",
        source: ACCURACY_SOURCE_ID,
        paint: {
          "fill-color": "#3b82f6",
          "fill-opacity": 0.1,
        },
      });
    }
  }
}

/**
 * Entfernt den Standort-Marker und den Genauigkeitskreis von der Karte.
 */
export function removeUserLocationMarker(
  map: MapLibreMap | null,
  enabled: boolean = true
) {
  if (!enabled) return;

  if (currentMarker) {
    currentMarker.remove();
    currentMarker = null;
  }

  if (map) {
    if (map.getLayer(ACCURACY_LAYER_ID)) {
      map.removeLayer(ACCURACY_LAYER_ID);
    }
    if (map.getSource(ACCURACY_SOURCE_ID)) {
      map.removeSource(ACCURACY_SOURCE_ID);
    }
  }
}
