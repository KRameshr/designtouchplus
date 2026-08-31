"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { adminFetch } from "@/lib/auth";

const EMPTY_FORM = {
  quote: "",
  authorName: "",
  authorRole: "",
  authorCompany: "",
  authorAvatarUrl: "",
  rating: 5,
  displayOrder: 0,
  isActive: true,
};

const TestimonialForm = ({ testimonial, onClose, onSaved }) => {
  const [form, setForm] = useState(testimonial ? { ...EMPTY_FORM, ...testimonial } : EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        rating: form.rating ? Number(form.rating) : null,
        displayOrder: Number(form.displayOrder) || 0,
      };
      if (testimonial) {
        await adminFetch(`/api/testimonials/${testimonial.id}`, { method: "PUT", body: payload });
      } else {
        await adminFetch("/api/testimonials", { method: "POST", body: payload });
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClasses =
    "bg-white/[0.04] border border-white/10 focus:border-brand-red rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors w-full";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-sm font-black uppercase text-white">
            {testimonial ? "Edit Testimonial" : "New Testimonial"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white bg-transparent border-none cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3">
          <textarea
            name="quote"
            value={form.quote}
            onChange={handleChange}
            required
            rows={3}
            placeholder="Testimonial quote"
            className={`${inputClasses} resize-none`}
          />
          <input name="authorName" value={form.authorName} onChange={handleChange} required placeholder="Author name" className={inputClasses} />
          <div className="grid grid-cols-2 gap-3">
            <input name="authorRole" value={form.authorRole || ""} onChange={handleChange} placeholder="Role" className={inputClasses} />
            <input name="authorCompany" value={form.authorCompany || ""} onChange={handleChange} placeholder="Company" className={inputClasses} />
          </div>
          <input name="authorAvatarUrl" value={form.authorAvatarUrl || ""} onChange={handleChange} placeholder="Avatar URL" className={inputClasses} />
          <div className="grid grid-cols-2 gap-3">
            <select name="rating" value={form.rating} onChange={handleChange} className={inputClasses}>
              {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} stars</option>)}
            </select>
            <input type="number" name="displayOrder" value={form.displayOrder} onChange={handleChange} placeholder="Display order" className={inputClasses} />
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
            Active (visible on site)
          </label>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 text-xs font-bold uppercase tracking-widest text-gray-400 border border-white/10 rounded-lg py-3 bg-transparent cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 text-xs font-bold uppercase tracking-widest text-white bg-brand-red hover:bg-red-600 disabled:opacity-60 rounded-lg py-3 border-none cursor-pointer transition-colors">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestimonialForm;
