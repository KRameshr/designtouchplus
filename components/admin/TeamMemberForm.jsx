"use client";

import { useState, useRef, useEffect } from "react";
import { X, Upload, Trash2, RefreshCw, Loader2, User, Check } from "lucide-react";
import { adminFetch } from "@/lib/auth";
import { uploadPortfolioImage } from "@/lib/api";
import { isValidSocialUrl } from "@/lib/socialUtils";

const EMPTY_FORM = {
  name: "",
  role: "",
  photoUrl: "",
  linkedinUrl: "",
  instagramUrl: "",
  displayOrder: 0,
  isActive: true,
};

const mapMemberToForm = (m) => {
  if (!m) return EMPTY_FORM;
  return {
    name: m.name || "",
    role: m.role || "",
    photoUrl: m.photoUrl || m.photo_url || "",
    linkedinUrl: m.linkedinUrl || m.linkedin_url || "",
    instagramUrl: m.instagramUrl || m.instagram_url || "",
    displayOrder: m.displayOrder ?? m.display_order ?? 0,
    isActive: m.isActive ?? m.is_active ?? true,
  };
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const VALID_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const VALID_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"];

const TeamMemberForm = ({ member, onClose, onSaved }) => {
  const [form, setForm] = useState(mapMemberToForm(member));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    setForm(mapMemberToForm(member));
    setError("");
    setUploadError("");
    setUploadSuccess("");
  }, [member]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateFile = (file) => {
    if (!file) return "No file selected.";
    if (file.size > MAX_IMAGE_SIZE) {
      return "Profile image must be less than 5 MB.";
    }
    const ext = file.name ? file.name.split(".").pop().toLowerCase() : "";
    const mime = file.type ? file.type.toLowerCase() : "";
    const extOk = VALID_IMAGE_EXTENSIONS.includes(ext);
    const mimeOk = VALID_IMAGE_MIMES.includes(mime);
    if (!extOk && !mimeOk) {
      return "Invalid file format. Allowed formats: JPG, PNG, WebP.";
    }
    return null;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setUploadSuccess("");

    const validationMsg = validateFile(file);
    if (validationMsg) {
      setUploadError(validationMsg);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const res = await uploadPortfolioImage(file, "designtouch/team");
      const url = res?.secure_url || res?.url;
      if (!url) throw new Error("Upload did not return an image URL.");
      setForm((prev) => ({ ...prev, photoUrl: url }));
      setUploadSuccess("Photo uploaded successfully.");
    } catch (err) {
      setUploadError(err.message || "Failed to upload photo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = () => {
    setForm((prev) => ({ ...prev, photoUrl: "" }));
    setUploadError("");
    setUploadSuccess("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateSocialUrl = (url, type) => {
    if (!url || !url.trim()) return null; // Empty is allowed (clearing the URL)
    if (!isValidSocialUrl(url, type)) {
      return type === "linkedin"
        ? "Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/username)."
        : "Please enter a valid Instagram URL (e.g., https://instagram.com/username).";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const linkedinError = validateSocialUrl(form.linkedinUrl, "linkedin");
    if (linkedinError) {
      setError(linkedinError);
      return;
    }

    const instagramError = validateSocialUrl(form.instagramUrl, "instagram");
    if (instagramError) {
      setError(instagramError);
      return;
    }

    setSaving(true);
    try {
      const rawLinkedin = (form.linkedinUrl || "").trim();
      const rawInstagram = (form.instagramUrl || "").trim();

      const payload = {
        name: form.name.trim(),
        role: form.role.trim(),
        photoUrl: (form.photoUrl || "").trim(),
        linkedinUrl: rawLinkedin ? (rawLinkedin.startsWith("http") ? rawLinkedin : `https://${rawLinkedin}`) : "",
        instagramUrl: rawInstagram ? (rawInstagram.startsWith("http") ? rawInstagram : `https://${rawInstagram}`) : "",
        displayOrder: Number(form.displayOrder) || 0,
        isActive: Boolean(form.isActive),
      };
      if (member) {
        await adminFetch(`/api/team/${member.id}`, { method: "PUT", body: payload });
      } else {
        await adminFetch("/api/team", { method: "POST", body: payload });
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Failed to save team member.");
    } finally {
      setSaving(false);
    }
  };

  const inputClasses =
    "bg-white/[0.04] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2.5 text-xs font-mono text-white placeholder-neutral-500 outline-none transition-colors w-full";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-white/15 rounded-none w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
          <div>
            <h2 className="text-sm font-display font-black uppercase tracking-wider text-white">
              {member ? "Edit Team Member" : "New Team Member"}
            </h2>
            <p className="text-[10px] font-mono text-neutral-400">
              Manage member details displayed on public About page
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-none bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border-none"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Photo Upload & Preview Section */}
          <div className="p-4 bg-white/[0.02] border border-white/[0.08]">
            <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300 mb-2.5">
              Member Photo
            </span>

            <div className="flex items-center gap-4">
              <div className="w-16 h-20 rounded-none bg-neutral-900 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden relative">
                {form.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.photoUrl}
                    alt={form.name || "Preview"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-neutral-600" />
                )}
              </div>

              <div className="flex-1 flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer border border-white/10"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-red" />
                        <span>Uploading...</span>
                      </>
                    ) : form.photoUrl ? (
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

                  {form.photoUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={uploading}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 text-[11px] font-mono uppercase transition-colors cursor-pointer border border-white/10"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowUrlInput((prev) => !prev)}
                    className="text-[10px] font-mono text-neutral-400 hover:text-white underline cursor-pointer bg-transparent border-none p-0 ml-auto"
                  >
                    {showUrlInput ? "Hide Direct URL" : "Enter Direct URL"}
                  </button>
                </div>

                <p className="text-[10px] font-mono text-neutral-500">
                  Recommended: 3:4 portrait ratio (JPG, PNG, WebP up to 5 MB)
                </p>

                {uploadError && (
                  <p className="text-[11px] font-mono text-red-400">{uploadError}</p>
                )}
                {uploadSuccess && (
                  <p className="text-[11px] font-mono text-green-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> {uploadSuccess}
                  </p>
                )}
              </div>
            </div>

            {showUrlInput && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <input
                  name="photoUrl"
                  value={form.photoUrl || ""}
                  onChange={handleChange}
                  placeholder="https://example.com/photo.jpg"
                  className={inputClasses}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Full Name *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. Rohit Sharma"
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Role / Designation *
            </label>
            <input
              name="role"
              value={form.role}
              onChange={handleChange}
              required
              placeholder="e.g. Founder & Creative Director"
              className={inputClasses}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                LinkedIn Profile URL
              </label>
              <input
                name="linkedinUrl"
                value={form.linkedinUrl || ""}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Instagram Profile URL
              </label>
              <input
                name="instagramUrl"
                value={form.instagramUrl || ""}
                onChange={handleChange}
                placeholder="https://instagram.com/username"
                className={inputClasses}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Display Order
              </label>
              <input
                type="number"
                name="displayOrder"
                value={form.displayOrder}
                onChange={handleChange}
                placeholder="1, 2, 3..."
                className={inputClasses}
              />
            </div>

            <div className="pt-4 sm:pt-5">
              <label className="flex items-center gap-2.5 text-xs font-mono text-neutral-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={Boolean(form.isActive)}
                  onChange={handleChange}
                  className="w-4 h-4 rounded-none accent-[#ef4444] cursor-pointer"
                />
                <span>Active (visible on About page)</span>
              </label>
            </div>
          </div>

          {error && (
            <p className="text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 px-3.5 py-2.5">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 hover:text-white border border-white/15 hover:border-white/30 py-3 bg-transparent transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 text-xs font-mono font-bold uppercase tracking-wider text-white bg-brand-red hover:bg-[#dc2626] disabled:opacity-50 py-3 border-none transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Member</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamMemberForm;
