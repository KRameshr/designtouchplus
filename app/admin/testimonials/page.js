"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { adminFetch } from "@/lib/auth";
import TestimonialForm from "@/components/admin/TestimonialForm";

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await adminFetch("/api/testimonials/admin/all"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await adminFetch(`/api/testimonials/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-black uppercase mb-1">Testimonials</h1>
          <p className="text-gray-500 text-sm">{items.length} testimonials</p>
        </div>
        <button onClick={() => setEditing({})} className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-full border-none cursor-pointer transition-colors">
          <Plus className="w-4 h-4" /> New Testimonial
        </button>
      </div>

      {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500 text-sm">No testimonials yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-5 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: item.rating || 0 }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-300 mb-2">&ldquo;{item.quote}&rdquo;</p>
                <p className="text-xs text-white font-bold">
                  {item.authorName}
                  <span className="text-gray-500 font-normal"> · {item.authorRole}{item.authorCompany && `, ${item.authorCompany}`}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setEditing(item)} aria-label="Edit" className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-gray-300 border-none cursor-pointer">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id} aria-label="Delete" className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-red-500/20 disabled:opacity-50 flex items-center justify-center text-gray-300 hover:text-red-400 border-none cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <TestimonialForm
          testimonial={Object.keys(editing).length ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}
