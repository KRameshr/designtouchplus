"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import {
  SUPPORTED_SOCIAL_PLATFORMS,
  validateSocialUrl,
  getSocialPlatformIcon,
  isSameSocialPlatform,
} from "@/lib/socialPlatforms";

export default function SocialLinkModal({
  isOpen,
  link,
  existingLinks = [],
  onClose,
  onSave,
}) {
  const isEditing = Boolean(link);

  const [platform, setPlatform] = useState("X (Twitter)");
  const [url, setUrl] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (link) {
        setPlatform(link.platform || "X (Twitter)");
        setUrl(link.url || "");
        setEnabled(link.enabled !== false);
      } else {
        // Choose first supported platform that isn't already added
        const available = SUPPORTED_SOCIAL_PLATFORMS.find(
          (p) => !existingLinks.some((l) => isSameSocialPlatform(l.platform, p.platform))
        );
        setPlatform(available ? available.platform : "X (Twitter)");
        setUrl(available ? available.defaultUrl : "");
        setEnabled(true);
      }
      setError("");
    }
  }, [isOpen, link, existingLinks]);

  if (!isOpen) return null;

  const currentPlatformMeta = SUPPORTED_SOCIAL_PLATFORMS.find((p) =>
    isSameSocialPlatform(p.platform, platform)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const trimmedUrl = (url || "").trim();
    if (!trimmedUrl) {
      setError("Please enter a profile URL.");
      return;
    }

    if (!validateSocialUrl(trimmedUrl, platform)) {
      if (
        platform.toLowerCase().includes("twitter") ||
        platform.toLowerCase() === "x"
      ) {
        setError(
          "Please enter a valid X (Twitter) profile URL, e.g. https://x.com/username or https://twitter.com/username"
        );
      } else {
        setError("Please enter a valid URL starting with http:// or https://");
      }
      return;
    }

    // Check duplicate platform
    const isDuplicate = existingLinks.some((item) => {
      if (isEditing && item.id === link?.id) return false;
      return isSameSocialPlatform(item.platform, platform);
    });

    if (isDuplicate) {
      setError(
        `${platform} is already added. Edit the existing entry or choose another platform.`
      );
      return;
    }

    onSave({
      id: link?.id || `social-${Date.now()}-${platform.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      platform,
      url: trimmedUrl,
      enabled,
    });
    onClose();
  };

  const SelectedIcon = getSocialPlatformIcon(platform);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-white/15 rounded-none w-full max-w-lg p-6 relative shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red rounded-none">
              <SelectedIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-display font-black uppercase tracking-wider text-white">
                {isEditing ? "Edit Social Link" : "Add Social Media Link"}
              </h2>
              <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                Configure profile URL and visibility for this channel.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-1"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-brand-red/30 rounded-none flex items-center gap-2 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-brand-red shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Platform selection */}
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-white mb-1.5">
              Social Platform <span className="text-brand-red">*</span>
            </label>
            <select
              value={platform}
              onChange={(e) => {
                const selected = e.target.value;
                setPlatform(selected);
                const meta = SUPPORTED_SOCIAL_PLATFORMS.find((p) =>
                  isSameSocialPlatform(p.platform, selected)
                );
                if (meta && (!url || url.includes("designtouchplus"))) {
                  setUrl(meta.defaultUrl || "");
                }
              }}
              className="w-full bg-[#181818] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2.5 text-xs font-mono text-white outline-none cursor-pointer"
            >
              {SUPPORTED_SOCIAL_PLATFORMS.map((p) => {
                const isAlreadyUsed = existingLinks.some((item) => {
                  if (isEditing && item.id === link?.id) return false;
                  return isSameSocialPlatform(item.platform, p.platform);
                });

                return (
                  <option
                    key={p.platform}
                    value={p.platform}
                    disabled={isAlreadyUsed}
                    className="bg-[#181818] text-white py-1"
                  >
                    {p.label} {isAlreadyUsed ? "(Already Added)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Profile URL */}
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-white mb-1.5">
              Profile URL <span className="text-brand-red">*</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={currentPlatformMeta?.placeholder || "https://..."}
              required
              className="w-full bg-[#181818] border border-white/10 focus:border-brand-red rounded-none px-3.5 py-2.5 text-xs font-mono text-white placeholder-neutral-500 outline-none"
            />
            <p className="text-[10px] text-neutral-500 font-mono mt-1">
              Must be a complete web link (e.g. {currentPlatformMeta?.placeholder}).
            </p>
          </div>

          {/* Enable / Disable toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.08] cursor-pointer rounded-none select-none">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-4 h-4 accent-brand-red rounded-none cursor-pointer"
              />
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white block">
                  Enable on Public Site
                </span>
                <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">
                  Display this channel icon in the footer and contact page.
                </span>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 hover:text-white bg-transparent border border-white/10 rounded-none cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-white bg-brand-red hover:bg-[#dc2626] rounded-none border-none cursor-pointer transition-colors shadow-[0_4px_12px_rgba(239,68,68,0.3)]"
            >
              {isEditing ? "Update Link" : "Add Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
