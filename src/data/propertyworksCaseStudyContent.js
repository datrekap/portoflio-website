export const PW_PROJECT_ID = "sitehub-2";
export const PW_ROUTE = "/sitehub-2";
export const PW_MEDIA_BASE = "/work/PropertyWorks";
export const PW_HERO_VIDEO = `${PW_MEDIA_BASE}/Thumbnail-Hover.mp4`;
export const PW_THUMBNAIL = `${PW_MEDIA_BASE}/Thumbnail.webp`;
export const PW_HERO_POSTER = PW_THUMBNAIL;
export const PW_CS = `${PW_MEDIA_BASE}/case-study`;
export const PW_COMPANY_URL = "https://www.propertyworks.com/";

export const PW_SECTIONS = [
  { id: "pw-overview", label: "Overview" },
  { id: "pw-problem", label: "Problem" },
  { id: "pw-solution", label: "Solution" },
  { id: "pw-research", label: "Research" },
  { id: "pw-design-approach", label: "Design Approach" },
  { id: "pw-reflection", label: "Reflection" },
];

export const PW_ACCENT = "#192e59";

export const PW_PRIORITIES = [
  { key: "high", label: "High Priority" },
  { key: "normal", label: "Normal Priority" },
  { key: "low", label: "Low Priority" },
];

export const PW_FLAG_SYSTEM = [
  { id: "flag", label: "FLAG", icon: "flag" },
  { id: "note", label: "NOTE", icon: "note" },
  { id: "task", label: "TASK", icon: "task" },
];

export const PW_SLOT_BLUE = "#1D3667";

export const PW_SOLUTION_STATS = [
  {
    number: 45,
    suffix: "%",
    label: "faster issue resolution",
    color: PW_SLOT_BLUE,
  },
  {
    number: 35,
    suffix: "%",
    label: "less time chasing updates",
    color: PW_SLOT_BLUE,
  },
  {
    number: 60,
    suffix: "%",
    label: "faster client onboarding",
    color: PW_SLOT_BLUE,
  },
];

export const PW_SOLUTION_BLOCKS = [
  {
    title: "INSTANTLY SEE WHAT MATTERS",
    titleClass: "cs-heading-display",
    body: "The action system integrates seamlessly across the platform, letting users attach flags, notes, or tasks to any field without cluttering the interface. Color-coded icons keep priorities and responsibilities clear at a glance, even with multiple actions living on the same page.",
    type: "video",
    framed: true,
    src: `${PW_CS}/universal-integration.mp4`,
    alt: "SiteHub action system integrated across a lease record",
  },
  {
    title: "What happens after something's flagged?",
    titleClass: "cs-heading-md cs-heading-md--bold",
    body: "Every flag, task, or note stays editable after it's created. Users can update details as things change, or mark the item resolved once it's been handled, keeping the system up-to-date.",
    type: "video",
    framed: true,
    src: `${PW_CS}/edit-action.mp4`,
    alt: "Editing or resolving a flagged action in SiteHub",
  },
  {
    title: "ACTION LOG",
    titleClass: "cs-heading-display",
    body: 'To see a cumulative view of all actions, I designed an updated navigation bar to include an "Action Log". In this page, users have the ability to view all actions across the entire system and can also edit or resolve them.',
    type: "image",
    src: `${PW_CS}/action-log.webp`,
    alt: "SiteHub Action Log showing all flags, notes, and tasks",
  },
  {
    title: "Switch between list/card view",
    titleClass: "cs-body pw-solution-kicker",
    type: "video",
    framed: true,
    src: `${PW_CS}/list-card.mp4`,
    alt: "Action Log list and card view toggle",
  },
  {
    title: "Filter/Edit/Resolve",
    titleClass: "cs-body pw-solution-kicker",
    type: "video",
    framed: true,
    src: `${PW_CS}/filter-edit-resolve.mp4`,
    alt: "Filtering, editing, and resolving actions in the Action Log",
  },
  {
    title: "ACCOUNT CREATION",
    titleClass: "cs-heading-display",
    body: "I introduced a self-onboarding experience that allows new clients to create their own accounts and get set up directly within the platform.",
    type: "video",
    framed: true,
    src: `${PW_CS}/account-creation.mp4`,
    alt: "Self-serve SiteHub account creation flow",
  },
  {
    title: "Interactive modals with error status",
    titleClass: "cs-body pw-solution-kicker",
    type: "video",
    framed: true,
    src: `${PW_CS}/interactive-modals.mp4`,
    alt: "Interactive account creation modals with error states",
  },
];
