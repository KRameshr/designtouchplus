"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Star, ExternalLink, Globe } from "lucide-react";
import { adminFetch } from "@/lib/auth";
import { toggleClientActive, toggleClientFeatured } from "@/lib/api";
import ClientForm from "@/components/admin/ClientForm";
import { AdminPageHeader, AdminButton, AdminAlert, AdminEmptyState } from "@/components/admin/AdminUI";

const AdminClientCard = ({ item, onEdit, onDelete, onToggleFeatured, onToggleActive, deletingId }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-[#0d0d0d] border border-white/10 hover:border-white/20 rounded-none p-4 flex flex-col justify-between transition-all duration-200">
      <div>
        {/* Top Badges: Featured and Active Indicators */}
        <div className="flex items-center justify-between gap-1.5 mb-3">
          <button
            type="button"
            onClick={() => onToggleFeatured(item.id)}
            title="Click to toggle featured status"
            className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none transition-colors cursor-pointer border ${
              item.isFeatured
                ? "bg-brand-red/15 text-brand-red border-brand-red/30 hover:bg-brand-red/25"
                : "bg-white/[0.03] text-gray-500 border-white/[0.08] hover:text-gray-300 hover:bg-white/[0.08]"
            }`}
          >
            <Star className={`w-2.5 h-2.5 ${item.isFeatured ? "fill-brand-red" : ""}`} />
            {item.isFeatured ? "Featured" : "Standard"}
          </button>

          <button
            type="button"
            onClick={() => onToggleActive(item.id)}
            title="Click to toggle active status"
            className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none transition-colors cursor-pointer border ${
              item.isActive !== false
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                : "bg-white/5 text-gray-500 border-white/10 hover:bg-white/10 hover:text-gray-400"
            }`}
          >
            {item.isActive !== false ? "Active" : "Inactive"}
          </button>
        </div>

        {/* Dedicated Logo Container with Premium Dark Appearance */}
        <div className="h-28 w-full bg-[#0a0a0a] border border-white/[0.08] rounded-none p-3 flex items-center justify-center mb-3 relative overflow-hidden group">
          {item.logoUrl && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.logoUrl}
              alt={item.clientName}
              onError={() => setImgError(true)}
              className="max-h-14 max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="text-xs font-mono font-bold tracking-widest text-white/70 uppercase">
              {item.clientName}
            </span>
          )}
        </div>

        {/* Client Name & Metadata */}
        <div className="mb-3">
          <p className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
            {item.clientName}
          </p>
          <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
            <span className="font-mono">Order: #{item.displayOrder ?? 0}</span>
            {item.websiteUrl && (
              <a
                href={item.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={item.websiteUrl}
                className="inline-flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
              >
                <Globe className="w-3 h-3" />
                <span className="truncate max-w-[90px]">Website</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Card Actions: Edit and Delete */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
        <button
          onClick={() => onEdit(item)}
          aria-label="Edit"
          className="w-8 h-8 rounded-none bg-white/[0.04] hover:bg-white/[0.1] flex items-center justify-center text-gray-300 hover:text-white border border-white/10 cursor-pointer transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          disabled={deletingId === item.id}
          aria-label="Delete"
          className="w-8 h-8 rounded-none bg-white/[0.04] hover:bg-red-500/20 disabled:opacity-50 flex items-center justify-center text-gray-300 hover:text-red-400 border border-white/10 cursor-pointer transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default function AdminClientsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminFetch("/api/clients/admin/all");
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleFeatured = async (id) => {
    try {
      const updated = await toggleClientFeatured(id);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isFeatured: updated.isFeatured } : item
        )
      );
    } catch (err) {
      setError(err.message || "Failed to update featured status.");
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const updated = await toggleClientActive(id);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isActive: updated.isActive } : item
        )
      );
    } catch (err) {
      setError(err.message || "Failed to update active status.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this client?")) {
      return;
    }
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

  const featuredCount = items.filter((i) => i.isFeatured && i.isActive !== false).length;

  return (
    <div>
      <AdminPageHeader
        title="Clients"
        description={`${items.length} ${items.length === 1 ? "client" : "clients"} (${featuredCount} featured on homepage)`}
        action={
          <AdminButton
            variant="primary"
            onClick={() => setEditing({})}
          >
            <Plus className="w-4 h-4" /> New Client
          </AdminButton>
        }
      />

      {error && <AdminAlert variant="error">{error}</AdminAlert>}

      {loading ? (
        <p className="text-gray-500 text-sm font-mono">Loading...</p>
      ) : items.length === 0 ? (
        <AdminEmptyState
          title="No clients yet"
          description="Add partner and client brands to showcase on your website."
          action={
            <AdminButton variant="primary" onClick={() => setEditing({})}>
              <Plus className="w-4 h-4" /> Create First Client
            </AdminButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <AdminClientCard
              key={item.id}
              item={item}
              onEdit={setEditing}
              onDelete={handleDelete}
              onToggleFeatured={handleToggleFeatured}
              onToggleActive={handleToggleActive}
              deletingId={deletingId}
            />
          ))}
        </div>
      )}

      {editing !== null && (
        <ClientForm
          client={Object.keys(editing).length ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}
