# Curiosity Web

React + Vite frontend with an Express API server for form submissions and ActiveCampaign/Calendly integrations.

## Requirements
- Node.js LTS
- npm

## Local setup
1. Install dependencies:
   ```bash
   npm install
   ```
1. Create your env file:
   ```bash
   cp .env.example .env
   ```
1. Update `.env` with real values for your environment.
1. For local API calls from the frontend, add this to `.env`:
   ```bash
   VITE_API_BASE_URL=http://localhost:3001
   ```
1. Start the API server:
   ```bash
   npm run server
   ```
1. Start the frontend dev server:
   ```bash
   npm run dev
   ```
1. Open `http://localhost:3000`.

Notes:
- Vite dev server proxies `/api` to `http://localhost:3001` (see `vite.config.ts`).
- The API server reads `.env` from the repo root when started with `npm run server`.

## Scripts
- `npm run dev` - Frontend dev server on port 3000
- `npm run build` - Production build into `dist/`
- `npm run preview` - Preview production build on port 4173
- `npm run server` - Local API server on port 3001
- `npm run lint` - ESLint

## Netlify deploy
This repo includes `netlify.toml`:
- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirect for React Router

The Express API server is not deployed on Netlify. Deploy the server separately (for example on Fly or another Node host), then set:
- `VITE_API_BASE_URL` in Netlify environment variables to your API base URL


