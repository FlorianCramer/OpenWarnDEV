"use client";

import { useEffect, useRef, useState } from "react";
import { useMapStore } from "@/src/store/mapStore";

interface Section {
  id: string;
  title: string;
  content: string;
  boxType?: "info" | "warning";
}

interface CopyrightModalProps {
  enabled?: boolean;
}

export default function CopyrightModal({ enabled = true }: CopyrightModalProps) {
  const isOpen = useMapStore((state) => state.infoModalOpen);
  const setIsOpen = useMapStore((state) => state.setInfoModalOpen);
  const modalRef = useRef<HTMLDivElement>(null);

  // Alle Abschnitte als inline JSON
  const sections: Section[] = [
    {
      id: "copyright",
      title: "Urheberrecht & Kartendaten",
      content: `
        <p>Die Kartendaten dieser Anwendung stammen aus dem Open-Data-Projekt <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors font-medium">OpenStreetMap</a>.</p>
        <div class="p-3 mt-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-xs leading-relaxed text-blue-900 dark:text-blue-300 border border-blue-100/50 dark:border-blue-900/30">
          © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" class="underline hover:no-underline font-semibold transition-all">OpenStreetMap-Mitwirkende</a>. Die Kartendaten stehen unter der <a href="https://opendatacommons.org/licenses/odbl/" target="_blank" rel="noopener noreferrer" class="underline hover:no-underline font-semibold transition-all">Open Database License (ODbL)</a>.
        </div>
      `,
    },
    {
      id: "tiles",
      title: "Karten-Tiles & Styling",
      content: `
        <p>Die Vektorkacheln und das Liberty-Kartendesign werden von <a href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors font-medium">OpenFreeMap</a> bereitgestellt und basieren auf OpenMapTiles.</p>
      `,
    },
    {
      id: "engine",
      title: "Kartendarstellungs-Engine",
      content: `
        <p>Die Rendering-Engine basiert auf <a href="https://maplibre.org/" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors font-medium">MapLibre GL JS</a> (BSD 3-Clause Lizenz).</p>
      `,
    },
    {
      id: "terrain",
      title: "3D-Gelände & Höhendaten",
      content: `
        <p>Die Darstellung des 3D-Geländes und der Geländeschattierung (Hillshade) basiert auf Höhendaten der <a href="https://www.eorc.jaxa.jp/ALOS/en/aw3d30/" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors font-medium">JAXA ALOS World 3D (AW3D30)</a> Mission mit einer Auflösung von 30 Metern.</p>
        <p class="mt-1">Diese Daten werden über den kostenlosen Demo-Tile-Dienst von <a href="https://www.maptiler.com/" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors font-medium">MapTiler</a> (mapterhorn.com) bereitgestellt.</p>
        <div class="p-3 mt-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-xs leading-relaxed text-blue-900 dark:text-blue-300 border border-blue-100/50 dark:border-blue-900/30">
          © <a href="https://www.eorc.jaxa.jp/ALOS/en/aw3d30/" target="_blank" rel="noopener noreferrer" class="underline hover:no-underline font-semibold transition-all">JAXA</a> &amp; <a href="https://www.maptiler.com/" target="_blank" rel="noopener noreferrer" class="underline hover:no-underline font-semibold transition-all">MapTiler</a>
        </div>
      `,
    },
    {
      id: "trademarks",
      title: "Markenrechtliche Hinweise",
      content: `
        <ul class="list-disc list-inside space-y-1 text-xs text-gray-600 dark:text-gray-400">
          <li><strong class="text-gray-800 dark:text-gray-200">OpenStreetMap®</strong>, <strong class="text-gray-800 dark:text-gray-200">OSM®</strong> und das Lupen-Logo sind eingetragene Marken der OpenStreetMap Foundation.</li>
          <li><strong class="text-gray-800 dark:text-gray-200">MapLibre®</strong> ist eine eingetragene Marke der MapLibre Organisation.</li>
          <li><strong class="text-gray-800 dark:text-gray-200">OpenWarnDE</strong> und das zugehörige Design sind Urheber- und Markenrechte des OpenWarnDE-Projekts.</li>
        </ul>
      `,
    },
  ];

  // Accordion-Status: initial alle geschlossen
  const [openItems, setOpenItems] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach((s) => { initial[s.id] = false; });
    return initial;
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Escape schließt Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  // Fokus auf erstes fokussierbares Element
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const firstFocusable = modalRef.current.querySelector<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );
      firstFocusable?.focus();
    }
  }, [isOpen]);

  if (!enabled || !isOpen) return null;

  const renderContent = (section: Section) => {
    const contentHtml = section.content;
    if (section.boxType === "info") {
      return (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-xs leading-relaxed text-blue-900 dark:text-blue-300 border border-blue-100/50 dark:border-blue-900/30">
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
      );
    }
    if (section.boxType === "warning") {
      return (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-xs leading-relaxed text-amber-900 dark:text-amber-300 border border-amber-200/50 dark:border-amber-900/30">
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
      );
    }
    return <div dangerouslySetInnerHTML={{ __html: contentHtml }} />;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
      onClick={() => setIsOpen(false)}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-white/95 dark:bg-gray-900/95 backdrop-blur-md text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="copyright-modal-heading"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header – minimalistisch mit sanftem Schatten */}
        <div className="flex items-center justify-between px-5 py-4 md:px-7 md:py-5 border-b border-gray-200/50 dark:border-gray-700/50 bg-linear-to-b from-gray-50/80 to-transparent dark:from-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <svg
                className="w-5 h-5"
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
            </div>
            <h2
              id="copyright-modal-heading"
              className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white"
            >
              Rechtliche Informationen
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Schließen"
            className="p-2 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 rounded-xl hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-200 hover:scale-110"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Inhalt – Accordion-Items + fester Notfallhinweis */}
        <div className="px-5 py-4 md:px-7 md:py-5 overflow-y-auto space-y-4">
          {/* Accordion-Bereich */}
          <div className="space-y-1">
            {sections.map((section) => {
              const isOpenItem = openItems[section.id] ?? false;
              return (
                <div
                  key={section.id}
                  className="border-b border-gray-200/30 dark:border-gray-700/30 last:border-0"
                >
                  <button
                    onClick={() => toggleItem(section.id)}
                    className="w-full flex items-center justify-between py-3 px-2 -mx-2 text-left rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                    aria-expanded={isOpenItem}
                    aria-controls={`section-${section.id}`}
                  >
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {section.title}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300 ${
                        isOpenItem ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {isOpenItem && (
                    <div
                      id={`section-${section.id}`}
                      className="pb-3 px-2 text-sm text-gray-600 dark:text-gray-400 animate-fadeIn"
                    >
                      {renderContent(section)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Fester Notfallhinweis – immer sichtbar */}
          <div className="pt-3 border-t border-gray-200/30 dark:border-gray-700/30">
            <div className="p-4 bg-linear-to-br from-amber-50/80 to-amber-100/30 dark:from-amber-950/40 dark:to-amber-900/20 rounded-xl border border-amber-200/50 dark:border-amber-800/30 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-amber-600 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
                  <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                    Wichtiger Notfallhinweis
                  </p>
                  <p>
                    Die dargestellten Kartendaten, Gefahren-Overlays und Standortinformationen dienen ausschließlich der Information. Im akuten Notfall oder bei unmittelbarer Gefahr vertrauen Sie stets den Anweisungen der örtlichen Einsatzkräfte und wählen Sie den Notruf <strong className="font-semibold text-amber-800 dark:text-amber-300">112</strong> (Feuerwehr/Rettungsdienst) oder <strong className="font-semibold text-amber-800 dark:text-amber-300">110</strong> (Polizei).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer – minimalistisch */}
        <div className="flex justify-end px-5 py-4 md:px-7 md:py-5 border-t border-gray-200/50 dark:border-gray-700/50 bg-linear-to-t from-gray-50/80 to-transparent dark:from-gray-800/50">
          <button
            onClick={() => setIsOpen(false)}
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
          >
            Verstanden & Schließen
          </button>
        </div>
      </div>
    </div>
  );
}