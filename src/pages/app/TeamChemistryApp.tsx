import { useEffect, useMemo, useState } from "react";
import GameCanvas from "../../components/GameCanvas";
import { api } from "../../lib/api";
import { getActiveTeamId } from "../../lib/flow";
import { joinLivekit } from "../../lib/livekit";
import type { Room } from "livekit-client";

type Phase = "map" | "lobby" | "playing" | "debrief";

export default function TeamChemistryApp() {
  const teamId = getActiveTeamId() || 1;

  const [phase, setPhase] = useState<Phase>("map");
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coins, setCoins] = useState<number>(0);

  // LiveKit URL from env
  const livekitUrl = useMemo(() => import.meta.env.VITE_LIVEKIT_URL as string | undefined, []);

  useEffect(() => {
    // Fetch team coins
    (async () => {
      try {
        const { data } = await api.get(`/teams/${teamId}/coins`);
        setCoins(data.curiosity_coins ?? 0);
      } catch { /* ignore */ }
    })();
  }, [teamId]);

  // --- Actions ---

  const handleMissionSelect = async (missionId: string) => {
    setSelectedMission(missionId);
    setPhase("lobby");
  };

  const handleJoinByCode = async () => {
    if (!roomCode.trim()) return;
    setSelectedMission(roomCode.trim());
    setPhase("lobby");
  };

  const connectLobby = async () => {
    if (!selectedMission) return;
    if (!livekitUrl) {
      setError("LiveKit URL not configured. Set VITE_LIVEKIT_URL in your frontend env.");
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      // Ask backend for a LiveKit token for this room (room name strategy: team-<id>__<mission>)
      const roomName = `team-${teamId}__${selectedMission}`;
      const { data } = await api.post("/livekit/token", { team_id: teamId, room: roomName });
      const token = data?.token as string;
      if (!token) throw new Error("No token returned");

      const lkRoom = await joinLivekit({ url: livekitUrl, token });
      setRoom(lkRoom);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || "Failed to join lobby");
      return;
    } finally {
      setConnecting(false);
    }
  };

  const startGame = async () => {
    // Notify API that game started (optional)
    try {
      await api.post("/sessions/start", {
        team_id: teamId,
        mission: selectedMission,
      });
    } catch {/* ignore */}
    setPhase("playing");
  };

  const endGame = async () => {
    // Notify API that game ended (optional), award some demo coins
    try {
      await api.post("/sessions/end", {
        team_id: teamId,
        mission: selectedMission,
        stats: { sample: true }
      });
      const { data } = await api.post(`/teams/${teamId}/coins/adjust`, { delta: 5 });
      setCoins(data.curiosity_coins);
    } catch {/* ignore */}
    setPhase("debrief");
  };

  const leaveRoom = async () => {
    try {
      await room?.disconnect();
    } catch {/* ignore */}
    setRoom(null);
  };

  // --- UI ---

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-3xl font-bold">Team Chemistry</h2>
        <div className="rounded-xl2 border border-gray-200 bg-white px-3 py-1 text-sm">
          Coins: <span className="font-semibold">{coins}</span>
        </div>
      </div>

      {phase === "map" && (
        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
          <div className="card p-4">
            <GameCanvas onSelect={handleMissionSelect} />
          </div>
          <aside className="space-y-4">
            <div className="card p-4">
              <div className="text-sm font-semibold">Join by Room Code</div>
              <p className="mt-1 text-xs text-mute">
                If a teammate sent you a code, paste it here.
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  className="w-full"
                  placeholder="e.g. team-12__mission_3"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                />
                <button className="btn btn-ghost" onClick={handleJoinByCode}>Join</button>
              </div>
            </div>

            <div className="card p-4">
              <div className="text-sm font-semibold">How it works</div>
              <ul className="mt-2 list-disc pl-5 text-xs text-ink/80">
                <li>Select a mission from the map</li>
                <li>Gather in the lobby (voice on LiveKit)</li>
                <li>Click Start Game</li>
                <li>Afterward, head to Debrief</li>
              </ul>
            </div>
          </aside>
        </div>
      )}

      {phase === "lobby" && (
        <div className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm text-mute">Selected</div>
              <div className="text-lg font-semibold">{selectedMission}</div>
              <div className="text-xs text-mute mt-1">Room: {`team-${teamId}__${selectedMission}`}</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-ghost" onClick={() => { leaveRoom(); setPhase("map"); }}>
                Back to map
              </button>
              <button className="btn btn-primary" onClick={connectLobby} disabled={connecting || !!room}>
                {room ? "Connected" : connecting ? "Connecting…" : "Connect Lobby"}
              </button>
              <button className="btn btn-primary" onClick={startGame} disabled={!room}>
                Start Game
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-xl2 border border-gray-200 bg-white p-4 text-sm text-mute">
            {room ? "You're connected to the lobby via LiveKit. Use your microphone to coordinate." :
              "Connect to enable live audio & presence."}
          </div>

          {error && <div className="mt-4 rounded-xl2 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        </div>
      )}

      {phase === "playing" && (
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-mute">Mission</div>
              <div className="text-lg font-semibold">{selectedMission}</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-ghost" onClick={() => { leaveRoom(); setPhase("map"); }}>
                Exit
              </button>
              <button className="btn btn-primary" onClick={endGame}>End Game</button>
            </div>
          </div>
          {/* Placeholder for the actual Pixi gameplay stage (Unity replacement) */}
          <div className="relative aspect-video w-full rounded-xl2 bg-black/90">
            <div className="absolute inset-0 grid place-items-center text-white">
              <div className="text-center">
                <div className="text-xl font-semibold">PixiJS Gameplay Area</div>
                <div className="text-sm opacity-80">Your game scene renders here</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === "debrief" && (
        <div className="card p-6">
          <div className="mb-3 text-lg font-semibold">Debrief</div>
          <p className="text-sm text-mute">
            Discuss decisions and outcomes. Stats & transcripts will appear here.
          </p>
          <div className="mt-6 flex items-center gap-2">
            <button className="btn btn-ghost" onClick={() => { leaveRoom(); setPhase("map"); }}>
              Back to map
            </button>
            <button className="btn btn-primary" onClick={() => setPhase("lobby")}>
              Rejoin lobby
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
