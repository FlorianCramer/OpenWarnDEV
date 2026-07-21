import { create } from "zustand";

type MapStore = {
  buildings3D: boolean;
  setBuildings3D: (enabled: boolean) => void;
};

export const useMapStore = create<MapStore>((set) => ({
  buildings3D: true,

  setBuildings3D: (enabled) =>
    set({
      buildings3D: enabled,
    }),
}));