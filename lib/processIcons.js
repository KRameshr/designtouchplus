export const PROCESS_ICON_OPTIONS = [
  {
    key: "discover",
    label: "Discover (Chat / Message Bubble)",
    shortLabel: "Discover",
    description: "Chat bubble icon for discovery & brand alignment",
    src: "/icons/process/discover.svg",
  },
  {
    key: "plan",
    label: "Plan (Lightbulb / Strategy)",
    shortLabel: "Plan",
    description: "Lightbulb icon for ideation & strategic planning",
    src: "/icons/process/plan.svg",
  },
  {
    key: "create",
    label: "Create (Video Clapperboard)",
    shortLabel: "Create",
    description: "Clapperboard icon for production & creative execution",
    src: "/icons/process/create.svg",
  },
  {
    key: "review",
    label: "Review (Pencil / Edit)",
    shortLabel: "Review",
    description: "Pencil icon for collaborative review & refinement",
    src: "/icons/process/review.svg",
  },
  {
    key: "deliver",
    label: "Deliver (Paper Plane)",
    shortLabel: "Deliver",
    description: "Paper plane icon for final delivery & launch",
    src: "/icons/process/deliver.svg",
  },
];

const VALID_KEYS = new Set(PROCESS_ICON_OPTIONS.map((item) => item.key));
const FALLBACK_ORDER = ["discover", "plan", "create", "review", "deliver"];

export function resolveProcessIconKey(icon, title = "", stepNumber = 1) {
  const raw = (icon || "").toLowerCase().trim();
  if (VALID_KEYS.has(raw)) {
    return raw;
  }

  const normalizedTitle = (title || "").toLowerCase();
  if (normalizedTitle.includes("discover")) return "discover";
  if (normalizedTitle.includes("plan")) return "plan";
  if (normalizedTitle.includes("create")) return "create";
  if (normalizedTitle.includes("review")) return "review";
  if (normalizedTitle.includes("deliver")) return "deliver";

  const idx = Math.max(0, (Number(stepNumber) || 1) - 1) % FALLBACK_ORDER.length;
  return FALLBACK_ORDER[idx];
}

export function getProcessIconMeta(icon, title = "", stepNumber = 1) {
  const key = resolveProcessIconKey(icon, title, stepNumber);
  return (
    PROCESS_ICON_OPTIONS.find((item) => item.key === key) ||
    PROCESS_ICON_OPTIONS[0]
  );
}

