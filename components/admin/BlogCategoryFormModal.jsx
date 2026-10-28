"use client";

import { useState } from "react";
import { X as XIcon, Loader2 } from "lucide-react";
import { createBlogCategory, updateBlogCategory } from "@/lib/api";

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

export default function BlogCategoryFormModal({ category, onClose, onSaved }) {
  const isEditing = Boolean(category?.id);

  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [description, setDescription] = useState(category?.description || "");
  const [displayOrder, setDisplayOrder] = useState(category?.displayOrder ?? 0);
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
      slug: slug.trim() || slugify(name.trim()),
      description: description.trim() || null,
      displayOrder: Number(displayOrder) || 0,
    };

    try {
      if (isEditing) {
        await updateBlogCategory(category.id, payload);
      } else {
        await createBlogCategory(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const inputClasses =
    "bg-black/60 border border-white/10 focus:border-brand-red rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-colors w-full min-w-0 font-sans";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
      <div className="bg-[#0e0e0e] border border-white/15 rounded-xl w-full max-w-md shadow-2xl my-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] bg-[#121212]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-brand-red rounded-full inline-block shrink-0" aria-hidden="true" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-white font-mono">
              {isEditing ? "Edit Blog Category" : "New Blog Category"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white bg-transparent border border-transparent hover:border-white/10 rounded-lg cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/25 rounded-lg px-3.5 py-2.5">
              <span className="w-1.5 h-1.5 bg-brand-red rounded-full shrink-0 mt-1" />
              <span className="break-words min-w-0">{error}</span>
            </div>
          )}

          <div>
            <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
              Category Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              required
              placeholder="e.g. Video Editing, Motion Graphics, AI Workflows"
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
              placeholder="e.g. video-editing"
              className={inputClasses}
            />
            <span className="text-[9px] font-mono text-neutral-500 mt-1 block">
              Used in public blog URLs (`/blog?category=...`) and routing.
            </span>
          </div>

          <div>
            <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description for editorial context or SEO..."
              className={inputClasses}
            />
          </div>

          <div>
            <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
              Display Order
            </label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              min={0}
              className={inputClasses}
            />
            <span className="text-[9px] font-mono text-neutral-500 mt-1 block">
              Controls the sort order in filter tabs and sidebars (lower values appear first).
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer border-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg border-none cursor-pointer transition-colors shadow-[0_4px_15px_rgba(239,68,68,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isEditing ? "Save Changes" : "Create Category"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

