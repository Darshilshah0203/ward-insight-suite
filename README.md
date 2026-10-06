# Ward Navigator

1. Ward Workspace Shell & Navigation

Charcoal Sidebar: ClearDay brand header, active status indicator, and quick links for Ward Dashboard, Patients, and Round History.

Top Bar: Live ward status badge ("Ward Online"), current date (10-06-2026), global Celsius/Fahrenheit (°C/°F) temperature unit toggle, and nurse profile badge.

2. Clinical Overview & Round Progress

Unframed Header: "Nurse's Morning Round" with live completion metric (e.g. 44/74 beds completed, 59%) and circular progress indicator.

Quick-Filter Tabs: Accessible tabs with live counts:

Pending (vitals due today)

Fevers (patients with readings ≥38.0∘C≥38.0∘C)

Completed (checked today)

All Beds (full ward roster)

Search & Sorting: Instant search by patient name, bed number, or wing, plus sorting by Wing (North/South) or Urgency (fevers & missing readings first).

3. Patient Table with High-Contrast Accessibility

Tabular format with clear ARIA labels, semantic headers (Bed, Patient, Isolation Day, Latest Temp, Status, 3-Day Clear Streak).

High-visibility badges for fever alerts (≥38.0∘C≥38.0∘C in coral #E66B60), normal readings in muted green, and pending badges.

Keyboard-navigable row selection updating the inspection drawer.

4. Side Inspection Drawer & Temperature History

Selected Patient Overview: Bed number, wing, admission date, days in isolation, and current vitals (pulse, SpO2).

3-Clear-Day Discharge Eligibility Tracker: Visual 3-day fever-free streak tracker indicating whether clinical discharge review is met or pending.

7-Day Temperature History: Scannable tabular/sparkline log showing dates, measured values in selected unit (°C/°F), and notes.

Record Vitals Action: Direct input dialog to submit today's temperature and observation notes.

Switch to Build mode to implement this dashboard.

Switching to build mode for dashboard tweaks make this changes to https://clearday-three-clear-days-home-safe.ai.studio/

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ward-insight-suite.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c81211f2-a07e-5f55-9d12-102a268b7811).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
