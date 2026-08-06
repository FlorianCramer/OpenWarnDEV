import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const endpoint = "https://overpass-api.de/api/interpreter";
const outputFile = resolve("public/germany-boundary.json");
const query = '[out:json][timeout:60];rel(51477);out geom;';

const args = process.argv.slice(2);
const readOption = (name) => {
  const index = args.indexOf(name);
  return index < 0 ? null : Number(args[index + 1]);
};
const requestedSpace = readOption("--space");
const requestedSizeMb = readOption("--size");
const requestedPoints = readOption("--points");
const selectedOptions = [requestedSpace, requestedSizeMb, requestedPoints].filter((value) => value !== null);
if (selectedOptions.length > 1) {
  throw new Error("Bitte nur eine von --space, --size oder --points verwenden.");
}
if (requestedSpace !== null && (!Number.isFinite(requestedSpace) || requestedSpace <= 0)) {
  throw new Error("--space muss eine positive Meterzahl sein, z. B. --space 3.");
}
if (requestedSizeMb !== null && (!Number.isFinite(requestedSizeMb) || requestedSizeMb <= 0)) {
  throw new Error("--size muss eine positive MB-Zahl sein, z. B. --size 10.");
}
if (requestedPoints !== null && (!Number.isInteger(requestedPoints) || requestedPoints < 32)) {
  throw new Error("--points muss eine ganze Zahl ab 32 sein, z. B. --points 10000.");
}

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
const distanceMeters = (a, b) => {
  const latitude = ((a[1] + b[1]) / 2) * Math.PI / 180;
  const dx = (b[0] - a[0]) * Math.cos(latitude) * 111320;
  const dy = (b[1] - a[1]) * 110540;
  return Math.sqrt(dx * dx + dy * dy);
};
const densifyRing = (ring, maximumSpacingMeters) => {
  const result = [];
  for (let i = 0; i < ring.length - 1; i += 1) {
    const start = ring[i];
    const end = ring[i + 1];
    const steps = Math.max(1, Math.ceil(distanceMeters(start, end) / maximumSpacingMeters));
    for (let step = 0; step < steps; step += 1) {
      const ratio = step / steps;
      result.push([
        start[0] + (end[0] - start[0]) * ratio,
        start[1] + (end[1] - start[1]) * ratio,
      ]);
    }
  }
  result.push(ring.at(-1));
  return result;
};
const ringLength = (ring) => ring.slice(0, -1).reduce(
  (total, point, index) => total + distanceMeters(point, ring[index + 1]),
  0
);
const resampleRing = (ring, pointCount) => {
  const open = ring.slice(0, -1);
  const lengths = open.map((point, index) => distanceMeters(point, open[(index + 1) % open.length]));
  const perimeter = lengths.reduce((total, length) => total + length, 0);
  const result = [];
  let segment = 0;
  let segmentStart = 0;
  for (let index = 0; index < pointCount; index += 1) {
    const target = perimeter * index / pointCount;
    while (segment < lengths.length - 1 && segmentStart + lengths[segment] < target) {
      segmentStart += lengths[segment];
      segment += 1;
    }
    const ratio = lengths[segment] === 0 ? 0 : (target - segmentStart) / lengths[segment];
    const start = open[segment];
    const end = open[(segment + 1) % open.length];
    result.push([start[0] + (end[0] - start[0]) * ratio, start[1] + (end[1] - start[1]) * ratio]);
  }
  result.push(result[0]);
  return result;
};
const resampleRings = (sourceRings, targetPointCount) => {
  const minimumPointsPerRing = 4;
  if (targetPointCount < sourceRings.length * minimumPointsPerRing) {
    throw new Error(`--points muss mindestens ${sourceRings.length * minimumPointsPerRing} Punkte erlauben.`);
  }
  const targetOpenPoints = targetPointCount - sourceRings.length;
  const totalLength = sourceRings.reduce((total, ring) => total + ringLength(ring), 0);
  const counts = sourceRings.map((ring) => Math.max(3, Math.round(targetOpenPoints * ringLength(ring) / totalLength)));
  let difference = targetOpenPoints - counts.reduce((total, count) => total + count, 0);
  for (let index = 0; difference !== 0; index = (index + 1) % counts.length) {
    if (difference > 0) { counts[index] += 1; difference -= 1; }
    else if (counts[index] > 3) { counts[index] -= 1; difference += 1; }
  }
  return sourceRings.map((ring, index) => resampleRing(ring, counts[index]));
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
  if (samePoint(ring[0], ring.at(-1)) && ring.length >= 4) rings.push(ring);
}

if (!rings.length) throw new Error("Keine geschlossene Deutschland-Grenze gefunden");

const makeGeoJson = (spacing, pointTarget = null) => ({
  type: "Feature",
  properties: {
    source: "OpenStreetMap",
    relation: 51477,
    maximumSpacingMeters: spacing,
    requestedPoints: pointTarget,
  },
  geometry: {
    type: "MultiPolygon",
    coordinates: (pointTarget === null ? rings.map((ring) => densifyRing(ring, spacing)) : resampleRings(rings, pointTarget))
      .map((ring) => [ring]),
  },
});

let spacing = requestedSpace ?? 10;
let serialized;

if (requestedPoints !== null) {
  serialized = JSON.stringify(makeGeoJson(null, requestedPoints));
} else if (requestedSizeMb !== null) {
  const targetBytes = requestedSizeMb * 1024 * 1024;
  let lower = 0.1;
  let upper = 1000;
  let best = JSON.stringify(makeGeoJson(upper));
  let bestSpacing = upper;

  // Größter Detailgrad, der unter dem gewünschten Größenlimit bleibt.
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidateSpacing = (lower + upper) / 2;
    const candidate = JSON.stringify(makeGeoJson(candidateSpacing));
    if (candidate.length <= targetBytes) {
      spacing = candidateSpacing;
      best = candidate;
      bestSpacing = candidateSpacing;
      upper = candidateSpacing;
    } else {
      lower = candidateSpacing;
    }
  }
  spacing = bestSpacing;
  serialized = best;
} else {
  serialized = JSON.stringify(makeGeoJson(spacing));
}

const output = `${serialized}\n`;
const outputGeometry = JSON.parse(serialized).geometry;
const outputPointCount = outputGeometry.coordinates.reduce(
  (total, polygon) => total + polygon[0].length,
  0
);

if (requestedSizeMb !== null && Buffer.byteLength(output) > requestedSizeMb * 1024 * 1024) {
  console.warn("Zielgröße konnte mit dem maximalen Abstand nicht unterschritten werden.");
};

await mkdir(dirname(outputFile), { recursive: true });
await writeFile(outputFile, output);
console.log(
  `Deutschland-Grenze geschrieben: ${outputFile} ` +
  `(${rings.length} Ring(e), ${outputPointCount.toLocaleString("de-DE")} Punkte, ` +
  `${Math.round(Buffer.byteLength(output) / 1024 / 1024 * 100) / 100} MB, ` +
  `${requestedPoints !== null ? `Ziel: ${requestedPoints.toLocaleString("de-DE")} Punkte` : `Abstand ca. ${Math.round(spacing * 100) / 100} m`})`
);
