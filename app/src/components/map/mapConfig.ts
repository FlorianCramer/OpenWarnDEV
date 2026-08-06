export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

export const MAP_CENTER: [number, number] = [10.4515, 51.1657];
export const MAP_ZOOM = 5.5;

// Deutschland-Fokus: etwas Puffer lässt die Grenzregionen sichtbar, verhindert
// aber eine Navigation in weit entfernte Länder.
export const GERMANY_FOCUS_ENABLED = true;
export const MAP_MAX_BOUNDS: [[number, number], [number, number]] = [
  [5.5, 47.0],
  [15.8, 55.2],
];

// Erhöhter Max-Pitch für 3D-Geländeansicht (Standard 60°, mit Terrain bis 85°)
export const MAP_MAX_PITCH = 75;

// 3D-Terrain Konfiguration
export const TERRAIN_EXAGGERATION = 1;
