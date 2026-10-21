"use client";

import { useEffect, useState, useRef } from "react";
import { Save, CheckCircle2, AlertCircle, RefreshCw, Eye } from "lucide-react";
import { adminFetch } from "@/lib/auth";
import { getHeroContent, uploadVideo } from "@/lib/api";

const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB limit
const ALLOWED_EXTENSIONS = ["mp4", "webm", "mov"];
const ALLOWED_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-quicktime",
  "video/mov",
];

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function validateVideoFile(file) {
  if (!file) {
    return "Please select a video file.";
  }
  if (file.size === 0) {
    return "The selected video file is empty.";
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return "File size exceeds the maximum allowed limit of 100 MB.";
  }

  const ext = file.name ? file.name.split(".").pop().toLowerCase() : "";
  const type = file.type ? file.type.toLowerCase() : "";

  const extValid = ALLOWED_EXTENSIONS.includes(ext);
  const typeValid = type.startsWith("video/") || ALLOWED_MIME_TYPES.includes(type);

  if (!extValid && !typeValid) {
    return "Invalid video format. Allowed formats: MP4, WebM, MOV.";
  }

  return null;
}

const EMPTY_FORM = {
  eyebrow: "",
  headlineLine1: "",
  headlineLine2: "",
  headlineLine3: "",
  headlineHighlight: "",
  subheading: "",
  primaryCtaText: "",
  primaryCtaLink: "",
  secondaryCtaText: "",
  secondaryCtaLink: "",
  videoUrl: "",
  badgeText: "",
  specBadgeText: "",
};

export default function AdminHeroPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastSaved, setLastSaved] = useState("");

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  const populateForm = (data) => {
    if (!data) return;
    setForm({
      eyebrow: data.eyebrow || "",
      headlineLine1: data.headlineLine1 || "",
      headlineLine2: data.headlineLine2 || "",
      headlineLine3: data.headlineLine3 || "",
      headlineHighlight: data.headlineHighlight || "",
      subheading: data.subheading || "",
      primaryCtaText: data.primaryCtaText || "",
      primaryCtaLink: data.primaryCtaLink || "",
      secondaryCtaText: data.secondaryCtaText || "",
      secondaryCtaLink: data.secondaryCtaLink || "",
      videoUrl: data.videoUrl || "",
      badgeText: data.badgeText || "",
      specBadgeText: data.specBadgeText || "",
    });
    if (data.updatedAt) {
      setLastSaved(new Date(data.updatedAt).toLocaleString());
    }
  };

  const loadHero = async () => {
    setLoading(true);
    setError("");
    try {
      let data = null;
      try {
        data = await adminFetch("/api/hero");
      } catch (adminErr) {
        // Fallback to public endpoint if admin fetch encountered token error
        data = await getHeroContent();
      }
      populateForm(data);
    } catch (err) {
      setError(err.message || "Failed to load Hero settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHero();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateVideoFile(file);
    if (validationError) {
      setUploadError(validationError);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    setUploadError("");
    setUploadSuccess("");
  };

  const handleUploadVideo = async () => {
    if (!selectedFile || uploading) return;

    setUploading(true);
    setUploadError("");
    setUploadSuccess("");

    try {
      const result = await uploadVideo(selectedFile);
      if (result && result.url) {
        setForm((prev) => ({ ...prev, videoUrl: result.url }));
        setUploadSuccess("Video uploaded successfully! Preview below and click 'Save Changes' to persist.");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        throw new Error("No video URL returned from the server.");
      }
    } catch (err) {
      setUploadError(err.message || "Failed to upload video to Cloudinary.");
    } finally {
      setUploading(false);
    }
  };

  const handleClearSelected = () => {
    setSelectedFile(null);
    setUploadError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await adminFetch("/api/hero", {
        method: "PUT",
        body: form,
      });

      if (updated) {
        populateForm(updated);
      }
      setSuccess("Hero section settings saved and persisted successfully!");
    } catch (err) {
      setError(err.message || "Failed to save Hero settings");
    } finally {
      setSaving(false);
    }
  };

  const inputClasses =
    "bg-black/60 border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition-colors w-full min-w-0 font-sans";

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0" aria-hidden="true" />
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-400">
              Hero Management
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase font-display tracking-tight text-white">
            Homepage Hero Settings
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1">
            Configure dynamic headline typography, call-to-actions, and background media.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={loadHero}
            disabled={loading || saving}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-wider rounded-none border border-white/10 cursor-pointer transition-colors"
            title="Reload current data from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Reload</span>
          </button>
          {lastSaved && (
            <span className="text-[10px] text-neutral-500 font-mono hidden sm:inline-block">
              [{lastSaved}]
            </span>
          )}
        </div>
      </div>

      {/* Status Notifications */}
      {error && (
        <div className="flex items-start sm:items-center gap-2.5 text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-none px-4 py-3 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0 text-brand-red" />
          <span className="break-words min-w-0">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start sm:items-center gap-2.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-none px-4 py-3 mb-6">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0 text-brand-green" />
          <span className="break-words min-w-0">{success}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-none p-12 text-center text-neutral-400 text-xs font-mono uppercase tracking-widest">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-3 text-brand-red" />
          Loading Hero data from PostgreSQL...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Agency Tag & Display Headline */}
          <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-none p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-white/[0.06]">
              <h2 className="text-xs font-bold uppercase tracking-widest text-white font-display">
                01 // Agency Eyebrow &amp; Display Headline
              </h2>
              <span className="text-[10px] font-mono text-neutral-500">REQUIRED</span>
            </div>

            <div className="mb-5">
              <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-neutral-400 mb-1.5 block">
                Top Eyebrow Tag
              </label>
              <input
                name="eyebrow"
                value={form.eyebrow}
                onChange={handleChange}
                placeholder="e.g. Welcome to DesignTouch+"
                className={inputClasses}
                required
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Small agency label displayed with the red square indicator above the main title.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-neutral-400 mb-1.5 block">
                  Headline Line 1
                </label>
                <input
                  name="headlineLine1"
                  value={form.headlineLine1}
                  onChange={handleChange}
                  placeholder="e.g. We create"
                  className={inputClasses}
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-neutral-400 mb-1.5 block">
                  Headline Line 2
                </label>
                <input
                  name="headlineLine2"
                  value={form.headlineLine2}
                  onChange={handleChange}
                  placeholder="e.g. videos that"
                  className={inputClasses}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-neutral-400 mb-1.5 block">
                  Headline Line 3 Prefix
                </label>
                <input
                  name="headlineLine3"
                  value={form.headlineLine3}
                  onChange={handleChange}
                  placeholder="e.g. grow"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-neutral-400 mb-1.5 block">
                  Headline Highlight Word (Red Accent)
                </label>
                <input
                  name="headlineHighlight"
                  value={form.headlineHighlight}
                  onChange={handleChange}
                  placeholder="e.g. brands."
                  className={inputClasses}
                  required
                />
              </div>
            </div>

            {/* Headline Live Text Preview Card */}
            <div className="mt-6 p-4 sm:p-5 bg-black/60 border border-white/[0.08] rounded-none">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-3">
                <Eye className="w-3.5 h-3.5 text-brand-red" />
                <span>Live Display Headline Preview</span>
              </div>
              <div className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-white break-words">
                <div>{form.headlineLine1 || "We create"}</div>
                <div>{form.headlineLine2 || "videos that"}</div>
                <div>
                  {form.headlineLine3 || "grow"}{" "}
                  <span className="text-brand-red">{form.headlineHighlight || "brands."}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Subheading Copy */}
          <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-none p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-white/[0.06]">
              <h2 className="text-xs font-bold uppercase tracking-widest text-white font-display">
                02 // Supporting Description Copy
              </h2>
              <span className="text-[10px] font-mono text-neutral-500">EDITORIAL</span>
            </div>

            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-neutral-400 mb-1.5 block">
                Subheading Paragraph
              </label>
              <textarea
                name="subheading"
                value={form.subheading}
                onChange={handleChange}
                rows={3}
                placeholder="We help businesses and creators tell their stories through powerful video editing & creative content."
                className={`${inputClasses} resize-y min-h-[80px] leading-relaxed`}
                required
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                The supporting paragraph beneath the main title on the homepage hero.
              </p>
            </div>
          </div>

          {/* Card 3: Action Buttons */}
          <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-none p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-white/[0.06]">
              <h2 className="text-xs font-bold uppercase tracking-widest text-white font-display">
                03 // Call-to-Action (CTA) Buttons
              </h2>
              <span className="text-[10px] font-mono text-neutral-500">NAVIGATION</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-neutral-400 mb-1.5 block">
                  Primary CTA Label (Solid Red)
                </label>
                <input
                  name="primaryCtaText"
                  value={form.primaryCtaText}
                  onChange={handleChange}
                  placeholder="e.g. View Portfolio"
                  className={inputClasses}
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-neutral-400 mb-1.5 block">
                  Primary CTA Destination Link
                </label>
                <input
                  name="primaryCtaLink"
                  value={form.primaryCtaLink}
                  onChange={handleChange}
                  placeholder="e.g. /portfolio"
                  className={inputClasses}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-neutral-400 mb-1.5 block">
                  Secondary CTA Label (Outlined)
                </label>
                <input
                  name="secondaryCtaText"
                  value={form.secondaryCtaText}
                  onChange={handleChange}
                  placeholder="e.g. Book a Call"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-neutral-400 mb-1.5 block">
                  Secondary CTA Destination Link
                </label>
                <input
                  name="secondaryCtaLink"
                  value={form.secondaryCtaLink}
                  onChange={handleChange}
                  placeholder="e.g. /contact"
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          {/* Card 4: Hero Media & Badges */}
          <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-none p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-white/[0.06]">
              <h2 className="text-xs font-bold uppercase tracking-widest text-white font-display">
                04 // Hero Video Visual &amp; Specs Badges
              </h2>
              <span className="text-[10px] font-mono text-neutral-500">MEDIA</span>
            </div>

            {/* Cloudinary Video Upload Panel */}
            <div className="mb-6 p-4 sm:p-5 bg-black/60 border border-white/[0.08] rounded-none">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3.5 pb-2.5 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-red inline-block" />
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-neutral-200">
                    Cloudinary Video Upload
                  </span>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">
                  MP4, WEBM, MOV // MAX 100 MB
                </span>
              </div>

              {/* Upload Notifications */}
              {uploadError && (
                <div className="flex items-start gap-2.5 text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-none px-3.5 py-2.5 mb-4">
                  <svg className="w-4 h-4 shrink-0 text-brand-red mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" />
                    <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="break-words min-w-0">{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="flex items-start gap-2.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-none px-3.5 py-2.5 mb-4">
                  <svg className="w-4 h-4 shrink-0 text-brand-green mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                  </svg>
                  <span className="break-words min-w-0">{uploadSuccess}</span>
                </div>
              )}

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
                id="hero-video-file-input"
              />

              {/* Upload Action / Selection Area */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-50 text-white text-xs font-mono uppercase tracking-wider rounded-none border border-white/10 cursor-pointer transition-colors shrink-0"
                >
                  <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>{selectedFile ? "Change Video File" : "Choose Video"}</span>
                </button>

                {selectedFile && (
                  <div className="flex flex-1 flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 py-2 bg-white/[0.03] border border-white/10 text-xs min-w-0">
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-white text-[11px] truncate">
                        {selectedFile.name}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        {formatBytes(selectedFile.size)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleUploadVideo}
                        disabled={uploading}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-brand-red hover:bg-[#dc2626] disabled:opacity-60 text-white text-[11px] font-mono uppercase tracking-wider rounded-none border border-brand-red cursor-pointer transition-colors"
                      >
                        {uploading ? (
                          <>
                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <span>Upload Video</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleClearSelected}
                        disabled={uploading}
                        className="px-2 py-1.5 text-[11px] text-neutral-400 hover:text-white font-mono uppercase rounded-none border border-transparent hover:border-white/10 transition-colors cursor-pointer"
                        title="Cancel selection"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-neutral-500 mt-2 font-mono">
                {uploading
                  ? "Uploading video directly to Cloudinary via backend... Please wait."
                  : "Streams authenticated video directly to Cloudinary storage via Spring Boot backend API."}
              </p>
            </div>

            {/* Video Asset URL / Target */}
            <div className="mb-6">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-neutral-400 block">
                  Active Video URL (Database Target)
                </label>
                {form.videoUrl && (
                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.5 border ${
                      form.videoUrl.includes("cloudinary.com")
                        ? "text-brand-green border-brand-green/30 bg-emerald-500/10"
                        : "text-neutral-400 border-white/10 bg-white/[0.04]"
                    }`}
                  >
                    {form.videoUrl.includes("cloudinary.com") ? "Cloudinary CDN" : "Local Asset"}
                  </span>
                )}
              </div>
              <input
                name="videoUrl"
                value={form.videoUrl}
                onChange={handleChange}
                placeholder="e.g. https://res.cloudinary.com/... or /hero-demo.mp4"
                className={inputClasses}
              />
              <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed font-mono">
                Stores the active Hero video asset in PostgreSQL <span className="text-neutral-300">hero_content.video_url</span> on Save.
              </p>
            </div>

            {/* Video Player Preview */}
            {form.videoUrl && (
              <div className="mb-6 p-4 sm:p-5 bg-black/60 border border-white/[0.08] rounded-none">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand-green inline-block" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-300">
                      Live Video Preview
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500 truncate max-w-[200px] sm:max-w-xs">
                    {form.videoUrl}
                  </span>
                </div>

                <div className="relative aspect-video w-full bg-black border border-white/10 overflow-hidden">
                  <video
                    key={form.videoUrl}
                    src={form.videoUrl}
                    controls
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-neutral-400 mb-1.5 block">
                  Reel Header Badge Text
                </label>
                <input
                  name="badgeText"
                  value={form.badgeText}
                  onChange={handleChange}
                  placeholder="e.g. REEL // 2026"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-neutral-400 mb-1.5 block">
                  Specs Indicator Badge Text
                </label>
                <input
                  name="specBadgeText"
                  value={form.specBadgeText}
                  onChange={handleChange}
                  placeholder="e.g. 4K PRORES"
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={loadHero}
              disabled={loading || saving}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 border border-white/10 hover:border-white/30 bg-transparent text-neutral-300 hover:text-white text-xs font-bold uppercase tracking-wider font-display rounded-none transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Reset Values</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2.5 bg-brand-red hover:bg-[#dc2626] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-[0.16em] font-display px-8 py-3.5 rounded-none border border-brand-red transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
