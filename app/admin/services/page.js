"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/auth";
import ServiceForm from "@/components/admin/ServiceForm";

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingService, setEditingService] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await adminFetch("/api/services/admin/all");
      setServices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await adminFetch(`/api/services/${id}`, { method: "DELETE" });
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaved = () => {
    setEditingService(null);
    loadServices();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-black uppercase mb-1">Services</h1>
          <p className="text-gray-500 text-sm">{services.length} services</p>
        </div>
        <button
          onClick={() => setEditingService({})}
          className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-full border-none cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" /> New Service
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : services.length === 0 ? (
        <p className="text-gray-500 text-sm">No services yet — click &quot;New Service&quot; to add one.</p>
      ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">#</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">Title</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">Slug</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">Color</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-b border-white/[0.06] last:border-0">
                  <td className="px-4 py-3 text-gray-500 text-xs">{service.orderNumber}</td>
                  <td className="px-4 py-3 text-white font-medium">{service.title}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{service.slug}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: service.colorTheme }} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingService(service)}
                        aria-label="Edit"
                        className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-gray-300 border-none cursor-pointer transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        disabled={deletingId === service.id}
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

      {editingService !== null && (
        <ServiceForm
          service={Object.keys(editingService).length ? editingService : null}
          onClose={() => setEditingService(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
