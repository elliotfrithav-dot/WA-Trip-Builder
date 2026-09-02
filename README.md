# WA Adventure Explorer

A personal Western Australia adventure & marine-life trip planner. Currently covers Perth → Jurien Bay (north) → Margaret River (south), with a working Trip Builder scored against live weather/marine conditions.

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL. To test on your phone, run `npm run dev -- --host` and open `http://<your-computer's-LAN-IP>:5173` on the phone (same Wi-Fi network), then use the browser's "Add to Home Screen" option to install it as an app.

## Build

```bash
npm run build   # type-checks and produces dist/
npm run preview # serve the production build locally
```

## Notes

- Weather and marine conditions (wind, swell, wave height/period) are live, from [Open-Meteo](https://open-meteo.com) — free, no API key.
- Tide info is an astronomical spring/neap estimate only (moon phase), not a real tide table — always labeled as such in the UI.
- Campsite, dive/snorkel site, and wildlife data are seed data, flagged `needs-verification` — verify details before relying on them to travel.
- Trips/gear/sightings persist in browser `localStorage` only (no backend yet).
