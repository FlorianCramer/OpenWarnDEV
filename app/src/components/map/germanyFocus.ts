import type { FeatureCollection, Polygon } from "geojson";
import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";

export const GERMANY_MASK_SOURCE_ID = "germany-focus-mask-source";
export const GERMANY_MASK_LAYER_ID = "germany-focus-mask";

const MASK_BOUNDS: [[number, number], [number, number]] = [[-20, 35], [35, 70]];
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

type Point = [number, number];
type OverpassWay = {
  role?: string;
  geometry?: Array<{ lon: number; lat: number }>;
};

function samePoint(a: Point, b: Point) {
  return Math.abs(a[0] - b[0]) < 0.00001 && Math.abs(a[1] - b[1]) < 0.00001;
}

function joinOuterWays(ways: OverpassWay[]): Point[][] {
  const remaining = ways
    .filter((way) => way.role === "outer" && way.geometry && way.geometry.length > 1)
    .map((way) => way.geometry!.map(({ lon, lat }) => [lon, lat] as Point));
  const rings: Point[][] = [];

  while (remaining.length) {
    const ring = remaining.shift()!;
    while (!samePoint(ring[0], ring[ring.length - 1])) {
      const start = ring[0];
      const end = ring[ring.length - 1];
      const index = remaining.findIndex((segment) =>
        samePoint(start, segment[0]) || samePoint(start, segment[segment.length - 1]) ||
        samePoint(end, segment[0]) || samePoint(end, segment[segment.length - 1])
      );
      if (index < 0) break;

      const segment = remaining.splice(index, 1)[0];
      if (samePoint(end, segment[0])) ring.push(...segment.slice(1));
      else if (samePoint(end, segment[segment.length - 1])) {
        segment.reverse();
        ring.push(...segment.slice(1));
      } else if (samePoint(start, segment[segment.length - 1])) {
        ring.unshift(...segment.slice(0, -1));
      } else {
        segment.reverse();
        ring.unshift(...segment.slice(0, -1));
      }
    }
    if (samePoint(ring[0], ring[ring.length - 1]) && ring.length >= 4) rings.push(ring);
  }
  return rings;
}

async function loadGermanyBoundary(): Promise<Point[][]> {
  // Die feste OSM-Relations-ID verhindert eine teure Suche über alle
  // administrativen Relationen und vermeidet dadurch häufige Overpass-504er.
  const query = '[out:json][timeout:60];rel(51477);out geom;';
  const response = await fetch(`${OVERPASS_URL}?data=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error(`Overpass HTTP ${response.status}`);
  const data = await response.json() as { elements?: Array<{ members?: OverpassWay[] }> };
  const rings = joinOuterWays(data.elements?.[0]?.members ?? []);
  if (!rings.length) throw new Error("Keine geschlossene Deutschland-Grenze in der Overpass-Antwort");
  return rings;
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
  void loadGermanyBoundary().then((rings) => {
    if (map.isStyleLoaded()) installGermanyMask(map, rings);
  }).catch((error) => {
    console.warn("[GermanyFocus] Grenzmaske momentan nicht verfügbar:", error);
  });
}
