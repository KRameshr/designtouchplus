"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  LayoutTemplate,
  BookOpen,
  Image as ImageIcon,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  ArrowDown,
  X as XIcon,
  Search,
  Calendar,
  Clock,
  Lock,
  Tags,
  FolderTree,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { adminFetch } from "@/lib/auth";
import BlogPostForm from "@/components/admin/BlogPostForm";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import BlogCategoryFormModal from "@/components/admin/BlogCategoryFormModal";
import BlogCategoryDeleteModal from "@/components/admin/BlogCategoryDeleteModal";
import {
  getBlogPageContent,
  updateBlogPageContent,
  deleteBlogHeroBanner,
  uploadBlogHeroImage,
  getBlogPostsAdmin,
  deleteBlogPost,
  getBlogCategories,
} from "@/lib/api";

const DEFAULT_HERO_CONTENT = {
  heroEyebrow: "OUR BLOG",
  heroHeadlineLine1: "INSIGHTS THAT",
  heroHeadlineLine2: "INSPIRE",
  heroHeadlineHighlight: "CREATIVITY.",
  heroDescription:
    "Tips, trends and tutorials on video editing, motion graphics, content creation and growing your brand.",
  heroCtaText: "EXPLORE ALL ARTICLES",
  heroCtaLink: "#articles",
  heroBannerImageUrl:
    "https://res.cloudinary.com/dggikfrj5/image/upload/v1792669852/designtouch/services/cygu80p1hmhkqgvpc3au.png",
  heroBannerImagePublicId: "designtouch/services/cygu80p1hmhkqgvpc3au",
  heroBannerImageAlt: "DesignTouch+ Creative Workspace Studio",
  heroBannerObjectPosition: "center right",
};

const POSITION_OPTIONS = [
  { value: "center right", label: "Center Right (Recommended)" },
  { value: "center", label: "Center" },
  { value: "center left", label: "Center Left" },
  { value: "top center", label: "Top Center" },
  { value: "bottom center", label: "Bottom Center" },
];

export default function AdminBlogPage() {
  const [activeTab, setActiveTab] = useState("ARTICLES"); // "ARTICLES" | "HERO"

  // Blog Posts State
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // "ALL" | "PUBLISHED" | "SCHEDULED" | "DRAFT" | "PRIVATE"
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [postToDelete, setPostToDelete] = useState(null);
  const [deletingPostLoading, setDeletingPostLoading] = useState(false);

  // Hero CMS State
  const [heroForm, setHeroForm] = useState(DEFAULT_HERO_CONTENT);
  const [loadingHero, setLoadingHero] = useState(false);
  const [savingHero, setSavingHero] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [heroError, setHeroError] = useState("");
  const [heroSuccess, setHeroSuccess] = useState("");
  const fileInputRef = useRef(null);

  // Categories State
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Load Posts
  const loadPosts = useCallback(async () => {
    setLoadingPosts(true);
    setPostsError("");
    try {
      const data = await getBlogPostsAdmin();
      setPosts(data || []);
    } catch (err) {
      setPostsError(err.message || "Failed to load posts.");
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  // Load Categories
  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    setCategoriesError("");
    try {
      const data = await getBlogCategories();
      setCategories(data || []);
    } catch (err) {
      setCategoriesError(err.message || "Failed to load categories.");
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // Load Hero Content
  const loadHeroContent = useCallback(async () => {
    setLoadingHero(true);
    setHeroError("");
    try {
      const data = await getBlogPageContent();
      if (data) {
        setHeroForm({
          heroEyebrow: data.heroEyebrow || DEFAULT_HERO_CONTENT.heroEyebrow,
          heroHeadlineLine1:
            data.heroHeadlineLine1 || DEFAULT_HERO_CONTENT.heroHeadlineLine1,
          heroHeadlineLine2:
            data.heroHeadlineLine2 || DEFAULT_HERO_CONTENT.heroHeadlineLine2,
          heroHeadlineHighlight:
            data.heroHeadlineHighlight !== undefined
              ? data.heroHeadlineHighlight
              : DEFAULT_HERO_CONTENT.heroHeadlineHighlight,
          heroDescription:
            data.heroDescription || DEFAULT_HERO_CONTENT.heroDescription,
          heroCtaText: data.heroCtaText || DEFAULT_HERO_CONTENT.heroCtaText,
          heroCtaLink: data.heroCtaLink || DEFAULT_HERO_CONTENT.heroCtaLink,
          heroBannerImageUrl:
            data.heroBannerImageUrl || DEFAULT_HERO_CONTENT.heroBannerImageUrl,
          heroBannerImagePublicId: data.heroBannerImagePublicId || "",
          heroBannerImageAlt:
            data.heroBannerImageAlt || DEFAULT_HERO_CONTENT.heroBannerImageAlt,
          heroBannerObjectPosition:
            data.heroBannerObjectPosition ||
            DEFAULT_HERO_CONTENT.heroBannerObjectPosition,
        });
      }
    } catch (err) {
      setHeroError(err.message || "Failed to load Blog Hero content.");
    } finally {
      setLoadingHero(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
    loadHeroContent();
    loadCategories();
  }, [loadPosts, loadHeroContent, loadCategories]);

  // Post Actions - Open explicit delete confirmation modal
  const handleOpenDeleteModal = (post) => {
    setPostToDelete(post);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete?.id) return;
    setDeletingPostLoading(true);
    setPostsError("");
    try {
      await deleteBlogPost(postToDelete.id);
      setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
      setPostToDelete(null);
    } catch (err) {
      setPostsError(err.message || "Failed to delete post.");
    } finally {
      setDeletingPostLoading(false);
    }
  };

  const handlePostSaved = () => {
    setEditingPost(null);
    loadPosts();
  };

  // Filtered posts based on search query and status pill
  const filteredPosts = posts.filter((post) => {
    const postStatus =
      post.status || (post.isPublished === false ? "DRAFT" : "PUBLISHED");
    if (statusFilter !== "ALL" && postStatus !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = post.title?.toLowerCase().includes(q);
      const matchSlug = post.slug?.toLowerCase().includes(q);
      const matchExcerpt = post.excerpt?.toLowerCase().includes(q);
      const matchCategory = post.category?.toLowerCase().includes(q);
      const matchTags =
        Array.isArray(post.tags) &&
        post.tags.some((t) => t?.toLowerCase().includes(q));
      const matchFocusKws =
        Array.isArray(post.focusKeywords) &&
        post.focusKeywords.some((k) => k?.toLowerCase().includes(q));
      const matchSeoTitle = post.seoTitle?.toLowerCase().includes(q);
      if (
        !matchTitle &&
        !matchSlug &&
        !matchExcerpt &&
        !matchCategory &&
        !matchTags &&
        !matchFocusKws &&
        !matchSeoTitle
      ) {
        return false;
      }
    }
    return true;
  });

  // Pagination calculations based on filtered results
  const totalFiltered = filteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalFiltered);
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  // Clamp current page if filtering or deleting reduces total pages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Handlers for search and status filters that reset pagination to page 1
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Helper for responsive numbered pagination range with ellipsis
  const getPaginationRange = (current, total) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, "...", total];
    }
    if (current >= total - 3) {
      return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, "...", current - 1, current, current + 1, "...", total];
  };

  // Hero Field Changes
  const handleHeroChange = (field, value) => {
    setHeroForm((prev) => ({ ...prev, [field]: value }));
  };

  // Upload Banner Image
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so re-selecting same file triggers change
    e.target.value = "";

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setHeroError(
        "Invalid file type. Please upload a PNG, JPG, JPEG, or WebP image.",
      );
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      setHeroError("Image size exceeds the 10 MB limit.");
      return;
    }

    setUploadingImage(true);
    setHeroError("");
    setHeroSuccess("");

    try {
      const res = await uploadBlogHeroImage(file);
      const uploadedUrl = res?.url || res?.secureUrl || res?.imageUrl;
      const publicId = res?.publicId || "";

      if (!uploadedUrl) {
        throw new Error(
          res?.message || "Upload completed but no image URL was returned.",
        );
      }

      setHeroForm((prev) => ({
        ...prev,
        heroBannerImageUrl: uploadedUrl,
        heroBannerImagePublicId: publicId,
      }));

      setHeroSuccess(
        "Banner image uploaded successfully! Click 'Save Changes' to publish.",
      );
    } catch (err) {
      setHeroError(
        err.message || "Failed to upload banner image. Please try again.",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove Banner Image
  const handleRemoveImage = () => {
    setHeroForm((prev) => ({
      ...prev,
      heroBannerImageUrl: "",
      heroBannerImagePublicId: "",
    }));
    setHeroSuccess(
      "Banner removed. Click 'Save Changes' to update the live hero.",
    );
  };

  // Save Hero Content
  const handleSaveHero = async (e) => {
    e.preventDefault();
    setSavingHero(true);
    setHeroError("");
    setHeroSuccess("");

    try {
      const payload = {
        heroEyebrow: heroForm.heroEyebrow?.trim() || "OUR BLOG",
        heroHeadlineLine1:
          heroForm.heroHeadlineLine1?.trim() || "INSIGHTS THAT",
        heroHeadlineLine2: heroForm.heroHeadlineLine2?.trim() || "INSPIRE",
        heroHeadlineHighlight:
          heroForm.heroHeadlineHighlight?.trim() || "CREATIVITY.",
        heroDescription: heroForm.heroDescription?.trim() || "",
        heroCtaText: heroForm.heroCtaText?.trim() || "EXPLORE ALL ARTICLES",
        heroCtaLink: heroForm.heroCtaLink?.trim() || "#articles",
        heroBannerImageUrl: heroForm.heroBannerImageUrl?.trim() || null,
        heroBannerImagePublicId:
          heroForm.heroBannerImagePublicId?.trim() || null,
        heroBannerImageAlt:
          heroForm.heroBannerImageAlt?.trim() ||
          "DesignTouch+ Creative Workspace Studio",
        heroBannerObjectPosition:
          heroForm.heroBannerObjectPosition || "center right",
      };

      const updated = await updateBlogPageContent(payload);
      if (updated) {
        setHeroForm({
          heroEyebrow: updated.heroEyebrow || DEFAULT_HERO_CONTENT.heroEyebrow,
          heroHeadlineLine1:
            updated.heroHeadlineLine1 || DEFAULT_HERO_CONTENT.heroHeadlineLine1,
          heroHeadlineLine2:
            updated.heroHeadlineLine2 || DEFAULT_HERO_CONTENT.heroHeadlineLine2,
          heroHeadlineHighlight:
            updated.heroHeadlineHighlight !== undefined
              ? updated.heroHeadlineHighlight
              : DEFAULT_HERO_CONTENT.heroHeadlineHighlight,
          heroDescription:
            updated.heroDescription || DEFAULT_HERO_CONTENT.heroDescription,
          heroCtaText: updated.heroCtaText || DEFAULT_HERO_CONTENT.heroCtaText,
          heroCtaLink: updated.heroCtaLink || DEFAULT_HERO_CONTENT.heroCtaLink,
          heroBannerImageUrl: updated.heroBannerImageUrl || "",
          heroBannerImagePublicId: updated.heroBannerImagePublicId || "",
          heroBannerImageAlt:
            updated.heroBannerImageAlt ||
            DEFAULT_HERO_CONTENT.heroBannerImageAlt,
          heroBannerObjectPosition:
            updated.heroBannerObjectPosition ||
            DEFAULT_HERO_CONTENT.heroBannerObjectPosition,
        });
      }

      setHeroSuccess(
        "Blog Hero updated successfully! Live page has been updated.",
      );
    } catch (err) {
      setHeroError(err.message || "Failed to save Blog Hero content.");
    } finally {
      setSavingHero(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <span>Blog Management</span>
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1">
            Manage your full-width cinematic hero banner, editorial copy, and
            published articles.
          </p>
        </div>

        {activeTab === "ARTICLES" && (
          <button
            onClick={() => setEditingPost({})}
            className="inline-flex items-center gap-2 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-wider px-5 py-3 rounded-lg border-none cursor-pointer transition-colors shadow-[0_4px_15px_rgba(239,68,68,0.25)] self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> New Article
          </button>
        )}

        {activeTab === "CATEGORIES" && (
          <button
            onClick={() => setEditingCategory({})}
            className="inline-flex items-center gap-2 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-wider px-5 py-3 rounded-lg border-none cursor-pointer transition-colors shadow-[0_4px_15px_rgba(239,68,68,0.25)] self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> New Category
          </button>
        )}
      </div>

      {/* Top Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1">
        <button
          onClick={() => setActiveTab("ARTICLES")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider border transition-all cursor-pointer ${
            activeTab === "ARTICLES"
              ? "bg-brand-red/10 border-brand-red/40 text-brand-red font-bold"
              : "bg-transparent border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.03]"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Articles Catalog ({posts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("CATEGORIES")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider border transition-all cursor-pointer ${
            activeTab === "CATEGORIES"
              ? "bg-brand-red/10 border-brand-red/40 text-brand-red font-bold"
              : "bg-transparent border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.03]"
          }`}
        >
          <Tags className="w-4 h-4" />
          <span>Manage Categories ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("HERO")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider border transition-all cursor-pointer ${
            activeTab === "HERO"
              ? "bg-brand-red/10 border-brand-red/40 text-brand-red font-bold"
              : "bg-transparent border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.03]"
          }`}
        >
          <LayoutTemplate className="w-4 h-4" />
          <span>Hero Banner & CMS</span>
        </button>
      </div>

      {/* TAB 1: ARTICLES CATALOG */}
      {activeTab === "ARTICLES" && (
        <div className="space-y-4">
          {postsError && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{postsError}</span>
            </div>
          )}

          {/* Search Bar & Status Filter Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0d0d0d] border border-white/[0.08] p-3 rounded-xl">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search articles by title, tags, keywords, excerpt, slug, or category..."
                className="w-full bg-white/[0.03] border border-white/10 focus:border-brand-red rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-neutral-500 outline-none transition-colors font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white bg-transparent border-none cursor-pointer p-0.5"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "ALL", label: "All", count: posts.length },
                {
                  id: "PUBLISHED",
                  label: "Published",
                  count: posts.filter(
                    (p) =>
                      (p.status || (p.isPublished ? "PUBLISHED" : "DRAFT")) ===
                      "PUBLISHED",
                  ).length,
                },
                {
                  id: "SCHEDULED",
                  label: "Scheduled",
                  count: posts.filter((p) => p.status === "SCHEDULED").length,
                },
                {
                  id: "DRAFT",
                  label: "Draft",
                  count: posts.filter(
                    (p) =>
                      (p.status || (p.isPublished ? "PUBLISHED" : "DRAFT")) ===
                      "DRAFT",
                  ).length,
                },
                {
                  id: "PRIVATE",
                  label: "Private",
                  count: posts.filter((p) => p.status === "PRIVATE").length,
                },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => handleStatusFilterChange(pill.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-medium transition-colors border cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    statusFilter === pill.id
                      ? "bg-brand-red/15 border-brand-red/40 text-brand-red font-bold"
                      : "bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <span>{pill.label}</span>
                  <span className="text-[10px] opacity-70">({pill.count})</span>
                </button>
              ))}
            </div>
          </div>

          {loadingPosts ? (
            <div className="flex items-center justify-center py-16 text-neutral-500 text-xs font-mono">
              <Loader2 className="w-5 h-5 animate-spin mr-2 text-brand-red" />
              Loading blog articles...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border border-white/[0.08] rounded-xl bg-[#0d0d0d] text-center p-6">
              <BookOpen className="w-8 h-8 text-neutral-600 mb-3" />
              <p className="text-neutral-400 text-sm mb-4">
                {posts.length === 0
                  ? 'No blog posts yet — click "New Article" to publish your first post.'
                  : "No articles match your search or status filter."}
              </p>
              {posts.length === 0 ? (
                <button
                  onClick={() => setEditingPost({})}
                  className="inline-flex items-center gap-2 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg border-none cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Article
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleSearchChange("");
                    handleStatusFilterChange("ALL");
                  }}
                  className="inline-flex items-center gap-2 bg-white/[0.05] hover:bg-white/10 text-white text-xs font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg border border-white/10 cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-left bg-white/[0.02]">
                      <th className="px-4 py-2.5 sm:px-5 sm:py-3 text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                        Article
                      </th>
                      <th className="px-4 py-2.5 sm:px-5 sm:py-3 text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                        Category
                      </th>
                      <th className="px-4 py-2.5 sm:px-5 sm:py-3 text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                        Status
                      </th>
                      <th className="px-4 py-2.5 sm:px-5 sm:py-3 text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                        Date
                      </th>
                      <th className="px-4 py-2.5 sm:px-5 sm:py-3 text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {paginatedPosts.map((post) => {
                      const postStatus =
                        post.status ||
                        (post.isPublished === false ? "DRAFT" : "PUBLISHED");

                      return (
                        <tr
                          key={post.id}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-4 py-2.5 sm:px-5 sm:py-2.5">
                            <div className="flex items-center gap-3">
                              {/* Cover Thumbnail */}
                              <div className="w-11 h-8 rounded-md overflow-hidden bg-white/[0.04] border border-white/10 shrink-0 flex items-center justify-center">
                                {post.coverImageUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={post.coverImageUrl}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <ImageIcon className="w-3.5 h-3.5 text-neutral-600" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="text-white font-medium line-clamp-1 text-sm block">
                                  {post.title}
                                </span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-neutral-500 font-mono text-[11px] block truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                                    /blog/{post.slug}
                                  </span>
                                  {Array.isArray(post.tags) &&
                                    post.tags.length > 0 && (
                                      <span className="hidden sm:inline-flex items-center text-[10px] font-mono text-neutral-400 bg-white/[0.04] border border-white/10 px-1.5 py-0.5 rounded">
                                        #{post.tags[0]}
                                        {post.tags.length > 1
                                          ? ` +${post.tags.length - 1}`
                                          : ""}
                                      </span>
                                    )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-2.5 sm:px-5 sm:py-2.5 text-neutral-400 text-xs font-mono whitespace-nowrap">
                            {post.category?.replace("_", " ")}
                          </td>

                          <td className="px-4 py-2.5 sm:px-5 sm:py-2.5 whitespace-nowrap">
                            {postStatus === "PUBLISHED" && (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-950/40 border border-emerald-500/25 px-2 py-0.5 rounded">
                                <Eye className="w-3 h-3" /> Published
                              </span>
                            )}
                            {postStatus === "SCHEDULED" && (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-amber-400 bg-amber-950/40 border border-amber-500/25 px-2 py-0.5 rounded">
                                <Clock className="w-3 h-3" /> Scheduled
                              </span>
                            )}
                            {postStatus === "DRAFT" && (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-neutral-400 bg-white/[0.04] border border-white/10 px-2 py-0.5 rounded">
                                <EyeOff className="w-3 h-3" /> Draft
                              </span>
                            )}
                            {postStatus === "PRIVATE" && (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-purple-400 bg-purple-950/40 border border-purple-500/25 px-2 py-0.5 rounded">
                                <Lock className="w-3 h-3" /> Private
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-2.5 sm:px-5 sm:py-2.5 text-neutral-400 text-xs font-mono whitespace-nowrap">
                            {postStatus === "SCHEDULED" && post.scheduledFor ? (
                              <div className="flex items-center gap-1.5 text-amber-400/90">
                                <Clock className="w-3 h-3 shrink-0" />
                                <span>
                                  {new Date(post.scheduledFor).toLocaleString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "numeric",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
                              </div>
                            ) : post.publishedAt ? (
                              <div className="flex items-center gap-1.5 text-neutral-400">
                                <Calendar className="w-3 h-3 shrink-0 text-neutral-500" />
                                <span>
                                  {new Date(
                                    post.publishedAt,
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            ) : (
                              <span className="text-neutral-600">—</span>
                            )}
                          </td>

                          <td className="px-4 py-2.5 sm:px-5 sm:py-2.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                              <button
                                onClick={() => setEditingPost(post)}
                                aria-label="Edit post"
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-neutral-300 border-none cursor-pointer transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenDeleteModal(post)}
                                aria-label="Delete post"
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.05] hover:bg-rose-500/20 flex items-center justify-center text-neutral-300 hover:text-rose-400 border-none cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Pagination & Results Summary Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-white/[0.08] bg-white/[0.01]">
                <div className="text-xs font-mono text-neutral-400 text-center sm:text-left select-none">
                  Showing{" "}
                  <span className="text-white font-semibold">
                    {totalFiltered === 0
                      ? "0"
                      : startIndex + 1 === endIndex
                        ? `${endIndex}`
                        : `${startIndex + 1}–${endIndex}`}
                  </span>{" "}
                  of{" "}
                  <span className="text-white font-semibold">{totalFiltered}</span>{" "}
                  article{totalFiltered === 1 ? "" : "s"}
                  {statusFilter !== "ALL" && (
                    <span className="text-neutral-500 ml-1.5 hidden md:inline">
                      ({statusFilter.toLowerCase()})
                    </span>
                  )}
                </div>

                {totalPages > 1 && (
                  <nav
                    aria-label="Admin articles pagination"
                    className="flex items-center gap-1 sm:gap-1.5 select-none flex-wrap justify-center"
                  >
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      aria-label="Previous page"
                      className={`h-8 px-2.5 sm:px-3 rounded-lg border text-xs font-mono font-medium flex items-center gap-1 transition-colors ${
                        safePage === 1
                          ? "border-white/[0.04] text-neutral-600 bg-white/[0.01] cursor-not-allowed opacity-50"
                          : "border-white/10 text-neutral-300 hover:text-white hover:bg-white/[0.06] hover:border-white/20 bg-white/[0.02] cursor-pointer"
                      }`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Prev</span>
                    </button>

                    {getPaginationRange(safePage, totalPages).map((item, idx) => {
                      if (item === "...") {
                        return (
                          <span
                            key={`ellipsis-${idx}`}
                            className="w-6 h-8 flex items-center justify-center text-xs font-mono text-neutral-600"
                          >
                            ...
                          </span>
                        );
                      }

                      const isCurrent = item === safePage;
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setCurrentPage(item)}
                          aria-current={isCurrent ? "page" : undefined}
                          aria-label={`Page ${item}`}
                          className={`w-8 h-8 rounded-lg text-xs font-mono transition-colors flex items-center justify-center cursor-pointer ${
                            isCurrent
                              ? "bg-brand-red text-white font-bold border border-brand-red shadow-sm cursor-default"
                              : "bg-white/[0.02] hover:bg-white/[0.08] text-neutral-300 hover:text-white border border-white/10 hover:border-white/20"
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                      aria-label="Next page"
                      className={`h-8 px-2.5 sm:px-3 rounded-lg border text-xs font-mono font-medium flex items-center gap-1 transition-colors ${
                        safePage === totalPages
                          ? "border-white/[0.04] text-neutral-600 bg-white/[0.01] cursor-not-allowed opacity-50"
                          : "border-white/10 text-neutral-300 hover:text-white hover:bg-white/[0.06] hover:border-white/20 bg-white/[0.02] cursor-pointer"
                      }`}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </nav>
                )}
              </div>
            </div>
          )}

          {/* Edit / Create Form Modal */}
          {editingPost !== null && (
            <BlogPostForm
              post={Object.keys(editingPost).length ? editingPost : null}
              onClose={() => setEditingPost(null)}
              onSaved={handlePostSaved}
            />
          )}

          {/* Delete Confirmation Modal */}
          <AdminConfirmModal
            isOpen={Boolean(postToDelete)}
            title="Delete Blog Article"
            message={`Are you sure you want to delete "${postToDelete?.title}"? This action cannot be undone and will permanently remove this article and its Cloudinary cover image.`}
            confirmLabel="Delete Article"
            loading={deletingPostLoading}
            onConfirm={handleConfirmDelete}
            onCancel={() => setPostToDelete(null)}
          />
        </div>
      )}

      {/* TAB 2: HERO BANNER & CMS */}
      {activeTab === "HERO" && (
        <div className="space-y-8">
          {/* Notifications */}
          {heroSuccess && (
            <div className="flex items-center gap-2.5 text-xs text-brand-green bg-emerald-950/40 border border-emerald-500/30 rounded-lg p-3.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{heroSuccess}</span>
            </div>
          )}

          {heroError && (
            <div className="flex items-center gap-2.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/25 rounded-lg p-3.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{heroError}</span>
            </div>
          )}

          {/* Form and Preview Layout */}
          <form onSubmit={handleSaveHero} className="space-y-8">
            {/* 1. Live Banner Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-brand-red" />
                  Live Hero Banner Preview
                </span>
                <span className="text-[11px] font-mono text-neutral-500">
                  Preview updates as you edit fields below
                </span>
              </div>

              {/* Preview Container */}
              <div className="relative w-full overflow-hidden bg-[#080808] border border-white/10 rounded-xl min-h-[300px] sm:min-h-[360px] flex items-center select-none shadow-2xl">
                {/* Background Image in Preview */}
                <div className="absolute inset-0 z-0">
                  {heroForm.heroBannerImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={heroForm.heroBannerImageUrl}
                      alt={heroForm.heroBannerImageAlt || "Preview banner"}
                      className="w-full h-full object-cover"
                      style={{
                        objectPosition:
                          heroForm.heroBannerObjectPosition || "center right",
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-[#111111]" />
                  )}

                  {/* Scrim Overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(8,8,8,0.85) 0%, rgba(8,8,8,0.70) 38%, rgba(8,8,8,0.30) 70%, rgba(8,8,8,0.12) 100%)",
                    }}
                  />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 p-6 sm:p-10 max-w-xl lg:max-w-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-brand-red" />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-neutral-300">
                      {heroForm.heroEyebrow || "OUR BLOG"}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold uppercase leading-[1.04] text-white mb-3">
                    <span className="block">
                      {heroForm.heroHeadlineLine1 || "INSIGHTS THAT"}
                    </span>
                    <span className="block mt-1">
                      {heroForm.heroHeadlineLine2 || "INSPIRE"}
                    </span>
                    {heroForm.heroHeadlineHighlight ? (
                      <span className="block mt-1 text-brand-red">
                        {heroForm.heroHeadlineHighlight}
                      </span>
                    ) : null}
                  </h2>

                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed mb-6 line-clamp-3">
                    {heroForm.heroDescription ||
                      "Tips, trends and tutorials on video editing, motion graphics, content creation and growing your brand."}
                  </p>

                  <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-red text-white text-xs font-mono font-bold uppercase tracking-wider rounded-lg shadow-md">
                    <span>
                      {heroForm.heroCtaText || "EXPLORE ALL ARTICLES"}
                    </span>
                    <ArrowDown className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Studio Label */}
                <div className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  Full-Width Banner
                </div>
              </div>
            </div>

            {/* 2. Banner Image Upload & Settings Section */}
            <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-brand-red" />
                  <h3 className="font-display font-bold text-base text-white uppercase tracking-wide">
                    Hero Banner Image
                  </h3>
                </div>
                <span className="text-xs font-mono text-neutral-500">
                  Max size 10 MB (PNG, JPG, WebP)
                </span>
              </div>

              {/* Upload Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Image Upload Area */}
                <div className="space-y-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileChange}
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-brand-red" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-brand-red" />
                          {heroForm.heroBannerImageUrl
                            ? "Replace Banner Image"
                            : "Upload Banner Image"}
                        </>
                      )}
                    </button>

                    {heroForm.heroBannerImageUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400 hover:text-rose-400 px-3 py-2.5 rounded-lg hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                      >
                        <XIcon className="w-4 h-4" />
                        Remove Banner
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-neutral-500 leading-normal font-sans">
                    Upload a high-resolution workspace or studio photo (e.g.
                    video editing suite, camera setup, desk). The image covers
                    the full hero with a dark gradient behind the text.
                  </p>
                </div>

                {/* Banner Focal Alignment & Alt Text */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">
                      Focal Alignment
                    </label>
                    <select
                      value={
                        heroForm.heroBannerObjectPosition || "center right"
                      }
                      onChange={(e) =>
                        handleHeroChange(
                          "heroBannerObjectPosition",
                          e.target.value,
                        )
                      }
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none focus:border-brand-red font-sans"
                    >
                      {POSITION_OPTIONS.map((pos) => (
                        <option
                          key={pos.value}
                          value={pos.value}
                          className="bg-neutral-900 text-white"
                        >
                          {pos.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">
                      Image Alt Text
                    </label>
                    <input
                      type="text"
                      value={heroForm.heroBannerImageAlt || ""}
                      onChange={(e) =>
                        handleHeroChange("heroBannerImageAlt", e.target.value)
                      }
                      placeholder="e.g. DesignTouch+ Creative Studio"
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none focus:border-brand-red font-sans"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Hero Text & Copy Section */}
            <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
                <LayoutTemplate className="w-5 h-5 text-brand-red" />
                <h3 className="font-display font-bold text-base text-white uppercase tracking-wide">
                  Hero Typography & Content
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Eyebrow Text
                  </label>
                  <input
                    type="text"
                    value={heroForm.heroEyebrow || ""}
                    onChange={(e) =>
                      handleHeroChange("heroEyebrow", e.target.value)
                    }
                    placeholder="e.g. OUR BLOG"
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none focus:border-brand-red font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Headline Line 1
                  </label>
                  <input
                    type="text"
                    value={heroForm.heroHeadlineLine1 || ""}
                    onChange={(e) =>
                      handleHeroChange("heroHeadlineLine1", e.target.value)
                    }
                    placeholder="e.g. INSIGHTS THAT"
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none focus:border-brand-red font-display uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Headline Line 2
                  </label>
                  <input
                    type="text"
                    value={heroForm.heroHeadlineLine2 || ""}
                    onChange={(e) =>
                      handleHeroChange("heroHeadlineLine2", e.target.value)
                    }
                    placeholder="e.g. INSPIRE"
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none focus:border-brand-red font-display uppercase font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Highlight Word / Accent (Brand Red)
                  </label>
                  <input
                    type="text"
                    value={heroForm.heroHeadlineHighlight || ""}
                    onChange={(e) =>
                      handleHeroChange("heroHeadlineHighlight", e.target.value)
                    }
                    placeholder="e.g. CREATIVITY."
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-brand-red font-display uppercase font-bold outline-none focus:border-brand-red"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1.5 font-mono">
                    This text renders in signature red accent next to Line 2.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={heroForm.heroCtaText || ""}
                    onChange={(e) =>
                      handleHeroChange("heroCtaText", e.target.value)
                    }
                    placeholder="e.g. EXPLORE ALL ARTICLES"
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none focus:border-brand-red font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    CTA Link / Destination
                  </label>
                  <input
                    type="text"
                    value={heroForm.heroCtaLink || ""}
                    onChange={(e) =>
                      handleHeroChange("heroCtaLink", e.target.value)
                    }
                    placeholder="e.g. #articles or /blog#articles"
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none focus:border-brand-red font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Hero Subtitle / Description
                </label>
                <textarea
                  rows={3}
                  value={heroForm.heroDescription || ""}
                  onChange={(e) =>
                    handleHeroChange("heroDescription", e.target.value)
                  }
                  placeholder="Tips, trends and tutorials on video editing, motion graphics, content creation and growing your brand."
                  className="w-full bg-black/60 border border-white/10 rounded-lg p-3.5 text-xs text-white outline-none focus:border-brand-red font-sans leading-relaxed resize-y"
                />
              </div>
            </div>

            {/* Save Button Row */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={loadHeroContent}
                disabled={loadingHero || savingHero}
                className="inline-flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 hover:text-white text-xs font-mono font-semibold uppercase tracking-wider px-5 py-3 rounded-lg border border-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>

              <button
                type="submit"
                disabled={savingHero || uploadingImage}
                className="inline-flex items-center gap-2 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-wider px-6 py-3 rounded-lg border-none cursor-pointer transition-colors shadow-[0_4px_15px_rgba(239,68,68,0.3)] disabled:opacity-50"
              >
                {savingHero ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save & Publish Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: MANAGE CATEGORIES */}
      {activeTab === "CATEGORIES" && (
        <div className="space-y-4">
          {categoriesError && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{categoriesError}</span>
            </div>
          )}

          {/* Categories Table Container */}
          <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                    <th className="py-3.5 px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                      Category
                    </th>
                    <th className="py-3.5 px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                      Slug
                    </th>
                    <th className="py-3.5 px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 hidden md:table-cell">
                      Description
                    </th>
                    <th className="py-3.5 px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 text-center">
                      Order
                    </th>
                    <th className="py-3.5 px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 text-center">
                      Articles
                    </th>
                    <th className="py-3.5 px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {loadingCategories ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-neutral-400">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-brand-red" />
                          <span className="text-xs font-mono">Loading categories...</span>
                        </div>
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-neutral-500">
                        <p className="text-sm font-medium text-neutral-400">No categories found</p>
                        <p className="text-xs mt-1">Create your first blog category using the button above.</p>
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr
                        key={cat.id}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        {/* Name */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-brand-red shrink-0" />
                            <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                              {cat.name}
                            </span>
                          </div>
                        </td>

                        {/* Slug */}
                        <td className="py-4 px-4">
                          <span className="text-[11px] font-mono text-neutral-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                            {cat.slug}
                          </span>
                        </td>

                        {/* Description */}
                        <td className="py-4 px-4 hidden md:table-cell max-w-xs truncate text-xs text-neutral-400">
                          {cat.description || (
                            <span className="text-neutral-600 italic">No description</span>
                          )}
                        </td>

                        {/* Display Order */}
                        <td className="py-4 px-4 text-center">
                          <span className="text-xs font-mono text-neutral-400">
                            {cat.displayOrder ?? 0}
                          </span>
                        </td>

                        {/* Post Count Badge */}
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                              (cat.postCount || 0) > 0
                                ? "bg-brand-red/15 text-brand-red border border-brand-red/30"
                                : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                            }`}
                          >
                            {cat.postCount || 0} {cat.postCount === 1 ? "article" : "articles"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingCategory(cat)}
                              className="p-2 text-neutral-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                              title="Edit Category"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setCategoryToDelete(cat)}
                              className="p-2 text-neutral-400 hover:text-brand-red hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Blog Category Create/Edit Modal */}
      {editingCategory !== null && (
        <BlogCategoryFormModal
          category={Object.keys(editingCategory).length ? editingCategory : null}
          onClose={() => setEditingCategory(null)}
          onSaved={() => {
            setEditingCategory(null);
            loadCategories();
            loadPosts();
          }}
        />
      )}

      {/* Blog Category Safe Delete Workflow Modal */}
      {categoryToDelete !== null && (
        <BlogCategoryDeleteModal
          category={categoryToDelete}
          categories={categories}
          onClose={() => setCategoryToDelete(null)}
          onDeleted={() => {
            setCategoryToDelete(null);
            loadCategories();
            loadPosts();
          }}
        />
      )}
    </div>
  );
}
