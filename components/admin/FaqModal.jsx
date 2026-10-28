"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createFaq, updateFaq } from "@/lib/api";

export default function FaqModal({ faq, defaultCategory = "PRICING", onClose, onSaved }) {
  const isEditing = Boolean(faq?.id);

  const [form, setForm] = useState({
    question: faq?.question || "",
    answer: faq?.answer || "",
    category: faq?.category || defaultCategory,
    displayOrder: faq?.displayOrder !== undefined ? faq.displayOrder : 0,
    isActive: faq?.isActive !== undefined ? Boolean(faq.isActive) : true,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        question: form.question.trim(),
        answer: form.answer.trim(),
        category: form.category,
        displayOrder: Number(form.displayOrder) || 0,
        isActive: Boolean(form.isActive),
      };

      if (isEditing) {
        await updateFaq(faq.id, payload);
      } else {
        await createFaq(payload);
      }

      onSaved();
    } catch (err) {
      setError(err.message || "Failed to save FAQ.");
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
              {isEditing ? "Edit FAQ" : "New FAQ"}
            </h2>
            <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
              Manage questions and answers displayed in the accordions.
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
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
              Question *
            </label>
            <input
              type="text"
              name="question"
              value={form.question}
              onChange={handleChange}
              placeholder="e.g. What information do you need to get started?"
              required
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
              Answer *
            </label>
            <textarea
              name="answer"
              rows={4}
              value={form.answer}
              onChange={handleChange}
              placeholder="Write a clear, helpful answer..."
              required
              className={inputClasses}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={inputClasses}
              >
                <option value="PRICING" className="bg-[#111]">PRICING (Pricing Page)</option>
                <option value="GENERAL" className="bg-[#111]">GENERAL (About / General)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                Display Order
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

          <div className="pt-2 border-t border-white/10">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-neutral-300">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="rounded-none border-white/20 bg-white/[0.04] text-brand-red focus:ring-brand-red"
              />
              Active (Visible on public pages)
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
              {saving ? "Saving..." : isEditing ? "Save FAQ" : "Create FAQ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

