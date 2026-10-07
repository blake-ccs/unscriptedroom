// First-touch UTM capture, sent with lead forms so ActiveCampaign's UTM fields stay populated.
const KEY = "ur_utm";
const PARAMS = {
  utm_source: "utmSource",
  utm_medium: "utmMedium",
  utm_campaign: "utmCampaign",
  utm_content: "utmContent",
  utm_term: "utmTerm",
} as const;

export type Utm = Partial<Record<(typeof PARAMS)[keyof typeof PARAMS], string>>;

export function captureUtm() {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(KEY)) return;
    const search = new URLSearchParams(window.location.search);
    const utm: Utm = {};
    for (const [param, key] of Object.entries(PARAMS)) {
      const value = search.get(param)?.trim();
      if (value) utm[key] = value.slice(0, 200);
    }
    if (Object.keys(utm).length) sessionStorage.setItem(KEY, JSON.stringify(utm));
  } catch {
    // Storage unavailable (private mode etc.) — attribution is best-effort.
  }
}

export function getUtm(): Utm {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "{}") as Utm;
  } catch {
    return {};
  }
}
