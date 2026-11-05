"use client";

import { useState, useRef } from "react";
import { X, Upload, Trash2, RefreshCw, Loader2, Check, Star } from "lucide-react";
import { adminFetch } from "@/lib/auth";
import { uploadClientLogo } from "@/lib/api";
import { AdminButton, AdminInput } from "@/components/admin/AdminUI";

const EMPTY_FORM = {
  clientName: "",
  logoUrl: "",
  websiteUrl: "",
  displayOrder: 0,
  isActive: true,
  isFeatured: true,
};

const MAX_LOGO_SIZE = 10 * 1024 * 1024; // 10 MB limit matching backend
const VALID_LOGO_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "svg"];
const VALID_LOGO_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

const ClientForm = ({ client, onClose, onSaved }) => {
  const [form, setForm] = useState(
    client
      ? {
          ...EMPTY_FORM,
          ...client,
          isActive: client.isActive !== undefined ? Boolean(client.isActive) : true,
          isFeatured: client.isFeatured !== undefined ? Boolean(client.isFeatured) : true,
        }
      : EMPTY_FORM
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogoFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setUploadSuccess("");

    // Validate size (max 10 MB)
    if (file.size > MAX_LOGO_SIZE) {
      setUploadError("File size exceeds 10 MB limit. Please select a smaller logo.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate extension & MIME type
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!VALID_LOGO_EXTENSIONS.includes(extension) && !VALID_LOGO_MIMES.includes(file.type)) {
      setUploadError("Invalid file type. Supported formats: JPG, JPEG, PNG, WebP, SVG.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const res = await uploadClientLogo(file);
      const url = res.secureUrl || res.url;
      if (!url) {
        throw new Error("No image URL returned by media service.");
      }
      setForm((prev) => ({
        ...prev,
        logoUrl: url,
      }));
      setPreviewError(false);
      setUploadSuccess("Logo uploaded successfully.");
    } catch (err) {
      setUploadError(err.message || "Failed to upload logo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveLogo = () => {
    setForm((prev) => ({
      ...prev,
      logoUrl: "",
    }));
    setPreviewError(false);
    setUploadError("");
    setUploadSuccess("Logo removed.");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.clientName?.trim()) {
      setError("Client name is required.");
      return;
    }

    if (!form.logoUrl?.trim()) {
      setError("Please upload a client logo or provide a valid logo URL.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        clientName: form.clientName.trim(),
        logoUrl: form.logoUrl.trim(),
        websiteUrl: form.websiteUrl ? form.websiteUrl.trim() : null,
        displayOrder: Number(form.displayOrder) || 0,
        isActive: Boolean(form.isActive),
        isFeatured: Boolean(form.isFeatured),
      };

      if (client) {
        await adminFetch(`/api/clients/${client.id}`, { method: "PUT", body: payload });
      } else {
        await adminFetch("/api/clients", { method: "POST", body: payload });
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
      <div className="bg-[#111] border border-white/10 rounded-none w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-sm font-black uppercase text-white tracking-wider font-display">
            {client ? "Edit Client" : "New Client"}
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
          {/* Client Logo Upload & Preview Field */}
          <div className="bg-white/[0.02] border border-white/10 rounded-none p-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">
              Client Logo *
            </label>

            {/* Logo Preview Container */}
            <div className="h-24 w-full bg-black/50 border border-white/15 rounded-none p-3 flex items-center justify-center relative mb-3 overflow-hidden">
              {form.logoUrl && !previewError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.logoUrl}
                  alt={form.clientName || "Client logo preview"}
                  onError={() => setPreviewError(true)}
                  className="max-h-16 max-w-[85%] object-contain"
                />
              ) : form.clientName ? (
                <span className="text-xs font-mono font-bold tracking-widest text-white/70 uppercase">
                  {form.clientName}
                </span>
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-500">
                  <Upload className="w-5 h-5 text-gray-500" />
                  <span className="text-[11px]">No logo selected</span>
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml,.svg"
                onChange={handleLogoFileSelect}
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
                  ) : form.logoUrl ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Replace Logo</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Logo</span>
                    </>
                  )}
                </button>

                {form.logoUrl && (
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={handleRemoveLogo}
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

              <p className="text-[11px] text-gray-500 mt-2 font-mono">
                JPG, JPEG, PNG, WebP, SVG. Max 10 MB.
              </p>

              {uploadError && (
                <p className="text-xs text-red-400 mt-2">{uploadError}</p>
              )}
              {uploadSuccess && (
                <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                  <Check className="w-3 h-3" /> {uploadSuccess}
                </p>
              )}
            </div>

            {/* Direct URL input */}
            {showUrlInput && (
              <div className="mt-3 pt-3 border-t border-white/[0.06]">
                <label className="block text-[10px] uppercase font-mono text-gray-400 mb-1">
                  Or Direct Logo URL
                </label>
                <AdminInput
                  name="logoUrl"
                  value={form.logoUrl || ""}
                  onChange={handleChange}
                  placeholder="https://res.cloudinary.com/..."
                  className="text-xs"
                />
              </div>
            )}
          </div>

          {/* Client Name */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Client Name *
            </label>
            <AdminInput
              name="clientName"
              value={form.clientName}
              onChange={handleChange}
              required
              placeholder="e.g. Groww, boAt, Syska"
            />
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Website URL (optional)
            </label>
            <AdminInput
              name="websiteUrl"
              value={form.websiteUrl || ""}
              onChange={handleChange}
              placeholder="https://client-website.com"
            />
          </div>

          {/* Display Order */}
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

          {/* Featured Client Option */}
          <div className="bg-white/[0.02] border border-white/10 rounded-none p-3.5 flex flex-col gap-2.5">
            <label className="flex items-center gap-2.5 text-xs text-gray-200 cursor-pointer select-none">
              <input
                type="checkbox"
                name="isFeatured"
                checked={Boolean(form.isFeatured)}
                onChange={handleChange}
                className="accent-brand-red rounded-none cursor-pointer w-4 h-4"
              />
              <span className="font-bold flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-brand-red fill-brand-red" />
                Featured Client
              </span>
            </label>
            <p className="text-[11px] text-gray-500 pl-6.5">
              Showcase this client in the homepage Trusted Partners section.
            </p>

            <div className="pt-2 border-t border-white/[0.06]">
              <label className="flex items-center gap-2.5 text-xs text-gray-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={Boolean(form.isActive)}
                  onChange={handleChange}
                  className="accent-brand-red rounded-none cursor-pointer w-4 h-4"
                />
                <span className="font-semibold">
                  Active (visible on website)
                </span>
              </label>
            </div>
          </div>

          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}

          <div className="flex gap-3 mt-2 pt-3 border-t border-white/10">
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
              {saving ? "Saving..." : client ? "Save Changes" : "Create Client"}
            </AdminButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;
