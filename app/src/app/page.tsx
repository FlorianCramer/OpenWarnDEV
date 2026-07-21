"use client";

import dynamic from "next/dynamic";
import { Button } from "flowbite-react";
import { useMapStore } from "@/src/store/mapStore";

const MapView = dynamic(
  () => import("@/src/components/map/MapView"),
  {
    ssr: false,
  },
);

export default function Home() {
  const buildings3D = useMapStore((s) => s.buildings3D);
  const setBuildings3D = useMapStore((s) => s.setBuildings3D);

  return (
    <main className="relative w-full h-screen overflow-hidden">
      <Button
        className="absolute top-4 left-4 z-20 shadow-md cursor-pointer p-2 bg-gray-100 text-black"
        onClick={() => setBuildings3D(!buildings3D)}
      >
        {buildings3D ? "3D-Gebäude aus" : "3D-Gebäude an"}
      </Button>

      <MapView />
    </main>
  );
}