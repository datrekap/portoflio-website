export const SC_PROJECT_ID = "soundclouds";
export const SC_ROUTE = "/soundclouds";
export const SC_MEDIA_BASE = "/work/SoundClouds";
export const SC_HERO_VIDEO = `${SC_MEDIA_BASE}/Thumbnail-Hover.mp4`;
export const SC_THUMBNAIL = `${SC_MEDIA_BASE}/Thumbnail.webp`;
export const SC_CS = `${SC_MEDIA_BASE}/case-study`;
export const SC_HERO_POSTER = `${SC_CS}/hero.webp`;
export const SC_ACCENT = "#10419d";

export const SC_VIDEO_URL = "https://www.youtube.com/watch?v=NAArNksDM08";

export const SC_SECTIONS = [
  { id: "sc-overview", label: "Overview" },
  { id: "sc-problem", label: "Problem" },
  { id: "sc-solution", label: "Solution" },
  { id: "sc-interactions", label: "Interactions" },
  { id: "sc-design-approach", label: "Design Approach" },
  { id: "sc-result", label: "Result" },
  { id: "sc-reflection", label: "Reflection & Future" },
];

export const SC_META = [
  [
    { label: "ROLE", value: "AI Engineer &\nResearcher" },
    { label: "DURATION", value: "January 2025 - August 2025" },
    { label: "TOOLS", value: "OpenCV, Arduino, Python, Max/MSP, Otter.ai" },
  ],
  [
    {
      label: "IN COLLABORATION WITH",
      value: "The Expressive\nMachinery Lab",
    },
    {
      label: "EXHIBITIONS",
      value: "Atlanta Goat Farm; DM Demo Day;\nNight of Ideas",
      exhibitions: true,
    },
    { label: "PUBLISHED AT", value: "NeurIPS (2025) C&C (2026)" },
  ],
];

export const SC_STATS = [
  { number: 200, suffix: "+", label: "Participants" },
  { number: 35, label: "Post Experience Interviews" },
  { number: 3, label: "Exhibitions" },
];

export const SC_GALLERY = [
  {
    src: "interactions/01-green-room.mp4",
    poster: "interactions/01-green-room.webp",
    alt: "A green inflatable and smaller spheres glowing in the warehouse",
    className: "sc-s1",
  },
  {
    src: "interactions/02-pink-balloon.jpg",
    alt: "Two visitors reaching toward a large pink inflatable",
    className: "sc-s2",
  },
  {
    src: "interactions/03-blue-pattern-sphere.jpg",
    alt: "A visitor standing against a blue sphere covered in projected pattern",
    className: "sc-s3",
  },
  {
    src: "interactions/04-arms-raised.mp4",
    poster: "interactions/04-arms-raised.webp",
    alt: "Two people lifting their arms into an inflatable overhead",
    className: "sc-s4",
  },
  {
    src: "interactions/05-lifting-sphere.jpg",
    alt: "A visitor lifting a glowing blue sphere above their head",
    className: "sc-s5",
  },
  {
    src: "interactions/06-blue-foreground.mp4",
    poster: "interactions/06-blue-foreground.webp",
    alt: "A large blue inflatable filling the foreground of the room",
    className: "sc-s6",
  },
  {
    src: "interactions/07-yellow-and-blue.jpg",
    alt: "Yellow and blue inflatables hanging above people in the exhibition",
    className: "sc-s7",
  },
  {
    src: "interactions/08-white-balloon.mp4",
    poster: "interactions/08-white-balloon.webp",
    alt: "A white inflatable hanging above visitors in the warehouse",
    className: "sc-s8",
  },
  {
    src: "interactions/09-pair-of-balloons.jpg",
    alt: "Visitors moving a pair of large blue inflatables across the floor",
    className: "sc-s9",
  },
  {
    src: "interactions/10-hands-raised.mp4",
    poster: "interactions/10-hands-raised.webp",
    alt: "Visitors with their hands raised toward the inflatables",
    className: "sc-s10",
  },
];

export const SC_CROWD_QUOTES = [
  {
    id: "awe",
    x: "16%",
    y: "54%",
    quote:
      "I was just kind of in awe, I was just kind of like, this is fascinating, like, jaw on the floor . . . it felt almost dream like.",
  },
  {
    id: "nature",
    x: "47%",
    y: "46%",
    quote:
      "It’s like when you forget your current worries and evade stress, just to feel connected to nature in the same way.",
  },
  {
    id: "lake",
    x: "73%",
    y: "46%",
    quote:
      "I feel like I might cry, it gives me the sensation that I'm swimming in a lake that is very peaceful, and I don't have to do anything.",
  },
];

export const SC_HOW_STEPS = [
  {
    image: "how/step-1.webp",
    imageSide: "left",
    alt: "A person pushes a green sphere that sits in zone 8 of a nine-zone grid",
    body: "Participant A gives cloud 1 a strong push, sending it diagonally across the space.",
  },
  {
    image: "how/step-2.webp",
    imageSide: "right",
    alt: "The green sphere arrives in zone 6 and the grid marks the new zone",
    body: "Cloud 1 stops at grid zone #6. The color of the cloud changes respectively.",
  },
  {
    image: "how/step-3.webp",
    imageSide: "left",
    alt: "The sphere turns purple in zone 6 while a nearby speaker is indicated",
    body: "Cloud 1 changes color from green to purple. The change also activates the speaker close to zone #6 and triggers a sound sample.",
  },
  {
    image: "how/step-4.webp",
    imageSide: "right",
    alt: "A second participant moves the purple sphere from zone 6 toward zone 4",
    body: "Participant B now moves cloud 1 from zone #6 to zone #4.",
  },
  {
    image: "how/step-5.webp",
    imageSide: "left",
    alt: "The sphere turns pink in zone 4 and the grid marks the new location",
    body: "Cloud 1 changes color to pink, indicating a change in location. This change also triggers the speaker close to that zone to add the respective sound sample.",
  },
];

export const SC_PUBLICATIONS = [
  {
    title:
      '"Jaw Dropping" Sound Clouds: Exploring the Role of Awe in Ambient Computational Systems through Installation Art',
    authorsBefore: "Dashiel Carrera, Jasmine Kaur, ",
    authorsAfter: ", Chengzhi Zhang, Jisu Kim, Brian Magerko. C&C 2026",
    url: "https://dl.acm.org/doi/10.1145/3803784.3807553",
  },
  {
    title:
      "Sound Clouds: Exploring ambient intelligence in public spaces to elicit deep human experience of awe, wonder, and beauty",
    authorsBefore: "Chengzhi Zhang, Dashiel Carrera, ",
    authorsAfter: ", Jasmine Kaur, Jisu Kim, Brian Magerko. NeurIPS 2025",
    url: "https://openreview.net/forum?id=rOk1B3TYbj",
  },
];
