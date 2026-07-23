"use client";

interface MenuButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export default function MenuButton({ onClick, isOpen }: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? "Menü schließen" : "Menü öffnen"}
      title={isOpen ? "Menü schließen" : "Menü öffnen"}
      className={`
        fixed top-4 left-4 z-50
        w-11 h-11
        flex items-center justify-center
        rounded-full
        bg-white/95 dark:bg-gray-800/95
        shadow-2xl
        border border-gray-200/80 dark:border-gray-700/80
        backdrop-blur-md
        transition-all duration-300
        hover:scale-105
        active:scale-95
        cursor-pointer
        ${isOpen ? "bg-gray-100 dark:bg-gray-700" : ""}
      `}
    >
      {/* Animated Hamburger / X Icon */}
      <div className="w-5 h-5 flex flex-col items-center justify-center gap-1 relative">
        <span
          className={`block h-0.5 w-5 bg-gray-700 dark:bg-gray-200 rounded-full transition-all duration-300 origin-center ${
            isOpen ? "rotate-45 translate-y-1.5" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-5 bg-gray-700 dark:bg-gray-200 rounded-full transition-all duration-300 ${
            isOpen ? "opacity-0 scale-x-0" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-5 bg-gray-700 dark:bg-gray-200 rounded-full transition-all duration-300 origin-center ${
            isOpen ? "-rotate-45 -translate-y-1.5" : ""
          }`}
        />
      </div>
    </button>
  );
}
