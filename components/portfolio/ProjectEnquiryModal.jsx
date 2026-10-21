"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectEnquiryModal({ project }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(
    project?.contentType === "THUMBNAIL_DESIGN"
      ? "Thumbnail Design"
      : "Video Editing"
  );

  const projectKey = project?.slug || project?.id || "default";

  // Sync selectedService default whenever project prop changes
  useEffect(() => {
    setSelectedService(
      project?.contentType === "THUMBNAIL_DESIGN"
        ? "Thumbnail Design"
        : "Video Editing"
    );
  }, [project?.contentType]);

  // Delayed / Scroll Trigger
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Session-scoped dismissal check: if already dismissed on this project in this session, do not show
    try {
      if (sessionStorage.getItem(`dt_enquiry_dismissed_${projectKey}`) === "true") {
        return;
      }
    } catch (_) {
      // Ignore sessionStorage access errors
    }

    let triggered = false;

    const triggerPopup = () => {
      if (triggered) return;
      triggered = true;
      setIsOpen(true);
      window.removeEventListener("scroll", handleScroll);
    };

    // 1. Timer trigger: 2.5s after project detail mounts
    const timer = setTimeout(() => {
      triggerPopup();
    }, 2500);

    // 2. Scroll trigger: if user scrolls down > 250px before timer
    const handleScroll = () => {
      if (window.scrollY > 250) {
        clearTimeout(timer);
        triggerPopup();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [projectKey]);

  // Keyboard accessibility (Escape key) and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, projectKey]);

  const handleDismiss = () => {
    setIsOpen(false);
    document.body.style.overflow = "";
    try {
      sessionStorage.setItem(`dt_enquiry_dismissed_${projectKey}`, "true");
    } catch (_) {}
  };

  const handleContactClick = () => {
    handleDismiss();
    const params = new URLSearchParams();
    if (selectedService) params.set("service", selectedService);
    if (project?.title) params.set("project", project.title);
    router.push(`/contact?${params.toString()}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="enquiry-modal-title"
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={(e) => {
            // Close on backdrop click
            if (e.target === e.currentTarget) {
              handleDismiss();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-[#0c0c0c] border border-white/20 w-full max-w-lg p-6 sm:p-8 relative shadow-2xl rounded-none text-white my-auto max-h-[92vh] overflow-y-auto select-none"
          >
            {/* Top Header Row */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0" aria-hidden="true" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.22em] text-neutral-400">
                  COMMISSION // SERVICE INQUIRY
                </span>
              </div>

              {/* Close X Button */}
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Close inquiry modal"
                className="w-8 h-8 flex items-center justify-center border border-white/10 hover:border-white text-neutral-400 hover:text-white transition-colors cursor-pointer rounded-none bg-white/[0.02] hover:bg-white/[0.08]"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M2 2L10 10M10 2L2 10" strokeLinecap="square" />
                </svg>
              </button>
            </div>

            {/* Modal Heading & Narrative */}
            <div className="mt-5 mb-4">
              <h3
                id="enquiry-modal-title"
                className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-tight"
              >
                NEED CONTENT LIKE THIS?
              </h3>
              <p className="text-neutral-300 text-xs sm:text-sm font-normal leading-relaxed mt-2.5 font-sans">
                Looking for video editing, high-CTR thumbnail packaging, or end-to-end creative production engineered for maximum retention and clicks? Let&apos;s discuss your project.
              </p>
            </div>

            {/* Project Context Reference Badge */}
            {project?.title && (
              <div className="p-3 bg-[#141414] border border-white/10 mb-5 flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-500 uppercase tracking-wider text-[10px]">Referenced Work</span>
                <span className="text-brand-red font-bold uppercase truncate max-w-[230px]">
                  {project.title}
                </span>
              </div>
            )}

            {/* Service Selection Choices */}
            <div className="mb-6 space-y-2">
              <label className="block text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-400 mb-2">
                Select Inquiry Service
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: "Video Editing", label: "Video Editing" },
                  { id: "Thumbnail Design", label: "Thumbnail Design" },
                  { id: "Digital Content", label: "Content Creation" },
                ].map((srv) => {
                  const active = selectedService === srv.id;
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => setSelectedService(srv.id)}
                      className={`py-2 px-2.5 text-[10px] font-mono font-bold uppercase tracking-wider border rounded-none text-center transition-colors cursor-pointer ${
                        active
                          ? "bg-brand-red border-brand-red text-white"
                          : "bg-[#141414] border-white/10 text-neutral-400 hover:text-white hover:border-white/25"
                      }`}
                    >
                      {srv.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary & Secondary Action Buttons */}
            <div className="space-y-2 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={handleContactClick}
                className="w-full py-3.5 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-[0.16em] transition-colors rounded-none flex items-center justify-center gap-2 cursor-pointer border border-brand-red shadow-lg shadow-brand-red/10"
              >
                <span>CONTACT US</span>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
                </svg>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-full py-2.5 text-neutral-400 hover:text-white text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer bg-transparent border-none"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
