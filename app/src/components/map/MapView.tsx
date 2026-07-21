"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import {
  MAP_CENTER,
  MAP_MAX_PITCH,
  MAP_STYLE_URL,
  MAP_ZOOM,
} from "./mapConfig";

import { setBuildings3DVisible } from "./buildingsLayer";
import { useMapStore } from "@/src/store/mapStore";
import MapControls from "./MapControls";
import CopyrightModal from "./CopyrightModal";

interface MapViewProps {
  enabled?: boolean;
}

export default function MapView({ enabled = true }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [mapInstance, setMapInstance] = useState<MapLibreMap | null>(null);

  const buildings3D = useMapStore((state) => state.buildings3D);
  const setBearingAndPitch = useMapStore((state) => state.setBearingAndPitch);

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
      setBuildings3DVisible(map, buildings3D);
      updateViewAngles();
    });

    map.on("rotate", updateViewAngles);
    map.on("pitch", updateViewAngles);

    return () => {
      map.remove();
      mapRef.current = null;
      setMapInstance(null);
    };
  }, [enabled]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!mapRef.current.isStyleLoaded()) return;

    setBuildings3DVisible(mapRef.current, buildings3D);
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