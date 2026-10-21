"use client";

import { useState, useEffect } from "react";
import { getPortfolioCategories, deletePortfolioCategory } from "@/lib/api";
import CategoryFormModal from "./CategoryFormModal";
import CategoryDeleteModal from "./CategoryDeleteModal";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalState, setModalState] = useState(null); // null | { category: null | {...}, categoryType: "VIDEO_EDITING" | "THUMBNAIL_DESIGN" }
  const [deleteModalCategory, setDeleteModalCategory] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPortfolioCategories(null, true);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load portfolio categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const videoCategories = categories
    .filter((c) => c.categoryType === "VIDEO_EDITING")
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const thumbnailCategories = categories
    .filter((c) => c.categoryType === "THUMBNAIL_DESIGN")
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const handleDelete = async (category) => {
    const count = category.projectCount ?? 0;
    if (count > 0) {
      setDeleteModalCategory(category);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete category "${category.name}"?`)) {
      return;
    }

    setDeletingId(category.id);
    setError("");
    setSuccess("");
    try {
      await deletePortfolioCategory(category.id);
      setSuccess(`Category "${category.name}" deleted successfully.`);
      loadCategories();
    } catch (err) {
      if (err.message && err.message.includes("used by")) {
        setDeleteModalCategory(category);
      } else {
        setError(err.message || "Failed to delete category.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaved = () => {
    setModalState(null);
    setSuccess("Portfolio category saved successfully!");
    loadCategories();
  };

  const renderCategoryTable = (items, typeKey, typeTitle, onAddClick) => (
    <div className="bg-[#0b0b0b] border border-white/[0.08] rounded-none p-5 sm:p-6 space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0" aria-hidden="true" />
            <h2 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-[0.18em] text-white">
              {typeTitle}
            </h2>
          </div>
          <p className="text-[11px] font-mono text-neutral-400">
            {items.length} {items.length === 1 ? "category" : "categories"} configured in database
          </p>
        </div>

        <button
          type="button"
          onClick={onAddClick}
          className="inline-flex items-center gap-2 bg-brand-red hover:bg-[#dc2626] text-white text-[11px] font-mono font-bold uppercase tracking-[0.14em] px-3.5 py-2 rounded-none border border-brand-red transition-colors cursor-pointer shrink-0"
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 1V11M1 6H11" />
          </svg>
          <span>
            {typeKey === "VIDEO_EDITING" ? "+ Add Video Category" : "+ Add Thumbnail Category"}
          </span>
        </button>
      </div>

      {/* Table / List */}
      {items.length === 0 ? (
        <div className="p-8 text-center bg-black/40 border border-white/[0.06] rounded-none">
          <p className="text-xs font-mono uppercase tracking-wider text-neutral-500">
            No {typeTitle.toLowerCase()} found. Click the button above to add one.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-black/40 text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                <th className="py-2.5 px-3 w-16"># Order</th>
                <th className="py-2.5 px-3">Category Name</th>
                <th className="py-2.5 px-3 hidden md:table-cell">Slug Identifier</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Used In</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {items.map((cat) => {
                const isDeleting = deletingId === cat.id;
                const projectCount = cat.projectCount ?? 0;

                return (
                  <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-mono text-neutral-500">
                      #{cat.displayOrder ?? 0}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-white text-xs tracking-tight">
                        {cat.name}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-neutral-400 hidden md:table-cell">
                      {cat.slug}
                    </td>
                    <td className="py-3 px-3">
                      {cat.isActive ? (
                        <span className="inline-block text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 bg-neutral-800 text-neutral-400 border border-neutral-700">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      <span
                        className={
                          projectCount > 0
                            ? "text-brand-red font-bold"
                            : "text-neutral-500"
                        }
                      >
                        {projectCount} {projectCount === 1 ? "project" : "projects"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setModalState({ category: cat, categoryType: cat.categoryType })}
                          className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          disabled={isDeleting}
                          className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/30 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isDeleting ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Status Messages */}
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

      {/* Intro Context Bar */}
      <div className="p-4 bg-black/40 border border-white/[0.08] rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 block mb-1">
            CATEGORY CMS // INDEPENDENT WORKFLOW ARCHITECTURE
          </span>
          <p className="text-xs text-neutral-300">
            Video Editing and Thumbnail Design categories are maintained independently in PostgreSQL. Deletion is automatically protected if any project is attached.
          </p>
        </div>

        <button
          type="button"
          onClick={loadCategories}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white text-[11px] font-mono uppercase tracking-wider rounded-none border border-white/10 cursor-pointer transition-colors shrink-0 self-start sm:self-center"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            className={loading ? "animate-spin" : ""}
          >
            <path d="M1 6A5 5 0 1 1 6 11M6 1V3.5M6 1L3.5 3.5" strokeWidth="1.5" />
          </svg>
          <span>Reload</span>
        </button>
      </div>

      {/* SECTION 1: VIDEO EDITING CATEGORIES */}
      {renderCategoryTable(
        videoCategories,
        "VIDEO_EDITING",
        "Video Editing Categories",
        () => setModalState({ category: null, categoryType: "VIDEO_EDITING" })
      )}

      {/* SECTION 2: THUMBNAIL DESIGN CATEGORIES */}
      {renderCategoryTable(
        thumbnailCategories,
        "THUMBNAIL_DESIGN",
        "Thumbnail Design Categories",
        () => setModalState({ category: null, categoryType: "THUMBNAIL_DESIGN" })
      )}

      {/* Category Add/Edit Modal */}
      {modalState && (
        <CategoryFormModal
          category={modalState.category}
          categoryType={modalState.categoryType}
          onClose={() => setModalState(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Category Safe Deletion / Reassignment Modal */}
      {deleteModalCategory && (
        <CategoryDeleteModal
          category={deleteModalCategory}
          categories={categories}
          onClose={() => setDeleteModalCategory(null)}
          onDeleted={(id, msg) => {
            setDeleteModalCategory(null);
            setSuccess(msg);
            loadCategories();
          }}
          onProjectsUpdated={() => {
            loadCategories();
          }}
        />
      )}
    </div>
  );
}

