// src/pages/app/TeamChemistry/index.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Routes,
  Route,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  LocalParticipant,
  ConnectionState,
  Track,
  LocalTrackPublication,
  TrackPublication,
  ParticipantEvent,
} from "livekit-client";

/** ===========================
 *  Assets (PNG) – helper & map
 *  ===========================
 */
const A = (p: string) =>
  new URL(
    `./assets/virtual challenge 1 interface/assets/${p}`,
    import.meta.url
  ).href;

const ART = {
  bg: A("challenge 1 background.png"),
  boat: A("challenge 1 boat silhouette.png"),
  slotEmpty: A("initiate Card space.png"),
  submitCta: A("submit cta.png"),
  arrowLeft: A("arrow left.png"),
  clock: A("clock.png"),
  camera: A("camera.png"),
  micMuted: A("microphone muted.png"),
  exit: A("exit button.png"),
  alert: A("alert icon.png"),
  placedFrames: [
    A("Survival Gear Card with shadow 01.png"),
    A("Survival Gear Card with shadow 02.png"),
    A("Survival Gear Card with shadow 03.png"),
    A("Survival Gear Card with shadow 04.png"),
    A("Survival Gear Card with shadow 05.png"),
    A("Survival Gear Card with shadow 06.png"),
    A("Survival Gear Card with shadow 07.png"),
    A("Survival Gear Card with shadow 08.png"),
    A("Survival Gear Card with shadow 09.png"),
    A("Survival Gear Card with shadow 10.png"),
    A("Survival Gear Card with shadow 11.png"),
    A("Survival Gear Card with shadow 12.png"),
  ],
  handFramesPartial: {
    7: A("example for cards to be held in hand/Survival Gear Card07.png"),
    8: A("example for cards to be held in hand/Survival Gear Card08.png"),
    9: A("example for cards to be held in hand/Survival Gear Card09.png"),
    10: A("example for cards to be held in hand/Survival Gear Card10.png"),
    11: A("example for cards to be held in hand/Survival Gear Card11.png"),
    12: A("example for cards to be held in hand/Survival Gear Card12.png"),
  } as Record<number, string>,
};

/** ===========================
 *  Lobby assets
 *  ===========================
 */
const LB = (p: string) =>
  new URL(
    `./assets/lobby/Virtual Team Chemistry Lobby white background/separate assets/${p}`,
    import.meta.url
  ).href;
const LOBBY = {
  copyLink: LB("link invite cta.png"),
  copyLinkNote: LB("link invite with note.png"),
  emailInvite: LB("email invite cta.png"),
  micOn: LB("microphone.png"),
  micOff: LB("microphone off.png"),
  camOn: LB("camera.png"),
  camOff: LB("camera off.png"),
  readyCta: LB("ready cta.png"),
  readyDark: LB("ready dark cta.png"),
  startGame: LB("game start cta.png"),
  replay: LB("replay cta.png"),
  mapActive1: new URL(
    "./assets/lobby/Virtual Team Chemistry Lobby white background/map_challenge 01 active.png",
    import.meta.url
  ).href,
};

/** ===========================
 *  Debrief assets
 *  ===========================
 */
const DB = (p: string) =>
  new URL(
    `./assets/debrief/Final_TC debrief/Debrief Assets/${p}`,
    import.meta.url
  ).href;
const DEBRIEF = {
  clock: DB("clock.png"),
  camera: DB("camera.png"),
  micOff: DB("microphone off.png"),
  videoOff: DB("video off.png"),
  raiseHand: DB("raise hand icon.png"),
  handOff: DB("hand off.png"),
  question: DB("question.png"),
  closeIcon: DB("Icon/Close.png"),
  challengePassed: DB("Challenge passed.png"),
  challengeFailed: DB("Challenge failed.png"),
};

// Small inline green check badge for lobby readiness
const READY_CHECK =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='24' r='24' fill='%2316a34a'/%3E%3Cpath d='M14 24.5 20.5 31 34 17.5' stroke='white' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

/********************************
 * API helper
 ********************************/
const API_URL =
  (import.meta as any).env?.VITE_API_URL ||
  (window as any).__CS_API_BASE__ ||
  "https://unsuggestive-darian-irremediable.ngrok-free.dev";

function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function api(path: string, opts: RequestInit = {}) {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(opts.headers || {}),
    },
    credentials: "omit",
  });
  if (!res.ok) {
    let detail = "";
    try {
      const j = await res.json();
      detail = (j as any)?.error || JSON.stringify(j);
    } catch {}
    throw new Error(
      `${res.status} ${res.statusText}${detail ? ` – ${detail}` : ""}`
    );
  }
  return res.json();
}

/********************************
 * Types & Identity
 ********************************/
type Phase = "map" | "lobby" | "game" | "debrief";

type GroupBoardState = {
  board: (string | null)[];
  pool: string[];
  /** cardId -> "locked" | null (we only use "locked") */
  locks: Record<string, string | null>;
};

type Snapshot = {
  phase: Phase;
  groups: Record<string, GroupBoardState>; // keyed by groupId (e.g. "G1")
};

type GroupMeta = {
  id: string; // "G1"
  label: string; // "Room 1"
  memberIds: string[];
};

type GroupState = "playing" | "submitted" | "misaligned"; // red, green, yellow

function getIdentity() {
  let id = localStorage.getItem("cs_identity");
  if (!id) {
    // @ts-ignore
    id =
      (crypto?.randomUUID?.() as string) ||
      Math.random().toString(36).slice(2);
    localStorage.setItem("cs_identity", id);
  }
  return id;
}

const safeParse = <T,>(raw: string): T | null => {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

/********************************
 * Breakout patterns
 ********************************/
// # of players -> [Room1, Room2, Room3, Room4]
const GROUP_PATTERNS: Record<number, number[]> = {
  2: [1, 1],
  3: [1, 1, 1],
  4: [2, 2],
  5: [2, 2, 1],
  6: [2, 2, 2],
  7: [3, 2, 2],
  8: [3, 3, 2],
  9: [3, 3, 3],
  10: [4, 3, 3],
  11: [4, 4, 3],
  12: [4, 4, 4],
  13: [4, 3, 3, 3],
  14: [4, 4, 3, 3],
  15: [4, 4, 4, 3],
  16: [4, 4, 4, 4],
  17: [5, 4, 4, 4],
  18: [5, 5, 4, 4],
  19: [5, 5, 5, 4],
  20: [5, 5, 5, 5],
};
function computeGroupPattern(total: number): number[] {
  const pattern = GROUP_PATTERNS[total];
  if (pattern) return pattern;

  // Fallbacks outside 2–20
  if (total <= 0) return [];
  if (total <= 4) return [total];

  const maxGroups = 4;
  const groups = Math.min(maxGroups, total);
  const base = Math.floor(total / groups);
  const remainder = total % groups;
  const result: number[] = [];
  for (let i = 0; i < groups; i++) {
    result.push(base + (i < remainder ? 1 : 0));
  }
  return result;
}

/********************************
 * LiveKit Data bus
 ********************************/
type BusMsg =
  | { type: "PHASE_CHANGE"; phase: Phase }
  | { type: "PHASE_STATE"; v: number; phase: Phase }
  | { type: "SYNC_REQUEST" }
  | { type: "SNAPSHOT"; v: number; snapshot: Snapshot }
  | {
      type: "PLACE_CARD_REQUEST";
      groupId: string;
      cardId: string;
      slotIndex: number;
    }
  | { type: "REMOVE_CARD_REQUEST"; groupId: string; slotIndex: number }
  | { type: "READY_TOGGLE"; userId: string; ready: boolean }
  | { type: "READY_STATE"; ready: Record<string, boolean> }
  | { type: "GAME_TICK"; secondsRemaining: number }
  | { type: "DEBRIEF_TICK"; secondsRemaining: number }
  | { type: "GROUPS_CONFIG"; groups: GroupMeta[] }
  | { type: "GROUP_SUBMIT"; groupId: string; items: string[] }
  | { type: "GROUP_STATES"; states: Record<string, GroupState> }
  | { type: "ROUND_STATUS"; submitted: Record<string, boolean>; attemptsLeft: number }
  | { type: "ROUND_RESULT"; lockedItems: string[]; attemptsLeft: number }
  | { type: "ANNOUNCE"; text: string }
  | { type: "GAME_RESULT"; success: boolean; failVariant?: 1 | 2 | 3 }
  | { type: "ROUND_COOLDOWN"; secondsRemaining: number }
  | { type: "HOST_ID"; hostId: string };

function useLivekitData(room: Room | null) {
  const listenersRef = useRef<((m: BusMsg) => void)[]>([]);

  useEffect(() => {
    if (!room) return;
    const onData = (p: Uint8Array) => {
      try {
        const m = JSON.parse(new TextDecoder().decode(p)) as BusMsg;
        listenersRef.current.forEach((f) => f(m));
      } catch {}
    };
    room.on(RoomEvent.DataReceived, onData as any);
    return () => room.off(RoomEvent.DataReceived, onData as any);
  }, [room]);

  const onMessage = useCallback((fn: (m: BusMsg) => void) => {
    listenersRef.current.push(fn);
    return () => {
      listenersRef.current = listenersRef.current.filter((f) => f !== fn);
    };
  }, []);

  const sendReliable = useCallback(
    (m: BusMsg) => {
      if (!room) return;
      room.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify(m)),
        { reliable: true }
      );
    },
    [room]
  );

  const sendLossy = useCallback(
    (m: BusMsg) => {
      if (!room) return;
      room.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify(m)),
        { reliable: false }
      );
    },
    [room]
  );

  return { onMessage, sendReliable, sendLossy };
}

/********************************
 * Helpers: track checks + subscription mesh
 ********************************/
function micEnabled(r: Room | null) {
  if (!r) return false;
  const pub = r.localParticipant.getTrackPublication(
    Track.Source.Microphone
  ) as LocalTrackPublication | undefined;
  return !!pub && !pub.isMuted;
}
function camEnabled(r: Room | null) {
  if (!r) return false;
  const pub = r.localParticipant.getTrackPublication(
    Track.Source.Camera
  ) as LocalTrackPublication | undefined;
  return !!pub && !pub.isMuted;
}
function ensureAllSubscribed(r: Room | null) {
  if (!r) return;
  for (const rp of r.remoteParticipants.values()) {
    for (const pub of rp.trackPublications.values()) {
      try {
        if (!pub.isSubscribed) pub.setSubscribed(true);
      } catch {}
    }
  }
}
// GAME ONLY: only subscribe to audio from your breakout group
function ensureGroupAudioSubscriptions(
  r: Room | null,
  groups: GroupMeta[],
  myGroupId: string | null
) {
  if (!r) return;
  // If we don't have breakout info yet, just subscribe to everyone
  if (!groups.length || !myGroupId) {
    ensureAllSubscribed(r);
    return;
  }
  const myGroup = groups.find((g) => g.id === myGroupId);
  if (!myGroup) {
    ensureAllSubscribed(r);
    return;
  }
  const allowed = new Set(myGroup.memberIds.map(String));
  for (const rp of r.remoteParticipants.values()) {
    const inMyGroup = allowed.has(String(rp.identity));
    for (const pub of rp.trackPublications.values()) {
      const isAudio =
        (pub as any).source === Track.Source.Microphone ||
        (pub as any).kind === Track.Kind.Audio ||
        ((pub as any).track &&
          (pub as any).track.kind &&
          (pub as any).track.kind.toLowerCase() === "audio");
      if (!isAudio) continue;
      try {
        pub.setSubscribed(inMyGroup);
      } catch {}
    }
  }
}

/********************************
 * Chemistry Context
 ********************************/
type ChemCtx = {
  phase: Phase;
  setPhase: (p: Phase) => void;

  hostId: string | null;
  setHostId: (id: string | null) => void;

  code: string | null;
  setCode: (c: string | null) => void;

  room: Room | null;
  setRoom: (r: Room | null) => void;
  joinRoom: (code: string) => Promise<void>;

  ensureAudioStart: () => void;
  setDesiredMic: (on: boolean) => void;
  setDesiredCam: (on: boolean) => void;

  // Breakouts / alignment
  groups: GroupMeta[];
  setGroups: (g: GroupMeta[]) => void;
  myGroupId: string | null;
  setMyGroupId: (id: string | null) => void;

  groupStates: Record<string, GroupState>;
  setGroupStates: (m: Record<string, GroupState>) => void;

  gameResult: "pending" | "success" | "failure";
  setGameResult: (r: "pending" | "success" | "failure") => void;
  failVariant: 1 | 2 | 3 | null;
  setFailVariant: (v: 1 | 2 | 3 | null) => void;
};
const ChemistryContext = createContext<ChemCtx | null>(null);
function useChem() {
  const v = useContext(ChemistryContext);
  if (!v) throw new Error("useChem outside provider");
  return v;
}

/********************************
 * Mic/Cam controls (vertical stack)
 ********************************/
function MicCamControlsVertical() {
  const { room, ensureAudioStart, setDesiredMic, setDesiredCam } = useChem();
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);

  const refreshFromRoom = useCallback(() => {
    if (!room) return;
    setMicOn(micEnabled(room));
    setCamOn(camEnabled(room));
  }, [room]);

  useEffect(() => {
    if (!room) return;
    refreshFromRoom();
    const rerender = () => refreshFromRoom();

    room.on(RoomEvent.ConnectionStateChanged, rerender);
    room.on(RoomEvent.TrackMuted, rerender as any);
    room.on(RoomEvent.TrackUnmuted, rerender as any);
    room.on(RoomEvent.LocalTrackPublished, rerender as any);
    room.on(RoomEvent.LocalTrackUnpublished, rerender as any);

    const onCustom = () => refreshFromRoom();
    window.addEventListener("cs-media-change", onCustom);

    return () => {
      room.off(RoomEvent.ConnectionStateChanged, rerender);
      room.off(RoomEvent.TrackMuted, rerender as any);
      room.off(RoomEvent.TrackUnmuted, rerender as any);
      room.off(RoomEvent.LocalTrackPublished, rerender as any);
      room.off(RoomEvent.LocalTrackUnpublished, rerender as any);
      window.removeEventListener("cs-media-change", onCustom);
    };
  }, [room, refreshFromRoom]);

  const toggleMic = async () => {
    if (!room) return;
    const next = !micOn;
    setDesiredMic(next);
    if (next !== micEnabled(room)) {
      try {
        await room.localParticipant.setMicrophoneEnabled(next);
        setMicOn(next);
        ensureAudioStart();
        window.dispatchEvent(new CustomEvent("cs-media-change"));
      } catch {}
    }
  };

  const toggleCam = async () => {
    if (!room) return;
    const next = !camOn;
    setDesiredCam(next);
    if (next !== camEnabled(room)) {
      try {
        await room.localParticipant.setCameraEnabled(next);
        setCamOn(next);
        ensureAudioStart();
        window.dispatchEvent(new CustomEvent("cs-media-change"));
      } catch {}
    }
  };

  return (
    <div className="flex items-center gap-3">
      <DebriefControlButton
        icon={micOn ? LOBBY.micOn : LOBBY.micOff}
        active={micOn}
        onClick={toggleMic}
        size={72}
      />
      <DebriefControlButton
        icon={camOn ? LOBBY.camOn : LOBBY.camOff}
        active={camOn}
        onClick={toggleCam}
        size={72}
      />
    </div>
  );
}

/********************************
 * Provider
 ********************************/
function ChemistryProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>("map");
  const [hostId, setHostId] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);

  const desiredMicOn = useRef(true);
  const desiredCamOn = useRef(true);

  const [groups, setGroups] = useState<GroupMeta[]>([]);
  const [myGroupId, setMyGroupId] = useState<string | null>(null);

  const [groupStates, setGroupStates] = useState<Record<string, GroupState>>(
    {}
  );

  const [gameResult, setGameResult] =
    useState<"pending" | "success" | "failure">("pending");
  const [failVariant, setFailVariant] = useState<1 | 2 | 3 | null>(null);

  const setDesiredMic = (on: boolean) => (desiredMicOn.current = on);
  const setDesiredCam = (on: boolean) => (desiredCamOn.current = on);

  const ensureAudioStart = useCallback(() => {
    if (!room) return;
    room.startAudio().catch(() => {});
  }, [room]);

  const joinRoom = useCallback(
    async (roomCode: string) => {
      if (room && code === roomCode && room.state === ConnectionState.Connected)
        return;

      if (room) {
        try {
          await room.disconnect();
        } catch {}
        setRoom(null);
      }

      const identity = getIdentity();
      const { token, url } = await api(`/api/v1/livekit/token`, {
        method: "POST",
        body: JSON.stringify({ room: roomCode, identity }),
      });

      if (!url || !/^wss?:\/\//.test(url))
        throw new Error(`Invalid LiveKit URL from server: "${url}"`);

      const r = new Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      r.on(RoomEvent.TrackPublished, (pub) => {
        try {
          if ((pub as any)?.participant?.isLocal) return;
          if (!pub.isSubscribed) pub.setSubscribed(true);
        } catch {}
        r.startAudio().catch(() => {});
      });

      r.on(RoomEvent.ParticipantConnected, (rp) => {
        try {
          for (const pub of rp.trackPublications.values()) {
            if (!pub.isSubscribed) pub.setSubscribed(true);
          }
        } catch {}
        r.startAudio().catch(() => {});
      });

      r.on(RoomEvent.ConnectionStateChanged, (s) =>
        console.log("[LiveKit] state:", s)
      );

      try {
        await r.connect(url, token, { autoSubscribe: true });
      } catch (e: any) {
        console.error("[LiveKit] connect failed", e);
        throw new Error(
          e?.message?.includes("engine not connected")
            ? "Could not establish media connection. Check network/TURN or signaling URL."
            : e?.message || "Failed to connect to room"
        );
      }

      ensureAllSubscribed(r);
      try {
        await r.startAudio();
      } catch {}

      if (desiredMicOn.current !== micEnabled(r)) {
        try {
          await r.localParticipant.setMicrophoneEnabled(
            desiredMicOn.current
          );
        } catch {}
      }
      if (desiredCamOn.current !== camEnabled(r)) {
        try {
          await r.localParticipant.setCameraEnabled(desiredCamOn.current);
        } catch {}
      }

      setRoom(r);
      setCode(roomCode);
      window.dispatchEvent(new CustomEvent("cs-media-change"));
    },
    [room, code]
  );

  useEffect(() => {
    return () => {
      try {
        room?.disconnect();
      } catch {}
    };
  }, [room]);

  const value = useMemo(
    () => ({
      phase,
      setPhase,
      hostId,
      setHostId,
      code,
      setCode,
      room,
      setRoom,
      joinRoom,
      ensureAudioStart,
      setDesiredMic,
      setDesiredCam,
      groups,
      setGroups,
      myGroupId,
      setMyGroupId,
      groupStates,
      setGroupStates,
      gameResult,
      setGameResult,
      failVariant,
      setFailVariant,
    }),
    [
      phase,
      hostId,
      code,
      room,
      joinRoom,
      ensureAudioStart,
      groups,
      myGroupId,
      groupStates,
      gameResult,
      failVariant,
    ]
  );

  return (
    <ChemistryContext.Provider value={value}>
      {children}
    </ChemistryContext.Provider>
  );
}

/********************************
 * Clock
 ********************************/
function usePhaseTimer(
  phase: Phase,
  isAdmin: boolean,
  data: ReturnType<typeof useLivekitData>,
  initialSecs: number
) {
  const [seconds, setSeconds] = useState(initialSecs);
  useEffect(() => setSeconds(initialSecs), [initialSecs]);

  useEffect(() => {
    return data.onMessage((m) => {
      if (phase === "game" && m.type === "GAME_TICK")
        setSeconds(m.secondsRemaining);
      if (phase === "debrief" && m.type === "DEBRIEF_TICK")
        setSeconds(m.secondsRemaining);
    });
  }, [data, phase]);

  useEffect(() => {
    if (!isAdmin) return;
    if (!(phase === "game" || phase === "debrief")) return;

    const kind = phase === "game" ? "GAME_TICK" : "DEBRIEF_TICK";
    const id = setInterval(() => {
      setSeconds((s) => {
        const next = Math.max(0, s - 1);
        data.sendReliable({
          type: kind as any,
          secondsRemaining: next,
        } as BusMsg);
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isAdmin, phase, data]);

  return seconds;
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const a = ((angle - 90) * Math.PI) / 180.0;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
function piePath(cx: number, cy: number, r: number, pct: number) {
  const clamped = Math.max(0, Math.min(1, pct));
  if (clamped === 0) return "";
  if (clamped === 1) {
    const p1 = polarToCartesian(cx, cy, r, 0);
    return [
      `M ${cx} ${cy}`,
      `L ${p1.x} ${p1.y}`,
      `A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r}`,
      `A ${r} ${r} 0 1 1 ${p1.x} ${p1.y}`,
      "Z",
    ].join(", ");
  }
  const sweepAngle = 360 * clamped;
  const endAngle = sweepAngle;
  const start = polarToCartesian(cx, cy, r, 0);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = sweepAngle > 180 ? 1 : 0;
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`,
    "Z",
  ].join(", ");
}

function ClockWithRim({
  total,
  remaining,
  size = 60,
  rim = 6,
}: {
  total: number;
  remaining: number;
  size?: number;
  rim?: number;
}) {
  const pct = total > 0 ? remaining / total : 0;
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 1;
  const innerR = R - rim;
  const d = piePath(cx, cy, innerR, pct);
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={cx} cy={cy} r={R} fill="white" />
      <circle cx={cx} cy={cy} r={innerR} fill="rgba(0,0,0,0.2)" />
      {d && (
        <path d={d} fill="white" style={{ transition: "d 0.4s linear" } as any} />
      )}
    </svg>
  );
}

/********************************
 * Video Hub (centered, max 4) – used ONLY for GAME in topbar
 ********************************/
function ensureHostForRoom(
  room: Room | null,
  hostId: string | null,
  setHostId: (id: string | null) => void,
  broadcast?: (id: string) => void
) {
  if (!room) return;
  const ids = [
    room.localParticipant,
    ...Array.from(room.remoteParticipants.values()),
  ]
    .map((p) => String(p.identity || ""))
    .filter(Boolean)
    .sort();
  if (!ids.length) return;
  const candidate = ids[0]; // deterministic host: lexicographically first identity
  if (hostId === candidate) return;
  setHostId(candidate);
  if (broadcast && candidate === String(room.localParticipant.identity || "")) {
    broadcast(candidate);
  }
}

function useAttachAudio(p: RemoteParticipant | LocalParticipant) {
  const { room } = useChem();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const attach = () => {
      const selfId = room?.localParticipant.identity;
      if (p.identity === selfId) return;
      const pubs: TrackPublication[] =
        (p as any).getTrackPublications?.() ??
        Array.from(((p as any).audioTracks?.values?.() ?? []) as Iterable<any>);
      let apub =
        pubs.find((pub: any) => pub?.source === Track.Source.Microphone) ||
        pubs.find((pub: any) => (pub as any).kind === Track.Kind.Audio);
      const at = (apub as any)?.audioTrack ?? (apub as any)?.track;
      if (at && audioRef.current) {
        try {
          at.attach(audioRef.current);
          audioRef.current.play?.().catch(() => {});
        } catch {}
      }
    };
    attach();
    const re = attach as any;
    (p as any).on?.(ParticipantEvent.TrackSubscribed, re);
    (p as any).on?.(ParticipantEvent.TrackUnsubscribed, re);
    (p as any).on?.(ParticipantEvent.TrackMuted, re);
    (p as any).on?.(ParticipantEvent.TrackUnmuted, re);
    return () => {
      (p as any).off?.(ParticipantEvent.TrackSubscribed, re);
      (p as any).off?.(ParticipantEvent.TrackUnsubscribed, re);
      (p as any).off?.(ParticipantEvent.TrackMuted, re);
      (p as any).off?.(ParticipantEvent.TrackUnmuted, re);
    };
  }, [p, room]);
  return audioRef;
}

function VideoHub() {
  const { room, groups, myGroupId } = useChem();
  const [, force] = useState(0);

  useEffect(() => {
    if (!room) return;
    const rerender = () => {
      // keep audio scoped to group on any change
      ensureGroupAudioSubscriptions(room, groups, myGroupId);
      force((x) => x + 1);
    };
    // initial
    ensureGroupAudioSubscriptions(room, groups, myGroupId);
    const evs: any[] = [
      RoomEvent.ParticipantConnected,
      RoomEvent.ParticipantDisconnected,
      RoomEvent.TrackPublished,
      RoomEvent.TrackSubscribed,
      RoomEvent.TrackUnsubscribed,
      RoomEvent.LocalTrackPublished,
      RoomEvent.LocalTrackUnpublished,
      RoomEvent.TrackMuted,
      RoomEvent.TrackUnmuted,
      RoomEvent.ConnectionStateChanged,
    ];
    evs.forEach((e) => room.on(e as any, rerender));
    return () => evs.forEach((e) => room.off(e as any, rerender));
  }, [room, groups, myGroupId]);

  const participants: (RemoteParticipant | LocalParticipant)[] = useMemo(() => {
    if (!room) return [];
    const allRemotes = Array.from(room.remoteParticipants.values());
    const everyone: (RemoteParticipant | LocalParticipant)[] = [
      room.localParticipant,
      ...allRemotes,
    ];
    // If no breakouts, just show up to 4 people
    if (!groups.length || !myGroupId) return everyone.slice(0, 4);
    const myGroup = groups.find((g) => g.id === myGroupId);
    if (!myGroup) return everyone.slice(0, 4);
    const allowed = new Set(myGroup.memberIds.map(String));
    return everyone
      .filter((p) => allowed.has(String(p.identity)))
      .slice(0, 4);
  }, [room, groups, myGroupId]);

  if (!room) return null;
  return (
    <div className="flex items-center justify-center gap-4">
      {participants.map((p) => (
        <VideoBubble key={p.identity} p={p} />
      ))}
    </div>
  );
}

function VideoBubble({ p }: { p: RemoteParticipant | LocalParticipant }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const audioRef = useAttachAudio(p);
  const { room } = useChem();

  const getVideoTrack = useCallback(() => {
    const pubs: TrackPublication[] = Array.from(
      (p as any).trackPublications?.values?.() ?? []
    );
    let selected =
      pubs.find((pub: any) => pub?.source === Track.Source.Camera) ??
      pubs.find(
        (pub: any) =>
          (pub?.track?.kind ?? pub?.kind) === Track.Kind.Video
      ) ??
      pubs[0];
    const vt =
      (selected as any)?.videoTrack ?? (selected as any)?.track ?? null;
    return vt;
  }, [p]);

  const attach = useCallback(() => {
    try {
      const vt = getVideoTrack();
      if (ref.current && vt?.attach) {
        vt.attach(ref.current);
        // @ts-ignore
        ref.current?.play?.().catch(() => {});
      }
    } catch {}
  }, [getVideoTrack]);

  useEffect(() => {
    attach();
    const t1 = setTimeout(attach, 150);
    const t2 = setTimeout(attach, 500);
    const re = attach as any;
    (p as any).on?.(ParticipantEvent.TrackSubscribed, re);
    (p as any).on?.(ParticipantEvent.TrackUnsubscribed, re);
    (p as any).on?.(ParticipantEvent.LocalTrackPublished, re);
    (p as any).on?.(ParticipantEvent.LocalTrackUnpublished, re);
    (p as any).on?.(ParticipantEvent.TrackMuted, re);
    (p as any).on?.(ParticipantEvent.TrackUnmuted, re);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      try {
        const vt = getVideoTrack();
        if (vt?.detach && ref.current) vt.detach(ref.current);
      } catch {}
      (p as any).off?.(ParticipantEvent.TrackSubscribed, re);
      (p as any).off?.(ParticipantEvent.TrackUnsubscribed, re);
      (p as any).off?.(ParticipantEvent.LocalTrackPublished, re);
      (p as any).off?.(ParticipantEvent.LocalTrackUnpublished, re);
      (p as any).off?.(ParticipantEvent.TrackMuted, re);
      (p as any).off?.(ParticipantEvent.TrackUnmuted, re);
    };
  }, [attach, p, getVideoTrack]);

  const size = 120;
  const selfIdentity = room?.localParticipant.identity;
  const isSelf = selfIdentity === p.identity;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={isSelf}
        className="rounded-full object-cover border border-white/60 shadow-[0_0_0_3px_rgba(0,0,0,0.25)]"
        style={{ width: size, height: size }}
      />
      {!isSelf && <audio ref={audioRef} autoPlay />}
      <div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[11px] px-1.5 py-0.5 rounded bg-black/55 whitespace-nowrap"
        title={p.identity}
      >
        {p.identity}
      </div>
    </div>
  );
}

/********************************
 * Group status icons
 ********************************/
function GroupPill({ name, state }: { name: string; state: GroupState }) {
  return (
    <div className="relative w-9 h-9 rounded-full bg-white/80 text-black grid place-items-center text-[11px] font-semibold">
      {name}
      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full grid place-items-center bg-white">
        {state === "submitted" ? (
          <div className="w-3 h-3 rounded-full bg-green-500 grid place-items-center">
            <span className="text-[9px] leading-none text-white">✓</span>
          </div>
        ) : state === "misaligned" ? (
          <div className="w-3 h-3 rounded-full bg-yellow-400 grid place-items-center">
            <span className="text-[9px] leading-none text-black">!</span>
          </div>
        ) : (
          <div className="w-3 h-3 rounded-full bg-red-500" />
        )}
      </div>
    </div>
  );
}

/********************************
 * Top Bar – phase-aware, real breakout status
 ********************************/
function AttemptsBadge() {
  const [attempts, setAttempts] = useState(5);
  useEffect(() => {
    const onAttempts = (e: any) => {
      if (typeof e.detail?.attemptsLeft === "number")
        setAttempts(e.detail.attemptsLeft);
    };
    window.addEventListener("tc-attempts", onAttempts as any);
    return () => window.removeEventListener("tc-attempts", onAttempts as any);
  }, []);
  return (
    <div className="px-2 py-1 rounded-md bg-white/15 text-[12px]">
      Attempts: <span className="font-semibold">{attempts}</span>
    </div>
  );
}

function TopBar({
  phase,
  phaseTimerSeconds,
  phaseTotalSeconds,
}: {
  phase: Phase;
  phaseTimerSeconds: number;
  phaseTotalSeconds: number;
}) {
  const nav = useNavigate();
  const { groups, groupStates, myGroupId } = useChem();

  const mm = String(Math.floor(phaseTimerSeconds / 60)).padStart(2, "0");
  const ss = String(phaseTimerSeconds % 60).padStart(2, "0");

  const pills: { name: string; state: GroupState }[] = useMemo(
    () =>
      groups.map((g, idx) => ({
        name: g.id || `G${idx + 1}`,
        state: groupStates[g.id] || "playing",
      })),
    [groups, groupStates]
  );

  return (
    <div className="px-4 sm:px-6 py-3 flex items-center justify-between text-white gap-4">
      <div className="flex items-center gap-3">
        <ClockWithRim
          total={phaseTotalSeconds}
          remaining={phaseTimerSeconds}
          size={60}
          rim={7}
        />
        <span className="text-2xl font-semibold tracking-tight">
          {mm}:{ss}
        </span>
        {phase === "game" && (
          <span className="ml-3 text-sm opacity-80">
            You are <span className="font-semibold">{myGroupId ?? "G?"}</span>
          </span>
        )}
      </div>

      {/* ONLY show video hub + mic/cam in GAME */}
      {phase === "game" ? (
        <div className="flex-1 min-w-0 flex items-center justify-center gap-4">
          <VideoHub />
          <MicCamControlsVertical />
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Real breakout group status + attempts */}
      <div className="flex items-center gap-3 shrink-0">
        {phase === "game" && <AttemptsBadge />}
        <div className="flex items-center gap-2">
          {pills.map((g) => (
            <GroupPill key={g.name} name={g.name} state={g.state} />
          ))}
        </div>
        <button title="Exit" onClick={() => nav("/app/map")} className="ml-1">
          <img src={ART.exit} alt="exit" width={24} height={24} />
        </button>
      </div>
    </div>
  );
}

/********************************
 * Persistent Shell
 ********************************/
function ChemistryShell({
  children,
  phaseTimerSeconds,
  phaseTotalSeconds,
}: {
  children: React.ReactNode;
  phaseTimerSeconds: number;
  phaseTotalSeconds: number;
}) {
  const { phase } = useChem();
  const loc = useLocation();
  const pathname = loc.pathname || "";
  const isLobby = phase === "lobby";
  const isMap =
    phase === "map" ||
    pathname.endsWith("/map") ||
    pathname.includes("/map/") ||
    pathname === "/app" ||
    pathname === "/app/";

  const containerClass = isMap
    ? "relative flex-1 max-w-none mx-auto w-full px-0 pb-0 overflow-hidden min-h-0"
    : `relative flex-1 max-w-[1400px] mx-auto w-full min-h-0 ${
        isLobby
          ? "px-4 sm:px-5 pb-4 overflow-hidden"
          : "px-4 sm:px-6 pb-6 overflow-y-auto"
      }`;
  return (
    <div
      className={`min-h-screen h-screen flex flex-col relative ${
        isLobby ? "text-black" : "text-neutral-50"
      }`}
      style={
        isLobby
          ? { backgroundColor: "white" }
          : {
              backgroundImage: `url(${ART.bg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
      }
    >
      {!isMap && (
        <TopBar
          phase={phase}
          phaseTimerSeconds={phaseTimerSeconds}
          phaseTotalSeconds={phaseTotalSeconds}
        />
      )}
      <div className={containerClass}>
        <div className="min-h-full h-full">{children}</div>
      </div>
    </div>
  );
}

/********************************
 * Status Panel
 ********************************/
function StatusPanel() {
  const loc = useLocation();
  const { code, phase, room } = useChem();
  return (
    <div className="text-[12px] opacity-80 space-y-1">
      <div>Path: {loc.pathname + loc.search}</div>
      <div>Room: {code ?? "-"}</div>
      <div>Phase: {phase}</div>
      <div>Conn: {room?.state ?? "none"}</div>
    </div>
  );
}

/********************************
 * Guards
 ********************************/
function usePhaseGuard(target: Phase) {
  const nav = useNavigate();
  const { phase } = useChem();
  useEffect(() => {
    const order: Phase[] = ["map", "lobby", "game", "debrief"];
    const canEnter =
      order.indexOf(phase) >= order.indexOf(target) || target === "map";
    if (!canEnter) nav("/app/" + phase, { replace: true });
  }, [phase, target, nav]);
}

/********************************
 * Map
 ********************************/
function MapScreen() {
  usePhaseGuard("map");
  const nav = useNavigate();
  const { joinRoom, setPhase, ensureAudioStart } = useChem();

  const MAP_ASSET = (p: string) =>
    new URL(`./assets/map/Final_TC Map/Assets/${p}`, import.meta.url).href;
  const ICON = (i: 1 | 2 | 3 | 4 | 5 | 6) =>
    MAP_ASSET(`icon challenge ${String(i)} normal.png`);

  const TOP_Y = 28;
  const BOTTOM_Y = 72;
  const NODES: {
    id: 1 | 2 | 3 | 4 | 5 | 6;
    xPct: number;
    yPct: number;
    label: string;
  }[] = [
    { id: 1, xPct: 11, yPct: TOP_Y, label: "Mission 1" },
    { id: 2, xPct: 42, yPct: TOP_Y, label: "Mission 2" },
    { id: 3, xPct: 73, yPct: TOP_Y, label: "Mission 3" },
    { id: 4, xPct: 23, yPct: BOTTOM_Y, label: "Mission 4" },
    { id: 5, xPct: 56, yPct: BOTTOM_Y, label: "Mission 5" },
    { id: 6, xPct: 89, yPct: BOTTOM_Y, label: "Mission 6" },
  ];

  const start = async (roomCode: string, admin: boolean) => {
    try {
      await joinRoom(roomCode);
      ensureAudioStart();
      setPhase("lobby");
      nav(`lobby?code=${roomCode}${admin ? "&admin=1" : ""}`);
    } catch (e: any) {
      alert(`Failed to join room: ${e.message}`);
    }
  };

  const onNodeClick = (id: number) => start(`M${id}`, true);

  const MAP_BG = MAP_ASSET("map - background.png");
  const ARROW1 = MAP_ASSET("arrow1.png");
  const ARROW2 = MAP_ASSET("arrow2.png");
  const ARROW3 = MAP_ASSET("arrow3.png");
  const ARROW4 = MAP_ASSET("arrow4.png");
  const ARROW5 = MAP_ASSET("arrow5.png");

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        backgroundImage: `url(${MAP_BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Arrow from Mission 1 to Mission 4 */}
      <img
        src={ARROW1}
        alt=""
        className="absolute pointer-events-none opacity-90"
        style={{
          top: "32%",
          left: "6%",
          height: "44%",
          width: "9%",
        }}
        draggable={false}
      />

      {/* Arrow from Mission 4 to Mission 2 */}
      <img
        src={ARROW2}
        alt=""
        className="absolute pointer-events-none opacity-90"
        style={{
          top: "30%",
          left: "27.5%",
          height: "44%",
          width: "9%",
        }}
        draggable={false}
      />

      {/* Arrow from Mission 2 to Mission 5 */}
      <img
        src={ARROW3}
        alt=""
        className="absolute pointer-events-none opacity-90"
        style={{
          top: "32%",
          left: "42%",
          height: "44%",
          width: "9%",
        }}
        draggable={false}
      />

      {/* Arrow from Mission 5 to Mission 3 */}
      <img
        src={ARROW4}
        alt=""
        className="absolute pointer-events-none opacity-90"
        style={{
          top: "34%",
          left: "60%",
          height: "44%",
          width: "9%",
        }}
        draggable={false}
      />

      {/* Arrow from Mission 3 to Mission 6 */}
      <img
        src={ARROW5}
        alt=""
        className="absolute pointer-events-none opacity-90"
        style={{
          top: "28%",
          left: "78%",
          height: "44%",
          width: "9%",
        }}
        draggable={false}
      />

      {NODES.map((n) => (
        <button
          key={n.id}
          onClick={() => onNodeClick(n.id)}
          title={n.label}
          className="absolute -translate-x-1/2 -translate-y-1/2 hover:scale-[1.03] active:scale-95 transition"
          style={{ left: `${n.xPct}%`, top: `${n.yPct}%` }}
        >
          <img
            src={ICON(n.id)}
            alt={n.label}
            className="block w-[110px] h-[110px] select-none pointer-events-none"
            draggable={false}
          />
        </button>
      ))}

      <button
        onClick={() => nav("/app/map")}
        className="absolute top-3 right-3 rounded-full hover:brightness-110 active:scale-95"
        title="Close"
      >
        <img src={ART.exit} alt="Close" width={28} height={28} />
      </button>
    </div>
  );
}

/********************************
 * Lobby participants grid
 ********************************/
function LobbyParticipantsGrid({
  readyMap,
}: {
  readyMap: Record<string, boolean>;
}) {
  const { room } = useChem();
  const [, force] = useState(0);

  useEffect(() => {
    if (!room) return;
    const rerender = () => force((x) => x + 1);
    const evs: any[] = [
      RoomEvent.ParticipantConnected,
      RoomEvent.ParticipantDisconnected,
      RoomEvent.TrackPublished,
      RoomEvent.TrackUnpublished,
      RoomEvent.TrackSubscribed,
      RoomEvent.TrackUnsubscribed,
      RoomEvent.LocalTrackPublished,
      RoomEvent.LocalTrackUnpublished,
    ];
    evs.forEach((e) => room.on(e as any, rerender));
    return () => evs.forEach((e) => room.off(e as any, rerender));
  }, [room]);

  if (!room) return null;
  const everyone: (RemoteParticipant | LocalParticipant)[] = [
    room.localParticipant,
    ...Array.from(room.remoteParticipants.values()),
  ];

  return (
    <div className="relative h-full min-h-0">
      {/* Custom teal scrollbar rail */}
      <div className="absolute inset-y-0 right-0 w-2 rounded-full bg-teal-600" />
      <div
        className="grid grid-cols-3 md:grid-cols-4 gap-3 pr-4 overflow-y-auto custom-teal-scroll"
        style={{ maxHeight: "100%" }}
      >
        {everyone.map((p) => {
          const isReady = !!readyMap[String(p.identity)];
          return (
            <div
              key={p.identity}
              className="relative flex items-center justify-center rounded-full transition-all"
              title={isReady ? "Ready" : "Not Ready"}
            >
              <VideoBubble p={p} />
              {isReady && (
                <img
                  src={READY_CHECK}
                  alt="Ready"
                  className="absolute -bottom-1 -right-1 w-5 h-5 drop-shadow-md"
                  draggable={false}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/********************************
 * Lobby
 ********************************/
function Lobby() {
  usePhaseGuard("lobby");

  const [params] = useSearchParams();
  const code = params.get("code") || "";
  const isAdminParam = params.get("admin") === "1";

  const nav = useNavigate();
  const {
    room,
    setPhase,
    ensureAudioStart,
    setGroups,
    setMyGroupId,
    setGroupStates,
    setGameResult,
    setFailVariant,
    hostId,
    setHostId,
  } = useChem();

  const data = useLivekitData(room);
  const myId = useMemo(
    () => String(room?.localParticipant.identity || getIdentity()),
    [room]
  );
  const [ready, setReady] = useState(false);
  const [readyMap, setReadyMap] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const phaseV = useRef(0);
  const isHostAdmin = hostId ? hostId === myId : isAdminParam;
  const isAdmin = isHostAdmin;

  useEffect(() => {
    if (!room || !isHostAdmin) return;
    const id = setInterval(() => {
      data.sendReliable({
        type: "PHASE_STATE",
        phase: "lobby",
        v: phaseV.current,
      });
    }, 2000);
    return () => clearInterval(id);
  }, [room, isHostAdmin, data]);

  useEffect(() => {
    if (!room) return;
    return data.onMessage((msg) => {
      if (msg.type === "PHASE_STATE") {
        if (msg.v > phaseV.current) phaseV.current = msg.v;
        if (msg.phase === "game") {
          setPhase("game");
          nav(`../game?code=${code}&admin=${isHostAdmin ? 1 : 0}`);
        }
        if (msg.phase === "debrief") {
          setPhase("debrief");
          nav(`../debrief?code=${code}&admin=${isHostAdmin ? 1 : 0}`);
        }
      }
      if (msg.type === "PHASE_CHANGE") {
        if (msg.phase === "game") {
          setPhase("game");
          nav(`../game?code=${code}&admin=${isHostAdmin ? 1 : 0}`);
        }
      }
      if (msg.type === "READY_TOGGLE" && msg.userId) {
        setReadyMap((prev) => ({ ...prev, [msg.userId]: msg.ready }));
        if (msg.userId === myId) setReady(msg.ready);
      }
      if (msg.type === "READY_STATE") {
        setReadyMap(msg.ready);
        if (typeof msg.ready?.[myId] === "boolean") setReady(!!msg.ready[myId]);
      }
      if (msg.type === "GROUPS_CONFIG") {
        setGroups(msg.groups || []);
        if (room) {
          const mine = (msg.groups || []).find((g) => g.memberIds.includes(myId));
          setMyGroupId(mine?.id || null);
        }
      }
      if (msg.type === "GROUP_STATES") {
        setGroupStates(msg.states || {});
      }
      if (msg.type === "GAME_RESULT") {
        setGameResult(msg.success ? "success" : "failure");
        setFailVariant(msg.failVariant ?? null);
      }
      if (msg.type === "HOST_ID" && msg.hostId && !hostId) {
        setHostId(msg.hostId);
      }
      if (msg.type === "SYNC_REQUEST" && isHostAdmin) {
        data.sendReliable({
          type: "PHASE_STATE",
          phase: "lobby",
          v: phaseV.current,
        });
        data.sendReliable({ type: "READY_STATE", ready: readyMap });
        if (hostId) data.sendReliable({ type: "HOST_ID", hostId });
      }
    });
  }, [
    room,
    data,
    nav,
    code,
    isHostAdmin,
    setPhase,
    readyMap,
    setGroups,
    setMyGroupId,
    setGroupStates,
    setGameResult,
    setFailVariant,
    myId,
    hostId,
    setHostId,
  ]);

  // Establish host: first adminParam user claims hostId and broadcasts it
  useEffect(() => {
    if (!room) return;
    if (!hostId && isAdminParam) {
      setHostId(myId);
      data.sendReliable({ type: "HOST_ID", hostId: myId });
    }
  }, [room, hostId, isAdminParam, myId, data, setHostId]);

  // Keep local ready toggle aligned with broadcast map (prevents flicker)
  useEffect(() => {
    if (typeof readyMap[myId] === "boolean" && readyMap[myId] !== ready) {
      setReady(!!readyMap[myId]);
    }
  }, [readyMap, myId, ready]);

  // Determine host deterministically; broadcast if we are the host
  useEffect(() => {
    const broadcast = (id: string) =>
      data.sendReliable({ type: "HOST_ID", hostId: id });
    ensureHostForRoom(room, hostId, setHostId, broadcast);
    if (!room) return;
    const rerun = () => ensureHostForRoom(room, hostId, setHostId, broadcast);
    const evs: any[] = [
      RoomEvent.ParticipantConnected,
      RoomEvent.ParticipantDisconnected,
    ];
    evs.forEach((e) => room.on(e as any, rerun));
    return () => evs.forEach((e) => room.off(e as any, rerun));
  }, [room, hostId, setHostId, data]);

  // Ensure lobby media stays subscribed so mic/cam toggles apply across clients
  useEffect(() => {
    if (!room) return;
    ensureAllSubscribed(room);
    const rerun = () => ensureAllSubscribed(room);
    const evs: any[] = [
      RoomEvent.ParticipantConnected,
      RoomEvent.ParticipantDisconnected,
      RoomEvent.TrackPublished,
      RoomEvent.TrackUnpublished,
      RoomEvent.TrackSubscribed,
      RoomEvent.TrackUnsubscribed,
    ];
    evs.forEach((e) => room.on(e as any, rerun));
    return () => evs.forEach((e) => room.off(e as any, rerun));
  }, [room]);

  useEffect(() => {
    if (!room) return;
    data.sendReliable({ type: "SYNC_REQUEST" });
  }, [room, data]);

  const allReady = useMemo(() => {
    const vals = Object.values(readyMap);
    return vals.length > 0 && vals.every(Boolean);
  }, [readyMap]);

  const startGame = () => {
    if (!isHostAdmin || !room) return;

    // Build participants list
    const everyone: (RemoteParticipant | LocalParticipant)[] = [
      room.localParticipant,
      ...Array.from(room.remoteParticipants.values()),
    ];
    const ids = everyone
      .map((p) => String(p.identity))
      .filter(Boolean)
      .sort();

    const pattern = computeGroupPattern(ids.length);
    let cursor = 0;
    const newGroups: GroupMeta[] = [];
    pattern.forEach((size, idx) => {
      if (size <= 0) return;
      const memberIds = ids.slice(cursor, cursor + size);
      cursor += size;
      if (memberIds.length === 0) return;
      newGroups.push({ id: `G${idx + 1}`, label: `Room ${idx + 1}`, memberIds });
    });
    // Fallback: single group if none
    if (!newGroups.length && ids.length) {
      newGroups.push({ id: "G1", label: "Room 1", memberIds: ids });
    }

    setGroups(newGroups);
    const mine = newGroups.find((g) => g.memberIds.includes(myId));
    setMyGroupId(mine?.id || null);
    setGroupStates({});
    setGameResult("pending");
    setFailVariant(null);

    // Broadcast groups + initial states
    data.sendReliable({ type: "GROUPS_CONFIG", groups: newGroups });
    data.sendReliable({ type: "GROUP_STATES", states: {} });

    // Prepare initial per-group snapshot
    const ITEMS = [
      "Tarp",
      "Flare Gun",
      "Water Purifier",
      "Solar Flashlight",
      "Matches",
      "Emergency Blanket",
      "Portable Radio",
      "Satellite Phone",
      "Rope",
      "Fishing Kit",
      "Multi-tool",
      "First Aid",
    ];
    const groupMap: Record<string, GroupBoardState> = {};
    newGroups.forEach((g) => {
      groupMap[g.id] = {
        board: Array(6).fill(null),
        pool: ITEMS.slice(),
        locks: {},
      };
    });
    const init: Snapshot = { phase: "game", groups: groupMap };
    sessionStorage.setItem("cs_init_snapshot", JSON.stringify(init));
    window.dispatchEvent(new CustomEvent("cs-reset-version"));

    phaseV.current += 1;
    data.sendReliable({
      type: "PHASE_STATE",
      phase: "game",
      v: phaseV.current,
    });
    data.sendReliable({ type: "PHASE_CHANGE", phase: "game" });
    data.sendReliable({ type: "SNAPSHOT", v: 1, snapshot: init });

    // Initialize round attempts and submission status
    data.sendReliable({ type: "ROUND_STATUS", submitted: {}, attemptsLeft: 5 });

    ensureAudioStart();
    setPhase("game");
    nav(`../game?code=${code}&admin=${isAdmin ? 1 : 0}`);
  };

  const toggleReady = () => {
    const id = String(room?.localParticipant.identity || getIdentity());
    const next = !ready;
    setReady(next);
    ensureAudioStart();
    data.sendReliable({ type: "READY_TOGGLE", userId: id, ready: next });
    if (isAdmin) {
      setReadyMap((prev) => {
        const merged = { ...prev, [id]: next };
        data.sendReliable({ type: "READY_STATE", ready: merged });
        return merged;
      });
    }
  };

  const doCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  // Static map preview (non-clickable) matching the map screen
  const MAP_ASSET = (p: string) =>
    new URL(`./assets/map/Final_TC Map/Assets/${p}`, import.meta.url).href;
  const MAP_BG = MAP_ASSET("map - background.png");
  const ICON = (i: 1 | 2 | 3 | 4 | 5 | 6) =>
    MAP_ASSET(`icon challenge ${String(i)} normal.png`);
  const TOP_Y = 28;
  const BOTTOM_Y = 72;
  const NODES: { id: 1 | 2 | 3 | 4 | 5 | 6; xPct: number; yPct: number }[] = [
    { id: 1, xPct: 11, yPct: TOP_Y },
    { id: 2, xPct: 42, yPct: TOP_Y },
    { id: 3, xPct: 73, yPct: TOP_Y },
    { id: 4, xPct: 23, yPct: BOTTOM_Y },
    { id: 5, xPct: 56, yPct: BOTTOM_Y },
    { id: 6, xPct: 89, yPct: BOTTOM_Y },
  ];

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 overflow-hidden min-h-0">
      <section className="rounded-2xl p-3 sm:p-4 relative flex flex-col overflow-hidden min-h-0">
        {isAdmin ? (
          <div className="flex items-center gap-3 mb-4">
            <button onClick={doCopyLink} title="Copy Room Link" className="relative">
              <img
                src={LOBBY.copyLink}
                alt="Copy Link"
                className="h-9 w-auto select-none pointer-events-none"
              />
              {copied && (
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[11px] text-green-400">
                  Copied
                </span>
              )}
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("cs-open-invite"))}
              title="Send Email Invitation"
            >
              <img
                src={LOBBY.emailInvite}
                alt="Email Invite"
                className="h-9 w-auto select-none pointer-events-none"
              />
            </button>
          </div>
        ) : (
          <div className="mb-4 h-2" />
        )}

        <div className="flex-1 min-h-0">
          <LobbyParticipantsGrid readyMap={readyMap} />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <MicCamControlsVertical />
          </div>
          <div className="flex items-center gap-3 ml-3">
            <button
              onClick={toggleReady}
              title="I'm Ready"
              className="relative"
              style={{ width: 150, height: 46 }}
            >
              <img
                src={LOBBY.readyCta}
                alt="I'm Ready"
                className="w-full h-full object-contain select-none pointer-events-none"
              />
            </button>

            {isAdmin && (
              <button
                onClick={startGame}
                disabled={!allReady && Object.keys(readyMap).length > 0}
                title="Start the Game"
                className="relative disabled:opacity-40"
                style={{ width: 170, height: 46 }}
              >
                <img
                  src={LOBBY.startGame}
                  alt="Start Game"
                  className="w-full h-full object-contain select-none pointer-events-none"
                />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl p-3 sm:p-4 flex flex-col overflow-hidden min-h-0">
        <div
          className="rounded-[28px] overflow-hidden mx-auto w-full flex-1 shadow-2xl"
          style={{ maxWidth: 640, height: 340 }}
        >
          <div
            className="relative w-full h-full"
            style={{
              backgroundImage: `url(${MAP_BG})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {NODES.map((n) => (
              <img
                key={n.id}
                src={ICON(n.id)}
                alt={`Mission ${n.id}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none"
                style={{
                  left: `${n.xPct}%`,
                  top: `${n.yPct}%`,
                  width: "76px",
                  height: "76px",
                }}
                draggable={false}
              />
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("tc-replay-instructions"))}
            title="Replay Instructions"
            className="relative"
            style={{ width: 210, height: 50 }}
          >
            <img
              src={LOBBY.replay}
              alt="Replay Instructions"
              className="w-full h-full object-contain select-none pointer-events-none"
            />
          </button>
        </div>
      </section>
    </div>
  );
}

/********************************
 * Card art mapping
 ********************************/
const ITEM_LIST: string[] = [
  "Tarp",
  "Flare Gun",
  "Water Purifier",
  "Solar Flashlight",
  "Matches",
  "Emergency Blanket",
  "Portable Radio",
  "Satellite Phone",
  "Rope",
  "Fishing Kit",
  "Multi-tool",
  "First Aid",
];
function itemIndex(item: string) {
  const idx = ITEM_LIST.indexOf(item);
  if (idx >= 0) return idx;
  let h = 0;
  for (let i = 0; i < item.length; i++) h = (h * 31 + item.charCodeAt(i)) >>> 0;
  return h % ART.placedFrames.length;
}
function handArtFor(item: string) {
  // Use the aligned placed art for the hand to avoid angled variants.
  const idx = itemIndex(item);
  return ART.placedFrames[idx];
}
function placedArtFor(item: string) {
  const idx = itemIndex(item);
  return ART.placedFrames[idx];
}

// Decide a single admin/host: if adminParam is true, only the lexicographically
// first participant identity gets admin capabilities. Everyone else becomes non-admin.
function useHostAdminFlag(adminParam: boolean, room: Room | null) {
  // Deprecated legacy host selection; kept for reference but unused.
  return useMemo(() => adminParam, [adminParam]);
}

/********************************
 * Game
 ********************************/
function RaftGame() {
  usePhaseGuard("game");

  const [params] = useSearchParams();
  const code = params.get("code") || "";
  const isAdminParam = params.get("admin") === "1";

  const nav = useNavigate();
  const {
    room,
    setPhase,
    ensureAudioStart,
    groups,
    myGroupId,
    groupStates,
    setGroups,
    setMyGroupId,
    setGroupStates,
    setGameResult,
    setFailVariant,
    hostId,
    setHostId,
  } = useChem();

  const data = useLivekitData(room);
  const myId = useMemo(
    () => String(room?.localParticipant.identity || getIdentity()),
    [room]
  );
  const isAdmin = hostId ? hostId === myId : isAdminParam;

  // Determine host deterministically; broadcast if we are the host
  useEffect(() => {
    const broadcast = (id: string) =>
      data.sendReliable({ type: "HOST_ID", hostId: id });
    ensureHostForRoom(room, hostId, setHostId, broadcast);
    if (!room) return;
    const rerun = () => ensureHostForRoom(room, hostId, setHostId, broadcast);
    const evs: any[] = [
      RoomEvent.ParticipantConnected,
      RoomEvent.ParticipantDisconnected,
    ];
    evs.forEach((e) => room.on(e as any, rerun));
    return () => evs.forEach((e) => room.off(e as any, rerun));
  }, [room, hostId, setHostId, data]);

  // Host claim fallback (direct entry)
  useEffect(() => {
    if (!room) return;
    if (!hostId && isAdminParam) {
      setHostId(myId);
      data.sendReliable({ type: "HOST_ID", hostId: myId });
    }
  }, [room, hostId, isAdminParam, myId, data, setHostId]);

  // Determine host deterministically; broadcast if we are the host
  useEffect(() => {
    const broadcast = (id: string) =>
      data.sendReliable({ type: "HOST_ID", hostId: id });
    ensureHostForRoom(room, hostId, setHostId, broadcast);
    if (!room) return;
    const rerun = () => ensureHostForRoom(room, hostId, setHostId, broadcast);
    const evs: any[] = [
      RoomEvent.ParticipantConnected,
      RoomEvent.ParticipantDisconnected,
    ];
    evs.forEach((e) => room.on(e as any, rerun));
    return () => evs.forEach((e) => room.off(e as any, rerun));
  }, [room, hostId, setHostId, data]);

  const [snap, setSnap] = useState<Snapshot | null>(null);
  const gameTotal = 15 * 60; // 15 min
  const gameRemaining = usePhaseTimer("game", isAdmin, data, gameTotal);

  const snapshotV = useRef(0);
  const phaseV = useRef(0);

  // Host claim fallback (direct entry)
  useEffect(() => {
    if (!room) return;
    if (!hostId && isAdminParam) {
      setHostId(myId);
      data.sendReliable({ type: "HOST_ID", hostId: myId });
    }
  }, [room, hostId, isAdminParam, myId, data, setHostId]);
  const finishedRef = useRef(false);

  // Attempts & round submission tracking
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [submittedMap, setSubmittedMap] = useState<Record<string, boolean>>({});
  const submissionsRoundRef = useRef<Record<string, string[]>>({});

  // Round cooldown
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const cooldownTimerRef = useRef<number | null>(null);

  // Announcement text
  const [announcement, setAnnouncement] = useState<string | null>(null);
  useEffect(() => {
    if (!announcement) return;
    const t = setTimeout(() => setAnnouncement(null), 5000);
    return () => clearTimeout(t);
  }, [announcement]);

  // Emit attempts to top bar badge
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("tc-attempts", { detail: { attemptsLeft } })
    );
  }, [attemptsLeft]);

  const activeGroupId = useMemo(() => {
    if (myGroupId) return myGroupId;
    if (groups.length > 0) return groups[0].id;
    return "G1";
  }, [myGroupId, groups]);

  const activeBoardState: GroupBoardState | null = useMemo(() => {
    if (!snap) return null;
    const g = snap.groups?.[activeGroupId];
    if (!g) return null;
    return g;
  }, [snap, activeGroupId]);

    const board = activeBoardState?.board || Array(6).fill(null);

    // Ensure the bottom tray actually shows cards:
    // - If we have a non-empty pool from the snapshot, use it.
    // - If the pool is empty AND nothing is on the board yet, fall back to the full ITEM_LIST.
    const pool = useMemo(() => {
      const raw = activeBoardState?.pool || [];
      if (raw.length > 0) return raw;

      const anyPlaced = board.some((x) => x !== null);
      if (!anyPlaced) {
        // Fresh round / initial load: show the full hand set
        return ITEM_LIST.slice();
      }
      return raw;
    }, [activeBoardState, board]);


  const myBoardAllFilled = useMemo(() => board.every((x) => x !== null), [board]);

  const myGroupState: GroupState = useMemo(
    () => groupStates[activeGroupId] || "playing",
    [groupStates, activeGroupId]
  );

  const inCooldown = cooldownRemaining > 0;

  // Admin fallback: hydrate from session if no network snapshot yet
  useEffect(() => {
    if (snap) return;
    try {
      const raw = sessionStorage.getItem("cs_init_snapshot");
      if (raw) {
        const init = JSON.parse(raw);
        if (init?.groups) {
          setSnap({ phase: "game", groups: init.groups });
          snapshotV.current = Math.max(snapshotV.current, 1);
        }
      }
    } catch {}
  }, [snap]);

  const sendSnapshot = useCallback(
    (s: Snapshot) => {
      snapshotV.current += 1;
      data.sendReliable({ type: "SNAPSHOT", v: snapshotV.current, snapshot: s });
    },
    [data]
  );

  const placeCardLocal = useCallback(
    (s: Snapshot, groupId: string, cardId: string, slotIndex: number): Snapshot => {
      const group = s.groups[groupId];
      if (!group) return s;
      if (slotIndex < 0 || slotIndex >= 6) return s;
      if (group.board[slotIndex] !== null) return s;
      if (!group.pool.includes(cardId)) return s;

      const board = [...group.board];
      board[slotIndex] = cardId;

      const pool = group.pool.filter((c) => c !== cardId);
      const locks = { ...group.locks };
      delete locks[cardId];

      return {
        ...s,
        groups: {
          ...s.groups,
          [groupId]: { board, pool, locks },
        },
      };
    },
    []
  );

  function isLocked(group: GroupBoardState, cardId: string | null): boolean {
    if (!cardId) return false;
    return !!group.locks && group.locks[cardId] === "locked";
  }

  const removeCardLocal = useCallback(
    (s: Snapshot, groupId: string, slotIndex: number): Snapshot => {
      const group = s.groups[groupId];
      if (!group) return s;
      if (slotIndex < 0 || slotIndex >= 6) return s;
      const cardId = group.board[slotIndex];
      if (!cardId) return s;
      if (isLocked(group, cardId)) return s; // cannot remove locked

      const board = [...group.board];
      board[slotIndex] = null;
      const pool = [...group.pool, cardId];

      return {
        ...s,
        groups: {
          ...s.groups,
          [groupId]: { board, pool, locks: { ...group.locks } },
        },
      };
    },
    []
  );

  const startCooldown = useCallback(
    (seconds: number) => {
      if (!isAdmin) return;

      if (cooldownTimerRef.current !== null) {
        clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }

      let remaining = seconds;
      setCooldownRemaining(remaining);
      data.sendReliable({
        type: "ROUND_COOLDOWN",
        secondsRemaining: remaining,
      });

      const id = window.setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(id);
          cooldownTimerRef.current = null;
          setCooldownRemaining(0);
          data.sendReliable({
            type: "ROUND_COOLDOWN",
            secondsRemaining: 0,
          });
          return;
        }
        setCooldownRemaining(remaining);
        data.sendReliable({
          type: "ROUND_COOLDOWN",
          secondsRemaining: remaining,
        });
      }, 1000);

      cooldownTimerRef.current = id;
    },
    [data, isAdmin]
  );

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current !== null) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

  // Finalize a round: lock intersection items, keep others on boat, decrement attempts, cooldown
  const finalizeRoundAndApplyLocks = useCallback(() => {
    if (!isAdmin) return;
    if (!groups.length) return;

    const byGroup = submissionsRoundRef.current;
    const allSubmitted = groups.every((g) => !!byGroup[g.id]);
    if (!allSubmitted) return;

    const arrays = groups.map((g) => (byGroup[g.id] || []).slice().sort());
    let intersection: string[] = arrays[0]?.slice() ?? [];
    for (let i = 1; i < arrays.length; i++) {
      const setI = new Set(arrays[i]);
      intersection = intersection.filter((x) => setI.has(x));
    }

    const lockedAllSix = intersection.length === 6;

    setSnap((s) => {
      if (!s) return s;
      const nextGroups: typeof s.groups = { ...s.groups };

      for (const g of groups) {
        const gs = nextGroups[g.id];
        if (!gs) continue;

        const board = [...gs.board];
        const pool = [...gs.pool];
        const locks = { ...gs.locks };

        // Lock any intersected item currently on the board; ensure not in pool.
        for (let i = 0; i < board.length; i++) {
          const cardId = board[i];
          if (!cardId) continue;
          if (intersection.includes(cardId)) {
            locks[cardId] = "locked";
            const pi = pool.indexOf(cardId);
            if (pi >= 0) pool.splice(pi, 1);
          }
        }

        // Non-locked cards stay on the board (editable next round)
        nextGroups[g.id] = { board, pool, locks };
      }

      const next: Snapshot = { ...s, groups: nextGroups };
      sendSnapshot(next);
      return next;
    });

    let afterAttempt = attemptsLeft;
    setAttemptsLeft((n) => {
      const after = Math.max(0, n - 1);
      afterAttempt = after;
      data.sendReliable({
        type: "ROUND_RESULT",
        lockedItems: intersection,
        attemptsLeft: after,
      });

      // reset submissions
      submissionsRoundRef.current = {};
      setSubmittedMap({});
      data.sendReliable({
        type: "ROUND_STATUS",
        submitted: {},
        attemptsLeft: after,
      });

      // reset group pills to "playing" (red)
      const resetStates: Record<string, GroupState> = {};
      groups.forEach((g) => (resetStates[g.id] = "playing"));
      data.sendReliable({ type: "GROUP_STATES", states: resetStates });
      setGroupStates(resetStates);

      // start cooldown only if not finished and still have attempts
      if (!lockedAllSix && after > 0) {
        startCooldown(15);
      }

      return after;
    });

    if (lockedAllSix) {
      finishedRef.current = true;
      setGameResult("success");
      setFailVariant(null);
      data.sendReliable({ type: "GAME_RESULT", success: true });
      phaseV.current += 1;
      data.sendReliable({
        type: "PHASE_STATE",
        phase: "debrief",
        v: phaseV.current,
      });
      data.sendReliable({ type: "PHASE_CHANGE", phase: "debrief" });
      setPhase("debrief");
      nav(`../debrief?code=${code}&admin=${isAdmin ? 1 : 0}`);
      return;
    }

    if (afterAttempt <= 0) {
      finishedRef.current = true;
      const failVariant = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3;
      setGameResult("failure");
      setFailVariant(failVariant);
      data.sendReliable({
        type: "GAME_RESULT",
        success: false,
        failVariant,
      });
      phaseV.current += 1;
      data.sendReliable({
        type: "PHASE_STATE",
        phase: "debrief",
        v: phaseV.current,
      });
      data.sendReliable({ type: "PHASE_CHANGE", phase: "debrief" });
      setPhase("debrief");
      nav(`../debrief?code=${code}&admin=${isAdmin ? 1 : 0}`);
    }
  }, [
    isAdmin,
    groups,
    sendSnapshot,
    data,
    setPhase,
    nav,
    code,
    attemptsLeft,
    setGameResult,
    setFailVariant,
    setGroupStates,
    startCooldown,
  ]);

  // Keep snapshot + phase beacons flowing from admin
  useEffect(() => {
    if (!isAdmin) return;
    const id = setInterval(() => {
      data.sendReliable({
        type: "PHASE_STATE",
        phase: "game",
        v: phaseV.current,
      });
    }, 2000);
    return () => clearInterval(id);
  }, [isAdmin, snap, sendSnapshot, data]);

  // Bus handlers
  useEffect(() => {
    if (!room) return;
    return data.onMessage((m) => {
      if (m.type === "PHASE_STATE") {
        if (m.v > phaseV.current) {
          phaseV.current = m.v;
          if (m.phase === "debrief") {
            setPhase("debrief");
            nav(`../debrief?code=${code}&admin=${isAdmin ? 1 : 0}`);
          }
        }
        return;
      }

      if (m.type === "SNAPSHOT") {
        if (m.v > snapshotV.current) {
          snapshotV.current = m.v;
          setSnap(m.snapshot);
        }
        return;
      }

      if (m.type === "GROUPS_CONFIG") {
        setGroups(m.groups || []);
        const mine = (m.groups || []).find((g) => g.memberIds.includes(myId));
        setMyGroupId(mine?.id || null);
        return;
      }

      if (m.type === "GROUP_STATES") {
        setGroupStates(m.states || {});
        return;
      }

      if (m.type === "GROUP_SUBMIT") {
        const { groupId, items } = m;

        // Local flag: this group has submitted for this round
        setSubmittedMap((prev) => ({ ...prev, [groupId]: true }));

        data.sendReliable({
          type: "ROUND_STATUS",
          submitted: { ...submittedMap, [groupId]: true },
          attemptsLeft,
        });

        if (isAdmin) {
          submissionsRoundRef.current[groupId] = items.slice();

          // Visually mark as submitted (green check)
          setGroupStates((prev) => {
            const next = { ...prev, [groupId]: "submitted" as GroupState };
            data.sendReliable({ type: "GROUP_STATES", states: next });
            return next;
          });

          const allSubmitted =
            groups.length > 0 &&
            groups.every(
              (g) => submissionsRoundRef.current[g.id]?.length === 6
            );
          if (allSubmitted) finalizeRoundAndApplyLocks();
        }
        return;
      }

      if (m.type === "ROUND_STATUS") {
        setSubmittedMap(m.submitted || {});
        if (typeof m.attemptsLeft === "number") setAttemptsLeft(m.attemptsLeft);
        window.dispatchEvent(
          new CustomEvent("tc-attempts", {
            detail: { attemptsLeft: m.attemptsLeft },
          })
        );
        return;
      }

      if (m.type === "ROUND_RESULT") {
        if (typeof m.attemptsLeft === "number") setAttemptsLeft(m.attemptsLeft);
        // Reset per-round submit flags so groups can resubmit next round
        setSubmittedMap({});
        window.dispatchEvent(
          new CustomEvent("tc-attempts", {
            detail: { attemptsLeft: m.attemptsLeft },
          })
        );
        return;
      }

      if (m.type === "ROUND_COOLDOWN") {
        setCooldownRemaining(m.secondsRemaining ?? 0);
        if ((m.secondsRemaining ?? 0) <= 0) {
          setSubmittedMap({});
        }
        return;
      }

      if (m.type === "ANNOUNCE") {
        setAnnouncement(m.text);
        return;
      }

      if (m.type === "HOST_ID" && m.hostId && !hostId) {
        setHostId(m.hostId);
        return;
      }

      if (m.type === "GAME_RESULT") {
        setGameResult(m.success ? "success" : "failure");
        setFailVariant(m.failVariant ?? null);
        return;
      }

      if (m.type === "PLACE_CARD_REQUEST" && isAdmin) {
        setSnap((s) => {
          if (!s) return s;
          const next = placeCardLocal(s, m.groupId, m.cardId, m.slotIndex);
          sendSnapshot(next);
          return next;
        });
        return;
      }

      if (m.type === "REMOVE_CARD_REQUEST" && isAdmin) {
        setSnap((s) => {
          if (!s) return s;
          const next = removeCardLocal(s, m.groupId, m.slotIndex);
          sendSnapshot(next);
          return next;
        });
        return;
      }

      if (m.type === "SYNC_REQUEST" && isAdmin) {
        if (snap) sendSnapshot(snap);
        data.sendReliable({
          type: "PHASE_STATE",
          phase: "game",
          v: phaseV.current,
        });
        if (groups.length) {
          data.sendReliable({ type: "GROUPS_CONFIG", groups });
        }
        data.sendReliable({ type: "GROUP_STATES", states: groupStates });
        data.sendReliable({
          type: "ROUND_STATUS",
          submitted: submittedMap,
          attemptsLeft,
        });
        if (hostId) data.sendReliable({ type: "HOST_ID", hostId });
        return;
      }
    });
  }, [
    room,
    data,
    nav,
    code,
    isAdmin,
    setPhase,
    placeCardLocal,
    removeCardLocal,
    sendSnapshot,
    snap,
    groups,
    groupStates,
    setGroups,
    setMyGroupId,
    setGroupStates,
    setGameResult,
    setFailVariant,
    attemptsLeft,
    submittedMap,
    finalizeRoundAndApplyLocks,
    myId,
    hostId,
    setHostId,
  ]);

  // Ask for sync on entering game
  useEffect(() => {
    if (!room) return;
    data.sendReliable({ type: "SYNC_REQUEST" });
  }, [room, data]);

  // Admin: resolve timer end if needed (fallback)
  useEffect(() => {
    if (!isAdmin) return;
    if (finishedRef.current) return;
    if (!groups.length) return;

    if (gameRemaining === 0) {
      finishedRef.current = true;
      const failVariant = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3;
      setGameResult("failure");
      setFailVariant(failVariant);
      data.sendReliable({ type: "GAME_RESULT", success: false, failVariant });
      phaseV.current += 1;
      data.sendReliable({
        type: "PHASE_STATE",
        phase: "debrief",
        v: phaseV.current,
      });
      data.sendReliable({ type: "PHASE_CHANGE", phase: "debrief" });
      setPhase("debrief");
      nav(`../debrief?code=${code}&admin=${isAdmin ? 1 : 0}`);
    }
  }, [
    isAdmin,
    gameRemaining,
    groups,
    data,
    setPhase,
    nav,
    code,
    setGameResult,
    setFailVariant,
  ]);

  type DragPayload =
    | { from: "pool"; cardId: string }
    | { from: "slot"; slotIndex: number; cardId: string };

  const onPoolDragStart = (
    e: React.DragEvent<HTMLDivElement | HTMLButtonElement>,
    cardId: string
  ) => {
    const payload: DragPayload = { from: "pool", cardId };
    e.dataTransfer.setData("application/json", JSON.stringify(payload));
  };

  const onSlotDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    slotIndex: number,
    cardId: string
  ) => {
    if (!snap) return;
    const g = snap.groups[activeGroupId];
    if (g && isLocked(g, cardId)) {
      e.preventDefault();
      return;
    }
    const payload: DragPayload = { from: "slot", slotIndex, cardId };
    e.dataTransfer.setData("application/json", JSON.stringify(payload));
  };

  const onSlotDrop = (e: React.DragEvent<HTMLDivElement>, slotIndex: number) => {
    e.preventDefault();
    const payload = safeParse<DragPayload>(
      e.dataTransfer.getData("application/json")
    );
    if (!payload || !snap) return;
    if (payload.from === "pool") {
      if (isAdmin) {
        const next = placeCardLocal(snap, activeGroupId, payload.cardId, slotIndex);
        setSnap(next);
        sendSnapshot(next);
      } else {
        // Optimistic update while admin processes request
        setSnap((s) =>
          s ? placeCardLocal(s, activeGroupId, payload.cardId, slotIndex) : s
        );
        data.sendReliable({
          type: "PLACE_CARD_REQUEST",
          groupId: activeGroupId,
          cardId: payload.cardId,
          slotIndex,
        });
      }
    }
  };

  const onCarouselDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const payload = safeParse<DragPayload>(
      e.dataTransfer.getData("application/json")
    );
    if (!payload || !snap) return;
    if (payload.from === "slot") {
      if (isAdmin) {
        const next = removeCardLocal(snap, activeGroupId, payload.slotIndex);
        setSnap(next);
        sendSnapshot(next);
      } else {
        setSnap((s) =>
          s ? removeCardLocal(s, activeGroupId, payload.slotIndex) : s
        );
        data.sendReliable({
          type: "REMOVE_CARD_REQUEST",
          groupId: activeGroupId,
          slotIndex: payload.slotIndex,
        });
      }
    }
  };

  const clickRemove = (slotIndex: number) => {
    if (!snap) return;
    if (isAdmin) {
      const next = removeCardLocal(snap, activeGroupId, slotIndex);
      setSnap(next);
      sendSnapshot(next);
    } else {
      setSnap((s) => (s ? removeCardLocal(s, activeGroupId, slotIndex) : s));
      data.sendReliable({
        type: "REMOVE_CARD_REQUEST",
        groupId: activeGroupId,
        slotIndex,
      });
    }
  };

  const submit = () => {
    if (!myBoardAllFilled) return;
    const items = board.filter((x): x is string => !!x);
    if (items.length !== 6) return;

    ensureAudioStart();

    setSubmittedMap((m) => ({ ...m, [activeGroupId]: true }));
    data.sendReliable({
      type: "ROUND_STATUS",
      submitted: { ...submittedMap, [activeGroupId]: true },
      attemptsLeft,
    });
    data.sendReliable({
      type: "ANNOUNCE",
      text: `Group ${activeGroupId} has submitted`,
    });

    data.sendReliable({ type: "GROUP_SUBMIT", groupId: activeGroupId, items });

    if (isAdmin) {
      submissionsRoundRef.current[activeGroupId] = items.slice();
      const allSubmitted =
        groups.length > 0 &&
        groups.every((g) => submissionsRoundRef.current[g.id]?.length === 6);
      if (allSubmitted) finalizeRoundAndApplyLocks();
    }
  };

  return (
    <div className="relative h-full flex flex-col">
      <div className="relative mx-auto w-[min(78vw,720px)]">
        <img
          src={ART.boat}
          alt="boat"
          className="w-full h-auto block select-none pointer-events-none max-h-[46vh]"
          draggable={false}
        />

        {/* 6 slots area */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ left: "14%", right: "14%", top: "18%", bottom: "28%" }}
        >
          <div className="grid grid-cols-3 gap-x-6 gap-y-4 h-full items-center">
            {Array.from({ length: 6 }).map((_, idx) => {
              const cardId = board[idx] ?? null;
              const col = idx % 3;
              const widthPct = col === 1 ? "62%" : "58%";
              const locked =
                !!activeBoardState &&
                isLocked(activeBoardState, cardId ? cardId : null);
              return (
                <div
                  key={idx}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onSlotDrop(e, idx)}
                  className="relative pointer-events-auto mx-auto"
                  style={{ width: widthPct }}
                >
                  {cardId ? (
                    <div
                      draggable={!locked}
                      onDragStart={(e) => onSlotDragStart(e, idx, cardId)}
                      className="relative"
                      title={
                        locked
                          ? "Locked by global alignment"
                          : "Drag to another slot or back to the hand"
                      }
                    >
                      <img
                        src={placedArtFor(cardId)}
                        alt={cardId}
                        className={`w-full h-auto block ${
                          locked ? "opacity-90" : ""
                        }`}
                        draggable={false}
                      />
                      {!locked && (
                        <button
                          onClick={() => clickRemove(idx)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded bg-black/50 text-white text-[11px] grid place-items-center"
                          title="Remove to hand"
                        >
                          ×
                        </button>
                      )}
                      {locked && (
                        <div className="absolute -top-2 -right-2 text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded">
                          Locked
                        </div>
                      )}
                    </div>
                  ) : (
                    <img
                      src={ART.slotEmpty}
                      alt={`slot ${idx + 1}`}
                      className="opacity-90"
                      draggable={false}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Announcement – top-right toast */}
      {announcement && (
        <div className="fixed top-20 right-6 z-40">
          <div className="px-3 py-2 rounded-lg bg-black/70 text-sm text-white shadow-lg">
            {announcement}
          </div>
        </div>
      )}

      {/* Submit CTA + status */}
      <div className="mt-2 sm:mt-3 grid place-items-center">
        <button
          onClick={submit}
          disabled={
            !myBoardAllFilled ||
            !!submittedMap[activeGroupId] ||
            attemptsLeft <= 0 ||
            inCooldown
          }
          className="relative disabled:opacity-40"
          style={{ width: 220, height: 56 }}
          aria-label="Submit Alignment"
        >
          <img
            src={ART.submitCta}
            alt="Submit Alignment"
            className="w-full h-full object-contain select-none pointer-events-none"
            draggable={false}
          />
        </button>

        {!myBoardAllFilled && (
          <div className="text-xs mt-2 opacity-70">
            Fill all 6 slots to submit for this round.
          </div>
        )}
        {myBoardAllFilled && submittedMap[activeGroupId] && !inCooldown && (
          <div className="text-xs mt-2 opacity-80">
            Submitted — waiting for other groups to finish the round…
          </div>
        )}
        {inCooldown && (
          <div className="text-xs mt-2 opacity-80">
            Round resolved. Talk with your team — next submit window opens soon.
          </div>
        )}
        {attemptsLeft <= 0 && (
          <div className="text-xs mt-2 opacity-80 text-red-200">
            No attempts remaining.
          </div>
        )}

        {inCooldown && (
          <div className="mt-3 w-full max-w-xs">
            <div className="h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-white transition-[width] duration-1000 linear"
                style={{
                  width: `${(cooldownRemaining / 15) * 100}%`,
                }}
              />
            </div>
            <div className="text-[11px] mt-1 text-center opacity-80">
              Next submit window in {cooldownRemaining}s
            </div>
          </div>
        )}
      </div>

      {/* Hand / Carousel – bottom, all visible */}
      <div className="mt-2 sm:mt-3 mb-1 relative rounded-2xl bg-black/25 px-10 py-4 overflow-hidden">
        <PagedHand
          pool={pool}
          onDrop={onCarouselDrop}
          onDragStart={onPoolDragStart}
          pageSize={7}
        />
      </div>

      {!room && (
        <div className="text-red-300 text-sm mt-2">
          Not connected. Return to Map to (re)join.
        </div>
      )}

      <PhaseClockBridge phase="game" remaining={gameRemaining} total={gameTotal} />
    </div>
  );
}

function PagedHand({
  pool,
  onDrop,
  onDragStart,
  pageSize = 7,
}: {
  pool: string[];
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragStart: (
    e: React.DragEvent<HTMLDivElement | HTMLButtonElement>,
    cardId: string
  ) => void;
  pageSize?: number;
}) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(pool.length / pageSize));
  const clampedPage = Math.max(0, Math.min(page, pageCount - 1));
  const start = clampedPage * pageSize;
  const visible = pool.slice(start, start + pageSize);

  useEffect(() => {
    if (clampedPage !== page) setPage(clampedPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool.length, pageCount]);

  const goLeft = () => setPage((p) => Math.max(0, p - 1));
  const goRight = () => setPage((p) => Math.min(pageCount - 1, p + 1));

  return (
    <>
      <button
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/35 hover:brightness-110 disabled:opacity-40"
        title="Previous"
        onClick={goLeft}
        disabled={clampedPage === 0}
      >
        <img src={ART.arrowLeft} alt="left" className="w-6 h-6" />
      </button>

      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/35 hover:brightness-110 disabled:opacity-40"
        title="Next"
        onClick={goRight}
        disabled={clampedPage >= pageCount - 1}
      >
        <img
          src={ART.arrowLeft}
          alt="right"
          className="w-6 h-6"
          style={{ transform: "scaleX(-1)" }}
        />
      </button>

      <div
        className="flex justify-center gap-4 py-1 items-start max-w-[1100px] mx-auto"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        style={{ minHeight: "clamp(240px, 32vh, 320px)" }}
      >
        {visible.map((c) => (
          <div
            key={c}
            draggable
            onDragStart={(e) => onDragStart(e, c)}
            title="Drag into an empty slot"
            className="relative cursor-grab active:cursor-grabbing select-none hover:scale-[1.03] hover:brightness-110 transition"
            style={{ width: 150 }}
          >
            <img
              src={handArtFor(c)}
              alt={c}
              className="block w-full h-auto"
              draggable={false}
            />
          </div>
        ))}
        {visible.length === 0 && (
          <div className="text-xs opacity-60 px-2 self-center">
            No remaining cards. Drag from a slot to return here.
          </div>
        )}
      </div>

      <div className="flex justify-center gap-2 mt-2">
        {Array.from({ length: pageCount }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i === clampedPage ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </>
  );
}

function PhaseClockBridge({
  phase,
  remaining,
  total,
}: {
  phase: Phase;
  remaining: number;
  total: number;
}) {
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("tc-phase-clock", { detail: { phase, remaining, total } })
    );
  }, [phase, remaining, total]);
  return null;
}

/********************************
 * Debrief – with LIVE VIDEO TILES in the middle
 ********************************/
function Debrief() {
  usePhaseGuard("debrief");
  const [params] = useSearchParams();
  const isAdminParam = params.get("admin") === "1";

  const {
    room,
    setPhase,
    ensureAudioStart,
    gameResult,
    setGameResult,
    failVariant,
    setFailVariant,
    hostId,
    setHostId,
  } = useChem();

  const data = useLivekitData(room);
  const nav = useNavigate();
  const myId = useMemo(
    () => String(room?.localParticipant.identity || getIdentity()),
    [room]
  );
  const isAdmin = hostId ? hostId === myId : isAdminParam;

  const total = 15 * 60;
  const remaining = usePhaseTimer("debrief", isAdmin, data, total);

  const [showQuestion, setShowQuestion] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [micOn, setMicOn] = useState(() => (room ? micEnabled(room) : true));
  const [camOn, setCamOn] = useState(() => (room ? camEnabled(room) : true));

  const phaseV = useRef(0);

  useEffect(() => {
    if (!room) return;
    ensureAllSubscribed(room);
  }, [room]);

  useEffect(() => {
    if (!room || !isAdmin) return;
    const id = setInterval(() => {
      data.sendReliable({
        type: "PHASE_STATE",
        phase: "debrief",
        v: phaseV.current,
      });
    }, 2000);
    return () => clearInterval(id);
  }, [room, isAdmin, data]);

  useEffect(() => {
    return data.onMessage((m) => {
      if (m?.type === "PHASE_STATE") {
        if (m.phase === "map") {
          setPhase("map");
          nav("../map");
        }
      }
      if (m?.type === "PHASE_CHANGE" && m.phase === "map") {
        setPhase("map");
        nav("../map");
      }
      if (m?.type === "GAME_RESULT") {
        setGameResult(m.success ? "success" : "failure");
        setFailVariant(m.failVariant ?? null);
      }
      if (m?.type === "HOST_ID" && m.hostId && !hostId) {
        setHostId(m.hostId);
      }
      if (m?.type === "SYNC_REQUEST" && isAdmin) {
        data.sendReliable({
          type: "PHASE_STATE",
          phase: "debrief",
          v: phaseV.current,
        });
        if (hostId) data.sendReliable({ type: "HOST_ID", hostId });
      }
    });
  }, [data, nav, setPhase, isAdmin, setGameResult, setFailVariant, hostId, setHostId]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("tc-phase-clock", {
        detail: { phase: "debrief", remaining, total },
      })
    );
  }, [remaining, total]);

  useEffect(() => {
    if (!isAdmin) return;
    if (remaining === 0) {
      phaseV.current += 1;
      data.sendReliable({
        type: "PHASE_STATE",
        phase: "map",
        v: phaseV.current,
      });
      data.sendReliable({ type: "PHASE_CHANGE", phase: "map" });
    }
  }, [remaining, isAdmin, data]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  const participants: (RemoteParticipant | LocalParticipant)[] = useMemo(() => {
    if (!room) return [];
    return [
      room.localParticipant,
      ...Array.from(room.remoteParticipants.values()),
    ];
  }, [room]);

  const toggleMic = async () => {
    if (!room) return;
    const next = !micOn;
    try {
      await room.localParticipant.setMicrophoneEnabled(next);
      setMicOn(next);
      ensureAudioStart();
    } catch {}
  };
  const toggleCam = async () => {
    if (!room) return;
    const next = !camOn;
    try {
      await room.localParticipant.setCameraEnabled(next);
      setCamOn(next);
      ensureAudioStart();
    } catch {}
  };
  const toggleHand = () => setHandRaised((h) => !h);
  const toggleQuestion = () => setShowQuestion((v) => !v);

  const returnToMap = () => {
    ensureAudioStart();
    phaseV.current += 1;
    data.sendReliable({
      type: "PHASE_STATE",
      phase: "map",
      v: phaseV.current,
    });
    data.sendReliable({ type: "PHASE_CHANGE", phase: "map" });
  };

  const isSuccess = gameResult === "success";
  let debriefPrompt = "";
  if (isSuccess) {
    debriefPrompt =
      "What helps us stay aligned when things get complex, and how do we maintain that in our day-to-day work?";
  } else {
    const variant = failVariant ?? 1;
    if (variant === 1) {
      debriefPrompt =
        "What makes aligning on priorities difficult, and how does that affect how we work together?";
    } else if (variant === 2) {
      debriefPrompt =
        "What did we try to do differently the second time and what got in the way of making real progress?";
    } else {
      debriefPrompt =
        "What do we notice about how we handle competing ideas and how does that shape our ability to align under pressure?";
    }
  }

  return (
    <div className="relative h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-xl font-semibold tracking-tight text-white">
            Debrief Room
          </div>
          <div className="flex items-center gap-2">
            <img
              src={DEBRIEF.clock}
              alt="clock"
              className="w-8 h-8 object-contain"
            />
            <span className="text-lg font-mono">
              {mm}:{ss}
            </span>
          </div>
        </div>
        <button
          onClick={returnToMap}
          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg:white/20 text-sm"
        >
          Return to Map
        </button>
      </div>

      <div className="flex items-center gap-3 mb-3">
        {gameResult === "success" && (
          <img
            src={DEBRIEF.challengePassed}
            alt="Challenge passed"
            className="h-10 w-auto"
          />
        )}
        {gameResult === "failure" && (
          <img
            src={DEBRIEF.challengeFailed}
            alt="Challenge failed"
            className="h-10 w-auto"
          />
        )}
      </div>

      {/* middle: LIVEKIT CAMERAS */}
      <div className="flex-1 rounded-2xl bg-black/25 p-4 sm:p-6 overflow-y-auto">
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 place-items-center">
          {participants.length === 0 && (
            <div className="col-span-full text-center text-sm opacity-70">
              Waiting for participants…
            </div>
          )}
          {participants.map((p) => (
            <VideoBubble key={p.identity} p={p} />
          ))}
        </div>
      </div>

      {/* bottom: controls */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <DebriefControlButton
          icon={camOn ? DEBRIEF.camera : DEBRIEF.videoOff}
          label="Camera"
          active={camOn}
          onClick={toggleCam}
        />
        <DebriefControlButton
          icon={micOn ? LOBBY.micOn : DEBRIEF.micOff}
          label="Mic"
          active={micOn}
          onClick={toggleMic}
        />
        <DebriefControlButton
          icon={handRaised ? DEBRIEF.raiseHand : DEBRIEF.handOff}
          label="Raise hand"
          active={handRaised}
          onClick={toggleHand}
        />
        <DebriefControlButton
          icon={DEBRIEF.question}
          label="Question"
          active={showQuestion}
          onClick={toggleQuestion}
        />
      </div>

      {showQuestion && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="relative w-[min(90vw,720px)] rounded-2xl bg-[#0f172a]/90 border border-white/10 p-6 md:p-8 text-white shadow-2xl">
            <button
              onClick={() => setShowQuestion(false)}
              className="absolute top-3 right-3 p-1 hover:scale-105"
              aria-label="Close"
            >
              <img src={DEBRIEF.closeIcon} alt="close" className="w-6 h-6" />
            </button>
            <div className="text-sm uppercase tracking-[0.2em] opacity-70 mb-2">
              Debrief Question
            </div>
            <div className="text-xl font-semibold leading-snug mb-4">
              {debriefPrompt}
            </div>
            <p className="text-sm opacity-80">
              Take a few minutes each to respond, focusing on concrete behaviors,
              patterns, and agreements you want to carry back into day-to-day work.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function DebriefControlButton({
  icon,
  active,
  onClick,
  size,
}: {
  icon: string;
  active?: boolean;
  onClick?: () => void;
  size?: number;
}) {
  const dim = size || 32;
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center rounded-full transition ${
        active ? "ring-2 ring-white/25" : ""
      }`}
      style={{ width: dim, height: dim }}
      aria-label="toggle control"
    >
      <img
        src={icon}
        alt=""
        className="w-5 h-5 object-contain"
        style={{ width: dim * 0.55, height: dim * 0.55 }}
      />
    </button>
  );
}

/********************************
 * Export
 ********************************/
export default function TeamChemistry() {
  const [topClock, setTopClock] = useState({
    remaining: 12 * 60,
    total: 12 * 60,
  });

  useEffect(() => {
    const onClock = (e: any) => {
      const { remaining, total } = e.detail || {};
      if (typeof remaining === "number" && typeof total === "number") {
        setTopClock({ remaining, total });
      }
    };
    window.addEventListener("tc-phase-clock", onClock as any);
    return () => window.removeEventListener("tc-phase-clock", onClock as any);
  }, []);

  return (
    <ChemistryProvider>
      <ChemistryShell
        phaseTimerSeconds={topClock.remaining}
        phaseTotalSeconds={topClock.total}
      >
        <Routes>
          <Route path="map" element={<MapScreen />} />
          <Route path="lobby" element={<Lobby />} />
          <Route path="game" element={<RaftGame />} />
          <Route path="debrief" element={<Debrief />} />
        <Route path="*" element={<MapScreen />} />
      </Routes>
    </ChemistryShell>
  </ChemistryProvider>
);
}
