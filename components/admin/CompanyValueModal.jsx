"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { createValue, updateValue } from "@/lib/api";
import { VALUE_ICON_OPTIONS, resolveValueIcon } from "@/lib/valueIcons";
import { VALUE_ICON_MAP } from "@/components/about/ValuesGrid";

export default function CompanyValueModal({ valueItem, onClose, onSaved }) {
  const isEditing = Boolean(valueItem?.id);
  const initialIcon = resolveValueIcon(valueItem?.icon, valueItem?.title);

  const [form, setForm] = useState({
    title: valueItem?.title || "",
    description: valueItem?.description || "",
    icon: initialIcon,
    displayOrder: valueItem?.displayOrder !== undefined ? valueItem.displayOrder : 0,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectIcon = (iconKey) => {
    setForm((prev) => ({ ...prev, icon: iconKey }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        icon: form.icon,
        displayOrder: Number(form.displayOrder) || 0,
      };

      if (isEditing) {
        await updateValue(valueItem.id, payload);
      } else {
        await createValue(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Failed to save company value.");
    } finally {
      setSaving(false);
    }
  };

  const inputClasses =
    "bg-white/[0.04] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2.5 text-xs font-mono text-white placeholder-neutral-500 outline-none transition-colors w-full";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-white/15 rounded-none w-full max-w-lg max-h-[92vh] overflow-y-auto p-6 relative shadow-2xl">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
          <div>
            <h2 className="text-sm font-display font-black uppercase tracking-wider text-white">
              {isEditing ? "Edit Company Value" : "New Company Value"}
            </h2>
            <p className="text-[10px] font-mono text-neutral-400">
              Core agency pillar displayed on public About page
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
              Title *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g. Quality First, Creativity, Client First..."
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Brief explanation of this core agency value..."
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Select Icon
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1 bg-black/40 border border-white/10">
              {VALUE_ICON_OPTIONS.map((opt) => {
                const IconComponent = VALUE_ICON_MAP[opt.key];
                const isSelected = form.icon === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectIcon(opt.key)}
                    className={`flex flex-col items-center justify-center p-2.5 text-center transition-colors cursor-pointer border rounded-none ${
                      isSelected
                        ? "bg-brand-red/15 border-brand-red text-brand-red"
                        : "bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white hover:bg-white/[0.05]"
                    }`}
                  >
                    {IconComponent && <IconComponent className="w-5 h-5 mb-1" />}
                    <span className="text-[10px] font-mono uppercase truncate max-w-full">
                      {opt.key}
                    </span>
                  </button>
                );
              })}
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
              placeholder="1, 2, 3..."
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
                <span>Save Value</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

