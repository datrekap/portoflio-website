export const PKW_PROJECT_ID = "parkwise";
export const PKW_ROUTE = "/parkwise";
export const PKW_MEDIA_BASE = "/work/ParkWise";
export const PKW_HERO_VIDEO = `${PKW_MEDIA_BASE}/Thumbnail-Hover.mp4`;
export const PKW_THUMBNAIL = `${PKW_MEDIA_BASE}/Thumbnail.webp`;
export const PKW_HERO_POSTER = PKW_THUMBNAIL;
export const PKW_CS = `${PKW_MEDIA_BASE}/case-study`;
export const PKW_PROMO_URL = "https://youtu.be/zJyRSEpXxg8";
export const PKW_ACCENT = "#2479f0";

export const PKW_SECTIONS = [
  { id: "pkw-overview", label: "Overview" },
  { id: "pkw-problem", label: "Problem" },
  { id: "pkw-solution", label: "Solution" },
  { id: "pkw-research", label: "Research" },
  { id: "pkw-design-approach", label: "Design Approach" },
  { id: "pkw-reflection", label: "Reflection" },
];

export const PKW_PROBLEM_CARDS = [
  {
    title: "Blind Search",
    body: "Students cannot see lot capacity before arriving, turning parking into a blind search that wastes fuel and adds campus traffic.",
    icon: "icon-blind-search.svg",
  },
  {
    title: "Academic Displacement",
    body: "A five-minute search can quickly become fifteen (or more), cutting into class time and making it harder for students to arrive focused.",
    icon: "icon-academic.svg",
  },
  {
    title: "Infrastructure Gap",
    body: "Without costly sensor infrastructure, universities cannot provide reliable availability data—leaving students to rely on luck.",
    icon: "icon-infrastructure.svg",
  },
];

export const PKW_CORE_FLOWS = [
  {
    title: "Find Open Lots",
    video: "find-open-lots.mp4",
    playbackRate: 1.3,
    videoLabel: "ParkWise flow for finding open parking lots",
    screens: [
      {
        label: "Locate Nearby Parking",
        src: "locate-parking.webp",
        alt: "ParkWise map showing nearby parking lots around the user",
      },
      {
        label: "Identify Available Lots",
        src: "identify-lots.webp",
        alt: "ParkWise highlighting available campus parking lots",
      },
      {
        label: "Access Lot Information",
        src: "access-information.webp",
        alt: "ParkWise lot details with availability and directions",
      },
    ],
  },
  {
    title: "Navigate to Open Lots",
    video: "naviagte-to-lots.mp4",
    videoLabel: "ParkWise flow for navigating to an open parking lot",
    screens: [
      {
        label: "Detailed Lot Information",
        src: "detailed-information.webp",
        alt: "ParkWise detailed view of a selected parking lot",
      },
      {
        label: "Lot Arrival Information",
        src: "lot-arrival.webp",
        alt: "ParkWise arrival confirmation at a parking lot",
      },
      {
        label: "Vehicle Parked Notification",
        src: "parked-notification.webp",
        alt: "ParkWise notification confirming the vehicle is parked",
      },
    ],
  },
  {
    title: "Leave a Parking Lot",
    video: "leaving-lot.mp4",
    videoLabel: "ParkWise flow for leaving a parking lot",
    screens: [
      {
        label: "Current Parking Information",
        src: "current-information.webp",
        alt: "ParkWise showing the user's current parked lot",
      },
      {
        label: "Leave Lot Action",
        src: "leave-action.webp",
        alt: "ParkWise leave-lot action on the map",
      },
      {
        label: "Immediate Positive Feedback",
        src: "positive-feedback.webp",
        alt: "ParkWise confirming the user has left and helped others",
        crop: "feedback",
      },
    ],
  },
];

export const PKW_NOTIFICATION_VIDEOS = [
  {
    id: "smart-alerts",
    src: "smart-alerts.mp4",
    label: "ParkWise smart alert when entering a parking lot",
  },
  {
    id: "lock-screen-notification",
    src: "lock-screen-notification.mp4",
    label: "ParkWise lock-screen notification for a one-tap update",
  },
  {
    id: "dynamic-notification",
    src: "dynamic-notification.mp4",
    label: "ParkWise Dynamic Island notification for parking updates",
  },
];

export const PKW_RESEARCH_QUESTIONS = [
  {
    question:
      "Q. What do you do when you enter campus and see your preferred lot is full?",
    items: [
      {
        label: "The “Loopers”",
        src: "research-1a.webp",
        alt: "Sticky notes from students who loop lots waiting for a spot",
      },
      {
        label: "Alternate Plan",
        src: "research-1b.webp",
        alt: "Sticky notes from students who switch to a backup lot",
      },
      {
        label: "Take Risk/Social Reliance",
        src: "research-1c.webp",
        alt: "Sticky notes from students who ask others or take a chance",
      },
    ],
  },
  {
    question:
      "Q. How do you currently find out which parking lots are open on campus?",
    items: [
      {
        label: "Social Network",
        src: "research-2a.webp",
        alt: "Sticky notes about learning lot status from friends and group chats",
      },
      {
        label: "Tactical/Known Experience",
        src: "research-2b.webp",
        alt: "Sticky notes about relying on personal campus parking habits",
      },
    ],
  },
  {
    question:
      "Q. In what ways has the search for parking interfered with your academic performance or classroom experience?",
    items: [
      {
        label: "High Academic Impact",
        src: "research-3a.webp",
        alt: "Sticky notes on parking searches causing missed or late classes",
      },
      {
        label: "Indirect Academic Impact",
        src: "research-3b.webp",
        alt: "Sticky notes on parking stress affecting focus once in class",
      },
      {
        label: "Behavioral Impact",
        src: "research-3c.webp",
        alt: "Sticky notes on how parking search changes student behavior",
      },
    ],
  },
];
