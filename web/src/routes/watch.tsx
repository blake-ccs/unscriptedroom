import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Play } from "lucide-react";
import { EpisodeThumbnails, listenPlatforms, youtubePlaylist } from "@/components/site/site-ui";
import { roomShorts, shortUrl } from "@/lib/site-media";

export const Route = createFileRoute("/watch")({
  head: () => ({
    meta: [
      { title: "Watch & Listen | The Unscripted Room" },
      {
        name: "description",
        content:
          "Discover Season One conversations and short moments from The Unscripted Room, then keep listening on YouTube, Spotify or Apple Podcasts.",
      },
      { property: "og:title", content: "Watch & Listen | The Unscripted Room" },
      {
        property: "og:description",
        content: "Stories, perspectives and moments from around the table.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const platformLabels: Record<string, string> = {
  YouTube: "Watch on YouTube",
  Spotify: "Listen on Spotify",
  "Apple Podcasts": "Listen on Apple Podcasts",
};

function Page() {
  return (
    <>
      <section className="dark-band tactile py-16 sm:py-20">
        <div className="site-container relative z-10">
          <h1 className="max-w-4xl text-warm-white">
            <span className="block">Watch. Listen.</span>
            <span className="block">Keep the conversation going.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-warm-white/70">
            Stories, perspectives and moments from around the table.
          </p>
        </div>
      </section>

      <section id="season-one" className="paper-texture scroll-mt-24 py-14 sm:py-20">
        <div className="site-container">
          <div className="flex flex-col gap-6 border-t border-foreground pt-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">
                Season One · <span className="text-purple">Watch now</span>
              </p>
              <h2 className="mt-5">Where it all started.</h2>
              <p className="mt-4 max-w-xl text-muted-foreground">
                The conversations that started The Unscripted Room. Pick one, then watch or listen
                in full on your platform.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-7 gap-y-3">
              {listenPlatforms.map((p) => (
                <a
                  key={p.name}
                  href={p.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2.5 border-b border-foreground/25 pb-1.5 text-xs font-semibold uppercase tracking-[.14em] transition-colors hover:border-purple hover:text-purple"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 shrink-0"
                    style={{ color: p.color }}
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    {p.icon}
                  </svg>
                  {platformLabels[p.name] ?? p.name}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-10">
            <EpisodeThumbnails tone="light" />
          </div>
          <p className="mt-12 border-t border-foreground/15 pt-5 text-sm text-muted-foreground">
            Season Two is taking shape.{" "}
            <Link
              to="/season-two"
              className="group ml-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-foreground hover:text-purple"
            >
              Explore what's coming{" "}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </p>
        </div>
      </section>

      <section className="bg-ink py-14 text-warm-white sm:py-18">
        <div className="site-container">
          <div className="flex flex-col gap-4 border-t border-warm-white/25 pt-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="rule-label text-chartreuse">Shorter clips</p>
              <h2 className="mt-5 text-warm-white">Moments worth replaying.</h2>
              <p className="mt-4 max-w-md text-sm text-warm-white/60">
                The people, the room and the questions, in a minute or less.
              </p>
            </div>
            <a
              href={youtubePlaylist}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-chartreuse hover:text-warm-white"
            >
              More on YouTube{" "}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
          <div
            className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
            aria-label="The Unscripted Room Shorts"
          >
            {roomShorts.map((short) => (
              <a
                key={short.id}
                href={shortUrl(short.id)}
                target="_blank"
                rel="noreferrer"
                aria-label={`${short.title}. Watch on YouTube (opens in a new tab)`}
                className="group flex flex-col focus-visible:outline-offset-4"
              >
                <span className="relative block aspect-[9/16] overflow-hidden border border-warm-white/15 bg-deep-purple">
                  <img
                    src={short.thumbnail}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={540}
                    height={960}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                  <span className="absolute inset-0 bg-ink/10 transition group-hover:bg-ink/25" />
                  <span className="absolute bottom-3 left-3 grid h-9 w-9 place-items-center rounded-full bg-chartreuse text-ink">
                    <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  </span>
                </span>
                <span className="mt-3 block text-sm font-semibold leading-snug text-warm-white/85 transition-colors group-hover:text-chartreuse">
                  {short.title}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
