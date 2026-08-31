const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Thin wrapper around fetch for talking to the Spring Boot backend.
 *
 * - Prefixes every call with the API base URL, so pages just pass a path
 *   like "/api/team" instead of the full URL.
 * - `revalidate` controls Next.js's built-in caching (in seconds). Content
 *   that changes rarely (team, services) can cache longer than content that
 *   changes often (blog posts, contact messages).
 * - Throws on non-2xx responses so callers can catch and show an error state
 *   instead of silently rendering broken data.
 */
async function apiFetch(path, { method = "GET", body, revalidate = 60, cache } = {}) {
  const url = `${API_BASE_URL}${path}`;

  const options = {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
    ...(cache ? { cache } : { next: { revalidate } }),
  };

  const res = await fetch(url, options);

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(`API ${method} ${path} failed (${res.status}): ${message}`);
  }

  // POST endpoints like /api/contact return 201 with no body
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ---------- Public content (GET, cached) ----------

export const getTeam = () => apiFetch("/api/team");
export const getClients = () => apiFetch("/api/clients");
export const getTestimonials = () => apiFetch("/api/testimonials");
export const getStats = () => apiFetch("/api/stats");
export const getValues = () => apiFetch("/api/values");
export const getProcessSteps = (pageType) => apiFetch(`/api/process-steps?pageType=${pageType}`);
export const getTools = () => apiFetch("/api/tools");
export const getAddOns = () => apiFetch("/api/addons");
export const getFaqs = (category) => apiFetch(`/api/faqs?category=${category}`);

export const getFeaturedPortfolio = () => apiFetch("/api/portfolio/featured");
export const getPortfolio = (contentType, { category, sort } = {}) => {
  const params = new URLSearchParams({ contentType });
  if (category) params.set("category", category);
  if (sort) params.set("sort", sort);
  return apiFetch(`/api/portfolio?${params.toString()}`);
};

export const getServices = () => apiFetch("/api/services");
export const getServiceBySlug = (slug) => apiFetch(`/api/services/${slug}`);

export const getPricingPlans = (type) => apiFetch(`/api/pricing-plans?type=${type}`);

export const getBlogPosts = ({ category, page = 0, size = 9 } = {}) => {
  const params = new URLSearchParams({ page, size });
  if (category) params.set("category", category);
  return apiFetch(`/api/blogs?${params.toString()}`, { revalidate: 30 });
};
export const searchBlogPosts = (q, { page = 0, size = 9 } = {}) => {
  const params = new URLSearchParams({ q, page, size });
  return apiFetch(`/api/blogs/search?${params.toString()}`, { revalidate: 30 });
};
export const getPopularBlogPosts = () => apiFetch("/api/blogs/popular", { revalidate: 30 });
export const getBlogCategoryCounts = () => apiFetch("/api/blogs/categories", { revalidate: 30 });
export const getBlogPostBySlug = (slug) =>
  apiFetch(`/api/blogs/${slug}`, { cache: "no-store" }); // no-store: this endpoint increments view count server-side

export const getAboutContent = () => apiFetch("/api/about");
export const getCompanyInfo = () => apiFetch("/api/company-info", { revalidate: 300 });

// ---------- Forms (POST, never cached) ----------

export const submitContactMessage = (data) =>
  apiFetch("/api/contact", { method: "POST", body: data, cache: "no-store" });

export const subscribeToNewsletter = (email) =>
  apiFetch("/api/newsletter/subscribe", { method: "POST", body: { email }, cache: "no-store" });
