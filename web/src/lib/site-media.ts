import table from "@/assets/dsc00077.jpg";
import shelves from "@/assets/dsc00087.jpg";
import globe from "@/assets/dsc00094.jpg";
import principles from "@/assets/dsc00112.jpg";
import hourglass from "@/assets/dsc00119.jpg";
import microphone from "@/assets/dsc00036.jpg";
import sign from "@/assets/dsc00064.jpg";
import brettPortrait from "@/assets/brett-studio-portrait.png";
import mostViewed from "@/data/youtube-most-viewed.json";

export const roomMedia = {
  table: table,
  shelves: shelves,
  globe: globe,
  principles: principles,
  hourglass: hourglass,
  microphone: microphone,
  sign: sign,
  brettPortrait: brettPortrait,
} as const;

// Videos on the site are the channel's most-viewed uploads, refreshed with
// `npm run youtube:refresh` (scripts/youtube-most-viewed.mjs). Titles, descriptions and
// thumbnails all come from YouTube; nothing here is written by hand.
const thumbnails = import.meta.glob<string>("/src/assets/youtube/*.jpg", {
  eager: true,
  import: "default",
});
const thumbnailFor = (id: string) =>
  Object.entries(thumbnails).find(([file]) => file.endsWith(`/${id}.jpg`))?.[1] ?? "";

export type EpisodeVideo = {
  id: string;
  title: string;
  label: string;
  description: string;
  views: number;
  thumbnail: string;
};

export const seasonOneEpisodes: EpisodeVideo[] = mostViewed.episodes.map((v) => ({
  id: v.id,
  title: v.title,
  label: v.label,
  description: v.description,
  views: v.views,
  thumbnail: thumbnailFor(v.id),
}));

export type ShortVideo = {
  id: string;
  title: string;
  /** YouTube's own vertical thumbnail for the Short, resized to 540×960. */
  thumbnail: string;
};

export const shortUrl = (id: string) => `https://www.youtube.com/shorts/${id}`;

export const roomShorts: ShortVideo[] = mostViewed.shorts.map((v) => ({
  id: v.id,
  title: v.title,
  thumbnail: thumbnailFor(v.id),
}));

export const mostViewedFetchedAt = mostViewed.fetchedAt;
