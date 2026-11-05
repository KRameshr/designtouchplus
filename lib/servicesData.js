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

export const VALID_SERVICE_ICON_KEYS = [
  "video",
  "motion",
  "social",
  "youtube",
  "graphic",
  "thumbnail",
  "branding",
  "commercial",
];

export function resolveServiceIconKey(iconType, slug = "", title = "") {
  const key = (iconType || "").toLowerCase().trim();
  if (VALID_SERVICE_ICON_KEYS.includes(key)) {
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

// Canonical 8 reference services matching the DesignTouch+ catalog
export const REFERENCE_SERVICES = [
  {
    orderNumber: "01",
    title: "Video Editing",
    slug: "video-editing",
    aliases: ["video-editing"],
    description:
      "Engaging edits for YouTube, social media, ads, podcasts and more.",
    fullDescription:
      "From high-retention YouTube storytelling to fast-paced commercial and podcast edits, we craft every cut with precision, dynamic rhythm, audio mastery, and color grading that commands attention.",
    features: [
      "Long-form Editing",
      "Short-form / Reels",
      "Podcast Editing",
      "Color Grading",
      "Sound Design & Mixing",
      "Motion Graphics Integration",
    ],
    iconType: "video",
    colorTheme: "red",
    ctaLabel: "LEARN MORE",
    ctaUrl: "/services/video-editing",
  },
  {
    orderNumber: "02",
    title: "Motion Graphics",
    slug: "motion-graphics",
    aliases: ["motion-graphics"],
    description:
      "Stunning motion graphics that explain, engage and elevate your message.",
    fullDescription:
      "Bring complex ideas to life with high-impact 2D/3D animation, kinetic typography, explainer narratives, and seamless branded graphics designed to simplify messaging and captivate audiences.",
    features: [
      "2D/3D Animation",
      "Explainer Videos",
      "Logo Animation",
      "Kinetic Typography",
      "UI/UX Animations",
      "Custom Graphic Assets",
    ],
    iconType: "motion",
    colorTheme: "green",
    ctaLabel: "LEARN MORE",
    ctaUrl: "/services/motion-graphics",
  },
  {
    orderNumber: "03",
    title: "Social Media Content",
    slug: "social-media-content",
    aliases: ["social-media-content", "content-creation", "social-media"],
    description:
      "Scroll-stopping content designed to grow your brand and boost engagement.",
    fullDescription:
      "High-velocity, algorithm-optimized vertical videos, Instagram Reels, YouTube Shorts, and TikTok campaigns tailored to hook viewers in the first 3 seconds and drive organic community growth.",
    features: [
      "Instagram Reels",
      "YouTube Shorts",
      "TikTok Videos",
      "Ad Creatives",
      "Trend-Jacked Editing",
      "Captions & Subtitle Styling",
    ],
    iconType: "social",
    colorTheme: "violet",
    ctaLabel: "LEARN MORE",
    ctaUrl: "/services/social-media-content",
  },
  {
    orderNumber: "04",
    title: "YouTube Management",
    slug: "youtube-management",
    aliases: ["youtube-management", "youtube-content", "youtube"],
    description:
      "End-to-end YouTube solutions to grow your channel and maximize views.",
    fullDescription:
      "Comprehensive end-to-end channel strategy covering video editing, thumbnail optimization, title/metadata SEO, audience retention analysis, and publishing calendars for creators and brands.",
    features: [
      "Video Editing",
      "Thumbnails",
      "SEO & Optimization",
      "Channel Growth",
      "Audience Retention Strategy",
      "Upload Scheduling & Tagging",
    ],
    iconType: "youtube",
    colorTheme: "orange",
    ctaLabel: "LEARN MORE",
    ctaUrl: "/services/youtube-management",
  },
  {
    orderNumber: "05",
    title: "Graphic Design",
    slug: "graphic-design",
    aliases: ["graphic-design"],
    description:
      "Creative designs that communicate your brand identity with impact.",
    fullDescription:
      "Bold, memorable visual communication across digital banners, marketing collateral, social media templates, posters, and campaign visual identity that elevates brand perception.",
    features: [
      "Social Media Posts",
      "Banners & Posters",
      "Brand Identity",
      "Marketing Materials",
      "Display Ad Design",
      "Print Collateral",
    ],
    iconType: "graphic",
    colorTheme: "cyan",
    ctaLabel: "LEARN MORE",
    ctaUrl: "/services/graphic-design",
  },
  {
    orderNumber: "06",
    title: "Thumbnail Design",
    slug: "thumbnail-design",
    aliases: ["thumbnail-design", "thumbnails"],
    description:
      "High CTR thumbnails that attract clicks and increase engagement.",
    fullDescription:
      "Click-through rate optimized YouTube and video thumbnails crafted with psychology-backed visual hierarchy, expressive color theory, custom facial cutouts, and 3D lighting effects.",
    features: [
      "YouTube Thumbnails",
      "Custom Designs",
      "A/B Testing Thumbnails",
      "Series Thumbnails",
      "Color Psychology & Contrast",
      "Rapid Turnaround Revisions",
    ],
    iconType: "thumbnail",
    colorTheme: "yellow",
    ctaLabel: "LEARN MORE",
    ctaUrl: "/services/thumbnail-design",
  },
  {
    orderNumber: "07",
    title: "Branding",
    slug: "branding",
    aliases: ["branding"],
    description:
      "Build a strong brand identity that makes you stand out from the competition.",
    fullDescription:
      "Cohesive, memorable brand identities that set creative companies and ambitious ventures apart — complete with logo systems, typography palettes, style guides, and design language.",
    features: [
      "Logo Design",
      "Brand Guidelines",
      "Brand Strategy",
      "Visual Identity",
      "Color Palettes",
      "Typography Systems",
    ],
    iconType: "branding",
    colorTheme: "pink",
    ctaLabel: "LEARN MORE",
    ctaUrl: "/services/branding",
  },
  {
    orderNumber: "08",
    title: "Commercial & Ads",
    slug: "commercial-ads",
    aliases: ["commercial-ads", "commercials", "brand-films", "commercial-and-ads"],
    description:
      "High-converting video ads that drive traffic, leads and real results.",
    fullDescription:
      "Cinematic brand films, performance marketing commercials, UGC-style creative ads, and corporate brand showcases produced to maximize conversions, ROI, and viewer trust.",
    features: [
      "Product Ads",
      "Promotional Videos",
      "Corporate Videos",
      "UGC-style Ads",
      "Cinematic Storytelling",
      "Multi-Platform Format Deliveries",
    ],
    iconType: "commercial",
    colorTheme: "green",
    ctaLabel: "LEARN MORE",
    ctaUrl: "/services/commercial-ads",
  },
];

/**
 * Normalizes an array of service records (from DB/CMS or defaults) into clean, serializable objects.
 * Safe to execute on server or client.
 */
export function normalizeServicesList(services = []) {
  if (Array.isArray(services) && services.length > 0) {
    return services
      .filter((s) => s && s.isActive !== false)
      .map((s, idx) => {
        const slug =
          s.slug ||
          String(s.title || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        return {
          id: s.id || slug || `${idx}`,
          orderNumber: s.orderNumber || String(idx + 1).padStart(2, "0"),
          title: s.title,
          slug,
          aliases: Array.isArray(s.aliases) ? s.aliases : [slug],
          description: s.shortDescription || s.description || "",
          fullDescription:
            s.fullDescription || s.description || s.shortDescription || "",
          features: Array.isArray(s.features) ? s.features : [],
          iconType: resolveServiceIconKey(s.icon || s.iconType, slug, s.title),
          colorTheme:
            s.colorTheme ||
            REFERENCE_THEME_SEQUENCE[idx % REFERENCE_THEME_SEQUENCE.length],
          ctaLabel: s.ctaLabel || "LEARN MORE",
          ctaUrl:
            s.ctaUrl && String(s.ctaUrl).trim()
              ? String(s.ctaUrl).trim()
              : slug
              ? `/services/${slug}`
              : `/contact?service=${encodeURIComponent(s.title || "")}`,
        };
      });
  }
  return REFERENCE_SERVICES;
}

/**
 * Robust case-insensitive slug lookup with alias support.
 * Executes on ordinary JavaScript data on the server without client boundary proxies.
 */
export function findServiceBySlug(servicesList, rawSlug) {
  if (!rawSlug || !Array.isArray(servicesList)) return null;
  const clean = decodeURIComponent(String(rawSlug)).trim().toLowerCase();
  if (!clean) return null;

  return (
    servicesList.find((service) => {
      if (!service) return false;
      const sSlug = String(service.slug || "").trim().toLowerCase();
      if (sSlug === clean) return true;

      // Check aliases
      if (Array.isArray(service.aliases)) {
        if (
          service.aliases.some(
            (alias) => String(alias || "").trim().toLowerCase() === clean
          )
        ) {
          return true;
        }
      }

      // Check title converted to slug
      const titleSlug = String(service.title || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      if (titleSlug === clean) return true;

      return false;
    }) || null
  );
}
