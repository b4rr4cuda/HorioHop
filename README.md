# HorioHop

Rural Cyprus transport discovery app. Find bus routes to mountain villages, or request a shuttle if none exist.

## ⚠️ Development Notice

**This application is currently in development mode.**

- Details such as telephone numbers, taxi company names, and shuttle names are fictional and for demonstration purposes only.
- Information about villages and population may be inaccurate.
- Bus data is pulled from GTFS datasets available on [data.gov.cy](https://data.gov.cy).

## AI Assistance

The code in this project was built with the help of AI technologies, namely Cursor, Claude and Grok. As the time-frame for building the project was very short, we used AI to speed up prototyping so our 2-person team could focus on the big wins: engineering the high-level logic and nailing the impact angle.

## Running Locally

1. Download GTFS datasets:
   - [Paphos](https://data.gov.cy/en/dataset/1031)
   - [Famagusta](https://data.gov.cy/en/dataset/1030)
   - [Limassol](https://data.gov.cy/en/dataset/1029)
   - [Larnaca](https://data.gov.cy/en/dataset/1028)
   - [Intercity](https://data.gov.cy/en/dataset/1032)
   - [Nicosia](https://data.gov.cy/en/dataset/1027)

2. Unzip datasets and rename the folder to lowercase name of the dataset (e.g. `paphos`, `intercity`).

3. Set up Motis:
   ```bash
   # Create a folder for Motis
   mkdir motis-cyprus
   cd motis-cyprus

   # Download Motis (for Mac ARM, adjust TARGET for your platform)
   # Options: linux-amd64, linux-arm64, macos-arm64, macos-x86_64, windows
   TARGET="macos-arm64"
   wget https://github.com/motis-project/motis/releases/latest/download/motis-${TARGET}.tar.bz2
   tar xf motis-${TARGET}.tar.bz2

   # Download Cyprus OSM data from Geofabrik
   wget https://download.geofabrik.de/europe/cyprus-latest.osm.pbf
   ```

4. Inside `motis-cyprus`, create a folder `gtfs` and establish the following folder structure using unzipped GTFS datasets:
   ```
   gtfs/
   ├── paphos/
   ├── famagusta/
   ├── limassol/
   ├── larnaca/
   ├── intercity/
   └── nicosia/
   ```

5. Create a file `config.yml` in the `motis-cyprus` folder with the following contents, changing the file names where necessary:
   ```yaml
   server:
     host: 0.0.0.0
     port: 8080
     web_folder: ui

   osm: cyprus-latest.osm.pbf

   timetable:
     first_day: 2026-01-17
     num_days: 30
     datasets:
       famagusta:
         path: gtfs/famagusta
       limassol:
         path: gtfs/limassol
       larnaca:
         path: gtfs/larnaca
       nicosia:
         path: gtfs/nicosia
       paphos:
         path: gtfs/paphos
       intercity:
         path: gtfs/intercity

   street_routing: true
   geocoding: true
   osr_footpath: true
   ```

6. Start Motis (routing engine):
   ```bash
   cd motis-cyprus
   ./motis import
   ./motis server
   ```

7. Start the frontend:
   ```bash
   npm install
   npm run dev
   ```

8. Open http://localhost:5173

## Architecture

### Data Flow

1. User opens app → requests geolocation
2. User clicks village marker → sidebar opens
3. App queries Motis for routes TO and FROM village
4. User sees route options, clicks one to preview on map
5. If no routes, user can request a shuttle (stored in localStorage)

### Routing

All journey planning is handled by Motis (local server). Frontend sends origin/destination coordinates, receives complete itineraries with stops, times, and polylines. No GTFS parsing in frontend.

### External Dependencies

- **Motis** — Local routing engine at http://localhost:8080. Handles all GTFS parsing and routing logic.
- **OpenStreetMap** — Map tiles
- **Leaflet** — Map rendering via react-leaflet

### Demand Logging

Shuttle requests are stored in browser localStorage. Data persists locally on user's device.