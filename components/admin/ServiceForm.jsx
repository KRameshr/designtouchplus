"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { adminFetch } from "@/lib/auth";

const COLOR_THEMES = ["red", "green", "orange", "purple", "blue", "yellow"];
const ICON_KEYS = ["video", "motion", "social", "youtube", "graphic", "branding"];

const EMPTY_FORM = {
  icon: "video",
  title: "",
  description: "",
  featuresText: "",
  colorTheme: "red",
  slug: "",
  orderNumber: "",
  displayOrder: 0,
};

const slugify = (text) =>
  text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

const ServiceForm = ({ service, onClose, onSaved }) => {
  const [form, setForm] = useState(
    service
      ? { ...EMPTY_FORM, ...service, featuresText: (service.features || []).join("\n") }
      : EMPTY_FORM
  );
  const [slugTouched, setSlugTouched] = useState(Boolean(service));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
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
        // One feature per line in the textarea -> array, dropping blank lines
        features: form.featuresText.split("\n").map((f) => f.trim()).filter(Boolean),
        colorTheme: form.colorTheme,
        slug: form.slug,
        orderNumber: form.orderNumber,
        displayOrder: Number(form.displayOrder) || 0,
      };
      if (service) {
        await adminFetch(`/api/services/${service.id}`, { method: "PUT", body: payload });
      } else {
        await adminFetch("/api/services", { method: "POST", body: payload });
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
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-sm font-black uppercase text-white">
            {service ? "Edit Service" : "New Service"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white bg-transparent border-none cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Title (e.g. Video Editing)"
            className={inputClasses}
          />

          <div>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              required
              placeholder="url-friendly-slug"
              className={inputClasses}
            />
            <p className="text-[10px] text-gray-600 mt-1">/services/{form.slug || "..."}</p>
          </div>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={2}
            placeholder="Short description"
            className={`${inputClasses} resize-none`}
          />

          <div>
            <textarea
              name="featuresText"
              value={form.featuresText}
              onChange={handleChange}
              rows={4}
              placeholder={"One feature per line, e.g.\nLong-form Editing\nShort-form / Reels"}
              className={`${inputClasses} resize-none`}
            />
            <p className="text-[10px] text-gray-600 mt-1">One bullet point per line</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select name="icon" value={form.icon} onChange={handleChange} className={inputClasses}>
              {ICON_KEYS.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <select name="colorTheme" value={form.colorTheme} onChange={handleChange} className={inputClasses}>
              {COLOR_THEMES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              name="orderNumber"
              value={form.orderNumber || ""}
              onChange={handleChange}
              placeholder="Order # (e.g. 01)"
              className={inputClasses}
            />
            <input
              type="number"
              name="displayOrder"
              value={form.displayOrder}
              onChange={handleChange}
              placeholder="Display order"
              className={inputClasses}
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-xs font-bold uppercase tracking-widest text-gray-400 border border-white/10 rounded-lg py-3 bg-transparent cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 text-xs font-bold uppercase tracking-widest text-white bg-brand-red hover:bg-red-600 disabled:opacity-60 rounded-lg py-3 border-none cursor-pointer transition-colors"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;
