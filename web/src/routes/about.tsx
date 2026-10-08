import { createFileRoute } from "@tanstack/react-router";
import { roomMedia } from "@/lib/site-media";
import millPhoto from "@/assets/amesbury-mill.webp";
import { Testimonials } from "@/components/site/testimonials";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story | The Unscripted Room" },
      {
        name: "description",
        content:
          "Why The Unscripted Room exists, how it connects to a bigger picture, and the host behind the conversations.",
      },
      { property: "og:title", content: "Our Story | The Unscripted Room" },
      {
        property: "og:description",
        content:
          "It started with a conversation. The story of The Unscripted Room and its host, Brett.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const bigPicture = [
  {
    label: "Where it began",
    name: "Professional Training",
    text: "Years of facilitating learning experiences helped shape the belief behind all of this: meaningful growth often starts with better conversation.",
    accent: false,
  },
  {
    label: "Where we talk",
    name: "The Unscripted Room",
    text: "A long-form podcast bringing people with different experiences and perspectives together around one table.",
    accent: true,
  },
  {
    label: "Where we gather",
    name: "The Community Room",
    text: "A physical space in Amesbury created for meetings, events and opportunities to connect beyond the podcast.",
    accent: false,
  },
  {
    label: "Where it's going",
    name: "Curiosity Mindset",
    text: "An upcoming personal development platform built around curiosity, self-awareness and learning from perspectives beyond our own.",
    accent: false,
  },
];

function AboutPage() {
  return (
    <>
      <section className="dark-band tactile py-16 sm:py-20">
        <div className="site-container relative z-10">
          <h1 className="max-w-4xl text-warm-white">It started with a conversation.</h1>
          <p className="mt-6 max-w-2xl text-lg text-warm-white/70">
            The story of The Unscripted Room, and the host behind the table.
          </p>
        </div>
      </section>

      <section className="paper-texture pt-16 pb-12 sm:pt-24 sm:pb-16">
        <div className="site-container grid gap-12 lg:grid-cols-[1.1fr_.9fr] lg:items-start lg:gap-16">
          <div>
            <p className="eyebrow">Our story</p>
            <h2 className="mt-5 max-w-md">A podcast built around community and curiosity.</h2>
            <div className="mt-8 max-w-2xl space-y-5 text-lg text-muted-foreground">
              <p>
                The Unscripted Room grew out of years of work around learning, personal development
                and human connection.
              </p>
              <p>
                Again and again, that work pointed to the same idea: meaningful growth often happens
                when people have space to listen, speak honestly and consider perspectives beyond
                their own.
              </p>
              <p>
                Those spaces are harder to find than they should be. Most conversations are rushed,
                rehearsed or built around winning a point.
              </p>
              <p>
                The Unscripted Room was created to make space for the other kind: real people with
                different lived experiences, sitting around one table, following one question with
                curiosity instead of a script.
              </p>
            </div>
          </div>
          <figure className="lg:pt-2">
            <img
              src={millPhoto}
              alt="The historic brick mill building in Amesbury, Massachusetts, in warm late-afternoon light"
              loading="lazy"
              className="aspect-[6/5] h-auto w-full border border-foreground/10 object-cover"
            />
            <figcaption className="mt-3 text-xs leading-relaxed text-muted-foreground">
              The historic mill in Amesbury, Massachusetts, home to The Unscripted Room.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="pb-16 sm:pb-24">
        <div className="site-container border-t border-foreground/30 pt-12">
          <p className="eyebrow">The bigger picture</p>
          <p className="mt-5 max-w-3xl text-lg text-muted-foreground">
            The Unscripted Room is one part of a bigger idea: creating more opportunities for people
            to learn, connect and grow through meaningful conversation.
          </p>
          <div className="mt-12 grid gap-10 md:grid-cols-4 md:gap-8">
            {bigPicture.map((item, i) => (
              <article
                key={item.name}
                className={`relative border-t pt-6 ${item.accent ? "border-chartreuse" : "border-foreground/30"}`}
              >
                {i < 3 && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-5 top-[-0.6rem] hidden text-plum md:block"
                  >
                    →
                  </span>
                )}
                <p className="rule-label text-muted-foreground">{item.label}</p>
                <h3 className="mt-3 text-xl">{item.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-warm-white py-16 sm:py-24" aria-labelledby="meet-host-heading">
        <div className="site-container grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Meet the host</p>
            <h2 id="meet-host-heading" className="mt-5">
              Brett
            </h2>
            <img
              src={roomMedia.brettPortrait}
              alt="Brett speaking into a microphone at The Unscripted Room table"
              className="mt-8 h-auto w-full max-w-sm self-start object-cover"
            />
          </div>
          <div className="max-w-3xl space-y-5 text-lg text-muted-foreground lg:pt-14">
            <p>
              Brett has spent much of his career helping people develop skills and confidence
              through coaching and training. Over the past decade, he has led thousands of hours of
              facilitated learning experiences for professionals through the company he founded,
              CCS.
            </p>
            <p>
              Both professionally and personally, Brett has experienced the loneliness that can come
              from holding a singular perspective.
            </p>
            <p>
              But his craft, fatherhood, relationships, and passions have also taught him that
              feeling disappears the moment an honest conversation begins.
            </p>
            <p>
              Those moments are reminders that everyone knows something and deserves a dignified
              conversation to share it.
            </p>
            <p>
              For Brett, The Unscripted Room is the first step in a larger effort to help people
              build a curiosity mindset, and to help people escape the prison of their own
              self-doubt through the pursuit of mastering themselves.
            </p>
            <p>
              If the work stays focused and true to its values, his hope is that this podcast will
              grow into a community where thoughtful people come together to create better outcomes
              for themselves and for others.
            </p>
          </div>
        </div>
      </section>

      <Testimonials />

      <section
        className="paper-texture groove-light py-16 sm:py-24"
        aria-labelledby="behind-heading"
      >
        <div className="site-container grid gap-12 border-t border-foreground/30 pt-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="eyebrow">Behind the conversations</p>
            <h2 id="behind-heading" className="mt-5 max-w-md">
              Curiosity is where it starts.
            </h2>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              The conversations in The Unscripted Room are inspired by ideas we all encounter in
              life — things like empathy, balance, honesty, resilience and self-awareness. They help
              us find interesting questions to explore, not tell anyone what to think.
            </p>
          </div>
          <ul
            className="self-center divide-y divide-foreground/15 border-y border-foreground/15"
            aria-label="Ideas behind the conversations"
          >
            {[
              ["Empathy", "Balance", "Self-Awareness"],
              ["Discipline", "Honesty", "Focus"],
              ["Resilience", "Consistency", "Gratitude"],
            ].map((row) => (
              <li
                key={row[0]}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-5 font-headline text-2xl font-semibold uppercase tracking-[.02em] text-foreground sm:text-3xl"
              >
                {row.map((v, j) => (
                  <span key={v} className="inline-flex items-baseline gap-4">
                    {j > 0 && (
                      <span aria-hidden="true" className="text-soft-purple">
                        ·
                      </span>
                    )}
                    <span
                      className={
                        j === 1 ? "text-plum" : j === 2 ? "text-deep-purple" : "text-foreground"
                      }
                    >
                      {v}
                    </span>
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="bg-deep-purple py-16 text-warm-white sm:py-24"
        aria-labelledby="principles-heading"
      >
        <div className="site-container grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="rule-label text-soft-purple">Conversation principles</p>
            <h2 id="principles-heading" className="mt-5 max-w-sm text-warm-white">
              Three principles. One goal.
            </h2>
            <p className="mt-6 max-w-md text-lg text-warm-white/75">
              Good conversations need room for different perspectives. These three principles help
              create that room.
            </p>
          </div>
          <ol className="divide-y divide-warm-white/15 border-t border-warm-white/15">
            {[
              [
                "We strive to understand the difference between perspective and truth.",
                "We listen and speak from lived experience. Our focus is understanding truth through the richness of differing perspectives.",
              ],
              [
                "We are all equals.",
                "Equality is expressed through how we listen and how we learn from the wisdom in the room.",
              ],
              [
                "We choose curiosity over authority.",
                "Our goal isn't to win. It's to understand. When we drift, we pause and return to curiosity.",
              ],
            ].map(([t, d], k) => (
              <li key={t} className="grid gap-3 py-9 sm:grid-cols-[3.5rem_1fr] sm:py-11">
                <span className="pt-2 font-headline text-sm font-medium tracking-[.14em] text-soft-purple/80">
                  0{k + 1}
                </span>
                <div>
                  <h3
                    className={`font-headline text-2xl font-semibold uppercase leading-tight tracking-[.01em] sm:text-3xl ${k === 2 ? "text-soft-purple" : "text-warm-white"}`}
                  >
                    {t}
                  </h3>
                  <p className="mt-3 max-w-xl text-lg text-warm-white/70">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
