import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions | The Unscripted Room" },
      {
        name: "description",
        content:
          "Clear answers about the room, the recording day and what happens afterward at The Unscripted Room.",
      },
      { property: "og:title", content: "FAQ | The Unscripted Room" },
      {
        property: "og:description",
        content: "What prospective guests need to know before taking a seat at the table.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FaqPage,
});
const publicFaqs: [string, string][] = [
  [
    "What is The Unscripted Room?",
    "A conversation podcast that brings together people with different backgrounds and lived experiences around one table, to explore questions that matter.",
  ],
  [
    "Who can be part of a conversation?",
    "Adults 18 and older. In some cases, we may make an exception for guests under 18. You don't need to be an expert, an influencer or a professional speaker. Everyday perspectives are the point.",
  ],
  [
    "How are guests selected?",
    "The team reaches out to people throughout the community and also welcomes interest directly. You can raise your hand for a specific upcoming conversation or let us know you're open to others.",
  ],
  ["Can I participate more than once?", "Yes. Repeat guests are welcome."],
  ["Does it cost anything to participate?", "No. Participation is completely free."],
  [
    "Is there a sales pitch or anything I'm expected to buy?",
    "No. There's nothing to buy and no pitch attached to taking a seat.",
  ],
  [
    "Where is The Unscripted Room?",
    "In a historic mill building in Amesbury, Massachusetts. The studio has elevator access and nearby parking. Exact location and arrival details are shared once you're a confirmed guest.",
  ],
  [
    "How much time should I expect to spend there?",
    "Plan on about four hours: a relaxed meet-and-greet with the other guests, followed by the recorded conversation.",
  ],
  [
    "How long is each conversation?",
    "We reserve three hours for each conversation. That gives us the freedom to explore the topic without rushing, while keeping things relaxed and natural.",
  ],
  [
    "Will I know the topic or questions ahead of time?",
    "You'll know the theme, a question connected to it to get you thinking, but the questions asked during the recording are never shared in advance with anyone at the table. They're revealed during the conversation itself, so every answer is genuinely unscripted.",
  ],
  [
    "How much do I need to prepare?",
    "Very little. This isn't a performance to rehearse. Confirmed guests complete a short form beforehand so Brett can prepare, but nothing about your answers is scripted.",
  ],
  [
    "How personal do the conversations get?",
    "Conversations are grounded in lived experience, so they can become personal. You decide what you share, and your boundaries are respected. The aim is honest conversation, not putting anyone on the spot.",
  ],
  [
    "What happens after the conversation is recorded?",
    "After recording, each guest has 48 hours to let us know if they're not comfortable with the conversation being shared. Once that window closes, the recording becomes part of The Unscripted Room's library. We may use it across everything we create, from full episodes and short clips to our website, social channels, thumbnails and promotional materials, as well as future Unscripted Room projects.",
  ],
  [
    "What if I decide afterward that I don't want it published?",
    "You can say so within the 48-hour window. Because it's a shared conversation, a decision not to publish applies to the whole conversation and everyone in it.",
  ],
];

function FaqPage() {
  return (
    <>
      <section className="dark-band tactile py-16 sm:py-20">
        <div className="site-container relative z-10">
          <h1 className="max-w-4xl text-warm-white">Questions before you take a seat.</h1>
          <p className="mt-6 max-w-2xl text-lg text-warm-white/70">
            Clear answers about the room, the recording day and what happens afterward.
          </p>
        </div>
      </section>
      <section className="paper-texture groove-light section-pad">
        <div className="site-container max-w-4xl">
          <Accordion type="single" collapsible className="border-t border-foreground/20">
            {publicFaqs.map(([q, a], i) => (
              <AccordionItem key={q} value={`q-${i}`} className="border-foreground/15">
                <AccordionTrigger className="py-6 text-left text-lg font-semibold text-foreground hover:text-plum hover:no-underline focus-visible:text-plum data-[state=open]:text-plum">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="max-w-2xl pb-7 text-base leading-relaxed text-muted-foreground">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-16 border-t border-foreground/30 pt-10 sm:flex sm:items-end sm:justify-between sm:gap-10">
            <div>
              <h2 className="max-w-md">Ready to take a seat?</h2>
              <p className="mt-4 max-w-lg text-muted-foreground">
                Explore upcoming conversations or let us know you're interested in being on the
                podcast.
              </p>
            </div>
            <Button asChild variant="apply" className="mt-7 sm:mt-0">
              <Link to="/join-a-conversation">
                Be on the Podcast <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
