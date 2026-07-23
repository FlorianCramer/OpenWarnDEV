"use client";

import React, { useState, useEffect } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import { useMapStore } from "@/src/store/mapStore";
import { getCurrentLocation, requestLocationPermissions } from "./geolocation";
import { updateUserLocationMarker } from "./userLocationMarker";

interface MapControlsProps {
  /** MapLibre Map Instanz */
  map: MapLibreMap | null;
  enabled?: boolean;
  showZoom?: boolean;
  showCompass?: boolean;
  showPitch?: boolean;
  showLocation?: boolean;
  showInfoModal?: boolean;
  enableGyroscope?: boolean;
}

export default function MapControls({
  map,
  enabled = true,
  showZoom = true,
  showCompass = true,
  showPitch = true,
  showLocation = true,
  showInfoModal = true,
  enableGyroscope = true,
}: MapControlsProps) {
  const storeControlsConfig = useMapStore((s) => s.controlsConfig);
  const setInfoModalOpen = useMapStore((s) => s.setInfoModalOpen);
  const bearing = useMapStore((s) => s.bearing);
  const pitch = useMapStore((s) => s.pitch);
  const userLocation = useMapStore((s) => s.userLocation);
  const setUserLocation = useMapStore((s) => s.setUserLocation);

  const [locating, setLocating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);

  useEffect(() => {
    requestLocationPermissions().then((granted) => {
      if (!granted) {
        console.warn("[MapControls] - Standortberechtigung wurde nicht erteilt.");
      }
    });
  }, []);

  useEffect(() => {
    if (!enableGyroscope || typeof window === "undefined" || !("DeviceOrientationEvent" in window)) {
      return;
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      let heading: number | null = null;
      if ("webkitCompassHeading" in event && typeof (event as any).webkitCompassHeading === "number") {
        heading = (event as any).webkitCompassHeading;
      } else if (event.alpha !== null) {
        heading = (360 - event.alpha) % 360;
      }
      if (heading !== null) {
        setDeviceHeading(heading);
      }
    };

    window.addEventListener("deviceorientation", handleOrientation, true);
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, [enableGyroscope]);

  if (!enabled || !storeControlsConfig.enabled) {
    return null;
  }

  const canZoom = showZoom && storeControlsConfig.showZoom;
  const canCompass = showCompass && storeControlsConfig.showCompass;
  const canPitch = showPitch && storeControlsConfig.showPitch;
  const canLocation = showLocation && storeControlsConfig.showLocation;
  const canInfo = showInfoModal && storeControlsConfig.showInfoModal;

  const handleZoomIn = (actionEnabled: boolean = true) => {
    if (!actionEnabled || !map) return;
    map.zoomIn({ duration: 300 });
  };

  const handleZoomOut = (actionEnabled: boolean = true) => {
    if (!actionEnabled || !map) return;
    map.zoomOut({ duration: 300 });
  };

  const handleCompassReset = (actionEnabled: boolean = true) => {
    if (!actionEnabled || !map) return;
    map.easeTo({
      bearing: 0,
      duration: 750,
    });
  };

  // Pitch Reset Handler (Reset pitch back to standard 2D view: 0°)
  const handlePitchReset = (actionEnabled: boolean = true) => {
    if (!actionEnabled || !map) return;
    map.easeTo({
      pitch: 0,
      bearing: 0,
      duration: 750,
    });
  };

  // Standort Zentrieren Handler
  const handleLocateMe = async (actionEnabled: boolean = true) => {
    if (!actionEnabled || !map) return;
    setLocating(true);
    setUserLocation({ loading: true, error: null });

    try {
      const coords = await getCurrentLocation(true);
      if (coords) {
        setUserLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy || null,
          timestamp: Date.now(),
          loading: false,
          error: null,
        });

        updateUserLocationMarker(
          map,
          coords.longitude,
          coords.latitude,
          coords.accuracy || 0,
          true
        );

        map.flyTo({
          center: [coords.longitude, coords.latitude],
          zoom: Math.max(map.getZoom(), 15),
          duration: 1250,
        });
      } else {
        throw new Error("Standort konnte nicht ermittelt werden");
      }
    } catch (err: any) {
      const msg = err?.message || "Standortabfrage fehlgeschlagen";
      setUserLocation({ loading: false, error: msg });
      showToast(msg);
    } finally {
      setLocating(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="pointer-events-none select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto bg-rose-600 text-white px-4 py-2 rounded-xl shadow-2xl text-xs font-medium flex items-center space-x-2 animate-bounce">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LINKS UNTEN */}
      {canInfo && (
        <div className="fixed bottom-5 left-4 z-40 pointer-events-auto flex items-center">
          <button
            onClick={() => setInfoModalOpen(true)}
            aria-label="Karten-Informationen & Urheberrecht"
            title="Karten-Info & Markenrechte"
            className="cursor-pointer p-3 bg-white/95 dark:bg-gray-800/95 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full shadow-2xl border border-gray-200/80 dark:border-gray-700/80 backdrop-blur-md transition-all active:scale-90 flex items-center justify-center group"
          >
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
      )}

      {/* MITTIG UNTEN */}
      {(canLocation || canCompass || canPitch) && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 pointer-events-auto flex items-center bg-white/95 dark:bg-gray-800/95 rounded-full shadow-2xl border border-gray-200/80 dark:border-gray-700/80 p-1.5 space-x-2 backdrop-blur-md">
          
          {/* LINKES ELEMENT */}
          {canLocation && (
            <button
              onClick={() => handleLocateMe(true)}
              disabled={locating}
              aria-label="Auf eigenen Standort zentrieren"
              title="Auf eigenen Standort zentrieren"
              className={`cursor-pointer relative p-3 rounded-full transition-all active:scale-90 flex items-center justify-center ${
                userLocation.latitude !== null
                  ? "bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {locating ? (
                <svg className="w-5 h-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  {/* Standort Marker Active Pulse indicator */}
                  {userLocation.latitude !== null && (
                    <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                    </span>
                  )}
                  {/* Standort Pin Icon */}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </>
              )}
            </button>
          )}

          {/* MITTLERES ELEMENT */}
          {canCompass && (
            <button
              onClick={() => handleCompassReset(true)}
              aria-label="Live-Kompass (Klick setzt Nordausrichtung zurück)"
              title={`Ausrichtung: ${Math.round(bearing)}° (Klick für Nord-Reset)`}
              className="relative w-13 h-13 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-inner cursor-pointer group"
            >
              {/* Drehbarer Kompassring mit N, O, S, W Beschriftung */}
              <div
                className="absolute inset-0 w-full h-full rounded-full flex items-center justify-center transition-transform duration-150 ease-out"
                style={{ transform: `rotate(${-bearing}deg)` }}
              >
                {/* Norden (N) */}
                <span className="absolute top-0.5 text-[9px] font-black text-rose-600 dark:text-rose-500 tracking-tighter">
                  N
                </span>
                {/* Osten (O) */}
                <span className="absolute right-1 text-[8px] font-bold text-gray-400 dark:text-gray-500">
                  O
                </span>
                {/* Süden (S) */}
                <span className="absolute bottom-0.5 text-[8px] font-bold text-gray-400 dark:text-gray-500">
                  S
                </span>
                {/* Westen (W) */}
                <span className="absolute left-1 text-[8px] font-bold text-gray-400 dark:text-gray-500">
                  W
                </span>

                {/* Dynamische Kompassnadel */}
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  {/* Nordzeiger (Rot) */}
                  <path d="M12 3L14.5 12H9.5L12 3Z" fill="#e11d48" className="drop-shadow-xs" />
                  {/* Südzeiger (Silber/Grau) */}
                  <path d="M12 21L9.5 12H14.5L12 21Z" fill="#9ca3af" className="drop-shadow-xs" />
                  {/* Mittelpunkt */}
                  <circle cx="12" cy="12" r="1.5" fill="#ffffff" stroke="#4b5563" strokeWidth="1" />
                </svg>
              </div>

              {/* Optionaler Heading-Pfeil oder Orientierungs-Indikator */}
              {deviceHeading !== null && (
                <div
                  className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-100"
                  style={{ transform: `rotate(${deviceHeading}deg)` }}
                >
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full absolute top-0 left-1/2 -translate-x-1/2 shadow-xs" />
                </div>
              )}
            </button>
          )}

          {/* RECHTES ELEMENT */}
          {canPitch && (
            <button
              onClick={() => handlePitchReset(true)}
              aria-label="Perspektive zurücksetzen (Standard 2D)"
              title={`Neigung zurücksetzen (Aktuell: ${Math.round(pitch)}°)`}
              className={`cursor-pointer p-3 rounded-full transition-all active:scale-90 flex items-center justify-center ${
                pitch > 5
                  ? "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/60 font-bold"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {/* Kamera/Perspektiv Icon */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* RECHTS UNTEN */}
      {canZoom && (
        <div className="fixed bottom-5 right-4 z-40 pointer-events-auto flex flex-col bg-white/95 dark:bg-gray-800/95 rounded-full shadow-2xl border border-gray-200/80 dark:border-gray-700/80 p-1 space-y-1 backdrop-blur-md">
          {/* Zoom In */}
          <button
            onClick={() => handleZoomIn(true)}
            aria-label="Vergrößern (Zoom In)"
            title="Heranzoomen (+)"
            className="cursor-pointer p-2.5 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-90 flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          <div className="w-full h-px bg-gray-200 dark:bg-gray-700" />

          {/* Zoom Out */}
          <button
            onClick={() => handleZoomOut(true)}
            aria-label="Verkleinern (Zoom Out)"
            title="Herauszoomen (-)"
            className="cursor-pointer p-2.5 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-90 flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
