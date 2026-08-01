"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import MenuButton from "@/src/components/menu/MenuButton";
import MenuPopup from "@/src/components/menu/MenuPopup";

const MapView = dynamic(
  () => import("@/src/components/map/MapView"),
  {
    ssr: false,
  },
);

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="relative w-full h-screen overflow-hidden">
      <MenuButton
        isOpen={menuOpen}
        onClick={() => setMenuOpen((prev) => !prev)}
      />
      <MenuPopup
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <MapView />
    </main>
  );
}