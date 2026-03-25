import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ContactUsModal from "../components/ContactUsModal";
import { clearAuth, isAuthed } from "../lib/auth";
import API_BASE from "../lib/apiBase";

const logoImageUrl = new URL("../../OneDrive_1_12-19-2025/UR LOGO white 1.png", import.meta.url).href;
const brettStoryImageUrl = new URL(
  "../../OneDrive_2026-03-23 (1)/About page/visual assets/brett's story image.png",
  import.meta.url
).href;
const timeIconUrl = new URL(
  "../../OneDrive_2026-03-23 (1)/About page/visual assets/Time Icon (Stroke).png",
  import.meta.url
).href;
const questionsIconUrl = new URL(
  "../../OneDrive_2026-03-23 (1)/About page/visual assets/Questions Icon (Stroke).png",
  import.meta.url
).href;
const conversationIconUrl = new URL(
  "../../OneDrive_2026-03-23 (1)/About page/visual assets/conversation icon.png",
  import.meta.url
).href;

export default function About() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [logoDance, setLogoDance] = useState(false);
  const authed = isAuthed();
  const navigate = useNavigate();

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".reveal-section"));
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const handleAccountClick = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/register");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        navigate("/my");
        return;
      }
    } catch {
      // fallthrough
    }
    clearAuth();
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-[#ECF1F4] text-[#231F20]">
      <style>{`
        :root {
          --usr-primary: #3B2C57;
          --usr-secondary: #7A3168;
          --usr-accent: #D5C7E2;
          --usr-ink: #231F20;
          --usr-muted: #5B6064;
          --usr-cloud: #ECF1F4;
          --usr-white: #FFFFFF;
          --usr-line: rgba(59, 44, 87, 0.12);
        }
        @keyframes logoDance {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          25% { transform: rotate(-8deg) translateY(-2px); }
          50% { transform: rotate(8deg) translateY(2px); }
          75% { transform: rotate(-4deg) translateY(-1px); }
        }
        .logo-dance {
          animation: logoDance 0.8s ease-in-out;
        }
        .reveal-section {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 700ms ease, transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .reveal-section.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <section className="relative overflow-hidden bg-[#231F20] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(122,49,104,0.16),transparent_35%)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6 py-8 sm:py-10 lg:py-12">
          <header className="flex items-center justify-between gap-4">
            <Link
              to="/"
              onClick={() => {
                setLogoDance(true);
                window.setTimeout(() => setLogoDance(false), 900);
              }}
              className="group flex items-center focus:outline-none"
              aria-label="The Unscripted Room logo"
            >
              <img
                src={logoImageUrl}
                alt="The Unscripted Room logo"
                className={`h-10 w-auto transition duration-300 group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.5)] sm:h-12 ${
                  logoDance ? "logo-dance" : ""
                }`}
              />
            </Link>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsContactOpen(true)}
                className="border border-white/25 bg-white/90 px-5 py-2 text-sm font-semibold text-[#231F20] shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
              >
                Contact Us
              </button>
              {authed ? (
                <button
                  type="button"
                  onClick={handleAccountClick}
                  className="inline-flex h-10 w-10 items-center justify-center border border-white/25 bg-white/90 text-[#231F20] shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
                  aria-label="Account"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path
                      d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-3.33 0-8 1.67-8 5v1h16v-1c0-3.33-4.67-5-8-5z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex h-10 w-10 items-center justify-center border border-white/25 bg-white/90 text-[#231F20] shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
                  aria-label="Register or login"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path
                      d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-3.33 0-8 1.67-8 5v1h16v-1c0-3.33-4.67-5-8-5z"
                      fill="currentColor"
                    />
                  </svg>
                </Link>
              )}
            </div>
          </header>

          <div className="max-w-3xl py-16 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#D5C7E2]">About The Unscripted Room</p>
            <h1 className="mt-5 max-w-3xl text-balance text-[2.75rem] font-medium leading-[1.06] tracking-[-0.03em] sm:text-[3.15rem] lg:text-[3.55rem]">
              The room, the questions, and the <span className="text-[#D5C7E2]">belief behind it</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/76 sm:text-lg">
              Every element of this podcast was designed with intention: the time, the questions, the principles, and
              the host who holds it all together.
            </p>
          </div>
        </div>
      </section>

      <AboutSplitSection
        id="time"
        theme="light"
        eyebrow="Time"
        title={
          <>
            <span className="text-[#7A3168]">Three hours.</span>
            <br />
            One conversation.
            <br />
            No interruptions.
          </>
        }
        icon={<img src={timeIconUrl} alt="" className="h-24 w-24 object-contain" />}
        paragraphs={[
          "Most conversations today are rushed.",
          "Quick reactions, short clips, and surface-level exchanges have become the norm. The Unscripted Room takes a different approach. Each episode unfolds over three uninterrupted hours, where a host and three guests stay with one conversation long enough for deeper thinking to emerge. That time isn’t filler; it’s the container that allows curiosity to work.",
          "Staying in the conversation moves guests beyond quick opinions into reflection, curiosity, and genuine understanding.",
        ]}
        pullQuote="Those who lean in often leave with something rare: deeper insight into their own thinking, greater respect for how others see the world, and the experience of being fully heard."
      />

      <AboutSplitSection
        id="questions"
        theme="dark"
        eyebrow="Questions"
        title={
          <>
            Nine questions.
            <br />
            Three themes.
            <br />
            <span className="text-[#D5C7E2]">Anywhere but simple.</span>
          </>
        }
        icon={<img src={questionsIconUrl} alt="" className="h-24 w-24 object-contain" />}
        paragraphs={[
          "Each episode of The Unscripted Room Podcast follows a sequence of nine open-ended questions.",
          "They guide the conversation through three themes: the lessons we carry from the past, how we act on what we understand today, and what we hope to do with the time we have ahead. The questions themselves are simple. But when people stay with them long enough, the conversation becomes anything but.",
          "In a world where many discussions are focused on proving who’s right, The Unscripted Room explores something different: what we can learn from one another.",
          "Our mission is ambitious: to give viewers a small escape from the prison of self-doubt by watching people have the courage to be themselves. When curiosity leads the conversation, people begin sharing their lived experiences that shape how they see the world. And sometimes, that’s where the most meaningful insights appear.",
        ]}
        boxedParagraphIndex={2}
      />

      <section id="principles" className="reveal-section bg-[#ECF1F4] px-6 py-14 sm:py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7A3168]">Conversation Principles</p>
            <div className="mt-8">
              <img src={conversationIconUrl} alt="" className="h-24 w-24 object-contain" />
            </div>
            <h2 className="mt-6 text-4xl font-semibold leading-tight text-[#231F20] sm:text-5xl">
              Three principles.
              <br />
              <span className="text-[#7A3168]">One goal.</span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-[#7A3168]">
              Great conversations don’t happen by accident.
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#7A3168]">
              In a world full of noise, quick reactions, and competing opinions, The Unscripted Room relies on a small
              set of principles that protect curiosity and encourage real listening.
            </p>
          </div>

          <div className="space-y-8">
            <p className="text-base leading-relaxed text-[#5B6064]">Three principles guide every conversation.</p>
            <PrincipleItem
              label="Principle One"
              title="We strive to understand the difference between perspective and truth."
              body="We listen and speak from lived experience. Our focus is understanding truth through the richness of differing perspectives."
            />
            <PrincipleItem
              label="Principle Two"
              title="We are all equals."
              body="Equality is expressed through how we listen and how we learn from the wisdom in the room."
            />
            <PrincipleItem
              label="Principle Three"
              title="We choose curiosity over authority."
              body="Our goal isn’t to win. It’s to understand. When we drift, we pause and return to curiosity."
            />
            <p className="border-l-2 border-[#D5C7E2] bg-[rgba(59,44,87,0.03)] px-5 py-4 text-base italic leading-relaxed text-[#5B6064]">
              When these principles are honored, they shape the tone of the conversation. They invite us to listen
              generously and share courageously.
            </p>
          </div>
        </div>
      </section>

      <section id="brett-story" className="reveal-section relative overflow-hidden bg-[#231F20]">
        <div className="grid min-h-[420px] items-stretch lg:min-h-[680px] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-[320px] bg-[#201a18] lg:min-h-[680px]">
            <img src={brettStoryImageUrl} alt="Brett in The Unscripted Room" className="h-full w-full object-cover" />
            <div
              className="absolute inset-y-0 right-0 hidden w-40 bg-gradient-to-r from-transparent via-[#231F20]/35 to-[#231F20] lg:block"
              aria-hidden="true"
            />
          </div>

          <div className="bg-[#231F20] px-8 py-10 text-white sm:px-10 sm:py-12 lg:px-14 lg:py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#D5C7E2]">Brett&apos;s Story</p>
            <div className="mt-4 h-px w-48 bg-[#D5C7E2]/45" />
            <h2 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-[3.5rem]">
              The room began with
              <br />a <span className="text-[#D5C7E2]">belief.</span>
            </h2>

            <div className="mt-5 max-w-4xl space-y-3.5 text-base leading-relaxed text-white/78 sm:text-[1.02rem]">
              <p>
                Brett has spent much of his career helping people develop skills and confidence through coaching and
                training. Over the past decade, he has led thousands of hours of facilitated learning experiences for
                professionals through the company he founded, CCS.
              </p>
              <p>
                Today, CCS supports the training of more than 5,000 customer experience professionals across the Jaguar
                Land Rover North American retail network.
              </p>
              <p>
                Both professionally and personally, Brett has experienced the loneliness that can come from holding a
                singular perspective.
              </p>
              <p>
                But his craft, fatherhood, relationships, and passions have also taught him that feeling disappears the
                moment an honest conversation begins.
              </p>
            </div>

            <div className="mt-5 max-w-3xl border-l-4 border-[#D5C7E2] bg-[#3B2C57] px-6 py-4 text-lg italic leading-relaxed text-white/92 sm:text-xl">
              Those moments are reminders that everyone knows something and deserves a dignified conversation to share
              it.
            </div>

            <div className="mt-5 max-w-4xl space-y-3.5 text-base leading-relaxed text-white/78 sm:text-[1.02rem]">
              <p>
                The Unscripted Room is the first step in a larger effort to help people build a curiosity mindset.
              </p>
              <p>
                None of the ways to earn the distinction of this mindset are easy, but the mission is clear: to help
                people escape the prison of their own self-doubt through the pursuit of mastering themselves.
              </p>
              <p>
                If the work stays focused and true to its values, the hope is that this podcast will grow into a
                community where thoughtful people come together to create better outcomes for themselves and for others.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ContactUsModal isOpen={isContactOpen} initialMode="contact" onClose={() => setIsContactOpen(false)} />
    </div>
  );
}

function AboutSplitSection({
  id,
  theme,
  eyebrow,
  title,
  paragraphs,
  pullQuote,
  boxedParagraphIndex,
  icon,
}: {
  id: string;
  theme: "light" | "dark";
  eyebrow: string;
  title: React.ReactNode;
  paragraphs: string[];
  pullQuote?: string;
  boxedParagraphIndex?: number;
  icon: React.ReactNode;
}) {
  const isDark = theme === "dark";

  return (
    <section
      id={id}
      className={`reveal-section px-6 py-14 sm:py-16 lg:py-20 ${isDark ? "bg-[#231F20] text-white" : "bg-[#ECF1F4] text-[#231F20]"}`}
    >
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.35em] ${isDark ? "text-[#D5C7E2]" : "text-[#7A3168]"}`}>
            {eyebrow}
          </p>
          <div className="mt-8">{icon}</div>
          <h2 className={`mt-6 text-4xl font-semibold leading-tight sm:text-5xl ${isDark ? "text-white" : "text-[#231F20]"}`}>
            {title}
          </h2>
        </div>

        <div className="space-y-5">
          {paragraphs.map((paragraph, index) =>
            boxedParagraphIndex === index ? (
              <div
                key={paragraph}
                className={`border-l-4 px-5 py-4 text-base leading-relaxed ${
                  isDark
                    ? "border-[#D5C7E2] border-l bg-[#3B2C57] text-white/88"
                    : "border-[#7A3168] bg-[rgba(122,49,104,0.08)] text-[#5B6064]"
                }`}
              >
                {paragraph}
              </div>
            ) : (
              <p
                key={paragraph}
                className={`text-base leading-relaxed ${isDark ? "text-white/76" : "text-[#5B6064]"}`}
              >
                {paragraph}
              </p>
            ),
          )}
          {pullQuote ? (
            <p
              className={`border-l-2 px-5 py-4 text-base italic leading-relaxed ${
                isDark
                  ? "border-[#D5C7E2]/40 bg-[rgba(213,199,226,0.05)] text-white/78"
                  : "border-[#D5C7E2] bg-[rgba(59,44,87,0.03)] text-[#5B6064]"
              }`}
            >
              {pullQuote}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function PrincipleItem({ label, title, body }: { label: string; title: string; body: string }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#7A3168]">{label}</p>
      <h3 className="text-lg font-bold text-[#231F20]">{title}</h3>
      <p className="text-base leading-relaxed text-[#5B6064]">{body}</p>
    </div>
  );
}

function HourglassIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 10h28M18 54h28M22 10c0 10 5 13 10 18-5 5-10 8-10 18M42 10c0 10-5 13-10 18 5 5 10 8 10 18" />
      <path d="M25 18h14M25 46h14" />
    </svg>
  );
}

function QuestionIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 14h28a6 6 0 0 1 6 6v18a6 6 0 0 1-6 6H31l-11 8v-8h-2a6 6 0 0 1-6-6V20a6 6 0 0 1 6-6Z" />
      <path d="M27 26a5 5 0 1 1 7.7 4.2c-1.8 1.2-2.7 2.2-2.7 4.8" />
      <circle cx="32" cy="41" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ConversationIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 18h18a8 8 0 0 1 8 8v10a8 8 0 0 1-8 8H27l-9 7v-7h-2a8 8 0 0 1-8-8V26a8 8 0 0 1 8-8Z" />
      <path d="M44 24h4a8 8 0 0 1 8 8v10a8 8 0 0 1-8 8h-2v6l-8-6h-6" />
      <circle cx="23" cy="31" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="30" cy="31" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="37" cy="31" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
