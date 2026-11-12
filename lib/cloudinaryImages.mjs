const CLOUDINARY_HOST = "res.cloudinary.com";
const TRANSFORM_KEYS = new Set([
  "a", "ac", "af", "ar", "b", "bo", "c", "cs", "d", "dn", "dpr",
  "du", "e", "eo", "f", "fl", "fps", "g", "h", "if", "ki", "l",
  "o", "pg", "q", "r", "s", "so", "sp", "t", "u", "vc", "vs",
  "w", "x", "y", "z",
]);

function hasCloudinaryTransform(segment) {
  const tokens = segment.split(",");
  return tokens.length > 0 && tokens.every((token) => {
    const separator = token.indexOf("_");
    return separator > 0 && TRANSFORM_KEYS.has(token.slice(0, separator));
  });
}

function getCloudinaryUploadParts(source) {
  if (typeof source !== "string" || !source) return null;

  try {
    const url = new URL(source);
    if (
      url.protocol !== "https:" ||
      url.hostname !== CLOUDINARY_HOST ||
      url.searchParams.has("signature") ||
      url.searchParams.has("__cld_token__")
    ) {
      return null;
    }

    const marker = "/image/upload/";
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex < 0) return null;

    const prefix = url.pathname.slice(0, markerIndex + marker.length);
    const assetPath = url.pathname.slice(markerIndex + marker.length);
    const pathSegments = assetPath.split("/");
    const firstPathSegment = pathSegments[0];
    if (
      !assetPath ||
      pathSegments.some((segment) => segment.startsWith("s--")) ||
      hasCloudinaryTransform(firstPathSegment)
    ) return null;

    return {
      origin: url.origin,
      prefix,
      assetPath,
      suffix: `${url.search}${url.hash}`,
    };
  } catch {
    return null;
  }
}

/**
 * Adds a format/quality/width transformation only to public Cloudinary image
 * URLs. Existing transformations, signed URLs, and other providers are left
 * untouched. Width limiting preserves the source aspect ratio.
 */
export function cloudinaryImageUrl(source, width) {
  const parts = getCloudinaryUploadParts(source);
  const normalizedWidth = Number(width);
  if (!parts || !Number.isInteger(normalizedWidth) || normalizedWidth < 1 || normalizedWidth > 5000) {
    return source;
  }

  return `${parts.origin}${parts.prefix}f_auto,q_auto,w_${normalizedWidth},c_limit/${parts.assetPath}${parts.suffix}`;
}

/**
 * Returns HTML image attributes for responsive Cloudinary delivery. For URLs
 * that cannot be safely transformed, it returns only the original src.
 */
export function cloudinaryResponsiveImageProps(
  source,
  { widths = [320, 480, 640, 960, 1280, 1600], sizes = "100vw", fallbackWidth = 960 } = {},
) {
  const parts = getCloudinaryUploadParts(source);
  if (!parts) return { src: source };

  const validWidths = [...new Set(widths)]
    .filter((width) => Number.isInteger(width) && width > 0 && width <= 5000)
    .sort((a, b) => a - b);
  if (validWidths.length === 0) return { src: source };

  const srcSet = validWidths
    .map((width) => `${cloudinaryImageUrl(source, width)} ${width}w`)
    .join(", ");
  const normalizedFallback = validWidths.includes(fallbackWidth)
    ? fallbackWidth
    : validWidths[validWidths.length - 1];

  return {
    src: cloudinaryImageUrl(source, normalizedFallback),
    srcSet,
    sizes,
  };
}
