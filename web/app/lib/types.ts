export type FeedVideo = {
  id: string;
  headline: string;
  creatorName: string;
  creatorHandle: string;
  districtId: string;
  districtName: string;
  state: string;
  category: string;
  tags: string[];
  thumbnailUrl: string | null;
  playbackUrl: string | null;
  seed: string; // fallback image seed when no thumbnail
  place: string;
  date: string;
  isLive: boolean;
};

export const REGIONS = [
  "Durgapur",
  "Asansol",
  "Kolkata",
  "Bardhaman",
  "Bankura",
  "West Bengal",
  "Bihar",
  "Jharkhand",
  "Delhi",
  "National",
];

export const CATEGORIES: { label: string; emoji: string; bg: string }[] = [
  { label: "Horoscope", emoji: "🔮", bg: "#1F2937" },
  { label: "Panchang", emoji: "📜", bg: "#B45309" },
  { label: "Commodities", emoji: "🧺", bg: "#F59E0B" },
  { label: "Fuel", emoji: "⛽", bg: "#16A34A" },
  { label: "Gold", emoji: "🥇", bg: "#CA8A04" },
  { label: "Weather", emoji: "⛅", bg: "#0EA5E9" },
  { label: "Jobs", emoji: "💼", bg: "#DC2626" },
  { label: "Electricity", emoji: "⚡", bg: "#EAB308" },
  { label: "Schemes", emoji: "🏛️", bg: "#0F7B5A" },
];

export const CHIPS = ["Breaking", "Police", "Civic", "Politics", "Viral", "Accident", "Sports"];
