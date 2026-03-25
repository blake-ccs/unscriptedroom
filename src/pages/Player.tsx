import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { EPISODES } from "./Episodes";
import API_BASE from "../lib/apiBase";
import VimeoPlayer from "@vimeo/player";
import { clearAuth, isAuthed } from "../lib/auth";

const logoImageUrl = new URL(
  "../../OneDrive_1_12-19-2025/UR LOGO white 1.png",
  import.meta.url
).href;

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

export default function Player() {
  const showTalkToY = false;
  const [params] = useSearchParams();
  const episodeId = params.get("episode") ?? EPISODES[0].id;
  const navigate = useNavigate();
  const authed = isAuthed();
  const [logoDance, setLogoDance] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [episodeData, setEpisodeData] = useState(EPISODES[0]);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [milestones, setMilestones] = useState({
    oneThird: false,
    twoThird: false,
    completed: false,
  });
  const [coinBalance, setCoinBalance] = useState(0);
  const [hasBalance, setHasBalance] = useState(false);
  const [rewardPulse, setRewardPulse] = useState({
    oneThird: 0,
    twoThird: 0,
    completed: 0,
  });
  const [floatingRewards, setFloatingRewards] = useState<Array<{ id: number; amount: number }>>([]);
  const [emailDraft, setEmailDraft] = useState("");
  const [showEmailGate, setShowEmailGate] = useState(() =>
    !isAuthed() && !localStorage.getItem("viewer_email")
  );
  const playerMountRef = useRef<HTMLDivElement | null>(null);
  const vimeoPlayerRef = useRef<VimeoPlayer | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const lastAllowedSecondsRef = useRef(0);
  const lastReportedSecondsRef = useRef<number | null>(null);
  const lastProgressSentAtRef = useRef(0);
  const sessionIdRef = useRef<string | null>(null);
  const rewardIdRef = useRef(0);
  const rewardedRef = useRef({ oneThird: false, twoThird: false, completed: false });

  const episode = useMemo(
    () => episodeData ?? EPISODES[0],
    [episodeData]
  );

  const vimeoId = useMemo(() => {
    const candidate = episode?.vimeoId || episode?.id;
    return candidate && /^\d+$/.test(candidate) ? candidate : null;
  }, [episode?.id, episode?.vimeoId]);

  useEffect(() => {
    let active = true;
    const loadEpisode = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/episodes/${encodeURIComponent(episodeId)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!active || !data?.item) return;
        setEpisodeData({
          ...data.item,
          length: data.item.duration ? formatDuration(data.item.duration) : data.item.length,
          tags: data.item.tags?.length ? data.item.tags : [],
        });
      } catch (error) {
        console.error("Episode fetch failed", error);
      }
    };
    loadEpisode();
    return () => {
      active = false;
    };
  }, [episodeId]);

  useEffect(() => {
    const loadBalance = async () => {
      const token = localStorage.getItem("access_token");
      const storedEmail = localStorage.getItem("viewer_email");
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
    rewardedRef.current = { oneThird: false, twoThird: false, completed: false };
  }, [episodeId]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedEmail = localStorage.getItem("viewer_email");
    if (!token && !storedEmail) return;
    const reward = async (milestone, amount) => {
      const rewardStorageKey = `coin_reward_${episodeId}_${milestone}`;
      if (rewardedRef.current[milestone]) return;
      if (localStorage.getItem(rewardStorageKey)) {
        rewardedRef.current[milestone] = true;
        return;
      }
      rewardedRef.current[milestone] = true;
      localStorage.setItem(rewardStorageKey, "1");
      const id = rewardIdRef.current++;
      setFloatingRewards((prev) => [...prev, { id, amount }]);
      window.setTimeout(() => {
        setFloatingRewards((prev) => prev.filter((item) => item.id !== id));
      }, 1400);
      setCoinBalance((prev) => prev + amount);
      try {
        const res = await fetch(`${API_BASE}/api/coins/reward`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            episodeId,
            amount,
            milestone,
            eventId: `reward-${episodeId}-${milestone}`,
            ...(storedEmail ? { email: storedEmail } : {}),
          }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (typeof data?.balance === "number") {
          setCoinBalance(data.balance);
        }
      } catch (error) {
        localStorage.removeItem(rewardStorageKey);
        rewardedRef.current[milestone] = false;
        console.error("Coin reward failed", error);
      }
    };
    if (milestones.oneThird) reward("oneThird", 1);
    if (milestones.twoThird) reward("twoThird", 3);
    if (milestones.completed) reward("completed", 5);
  }, [milestones, episodeId]);

  useEffect(() => {
    if (!vimeoId) return;
    let active = true;
    const startSession = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_BASE}/api/episodes/${encodeURIComponent(episodeId)}/session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({}),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (active && data?.sessionId) {
          sessionIdRef.current = data.sessionId;
        }
      } catch (error) {
        console.error("Session start failed", error);
      }
    };
    startSession();
    return () => {
      active = false;
    };
  }, [episodeId, vimeoId]);

  useEffect(() => {
    const mount = playerMountRef.current;
    if (!mount || !vimeoId) return;
    if (vimeoPlayerRef.current) {
      vimeoPlayerRef.current.destroy().catch(() => undefined);
    }
    mount.innerHTML = "";
    const player = new VimeoPlayer(mount, {
      id: Number(vimeoId),
      responsive: true,
      controls: true,
      title: false,
      byline: false,
      portrait: false,
      autoplay: false,
    });
    vimeoPlayerRef.current = player;

    const postProgress = async (event, data) => {
      if (!sessionIdRef.current) return;
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_BASE}/api/episodes/${encodeURIComponent(episodeId)}/progress`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            event,
            seconds: data?.seconds,
            percent: data?.percent,
            duration: data?.duration,
            clientTimestamp: Date.now(),
          }),
        });
        if (res.ok) {
          const payload = await res.json();
          if (payload?.maxPercent !== undefined) {
            setMilestones((prev) => {
              const next = {
                oneThird: prev.oneThird || payload.maxPercent >= 0.333,
                twoThird: prev.twoThird || payload.maxPercent >= 0.666,
                completed: prev.completed || payload.maxPercent >= 0.98,
              };
              if (!prev.oneThird && next.oneThird) {
                setRewardPulse((p) => ({ ...p, oneThird: p.oneThird + 1 }));
              }
              if (!prev.twoThird && next.twoThird) {
                setRewardPulse((p) => ({ ...p, twoThird: p.twoThird + 1 }));
              }
              if (!prev.completed && next.completed) {
                setRewardPulse((p) => ({ ...p, completed: p.completed + 1 }));
              }
              return next;
            });
          }
        }
      } catch (error) {
        console.error("Progress update failed", error);
      }
    };

    const handleTimeUpdate = (data) => {
      if (typeof data?.seconds === "number") {
        const current = data.seconds;
        const previous = lastReportedSecondsRef.current;
        if (previous !== null) {
          const delta = current - previous;
          if (delta > 2.5) {
            // Forward jump detected: clamp back to last allowed point.
            vimeoPlayerRef.current?.setCurrentTime(lastAllowedSecondsRef.current).catch(() => undefined);
          } else if (delta > 0) {
            lastAllowedSecondsRef.current = Math.max(lastAllowedSecondsRef.current, current);
          }
        } else {
          lastAllowedSecondsRef.current = Math.max(lastAllowedSecondsRef.current, current);
        }
        lastReportedSecondsRef.current = current;
        setPlaybackSeconds(data.seconds);
      }
      if (typeof data?.duration === "number") {
        setPlaybackDuration(data.duration);
      }
      if (typeof data?.percent === "number") {
        setMilestones((prev) => {
          const next = {
            oneThird: prev.oneThird || data.percent >= 0.333,
            twoThird: prev.twoThird || data.percent >= 0.666,
            completed: prev.completed || data.percent >= 0.98,
          };
          if (!prev.oneThird && next.oneThird) {
            setRewardPulse((p) => ({ ...p, oneThird: p.oneThird + 1 }));
          }
          if (!prev.twoThird && next.twoThird) {
            setRewardPulse((p) => ({ ...p, twoThird: p.twoThird + 1 }));
          }
          if (!prev.completed && next.completed) {
            setRewardPulse((p) => ({ ...p, completed: p.completed + 1 }));
          }
          return next;
        });
      }
      const now = Date.now();
      if (now - lastProgressSentAtRef.current >= 2000) {
        lastProgressSentAtRef.current = now;
        postProgress("timeupdate", data);
      }
    };

    const handleSeeking = (data) => {
      const target = Number(data?.seconds ?? 0);
      const lastAllowed = lastAllowedSecondsRef.current;
      if (target > lastAllowed + 2) {
        player.pause().catch(() => undefined);
        player.setCurrentTime(lastAllowed).catch(() => undefined);
      }
      postProgress("seeking", data);
    };

    const handleSeeked = (data) => {
      const target = Number(data?.seconds ?? 0);
      if (target > lastAllowedSecondsRef.current + 1) {
        player.setCurrentTime(lastAllowedSecondsRef.current).catch(() => undefined);
      }
      postProgress("seeked", data);
    };

    const handlePlay = (data) => {
      setIsPlaying(true);
      postProgress("play", data);
    };
    const handlePause = (data) => {
      setIsPlaying(false);
      postProgress("pause", data);
    };
    const handleEnded = (data) => postProgress("ended", data);

    player.on("timeupdate", handleTimeUpdate);
    player.on("seeking", handleSeeking);
    player.on("seeked", handleSeeked);
    player.on("play", handlePlay);
    player.on("pause", handlePause);
    player.on("ended", handleEnded);

    return () => {
      player.off("timeupdate", handleTimeUpdate);
      player.off("seeking", handleSeeking);
      player.off("seeked", handleSeeked);
      player.off("play", handlePlay);
      player.off("pause", handlePause);
      player.off("ended", handleEnded);
      player.destroy().catch(() => undefined);
    };
  }, [episodeId, vimeoId]);

  const handlePlayPause = async () => {
    const player = vimeoPlayerRef.current;
    if (!player) return;
    if (isPlaying) {
      await player.pause();
    } else {
      await player.play();
    }
  };

  const formatTime = (seconds) => {
    const total = Math.max(0, Math.floor(seconds || 0));
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    return `${minutes}:${String(secs).padStart(2, "0")}`;
  };

  const percent = playbackDuration ? Math.min(1, playbackSeconds / playbackDuration) : 0;
  const remaining = playbackDuration ? Math.max(0, playbackDuration - playbackSeconds) : 0;

  const handleProgressClick = (event) => {
    const bar = progressBarRef.current;
    const player = vimeoPlayerRef.current;
    if (!bar || !player || !playbackDuration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const targetSeconds = ratio * playbackDuration;
    const allowed = Math.max(0, lastAllowedSecondsRef.current);
    if (targetSeconds <= allowed + 0.5) {
      player.setCurrentTime(targetSeconds).catch(() => undefined);
    } else {
      player.setCurrentTime(allowed).catch(() => undefined);
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

  const handleEmailSubmit = () => {
    const trimmed = emailDraft.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) return;
    localStorage.setItem("viewer_email", trimmed);
    setEmailDraft("");
    setShowEmailGate(false);
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
          --usr-blue-gray: #9BB0C1;
          --usr-light-gray: #D3D7DE;
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
        .player-shell {
          position: relative;
          overflow: hidden;
        }
        .player-fit {
          height: clamp(260px, 52vh, 560px);
        }
        .player-shell::before {
          content: "";
          position: absolute;
          inset: -35% 20% auto;
          height: 260px;
          background: radial-gradient(circle, rgba(213, 199, 226, 0.45), transparent 70%);
          opacity: 0.8;
          pointer-events: none;
        }
        .player-shell::after {
          content: "";
          position: absolute;
          inset: auto 10% -35%;
          height: 260px;
          background: radial-gradient(circle, rgba(155, 176, 193, 0.34), transparent 70%);
          opacity: 0.7;
          pointer-events: none;
        }
        .progress-shell {
          background: linear-gradient(90deg, rgba(0,0,0,0.08), rgba(0,0,0,0.12));
        }
        .progress-fill {
          background: linear-gradient(90deg, #d5c7e2, #9bb0c1 60%, #7a3168);
          transition: width 220ms ease;
        }
        .progress-marker {
          position: absolute;
          top: 50%;
          width: 14px;
          height: 14px;
          border-radius: 999px;
          transform: translate(-50%, -50%);
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.12);
          box-shadow: 0 6px 14px rgba(0,0,0,0.12);
        }
        .progress-marker.active {
          background: var(--usr-secondary);
          border-color: rgba(122, 49, 104, 0.55);
          box-shadow: 0 0 18px rgba(122, 49, 104, 0.35);
        }
        .progress-coin {
          position: absolute;
          top: -26px;
          transform: translateX(-50%);
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.45);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .coin-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          background: var(--usr-cloud);
          border: 1px solid rgba(59,44,87,0.12);
          color: var(--usr-muted);
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          white-space: nowrap;
          min-width: 86px;
          justify-content: center;
          transition: background-color 180ms ease, border-color 180ms ease, color 180ms ease, box-shadow 180ms ease;
        }
        .coin-badge.active {
          background: rgba(122, 49, 104, 0.14);
          border-color: rgba(122, 49, 104, 0.34);
          color: var(--usr-secondary);
          box-shadow: 0 0 0 1px rgba(122, 49, 104, 0.05), 0 10px 22px rgba(59, 44, 87, 0.12);
        }
        .coin-reward {
          position: absolute;
          top: -50px;
          transform: translateX(-50%);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          background: #3B2C57;
          border: 1px solid rgba(213, 199, 226, 0.5);
          color: #ffffff;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          animation: rewardPop 1.4s ease forwards;
          box-shadow: 0 12px 30px rgba(122, 49, 104, 0.16);
        }
        @keyframes rewardPop {
          0% { transform: translate(-50%, 8px) scale(0.9); opacity: 0; }
          35% { transform: translate(-50%, -8px) scale(1.02); opacity: 1; }
          100% { transform: translate(-50%, -16px) scale(1); opacity: 0; }
        }
        .coin-float {
          position: fixed;
          left: 50%;
          bottom: 140px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 999px;
          background: #3B2C57;
          border: 1px solid rgba(213, 199, 226, 0.5);
          color: #ffffff;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          box-shadow: 0 12px 30px rgba(122, 49, 104, 0.16);
          animation: coinFloat 1.4s ease forwards;
          z-index: 50;
        }
        @keyframes coinFloat {
          0% { transform: translate(-50%, 0) scale(0.9); opacity: 0; }
          25% { transform: translate(-50%, -20px) scale(1.02); opacity: 1; }
          100% { transform: translate(calc(50vw - 140px), -70vh) scale(0.8); opacity: 0; }
        }
        .ai-aura {
          position: relative;
          isolation: isolate;
        }
        .ai-aura::before {
          content: "";
          position: absolute;
          inset: -30px;
          border-radius: 999px;
          background: radial-gradient(circle at 35% 35%, rgba(213,199,226,0.95), rgba(155,176,193,0.68) 50%, rgba(59,44,87,0.1) 70%);
          filter: blur(10px);
          animation: orbPulse 1.6s ease-in-out infinite;
          z-index: -1;
        }
        .ai-aura::after {
          content: "";
          position: absolute;
          inset: -55px;
          border-radius: 999px;
          border: 1px solid rgba(122, 49, 104, 0.22);
          filter: blur(12px);
          animation: auraDrift 7s ease-in-out infinite;
          z-index: -2;
        }
        .ai-button {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 999px;
          background: radial-gradient(circle at 35% 35%, #d5c7e2, #9bb0c1 50%, rgba(59, 44, 87, 0.16));
          box-shadow: 0 0 30px rgba(122, 49, 104, 0.24), 0 0 90px rgba(59, 44, 87, 0.18);
          transition: transform 220ms ease, box-shadow 220ms ease;
        }
        .ai-button.listening {
          transform: scale(1.06);
          box-shadow: 0 0 40px rgba(122, 49, 104, 0.42), 0 0 120px rgba(59, 44, 87, 0.28);
        }
        .ai-button::after {
          content: "";
          position: absolute;
          inset: -12px;
          border-radius: 999px;
          border: 1px solid rgba(122, 49, 104, 0.32);
          filter: blur(4px);
        }
        .ai-button::before {
          content: "";
          position: absolute;
          inset: -20px;
          border-radius: 999px;
          border: 1px solid rgba(59, 44, 87, 0.24);
          filter: blur(12px);
        }
        .listening-bars {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          opacity: 0;
          transition: opacity 200ms ease;
        }
        .listening-bars.active {
          opacity: 1;
        }
        .listening-bars span {
          width: 6px;
          height: 22px;
          border-radius: 999px;
          background: rgba(4, 16, 31, 0.7);
          animation: listenWave 1.1s ease-in-out infinite;
        }
        .listening-bars span:nth-child(2) { animation-delay: 0.1s; height: 30px; }
        .listening-bars span:nth-child(3) { animation-delay: 0.2s; height: 18px; }
        .listening-bars span:nth-child(4) { animation-delay: 0.3s; height: 28px; }
        @keyframes listenWave {
          0%, 100% { transform: scaleY(0.7); opacity: 0.6; }
          50% { transform: scaleY(1.2); opacity: 1; }
        }
        @keyframes orbPulse {
          0%, 100% { transform: scale(0.92); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes auraDrift {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-6px) scale(1.03); opacity: 0.85; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ai-button {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className="border-b border-[var(--usr-line)] bg-[var(--usr-white)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-6">
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
                className={`h-8 w-auto drop-shadow-[0_0_10px_rgba(255,255,255,0.55)] transition duration-300 group-hover:drop-shadow-[0_0_14px_rgba(255,255,255,0.8)] sm:h-9 ${
                  logoDance ? "logo-dance" : ""
                }`}
              />
            </Link>
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--usr-muted)]">Episode Player</p>
              <h1 className="mt-1 text-lg font-semibold text-black sm:text-xl">{episode.title}</h1>
              <p className="mt-1 text-xs text-[var(--usr-muted)]">with {episode.guest}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-[var(--usr-line)] bg-[var(--usr-cloud)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--usr-muted)]">
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
            <Link
              to="/episodes"
              className="rounded-full border border-[var(--usr-line)] bg-[var(--usr-cloud)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--usr-muted)]"
            >
              Back
            </Link>
          </div>
        </div>
      </div>

      {showEmailGate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-md rounded-3xl border border-[var(--usr-line)] bg-[var(--usr-white)] p-6 shadow-xl">
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--usr-muted)]">Enter Email</p>
            <h2 className="mt-3 text-2xl font-semibold text-black">Continue to Player</h2>
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

      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
        <div className="player-shell rounded-3xl border border-[var(--usr-line)] bg-[var(--usr-white)] p-4 shadow-sm sm:p-6">
          <div className="relative overflow-hidden rounded-2xl border border-[var(--usr-line)] bg-[var(--usr-cloud)]">
            <div className="player-fit w-full">
              <div ref={playerMountRef} className="h-full w-full" />
              {!vimeoId ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--usr-cloud)] text-xs uppercase tracking-[0.4em] text-[var(--usr-muted)]">
                  Vimeo Player Unavailable
                </div>
              ) : null}
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-[var(--usr-line)] bg-[var(--usr-white)] px-3 py-4 sm:px-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePlayPause}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--usr-line)] bg-[var(--usr-cloud)] text-[var(--usr-ink)]"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                    <path d="M7 5h3v14H7zm7 0h3v14h-3z" fill="currentColor" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                    <path d="M8 5v14l11-7z" fill="currentColor" />
                  </svg>
                )}
              </button>
              <div className="flex-1">
                <div
                  ref={progressBarRef}
                  onClick={handleProgressClick}
                  className="relative h-2 cursor-pointer rounded-full progress-shell"
                >
                  <div className="progress-fill h-full rounded-full" style={{ width: `${percent * 100}%` }} />
                  <span className={`progress-marker ${milestones.oneThird ? "active" : ""}`} style={{ left: "33.33%" }} />
                  <span className={`progress-marker ${milestones.twoThird ? "active" : ""}`} style={{ left: "66.66%" }} />
                  <span className={`progress-marker ${milestones.completed ? "active" : ""}`} style={{ left: "100%" }} />
                  <span className="progress-coin" style={{ left: "33.33%" }}>
                    <span className={`coin-badge ${milestones.oneThird ? "active" : ""}`}>
                      <svg viewBox="0 0 24 24" className="h-3 w-3 text-[var(--usr-secondary)]" aria-hidden="true">
                        <path
                          d="M12 3c-4.4 0-8 1.34-8 3v12c0 1.66 3.6 3 8 3s8-1.34 8-3V6c0-1.66-3.6-3-8-3zm0 2c3.87 0 6 .97 6 1s-2.13 1-6 1-6-.97-6-1 2.13-1 6-1z"
                          fill="currentColor"
                        />
                      </svg>
                      1 coin
                    </span>
                  </span>
                  <span className="progress-coin" style={{ left: "66.66%" }}>
                    <span className={`coin-badge ${milestones.twoThird ? "active" : ""}`}>
                      <svg viewBox="0 0 24 24" className="h-3 w-3 text-[var(--usr-secondary)]" aria-hidden="true">
                        <path
                          d="M12 3c-4.4 0-8 1.34-8 3v12c0 1.66 3.6 3 8 3s8-1.34 8-3V6c0-1.66-3.6-3-8-3zm0 2c3.87 0 6 .97 6 1s-2.13 1-6 1-6-.97-6-1 2.13-1 6-1z"
                          fill="currentColor"
                        />
                      </svg>
                      3 coins
                    </span>
                  </span>
                  <span className="progress-coin" style={{ left: "100%" }}>
                    <span className={`coin-badge ${milestones.completed ? "active" : ""}`}>
                      <svg viewBox="0 0 24 24" className="h-3 w-3 text-[var(--usr-secondary)]" aria-hidden="true">
                        <path
                          d="M12 3c-4.4 0-8 1.34-8 3v12c0 1.66 3.6 3 8 3s8-1.34 8-3V6c0-1.66-3.6-3-8-3zm0 2c3.87 0 6 .97 6 1s-2.13 1-6 1-6-.97-6-1 2.13-1 6-1z"
                          fill="currentColor"
                        />
                      </svg>
                      5 coins
                    </span>
                  </span>
                  {milestones.oneThird ? (
                    <span key={`r1-${rewardPulse.oneThird}`} className="coin-reward" style={{ left: "33.33%" }}>
                      <svg viewBox="0 0 24 24" className="h-3 w-3 text-[var(--usr-secondary)]" aria-hidden="true">
                        <path
                          d="M12 3c-4.4 0-8 1.34-8 3v12c0 1.66 3.6 3 8 3s8-1.34 8-3V6c0-1.66-3.6-3-8-3zm0 2c3.87 0 6 .97 6 1s-2.13 1-6 1-6-.97-6-1 2.13-1 6-1z"
                          fill="currentColor"
                        />
                      </svg>
                      +1
                    </span>
                  ) : null}
                  {milestones.twoThird ? (
                    <span key={`r2-${rewardPulse.twoThird}`} className="coin-reward" style={{ left: "66.66%" }}>
                      <svg viewBox="0 0 24 24" className="h-3 w-3 text-[var(--usr-secondary)]" aria-hidden="true">
                        <path
                          d="M12 3c-4.4 0-8 1.34-8 3v12c0 1.66 3.6 3 8 3s8-1.34 8-3V6c0-1.66-3.6-3-8-3zm0 2c3.87 0 6 .97 6 1s-2.13 1-6 1-6-.97-6-1 2.13-1 6-1z"
                          fill="currentColor"
                        />
                      </svg>
                      +3
                    </span>
                  ) : null}
                  {milestones.completed ? (
                    <span key={`r3-${rewardPulse.completed}`} className="coin-reward" style={{ left: "100%" }}>
                      <svg viewBox="0 0 24 24" className="h-3 w-3 text-[var(--usr-secondary)]" aria-hidden="true">
                        <path
                          d="M12 3c-4.4 0-8 1.34-8 3v12c0 1.66 3.6 3 8 3s8-1.34 8-3V6c0-1.66-3.6-3-8-3zm0 2c3.87 0 6 .97 6 1s-2.13 1-6 1-6-.97-6-1 2.13-1 6-1z"
                          fill="currentColor"
                        />
                      </svg>
                      +5
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--usr-muted)]">
                -{formatTime(remaining)}
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-[var(--usr-muted)]">
              <span>Coins Earned</span>
              <span>{coinBalance} / 9</span>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--usr-muted)]">Now Playing</p>
            <h2 className="mt-1 text-lg font-semibold text-black sm:text-xl">{episode.title}</h2>
            <p className="mt-1 text-xs text-[var(--usr-muted)]">with {episode.guest} · {episode.length}</p>
            <p className="mt-2 text-xs leading-relaxed text-[var(--usr-muted)] line-clamp-2">{episode.summary}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {episode.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--usr-line)] bg-[var(--usr-cloud)] px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-[var(--usr-muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showTalkToY ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center">
          <div className="ai-aura pointer-events-auto">
            <button
              type="button"
              onClick={() => setIsListening((prev) => !prev)}
              className={`ai-button text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--usr-ink)] ${isListening ? "listening" : ""}`}
              aria-pressed={isListening}
            >
              <span className={isListening ? "opacity-0" : "opacity-100"}>
                Talk to Y.
              </span>
              <span className={`listening-bars ${isListening ? "active" : ""}`} aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      ) : null}

      {floatingRewards.map((reward) => (
        <div key={reward.id} className="coin-float">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--usr-secondary)]" aria-hidden="true">
            <path
              d="M12 3c-4.4 0-8 1.34-8 3v12c0 1.66 3.6 3 8 3s8-1.34 8-3V6c0-1.66-3.6-3-8-3zm0 2c3.87 0 6 .97 6 1s-2.13 1-6 1-6-.97-6-1 2.13-1 6-1zm0 6c3.87 0 6 .97 6 1s-2.13 1-6 1-6-.97-6-1 2.13-1 6-1zm0 6c3.87 0 6 .97 6 1s-2.13 1-6 1-6-.97-6-1 2.13-1 6-1z"
              fill="currentColor"
            />
          </svg>
          +{reward.amount}
        </div>
      ))}
    </div>
  );
}
