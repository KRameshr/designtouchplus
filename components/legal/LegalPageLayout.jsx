"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, ArrowUpRight, ShieldCheck, FileText } from "lucide-react";

/**
 * LegalPageLayout
 *
 * Premium dark editorial layout for DesignTouch+ legal and compliance pages:
 * - Consistent container with Navbar and Footer (max-w-7xl mx-auto px-6)
 * - Sharp rectangular geometry (rounded-none, border-radius: 0px)
 * - Deep dark background (#080808) with subtle dividers (border-white/[0.08])
 * - Responsive desktop sticky Table of Contents with active section tracking
 * - Mobile quick-jump navigation menu
 * - Official compliance metadata banner
 */
export default function LegalPageLayout({
  eyebrow = "Legal & Compliance",
  title,
  subtitle,
  lastUpdated = "November 2026",
  effectiveDate = "January 1, 2025",
  jurisdiction = "Republic of India",
  tableOfContents = [],
  children,
}) {
  const [activeId, setActiveId] = useState(tableOfContents[0]?.id || "");
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  // IntersectionObserver for tracking active section while scrolling
  useEffect(() => {
    if (!tableOfContents || tableOfContents.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-100px 0px -60% 0px",
        threshold: 0,
      }
    );

    tableOfContents.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [tableOfContents]);

  return (
    <div className="min-h-screen bg-[#080808] text-white pt-28 sm:pt-32 pb-24">
      {/* Container aligned with Navbar and Footer */}
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="border-b border-white/[0.08] pb-10 mb-12">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#111111] border border-white/10 rounded-none text-xs font-mono uppercase tracking-wider text-neutral-300 mb-6">
            <span className="w-1.5 h-1.5 bg-brand-red"></span>
            <span>{eyebrow}</span>
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="font-sans text-base sm:text-lg text-neutral-400 max-w-3xl leading-relaxed mb-6">
              {subtitle}
            </p>
          )}

          {/* Document Metadata Badges */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-mono text-xs text-neutral-400 pt-2">
            <div className="px-3 py-1.5 bg-[#111111] border border-white/[0.08] rounded-none flex items-center gap-2">
              <span className="text-neutral-500">Last Revised:</span>
              <span className="text-white font-medium">{lastUpdated}</span>
            </div>
            <div className="px-3 py-1.5 bg-[#111111] border border-white/[0.08] rounded-none flex items-center gap-2">
              <span className="text-neutral-500">Effective:</span>
              <span className="text-white font-medium">{effectiveDate}</span>
            </div>
            <div className="px-3 py-1.5 bg-[#111111] border border-white/[0.08] rounded-none flex items-center gap-2">
              <span className="text-neutral-500">Jurisdiction:</span>
              <span className="text-brand-green font-medium">{jurisdiction}</span>
            </div>
          </div>
        </div>

        {/* Mobile Quick-Jump Accordion */}
        {tableOfContents.length > 0 && (
          <div className="lg:hidden mb-8 border border-white/10 bg-[#111111] rounded-none">
            <button
              type="button"
              onClick={() => setMobileTocOpen(!mobileTocOpen)}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left text-sm font-sans font-medium text-white cursor-pointer bg-transparent border-0"
              aria-expanded={mobileTocOpen}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-red" />
                <span>Jump to Section ({tableOfContents.length} Topics)</span>
              </div>
              {mobileTocOpen ? (
                <ChevronUp className="w-4 h-4 text-neutral-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              )}
            </button>

            {mobileTocOpen && (
              <div className="border-t border-white/10 px-4 py-3 space-y-1.5 bg-[#0d0d0d]">
                {tableOfContents.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setMobileTocOpen(false)}
                    className={`block py-1.5 text-xs font-sans transition-colors ${
                      activeId === item.id
                        ? "text-brand-red font-medium"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {item.number ? `${item.number}. ` : ""}
                    {item.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main 2-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Desktop Sticky Table of Contents Sidebar */}
          {tableOfContents.length > 0 && (
            <aside className="hidden lg:block lg:col-span-4 sticky top-28 self-start">
              <div className="border border-white/10 bg-[#111111] rounded-none p-6">
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/10">
                  <h3 className="font-display text-sm font-bold tracking-wider uppercase text-white">
                    Table of Contents
                  </h3>
                  <span className="text-[10px] font-mono uppercase text-brand-red font-bold">
                    {tableOfContents.length} Sections
                  </span>
                </div>

                <nav className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                  {tableOfContents.map((item) => {
                    const isActive = activeId === item.id;
                    return (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`group flex items-start gap-2.5 py-1.5 px-2 text-xs font-sans transition-all duration-150 rounded-none border-l-2 ${
                          isActive
                            ? "border-brand-red bg-white/[0.03] text-white font-medium"
                            : "border-transparent text-neutral-400 hover:text-white hover:border-neutral-600"
                        }`}
                      >
                        {item.number && (
                          <span
                            className={`font-mono text-[11px] shrink-0 ${
                              isActive ? "text-brand-red font-bold" : "text-neutral-500"
                            }`}
                          >
                            {item.number}.
                          </span>
                        )}
                        <span className="leading-snug">{item.title}</span>
                      </a>
                    );
                  })}
                </nav>

                {/* Quick Help Card */}
                <div className="mt-6 pt-5 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-white">
                    <ShieldCheck className="w-4 h-4 text-brand-green" />
                    <span>Questions or Inquiries?</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-sans leading-relaxed mb-3">
                    Have questions about our terms, privacy practices, or custom enterprise agreements?
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1.5 text-xs font-sans text-brand-red hover:text-white transition-colors duration-150 font-medium"
                  >
                    <span>Contact Legal &amp; Client Services</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </aside>
          )}

          {/* Main Legal Content Column */}
          <main
            className={`${
              tableOfContents.length > 0 ? "lg:col-span-8" : "lg:col-span-12"
            } space-y-12 font-sans`}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

