"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { adminFetch } from "@/lib/auth";

const CATEGORIES = ["VIDEO_EDITING", "MOTION_GRAPHICS", "CONTENT_CREATION", "YOUTUBE", "BUSINESS"];

const EMPTY_FORM = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  category: "VIDEO_EDITING",
  readingTime: "",
  isPublished: true,
};

// Auto-generates a URL-safe slug from the title, e.g. "10 Video Tips!" -> "10-video-tips"
const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

const BlogPostForm = ({ post, onClose, onSaved }) => {
  const [form, setForm] = useState(post ? { ...EMPTY_FORM, ...post } : EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updated = { ...form, [name]: type === "checkbox" ? checked : value };

    // Keep slug in sync with title until the admin manually edits the slug field
    if (name === "title" && !slugTouched) {
      updated.slug = slugify(value);
    }
    if (name === "slug") {
      setSlugTouched(true);
    }
    setForm(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        readingTime: form.readingTime ? Number(form.readingTime) : null,
      };
      if (post) {
        await adminFetch(`/api/blogs/${post.id}`, { method: "PUT", body: payload });
      } else {
        await adminFetch("/api/blogs", { method: "POST", body: payload });
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
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-sm font-black uppercase text-white">
            {post ? "Edit Blog Post" : "New Blog Post"}
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

          <div>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              required
              placeholder="url-friendly-slug"
              className={inputClasses}
            />
            <p className="text-[10px] text-gray-600 mt-1">
              Will be the URL: /blog/{form.slug || "..."}
            </p>
          </div>

          <textarea
            name="excerpt"
            value={form.excerpt || ""}
            onChange={handleChange}
            rows={2}
            placeholder="Short excerpt (shown on the blog grid card)"
            maxLength={500}
            className={`${inputClasses} resize-none`}
          />

          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            required
            rows={8}
            placeholder="Full article content (separate paragraphs with a blank line)"
            className={`${inputClasses} resize-none`}
          />

          <input
            name="coverImageUrl"
            value={form.coverImageUrl || ""}
            onChange={handleChange}
            placeholder="Cover image URL"
            className={inputClasses}
          />

          <div className="grid grid-cols-2 gap-3">
            <select name="category" value={form.category} onChange={handleChange} className={inputClasses}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace("_", " ")}</option>
              ))}
            </select>
            <input
              type="number"
              name="readingTime"
              value={form.readingTime || ""}
              onChange={handleChange}
              placeholder="Reading time (min)"
              className={inputClasses}
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              name="isPublished"
              checked={form.isPublished}
              onChange={handleChange}
            />
            Published (uncheck to save as draft)
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

export default BlogPostForm;
