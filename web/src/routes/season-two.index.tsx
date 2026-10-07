import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ConversationCard } from "@/components/site/site-ui";
import { seasonTwo } from "@/lib/site-data";
export const Route = createFileRoute("/season-two/")({
  head: () => ({
    meta: [
      { title: "Season Two | The Unscripted Room" },
      {
        name: "description",
        content:
          "Explore the Season Two conversations coming to the table and the questions at the center of each one.",
      },
      { property: "og:title", content: "Season Two | The Unscripted Room" },
      { property: "og:description", content: "Every conversation starts with why." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  return (
    <>
      <section className="dark-band tactile py-16 sm:py-20">
        <div className="site-container relative z-10">
          <h1 className="max-w-4xl text-warm-white">
            <span className="block">Every conversation starts with why.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-warm-white/70">
            Conversations built around questions that invite experience, disagreement, and
            discovery.
          </p>
        </div>
      </section>
      <section className="section-pad">
        <div className="site-container">
          <div className="mb-10">
            <p className="rule-label text-purple">Coming up in 2026</p>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              Season Two begins this fall. Explore the conversations we’re bringing to the table
              through the end of the year, with more to come.
            </p>
          </div>
          <div className="mb-8 flex justify-between border-y border-foreground py-4 text-xs font-extrabold uppercase">
            <span>2026 lineup</span>
            <span>Amesbury, Massachusetts</span>
          </div>
          <div className="mx-auto max-w-6xl grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {seasonTwo.map((ep) => (
              <ConversationCard key={ep.n} ep={ep} />
            ))}
          </div>
          <div className="mt-8 border-t border-foreground pt-6 text-xs font-extrabold uppercase tracking-[.18em] text-muted-foreground">
            More Season Two conversations to be announced
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-5 border-t border-foreground pt-8">
            <p className="max-w-2xl text-muted-foreground">
              Interested in the room but not one particular conversation? General applications are
              welcome.
            </p>
            <Button asChild variant="apply">
              <Link to="/apply">Apply generally</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
