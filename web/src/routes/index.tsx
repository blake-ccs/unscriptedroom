import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ConversationCard,
  EpisodeThumbnails,
  FollowUpSignup,
  ListenPlatforms,
} from "@/components/site/site-ui";
import { roomMedia } from "@/lib/site-media";
import { seasonTwo } from "@/lib/site-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Unscripted Room | A Podcast Built Around Community and Curiosity" },
      {
        name: "description",
        content:
          "A podcast built around community and curiosity. Conversations shaped by lived experience and the perspectives around the table.",
      },
      { property: "og:title", content: "The Unscripted Room" },
      {
        property: "og:description",
        content: "Conversations shaped by lived experience and the perspectives around the table.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});
function Home() {
  return (
    <>
      <section className="tactile relative min-h-[38rem] overflow-hidden bg-ink text-warm-white">
        <video
          poster={roomMedia.microphone}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 h-full w-full object-cover object-center opacity-85"
        >
          <source src="/media/hero-shot.webm" type="video/webm" />
          <source src="/media/hero-shot.mp4" type="video/mp4" />
        </video>
        <div className="hero-shade absolute inset-0" />
        <div className="site-container relative z-10 flex min-h-[38rem] items-end py-14">
          <div className="max-w-5xl reveal">
            <h1 className="display-statement hero-display text-warm-white">
              <span className="block">A podcast built around</span>
              <span className="block">
                <span className="text-soft-purple">community and curiosity.</span>
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-warm-white/85">
              Conversations shaped by lived experience and the perspectives around the table.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="darkOutline" size="lg">
                <Link to="/watch">
                  <Play />
                  Watch an Episode
                </Link>
              </Button>
              <Button asChild variant="apply" size="lg">
                <Link to="/join-a-conversation">Be on the Podcast</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-ink py-16 text-warm-white sm:py-20">
        <div className="site-container">
          <p className="rule-label text-soft-purple">From Season One</p>
          <p className="mt-3 max-w-xl text-warm-white/70">
            A few conversations from where it all started.
          </p>
          <div className="mt-9">
            <EpisodeThumbnails />
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-warm-white/20 pt-7">
            <Button asChild variant="darkOutline">
              <Link to="/watch">
                View all episodes <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="mt-12 flex flex-col gap-7 border-t border-warm-white/20 pt-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-display text-2xl font-extrabold uppercase tracking-tight text-warm-white">
                Subscribe and keep listening.
              </p>
              <p className="mt-2 text-sm text-warm-white/70">
                Find The Unscripted Room wherever you listen.
              </p>
            </div>
            <ListenPlatforms />
          </div>
        </div>
      </section>
      <section className="paper-texture groove-light relative overflow-hidden pt-[clamp(4.5rem,9vw,9rem)] pb-[clamp(2.5rem,5vw,5rem)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-4 select-none whitespace-nowrap text-center font-display text-[24vw] leading-none text-foreground/[.045]"
        >
          SEASON 02
        </div>
        <div className="site-container relative">
          <div className="max-w-3xl">
            <p className="rule-label text-purple">Season Two · Coming soon</p>
            <h2 className="display-statement mt-6">Every conversation starts with why.</h2>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              New conversations. New perspectives. More reasons to take a seat at the table.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="apply" size="lg">
                <Link to="/season-two">
                  Explore Season Two <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/join-a-conversation">
                  Be on the Podcast <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
          <div className="mt-16 border-t border-foreground pt-8">
            <p className="rule-label">Upcoming Season Two conversations</p>
            <div className="mt-8">
              <div className="mx-auto max-w-6xl grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {seasonTwo.map((ep) => (
                  <ConversationCard key={ep.n} ep={ep} />
                ))}
              </div>
            </div>
            <p className="mt-8 text-muted-foreground">
              More Season Two conversations will be announced.
            </p>
          </div>
        </div>
      </section>
      <FollowUpSignup />
    </>
  );
}
