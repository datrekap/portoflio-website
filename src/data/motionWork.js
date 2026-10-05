export const MOTION_PATH = "/motion";

export const MOTION_INTRO = {
  title: "Video, motion, and visual storytelling",
  body: "I shoot, edit, and design videos so a message is easy to follow. The following is a showcase of field cinematography with motion graphics, finished in Premiere Pro, Davinci Resolve, and After Effects.",
};

/**
 * `preview` — short muted loop on the card (public/motion/previews).
 * `kind` — format label shown in the overlay (campaign, highlight, etc.).
 * `youtubeId` — full film in the overlay via youtube-nocookie embed.
 * `file` — local full film fallback when a YouTube id is not available yet.
 */
export const MOTION_PROJECTS = [
  {
    id: "slow-down-and-move-over-florida",
    title: "Slow Down and Move Over Florida",
    kind: "Campaign video",
    tags: ["Cinematography", "Post Production"],
    description:
      "Cinematography and post-production for Florida's Slow Down and Move Over campaign.",
    preview: "slow-down-and-move-over-florida.mp4",
    youtubeId: "xSrCjfv0Spo",
  },
  {
    id: "wekiva-parkway",
    title: "Wekiva Parkway Ribbon Cutting",
    kind: "Highlight video",
    tags: ["Cinematography", "Post Production"],
    description:
      "Cinematography and post-production for the Wekiva Parkway ribbon cutting.",
    preview: "wekiva-parkway-15-20.mp4",
    file: "Wekiva Parkway Ribbon Cutting_ Recap.mp4",
  },
  {
    id: "golden-glades-miami",
    title: "Golden Glades Miami",
    kind: "Promotional video",
    tags: ["Cinematography", "Post Production"],
    description:
      "Cinematography and post-production for Golden Glades in Miami, cut for a public audience.",
    preview: "golden-glades-miami.mp4",
    youtubeId: "kqFRTU4lRyk",
  },
  {
    id: "fdot-good-neighbor-trail",
    title: "FDOT: Good Neighbor Trail",
    kind: "Highlight video",
    tags: ["Cinematography", "Post Production"],
    description:
      "Field cinematography and post-production that follow the Good Neighbor Trail from the shoot to a finished film.",
    preview: "fdot-good-neighbor-trail.mp4",
    youtubeId: "PkaehUC1Q3k",
  },
  {
    id: "penndot-ev-introduction",
    title: "PennDOT EV Introduction",
    kind: "Promotional video",
    tags: ["Motion Graphics", "Art Direction"],
    description:
      "Motion graphics and art direction that introduce PennDOT's electric-vehicle work as one clear story.",
    preview: "penndot-ev-introduction.mp4",
    youtubeId: "xPphCvaEoUk",
  },
  {
    id: "mcat-mystop-app",
    title: "MCAT MySTop App",
    kind: "Explainer video",
    tags: ["Motion Graphics", "Art Direction"],
    description:
      "Motion graphics and art direction that explain the MySTop app in a short, direct sequence.",
    preview: "mcat-mystop-app.mp4",
    youtubeId: "XWZNgvu7dEY",
  },
  {
    id: "quest-home-page",
    title: "Quest Home Page",
    kind: "Commercial video",
    tags: ["Motion Graphics", "Art Direction"],
    description:
      "Motion graphics and art direction for the Quest homepage, built to lead the eye through the story.",
    preview: "quest-home-page.mp4",
    youtubeId: "IhbhFk8DPo8",
  },
  {
    id: "quest-unity-magazine",
    title: "Quest Unity Magazine Introduction",
    kind: "Promotional video",
    tags: ["Motion Graphics", "Art Direction"],
    description:
      "Motion graphics and art direction for the introduction to Quest's Unity magazine.",
    preview: "quest-unity-magazine.mp4",
    file: "Quest Unity Magazine Introduction.mp4",
  },
];

export function motionPreviewSrc(preview) {
  return `/motion/previews/${encodeURIComponent(preview)}`;
}

export function motionVideoSrc(file) {
  return `/motion/${encodeURIComponent(file)}`;
}

export function motionEmbedSrc(youtubeId) {
  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
  });
  return `https://www.youtube-nocookie.com/embed/${youtubeId}?${params}`;
}
