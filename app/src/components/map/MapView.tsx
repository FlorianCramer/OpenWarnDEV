"use client";

import { useEffect, useRef } from "react";
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

export default function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  const buildings3D = useMapStore((state) => state.buildings3D);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      maxPitch: MAP_MAX_PITCH,
    });

    mapRef.current = map;

    map.on("load", () => {
      setBuildings3DVisible(map, buildings3D);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!mapRef.current.isStyleLoaded()) return;

    setBuildings3DVisible(mapRef.current, buildings3D);
  }, [buildings3D]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
    />
  );
}