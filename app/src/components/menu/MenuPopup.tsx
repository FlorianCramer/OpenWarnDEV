"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useMapStore } from "@/src/store/mapStore";
import icon from "../../app/icon.png";

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

export default function MenuPopup({ isOpen, onClose }: MenuPopupProps) {
  const [path, setPath] = useState<string[]>(["main"]);
  const [animateIn, setAnimateIn] = useState(true);
  const popupRef = useRef<HTMLDivElement>(null);

  const buildings3D = useMapStore((s) => s.buildings3D);
  const setBuildings3D = useMapStore((s) => s.setBuildings3D);
  const terrain3D = useMapStore((s) => s.terrain3D);
  const setTerrain3D = useMapStore((s) => s.setTerrain3D);

  const [bosKey, setBosKeyState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("bosKey") || "";
    }
    return "";
  });

  const setBosKey = (val: string) => {
    setBosKeyState(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("bosKey", val);
    }
  };

  const sections = useMemo<Record<string, MenuSection>>(() => ({
    main: {
      id: "main",
      label: "Hauptmenü",
      items: [
        {
          type: "link",
          label: "Karteninhalt",
          description: "Ebenen & 3D-Darstellung",
          icon: <MapIcon />,
          target: "map-content",
        },
        {
          type: "link",
          label: "Einstellungen",
          description: "App-Konfiguration",
          icon: <SettingsIcon />,
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
          icon: <BuildingIcon />,
          getValue: () => buildings3D,
          setValue: setBuildings3D,
        },
        {
          type: "toggle",
          label: "Gelände (3D)",
          description: "Topografisches Terrain aktivieren",
          icon: <TerrainIcon />,
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
          icon: <BosIcon />,
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
          description: "Soll der BOS Modus aktiviert werden",
          icon: <BosIcon />,
          getValue: () => terrain3D, //momentan platzhalter
          setValue: setTerrain3D, //momentan platzhalter
        },
        {
          type: "input",
          label: "BOS-Schlüssel",
          description: "16-stelliger alphanumerischer Schlüssel",
          icon: <KeyIcon />,
          value: bosKey,
          onChange: setBosKey,
          placeholder: "z.B. A1B2C3D4E5F6G7H8",
        },
      ],
    },
  }), [buildings3D, terrain3D, bosKey]);

  const currentSection = sections[path[path.length - 1]];

  const goBack = () => {
    if (path.length > 1) setPath(path.slice(0, -1));
  };

  const navigateTo = (target: string) => {
    setPath([...path, target]);
  };

  const navigateToPath = (newPath: string[]) => {
    setPath(newPath);
  };

  useEffect(() => {
    setAnimateIn(false);
    const timer = setTimeout(() => setAnimateIn(true), 50);
    return () => clearTimeout(timer);
  }, [path]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) setPath(["main"]);
  }, [isOpen]);

  const renderItems = (items: MenuItem[]) => {
    if (items.length === 0) {
      return (
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60 p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
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
            hasArrow
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

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          ref={popupRef}
          className={`
            w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl
            mx-4 sm:mx-auto
            max-h-[85vh]
            bg-white/95 dark:bg-gray-900/95
            backdrop-blur-xl
            shadow-2xl
            border border-gray-200/80 dark:border-gray-700/80
            rounded-2xl
            flex flex-col
            transition-all duration-300 ease-out
            ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}
            ${isOpen ? "pointer-events-auto" : "pointer-events-none"}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-gray-200/80 dark:border-gray-700/80 shrink-0">
            {path.length > 1 ? (
              <button
                onClick={goBack}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Zurück"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Zurück</span>
              </button>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm overflow-hidden">
                  {/* Korrigierter img‑src: icon.src ist ein string */}
                  <img
                    src={icon.src as string}
                    alt="OpenWarnDE Logo"
                    className="w-full h-full object-contain"
                    width={28}
                    height={28}
                  />
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white tracking-wide">OpenWarnDE</span>
              </div>
            )}
            <button
              onClick={onClose}
              aria-label="Schließen"
              className="hover:cursor-pointer p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content mit Breadcrumb und Animation */}
          <div className="flex-1 overflow-y-auto py-3 px-3 sm:px-4">
            {path.length > 1 && (
              <div className="mb-3 text-xs text-gray-400 dark:text-gray-500 px-2 flex items-center gap-1 flex-wrap select-none">
                {breadcrumb.map((label, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <span className="text-gray-300 dark:text-gray-600 mx-0.5">/</span>}
                    <button
                      onClick={() => navigateToPath(path.slice(0, index + 1))}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer no-underline"
                    >
                      {label}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}
            <div
              key={path.join('-')}
              className={`transition-all duration-300 ease-out ${
                animateIn ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
              }`}
            >
              <nav className="space-y-1">{renderItems(currentSection.items)}</nav>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-5 py-3 border-t border-gray-200/80 dark:border-gray-700/80 shrink-0">
            <p className="text-[11px] text-gray-400 dark:text-gray-600 text-center">OpenWarnDE · Kartensoftware</p>
          </div>
        </div>
      </div>
    </>
  );
}

// ---------- Icons ----------
function MapIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function TerrainIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21l5-10 4 7 3-5 6 8H3z" />
    </svg>
  );
}

function BosIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polygon points="12 6 6 16 18 16" />
      <path d="M12 9v5" />
      <path d="M9.5 12.5h5" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  );
}

// ---------- Komponenten ----------
interface MenuNavItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
  hasArrow?: boolean;
}

function MenuNavItem({ icon, label, description, onClick, hasArrow }: MenuNavItemProps) {
  return (
    <button
      onClick={onClick}
      className="hover:cursor-pointer w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-all group"
    >
      <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{label}</p>
        {description && <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{description}</p>}
      </div>
      {hasArrow && (
        <svg className="w-4 h-4 text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      )}
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
  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60">
      {icon && (
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all ${
            enabled
              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
          }`}
        >
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{label}</p>
        {description && <p className="text-xs text-gray-400 dark:text-gray-500">{description}</p>}
      </div>
      <button
        onClick={onToggle}
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        className={`hover:cursor-pointer relative shrink-0 w-11 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
          enabled ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
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

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const filtered = input.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16);
    setLocalValue(filtered);
    onChange(filtered);
  };

  const isValid = localValue.length === 16;

  return (
    <div className="flex flex-col gap-2 px-3 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{label}</p>
          {description && <p className="text-xs text-gray-400 dark:text-gray-500">{description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder || "Schlüssel eingeben"}
          className={`flex-1 px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400 ${
            localValue.length > 0 && !isValid
              ? "border-red-400 dark:border-red-500"
              : isValid && localValue.length > 0
              ? "border-green-400 dark:border-green-500"
              : "border-gray-200 dark:border-gray-700"
          }`}
          maxLength={16}
          autoComplete="off"
        />
        <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
          {localValue.length}/16
        </span>
      </div>
      {localValue.length > 0 && !isValid && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-1">
          Bitte genau 16 Zeichen (Buchstaben und Zahlen)
        </p>
      )}
      {isValid && localValue.length === 16 && (
        <p className="text-xs text-green-500 dark:text-green-400 mt-1">
          ✓ Gültig
        </p>
      )}
    </div>
  );
}