import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearAuth, isAuthed } from "../lib/auth";
import API_BASE from "../lib/apiBase";

const logoImageUrl = new URL(
  "../../OneDrive_1_12-19-2025/UR LOGO white 1.png",
  import.meta.url
).href;

const PAGE_SIZE = 8;
const COIN_COST = 3;
const EMAIL_STORAGE_KEY = "viewer_email";

export const EPISODES = [
  {
    id: "e-001",
    vimeoId: "",
    title: "When Silence Becomes Signal",
    guest: "Arielle Santos",
    length: "54:12",
    published: "Jan 12, 2026",
    summary:
      "A slow-burn conversation about noticing the moment curiosity becomes clarity. We explore the power of pauses, the fear of being misunderstood, and the kind of questions that reshape a room.",
    tags: ["Presence", "Curiosity", "Team Dynamics"],
    image:
      "https://images.unsplash.com/photo-1452723312111-3a7d0db0e024?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "e-002",
    vimeoId: "",
    title: "Building Trust Without a Script",
    guest: "Malik Rivers",
    length: "47:33",
    published: "Jan 26, 2026",
    summary:
      "What does it mean to be consistent without being performative? Malik maps out the rituals he uses to create safety in fast-moving teams.",
    tags: ["Trust", "Rituals", "Leadership"],
    image:
      "https://images.unsplash.com/photo-1487537708572-3c850b5e856e?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "e-003",
    vimeoId: "",
    title: "The Shape of a Hard Question",
    guest: "Dr. Priya Nayar",
    length: "58:40",
    published: "Feb 2, 2026",
    summary:
      "We hold one question for nearly an hour. The result feels like weather: gentle, intense, and unexpectedly revealing.",
    tags: ["Deep Inquiry", "Listening", "Psychology"],
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "e-004",
    vimeoId: "",
    title: "Your Team Can Hear You Breathe",
    guest: "Omar Fields",
    length: "39:08",
    published: "Feb 9, 2026",
    summary:
      "Omar explains why the small signals of nervousness or steadiness ripple through teams faster than any deck.",
    tags: ["Signals", "Leadership", "Performance"],
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "e-005",
    vimeoId: "",
    title: "What We Keep When We Let Go",
    guest: "Leah Park",
    length: "50:26",
    published: "Feb 16, 2026",
    summary:
      "An episode about shedding assumptions to find a more honest voice. Leah shares practices for unlearning with grace.",
    tags: ["Unlearning", "Voice", "Growth"],
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "e-006",
    vimeoId: "",
    title: "The Hour That Changed the Strategy",
    guest: "Vince Okoro",
    length: "44:05",
    published: "Feb 23, 2026",
    summary:
      "A strategy retreat turns into a dialogue about care, and somehow the roadmap gets sharper.",
    tags: ["Strategy", "Care", "Decision-Making"],
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "e-007",
    vimeoId: "",
    title: "The Courage to Ask Again",
    guest: "Nadia Khalil",
    length: "52:17",
    published: "Mar 1, 2026",
    summary:
      "We trace the difference between curiosity and persistence. Nadia shows how to reopen a question without reopening wounds.",
    tags: ["Courage", "Curiosity", "Conflict"],
    image:
      "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "e-008",
    vimeoId: "",
    title: "What Collaboration Actually Feels Like",
    guest: "Evan Choi",
    length: "46:51",
    published: "Mar 4, 2026",
    summary:
      "A tactile conversation about pace, friction, and the moments when a team syncs.",
    tags: ["Collaboration", "Flow", "Teams"],
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "e-009",
    vimeoId: "",
    title: "Listening for the Missing Word",
    guest: "Sierra Bae",
    length: "41:12",
    published: "Dec 18, 2025",
    summary:
      "Sierra reveals how she facilitates talks that surface the unspoken and help teams say the thing they have been circling.",
    tags: ["Facilitation", "Language", "Teams"],
    image:
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "e-010",
    vimeoId: "",
    title: "The Geography of a Meeting",
    guest: "Jonas Patel",
    length: "49:10",
    published: "Dec 8, 2025",
    summary:
      "We map the terrain of a meeting like a landscape, from the ridge of ideas to the river of emotion.",
    tags: ["Meetings", "Empathy", "Systems"],
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "e-011",
    vimeoId: "",
    title: "A Question That Refuses to Be Efficient",
    guest: "Mila Ortega",
    length: "53:02",
    published: "Nov 25, 2025",
    summary:
      "Mila explores why the best conversations are the ones that refuse to hurry.",
    tags: ["Patience", "Curiosity", "Culture"],
    image:
      "https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "e-012",
    vimeoId: "",
    title: "Your Nervous System Has a Seat",
    guest: "Theo Grant",
    length: "37:40",
    published: "Nov 12, 2025",
    summary:
      "Theo discusses how body awareness can shape group confidence and whether calm is teachable.",
    tags: ["Nervous System", "Calm", "Leadership"],
    image:
      "https://images.unsplash.com/photo-1473177104440-ffee2f376098?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "e-013",
    vimeoId: "",
    title: "The Audit of Real Questions",
    guest: "Anika DuBois",
    length: "48:25",
    published: "Oct 28, 2025",
    summary:
      "Anika reveals her method for auditing questions to see which ones are alive and which are performative.",
    tags: ["Inquiry", "Authenticity", "Culture"],
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "e-014",
    vimeoId: "",
    title: "A Pause That Changes Outcomes",
    guest: "Gabriel Hunt",
    length: "55:48",
    published: "Oct 7, 2025",
    summary:
      "Gabriel shares the moment he stopped a meeting midstream and how it reset the direction.",
    tags: ["Pause", "Leadership", "Strategy"],
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "e-015",
    vimeoId: "",
    title: "What You Can Hear in the Room Tone",
    guest: "Lina Hart",
    length: "43:19",
    published: "Sep 20, 2025",
    summary:
      "Lina teaches us how to listen for the ambient signals in a room that tell the truth before anyone speaks.",
    tags: ["Tone", "Presence", "Signals"],
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "e-016",
    vimeoId: "",
    title: "Building the Question Together",
    guest: "Rowan Diaz",
    length: "46:02",
    published: "Sep 2, 2025",
    summary:
      "A roundtable on crafting shared questions that become anchors for a team.",
    tags: ["Co-creation", "Teams", "Alignment"],
    image:
      "https://images.unsplash.com/photo-1485217988980-11786ced9454?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "e-017",
    vimeoId: "",
    title: "The Tempo of Courage",
    guest: "Nisha Kapoor",
    length: "50:31",
    published: "Aug 19, 2025",
    summary:
      "Courage has a tempo. Nisha explains how to find it and not outrun the group.",
    tags: ["Courage", "Tempo", "Leadership"],
    image:
      "https://images.unsplash.com/photo-1483058712412-4245e9b90334?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "e-018",
    vimeoId: "",
    title: "The Question After the Applause",
    guest: "Ezra Reed",
    length: "42:12",
    published: "Aug 5, 2025",
    summary:
      "Ezra talks about what happens when the energy drops and the real conversation begins.",
    tags: ["Aftercare", "Energy", "Reflection"],
    image:
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "e-019",
    vimeoId: "",
    title: "How to Invite the Quietest Voice",
    guest: "Hana Minh",
    length: "45:56",
    published: "Jul 22, 2025",
    summary:
      "A gentle guide to inviting quieter voices without forcing performance.",
    tags: ["Inclusion", "Listening", "Teamwork"],
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "e-020",
    vimeoId: "",
    title: "The Story a Room Wants to Tell",
    guest: "Cole Lyons",
    length: "51:44",
    published: "Jul 3, 2025",
    summary:
      "Cole explores the narratives that surface when you stop trying to lead the conclusion.",
    tags: ["Narrative", "Facilitation", "Culture"],
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "e-021",
    vimeoId: "",
    title: "When the Question Needs to Breathe",
    guest: "Zara Kim",
    length: "38:22",
    published: "Jun 14, 2025",
    summary:
      "Zara shares the micro-rituals she uses to help teams slow their tempo without losing momentum.",
    tags: ["Ritual", "Tempo", "Teams"],
    image:
      "https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "e-022",
    vimeoId: "",
    title: "A Conversation That Recalibrated",
    guest: "Marshall Vega",
    length: "57:04",
    published: "May 28, 2025",
    summary:
      "Marshall breaks down a pivotal conversation that led to a calmer, clearer strategy.",
    tags: ["Strategy", "Clarity", "Leadership"],
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "e-023",
    vimeoId: "",
    title: "The Kindness of a Tight Question",
    guest: "Yasmin Cole",
    length: "40:09",
    published: "May 12, 2025",
    summary:
      "Yasmin explains why shorter questions can feel more generous, not less.",
    tags: ["Kindness", "Questions", "Empathy"],
    image:
      "https://images.unsplash.com/photo-1452723312111-3a7d0db0e024?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "e-024",
    vimeoId: "",
    title: "Clarity Without Control",
    guest: "Rafael Quinn",
    length: "49:57",
    published: "Apr 25, 2025",
    summary:
      "Rafael on leading without oversteering and how to create clarity without control.",
    tags: ["Clarity", "Autonomy", "Leadership"],
    image:
      "https://images.unsplash.com/photo-1487537708572-3c850b5e856e?q=80&w=1400&auto=format&fit=crop",
  },
];

type Episode = {
  id: string;
  vimeoId?: string;
  title: string;
  guest?: string;
  length?: string;
  published?: string | null;
  summary: string;
  tags: string[];
  image?: string | null;
  duration?: number;
  coinCost?: number;
};

const formatDuration = (seconds?: number) => {
  if (!seconds || !Number.isFinite(seconds)) return "";
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
};

export default function Episodes() {
  const authed = isAuthed();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingTimer = useRef<number | null>(null);
  const transitionTimer = useRef<number | null>(null);
  const navigate = useNavigate();
  const [logoDance, setLogoDance] = useState(false);
  const [coinBalance, setCoinBalance] = useState(0);
  const [coinNotice, setCoinNotice] = useState("");
  const [coinPulse, setCoinPulse] = useState(false);
  const [hasBalance, setHasBalance] = useState(false);
  const [email, setEmail] = useState(() => localStorage.getItem(EMAIL_STORAGE_KEY) || "");
  const [emailDraft, setEmailDraft] = useState("");
  const [showEmailGate, setShowEmailGate] = useState(() =>
    !isAuthed() && !localStorage.getItem(EMAIL_STORAGE_KEY)
  );
  const [showRedeemGate, setShowRedeemGate] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    if (!email && localStorage.getItem(EMAIL_STORAGE_KEY)) {
      setEmail(localStorage.getItem(EMAIL_STORAGE_KEY) || "");
    }
    const loadBalance = async () => {
      const token = localStorage.getItem("access_token");
      const storedEmail = localStorage.getItem(EMAIL_STORAGE_KEY);
      if (!token && !storedEmail) return;
      try {
        const emailParam = storedEmail ? `?email=${encodeURIComponent(storedEmail)}` : "";
        const res = await fetch(`${API_BASE}/api/coins/balance${emailParam}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) return;
        const data = await res.json();
        if (typeof data?.balance === "number") {
          setCoinBalance(data.balance);
          setHasBalance(true);
        }
      } catch (error) {
        console.error("Coin balance load failed", error);
      }
    };
    loadBalance();
    window.addEventListener("focus", loadBalance);
    const interval = window.setInterval(() => {
      if (!hasBalance) loadBalance();
    }, 5000);
    return () => {
      window.removeEventListener("focus", loadBalance);
      window.clearInterval(interval);
    };
  }, [hasBalance]);

  useEffect(() => {
    if (hasBalance && coinBalance === 0 && !showEmailGate) {
      setShowRedeemGate(true);
      return;
    }
    if (!hasBalance || coinBalance > 0) {
      setShowRedeemGate(false);
    }
  }, [coinBalance, showEmailGate, hasBalance]);

  const visibleEpisodes = useMemo(() => episodes.slice(0, visibleCount), [episodes, visibleCount]);

  useEffect(() => {
    let active = true;
    const loadEpisodes = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/episodes?tags=1`);
        if (!res.ok) {
          setHasLoaded(true);
          return;
        }
        const data = await res.json();
        const items: Episode[] = Array.isArray(data?.items) ? data.items : [];
        if (!active) return;
        const normalized = items.map((item) => ({
          ...item,
          length: item.duration ? formatDuration(item.duration) : item.length,
          published: item.published ? new Date(item.published).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }) : item.published,
          image: item.image || "",
          tags: item.tags?.length ? item.tags : [],
        }));
        setEpisodes(normalized);
        setHasLoaded(true);
        setVisibleCount(PAGE_SIZE);
      } catch (error) {
        console.error("Episode fetch failed", error);
        setHasLoaded(true);
      }
    };
    loadEpisodes();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting || isLoading) return;
        if (visibleCount >= episodes.length) return;

        setIsLoading(true);
        loadingTimer.current = window.setTimeout(() => {
          setVisibleCount((count) => Math.min(count + PAGE_SIZE, episodes.length));
          setIsLoading(false);
        }, 800);
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, isLoading, episodes.length]);

  useEffect(() => {
    return () => {
      if (loadingTimer.current) {
        window.clearTimeout(loadingTimer.current);
      }
      if (transitionTimer.current) {
        window.clearTimeout(transitionTimer.current);
      }
    };
  }, []);

  const handleEpisodeSelect = (episodeId: string) => {
    const storedEmail = localStorage.getItem(EMAIL_STORAGE_KEY);
    if (!authed && !storedEmail) {
      setShowEmailGate(true);
      return;
    }
    const token = localStorage.getItem("access_token");
    const runSpend = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/coins/spend`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            episodeId,
            amount: COIN_COST,
            eventId: `spend-${episodeId}-${Date.now()}`,
            ...(storedEmail ? { email: storedEmail } : {}),
          }),
        });
        if (res.status === 402) {
          const data = await res.json();
          if (typeof data?.balance === "number") setCoinBalance(data.balance);
          setCoinNotice("Not enough coins to watch this episode.");
          setCoinPulse(true);
          window.setTimeout(() => setCoinPulse(false), 600);
          window.setTimeout(() => setCoinNotice(""), 2500);
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        if (typeof data?.balance === "number") {
          setCoinBalance(data.balance);
        }
        setCoinNotice("");
        if (isTransitioning) return;
        setIsTransitioning(true);
        transitionTimer.current = window.setTimeout(() => {
          navigate(`/player?episode=${encodeURIComponent(episodeId)}`);
        }, 900);
      } catch (error) {
        console.error("Coin spend failed", error);
      }
    };
    runSpend();
  };

  const handleEmailSubmit = () => {
    const trimmed = emailDraft.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) return;
    localStorage.setItem(EMAIL_STORAGE_KEY, trimmed);
    setEmail(trimmed);
    setEmailDraft("");
    setShowEmailGate(false);
  };

  const handleRedeem = async () => {
    if (isRedeeming) return;
    const token = localStorage.getItem("access_token");
    const storedEmail = localStorage.getItem(EMAIL_STORAGE_KEY);
    if (!token && !storedEmail) {
      setShowEmailGate(true);
      return;
    }
    setIsRedeeming(true);
    try {
      const res = await fetch(`${API_BASE}/api/coins/reward`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          amount: 3,
          milestone: "redeem",
          episodeId: "redeem",
          eventId: `redeem-${Date.now()}`,
          ...(storedEmail ? { email: storedEmail } : {}),
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (typeof data?.balance === "number") {
        setCoinBalance(data.balance);
      } else {
        setCoinBalance((prev) => prev + 3);
      }
      setShowRedeemGate(false);
    } catch (error) {
      console.error("Redeem failed", error);
    } finally {
      setIsRedeeming(false);
    }
  };

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
    <div className="relative min-h-screen bg-[#ECF1F4] text-[#231F20]">
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
          0% { transform: rotate(0deg) translateY(0); }
          25% { transform: rotate(-8deg) translateY(-2px); }
          50% { transform: rotate(8deg) translateY(2px); }
          75% { transform: rotate(-4deg) translateY(-1px); }
          100% { transform: rotate(0deg) translateY(0); }
        }
        .logo-dance {
          animation: logoDance 0.8s ease-in-out;
        }
        .episode-card {
          transition: transform 240ms ease, border-color 240ms ease, box-shadow 240ms ease;
        }
        .episode-card:hover {
          transform: translateY(-6px);
          border-color: rgba(59, 44, 87, 0.28);
          box-shadow: 0 18px 45px rgba(59, 44, 87, 0.14);
        }
        .transition-overlay {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.92), rgba(236,241,244,0.98) 45%, rgba(213,199,226,0.95));
          display: grid;
          place-items: center;
          z-index: 50;
          opacity: 0;
          pointer-events: none;
          transition: opacity 520ms ease;
        }
        .transition-overlay.active {
          opacity: 1;
          pointer-events: auto;
        }
        @keyframes coinPulse {
          0% { transform: scale(1); }
          30% { transform: scale(1.08); }
          60% { transform: scale(0.96); }
          100% { transform: scale(1); }
        }
        .transition-orb {
          width: 140px;
          height: 140px;
          border-radius: 999px;
          background: radial-gradient(circle at 35% 35%, #d5c7e2, #9bb0c1 50%, rgba(59, 44, 87, 0.12));
          box-shadow: 0 0 30px rgba(122, 49, 104, 0.24), 0 0 90px rgba(59, 44, 87, 0.18);
          animation: orbPulse 1.6s ease-in-out infinite;
        }
        @keyframes orbPulse {
          0%, 100% { transform: scale(0.92); opacity: 0.75; }
          50% { transform: scale(1.06); opacity: 1; }
        }
        .holo-line {
          background: linear-gradient(90deg, transparent, rgba(122, 49, 104, 0.45), transparent);
        }
        .loading-shimmer {
          background: linear-gradient(90deg, rgba(213, 199, 226, 0), rgba(122, 49, 104, 0.35), rgba(213, 199, 226, 0));
          animation: shimmer 1.3s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-40%); }
          100% { transform: translateX(40%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .loading-shimmer,
          .episode-card,
          .episode-card {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className={`transition-overlay ${isTransitioning ? "active" : ""}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="transition-orb" />
          <p className="text-xs uppercase tracking-[0.4em] text-black/60">Opening Player</p>
        </div>
      </div>

      {showEmailGate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-md rounded-3xl border border-[var(--usr-line)] bg-[var(--usr-white)] p-6 shadow-xl">
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--usr-muted)]">Enter Email</p>
            <h2 className="mt-3 text-2xl font-semibold text-black">Continue to Episodes</h2>
            <p className="mt-2 text-sm text-[var(--usr-muted)]">
              Enter your email to track your coins and episode progress.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="email"
                value={emailDraft}
                onChange={(event) => setEmailDraft(event.target.value)}
                placeholder="you@email.com"
                className="w-full rounded-full border border-[var(--usr-line)] bg-[var(--usr-cloud)] px-4 py-2 text-sm text-[var(--usr-ink)]"
              />
              <button
                type="button"
                onClick={handleEmailSubmit}
                className="rounded-full border border-[var(--usr-primary)] bg-[var(--usr-primary)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showRedeemGate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-md rounded-3xl border border-[var(--usr-line)] bg-[var(--usr-white)] p-6 shadow-xl">
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--usr-muted)]">Out of Coins</p>
            <h2 className="mt-3 text-2xl font-semibold text-black">Oh no, you’re out of coins.</h2>
            <p className="mt-2 text-sm text-[var(--usr-muted)]">
              Redeem 3 coins now to keep exploring the episode library.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={handleRedeem}
                className="rounded-full border border-[var(--usr-primary)] bg-[var(--usr-primary)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white"
                disabled={isRedeeming}
              >
                {isRedeeming ? "Redeeming..." : "Redeem 3 Coins"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="relative overflow-hidden border-b border-[var(--usr-line)] bg-[var(--usr-white)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.72),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(213,199,226,0.42),_transparent_55%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
          <div className="flex items-center justify-between">
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
                className={`h-10 w-auto drop-shadow-[0_0_12px_rgba(255,255,255,0.65)] transition duration-300 group-hover:drop-shadow-[0_0_16px_rgba(255,255,255,0.85)] sm:h-12 ${
                  logoDance ? "logo-dance" : ""
                }`}
              />
            </Link>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 rounded-full border border-[var(--usr-line)] bg-[var(--usr-cloud)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--usr-muted)] ${coinPulse ? "animate-[coinPulse_0.6s_ease]" : ""}`}>
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--usr-secondary)]" aria-hidden="true">
                  <path
                    d="M12 3c-4.4 0-8 1.34-8 3v12c0 1.66 3.6 3 8 3s8-1.34 8-3V6c0-1.66-3.6-3-8-3zm0 2c3.87 0 6 .97 6 1s-2.13 1-6 1-6-.97-6-1 2.13-1 6-1zm0 6c3.87 0 6 .97 6 1s-2.13 1-6 1-6-.97-6-1 2.13-1 6-1zm0 6c3.87 0 6 .97 6 1s-2.13 1-6 1-6-.97-6-1 2.13-1 6-1z"
                    fill="currentColor"
                  />
                </svg>
                {coinBalance}
              </div>
              {authed ? (
                <button
                  type="button"
                  onClick={handleAccountClick}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--usr-line)] bg-[var(--usr-cloud)] text-[var(--usr-ink)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--usr-line)] bg-[var(--usr-cloud)] text-[var(--usr-ink)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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
          <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.4em] text-[var(--usr-muted)]">
            <span className="holo-line h-[1px] w-16" />
            Unscripted Room Episodes
          </div>
          {coinNotice ? (
            <div className="rounded-full border border-[var(--usr-line)] bg-[var(--usr-white)] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--usr-muted)]">
              {coinNotice}
            </div>
          ) : null}
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-balance text-4xl font-semibold text-black md:text-5xl">
                The Episode Library
              </h1>
              <p className="mt-4 text-base text-[var(--usr-muted)] md:text-lg">
                Scroll to keep moving. Each page expands into another layer of the conversation. Tap any episode to
                open the player and enter the room.
              </p>
            </div>
            <div className="w-full max-w-sm rounded-2xl border border-[var(--usr-line)] bg-[rgba(255,255,255,0.75)] px-5 py-4 text-sm text-[var(--usr-muted)] shadow-sm">
              <p className="text-xs uppercase tracking-[0.32em] text-[var(--usr-primary)]">Library</p>
              <p className="mt-2 text-base font-semibold text-[var(--usr-ink)]">{episodes.length} episodes · 3 coins each</p>
              <p className="text-xs text-[var(--usr-muted)]">Scroll down to load more.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-[var(--usr-muted)]">
            <span>Episode Feed</span>
            <span>{visibleEpisodes.length} / {episodes.length}</span>
          </div>
        <div className="flex flex-col gap-6">
          {hasLoaded && episodes.length === 0 ? (
            <div className="rounded-3xl border border-[var(--usr-line)] bg-[var(--usr-white)] px-6 py-10 text-center text-sm text-[var(--usr-muted)]">
              No Vimeo episodes found. Double-check that your Vimeo account has uploaded videos and that the API
              credentials are valid.
            </div>
          ) : null}
          {visibleEpisodes.map((episode) => (
            <button
              key={episode.id}
              type="button"
              onClick={() => handleEpisodeSelect(episode.id)}
              className="episode-card group flex w-full flex-col gap-5 rounded-3xl border border-[var(--usr-line)] bg-[var(--usr-white)] p-5 text-left shadow-sm md:flex-row md:items-center md:gap-8 md:px-7 md:py-6"
            >
              <div className="relative w-full overflow-hidden rounded-2xl bg-[var(--usr-cloud)] md:w-[260px]">
                {episode.image ? (
                  <img
                    src={episode.image}
                    alt={episode.title}
                    className="h-44 w-full object-cover md:h-40"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-44 w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-[var(--usr-muted)] md:h-40">
                    Vimeo
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-[rgba(255,255,255,0.92)] px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-[var(--usr-muted)]">
                  Episode
                </div>
              </div>
              <div className="flex w-full flex-1 flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-black">{episode.title}</h3>
                    <p className="mt-1 text-sm text-[var(--usr-muted)]">with {episode.guest}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--usr-muted)]">
                    <span>{episode.length}</span>
                    <span>•</span>
                    <span>{episode.published}</span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-[var(--usr-muted)]">{episode.summary}</p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {episode.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[var(--usr-line)] bg-[var(--usr-cloud)] px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-[var(--usr-muted)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-[var(--usr-line)] bg-[var(--usr-cloud)] px-3 py-1 text-xs font-semibold text-[var(--usr-ink)]">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--usr-secondary)]" aria-hidden="true">
                      <path
                        d="M12 3c-4.4 0-8 1.34-8 3v12c0 1.66 3.6 3 8 3s8-1.34 8-3V6c0-1.66-3.6-3-8-3zm0 2c3.87 0 6 .97 6 1s-2.13 1-6 1-6-.97-6-1 2.13-1 6-1zm0 6c3.87 0 6 .97 6 1s-2.13 1-6 1-6-.97-6-1 2.13-1 6-1zm0 6c3.87 0 6 .97 6 1s-2.13 1-6 1-6-.97-6-1 2.13-1 6-1z"
                        fill="currentColor"
                      />
                    </svg>
                    {(episode.coinCost ?? 3)} coins
                  </div>
                </div>
                <div className="text-xs uppercase tracking-[0.3em] text-[var(--usr-muted)]">
                  Tap to open player →
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="relative mt-2 flex items-center justify-center">
          <div ref={sentinelRef} className="h-10 w-full" />
          {isLoading ? (
            <div className="absolute flex w-full items-center justify-center">
              <div className="relative flex h-9 w-40 items-center justify-center overflow-hidden rounded-full border border-[var(--usr-line)] bg-[var(--usr-cloud)]">
                <div className="absolute inset-0 loading-shimmer" />
                <span className="relative text-xs uppercase tracking-[0.35em] text-[var(--usr-muted)]">Loading</span>
              </div>
            </div>
          ) : null}
            {visibleCount >= episodes.length ? (
              <p className="absolute text-xs uppercase tracking-[0.3em] text-[var(--usr-muted)]">End of the library</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
