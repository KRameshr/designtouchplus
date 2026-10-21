"use client";

import { useEffect, useState, useRef } from "react";
import {
  getPortfolioPageContent,
  getPortfolioPageTags,
  updatePortfolioPageContent,
  uploadPortfolioIntroVideo,
  deletePortfolioTag,
} from "@/lib/api";
import TagFormModal from "./TagFormModal";

const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB
const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
];

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function validateVideoFile(file) {
  if (!file) return "No file selected.";
  const name = file.name.toLowerCase();
  const validExt =
    name.endsWith(".mp4") ||
    name.endsWith(".webm") ||
    name.endsWith(".mov") ||
    name.endsWith(".mkv");
  if (!ALLOWED_VIDEO_TYPES.includes(file.type) && !validExt) {
    return "Unsupported video format. Please upload an MP4, WEBM, or MOV video file.";
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return `Video file is too large (${formatBytes(file.size)}). Maximum supported size is 100 MB.`;
  }
  return null;
}

export default function PortfolioIntroEditor() {
  const [form, setForm] = useState({
    eyebrow: "",
    headlineLine1: "",
    headlineLine2: "",
    headlineHighlight: "",
    description: "",
    introVideoUrl: "",
    introVideoPublicId: "",
  });

  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Video upload state
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  // Tag modal state
  const [editingTag, setEditingTag] = useState(null); // null = closed, {} = new, {...} = edit
  const [deletingTagId, setDeletingTagId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [contentData, tagsData] = await Promise.all([
        getPortfolioPageContent().catch(() => null),
        getPortfolioPageTags(true).catch(() => []),
      ]);

      if (contentData) {
        setForm({
          eyebrow: contentData.eyebrow || "",
          headlineLine1: contentData.headlineLine1 || "",
          headlineLine2: contentData.headlineLine2 || "",
          headlineHighlight: contentData.headlineHighlight || "",
          description: contentData.description || "",
          introVideoUrl: contentData.introVideoUrl || "",
          introVideoPublicId: contentData.introVideoPublicId || "",
        });
      }

      setTags(Array.isArray(tagsData) ? tagsData : []);
    } catch (err) {
      setError(err.message || "Failed to load Portfolio Intro content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
      const result = await uploadPortfolioIntroVideo(selectedFile);
      if (result && result.url) {
        setForm((prev) => ({
          ...prev,
          introVideoUrl: result.url,
          introVideoPublicId: result.publicId || "",
        }));
        setUploadSuccess(
          `Intro video uploaded to Cloudinary CDN successfully (${result.publicId || "stored"}). Click 'Save Changes' to persist.`
        );
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

  const handleRemoveVideo = () => {
    setForm((prev) => ({
      ...prev,
      introVideoUrl: "",
      introVideoPublicId: "",
    }));
    setUploadSuccess("");
    setUploadError("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const payload = {
        eyebrow: form.eyebrow.trim(),
        headlineLine1: form.headlineLine1.trim(),
        headlineLine2: form.headlineLine2.trim(),
        headlineHighlight: form.headlineHighlight.trim(),
        description: form.description.trim(),
        introVideoUrl: form.introVideoUrl ? form.introVideoUrl.trim() : null,
        introVideoPublicId: form.introVideoPublicId ? form.introVideoPublicId.trim() : null,
      };

      await updatePortfolioPageContent(payload);
      setSuccess("Portfolio Intro content updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to save Portfolio Intro content.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTag = async (id, label) => {
    if (!window.confirm(`Are you sure you want to delete tag "${label}"?`)) {
      return;
    }

    setDeletingTagId(id);
    setError("");
    try {
      await deletePortfolioTag(id);
      setTags((prev) => prev.filter((t) => t.id !== id));
      setSuccess("Tag deleted successfully.");
    } catch (err) {
      setError(err.message || "Failed to delete tag.");
    } finally {
      setDeletingTagId(null);
    }
  };

  const handleTagSaved = () => {
    setEditingTag(null);
    setSuccess("Tag saved successfully!");
    getPortfolioPageTags(true).then((res) => setTags(Array.isArray(res) ? res : []));
  };

  const inputClasses =
    "bg-black/60 border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-colors w-full min-w-0 font-sans";

  if (loading) {
    return (
      <div className="bg-[#0d0d0d] border border-white/[0.08] p-12 text-center text-neutral-400 text-xs font-mono uppercase tracking-widest">
        Loading Portfolio Intro settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Editor Sub-header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d0d0d] border border-white/[0.08] p-4 rounded-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 bg-brand-red inline-block" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              PORTFOLIO INTRO
            </h2>
          </div>
          <p className="text-[11px] text-neutral-400 font-mono">
            Manage the public Portfolio hero content, showcase video, and category tags.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-wider rounded-none border border-white/10 cursor-pointer transition-colors shrink-0"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor">
            <path d="M1 6A5 5 0 1 1 6 11M6 1V3.5M6 1L3.5 3.5" strokeWidth="1.5" />
          </svg>
          <span>Reload</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-start gap-2.5 text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-none px-4 py-3">
          <span className="w-1.5 h-1.5 bg-brand-red rounded-none shrink-0 mt-1" />
          <span className="break-words min-w-0">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-none px-4 py-3">
          <span className="w-1.5 h-1.5 bg-brand-green rounded-none shrink-0 mt-1" />
          <span className="break-words min-w-0">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 01: Intro Content */}
        <div className="bg-[#0d0d0d] border border-white/[0.08] p-5 sm:p-6 rounded-none space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-neutral-300">
              01 // INTRO CONTENT
            </span>
            <span className="text-[9px] font-mono text-neutral-500">HEADLINES &amp; COPY</span>
          </div>

          <div>
            <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
              Eyebrow Label
            </label>
            <input
              name="eyebrow"
              value={form.eyebrow}
              onChange={handleChange}
              placeholder="e.g. OUR PORTFOLIO // SELECTED WORK"
              className={inputClasses}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
                Headline Line 1
              </label>
              <input
                name="headlineLine1"
                value={form.headlineLine1}
                onChange={handleChange}
                placeholder="e.g. Our Work"
                className={inputClasses}
              />
            </div>

            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
                Headline Line 2
              </label>
              <input
                name="headlineLine2"
                value={form.headlineLine2}
                onChange={handleChange}
                placeholder="e.g. Speaks"
                className={inputClasses}
              />
            </div>

            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
                Headline Highlight (Red)
              </label>
              <input
                name="headlineHighlight"
                value={form.headlineHighlight}
                onChange={handleChange}
                placeholder="e.g. Louder."
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
              Intro Description Paragraph
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Explore our curated portfolio of commercial campaigns, creator reels, and high-conversion visual narratives built to command attention."
              className={`${inputClasses} resize-y min-h-[75px]`}
            />
          </div>
        </div>

        {/* Section 02: Showcase Video */}
        <div className="bg-[#0d0d0d] border border-white/[0.08] p-5 sm:p-6 rounded-none space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-neutral-300">
              02 // SHOWCASE VIDEO
            </span>
            <span className="text-[9px] font-mono text-neutral-500">
              CLOUDINARY CDN // designtouch/portfolio-intro
            </span>
          </div>

          {/* Current Video Info / Player */}
          {form.introVideoUrl ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  CURRENT VIDEO:
                </span>
                <span className="inline-flex items-center gap-1.5 text-[9px] font-mono uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5">
                  <span className="w-1.5 h-1.5 bg-brand-green inline-block" />
                  Cloudinary CDN
                </span>
              </div>

              <div className="relative aspect-video w-full max-w-md bg-black border border-white/10 overflow-hidden">
                <video
                  src={form.introVideoUrl}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              {form.introVideoPublicId && (
                <div className="text-[10px] font-mono text-neutral-500">
                  Storage Key: {form.introVideoPublicId}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-black/40 border border-dashed border-white/10 text-center">
              <p className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                No custom intro video configured.
              </p>
              <p className="text-[10px] font-mono text-neutral-600 mt-1">
                The public Portfolio page will show featured showcase reels as fallback.
              </p>
            </div>
          )}

          {/* Video Uploader Box */}
          <div className="p-4 bg-black/50 border border-white/10 rounded-none space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-white/[0.06]">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-neutral-300">
                Upload or Replace Showcase Video
              </span>
              <span className="text-[9px] font-mono text-neutral-500">
                MP4, WEBM, MOV // MAX 100 MB
              </span>
            </div>

            {/* Upload notifications */}
            {uploadError && (
              <div className="flex items-start gap-2.5 text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-none px-3 py-2">
                <span className="w-1.5 h-1.5 bg-brand-red shrink-0 mt-1" />
                <span className="break-words min-w-0">{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="flex items-start gap-2.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-none px-3 py-2">
                <span className="w-1.5 h-1.5 bg-brand-green shrink-0 mt-1" />
                <span className="break-words min-w-0">{uploadSuccess}</span>
              </div>
            )}

            {/* Hidden Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-50 text-white text-xs font-mono uppercase tracking-wider rounded-none border border-white/10 cursor-pointer transition-colors shrink-0"
              >
                <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>
                  {form.introVideoUrl
                    ? selectedFile
                      ? "Choose Different File"
                      : "Replace Video"
                    : selectedFile
                    ? "Choose Different File"
                    : "Choose Video"}
                </span>
              </button>

              {selectedFile && (
                <div className="flex flex-1 flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/10 text-xs min-w-0">
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
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-brand-red hover:bg-[#dc2626] disabled:opacity-60 text-white text-[11px] font-mono uppercase tracking-wider rounded-none border border-brand-red cursor-pointer transition-colors"
                    >
                      {uploading ? (
                        <>
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
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
                      className="px-2 py-1 text-neutral-400 hover:text-white text-[11px] font-mono uppercase bg-transparent border border-white/10 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {!selectedFile && form.introVideoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  className="px-3 py-2 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-red-400 bg-transparent border border-white/10 hover:border-red-500/30 cursor-pointer transition-colors"
                >
                  Remove Video
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section 03: Portfolio Tags */}
        <div className="bg-[#0d0d0d] border border-white/[0.08] p-5 sm:p-6 rounded-none space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-neutral-300 block">
                03 // PORTFOLIO TAGS
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                Category badges shown on public Portfolio page header
              </span>
            </div>

            <button
              type="button"
              onClick={() => setEditingTag({})}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-none border border-brand-red cursor-pointer transition-colors shrink-0"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 1V11M1 6H11" />
              </svg>
              <span>+ Add Tag</span>
            </button>
          </div>

          {tags.length === 0 ? (
            <div className="p-4 bg-black/40 border border-white/10 text-center text-xs font-mono text-neutral-500 uppercase">
              No tags found. Click &apos;+ Add Tag&apos; to create one.
            </div>
          ) : (
            <div className="border border-white/10 rounded-none overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-black/60 border-b border-white/10 text-[10px] uppercase tracking-wider text-neutral-400">
                    <th className="py-2.5 px-3 w-16 text-center">Order</th>
                    <th className="py-2.5 px-3">Label</th>
                    <th className="py-2.5 px-3 w-28 text-center">State</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {tags.map((tag) => (
                    <tr key={tag.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3 text-center text-neutral-400">
                        #{tag.displayOrder ?? 0}
                      </td>
                      <td className="py-2.5 px-3 text-white font-bold tracking-wide">
                        {tag.label}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {tag.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5">
                            <span className="w-1.5 h-1.5 bg-brand-green inline-block" />
                            Active
                          </span>
                        ) : (
                          <span className="text-[9px] uppercase text-neutral-500 bg-white/[0.03] border border-white/10 px-2 py-0.5">
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingTag(tag)}
                            className="px-2 py-1 text-[10px] uppercase text-neutral-300 hover:text-white bg-white/[0.04] border border-white/10 rounded-none cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTag(tag.id, tag.label)}
                            disabled={deletingTagId === tag.id}
                            className="px-2 py-1 text-[10px] uppercase text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/25 rounded-none cursor-pointer disabled:opacity-50"
                          >
                            {deletingTagId === tag.id ? "..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
          <button
            type="submit"
            disabled={saving || uploading}
            className="px-8 py-3 text-xs font-mono font-bold uppercase tracking-widest text-white bg-brand-red hover:bg-[#dc2626] disabled:opacity-60 border border-brand-red rounded-none cursor-pointer transition-colors shadow-lg"
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Tag Modal Form */}
      {editingTag !== null && (
        <TagFormModal
          tag={Object.keys(editingTag).length ? editingTag : null}
          onClose={() => setEditingTag(null)}
          onSaved={handleTagSaved}
        />
      )}
    </div>
  );
}

