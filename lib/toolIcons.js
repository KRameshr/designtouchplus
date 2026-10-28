export const TOOL_ICON_OPTIONS = [
  {
    key: "premiere-pro",
    shortCode: "Pr",
    label: "Adobe Premiere Pro",
    filename: "premiere-pro.svg",
    src: "/assets/tools/premiere-pro.svg",
    isCustom: false,
  },
  {
    key: "after-effects",
    shortCode: "Ae",
    label: "After Effects",
    filename: "after-effects.svg",
    src: "/assets/tools/after-effects.svg",
    isCustom: false,
  },
  {
    key: "davinci-resolve",
    shortCode: "Dv",
    label: "DaVinci Resolve",
    filename: "davinci-resolve.svg",
    src: "/assets/tools/davinci-resolve.svg",
    isCustom: false,
  },
  {
    key: "photoshop",
    shortCode: "Ps",
    label: "Photoshop",
    filename: "photoshop.svg",
    src: "/assets/tools/photoshop.svg",
    isCustom: false,
  },
  {
    key: "illustrator",
    shortCode: "Ai",
    label: "Illustrator",
    filename: "illustrator.svg",
    src: "/assets/tools/illustrator.svg",
    isCustom: false,
  },
  {
    key: "blender",
    shortCode: "3D",
    label: "Blender",
    filename: "blender.svg",
    src: "/assets/tools/blender.svg",
    isCustom: false,
  },
  {
    key: "figma",
    shortCode: "Fg",
    label: "Figma",
    filename: "figma.svg",
    src: "/assets/tools/figma.svg",
    isCustom: false,
  },
];

const LOCAL_ASSET_PATH_REGEX =
  /^\/assets\/tools\/([a-zA-Z0-9._-]+\.(?:svg|png|webp))$/i;
const LOCAL_FILENAME_REGEX = /^([a-zA-Z0-9._-]+\.(?:svg|png|webp))$/i;

export function getToolMonogram(iconKey, name) {
  const cleanedKey = String(iconKey || "").trim();
  if (
    cleanedKey &&
    cleanedKey.length <= 4 &&
    !cleanedKey.includes("/") &&
    !cleanedKey.includes(".")
  ) {
    return cleanedKey;
  }

  const cleanedName = String(name || "")
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim();
  if (!cleanedName) return "TL";

  const words = cleanedName.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return cleanedName.slice(0, 2).toUpperCase();
}

export function formatAssetLabel(filename) {
  const raw = String(filename || "")
    .replace(/^\/assets\/tools\//i, "")
    .replace(/\.[^.]+$/, "")
    .trim();
  if (!raw) return "Custom Icon";
  return raw
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function matchOptionByToken(token, allOptions = TOOL_ICON_OPTIONS) {
  if (!token) return null;
  const raw = String(token).trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();

  return (
    allOptions.find(
      (opt) =>
        opt.src.toLowerCase() === lower ||
        opt.filename.toLowerCase() === lower ||
        opt.key.toLowerCase() === lower ||
        (opt.shortCode && opt.shortCode.toLowerCase() === lower) ||
        `/assets/tools/${opt.key}.svg`.toLowerCase() === lower
    ) || null
  );
}

/**
 * Resolves a tool record to its local icon metadata or monogram fallback.
 *
 * - If logoUrl is explicitly empty ("", null, or "none"), returns hasIcon: false
 *   so the UI renders the tool's monogram/shortCode fallback badge.
 * - If logoUrl matches a canonical or custom local icon in /assets/tools/,
 *   returns hasIcon: true with its local src and filename.
 */
export function resolveToolIconMeta(tool = {}, extraOptions = []) {
  const allOptions = [
    ...TOOL_ICON_OPTIONS,
    ...(Array.isArray(extraOptions)
      ? extraOptions.filter(
          (ext) =>
            ext?.src &&
            !TOOL_ICON_OPTIONS.some(
              (base) => base.src.toLowerCase() === ext.src.toLowerCase()
            )
        )
      : []),
  ];

  if (typeof tool === "string") {
    const matched = matchOptionByToken(tool, allOptions);
    if (matched) return { ...matched, hasIcon: true };
  }

  const { logoUrl, iconKey, name } = tool || {};
  const rawLogoUrl = String(logoUrl ?? "").trim();

  // 1. If logoUrl is empty or explicitly "none", return monogram fallback
  if (!rawLogoUrl || rawLogoUrl.toLowerCase() === "none") {
    return {
      key: "none",
      shortCode: getToolMonogram(iconKey, name),
      label: name || "Monogram Fallback",
      filename: null,
      src: "",
      hasIcon: false,
      isCustom: false,
    };
  }

  // 2. Check if logoUrl matches a canonical or known gallery option
  const byLogoUrl = matchOptionByToken(rawLogoUrl, allOptions);
  if (byLogoUrl) {
    return {
      ...byLogoUrl,
      shortCode: getToolMonogram(iconKey, byLogoUrl.shortCode || name),
      hasIcon: true,
    };
  }

  // 3. Check if logoUrl is any valid local asset path in /assets/tools/
  const pathMatch = rawLogoUrl.match(LOCAL_ASSET_PATH_REGEX);
  const fileMatch = !pathMatch ? rawLogoUrl.match(LOCAL_FILENAME_REGEX) : null;
  const resolvedFilename = pathMatch?.[1] || fileMatch?.[1] || null;

  if (resolvedFilename && !resolvedFilename.includes("..")) {
    return {
      key: resolvedFilename.replace(/\.[^.]+$/, "").toLowerCase(),
      shortCode: getToolMonogram(iconKey, name || resolvedFilename),
      label: formatAssetLabel(resolvedFilename),
      filename: resolvedFilename,
      src: `/assets/tools/${resolvedFilename}`,
      hasIcon: true,
      isCustom: true,
    };
  }

  // 4. Reject external/broken/data URLs and fall back cleanly to monogram
  return {
    key: "none",
    shortCode: getToolMonogram(iconKey, name),
    label: name || "Monogram Fallback",
    filename: null,
    src: "",
    hasIcon: false,
    isCustom: false,
  };
}

/**
 * Validates SVG markup for safety and well-formedness.
 * Rejects scripts, event handlers, foreignObject/iframe/embed, XXE declarations,
 * and external network references.
 */
export function validateSvgContent(svgText) {
  if (typeof svgText !== "string") {
    return { valid: false, error: "SVG file content could not be read." };
  }

  const trimmed = svgText.trim();
  if (!trimmed) {
    return { valid: false, error: "The SVG file is empty." };
  }

  if (trimmed.length > 512 * 1024) {
    return {
      valid: false,
      error: "SVG file exceeds the maximum allowed size of 512 KB.",
    };
  }

  // Strip optional XML declaration and comments before checking root <svg>
  const withoutXmlDecl = trimmed
    .replace(/^\uFEFF/, "")
    .replace(/^<\?xml[\s\S]*?\?>\s*/i, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();

  if (
    !/^<svg[\s>]/i.test(withoutXmlDecl) ||
    !/<\/svg>\s*$/i.test(withoutXmlDecl)
  ) {
    return {
      valid: false,
      error: "Malformed SVG file: root <svg>...</svg> element is missing.",
    };
  }

  // Reject DOCTYPE / ENTITY declarations (XXE prevention)
  if (/<!(?:DOCTYPE|ENTITY)\b/i.test(trimmed)) {
    return {
      valid: false,
      error: "Unsafe SVG rejected: DOCTYPE and ENTITY declarations are not allowed.",
    };
  }

  // Reject dangerous elements
  const forbiddenElements =
    /<\s*\/?\s*(?:script|foreignObject|iframe|object|embed|applet|meta|link|audio|video)\b/i;
  if (forbiddenElements.test(trimmed)) {
    return {
      valid: false,
      error:
        "Unsafe SVG rejected: script, foreignObject, or embedded frame elements are not allowed.",
    };
  }

  // Reject inline event handler attributes (onload, onerror, onclick, etc.)
  if (/\bon[a-z]+\s*=/i.test(trimmed)) {
    return {
      valid: false,
      error:
        "Unsafe SVG rejected: inline event-handler attributes (e.g. onload, onclick) are not allowed.",
    };
  }

  // Reject javascript:, vbscript:, or executable data: URIs
  if (/(?:javascript|vbscript)\s*:|data\s*:\s*(?:text\/html|application\/)/i.test(trimmed)) {
    return {
      valid: false,
      error: "Unsafe SVG rejected: executable URI schemes are not allowed.",
    };
  }

  // Reject external references in href, xlink:href, src, @import, or url(...)
  if (
    /(?:xlink:href|href|src)\s*=\s*["']\s*(?:https?:|\/\/)/i.test(trimmed) ||
    /@import\b/i.test(trimmed) ||
    /url\(\s*["']?\s*(?:https?:|\/\/)/i.test(trimmed)
  ) {
    return {
      valid: false,
      error:
        "Unsafe SVG rejected: external network references (http/https) inside href or url() are not allowed.",
    };
  }

  // Verify balanced <svg> and </svg> tags
  const openSvgCount = (withoutXmlDecl.match(/<svg[\s>]/gi) || []).length;
  const closeSvgCount = (withoutXmlDecl.match(/<\/svg>/gi) || []).length;
  if (openSvgCount !== closeSvgCount || openSvgCount === 0) {
    return {
      valid: false,
      error: "Malformed SVG file: mismatched <svg> tags.",
    };
  }

  // In browser environments, also verify XML well-formedness via DOMParser
  if (typeof window !== "undefined" && typeof DOMParser !== "undefined") {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(withoutXmlDecl, "image/svg+xml");
      const parserError = doc.querySelector("parsererror");
      if (parserError || !doc.documentElement || doc.documentElement.nodeName.toLowerCase() !== "svg") {
        return {
          valid: false,
          error: "Malformed SVG file: XML syntax could not be parsed.",
        };
      }
    } catch {
      return {
        valid: false,
        error: "Malformed SVG file: XML parser failed.",
      };
    }
  }

  return { valid: true };
}
