# OpenWarnDEV – Server-Idee vollständig mit Firebase umsetzen

Bezug: `docs/ARCHITECTURE.md` (Server-Aufgaben) und `docs/SERVER_REQUIREMENTS.md`.
Ziel dieser ersten Ausbaustufe: Admin-UI unter eigener Subdomain, Login (kein Self-Signup),
Nutzerverwaltung, Datenquellen der Kategorie "Wetter" (DWD + OpenWeather), Wahrscheinlichkeit
pro Kachel berechnen und als ersten Map-Layer bereitstellen.

---

## 1. Warum diese Bausteine (Mapping deiner Server-Anforderungen → Firebase-Dienst)

| Server-Anforderung (aus deinen Docs)              | Firebase-Äquivalent                                  |
|----------------------------------------------------|-------------------------------------------------------|
| Web-Administrationsoberfläche (Port 3000)          | Zweite **Firebase Hosting**-Site → eigene `*.web.app`-Subdomain |
| Authentifizierung, kein Self-Signup                | **Firebase Auth** (Email/Passwort) + Custom Claims, Nutzer nur per Admin-Funktion angelegt |
| Datenquellen-/Konfigurationsverwaltung              | **Firestore**-Collection `dataSources`, verwaltet über die Admin-UI |
| Datenbeschaffung aus öffentlichen Quellen (DWD, OpenWeather) | **Cloud Functions (scheduled)**, ruft die APIs serverseitig ab |
| Normalisierung & regionale Zusammenführung          | Logik innerhalb der Cloud Function, Ergebnis in Firestore `weatherTiles` |
| API-Keys geheim halten                              | **Secret Manager** (über Firebase Functions Params) |
| Zugriff für den Map-Layer im Client                 | Firestore **öffentlich lesbar**, Client hört per `onSnapshot` |

Der Server wird laut deiner `ARCHITECTURE.md` mit **Python** entwickelt – das bleibt so:
Firebase Cloud Functions (2nd Gen) unterstützen Python 3.12 als offiziellen Runtime, daher
schreiben wir die Funktionen in Python statt in Node.js.

---

## 2. Wichtiger Hinweis zu Kosten/Plan

- **Firebase Hosting**: mehrere Sites pro Projekt sind auf dem kostenlosen **Spark-Plan** möglich.
  Du bekommst für die Admin-UI eine zweite kostenlose Subdomain wie `openwarnde-admin.web.app`.
- **Cloud Functions (2nd Gen)**: brauchen zwingend den **Blaze-Plan** (Kreditkarte hinterlegt,
  Pay-as-you-go). Das kostenlose Kontingent (u. a. 2 Mio. Aufrufe/Monat, 360.000 GB-Sekunden)
  bleibt aber erhalten – du zahlst nur, wenn du darüber kommst. Für ein Projekt wie deins (ein
  Scheduled-Fetch alle 15 Minuten + ein paar Admin-Aufrufe) wirst du realistisch bei 0 € bleiben,
  mgu musst aber die Karte hinterlegen.
- **Firestore**: ebenfalls im Spark-Free-Tier ausreichend für den Anfang (50k Reads/20k Writes pro Tag).

---

## 3. Projektstruktur (Ergänzung zu deinem bestehenden Repo)

```
OpenWarnDEV/
  app/                 # bestehende Client-App (Hosting-Target "app")
  admin/               # NEU: eigenes Next.js-Projekt für die Admin-UI (Hosting-Target "admin")
  functions/           # NEU: Cloud Functions in Python
    main.py
    requirements.txt
  firebase.json
  .firebaserc
  firestore.rules
```

`admin/` ist bewusst eine **eigene** Next.js-App (nicht nur eine Route in `app/`), weil sie
separat deployt, separat abgesichert und unabhängig vom Kartenclient aktualisiert werden soll.

---

## 4. Firebase-Setup (CLI-Befehle)

```bash
firebase login
firebase init hosting     # zweimal durchlaufen für "app" und "admin" Targets
firebase init firestore
firebase init functions   # Python auswählen

# Zweite Hosting-Site anlegen (= zweite kostenlose Subdomain)
firebase hosting:sites:create openwarnde-admin

# Targets verknüpfen
firebase target:apply hosting app openwarnde
firebase target:apply hosting admin openwarnde-admin
```

`firebase.json`:

```json
{
  "hosting": [
    {
      "target": "app",
      "public": "app/out",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
    },
    {
      "target": "admin",
      "public": "admin/out",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
    }
  ],
  "firestore": { "rules": "firestore.rules" },
  "functions": { "source": "functions", "runtime": "python312" }
}
```

Beide Apps bauen wie deine bestehende `app/` als statischer Export (`output: "export"` in
`next.config.ts`), deshalb `admin/out` als Hosting-Quelle.

---

## 5. Firestore-Datenmodell

```
dataSources/{sourceId}
  category: "wetter"
  type: "dwd" | "openweather"
  name: string
  enabled: boolean
  intervalMinutes: number
  config: { capFeedUrl?: string, apiKeySecretRef?: string, ... }
  lastFetchAt: timestamp
  lastStatus: "ok" | "error"

weatherTiles/{tileId}          // tileId z.B. "z8_x137_y84"
  tileX, tileY, zoom: number
  dwdRisk: number | null
  owmRisk: number | null
  combinedProbability: number  // 0.0 – 1.0, deine Wahrscheinlichkeitsrechnung
  updatedAt: timestamp

users/{uid}
  email: string
  role: "admin"
  createdBy: uid
  createdAt: timestamp
```

---

## 6. Auth ohne Self-Signup

Prinzip: Die Admin-UI zeigt **kein Registrierungsformular**. Nutzer entstehen ausschließlich über
eine Cloud Function, die nur ein bereits eingeloggter Admin aufrufen darf.

**Einmaliger Bootstrap** (ersten Admin anlegen, bevor die App existiert):

```bash
firebase auth:import bootstrap-user.json --hash-algo=STANDARD_SCRYPT
```
oder einfach einmalig manuell in der Firebase Console anlegen, danach per Skript den
Custom Claim setzen:

```python
# einmaliges lokales Skript, nicht Teil der App
import firebase_admin
from firebase_admin import auth
firebase_admin.initialize_app()
user = auth.get_user_by_email("deine@mail.de")
auth.set_custom_user_claims(user.uid, {"admin": True})
```

**`functions/main.py` – Callable Function für alle weiteren Nutzer:**

```python
from firebase_functions import https_fn, scheduler_fn
from firebase_admin import initialize_app, auth, firestore

initialize_app()
db = firestore.client()

def _require_admin(req: https_fn.CallableRequest) -> None:
    # req.auth ist None, wenn niemand eingeloggt ist.
    # req.auth.token ist das decodierte ID-Token mit allen Custom Claims.
    if not req.auth or not req.auth.token.get("admin"):
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.PERMISSION_DENIED,
            message="Nur Admins dürfen Nutzer anlegen.",
        )

@https_fn.on_call(region="europe-west3")
def create_user(req: https_fn.CallableRequest) -> dict:
    _require_admin(req)                       # 1. Berechtigung prüfen
    email = req.data["email"]                 # 2. Eingabedaten aus dem Client
    password = req.data["password"]
    new_user = auth.create_user(email=email, password=password)  # 3. Auth-User anlegen
    auth.set_custom_user_claims(new_user.uid, {"admin": True})   # 4. Als Admin markieren
    db.collection("users").document(new_user.uid).set({          # 5. Metadaten spiegeln
        "email": email,
        "role": "admin",
        "createdBy": req.auth.uid,
        "createdAt": firestore.SERVER_TIMESTAMP,
    })
    return {"uid": new_user.uid}
```

Warum `on_call` statt eines normalen HTTP-Endpunkts: Callable Functions prüfen das
Firebase-Auth-Token automatisch und stellen es dir als `req.auth` bereit – du musst nichts
selbst verifizieren.

---

## 7. Scheduled Function: DWD + OpenWeather abrufen

```python
from firebase_functions.params import SecretParam
import requests

OPENWEATHER_KEY = SecretParam("OPENWEATHER_API_KEY")  # in Secret Manager hinterlegt

@scheduler_fn.on_schedule(schedule="every 15 minutes", region="europe-west3",
                           secrets=[OPENWEATHER_KEY])
def fetch_weather_sources(event: scheduler_fn.ScheduledEvent) -> None:
    sources = (
        db.collection("dataSources")
        .where("category", "==", "wetter")
        .where("enabled", "==", True)
        .stream()
    )
    for doc in sources:
        cfg = doc.to_dict()
        if cfg["type"] == "dwd":
            _fetch_dwd(cfg)
        elif cfg["type"] == "openweather":
            _fetch_openweather(cfg, OPENWEATHER_KEY.value)
        db.collection("dataSources").document(doc.id).update({
            "lastFetchAt": firestore.SERVER_TIMESTAMP,
            "lastStatus": "ok",
        })

def _fetch_dwd(cfg: dict) -> None:
    resp = requests.get(cfg["config"]["capFeedUrl"], timeout=20)
    resp.raise_for_status()
    # CAP-Feed (XML/JSON) parsen und pro betroffener Region/Kachel ein Risiko ableiten.
    # Ergebnis normalisiert an _write_tile_result übergeben.
    _write_tile_result(source="dwd", results=_parse_cap(resp.text))

def _fetch_openweather(cfg: dict, api_key: str) -> None:
    resp = requests.get(
        "https://api.openweathermap.org/data/2.5/onecall",
        params={"lat": cfg["config"]["lat"], "lon": cfg["config"]["lon"], "appid": api_key},
        timeout=20,
    )
    resp.raise_for_status()
    _write_tile_result(source="openweather", results=_parse_openweather(resp.json()))

def _write_tile_result(source: str, results: list[dict]) -> None:
    for r in results:
        tile_ref = db.collection("weatherTiles").document(r["tile_id"])
        field = "dwdRisk" if source == "dwd" else "owmRisk"
        tile_ref.set({field: r["risk"], "updatedAt": firestore.SERVER_TIMESTAMP}, merge=True)
        # Wahrscheinlichkeit kombinieren, sobald beide Quellen für die Kachel vorliegen:
        snap = tile_ref.get().to_dict()
        if snap.get("dwdRisk") is not None and snap.get("owmRisk") is not None:
            combined = 0.6 * snap["dwdRisk"] + 0.4 * snap["owmRisk"]  # deine Gewichtung
            tile_ref.update({"combinedProbability": combined})
```

`_parse_cap` und `_parse_openweather` sind Platzhalter – die genaue Kachel-Zuordnung (welche
lat/lon gehört zu welcher `tile_id`) hängt von deinem Zoom-/Kachelschema in MapLibre ab; das
würde ich als eigenen Schritt angehen, sobald der Rest läuft.

---

## 8. Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null && request.auth.token.admin == true;
    }

    match /weatherTiles/{tileId} {
      allow read: if true;     // Map-Client darf öffentlich lesen
      allow write: if false;   // nur die Cloud Function (Admin SDK) darf schreiben
    }

    match /dataSources/{sourceId} {
      allow read, write: if isAdmin();
    }

    match /users/{uid} {
      allow read, write: if isAdmin();
    }
  }
}
```

Wichtig: Die Cloud Function nutzt das Admin SDK, das die Security Rules komplett umgeht – nur
Zugriffe vom Client (Browser) werden durch diese Regeln geprüft.

---

## 9. Admin-UI (`admin/` – Next.js, gleicher Stack wie `app/`)

**Login-Seite** (kein Registrierungslink!):

```tsx
"use client";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";

export default function LoginPage() {
  async function handleLogin(email: string, password: string) {
    const auth = getAuth(firebaseApp);
    await signInWithEmailAndPassword(auth, email, password);
    // danach: Redirect ins Dashboard, Custom Claims kommen automatisch im ID-Token mit
  }
  // ... Formular, ruft handleLogin auf
}
```

**Route-Schutz** (vereinfachtes Beispiel als Hook):

```tsx
function useRequireAdmin() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const auth = getAuth(firebaseApp);
    return onIdTokenChanged(auth, async (user) => {
      if (!user) { router.push("/login"); return; }
      const token = await user.getIdTokenResult();
      if (!token.claims.admin) { router.push("/login"); return; }
      setReady(true);
    });
  }, []);
  return ready;
}
```

**Datenquellen-Seite**: liest `dataSources` per `onSnapshot`, zeigt Toggle-Switches (schreibt
direkt per Firestore-SDK, da die Rules `isAdmin()` bereits absichern) und ein Formular zum
Anlegen neuer Quellen der Kategorie "Wetter".

**Nutzer-Seite**: Formular ruft die `create_user`-Callable-Function auf:

```tsx
import { getFunctions, httpsCallable } from "firebase/functions";

const createUser = httpsCallable(getFunctions(firebaseApp, "europe-west3"), "create_user");
await createUser({ email, password });
```

---

## 10. Anbindung an den Map-Client (`app/`)

```ts
import { collection, onSnapshot } from "firebase/firestore";

onSnapshot(collection(db, "weatherTiles"), (snap) => {
  const features = snap.docs.map((d) => toGeoJSONFeature(d.data()));
  map.getSource("weather-probability")?.setData({ type: "FeatureCollection", features });
});
```

Als MapLibre-Layer eignet sich ein `fill`- oder `heatmap`-Layer, eingefärbt nach
`combinedProbability` (0.0 grün → 1.0 rot).

---

## 11. Reihenfolge zum Bauen

1. Firebase-Projekt: Blaze-Plan aktivieren, `firebase init` (Hosting ×2, Firestore, Functions/Python)
2. `firestore.rules` deployen
3. Ersten Admin-User + Custom Claim `admin: true` manuell setzen (Bootstrap, einmalig)
4. `create_user`-Callable-Function bauen & deployen, in Admin-UI testen
5. Admin-UI: Login + Nutzerverwaltung + Datenquellen-CRUD (nur Kategorie "wetter")
6. Scheduled Function für DWD/OpenWeather bauen, Kachel-Wahrscheinlichkeit ergänzen
7. Client: `weatherTiles`-Layer in MapLibre einbinden

Damit hast du nach Schritt 5 bereits die komplette Admin-Seite mit Login, Nutzerverwaltung und
Datenquellen – die eigentliche Wetterdaten-Logik (Schritt 6–7) baust du danach in Ruhe aus, ohne
dass Auth/Hosting/Rules nochmal angefasst werden müssen.