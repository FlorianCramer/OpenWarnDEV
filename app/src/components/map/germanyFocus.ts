import type { FeatureCollection, Polygon } from "geojson";
import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";
import germanyBoundary from "@/src/data/germany-boundary.json";

export const GERMANY_MASK_SOURCE_ID = "germany-focus-mask-source";
export const GERMANY_MASK_LAYER_ID = "germany-focus-mask";

const MASK_BOUNDS: [[number, number], [number, number]] = [[-20, 35], [35, 70]];

type Point = [number, number];
const GERMANY_RINGS = germanyBoundary.geometry.coordinates.flatMap((polygon) => polygon) as unknown as Point[][];

function samePoint(a: Point, b: Point) {
  return Math.abs(a[0] - b[0]) < 0.00001 && Math.abs(a[1] - b[1]) < 0.00001;
}

function signedArea(ring: Point[]) {
  return ring.reduce((area, point, index) => {
    const next = ring[(index + 1) % ring.length];
    return area + point[0] * next[1] - next[0] * point[1];
  }, 0) / 2;
}

function makeMaskFeature(germanyRings: Point[][]): FeatureCollection<Polygon> {
  const [[minX, minY], [maxX, maxY]] = MASK_BOUNDS;
  const outerRing: Point[] = [
    [minX, minY], [minX, maxY], [maxX, maxY], [maxX, minY], [minX, minY],
  ];
  const holes = germanyRings.map((ring) => {
    const closed = samePoint(ring[0], ring[ring.length - 1]) ? [...ring] : [...ring, ring[0]];
    return signedArea(closed) < 0 ? closed.reverse() : closed;
  });
  return {
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      properties: null,
      geometry: { type: "Polygon", coordinates: [outerRing, ...holes] },
    }],
  };
}

function installGermanyMask(map: MapLibreMap, germanyRings: Point[][]) {
  const data = makeMaskFeature(germanyRings);
  const source = map.getSource(GERMANY_MASK_SOURCE_ID) as GeoJSONSource | undefined;
  if (source) {
    source.setData(data);
  } else {
    map.addSource(GERMANY_MASK_SOURCE_ID, { type: "geojson", data });
  }
  if (!map.getLayer(GERMANY_MASK_LAYER_ID)) {
    map.addLayer({
      id: GERMANY_MASK_LAYER_ID,
      type: "fill",
      source: GERMANY_MASK_SOURCE_ID,
      paint: { "fill-color": "#1f2937", "fill-opacity": 0.55 },
    });
  }
}

export function applyGermanyFocus(map: MapLibreMap) {
  installGermanyMask(map, GERMANY_RINGS);
}
