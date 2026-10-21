"use client";

import { useState, useEffect } from "react";
import { getMediaInventory, runMediaMigration } from "@/lib/api";

export default function MediaMigrationModal({ isOpen, onClose, onMigrated }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadInventory = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMediaInventory();
      setReport(data);
    } catch (err) {
      setError(err.message || "Failed to load media inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadInventory();
      setMessage("");
    }
  }, [isOpen]);

  const handleRun = async (dryRun) => {
    setRunning(true);
    setError("");
    setMessage("");
    try {
      const result = await runMediaMigration(dryRun);
      setReport(result);
      if (dryRun) {
        setMessage("Dry run completed successfully. Review the projected migration actions below.");
      } else {
        setMessage("Cloudinary migration executed successfully! Persisted media updated in database.");
        if (onMigrated) onMigrated();
      }
    } catch (err) {
      setError(err.message || "Migration execution failed.");
    } finally {
      setRunning(false);
    }
  };

  if (!isOpen) return null;

  const total = report?.totalProjects ?? 0;
  const items = report?.items ?? [];

  const cloudinaryCount = items.filter(
    (i) => i.sourceType === "CLOUDINARY" || i.status === "ALREADY_MIGRATED" || i.status === "MIGRATED"
  ).length;
  const localCount = items.filter((i) => i.sourceType === "LOCAL_FILE").length;
  const placeholderCount = items.filter((i) => i.sourceType === "EXTERNAL_PLACEHOLDER").length;
  const noMediaCount = items.filter((i) => i.sourceType === "NO_MEDIA").length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#0e0e0e] border border-white/15 rounded-none w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.08] bg-[#121212] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0" aria-hidden="true" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-white font-mono">
              Portfolio Media Inventory &amp; Cloudinary Migration
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white bg-transparent border border-transparent hover:border-white/10 rounded-none cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 2L10 10M10 2L2 10" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-start gap-2.5 text-xs text-red-400 bg-red-500/10 border border-red-500/25 rounded-none px-3.5 py-2.5">
              <span className="w-1.5 h-1.5 bg-brand-red rounded-none shrink-0 mt-1" />
              <span className="break-words min-w-0">{error}</span>
            </div>
          )}

          {message && (
            <div className="flex items-start gap-2.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-none px-3.5 py-2.5">
              <span className="w-1.5 h-1.5 bg-brand-green rounded-none shrink-0 mt-1" />
              <span className="break-words min-w-0">{message}</span>
            </div>
          )}

          {/* Inventory Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-3 bg-black/40 border border-white/[0.08]">
              <span className="text-[9px] uppercase tracking-wider text-neutral-500 block">Total Records</span>
              <span className="text-base font-bold text-white mt-1 block">{total}</span>
            </div>
            <div className="p-3 bg-black/40 border border-white/[0.08]">
              <span className="text-[9px] uppercase tracking-wider text-emerald-400 block">Cloudinary Assets</span>
              <span className="text-base font-bold text-emerald-400 mt-1 block">{cloudinaryCount}</span>
            </div>
            <div className="p-3 bg-black/40 border border-white/[0.08]">
              <span className="text-[9px] uppercase tracking-wider text-cyan-400 block">Local Files</span>
              <span className="text-base font-bold text-cyan-400 mt-1 block">{localCount}</span>
            </div>
            <div className="p-3 bg-black/40 border border-white/[0.08]">
              <span className="text-[9px] uppercase tracking-wider text-amber-400 block">Placeholders / None</span>
              <span className="text-base font-bold text-amber-400 mt-1 block">{placeholderCount + noMediaCount}</span>
            </div>
          </div>

          {/* Migration Actions Box */}
          <div className="p-4 bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-white block">
                Controlled Cloudinary Migration
              </span>
              <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
                Uploads real local disk assets to Cloudinary folders (`designtouch/portfolio` and `designtouch/thumbnails`) and updates database URLs.
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleRun(true)}
                disabled={loading || running}
                className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-white bg-white/[0.05] hover:bg-white/10 disabled:opacity-50 border border-white/15 cursor-pointer transition-colors"
              >
                {running ? "Scanning..." : "Dry Run"}
              </button>
              <button
                type="button"
                onClick={() => handleRun(false)}
                disabled={loading || running}
                className="px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-white bg-brand-red hover:bg-[#dc2626] disabled:opacity-50 border border-brand-red cursor-pointer transition-colors"
              >
                {running ? "Migrating..." : "Execute Migration"}
              </button>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="border border-white/[0.08] overflow-hidden">
            <div className="overflow-x-auto max-h-[50vh]">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-black/60 text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-neutral-400 sticky top-0 z-10">
                    <th className="py-2.5 px-3">Project Title</th>
                    <th className="py-2.5 px-3">Field</th>
                    <th className="py-2.5 px-3">Source Type</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Notes / Cloudinary Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-neutral-500 font-mono uppercase tracking-widest text-[11px]">
                        Analyzing portfolio media references...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-neutral-500 font-mono uppercase tracking-widest text-[11px]">
                        No portfolio records found.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => {
                      const isCloudinary = item.sourceType === "CLOUDINARY" || item.status === "ALREADY_MIGRATED" || item.status === "MIGRATED";
                      const isLocal = item.sourceType === "LOCAL_FILE";
                      const isPlaceholder = item.sourceType === "EXTERNAL_PLACEHOLDER";

                      return (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-white block">{item.projectTitle}</span>
                            <span className="text-[10px] font-mono text-neutral-400">
                              {item.categoryName} // {item.contentType}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 font-mono text-[10px] text-neutral-300">
                            {item.mediaField}
                          </td>

                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[9px] font-mono uppercase px-1.5 py-0.5 border inline-block ${
                                isCloudinary
                                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                                  : isLocal
                                  ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/30"
                                  : isPlaceholder
                                  ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
                                  : "text-neutral-500 bg-white/[0.03] border-white/10"
                              }`}
                            >
                              {item.sourceType}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 font-mono text-[10px]">
                            <span
                              className={
                                item.status === "MIGRATED" || item.status === "ALREADY_MIGRATED"
                                  ? "text-emerald-400"
                                  : item.status === "READY_FOR_MIGRATION"
                                  ? "text-cyan-400 font-bold"
                                  : item.status === "ERROR"
                                  ? "text-red-400"
                                  : "text-neutral-400"
                              }
                            >
                              {item.status}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 font-mono text-[10px] text-neutral-400 max-w-xs break-words">
                            {item.newUrl ? (
                              <div className="text-emerald-400 truncate max-w-xs mb-0.5" title={item.newUrl}>
                                {item.newUrl}
                              </div>
                            ) : null}
                            <span>{item.notes}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-white/[0.08] bg-[#121212] shrink-0">
          <button
            type="button"
            onClick={loadInventory}
            disabled={loading || running}
            className="text-xs font-mono uppercase text-neutral-400 hover:text-white bg-transparent border border-white/10 px-3 py-1.5 cursor-pointer"
          >
            Refresh
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-mono uppercase tracking-wider text-white border border-white/15 bg-transparent hover:bg-white/[0.05] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

