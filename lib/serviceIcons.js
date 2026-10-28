import React from "react";

export const SERVICE_ICON_OPTIONS = [
  {
    key: "video",
    label: "video — Video Editing Clapperboard",
    shortLabel: "video",
    src: "/icons/services/video.svg",
  },
  {
    key: "motion",
    label: "motion — Motion Graphics Film Frame",
    shortLabel: "motion",
    src: "/icons/services/motion.svg",
  },
  {
    key: "social",
    label: "social — Social Media Vertical Phone",
    shortLabel: "social",
    src: "/icons/services/social.svg",
  },
  {
    key: "youtube",
    label: "youtube — YouTube Play Badge",
    shortLabel: "youtube",
    src: "/icons/services/youtube.svg",
  },
  {
    key: "graphic",
    label: "graphic — Graphic Design Pen Nib",
    shortLabel: "graphic",
    src: "/icons/services/graphic.svg",
  },
  {
    key: "thumbnail",
    label: "thumbnail — Thumbnail Layered Frames",
    shortLabel: "thumbnail",
    src: "/icons/services/thumbnail.svg",
  },
  {
    key: "branding",
    label: "branding — Branding Megaphone",
    shortLabel: "branding",
    src: "/icons/services/branding.svg",
  },
  {
    key: "commercial",
    label: "commercial — Commercial Growth Chart",
    shortLabel: "commercial",
    src: "/icons/services/commercial.svg",
  },
];

export const SERVICE_COLOR_OPTIONS = [
  { key: "red", label: "Red (Video Editing)", hex: "#ef4444" },
  { key: "green", label: "Green (Motion / Commercial)", hex: "#22c55e" },
  { key: "violet", label: "Violet / Purple (Social Media)", hex: "#a855f7" },
  { key: "orange", label: "Orange (YouTube Management)", hex: "#f97316" },
  { key: "cyan", label: "Cyan / Sky Blue (Graphic Design)", hex: "#38bdf8" },
  { key: "yellow", label: "Yellow / Gold (Thumbnail Design)", hex: "#eab308" },
  { key: "pink", label: "Pink / Rose (Branding)", hex: "#ec4899" },
  { key: "blue", label: "Blue (Cobalt)", hex: "#3b82f6" },
  { key: "purple", label: "Purple (Classic)", hex: "#a855f7" },
];

// Client reference 8-card sequence: red, green, violet, orange, cyan, yellow, pink, green
export const REFERENCE_THEME_SEQUENCE = [
  "red",
  "green",
  "violet",
  "orange",
  "cyan",
  "yellow",
  "pink",
  "green",
];

export const SERVICE_ACCENT_THEMES = {
  red: {
    key: "red",
    label: "Red",
    hex: "#ef4444",
    iconText: "text-[#ef4444]",
    bullet: "bg-[#ef4444]",
    ctaText: "text-[#ef4444] group-hover:text-[#f87171] focus-visible:ring-[#ef4444]/60",
    cardHover:
      "hover:border-[#ef4444]/50 hover:shadow-[0_14px_36px_-14px_rgba(239,68,68,0.22)]",
    ambientGlow: "from-[#ef4444]/[0.06]",
  },
  green: {
    key: "green",
    label: "Green",
    hex: "#22c55e",
    iconText: "text-[#22c55e]",
    bullet: "bg-[#22c55e]",
    ctaText: "text-[#22c55e] group-hover:text-[#4ade80] focus-visible:ring-[#22c55e]/60",
    cardHover:
      "hover:border-[#22c55e]/50 hover:shadow-[0_14px_36px_-14px_rgba(34,197,94,0.22)]",
    ambientGlow: "from-[#22c55e]/[0.06]",
  },
  violet: {
    key: "violet",
    label: "Violet",
    hex: "#a855f7",
    iconText: "text-[#a855f7]",
    bullet: "bg-[#a855f7]",
    ctaText: "text-[#a855f7] group-hover:text-[#c084fc] focus-visible:ring-[#a855f7]/60",
    cardHover:
      "hover:border-[#a855f7]/50 hover:shadow-[0_14px_36px_-14px_rgba(168,85,247,0.22)]",
    ambientGlow: "from-[#a855f7]/[0.06]",
  },
  purple: {
    key: "violet",
    label: "Violet",
    hex: "#a855f7",
    iconText: "text-[#a855f7]",
    bullet: "bg-[#a855f7]",
    ctaText: "text-[#a855f7] group-hover:text-[#c084fc] focus-visible:ring-[#a855f7]/60",
    cardHover:
      "hover:border-[#a855f7]/50 hover:shadow-[0_14px_36px_-14px_rgba(168,85,247,0.22)]",
    ambientGlow: "from-[#a855f7]/[0.06]",
  },
  orange: {
    key: "orange",
    label: "Orange",
    hex: "#f97316",
    iconText: "text-[#f97316]",
    bullet: "bg-[#f97316]",
    ctaText: "text-[#f97316] group-hover:text-[#fb923c] focus-visible:ring-[#f97316]/60",
    cardHover:
      "hover:border-[#f97316]/50 hover:shadow-[0_14px_36px_-14px_rgba(249,115,22,0.22)]",
    ambientGlow: "from-[#f97316]/[0.06]",
  },
  cyan: {
    key: "cyan",
    label: "Cyan",
    hex: "#38bdf8",
    iconText: "text-[#38bdf8]",
    bullet: "bg-[#38bdf8]",
    ctaText: "text-[#38bdf8] group-hover:text-[#7dd3fc] focus-visible:ring-[#38bdf8]/60",
    cardHover:
      "hover:border-[#38bdf8]/50 hover:shadow-[0_14px_36px_-14px_rgba(56,189,248,0.22)]",
    ambientGlow: "from-[#38bdf8]/[0.06]",
  },
  blue: {
    key: "cyan",
    label: "Cyan",
    hex: "#38bdf8",
    iconText: "text-[#38bdf8]",
    bullet: "bg-[#38bdf8]",
    ctaText: "text-[#38bdf8] group-hover:text-[#7dd3fc] focus-visible:ring-[#38bdf8]/60",
    cardHover:
      "hover:border-[#38bdf8]/50 hover:shadow-[0_14px_36px_-14px_rgba(56,189,248,0.22)]",
    ambientGlow: "from-[#38bdf8]/[0.06]",
  },
  yellow: {
    key: "yellow",
    label: "Yellow",
    hex: "#eab308",
    iconText: "text-[#eab308]",
    bullet: "bg-[#eab308]",
    ctaText: "text-[#eab308] group-hover:text-[#facc15] focus-visible:ring-[#eab308]/60",
    cardHover:
      "hover:border-[#eab308]/50 hover:shadow-[0_14px_36px_-14px_rgba(234,179,8,0.22)]",
    ambientGlow: "from-[#eab308]/[0.06]",
  },
  pink: {
    key: "pink",
    label: "Pink",
    hex: "#ec4899",
    iconText: "text-[#ec4899]",
    bullet: "bg-[#ec4899]",
    ctaText: "text-[#ec4899] group-hover:text-[#f472b6] focus-visible:ring-[#ec4899]/60",
    cardHover:
      "hover:border-[#ec4899]/50 hover:shadow-[0_14px_36px_-14px_rgba(236,72,153,0.22)]",
    ambientGlow: "from-[#ec4899]/[0.06]",
  },
};

export function resolveServiceIconKey(iconType, slug = "", title = "") {
  const key = (iconType || "").toLowerCase().trim();
  if (SERVICE_ICON_OPTIONS.some((opt) => opt.key === key)) {
    return key;
  }
  const combined = `${slug} ${title}`.toLowerCase();
  if (combined.includes("motion")) return "motion";
  if (combined.includes("social") || combined.includes("reel")) return "social";
  if (combined.includes("youtube")) return "youtube";
  if (combined.includes("graphic") || combined.includes("design")) return "graphic";
  if (combined.includes("thumbnail")) return "thumbnail";
  if (combined.includes("brand")) return "branding";
  if (combined.includes("commercial") || combined.includes("ad")) return "commercial";
  return "video";
}

export function resolveServiceTheme(colorTheme, index = 0) {
  const raw = (colorTheme || "").toLowerCase().trim();
  if (SERVICE_ACCENT_THEMES[raw]) {
    return SERVICE_ACCENT_THEMES[raw];
  }
  const fallbackKey =
    REFERENCE_THEME_SEQUENCE[index % REFERENCE_THEME_SEQUENCE.length];
  return SERVICE_ACCENT_THEMES[fallbackKey];
}

export function ServiceOutlineIcon({ iconKey, className = "w-11 h-11" }) {
  const resolved = resolveServiceIconKey(iconKey);

  switch (resolved) {
    case "video":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M8 15.5 38.5 9.5 40.5 16.5 9.5 22.5Z" />
          <path d="m16 14 4 6.5" />
          <path d="m26 12 4 6.5" />
          <path d="M8 22.5h33V37a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4Z" />
          <rect x="17.5" y="27" width="14" height="9.5" rx="2" />
          <polygon
            points="23 29.5 27 31.75 23 34 23 29.5"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      );
    case "motion":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <rect x="7" y="7" width="34" height="34" rx="4" />
          <path d="M15 7v34" />
          <path d="M33 7v34" />
          <path d="M7 15.5h8" />
          <path d="M7 24h8" />
          <path d="M7 32.5h8" />
          <path d="M33 15.5h8" />
          <path d="M33 24h8" />
          <path d="M33 32.5h8" />
          <polygon points="21.5 19.5 28.5 24 21.5 28.5 21.5 19.5" />
        </svg>
      );
    case "social":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <rect x="13" y="5" width="22" height="38" rx="4" />
          <path d="M13 11h22" />
          <path d="M13 36h22" />
          <path d="M21.5 8h5" />
          <path d="M21 39.5h6" />
          <polygon points="21.5 19.5 28 23.5 21.5 27.5 21.5 19.5" />
        </svg>
      );
    case "youtube":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <rect x="6" y="11" width="36" height="26" rx="7" />
          <polygon points="21 18.5 29.5 24 21 29.5 21 18.5" />
        </svg>
      );
    case "graphic":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M39 9 22 14l-7.5 12.5 7 7L34 26 39 9Z" />
          <path d="m11.5 29.5 7 7" />
          <path d="M9 34.5 13.5 39" />
          <path d="M39 9 25.5 22.5" />
          <circle cx="24" cy="24" r="2" />
          <path d="m14 10 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z" />
          <path d="m35 30 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" />
        </svg>
      );
    case "thumbnail":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <rect x="7" y="14" width="28" height="24" rx="3.5" />
          <path d="M15 14v-4a3.5 3.5 0 0 1 3.5-3.5h19A3.5 3.5 0 0 1 41 10v18a3.5 3.5 0 0 1-3.5 3.5H35" />
          <circle cx="15.5" cy="21.5" r="2.5" />
          <path d="m8 34 8.5-8.5 5.5 5.5 5-5 7 8" />
        </svg>
      );
    case "branding":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M16 18.5 35 11v24l-19-7.5Z" />
          <rect x="8.5" y="18.5" width="7.5" height="9" rx="2" />
          <path d="m11 27.5 3 9.5h4.5l-2.5-9.5" />
          <path d="M35 19a4.5 4.5 0 0 1 0 8" />
        </svg>
      );
    case "commercial":
    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M8 10v29h32" />
          <rect x="14" y="29" width="4.5" height="10" rx="1" />
          <rect x="23" y="23" width="4.5" height="16" rx="1" />
          <rect x="32" y="16" width="4.5" height="23" rx="1" />
          <path d="m14 21 9-6.5 5 3.5 9-9" />
          <path d="M31.5 9H37v5.5" />
        </svg>
      );
  }
}

