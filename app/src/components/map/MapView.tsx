// app/src/components/map/MapView.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import {
  MAP_CENTER,
  MAP_MAX_PITCH,
  MAP_STYLE_URL,
  MAP_ZOOM,
  TERRAIN_EXAGGERATION,
} from "./mapConfig";

import { setBuildings3DVisible } from "./buildingsLayer";
import { setTerrainVisible } from "./terrainLayer";
import { useMapStore } from "@/src/store/mapStore";
import MapControls from "./MapControls";
import CopyrightModal from "./CopyrightModal";

interface MapViewProps {
  enabled?: boolean;
}

// Hillshade-Konfiguration (genau wie im Beispiel)
const HILLSHADE_SOURCE_ID = "hillshadeSource";
const HILLSHADE_LAYER_ID = "hills";
const HILLSHADE_TILEJSON_URL =
  "https://tiles.mapterhorn.com/tilejson.json";

/**
 * Fügt die Hillshade-Quelle und den Layer hinzu, falls noch nicht vorhanden.
 * Wird einmalig nach dem Kartenladeprozess aufgerufen.
 */
function initHillshade(map: MapLibreMap) {
  if (!map.getSource(HILLSHADE_SOURCE_ID)) {
    map.addSource(HILLSHADE_SOURCE_ID, {
      type: "raster-dem",
      url: HILLSHADE_TILEJSON_URL,
    });
  }

  if (!map.getLayer(HILLSHADE_LAYER_ID)) {
    // Der Hillshade-Layer soll über dem Hintergrund, aber unter den Gebäuden liegen.
    // Wir platzieren ihn vor dem ersten Symbol-Layer (Label) – das ist eine sichere Position.
    const firstSymbolId = map
      .getStyle()
      ?.layers?.find((l) => l.type === "symbol")?.id;

    map.addLayer(
      {
        id: HILLSHADE_LAYER_ID,
        type: "hillshade",
        source: HILLSHADE_SOURCE_ID,
        paint: {
          "hillshade-shadow-color": "#473B24", // warmer Schatten wie im Beispiel
        },
      },
      firstSymbolId // optional: hinter die Labels setzen, sodass diese lesbar bleiben
    );
  }
}

/**
 * Schaltet die Sichtbarkeit des Hillshade-Layers um.
 * @param map     MapLibre-Instanz
 * @param visible true = ein, false = aus
 */
function setHillshadeVisible(map: MapLibreMap, visible: boolean) {
  const layer = map.getLayer(HILLSHADE_LAYER_ID);
  if (layer) {
    map.setLayoutProperty(
      HILLSHADE_LAYER_ID,
      "visibility",
      visible ? "visible" : "none"
    );
  }
}

export default function MapView({ enabled = true }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [mapInstance, setMapInstance] = useState<MapLibreMap | null>(null);

  const buildings3D = useMapStore((state) => state.buildings3D);
  const terrain3D = useMapStore((state) => state.terrain3D);
  const setBearingAndPitch = useMapStore((state) => state.setBearingAndPitch);

  // ─── Karteninitialisierung ────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      maxPitch: MAP_MAX_PITCH,
    });

    mapRef.current = map;
    setMapInstance(map);

    const updateViewAngles = () => {
      setBearingAndPitch(map.getBearing(), map.getPitch());
    };

    map.on("load", () => {
      // 1. Terrain aktivieren
      setTerrainVisible(map, terrain3D, TERRAIN_EXAGGERATION);
      // 2. 3D-Gebäude entsprechend dem Store-Zustand setzen
      setBuildings3DVisible(map, buildings3D);
      // 3. Hillshade einrichten und Zustand anwenden
      initHillshade(map);
      setHillshadeVisible(map, terrain3D);

      updateViewAngles();
    });

    map.on("rotate", updateViewAngles);
    map.on("pitch", updateViewAngles);

    return () => {
      map.remove();
      mapRef.current = null;
      setMapInstance(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // ─── Reaktiver Terrain-Toggle (inkl. Hillshade) ──────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    setTerrainVisible(map, terrain3D, TERRAIN_EXAGGERATION);
    setHillshadeVisible(map, terrain3D);
  }, [terrain3D]);

  // ─── Reaktiver Gebäude-Toggle ─────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    setBuildings3DVisible(map, buildings3D);
  }, [buildings3D]);

  if (!enabled) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-500">
        Karte ist deaktiviert.
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      <MapControls map={mapInstance} />
      <CopyrightModal />
    </div>
  );
}