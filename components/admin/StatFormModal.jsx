"use client";

import { useState } from "react";
import { adminFetch } from "@/lib/auth";

const EMPTY_STAT = {
  label: "",
  value: "",
  suffix: "",
  description: "",
  displayOrder: 1,
};

export default function StatFormModal({ stat, onClose, onSaved }) {
  const [form, setForm] = useState(
    stat
      ? {
          label: stat.label || "",
          value: stat.value != null ? String(stat.value) : "",
          suffix: stat.suffix || "",
          description: stat.description || "",
          displayOrder: stat.displayOrder ?? 1,
        }
      : EMPTY_STAT
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.label.trim()) {
      setError("Label is required.");
      return;
    }
    if (!form.value.trim()) {
      setError("Value is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        label: form.label.trim(),
        value: form.value.trim(),
        suffix: form.suffix ? form.suffix.trim() : null,
        description: form.description ? form.description.trim() : form.label.trim(),
        displayOrder: Number(form.displayOrder) || 0,
      };

      if (stat?.id) {
        await adminFetch(`/api/stats/${stat.id}`, {
          method: "PUT",
          body: payload,
        });
      } else {
        await adminFetch("/api/stats", {
          method: "POST",
          body: payload,
        });
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Failed to save statistic.");
    } finally {
      setSaving(false);
    }
  };

  const inputClasses =
    "bg-black/60 border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-colors w-full min-w-0 font-sans";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#0e0e0e] border border-white/15 rounded-none w-full max-w-lg flex flex-col shadow-2xl my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.08] bg-[#121212] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0" aria-hidden="true" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-white font-mono">
              {stat?.id ? "Edit Portfolio Statistic" : "New Portfolio Statistic"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white bg-transparent border border-transparent hover:border-white/10 rounded-none cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 2L10 10M10 2L2 10" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-none px-3.5 py-2.5">
              <span className="w-1.5 h-1.5 bg-brand-red rounded-none shrink-0 mt-1" />
              <span className="break-words min-w-0">{error}</span>
            </div>
          )}

          <div>
            <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
              Statistic Label *
            </label>
            <input
              name="label"
              value={form.label}
              onChange={handleChange}
              required
              placeholder="e.g. Projects Completed, Happy Clients"
              className={inputClasses}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
                Value *
              </label>
              <input
                name="value"
                value={form.value}
                onChange={handleChange}
                required
                placeholder="e.g. 80+ or 80"
                className={inputClasses}
              />
            </div>

            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
                Suffix (Optional)
              </label>
              <input
                name="suffix"
                value={form.suffix}
                onChange={handleChange}
                placeholder="e.g. +"
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
              Description / Subtitle
            </label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="e.g. Delivered worldwide"
              className={inputClasses}
            />
          </div>

          <div>
            <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400 mb-1.5 block">
              Display Order
            </label>
            <input
              type="number"
              name="displayOrder"
              value={form.displayOrder}
              onChange={handleChange}
              placeholder="1"
              className={inputClasses}
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white border border-white/15 bg-transparent rounded-none cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-white bg-brand-red hover:bg-[#dc2626] disabled:opacity-60 border border-brand-red rounded-none cursor-pointer transition-colors"
            >
              {saving ? "Saving..." : "Save Statistic"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

