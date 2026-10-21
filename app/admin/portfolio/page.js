"use client";

import { useEffect, useState, useMemo } from "react";
import { adminFetch } from "@/lib/auth";
import PortfolioForm from "@/components/admin/PortfolioForm";
import StatFormModal from "@/components/admin/StatFormModal";
import PortfolioIntroEditor from "@/components/admin/PortfolioIntroEditor";
import CategoryManager from "@/components/admin/CategoryManager";
import MediaMigrationModal from "@/components/admin/MediaMigrationModal";

const ADMIN_PAGE_SIZE = 10;

export default function AdminPortfolioPage() {
  const [activeTab, setActiveTab] = useState("PROJECTS"); // "PROJECTS" | "INTRO" | "STATS"

  // Portfolio items state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingItem, setEditingItem] = useState(null); // null = closed, {} = new, {...} = edit
  const [deletingId, setDeletingId] = useState(null);
  const [filterType, setFilterType] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMigrationModal, setShowMigrationModal] = useState(false);

  // Portfolio stats state
  const [stats, setStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [editingStat, setEditingStat] = useState(null); // null = closed, {} = new, {...} = edit
  const [deletingStatId, setDeletingStatId] = useState(null);

  const loadItems = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminFetch("/api/portfolio/admin/all");
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load portfolio items.");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    setLoadingStats(true);
    setError("");
    try {
      const data = await adminFetch("/api/stats");
      setStats(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load portfolio statistics.");
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadItems();
    loadStats();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title || "this project"}"?`)) {
      return;
    }

    setDeletingId(id);
    setError("");
    setSuccess("");
    try {
      await adminFetch(`/api/portfolio/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((item) => item.id !== id));
      setSuccess("Portfolio item deleted successfully.");
    } catch (err) {
      setError(err.message || "Failed to delete portfolio item.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteStat = async (id, label) => {
    if (!window.confirm(`Are you sure you want to delete statistic "${label}"?`)) {
      return;
    }

    setDeletingStatId(id);
    setError("");
    setSuccess("");
    try {
      await adminFetch(`/api/stats/${id}`, { method: "DELETE" });
      setStats((prev) => prev.filter((s) => s.id !== id));
      setSuccess("Portfolio statistic deleted successfully.");
    } catch (err) {
      setError(err.message || "Failed to delete statistic.");
    } finally {
      setDeletingStatId(null);
    }
  };

  const handleSaved = () => {
    setEditingItem(null);
    setSuccess("Portfolio project saved successfully!");
    loadItems();
  };

  const handleStatSaved = () => {
    setEditingStat(null);
    setSuccess("Portfolio statistic saved successfully!");
    loadStats();
  };

  const filteredItems = useMemo(() => {
    if (filterType === "ALL") return items;
    return items.filter((item) => item.contentType === filterType);
  }, [items, filterType]);

  const totalProjects = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalProjects / ADMIN_PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  // Automatically adjust current page if total pages shrunk (e.g. item deleted from last page)
  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (safePage - 1) * ADMIN_PAGE_SIZE;
  const endIndex = Math.min(startIndex + ADMIN_PAGE_SIZE, totalProjects);
  const paginatedItems = useMemo(() => {
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, startIndex, endIndex]);

  const rangeIndicator =
    totalProjects === 0
      ? "SHOWING 0 OF 0 RECORDS"
      : `SHOWING ${startIndex + 1}–${endIndex} OF ${totalProjects} RECORDS`;

  const videoCount = items.filter((i) => i.contentType === "VIDEO_EDITING").length;
  const thumbCount = items.filter((i) => i.contentType === "THUMBNAIL_DESIGN").length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Header & Main Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0" aria-hidden="true" />
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-400">
              Admin CMS // Media Archives &amp; Metrics
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase font-display tracking-tight text-white">
            Portfolio Management
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1">
            Manage your project showcases, Cloudinary video storage, display ordering, and live stats.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {activeTab !== "INTRO" && activeTab !== "CATEGORIES" && (
            <button
              type="button"
              onClick={activeTab === "PROJECTS" ? loadItems : loadStats}
              disabled={loading || loadingStats}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-wider rounded-none border border-white/10 cursor-pointer transition-colors"
              title="Reload from database"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                className={loading || loadingStats ? "animate-spin" : ""}
              >
                <path d="M1 6A5 5 0 1 1 6 11M6 1V3.5M6 1L3.5 3.5" strokeWidth="1.5" />
              </svg>
              <span>Reload</span>
            </button>
          )}

          {activeTab === "PROJECTS" && (
            <>
              <button
                type="button"
                onClick={() => setShowMigrationModal(true)}
                className="inline-flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-wider px-3.5 py-2.5 rounded-none border border-white/10 transition-colors cursor-pointer"
                title="View media inventory & migrate local assets to Cloudinary"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M12 12v9m-4-4 4 4 4-4" />
                </svg>
                <span>Asset Migration</span>
              </button>

              <button
                type="button"
                onClick={() => setEditingItem({})}
                className="inline-flex items-center gap-2 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-[0.14em] px-4 py-2.5 rounded-none border border-brand-red transition-colors cursor-pointer"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 1V11M1 6H11" />
                </svg>
                <span>Add Project</span>
              </button>
            </>
          )}

          {activeTab === "STATS" && (
            <button
              type="button"
              onClick={() => setEditingStat({})}
              className="inline-flex items-center gap-2 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-[0.14em] px-4 py-2.5 rounded-none border border-brand-red transition-colors cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 1V11M1 6H11" />
              </svg>
              <span>Add Stat</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-start gap-2.5 text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-none px-4 py-3">
          <span className="w-1.5 h-1.5 bg-brand-red rounded-none shrink-0 mt-1" />
          <span className="break-words min-w-0">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-none px-4 py-3">
          <span className="w-1.5 h-1.5 bg-brand-green rounded-none shrink-0 mt-1" />
          <span className="break-words min-w-0">{success}</span>
        </div>
      )}

      {/* Master View Tabs (Projects vs Intro vs Categories vs Statistics) */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setActiveTab("PROJECTS");
            setCurrentPage(1);
          }}
          className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-none border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === "PROJECTS"
              ? "border-brand-red text-white bg-white/[0.03]"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          Projects Archive ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("INTRO")}
          className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-none border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === "INTRO"
              ? "border-brand-red text-white bg-white/[0.03]"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          Portfolio Intro
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("CATEGORIES")}
          className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-none border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === "CATEGORIES"
              ? "border-brand-red text-white bg-white/[0.03]"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          Portfolio Categories
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("STATS")}
          className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-none border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === "STATS"
              ? "border-brand-red text-white bg-white/[0.03]"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          Portfolio Statistics ({stats.length})
        </button>
      </div>

      {/* VIEW 1: PROJECTS TAB */}
      {activeTab === "PROJECTS" && (
        <>
          {/* Filter Tabs Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0d0d0d] border border-white/[0.08] p-3 rounded-none">
            <div className="flex items-center gap-2">
              {[
                { key: "ALL", label: `All Work (${items.length})` },
                { key: "VIDEO_EDITING", label: `Video Editing (${videoCount})` },
                { key: "THUMBNAIL_DESIGN", label: `Thumbnails (${thumbCount})` },
              ].map(({ key, label }) => {
                const active = filterType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setFilterType(key);
                      setCurrentPage(1);
                    }}
                    className={`text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-none border transition-colors cursor-pointer ${
                      active
                        ? "bg-white/[0.1] border-white/30 text-white"
                        : "bg-transparent border-transparent text-neutral-400 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest px-2">
              {rangeIndicator}
            </span>
          </div>

          {/* Projects List / Table */}
          {loading ? (
            <div className="bg-[#0d0d0d] border border-white/[0.08] p-12 text-center text-neutral-400 text-xs font-mono uppercase tracking-widest">
              Loading portfolio archives from Neon PostgreSQL...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-[#0d0d0d] border border-white/[0.08] p-12 text-center">
              <p className="text-neutral-400 text-xs font-mono uppercase tracking-widest mb-3">
                No projects found under this view.
              </p>
              <button
                type="button"
                onClick={() => setEditingItem({})}
                className="text-xs font-mono uppercase text-brand-red underline cursor-pointer"
              >
                Create first project →
              </button>
            </div>
          ) : (
            <>
              <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-none overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-black/40 text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-neutral-400">
                      <th className="py-3 px-4 w-24">Media</th>
                      <th className="py-3 px-4">Title &amp; Details</th>
                      <th className="py-3 px-4">Type / Category</th>
                      <th className="py-3 px-4 text-center">Featured</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4 text-center">Order</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-xs">
                    {paginatedItems.map((item) => {
                      const mediaPreview = item.thumbnailUrl || item.imageUrl;

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                          {/* Media Thumbnail */}
                          <td className="py-3 px-4">
                            <div className="relative aspect-video w-20 bg-black border border-white/10 overflow-hidden shrink-0">
                              {mediaPreview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={mediaPreview}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[9px] font-mono text-neutral-600 bg-[#141414]">
                                  {item.videoUrl ? "VIDEO" : "NONE"}
                                </div>
                              )}
                              {item.videoUrl && (
                                <span className="absolute bottom-0.5 right-0.5 bg-black/80 px-1 text-[8px] font-mono text-brand-red">
                                  ● VID
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Title & Description */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-white uppercase font-display text-sm line-clamp-1">
                              {item.title}
                            </div>
                            {item.description && (
                              <div className="text-neutral-400 text-[11px] line-clamp-1 mt-0.5 font-normal">
                                {item.description}
                              </div>
                            )}
                            {item.subCategory && (
                              <span className="inline-block mt-1 text-[9px] font-mono text-neutral-500 uppercase">
                                TAG: {item.subCategory}
                              </span>
                            )}
                            {item.videoPublicId && (
                              <div className="text-[9px] font-mono text-neutral-500 truncate max-w-xs mt-0.5">
                                CLD: {item.videoPublicId}
                              </div>
                            )}
                          </td>

                          {/* Type & Category */}
                          <td className="py-3 px-4">
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-white/[0.04] border border-white/10 text-neutral-300 block w-fit mb-1">
                              {item.contentType === "VIDEO_EDITING" ? "Video Editing" : "Thumbnail"}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400">
                              {item.categoryName || item.category?.replace(/_/g, " ") || item.subCategory || "—"}
                            </span>
                          </td>

                          {/* Featured Flag */}
                          <td className="py-3 px-4 text-center">
                            {item.isFeatured ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase text-brand-green bg-emerald-500/10 border border-brand-green/30 px-2 py-0.5">
                                <span className="w-1.5 h-1.5 bg-brand-green inline-block" />
                                Home
                              </span>
                            ) : (
                              <span className="text-neutral-600 font-mono text-[11px]">—</span>
                            )}
                          </td>

                          {/* Duration */}
                          <td className="py-3 px-4 font-mono text-neutral-400 text-[11px]">
                            {item.duration || "—"}
                          </td>

                          {/* Display Order */}
                          <td className="py-3 px-4 text-center font-mono text-neutral-400 text-[11px]">
                            #{item.displayOrder ?? 0}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingItem(item)}
                                className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 rounded-none cursor-pointer transition-colors"
                                title="Edit project"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(item.id, item.title)}
                                disabled={deletingId === item.id}
                                className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 border border-red-500/25 rounded-none cursor-pointer transition-colors"
                                title="Delete project"
                              >
                                {deletingId === item.id ? "..." : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Stack View */}
              <div className="md:hidden divide-y divide-white/[0.08]">
                {paginatedItems.map((item) => {
                  const mediaPreview = item.thumbnailUrl || item.imageUrl;

                  return (
                    <div key={item.id} className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="relative aspect-video w-24 bg-black border border-white/10 overflow-hidden shrink-0">
                          {mediaPreview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={mediaPreview}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] font-mono text-neutral-600 bg-[#141414]">
                              NO MEDIA
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            {item.isFeatured && (
                              <span className="text-[9px] font-mono uppercase text-brand-green bg-emerald-500/10 border border-brand-green/30 px-1.5">
                                HOME
                              </span>
                            )}
                            <span className="text-[9px] font-mono uppercase text-neutral-500">
                              #{item.displayOrder ?? 0}
                            </span>
                          </div>
                          <h3 className="font-bold text-white uppercase font-display text-sm truncate">
                            {item.title}
                          </h3>
                          <p className="text-[10px] font-mono text-neutral-400 mt-0.5 truncate">
                            {item.category?.replace(/_/g, " ") || item.contentType}
                            {item.duration && ` • ${item.duration}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.04]">
                        <button
                          type="button"
                          onClick={() => setEditingItem(item)}
                          className="px-3 py-1.5 text-xs font-mono uppercase text-neutral-300 bg-white/[0.04] border border-white/10 rounded-none cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.title)}
                          disabled={deletingId === item.id}
                          className="px-3 py-1.5 text-xs font-mono uppercase text-red-400 bg-red-500/10 border border-red-500/25 rounded-none cursor-pointer"
                        >
                          {deletingId === item.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pagination Controls Bar */}
            {totalProjects > 0 && (
              <div className="bg-[#0d0d0d] border border-white/[0.08] p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
                {/* Range Indicator */}
                <div className="text-xs font-mono uppercase tracking-[0.16em] text-neutral-400">
                  {rangeIndicator}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    {/* Previous Button */}
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={safePage <= 1}
                      aria-label="Previous page"
                      className="h-8 px-3 border border-white/15 hover:border-white hover:bg-white hover:text-black text-white text-[11px] font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:border-white/15 disabled:hover:bg-transparent disabled:hover:text-white rounded-none cursor-pointer flex items-center gap-1.5"
                    >
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7.5 2.5L4 6L7.5 9.5" />
                      </svg>
                      <span>Prev</span>
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      const isActive = pageNum === safePage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          aria-current={isActive ? "page" : undefined}
                          className={`w-8 h-8 flex items-center justify-center text-[11px] font-mono font-bold border rounded-none transition-colors cursor-pointer ${
                            isActive
                              ? "bg-brand-red border-brand-red text-white"
                              : "bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white border-white/10 hover:border-white/30"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {/* Next Button */}
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage >= totalPages}
                      aria-label="Next page"
                      className="h-8 px-3 border border-white/15 hover:border-white hover:bg-white hover:text-black text-white text-[11px] font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:border-white/15 disabled:hover:bg-transparent disabled:hover:text-white rounded-none cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Next</span>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4.5 2.5L8 6L4.5 9.5" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
            </>
          )}
        </>
      )}

      {/* VIEW 2: PORTFOLIO INTRO TAB */}
      {activeTab === "INTRO" && (
        <PortfolioIntroEditor />
      )}

      {/* VIEW 3: PORTFOLIO CATEGORIES TAB */}
      {activeTab === "CATEGORIES" && (
        <CategoryManager />
      )}

      {/* VIEW 4: STATISTICS TAB */}
      {activeTab === "STATS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#0d0d0d] border border-white/[0.08] p-3 rounded-none">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-red inline-block" />
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-200">
                Live Portfolio Metrics (Displayed on /portfolio Hero)
              </span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest px-2">
              {stats.length} Active Metrics
            </span>
          </div>

          {loadingStats ? (
            <div className="bg-[#0d0d0d] border border-white/[0.08] p-12 text-center text-neutral-400 text-xs font-mono uppercase tracking-widest">
              Loading statistics from database...
            </div>
          ) : stats.length === 0 ? (
            <div className="bg-[#0d0d0d] border border-white/[0.08] p-12 text-center">
              <p className="text-neutral-400 text-xs font-mono uppercase tracking-widest mb-3">
                No statistics records found.
              </p>
              <button
                type="button"
                onClick={() => setEditingStat({})}
                className="text-xs font-mono uppercase text-brand-red underline cursor-pointer"
              >
                Create first statistic →
              </button>
            </div>
          ) : (
            <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-none overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-black/40 text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-neutral-400">
                      <th className="py-3 px-4 w-16 text-center">Order</th>
                      <th className="py-3 px-4">Metric Value</th>
                      <th className="py-3 px-4">Label</th>
                      <th className="py-3 px-4">Suffix</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-xs">
                    {stats.map((stat) => (
                      <tr key={stat.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 text-center font-mono text-neutral-400 text-xs">
                          #{stat.displayOrder ?? 0}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-display font-black text-white text-base tracking-tight">
                            {stat.value}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-neutral-200">
                          {stat.label}
                        </td>
                        <td className="py-3 px-4 font-mono text-brand-red text-xs">
                          {stat.suffix || "—"}
                        </td>
                        <td className="py-3 px-4 text-neutral-400 text-xs">
                          {stat.description || "—"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingStat(stat)}
                              className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 rounded-none cursor-pointer transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStat(stat.id, stat.label)}
                              disabled={deletingStatId === stat.id}
                              className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 border border-red-500/25 rounded-none cursor-pointer transition-colors"
                            >
                              {deletingStatId === stat.id ? "..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Project Modal Form */}
      {editingItem !== null && (
        <PortfolioForm
          item={Object.keys(editingItem).length ? editingItem : null}
          onClose={() => setEditingItem(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Statistic Modal Form */}
      {editingStat !== null && (
        <StatFormModal
          stat={Object.keys(editingStat).length ? editingStat : null}
          onClose={() => setEditingStat(null)}
          onSaved={handleStatSaved}
        />
      )}

      {/* Media Inventory & Migration Modal */}
      {showMigrationModal && (
        <MediaMigrationModal
          isOpen={showMigrationModal}
          onClose={() => setShowMigrationModal(false)}
          onMigrated={loadItems}
        />
      )}
    </div>
  );
}
