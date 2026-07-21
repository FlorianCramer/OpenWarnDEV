"use client";

import React, { useEffect } from "react";
import { useMapStore } from "@/src/store/mapStore";

interface CopyrightModalProps {
  /** Boolean Flag zum Aktivieren/Deaktivieren der Komponente (gemäß AI_RULES.md) */
  enabled?: boolean;
}

export default function CopyrightModal({ enabled = true }: CopyrightModalProps) {
  const isOpen = useMapStore((state) => state.infoModalOpen);
  const setIsOpen = useMapStore((state) => state.setInfoModalOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  if (!enabled || !isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={() => setIsOpen(false)}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
          <div className="flex items-center space-x-2">
            <svg
              className="w-6 h-6 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Kartografische & Rechtliche Informationen
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Schließen"
            className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-700 dark:text-gray-300">
          {/* Urheberrecht & OpenStreetMap */}
          <section className="space-y-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1">
              Urheberrecht & Kartendaten
            </h3>
            <p>
              Die Kartendaten dieser Anwendung stammen aus dem Open-Data-Projekt{" "}
              <a
                href="https://www.openstreetmap.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                OpenStreetMap
              </a>
              .
            </p>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-xs leading-relaxed text-blue-900 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
              ©{" "}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold"
              >
                OpenStreetMap-Mitwirkende
              </a>
              . Die Kartendaten stehen unter der{" "}
              <a
                href="https://opendatacommons.org/licenses/odbl/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold"
              >
                Open Database License (ODbL)
              </a>
              .
            </div>
          </section>

          {/* Tiles & Styling */}
          <section className="space-y-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1">
              Karten-Tiles & Styling
            </h3>
            <p>
              Die Vektorkacheln und das Liberty-Kartendesign werden von{" "}
              <a
                href="https://openfreemap.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                OpenFreeMap
              </a>{" "}
              bereitgestellt und basieren auf OpenMapTiles.
            </p>
          </section>

          {/* Engine */}
          <section className="space-y-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1">
              Kartendarstellungs-Engine
            </h3>
            <p>
              Die Rendering-Engine basiert auf{" "}
              <a
                href="https://maplibre.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                MapLibre GL JS
              </a>{" "}
              (BSD 3-Clause Lizenz).
            </p>
          </section>

          {/* Markenrechtliche Hinweise */}
          <section className="space-y-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1">
              Markenrechtliche Hinweise
            </h3>
            <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <li>
                <strong className="text-gray-800 dark:text-gray-200">OpenStreetMap®</strong>,{" "}
                <strong className="text-gray-800 dark:text-gray-200">OSM®</strong> und das Lupen-Logo sind eingetragene Marken der OpenStreetMap Foundation.
              </li>
              <li>
                <strong className="text-gray-800 dark:text-gray-200">MapLibre®</strong> ist eine eingetragene Marke der MapLibre Organisation.
              </li>
              <li>
                <strong className="text-gray-800 dark:text-gray-200">OpenWarnDE</strong> und das zugehörige Design sind Urheber- und Markenrechte des OpenWarnDE-Projekts.
              </li>
            </ul>
          </section>

          {/* Haftungsausschluss */}
          <section className="space-y-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1">
              Haftungsausschluss & Notfallhinweis
            </h3>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-lg text-xs leading-relaxed text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
              <strong>Wichtiger Hinweis:</strong> Die dargestellten Kartendaten, Gefahren-Overlays und Standortinformationen dienen ausschließlich der Information. Im akuten Notfall oder bei unmittelbarer Gefahr vertrauen Sie stets den Anweisungen der örtlichen Einsatzkräfte und wählen Sie den Notruf <strong>112</strong> (Feuerwehr/Rettungsdienst) oder <strong>110</strong> (Polizei).
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            Verstanden & Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
