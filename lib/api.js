import { getToken, logout, adminFetch } from "./auth";

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

export const getFeaturedPortfolio = (contentType) => {
  const query = contentType ? `?contentType=${encodeURIComponent(contentType)}` : "";
  return apiFetch(`/api/portfolio/featured${query}`, { cache: "no-store" });
};
export const getPortfolio = (contentType, { category, categoryId, categorySlug, sort } = {}) => {
  const params = new URLSearchParams({ contentType });
  if (category) params.set("category", category);
  if (categoryId) params.set("categoryId", categoryId);
  if (categorySlug) params.set("categorySlug", categorySlug);
  if (sort) params.set("sort", sort);
  return apiFetch(`/api/portfolio?${params.toString()}`, { cache: "no-store" });
};

export const getPortfolioItem = (idOrSlug) =>
  apiFetch(`/api/portfolio/${encodeURIComponent(idOrSlug)}`, { cache: "no-store" });

export const getPortfolioPageContent = () =>
  apiFetch("/api/portfolio-page", { cache: "no-store" });

export const getPortfolioPageTags = (all = false) =>
  apiFetch(`/api/portfolio-page/tags${all ? "?all=true" : ""}`, { cache: "no-store" });

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

export const getHeroContent = () => apiFetch("/api/hero", { cache: "no-store" });
export const getAboutContent = () => apiFetch("/api/about");
export const getCompanyInfo = () => apiFetch("/api/company-info", { revalidate: 300 });

// ---------- Forms (POST, never cached) ----------

export const submitContactMessage = (data) =>
  apiFetch("/api/contact", { method: "POST", body: data, cache: "no-store" });

export const subscribeToNewsletter = (email) =>
  apiFetch("/api/newsletter/subscribe", { method: "POST", body: { email }, cache: "no-store" });

// ---------- Media Uploads (Authenticated Admin, multipart/form-data) ----------

/**
 * Uploads a video to the backend at POST /api/media/upload/video.
 * Requires an active admin JWT token.
 * Uses multipart/form-data with the browser automatically setting the multipart boundary.
 */
export async function uploadVideo(file) {
  if (!file) {
    throw new Error("No video file selected.");
  }

  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  let res;
  try {
    res = await fetch(`${API_BASE_URL}/api/media/upload/video`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
      cache: "no-store",
    });
  } catch {
    throw new Error("Unable to reach the server. Please check that the backend is running and try again.");
  }

  // Handle expired or unauthorized admin sessions
  if (res.status === 401 || (res.status === 403 && token)) {
    logout();
    if (typeof window !== "undefined") window.location.href = "/admin/login";
    throw new Error("Session expired — please log in again.");
  }

  if (!res.ok) {
    let errorMessage = "";
    try {
      const errJson = await res.json();
      errorMessage = errJson?.message || "";
    } catch {
      errorMessage = await res.text().catch(() => res.statusText);
    }
    throw new Error(errorMessage || `Video upload failed (${res.status})`);
  }

  return await res.json();
}

/**
 * Uploads a video for a portfolio item to POST /api/media/upload/portfolio-video.
 * Requires an active admin JWT token.
 * Saves directly into the 'designtouch/portfolio' Cloudinary folder.
 */
export async function uploadPortfolioVideo(file) {
  if (!file) {
    throw new Error("No video file selected.");
  }

  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  let res;
  try {
    res = await fetch(`${API_BASE_URL}/api/media/upload/portfolio-video`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
      cache: "no-store",
    });
  } catch {
    throw new Error("Unable to reach the server. Please check that the backend is running and try again.");
  }

  // Handle expired or unauthorized admin sessions
  if (res.status === 401 || (res.status === 403 && token)) {
    logout();
    if (typeof window !== "undefined") window.location.href = "/admin/login";
    throw new Error("Session expired — please log in again.");
  }

  if (!res.ok) {
    let errorMessage = "";
    try {
      const errJson = await res.json();
      errorMessage = errJson?.message || "";
    } catch {
      errorMessage = await res.text().catch(() => res.statusText);
    }
    throw new Error(errorMessage || `Portfolio video upload failed (${res.status})`);
  }

  return await res.json();
}

/**
 * Uploads an image for a portfolio item to POST /api/media/upload/image.
 * Requires an active admin JWT token.
 * Defaults folder to 'designtouch/thumbnails'.
 */
export async function uploadPortfolioImage(file, folder = "designtouch/thumbnails") {
  if (!file) {
    throw new Error("No image file selected.");
  }

  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  let res;
  try {
    const url = folder
      ? `${API_BASE_URL}/api/media/upload/image?folder=${encodeURIComponent(folder)}`
      : `${API_BASE_URL}/api/media/upload/image`;
    res = await fetch(url, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
      cache: "no-store",
    });
  } catch {
    throw new Error("Unable to reach the server. Please check that the backend is running and try again.");
  }

  if (res.status === 401 || (res.status === 403 && token)) {
    logout();
    if (typeof window !== "undefined") window.location.href = "/admin/login";
    throw new Error("Session expired — please log in again.");
  }

  if (!res.ok) {
    let errorMessage = "";
    try {
      const errJson = await res.json();
      errorMessage = errJson?.message || "";
    } catch {
      errorMessage = await res.text().catch(() => res.statusText);
    }
    throw new Error(errorMessage || `Image upload failed (${res.status})`);
  }

  return await res.json();
}

/**
 * Deletes an image from Cloudinary via DELETE /api/media/image?publicId=...
 * Requires an active admin JWT token.
 */
export async function deletePortfolioImage(publicId) {
  if (!publicId) return;
  return adminFetch(`/api/media/image?publicId=${encodeURIComponent(publicId)}`, {
    method: "DELETE",
  });
}

// ---------- Stats Admin Operations (Authenticated) ----------

export const createStat = (data) =>
  adminFetch("/api/stats", { method: "POST", body: data });

export const updateStat = (id, data) =>
  adminFetch(`/api/stats/${id}`, { method: "PUT", body: data });

export const deleteStat = (id) =>
  adminFetch(`/api/stats/${id}`, { method: "DELETE" });

// ---------- Portfolio Intro & Tags Operations (Authenticated) ----------

export const updatePortfolioPageContent = (data) =>
  adminFetch("/api/portfolio-page", { method: "PUT", body: data });

export async function uploadPortfolioIntroVideo(file) {
  if (!file) {
    throw new Error("No video file selected.");
  }

  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  let res;
  try {
    res = await fetch(`${API_BASE_URL}/api/media/upload/portfolio-intro-video`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
      cache: "no-store",
    });
  } catch {
    throw new Error("Unable to reach the server. Please check that the backend is running and try again.");
  }

  if (res.status === 401 || (res.status === 403 && token)) {
    logout();
    if (typeof window !== "undefined") window.location.href = "/admin/login";
    throw new Error("Session expired — please log in again.");
  }

  if (!res.ok) {
    let errorMessage = "";
    try {
      const errJson = await res.json();
      errorMessage = errJson?.message || "";
    } catch {
      errorMessage = await res.text().catch(() => res.statusText);
    }
    throw new Error(errorMessage || `Portfolio intro video upload failed (${res.status})`);
  }

  return await res.json();
}

export const createPortfolioTag = (data) =>
  adminFetch("/api/portfolio-page/tags", { method: "POST", body: data });

export const updatePortfolioTag = (id, data) =>
  adminFetch(`/api/portfolio-page/tags/${id}`, { method: "PUT", body: data });

export const deletePortfolioTag = (id) =>
  adminFetch(`/api/portfolio-page/tags/${id}`, { method: "DELETE" });

// ---------- Portfolio Categories Operations ----------

export const getPortfolioCategories = (type, all = false) => {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (all) params.set("all", "true");
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`/api/portfolio-categories${query}`, { cache: "no-store" });
};

export const createPortfolioCategory = (data) =>
  adminFetch("/api/portfolio-categories", { method: "POST", body: data });

export const updatePortfolioCategory = (id, data) =>
  adminFetch(`/api/portfolio-categories/${id}`, { method: "PUT", body: data });

export const deletePortfolioCategory = (id) =>
  adminFetch(`/api/portfolio-categories/${id}`, { method: "DELETE" });

// ---------- Portfolio Admin Operations ----------

export const getAdminPortfolioItems = () =>
  adminFetch("/api/portfolio/admin/all");

export const updatePortfolioItem = (id, data) =>
  adminFetch(`/api/portfolio/${id}`, { method: "PUT", body: data });

export const deletePortfolioItem = (id) =>
  adminFetch(`/api/portfolio/${id}`, { method: "DELETE" });

// ---------- Media Inventory & Migration Operations (Authenticated Admin) ----------

export const getMediaInventory = () =>
  adminFetch("/api/media/migration/inventory");

export const runMediaMigration = (dryRun = true) =>
  adminFetch(`/api/media/migration/run?dryRun=${Boolean(dryRun)}`, { method: "POST" });


// ---------- Services Page CMS & Admin Operations ----------

export const getServicesPageContent = () =>
  apiFetch("/api/services-page", { cache: "no-store" });

export const updateServicesPageContent = (data) =>
  adminFetch("/api/services-page", { method: "PUT", body: data });

export const deleteServicesHeroBanner = () =>
  adminFetch("/api/services-page/hero-banner", { method: "DELETE" });

export const uploadServicesHeroImage = (file) =>
  uploadPortfolioImage(file, "designtouch/services");

export const getServicesAdmin = () =>
  adminFetch("/api/services/admin/all");

export const createService = (data) =>
  adminFetch("/api/services", { method: "POST", body: data });

export const updateService = (id, data) =>
  adminFetch(`/api/services/${id}`, { method: "PUT", body: data });

export const toggleServiceActive = (id) =>
  adminFetch(`/api/services/${id}/toggle-active`, { method: "PATCH" });

export const deleteService = (id) =>
  adminFetch(`/api/services/${id}`, { method: "DELETE" });

export const getProcessStepsAdmin = (pageType = "SERVICES") =>
  adminFetch(`/api/process-steps/admin/all?pageType=${encodeURIComponent(pageType)}`);

export const createProcessStep = (data) =>
  adminFetch("/api/process-steps", { method: "POST", body: data });

export const updateProcessStep = (id, data) =>
  adminFetch(`/api/process-steps/${id}`, { method: "PUT", body: data });

export const toggleProcessStepActive = (id) =>
  adminFetch(`/api/process-steps/${id}/toggle-active`, { method: "PATCH" });

export const deleteProcessStep = (id) =>
  adminFetch(`/api/process-steps/${id}`, { method: "DELETE" });

export const getToolsAdmin = () =>
  adminFetch("/api/tools/admin/all");

export const createTool = (data) =>
  adminFetch("/api/tools", { method: "POST", body: data });

export const updateTool = (id, data) =>
  adminFetch(`/api/tools/${id}`, { method: "PUT", body: data });

export const toggleToolActive = (id) =>
  adminFetch(`/api/tools/${id}/toggle-active`, { method: "PATCH" });

export const deleteTool = (id) =>
  adminFetch(`/api/tools/${id}`, { method: "DELETE" });



