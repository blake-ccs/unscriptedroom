import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Mail, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRecordingDate, seasonTwo } from "@/lib/site-data";
import { roomMedia, roomShorts, seasonOneEpisodes } from "@/lib/site-media";
import { postJson } from "@/lib/api";
import { getUtm } from "@/lib/attribution";
import { Honeypot } from "@/components/site/honeypot";

export const youtubePlaylistId = "OLFuQWeBrfBe0nnsvOBj4GDE5jYCKscX_jw";
export const youtubePlaylist = `https://www.youtube.com/playlist?list=${youtubePlaylistId}`;

export function PlaylistEmbed({ title = "The Unscripted Room on YouTube" }: { title?: string }) {
  return (
    <div className="media-card aspect-video">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/videoseries?list=${youtubePlaylistId}&rel=0`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}

export function EpisodeThumbnails({
  limit = 3,
  tone = "dark",
}: {
  limit?: number;
  tone?: "dark" | "light";
}) {
  const isDark = tone === "dark";
  return (
    <div className="grid gap-x-5 gap-y-10 sm:grid-cols-3">
      {seasonOneEpisodes.slice(0, limit).map((episode) => (
        <a
          key={episode.id}
          href={`https://www.youtube.com/watch?v=${episode.id}`}
          target="_blank"
          rel="noreferrer"
          className="group flex flex-col focus-visible:outline-offset-4"
        >
          <span className="relative block aspect-video overflow-hidden bg-purple">
            <img
              src={episode.thumbnail}
              alt={episode.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.025]"
            />
            <span className="absolute inset-0 bg-ink/10 transition group-hover:bg-ink/25" />
            <span className="absolute bottom-3 left-3 grid h-10 w-10 place-items-center rounded-full bg-chartreuse text-ink">
              <Play className="h-4 w-4 fill-current" />
            </span>
          </span>
          {episode.label && (
            <span
              className={`mt-4 block text-[.7rem] font-extrabold uppercase tracking-[.12em] ${isDark ? "text-chartreuse" : "text-purple"}`}
            >
              {episode.label}
            </span>
          )}
          <span
            className={`${episode.label ? "mt-1.5" : "mt-4"} block font-headline text-xl font-semibold uppercase leading-tight group-hover:text-purple`}
          >
            {episode.title}
          </span>
          <span
            className={`mt-2 block text-sm leading-relaxed ${isDark ? "text-warm-white/70" : "text-muted-foreground"}`}
          >
            {episode.description}
          </span>
          <span
            className={`mt-4 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.1em] ${isDark ? "text-chartreuse" : "text-purple"}`}
          >
            Watch{" "}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </a>
      ))}
    </div>
  );
}

export type ListenPlatform = { name: string; href: string; color: string; icon: ReactNode };

// Confirmed listening destinations only. Never invent platform URLs.
export const listenPlatforms: ListenPlatform[] = [
  {
    name: "YouTube",
    href: youtubePlaylist,
    color: "#FF0000",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
      </svg>
    ),
  },
  {
    name: "Apple Podcasts",
    href: "https://podcasts.apple.com/us/podcast/unscripted-room-podcast/id1896937180",
    color: "#9933CC",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="9.6" r="2.3" />
        <path d="M9.6 19.4c.2-2.7.6-4.6 1.1-5.5.4-.8 2.2-.8 2.6 0 .5.9.9 2.8 1.1 5.5.1 1-4.9 1-4.8 0z" />
      </svg>
    ),
  },
  {
    name: "Spotify",
    href: "https://open.spotify.com/show/1zumfpMNllCOafQEiOHSiI",
    color: "#1DB954",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    ),
  },
];

export function ListenPlatforms() {
  return (
    <div className="flex flex-wrap gap-4" aria-label="Where to find The Unscripted Room">
      {listenPlatforms.map((platform) => (
        <a
          key={platform.name}
          href={platform.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-3 border border-warm-white/25 bg-warm-white px-5 py-3 text-ink transition duration-300 hover:border-chartreuse hover:bg-chartreuse focus-visible:outline-offset-4"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 shrink-0"
            style={{ color: platform.color }}
            fill="currentColor"
            aria-hidden="true"
          >
            {platform.icon}
          </svg>
          <span className="whitespace-nowrap text-xs font-extrabold uppercase tracking-[.14em]">
            {platform.name}
          </span>
        </a>
      ))}
    </div>
  );
}

export function ShortsCarousel() {
  return (
    <section className="dark-band tactile section-pad">
      <div className="site-container relative z-10">
        <div className="flex flex-col gap-6 border-t border-warm-white/25 pt-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            light
            eyebrow="Short conversations"
            title="Moments worth replaying"
            intro="Brief moments from longer conversations at the table."
          />
          <a
            href={youtubePlaylist}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.1em] text-chartreuse hover:text-warm-white"
          >
            Visit YouTube <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        {roomShorts.length ? (
          <div className="media-rail mt-12" aria-label="The Unscripted Room Shorts">
            {roomShorts.map((short) => (
              <article
                key={short.id}
                className="relative aspect-[9/16] overflow-hidden border border-warm-white/20 bg-purple"
              >
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${short.id}?rel=0`}
                  title={short.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-12 grid gap-8 border-y border-warm-white/20 py-8 md:grid-cols-[18rem_1fr] md:items-center">
            <div className="relative aspect-[9/16] overflow-hidden bg-purple">
              <img
                src={roomMedia.hourglass}
                alt="Purple hourglass on the recording table"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 grid place-items-center bg-ink/20">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-chartreuse text-ink">
                  <Play className="h-5 w-5 fill-current" />
                </span>
              </div>
            </div>
            <div className="max-w-xl">
              <p className="rule-label text-chartreuse">Ready for the real clips</p>
              <h3 className="mt-5 text-warm-white">
                The carousel is built. The Shorts still need their YouTube links.
              </h3>
              <p className="mt-5 text-warm-white/65">
                Add the verified Shorts URLs directly, or connect YouTube Data access to retrieve
                them automatically. No clips have been invented for this mockup.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function ApplyButton({
  label = "Apply to Join",
  size = "default",
}: {
  label?: string;
  size?: "default" | "lg";
}) {
  return (
    <Button asChild variant="apply" size={size}>
      <Link to="/apply">
        <Mail />
        {label}
      </Link>
    </Button>
  );
}
export function SectionHeading({
  eyebrow,
  title,
  intro,
  light = false,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-4xl">
      {eyebrow && <div className={light ? "rule-label text-chartreuse" : "eyebrow"}>{eyebrow}</div>}
      <h2 className={light ? "mt-5 text-warm-white" : "mt-5"}>{title}</h2>
      {intro && (
        <p
          className={
            light
              ? "mt-6 max-w-2xl text-lg text-warm-white/70"
              : "mt-6 max-w-2xl text-lg text-muted-foreground"
          }
        >
          {intro}
        </p>
      )}
    </div>
  );
}
export function PageHero({
  eyebrow,
  title,
  intro,
  action = true,
  display = false,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  action?: boolean;
  display?: boolean;
}) {
  return (
    <section className="dark-band tactile page-hero">
      <div className="site-container relative z-10">
        <div className="rule-label text-chartreuse">{eyebrow}</div>
        <h1 className={`${display ? "display-statement " : ""}mt-6 max-w-5xl text-warm-white`}>
          {title}
        </h1>
        <p className="mt-7 max-w-2xl text-lg text-warm-white/70">{intro}</p>
        {action && (
          <div className="mt-9">
            <ApplyButton size="lg" />
          </div>
        )}
      </div>
    </section>
  );
}
export function CTA({
  title = "Take a seat. Tell us why.",
  text = "The room is ready for your lived experience—not a polished performance.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="bg-purple text-warm-white">
      <div className="site-container grid items-center gap-8 py-20 md:grid-cols-[1fr_auto]">
        <div>
          <p className="rule-label text-chartreuse">The empty chair</p>
          <h2 className="mt-5 text-warm-white">{title}</h2>
          <p className="mt-4 max-w-2xl text-warm-white/75">{text}</p>
        </div>
        <ApplyButton size="lg" />
      </div>
    </section>
  );
}
export function EpisodeGrid({ compact = false }: { compact?: boolean }) {
  const items = compact ? seasonTwo.slice(0, 3) : seasonTwo;
  return (
    <div className="border-t border-foreground">
      {items.map((ep) => (
        <article
          key={ep.n}
          className="group grid gap-5 border-b border-foreground py-7 md:grid-cols-[5rem_1fr_1.2fr_auto] md:items-center"
        >
          <span className="font-display text-4xl leading-none text-purple">
            {String(ep.n).padStart(2, "0")}
          </span>
          <div>
            <span className="season-label">{ep.topic}</span>
            <h3 className="mt-2">{ep.title}</h3>
          </div>
          <div>
            <p className="max-w-xl text-muted-foreground">{ep.question}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              A conversation exploring {ep.topic.toLowerCase()} through lived experience and
              different perspectives.
            </p>
          </div>
          <Link
            to="/season-two/$episode"
            params={{ episode: String(ep.n) }}
            className="inline-flex items-center gap-2 text-xs font-extrabold uppercase hover:text-purple"
          >
            Learn more <ArrowRight className="h-4 w-4" />
          </Link>
        </article>
      ))}
    </div>
  );
}
export function MediaPlay({
  label,
  portrait = false,
  image,
}: {
  label: string;
  portrait?: boolean;
  image?: string;
}) {
  return (
    <div className={portrait ? "media-card aspect-[9/14]" : "media-card aspect-video"}>
      {image ? (
        <img src={image} alt={label} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full place-items-center bg-purple p-8 text-center text-warm-white">
          <div>
            <Play className="mx-auto h-8 w-8" />
            <p className="mt-4 text-xs font-extrabold uppercase tracking-[.12em]">
              Video placeholder
            </p>
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-ink/20" />
      <Button asChild variant="media" size="iconLg" aria-label={`Watch ${label}`}>
        <a href={youtubePlaylist} target="_blank" rel="noreferrer">
          <Play className="fill-current" />
        </a>
      </Button>
      <div className="absolute inset-x-0 bottom-0 p-5 text-warm-white">
        <p className="font-bold">{label}</p>
      </div>
    </div>
  );
}

export function FollowUpSignup() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [trap, setTrap] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (sending) return;
    setError("");
    if (trap) {
      setSubmitted(true);
      return;
    }
    setSending(true);
    const result = await postJson("/api/lead", {
      email: email.trim().toLowerCase(),
      offer: "follow-up-newsletter",
      source: "web",
      ...getUtm(),
    });
    setSending(false);
    if (result.ok) setSubmitted(true);
    else setError("We couldn't add you just now. Please try again.");
  }
  return (
    <section className="paper-texture bg-warm-white py-16 sm:py-20">
      <div className="site-container grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="eyebrow">Stay connected</p>
        </div>
        <div className="max-w-3xl">
          <h2>There’s more to talk about.</h2>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Get new conversations, upcoming topics, and opportunities to take a seat at the table
            delivered to your inbox.
          </p>
          {submitted ? (
            <div className="mt-8 border-l-4 border-chartreuse py-3 pl-5" role="status">
              <p className="font-bold">You’re on the list.</p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="relative mt-8 max-w-2xl">
              <Honeypot value={trap} onChange={setTrap} />
              <label htmlFor="follow-up-email" className="form-label">
                Email address
              </label>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Input
                  id="follow-up-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  aria-describedby={error ? "follow-up-error" : undefined}
                  aria-invalid={Boolean(error)}
                  className="h-13 rounded-none border-foreground bg-background px-4 text-base"
                />
                <Button type="submit" variant="apply" size="lg" disabled={sending}>
                  {sending ? "Joining…" : "Join the list"}
                </Button>
              </div>
              {error && (
                <p id="follow-up-error" className="field-error" role="alert">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

import { ArrowRight as _Arrow } from "lucide-react";
import { Link as _Link } from "@tanstack/react-router";
import questionIcon from "@/assets/icons/question.png";
import timeIcon from "@/assets/icons/time.png";
import communityIcon from "@/assets/icons/community.png";

// The Unscripted Room's own brand icons (from the original site), one per framework value.
// Rendered as a mask so they take the brand colour at any size.
const valueIcons: Record<string, string> = {
  "Self-Awareness": questionIcon,
  "Self-Discipline": timeIcon,
  Resilience: communityIcon,
};

function ValueIcon({ value, className = "" }: { value: string; className?: string }) {
  const src = valueIcons[value] ?? questionIcon;
  return (
    <span
      aria-hidden="true"
      className={`block bg-deep-purple ${className}`}
      style={{
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "left center",
        WebkitMaskPosition: "left center",
      }}
    />
  );
}
type Conversation = {
  n: number;
  recordingDate: string;
  title: string;
  question: string;
  value: string;
  topic: string;
  description: string;
};
export function ConversationCard({ ep }: { ep: Conversation }) {
  return (
    <article className="group relative flex flex-col border border-foreground/10 bg-soft-sage p-7 transition-colors hover:border-purple sm:p-8">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px] bg-purple/0 transition-colors group-hover:bg-purple"
      />
      {/* The icon carries the episode's framework value (ep.value) without spelling it out. */}
      <ValueIcon value={ep.value} className="h-8 w-8" />
      <h3 className="mt-5 font-sans text-lg font-semibold leading-snug text-plum">{ep.title}</h3>
      <p className="mt-4 font-headline text-[1.45rem] font-semibold uppercase leading-[1.12] text-foreground">
        {ep.question}
      </p>
      <p className="mt-4 grow text-[.95rem] leading-relaxed text-muted-foreground">
        {ep.description}
      </p>
      <_Link
        to="/season-two/$episode"
        params={{ episode: String(ep.n) }}
        className="mt-7 inline-flex items-center gap-2 self-start border-b border-foreground/25 pb-1 text-xs font-semibold uppercase tracking-[.14em] text-foreground transition-colors hover:border-plum hover:text-plum after:absolute after:inset-0"
      >
        Explore{" "}
        <_Arrow className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
      </_Link>
      <div className="mt-7 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-foreground/10 pt-4 text-[.65rem] leading-snug text-muted-foreground">
        <p className="font-bold uppercase tracking-[.14em]">{ep.topic}</p>
        <p>
          <span className="font-bold uppercase tracking-[.14em]">Recording:</span>{" "}
          <time dateTime={ep.recordingDate}>{formatRecordingDate(ep.recordingDate)}</time>
        </p>
      </div>
    </article>
  );
}
