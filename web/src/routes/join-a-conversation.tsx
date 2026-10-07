import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import studioMicrophone from "@/assets/studio-microphone.jpg";

export const Route = createFileRoute("/join-a-conversation")({
  head: () => ({
    meta: [
      { title: "Be on the Podcast | The Unscripted Room" },
      {
        name: "description",
        content:
          "Why people take part, how invitations begin, and what recording day is like at The Unscripted Room in Amesbury.",
      },
      { property: "og:title", content: "Be on the Podcast | The Unscripted Room" },
      {
        property: "og:description",
        content:
          "Who belongs at the table, how the process works, and what happens after the conversation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JoinPage,
});

const benefits = [
  [
    "A conversation you don't normally get to have.",
    "Time to move beyond introductions and surface-level answers.",
  ],
  [
    "Share something that matters to you.",
    "Your lived experience is part of what you bring to the table.",
  ],
  [
    "Be part of a more human conversation.",
    "The room makes time for people to sit across from one another and actually talk.",
  ],
  [
    "Meet people outside your usual circle.",
    "Each conversation brings together people with different experiences around the same question.",
  ],
  [
    "See the question differently.",
    "The goal isn't to leave agreeing. It's to leave having heard perspectives you may not otherwise encounter.",
  ],
  [
    "Let your perspective travel beyond the room.",
    "If everyone agrees to publication, the conversation may become a full YouTube episode and shorter clips.",
  ],
];
const steps = [
  [
    "Express interest",
    "Tell us about yourself, what interests you, and any specific conversations you would like to be part of.",
  ],
  [
    "Get confirmed",
    "Selected speakers receive the topic, recording information and next steps. The exact address is shared only with confirmed speakers.",
  ],
  [
    "Complete a short intake",
    "A short form helps Brett understand your background and perspective. It prepares the room; it does not script the conversation.",
  ],
  [
    "Meet the table",
    "Meet the other speakers, see the studio and settle in with support from the team before recording begins.",
  ],
  [
    "The conversation",
    "You know the topic and central question beforehand, but not every question. Each speaker begins by sharing who they are and why the conversation matters to them. There's a break along the way.",
  ],
  [
    "Wrap and decide",
    "Recording ends within the scheduled window. Afterward, each speaker has 48 hours to decide whether they're comfortable with publication.",
  ],
];
function JoinPage() {
  return (
    <>
      <section className="dark-band tactile py-16 sm:py-20">
        <div className="site-container relative z-10">
          <h1 className="max-w-4xl text-warm-white">Be on the podcast.</h1>
          <p className="mt-6 max-w-2xl text-lg text-warm-white/70">
            You don't need to be an expert, influencer or public speaker. Adults 21+ with
            experiences and perspectives to share are welcome.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild variant="apply" size="lg">
              <Link to="/apply">
                Apply to be a guest <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="darkOutline" size="lg">
              <Link to="/season-two">
                Explore upcoming conversations <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="paper-texture section-pad">
        <div className="site-container">
          <h2 className="max-w-2xl">Why be part of it.</h2>
          <ol className="mt-12 border-t border-foreground/25">
            {benefits.map(([title, text], i) => (
              <li
                key={title}
                className="grid gap-2 border-b border-foreground/15 py-7 sm:grid-cols-[4rem_1fr_1fr] sm:items-baseline sm:gap-8 sm:py-9"
              >
                <span className="font-headline text-sm font-medium tracking-[.14em] text-plum">
                  0{i + 1}
                </span>
                <p className="font-headline text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
                  {title}
                </p>
                <p className="text-muted-foreground">{text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 max-w-2xl text-lg text-muted-foreground">
            <span className="font-semibold text-foreground">No pitch. Nothing to buy.</span>{" "}
            Participation is completely free. You're invited for your perspective.
          </p>
        </div>
      </section>

      <section className="section-pad bg-deep-purple text-warm-white">
        <div className="site-container">
          <h2 className="max-w-2xl text-warm-white">An invitation can begin two ways.</h2>
          <div className="mt-12 grid gap-10 border-t border-warm-white/20 pt-10 md:grid-cols-2 md:gap-16">
            <div>
              <p className="rule-label text-soft-purple">We reach out</p>
              <p className="mt-4 text-lg text-warm-white/80">
                We reach out to people throughout the community whose experiences or perspectives
                may add something meaningful to a conversation.
              </p>
            </div>
            <div>
              <p className="rule-label text-soft-purple">You raise your hand</p>
              <p className="mt-4 text-lg text-warm-white/80">
                You can express interest yourself, for a specific upcoming conversation or in
                general. Both paths lead to the same table. Repeat speakers are welcome.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="paper-texture section-pad">
        <div className="site-container max-w-4xl">
          <h2>From interest to recording day.</h2>
          <ol className="relative mt-14 border-l border-foreground/25 pl-8 sm:pl-12">
            {steps.map(([title, text], i) => (
              <li key={title} className="relative pb-12 last:pb-0">
                <span
                  aria-hidden="true"
                  className="absolute -left-[calc(2rem+4.5px)] top-2 h-2 w-2 rounded-full bg-plum sm:-left-[calc(3rem+4.5px)]"
                />
                <span className="font-headline text-sm font-medium tracking-[.14em] text-plum">
                  0{i + 1}
                </span>
                <h3 className="mt-2 font-headline text-2xl font-semibold text-foreground">
                  {title}
                </h3>
                <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="tactile bg-ink py-16 text-warm-white sm:py-20">
        <div className="site-container">
          <h2 className="display-statement max-w-4xl text-warm-white">
            Three hours. One conversation. No script.
          </h2>
        </div>
      </section>

      <section className="paper-texture section-pad">
        <div className="site-container grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:gap-14">
          <figure>
            <img
              src={studioMicrophone}
              alt="A microphone at the recording table with The Unscripted Room sign on the brick wall"
              className="aspect-[4/3] h-auto w-full object-cover"
            />
            <figcaption className="mt-3 text-xs text-muted-foreground">
              The recording table in the podcast studio.
            </figcaption>
          </figure>
          <div className="self-center">
            <p className="eyebrow">The studio</p>
            <h2 className="mt-5">Where the conversation happens.</h2>
            <p className="mt-5 text-muted-foreground">
              A third-floor studio inside a historic mill building in Amesbury, Massachusetts, with
              elevator access and a parking lot across the street. Confirmed speakers receive the
              exact address and arrival details.
            </p>
            <div className="mt-8 border-t border-foreground/25 pt-6">
              <p className="rule-label text-plum">Come as yourself</p>
              <p className="mt-3 text-muted-foreground">
                No formal dress code. Wear something comfortable that you feel good in on camera.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-warm-white">
        <div className="site-container grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="eyebrow">After the conversation</p>
            <h2 className="mt-5">You have time to decide.</h2>
          </div>
          <div className="space-y-5 text-lg text-muted-foreground">
            <p>
              Each speaker has 48 hours after filming to decide whether they are comfortable with
              the conversation being published.
            </p>
            <p>
              Because each episode is shared, choosing not to publish also affects the other
              speakers. That context matters, but you are not obligated to approve publication.
            </p>
            <p>
              If everyone agrees, the conversation may be published on YouTube, with shorter clips
              shared on YouTube Shorts and The Unscripted Room social channels.
            </p>
          </div>
        </div>
      </section>

      <section className="tactile bg-ink py-16 text-warm-white sm:py-20">
        <div className="site-container flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <h2 className="max-w-2xl text-warm-white">Interested? We'd love to hear from you.</h2>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="apply" size="lg">
              <Link to="/apply">
                Apply to be a guest <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="darkOutline" size="lg">
              <Link to="/faq">
                Read the FAQ <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
