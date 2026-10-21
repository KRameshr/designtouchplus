"use client";

import { useState } from "react";
import { createPortfolioCategory, updatePortfolioCategory } from "@/lib/api";

function slugify(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CategoryFormModal({ category, categoryType, onClose, onSaved }) {
  const isEditing = Boolean(category?.id);
  const targetType = category?.categoryType || categoryType || "VIDEO_EDITING";

  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [displayOrder, setDisplayOrder] = useState(category?.displayOrder ?? 0);
  const [isActive, setIsActive] = useState(category ? Boolean(category.isActive) : true);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditing);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!slugManuallyEdited) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (e) => {
    setSlugManuallyEdited(true);
    setSlug(slugify(e.target.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      name: name.trim(),
      slug: (slug.trim() || slugify(name.trim())),
      categoryType: targetType,
      displayOrder: Number(displayOrder) || 0,
      isActive: Boolean(isActive),
    };

    try {
      if (isEditing) {
        await updatePortfolioCategory(category.id, payload);
      } else {
        await createPortfolioCategory(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const typeLabel =
    targetType === "VIDEO_EDITING" ? "Video Editing" : "Thumbnail Design";

  const inputClasses =
    "bg-black/60 border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-colors w-full min-w-0 font-sans";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0e0e0e] border border-white/15 rounded-none w-full max-w-md shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] bg-[#121212]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0" aria-hidden="true" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-white font-mono">
              {isEditing ? `Edit ${typeLabel} Category` : `New ${typeLabel} Category`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white bg-transparent border border-transparent hover:border-white/10 rounded-none cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 2L10 10M10 2L2 10" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-none px-3.5 py-2.5">
              <span className="w-1.5 h-1.5 bg-brand-red rounded-none shrink-0 mt-1" />
              <span className="break-words min-w-0">{error}</span>
            </div>
          )}

          {/* Locked Category Type Indicator */}
          <div className="p-3 bg-black/40 border border-white/[0.06] flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
              System Scope
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-white/[0.06] text-brand-red border border-brand-red/30">
              {typeLabel}
            </span>
          </div>

          <div>
            <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
              Category Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              required
              placeholder={targetType === "VIDEO_EDITING" ? "e.g. Podcast, Gaming, 3D CGI" : "e.g. Crypto Content, Vlog, Gaming"}
              className={inputClasses}
            />
          </div>

          <div>
            <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
              Slug (URL / Filter Identifier)
            </label>
            <input
              type="text"
              value={slug}
              onChange={handleSlugChange}
              placeholder="e.g. creator-podcast"
              className={inputClasses}
            />
            <span className="text-[9px] font-mono text-neutral-500 mt-1 block">
              Auto-generated from name. Used for public filter matching.
            </span>
          </div>

          <div>
            <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
              Display Order
            </label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className={inputClasses}
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded-none accent-brand-red bg-black/60 border-white/20"
              />
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-300">
                Active (Visible in public filters &amp; project dropdowns)
              </span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white bg-transparent border border-white/10 hover:border-white/25 rounded-none cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-brand-red hover:bg-[#dc2626] text-white border border-brand-red rounded-none cursor-pointer transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

