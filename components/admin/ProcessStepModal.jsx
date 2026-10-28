"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createProcessStep, updateProcessStep } from "@/lib/api";
import {
  PROCESS_ICON_OPTIONS,
  resolveProcessIconKey,
} from "@/lib/processIcons";

export default function ProcessStepModal({ step, onClose, onSaved }) {
  const isEditing = Boolean(step?.id);
  const initialIcon = isEditing
    ? resolveProcessIconKey(step.icon, step.title, step.stepNumber)
    : "discover";

  const [form, setForm] = useState(
    isEditing
      ? {
          stepNumber: step.stepNumber || 1,
          title: step.title || "",
          description: step.description || "",
          icon: initialIcon,
          displayOrder: step.displayOrder !== undefined ? step.displayOrder : 0,
          isActive: step.isActive !== undefined ? step.isActive : true,
          pageType: step.pageType || "SERVICES",
        }
      : {
          stepNumber: 1,
          title: "",
          description: "",
          icon: "discover",
          displayOrder: 0,
          isActive: true,
          pageType: "SERVICES",
        }
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectIcon = (iconKey) => {
    setForm((prev) => ({
      ...prev,
      icon: iconKey,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        pageType: form.pageType || "SERVICES",
        stepNumber: Number(form.stepNumber) || 1,
        title: form.title.trim(),
        description: form.description.trim(),
        icon: resolveProcessIconKey(form.icon, form.title, form.stepNumber),
        displayOrder: Number(form.displayOrder) || 0,
        isActive: Boolean(form.isActive),
      };

      if (step?.id) {
        await updateProcessStep(step.id, payload);
      } else {
        await createProcessStep(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Failed to save process step.");
    } finally {
      setSaving(false);
    }
  };

  const inputClasses =
    "bg-white/[0.04] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2.5 text-xs font-mono text-white placeholder-neutral-500 outline-none transition-colors w-full";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-white/15 rounded-none w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 relative shadow-2xl">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div>
            <h2 className="text-sm font-display font-black uppercase tracking-wider text-white">
              {step?.id ? "Edit Process Step" : "New Process Step"}
            </h2>
            <p className="text-[10px] font-mono text-neutral-400">
              Workflow stage for public methodology timeline
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
                Step Number (1-10) *
              </label>
              <input
                type="number"
                min="1"
                max="99"
                name="stepNumber"
                value={form.stepNumber}
                onChange={handleChange}
                required
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
            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
              Step Title *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g. DISCOVER, PLAN, CREATE..."
              className={inputClasses}
            />
          </div>

          {/* Icon Selector Dropdown + Visual SVG Preview Grid */}
          <div>
            <label
              htmlFor="process-step-icon-select"
              className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1"
            >
              Icon *
            </label>
            <select
              id="process-step-icon-select"
              name="icon"
              value={form.icon}
              onChange={handleChange}
              className={inputClasses}
            >
              {PROCESS_ICON_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key} className="bg-[#1a1a1a]">
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Visual Preview Selector for All 5 Local SVG Icons */}
            <div
              role="radiogroup"
              aria-label="Process step icon preview selector"
              className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-2.5"
            >
              {PROCESS_ICON_OPTIONS.map((opt) => {
                const isSelected = form.icon === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelectIcon(opt.key)}
                    className={`flex flex-col items-center justify-center gap-2 p-3 border text-center cursor-pointer transition-all ${
                      isSelected
                        ? "bg-brand-red/[0.12] border-brand-red text-white shadow-[0_0_16px_-6px_rgba(239,68,68,0.45)]"
                        : "bg-white/[0.02] border-white/10 hover:border-white/30 text-neutral-400 hover:text-white"
                    }`}
                  >
                    <span
                      className={`w-11 h-11 rounded-full flex items-center justify-center border transition-colors ${
                        isSelected
                          ? "bg-[#0b0b0b] border-brand-red/70"
                          : "bg-[#0b0b0b] border-white/20"
                      }`}
                    >
                      <img
                        src={opt.src}
                        alt={opt.label}
                        width={22}
                        height={22}
                        className="w-5 h-5 object-contain select-none"
                      />
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider leading-tight">
                      {opt.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
              Step Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Detailed description of what happens in this phase..."
              className={`${inputClasses} resize-none`}
            />
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
                  ? "Active (Visible on public Services page)"
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
              disabled={saving}
              className="flex-1 text-xs font-mono font-bold uppercase tracking-widest text-white bg-brand-red hover:bg-red-600 disabled:opacity-60 rounded-none py-2.5 border border-brand-red cursor-pointer transition-colors"
            >
              {saving ? "Saving..." : step?.id ? "Update Step" : "Create Step"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
