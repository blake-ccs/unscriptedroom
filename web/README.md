# The Unscripted Room — website

TanStack Start + React 19 + Tailwind 4, prerendered to static HTML and deployed on Netlify.
Every form posts to the existing Express API in [`../server`](../server) (Fly.io app
`server-winter-pond-1948`), which writes to ActiveCampaign. There is no database here.

## Local development

Requires Node 22 (Vite 8 needs ≥ 20.19).

```bash
npm install
cp .env.example .env      # VITE_API_BASE_URL=http://localhost:3001 to use a local API
npm run dev               # http://localhost:3000 (3000 is in the API's CORS allow-list)
```

Run the API from the repo root with `npm run server` (it needs the root `.env` with ActiveCampaign
credentials). Without `VITE_API_BASE_URL` the site talks to the production API.

## Scripts

- `npm run build` — prerenders every route into `dist/client/`, writes `sitemap.xml`, and tidies the 404 shell
- `npm run preview` — serve the build
- `npm run lint` / `npm run format`

## Deploy

Netlify reads the repo-root `netlify.toml` (base `web`, publish `dist/client`, Node 22).
Redirects and headers are in `public/_redirects` and `public/_headers`, so `dist/client` also works
as a manual drag-and-drop deploy.
Legacy-URL 301s live in `public/_redirects`.

See [MIGRATION_NOTES.md](MIGRATION_NOTES.md) for the form → ActiveCampaign mapping.
