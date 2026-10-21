"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createTool, updateTool } from "@/lib/api";

export default function ToolModal({ tool, onClose, onSaved }) {
  const [form, setForm] = useState(
    tool
      ? {
          name: tool.name || "",
          iconKey: tool.iconKey || "",
          role: tool.role || "",
          websiteUrl: tool.websiteUrl || "",
          logoUrl: tool.logoUrl || "",
          displayOrder: tool.displayOrder !== undefined ? tool.displayOrder : 0,
          isActive: tool.isActive !== undefined ? tool.isActive : true,
        }
      : {
          name: "",
          iconKey: "",
          role: "",
          websiteUrl: "",
          logoUrl: "",
          displayOrder: 0,
          isActive: true,
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
        name: form.name.trim(),
        iconKey: form.iconKey.trim(),
        role: form.role.trim(),
        websiteUrl: form.websiteUrl.trim(),
        logoUrl: form.logoUrl.trim(),
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

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-white/15 rounded-none w-full max-w-lg p-6 relative shadow-2xl">
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
                Monogram / Short Key (2-3 chars)
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
              <span className={form.isActive ? "text-brand-green font-bold" : "text-neutral-500"}>
                {form.isActive ? "Active (Visible in tools section)" : "Inactive (Hidden)"}
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
              {saving ? "Saving..." : tool?.id ? "Update Tool" : "Create Tool"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

