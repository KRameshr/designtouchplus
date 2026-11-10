const LOCAL_API_BASE_URL = "http://localhost:8080";

function isLoopbackHostname(hostname) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized === "::1" ||
    normalized === "0.0.0.0" ||
    /^127(?:\.\d{1,3}){3}$/.test(normalized)
  );
}

/**
 * Resolve and validate the frontend's API origin.
 * Local development may omit NEXT_PUBLIC_API_URL and use the local Spring Boot
 * server. Production must provide a public API URL; localhost is rejected.
 */
export function resolveApiBaseUrl({ apiUrl, nodeEnv } = {}) {
  const environment = nodeEnv ?? process.env.NODE_ENV;
  const configuredUrl = typeof apiUrl === "string" ? apiUrl.trim() : "";

  if (!configuredUrl) {
    if (environment === "development") return LOCAL_API_BASE_URL;
    throw new Error(
      "NEXT_PUBLIC_API_URL must be set to the backend origin outside development."
    );
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(configuredUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_API_URL must be an absolute HTTP(S) URL.");
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_API_URL must use HTTP or HTTPS.");
  }

  if (environment === "production" && isLoopbackHostname(parsedUrl.hostname)) {
    throw new Error(
      "NEXT_PUBLIC_API_URL cannot point to localhost or a loopback address in production."
    );
  }

  return configuredUrl.replace(/\/+$/, "");
}

export function getApiBaseUrl() {
  return resolveApiBaseUrl({
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    nodeEnv: process.env.NODE_ENV,
  });
}
