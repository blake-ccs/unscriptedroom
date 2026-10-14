import { useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConversationCard, FollowUpSignup, ListenPlatforms } from "@/components/site/site-ui";
import { roomMedia } from "@/lib/site-media";
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
  // The page is prerendered, and Safari doesn't always honour `autoplay` on server-rendered video.
  // Start it explicitly once the page has loaded (muted, so autoplay policies allow it).
  const heroVideo = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = heroVideo.current;
    if (!video) return;
    video.muted = true;
    video.play()?.catch(() => {
      // Autoplay blocked (e.g. iPhone Low Power Mode): the poster image stays, which is fine.
    });
  }, []);

  return (
    <>
      <section className="tactile relative min-h-[38rem] overflow-hidden bg-ink text-warm-white">
        <video
          ref={heroVideo}
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
          {/* MP4 (H.264) first: every browser plays it, and Safari can stall on WebM without falling back. */}
          <source src="/media/hero-shot.mp4" type="video/mp4" />
          <source src="/media/hero-shot.webm" type="video/webm" />
        </video>
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
