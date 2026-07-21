"use client";

import { Button, Card } from "flowbite-react";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/src/components/map/MapView"), { ssr: false });

export default function Home() {
  return <MapView />;
}