"use client";

import { useState, useRef, useEffect, useMemo } from "react";
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
  if (!category) return "Selected Work";
  return CATEGORY_MAP[category] || category.replace(/_/g, " ");
}

/* =========================================================================
   SECTION A: FEATURED VIDEO EDITING
   ========================================================================= */
function FeaturedVideoSection({ videos = [] }) {
  const [playingId, setPlayingId] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef(null);
  const videoRefs = useRef({});

  const total = videos.length;

  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth, children } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    if (children && children.length > 0) {
      let closestIdx = 0;
      let minDiff = Infinity;
      for (let i = 0; i < children.length; i++) {
        const diff = Math.abs(children[i].offsetLeft - scrollLeft);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      }
      setActiveIndex(closestIdx);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [total]);

  if (!videos || videos.length === 0) {
    return null;
  }

  const scrollToSlide = (index) => {
    if (!scrollRef.current) return;
    const children = scrollRef.current.children;
    if (children && children[index]) {
      children[index].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      scrollToSlide(activeIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeIndex < total - 1) {
      scrollToSlide(activeIndex + 1);
    }
  };

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
    <section className="bg-[#080808] text-white px-4 sm:px-6 py-16 sm:py-20 lg:py-24 border-b border-white/[0.08] relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Editorial Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-3 sm:mb-3.5">
              <span className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0" aria-hidden="true" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.24em] text-neutral-400">
                OUR WORK // SELECTED EDITS
              </span>
            </div>

            {/* Headline */}
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-[1.05] tracking-tight text-white">
              Featured <span className="text-white">Video Editing</span>
            </h2>

            <p className="text-neutral-400 text-xs sm:text-sm mt-3 font-normal leading-relaxed max-w-xl">
              High-impact commercial edits, viral short-form reels, and cinematic storytelling crafted for category-defining creators and brands.
            </p>
          </div>

          {/* Controls & View All Link */}
          <div className="flex items-center justify-between lg:justify-end gap-5 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/[0.08]">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400 select-none">
              <span className="text-white font-bold">{String(activeIndex + 1).padStart(2, "0")}</span>
              <span className="mx-1.5 text-neutral-600">/</span>
              <span>{String(total).padStart(2, "0")}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                disabled={!canScrollLeft && activeIndex === 0}
                aria-label="Previous video project"
                className="w-9 h-9 sm:w-10 sm:h-10 border border-white/15 hover:border-white hover:bg-white hover:text-black disabled:opacity-25 disabled:hover:border-white/15 disabled:hover:bg-transparent disabled:hover:text-white text-white flex items-center justify-center transition-colors rounded-none cursor-pointer"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M10 6H2M2 6L5.5 2.5M2 6L5.5 9.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" />
                </svg>
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={!canScrollRight && activeIndex >= total - 1}
                aria-label="Next video project"
                className="w-9 h-9 sm:w-10 sm:h-10 border border-white/15 hover:border-white hover:bg-white hover:text-black disabled:opacity-25 disabled:hover:border-white/15 disabled:hover:bg-transparent disabled:hover:text-white text-white flex items-center justify-center transition-colors rounded-none cursor-pointer"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" />
                </svg>
              </button>
            </div>

            <Link
              href="/portfolio#video-editing"
              className="hidden lg:inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.16em] text-neutral-300 hover:text-white transition-colors no-underline pl-2 py-2"
            >
              <span>View All Videos</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Video Track */}
        <div
          ref={scrollRef}
          className="flex lg:grid lg:grid-cols-4 gap-5 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-none snap-x snap-mandatory items-stretch"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {videos.map((project, idx) => {
            const isPlaying = playingId === project.id;
            const hasVideo = Boolean(project.videoUrl);
            const mediaSrc = project.thumbnailUrl || project.imageUrl;

            return (
              <article
                key={project.id || idx}
                className="w-[82vw] sm:w-[360px] lg:w-full min-w-[82vw] sm:min-w-[360px] lg:min-w-0 snap-start shrink-0 flex flex-col h-full bg-[#0c0c0c] border border-white/10 hover:border-white/25 transition-all duration-200 rounded-none group"
              >
                {/* Consistent 16:9 Media Container */}
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

                      {/* Play / Pause Control Overlay */}
                      <div className="absolute bottom-3 left-3 z-20">
                        <button
                          type="button"
                          onClick={() => togglePlay(project.id)}
                          aria-label={isPlaying ? `Pause ${project.title}` : `Play ${project.title}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-black/90 hover:bg-white hover:text-black text-white text-[10px] font-mono font-bold uppercase tracking-[0.16em] border border-white/20 hover:border-white transition-colors rounded-none cursor-pointer"
                        >
                          {isPlaying ? (
                            <>
                              <svg width="9" height="9" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                                <rect x="2" y="2" width="3" height="8" />
                                <rect x="7" y="2" width="3" height="8" />
                              </svg>
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <svg width="9" height="9" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
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
                    <div className="w-full h-full bg-[#111111] flex flex-col justify-between p-4 relative">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">
                        <span>[ARCHIVE // 4K]</span>
                        <span className="text-brand-red font-semibold">● REEL</span>
                      </div>
                      <div className="py-2">
                        <span className="text-[10px] font-mono text-neutral-500 block mb-1 uppercase tracking-widest">
                          {formatCategory(project.category)}
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
                      {project.categoryName || formatCategory(project.category)}
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

                {/* Details */}
                <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 mb-2">
                      <span>PROJECT // {String(idx + 1).padStart(2, "0")}</span>
                      {project.subCategory && (
                        <span className="uppercase tracking-wider text-neutral-400">
                          {project.subCategory}
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-sm sm:text-base font-bold uppercase tracking-tight text-white mb-1.5 line-clamp-1">
                      <Link
                        href={`/portfolio/${project.slug || project.id}`}
                        className="hover:text-brand-red transition-colors no-underline text-white hover:underline"
                      >
                        {project.title}
                      </Link>
                    </h3>

                    <p className="text-neutral-400 text-xs leading-relaxed line-clamp-2 font-normal min-h-[2.25rem]">
                      {project.description || ""}
                    </p>
                  </div>

                  {/* Bottom Footer */}
                  <div className="mt-auto pt-3 border-t border-white/[0.08] flex items-center justify-between">
                    <Link
                      href={`/portfolio/${project.slug || project.id}`}
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-neutral-400 group-hover:text-white transition-colors no-underline"
                    >
                      <span>Explore</span>
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 12 12"
                        fill="none"
                        className="group-hover:translate-x-0.5 transition-transform"
                        aria-hidden="true"
                      >
                        <path d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" />
                      </svg>
                    </Link>

                    <div className="flex items-center gap-2">
                      {project.videoAspectRatio && project.videoAspectRatio !== "AUTO" && (
                        <span className="text-[10px] font-mono text-neutral-400">
                          {project.videoAspectRatio}
                        </span>
                      )}
                      {project.duration && (
                        <span className="text-[10px] font-mono text-neutral-500">
                          · {project.duration}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Mobile View All Link */}
        <div className="mt-8 lg:hidden">
          <Link
            href="/portfolio#video-editing"
            className="w-full py-3.5 border border-white/20 hover:border-white hover:bg-white hover:text-black text-white text-xs font-mono font-bold uppercase tracking-[0.16em] inline-flex items-center justify-center gap-2 transition-colors no-underline rounded-none"
          >
            <span>View All Videos</span>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   SECTION B: FEATURED THUMBNAIL DESIGN
   ========================================================================= */
function FeaturedThumbnailSection({ thumbnails = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef(null);

  const total = thumbnails.length;

  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth, children } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    if (children && children.length > 0) {
      let closestIdx = 0;
      let minDiff = Infinity;
      for (let i = 0; i < children.length; i++) {
        const diff = Math.abs(children[i].offsetLeft - scrollLeft);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      }
      setActiveIndex(closestIdx);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [total]);

  if (!thumbnails || thumbnails.length === 0) {
    return null;
  }

  const scrollToSlide = (index) => {
    if (!scrollRef.current) return;
    const children = scrollRef.current.children;
    if (children && children[index]) {
      children[index].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      scrollToSlide(activeIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeIndex < total - 1) {
      scrollToSlide(activeIndex + 1);
    }
  };

  return (
    <section className="bg-[#0a0a0a] text-white px-4 sm:px-6 py-16 sm:py-20 lg:py-24 border-b border-white/[0.08] relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Editorial Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-3 sm:mb-3.5">
              <span className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0" aria-hidden="true" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.24em] text-neutral-400">
                PACKAGING // HIGH-CTR VISUALS
              </span>
            </div>

            {/* Headline */}
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-[1.05] tracking-tight text-white">
              Featured <span className="text-white">Thumbnail Design</span>
            </h2>

            <p className="text-neutral-400 text-xs sm:text-sm mt-3 font-normal leading-relaxed max-w-xl">
              High-conversion YouTube packaging, bespoke typography, and high-impact visual hooks engineered to maximize click-through rate.
            </p>
          </div>

          {/* Controls & View All Link */}
          <div className="flex items-center justify-between lg:justify-end gap-5 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/[0.08]">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400 select-none">
              <span className="text-white font-bold">{String(activeIndex + 1).padStart(2, "0")}</span>
              <span className="mx-1.5 text-neutral-600">/</span>
              <span>{String(total).padStart(2, "0")}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                disabled={!canScrollLeft && activeIndex === 0}
                aria-label="Previous thumbnail project"
                className="w-9 h-9 sm:w-10 sm:h-10 border border-white/15 hover:border-white hover:bg-white hover:text-black disabled:opacity-25 disabled:hover:border-white/15 disabled:hover:bg-transparent disabled:hover:text-white text-white flex items-center justify-center transition-colors rounded-none cursor-pointer"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M10 6H2M2 6L5.5 2.5M2 6L5.5 9.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" />
                </svg>
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={!canScrollRight && activeIndex >= total - 1}
                aria-label="Next thumbnail project"
                className="w-9 h-9 sm:w-10 sm:h-10 border border-white/15 hover:border-white hover:bg-white hover:text-black disabled:opacity-25 disabled:hover:border-white/15 disabled:hover:bg-transparent disabled:hover:text-white text-white flex items-center justify-center transition-colors rounded-none cursor-pointer"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" />
                </svg>
              </button>
            </div>

            <Link
              href="/portfolio#thumbnails"
              className="hidden lg:inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.16em] text-neutral-300 hover:text-white transition-colors no-underline pl-2 py-2"
            >
              <span>View All Thumbnails</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Thumbnail Track */}
        <div
          ref={scrollRef}
          className="flex lg:grid lg:grid-cols-4 gap-5 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-none snap-x snap-mandatory items-stretch"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {thumbnails.map((item, idx) => {
            const mediaSrc = item.thumbnailUrl || item.imageUrl;
            const categoryLabel = item.categoryName || item.subCategory || "YouTube CTR";

            return (
              <article
                key={item.id || idx}
                className="w-[82vw] sm:w-[320px] lg:w-full min-w-[82vw] sm:min-w-[320px] lg:min-w-0 snap-start shrink-0 flex flex-col h-full bg-[#0c0c0c] border border-white/10 hover:border-white/25 transition-all duration-200 rounded-none group"
              >
                {/* 16:9 Thumbnail Image Frame (No Video Player) */}
                <Link
                  href={`/portfolio/${item.slug || item.id}`}
                  className="relative aspect-[16/9] w-full overflow-hidden bg-[#141414] border-b border-white/[0.08] select-none block"
                  aria-label={`View thumbnail details for ${item.title}`}
                >
                  {mediaSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaSrc}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#111111] flex flex-col justify-between p-4 relative">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">
                        <span>[CTR PACKAGING // 4K]</span>
                        <span className="text-brand-red font-semibold">● ARTWORK</span>
                      </div>
                      <div className="py-2">
                        <span className="text-[10px] font-mono text-neutral-500 block mb-1 uppercase tracking-widest">
                          {categoryLabel}
                        </span>
                        <h4 className="font-display text-sm font-bold uppercase text-white/90 line-clamp-1">
                          {item.title}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 border-t border-white/5 pt-2">
                        <span>16:9 FORMAT</span>
                        <span>HIGH CTR</span>
                      </div>
                    </div>
                  )}

                  {/* Category Badge — Top Left */}
                  <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 bg-black/85 border border-white/15 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.16em] text-neutral-200">
                      <span className="w-1.5 h-1.5 bg-brand-red rounded-none" aria-hidden="true" />
                      {categoryLabel}
                    </span>
                  </div>

                  {/* CTR Badge — Top Right */}
                  <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
                    <span className="inline-flex items-center bg-black/85 border border-white/15 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-neutral-300">
                      16:9 CTR
                    </span>
                  </div>
                </Link>

                {/* Details */}
                <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 mb-2">
                      <span>PACKAGING // {String(idx + 1).padStart(2, "0")}</span>
                      {item.subCategory && (
                        <span className="uppercase tracking-wider text-neutral-400">
                          {item.subCategory}
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-sm sm:text-base font-bold uppercase tracking-tight text-white mb-1.5 line-clamp-1">
                      <Link
                        href={`/portfolio/${item.slug || item.id}`}
                        className="hover:text-brand-red transition-colors no-underline text-white hover:underline"
                      >
                        {item.title}
                      </Link>
                    </h3>

                    <p className="text-neutral-400 text-xs leading-relaxed line-clamp-2 font-normal min-h-[2.25rem]">
                      {item.description || ""}
                    </p>
                  </div>

                  {/* Bottom Footer */}
                  <div className="mt-auto pt-3 border-t border-white/[0.08] flex items-center justify-between">
                    <Link
                      href={`/portfolio/${item.slug || item.id}`}
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-neutral-400 group-hover:text-white transition-colors no-underline"
                    >
                      <span>View Packaging</span>
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 12 12"
                        fill="none"
                        className="group-hover:translate-x-0.5 transition-transform"
                        aria-hidden="true"
                      >
                        <path d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" />
                      </svg>
                    </Link>

                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                      HIGH CTR
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Mobile View All Link */}
        <div className="mt-8 lg:hidden">
          <Link
            href="/portfolio#thumbnails"
            className="w-full py-3.5 border border-white/20 hover:border-white hover:bg-white hover:text-black text-white text-xs font-mono font-bold uppercase tracking-[0.16em] inline-flex items-center justify-center gap-2 transition-colors no-underline rounded-none"
          >
            <span>View All Thumbnails</span>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   MAIN EXPORT: FEATURED PROJECTS (SEPARATES VIDEO AND THUMBNAIL PROJECTS)
   ========================================================================= */
export default function FeaturedProjects({ projects, videoProjects, thumbnailProjects }) {
  // Support either explicitly partitioned props or single array partitioned by contentType
  const finalVideos = useMemo(() => {
    if (Array.isArray(videoProjects) && videoProjects.length > 0) return videoProjects;
    if (Array.isArray(projects)) {
      return projects.filter((p) => p && p.contentType === "VIDEO_EDITING");
    }
    return [];
  }, [videoProjects, projects]);

  const finalThumbnails = useMemo(() => {
    if (Array.isArray(thumbnailProjects) && thumbnailProjects.length > 0) return thumbnailProjects;
    if (Array.isArray(projects)) {
      return projects.filter((p) => p && p.contentType === "THUMBNAIL_DESIGN");
    }
    return [];
  }, [thumbnailProjects, projects]);

  if (finalVideos.length === 0 && finalThumbnails.length === 0) {
    return null;
  }

  return (
    <>
      {finalVideos.length > 0 && <FeaturedVideoSection videos={finalVideos} />}
      {finalThumbnails.length > 0 && <FeaturedThumbnailSection thumbnails={finalThumbnails} />}
    </>
  );
}
