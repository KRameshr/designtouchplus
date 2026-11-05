"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { createStat, updateStat } from "@/lib/api";

export default function StatItemModal({ statItem, onClose, onSaved }) {
  const isEditing = Boolean(statItem?.id);

  const [form, setForm] = useState({
    label: statItem?.label || statItem?.description || "",
    value: statItem?.value !== undefined ? String(statItem.value) : "",
    suffix: statItem?.suffix || "+",
    description: statItem?.description || statItem?.label || "",
    displayOrder: statItem?.displayOrder !== undefined ? statItem.displayOrder : 0,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        label: form.label.trim() || form.description.trim(),
        value: form.value.trim(),
        suffix: (form.suffix || "").trim(),
        description: form.description.trim() || form.label.trim(),
        displayOrder: Number(form.displayOrder) || 0,
      };

      if (isEditing) {
        await updateStat(statItem.id, payload);
      } else {
        await createStat(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Failed to save statistic.");
    } finally {
      setSaving(false);
    }
  };

  const inputClasses =
    "bg-white/[0.04] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2.5 text-xs font-mono text-white placeholder-neutral-500 outline-none transition-colors w-full";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-white/15 rounded-none w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
          <div>
            <h2 className="text-sm font-display font-black uppercase tracking-wider text-white">
              {isEditing ? "Edit Statistic" : "New Statistic"}
            </h2>
            <p className="text-[10px] font-mono text-neutral-400">
              Agency metric displayed on public About page
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
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Metric Description / Label *
            </label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              placeholder="e.g. Projects Completed, Happy Clients, Years Experience..."
              className={inputClasses}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Value *
              </label>
              <input
                name="value"
                value={form.value}
                onChange={handleChange}
                required
                placeholder="150, 80, 4, 10..."
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Suffix
              </label>
              <input
                name="suffix"
                value={form.suffix}
                onChange={handleChange}
                placeholder="+, %, K, M..."
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Display Order
            </label>
            <input
              type="number"
              name="displayOrder"
              value={form.displayOrder}
              onChange={handleChange}
              placeholder="1, 2, 3, 4..."
              className={inputClasses}
            />
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
                <span>Save Metric</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

