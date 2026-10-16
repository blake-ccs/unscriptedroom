# Migration notes: Lovable UI → existing ActiveCampaign API

## Forms

| Page | Endpoint | Payload | ActiveCampaign result |
|---|---|---|---|
| `/apply` (Join a Conversation) | `POST /api/lead` | `email, firstName, lastName, phone?, offer:"podcast-guest", source:"web", city, stateProvince, reasonsForSignup (why), reasonsForJoining (conversation)?, bioAboutMe (labelled block of all answers), utm*?` | Main + master lists; tags `offer:podcast-guest`, `LIFECYCLE: Lead`, `src:web`, `podcast:conversation-interest:<slug>` (when a conversation is chosen); fields Offer Registered, Lead Source, City, State/Province, Reasons for Signup/Joining, Bio/About Me, UTM fields |
| `/contact` | `POST /api/contact` | `name ("First Last"), email, subject (topic), message` | Contact list + master; tags `contact us: <topic letters>`, `src:web`, `LIFECYCLE: Engaged`; subject/message fields; Contact Message custom object; line in `/data/submissions.txt` |
| Home "There's more to talk about" signup | `POST /api/lead` | `email, offer:"follow-up-newsletter", source:"web", utm*?` | Main + master lists; tags `offer:follow-up-newsletter`, `LIFECYCLE: Lead`, `src:web` |
| `/qr` (envelope QR codes) | `POST /api/qr/lead` | `name, email, stage:"captured"` — unchanged from the old site | Unchanged |
| `/survey` (post-session survey) | `POST /api/survey` | Same keys as the old site; sends the old site's `access_token` as a Bearer token if the visitor still has it | Unchanged |

Blank optional values are never sent, so a repeat submission can't wipe existing ActiveCampaign data.
`smsOptIn` is not sent: the new design has no SMS consent copy.

UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) are captured
on the first page a visitor lands on (per browser tab) and sent with `/api/lead` submissions.

## ActiveCampaign follow-ups

**Contact topic tags changed.** The new topics produce these tags:
`contact us: Generalquestion`, `contact us: Suggestaconversationtopic`,
`contact us: Partnershiporcollaboration`, `contact us: Mediainquiry`, `contact us: Somethingelse`.
The old site produced `contact us: IhaveaquestionaboutTheUnscriptedRoom`,
`contact us: Iminterestedinattendingasession`,
`contact us: IdliketobringTheUnscriptedRoomtomyorganizationorcommunity`,
`contact us: Idliketobeapodcastguest` and `contact us: Somethingelse`. Update any automations keyed on those.

**Conversation-interest tags changed.** These used to be `podcast:conversation-interest:craft|relationships|passions`.
They are now Season Two titles, e.g. `podcast:conversation-interest:based-on-a-true-story`,
`…:listen-closely`, `…:permission-to-play-hard`, `…:healthy-at-what-cost`, `…:rethinking-education`,
`…:labor-of-love`, `…:life-is-the-lesson`, `…:you-can-t-win-them-all`, `…:dream-on`,
`…:i-m-open-to-different-conversations`,
`…:i-don-t-see-one-yet-but-i-d-like-to-be-considered-for-a-future-conversation`.

**Newsletter side effect.** If an existing contact signs up for the newsletter, their "Offer Registered"
field is overwritten with `follow-up-newsletter`.

## SEO

- Every page is prerendered with its own `<title>`, description, Open Graph tags and a canonical URL on
  `https://theunscriptedroom.com` (the domain the old site serves; `www` redirects to it).
- Indexable. `robots.txt` allows everything except `/qr`, `/survey` and `/portal`, which are also `noindex`.
- `sitemap.xml` is generated at build time from the prerendered pages.
- The favicon and Apple touch icon are the old site's `favicon.png`.
- Old URLs 301 to their new equivalents (`public/_redirects`). Unknown URLs return a real 404.

## Removed from the Lovable export

Supabase (client, server function, `conversation_interests` table migration, `.env`), Lovable's
build wrapper, error telemetry and plan files, the fake portal login, and the placeholder testimonials
on `/about`. Images and video previously served from Lovable's asset host are now real files in
`src/assets/` and `public/media/` (byte sizes verified against Lovable's manifests).

## Guest Intake (`/guest-intake`)

Unlisted page for confirmed guests, emailed as `https://theunscriptedroom.com/guest-intake?episode=<slug>`.
Not in navigation, the footer, the sitemap or `robots.txt`. It sends `noindex, nofollow` as both a meta tag
and an `X-Robots-Tag` header (`public/_headers`).

| Episode | Link |
|---|---|
| Based on a True Story | `/guest-intake?episode=based-on-a-true-story` |
| Listen Closely | `/guest-intake?episode=listen-closely` |
| Permission to Play Hard | `/guest-intake?episode=permission-to-play-hard` |
| Healthy at What Cost | `/guest-intake?episode=healthy-at-what-cost` |
| Rethinking Education | `/guest-intake?episode=rethinking-education` |
| Labor of Love | `/guest-intake?episode=labor-of-love` |
| Life Is the Lesson | `/guest-intake?episode=life-is-the-lesson` |
| You Can't Win Them All | `/guest-intake?episode=you-cant-win-them-all` |
| Dream On | `/guest-intake?episode=dream-on` |

Without a valid `episode`, the guest picks their conversation from a dropdown built from `seasonTwo`.

**Storage:** the server code is not modified (team rule). Intake posts to the existing `POST /api/lead`
with `offer: "guest-intake"`, `reasonsForJoining: <episode title>`, `instagramHandle`, and every answer in
`bioAboutMe` as a labelled block headed `GUEST INTAKE — <episode> (recording <date>)`.

**ActiveCampaign result:** the contact is upserted and added to the main and master lists. It's tagged
`offer:guest-intake`, `podcast:conversation-interest:<episode-slug>`, `LIFECYCLE: Lead` and `src:web`. The
Offer Registered, Reasons for Joining, Instagram and Bio / About Me fields are set, and Bio / About Me
**replaces** whatever the guest's application put there.

**Team access:** in ActiveCampaign, filter contacts by tag `offer:guest-intake` (and by the episode tag), then
read Bio / About Me.

## Videos: most viewed on YouTube

The Season One episode cards and the "Moments Worth Replaying" Shorts on Watch show the channel's
most-viewed uploads (top 3 full-length episodes, top 6 Shorts), read from
`src/data/youtube-most-viewed.json` with thumbnails in `src/assets/youtube/`.

Refresh: `npm run youtube:refresh`, then commit and deploy. It reads YouTube's public pages for
`@unscriptedroompodcast` (no API key), ranks by view count, takes titles and descriptions from YouTube,
and downloads the thumbnails. Run it locally rather than in the Netlify build, because YouTube can rate-limit or
block build servers. Episodes are uploads at least 20 minutes long from the Videos tab; clips come from the Shorts tab.

## Guest Participation Agreement (`/guest-agreement`)

Unlisted page (noindex, `X-Robots-Tag`, not in the sitemap, not linked from anywhere, no pop-up). There's one
link for every guest, `/guest-agreement`, and it isn't tied to an episode. The agreement text lives in
`src/lib/guest-agreement.ts`; bump `AGREEMENT_VERSION` whenever the wording changes.

Guests enter their full name and email, tick the four confirmations, and type their name as a signature (it
must match the full name). The form posts to the existing `POST /api/contact` with
`subject: "Guest Participation Agreement (signed)"`, and the message holds the signature record: version, typed
signature, name, email, timestamp, confirmations, page and browser.

**ActiveCampaign result:** a separate **Contact Message** record per signature, so nothing is overwritten. The
contact is tagged `contact us: GuestParticipationAgreementsigned` and `LIFECYCLE: Engaged`. The server also
appends the submission to its `submissions.txt` log.
