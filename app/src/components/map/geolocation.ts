import { Geolocation, Position } from "@capacitor/geolocation";

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
}

/**
  * Abfrage des aktuellen Nutzerstandorts.
  * @param enabled Boolean-Flag zum Deaktivieren der Funktion
  */
export async function getCurrentLocation(
  enabled: boolean = true
): Promise<Coordinates | null> {
  if (!enabled) {
    console.log("[Geolocation] Funktion ist deaktiviert.");
    return null;
  }

  try {
    // 1. Capacitor Geolocation versuchen
    try {
      const permResult = await Geolocation.checkPermissions();
      if (permResult.location !== "granted" && permResult.coarseLocation !== "granted") {
        const reqResult = await Geolocation.requestPermissions();
        if (reqResult.location !== "granted" && reqResult.coarseLocation !== "granted") {
          throw new Error("Standortberechtigung verweigert");
        }
      }

      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000,
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        heading: position.coords.heading,
        speed: position.coords.speed,
      };
    } catch (capError) {
      console.warn("[Geolocation] Capacitor Geolocation Fehlgeschlagen, versuche Web-Fallback:", capError);
      
      // 2. Fallback auf standardmäßige Browser-API
      if (typeof window !== "undefined" && "geolocation" in navigator) {
        return new Promise<Coordinates>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
                altitude: pos.coords.altitude,
                heading: pos.coords.heading,
                speed: pos.coords.speed,
              });
            },
            (err) => reject(err),
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 3000,
            }
          );
        });
      }

      throw capError;
    }
  } catch (error) {
    console.error("[Geolocation] Fehler bei Standortabfrage:", error);
    throw error;
  }
}
