import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { seasonTwo } from "@/lib/site-data";
import micPhoto from "@/assets/dsc00036-2.jpg";

export const Route = createFileRoute("/season-two/$episode")({
  loader: ({ params }) => {
    const number = Number(params.episode);
    const episode = seasonTwo.find((item) => item.n === number);
    if (!episode) throw notFound();
    return episode;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} | Season Two | The Unscripted Room` },
          { name: "description", content: loaderData.question },
          { property: "og:title", content: `${loaderData.title} | The Unscripted Room` },
          { property: "og:description", content: loaderData.question },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [
          { title: "Conversation Not Found | The Unscripted Room" },
          { name: "description", content: "This Season Two conversation could not be found." },
          { property: "og:title", content: "Conversation Not Found" },
          {
            property: "og:description",
            content: "This Season Two conversation could not be found.",
          },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary" },
          { name: "robots", content: "noindex" },
        ],
  }),
  component: EpisodePage,
});
function EpisodePage() {
  const episode = Route.useLoaderData();
  return (
    <>
      <section className="tactile bg-ink py-20 text-warm-white">
        <div className="site-container">
          <Link
            to="/season-two"
            className="inline-flex items-center gap-2 text-xs font-extrabold uppercase text-chartreuse"
          >
            <ArrowLeft className="h-4 w-4" />
            Season Two
          </Link>
          <div className="mt-12 grid gap-10 lg:grid-cols-[.35fr_1fr]">
            <div>
              <span className="font-display text-7xl text-soft-purple">
                {String(episode.n).padStart(2, "0")}
              </span>
              <p className="season-label mt-4 text-chartreuse">{episode.topic}</p>
            </div>
            <div>
              <h1 className="text-warm-white">{episode.title}</h1>
              <p className="mt-7 max-w-3xl text-2xl text-warm-white/85">{episode.question}</p>
              <p className="mt-6 max-w-2xl text-warm-white/65">
                {episode.description} Each Season Two episode brings a small group of people with
                different lived experiences to one table in Amesbury to explore this question over
                an unscripted, hours-long conversation.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button asChild variant="apply" size="lg">
                  <Link to="/apply" search={{ conversation: episode.title }}>
                    Apply for this conversation <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="darkOutline" size="lg">
                  <Link to="/apply">Apply generally</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="paper-texture section-pad">
        <div className="site-container grid gap-8 lg:grid-cols-2">
          <img
            src={micPhoto}
            alt="A microphone at the table inside The Unscripted Room, with the glowing Unscripted Room sign against the brick behind"
            className="aspect-[4/3] h-full w-full object-cover"
          />
          <div className="flex flex-col justify-end border-t-4 border-chartreuse pt-6">
            <p className="eyebrow">One question. Four seats.</p>
            <h2 className="mt-5">Bring the experience behind your answer.</h2>
            <p className="mt-5 text-muted-foreground">
              You do not need a polished point of view. The room is interested in what you have
              lived, what shaped you, and what you are still working out.
            </p>
            <Button asChild variant="outline" className="mt-7 self-start">
              <Link to="/join-a-conversation">
                What taking part is like <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
