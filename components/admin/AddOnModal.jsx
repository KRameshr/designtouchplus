"use client";

import { useState, useRef } from "react";
import { X, Upload, Trash2, RefreshCw, Check, Loader2 } from "lucide-react";
import { createAddOn, updateAddOn, uploadAddOnIcon } from "@/lib/api";

const ICON_OPTIONS = [
  { key: "clock", label: "Clock (Minutes / Duration)" },
  { key: "image", label: "Image / Thumbnail" },
  { key: "captions", label: "Captions / Subtitles" },
  { key: "zap", label: "Lightning (Rush Delivery)" },
  { key: "pen", label: "Pen (Script Writing)" },
  { key: "plus", label: "Plus (General Extra)" },
];

export default function AddOnModal({ addOn, onClose, onSaved }) {
  const isEditing = Boolean(addOn?.id);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: addOn?.name || "",
    priceLabel: addOn?.priceLabel || "+₹",
    icon: addOn?.icon || "clock",
    customIconUrl: addOn?.customIconUrl || "",
    customIconPublicId: addOn?.customIconPublicId || "",
    displayOrder: addOn?.displayOrder !== undefined ? addOn.displayOrder : 0,
    isActive: addOn?.isActive !== undefined ? Boolean(addOn.isActive) : true,
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleIconFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setUploadSuccess("");

    // Validate size (max 2 MB = 2 * 1024 * 1024 bytes)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError("File size exceeds 2 MB limit. Please select a smaller icon.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate type: PNG, SVG, WebP, JPG / JPEG
    const validExtensions = ["png", "svg", "webp", "jpg", "jpeg"];
    const extension = file.name.split(".").pop()?.toLowerCase();
    const validMimes = ["image/png", "image/svg+xml", "image/webp", "image/jpeg"];

    if (!validExtensions.includes(extension) && !validMimes.includes(file.type)) {
      setUploadError("Invalid file type. Supported formats: PNG, SVG, WebP, JPG.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const res = await uploadAddOnIcon(file);
      const url = res.secureUrl || res.url;
      const publicId = res.publicId || null;
      setForm((prev) => ({
        ...prev,
        customIconUrl: url,
        customIconPublicId: publicId,
      }));
      setUploadSuccess("Custom icon uploaded successfully.");
    } catch (err) {
      setUploadError(err.message || "Failed to upload custom icon.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveIcon = () => {
    setForm((prev) => ({
      ...prev,
      customIconUrl: "",
      customIconPublicId: "",
    }));
    setUploadError("");
    setUploadSuccess("Custom icon removed. Restored preset icon fallback.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        name: form.name.trim(),
        priceLabel: form.priceLabel.trim(),
        icon: form.icon.trim() || null,
        customIconUrl: form.customIconUrl ? form.customIconUrl.trim() : null,
        customIconPublicId: form.customIconPublicId ? form.customIconPublicId.trim() : null,
        displayOrder: Number(form.displayOrder) || 0,
        isActive: Boolean(form.isActive),
      };

      if (isEditing) {
        await updateAddOn(addOn.id, payload);
      } else {
        await createAddOn(payload);
      }

      onSaved();
    } catch (err) {
      setError(err.message || "Failed to save add-on.");
    } finally {
      setSaving(false);
    }
  };

  const inputClasses =
    "bg-white/[0.04] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2.5 text-xs font-mono text-white placeholder-neutral-500 outline-none transition-colors w-full";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-white/15 rounded-none w-full max-w-lg max-h-[92vh] overflow-y-auto p-6 relative shadow-2xl">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div>
            <h2 className="text-sm font-display font-black uppercase tracking-wider text-white">
              {isEditing ? "Edit Add-On" : "New Add-On"}
            </h2>
            <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
              Configure optional project add-on service, custom icon, and pricing tag.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
              Add-On Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Additional Minute, Thumbnail Design"
              required
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
              Price Label *
            </label>
            <input
              type="text"
              name="priceLabel"
              value={form.priceLabel}
              onChange={handleChange}
              placeholder="e.g. +₹300/min or +₹500 or +₹1,000"
              required
              className={inputClasses}
            />
          </div>

          {/* Custom Icon Upload Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                Custom Icon <span className="text-neutral-500 font-normal">(Optional)</span>
              </label>
              <span className="text-[10px] font-mono text-neutral-500">
                PNG, SVG, WebP, JPG (max 2 MB)
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.svg,.webp,.jpg,.jpeg,image/png,image/svg+xml,image/webp,image/jpeg"
              onChange={handleIconFileSelect}
              className="hidden"
            />

            {form.customIconUrl ? (
              <div className="p-3 bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center shrink-0 p-1.5 overflow-hidden">
                    <img
                      src={form.customIconUrl}
                      alt="Custom icon preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-mono text-white block truncate">
                      Custom Icon Active
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 block truncate">
                      Displayed on public Pricing page
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 text-[11px] font-mono uppercase text-neutral-200 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${uploading ? "animate-spin" : ""}`} />
                    <span>Replace</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveIcon}
                    disabled={uploading}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-[11px] font-mono uppercase text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`border border-dashed border-white/15 p-4 text-center cursor-pointer hover:border-brand-red/50 hover:bg-white/[0.02] transition-colors ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <div className="flex flex-col items-center gap-1.5">
                  {uploading ? (
                    <Loader2 className="w-5 h-5 text-brand-red animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5 text-neutral-400" />
                  )}
                  <span className="text-xs font-mono text-neutral-300">
                    {uploading ? "Uploading icon to Cloudinary..." : "Click to select and upload custom icon"}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">
                    Falls back to the preset selected below if no custom icon is uploaded
                  </span>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-mono">
                {uploadError}
              </div>
            )}

            {uploadSuccess && (
              <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                Icon Preset (Fallback)
              </label>
              <select
                name="icon"
                value={form.icon}
                onChange={handleChange}
                className={inputClasses}
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key} className="bg-[#111]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                name="displayOrder"
                value={form.displayOrder}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-neutral-300">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="rounded-none border-white/20 bg-white/[0.04] text-brand-red focus:ring-brand-red"
              />
              Active (Visible on public Pricing page)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={saving || uploading}
              className="px-4 py-2 border border-white/15 text-xs font-mono uppercase tracking-wider text-neutral-300 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-5 py-2 bg-brand-red text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : isEditing ? "Save Add-On" : "Create Add-On"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

