import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import RegisterInterestModal from "../components/RegisterInterestModal";
import ContactUsModal from "../components/ContactUsModal";
import { clearAuth, isAuthed } from "../lib/auth";
import API_BASE from "../lib/apiBase";

const logoImageUrl = new URL(
  "../assets/UR LOGO dark.png",
  import.meta.url
).href;
const nineQuestionsImageUrl = new URL(
  "../../OneDrive_1_12-19-2025/9 question frame.png",
  import.meta.url
).href;
const principlesImageUrl = new URL(
  "../../OneDrive_1_12-19-2025/conversation principle frame 1.png",
  import.meta.url
).href;
const communityImageUrl = new URL(
  "../../OneDrive_1_12-19-2025/community frame.png",
  import.meta.url
).href;

export default function Why() {
  const [logoDance, setLogoDance] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const authed = isAuthed();
  const navigate = useNavigate();
  const location = useLocation();
  const hasOpenedRegisterFromQuery = useRef(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const slides = [
    {
      title: "9 Questions",
      image: nineQuestionsImageUrl,
      imageClass: "object-cover",
      frameClass: "",
      paragraphs: [
        "The questions aren’t random. They’re intentionally sequenced to create a natural flow, moving between personal insight and shared understanding.",
        "Each question invites reflection rooted in lived experience, not opinion, allowing something deeper to surface as the room comes into alignment.",
        "We focus on the quality of the question, and the order in which it arrives.",
      ],
    },
    {
      title: "Conversation Principles",
      image: principlesImageUrl,
      imageClass: "object-cover",
      frameClass: "",
      paragraphs: [
        "Most conversations break down when the goal becomes being right, because being right requires someone else to be wrong. In the Unscripted Room, the aim isn’t to win an argument. It’s to understand each other.",
        "These principles give us a way to return to alignment when certainty, ego, or performance starts to take over.",
      ],
    },
    {
      title: "Community",
      image: communityImageUrl,
      imageClass: "object-cover",
      frameClass: "",
      paragraphs: [
        "We all need a place to share and be heard, and right now there aren’t many places that offer both. The Unscripted Room was created to be one of those places where curiosity isn’t just welcomed, it’s practiced.",
        "It’s how strangers become co-thinkers, how listening becomes a form of leadership, and how we build communities guided by clarity, not control.",
        "We believe curiosity can become the default for how we communicate, solve problems, and stay connected, even when we don’t agree. The impact doesn’t come from scale. It comes from practicing this way of being together, one room at a time.",
      ],
    },
  ];

  const handleLogoClick = () => {
    setLogoDance(true);
    window.setTimeout(() => setLogoDance(false), 900);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("register") === "1" && !hasOpenedRegisterFromQuery.current) {
      hasOpenedRegisterFromQuery.current = true;
      setIsRegisterOpen(true);
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
              onClick={() => setIsContactOpen(true)}
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

        <div className="relative mx-auto max-w-6xl px-6 pb-20 text-center">
          <h1 className="text-balance text-5xl font-semibold tracking-tight text-black sm:text-6xl lg:text-7xl">
            Beneath the Surface
          </h1>
          <p className="mt-4 text-lg font-medium text-black/70 sm:text-xl">
            Why the room works the way it does
          </p>
          <div className="mx-auto mt-6 h-px w-24 bg-black/20" aria-hidden="true" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="p-2 sm:p-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div className={`relative overflow-hidden rounded-[28px] ${slides[slideIndex].frameClass}`}>
              <div className="absolute -inset-4 rounded-[28px] bg-white/40 blur-2xl" aria-hidden="true" />
              <img
                src={slides[slideIndex].image}
                alt={slides[slideIndex].title}
                className={`relative h-[190px] w-full rounded-[22px] object-cover shadow-xl sm:h-[230px] lg:h-[250px] ${slides[slideIndex].imageClass}`}
              />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-black">{slides[slideIndex].title}</h2>
              <div className="mt-3 space-y-2 text-base leading-snug text-black/70">
                {slides[slideIndex].paragraphs.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSlideIndex((index) => Math.max(0, index - 1))}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${
                slideIndex === 0
                  ? "border-black/10 text-black/20"
                  : "border-black/20 text-black hover:-translate-y-0.5 hover:shadow-md"
              } transition`}
              aria-label="Previous section"
              disabled={slideIndex === 0}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path
                  d="M15.5 5.5L9 12l6.5 6.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="flex items-center gap-2.5">
              {slides.map((_, idx) => (
                <span
                  key={`why-slide-${idx}`}
                  className={`h-3 w-3 rounded-full ${slideIndex === idx ? "bg-black" : "bg-black/20"}`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSlideIndex((index) => Math.min(slides.length - 1, index + 1))}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${
                slideIndex === slides.length - 1
                  ? "border-black/10 text-black/20"
                  : "border-black/20 text-black hover:-translate-y-0.5 hover:shadow-md"
              } transition`}
              aria-label="Next section"
              disabled={slideIndex === slides.length - 1}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path
                  d="M8.5 5.5L15 12l-6.5 6.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 pb-4">
        <div className="h-px w-full bg-black/10" aria-hidden="true" />
      </div>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-2 text-center">
        <p className="text-base font-semibold text-black/70 sm:text-lg">The room begins when you enter it.</p>
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setIsContactOpen(true)}
            className="rounded-full border border-[#d9c2a8] bg-[#f4ece1] px-5 py-2 text-sm font-semibold text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Reserve a Seat
          </button>
        </div>
      </section>

      <RegisterInterestModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
      <ContactUsModal isOpen={isContactOpen} initialMode="contact" onClose={() => setIsContactOpen(false)} />
    </div>
  );
}
