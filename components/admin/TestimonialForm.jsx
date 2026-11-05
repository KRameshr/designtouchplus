"use client";

import { useState, useRef } from "react";
import { X, Upload, Trash2, RefreshCw, Loader2, User, Check } from "lucide-react";
import { adminFetch } from "@/lib/auth";
import { uploadTestimonialAvatar } from "@/lib/api";
import {
  AdminButton,
  AdminInput,
  AdminTextarea,
} from "@/components/admin/AdminUI";

export const SERVICE_TYPES = [
  "Video Editing",
  "YouTube Thumbnail Design",
  "Motion Graphics",
  "Instagram Reels",
  "Commercial Video Production",
  "Social Media Content",
  "YouTube Management",
  "Branding & Design",
  "Other",
];

const EMPTY_FORM = {
  quote: "",
  authorName: "",
  authorRole: "",
  authorCompany: "",
  authorAvatarUrl: "",
  serviceType: "Video Editing",
  rating: 5,
  displayOrder: 0,
  isActive: true,
};

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 MB
const VALID_AVATAR_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const VALID_AVATAR_MIMES = ["image/jpeg", "image/png", "image/webp"];

const TestimonialForm = ({ testimonial, onClose, onSaved }) => {
  const [form, setForm] = useState(
    testimonial
      ? {
          ...EMPTY_FORM,
          ...testimonial,
          serviceType: testimonial.serviceType || "Video Editing",
        }
      : EMPTY_FORM
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setUploadSuccess("");

    // Validate file size (max 5 MB)
    if (file.size > MAX_AVATAR_SIZE) {
      setUploadError("File size exceeds 5 MB limit. Please select a smaller image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate format (JPG, JPEG, PNG, WebP)
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!VALID_AVATAR_EXTENSIONS.includes(extension) && !VALID_AVATAR_MIMES.includes(file.type)) {
      setUploadError("Invalid file type. Supported formats: JPG, JPEG, PNG, WebP.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const res = await uploadTestimonialAvatar(file);
      const url = res.secureUrl || res.url;
      if (!url) {
        throw new Error("No image URL returned by media service.");
      }
      setForm((prev) => ({
        ...prev,
        authorAvatarUrl: url,
      }));
      setUploadSuccess("Profile photo uploaded successfully.");
    } catch (err) {
      setUploadError(err.message || "Failed to upload profile photo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = () => {
    setForm((prev) => ({
      ...prev,
      authorAvatarUrl: "",
    }));
    setUploadError("");
    setUploadSuccess("Profile photo removed. Initial placeholder will be shown.");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        authorName: form.authorName.trim(),
        authorRole: form.authorRole ? form.authorRole.trim() : null,
        authorCompany: form.authorCompany ? form.authorCompany.trim() : null,
        authorAvatarUrl: form.authorAvatarUrl ? form.authorAvatarUrl.trim() : null,
        serviceType: form.serviceType ? form.serviceType.trim() : "General Feedback",
        quote: form.quote.trim(),
        rating: form.rating ? Number(form.rating) : null,
        displayOrder: Number(form.displayOrder) || 0,
        isActive: Boolean(form.isActive),
      };
      if (testimonial) {
        await adminFetch(`/api/testimonials/${testimonial.id}`, { method: "PUT", body: payload });
      } else {
        await adminFetch("/api/testimonials", { method: "POST", body: payload });
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-[#111] border border-white/10 rounded-none w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-sm font-black uppercase text-white tracking-wider font-display">
            {testimonial ? "Edit Testimonial" : "New Testimonial"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white bg-transparent border-none cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Profile Photo Upload Field */}
          <div className="bg-white/[0.02] border border-white/10 rounded-none p-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">
              Client Profile Photo
            </label>
            <div className="flex items-center gap-4">
              {/* Profile avatar preview with sharp rectangular edges via !rounded-none */}
              <div className="w-16 h-16 rounded-full !rounded-none border border-white/15 overflow-hidden bg-white/[0.05] shrink-0 flex items-center justify-center">
                {form.authorAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.authorAvatarUrl}
                    alt={form.authorName || "Avatar preview"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-brand-red/15 text-brand-red font-bold flex items-center justify-center text-lg">
                    {form.authorName ? (
                      form.authorName.charAt(0).toUpperCase()
                    ) : (
                      <User className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 min-w-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarFileSelect}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-60 text-white rounded-none text-xs font-semibold cursor-pointer transition-colors border border-white/10"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-red" />
                        <span>Uploading...</span>
                      </>
                    ) : form.authorAvatarUrl ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Replace Photo</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                      </>
                    )}
                  </button>

                  {form.authorAvatarUrl && (
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={handleRemoveAvatar}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-none text-xs font-semibold cursor-pointer transition-colors border border-red-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowUrlInput((v) => !v)}
                    className="text-[11px] text-gray-400 hover:text-white underline bg-transparent border-none cursor-pointer ml-auto"
                  >
                    {showUrlInput ? "Hide URL" : "Edit URL"}
                  </button>
                </div>

                <p className="text-[11px] text-gray-500 mt-1.5 font-mono">
                  JPG, JPEG, PNG, or WebP. Max 5 MB.
                </p>

                {uploadError && (
                  <p className="text-xs text-red-400 mt-1.5">{uploadError}</p>
                )}
                {uploadSuccess && (
                  <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1">
                    <Check className="w-3 h-3" /> {uploadSuccess}
                  </p>
                )}
              </div>
            </div>

            {/* Direct URL input fallback */}
            {showUrlInput && (
              <div className="mt-3 pt-3 border-t border-white/[0.06]">
                <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1">
                  Or Direct Image URL
                </label>
                <AdminInput
                  name="authorAvatarUrl"
                  value={form.authorAvatarUrl || ""}
                  onChange={handleChange}
                  placeholder="https://res.cloudinary.com/..."
                  className="text-xs"
                />
              </div>
            )}
          </div>

          {/* Testimonial Quote */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Testimonial Quote *
            </label>
            <AdminTextarea
              name="quote"
              value={form.quote}
              onChange={handleChange}
              required
              rows={3}
              placeholder="What did the client say about your work?"
              className="resize-none"
            />
          </div>

          {/* Client Name */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Client Name *
            </label>
            <AdminInput
              name="authorName"
              value={form.authorName}
              onChange={handleChange}
              required
              placeholder="e.g. Alex Morgan"
            />
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Service Type *
            </label>
            <select
              name="serviceType"
              value={form.serviceType || "Video Editing"}
              onChange={handleChange}
              required
              className="w-full bg-[#0a0a0a] border border-white/10 focus:border-brand-red text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-none outline-none transition-colors font-sans cursor-pointer"
            >
              {SERVICE_TYPES.map((type) => (
                <option key={type} value={type} className="bg-[#1a1a1a]">
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Role & Company */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Designation / Role
              </label>
              <AdminInput
                name="authorRole"
                value={form.authorRole || ""}
                onChange={handleChange}
                placeholder="e.g. Content Creator"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Company Name
              </label>
              <AdminInput
                name="authorCompany"
                value={form.authorCompany || ""}
                onChange={handleChange}
                placeholder="e.g. Acme Media"
              />
            </div>
          </div>

          {/* Rating & Display Order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Star Rating
              </label>
              <select
                name="rating"
                value={form.rating || 5}
                onChange={handleChange}
                className="w-full bg-[#0a0a0a] border border-white/10 focus:border-brand-red text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-none outline-none transition-colors font-sans cursor-pointer"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r} className="bg-[#1a1a1a]">
                    {r} {r === 1 ? "Star" : "Stars"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Display Order
              </label>
              <AdminInput
                type="number"
                name="displayOrder"
                value={form.displayOrder ?? 0}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
          </div>

          {/* Active status */}
          <label className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              name="isActive"
              checked={Boolean(form.isActive)}
              onChange={handleChange}
              className="accent-brand-red rounded-none cursor-pointer w-4 h-4"
            />
            <span>Active (visible on website)</span>
          </label>

          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}

          <div className="flex gap-3 mt-3 pt-3 border-t border-white/10">
            <AdminButton
              variant="secondary"
              onClick={onClose}
              className="flex-1 py-3"
            >
              Cancel
            </AdminButton>
            <AdminButton
              variant="primary"
              type="submit"
              disabled={saving || uploading}
              className="flex-1 py-3"
            >
              {saving ? "Saving..." : "Save Testimonial"}
            </AdminButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestimonialForm;
