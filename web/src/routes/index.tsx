import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConversationCard, FollowUpSignup, ListenPlatforms } from "@/components/site/site-ui";
import heroPoster from "@/assets/hero-poster.jpg";
import { seasonTwo } from "@/lib/site-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Unscripted Room | Where Lived Experience Meets Curiosity" },
      {
        name: "description",
        content:
          "Where lived experience meets curiosity. Different perspectives around one table, with the time and curiosity for deeper conversation.",
      },
      {
        property: "og:title",
        content: "The Unscripted Room | Where Lived Experience Meets Curiosity",
      },
      {
        property: "og:description",
        content:
          "Different perspectives around one table, with the time and curiosity for deeper conversation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});
function Home() {
  // Hero video, set up the way the previous site did (which played reliably in Safari): the
  // <video> is created in the browser after load rather than shipped in the prerendered HTML,
  // with a single MP4 `src`, full preload, and an explicit muted play(). Until it starts, the
  // first frame of the clip shows as a still, so there's no visible swap.
  const [videoReady, setVideoReady] = useState(false);
  // The video stays invisible until it is actually playing, so Safari's own "play" overlay
  // (drawn on a video it hasn't autoplayed yet) is never seen; the first-frame still shows instead.
  const [videoPlaying, setVideoPlaying] = useState(false);
  const heroVideo = useRef<HTMLVideoElement>(null);
  useEffect(() => setVideoReady(true), []);
  useEffect(() => {
    const video = heroVideo.current;
    if (!video) return;
    // Muted autoplay is normally allowed on load. Some Safari setups (a site set to "Never
    // Auto-Play", Low Power Mode) refuse it until the visitor interacts with the page, so keep
    // retrying at the moments playback becomes possible: when data has loaded, when the tab
    // becomes visible again, and on the visitor's first tap, click or key press.
    const tryPlay = () => {
      if (!video.paused) return;
      video.muted = true;
      video.play()?.catch(() => {
        // Still refused: the first-frame still stays until the next attempt.
      });
    };
    const gestures = ["pointerdown", "touchend", "click", "keydown"] as const;
    const onGesture = () => {
      tryPlay();
      if (!video.paused) gestures.forEach((g) => window.removeEventListener(g, onGesture, true));
    };
    const onVisible = () => document.visibilityState === "visible" && tryPlay();
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", tryPlay);
    gestures.forEach((g) =>
      window.addEventListener(g, onGesture, { capture: true, passive: true }),
    );
    tryPlay();
    return () => {
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", tryPlay);
      gestures.forEach((g) => window.removeEventListener(g, onGesture, true));
    };
  }, [videoReady]);

  return (
    <>
      <section className="tactile relative min-h-[38rem] overflow-hidden bg-ink text-warm-white">
        <img
          src={heroPoster}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-85"
        />
        {videoReady && (
          <video
            ref={heroVideo}
            src="/media/hero-shot.mp4"
            poster={heroPoster}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            tabIndex={-1}
            onPlaying={() => setVideoPlaying(true)}
            className={`hero-video absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 ${videoPlaying ? "opacity-85" : "opacity-0"}`}
          />
        )}
        <div className="hero-shade absolute inset-0" />
        <div className="site-container relative z-10 flex min-h-[38rem] items-end py-14">
          <div className="max-w-5xl reveal">
            <h1 className="display-statement hero-display text-warm-white">
              <span className="block">Where lived experience</span>{" "}
              <span className="block text-chartreuse">meets curiosity.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-warm-white/85">
              Different perspectives around one table, with the time and curiosity for deeper
              conversation.
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
      {/* Season One CTA on warm cream, flowing straight into the Season Two conversations below. */}
      <section className="paper-texture" aria-labelledby="season-one-heading">
        <div className="site-container flex flex-col gap-7 pt-16 pb-12 sm:pt-20 md:flex-row md:items-center md:justify-between md:gap-12">
          <div>
            <h2 id="season-one-heading" className="text-purple">
              Season One Is Now Available
            </h2>
            <p className="mt-3 text-lg text-foreground">
              Explore the conversations that started it all.
            </p>
          </div>
          <Button asChild variant="apply" size="lg" className="self-start md:self-auto">
            <Link to="/watch">
              Explore Season One <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <section
        className="paper-texture pt-8 pb-[clamp(4.5rem,9vw,9rem)] sm:pt-10"
        aria-labelledby="season-two-heading"
      >
        <div className="site-container">
          <p id="season-two-heading" className="eyebrow">
            Upcoming Season Two conversations
          </p>
          <div className="mx-auto mt-8 max-w-6xl grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {seasonTwo.map((ep) => (
              <ConversationCard key={ep.n} ep={ep} />
            ))}
          </div>
          <p className="mt-8 text-muted-foreground">
            More Season Two conversations will be announced.
          </p>
        </div>
      </section>

      <section
        className="bg-ink py-14 text-warm-white sm:py-16"
        aria-label="Subscribe and keep listening"
      >
        <div className="site-container flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-headline text-2xl font-semibold uppercase text-warm-white">
              Subscribe and keep listening.
            </p>
            <p className="mt-2 text-sm text-warm-white/70">
              Find The Unscripted Room wherever you listen.
            </p>
          </div>
          <ListenPlatforms />
        </div>
      </section>

      <FollowUpSignup />
    </>
  );
}
