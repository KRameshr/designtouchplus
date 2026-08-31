"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { adminFetch } from "@/lib/auth";

const EMPTY_FORM = { clientName: "", logoUrl: "", websiteUrl: "", displayOrder: 0 };

const ClientForm = ({ client, onClose, onSaved }) => {
  const [form, setForm] = useState(client ? { ...EMPTY_FORM, ...client } : EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = { ...form, displayOrder: Number(form.displayOrder) || 0 };
      if (client) {
        await adminFetch(`/api/clients/${client.id}`, { method: "PUT", body: payload });
      } else {
        await adminFetch("/api/clients", { method: "POST", body: payload });
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
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-sm font-black uppercase text-white">
            {client ? "Edit Client" : "New Client"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white bg-transparent border-none cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3">
          <input name="clientName" value={form.clientName} onChange={handleChange} required placeholder="Client name" className={inputClasses} />
          <input name="logoUrl" value={form.logoUrl} onChange={handleChange} required placeholder="Logo URL" className={inputClasses} />
          <input name="websiteUrl" value={form.websiteUrl || ""} onChange={handleChange} placeholder="Website URL (optional)" className={inputClasses} />
          <input type="number" name="displayOrder" value={form.displayOrder} onChange={handleChange} placeholder="Display order" className={inputClasses} />

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

export default ClientForm;
