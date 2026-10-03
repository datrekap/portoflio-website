export const WORK_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "product-design", label: "Product Design" },
  { id: "engineering", label: "Engineering" },
  { id: "research", label: "Research" },
  { id: "motion", label: "Motion" },
];

export const workProjects = [
  {
    id: "sitehub-2",
    title: "Building SiteHub 2.0",
    role: "Product designer",
    category: "product-design",
    summary:
      "Improving the lease-management experience through a universal flagging system and a lower-friction onboarding flow.",
    image: "public/work/PropertyWorks/Thumbnail.webp",
    route: "/sitehub-2",
    videoTransition: true,
  },
  {
    id: "parkwise",
    title: "ParkWise: Campus Parking App",
    role: "Product designer",
    category: "product-design",
    summary:
      "Simplifying the campus parking experience through a community-driven app",
    image: "public/work/ParkWise/Thumbnail.webp",
    route: "/parkwise",
    videoTransition: true,
  },
  {
    id: "public-future-arts-lab",
    title: "FultonBrighterFutures",
    role: "Design engineer",
    category: "engineering",
    summary:
      "Visualizing the growth of solar energy across Fulton County through an interactive installation and web experience.",
    image: "public/work/FBF/Thumbnail.webp",
    route: "/public-future-arts-lab",
    videoTransition: true,
    heroVideoCrop: "cover-bottom",
    badges: ["Exhibited at Fulton County Government Center"],
  },
  {
    id: "trojanstep",
    title: "TrojanStep: Dance as a Game",
    role: "Design engineer & researcher",
    category: "research",
    summary:
      "Gamifying dance to remove the barriers of anxiety relating to body expression and movement",
    image: "public/work/TrojanStep/Thumbnail.webp",
    route: "/trojanstep",
    videoTransition: true,
    heroVideoCrop: "cover-bottom",
    badges: ["Exhibited at Georgia Tech DEMO DAY"],
  },
  {
    id: "soundclouds",
    title: "SoundClouds",
    role: "Design engineer & researcher",
    category: "research",
    summary:
      "Discovering how people make sense of ambient AI through play.",
    image: "public/work/SoundClouds/Thumbnail.webp",
    route: "/soundclouds",
    videoTransition: true,
    badges: ["Accepted at C&C 2026", "Accepted at NeurIPS 2025"],
  },
  {
    id: "photovoice",
    title: "Prismatic: Belonging in View",
    role: "Motion designer",
    category: "motion",
    summary:
      "Turning qualitative stories of graduate life into a spatial digital experience shaped by motion, color, and visual narrative.",
    image: "public/work/PhotoVoice/Thumbnail.webp",
    externalUrl:
      "https://sites.gatech.edu/belonging-studio/prismatic-belonging-in-view/",
  },
  {
    id: "puffer",
    title: "Puffer Soft Robotics",
    role: "Design engineer & researcher",
    category: "research",
    summary:
      "Guiding calmer breathing through a soft robot with responsive tactile cues.",
    image: "public/work/Puffer/Thumbnail.webp",
    badges: ["Accepted at TEI 2026"],
    externalUrl: "https://youtu.be/sdCgfE7PkMk",
  },
  {
    id: "mossbuds",
    title: "MossBuds",
    role: "Product designer",
    category: "product-design",
    summary:
      "Reimagining noise cancellation as a more personal way to experience the world.",
    image: "public/work/MossBuds/Thumbnail.webp",
    hoverEffect: "/work/hover-effect-under-development.svg",
  },
];
