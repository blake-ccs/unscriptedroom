export const SITE_URL = "https://theunscriptedroom.com";

/** Canonical link + og:url for a route, so every prerendered page points search engines at one URL. */
export function canonical(path: string) {
  const href = `${SITE_URL}${path === "/" ? "/" : path.replace(/\/$/, "")}`;
  return {
    meta: [{ property: "og:url", content: href }],
    links: [{ rel: "canonical", href }],
  };
}
