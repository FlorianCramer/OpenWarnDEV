import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const endpoint = "https://overpass-api.de/api/interpreter";
const outputFile = resolve("src/data/germany-boundary.json");
const query = '[out:json][timeout:60];rel(51477);out geom;';
const simplificationTolerance = 0.00025;

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    "content-type": "application/x-www-form-urlencoded",
    accept: "application/json",
    "user-agent": "OpenWarnDE-boundary-updater/1.0",
  },
  body: new URLSearchParams({ data: query }),
});
if (!response.ok) throw new Error(`Overpass HTTP ${response.status}`);

const data = await response.json();
const ways = (data.elements?.[0]?.members ?? [])
  .filter((member) => member.role === "outer" && member.geometry?.length > 1)
  .map((member) => member.geometry.map(({ lon, lat }) => [lon, lat]));

const samePoint = (a, b) => Math.abs(a[0] - b[0]) < 0.00001 && Math.abs(a[1] - b[1]) < 0.00001;
const squaredDistanceToSegment = (point, start, end) => {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  if (dx === 0 && dy === 0) return (point[0] - start[0]) ** 2 + (point[1] - start[1]) ** 2;
  const t = Math.max(0, Math.min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / (dx * dx + dy * dy)));
  const projection = [start[0] + t * dx, start[1] + t * dy];
  return (point[0] - projection[0]) ** 2 + (point[1] - projection[1]) ** 2;
};
const simplifyRing = (ring) => {
  const open = samePoint(ring[0], ring.at(-1)) ? ring.slice(0, -1) : ring;
  const keep = new Set([0, open.length - 1]);
  const limit = simplificationTolerance ** 2;
  const simplify = (start, end) => {
    let furthest = -1;
    let maximum = limit;
    for (let i = start + 1; i < end; i += 1) {
      const distance = squaredDistanceToSegment(open[i], open[start], open[end]);
      if (distance > maximum) { maximum = distance; furthest = i; }
    }
    if (furthest >= 0) {
      keep.add(furthest);
      simplify(start, furthest);
      simplify(furthest, end);
    }
  };
  simplify(0, open.length - 1);
  return [...open.filter((_, index) => keep.has(index)), open[0]];
};
const rings = [];

while (ways.length) {
  const ring = ways.shift();
  while (!samePoint(ring[0], ring.at(-1))) {
    const start = ring[0];
    const end = ring.at(-1);
    const index = ways.findIndex((segment) =>
      samePoint(start, segment[0]) || samePoint(start, segment.at(-1)) ||
      samePoint(end, segment[0]) || samePoint(end, segment.at(-1))
    );
    if (index < 0) break;

    const segment = ways.splice(index, 1)[0];
    if (samePoint(end, segment[0])) ring.push(...segment.slice(1));
    else if (samePoint(end, segment.at(-1))) ring.push(...segment.reverse().slice(1));
    else if (samePoint(start, segment.at(-1))) ring.unshift(...segment.slice(0, -1));
    else ring.unshift(...segment.reverse().slice(0, -1));
  }
  if (samePoint(ring[0], ring.at(-1)) && ring.length >= 4) rings.push(simplifyRing(ring));
}

if (!rings.length) throw new Error("Keine geschlossene Deutschland-Grenze gefunden");

const geojson = {
  type: "Feature",
  properties: { source: "OpenStreetMap", relation: 51477 },
  geometry: { type: "MultiPolygon", coordinates: rings.map((ring) => [ring]) },
};

await mkdir(dirname(outputFile), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(geojson)}\n`);
console.log(`Deutschland-Grenze geschrieben: ${outputFile} (${rings.length} Ring(e))`);
