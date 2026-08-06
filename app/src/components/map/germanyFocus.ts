import type { FeatureCollection, Polygon } from "geojson";
import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";

export const GERMANY_MASK_SOURCE_ID = "germany-focus-mask-source";
export const GERMANY_MASK_LAYER_ID = "germany-focus-mask";

const MASK_BOUNDS: [[number, number], [number, number]] = [[-20, 35], [35, 70]];

type Point = [number, number];
type StaticBoundary = { geometry: { coordinates: number[][][][] } };
const MAX_RENDER_POINTS = 24000;
let germanyBoundaryMemory: Point[][] | null = null;
let germanyBoundaryRequest: Promise<Point[][]> | null = null;
const LOG_PREFIX = "[GermanyFocus]";

function samePoint(a: Point, b: Point) {
  return Math.abs(a[0] - b[0]) < 0.00001 && Math.abs(a[1] - b[1]) < 0.00001;
}

function prepareRenderRings(rings: Point[][]): Point[][] {
  const totalPoints = rings.reduce((total, ring) => total + ring.length, 0);
  if (totalPoints <= MAX_RENDER_POINTS) return rings;

  const stride = Math.ceil(totalPoints / MAX_RENDER_POINTS);
  return rings.map((ring) => {
    const sampled = ring.filter((_, index) => index === 0 || index === ring.length - 1 || index % stride === 0);
    if (!samePoint(sampled[0], sampled[sampled.length - 1])) sampled.push(sampled[0]);
    return sampled;
  });
}

function loadGermanyBoundary(): Promise<Point[][]> {
  if (germanyBoundaryMemory) {
    console.info(`${LOG_PREFIX} Grenzdaten aus dem App-Speicher verwendet.`);
    return Promise.resolve(germanyBoundaryMemory);
  }
  if (!germanyBoundaryRequest) {
    const startedAt = performance.now();
    console.info(`${LOG_PREFIX} Lade statische Deutschland-Grenze …`);
    germanyBoundaryRequest = fetch("/germany-boundary.json")
      .then((response) => {
        console.info(`${LOG_PREFIX} Grenzdatei erreichbar (HTTP ${response.status}).`);
        if (!response.ok) throw new Error(`Statische Grenzdatei HTTP ${response.status}`);
        return response.json() as Promise<StaticBoundary>;
      })
      .then((boundary) => {
        const sourceRings = boundary.geometry.coordinates.flatMap((polygon) => polygon) as Point[][];
        const sourcePoints = sourceRings.reduce((total, ring) => total + ring.length, 0);
        const rings = prepareRenderRings(sourceRings);
        const renderPoints = rings.reduce((total, ring) => total + ring.length, 0);
        if (!rings.length) throw new Error("Keine Ringe in der statischen Deutschland-Grenze");
        germanyBoundaryMemory = rings;
        console.info(
          `${LOG_PREFIX} Grenzdaten geladen: ${sourcePoints.toLocaleString("de-DE")} → ` +
          `${renderPoints.toLocaleString("de-DE")} Renderpunkte in ` +
          `${Math.round(performance.now() - startedAt)} ms.`
        );
        return rings;
      })
      .finally(() => {
        germanyBoundaryRequest = null;
      });
  }
  return germanyBoundaryRequest;
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
  if (!map.isStyleLoaded()) {
    console.info(`${LOG_PREFIX} Grenzdaten geladen, warte noch auf den Kartenstil …`);
    const retry = () => {
      if (!map.isStyleLoaded()) return;
      map.off("styledata", retry);
      map.off("idle", retry);
      installGermanyMask(map, germanyRings);
    };
    map.on("styledata", retry);
    map.on("idle", retry);
    return;
  }

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
  console.info(`${LOG_PREFIX} Graue Länder-Maske aktiv.`);
}

export function applyGermanyFocus(map: MapLibreMap) {
  void loadGermanyBoundary().then((rings) => {
    installGermanyMask(map, rings);
  }).catch((error) => {
    console.warn(`${LOG_PREFIX} Statische Grenzmaske nicht geladen:`, error);
  });
}
