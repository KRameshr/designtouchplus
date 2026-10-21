"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";

const CATEGORY_MAP = {
  YOUTUBE: "YouTube",
  COMMERCIAL: "Commercial",
  REAL_ESTATE: "Real Estate",
  INSTAGRAM_REELS: "Reels / 9:16",
  MOTION_GRAPHICS: "Motion Graphics",
  CORPORATE: "Corporate",
};

function formatCategory(category) {
  if (!category) return "Video Project";
  return CATEGORY_MAP[category] || category.replace(/_/g, " ");
}

export function getVideoAspectClass(ratio) {
  if (ratio === "9:16" || ratio === "RATIO_9_16") return "aspect-[9/16]";
  if (ratio === "1:1" || ratio === "RATIO_1_1") return "aspect-square";
  if (ratio === "4:5" || ratio === "RATIO_4_5") return "aspect-[4/5]";
  return "aspect-[16/9]";
}

const VIDEO_PAGE_SIZE = 12;

export default function PortfolioGrid({ items = [], categories = [] }) {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [sortLatest, setSortLatest] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [playingId, setPlayingId] = useState(null);
  const videoRefs = useRef({});

  const handleCategoryChange = (val) => {
    setActiveCategory(val);
    setCurrentPage(1);
  };

  const handleSortChange = () => {
    setSortLatest((prev) => !prev);
    setCurrentPage(1);
  };

  const filterTabs = useMemo(() => {
    const tabs = [{ value: "ALL", label: "All Work" }];
    if (Array.isArray(categories) && categories.length > 0) {
      categories.forEach((cat) => {
        tabs.push({
          value: cat.id || cat.slug,
          id: cat.id,
          slug: cat.slug,
          label: cat.name,
        });
      });
    }
    return tabs;
  }, [categories]);

  const filtered = useMemo(() => {
    let result = items;
    if (activeCategory !== "ALL") {
      const activeTab = filterTabs.find((t) => t.value === activeCategory);
      result = items.filter((item) => {
        if (item.categoryId && item.categoryId === activeCategory) return true;
        if (item.categorySlug && item.categorySlug === activeCategory) return true;
        if (activeTab) {
          if (item.categoryId && activeTab.id && item.categoryId === activeTab.id) return true;
          if (item.categorySlug && activeTab.slug && item.categorySlug === activeTab.slug) return true;
          if (item.categoryName && activeTab.label && item.categoryName.toLowerCase() === activeTab.label.toLowerCase()) return true;
          if (item.category && activeTab.slug) {
            const legacySlug = item.category.toLowerCase().replace(/_/g, "-");
            if (legacySlug === activeTab.slug) return true;
          }
        }
        return false;
      });
    }

    if (sortLatest) {
      result = [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return result;
  }, [items, activeCategory, sortLatest, filterTabs]);

  const totalProjects = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalProjects / VIDEO_PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const startIndex = (safePage - 1) * VIDEO_PAGE_SIZE;
  const endIndex = Math.min(startIndex + VIDEO_PAGE_SIZE, totalProjects);
  const paginatedProjects = useMemo(() => {
    return filtered.slice(startIndex, endIndex);
  }, [filtered, startIndex, endIndex]);

  const goToPage = (pageNumber) => {
    const p = Math.max(1, Math.min(pageNumber, totalPages));
    setCurrentPage(p);
    if (typeof window !== "undefined") {
      const el = document.getElementById("video-editing");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const rangeIndicator =
    totalProjects === 0
      ? "0 projects"
      : `Showing ${startIndex + 1}–${endIndex} of ${totalProjects} ${
          totalProjects === 1 ? "project" : "projects"
        }`;

  const togglePlay = (projectId) => {
    const currentVideo = videoRefs.current[projectId];
    if (!currentVideo) return;

    if (playingId === projectId) {
      currentVideo.pause();
      setPlayingId(null);
    } else {
      if (playingId && videoRefs.current[playingId]) {
        videoRefs.current[playingId].pause();
      }
      currentVideo.play().catch(() => {});
      setPlayingId(projectId);
    }
  };

  return (
    <section id="video-editing" className="bg-[#0a0a0a] text-white px-4 sm:px-6 py-12 sm:py-16 border-b border-white/[0.08] scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        {/* Filter Navigation Bar & Sort Action */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 mb-10 pb-6 border-b border-white/[0.08]">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {filterTabs.map(({ value, label }) => {
              const active = activeCategory === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleCategoryChange(value)}
                  className={`text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.16em] px-3.5 py-2.5 rounded-none border transition-colors cursor-pointer select-none ${
                    active
                      ? "bg-brand-red border-brand-red text-white"
                      : "bg-[#111111] border-white/10 text-neutral-400 hover:text-white hover:border-white/25"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Sort Controller */}
          <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
              {filtered.length} {filtered.length === 1 ? "PROJECT" : "PROJECTS"}
            </span>

            <button
              type="button"
              onClick={handleSortChange}
              className={`inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider px-3.5 py-2 border rounded-none transition-colors cursor-pointer ${
                sortLatest
                  ? "border-brand-red text-white bg-brand-red/10"
                  : "border-white/15 text-neutral-400 hover:text-white hover:border-white/30 bg-[#111]"
              }`}
            >
              <span>{sortLatest ? "Sorted: Latest" : "Sort: Default"}</span>
              <svg
                width="10"
                height="10"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`transition-transform duration-200 ${sortLatest ? "rotate-180" : ""}`}
                aria-hidden="true"
              >
                <path
                  d="M2.5 4.5L6 8L9.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="square"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Section Header: VIDEO EDITING */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0" aria-hidden="true" />
            <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-white">
              Video Editing
            </h2>
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest ml-1 hidden sm:inline-block">
              // COMMERCIAL &amp; DIGITAL NARRATIVES
            </span>
          </div>

          <div className="flex-1 h-px bg-white/[0.08] mx-2 hidden md:block" />

          <Link
            href="/contact"
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-neutral-400 hover:text-white transition-colors no-underline shrink-0"
          >
            <span>Commission an Edit</span>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" />
            </svg>
          </Link>
        </div>

        {/* 4-Column Editorial Portfolio Grid */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-[#0d0d0d] border border-white/[0.08] rounded-none">
            <p className="text-neutral-500 text-xs font-mono uppercase tracking-widest">
              No projects archived under this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {paginatedProjects.map((project, idx) => {
              const isPlaying = playingId === project.id;
              const hasVideo = Boolean(project.videoUrl);
              const mediaSrc = project.thumbnailUrl || project.imageUrl;

              return (
                <article
                  key={project.id || idx}
                  className="flex flex-col h-full bg-[#0c0c0c] border border-white/10 hover:border-white/25 transition-all duration-200 rounded-none group"
                >
                  {/* Consistent 16:9 Video Frame across all cards */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-black border-b border-white/[0.08] select-none">
                    {hasVideo ? (
                      <>
                        <video
                          ref={(el) => {
                            if (el) videoRefs.current[project.id] = el;
                          }}
                          src={project.videoUrl}
                          poster={mediaSrc || undefined}
                          playsInline
                          muted
                          preload="metadata"
                          onEnded={() => setPlayingId(null)}
                          onPause={() => {
                            if (playingId === project.id) setPlayingId(null);
                          }}
                          onPlay={() => {
                            if (playingId !== project.id) setPlayingId(project.id);
                          }}
                          onClick={() => togglePlay(project.id)}
                          className="w-full h-full object-contain bg-black cursor-pointer"
                          aria-label={project.title}
                        />

                        {/* Inline Play Trigger */}
                        <div className="absolute bottom-2.5 left-2.5 z-20">
                          <button
                            type="button"
                            onClick={() => togglePlay(project.id)}
                            aria-label={isPlaying ? `Pause ${project.title}` : `Play ${project.title}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/90 hover:bg-white hover:text-black text-white text-[10px] font-mono font-bold uppercase tracking-[0.16em] border border-white/20 hover:border-white transition-colors rounded-none cursor-pointer"
                          >
                            {isPlaying ? (
                              <>
                                <svg width="9" height="9" viewBox="0 0 12 12" fill="currentColor">
                                  <rect x="2" y="2" width="3" height="8" />
                                  <rect x="7" y="2" width="3" height="8" />
                                </svg>
                                <span>Pause</span>
                              </>
                            ) : (
                              <>
                                <svg width="9" height="9" viewBox="0 0 12 12" fill="currentColor">
                                  <path d="M3 2L10 6L3 10V2Z" />
                                </svg>
                                <span>Play Reel</span>
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    ) : mediaSrc ? (
                      <div className="relative w-full h-full overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={mediaSrc}
                          alt={project.title}
                          className="w-full h-full object-contain bg-black group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors flex items-center justify-center">
                          <span className="w-10 h-10 rounded-none bg-black/80 border border-white/20 group-hover:border-white text-white group-hover:bg-white group-hover:text-black flex items-center justify-center transition-all">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                              <path d="M3 2L10 6L3 10V2Z" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Technical Editorial Frame */
                      <div className="w-full h-full bg-[#111111] flex flex-col justify-between p-4 relative">
                        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">
                          <span>[ARCHIVE // 4K]</span>
                          <span className="text-brand-red font-semibold">● REEL</span>
                        </div>
                        <div className="py-2">
                          <span className="text-[10px] font-mono text-neutral-500 block mb-1 uppercase tracking-widest">
                            {project.categoryName || formatCategory(project.category)}
                          </span>
                          <h4 className="font-display text-sm font-bold uppercase text-white/90 line-clamp-1">
                            {project.title}
                          </h4>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 border-t border-white/5 pt-2">
                          <span>{project.videoAspectRatio || "16:9"}</span>
                          <span>{project.duration || "MASTER"}</span>
                        </div>
                      </div>
                    )}

                    {/* Category Badge — Top Left */}
                    <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                      <span className="inline-flex items-center gap-1.5 bg-black/85 border border-white/15 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.16em] text-neutral-200">
                        <span className="w-1.5 h-1.5 bg-brand-red rounded-none" aria-hidden="true" />
                        {formatCategory(project.category)}
                      </span>
                    </div>

                    {/* Duration & Aspect Ratio Badges — Top Right */}
                    <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none flex items-center gap-1.5">
                      {project.videoAspectRatio && project.videoAspectRatio !== "AUTO" && (
                        <span className="inline-flex items-center bg-black/90 border border-white/20 px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase text-neutral-300">
                          {project.videoAspectRatio}
                        </span>
                      )}
                      {isPlaying ? (
                        <span className="inline-flex items-center gap-1.5 bg-black/90 border border-brand-red/40 px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest text-brand-red">
                          <span className="w-1.5 h-1.5 bg-brand-red rounded-none animate-pulse" />
                          Live
                        </span>
                      ) : project.duration ? (
                        <span className="inline-flex items-center bg-black/85 border border-white/15 px-2 py-0.5 text-[10px] font-mono text-neutral-300">
                          {project.duration}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                    <div>
                      {/* Meta line */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 mb-2">
                        <span>PROJECT // {String(startIndex + idx + 1).padStart(2, "0")}</span>
                        <span className="uppercase tracking-wider text-neutral-400">
                          {project.categoryName || project.subCategory || (project.category ? formatCategory(project.category) : "Video")}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-display text-sm sm:text-base font-bold uppercase tracking-tight text-white mb-1.5 line-clamp-1">
                        <Link
                          href={`/portfolio/${project.slug || project.id}`}
                          className="hover:text-brand-red transition-colors no-underline text-white hover:underline"
                        >
                          {project.title}
                        </Link>
                      </h3>

                      {/* Description with fixed minimum height for row alignment */}
                      <p className="text-neutral-400 text-xs leading-relaxed line-clamp-2 font-normal min-h-[2.25rem]">
                        {project.description || ""}
                      </p>
                    </div>

                    {/* Bottom Metadata & Link */}
                    <div className="mt-auto pt-3 border-t border-white/[0.08] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-brand-red">
                          {formatCategory(project.category)}
                        </span>
                        {project.videoAspectRatio && project.videoAspectRatio !== "AUTO" && (
                          <span className="text-[10px] font-mono text-neutral-400">
                            · {project.videoAspectRatio}
                          </span>
                        )}
                        {project.duration && (
                          <span className="text-[10px] font-mono text-neutral-500">
                            · {project.duration}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/portfolio/${project.slug || project.id}`}
                        className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors no-underline"
                        aria-label={`View details for ${project.title}`}
                      >
                        <span>Details</span>
                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Video Portfolio Pagination Bar */}
        {totalProjects > 0 && (
          <div className="mt-12 pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-5 select-none">
            {/* Range Indicator */}
            <div className="text-xs font-mono uppercase tracking-[0.16em] text-neutral-400">
              {rangeIndicator}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                {/* Previous Button */}
                <button
                  type="button"
                  onClick={() => goToPage(safePage - 1)}
                  disabled={safePage <= 1}
                  aria-label="Previous page"
                  className="h-9 px-3.5 border border-white/15 hover:border-white hover:bg-white hover:text-black text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:border-white/15 disabled:hover:bg-transparent disabled:hover:text-white rounded-none cursor-pointer flex items-center gap-1.5"
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M7.5 2.5L4 6L7.5 9.5" />
                  </svg>
                  <span>Prev</span>
                </button>

                {/* Page Number Buttons */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const isActive = pageNum === safePage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => goToPage(pageNum)}
                      aria-label={`Go to page ${pageNum}`}
                      aria-current={isActive ? "page" : undefined}
                      className={`w-9 h-9 border text-xs font-mono font-bold transition-colors flex items-center justify-center rounded-none cursor-pointer ${
                        isActive
                          ? "bg-brand-red border-brand-red text-white"
                          : "bg-[#111111] border-white/15 text-neutral-400 hover:text-white hover:border-white/30"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => goToPage(safePage + 1)}
                  disabled={safePage >= totalPages}
                  aria-label="Next page"
                  className="h-9 px-3.5 border border-white/15 hover:border-white hover:bg-white hover:text-black text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:border-white/15 disabled:hover:bg-transparent disabled:hover:text-white rounded-none cursor-pointer flex items-center gap-1.5"
                >
                  <span>Next</span>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M4.5 2.5L8 6L4.5 9.5" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
