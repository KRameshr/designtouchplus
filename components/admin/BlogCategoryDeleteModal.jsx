"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X as XIcon,
  AlertTriangle,
  ArrowRight,
  Trash2,
  Loader2,
  CheckSquare,
  Square,
  FileText,
  ShieldAlert,
} from "lucide-react";
import {
  getBlogCategoryArticles,
  deleteBlogCategory,
  moveAndDeleteBlogCategory,
  deleteBlogCategoryWithArticles,
} from "@/lib/api";

export default function BlogCategoryDeleteModal({
  category,
  categories = [],
  onClose,
  onDeleted,
}) {
  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [destinationId, setDestinationId] = useState("");
  const [activeTab, setActiveTab] = useState("MOVE"); // "MOVE" | "DELETE"
  const [confirmUnderstood, setConfirmUnderstood] = useState(false);
  const [confirmNameInput, setConfirmNameInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // Destination categories (all other categories)
  const destinationCategories = useMemo(() => {
    return categories.filter((c) => c.id !== category.id);
  }, [categories, category.id]);

  useEffect(() => {
    if (destinationCategories.length > 0 && !destinationId) {
      setDestinationId(destinationCategories[0].id);
    }
  }, [destinationCategories, destinationId]);

  // Load articles assigned to this category
  useEffect(() => {
    let isMounted = true;
    async function loadArticles() {
      setLoadingArticles(true);
      setError("");
      try {
        const data = await getBlogCategoryArticles(category.id);
        if (isMounted) {
          const list = data || [];
          setArticles(list);
          setSelectedIds(new Set(list.map((a) => a.id)));
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load assigned articles.");
        }
      } finally {
        if (isMounted) {
          setLoadingArticles(false);
        }
      }
    }
    loadArticles();
    return () => {
      isMounted = false;
    };
  }, [category.id]);

  // Checkbox helpers
  const toggleSelectArticle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(articles.map((a) => a.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  // Case A: Delete empty category
  const handleDeleteEmpty = async () => {
    setProcessing(true);
    setError("");
    try {
      await deleteBlogCategory(category.id);
      onDeleted();
    } catch (err) {
      setError(err.message || "Failed to delete category.");
      setProcessing(false);
    }
  };

  // Case B - Option 1: Move all articles and delete category
  const handleMoveArticles = async () => {
    if (!destinationId) {
      setError("Please select a destination category.");
      return;
    }
    setProcessing(true);
    setError("");
    try {
      await moveAndDeleteBlogCategory(category.id, destinationId);
      onDeleted();
    } catch (err) {
      setError(err.message || "Failed to reassign articles and delete category.");
      setProcessing(false);
    }
  };

  // Case B - Option 2: Delete articles and delete category
  const handleDeleteArticles = async () => {
    if (selectedIds.size === 0) {
      setError("Please select at least one article to delete.");
      return;
    }
    if (!confirmUnderstood) {
      setError("Please check the confirmation box to verify this destructive action.");
      return;
    }

    setProcessing(true);
    setError("");
    try {
      const isAll = selectedIds.size === articles.length;
      await deleteBlogCategoryWithArticles(category.id, {
        articleIds: Array.from(selectedIds),
        deleteAll: isAll,
      });
      onDeleted();
    } catch (err) {
      setError(err.message || "Failed to delete articles and category.");
      setProcessing(false);
    }
  };

  const hasArticles = articles.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0e0e0e] border border-white/15 rounded-none w-full max-w-2xl shadow-2xl my-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] bg-[#141414]">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-none bg-red-500/15 border border-red-500/30 flex items-center justify-center text-brand-red">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white font-mono">
                Delete Category: <span className="text-brand-red">{category.name}</span>
              </h2>
              <span className="text-[10px] font-mono text-neutral-400">
                Slug: {category.slug}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white bg-transparent border border-transparent hover:border-white/10 rounded-none cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/25 rounded-none px-3.5 py-2.5">
              <span className="w-1.5 h-1.5 bg-brand-red rounded-none shrink-0 mt-1" />
              <span className="break-words min-w-0">{error}</span>
            </div>
          )}

          {loadingArticles ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-neutral-400">
              <Loader2 className="w-6 h-6 animate-spin text-brand-red" />
              <span className="text-xs font-mono">Inspecting assigned articles...</span>
            </div>
          ) : !hasArticles ? (
            /* CASE A: No Articles */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-none text-xs text-emerald-300">
                <p className="font-semibold mb-1">Zero articles currently assigned</p>
                <p className="text-emerald-400/80 text-[11px]">
                  This category is not currently used by any blog posts. It is safe to delete immediately.
                </p>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                Are you sure you want to permanently delete the category{" "}
                <span className="text-white font-bold font-mono">&quot;{category.name}&quot;</span>?
                This action cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={processing}
                  className="px-4 py-2.5 rounded-none text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteEmpty}
                  disabled={processing}
                  className="inline-flex items-center gap-2 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-wider px-5 py-2.5 rounded-none border border-brand-red cursor-pointer transition-colors disabled:opacity-50"
                >
                  {processing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Delete Category</span>
                </button>
              </div>
            </div>
          ) : (
            /* CASE B: Contains Articles */
            <div className="space-y-5">
              <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-none text-xs text-amber-200">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Category Contains {articles.length} Article{articles.length === 1 ? "" : "s"}</span>
                </div>
                <p className="text-amber-300/80 text-[11px] leading-relaxed">
                  To prevent broken URLs and accidental data loss, choose whether you want to reassign these articles to another category or delete them.
                </p>
              </div>

              {/* Tab Selector: Option 1 vs Option 2 */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-black/50 border border-white/10 rounded-none">
                <button
                  type="button"
                  onClick={() => setActiveTab("MOVE")}
                  className={`py-2 px-3 text-xs font-mono font-semibold uppercase tracking-wider rounded-none transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                    activeTab === "MOVE"
                      ? "bg-brand-red text-white border-brand-red font-bold"
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.04] border-transparent"
                  }`}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Option 1: Move Articles</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("DELETE")}
                  className={`py-2 px-3 text-xs font-mono font-semibold uppercase tracking-wider rounded-none transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                    activeTab === "DELETE"
                      ? "bg-red-950/80 border-red-500/40 text-red-200 font-bold"
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.04] border-transparent"
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Option 2: Delete Articles</span>
                </button>
              </div>

              {/* OPTION 1 CONTENT: MOVE ARTICLES */}
              {activeTab === "MOVE" && (
                <div className="space-y-4 pt-1">
                  <div className="text-xs text-neutral-300 space-y-2">
                    <p>
                      Reassign all <strong className="text-white">{articles.length}</strong> article(s) to another category. All article content, titles, slugs, cover images, and publication dates will be safely preserved.
                    </p>
                    <p className="text-neutral-400 text-[11px]">
                      Once all articles have been reassigned, the category <strong className="text-white">&quot;{category.name}&quot;</strong> will be permanently deleted.
                    </p>
                  </div>

                  {destinationCategories.length === 0 ? (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-none text-xs text-red-300">
                      No other categories exist. Please create another category first before moving articles.
                    </div>
                  ) : (
                    <div>
                      <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
                        Select Destination Category *
                      </label>
                      <select
                        value={destinationId}
                        onChange={(e) => setDestinationId(e.target.value)}
                        className="bg-black/60 border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2.5 text-xs text-white outline-none transition-colors w-full cursor-pointer font-sans"
                      >
                        {destinationCategories.map((c) => (
                          <option key={c.id} value={c.id} className="bg-[#141414] text-white">
                            {c.name} ({c.postCount || 0} existing articles)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Summary preview of affected articles */}
                  <div>
                    <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
                      Articles to be reassigned ({articles.length})
                    </label>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-black/40 border border-white/[0.08] rounded-none">
                      {articles.map((art) => (
                        <div
                          key={art.id}
                          className="flex items-center justify-between text-xs text-neutral-300 py-1 px-2 hover:bg-white/[0.03] rounded-none"
                        >
                          <span className="truncate pr-2 font-medium">{art.title}</span>
                          <span className="text-[10px] font-mono text-neutral-500 shrink-0">
                            /{art.slug}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={processing}
                      className="px-4 py-2.5 rounded-none text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer border border-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleMoveArticles}
                      disabled={processing || destinationCategories.length === 0}
                      className="inline-flex items-center gap-2 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-wider px-5 py-2.5 rounded-none border border-brand-red cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {processing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Reassign Articles & Delete Category</span>
                    </button>
                  </div>
                </div>
              )}

              {/* OPTION 2 CONTENT: DELETE ARTICLES */}
              {activeTab === "DELETE" && (
                <div className="space-y-4 pt-1">
                  <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-none text-xs text-red-300">
                    <p className="font-semibold mb-1">Destructive Action</p>
                    <p className="text-red-400/90 text-[11px] leading-relaxed">
                      Selected articles will be permanently removed from the database. Shared cover images on Cloudinary will be safely preserved. If all articles are deleted, the category will also be deleted.
                    </p>
                  </div>

                  {/* Checklist Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400">
                      Select Articles to Delete ({selectedIds.size}/{articles.length})
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={selectAll}
                        className="text-[10px] font-mono text-brand-red hover:underline bg-transparent border-none cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-neutral-600">|</span>
                      <button
                        type="button"
                        onClick={deselectAll}
                        className="text-[10px] font-mono text-neutral-400 hover:underline bg-transparent border-none cursor-pointer"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  {/* Article checklist list */}
                  <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-black/50 border border-white/[0.08] rounded-none">
                    {articles.map((art) => {
                      const isSelected = selectedIds.has(art.id);
                      return (
                        <div
                          key={art.id}
                          onClick={() => toggleSelectArticle(art.id)}
                          className={`flex items-center justify-between gap-3 p-2 rounded-none cursor-pointer transition-colors text-xs border ${
                            isSelected
                              ? "bg-red-500/10 border-red-500/30 text-white"
                              : "hover:bg-white/[0.03] text-neutral-400 border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-brand-red shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-neutral-600 shrink-0" />
                            )}
                            <div className="truncate">
                              <p className="truncate font-medium">{art.title}</p>
                              <p className="text-[10px] font-mono text-neutral-500">/{art.slug}</p>
                            </div>
                          </div>
                          <span
                            className={`text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded-none shrink-0 border ${
                              art.status === "PUBLISHED"
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : art.status === "SCHEDULED"
                                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                : "bg-neutral-800 text-neutral-400 border-neutral-700"
                            }`}
                          >
                            {art.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explicit Confirmation Checkbox */}
                  <div className="p-3 bg-black/60 border border-white/10 rounded-none">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmUnderstood}
                        onChange={(e) => setConfirmUnderstood(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-brand-red rounded-none cursor-pointer"
                      />
                      <span className="text-xs text-neutral-300">
                        I understand that {selectedIds.size} article(s) will be permanently deleted and cannot be recovered.
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={processing}
                      className="px-4 py-2.5 rounded-none text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer border border-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteArticles}
                      disabled={processing || selectedIds.size === 0 || !confirmUnderstood}
                      className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold uppercase tracking-wider px-5 py-2.5 rounded-none border border-red-600 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>
                        Delete {selectedIds.size} Article{selectedIds.size === 1 ? "" : "s"}
                        {selectedIds.size === articles.length ? " & Category" : ""}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

