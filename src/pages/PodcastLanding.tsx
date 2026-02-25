import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import RegisterInterestModal from "../components/RegisterInterestModal";
import ContactUsModal from "../components/ContactUsModal";
import { openCalendlyPopup } from "../lib/calendly";
import { clearAuth, isAuthed } from "../lib/auth";
import API_BASE from "../lib/apiBase";

const heroImageUrl = new URL(
  "../../OneDrive_1_12-19-2025/Screenshot 2025-12-19 at 7.17.59 AM.png",
  import.meta.url
).href;
const logoImageUrl = new URL(
  "../assets/UR LOGO dark.png",
  import.meta.url
).href;

export default function PodcastLanding() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [logoDance, setLogoDance] = useState(false);
  const authed = isAuthed();
  const navigate = useNavigate();
  const location = useLocation();
  const hasOpenedRegisterFromQuery = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("register") === "1" && !hasOpenedRegisterFromQuery.current) {
      hasOpenedRegisterFromQuery.current = true;
      setIsRegisterOpen(true);
    }
  }, [location.search]);

  useEffect(() => {
    const media = document.querySelector(".scroll-pop");
    if (!media) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      },
      { threshold: 0.3 }
    );
    observer.observe(media);
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

  const handleLogoClick = () => {
    setLogoDance(true);
    window.setTimeout(() => setLogoDance(false), 900);
  };

  return (
    <div className="bg-white text-black">
      <section className="relative overflow-hidden">
        <style>{`
          @keyframes logoDance {
            0% { transform: rotate(0deg) translateY(0); }
            25% { transform: rotate(-8deg) translateY(-2px); }
            50% { transform: rotate(8deg) translateY(2px); }
            75% { transform: rotate(-4deg) translateY(-1px); }
            100% { transform: rotate(0deg) translateY(0); }
          }
          .logo-dance {
            animation: logoDance 0.8s ease-in-out;
          }
          .scroll-pop {
            perspective: 1200px;
          }
          .scroll-pop-media {
            transform: translateY(10px) scale(0.98);
            transition: transform 700ms ease, box-shadow 700ms ease;
          }
          .breathing {
            animation: breathe 6.5s ease-in-out infinite;
          }
          @keyframes breathe {
            0%, 100% { transform: translateY(0) scale(1.02); }
            50% { transform: translateY(-6px) scale(1.045); }
          }
          .scroll-pop-glow {
            opacity: 0.55;
            transition: opacity 700ms ease, transform 700ms ease;
          }
          .scroll-pop.is-visible .scroll-pop-media {
            transform: translateY(0) scale(1.02);
          }
          .scroll-pop.is-visible .scroll-pop-glow {
            opacity: 0.85;
            transform: scale(1.05);
          }
        `}</style>
        <div className="absolute inset-0 bg-white" aria-hidden="true" />
        <div className="relative mx-auto flex w-full max-w-none items-center justify-between px-6 py-8 sm:py-12">
          <Link
            to="/"
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
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIsContactOpen(true);
              }}
              className="rounded-full bg-[#f4ece1] px-5 py-2 text-sm font-medium text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Contact Us
            </button>
            {authed ? (
              <button
                type="button"
                onClick={handleAccountClick}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-[#f4ece1] text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-[#f4ece1] text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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
        </div>
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <h1 className="text-balance text-4xl font-semibold text-black sm:text-5xl">
              The Unscripted Room Podcast
            </h1>
            <p className="mt-4 text-xl font-medium text-black/80 sm:text-2xl">
              One question. Equal voices. A different kind of conversation.
            </p>
            <p className="mt-5 text-base leading-relaxed text-black/70">
              What happens when a group of people stays with one question and gives it the time it deserves?
            </p>
            <p className="mt-3 text-base leading-relaxed text-black/70">
              The Unscripted Room Podcast hosts long-form conversations shaped by curiosity, presence, and equal
              voices.
            </p>
            <p className="mt-3 text-base leading-relaxed text-black/70">
              No edits. No performance. Just honest conversation.
            </p>
            <div className="mt-8 w-full max-w-xl rounded-2xl bg-[#f4ece1] px-6 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-black/80">
                  Interested in contributing to a future conversation?
                </p>
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsContactOpen(true)}
                    className="inline-flex items-center justify-center rounded-full border border-[#d9c2a8] bg-white px-5 py-2 text-sm font-semibold text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    aria-label="Apply to contribute to The Unscripted Room"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-black/60">
              Conversations are long-form, unscripted, and shaped by curiosity, not credentials.
            </p>
            <p className="mt-3 text-sm text-black/60">New episodes launching soon.</p>
          </div>
          <div className="relative scroll-pop">
            <div className="scroll-pop-glow absolute -inset-4 rounded-[32px] bg-white/40 blur-2xl" aria-hidden="true" />
            <img
              src={heroImageUrl}
              alt="Microphone and notes from The Unscripted Room podcast"
              className="scroll-pop-media breathing relative h-[320px] w-full rounded-[28px] object-cover shadow-2xl sm:h-[420px]"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-[24px] bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold">One Question</h2>
            <p className="mt-3 text-sm leading-relaxed text-black/70">
              Each episode begins with a single, carefully chosen question, held long enough for curiosity and real
              thinking to unfold.
            </p>
          </div>
          <div className="rounded-[24px] bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold">Equal Voices</h2>
            <p className="mt-3 text-sm leading-relaxed text-black/70">
              No experts. No hierarchy. Every voice carries equal weight, sharing perspective shaped by lived
              experiences.
            </p>
          </div>
          <div className="rounded-[24px] bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold">Unedited Conversations</h2>
            <p className="mt-3 text-sm leading-relaxed text-black/70">
              Episodes unfold over hours and remain unedited. What you hear is exactly what happened in the room.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-[28px] bg-[#f4ece1] px-8 py-10 text-black">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold">Are you ready to represent curiosity?</h2>
              <p className="mt-3 text-sm leading-relaxed text-black/70">
                The podcast is where presence meets purpose. Join us to model what&apos;s possible when you are more
                curious about what you can learn, then concerned about what you know.
              </p>
            </div>
            <div className="flex lg:justify-end">
              <button
                type="button"
                onClick={() => setIsContactOpen(true)}
                className="inline-flex items-center justify-center rounded-full border border-[#d9c2a8] bg-white px-5 py-2 text-sm font-semibold text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </section>

      <RegisterInterestModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
      <ContactUsModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}
