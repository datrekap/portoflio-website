export const PFAL_PROJECT_ID = "public-future-arts-lab";
export const PFAL_ROUTE = "/public-future-arts-lab";
export const PFAL_MEDIA_BASE = "/work/FBF";
export const PFAL_HERO_VIDEO = `${PFAL_MEDIA_BASE}/Thumbnail-Hover.mp4`;
export const PFAL_THUMBNAIL = `${PFAL_MEDIA_BASE}/Thumbnail.webp`;
export const PFAL_HERO_POSTER = PFAL_THUMBNAIL;
export const PFAL_OVERVIEW_VIDEO = `${PFAL_MEDIA_BASE}/case-study/hero-video.mp4`;

export const PFAL_LIVE_URL =
  "https://fultonbrighterfutures.github.io/FultonBrighterFutures/";

export const PFAL_SECTIONS = [
  { id: "pfal-context", label: "Context" },
  { id: "pfal-problem", label: "Problem" },
  { id: "pfal-discovery", label: "Discovery" },
  { id: "pfal-design-approach", label: "Design Approach" },
  { id: "pfal-solution", label: "Solution" },
  { id: "pfal-exhibition", label: "Final Exhibition" },
  { id: "pfal-reflection", label: "Reflection" },
  { id: "pfal-next-steps", label: "Next Steps" },
];

export const PFAL_DISCOVERY_STATS = [
  {
    prefix: "",
    number: 5.4,
    decimals: 1,
    suffix: "M +",
    label: "Kwh Energy",
    color: "#ff7700",
  },
  {
    prefix: "",
    number: 7.5,
    decimals: 1,
    suffix: "M +",
    label: "Lbs C02 Emissions",
    color: "#094d7f",
  },
  {
    prefix: "$",
    number: 280,
    decimals: 0,
    suffix: "K +",
    label: "Taxpayer Money",
    color: "#6cd36c",
  },
];

export const PFAL_COMPARISON_CARDS = [
  {
    title: "CO2 EMISSION REDUCED",
    value: "980,000 Lbs",
    detail: "≈ 1,130,000 miles driven",
    theme: "blue",
  },
  {
    title: "ENERGY GENERATED",
    value: "705,000 Kwh",
    detail: "≈ 58 homes powered for a year",
    theme: "orange",
  },
  {
    title: "College Park Library",
    value: "19,000 Kwh",
    theme: "highlight",
  },
];

export const PFAL_REFLECTION_LINKS = [
  { label: "View Live", href: PFAL_LIVE_URL },
  {
    label: "View Documentation",
    href: "https://github.com/FultonBrighterFutures/FultonBrighterFutures",
  },
  {
    label: "View News Feature",
    href: "https://www.fulcolibrary.org/news/fulton-brighter-futures/",
  },
];
