"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { adminFetch } from "@/lib/auth";
import PortfolioForm from "@/components/admin/PortfolioForm";

export default function AdminPortfolioPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingItem, setEditingItem] = useState(null); // null = closed, {} = new, {...} = edit
  const [deletingId, setDeletingId] = useState(null);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await adminFetch("/api/portfolio/admin/all");
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await adminFetch(`/api/portfolio/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaved = () => {
    setEditingItem(null);
    loadItems();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-black uppercase mb-1">Portfolio</h1>
          <p className="text-gray-500 text-sm">{items.length} items</p>
        </div>
        <button
          onClick={() => setEditingItem({})}
          className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-full border-none cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" /> New Item
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500 text-sm">No portfolio items yet — click &quot;New Item&quot; to add one.</p>
      ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">Title</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">Type</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">Category</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">Featured</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-white/[0.06] last:border-0">
                  <td className="px-4 py-3 text-white font-medium">{item.title}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{item.contentType?.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{item.category?.replace("_", " ") || "—"}</td>
                  <td className="px-4 py-3">
                    {item.isFeatured && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingItem(item)}
                        aria-label="Edit"
                        className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-gray-300 border-none cursor-pointer transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        aria-label="Delete"
                        className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-red-500/20 disabled:opacity-50 flex items-center justify-center text-gray-300 hover:text-red-400 border-none cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingItem !== null && (
        <PortfolioForm
          item={Object.keys(editingItem).length ? editingItem : null}
          onClose={() => setEditingItem(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
