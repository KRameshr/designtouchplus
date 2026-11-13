"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { cloudinaryImageUrl, cloudinaryResponsiveImageProps } from "@/lib/cloudinaryImages.mjs";

const REFERENCE_TABS = [
  { value: "ALL", slug: "all", label: "All Work" },
  { value: "brand-films", slug: "brand-films", aliases: ["brand-film"], label: "Brand Films" },
  { value: "commercial", slug: "commercial", aliases: ["commercials"], label: "Commercials" },
  { value: "youtube", slug: "youtube", label: "YouTube" },
  { value: "instagram-reels", slug: "instagram-reels", aliases: ["reels-shorts", "shorts"], label: "Reels & Shorts" },
  { value: "motion-graphics", slug: "motion-graphics", label: "Motion Graphics" },
];

const VIDEO_PAGE_SIZE = 9;

export default function PortfolioGrid({ items = [], categories = [] }) {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [sortLatest, setSortLatest] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMediaId, setActiveMediaId] = useState(null);
  const [hoveredMediaId, setHoveredMediaId] = useState(null);
  const [focusedMediaId, setFocusedMediaId] = useState(null);
  const [touchMediaId, setTouchMediaId] = useState(null);
  const [videoErrors, setVideoErrors] = useState({});
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
    const tabs = REFERENCE_TABS.map((refTab) => {
      const matchingCmsCat = Array.isArray(categories)
        ? categories.find((c) => {
            const slug = (c.slug || "").toLowerCase();
            const name = (c.name || "").toLowerCase();
            return (
              [refTab.slug, ...(refTab.aliases || [])].includes(slug) ||
              name === refTab.label.toLowerCase() ||
              slug === refTab.value.toLowerCase() ||
              (refTab.value === "commercial" && name === "commercial")
            );
          })
        : null;
      return {
        ...refTab,
        id: matchingCmsCat?.id,
        cmsSlug: matchingCmsCat?.slug,
      };
    });

    if (Array.isArray(categories)) {
      categories.forEach((cat) => {
        const slug = (cat.slug || "").toLowerCase();
        const alreadyExists = tabs.some(
          (t) => t.slug === slug || t.label.toLowerCase() === (cat.name || "").toLowerCase()
        );
        if (!alreadyExists) {
          tabs.push({
            value: cat.id || cat.slug,
            slug: cat.slug,
            id: cat.id,
            label: (cat.name || "").toUpperCase(),
          });
        }
      });
    }

    return tabs;
  }, [categories]);

  const filtered = useMemo(() => {
    let result = items;
    if (activeCategory !== "ALL") {
      const activeTab = filterTabs.find((t) => t.value === activeCategory);
      result = items.filter((item) => {
        if (!activeTab) return false;

        if (activeCategory === "new-batch") {
          if (
            item.categorySlug === "new-batch" ||
            item.subCategory?.toLowerCase().includes("new")
          ) {
            return true;
          }
          return Boolean(item.isFeatured);
        }

        if (activeCategory === "dynamic-batch") {
          if (
            item.categorySlug === "dynamic-batch" ||
            item.subCategory?.toLowerCase().includes("dynamic")
          ) {
            return true;
          }
          return (
            item.categorySlug === "motion-graphics" ||
            item.category === "MOTION_GRAPHICS" ||
            Boolean(item.videoUrl)
          );
        }

        if (item.categoryId && activeTab.id && item.categoryId === activeTab.id) return true;
        const activeSlugs = [activeTab.slug, ...(activeTab.aliases || [])].filter(Boolean);
        if (item.categorySlug && activeSlugs.includes(item.categorySlug)) return true;
        if (item.categorySlug && item.categorySlug === activeCategory) return true;
        if (item.categoryId && item.categoryId === activeCategory) return true;
        if (
          item.categoryName &&
          activeTab.label &&
          item.categoryName.toLowerCase() === activeTab.label.toLowerCase()
        )
          return true;
        if (item.category) {
          const enumSlug = item.category.toLowerCase().replace(/_/g, "-");
          if (activeSlugs.includes(enumSlug)) return true;
        }
        if (item.subCategory && activeTab.slug) {
          const subSlug = item.subCategory.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          if (activeSlugs.some((slug) => subSlug.includes(slug) || slug.includes(subSlug))) return true;
        }
        return false;
      });

      if (
        result.length === 0 &&
        (activeCategory === "new-batch" || activeCategory === "dynamic-batch")
      ) {
        result = items.slice(0, 9);
      }
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
      ? "SHOWING 0 OF 0 PROJECTS"
      : `SHOWING ${startIndex + 1} - ${endIndex} OF ${totalProjects} PROJECTS`;

  const togglePlayback = (projectId) => {
    const video = videoRefs.current[projectId];
    if (!video || videoErrors[projectId]) return;

    if (!video.paused) {
      video.pause();
      setActiveMediaId((current) => (current === projectId ? null : current));
      return;
    }

    Object.entries(videoRefs.current).forEach(([otherId, otherVideo]) => {
      if (otherId !== String(projectId) && otherVideo && !otherVideo.paused) {
        otherVideo.pause();
      }
    });

    video.muted = true;
    setActiveMediaId(projectId);
    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        setActiveMediaId((current) => (current === projectId ? null : current));
      });
    }
  };

  useEffect(() => {
    Object.values(videoRefs.current).forEach((video) => video?.pause());
    setActiveMediaId(null);
    setTouchMediaId(null);
  }, [activeCategory, currentPage, sortLatest]);

  return (
    <section
      id="video-editing"
      aria-labelledby="portfolio-video-heading"
      className="bg-[#080808] text-white py-10 sm:py-14 lg:py-16 border-b border-white/[0.08] scroll-mt-20"
    >
      <div className="global-container w-[calc(100%-32px)] sm:w-[calc(100%-64px)] lg:w-[calc(100%-120px)] max-w-[1440px] mx-auto">
        <header className="mb-7 grid grid-cols-1 items-end gap-5 sm:mb-9 lg:grid-cols-2 lg:gap-10">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2.5 text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-neutral-300 sm:text-[11px]">
              <span className="h-2.5 w-2.5 shrink-0 border-2 border-brand-red" aria-hidden="true" />
              <span>OUR WORK <span className="px-1 text-neutral-500">{'//'}</span> VIDEO EDITING</span>
            </div>
            <h2 id="portfolio-video-heading" className="font-display text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl md:text-5xl">
              <span className="text-white">Video </span><span className="text-brand-red">Portfolio</span>
            </h2>
            <span className="mt-3 block h-[2px] w-10 bg-brand-red" aria-hidden="true" />
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-neutral-400 sm:text-base lg:justify-self-end lg:border-l lg:border-white/20 lg:py-1 lg:pl-6">
            A collection of our best video editing work &mdash; commercial edits, brand reels, YouTube content, and cinematic visual stories.
          </p>
        </header>

        {/* Category Filter Bar & Sort Controller */}
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:mb-8 sm:gap-6 sm:pb-6 lg:flex-row lg:items-center">
          {/* Category Tabs */}
          <div aria-label="Filter video projects by category" className="-mx-1 flex max-w-full items-center gap-2 overflow-x-auto px-1 pb-1 lg:flex-wrap lg:overflow-visible">
            {filterTabs.map(({ value, label }) => {
              const active = activeCategory === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleCategoryChange(value)}
                  aria-pressed={active}
                  className={`shrink-0 whitespace-nowrap text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.12em] sm:tracking-[0.14em] px-4 py-2.5 rounded-full border transition-colors cursor-pointer select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                    active
                      ? "bg-brand-red border-brand-red text-white"
                      : "bg-transparent border-white/25 text-neutral-300 hover:text-white hover:border-white/60"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Right: Project Count & Sort Button */}
          <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-neutral-400">
              {filtered.length} {filtered.length === 1 ? "PROJECT" : "PROJECTS"}
            </span>

            <button
              type="button"
              onClick={handleSortChange}
              className={`inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider px-3.5 py-2 border rounded-none transition-colors cursor-pointer ${
                sortLatest
                  ? "border-brand-red text-white bg-brand-red/10"
                  : "border-white/20 text-neutral-300 hover:text-white hover:border-white/40 bg-black"
              }`}
            >
              <span>{sortLatest ? "SORT: LATEST" : "SORT: DEFAULT"}</span>
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

        {/* Cinematic 3-Column Video Gallery Grid */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-black border border-white/10 rounded-none">
            <p className="text-neutral-400 text-xs font-mono uppercase tracking-widest">
              No projects archived under this category.
            </p>
          </div>
        ) : (
          <div
            data-testid="portfolio-video-grid"
            className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {paginatedProjects.map((project, idx) => {
              const projectId = project.id || project.slug || idx;
              const hasVideo = Boolean(project.videoUrl);
              const hasVideoError = Boolean(videoErrors[projectId]);
              const mediaSrc = project.thumbnailUrl || project.imageUrl;
              const displayCategory = project.categoryName || project.subCategory || project.category || "";
              const isPlaying = activeMediaId === projectId;
              const controlsVisible = isPlaying || hoveredMediaId === projectId || focusedMediaId === projectId || touchMediaId === projectId;

              return (
                <article
                  key={projectId}
                  data-testid="portfolio-video-card"
                  data-playing={isPlaying}
                  className="group min-w-0 overflow-hidden border border-white/10 bg-[#0b0b0b] transition-colors hover:border-white/25 focus-within:border-brand-red"
                  onMouseEnter={() => setHoveredMediaId(projectId)}
                  onMouseLeave={() => setHoveredMediaId((current) => (current === projectId ? null : current))}
                  onTouchStart={() => setTouchMediaId(projectId)}
                  onFocus={() => setFocusedMediaId(projectId)}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      setFocusedMediaId((current) => (current === projectId ? null : current));
                    }
                  }}
                >
                  <div
                    data-testid="portfolio-video-preview"
                    className="relative aspect-video w-full overflow-hidden bg-[#111]"
                  >
                    {hasVideo && !hasVideoError ? (
                      <video
                        ref={(el) => {
                          if (el) videoRefs.current[projectId] = el;
                          else delete videoRefs.current[projectId];
                        }}
                        src={project.videoUrl}
                        poster={cloudinaryImageUrl(mediaSrc, 960) || mediaSrc || undefined}
                        playsInline
                        muted
                        loop
                        preload="none"
                        onPlay={() => setActiveMediaId(projectId)}
                        onPause={() => setActiveMediaId((current) => (current === projectId ? null : current))}
                        onError={() => setVideoErrors((prev) => ({ ...prev, [projectId]: true }))}
                        className="pointer-events-none h-full w-full select-none object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none"
                        aria-label={`Preview of ${project.title}`}
                      />
                    ) : mediaSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        {...cloudinaryResponsiveImageProps(mediaSrc, { widths: [320, 480, 640, 960], sizes: "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw", fallbackWidth: 640 })}
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full select-none object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-[#111] p-6 text-center">
                        <span className="mb-1 text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">[ARCHIVE // 4K]</span>
                        <h4 className="line-clamp-1 font-display text-sm font-bold uppercase text-white/90">{project.title}</h4>
                      </div>
                    )}

                    <div
                      data-testid="video-card-overlay"
                      className={`pointer-events-none absolute inset-0 bg-black/35 transition-opacity duration-200 motion-reduce:transition-none ${controlsVisible ? "opacity-100" : "opacity-0"}`}
                      aria-hidden="true"
                    />
                    <div
                      data-testid="video-card-hover-controls"
                      className={`absolute inset-0 z-10 flex items-center justify-center transition-all duration-200 motion-reduce:transform-none motion-reduce:transition-none ${controlsVisible ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"}`}
                    >
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          togglePlayback(projectId);
                        }}
                        disabled={!hasVideo || hasVideoError}
                        aria-label={`${isPlaying ? "Pause" : "Play"} ${project.title}`}
                        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/80 bg-black/60 text-white backdrop-blur-sm transition-colors hover:border-brand-red hover:bg-brand-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40 sm:h-14 sm:w-14"
                      >
                        {isPlaying ? (
                          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                            <path d="M7 5h4v14H7zM15 5h4v14h-4z" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true">
                            <path d="M6 4.7a1 1 0 0 1 1.5-.86l12 7.3a1 1 0 0 1 0 1.72l-12 7.3A1 1 0 0 1 6 19.3z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex min-h-[100px] items-center justify-between gap-3 p-4 sm:p-5">
                    <div className="min-w-0 border-l-2 border-brand-red pl-3">
                      <h3 className="line-clamp-2 font-display text-sm font-bold leading-snug text-white sm:text-base">
                        <Link href={`/portfolio/${project.slug || project.id}`} className="text-white no-underline transition-colors hover:text-brand-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                          {project.title}
                        </Link>
                      </h3>
                      {displayCategory && (
                        <p className="mt-1.5 truncate text-[10px] font-mono uppercase tracking-[0.12em] text-neutral-400 sm:text-[11px]">
                          {displayCategory}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/portfolio/${project.slug || project.id}`}
                      className="inline-flex min-h-9 shrink-0 items-center gap-1.5 border border-brand-red bg-brand-red px-3 py-2 text-[9px] font-mono font-bold uppercase tracking-[0.08em] text-white no-underline transition-colors hover:bg-[#dc2626] sm:min-h-10 sm:px-3.5 sm:text-[10px] sm:tracking-[0.1em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      VIEW PROJECT <span aria-hidden="true">&#8599;</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Video Portfolio Pagination Bar */}
        {totalProjects > 0 && (
          <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-5 select-none">
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
                  className="h-9 px-3.5 border border-white/20 bg-black text-white hover:border-white hover:bg-white/10 text-xs font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-25 disabled:cursor-not-allowed rounded-none cursor-pointer flex items-center gap-1.5"
                >
                  <span>&lt; PREV</span>
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
                          : "bg-black border-white/20 text-neutral-400 hover:text-white hover:border-white/40"
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
                  className="h-9 px-3.5 border border-white/20 bg-black text-white hover:border-white hover:bg-white/10 text-xs font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-25 disabled:cursor-not-allowed rounded-none cursor-pointer flex items-center gap-1.5"
                >
                  <span>NEXT &gt;</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
