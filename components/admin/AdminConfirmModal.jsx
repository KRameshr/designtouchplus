"use client";

import { AlertTriangle, X } from "lucide-react";

export default function AdminConfirmModal({
  isOpen,
  title = "Confirm Delete",
  message = "Are you sure you want to proceed? This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div
        className="bg-[#111111] border border-white/15 w-full max-w-md p-6 relative rounded-none shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <button
          onClick={onCancel}
          disabled={loading}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-neutral-400 hover:text-white bg-transparent border-none cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3
              id="confirm-modal-title"
              className="text-base font-display font-black uppercase tracking-tight text-white mb-1"
            >
              {title}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-none cursor-pointer transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-white bg-brand-red hover:bg-red-600 border border-brand-red disabled:opacity-50 rounded-none cursor-pointer transition-colors"
          >
            {loading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

