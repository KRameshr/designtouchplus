"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Star, User } from "lucide-react";
import { adminFetch } from "@/lib/auth";
import TestimonialForm from "@/components/admin/TestimonialForm";
import {
  AdminPageHeader,
  AdminButton,
  AdminAlert,
  AdminEmptyState,
  AdminBadge,
} from "@/components/admin/AdminUI";

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

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
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
      <AdminPageHeader
        title="Testimonials"
        description={`${items.length} testimonials`}
        action={
          <AdminButton
            variant="primary"
            onClick={() => setEditing({})}
          >
            <Plus className="w-4 h-4" /> New Testimonial
          </AdminButton>
        }
      />

      {error && <AdminAlert variant="error">{error}</AdminAlert>}

      {loading ? (
        <p className="text-gray-500 text-sm font-mono">Loading...</p>
      ) : items.length === 0 ? (
        <AdminEmptyState
          title="No testimonials yet"
          description="Add client reviews and recommendations to showcase credibility."
          action={
            <AdminButton variant="primary" onClick={() => setEditing({})}>
              <Plus className="w-4 h-4" /> Add Testimonial
            </AdminButton>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-[#0d0d0d] border border-white/10 rounded-none p-5 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Profile Avatar Preview with Sharp Edges (forced 0 radius) */}
                <div className="w-12 h-12 rounded-full !rounded-none border border-white/15 overflow-hidden bg-white/[0.04] shrink-0 flex items-center justify-center">
                  {item.authorAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.authorAvatarUrl}
                      alt={item.authorName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-brand-red/15 text-brand-red font-bold flex items-center justify-center text-sm">
                      {item.authorName ? (
                        item.authorName.charAt(0).toUpperCase()
                      ) : (
                        <User className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: item.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>

                    <AdminBadge variant="brand">
                      {item.serviceType || "General Feedback"}
                    </AdminBadge>

                    {item.isActive === false ? (
                      <AdminBadge variant="inactive">
                        Inactive
                      </AdminBadge>
                    ) : (
                      <AdminBadge variant="active">
                        Active
                      </AdminBadge>
                    )}

                    {item.displayOrder !== undefined && item.displayOrder !== null && (
                      <span className="text-[10px] font-mono text-gray-500">
                        Order: {item.displayOrder}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-300 mb-2 leading-relaxed">&ldquo;{item.quote}&rdquo;</p>
                  <p className="text-xs text-white font-bold">
                    {item.authorName}
                    <span className="text-gray-500 font-normal">
                      {" "}· {item.authorRole || "Client"}
                      {item.authorCompany && `, ${item.authorCompany}`}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setEditing(item)}
                  aria-label="Edit"
                  className="w-8 h-8 rounded-none bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center text-gray-300 hover:text-white cursor-pointer transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  aria-label="Delete"
                  className="w-8 h-8 rounded-none bg-white/[0.04] hover:bg-red-500/20 border border-white/10 disabled:opacity-50 flex items-center justify-center text-gray-300 hover:text-red-400 cursor-pointer transition-colors"
                >
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
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}
