"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { createPricingPlan, updatePricingPlan } from "@/lib/api";

const ACCENT_OPTIONS = [
  { key: "green", label: "Green (Basic / Growth)", hex: "#22c55e" },
  { key: "red", label: "Red (Standard / Popular)", hex: "#ef4444" },
  { key: "violet", label: "Violet / Purple (Premium)", hex: "#a855f7" },
  { key: "orange", label: "Orange (Enterprise / Custom)", hex: "#f97316" },
];

export default function PricingPlanModal({ plan, defaultType = "ONE_TIME", defaultCategory = "VIDEO_EDITING", onClose, onSaved }) {
  const isEditing = Boolean(plan?.id);

  const [form, setForm] = useState({
    serviceCategory: plan?.serviceCategory || defaultCategory || "VIDEO_EDITING",
    planName: plan?.planName || "",
    priceType: plan?.priceType || defaultType,
    isCustomPricing: plan ? plan.price == null : false,
    price: plan?.price != null ? String(plan.price) : "",
    currency: plan?.currency || "₹",
    unit: plan?.unit || (defaultType === "MONTHLY" ? "/month" : "/video"),
    description: plan?.description || "",
    features: Array.isArray(plan?.features) && plan.features.length > 0 ? plan.features : [""],
    isMostPopular: plan?.isMostPopular != null ? Boolean(plan.isMostPopular) : false,
    badgeText: plan?.badgeText || "",
    accentColor: plan?.accentColor || "",
    ctaText: plan?.ctaText || "GET STARTED",
    ctaLink: plan?.ctaLink || "/contact",
    displayOrder: plan?.displayOrder !== undefined ? plan.displayOrder : 0,
    isActive: plan?.isActive !== undefined ? Boolean(plan.isActive) : true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFeatureChange = (index, value) => {
    setForm((prev) => {
      const next = [...prev.features];
      next[index] = value;
      return { ...prev, features: next };
    });
  };

  const handleAddFeature = () => {
    setForm((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const handleRemoveFeature = (index) => {
    setForm((prev) => {
      const next = prev.features.filter((_, i) => i !== index);
      return { ...prev, features: next.length > 0 ? next : [""] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const cleanedFeatures = form.features
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      const payload = {
        serviceCategory: form.serviceCategory || "VIDEO_EDITING",
        planName: form.planName.trim(),
        priceType: form.priceType,
        price: form.isCustomPricing || form.price === "" ? null : Number(form.price),
        currency: form.currency.trim() || "₹",
        unit: form.isCustomPricing ? null : form.unit.trim(),
        description: form.description.trim(),
        features: cleanedFeatures,
        isMostPopular: Boolean(form.isMostPopular),
        badgeText: form.badgeText.trim() || (form.isMostPopular ? "MOST POPULAR" : null),
        accentColor: form.accentColor.trim() || null,
        ctaText: form.ctaText.trim() || "GET STARTED",
        ctaLink: form.ctaLink.trim() || "/contact",
        displayOrder: Number(form.displayOrder) || 0,
        isActive: Boolean(form.isActive),
      };

      if (isEditing) {
        await updatePricingPlan(plan.id, payload);
      } else {
        await createPricingPlan(payload);
      }

      onSaved();
    } catch (err) {
      setError(err.message || "Failed to save pricing plan.");
    } finally {
      setSaving(false);
    }
  };

  const inputClasses =
    "bg-white/[0.04] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2.5 text-xs font-mono text-white placeholder-neutral-500 outline-none transition-colors w-full";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-white/15 rounded-none w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 relative shadow-2xl">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div>
            <h2 className="text-sm font-display font-black uppercase tracking-wider text-white">
              {isEditing ? "Edit Pricing Plan" : "New Pricing Plan"}
            </h2>
            <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
              Configure tier name, pricing rates, billing period, and highlighted features.
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                Service Category *
              </label>
              <select
                name="serviceCategory"
                value={form.serviceCategory}
                onChange={handleChange}
                className={inputClasses}
              >
                <option value="VIDEO_EDITING" className="bg-[#111]">Video Editing</option>
                <option value="THUMBNAIL_DESIGN" className="bg-[#111]">Thumbnail Design</option>
                <option value="CONTENT_CREATOR" className="bg-[#111]">Content Creator Packages</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                Plan Name *
              </label>
              <input
                type="text"
                name="planName"
                value={form.planName}
                onChange={handleChange}
                placeholder="e.g. BASIC, STANDARD, ENTERPRISE"
                required
                className={inputClasses}
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                Billing Type *
              </label>
              <select
                name="priceType"
                value={form.priceType}
                onChange={handleChange}
                className={inputClasses}
              >
                <option value="ONE_TIME" className="bg-[#111]">ONE_TIME (One-Time Project)</option>
                <option value="MONTHLY" className="bg-[#111]">MONTHLY (Monthly Packages)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
              Short Description
            </label>
            <textarea
              name="description"
              rows={2}
              value={form.description}
              onChange={handleChange}
              placeholder="e.g. Perfect for creators and small projects."
              className={inputClasses}
            />
          </div>

          {/* Pricing Row */}
          <div className="p-3 bg-white/[0.02] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-white">
                Price Configuration
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-neutral-300">
                <input
                  type="checkbox"
                  name="isCustomPricing"
                  checked={form.isCustomPricing}
                  onChange={handleChange}
                  className="rounded-none border-white/20 bg-white/[0.04] text-brand-red focus:ring-brand-red"
                />
                Custom Pricing (Enterprise / Talk to Us)
              </label>
            </div>

            {!form.isCustomPricing ? (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    Currency
                  </label>
                  <input
                    type="text"
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    placeholder="₹"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    Price (Numeric) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="e.g. 2999"
                    required={!form.isCustomPricing}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    Billing Unit
                  </label>
                  <input
                    type="text"
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    placeholder="/video or /month"
                    className={inputClasses}
                  />
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-brand-red/[0.06] border border-brand-red/20 text-neutral-300 text-xs font-mono">
                Will display as <strong className="text-white">CUSTOM</strong> with custom consultation CTA.
              </div>
            )}
          </div>

          {/* Features Builder */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                Included Features
              </label>
              <button
                type="button"
                onClick={handleAddFeature}
                className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-brand-red hover:underline"
              >
                <Plus className="w-3 h-3" /> Add Feature
              </button>
            </div>
            <div className="space-y-2">
              {form.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(idx, e.target.value)}
                    placeholder={`Feature #${idx + 1} (e.g. Up to 5 minutes runtime)`}
                    className={inputClasses}
                  />
                  {form.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="p-2 text-neutral-500 hover:text-red-400 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Visual Badges & Styling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                Accent Theme Preset
              </label>
              <select
                name="accentColor"
                value={form.accentColor}
                onChange={handleChange}
                className={inputClasses}
              >
                <option value="" className="bg-[#111]">Auto (By Plan Name)</option>
                {ACCENT_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key} className="bg-[#111]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                Badge Tag Text (Optional)
              </label>
              <input
                type="text"
                name="badgeText"
                value={form.badgeText}
                onChange={handleChange}
                placeholder="e.g. MOST POPULAR, POPULAR"
                className={inputClasses}
              />
            </div>
          </div>

          {/* CTA Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                CTA Button Text
              </label>
              <input
                type="text"
                name="ctaText"
                value={form.ctaText}
                onChange={handleChange}
                placeholder="GET STARTED or CONTACT US"
                className={inputClasses}
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                CTA Button Link
              </label>
              <input
                type="text"
                name="ctaLink"
                value={form.ctaLink}
                onChange={handleChange}
                placeholder="/contact"
                className={inputClasses}
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-white/10">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-neutral-300">
              <input
                type="checkbox"
                name="isMostPopular"
                checked={form.isMostPopular}
                onChange={handleChange}
                className="rounded-none border-white/20 bg-white/[0.04] text-brand-red focus:ring-brand-red"
              />
              Flag as Most Popular (Highlighted Card)
            </label>

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
              disabled={saving}
              className="px-4 py-2 border border-white/15 text-xs font-mono uppercase tracking-wider text-neutral-300 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-brand-red text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : isEditing ? "Save Plan" : "Create Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

