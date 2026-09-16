export const WORK_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "product-design", label: "Product Design" },
  { id: "engineering", label: "Engineering" },
  { id: "research", label: "Research" },
  { id: "motion", label: "Motion" },
];

export const workProjects = [
  {
    id: "public-future-arts-lab",
    title: "FultonBrighterFutures",
    role: "DESIGN ENGINEER",
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
    id: "sitehub-2",
    title: "Building SiteHub 2.0",
    role: "PRODUCT DESIGNER",
    category: "product-design",
    summary:
      "Redefining the user experience of a lease management SaaS platform by introducing a universal flagging system and reducing onboarding friction.",
    image: "public/work/PropertyWorks/Thumbnail.webp",
    route: "/sitehub-2",
    videoTransition: true,
  },
  {
    id: "parkwise",
    title: "ParkWise: Campus Parking App",
    role: "PRODUCT DESIGNER",
    category: "product-design",
    summary:
      "Simplifying the campus parking experience through a community-driven app",
    image: "public/work/ParkWise/Thumbnail.webp",
    route: "/parkwise",
    videoTransition: true,
  },
  {
    id: "trojanstep",
    title: "TrojanStep: Dance as a Game",
    role: "DESIGN ENGINEER & RESEARCHER",
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
    role: "DESIGN ENGINEER & RESEARCHER",
    category: "research",
    summary:
      "Informing Fulton County residents of the county's solar efforts. Maybe some more lines here.",
    image: "public/work/SoundClouds/Thumbnail.webp",
    badges: ["Accepted at C&C 2026", "Accepted at NeurIPS 2025"],
  },
  {
    id: "photovoice",
    title: "PhotoVoice",
    role: "MOTION DESIGNER",
    category: "motion",
    summary:
      "Some sentences that describe my work as the lead designer and what not.",
    image: "public/work/PhotoVoice/Thumbnail.webp",
  },
  {
    id: "puffer",
    title: "Puffer",
    role: "DESIGN ENGINEER & RESEARCHER",
    category: "research",
    summary:
      "Informing Fulton County residents of the county's solar efforts. Maybe some more lines here.",
    image: "public/work/Puffer/Thumbnail.webp",
    badges: ["Accepted at TEI 2026"],
  },
  {
    id: "mossbuds",
    title: "MossBuds",
    role: "PRODUCT DESIGNER",
    category: "product-design",
    summary:
      "How do I gamify dancing to remove the barriers of anxiety relating to body expression and movement.",
    image: "public/work/MossBuds/Thumbnail.webp",
  },
];
