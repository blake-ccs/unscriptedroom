import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ContactUsModal, { type ContactFormMode } from "../../components/ContactUsModal";
import { clearAuth, isAuthed } from "../../lib/auth";
import API_BASE from "../../lib/apiBase";

const logoImageUrl = new URL("../../../OneDrive_1_12-19-2025/UR LOGO white 1.png", import.meta.url).href;
const communityFrontImageUrl = new URL(
  "../../../OneDrive_2026-03-23/Community page/visual assets for community page/a conversation designed to go deeper image.png",
  import.meta.url
).href;
const communityBackImageUrl = new URL(
  "../../../OneDrive_2026-03-23/Community page/visual assets for community page/inside community image.png",
  import.meta.url
).href;
const joinRoomFrontImageUrl = new URL(
  "../../../OneDrive_2026-03-23/Community page/visual assets for community page/join room front.png",
  import.meta.url
).href;
const joinRoomBackImageUrl = new URL(
  "../../../OneDrive_2026-03-23/Community page/visual assets for community page/join room back.png",
  import.meta.url
).href;
const curateRoomFrontImageUrl = new URL(
  "../../../OneDrive_2026-03-23/Community page/visual assets for community page/curate room front.png",
  import.meta.url
).href;
const curateRoomBackImageUrl = new URL(
  "../../../OneDrive_2026-03-23/Community page/visual assets for community page/curate room back.png",
  import.meta.url
).href;

const tileDetails = [
  {
    title: "Join an Open Community Room",
    frontImageUrl: joinRoomFrontImageUrl,
    backImageUrl: joinRoomBackImageUrl,
  },
  {
    title: "Create a Curated Room",
    frontImageUrl: curateRoomFrontImageUrl,
    backImageUrl: curateRoomBackImageUrl,
  },
] as const;

export default function Community() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactMode, setContactMode] = useState<ContactFormMode>("contact");
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
        .flip-tile {
          perspective: 1600px;
        }
        .flip-tile-inner {
          position: relative;
          transform-style: preserve-3d;
          transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .flip-tile:hover .flip-tile-inner,
        .flip-tile:focus-visible .flip-tile-inner {
          transform: rotateY(180deg);
        }
        .flip-face {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .flip-face-back {
          transform: rotateY(180deg);
        }
      `}</style>

      <section className="relative overflow-hidden bg-[#231F20] text-white">
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
                onClick={() => {
                  setContactMode("contact");
                  setIsContactOpen(true);
                }}
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

          <div className="mx-auto flex max-w-3xl flex-col items-center py-16 text-center sm:py-20">
            <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl lg:text-[3.9rem]">
              Community <span className="text-[#D5C7E2]">Unscripted Rooms</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/74 sm:text-lg">
              If the podcast is where curiosity is shared, this is where it’s practiced.
            </p>
            <div className="mt-8">
              <button
                type="button"
                onClick={() => {
                  setContactMode("community-guest");
                  setIsContactOpen(true);
                }}
                className="inline-flex items-center justify-center bg-[#7A3168] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#3B2C57]"
              >
                Find a Community Room
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="reveal-section relative overflow-hidden bg-[#ECF1F4]">
        <div className="absolute inset-0">
          <img src={communityFrontImageUrl} alt="Community room overview" className="h-full w-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#ECF1F4_0%,rgba(236,241,244,0.96)_34%,rgba(236,241,244,0.72)_56%,rgba(236,241,244,0.15)_100%)]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:min-h-[520px] lg:py-24">
          <div className="max-w-2xl lg:flex lg:min-h-[360px] lg:flex-col lg:justify-center">
            <h2 className="text-4xl font-semibold leading-tight sm:text-5xl">
              A live conversation
              <br />
              designed to go <span className="text-[#7A3168]">deeper.</span>
            </h2>
            <div className="mt-8 space-y-5 text-base leading-relaxed text-[#5B6064]">
              <p>
                Community Unscripted Rooms are live, hosted conversations designed to go deeper than small talk.
              </p>
              <p>
                In each room, up to twelve guests gather for a three-hour conversation guided by a sequence of nine
                open-ended questions and a simple set of conversation principles. The structure gives the conversation
                direction, while leaving space for ideas to unfold naturally.
              </p>
            </div>
            <div className="mt-8">
              <button
                type="button"
                onClick={() => {
                  setContactMode("community-guest");
                  setIsContactOpen(true);
                }}
                className="inline-flex items-center justify-center border border-[#7A3168] bg-white px-8 py-4 text-sm font-semibold text-[#7A3168] transition hover:bg-[#D5C7E2]/20"
              >
                Find a Community Room
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="reveal-section relative overflow-hidden bg-[#231F20] text-white">
        <div className="absolute inset-0">
          <img src={communityBackImageUrl} alt="Inside a community room" className="h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(35,31,32,0.12)_0%,rgba(35,31,32,0.2)_35%,rgba(35,31,32,0.74)_62%,rgba(0,0,0,0.94)_100%)]" />
        </div>
        <div className="relative mx-auto grid min-h-[500px] max-w-7xl lg:min-h-[560px] lg:grid-cols-[1fr_.95fr]">
          <div />
          <div className="flex flex-col justify-center px-8 py-12 sm:px-10 sm:py-14 lg:px-12 lg:py-16">
            <h2 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Inside a
              <br />
              <span className="text-[#D5C7E2]">Community Room</span>
            </h2>
            <div className="mt-8 space-y-5 text-base leading-relaxed text-white/78">
              <p>
                Guests offer their time and perspective, and in return gain access to the thinking and experiences of
                others. Sometimes the people in the room already know each other. Sometimes they are meeting for the
                first time. Either way, the opportunity is the same: to explore ideas together with honesty, curiosity,
                and attention.
              </p>
              <p>
                Some groups move quickly through the questions. Others stay with a single idea much longer.
              </p>
              <p>The goal isn’t to reach the final question. It’s to create the best conversation the room can have.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="reveal-section bg-[#ECF1F4] px-6 py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-[0.04em] text-[#231F20] sm:text-5xl lg:text-6xl">
              TWO WAYS TO ENTER
              <br />
              <span className="text-[#7A3168]">THE ROOM</span>
            </h2>
            <button
              type="button"
              onClick={() => {
                setContactMode("community-guest");
                setIsContactOpen(true);
              }}
              className="mt-4 text-2xl font-medium text-[#7A3168] underline-offset-4 transition hover:underline"
            >
              Reserve a Seat
            </button>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
            {tileDetails.map((tile) => (
              <CommunityFlipTile
                key={tile.title}
                title={tile.title}
                frontImageUrl={tile.frontImageUrl}
                backImageUrl={tile.backImageUrl}
              />
            ))}
          </div>
        </div>
      </section>

      <ContactUsModal
        isOpen={isContactOpen}
        initialMode={contactMode}
        onClose={() => {
          setIsContactOpen(false);
          setContactMode("contact");
        }}
      />
    </div>
  );
}

function CommunityFlipTile({
  title,
  frontImageUrl,
  backImageUrl,
}: {
  title: string;
  frontImageUrl: string;
  backImageUrl: string;
}) {
  return (
    <div className="flip-tile block w-full text-left" aria-label={title}>
      <div className="flip-tile-inner aspect-square">
        <div className="flip-face absolute inset-0 overflow-hidden border border-[rgba(59,44,87,0.12)] bg-white shadow-sm">
          <img src={frontImageUrl} alt={`${title} card front`} className="h-full w-full object-cover" />
        </div>

        <div className="flip-face flip-face-back absolute inset-0 overflow-hidden border border-[rgba(59,44,87,0.12)] bg-[#D5C7E2] shadow-sm">
          <img src={backImageUrl} alt={`${title} card back`} className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  );
}
