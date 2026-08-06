"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import {
  MAP_CENTER,
  GERMANY_FOCUS_ENABLED,
  MAP_MAX_BOUNDS,
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
import { applyGermanyFocus } from "./germanyFocus";

interface MapViewProps {
  enabled?: boolean;
}

// Hillshade-Konfiguration
const HILLSHADE_SOURCE_ID = "hillshadeSource";
const HILLSHADE_LAYER_ID = "hills";
const HILLSHADE_TILEJSON_URL = "https://tiles.mapterhorn.com/tilejson.json";

function initHillshade(map: MapLibreMap) {
  if (!map.getSource(HILLSHADE_SOURCE_ID)) {
    map.addSource(HILLSHADE_SOURCE_ID, {
      type: "raster-dem",
      url: HILLSHADE_TILEJSON_URL,
    });
  }

  if (!map.getLayer(HILLSHADE_LAYER_ID)) {
    const firstSymbolId = map
      .getStyle()
      ?.layers?.find((l) => l.type === "symbol")?.id;

    map.addLayer(
      {
        id: HILLSHADE_LAYER_ID,
        type: "hillshade",
        source: HILLSHADE_SOURCE_ID,
        paint: {
          "hillshade-shadow-color": "#473B24",
        },
      },
      firstSymbolId
    );
  }
}

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

function fitGermanyToViewport(map: MapLibreMap) {
  // Die Einpassung wird ohne die Navigationsbegrenzung berechnet. So kann
  // MapLibre die Kamera erst korrekt bestimmen und danach wird die Begrenzung
  // wieder aktiv gesetzt.
  map.resize();
  map.setMaxBounds(null);
  map.fitBounds(MAP_MAX_BOUNDS, {
    padding: { top: 64, right: 64, bottom: 64, left: 64 },
    duration: 0,
    maxZoom: 4.5,
  });
  map.setMaxBounds(MAP_MAX_BOUNDS);
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
      maxBounds: GERMANY_FOCUS_ENABLED ? MAP_MAX_BOUNDS : undefined,
    });

    mapRef.current = map;
    setMapInstance(map);
    let refitGermany: (() => void) | null = null;
    let refitTimer: ReturnType<typeof setTimeout> | null = null;

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

      if (GERMANY_FOCUS_ENABLED) {
        // Erst nach dem ersten Layout messen, damit beide Bildschirmachsen
        // in die Zoom-Berechnung eingehen.
        refitGermany = () => fitGermanyToViewport(map);
        requestAnimationFrame(refitGermany);
        map.once("idle", refitGermany);
        refitTimer = setTimeout(refitGermany, 250);
        window.addEventListener("resize", refitGermany);
        applyGermanyFocus(map);
      }

      updateViewAngles();
    });

    map.on("rotate", updateViewAngles);
    map.on("pitch", updateViewAngles);

    return () => {
      if (refitGermany) window.removeEventListener("resize", refitGermany);
      if (refitTimer) clearTimeout(refitTimer);
      map.remove();
      mapRef.current = null;
      setMapInstance(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // ─── Reaktiver Terrain-Toggle 
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    setTerrainVisible(map, terrain3D, TERRAIN_EXAGGERATION);
    setHillshadeVisible(map, terrain3D);
  }, [terrain3D]);

  // ─── Reaktiver Gebäude-Toggle 
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
