// curiosity-web/src/pages/app/TeamChemistry/JoinTeamLobby.tsx
import { useState } from "react";
import { joinLobby, teamLobbyUrl } from "../../../lib/lobby";

type Props = { teamId: string };

export default function JoinTeamLobby({ teamId }: Props) {
  const [status, setStatus] = useState<string>("");

  async function onJoin() {
    setStatus("Joining lobby…");
    try {
      const { role } = await joinLobby(teamId);
      setStatus(`Joined as ${role}. Redirecting…`);
      // Navigate to your lobby route with team context:
      window.location.href = teamLobbyUrl(teamId);
    } catch (e: any) {
      setStatus(e?.response?.data?.error || e?.message || "Failed to join lobby");
    }
  }

  return (
    <div className="p-4 space-y-3">
      <button onClick={onJoin} className="px-4 py-2 rounded-2xl shadow bg-white text-black hover:opacity-90">
        Join Team Lobby
      </button>
      {status && <div className="text-sm opacity-80">{status}</div>}
    </div>
  );
}
