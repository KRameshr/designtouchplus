"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createProcessStep, updateProcessStep } from "@/lib/api";

const ICON_OPTIONS = [
  { value: "discover", label: "Discover (Search / Target)" },
  { value: "plan", label: "Plan (Grid / Blueprint)" },
  { value: "create", label: "Create (Sparkle / Star)" },
  { value: "review", label: "Review (Comment / Feedback)" },
  { value: "deliver", label: "Deliver (Send / Arrow)" },
];

export default function ProcessStepModal({ step, onClose, onSaved }) {
  const [form, setForm] = useState(
    step
      ? {
          stepNumber: step.stepNumber || 1,
          title: step.title || "",
          description: step.description || "",
          icon: step.icon || "discover",
          displayOrder: step.displayOrder !== undefined ? step.displayOrder : 0,
          isActive: step.isActive !== undefined ? step.isActive : true,
          pageType: "SERVICES",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        pageType: "SERVICES",
        stepNumber: Number(form.stepNumber) || 1,
        title: form.title.trim(),
        description: form.description.trim(),
        icon: form.icon,
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
      <div className="bg-[#111111] border border-white/15 rounded-none w-full max-w-lg p-6 relative shadow-2xl">
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
            onClick={onClose}
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
              placeholder="e.g. Discover, Plan, Create..."
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
              Icon
            </label>
            <select name="icon" value={form.icon} onChange={handleChange} className={inputClasses}>
              {ICON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#1a1a1a]">
                  {opt.label}
                </option>
              ))}
            </select>
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
              <span className={form.isActive ? "text-brand-green font-bold" : "text-neutral-500"}>
                {form.isActive ? "Active (Visible on public Services page)" : "Inactive (Hidden)"}
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

