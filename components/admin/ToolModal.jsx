"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Upload, X, Trash2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import {
  createTool,
  updateTool,
  getLocalToolIcons,
  uploadLocalToolIcon,
} from "@/lib/api";
import {
  TOOL_ICON_OPTIONS,
  getToolMonogram,
  resolveToolIconMeta,
  validateSvgContent,
} from "@/lib/toolIcons";

const MAX_ICON_BYTES = 512 * 1024; // 512 KB

export default function ToolModal({ tool, onClose, onSaved }) {
  const isEditing = Boolean(tool?.id);
  const fileInputRef = useRef(null);

  const [galleryIcons, setGalleryIcons] = useState(TOOL_ICON_OPTIONS);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [customKeyTouched, setCustomKeyTouched] = useState(
    Boolean(isEditing && tool?.iconKey)
  );

  const initialIconMeta = useMemo(() => {
    if (isEditing) {
      return resolveToolIconMeta(tool, TOOL_ICON_OPTIONS);
    }
    return { ...TOOL_ICON_OPTIONS[0], hasIcon: true };
  }, [isEditing, tool]);

  const [form, setForm] = useState(() =>
    isEditing
      ? {
          name: tool.name || "",
          iconKey: tool.iconKey || "",
          role: tool.role || "",
          websiteUrl: tool.websiteUrl || "",
          logoUrl: initialIconMeta.hasIcon ? initialIconMeta.src : "",
          displayOrder:
            tool.displayOrder !== undefined ? tool.displayOrder : 0,
          isActive: tool.isActive !== undefined ? tool.isActive : true,
        }
      : {
          name: "",
          iconKey: TOOL_ICON_OPTIONS[0].shortCode,
          role: "",
          websiteUrl: "",
          logoUrl: TOOL_ICON_OPTIONS[0].src,
          displayOrder: 0,
          isActive: true,
        }
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load all local icon assets from public/assets/tools/
  useEffect(() => {
    let active = true;
    getLocalToolIcons().then((icons) => {
      if (!active || !Array.isArray(icons) || icons.length === 0) return;
      setGalleryIcons(icons);
    });
    return () => {
      active = false;
    };
  }, []);

  // Ensure that if the edited tool references a custom local icon, it appears in the gallery
  const availableIcons = useMemo(() => {
    const merged = [...galleryIcons];
    const currentMeta = resolveToolIconMeta(
      { logoUrl: form.logoUrl, iconKey: form.iconKey, name: form.name },
      merged
    );
    if (
      currentMeta.hasIcon &&
      currentMeta.src &&
      !merged.some(
        (opt) => opt.src.toLowerCase() === currentMeta.src.toLowerCase()
      )
    ) {
      merged.push({
        key: currentMeta.key,
        shortCode: currentMeta.shortCode,
        label: currentMeta.label,
        filename: currentMeta.filename,
        src: currentMeta.src,
        isCustom: true,
      });
    }
    return merged;
  }, [galleryIcons, form.logoUrl, form.iconKey, form.name]);

  const selectedIconMeta = useMemo(
    () =>
      resolveToolIconMeta(
        {
          logoUrl: form.logoUrl,
          iconKey: form.iconKey,
          name: form.name,
        },
        availableIcons
      ),
    [form.logoUrl, form.iconKey, form.name, availableIcons]
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "iconKey") {
      setCustomKeyTouched(Boolean(value.trim()));
    }
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectIcon = (opt) => {
    setUploadError("");
    setUploadFeedback("");
    setForm((prev) => ({
      ...prev,
      logoUrl: opt.src,
      iconKey:
        !customKeyTouched && !isEditing
          ? opt.shortCode || getToolMonogram("", prev.name || opt.label)
          : prev.iconKey,
    }));
  };

  const handleRemoveIcon = () => {
    setUploadError("");
    setUploadFeedback("Icon assignment removed. Monogram fallback active.");
    setForm((prev) => ({
      ...prev,
      logoUrl: "",
    }));
  };

  const handleIconDropdownChange = (e) => {
    const selectedSrc = e.target.value;
    if (!selectedSrc) {
      handleRemoveIcon();
      return;
    }
    const matched = availableIcons.find((opt) => opt.src === selectedSrc);
    if (matched) {
      handleSelectIcon(matched);
    } else {
      setForm((prev) => ({ ...prev, logoUrl: selectedSrc }));
    }
  };

  const handleCustomFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setUploadFeedback("");

    const fileName = String(file.name || "");
    const ext = fileName.includes(".")
      ? `.${fileName.split(".").pop().toLowerCase()}`
      : "";
    const allowedExts = [".svg", ".png", ".webp"];
    const allowedTypes = [
      "image/svg+xml",
      "image/png",
      "image/webp",
      "",
    ];

    if (!allowedExts.includes(ext) || !allowedTypes.includes(file.type)) {
      setUploadError(
        "Unsupported file type. Please choose an SVG (.svg), PNG (.png), or WebP (.webp) icon."
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size <= 0) {
      setUploadError("The selected icon file is empty.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_ICON_BYTES) {
      setUploadError("Icon file exceeds the 512 KB size limit.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Client-side SVG safety & XML check before uploading
    if (ext === ".svg" || file.type === "image/svg+xml") {
      try {
        const svgText = await file.text();
        const check = validateSvgContent(svgText);
        if (!check.valid) {
          setUploadError(check.error);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
      } catch {
        setUploadError("Could not read SVG file for validation.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
    }

    setUploadingIcon(true);
    try {
      const uploaded = await uploadLocalToolIcon(file);
      if (!uploaded?.src) {
        throw new Error("Upload completed, but no icon path was returned.");
      }

      setGalleryIcons((prev) => {
        const exists = prev.some(
          (item) => item.src.toLowerCase() === uploaded.src.toLowerCase()
        );
        return exists ? prev : [...prev, uploaded];
      });

      // Preserve all other form fields while assigning the newly uploaded local icon path
      setForm((prev) => ({
        ...prev,
        logoUrl: uploaded.src,
        iconKey:
          prev.iconKey && prev.iconKey.trim()
            ? prev.iconKey
            : uploaded.shortCode || getToolMonogram("", prev.name || uploaded.label),
      }));

      setUploadFeedback(
        `Saved "${uploaded.filename}" to /assets/tools/ and selected it.`
      );
    } catch (err) {
      setUploadError(err.message || "Failed to upload custom icon.");
    } finally {
      setUploadingIcon(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const trimmedName = form.name.trim();
      if (!trimmedName) {
        throw new Error("Tool Name is required.");
      }

      const resolvedIcon = resolveToolIconMeta(
        {
          logoUrl: form.logoUrl,
          iconKey: form.iconKey,
          name: trimmedName,
        },
        availableIcons
      );

      const finalIconKey =
        (form.iconKey || "").trim() ||
        getToolMonogram(resolvedIcon.shortCode, trimmedName);

      const payload = {
        name: trimmedName,
        iconKey: finalIconKey,
        role: (form.role || "").trim(),
        websiteUrl: (form.websiteUrl || "").trim(),
        logoUrl: resolvedIcon.hasIcon ? resolvedIcon.src : "",
        displayOrder: Number(form.displayOrder) || 0,
        isActive: Boolean(form.isActive),
      };

      if (tool?.id) {
        await updateTool(tool.id, payload);
      } else {
        await createTool(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Failed to save tool.");
    } finally {
      setSaving(false);
    }
  };

  const inputClasses =
    "bg-white/[0.04] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2.5 text-xs font-mono text-white placeholder-neutral-500 outline-none transition-colors w-full";

  const previewMonogram = getToolMonogram(form.iconKey, form.name);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-white/15 rounded-none w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 relative shadow-2xl">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div>
            <h2 className="text-sm font-display font-black uppercase tracking-wider text-white">
              {tool?.id ? "Edit Software Tool" : "New Software Tool"}
            </h2>
            <p className="text-[10px] font-mono text-neutral-400">
              Stack asset showcased in Tools We Use section
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-neutral-400 hover:text-white bg-transparent border-none cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="text-xs font-mono text-brand-red bg-brand-red/10 border border-brand-red/20 px-3 py-2.5 rounded-none">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                Tool Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Adobe Premiere Pro"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                Short Key (2-3 chars)
              </label>
              <input
                name="iconKey"
                value={form.iconKey}
                onChange={handleChange}
                placeholder="Pr, Ae, Dv, Ps..."
                className={inputClasses}
              />
            </div>
          </div>

          {/* Local SVG / Asset Application Icon Selector & Custom Upload */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <label
                htmlFor="tool-icon-select"
                className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400"
              >
                Icon (Local Asset in /assets/tools/)
              </label>

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".svg,.png,.webp,image/svg+xml,image/png,image/webp"
                  onChange={handleCustomFileChange}
                  className="hidden"
                  id="custom-tool-icon-upload"
                />
                <button
                  type="button"
                  disabled={uploadingIcon}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {uploadingIcon ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Upload className="w-3 h-3 text-brand-red" />
                  )}
                  <span>
                    {uploadingIcon ? "Uploading..." : "Upload Custom Icon"}
                  </span>
                </button>

                {selectedIconMeta.hasIcon && (
                  <button
                    type="button"
                    onClick={handleRemoveIcon}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-neutral-300 hover:text-brand-red bg-white/[0.03] hover:bg-brand-red/10 border border-white/10 hover:border-brand-red/30 cursor-pointer transition-colors"
                    title="Remove icon assignment and use monogram fallback"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove Icon</span>
                  </button>
                )}
              </div>
            </div>

            {uploadError && (
              <div
                role="alert"
                className="flex items-center gap-2 text-[11px] font-mono text-brand-red bg-brand-red/10 border border-brand-red/25 px-3 py-2 mb-2"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadFeedback && (
              <div className="flex items-center gap-2 text-[11px] font-mono text-brand-green bg-brand-green/10 border border-brand-green/25 px-3 py-2 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{uploadFeedback}</span>
              </div>
            )}

            <select
              id="tool-icon-select"
              name="logoUrl"
              value={selectedIconMeta.hasIcon ? selectedIconMeta.src : ""}
              onChange={handleIconDropdownChange}
              className={inputClasses}
            >
              <option value="" className="bg-[#1a1a1a]">
                No Icon — Use Monogram Fallback ({previewMonogram})
              </option>
              {availableIcons.map((opt) => (
                <option key={opt.src} value={opt.src} className="bg-[#1a1a1a]">
                  {opt.label} ({opt.filename})
                  {opt.isCustom ? " [Custom]" : ""}
                </option>
              ))}
            </select>

            {/* Visual Local Icon Asset Gallery */}
            <div
              role="radiogroup"
              aria-label="Tool application icon picker"
              className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2.5 max-h-56 overflow-y-auto pr-0.5"
            >
              {availableIcons.map((opt) => {
                const isSelected =
                  selectedIconMeta.hasIcon &&
                  selectedIconMeta.src.toLowerCase() === opt.src.toLowerCase();
                return (
                  <button
                    key={opt.src}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelectIcon(opt)}
                    className={`flex flex-col items-center justify-center gap-1.5 p-2.5 border text-center cursor-pointer transition-all ${
                      isSelected
                        ? "bg-brand-red/[0.12] border-brand-red text-white shadow-[0_0_16px_-6px_rgba(239,68,68,0.45)]"
                        : "bg-white/[0.02] border-white/10 hover:border-white/30 text-neutral-400 hover:text-white"
                    }`}
                  >
                    <img
                      src={opt.src}
                      alt={opt.label}
                      width={32}
                      height={32}
                      className="w-8 h-8 object-contain select-none"
                    />
                    <span className="text-[10px] font-sans font-semibold text-white leading-tight truncate max-w-full">
                      {opt.label}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-400 truncate max-w-full">
                      {opt.filename}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Icon Filename & Live Preview Banner */}
            <div className="flex items-center justify-between gap-3 mt-2.5 px-3.5 py-2.5 bg-[#0b0b0b] border border-white/10 rounded-[8px]">
              <div className="flex items-center gap-3 min-w-0">
                {selectedIconMeta.hasIcon && selectedIconMeta.src ? (
                  <img
                    src={selectedIconMeta.src}
                    alt={selectedIconMeta.label}
                    width={36}
                    height={36}
                    className="w-9 h-9 object-contain shrink-0"
                  />
                ) : (
                  <span className="w-9 h-9 rounded-[8px] bg-[#141414] border border-white/15 flex items-center justify-center shrink-0 font-mono text-xs font-bold text-neutral-200">
                    {previewMonogram}
                  </span>
                )}
                <div className="min-w-0">
                  <span className="block text-xs font-sans font-medium text-white truncate">
                    {form.name || selectedIconMeta.label}
                  </span>
                  <span className="block text-[10px] font-mono text-neutral-400 truncate">
                    {selectedIconMeta.hasIcon
                      ? `File: ${selectedIconMeta.filename} • Path: ${selectedIconMeta.src}`
                      : `No icon assigned • Fallback monogram (${previewMonogram})`}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-white/[0.05] border border-white/10 text-neutral-300 shrink-0">
                {previewMonogram}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
              Role / Specialty
            </label>
            <input
              name="role"
              value={form.role}
              onChange={handleChange}
              placeholder="e.g. NLE & Timeline Assembly"
              className={inputClasses}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                Website / Vendor URL
              </label>
              <input
                name="websiteUrl"
                value={form.websiteUrl}
                onChange={handleChange}
                placeholder="https://adobe.com..."
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                Display Order Sort
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

          <div>
            <label className="flex items-center gap-2 cursor-pointer bg-white/[0.03] border border-white/10 px-3 py-2.5 text-xs font-mono select-none">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="accent-brand-red w-4 h-4 cursor-pointer"
              />
              <span
                className={
                  form.isActive
                    ? "text-brand-green font-bold"
                    : "text-neutral-500"
                }
              >
                {form.isActive
                  ? "Active (Visible in tools section)"
                  : "Inactive (Hidden)"}
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 text-xs font-mono font-bold uppercase tracking-widest text-neutral-400 hover:text-white border border-white/10 rounded-none py-2.5 bg-transparent cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingIcon}
              className="flex-1 text-xs font-mono font-bold uppercase tracking-widest text-white bg-brand-red hover:bg-red-600 disabled:opacity-60 rounded-none py-2.5 border border-brand-red cursor-pointer transition-colors"
            >
              {saving ? "Saving..." : tool?.id ? "Update Tool" : "Create Tool"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
