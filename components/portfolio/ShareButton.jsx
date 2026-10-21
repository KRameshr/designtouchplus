"use client";

import { useState } from "react";

export default function ShareButton({ title }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined" && navigator?.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (_) {
      // Fallback if clipboard API is restricted
      try {
        const input = document.createElement("input");
        input.value = window.location.href;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        // Silently ignore
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-mono font-bold uppercase tracking-[0.14em] rounded-none border transition-colors cursor-pointer select-none ${
        copied
          ? "bg-brand-red border-brand-red text-white"
          : "bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white border-white/15 hover:border-white/30"
      }`}
      aria-label={`Share ${title || "project"} link`}
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 6L5 9L10 3" />
          </svg>
          <span>Link Copied</span>
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75">
            <circle cx="9" cy="3" r="1.5" />
            <circle cx="3" cy="6" r="1.5" />
            <circle cx="9" cy="9" r="1.5" />
            <path d="M4.3 6.6L7.7 8.4M7.7 3.6L4.3 5.4" />
          </svg>
          <span>Share Project</span>
        </>
      )}
    </button>
  );
}

