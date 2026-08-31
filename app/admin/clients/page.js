"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/auth";
import ClientForm from "@/components/admin/ClientForm";

export default function AdminClientsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await adminFetch("/api/clients/admin/all"));
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
      await adminFetch(`/api/clients/${id}`, { method: "DELETE" });
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
          <h1 className="text-xl font-black uppercase mb-1">Clients</h1>
          <p className="text-gray-500 text-sm">{items.length} clients</p>
        </div>
        <button onClick={() => setEditing({})} className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-full border-none cursor-pointer transition-colors">
          <Plus className="w-4 h-4" /> New Client
        </button>
      </div>

      {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500 text-sm">No clients yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.logoUrl} alt={item.clientName} className="h-6 w-auto object-contain mb-3" />
              <p className="text-xs font-bold text-white mb-3">{item.clientName}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditing(item)} aria-label="Edit" className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-gray-300 border-none cursor-pointer">
                  <Pencil className="w-3 h-3" />
                </button>
                <button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id} aria-label="Delete" className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-red-500/20 disabled:opacity-50 flex items-center justify-center text-gray-300 hover:text-red-400 border-none cursor-pointer">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <ClientForm
          client={Object.keys(editing).length ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}
