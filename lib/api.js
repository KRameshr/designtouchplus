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
    const rawText = await res.text().catch(() => res.statusText);
    let parsed = null;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Not JSON response
    }
    const message =
      parsed?.message ||
      (typeof parsed === "object" && parsed !== null
        ? Object.values(parsed)[0]
        : rawText);
    const err = new Error(
      message || `API ${method} ${path} failed (${res.status})`
    );
    err.status = res.status;
    err.data = parsed;
    throw err;
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

export const getServices = () =>
  apiFetch("/api/services", { cache: "no-store" });
export const getServiceBySlug = (slug) =>
  apiFetch(`/api/services/${encodeURIComponent(slug)}`, { cache: "no-store" });

export const getPricingPlans = (type, category) => {
  const params = new URLSearchParams({ type });
  if (category) params.set("category", category);
  return apiFetch(`/api/pricing-plans?${params.toString()}`);
};

export const getPricingPageContent = () =>
  apiFetch("/api/pricing-page", { revalidate: 60 });

export const getPricingHeroBanners = () =>
  apiFetch("/api/pricing-page/banners", { cache: "no-store" });

export const getBlogPosts = ({ category, page = 0, size = 9 } = {}) => {
  const params = new URLSearchParams({ page, size });
  if (category) params.set("category", category);
  return apiFetch(`/api/blogs?${params.toString()}`, { revalidate: 30 });
};
export const searchBlogPosts = (q, { category, page = 0, size = 9 } = {}) => {
  const params = new URLSearchParams({ q, page, size });
  if (category) params.set("category", category);
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

export const subscribeToNewsletter = (email) => {
  const normalized = typeof email === "string" ? email.trim().toLowerCase() : "";
  return apiFetch("/api/newsletter/subscribe", {
    method: "POST",
    body: { email: normalized },
    cache: "no-store",
  });
};

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

export const getServicesHeroBanners = () =>
  apiFetch("/api/services-page/banners", { cache: "no-store" });

export const getServicesHeroBannersAdmin = () =>
  adminFetch("/api/services-page/banners/admin/all");

export const createServicesHeroBanner = (data) =>
  adminFetch("/api/services-page/banners", { method: "POST", body: data });

export const updateServicesHeroBanner = (id, data) =>
  adminFetch(`/api/services-page/banners/${id}`, { method: "PUT", body: data });

export const toggleServicesHeroBannerActive = (id) =>
  adminFetch(`/api/services-page/banners/${id}/toggle-active`, { method: "PATCH" });

export const reorderServicesHeroBanners = (orderedIds) =>
  adminFetch("/api/services-page/banners/reorder", { method: "PUT", body: orderedIds });

export const deleteServicesHeroBannerById = (id) =>
  adminFetch(`/api/services-page/banners/${id}`, { method: "DELETE" });

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

export async function getLocalToolIcons() {
  try {
    const res = await fetch("/api/tool-icons", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.icons) ? data.icons : [];
  } catch {
    return [];
  }
}

export async function uploadLocalToolIcon(file) {
  if (!file) {
    throw new Error("No icon file selected.");
  }

  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  let res;
  try {
    res = await fetch("/api/tool-icons", {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
      cache: "no-store",
    });
  } catch {
    throw new Error("Unable to upload icon file. Please try again.");
  }

  if (res.status === 401) {
    logout();
    if (typeof window !== "undefined") window.location.href = "/admin/login";
    throw new Error("Session expired — please log in again.");
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    throw new Error(payload?.message || `Icon upload failed (${res.status})`);
  }

  return payload?.icon || null;
}

// ---------- Pricing CMS Admin Endpoints ----------

export const uploadPricingHeroImage = (file) =>
  uploadPortfolioImage(file, "designtouch/pricing");

export const deletePricingHeroBanner = () =>
  adminFetch("/api/pricing-page/hero-banner", { method: "DELETE" });

export const getPricingHeroBannersAdmin = () =>
  adminFetch("/api/pricing-page/banners/admin/all");

export const createPricingHeroBanner = (data) =>
  adminFetch("/api/pricing-page/banners", { method: "POST", body: data });

export const updatePricingHeroBanner = (id, data) =>
  adminFetch(`/api/pricing-page/banners/${id}`, { method: "PUT", body: data });

export const togglePricingHeroBannerActive = (id) =>
  adminFetch(`/api/pricing-page/banners/${id}/toggle-active`, { method: "PATCH" });

export const reorderPricingHeroBanners = (orderedIds) =>
  adminFetch("/api/pricing-page/banners/reorder", { method: "PUT", body: orderedIds });

export const deletePricingHeroBannerById = (id) =>
  adminFetch(`/api/pricing-page/banners/${id}`, { method: "DELETE" });

export const updatePricingPageContent = (data) =>
  adminFetch("/api/pricing-page", { method: "PUT", body: data });

export const getPricingPlansAdmin = (type, category) => {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (category) params.set("category", category);
  const query = params.toString() ? `?${params.toString()}` : "";
  return adminFetch(`/api/pricing-plans/admin/all${query}`);
};

export const createPricingPlan = (data) =>
  adminFetch("/api/pricing-plans", { method: "POST", body: data });

export const updatePricingPlan = (id, data) =>
  adminFetch(`/api/pricing-plans/${id}`, { method: "PUT", body: data });

export const togglePricingPlanActive = (id) =>
  adminFetch(`/api/pricing-plans/${id}/toggle-active`, { method: "PATCH" });

export const reorderPricingPlans = (orderedIds) =>
  adminFetch("/api/pricing-plans/reorder", { method: "PUT", body: orderedIds });

export const deletePricingPlan = (id) =>
  adminFetch(`/api/pricing-plans/${id}`, { method: "DELETE" });

export const getAddOnsAdmin = () =>
  adminFetch("/api/addons/admin/all");

export const uploadAddOnIcon = (file) =>
  uploadPortfolioImage(file, "designtouch/addons");

export const createAddOn = (data) =>
  adminFetch("/api/addons", { method: "POST", body: data });

export const updateAddOn = (id, data) =>
  adminFetch(`/api/addons/${id}`, { method: "PUT", body: data });

export const toggleAddOnActive = (id) =>
  adminFetch(`/api/addons/${id}/toggle-active`, { method: "PATCH" });

export const reorderAddOns = (orderedIds) =>
  adminFetch("/api/addons/reorder", { method: "PUT", body: orderedIds });

export const deleteAddOn = (id) =>
  adminFetch(`/api/addons/${id}`, { method: "DELETE" });

export const getFaqsAdmin = (category = "PRICING") => {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  return adminFetch(`/api/faqs/admin/all${query}`);
};

export const createFaq = (data) =>
  adminFetch("/api/faqs", { method: "POST", body: data });

export const updateFaq = (id, data) =>
  adminFetch(`/api/faqs/${id}`, { method: "PUT", body: data });

export const toggleFaqActive = (id) =>
  adminFetch(`/api/faqs/${id}/toggle-active`, { method: "PATCH" });

export const reorderFaqs = (orderedIds) =>
  adminFetch("/api/faqs/reorder", { method: "PUT", body: orderedIds });

export const deleteFaq = (id) =>
  adminFetch(`/api/faqs/${id}`, { method: "DELETE" });

export const reorderProcessSteps = (orderedIds) =>
  adminFetch("/api/process-steps/reorder", { method: "PUT", body: orderedIds });

// ---------- Blog Page Hero CMS ----------
export const getBlogPageContent = () =>
  apiFetch("/api/blog-page", { cache: "no-store" }).catch(() => null);

export const updateBlogPageContent = (data) =>
  adminFetch("/api/blog-page", { method: "PUT", body: data });

export const deleteBlogHeroBanner = () =>
  adminFetch("/api/blog-page/hero-banner", { method: "DELETE" });

export const uploadBlogHeroImage = (file) =>
  uploadPortfolioImage(file, "designtouch/blog");

// ---------- Blog Post Management & Image Upload ----------
export const uploadBlogCoverImage = (file) =>
  uploadPortfolioImage(file, "designtouch/blog/covers");

export const uploadBlogContentImage = (file) =>
  uploadPortfolioImage(file, "designtouch/blog/content");

export const deleteBlogCoverImage = (publicId) =>
  adminFetch(`/api/media/image?publicId=${encodeURIComponent(publicId)}`, { method: "DELETE" });

export const getBlogPostsAdmin = () =>
  adminFetch("/api/blogs/admin/all");

export const getBlogPostAdminById = (id) =>
  adminFetch(`/api/blogs/admin/${id}`);

export const createBlogPost = (data) =>
  adminFetch("/api/blogs", { method: "POST", body: data });

export const updateBlogPost = (id, data) =>
  adminFetch(`/api/blogs/${id}`, { method: "PUT", body: data });

export const deleteBlogPost = (id) =>
  adminFetch(`/api/blogs/${id}`, { method: "DELETE" });

// ---------- Blog Category Management ----------
export const getBlogCategories = () =>
  apiFetch("/api/blog-categories", { cache: "no-store" });

export const getBlogCategoryById = (id) =>
  adminFetch(`/api/blog-categories/${id}`);

export const getBlogCategoryArticles = (id) =>
  adminFetch(`/api/blog-categories/${id}/articles`);

export const createBlogCategory = (data) =>
  adminFetch("/api/blog-categories", { method: "POST", body: data });

export const updateBlogCategory = (id, data) =>
  adminFetch(`/api/blog-categories/${id}`, { method: "PUT", body: data });

export const deleteBlogCategory = (id) =>
  adminFetch(`/api/blog-categories/${id}`, { method: "DELETE" });

export const moveAndDeleteBlogCategory = (id, destinationCategoryId) =>
  adminFetch(`/api/blog-categories/${id}/delete-and-move`, {
    method: "POST",
    body: { destinationCategoryId },
  });

export const deleteBlogCategoryWithArticles = (id, { articleIds, deleteAll } = {}) =>
  adminFetch(`/api/blog-categories/${id}/delete-with-articles`, {
    method: "POST",
    body: { articleIds, deleteAll },
  });






