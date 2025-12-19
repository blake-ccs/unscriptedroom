// curiosity-web/src/lib/lobby.ts
import { api } from "./api";

export async function joinLobby(
  team_id: string
): Promise<{ role: "admin" | "participant"; team_id: string }> {
  // Backend route: POST /api/v1/lobby/join
  const { data } = await api.post(
    "lobby/join",
    { team_id }
  );
  return data;
}

// Utility: construct a lobby URL in your app (frontend route)
export function teamLobbyUrl(team_id: string) {
  return `/app/lobby?team=${encodeURIComponent(team_id)}`;
}
