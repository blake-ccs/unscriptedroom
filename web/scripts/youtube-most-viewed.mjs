// Refreshes the videos shown on the site with the most-viewed uploads on the YouTube channel.
//
//   npm run youtube:refresh                  # fetch the channel, rank by views, write data + thumbnails
//   npm run youtube:refresh -- --from x.json # reuse a previously saved stats file (no channel crawl)
//
// Output: src/data/youtube-most-viewed.json and thumbnails in src/assets/youtube/.
// Full-length episodes come from the channel's Videos tab (≥ MIN_EPISODE_SECONDS long);
// clips come from the Shorts tab. No API key needed: it reads YouTube's public pages,
// so run it locally and commit the result rather than running it during the Netlify build.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const CHANNEL = "https://www.youtube.com/@unscriptedroompodcast";
const EPISODE_COUNT = 3;
const SHORT_COUNT = 6;
const MIN_EPISODE_SECONDS = 20 * 60;
const OUT_JSON = "src/data/youtube-most-viewed.json";
const OUT_IMG = "src/assets/youtube";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36";
const HEADERS = { "User-Agent": UA, "Accept-Language": "en-US", Cookie: "CONSENT=YES+1" };

// Extract the JSON object assigned to `name` in a YouTube page (string-aware brace matching).
function pageJson(html, name) {
  const at = html.indexOf(`${name} = `);
  if (at < 0) return null;
  const start = html.indexOf("{", at);
  let depth = 0,
    inStr = false,
    esc = false;
  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) return JSON.parse(html.slice(start, i + 1));
  }
  return null;
}

function collectIds(node, ids, continuations) {
  if (Array.isArray(node)) return node.forEach((x) => collectIds(x, ids, continuations));
  if (!node || typeof node !== "object") return;
  if (node.videoRenderer?.videoId) ids.add(node.videoRenderer.videoId);
  if (node.lockupViewModel?.contentId && node.lockupViewModel.contentType?.includes("VIDEO"))
    ids.add(node.lockupViewModel.contentId);
  const reel = node.shortsLockupViewModel?.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId;
  if (reel) ids.add(reel);
  const token = node.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token;
  if (token) continuations.push(token);
  Object.values(node).forEach((v) => collectIds(v, ids, continuations));
}

async function tabIds(tab) {
  const html = await (await fetch(`${CHANNEL}/${tab}`, { headers: HEADERS })).text();
  const cfg = JSON.parse(html.match(/ytcfg\.set\((\{.*?\})\);/s)[1]);
  const ids = new Set();
  const queue = [];
  collectIds(pageJson(html, "ytInitialData"), ids, queue);
  for (let page = 0; queue.length && page < 40; page++) {
    const res = await fetch(
      `https://www.youtube.com/youtubei/v1/browse?key=${cfg.INNERTUBE_API_KEY}&prettyPrint=false`,
      {
        method: "POST",
        headers: { ...HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify({
          context: {
            client: {
              clientName: "WEB",
              clientVersion: cfg.INNERTUBE_CLIENT_VERSION,
              hl: "en",
              gl: "US",
            },
          },
          continuation: queue.shift(),
        }),
      },
    );
    collectIds(await res.json(), ids, queue);
  }
  return [...ids];
}

async function videoStats(id) {
  try {
    const html = await (
      await fetch(`https://www.youtube.com/watch?v=${id}`, { headers: HEADERS })
    ).text();
    const player = pageJson(html, "ytInitialPlayerResponse");
    const d = player?.videoDetails ?? {};
    return {
      id,
      title: d.title ?? "",
      views: Number(d.viewCount ?? 0),
      seconds: Number(d.lengthSeconds ?? 0),
      published: player?.microformat?.playerMicroformatRenderer?.publishDate ?? "",
      shortDescription: (d.shortDescription ?? "").slice(0, 600),
      status: player?.playabilityStatus?.status ?? "",
    };
  } catch (error) {
    return { id, error: String(error?.message ?? error), views: -1 };
  }
}

async function crawlChannel() {
  const stats = { fetchedAt: new Date().toISOString() };
  for (const tab of ["videos", "shorts"]) {
    const ids = await tabIds(tab);
    console.log(`[youtube] ${tab}: ${ids.length} uploads`);
    stats[tab] = [];
    for (const id of ids) {
      stats[tab].push(await videoStats(id));
      await new Promise((r) => setTimeout(r, 150));
    }
  }
  return stats;
}

// "Season 1 Episode 15 - Gratitude For Being You - Unscripted Room Podcast #0026"
//   → { title: "Gratitude For Being You", label: "Season 1 · Episode 15" }
// Other titles: drop hashtags (e.g. #shorts) and any " | …" / " - Unscripted Room…" suffix.
function cleanTitle(raw) {
  const episode = raw.match(
    /^Season\s+(\d+)\s+Episode\s+(\d+)\s+-\s+(.+?)(?:\s+-\s+Unscripted Room.*)?$/i,
  );
  if (episode)
    return {
      title: episode[3].replace(/#\w+/g, "").trim(),
      label: `Season ${episode[1]} · Episode ${episode[2]}`,
    };
  const title = raw
    .replace(/#\w+/g, "")
    .split(/\s+[|｜]\s+/)[0]
    .replace(/\s+-\s+Unscripted Room.*$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return { title, label: "" };
}

// First real sentence(s) of the YouTube description, up to ~220 characters. Never invented.
function summary(description) {
  const firstPara =
    description
      .split(/\n\s*\n/)
      .find((p) => p.trim() && !/^(https?:|#|follow|subscribe|listen)/i.test(p.trim())) ?? "";
  const text = firstPara.replace(/\s+/g, " ").trim();
  if (text.length <= 220) return text;
  const cut = text.slice(0, 220);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  return end > 80 ? cut.slice(0, end + 1) : `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

async function download(url, file) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return false;
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  return true;
}

// Downscale with macOS `sips` when available; otherwise keep YouTube's original size.
function resize(file, width, height) {
  try {
    execFileSync(
      "sips",
      [
        "-s",
        "format",
        "jpeg",
        "-s",
        "formatOptions",
        "72",
        "-z",
        String(height),
        String(width),
        file,
        "--out",
        file,
      ],
      { stdio: "ignore" },
    );
  } catch {
    /* sips not available — original size is fine */
  }
}

const fromIndex = process.argv.indexOf("--from");
const stats =
  fromIndex > 0
    ? JSON.parse(fs.readFileSync(process.argv[fromIndex + 1], "utf8"))
    : await crawlChannel();
const playable = (v) => !v.error && v.status === "OK" && v.views >= 0;

const episodes = stats.videos
  .filter((v) => playable(v) && v.seconds >= MIN_EPISODE_SECONDS)
  .sort((a, b) => b.views - a.views)
  .slice(0, EPISODE_COUNT);
const shorts = stats.shorts
  .filter((v) => playable(v) && v.seconds > 0 && v.seconds <= 180)
  .sort((a, b) => b.views - a.views)
  .slice(0, SHORT_COUNT);

fs.mkdirSync(OUT_IMG, { recursive: true });
for (const f of fs.readdirSync(OUT_IMG)) fs.unlinkSync(path.join(OUT_IMG, f));
for (const v of episodes) {
  const file = path.join(OUT_IMG, `${v.id}.jpg`);
  if (!(await download(`https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg`, file)))
    await download(`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`, file);
  resize(file, 960, 540);
}
for (const v of shorts) {
  const file = path.join(OUT_IMG, `${v.id}.jpg`);
  if (!(await download(`https://i.ytimg.com/vi/${v.id}/oar2.jpg`, file)))
    await download(`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`, file);
  resize(file, 540, 960);
}

const out = {
  source: CHANNEL,
  fetchedAt: stats.fetchedAt,
  episodes: episodes.map((v) => ({
    id: v.id,
    ...cleanTitle(v.title),
    fullTitle: v.title,
    description: summary(v.shortDescription),
    views: v.views,
    seconds: v.seconds,
    published: v.published,
  })),
  shorts: shorts.map((v) => ({
    id: v.id,
    title: cleanTitle(v.title).title,
    fullTitle: v.title,
    views: v.views,
    published: v.published,
  })),
};
fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.writeFileSync(OUT_JSON, `${JSON.stringify(out, null, 2)}\n`);
console.log(
  `[youtube] wrote ${OUT_JSON}: ${out.episodes.length} episodes, ${out.shorts.length} shorts`,
);
for (const v of out.episodes)
  console.log(`  episode ${String(v.views).padStart(6)} views  ${v.title}`);
for (const v of out.shorts)
  console.log(`  short   ${String(v.views).padStart(6)} views  ${v.title}`);
