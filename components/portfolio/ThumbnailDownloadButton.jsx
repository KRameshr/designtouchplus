"use client";

import { useState } from "react";

export default function ThumbnailDownloadButton({ project }) {
  const [downloading, setDownloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleDownload = async () => {
    const rawUrl = project?.imageUrl || project?.thumbnailUrl;
    if (!rawUrl) {
      setErrorMsg("No downloadable image asset available.");
      return;
    }

    setDownloading(true);
    setErrorMsg("");

    const baseTitle = (project.title || "thumbnail")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const safeTitle = baseTitle || "thumbnail";

    // Determine extension from URL, defaulting to png
    let ext = "png";
    const lowerUrl = rawUrl.toLowerCase();
    if (lowerUrl.includes(".jpg") || lowerUrl.includes(".jpeg")) ext = "jpg";
    else if (lowerUrl.includes(".webp")) ext = "webp";
    else if (lowerUrl.includes(".png")) ext = "png";

    const filename = `${safeTitle}.${ext}`;

    try {
      // 1. Primary: fetch blob directly with CORS (Cloudinary responds with Access-Control-Allow-Origin: *)
      const res = await fetch(rawUrl, { mode: "cors" });
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

    } catch (directErr) {
      console.warn("Direct blob download failed, falling back to backend download stream:", directErr);

      try {
        // 2. Secondary fallback: backend streaming proxy endpoint
        const backendEndpoint = `/api/portfolio/${project.id || project.slug}/download-image`;
        const testRes = await fetch(backendEndpoint, { method: "HEAD" });
        if (testRes.ok) {
          window.location.href = backendEndpoint;
          return;
        }

        // 3. Third fallback: Cloudinary attachment transformation
        if (rawUrl.includes("res.cloudinary.com") && rawUrl.includes("/image/upload/")) {
          const cldAttachmentUrl = rawUrl.replace(
            "/image/upload/",
            `/image/upload/fl_attachment:${safeTitle}/`
          );
          window.location.href = cldAttachmentUrl;
          return;
        }

        setErrorMsg("Unable to download image. Please try again or open Google Drive.");
      } catch (fallbackErr) {
        setErrorMsg("Download failed. Please try again or open Google Drive.");
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-[0.16em] border border-brand-red rounded-none transition-colors cursor-pointer select-none disabled:opacity-60"
        aria-label={`Download image for ${project?.title || "project"}`}
      >
        {downloading ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Downloading...</span>
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download Image</span>
          </>
        )}
      </button>

      {errorMsg && (
        <span className="text-[10px] font-mono text-red-400 mt-1 block">
          {errorMsg}
        </span>
      )}
    </div>
  );
}

