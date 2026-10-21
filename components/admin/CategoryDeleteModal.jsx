"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getAdminPortfolioItems,
  updatePortfolioItem,
  deletePortfolioItem,
  deletePortfolioCategory,
} from "@/lib/api";

export default function CategoryDeleteModal({
  category,
  categories = [],
  onClose,
  onDeleted,
  onProjectsUpdated,
}) {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [destinationId, setDestinationId] = useState("");
  const [activeTab, setActiveTab] = useState("MOVE"); // "MOVE" | "DELETE"
  const [confirmDestructive, setConfirmDestructive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");

  const typeLabel =
    category.categoryType === "VIDEO_EDITING"
      ? "Video Editing"
      : "Thumbnail Design";

  // Filter valid destination categories: same type, active, not the one being deleted
  const destinationCategories = useMemo(() => {
    return categories.filter(
      (c) =>
        c.categoryType === category.categoryType &&
        c.id !== category.id &&
        c.isActive
    );
  }, [categories, category]);

  // Set initial destination category if available
  useEffect(() => {
    if (destinationCategories.length > 0 && !destinationId) {
      setDestinationId(destinationCategories[0].id);
    }
  }, [destinationCategories, destinationId]);

  // Load affected projects assigned to this category
  const loadAssignedProjects = async () => {
    setLoadingProjects(true);
    setError("");
    try {
      const allItems = await getAdminPortfolioItems();
      const assigned = (allItems || []).filter((item) => {
        if (item.categoryId && item.categoryId === category.id) return true;
        if (
          item.categorySlug &&
          item.categorySlug === category.slug &&
          item.categoryType === category.categoryType
        ) {
          return true;
        }
        return false;
      });

      setProjects(assigned);
      // Pre-select all assigned projects for convenience
      setSelectedIds(new Set(assigned.map((p) => p.id)));
    } catch (err) {
      setError(err.message || "Failed to load affected projects.");
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    loadAssignedProjects();
  }, [category.id]);

  const toggleSelectProject = (id) => {
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
    setSelectedIds(new Set(projects.map((p) => p.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  // Option A: Move Selected Projects, then Delete Category if empty
  const handleMoveProjects = async () => {
    if (selectedIds.size === 0) {
      setError("Please select at least one project to move.");
      return;
    }
    if (!destinationId) {
      setError("Please choose a valid destination category.");
      return;
    }

    const destCat = destinationCategories.find((c) => c.id === destinationId);
    if (!destCat) {
      setError("Destination category is invalid.");
      return;
    }

    setProcessing(true);
    setError("");
    setStatusMessage(`Moving ${selectedIds.size} project(s) to "${destCat.name}"...`);

    const selectedProjects = projects.filter((p) => selectedIds.has(p.id));
    let movedCount = 0;

    try {
      // Step 1: Update each selected project
      for (const project of selectedProjects) {
        const payload = {
          title: project.title,
          contentType: project.contentType,
          category: project.category || null,
          subCategory: project.subCategory || null,
          description: project.description || null,
          duration: project.duration || null,
          videoUrl: project.videoUrl || null,
          imageUrl: project.imageUrl || null,
          thumbnailUrl: project.thumbnailUrl || null,
          videoPublicId: project.videoPublicId || null,
          displayOrder: project.displayOrder ?? 0,
          isFeatured: project.isFeatured ?? false,
          categoryId: destinationId,
        };

        await updatePortfolioItem(project.id, payload);
        movedCount++;
      }

      if (onProjectsUpdated) {
        onProjectsUpdated();
      }

      // Step 2: Refresh state from backend
      setStatusMessage("Checking remaining projects in category...");
      const allItems = await getAdminPortfolioItems();
      const remaining = (allItems || []).filter((item) => {
        if (item.categoryId && item.categoryId === category.id) return true;
        if (
          item.categorySlug &&
          item.categorySlug === category.slug &&
          item.categoryType === category.categoryType
        ) {
          return true;
        }
        return false;
      });

      setProjects(remaining);
      setSelectedIds(new Set(remaining.map((p) => p.id)));

      // Step 3: Delete category only if no projects remain
      if (remaining.length === 0) {
        setStatusMessage(`All projects reassigned. Deleting category "${category.name}"...`);
        await deletePortfolioCategory(category.id);
        onDeleted(
          category.id,
          `Successfully moved ${movedCount} project(s) to "${destCat.name}" and deleted category "${category.name}".`
        );
      } else {
        setStatusMessage(
          `Moved ${movedCount} project(s) to "${destCat.name}". Note: ${remaining.length} project(s) remain in "${category.name}". You must move or delete them before deleting this category.`
        );
      }
    } catch (err) {
      setError(
        `Operation halted after moving ${movedCount} project(s): ${
          err.message || "Request failed"
        }. The category was not deleted.`
      );
      // Reload remaining projects safely
      try {
        const allItems = await getAdminPortfolioItems();
        const currentRemaining = (allItems || []).filter(
          (item) => item.categoryId === category.id
        );
        setProjects(currentRemaining);
        setSelectedIds(new Set(currentRemaining.map((p) => p.id)));
      } catch {
        // ignore secondary reload error
      }
    } finally {
      setProcessing(false);
    }
  };

  // Option B: Delete Selected Projects, then Delete Category if empty
  const handleDeleteProjects = async () => {
    if (selectedIds.size === 0) {
      setError("Please select at least one project to delete.");
      return;
    }
    if (!confirmDestructive) {
      setError("Please check the confirmation box acknowledging permanent deletion.");
      return;
    }

    setProcessing(true);
    setError("");
    setStatusMessage(`Deleting ${selectedIds.size} project(s)...`);

    const selectedProjects = projects.filter((p) => selectedIds.has(p.id));
    let deletedCount = 0;

    try {
      // Step 1: Delete each selected project
      for (const project of selectedProjects) {
        await deletePortfolioItem(project.id);
        deletedCount++;
      }

      if (onProjectsUpdated) {
        onProjectsUpdated();
      }

      // Step 2: Refresh state from backend
      setStatusMessage("Checking remaining projects in category...");
      const allItems = await getAdminPortfolioItems();
      const remaining = (allItems || []).filter((item) => {
        if (item.categoryId && item.categoryId === category.id) return true;
        if (
          item.categorySlug &&
          item.categorySlug === category.slug &&
          item.categoryType === category.categoryType
        ) {
          return true;
        }
        return false;
      });

      setProjects(remaining);
      setSelectedIds(new Set(remaining.map((p) => p.id)));
      setConfirmDestructive(false);

      // Step 3: Delete category only if no projects remain
      if (remaining.length === 0) {
        setStatusMessage(`All projects deleted. Deleting category "${category.name}"...`);
        await deletePortfolioCategory(category.id);
        onDeleted(
          category.id,
          `Successfully deleted ${deletedCount} project(s) and deleted category "${category.name}".`
        );
      } else {
        setStatusMessage(
          `Deleted ${deletedCount} project(s). Note: ${remaining.length} project(s) still remain in "${category.name}". You must move or delete them before deleting this category.`
        );
      }
    } catch (err) {
      setError(
        `Operation halted after deleting ${deletedCount} project(s): ${
          err.message || "Request failed"
        }. The category was not deleted.`
      );
      try {
        const allItems = await getAdminPortfolioItems();
        const currentRemaining = (allItems || []).filter(
          (item) => item.categoryId === category.id
        );
        setProjects(currentRemaining);
        setSelectedIds(new Set(currentRemaining.map((p) => p.id)));
      } catch {
        // ignore secondary reload error
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0e0e0e] border border-white/15 rounded-none w-full max-w-2xl shadow-2xl my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] bg-[#121212] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 bg-brand-red rounded-none inline-block shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white font-mono truncate">
                Delete Category: {category.name}
              </h2>
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
                {typeLabel} • {projects.length} {projects.length === 1 ? "project" : "projects"} assigned
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white bg-transparent border border-transparent hover:border-white/10 rounded-none cursor-pointer transition-colors shrink-0 disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 2L10 10M10 2L2 10" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Explanation Alert */}
          <div className="p-3.5 bg-red-500/10 border border-red-500/25 rounded-none flex items-start gap-2.5 text-neutral-300">
            <span className="w-1.5 h-1.5 bg-brand-red rounded-none shrink-0 mt-1" />
            <div className="space-y-1">
              <p className="font-mono font-bold text-red-400 uppercase tracking-wider text-[11px]">
                Safe Deletion Guard Active
              </p>
              <p className="text-[11px] leading-relaxed text-neutral-300">
                This category cannot be deleted while portfolio projects still reference it.
                You can reassign projects to another active {typeLabel.toLowerCase()} category,
                or permanently delete them. The category will be deleted only once all assigned projects are resolved.
              </p>
            </div>
          </div>

          {/* Feedback & Progress Messages */}
          {error && (
            <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-none">
              <span className="w-1.5 h-1.5 bg-brand-red shrink-0 mt-1" />
              <span className="break-words min-w-0">{error}</span>
            </div>
          )}

          {statusMessage && !error && (
            <div className="flex items-start gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 p-3 rounded-none">
              <span className="w-1.5 h-1.5 bg-amber-400 shrink-0 mt-1" />
              <span className="break-words min-w-0">{statusMessage}</span>
            </div>
          )}

          {/* Affected Projects List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
                Affected Projects ({selectedIds.size}/{projects.length} selected)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  disabled={processing || projects.length === 0}
                  className="text-[10px] font-mono uppercase tracking-wider text-neutral-300 hover:text-white underline cursor-pointer disabled:opacity-50"
                >
                  Select All
                </button>
                <span className="text-neutral-600 font-mono">•</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  disabled={processing || selectedIds.size === 0}
                  className="text-[10px] font-mono uppercase tracking-wider text-neutral-300 hover:text-white underline cursor-pointer disabled:opacity-50"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {loadingProjects ? (
              <div className="p-6 text-center bg-black/40 border border-white/[0.06] text-neutral-500 font-mono text-xs">
                Loading assigned projects...
              </div>
            ) : projects.length === 0 ? (
              <div className="p-4 text-center bg-black/40 border border-white/[0.06] text-emerald-400 font-mono text-xs">
                No projects currently reference this category. It can now be safely deleted.
              </div>
            ) : (
              <div className="max-h-44 overflow-y-auto divide-y divide-white/[0.04] border border-white/10 bg-black/50">
                {projects.map((project) => {
                  const isChecked = selectedIds.has(project.id);
                  return (
                    <label
                      key={project.id}
                      className="flex items-center gap-3 p-2.5 sm:px-3 hover:bg-white/[0.03] cursor-pointer transition-colors select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectProject(project.id)}
                        disabled={processing}
                        className="w-3.5 h-3.5 rounded-none border-white/20 bg-black/60 text-brand-red accent-brand-red cursor-pointer"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-white tracking-tight truncate block text-[11px] sm:text-xs">
                          {project.title}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500 block truncate">
                          {project.contentType}
                          {project.duration ? ` • ${project.duration}` : ""}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Workflow Tabs */}
          {projects.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab("MOVE")}
                  className={`py-2 px-4 text-[11px] font-mono font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                    activeTab === "MOVE"
                      ? "border-brand-red text-white bg-white/[0.02]"
                      : "border-transparent text-neutral-400 hover:text-white"
                  }`}
                >
                  Option A: Move Projects
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("DELETE")}
                  className={`py-2 px-4 text-[11px] font-mono font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                    activeTab === "DELETE"
                      ? "border-brand-red text-white bg-white/[0.02]"
                      : "border-transparent text-neutral-400 hover:text-white"
                  }`}
                >
                  Option B: Delete Projects
                </button>
              </div>

              {/* OPTION A: MOVE PROJECTS */}
              {activeTab === "MOVE" && (
                <div className="p-4 bg-black/40 border border-white/10 space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5 font-bold">
                      Destination {typeLabel} Category:
                    </label>

                    {destinationCategories.length === 0 ? (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-mono">
                        No other active {typeLabel.toLowerCase()} categories exist. You must create or activate another category first to move projects.
                      </div>
                    ) : (
                      <select
                        value={destinationId}
                        onChange={(e) => setDestinationId(e.target.value)}
                        disabled={processing}
                        className="bg-black/60 border border-white/15 focus:border-brand-red rounded-none px-3 py-2 text-xs text-white outline-none w-full font-mono cursor-pointer"
                      >
                        {destinationCategories.map((dest) => (
                          <option key={dest.id} value={dest.id} className="bg-[#121212] text-white">
                            {dest.name} (#{dest.displayOrder ?? 0})
                          </option>
                        ))}
                      </select>
                    )}
                    <span className="text-[10px] font-mono text-neutral-500 mt-1 block">
                      Moving projects preserves videos, images, durations, descriptions, and Cloudinary assets.
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
                    <span className="text-[10px] font-mono text-neutral-400">
                      {selectedIds.size === projects.length
                        ? "All projects selected — category will be deleted after move."
                        : `${projects.length - selectedIds.size} project(s) will remain in this category.`}
                    </span>

                    <button
                      type="button"
                      onClick={handleMoveProjects}
                      disabled={
                        processing ||
                        selectedIds.size === 0 ||
                        destinationCategories.length === 0
                      }
                      className="inline-flex items-center justify-center gap-2 bg-brand-red hover:bg-[#dc2626] text-white text-[11px] font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-none border border-brand-red transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      {processing ? (
                        <span>Processing...</span>
                      ) : (
                        <span>
                          Move {selectedIds.size} Project{selectedIds.size === 1 ? "" : "s"} &amp;{" "}
                          {selectedIds.size === projects.length ? "Delete Category" : "Continue"}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* OPTION B: DELETE PROJECTS */}
              {activeTab === "DELETE" && (
                <div className="p-4 bg-black/40 border border-red-500/20 space-y-4">
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-[11px] text-red-300 space-y-1">
                    <p className="font-mono font-bold uppercase tracking-wider">
                      Destructive Action Warning
                    </p>
                    <p className="leading-relaxed">
                      Deleting selected projects permanently removes them from the database and triggers Cloudinary video cleanup. This action cannot be undone.
                    </p>
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={confirmDestructive}
                      onChange={(e) => setConfirmDestructive(e.target.checked)}
                      disabled={processing}
                      className="w-3.5 h-3.5 rounded-none border-white/20 bg-black/60 text-brand-red accent-brand-red mt-0.5 cursor-pointer"
                    />
                    <span className="text-[11px] font-mono text-neutral-300">
                      I understand that deleting {selectedIds.size} project{selectedIds.size === 1 ? "" : "s"} is permanent and cannot be undone.
                    </span>
                  </label>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
                    <span className="text-[10px] font-mono text-neutral-400">
                      {selectedIds.size === projects.length
                        ? "All projects selected — category will be deleted after projects are removed."
                        : `${projects.length - selectedIds.size} project(s) will remain in this category.`}
                    </span>

                    <button
                      type="button"
                      onClick={handleDeleteProjects}
                      disabled={processing || selectedIds.size === 0 || !confirmDestructive}
                      className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-[11px] font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-none border border-red-600 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      {processing ? (
                        <span>Deleting...</span>
                      ) : (
                        <span>
                          Permanently Delete {selectedIds.size} Project{selectedIds.size === 1 ? "" : "s"} &amp;{" "}
                          {selectedIds.size === projects.length ? "Delete Category" : "Continue"}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Direct Deletion when no projects remain */}
          {projects.length === 0 && !loadingProjects && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={async () => {
                  setProcessing(true);
                  setError("");
                  try {
                    await deletePortfolioCategory(category.id);
                    onDeleted(category.id, `Category "${category.name}" deleted successfully.`);
                  } catch (err) {
                    setError(err.message || "Failed to delete category.");
                  } finally {
                    setProcessing(false);
                  }
                }}
                disabled={processing}
                className="bg-brand-red hover:bg-[#dc2626] text-white text-[11px] font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-none border border-brand-red cursor-pointer disabled:opacity-50"
              >
                {processing ? "Deleting Category..." : "Confirm Delete Category"}
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end p-4 border-t border-white/[0.08] bg-[#121212] shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="px-4 py-2 text-xs font-mono uppercase text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-none cursor-pointer disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

