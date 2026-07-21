"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import {
  MAP_STYLE_URL,
  MAP_CENTER,
  MAP_ZOOM,
  MAP_MAX_PITCH,
  mapLayerFlags,
} from "./mapConfig";

import { setBuildings3DVisible } from "./buildingsLayer";

export default function MapView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

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
      setBuildings3DVisible(map, mapLayerFlags.buildings3D);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
    />
  );
}