import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { EPISODES } from "./Episodes";
import API_BASE from "../lib/apiBase";
import VimeoPlayer from "@vimeo/player";
import { clearAuth, getAuthEmail, isAuthed } from "../lib/auth";

const logoImageUrl = new URL(
  "../../OneDrive_2026-03-20/UR LOGO dark 1.png",
  import.meta.url
).href;
const EPISODES_PLAYER_TUTORIAL_KEY = "episodes_player_tutorial";

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
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVolumeTrayOpen, setIsVolumeTrayOpen] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<"video" | "audio">("video");
  const [skipFeedback, setSkipFeedback] = useState<null | { direction: "back" | "forward"; amount: number; nonce: number }>(null);
  // const [coinBalance, setCoinBalance] = useState(0);
  // const [spendRequired, setSpendRequired] = useState(3);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessError, setAccessError] = useState("");
  // const [isUnlocking, setIsUnlocking] = useState(false);
  // const [showPlayerTutorial, setShowPlayerTutorial] = useState(false);
  // const [rewardPulse, setRewardPulse] = useState({
  //   oneThird: 0,
  //   twoThird: 0,
  //   completed: 0,
  // });
  // const [floatingRewards, setFloatingRewards] = useState<Array<{ id: number; amount: number }>>([]);
  // const [milestones, setMilestones] = useState({
  //   oneThird: false,
  //   twoThird: false,
  //   completed: false,
  // });
  const playerMountRef = useRef<HTMLDivElement | null>(null);
  const videoSurfaceRef = useRef<HTMLDivElement | null>(null);
  const vimeoPlayerRef = useRef<VimeoPlayer | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const lastAllowedSecondsRef = useRef(0);
  const lastReportedSecondsRef = useRef<number | null>(null);
  const lastProgressSentAtRef = useRef(0);
  const pendingSeekSecondsRef = useRef<number | null>(null);
  const playbackSecondsRef = useRef(0);
  const playbackDurationRef = useRef(0);
  const seekInFlightRef = useRef(false);
  const queuedSkipDeltaRef = useRef(0);
  const isPlayingRef = useRef(false);
  const playbackModeRef = useRef<"video" | "audio">("video");
  const isProgressDraggingRef = useRef(false);
  const progressDragSecondsRef = useRef(0);
  const isSyncingVimeoRef = useRef(false);
  const skipFeedbackTimerRef = useRef<number | null>(null);
  const skipHoldDelayRef = useRef<number | null>(null);
  const skipHoldIntervalRef = useRef<number | null>(null);
  const skipHoldTotalRef = useRef(0);
  const sessionIdRef = useRef<string | null>(null);
  // const rewardIdRef = useRef(0);

  const episode = useMemo(
    () => episodeData ?? EPISODES[0],
    [episodeData]
  );
  // const episodeRewardTotal = (milestones.oneThird ? 1 : 0) + (milestones.twoThird ? 3 : 0) + (milestones.completed ? 5 : 0);

  const vimeoId = useMemo(() => {
    const candidate = episode?.vimeoId || episode?.id;
    return candidate && /^\d+$/.test(candidate) ? candidate : null;
  }, [episode?.id, episode?.vimeoId]);
  const audioUrl = episode?.audioUrl || "";
  const resumeStorageKey = `episode_audio_resume_${episodeId}`;
  const audioResumeIntentKey = `episode_audio_was_playing_${episodeId}`;

  useEffect(() => {
    playbackModeRef.current = playbackMode;
  }, [playbackMode]);

  useEffect(() => {
    if (!audioUrl) return;
    setPlaybackMode("audio");
    playbackModeRef.current = "audio";
  }, [audioUrl]);

  useEffect(() => {
    if (typeof episode?.duration === "number" && Number.isFinite(episode.duration) && episode.duration > 0) {
      playbackDurationRef.current = episode.duration;
      setPlaybackDuration((current) => current || episode.duration);
    }
  }, [episode?.duration]);

  useEffect(() => {
    if (!audioUrl || !episode?.title || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: episode.title,
      artist: "The Unscripted Room",
      album: "Unscripted Room Episode",
      artwork: episode.image ? [{ src: episode.image, sizes: "512x512", type: "image/jpeg" }] : [],
    });
    navigator.mediaSession.setActionHandler("play", () => {
      audioRef.current?.play().catch(() => undefined);
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      audioRef.current?.pause();
      vimeoPlayerRef.current?.pause().catch(() => undefined);
    });
    navigator.mediaSession.setActionHandler("seekbackward", () => handleSkipBy(-30));
    navigator.mediaSession.setActionHandler("seekforward", () => handleSkipBy(30));
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (typeof details.seekTime === "number") commitSeekTo(details.seekTime);
    });
  }, [audioUrl, episode?.image, episode?.title, playbackMode]);

  // const triggerReward = (amount: number, milestoneKey: "oneThird" | "twoThird" | "completed") => {
  //   setRewardPulse((prev) => ({
  //     ...prev,
  //     [milestoneKey]: prev[milestoneKey] + 1,
  //   }));
  //   const id = rewardIdRef.current + 1;
  //   rewardIdRef.current = id;
  //   setFloatingRewards((prev) => [...prev, { id, amount }]);
  //   window.setTimeout(() => {
  //     setFloatingRewards((prev) => prev.filter((reward) => reward.id !== id));
  //   }, 1800);
  // };

  useEffect(() => {
    return () => {
      if (skipFeedbackTimerRef.current) window.clearTimeout(skipFeedbackTimerRef.current);
      if (skipHoldDelayRef.current) window.clearTimeout(skipHoldDelayRef.current);
      if (skipHoldIntervalRef.current) window.clearInterval(skipHoldIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const getFullscreenElement = () =>
      document.fullscreenElement || (document as any).webkitFullscreenElement || null;
    const handleFullscreenChange = () => {
      setIsFullscreen(getFullscreenElement() === videoSurfaceRef.current);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

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

  // useEffect(() => {
  //   const tutorialEpisodeId = sessionStorage.getItem(EPISODES_PLAYER_TUTORIAL_KEY);
  //   setShowPlayerTutorial(Boolean(tutorialEpisodeId) && tutorialEpisodeId === episodeId);
  // }, [episodeId]);

  // useEffect(() => {
  //   if (!authed) {
  //     setAccessLoading(false);
  //     setAccessError("Sign in on the Episodes page to unlock and track progress.");
  //     return;
  //   }
  //   let active = true;
  //   const loadAccess = async () => {
  //     try {
  //       setAccessLoading(true);
  //       setAccessError("");
  //       const token = localStorage.getItem("access_token");
  //       const res = await fetch(`${API_BASE}/api/episodes/${encodeURIComponent(episodeId)}/access`, {
  //         headers: {
  //           "Content-Type": "application/json",
  //           ...(token ? { Authorization: `Bearer ${token}` } : {}),
  //         },
  //       });
  //       const data = await res.json().catch(() => ({}));
  //       if (!res.ok) {
  //         if (!active) return;
  //         setAccessError(data?.error || "Unable to load episode access.");
  //         setAccessLoading(false);
  //         return;
  //       }
  //       if (!active) return;
  //       // setCoinBalance(Number(data?.balance || 0));
  //       // setSpendRequired(Number(data?.spendRequired || 3));
  //       setIsUnlocked(Boolean(data?.unlocked));
  //       // if (data?.rewardedMilestones) {
  //       //   setMilestones({
  //       //     oneThird: Boolean(data.rewardedMilestones.oneThird),
  //       //     twoThird: Boolean(data.rewardedMilestones.twoThird),
  //       //     completed: Boolean(data.rewardedMilestones.completed),
  //       //   });
  //       // }
  //       setAccessLoading(false);
  //     } catch (error) {
  //       if (!active) return;
  //       setAccessError("Unable to load episode access.");
  //       setAccessLoading(false);
  //     }
  //   };
  //   loadAccess();
  //   return () => {
  //     active = false;
  //   };
  // }, [authed, episodeId]);

  useEffect(() => {
    if (!vimeoId || !isUnlocked || !authed) return;
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
  }, [authed, episodeId, isUnlocked, vimeoId]);

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
      controls: false,
      title: false,
      byline: false,
      portrait: false,
      autoplay: false,
    });
    vimeoPlayerRef.current = player;
    const iframe = mount.querySelector("iframe");
    iframe?.setAttribute("loading", "eager");
    iframe?.setAttribute("fetchpriority", "high");

    if (audioUrl) {
      player.setVolume(0).catch(() => undefined);
    } else {
      player.getVolume().then((nextVolume) => {
        setVolume(Number(nextVolume));
        setIsMuted(nextVolume <= 0);
      }).catch(() => undefined);
    }
    player.getDuration().then((duration) => {
      if (typeof duration === "number" && Number.isFinite(duration) && duration > 0) {
        playbackDurationRef.current = duration;
        setPlaybackDuration(duration);
      }
    }).catch(() => undefined);
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
          // if (payload?.maxPercent !== undefined) {
          //   setMilestones((prev) => {
          //     const next = {
          //       oneThird: prev.oneThird || payload.maxPercent >= 0.333,
          //       twoThird: prev.twoThird || payload.maxPercent >= 0.666,
          //       completed: prev.completed || payload.maxPercent >= 0.98,
          //     };
          //     if (!prev.oneThird && next.oneThird) triggerReward(1, "oneThird");
          //     if (!prev.twoThird && next.twoThird) triggerReward(3, "twoThird");
          //     if (!prev.completed && next.completed) triggerReward(5, "completed");
          //     return {
          //       oneThird: next.oneThird,
          //       twoThird: next.twoThird,
          //       completed: next.completed,
          //     };
          //   });
          // }
          // if (typeof payload?.balance === "number") {
          //   setCoinBalance(payload.balance);
          // }
        }
      } catch (error) {
        console.error("Progress update failed", error);
      }
    };

    const handleTimeUpdate = (data) => {
      if (audioUrl) return;
      if (typeof data?.seconds === "number") {
        const current = data.seconds;
        playbackSecondsRef.current = current;
        if (pendingSeekSecondsRef.current !== null && Math.abs(current - pendingSeekSecondsRef.current) < 1.5) {
          pendingSeekSecondsRef.current = null;
          seekInFlightRef.current = false;
          if (queuedSkipDeltaRef.current) {
            const queuedDelta = queuedSkipDeltaRef.current;
            queuedSkipDeltaRef.current = 0;
            window.setTimeout(() => handleSkipBy(queuedDelta), 0);
          }
        }
        const previous = lastReportedSecondsRef.current;
        if (previous !== null) {
          const delta = current - previous;
          // Temporarily allow forward seeking while custom controls are disabled.
          // if (delta > 2.5) {
          //   // Forward jump detected: clamp back to last allowed point.
          //   vimeoPlayerRef.current?.setCurrentTime(lastAllowedSecondsRef.current).catch(() => undefined);
          // } else
          if (delta > 0) {
            lastAllowedSecondsRef.current = Math.max(lastAllowedSecondsRef.current, current);
          }
        } else {
          lastAllowedSecondsRef.current = Math.max(lastAllowedSecondsRef.current, current);
        }
        lastReportedSecondsRef.current = current;
        setPlaybackSeconds(data.seconds);
      }
      if (typeof data?.duration === "number") {
        playbackDurationRef.current = data.duration;
        setPlaybackDuration(data.duration);
      }
      // if (typeof data?.percent === "number") {
      //   setMilestones((prev) => {
      //     return {
      //       oneThird: prev.oneThird || data.percent >= 0.333,
      //       twoThird: prev.twoThird || data.percent >= 0.666,
      //       completed: prev.completed || data.percent >= 0.98,
      //     };
      //   });
      // }
      const now = Date.now();
      if (now - lastProgressSentAtRef.current >= 2000) {
        lastProgressSentAtRef.current = now;
        postProgress("timeupdate", data);
      }
    };

    const handleSeeking = () => {
      // Keep manual seeking responsive; normal timeupdate events still persist progress.
      // const target = Number(data?.seconds ?? 0);
      // const lastAllowed = lastAllowedSecondsRef.current;
      // Temporarily allow forward seeking while custom controls are disabled.
      // if (target > lastAllowed + 2) {
      //   player.pause().catch(() => undefined);
      //   player.setCurrentTime(lastAllowed).catch(() => undefined);
      // }
      // postProgress("seeking", data);
    };

    const handleSeeked = () => {
      // Keep manual seeking responsive; normal timeupdate events still persist progress.
      // const target = Number(data?.seconds ?? 0);
      // Temporarily allow forward seeking while custom controls are disabled.
      // if (target > lastAllowedSecondsRef.current + 1) {
      //   player.setCurrentTime(lastAllowedSecondsRef.current).catch(() => undefined);
      // }
      // postProgress("seeked", data);
      if (!isPlayingRef.current && pendingSeekSecondsRef.current !== null) {
        pendingSeekSecondsRef.current = null;
        seekInFlightRef.current = false;
        if (queuedSkipDeltaRef.current) {
          const queuedDelta = queuedSkipDeltaRef.current;
          queuedSkipDeltaRef.current = 0;
          window.setTimeout(() => handleSkipBy(queuedDelta), 0);
        }
      }
    };

    const handlePlay = (data) => {
      if (audioUrl) return;
      audioRef.current?.pause();
      isPlayingRef.current = true;
      setIsPlaying(true);
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
      postProgress("play", data);
    };
    const handlePause = (data) => {
      if (audioUrl) return;
      isPlayingRef.current = false;
      setIsPlaying(false);
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
      postProgress("pause", data);
    };
    const handleEnded = (data) => {
      if (audioUrl) return;
      isPlayingRef.current = false;
      setIsPlaying(false);
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "none";
      postProgress("ended", data);
    };
    const handleVolumeChange = (data) => {
      if (audioUrl) return;
      const nextVolume = Number(data?.volume ?? 1);
      setVolume(nextVolume);
      setIsMuted(nextVolume <= 0);
    };
    player.on("timeupdate", handleTimeUpdate);
    player.on("seeking", handleSeeking);
    player.on("seeked", handleSeeked);
    player.on("play", handlePlay);
    player.on("pause", handlePause);
    player.on("ended", handleEnded);
    player.on("volumechange", handleVolumeChange);

    return () => {
      player.off("timeupdate", handleTimeUpdate);
      player.off("seeking", handleSeeking);
      player.off("seeked", handleSeeked);
      player.off("play", handlePlay);
      player.off("pause", handlePause);
      player.off("ended", handleEnded);
      player.off("volumechange", handleVolumeChange);
      player.destroy().catch(() => undefined);
      if (vimeoPlayerRef.current === player) {
        vimeoPlayerRef.current = null;
      }
    };
  }, [audioUrl, episodeId, vimeoId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    seekInFlightRef.current = false;
    pendingSeekSecondsRef.current = null;
    queuedSkipDeltaRef.current = 0;
    isPlayingRef.current = false;
    setIsPlaying(false);
    audio.preload = "auto";

    const saveResume = () => {
      if (Number.isFinite(audio.currentTime) && audio.currentTime > 0) {
        localStorage.setItem(resumeStorageKey, String(audio.currentTime));
      }
    };
    const updateMediaSessionPosition = () => {
      if (!("mediaSession" in navigator) || typeof navigator.mediaSession.setPositionState !== "function") return;
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
      navigator.mediaSession.setPositionState({
        duration: audio.duration,
        playbackRate: audio.playbackRate || 1,
        position: Math.min(audio.currentTime || 0, audio.duration),
      });
    };
    const handleLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        playbackDurationRef.current = audio.duration;
        setPlaybackDuration(audio.duration);
      }
      const saved = Number(localStorage.getItem(resumeStorageKey) || 0);
      if (saved > 0 && Number.isFinite(saved) && saved < (audio.duration || Infinity) - 3) {
        audio.currentTime = saved;
        playbackSecondsRef.current = saved;
        setPlaybackSeconds(saved);
      }
      updateMediaSessionPosition();
    };
    const handleTimeUpdate = () => {
      playbackSecondsRef.current = audio.currentTime;
      setPlaybackSeconds(audio.currentTime);
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        playbackDurationRef.current = audio.duration;
        setPlaybackDuration(audio.duration);
      }
      saveResume();
      updateMediaSessionPosition();
      syncVimeoToAudio();
    };
    const handlePlay = () => {
      isPlayingRef.current = true;
      setIsPlaying(true);
      localStorage.setItem(audioResumeIntentKey, "1");
      audio.playbackRate = 1;
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
      updateMediaSessionPosition();
      syncVimeoToAudio({ force: true, playState: true });
    };
    const handlePause = () => {
      isPlayingRef.current = false;
      setIsPlaying(false);
      saveResume();
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
      updateMediaSessionPosition();
      vimeoPlayerRef.current?.pause().catch(() => undefined);
    };
    const handleEnded = () => {
      isPlayingRef.current = false;
      setIsPlaying(false);
      localStorage.removeItem(audioResumeIntentKey);
      localStorage.removeItem(resumeStorageKey);
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "none";
    };
    const handleVolumeChange = () => {
      setVolume(audio.volume);
      setIsMuted(audio.muted || audio.volume <= 0);
    };
    const handleSeeked = () => {
      seekInFlightRef.current = false;
      pendingSeekSecondsRef.current = null;
      updateMediaSessionPosition();
      syncVimeoToAudio({ force: true });
      if (queuedSkipDeltaRef.current) {
        const queuedDelta = queuedSkipDeltaRef.current;
        queuedSkipDeltaRef.current = 0;
        window.setTimeout(() => handleSkipBy(queuedDelta), 0);
      }
    };
    const handlePageHide = () => {
      saveResume();
    };
    const handleVisibilityChange = () => {
      saveResume();
      if (document.hidden) {
        vimeoPlayerRef.current?.pause().catch(() => undefined);
      } else {
        syncVimeoToAudio({ force: true, playState: !audio.paused });
      }
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("durationchange", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("volumechange", handleVolumeChange);
    audio.addEventListener("seeked", handleSeeked);
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    if (audio.readyState === 0) audio.load();

    return () => {
      saveResume();
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("durationchange", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("volumechange", handleVolumeChange);
      audio.removeEventListener("seeked", handleSeeked);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [audioResumeIntentKey, audioUrl, resumeStorageKey, vimeoId]);

  const syncVimeoToAudio = async ({ force = false, playState = false } = {}) => {
    if (!audioUrl || isSyncingVimeoRef.current) return;
    const audio = audioRef.current;
    const player = vimeoPlayerRef.current;
    if (!audio || !player || document.hidden || !Number.isFinite(audio.currentTime)) return;
    isSyncingVimeoRef.current = true;
    try {
      const videoTime = await player.getCurrentTime();
      const drift = Math.abs(Number(videoTime || 0) - audio.currentTime);
      if (force || drift > 0.45) {
        await player.setCurrentTime(audio.currentTime);
      }
      if (playState) {
        if (audio.paused) {
          await player.pause();
        } else {
          await player.play();
        }
      }
    } catch {
      // Vimeo can reject commands while buffering, hidden, or not ready.
    } finally {
      isSyncingVimeoRef.current = false;
    }
  };

  const handlePlayPause = async () => {
    if (audioUrl) {
      const audio = audioRef.current;
      if (!audio || !isUnlocked) return;
      if (audio.paused) {
        const saved = Number(localStorage.getItem(resumeStorageKey) || 0);
        if (saved > 0 && Number.isFinite(saved) && Math.abs(audio.currentTime - saved) > 2) {
          audio.currentTime = saved;
        }
        audio.preload = "auto";
        audio.playbackRate = 1;
        if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
        await audio.play();
        syncVimeoToAudio({ force: true, playState: true });
      } else {
        if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
        audio.pause();
      }
      return;
    }
    const player = vimeoPlayerRef.current;
    if (!player || !isUnlocked) return;
    if (isPlaying) {
      await player.pause();
    } else {
      await player.play();
    }
  };

  const handleVolumeChangeInput = async (event) => {
    const player = vimeoPlayerRef.current;
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
    setIsMuted(nextVolume <= 0);
    if (audioUrl) {
      const audio = audioRef.current;
      if (!audio) return;
      audio.volume = nextVolume;
      audio.muted = nextVolume <= 0;
      return;
    }
    if (!player) return;
    try {
      await player.setVolume(nextVolume);
    } catch {
      // Some devices do not expose independent volume control.
    }
  };

  const handleFullscreenToggle = async () => {
    const surface = videoSurfaceRef.current;
    if (!surface) return;
    const fullscreenElement = document.fullscreenElement || (document as any).webkitFullscreenElement || null;
    try {
      if (fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        setIsFullscreen(false);
      } else {
        if (surface.requestFullscreen) {
          await surface.requestFullscreen();
        } else if ((surface as any).webkitRequestFullscreen) {
          await (surface as any).webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      }
    } catch {
      // Fullscreen can be unavailable depending on browser/device context.
    }
  };

  const formatSkipFeedbackAmount = (seconds) => {
    const total = Math.max(0, Math.floor(seconds || 0));
    if (total < 60) return `${total} seconds`;
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    if (!secs) return mins === 1 ? "1 minute" : `${mins} minutes`;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const showSkipFeedback = (direction, amount) => {
    if (skipFeedbackTimerRef.current) {
      window.clearTimeout(skipFeedbackTimerRef.current);
    }
    setSkipFeedback({ direction, amount, nonce: Date.now() });
    skipFeedbackTimerRef.current = window.setTimeout(() => {
      setSkipFeedback(null);
      skipFeedbackTimerRef.current = null;
    }, 700);
  };

  const commitSeekTo = (targetSeconds) => {
    const audio = audioRef.current;
    const player = vimeoPlayerRef.current;
    const duration = playbackDurationRef.current || playbackDuration || episode.duration || 0;
    if ((!player && !audio) || !duration || !isUnlocked) return 0;
    const current = playbackSecondsRef.current || playbackSeconds;
    const target = Math.max(0, Math.min(duration, targetSeconds));
    const moved = Math.abs(target - current);
    if (!moved) return 0;
    if (seekInFlightRef.current) {
      const base = pendingSeekSecondsRef.current ?? current;
      queuedSkipDeltaRef.current = target - base;
      playbackSecondsRef.current = target;
      setPlaybackSeconds(target);
      return moved;
    }
    pendingSeekSecondsRef.current = target;
    seekInFlightRef.current = true;
    playbackSecondsRef.current = target;
    setPlaybackSeconds(target);
    if (audioUrl && audio) {
      try {
        audio.currentTime = target;
      } catch {
        audio.addEventListener("loadedmetadata", () => {
          audio.currentTime = target;
        }, { once: true });
      }
      window.setTimeout(() => syncVimeoToAudio({ force: true }), 0);
      return moved;
    }
    if (player && vimeoId && !document.hidden) {
      player.setCurrentTime(target).catch(() => {
        seekInFlightRef.current = false;
        pendingSeekSecondsRef.current = null;
      });
      return moved;
    }
    return moved;
  };

  const handleSkipBy = (deltaSeconds) => {
    const duration = playbackDurationRef.current || playbackDuration || episode.duration || 0;
    if (!duration || !isUnlocked) return 0;
    const committedCurrent = playbackSecondsRef.current || playbackSeconds;
    const base = pendingSeekSecondsRef.current ?? committedCurrent;
    if (seekInFlightRef.current) {
      const queuedBase = Math.max(0, Math.min(duration, base + queuedSkipDeltaRef.current));
      const queuedTarget = Math.max(0, Math.min(duration, queuedBase + deltaSeconds));
      const moved = Math.abs(queuedTarget - queuedBase);
      if (!moved) return 0;
      queuedSkipDeltaRef.current = queuedTarget - base;
      return moved;
    }
    return commitSeekTo(committedCurrent + deltaSeconds);
  };

  const stopSkipHold = () => {
    if (skipHoldDelayRef.current) {
      window.clearTimeout(skipHoldDelayRef.current);
      skipHoldDelayRef.current = null;
    }
    if (skipHoldIntervalRef.current) {
      window.clearInterval(skipHoldIntervalRef.current);
      skipHoldIntervalRef.current = null;
    }
  };

  const handleSkipPressStart = (event, deltaSeconds) => {
    event.preventDefault();
    stopSkipHold();
    skipHoldTotalRef.current = 0;
    const direction = deltaSeconds < 0 ? "back" : "forward";
    const runSkip = () => {
      const moved = handleSkipBy(deltaSeconds);
      if (!moved) return;
      skipHoldTotalRef.current += moved;
      showSkipFeedback(direction, skipHoldTotalRef.current);
    };
    runSkip();
    skipHoldDelayRef.current = window.setTimeout(() => {
      runSkip();
      skipHoldIntervalRef.current = window.setInterval(runSkip, 800);
    }, 700);
  };

  const handleSkipKeyDown = (event, deltaSeconds) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (event.repeat) return;
    handleSkipPressStart(event, deltaSeconds);
  };

  const handleSkipKeyUp = (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    stopSkipHold();
  };

  // const handleUnlockEpisode = async () => {
  //   if (!authed || isUnlocked) return;
  //   setIsUnlocking(true);
  //   setAccessError("");
  //   try {
  //     const token = localStorage.getItem("access_token");
  //     const res = await fetch(`${API_BASE}/api/episodes/${encodeURIComponent(episodeId)}/unlock`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         ...(token ? { Authorization: `Bearer ${token}` } : {}),
  //       },
  //       body: JSON.stringify({ email: getAuthEmail() }),
  //     });
  //     const data = await res.json().catch(() => ({}));
  //     if (!res.ok) {
  //       setAccessError(data?.error || "Unable to unlock this episode.");
  //       if (typeof data?.balance === "number") {
  //         setCoinBalance(data.balance);
  //       }
  //       return;
  //     }
  //     setIsUnlocked(true);
  //     setCoinBalance(Number(data?.balance || 0));
  //   } catch (error) {
  //     setAccessError("Unable to unlock this episode.");
  //   } finally {
  //     setIsUnlocking(false);
  //   }
  // };

  // const handleDismissPlayerTutorial = () => {
  //   sessionStorage.removeItem(EPISODES_PLAYER_TUTORIAL_KEY);
  //   setShowPlayerTutorial(false);
  // };

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

  const getProgressSecondsFromEvent = (event) => {
    const bar = progressBarRef.current;
    const duration = playbackDurationRef.current || playbackDuration || episode.duration || 0;
    if (!bar || !duration) return null;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    return ratio * duration;
  };

  const handleProgressPointerDown = (event) => {
    if (!isUnlocked) return;
    const targetSeconds = getProgressSecondsFromEvent(event);
    if (targetSeconds === null) return;
    event.preventDefault();
    isProgressDraggingRef.current = true;
    progressDragSecondsRef.current = targetSeconds;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setPlaybackSeconds(targetSeconds);
  };

  const handleProgressPointerMove = (event) => {
    if (!isProgressDraggingRef.current) return;
    const targetSeconds = getProgressSecondsFromEvent(event);
    if (targetSeconds === null) return;
    progressDragSecondsRef.current = targetSeconds;
    setPlaybackSeconds(targetSeconds);
  };

  const handleProgressPointerUp = (event) => {
    if (!isProgressDraggingRef.current) return;
    isProgressDraggingRef.current = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    commitSeekTo(progressDragSecondsRef.current);
  };

  const handleProgressPointerCancel = (event) => {
    isProgressDraggingRef.current = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
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
          background:
            linear-gradient(90deg, #fff 0%, rgba(236,241,244,0.92) 16%, rgba(211,215,222,0.56) 50%, rgba(236,241,244,0.92) 84%, #fff 100%);
        }
        .player-frame {
          width: min(100%, 1180px, calc(82vh * 5 / 3));
          margin: 0 auto;
        }
        .player-fit {
          aspect-ratio: 5 / 3;
          height: auto;
          min-height: 320px;
        }
        .player-fit iframe {
          width: 100% !important;
          height: 100% !important;
          display: block;
        }
        @media (max-width: 640px) {
          .player-fit {
            aspect-ratio: 5 / 3;
            height: auto;
            min-height: 0;
          }
        }
        .video-surface:fullscreen,
        .video-surface:-webkit-full-screen {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
        }
        .video-surface:fullscreen .player-fit,
        .video-surface:-webkit-full-screen .player-fit {
          width: min(100vw, calc(100vh * 5 / 3));
          height: min(100vh, calc(100vw * 3 / 5));
          min-height: 0;
          max-height: none;
        }
        .video-surface:fullscreen .video-overlay,
        .video-surface:-webkit-full-screen .video-overlay {
          opacity: 1;
          pointer-events: auto;
        }
        .progress-shell {
          background: linear-gradient(90deg, rgba(16, 18, 30, 0.08), rgba(16, 18, 30, 0.16));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
        }
        .video-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-end;
          background: linear-gradient(180deg, rgba(10, 10, 12, 0.02) 0%, rgba(10, 10, 12, 0.06) 56%, rgba(10, 10, 12, 0.5) 100%);
          opacity: 0;
          transition: opacity 180ms ease;
          pointer-events: none;
        }
        .video-surface:hover .video-overlay,
        .video-surface:focus-within .video-overlay,
        .video-overlay.is-active {
          opacity: 1;
          pointer-events: auto;
        }
        .video-overlay-inner {
          width: 100%;
          padding: 24px 24px 18px;
          color: rgba(255,255,255,0.96);
        }
        .overlay-topline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 12px;
          min-width: 0;
        }
        .overlay-title {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.01em;
          color: rgba(255,255,255,0.92);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          min-width: 0;
        }
        .overlay-time {
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.82);
          white-space: nowrap;
        }
        .overlay-progress {
          position: relative;
          height: 12px;
          width: 100%;
          border-radius: 999px;
          background: rgba(255,255,255,0.42);
          overflow: hidden;
        }
        .overlay-progress-fill {
          height: 100%;
          background: rgba(255,255,255,0.92);
          border-radius: inherit;
        }
        .overlay-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-top: 14px;
        }
        .overlay-group {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }
        .overlay-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border: 0;
          border-radius: 999px;
          color: rgba(255,255,255,0.96);
          background: transparent;
          transition: background 160ms ease, opacity 160ms ease, transform 160ms ease;
        }
        .overlay-button:hover,
        .overlay-button:focus-visible {
          background: rgba(255,255,255,0.12);
        }
        .overlay-button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .overlay-button svg {
          width: 22px;
          height: 22px;
        }
        .mode-button {
          width: auto;
          min-width: 84px;
          gap: 7px;
          padding: 0 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.1);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .mode-button svg {
          width: 18px;
          height: 18px;
        }
        .skip-feedback {
          position: absolute;
          left: 50%;
          bottom: 78px;
          z-index: 2;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-width: 132px;
          border-radius: 999px;
          background: rgba(5, 5, 8, 0.76);
          padding: 10px 14px;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.1;
          color: rgba(255,255,255,0.96);
          box-shadow: 0 14px 30px rgba(0,0,0,0.28);
          animation: skipFeedbackPop 700ms ease both;
          pointer-events: none;
        }
        .skip-feedback svg {
          width: 22px;
          height: 22px;
        }
        .skip-feedback-label {
          white-space: nowrap;
        }
        @keyframes skipFeedbackPop {
          0% { opacity: 0; transform: translate(-50%, 8px) scale(0.94); }
          18% { opacity: 1; transform: translate(-50%, 0) scale(1); }
          78% { opacity: 1; transform: translate(-50%, 0) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -8px) scale(0.98); }
        }
        .volume-tray {
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
        }
        .volume-slider-wrap {
          width: 0;
          overflow: hidden;
          opacity: 0;
          transition: width 180ms ease, opacity 180ms ease;
        }
        .volume-tray:hover .volume-slider-wrap,
        .volume-tray:focus-within .volume-slider-wrap,
        .volume-tray.is-open .volume-slider-wrap {
          width: 108px;
          opacity: 1;
        }
        .progress-fill {
          background: linear-gradient(90deg, #d5c7e2, #9bb0c1 60%, #7a3168);
          transition: width 220ms ease;
          box-shadow: 0 0 18px rgba(122, 49, 104, 0.2);
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
        /* .progress-coin {
          position: absolute;
          top: -40px;
          transform: translateX(-50%);
          pointer-events: none;
        }
        .coin-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          border: 1px solid rgba(59, 44, 87, 0.12);
          background: rgba(255,255,255,0.96);
          padding: 6px 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--usr-muted);
          box-shadow: 0 10px 24px rgba(59, 44, 87, 0.08);
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
        }
        .coin-badge.active {
          color: var(--usr-primary);
          border-color: rgba(122, 49, 104, 0.34);
          box-shadow: 0 12px 30px rgba(122, 49, 104, 0.18);
          transform: translateY(-2px);
        }
        .coin-reward {
          position: absolute;
          top: -84px;
          transform: translateX(-50%);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          background: rgba(17,14,22,0.92);
          padding: 6px 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: white;
          box-shadow: 0 18px 30px rgba(17, 14, 22, 0.22);
          animation: coinRewardRise 1.2s ease forwards;
          pointer-events: none;
        }
        .coin-float {
          position: fixed;
          left: 50%;
          bottom: 28px;
          transform: translateX(-50%);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          background: rgba(17,14,22,0.94);
          padding: 10px 14px;
          color: white;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          box-shadow: 0 20px 48px rgba(17, 14, 22, 0.28);
          animation: coinFloatRise 1.7s ease forwards;
          z-index: 65;
          pointer-events: none;
        }
        @keyframes coinRewardRise {
          0% { opacity: 0; transform: translate(-50%, 8px) scale(0.9); }
          20% { opacity: 1; transform: translate(-50%, 0) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -22px) scale(1.02); }
        }
        @keyframes coinFloatRise {
          0% { opacity: 0; transform: translate(-50%, 16px) scale(0.92); }
          18% { opacity: 1; transform: translate(-50%, 0) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -46px) scale(1.03); }
        }
        .coin-track-pill {
          border: 1px solid rgba(59, 44, 87, 0.1);
          background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(236,241,244,0.88));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.9);
        }
        .coin-track-pill.active {
          border-color: rgba(122, 49, 104, 0.35);
          background: linear-gradient(180deg, rgba(213,199,226,0.78), rgba(255,255,255,0.96));
          box-shadow: 0 12px 24px rgba(122, 49, 104, 0.12);
        }
        .guided-panel {
          position: relative;
          z-index: 71;
          box-shadow: 0 0 0 9999px rgba(17, 14, 22, 0.6), 0 28px 60px rgba(59, 44, 87, 0.34);
        } */
        .control-dock {
          border: 1px solid rgba(59, 44, 87, 0.08);
          background:
            linear-gradient(180deg, rgba(255,255,255,0.92), rgba(245,247,250,0.86)),
            radial-gradient(circle at top, rgba(213,199,226,0.26), transparent 58%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.9),
            0 16px 30px rgba(59, 44, 87, 0.08);
          backdrop-filter: blur(16px);
        }
        .control-button {
          border: 1px solid rgba(59, 44, 87, 0.1);
          background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(236,241,244,0.92));
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.9),
            0 10px 20px rgba(59, 44, 87, 0.08);
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
        }
        .control-button:hover {
          transform: translateY(-1px);
          border-color: rgba(122, 49, 104, 0.22);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.9),
            0 14px 24px rgba(59, 44, 87, 0.12);
        }
        .volume-shell {
          border: 1px solid rgba(59, 44, 87, 0.08);
          background: linear-gradient(180deg, rgba(255,255,255,0.88), rgba(236,241,244,0.82));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.88);
        }
        .volume-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 3px;
          border-radius: 999px;
          background: rgba(255,255,255,0.62);
          outline: none;
          border: 0;
        }
        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #ffffff;
          border: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.24);
        }
        .volume-slider::-moz-range-thumb {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #ffffff;
          border: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.24);
        }
        .ai-aura {
          position: relative;
          isolation: isolate;
        }
        .native-audio-element {
          position: absolute;
          width: 1px;
          height: 1px;
          opacity: 0;
          pointer-events: none;
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
        @media (max-width: 640px) {
          .player-shell {
            overflow: visible;
          }
          .video-overlay {
            opacity: 1;
            pointer-events: auto;
            background: linear-gradient(180deg, rgba(10, 10, 12, 0.02) 0%, rgba(10, 10, 12, 0.08) 42%, rgba(10, 10, 12, 0.66) 100%);
          }
          .video-overlay-inner {
            padding: 14px 12px 12px;
          }
          .overlay-topline {
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 10px;
          }
          .overlay-title {
            font-size: 12px;
          }
          .overlay-time {
            font-size: 11px;
            padding-top: 1px;
          }
          .overlay-controls {
            gap: 6px;
            margin-top: 10px;
          }
          .overlay-group {
            gap: 4px;
          }
          .overlay-button {
            width: 36px;
            height: 36px;
            background: rgba(0,0,0,0.16);
          }
          .overlay-button svg {
            width: 20px;
            height: 20px;
          }
          .overlay-progress {
            height: 14px;
          }
          .skip-feedback {
            bottom: 70px;
            min-width: 120px;
            padding: 9px 12px;
            font-size: 11px;
          }
          .skip-feedback svg {
            width: 20px;
            height: 20px;
          }
          .volume-slider-wrap {
            position: absolute;
            right: 0;
            bottom: 44px;
            border-radius: 999px;
            background: rgba(8,8,10,0.74);
            padding: 12px;
            box-shadow: 0 12px 26px rgba(0,0,0,0.28);
          }
          .volume-tray:hover .volume-slider-wrap,
          .volume-tray:focus-within .volume-slider-wrap,
          .volume-tray.is-open .volume-slider-wrap {
            width: 112px;
          }
        }
        @media (pointer: coarse) {
          .video-overlay {
            opacity: 1;
            pointer-events: auto;
          }
        }
      `}</style>

      {/* {showPlayerTutorial && isUnlocked ? (
        <div className="pointer-events-none fixed inset-0 z-[70] bg-[rgba(17,14,22,0.5)]" />
      ) : null} */}

      <div className="border-b border-[rgba(35,31,32,0.08)] bg-[var(--usr-white)]">
        <div className="flex items-center justify-between px-4 py-3 sm:px-8 sm:py-5">
          <div className="flex items-center">
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
                className={`h-9 w-auto transition duration-300 group-hover:opacity-80 sm:h-10 ${
                  logoDance ? "logo-dance" : ""
                }`}
              />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {/* {authed ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--usr-line)] bg-white/85 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--usr-primary)] shadow-sm">
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path
                    d="M12 3c-4.4 0-8 1.34-8 3v12c0 1.66 3.6 3 8 3s8-1.34 8-3V6c0-1.66-3.6-3-8-3zm0 2c3.87 0 6 .97 6 1s-2.13 1-6 1-6-.97-6-1 2.13-1 6-1z"
                    fill="currentColor"
                  />
                </svg>
                <span>{coinBalance}</span>
              </div>
            ) : null} */}
            {authed ? (
              <button
                type="button"
                onClick={handleAccountClick}
                className="inline-flex h-10 w-10 items-center justify-center bg-[#F4F5F6] text-[var(--usr-ink)] transition hover:bg-[#ebeef0]"
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
                className="inline-flex h-10 w-10 items-center justify-center bg-[#F4F5F6] text-[var(--usr-ink)] transition hover:bg-[#ebeef0]"
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
            {/* <Link
              to="/episodes"
              className="rounded-full border border-[var(--usr-line)] bg-[var(--usr-cloud)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--usr-muted)]"
            >
              Back
            </Link> */}
          </div>
        </div>
      </div>

      <div className="w-full bg-white">
        <div className="player-shell bg-[var(--usr-white)] px-0 pt-0">
          <div className="player-frame">
            <div ref={videoSurfaceRef} className="video-surface relative overflow-hidden bg-black">
            <div className="player-fit w-full">
              {vimeoId ? (
                <div ref={playerMountRef} className="h-full w-full" />
              ) : audioUrl ? (
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#121016]">
                  {episode.image ? (
                    <img src={episode.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45 blur-sm scale-105" />
                  ) : null}
                  <div className="relative z-[1] flex max-w-[86%] flex-col items-center text-center text-white">
                    <p className="text-[10px] uppercase tracking-[0.34em] text-white/70">Now Listening</p>
                    <h2 className="mt-3 text-2xl font-semibold leading-tight sm:text-4xl">{episode.title}</h2>
                  </div>
                </div>
              ) : null}
              {audioUrl ? (
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  className="native-audio-element"
                  preload="auto"
                  controlsList="nodownload"
                />
              ) : null}
              {!vimeoId && !audioUrl ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--usr-cloud)] text-xs uppercase tracking-[0.4em] text-[var(--usr-muted)]">
                  Player Unavailable
                </div>
              ) : null}
              {vimeoId || audioUrl ? (
                <div className={`video-overlay ${isPlaying || isVolumeTrayOpen ? "is-active" : ""}`}>
                  <div className="video-overlay-inner">
                    <div className="overlay-topline">
                      <p className="overlay-title">{episode.title}</p>
                      <p className="overlay-time">
                        {formatTime(playbackSeconds)} / {formatTime(playbackDuration || episode.duration || 0)}
                      </p>
                    </div>
                    <button
                      type="button"
                      ref={progressBarRef}
                      onPointerDown={handleProgressPointerDown}
                      onPointerMove={handleProgressPointerMove}
                      onPointerUp={handleProgressPointerUp}
                      onPointerCancel={handleProgressPointerCancel}
                      className="overlay-progress block w-full cursor-pointer border-0 p-0"
                      aria-label="Seek through episode"
                    >
                      <div className="overlay-progress-fill" style={{ width: `${percent * 100}%` }} />
                    </button>
                    {skipFeedback ? (
                      <div key={skipFeedback.nonce} className="skip-feedback" aria-live="polite">
                        {skipFeedback.direction === "back" ? (
                          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M11 7 5 12l6 5V7Zm8 0-6 5 6 5V7Z" fill="currentColor" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="m13 7 6 5-6 5V7ZM5 7l6 5-6 5V7Z" fill="currentColor" />
                          </svg>
                        )}
                        <span className="skip-feedback-label">{formatSkipFeedbackAmount(skipFeedback.amount)}</span>
                      </div>
                    ) : null}
                    <div className="overlay-controls">
                      <div className="overlay-group">
                        <button
                          type="button"
                          className="overlay-button"
                          onClick={handlePlayPause}
                          aria-label={isPlaying ? "Pause episode" : "Play episode"}
                        >
                          {isPlaying ? (
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path d="M7.5 5.5v13M16.5 5.5v13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path d="M8 6.5v11l9-5.5-9-5.5Z" fill="currentColor" />
                            </svg>
                          )}
                        </button>
                        <button
                          type="button"
                          className="overlay-button"
                          onPointerDown={(event) => handleSkipPressStart(event, -30)}
                          onPointerUp={stopSkipHold}
                          onPointerLeave={stopSkipHold}
                          onPointerCancel={stopSkipHold}
                          onKeyDown={(event) => handleSkipKeyDown(event, -30)}
                          onKeyUp={handleSkipKeyUp}
                          aria-label="Go back 30 seconds"
                        >
                          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M11 7 5 12l6 5V7Zm8 0-6 5 6 5V7Z" fill="currentColor" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="overlay-button"
                          onPointerDown={(event) => handleSkipPressStart(event, 30)}
                          onPointerUp={stopSkipHold}
                          onPointerLeave={stopSkipHold}
                          onPointerCancel={stopSkipHold}
                          onKeyDown={(event) => handleSkipKeyDown(event, 30)}
                          onKeyUp={handleSkipKeyUp}
                          aria-label="Go forward 30 seconds"
                        >
                          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="m13 7 6 5-6 5V7ZM5 7l6 5-6 5V7Z" fill="currentColor" />
                          </svg>
                        </button>
                      </div>

                      <div className="overlay-group">
                        <div
                          className={`volume-tray ${isVolumeTrayOpen ? "is-open" : ""}`}
                          onMouseEnter={() => setIsVolumeTrayOpen(true)}
                          onMouseLeave={() => setIsVolumeTrayOpen(false)}
                        >
                          <button
                            type="button"
                            className="overlay-button"
                            onClick={() => {
                              const nextVolume = isMuted || volume <= 0 ? 1 : 0;
                              const audio = audioRef.current;
                              const player = vimeoPlayerRef.current;
                              setVolume(nextVolume);
                              setIsMuted(nextVolume <= 0);
                              if (audioUrl && audio) {
                                audio.volume = nextVolume;
                                audio.muted = nextVolume <= 0;
                              } else {
                                player?.setVolume(nextVolume).catch(() => undefined);
                              }
                            }}
                            onFocus={() => setIsVolumeTrayOpen(true)}
                            aria-label={isMuted || volume <= 0 ? "Unmute volume" : "Mute volume"}
                          >
                            {isMuted || volume <= 0 ? (
                              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M5 9.5h4L14 5v14l-5-4.5H5v-5Z" fill="currentColor" />
                                <path d="m17 9 4 6M21 9l-4 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M5 9.5h4L14 5v14l-5-4.5H5v-5Z" fill="currentColor" />
                                <path d="M17 9.5a4.5 4.5 0 0 1 0 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                                <path d="M19.5 7a8 8 0 0 1 0 10" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                              </svg>
                            )}
                          </button>
                          <div className="volume-slider-wrap">
                            <input
                              className="volume-slider"
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={volume}
                              onChange={handleVolumeChangeInput}
                              onBlur={() => setIsVolumeTrayOpen(false)}
                              aria-label="Volume"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          className="overlay-button mode-button"
                          disabled
                          aria-label={audioUrl ? "Native audio enabled" : "Video audio enabled"}
                        >
                          {audioUrl ? (
                            <>
                              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M5 12v-1a7 7 0 0 1 14 0v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                <path d="M5 12h3v6H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2ZM19 12h-3v6h3a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2Z" fill="currentColor" />
                              </svg>
                              <span>Audio</span>
                            </>
                          ) : (
                            <>
                              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z" stroke="currentColor" strokeWidth="1.8" />
                                <path d="m10 9 5 3-5 3V9Z" fill="currentColor" />
                              </svg>
                              <span>Video</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          className="overlay-button"
                          onClick={handleFullscreenToggle}
                          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                        >
                          {isFullscreen ? (
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path d="M8 4H4v4M16 4h4v4M8 20H4v-4M20 20h-4v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path d="M9 4H4v5M15 4h5v5M4 15v5h5M20 15v5h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            {/* Episode lock overlay commented out for now. */}
          </div>
          </div>
          <div className="bg-[#EDF2F5] px-5 py-6 sm:px-10 sm:py-9">
            <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--usr-muted)] sm:text-[11px] sm:tracking-[0.34em]">
              Unscripted Room Episode
            </p>
            <h2 className="mt-4 text-2xl font-semibold leading-tight text-black sm:mt-5 sm:text-4xl">{episode.title}</h2>
            <p className="mt-4 max-w-5xl text-sm leading-6 text-[var(--usr-muted)] sm:mt-5 sm:text-base sm:leading-7">
              {episode.summary}
            </p>
            <div className="mt-5 space-y-2 text-sm text-[var(--usr-muted)] sm:mt-7">
              <p>{episode.published}</p>
            </div>
          </div>
          <div className="px-5 py-5 text-xs text-[var(--usr-muted)] sm:px-10 sm:py-6">
            <p>&copy; 2026 UR, All Rights Reserved</p>
            <p className="mt-1">Powered by Curiosity Strategy</p>
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

      {/* {floatingRewards.map((reward) => (
        <div key={reward.id} className="coin-float">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--usr-accent)]" aria-hidden="true">
            <path
              d="M12 3c-4.4 0-8 1.34-8 3v12c0 1.66 3.6 3 8 3s8-1.34 8-3V6c0-1.66-3.6-3-8-3zm0 2c3.87 0 6 .97 6 1s-2.13 1-6 1-6-.97-6-1 2.13-1 6-1zm0 6c3.87 0 6 .97 6 1s-2.13 1-6 1-6-.97-6-1 2.13-1 6-1zm0 6c3.87 0 6 .97 6 1s-2.13 1-6 1-6-.97-6-1 2.13-1 6-1z"
              fill="currentColor"
            />
          </svg>
          +{reward.amount} coins
        </div>
      ))} */}

    </div>
  );
}
