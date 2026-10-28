"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createService, updateService } from "@/lib/api";
import {
  SERVICE_COLOR_OPTIONS,
  SERVICE_ICON_OPTIONS,
  ServiceOutlineIcon,
  resolveServiceIconKey,
  resolveServiceTheme,
} from "@/lib/serviceIcons";

const EMPTY_FORM = {
  icon: "video",
  title: "",
  description: "",
  shortDescription: "",
  fullDescription: "",
  featuresText: "",
  colorTheme: "red",
  slug: "",
  orderNumber: "",
  displayOrder: 0,
  ctaLabel: "Learn More",
  ctaUrl: "/contact",
  imageUrl: "",
  isActive: true,
};

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

export default function ServiceForm({ service, onClose, onSaved }) {
  const [form, setForm] = useState(
    service
      ? {
          ...EMPTY_FORM,
          ...service,
          icon: resolveServiceIconKey(service.icon, service.slug, service.title),
          colorTheme: (service.colorTheme || "red").toLowerCase().trim(),
          shortDescription:
            service.shortDescription || service.description || "",
          fullDescription: service.fullDescription || "",
          ctaLabel: service.ctaLabel || "Learn More",
          ctaUrl: service.ctaUrl || "/contact",
          imageUrl: service.imageUrl || "",
          isActive: service.isActive !== undefined ? service.isActive : true,
          featuresText: (service.features || []).join("\n"),
        }
      : EMPTY_FORM
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(service));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedIconOption =
    SERVICE_ICON_OPTIONS.find((opt) => opt.key === form.icon) ||
    SERVICE_ICON_OPTIONS[0];
  const resolvedTheme = resolveServiceTheme(form.colorTheme);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    const updated = { ...form, [name]: val };
    if (name === "title" && !slugTouched) {
      updated.slug = slugify(value);
    }
    if (name === "slug") setSlugTouched(true);
    setForm(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        icon: form.icon,
        title: form.title,
        description: form.description,
        shortDescription: form.shortDescription || form.description,
        fullDescription: form.fullDescription || "",
        features: form.featuresText
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
        colorTheme: form.colorTheme,
        slug: form.slug,
        orderNumber: form.orderNumber,
        displayOrder: Number(form.displayOrder) || 0,
        ctaLabel: form.ctaLabel,
        ctaUrl: form.ctaUrl,
        imageUrl: form.imageUrl,
        isActive: Boolean(form.isActive),
      };

      if (service?.id) {
        await updateService(service.id, payload);
      } else {
        await createService(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Failed to save service.");
    } finally {
      setSaving(false);
    }
  };

  const inputClasses =
    "bg-white/[0.04] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2.5 text-xs font-mono text-white placeholder-neutral-500 outline-none transition-colors w-full";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-white/15 rounded-none w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/10 sticky top-0 bg-[#111111] z-10">
          <div>
            <h2 className="text-sm font-display font-black uppercase tracking-wider text-white">
              {service?.id ? "Edit Service" : "New Service"}
            </h2>
            <p className="text-[10px] font-mono text-neutral-400">
              Configure service discipline catalog and display attributes
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white bg-transparent border-none cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {error && (
            <p className="text-xs font-mono text-brand-red bg-brand-red/10 border border-brand-red/20 px-3 py-2.5 rounded-none">
              {error}
            </p>
          )}

          {/* Title & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                Service Title *
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. Video Editing"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                Slug *
              </label>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                required
                placeholder="video-editing"
                className={inputClasses}
              />
            </div>
          </div>

          {/* Order # and Display Order */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                Order Number (Badge)
              </label>
              <input
                name="orderNumber"
                value={form.orderNumber || ""}
                onChange={handleChange}
                placeholder="01"
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
                placeholder="0"
                className={inputClasses}
              />
            </div>
            <div className="flex flex-col justify-end">
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
                  {form.isActive ? "Active (Visible)" : "Inactive (Hidden)"}
                </span>
              </label>
            </div>
          </div>

          {/* Icon & Color Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                Icon Identifier
              </label>
              <select
                name="icon"
                value={form.icon}
                onChange={handleChange}
                className={inputClasses}
              >
                {SERVICE_ICON_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key} className="bg-[#1a1a1a]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                Accent Theme Color
              </label>
              <select
                name="colorTheme"
                value={form.colorTheme}
                onChange={handleChange}
                className={inputClasses}
              >
                {SERVICE_COLOR_OPTIONS.map((c) => (
                  <option key={c.key} value={c.key} className="bg-[#1a1a1a]">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Card Icon & Accent Preview */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-[8px]">
            <div className="flex items-center gap-3.5">
              <div style={{ color: resolvedTheme.hex }}>
                <ServiceOutlineIcon
                  iconKey={selectedIconOption.key}
                  className="w-10 h-10"
                />
              </div>
              <div>
                <span className="block text-xs font-display font-bold uppercase text-white">
                  {form.title || "Service Preview"}
                </span>
                <span className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                  Icon: {selectedIconOption.key} • Theme: {resolvedTheme.label}
                </span>
              </div>
            </div>
            <span className="font-display text-2xl font-extrabold text-white/10 select-none">
              {form.orderNumber || "01"}
            </span>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
              Short Description (Card Summary)
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              placeholder="Brief overview shown on the card..."
              className={`${inputClasses} resize-none`}
            />
          </div>

          {/* Feature Bullets */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
              Feature Bullets (One per line)
            </label>
            <textarea
              name="featuresText"
              value={form.featuresText}
              onChange={handleChange}
              rows={4}
              placeholder={
                "Long-form Editing\nShort-form / Reels\nPodcast Editing\nColor Grading"
              }
              className={`${inputClasses} resize-none`}
            />
          </div>

          {/* CTA Label & Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                CTA Label
              </label>
              <input
                name="ctaLabel"
                value={form.ctaLabel}
                onChange={handleChange}
                placeholder="Learn More"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                CTA Destination URL
              </label>
              <input
                name="ctaUrl"
                value={form.ctaUrl}
                onChange={handleChange}
                placeholder="/contact?service=Video%20Editing"
                className={inputClasses}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 text-xs font-mono font-bold uppercase tracking-widest text-neutral-400 hover:text-white border border-white/10 rounded-none py-3 bg-transparent cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 text-xs font-mono font-bold uppercase tracking-widest text-white bg-brand-red hover:bg-red-600 disabled:opacity-60 rounded-none py-3 border border-brand-red cursor-pointer transition-colors"
            >
              {saving
                ? "Saving..."
                : service?.id
                ? "Update Service"
                : "Create Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
