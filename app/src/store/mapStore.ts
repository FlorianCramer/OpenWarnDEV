import { create } from "zustand";

export interface MapControlsConfig {
  enabled: boolean;
  showZoom: boolean;
  showCompass: boolean;
  showPitch: boolean;
  showLocation: boolean;
  showInfoModal: boolean;
}

export interface UserLocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  timestamp: number | null;
  loading: boolean;
  error: string | null;
}

type MapStore = {
  buildings3D: boolean;
  setBuildings3D: (enabled: boolean) => void;

  controlsConfig: MapControlsConfig;
  setControlsConfig: (config: Partial<MapControlsConfig>) => void;

  infoModalOpen: boolean;
  setInfoModalOpen: (open: boolean) => void;

  bearing: number;
  pitch: number;
  setBearingAndPitch: (bearing: number, pitch: number) => void;

  userLocation: UserLocationState;
  setUserLocation: (location: Partial<UserLocationState>) => void;
};

export const useMapStore = create<MapStore>((set) => ({
  buildings3D: true,
  setBuildings3D: (enabled) => set({ buildings3D: enabled }),

  controlsConfig: {
    enabled: true,
    showZoom: true,
    showCompass: true,
    showPitch: true,
    showLocation: true,
    showInfoModal: true,
  },
  setControlsConfig: (config) =>
    set((state) => ({
      controlsConfig: { ...state.controlsConfig, ...config },
    })),

  infoModalOpen: false,
  setInfoModalOpen: (open) => set({ infoModalOpen: open }),

  bearing: 0,
  pitch: 0,
  setBearingAndPitch: (bearing, pitch) => set({ bearing, pitch }),

  userLocation: {
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
    loading: false,
    error: null,
  },
  setUserLocation: (location) =>
    set((state) => ({
      userLocation: { ...state.userLocation, ...location },
    })),
}));