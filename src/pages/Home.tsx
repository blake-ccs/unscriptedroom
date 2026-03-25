import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import RegisterInterestModal from "../components/RegisterInterestModal";
import ContactUsModal, { type ContactFormMode } from "../components/ContactUsModal";
import { clearAuth, isAuthed } from "../lib/auth";
import API_BASE from "../lib/apiBase";

const heroVideoUrl = new URL("../../Landing page hero video.mov", import.meta.url).href;
const logoImageUrl = new URL("../../OneDrive_1_12-19-2025/UR LOGO white 1.png", import.meta.url).href;
const challengeImageUrl = new URL(
  "../../OneDrive_2026-03-20/Visual assest for podcast page/are you up for the challenge.png",
  import.meta.url
).href;
const communityHeroImageUrl = new URL(
  "../../OneDrive_2026-03-20/Visual assest for podcast page/not ready for the podcast image.png",
  import.meta.url
).href;
const hostHeroImageUrl = new URL(
  "../../OneDrive_2026-03-20/Visual assest for podcast page/meet your host image.png",
  import.meta.url
).href;
const timeFrontImageUrl = new URL("../../OneDrive_2026-03-20/Visual assest for podcast page/time front.png", import.meta.url).href;
const timeBackImageUrl = new URL("../../OneDrive_2026-03-20/Visual assest for podcast page/time back.png", import.meta.url).href;
const questionsFrontImageUrl = new URL(
  "../../OneDrive_2026-03-20/Visual assest for podcast page/9 questions front.png",
  import.meta.url
).href;
const questionsBackImageUrl = new URL(
  "../../OneDrive_2026-03-20/Visual assest for podcast page/9 questions back.png",
  import.meta.url
).href;
const conversationFrontImageUrl = new URL(
  "../../OneDrive_2026-03-20/Visual assest for podcast page/conversation front.png",
  import.meta.url
).href;
const conversationBackImageUrl = new URL(
  "../../OneDrive_2026-03-20/Visual assest for podcast page/conversation back.png",
  import.meta.url
).href;

const hostStatements = [
  "Everyone knows something and deserves a dignified conversation to share it.",
  "That feeling disappears the moment an honest conversation begins.",
  "The Unscripted Room is the first step in a larger effort to help people build a curiosity mindset.",
];

const insidePodcastCards = [
  {
    title: "Time",
    frontImageUrl: timeFrontImageUrl,
    backImageUrl: timeBackImageUrl,
  },
  {
    title: "9 Questions",
    frontImageUrl: questionsFrontImageUrl,
    backImageUrl: questionsBackImageUrl,
  },
  {
    title: "Conversation Principles",
    frontImageUrl: conversationFrontImageUrl,
    backImageUrl: conversationBackImageUrl,
  },
] as const;

export default function Home() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactTopic, setContactTopic] = useState("");
  const [contactMode, setContactMode] = useState<ContactFormMode>("contact");
  const [logoDance, setLogoDance] = useState(false);
  const authed = isAuthed();
  const navigate = useNavigate();
  const location = useLocation();
  const hasOpenedRegisterFromQuery = useRef(false);
  const hasOpenedContactFromQuery = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("register") === "1" && !hasOpenedRegisterFromQuery.current) {
      hasOpenedRegisterFromQuery.current = true;
      setIsRegisterOpen(true);
      return;
    }
    if (params.get("contact") === "1" && !hasOpenedContactFromQuery.current) {
      hasOpenedContactFromQuery.current = true;
      setContactMode("contact");
      setContactTopic("");
      setIsContactOpen(true);
    }
  }, [location.search]);

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

  const handleLogoClick = () => {
    setLogoDance(true);
    window.setTimeout(() => setLogoDance(false), 900);
  };

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".reveal-band"));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#ECF1F4] text-[#231F20]">
      <style>{`
        :root {
          --usr-primary: #3B2C57;
          --usr-secondary: #7A3168;
          --usr-accent: #D5C7E2;
          --usr-ink: #231F20;
          --usr-muted: #5B6064;
          --usr-blue-gray: #9BB0C1;
          --usr-light-gray: #D3D7DE;
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
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .logo-dance {
          animation: logoDance 0.8s ease-in-out;
        }
        .hero-grid {
          background:
            linear-gradient(180deg, rgba(35, 31, 32, 0.08), rgba(35, 31, 32, 0.5)),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: auto, 32px 32px, 32px 32px;
        }
        .feature-card {
          animation: floatCard 7s ease-in-out infinite;
        }
        .podcast-card {
          perspective: 1600px;
        }
        .podcast-card-inner {
          position: relative;
          transform-style: preserve-3d;
          transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .podcast-card:hover .podcast-card-inner,
        .podcast-card:focus-visible .podcast-card-inner {
          transform: rotateY(180deg);
        }
        .podcast-card-face {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .podcast-card-back {
          transform: rotateY(180deg);
        }
        .reveal-band {
          opacity: 0;
          transform: translateY(36px);
          transition: opacity 700ms ease, transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .reveal-band.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <section className="hero-grid relative isolate overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={heroVideoUrl}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(90deg, rgba(0, 0, 0, 0.9) 0%, rgba(12, 10, 14, 0.88) 22%, rgba(24, 20, 22, 0.82) 42%, rgba(35, 31, 32, 0.62) 62%, rgba(59, 44, 87, 0.28) 82%, rgba(59, 44, 87, 0.12) 100%)",
          }}
        />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-8 sm:py-10 lg:py-12">
          <header className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleLogoClick}
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
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setContactTopic("");
                  setContactMode("contact");
                  setIsContactOpen(true);
                }}
                className="border border-white/25 bg-[#ECF1F4] px-5 py-2 text-sm font-semibold text-[#231F20] shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
              >
                Contact Us
              </button>
              {authed ? (
                <button
                  type="button"
                  onClick={handleAccountClick}
                  className="inline-flex h-10 w-10 items-center justify-center border border-white/25 bg-[#ECF1F4] text-[#231F20] shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
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
                  className="inline-flex h-10 w-10 items-center justify-center border border-white/25 bg-[#ECF1F4] text-[#231F20] shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
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

          <div className="pb-20 pt-2 lg:pb-24">
            <div className="max-w-4xl">
              <h1 className="max-w-3xl text-balance text-[2.65rem] font-medium leading-[1.06] tracking-[-0.03em] text-white sm:text-[3.2rem] lg:text-[3.75rem]">
                A challenge of curiosity, <span className="text-[#D5C7E2]">attention</span>, and{" "}
                <span className="text-[#D5C7E2]">real</span> conversation.
              </h1>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setContactMode("podcast-guest");
                    setContactTopic("Be a Podcast Guest");
                    setIsContactOpen(true);
                  }}
                  className="inline-flex min-h-14 items-center justify-center bg-[var(--usr-secondary)] px-8 py-4 text-xl font-medium text-white transition hover:bg-[var(--usr-primary)]"
                >
                  Be a Podcast Guest
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:pt-14">
        <section className="border-b border-[var(--usr-line)] bg-[var(--usr-cloud)] py-14 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-4xl font-bold tracking-[0.04em] text-[var(--usr-ink)] sm:text-5xl lg:text-6xl">
              INSIDE THE PODCAST
            </h2>
            <p className="mt-5 text-center text-xl text-[var(--usr-muted)] sm:text-2xl">
              What Shapes the Experience
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-[1240px] gap-8 xl:gap-[4.5rem] md:grid-cols-3">
            {insidePodcastCards.map((card) => (
              <FlipImageCard
                key={card.title}
                title={card.title}
                frontImageUrl={card.frontImageUrl}
                backImageUrl={card.backImageUrl}
                href={
                  card.title === "Time"
                    ? "/about#time"
                    : card.title === "9 Questions"
                      ? "/about#questions"
                      : "/about#principles"
                }
              />
            ))}
          </div>
        </section>

      </div>

      <section className="reveal-band bg-[#231F20]">
        <div className="grid items-stretch lg:grid-cols-[1.08fr_.92fr]">
          <div className="relative min-h-[260px] lg:min-h-[520px]">
            <img
              src={challengeImageUrl}
              alt="Microphone and Unscripted Room sign"
              className="h-full w-full object-cover"
            />
            <div
              className="absolute inset-0 hidden lg:block"
              aria-hidden="true"
              style={{
                background:
                  "linear-gradient(90deg, rgba(35,31,32,0) 68%, rgba(35,31,32,0.38) 82%, rgba(35,31,32,0.88) 100%)",
              }}
            />
          </div>

          <div className="flex flex-col justify-center px-8 py-8 text-white sm:px-10 sm:py-10 lg:px-12 lg:py-12">
            <h2 className="max-w-xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-[3.4rem]">
              Are You Up for the <span className="text-[var(--usr-accent)]">Challenge?</span>
            </h2>
            <div className="mt-6 max-w-xl space-y-5 text-[0.98rem] leading-relaxed text-white/88 sm:text-base">
              <p>
                Each episode of The Unscripted Room Podcast brings together a host and up to three guests for three
                uninterrupted hours of conversation.
              </p>
              <p>The challenge is simple: stay curious, listen generously, speak honestly from lived experience.</p>
              <p>
                In a world that rewards quick opinions and confident answers, this experience asks something different,
                the willingness to slow down and explore ideas together.
              </p>
              <p>
                If you’re ready to be curious for three hours and share that experience openly with others, you may be
                exactly the kind of guest this room was designed for.
              </p>
              <p>If this opportunity calls to you, please answer.</p>
            </div>
            <div className="mt-8">
              <button
                type="button"
                onClick={() => {
                  setContactTopic("I’d like to be a podcast guest");
                  setContactMode("podcast-guest");
                  setIsContactOpen(true);
                }}
                className="inline-flex min-h-14 items-center justify-center bg-[var(--usr-secondary)] px-8 py-4 text-base font-medium text-white transition hover:bg-[var(--usr-primary)]"
              >
                Be a Podcast Guest
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="reveal-band bg-[var(--usr-cloud)]">
        <div className="grid items-stretch lg:grid-cols-[.95fr_1.05fr]">
          <div className="relative flex flex-col justify-center px-8 py-8 text-[var(--usr-ink)] sm:px-10 sm:py-10 lg:px-12 lg:py-12">
            <h2 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-[3.4rem]">
              Not ready for the podcast?
              <br />
              There&apos;s still a seat for <span className="text-[var(--usr-secondary)]">you.</span>
            </h2>
            <div className="mt-6 max-w-3xl space-y-5 text-[0.98rem] leading-relaxed text-[var(--usr-ink)] sm:text-base">
              <p>Curiosity doesn’t require an audience.</p>
              <p>
                If the idea of the room speaks to you but you’d rather explore it without microphones or cameras,
                there is another way to participate.
              </p>
              <p>Community Unscripted Rooms follow the same format as the podcast.</p>
              <p>
                A host guides a small group of up to twelve people through the same sequence of nine questions and
                conversation principles that shape the podcast.
              </p>
              <p>The goal is simple: to create a conversation where curiosity can do its best work.</p>
              <p>
                These gatherings offer a chance to practice curiosity in its most natural form, listening generously,
                sharing honestly, and discovering what can happen when people give their full attention to the moment.
              </p>
            </div>
            <div className="mt-8">
              <Link
                to="/community"
                className="inline-flex min-h-14 items-center justify-center border border-[var(--usr-secondary)] bg-[var(--usr-white)] px-8 py-4 text-base font-medium text-[var(--usr-secondary)] transition hover:bg-[var(--usr-light-gray)]"
              >
                Explore Community Rooms
              </Link>
            </div>
          </div>

          <div className="relative min-h-[260px] lg:min-h-[520px]">
            <img
              src={communityHeroImageUrl}
              alt="Conversation principles room"
              className="block h-full w-full object-cover"
            />
            <div
              className="absolute inset-0 hidden lg:block"
              aria-hidden="true"
              style={{
                background:
                  "linear-gradient(90deg, rgba(236,241,244,1) 0%, rgba(236,241,244,0.92) 16%, rgba(236,241,244,0.62) 30%, rgba(236,241,244,0.22) 44%, rgba(236,241,244,0) 58%)",
              }}
            />
          </div>
        </div>
      </section>

      <section className="reveal-band relative overflow-hidden bg-[#231F20]">
        <div className="absolute inset-0">
          <img
            src={hostHeroImageUrl}
            alt="Meet your host"
            className="h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                "linear-gradient(90deg, rgba(35,31,32,0.08) 0%, rgba(35,31,32,0.22) 42%, rgba(35,31,32,0.78) 66%, rgba(24,20,22,0.96) 100%)",
              }}
          />
        </div>

        <div className="relative mx-auto grid min-h-[540px] max-w-7xl lg:min-h-[660px] lg:grid-cols-[1fr_.95fr]">
          <div />
          <div className="flex flex-col justify-center px-8 py-14 text-white sm:px-10 sm:py-16 lg:px-12 lg:py-20">
            <p
              className="text-[1.9rem] uppercase tracking-[0.04em] text-white sm:text-[2.35rem] lg:text-[2.9rem]"
              style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600 }}
            >
              MEET YOUR HOST
            </p>
            <div className="mt-8 space-y-5 text-[0.98rem] leading-relaxed text-white/90 sm:text-base lg:max-w-[42rem]">
              {hostStatements.map((statement) => (
                <div key={statement} className="flex items-start gap-4">
                  <span className="mt-1 h-9 w-px bg-white/85" aria-hidden="true" />
                  <p>{statement}</p>
                </div>
              ))}
            </div>
            <div className="mt-12">
              <Link
                to="/about#brett-story"
                className="inline-flex items-center gap-3 text-[1.05rem] font-medium text-[var(--usr-accent)] transition hover:text-white"
              >
                <span>Read Brett&apos;s Full Story</span>
                <span aria-hidden="true" className="text-[1.5rem] leading-none">›</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <RegisterInterestModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
      <ContactUsModal
        isOpen={isContactOpen}
        initialMode={contactMode}
        initialTopic={contactTopic}
        onClose={() => {
          setIsContactOpen(false);
          setContactMode("contact");
          setContactTopic("");
        }}
      />
    </div>
  );
}

function FlipImageCard({
  title,
  frontImageUrl,
  backImageUrl,
  href,
}: {
  title: string;
  frontImageUrl: string;
  backImageUrl: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="podcast-card group block w-full cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--usr-primary)]/40"
      aria-label={`Open ${title} section`}
    >
      <div className="podcast-card-inner aspect-square h-full w-full">
        <div className="podcast-card-face absolute inset-0 overflow-hidden border border-[var(--usr-line)] bg-[var(--usr-white)] shadow-[0_24px_60px_rgba(59,44,87,0.12)]">
          <img src={frontImageUrl} alt={`${title} card front`} className="h-full w-full object-cover" />
        </div>
        <div className="podcast-card-face podcast-card-back absolute inset-0 overflow-hidden border border-[var(--usr-line)] bg-[var(--usr-white)] shadow-[0_24px_60px_rgba(59,44,87,0.16)]">
          <img src={backImageUrl} alt={`${title} card back`} className="h-full w-full object-cover" />
        </div>
      </div>
    </a>
  );
}
