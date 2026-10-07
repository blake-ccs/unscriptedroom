import table from "@/assets/dsc00077.jpg";
import shelves from "@/assets/dsc00087.jpg";
import globe from "@/assets/dsc00094.jpg";
import principles from "@/assets/dsc00112.jpg";
import hourglass from "@/assets/dsc00119.jpg";
import microphone from "@/assets/dsc00036.jpg";
import sign from "@/assets/dsc00064.jpg";
import brettPortrait from "@/assets/brett-studio-portrait.png";
import seasonOne0001 from "@/assets/season-one-0001.jpg";
import seasonOne0002 from "@/assets/season-one-0002.jpg";
import seasonOne0003 from "@/assets/season-one-0003.jpg";

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

export const seasonOneEpisodes = [
  {
    id: "zK1nmVflNoo",
    number: "0001",
    title: "All At Once",
    description:
      "Theo and Kate open up about raising a young family while building multiple businesses at once — and how they stay grounded, connected and resilient as a team.",
    thumbnail: seasonOne0001,
  },
  {
    id: "IX_19LrVykg",
    number: "0002",
    title: "Becoming Through Listening",
    description:
      "Troy, host of the podcast Seacoast Stories, on how listening shapes identity, creativity and personal growth.",
    thumbnail: seasonOne0002,
  },
  {
    id: "-oe9Aqa0h3g",
    number: "0003",
    title: "Risk VS Reward",
    description:
      "Brandon, a skilled driver turned business owner, on how lessons from high-level racing translate into real-world decision-making.",
    thumbnail: seasonOne0003,
  },
] as const;

export type ShortVideo = {
  id: string;
  title: string;
};

// Add verified YouTube Shorts IDs here, or populate this array from the
// YouTube Data API when credentials are available. Never infer Shorts from
// the main playlist or invent metadata.
export const roomShorts: ShortVideo[] = [
  { id: "maXn6Yjx6HU", title: "Trust Your Gut: Intuition vs. Fear" },
  { id: "uhwc1iVpkQ8", title: "Son Calls Dad an Asshole: A Powerful Parenting Lesson" },
  { id: "6oci5RvzE0E", title: "Parenting's Hardest Lesson: Breaking Your Own Narcissism" },
  { id: "I4jRN5SFyuQ", title: "Parenting Without a Roadmap: Navigating the Chaos" },
  { id: "r3vkj9AEfIA", title: "The Gift of Grief: Embracing Love's True Cost" },
  { id: "4XLFm8t7lsc", title: "Becoming a Father: Mourning Boyhood, Embracing Manhood" },
];
