"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { adminFetch } from "@/lib/auth";

const CONTENT_TYPES = ["VIDEO_EDITING", "THUMBNAIL_DESIGN"];
const CATEGORIES = ["YOUTUBE", "INSTAGRAM_REELS", "COMMERCIAL", "MOTION_GRAPHICS", "CORPORATE", "REAL_ESTATE"];

const EMPTY_FORM = {
  title: "",
  contentType: "VIDEO_EDITING",
  category: "",
  subCategory: "",
  description: "",
  duration: "",
  videoUrl: "",
  imageUrl: "",
  thumbnailUrl: "",
  displayOrder: 0,
  isFeatured: false,
};

// `item` is null for create, or an existing PortfolioItemResponse for edit.
const PortfolioForm = ({ item, onClose, onSaved }) => {
  const [form, setForm] = useState(item ? { ...EMPTY_FORM, ...item, category: item.category || "" } : EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        category: form.category || null,
        displayOrder: Number(form.displayOrder) || 0,
      };
      if (item) {
        await adminFetch(`/api/portfolio/${item.id}`, { method: "PUT", body: payload });
      } else {
        await adminFetch("/api/portfolio", { method: "POST", body: payload });
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClasses =
    "bg-white/[0.04] border border-white/10 focus:border-brand-red rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors w-full";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-sm font-black uppercase text-white">
            {item ? "Edit Portfolio Item" : "New Portfolio Item"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white bg-transparent border-none cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Title"
            className={inputClasses}
          />

          <div className="grid grid-cols-2 gap-3">
            <select name="contentType" value={form.contentType} onChange={handleChange} className={inputClasses}>
              {CONTENT_TYPES.map((c) => (
                <option key={c} value={c}>{c.replace("_", " ")}</option>
              ))}
            </select>
            <select name="category" value={form.category} onChange={handleChange} className={inputClasses}>
              <option value="">No category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace("_", " ")}</option>
              ))}
            </select>
          </div>

          <input
            name="subCategory"
            value={form.subCategory || ""}
            onChange={handleChange}
            placeholder="Sub-category (thumbnails only, e.g. 'Finance Content')"
            className={inputClasses}
          />

          <textarea
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            rows={2}
            placeholder="Description"
            className={`${inputClasses} resize-none`}
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              name="duration"
              value={form.duration || ""}
              onChange={handleChange}
              placeholder="Duration (e.g. 08:12)"
              className={inputClasses}
            />
            <input
              type="number"
              name="displayOrder"
              value={form.displayOrder}
              onChange={handleChange}
              placeholder="Display order"
              className={inputClasses}
            />
          </div>

          <input
            name="videoUrl"
            value={form.videoUrl || ""}
            onChange={handleChange}
            placeholder="Video URL (Cloudinary)"
            className={inputClasses}
          />
          <input
            name="imageUrl"
            value={form.imageUrl || ""}
            onChange={handleChange}
            placeholder="Image URL"
            className={inputClasses}
          />
          <input
            name="thumbnailUrl"
            value={form.thumbnailUrl || ""}
            onChange={handleChange}
            placeholder="Thumbnail URL"
            className={inputClasses}
          />

          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              name="isFeatured"
              checked={form.isFeatured}
              onChange={handleChange}
            />
            Show on Home page (Featured)
          </label>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-xs font-bold uppercase tracking-widest text-gray-400 border border-white/10 rounded-lg py-3 bg-transparent cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 text-xs font-bold uppercase tracking-widest text-white bg-brand-red hover:bg-red-600 disabled:opacity-60 rounded-lg py-3 border-none cursor-pointer transition-colors"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PortfolioForm;
