import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import RegisterInterestModal from "../components/RegisterInterestModal";
import ContactUsModal from "../components/ContactUsModal";
import { openCalendlyPopup } from "../lib/calendly";
import { clearAuth, isAuthed } from "../lib/auth";
import API_BASE from "../lib/apiBase";

const heroImageUrl = new URL(
  "../../OneDrive_1_12-19-2025/UR Table Image.jpg",
  import.meta.url
).href;
const logoImageUrl = new URL(
  "../../OneDrive_1_12-19-2025/UR LOGO white 1.png",
  import.meta.url
).href;
const heroLogoUrl = new URL(
  "../assets/Unscripted Room Logo-white 2.png",
  import.meta.url
).href;
const nineQuestionsImageUrl = new URL(
  "../../OneDrive_1_12-19-2025/9 question frame.png",
  import.meta.url
).href;
const communityImageUrl = new URL(
  "../../OneDrive_1_12-19-2025/community frame.png",
  import.meta.url
).href;
const principlesImageUrl = new URL(
  "../../OneDrive_1_12-19-2025/conversation principle frame 1.png",
  import.meta.url
).href;
const chairImageUrl = new URL(
  "../assets/Unscripted Room-seating.home-2400.jpg",
  import.meta.url
).href;
const podcastImageUrl = new URL(
  "../assets/Unscripted Room-mic.home-2400.jpg",
  import.meta.url
).href;

export default function Home() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
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

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".scroll-pop"));
    if (!elements.length) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight || 1;
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const start = vh * 0.85;
        const end = -rect.height * 0.15;
        const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
        el.style.setProperty("--scroll-progress", progress.toFixed(3));
      });
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  const handleLogoClick = () => {
    setLogoDance(true);
    window.setTimeout(() => setLogoDance(false), 900);
  };

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        .custom-check,
        .custom-radio {
          -webkit-appearance: none;
          appearance: none;
          background-color: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.5);
          box-sizing: border-box;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          position: relative;
          width: 16px;
          height: 16px;
          min-width: 16px;
          min-height: 16px;
          max-width: 16px;
          max-height: 16px;
          padding: 0;
          margin: 0;
          line-height: 0;
        }
        .custom-check {
          border-radius: 2px;
        }
        .custom-check:checked::after {
          content: "";
          position: absolute;
          left: 4px;
          top: 1px;
          width: 6px;
          height: 10px;
          border: 2px solid #000000;
          border-top: 0;
          border-left: 0;
          transform: rotate(45deg);
        }
        .custom-radio {
          border-radius: 9999px;
        }
        .custom-radio:checked::after {
          content: "";
          position: absolute;
          inset: 3px;
          background: #000000;
          border-radius: 9999px;
        }
        .range-track {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
        }
        .range-track::-webkit-slider-runnable-track {
          height: 4px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 9999px;
        }
        .range-track::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 18px;
          width: 18px;
          background: #000000;
          border-radius: 9999px;
          margin-top: -7px;
        }
        .range-track::-moz-range-track {
          height: 4px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 9999px;
        }
        .range-track::-moz-range-thumb {
          height: 18px;
          width: 18px;
          background: #000000;
          border: none;
          border-radius: 9999px;
        }
        @keyframes flipHint {
          0%, 100% { transform: rotate(0deg) translateY(0); opacity: 0.7; }
          50% { transform: rotate(12deg) translateY(-2px); opacity: 1; }
        }
        .flip-hint {
          animation: flipHint 1.6s ease-in-out infinite;
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
        .scroll-pop {
          --scroll-progress: 0;
        }
        .scroll-pop-glow {
          transform: translateY(calc((1 - var(--scroll-progress)) * 16px))
            scale(calc(0.88 + var(--scroll-progress) * 0.26));
          opacity: calc(0.2 + var(--scroll-progress) * 0.65);
          transition: transform 0.2s ease-out, opacity 0.2s ease-out;
          will-change: transform, opacity;
          background: radial-gradient(60% 60% at 30% 30%, rgba(255, 238, 214, 0.9), rgba(255, 255, 255, 0));
          background-size: 140% 140%;
          animation: auraPulse 7s ease-in-out infinite, auraDrift 10s ease-in-out infinite;
        }
        .scroll-pop-media {
          transform: translateY(calc((1 - var(--scroll-progress)) * 18px))
            scale(calc(0.96 + var(--scroll-progress) * 0.06));
          transition: transform 0.2s ease-out;
          will-change: transform;
          animation: breatheFloat 6s ease-in-out infinite;
        }
        @keyframes breatheFloat {
          0%, 100% {
            transform: translateY(calc((1 - var(--scroll-progress)) * 18px))
              scale(calc(0.96 + var(--scroll-progress) * 0.06))
              rotate(-0.4deg);
          }
          50% {
            transform: translateY(calc((1 - var(--scroll-progress)) * 10px))
              scale(calc(0.98 + var(--scroll-progress) * 0.08))
              rotate(0.6deg);
          }
        }
        @keyframes auraPulse {
          0%, 100% { opacity: calc(0.2 + var(--scroll-progress) * 0.55); filter: blur(28px); }
          50% { opacity: calc(0.35 + var(--scroll-progress) * 0.7); filter: blur(36px); }
        }
        @keyframes auraDrift {
          0%, 100% { background-position: 20% 20%; }
          50% { background-position: 80% 60%; }
        }
      `}</style>
      <section
        className="relative isolate min-h-[88vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImageUrl})` }}
      >
        <div className="absolute inset-0 bg-black/35" aria-hidden="true" />
        <div className="relative mx-auto flex w-full max-w-none flex-col gap-10 px-6 py-8 sm:py-12">
          <header className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleLogoClick}
              className="group flex items-center focus:outline-none"
              aria-label="The Unscripted Room logo"
            >
              <img
                src={logoImageUrl}
                alt="The Unscripted Room logo"
                className={`h-10 w-auto transition duration-300 group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.7)] sm:h-12 ${
                  logoDance ? "logo-dance" : ""
                }`}
              />
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => openCalendlyPopup()}
                className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-medium text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md font-nunito"
              >
                Reserve a Seat
              </button>
              <button
              type="button"
              onClick={() => {
                setIsContactOpen(true);
              }}
              className="rounded-full bg-[#f4ece1] px-5 py-2 text-sm font-medium text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md font-nunito"
            >
              Contact Us
              </button>
              {authed ? (
                <button
                  type="button"
                  onClick={handleAccountClick}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d9c2a8] bg-[#f4ece1] text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d9c2a8] bg-[#f4ece1] text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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

          <div className="mt-2 flex flex-col items-center text-center sm:mt-4 lg:mt-6">
            <img
              src={heroLogoUrl}
              alt="The Unscripted Room"
              className="w-[260px] drop-shadow-lg sm:w-[360px] lg:w-[440px]"
            />
            <h2 className="mt-6 text-2xl font-medium text-white/90 drop-shadow-lg sm:text-3xl">
              Questions. Conversation. Community.
            </h2>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10">
        <section className="py-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex w-full flex-col items-center">
              <p className="text-center text-lg font-medium text-black/80 sm:text-xl lg:text-2xl tracking-wide lg:tracking-wider lg:whitespace-nowrap">
                A guided, small-group conversation experience. Unscripted, but never unintentional.
              </p>
              <div className="mt-6 h-px w-full bg-black/30" />
            </div>
            <div className="mt-12 text-3xl font-bold font-montserrat tracking-[0.3em] text-black/60 sm:text-4xl lg:text-5xl">
              INSIDE THE ROOM
            </div>
            <div className="mt-4 text-lg font-semibold text-black/60 sm:text-xl">
              What Shapes the Experience
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <FlipCard
              title="9 Questions"
              imageUrl={nineQuestionsImageUrl}
              body={[
                "An intentionally developed sequence of nine questions guides the experience.",
                "They’re designed to open perspective, not prompt performance, helping the conversation move beyond the surface, naturally.",
              ]}
            />
            <FlipCard
              title="Community"
              imageUrl={communityImageUrl}
              body={[
                "The Unscripted Room is a group experience, bringing people from the community together in shared conversation.",
                "It reminds you that you’re not alone in how you think, or what you wrestle with.",
                "When strangers speak from real experience, and you see yourself in their words, that’s when community begins.",
              ]}
            />
            <FlipCard
              title="Conversation Principles"
              imageUrl={principlesImageUrl}
              objectPosition="54% 50%"
              body={[
                "Three principles that shape how the room is held.",
                "",
                "1. We strive to understand the difference between perspective and truth.",
                "We are here to listen and share from our lived experiences. In The Unscripted Room, our focus is on finding truth through the richness of differing perspectives.",
                "",
                "2. We are all equals.",
                "In this room, equality is expressed through how we listen, and how we learn from those who’ve turned time into wisdom. That wisdom is our opportunity.",
                "",
                "3. We choose curiosity over authority.",
                "Our goal is to find authentic connection through alignment. Curiosity is the social tool we use to get there.",
                "",
                "If we drift, we simply pause, reset, and return to curiosity.",
              ]}
            />
          </div>
          <div className="mt-8 text-center">
            <p className="text-base font-semibold text-black/70 sm:text-lg">
              Curious why the room works the way it does?
            </p>
            <div className="mt-4">
              <Link
                to="/why"
                className="inline-flex items-center justify-center rounded-full border border-[#d9c2a8] bg-[#f4ece1] px-5 py-2 text-sm font-semibold text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md font-nunito"
              >
                Explore the Design
              </Link>
            </div>
          </div>
        </section>

        <section className="grid items-center gap-8 pb-12 pt-4 lg:grid-cols-[1.05fr_.95fr]">
          <div className="max-w-xl">
            <h3 className="text-2xl font-semibold text-black sm:text-3xl">Join the Room!</h3>
            <p className="mt-4 text-base leading-relaxed text-black/70">
              When was the last time you sat in a conversation without needing to perform, persuade, or resolve?
            </p>
            <p className="mt-4 text-base leading-relaxed text-black/70">
              The Unscripted Room brings together a small group of people willing to hold different perspectives long
              enough for something deeper to emerge.
            </p>
            <p className="mt-4 text-base leading-relaxed text-black/70">
              Each room is intentionally small and guided to support presence, reflection, and shared understanding.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => openCalendlyPopup()}
                className="inline-flex items-center justify-center rounded-full border border-[#d9c2a8] bg-[#f4ece1] px-5 py-2 text-sm font-semibold text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md font-nunito"
              >
                Reserve a Seat
              </button>
            </div>
          </div>

          <div className="relative scroll-pop">
            <div className="scroll-pop-glow absolute -inset-4 rounded-[32px] bg-white/40 blur-2xl" aria-hidden="true" />
            <img
              src={chairImageUrl}
              alt="Unscripted Room chair"
              className="scroll-pop-media relative h-[360px] w-full rounded-[28px] object-cover shadow-2xl sm:h-[440px]"
            />
          </div>
        </section>

        <section id="podcast" className="grid items-center gap-8 pb-16 pt-2 lg:grid-cols-[.95fr_1.05fr]">
          <div className="relative order-2 scroll-pop lg:order-1">
            <div className="scroll-pop-glow absolute -inset-4 rounded-[32px] bg-white/40 blur-2xl" aria-hidden="true" />
            <img
              src={podcastImageUrl}
              alt="Unscripted Room podcast"
              className="scroll-pop-media relative h-[360px] w-full rounded-[28px] object-cover shadow-2xl sm:h-[440px]"
            />
          </div>

          <div className="order-1 max-w-xl lg:order-2">
            <h3 className="text-2xl font-semibold text-black sm:text-3xl">The Conversation Continues</h3>
            <p className="mt-4 text-base leading-relaxed text-black/70">
              The conversation doesn&apos;t have to end when the room does. The Unscripted Room Podcast offers a
              separate space for curiosity-led conversations, featuring voices from The Unscripted Room community and
              more.
            </p>
            <div className="mt-6">
              <Link
                to="/podcast"
                className="inline-flex items-center justify-center rounded-full border border-[#d9c2a8] bg-[#f4ece1] px-5 py-2 text-sm font-semibold text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md font-nunito"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </div>

      <RegisterInterestModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
      <ContactUsModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}

function FlipCard({
  title,
  imageUrl,
  body,
  objectPosition,
}: {
  title: string;
  imageUrl: string;
  body: string[];
  objectPosition?: string;
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setIsFlipped((v) => !v)}
      className="group relative h-[180px] w-full rounded-[24px] transition-transform hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 sm:h-[200px] lg:h-[220px]"
      aria-pressed={isFlipped}
      aria-label={`Flip card: ${title}`}
    >
      <div className="relative h-full w-full [perspective:1200px]">
        <div
          className="absolute inset-0 h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
          style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          <div className="absolute inset-0 h-full w-full overflow-hidden rounded-[24px] bg-white shadow-xl transition-transform duration-300 group-hover:rotate-1 group-hover:scale-[1.01] [backface-visibility:hidden]">
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover"
              style={{ objectPosition: objectPosition || "50% 50%" }}
            />
          </div>
          <div className="absolute inset-0 flex h-full w-full flex-col overflow-hidden rounded-[24px] bg-[#f5ede1] p-4 text-left shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-5">
            <div className="text-lg font-semibold text-black">{title}</div>
            <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 text-sm leading-relaxed text-black/80">
              {body.map((line, index) => (
                <p
                  key={`${title}-${index}`}
                  className={
                    line
                      ? line.match(/^\d+\./)
                        ? "font-semibold text-black"
                        : ""
                      : "h-3"
                  }
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
