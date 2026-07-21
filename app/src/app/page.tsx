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
    <>
      <Button
        className="absolute top-4 left-4 z-10"
        onClick={() => setBuildings3D(!buildings3D)}
      >
        {buildings3D ? "3D aus" : "3D an"}
      </Button>

      <MapView />
    </>
  );
}