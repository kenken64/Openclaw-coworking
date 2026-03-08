# OpenClaw Coworking — Agents Team

An interactive, retro‑styled coworking floor where “agents” wander between rooms and update their status in real time. Built with React, TypeScript, and Vite.

![Pixel Office](src/assets/LargePixelOffice.png)

## Features

- Live agent activity with randomized status/progress updates
- Sidebar search and status filtering (ALL, WORKING, IDLE, COMPUTING)
- Click any agent to highlight them across views
- Pixel‑art office rooms with animated sprites and simple furniture layouts

## Tech Stack

- React 19 + TypeScript
- Vite 7 (HMR dev server and build)
- ESLint (React + TypeScript rules)

## Getting Started

Prerequisites: Node.js 18+ and npm.

1. Install dependencies
   ```bash
   npm install
   ```
2. Start the dev server
   ```bash
   npm run dev
   ```
3. Open the app at the URL printed in your terminal (typically http://localhost:5173).

## Available Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — type‑check and build to `dist/`
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint
- `npm run deploy` — publish `dist/` to GitHub Pages (via `gh-pages`)

## Project Structure

```
src/
  assets/            # Pixel office sprite sheets and images
  components/
    Header.tsx       # Top bar with clock and branding
    Sidebar.tsx      # Search, filters, agent list with progress
    OfficeGrid.tsx   # Rooms layout with walking agents
    AgentCards.tsx   # Workstation cards for each agent
  data.ts            # Sample agents and rooms
  types.ts           # Shared TypeScript types
  App.tsx, App.css   # App shell and global styles
  main.tsx           # React entry point
```

To change the title/branding, edit `index.html` and `src/components/Header.tsx`.

## Customization

- Edit agents/rooms in `src/data.ts` (names, emojis, colors, room placement).
- Tweak visuals in `src/components/*.css` and `src/App.css`.
- Replace pixel assets in `src/assets/` as needed.

Note: Some emojis may render differently across platforms; update `emoji` fields in `src/data.ts` if you prefer simple characters/icons.

## Deployment (GitHub Pages)

This project is preconfigured to deploy to GitHub Pages.

1. Ensure the repository name matches the Vite base path in `vite.config.ts`:
   ```ts
   export default defineConfig({ base: '/Openclaw-coworking/' })
   ```
   Change the string if your repo name differs.
2. Build and deploy
   ```bash
   npm run build
   npm run deploy
   ```
3. In your GitHub repo settings, set Pages to serve from the `gh-pages` branch (root).
4. Your site will be available at `https://<your-username>.github.io/<your-repo>/`.

## Notes

- The app simulates activity by periodically randomizing agent status and progress; no backend is required.
- Type‑checking runs during build via TypeScript project references.
