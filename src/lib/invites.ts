// curiosity-web/src/lib/invites.ts
import { api } from "./api";

/**
 * Create invite emails for the current user's team.
 * Your backend route (per your note) is: POST /api/v1/teams/invites
 * NOTE: Because your api.baseURL already ends with /api/v1/,
 *       use a RELATIVE path without a leading slash to avoid //
 */
export async function createTeamInvites(emails: string[]) {
  const { data } = await api.post(
    "teams/invites",
    { emails }
  );
  return data; // expect { links?: string[], count?: number, ... } or 200 OK
}

/**
 * Accept an invite token after user logs in/registers.
 * Backend route: POST /api/v1/invites/accept
 */
export async function acceptInviteToken(token: string) {
  const { data } = await api.post(
    "invites/accept",
    { token }
  );
  return data;
}
