export const TROJAN_PROJECT_ID = "trojanstep";
export const TROJAN_ROUTE = "/trojanstep";
export const TROJAN_MEDIA_BASE = "/work/TrojanStep";
export const TROJAN_HERO_VIDEO = `${TROJAN_MEDIA_BASE}/Thumbnail-Hover.mp4`;
export const TROJAN_THUMBNAIL = `${TROJAN_MEDIA_BASE}/Thumbnail.webp`;
export const TROJAN_HERO_POSTER = TROJAN_THUMBNAIL;
export const TROJAN_CS = `${TROJAN_MEDIA_BASE}/case-study`;

export const TROJAN_SECTIONS = [
  { id: "trojan-overview", label: "Overview" },
  { id: "trojan-inspiration", label: "Inspiration" },
  { id: "trojan-problem", label: "Problem" },
  { id: "trojan-design-process", label: "Design Process" },
  { id: "trojan-artifact", label: "The Artifact" },
  { id: "trojan-evaluation", label: "Evaluation" },
  { id: "trojan-highlights", label: "Highlights" },
  { id: "trojan-future-work", label: "Future Work" },
];

export const TROJAN_LIVE_URL =
  "https://gtvault-my.sharepoint.com/personal/dgambrell30_gatech_edu/_layouts/15/stream.aspx?id=%2Fpersonal%2Fdgambrell30%5Fgatech%5Fedu%2FDocuments%2FRecordings%2FMSDM%20Project%20Presentations%2D20260428%5F113039%2DMeeting%20Recording%2Emp4&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2Eeaa19a8e%2Dbd4c%2D44d6%2D8dda%2D9f48d1e15998";

export const TROJAN_DANCE_VIDS = [1, 2, 3, 4, 5, 6, 7, 8].map(
  (index) => `${TROJAN_CS}/dance-vids/dance-${index}.mp4`,
);

export const TROJAN_INFLUENCE_PROJECTS = [
  { name: "ILLUMINATE", src: `${TROJAN_CS}/illuminate.mp4` },
  { name: "LUMINAI", src: `${TROJAN_CS}/luminai.mp4` },
  { name: "MOULD", src: `${TROJAN_CS}/mould.mp4` },
  { name: "ANTIBODY", src: `${TROJAN_CS}/antibody.mp4` },
];

export const TROJAN_RESEARCH_EXAMPLES = [
  {
    src: `${TROJAN_CS}/forsythe.png`,
    hoverSrc: `${TROJAN_CS}/problem-hover-1.svg`,
    alt: "William Forsythe Improvisation Technologies visual",
    text: "There exists deep evolutionary and biological roots of dance and rhythmic movement in humans and other animals. (Frederick, 2019)",
    imageFirst: true,
  },
  {
    src: `${TROJAN_CS}/magritte.png`,
    hoverSrc: `${TROJAN_CS}/problem-hover-2.svg`,
    alt: "René Magritte, The Son of Man",
    text: "Yet, there is a sense of hesitation to engage in dance (particularly in social settings)",
    imageFirst: false,
  },
  {
    src: `${TROJAN_CS}/just-dance.png`,
    hoverSrc: `${TROJAN_CS}/problem-hover-3.svg`,
    alt: "Just Dance gameplay still",
    text: "Traditional dance classes or popular dance-based games (JustDance), often fail to address the root causes of this reluctance. You get points if you match the correct moves often causing the problem.",
    imageFirst: true,
  },
  {
    src: `${TROJAN_CS}/problem-gap.png`,
    hoverSrc: `${TROJAN_CS}/problem-hover-4.svg`,
    alt: "Interactive movement installation still",
    text: "There remains a gap in interventions to introduce low-pressure opportunities for individuals to rediscover dance as a natural and joyful act.",
    imageFirst: false,
  },
];

export const TROJAN_DESIGN_ASPECTS = [
  {
    label: "Interaction Design",
    caption: "Getting skeleton data and defining collision logic",
    layout: "pair",
    videos: [
      `${TROJAN_CS}/interaction-design-1.mp4`,
      `${TROJAN_CS}/interaction-design-2.mp4`,
    ],
  },
  {
    label: "Visual Identity",
    caption: "Exploring the visuals using different approaches",
    layout: "grid",
    videos: [
      `${TROJAN_CS}/visual-identity-1.mp4`,
      `${TROJAN_CS}/visual-identity-2.mp4`,
      `${TROJAN_CS}/visual-identity-3.mp4`,
      `${TROJAN_CS}/visual-identity-4.mp4`,
    ],
  },
  {
    label: "Game Mechanics",
    caption: "Setting up levels and phases",
    layout: "pair",
    videos: [
      `${TROJAN_CS}/game-mechanics-1.mp4`,
      `${TROJAN_CS}/game-mechanics-2.mp4`,
    ],
  },
];

export const TROJAN_CORE_FLOWS = [
  {
    label: "Start Game",
    src: `${TROJAN_CS}/core-flows/start-game.mp4`,
    caption: "Show the peace sign to the camera to start.",
  },
  {
    label: "Collision Mechanics",
    src: `${TROJAN_CS}/core-flows/collision-mechanics.mp4`,
    caption: "Reach for the object using different parts of your body.",
  },
  {
    label: "Activity Bar",
    src: `${TROJAN_CS}/core-flows/activity-bar.mp4`,
    caption: "Fill up the activity bar on successful collisions",
  },
  {
    label: "Unlock New Phases",
    src: `${TROJAN_CS}/core-flows/new-phases.mp4`,
    caption: "Fill up the bar and explore new phases",
  },
  {
    label: "End Game",
    src: `${TROJAN_CS}/core-flows/end-game.mp4`,
    caption: "Complete a total of 7 phases to finish the game.",
  },
];

export const TROJAN_FEATURES = [
  {
    src: `${TROJAN_CS}/sets-apart/blend-free-flow.mp4`,
    text: "Equal blend of free flow movement and rule based game mechanics.",
  },
  {
    src: `${TROJAN_CS}/sets-apart/no-depth-cam.mp4`,
    text: "Skeleton Tracking without high end hardware (No Depth Camera required)",
  },
  {
    src: `${TROJAN_CS}/sets-apart/gamified-intervention.mp4`,
    text: "Gamified intervention to tackle issues around anxiety related to dancing",
  },
  {
    src: `${TROJAN_CS}/sets-apart/zero-ui.mp4`,
    text: "“Zero-UI” design inspiration",
  },
];

export const TROJAN_DANCE_RATINGS = [
  {
    statement: "I worry about how others perceive me when I dance",
    filled: 12,
  },
  {
    statement:
      "I feel comfortable dancing when I am alone and no one is watching",
    filled: 19,
  },
  {
    statement:
      "I often feel self-conscious about the way I move my body in front of other people",
    filled: 17,
  },
];

export const TROJAN_GAME_RATINGS = [
  {
    statement: "By the end of the game, I felt like I was dancing",
    filled: 19,
  },
  {
    statement:
      "I felt comfortable adding flair or expressiveness to my movements",
    filled: 19,
  },
  {
    statement: "I was not concerned with how I was presenting myself",
    filled: 17,
  },
];

export const TROJAN_QUOTES = [
  "By the time I knew what I was doing, I didn’t want to stop, it was electric",
  "I loved the game because it got me out of my comfort zone",
  "It’s a great blend of game meets mindfulness meets creative expression.",
  "It is a privilege to experience new art. It is very well done and pretty. I can see how it can benefit health and wellbeing",
  "I LOVED EVERYTHING",
  "This game made me, a born introvert, comfortable with dancing in an open space. That’s incredible.",
  "I love that it invited me to dance, without explicitly demanding it.",
  "I was focused on “winning” the game but the game itself led me into dance moves - so that was amazing",
];
