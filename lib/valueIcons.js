export const VALUE_ICON_OPTIONS = [
  { key: "gem", label: "Gem (Quality / Excellence)", description: "Best for Quality First, Craftsmanship" },
  { key: "rocket", label: "Rocket (Creativity / Innovation)", description: "Best for Creativity, Innovation, Growth" },
  { key: "clock", label: "Clock (On-Time Delivery)", description: "Best for On-Time Delivery, Punctuality" },
  { key: "users", label: "Users (Client First / Collaboration)", description: "Best for Client First, Teamwork" },
  { key: "shield", label: "Shield (Trust & Integrity)", description: "Best for Reliability, Data Security" },
  { key: "target", label: "Target (Precision / Goal-driven)", description: "Best for Results, Conversion, Focus" },
  { key: "zap", label: "Zap (Speed / Impact)", description: "Best for Fast Turnaround, High Energy" },
  { key: "award", label: "Award (High Standards / Premium)", description: "Best for Industry Standards, Recognition" },
  { key: "heart", label: "Heart (Passion & Care)", description: "Best for Passion, Empathy, Community" },
  { key: "sparkles", label: "Sparkles (Magic & Polish)", description: "Best for Visual Polish, Storytelling" },
];

export function resolveValueIcon(iconKey = "", title = "") {
  const k = (iconKey || "").toLowerCase().trim();
  const match = VALUE_ICON_OPTIONS.find((opt) => opt.key === k);
  if (match) return match.key;

  const t = (title || "").toLowerCase();
  if (t.includes("quality")) return "gem";
  if (t.includes("creativ")) return "rocket";
  if (t.includes("time") || t.includes("delivery")) return "clock";
  if (t.includes("client")) return "users";
  return "gem";
}

