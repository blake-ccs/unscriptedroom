# Migration prompt: The Unscripted Room — Lovable UI → existing ActiveCampaign backend

> Paste everything below the line into Claude Code, run from `/Users/oliverlooker/unscriptedroom`.
> First, read **Decisions to confirm** and edit any default you disagree with.

---

## Decisions to confirm (defaults shown; edit before running)

| # | Decision | Default |
|---|----------|---------|
| D1 | Hosting for the new frontend | **Netlify**, same site and domain as today (`theunscriptedroom.com`). Not Lovable hosting. |
| D2 | Where the new app lives in the repo | Move it to **`/web`** on a new branch `feat/new-ui-migration`. Leave the old React app at the repo root untouched for rollback. |
| D3 | Rendering mode | **Static / SPA build** (prerender the public routes, SPA fallback). No SSR server and no server functions. |
| D4 | Backend changes | **None.** Fly.io `server/` stays byte-for-byte the same. CORS is the only exception, and only if the final origin isn't already allowed. |
| D5 | "The Follow-Up" newsletter signup | Wire to `POST /api/lead` with `offer: "follow-up-newsletter"`. |
| D6 | `/portal` (fake speaker login) | Keep the route, **remove it from the footer**, and add a clear "Coming soon" state. Do **not** wire it to `/auth/login`. |
| D7 | Legacy flows with no page in the new UI | **Port** `/qr` (printed envelope QR codes) and `/survey` (post-session survey) into the new design. **Don't port** account/product features (login, register, my, profile, episodes/player/coins, team chemistry, pricing, platform, services); 301-redirect those URLs. |
| D8 | Search indexing | Keep `noindex` + blocking `robots.txt` until launch day, then remove both (step 9). |
| D9 | Phone + SMS consent on /apply | Phone stays optional and **`smsOptIn` is not sent**. The new design removed the SMS consent copy. |

---

## Role and goal

You are migrating The Unscripted Room podcast website to a new UI. The finished site must:

1. Use the new Lovable-built UI in `Updated_UR_Web_UI/lovable code base unscripted room/` as the source of truth for **all visual design, copy, routes and components**.
2. Send **every form** to the **existing Express backend on Fly.io** (`https://server-winter-pond-1948.fly.dev`, source in `server/index.js`). That backend writes to ActiveCampaign (AC). It must produce the same AC contacts, lists, tags, custom fields and custom-object records that the current React site produces.
3. Remove Supabase / Lovable Cloud entirely.
4. Deploy to Netlify exactly as the current site does, with no regression for existing inbound links (QR codes, emailed survey links, old nav URLs).

Do not redesign anything. Change markup only where a form needs real state, loading/error handling, or a field the backend requires.

---

## Context: what exists today (verified)

### Current production site (repo root)
- React 18 + Vite 5 + react-router 6. Netlify config: `netlify.toml` (build `npm run build`, publish `dist`, SPA redirect).
- API base: `src/lib/apiBase.ts` → `import.meta.env.VITE_API_BASE_URL || "https://server-winter-pond-1948.fly.dev"`.
- Form → endpoint usage (copy these payload shapes exactly):
  - `src/components/ContactUsModal.tsx`: contact mode → `POST /api/contact`; podcast/community guest mode → `POST /api/lead`. **Read the whole file.** It is the reference for guest-application payloads (lines ~360–400).
  - `src/pages/QuickLanding.tsx` (`/qr`) → `POST /api/qr/lead` `{ name, email, stage: "captured" }`.
  - `src/pages/Survey.tsx` (`/survey`) → `POST /api/survey` (optional Bearer token; email in body).
  - `src/components/RegisterInterestModal.tsx` → `POST /api/register` (legacy community registration; not needed by the new UI).
- Real legal copy lives in `src/pages/Privacy.tsx` and `src/pages/Terms.tsx`.

### Backend (`server/index.js`, Express on Fly app `server-winter-pond-1948`)
- CORS allow-list (lines ~10–17, 54–70): `localhost:3000`, `localhost:5173`, `theunscriptedroom.com`, `www.theunscriptedroom.com`, `unscriptedroom.com`, `www.unscriptedroom.com`, and any origin ending in `.netlify.app`. **Lovable domains and `localhost:8080` are NOT allowed.**
- `rateLimit`: 60 requests/min per IP per path.
- Relevant endpoints:
  - **`POST /api/lead`** (line ~3020). Requires `email` and `offer`. Upserts the AC contact (`firstName`, `lastName`, `phone`) and writes custom fields via `buildLeadFields` (line ~1431). Accepted keys: `offer, source, utmSource, utmMedium, utmCampaign, utmContent, utmTerm, city, stateProvince, bioAboutMe, reasonsForSignup, reasonsForJoining, preferredDay, preferredTime, preferredCommunicationMethod, smsOptIn, jobTitle, companyName, …`. Tags: `offer:<offer>`, `LIFECYCLE: Lead`, `src:web`, plus `podcast:experience-preference:<slug>` and `podcast:conversation-interest:<slug>` built from `experiencePreference` / `reasonsForJoining` by `buildGuestPreferenceTag`. The prefix is `community` if `offer` starts with "community", otherwise `podcast`. Subscribes the contact to `ACTIVE_CAMPAIGN_LIST_ID` and the master list. Returns `{ ok, status, token, warnings? }`; returns 500 on hard failure.
  - **`POST /api/contact`** (line ~2912). Requires `name, email, subject, message`. `name` is a single string, split on whitespace into first and last. Adds tag `contact us: <subject with non-letters stripped>`, `src:web`, `LIFECYCLE: Engaged`. Writes the subject/message fields and a Contact Message custom-object record, and appends to `/data/submissions.txt`. Returns `{ ok: true }` even if AC fails (logged server-side).
  - **`POST /api/qr/lead`**: `{ name, email, stage }`. Tag `src: Envelope QR`.
  - **`POST /api/survey`**: see `Survey.tsx` for the field list.
- `upsertFieldValues` skips `undefined/null/""`. Leaving a field out never wipes existing AC data, so **omit empty optional values rather than sending `""`**.

### New UI (`Updated_UR_Web_UI/lovable code base unscripted room/`)
- **TanStack Start** (file-based routes in `src/routes/`), React 19, Tailwind 4, shadcn/ui, Vite 8, built with `@lovable.dev/vite-tanstack-config`. That package bundles nitro with a **Cloudflare** target by default. Package manager is bun (`bun.lock`).
- SSR entry `src/server.ts`; `src/start.ts` registers `attachSupabaseAuth` middleware and CSRF middleware for server functions.
- Supabase: `src/integrations/supabase/*`, `supabase/` (table `conversation_interests`), `src/lib/interest.functions.ts` (server fn), `.env` (Supabase URL/keys).
- **Assets are not in the repo.** Every `src/assets/*.asset.json` is a pointer to `/__l5e/assets-v1/<uuid>/<file>`, which only Lovable's hosting serves. On Netlify all of these 404 (20 files: photos, logos, Season One thumbnails, and the hero video `hero-shot.mp4` at 23 MB and `hero-shot.webm` at 17 MB). Only `src/assets/mic-cream.png` is a real file.
- Forms in the new UI and their current state:

| Location | Form | Current behaviour |
|---|---|---|
| `src/routes/apply.tsx` | Join a Conversation / guest interest (`?conversation=<title>` preselects) | Saves to **Supabase** via `submitInterest` server fn |
| `src/routes/contact.tsx` | Contact (first, last, email, topic, message) | **Mock.** Uncontrolled inputs; just sets `done` |
| `src/components/site/site-ui.tsx` → `FollowUpSignup` (on Home) | Newsletter email | **Mock** |
| `src/routes/portal.tsx` | Speaker portal login | **Mock.** Any email/password "opens" the preview |
- Pre-launch flags already in the code: `noindex` meta in `src/routes/__root.tsx`, blocking `public/robots.txt`, placeholder Privacy/Terms ("This front-end mockup does not store or transmit form submissions", which becomes false after this work), and fabricated testimonials on `/about` marked "PLACEHOLDER — REPLACE BEFORE PUBLISHING".

---

## Work plan

Work on branch `feat/new-ui-migration`. Commit after each numbered step with a clear message. Run `build` and `lint` before every commit. Don't push or deploy without asking me.

### Step 1: Relocate and inventory
1. Create the branch. Move the contents of `Updated_UR_Web_UI/lovable code base unscripted room/` into `web/`, then delete the now-empty `Updated_UR_Web_UI/` folder. The path contains spaces, which Netlify base directories handle badly.
2. Delete `web/.env` (Supabase keys) and `web/.lovable/` (Lovable plan files; keep a copy of `roadmap.md` if useful). Keep `web/AGENTS.md` only if we will keep editing in Lovable (we won't by default, so delete it).
3. Install with npm and generate `web/package-lock.json`. Remove `bun.lock` and `bunfig.toml` so there is one lockfile. Confirm `npm run dev` starts and record the port.
4. Write `web/MIGRATION_NOTES.md` listing every route, every form, and every external URL in the app. Update it as you go.

### Step 2: Replace Lovable-hosted assets with real files
1. For each `web/src/assets/*.asset.json`, get the binary and save it beside the code: images in `web/src/assets/` (imported normally so Vite fingerprints them), videos in `web/public/media/`.
   - Source A: the published Lovable site. Download `https://<lovable-published-domain><url>` for each `url` in the JSON. **Ask me for the domain** if you can't find it in the repo.
   - Source B (fallback): originals in the repo's `OneDrive_*` folders and `Landing page hero video.mov`. Only use one if you're confident it's the same image; list any substitutions for me.
   - Check that each downloaded file's byte size matches the `size` in its JSON.
2. Update every import site (`site-media.ts`, `site-shell.tsx`, `index.tsx`, `about.tsx`, `join-a-conversation.tsx`, `season-two.$episode.tsx`, and any others; grep for `.asset.json`). Images: `import x from "@/assets/x.jpg"` and use `x` in place of `x.url`. Videos: reference `/media/hero-shot.webm` and `/media/hero-shot.mp4`.
3. Delete all `.asset.json` files. `grep -r "__l5e\|asset.json" web/src` must return nothing.

### Step 3: Strip Supabase and Lovable runtime dependencies
1. Delete `web/src/integrations/supabase/`, `web/supabase/`, and `web/src/lib/interest.functions.ts`. Remove `@supabase/supabase-js` from `package.json`.
2. In `web/src/start.ts`, remove `attachSupabaseAuth`. If no server functions remain after step 5, remove the CSRF middleware too, or delete `start.ts` if the static build doesn't need it.
3. Read `web/src/lib/lovable-error-reporting.ts` and `error-capture.ts`. Remove anything that reports to Lovable endpoints or relies on the Lovable sandbox. Keep a plain `console.error` in the root error boundary.
4. Move the two option constants, `INTEREST_OPEN_OPTION` and `INTEREST_FUTURE_OPTION`, into `web/src/lib/site-data.ts` and keep their exact strings.
5. **Before deleting**, tell me to check the Lovable Cloud table `conversation_interests` for real submissions. If any exist, give me a one-off script at `web/scripts/backfill-interests.mjs`. It should read a CSV export and POST each row to `/api/lead` with the step 5.2 mapping, throttled under the rate limit (1 request/sec). Don't run it yourself.

### Step 4: Build and hosting config (static on Netlify)
1. Read `node_modules/@lovable.dev/vite-tanstack-config` to see which options it passes to `tanstackStart` and nitro. Configure the build so `npm run build` emits a **static site**. Preferred: TanStack Start SPA mode, plus prerendering of all static routes (`/`, `/watch`, `/about`, `/faq`, `/join-a-conversation`, `/apply`, `/contact`, `/season-two`, `/season-two/1`…`/season-two/9`, `/privacy`, `/terms`, `/portal`, `/qr`, `/survey`) so each page ships its own `<head>` meta.
   - If the Lovable wrapper blocks this, replace it with a plain `vite.config.ts` that uses `@tanstack/react-start/plugin/vite`, `@vitejs/plugin-react`, `@tailwindcss/vite` and `vite-tsconfig-paths`, with the `@` alias. Remove the wrapper and `nitro` from devDependencies.
   - Acceptable fallback, only if static is impossible: nitro preset `netlify` (SSR on Netlify Functions). Explain why before choosing it.
2. Redirects declared with `beforeLoad` + `redirect({statusCode:301})` (`/be-a-guest`, `/partners`, `/the-room`) don't produce real 301s in a static build. Keep the client redirects, and also add server-side 301s in `web/public/_redirects` (step 7).
3. Create `web/netlify.toml`: `[build] base = "web"`, `command = "npm run build"`, `publish = <the real output dir you verified>`, `[build.environment] NODE_VERSION = "22"`, plus the SPA fallback `/* /index.html 200` (or the shell file TanStack emits) **after** the 301 rules.
4. API base: create `web/src/lib/api.ts`:
   ```ts
   export const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "")
     || "https://server-winter-pond-1948.fly.dev";
   export async function postJson<T = unknown>(path: string, body: unknown, init?: { token?: string }): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }>
   ```
   It should POST JSON, add `Authorization: Bearer` only when a token is given, use a 15 s `AbortController` timeout, parse `{ error }` from non-2xx responses, and never throw. Strip keys whose value is `undefined` or `""` before sending.
5. Dev: add a Vite `server.proxy` for `/api` and `/auth` → `http://localhost:3001`, matching the root `vite.config.ts`. **Set the dev port to 3000**, because Lovable's default 8080 isn't in the backend's CORS list. Add `web/.env.example` containing `VITE_API_BASE_URL=http://localhost:3001`.

### Step 5: Rewire the forms (core of the task)
Keep every visual element, validation message and success screen as it is. Add a disabled/"Sending…" state, an inline `role="alert"` error on failure, and protection against double submits. Add an invisible honeypot field (`name="company_website"`, `tabIndex={-1}`, `autoComplete="off"`, visually hidden). If it's filled, show success without sending anything.

**5.1 Contact (`/contact`) → `POST /api/contact`**
Convert to controlled state with the same validation style as `/apply`. Payload:
```json
{ "name": "<first> <last>", "email": "<email>", "subject": "<topic option text>", "message": "<message>" }
```
Don't send `phone` or `smsOptIn`; the new form doesn't collect them. Show the existing "Your note arrived." screen only after a 2xx.
Resulting AC tags: `contact us: Generalquestion`, `contact us: Suggestaconversationtopic`, `contact us: Partnershiporcollaboration`, `contact us: Mediainquiry`, `contact us: Somethingelse`. **List these in your final report.** The old site's topics produced different tags (only "Something else" matches), so AC automations keyed on the old tags need updating by me.

**5.2 Apply / Join a Conversation (`/apply`) → `POST /api/lead`**
Replace `useServerFn(submitInterest)` with `postJson("/api/lead", payload)`. Mapping:

| Form field | Payload key | AC effect |
|---|---|---|
| email | `email` (trimmed, lowercased) | contact |
| first / last | `firstName` / `lastName` | contact |
| phone (optional) | `phone` (omit if blank) | contact phone |
| — | `offer: "podcast-guest"` | tag `offer:podcast-guest` + Offer Registered field. **Must match the old value** so existing AC automations fire |
| — | `source: "web"` | Lead Source field |
| town | `city` | City field |
| state | `stateProvince` | State/Province field |
| why | `reasonsForSignup` | Reasons for Signup field |
| conversation (select) | `reasonsForJoining` (omit if blank) | Reasons for Joining field + tag `podcast:conversation-interest:<slug>`, e.g. `podcast:conversation-interest:based-on-a-true-story` |
| all long answers | `bioAboutMe` | Bio/About Me field: a labelled block, see below |
| URL UTMs | `utmSource`, `utmMedium`, `utmCampaign`, `utmContent`, `utmTerm` | UTM fields |

`bioAboutMe` format (mirrors the old `buildGuestMessage`):
```
Application Type: Join a Conversation (website)
Conversation Interest: <conversation or "Not specified">
Town/State: <town>, <state>
Phone Number: <phone or "Not provided">
Why interested: <why>
Perspective/experience: <perspective>
Anything else: <anythingElse or "—">
```
Don't send `smsOptIn` (D9) or `experiencePreference` (the new form doesn't ask). Keep client-side max lengths. Success = 2xx, after which you show the existing "Thanks for raising your hand." screen.

**UTM capture:** add `web/src/lib/attribution.ts`. On first load, read `utm_*` from `window.location.search`. Store them in `sessionStorage` (try/catch; first touch wins). Expose `getUtm()` and use it in 5.2 and 5.3.

**5.3 Follow-Up signup (`FollowUpSignup` in `site-ui.tsx`) → `POST /api/lead`**
Payload: `{ email, offer: "follow-up-newsletter", source: "web", ...getUtm() }`. Effect: contact on the main and master lists, tags `offer:follow-up-newsletter`, `LIFECYCLE: Lead`, `src:web`. Side effect to report: for an existing contact this overwrites the "Offer Registered" field. Show "You're on the list." only after a 2xx.

**5.4 Portal (`/portal`)**: per D6, remove "Speaker Portal" from `footerLinks` in `site-shell.tsx`. Replace the fake login with the existing preview copy and a "Coming soon for confirmed speakers" note. Make no API calls.

### Step 6: Port the two legacy flows into the new design
Build these as new route files in the new visual system (`paper-card`, `form-label`, `Button variant="apply"`, and so on). Keep the **exact payloads and behaviour** of the originals:
1. **`/qr`** (`web/src/routes/qr.tsx`), from `src/pages/QuickLanding.tsx`. Keep its envelope copy and the choice → form → done flow. `POST /api/qr/lead` with `{ name, email, stage: "captured" }`. Printed QR codes point here, so the URL must not change.
2. **`/survey`** (`web/src/routes/survey.tsx`), from `src/pages/Survey.tsx`. Same questions, options and field names, and `POST /api/survey` with an identical body. Survey links in AC emails point here. Make sure email is collectable when there's no `localStorage` auth email. Read the survey assets in `src/assets/survey assets/` and either reuse them or reproduce the selection UI with Tailwind; your choice, but it must stay accessible (real radio/checkbox inputs).

Don't add either page to the main navigation.

### Step 7: Legacy URL redirects (`web/public/_redirects`, 301)
```
/podcast                 /                     301
/company/podcast         /                     301
/episodes                /watch                301
/player                  /watch                301
/why                     /about                301
/community               /about                301
/company/community       /about                301
/contact-us              /contact              301
/register-interest       /apply                301
/be-a-guest              /join-a-conversation  301
/the-room                /about                301
/partners                /contact              301
/login                   /                     301
/register                /                     301
/my                      /                     301
/profile                 /                     301
/start                   /                     301
/success                 /                     301
/pricing                 /                     301
/platform/*              /                     301
/services/*              /                     301
/app/*                   /                     301
/invite/*                /                     301
```
Then the SPA fallback last.

### Step 8: Legal pages and copy that becomes false
1. Port the real text from `src/pages/Privacy.tsx` and `src/pages/Terms.tsx` into `web/src/routes/privacy.tsx` and `terms.tsx` using the new styling. Remove "Website mockup" and "This front-end mockup does not store or transmit form submissions".
2. **Don't** edit the placeholder testimonials on `/about`. List them in the final report as a launch blocker for me to supply.

### Step 9: Launch-day toggles (prepare, don't apply)
Put the changes for D8 on a separate commit labelled `launch: allow indexing`, or behind a `VITE_ALLOW_INDEXING=true` env check: remove the `robots`/`googlebot` noindex meta from `__root.tsx` and replace `public/robots.txt` with an allow-all file plus the sitemap. Tell me how to apply it.

### Step 10: Backend (expected: no change)
- Confirm the production origin(s) are already in the CORS list (`theunscriptedroom.com`, `www.`, `*.netlify.app`). If the new site will use a different origin, **stop and tell me**. Don't edit `server/index.js` or deploy to Fly without approval.
- Don't touch `server/` otherwise.

---

## Verification (all must pass before you report done)

1. `cd web && npm run build && npm run lint` with no errors. The output contains a prerendered HTML file per route listed in step 4.1.
2. `grep -rniE "supabase|__l5e|asset\.json|lovable" web/src` returns nothing, except comments you can justify.
3. Run the backend locally: `npm run server` from the repo root (it reads the root `.env` with AC credentials; ask me if it's missing). Then `cd web && npm run dev`. Submit each form with a test address like `oliver+ur-migration-<form>@…`, after confirming the address with me, and record the network request/response:
   - `/apply` with a conversation preselected via `/apply?conversation=Listen%20Closely`
   - `/apply` with no conversation
   - `/contact` (one per topic is ideal; at least two)
   - Follow-Up signup on `/`
   - `/qr`
   - `/survey`
4. Give me a checklist to verify in ActiveCampaign for each test contact: lists, the exact tags expected, and the custom-field values expected. Do this as a table I can tick off.
5. Failure paths: stop the backend and confirm each form shows its error message and keeps the user's input. A rapid double click sends one request. Filling the honeypot sends nothing.
6. Mobile check at 375 px width on every form page.
7. Serve the production build (`npx serve` on the publish dir, or `netlify dev` if installed) and confirm the redirects in `_redirects` and that the media assets load.

## Final report
Reply with:
- Summary of changes per step, with file paths.
- The form → endpoint → AC tags/fields table, as implemented.
- **Action items for me:** new contact-topic tags vs old tags to update in AC automations; new `podcast:conversation-interest:*` tag values (Season Two titles) replacing the old Craft/Relationships/Passions values; the Lovable Cloud data check / backfill; placeholder testimonials; Netlify site settings to change (base dir `web`, publish dir, `VITE_API_BASE_URL`, Node 22); the launch-day indexing commit.
- Anything you couldn't verify, stated plainly.
