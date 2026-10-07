// Client for the existing Express API on Fly.io, which writes to ActiveCampaign.
export const API_BASE =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined)?.replace(/\/$/, "") ||
  "https://server-winter-pond-1948.fly.dev";

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

const TIMEOUT_MS = 15_000;

/** Drop undefined/blank values so the API never overwrites existing ActiveCampaign data with empties. */
function compact(body: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(body).filter(
      ([, v]) => v !== undefined && v !== null && !(typeof v === "string" && v.trim() === ""),
    ),
  );
}

export async function postJson<T = unknown>(
  path: string,
  body: Record<string, unknown>,
  init: { token?: string } = {},
): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}),
      },
      body: JSON.stringify(compact(body)),
      signal: controller.signal,
    });
    const data = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok)
      return {
        ok: false,
        status: res.status,
        error: data?.error || `Request failed (${res.status})`,
      };
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : "Network error",
    };
  } finally {
    clearTimeout(timer);
  }
}
