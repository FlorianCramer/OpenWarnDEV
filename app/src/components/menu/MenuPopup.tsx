"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useMapStore } from "@/src/store/mapStore";
import icon from "../../app/icon.png";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type MenuItem =
  | { type: "link"; label: string; description?: string; icon: React.ReactNode; target: string }
  | { type: "toggle"; label: string; description?: string; icon?: React.ReactNode; getValue: () => boolean; setValue: (val: boolean) => void }
  | { type: "input"; label: string; description?: string; icon?: React.ReactNode; value: string; onChange: (val: string) => void; placeholder?: string };

type MenuSection = {
  id: string;
  label: string;
  items: MenuItem[];
};

interface MenuPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Flowbite Outline Icons (24x24, stroke-width 2)
// ---------------------------------------------------------------------------
const Icons = {
  Xmark: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  AngleRight: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5l7 7-7 7" />
    </svg>
  ),
  AngleLeft: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 19l-7-7 7-7" />
    </svg>
  ),
  Layers: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l9 4.5-9 4.5-9-4.5L12 3z" />
      <path d="M3 14.5l9 4.5 9-4.5" />
      <path d="M3 9.5l9 4.5 9-4.5" />
    </svg>
  ),
  Cog: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  Building: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M6 21V7l6-4 6 4v14M9 11h2M9 15h2M13 11h2M13 15h2" />
    </svg>
  ),
  Mountain: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21l5-10 4 7 3-5 6 8H3z" />
    </svg>
  ),
  Shield: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Key: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  ),
};

// ---------------------------------------------------------------------------
// Haptic Feedback Helper (Capacitor with web fallback)
// ---------------------------------------------------------------------------
async function triggerHapticLight() {
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Kein natives Haptik verfügbar – silent fallback
  }
}

// ---------------------------------------------------------------------------
// Responsive Breakpoint Hook
// ---------------------------------------------------------------------------
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function MenuPopup({ isOpen, onClose }: MenuPopupProps) {
  const isMobile = useIsMobile();
  const [path, setPath] = useState<string[]>(["main"]);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [animateIn, setAnimateIn] = useState(true);

  // Mount / Show States für Ein-/Ausblend-Animation
  const [isMounted, setIsMounted] = useState(false);
  const [show, setShow] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  // Touch-Swipe State
  const touchStartY = useRef(0);
  const touchCurrentY = useRef(0);
  const isDragging = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);

  // Store
  const buildings3D = useMapStore((s) => s.buildings3D);
  const setBuildings3D = useMapStore((s) => s.setBuildings3D);
  const terrain3D = useMapStore((s) => s.terrain3D);
  const setTerrain3D = useMapStore((s) => s.setTerrain3D);
  const bosMode = useMapStore((s) => s.bosMode);
  const setBosMode = useMapStore((s) => s.setBosMode);

  const [bosKey, setBosKeyState] = useState<string>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("bosKey") || "";
    return "";
  });
  const setBosKey = (val: string) => {
    setBosKeyState(val);
    if (typeof window !== "undefined") localStorage.setItem("bosKey", val);
  };

  const sections = useMemo<Record<string, MenuSection>>(
    () => ({
      main: {
        id: "main",
        label: "Hauptmenü",
        items: [
          {
            type: "link",
            label: "Karteninhalt",
            description: "Ebenen & 3D-Darstellung",
            icon: <Icons.Layers />,
            target: "map-content",
          },
          {
            type: "link",
            label: "Einstellungen",
            description: "App-Konfiguration",
            icon: <Icons.Cog />,
            target: "settings",
          },
        ],
      },
      "map-content": {
        id: "map-content",
        label: "Karteninhalt",
        items: [
          {
            type: "toggle",
            label: "3D-Gebäude",
            description: "Gebäude dreidimensional darstellen",
            icon: <Icons.Building />,
            getValue: () => buildings3D,
            setValue: setBuildings3D,
          },
          {
            type: "toggle",
            label: "Gelände (3D)",
            description: "Topografisches Terrain aktivieren",
            icon: <Icons.Mountain />,
            getValue: () => terrain3D,
            setValue: setTerrain3D,
          },
        ],
      },
      settings: {
        id: "settings",
        label: "Einstellungen",
        items: [
          {
            type: "link",
            label: "BOS System",
            description: "Schlüssel für BOS-Kommunikation",
            icon: <Icons.Shield />,
            target: "bos",
          },
        ],
      },
      bos: {
        id: "bos",
        label: "BOS System",
        items: [
          {
            type: "toggle",
            label: "BOS Modus",
            description: "BOS-Modus für zukünftige Funktionen aktivieren",
            icon: <Icons.Shield />,
            getValue: () => bosMode,
            setValue: setBosMode,
          },
          {
            type: "input",
            label: "BOS-Schlüssel",
            description: "16-stelliger alphanumerischer Schlüssel",
            icon: <Icons.Key />,
            value: bosKey,
            onChange: setBosKey,
            placeholder: "z.B. A1B2C3D4E5F6G7H8",
          },
        ],
      },
    }),
    [buildings3D, terrain3D, bosMode, bosKey]
  );

  const currentSection = sections[path[path.length - 1]];

  const goBack = useCallback(() => {
    if (path.length > 1) {
      setDirection("back");
      setPath((p) => p.slice(0, -1));
    }
  }, [path]);

  const navigateTo = useCallback((target: string) => {
    setDirection("forward");
    setPath((p) => [...p, target]);
  }, []);

  const navigateToPath = useCallback((newPath: string[]) => {
    if (newPath.length > path.length) setDirection("forward");
    else if (newPath.length < path.length) setDirection("back");
    setPath(newPath);
  }, [path]);

  // Animation bei Pfadwechsel
  useEffect(() => {
    setAnimateIn(false);
    const timer = setTimeout(() => setAnimateIn(true), 50);
    return () => clearTimeout(timer);
  }, [path]);

  // Mount/Show-Logik für gesamtes Menü
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setShow(true));
      });
    } else {
      setShow(false);
      const timer = setTimeout(() => setIsMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Reset bei Schließen
  useEffect(() => {
    if (!isMounted) {
      setPath(["main"]);
      setDragOffset(0);
    }
  }, [isMounted]);

  // Backdrop-Click (Desktop)
  useEffect(() => {
    if (!isOpen || !isMounted || isMobile) return;
    const handleClick = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, isMounted, isMobile, onClose]);

  // Swipe-to-Dismiss (Mobile)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    const isHandle = dragHandleRef.current?.contains(target);
    const sheetTop = sheetRef.current?.getBoundingClientRect().top ?? 0;
    const touchY = e.touches[0].clientY;
    const isNearTop = touchY - sheetTop < 60;

    if (isHandle || isNearTop) {
      isDragging.current = true;
      touchStartY.current = e.touches[0].clientY;
      touchCurrentY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    touchCurrentY.current = e.touches[0].clientY;
    const delta = touchCurrentY.current - touchStartY.current;
    if (delta > 0) {
      setDragOffset(delta);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const delta = touchCurrentY.current - touchStartY.current;
    if (delta > 100) {
      onClose();
    }
    setDragOffset(0);
  }, [onClose]);

  // Render-Helfer
  const renderItems = (items: MenuItem[]) => {
    if (items.length === 0) {
      return (
        <div className="rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
          Weitere Einstellungen folgen …
        </div>
      );
    }
    return items.map((item, index) => {
      if (item.type === "link") {
        return (
          <MenuNavItem
            key={index}
            icon={item.icon}
            label={item.label}
            description={item.description}
            onClick={() => navigateTo(item.target)}
          />
        );
      }
      if (item.type === "toggle") {
        return (
          <ToggleRow
            key={index}
            label={item.label}
            description={item.description}
            icon={item.icon}
            enabled={item.getValue()}
            onToggle={() => item.setValue(!item.getValue())}
          />
        );
      }
      if (item.type === "input") {
        return (
          <InputRow
            key={index}
            label={item.label}
            description={item.description}
            icon={item.icon}
            value={item.value}
            onChange={item.onChange}
            placeholder={item.placeholder}
          />
        );
      }
      return null;
    });
  };

  const breadcrumb = path.map((id) => sections[id]?.label || id);

  if (!isMounted) return null;

  // Gemeinsamer Backdrop mit Blur (5px) und Cursor-Pointer
  const backdrop = (
    <div
      className={`fixed inset-0 z-40 bg-black/30 dark:bg-black/50 backdrop-blur-[5px] transition-opacity duration-300 cursor-pointer ${
        show ? "opacity-100" : "opacity-0"
      }`}
      onClick={isMobile ? undefined : onClose}
    />
  );

  // Mobile Bottom Sheet
  if (isMobile) {
    return (
      <>
        {backdrop}
        <div
          ref={sheetRef}
          className="fixed inset-x-0 bottom-0 z-50 flex flex-col max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-2xl shadow-lg transition-all duration-300 ease-out"
          style={{
            transform: `translateY(${show ? dragOffset : 100}%)`,
            paddingBottom: "env(safe-area-inset-bottom, 16px)",
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Drag Handle */}
          <div ref={dragHandleRef} className="flex justify-center pt-3 pb-1 shrink-0 touch-none cursor-grab active:cursor-grabbing">
            <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
            {path.length > 1 ? (
              <button
                onClick={goBack}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 active:text-gray-900 dark:active:text-white transition-colors min-h-[44px] min-w-[44px] cursor-pointer"
                aria-label="Zurück"
              >
                <Icons.AngleLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Zurück</span>
              </button>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-blue-700 flex items-center justify-center overflow-hidden">
                  <img src={icon.src as string} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">OpenWarnDE</span>
              </div>
            )}
            <button
              onClick={onClose}
              aria-label="Schließen"
              className="p-2 rounded-lg text-gray-400 active:text-gray-700 dark:active:text-gray-200 active:bg-gray-100 dark:active:bg-gray-800 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            >
              <Icons.Xmark className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto py-3 px-4">
            {path.length > 1 && (
              <div className="mb-3 text-xs text-gray-500 dark:text-gray-400 px-1 flex items-center gap-1 flex-wrap select-none">
                {breadcrumb.map((label, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <span className="text-gray-300 dark:text-gray-600 mx-0.5">/</span>}
                    <button
                      onClick={() => navigateToPath(path.slice(0, index + 1))}
                      className="active:text-gray-700 dark:active:text-gray-200 transition-colors cursor-pointer"
                    >
                      {label}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}
            <div
              key={path.join("-")}
              className={`transition-all duration-200 ease-out ${
                animateIn
                  ? "opacity-100 translate-x-0"
                  : direction === "forward"
                  ? "opacity-0 translate-x-2"
                  : "opacity-0 -translate-x-2"
              }`}
            >
              <nav className="space-y-1">{renderItems(currentSection.items)}</nav>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 shrink-0">
            <p className="text-[11px] text-gray-500 dark:text-gray-500 text-center">OpenWarnDE · Kartensoftware</p>
          </div>
        </div>
      </>
    );
  }

  // Desktop Side Panel
  return (
    <>
      {backdrop}
      <div
        ref={sheetRef}
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white dark:bg-gray-900 shadow-lg border-l border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-out ${
          show ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          {path.length > 1 ? (
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Zurück"
            >
              <Icons.AngleLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Zurück</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-blue-700 flex items-center justify-center overflow-hidden">
                <img src={icon.src as string} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">OpenWarnDE</span>
            </div>
          )}
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
          >
            <Icons.Xmark className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-3 px-4">
          {path.length > 1 && (
            <div className="mb-3 text-xs text-gray-500 dark:text-gray-400 px-1 flex items-center gap-1 flex-wrap select-none">
              {breadcrumb.map((label, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span className="text-gray-300 dark:text-gray-600 mx-0.5">/</span>}
                  <button
                    onClick={() => navigateToPath(path.slice(0, index + 1))}
                    className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                  >
                    {label}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}
          <div
            key={path.join("-")}
            className={`transition-all duration-200 ease-out ${
              animateIn
                ? "opacity-100 translate-x-0"
                : direction === "forward"
                ? "opacity-0 translate-x-2"
                : "opacity-0 -translate-x-2"
            }`}
          >
            <nav className="space-y-1">{renderItems(currentSection.items)}</nav>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <p className="text-[11px] text-gray-500 dark:text-gray-500 text-center">OpenWarnDE · Kartensoftware</p>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-components (Cursor-Pointer, Hover, Touch)
// ---------------------------------------------------------------------------

interface MenuNavItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
}

function MenuNavItem({ icon, label, description, onClick }: MenuNavItemProps) {
  const handleClick = async () => {
    await triggerHapticLight();
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-3 px-3 py-3 min-h-[48px] rounded-lg text-left
                 hover:bg-gray-50 dark:hover:bg-gray-800/50
                 active:bg-gray-100 dark:active:bg-gray-800
                 transition-colors group cursor-pointer touch-manipulation"
    >
      <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center
                      text-gray-500 dark:text-gray-400
                      group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50
                      group-hover:text-blue-700 dark:group-hover:text-blue-400
                      group-active:bg-blue-50 dark:group-active:bg-blue-950/50
                      group-active:text-blue-700 dark:group-active:text-blue-400
                      transition-all shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{description}</p>
        )}
      </div>
      <Icons.AngleRight className="w-5 h-5 text-gray-400 dark:text-gray-600
                                  group-hover:text-gray-600 dark:group-hover:text-gray-400
                                  group-active:text-gray-600 dark:group-active:text-gray-400
                                  transition-colors shrink-0" />
    </button>
  );
}

interface ToggleRowProps {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  enabled: boolean;
  onToggle: () => void;
}

function ToggleRow({ label, description, icon, enabled, onToggle }: ToggleRowProps) {
  const handleToggle = async () => {
    await triggerHapticLight();
    onToggle();
  };

  return (
    <div className="flex items-center gap-3 px-3 py-3 min-h-[48px] rounded-lg
                    bg-gray-50 dark:bg-gray-800/60
                    border border-gray-200 dark:border-gray-700
                    hover:bg-gray-100 dark:hover:bg-gray-800
                    active:bg-gray-100 dark:active:bg-gray-800
                    transition-colors cursor-pointer touch-manipulation">
      {icon && (
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all ${
          enabled
            ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400"
            : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
        }`}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      <button
        onClick={handleToggle}
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-all duration-300
                    focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2
                    dark:focus:ring-offset-gray-900
                    hover:scale-105 active:scale-95
                    cursor-pointer
                    ${enabled ? "bg-blue-700" : "bg-gray-300 dark:bg-gray-600"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm
                      transition-transform duration-300
                      ${enabled ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}

interface InputRowProps {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

function InputRow({ label, description, icon, value, onChange, placeholder }: InputRowProps) {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setLocalValue(value), [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const filtered = input.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16);
    setLocalValue(filtered);
    onChange(filtered);
  };

  const isValid = localValue.length === 16;
  const hasError = localValue.length > 0 && !isValid;

  return (
    <div
      className="flex flex-col gap-2 px-3 py-3 rounded-lg
                 bg-gray-50 dark:bg-gray-800/60
                 border border-gray-200 dark:border-gray-700
                 hover:bg-gray-100 dark:hover:bg-gray-800
                 active:bg-gray-100 dark:active:bg-gray-800
                 transition-colors cursor-pointer touch-manipulation"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                          bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder || "Schlüssel eingeben"}
          className={`flex-1 px-3 py-2.5 text-sm rounded-lg border
                      bg-white dark:bg-gray-900
                      text-gray-900 dark:text-white
                      placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-700
                      transition-all min-h-[44px] cursor-text
                      ${
                        hasError
                          ? "border-rose-400 dark:border-rose-500"
                          : isValid && localValue.length > 0
                          ? "border-emerald-400 dark:border-emerald-500"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
          maxLength={16}
          autoComplete="off"
          inputMode="text"
        />
        <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0 tabular-nums">
          {localValue.length}/16
        </span>
      </div>
      {hasError && (
        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
          Bitte genau 16 Zeichen (Buchstaben und Zahlen)
        </p>
      )}
      {isValid && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">✓ Gültig</p>
      )}
    </div>
  );
}