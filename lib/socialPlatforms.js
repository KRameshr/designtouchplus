import React from "react";
import {
  Instagram,
  Youtube,
  Linkedin,
  Github,
  Facebook,
} from "lucide-react";

// Crisp custom SVG for the official Behance platform vector icon
export const BehanceIcon = ({ className = "w-4 h-4", ...props }) =>
  React.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "currentColor",
      className,
      "aria-hidden": "true",
      ...props,
    },
    React.createElement("path", {
      d: "M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-4.148 0-6.125-2.902-6.125-6.321 0-3.605 2.193-6.679 6.012-6.679 4.256 0 5.758 3.125 5.518 6.551h-8.877c.078 1.933 1.348 3.791 3.824 3.791 1.77 0 2.924-.875 3.513-1.898l1.236 1.556zm-2.455-5.111c-.053-1.637-1.127-2.99-3.051-2.99-1.802 0-3.064 1.268-3.328 2.99h6.379zm-13.271-7.889h-6v16h6.37c3.784 0 5.63-2.059 5.63-4.838 0-1.92-.98-3.39-2.585-4.004 1.248-.598 2.015-1.859 2.015-3.524 0-2.458-1.748-3.634-5.43-3.634zm-3.23 2.628h2.72c1.782 0 2.827.656 2.827 2.072 0 1.373-.996 2.152-2.766 2.152h-2.781v-4.224zm0 6.643h3.045c2.057 0 3.185.834 3.185 2.453 0 1.693-1.17 2.504-3.264 2.504h-2.966v-4.957z",
    })
  );

// Crisp custom SVG for the official X (formerly Twitter) platform vector icon
export const XPlatformIcon = ({ className = "w-4 h-4", ...props }) =>
  React.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "currentColor",
      className,
      "aria-hidden": "true",
      ...props,
    },
    React.createElement("path", {
      d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    })
  );

export const SUPPORTED_SOCIAL_PLATFORMS = [
  {
    platform: "X (Twitter)",
    label: "X (Twitter)",
    icon: XPlatformIcon,
    placeholder: "https://x.com/yourhandle",
    defaultUrl: "https://x.com/designtouchplus",
  },
  {
    platform: "Instagram",
    label: "Instagram",
    icon: Instagram,
    placeholder: "https://instagram.com/yourhandle",
    defaultUrl: "https://instagram.com/designtouchplus",
  },
  {
    platform: "YouTube",
    label: "YouTube",
    icon: Youtube,
    placeholder: "https://youtube.com/@yourchannel",
    defaultUrl: "https://youtube.com/@designtouchplus",
  },
  {
    platform: "LinkedIn",
    label: "LinkedIn",
    icon: Linkedin,
    placeholder: "https://linkedin.com/company/yourcompany",
    defaultUrl: "https://linkedin.com/company/designtouchplus",
  },
  {
    platform: "GitHub",
    label: "GitHub",
    icon: Github,
    placeholder: "https://github.com/yourorganization",
    defaultUrl: "https://github.com/designtouchplus",
  },
  {
    platform: "Facebook",
    label: "Facebook",
    icon: Facebook,
    placeholder: "https://facebook.com/yourpage",
    defaultUrl: "https://facebook.com/designtouchplus",
  },
  {
    platform: "Behance",
    label: "Behance",
    icon: BehanceIcon,
    placeholder: "https://behance.net/yourportfolio",
    defaultUrl: "https://behance.net/designtouchplus",
  },
];

export const DEFAULT_SOCIAL_LINKS = [
  {
    id: "social-x",
    platform: "X (Twitter)",
    url: "https://x.com/designtouchplus",
    enabled: true,
  },
  {
    id: "social-instagram",
    platform: "Instagram",
    url: "https://instagram.com/designtouchplus",
    enabled: true,
  },
  {
    id: "social-youtube",
    platform: "YouTube",
    url: "https://youtube.com/@designtouchplus",
    enabled: true,
  },
  {
    id: "social-linkedin",
    platform: "LinkedIn",
    url: "https://linkedin.com/company/designtouchplus",
    enabled: true,
  },
];

export function isSameSocialPlatform(platformA, platformB) {
  if (!platformA || !platformB) return false;
  const a = platformA.trim().toLowerCase();
  const b = platformB.trim().toLowerCase();
  if (a === b) return true;

  const isXA =
    a === "x" ||
    a === "twitter" ||
    a.includes("twitter") ||
    a === "x (twitter)" ||
    a.startsWith("x ");
  const isXB =
    b === "x" ||
    b === "twitter" ||
    b.includes("twitter") ||
    b === "x (twitter)" ||
    b.startsWith("x ");

  return isXA && isXB;
}

export function getSocialPlatformMeta(platformName) {
  if (!platformName) return null;
  const normalized = platformName.trim().toLowerCase();

  // Normalize X / Twitter variants
  if (
    normalized === "x" ||
    normalized === "twitter" ||
    normalized.includes("twitter") ||
    normalized === "x (twitter)" ||
    normalized.startsWith("x ")
  ) {
    return (
      SUPPORTED_SOCIAL_PLATFORMS.find((p) => p.platform === "X (Twitter)") || {
        platform: "X (Twitter)",
        label: "X (Twitter)",
        icon: XPlatformIcon,
        placeholder: "https://x.com/yourhandle",
        defaultUrl: "https://x.com/designtouchplus",
      }
    );
  }

  return (
    SUPPORTED_SOCIAL_PLATFORMS.find(
      (p) => p.platform.toLowerCase() === normalized
    ) || {
      platform: platformName,
      label: platformName,
      icon: Instagram,
      placeholder: "https://...",
      defaultUrl: "",
    }
  );
}

export function getSocialPlatformIcon(platformName) {
  const meta = getSocialPlatformMeta(platformName);
  return meta?.icon || Instagram;
}

export function validateSocialUrl(url, platform = "") {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;

  const normPlatform = (platform || "").trim().toLowerCase();
  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");

  // Specific validation for X / Twitter
  if (
    normPlatform === "x" ||
    normPlatform === "twitter" ||
    normPlatform.includes("twitter") ||
    normPlatform === "x (twitter)" ||
    normPlatform.startsWith("x ")
  ) {
    if (hostname !== "x.com" && hostname !== "twitter.com") {
      return false;
    }
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    // Requires a username segment, e.g. https://x.com/username or https://twitter.com/username
    return (
      pathParts.length > 0 &&
      !["home", "intent", "share", "i"].includes(pathParts[0].toLowerCase())
    );
  }

  return true;
}

export function parseSocialLinks(raw) {
  if (!raw) return DEFAULT_SOCIAL_LINKS;
  let items = raw;
  if (typeof raw === "string") {
    try {
      items = JSON.parse(raw);
    } catch {
      return DEFAULT_SOCIAL_LINKS;
    }
  }
  if (!Array.isArray(items)) return DEFAULT_SOCIAL_LINKS;

  return items.map((item, idx) => ({
    id: item.id || `social-${idx}-${item.platform || "item"}`,
    platform: item.platform || "Instagram",
    url: item.url || "",
    enabled: item.enabled !== false,
  }));
}
