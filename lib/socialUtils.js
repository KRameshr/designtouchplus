/**
 * Validates social media URLs:
 * - Checks for non-empty string and disallows unsafe schemes (javascript:, data:, etc.)
 * - Validates host domain for LinkedIn (linkedin.com, www.linkedin.com, *.linkedin.com)
 *   or Instagram (instagram.com, www.instagram.com, *.instagram.com)
 * - Supports protocols (http, https, or bare domain), www, trailing slashes, and query parameters
 */
export function isValidSocialUrl(url, type) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed === "#" || trimmed.toLowerCase() === "null" || trimmed.toLowerCase() === "undefined") {
    return false;
  }
  // Disallow unsafe protocols
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
    return false;
  }
  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProto);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;

    const host = parsed.hostname.toLowerCase();
    if (type === "linkedin") {
      return host === "linkedin.com" || host.endsWith(".linkedin.com");
    }
    if (type === "instagram") {
      return host === "instagram.com" || host.endsWith(".instagram.com");
    }
    return Boolean(host);
  } catch {
    return false;
  }
}

/**
 * Returns a safe normalized https href for social links
 */
export function getSafeSocialHref(url) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (/^http:\/\//i.test(trimmed)) {
    return trimmed.replace(/^http:\/\//i, "https://");
  }
  if (/^https:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}
