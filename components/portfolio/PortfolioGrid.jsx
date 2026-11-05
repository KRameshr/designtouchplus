"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";

const REFERENCE_TABS = [
  { value: "ALL", slug: "all", label: "ALL WORK" },
  { value: "new-batch", slug: "new-batch", label: "NEW BATCH" },
  { value: "corporate", slug: "corporate", label: "CORPORATE" },
  { value: "youtube", slug: "youtube", label: "YOUTUBE" },
  { value: "instagram-reels", slug: "instagram-reels", label: "INSTAGRAM REELS" },
  { value: "commercial", slug: "commercial", label: "COMMERCIAL" },
  { value: "motion-graphics", slug: "motion-graphics", label: "MOTION GRAPHICS" },
  { value: "real-estate", slug: "real-estate", label: "REAL ESTATE" },
  { value: "dynamic-batch", slug: "dynamic-batch", label: "DYNAMIC BATCH" },
];

const VIDEO_PAGE_SIZE = 9;

export default function PortfolioGrid({ items = [], categories = [] }) {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [sortLatest, setSortLatest] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMediaId, setActiveMediaId] = useState(null);
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
              slug === refTab.slug ||
              name === refTab.label.toLowerCase() ||
              slug === refTab.value.toLowerCase()
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
        if (item.categorySlug && activeTab.slug && item.categorySlug === activeTab.slug) return true;
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
          if (enumSlug === activeTab.slug) return true;
        }
        if (item.subCategory && activeTab.slug) {
          const subSlug = item.subCategory.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          if (subSlug.includes(activeTab.slug) || activeTab.slug.includes(subSlug)) return true;
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

  const handleMouseEnter = (projectId) => {
    const project = paginatedProjects.find((p) => p.id === projectId);
    if (!project?.videoUrl || videoErrors[projectId]) return;

    if (activeMediaId && activeMediaId !== projectId && videoRefs.current[activeMediaId]) {
      try {
        videoRefs.current[activeMediaId].pause();
        videoRefs.current[activeMediaId].currentTime = 0;
      } catch (_) {}
    }

    setActiveMediaId(projectId);
    const video = videoRefs.current[projectId];
    if (video) {
      video.muted = true;
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  };

  const handleMouseLeave = (projectId) => {
    const video = videoRefs.current[projectId];
    if (video) {
      try {
        video.pause();
        video.currentTime = 0;
      } catch (_) {}
    }
    setActiveMediaId((current) => (current === projectId ? null : current));
  };

  return (
    <section
      id="video-editing"
      className="bg-[#080808] text-white py-10 sm:py-14 lg:py-16 border-b border-white/[0.08] scroll-mt-20"
    >
      <div className="global-container w-[calc(100%-32px)] sm:w-[calc(100%-64px)] lg:w-[calc(100%-120px)] max-w-[1440px] mx-auto">
        {/* Category Filter Bar & Sort Controller */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-white/10">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {filterTabs.map(({ value, label }) => {
              const active = activeCategory === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleCategoryChange(value)}
                  className={`text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.14em] px-3.5 py-2.5 rounded-none border transition-colors cursor-pointer select-none ${
                    active
                      ? "bg-brand-red border-brand-red text-white"
                      : "bg-black border-white/20 text-neutral-300 hover:text-white hover:border-white/40"
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-white/10 overflow-hidden bg-black"
          >
            {paginatedProjects.map((project, idx) => {
              const hasVideo = Boolean(project.videoUrl);
              const hasVideoError = Boolean(videoErrors[project.id]);
              const mediaSrc = project.thumbnailUrl || project.imageUrl;

              return (
                <article
                  key={project.id || idx}
                  data-testid="portfolio-video-card"
                  className="relative aspect-[16/9] w-full overflow-hidden bg-black select-none rounded-none border border-white/10 group focus-within:ring-2 focus-within:ring-brand-red focus-within:z-20"
                  onMouseEnter={() => handleMouseEnter(project.id)}
                  onMouseLeave={() => handleMouseLeave(project.id)}
                  onFocus={() => handleMouseEnter(project.id)}
                  onBlur={() => handleMouseLeave(project.id)}
                >
                  <Link
                    href={`/portfolio/${project.slug || project.id}`}
                    className="block w-full h-full relative cursor-pointer outline-none"
                    aria-label={`View project ${project.title}`}
                  >
                    {/* Media Layer (Video or Thumbnail Image) */}
                    {hasVideo && !hasVideoError ? (
                      <video
                        ref={(el) => {
                          if (el) videoRefs.current[project.id] = el;
                        }}
                        src={project.videoUrl}
                        poster={mediaSrc || undefined}
                        playsInline
                        muted
                        loop
                        preload="metadata"
                        onError={() =>
                          setVideoErrors((prev) => ({ ...prev, [project.id]: true }))
                        }
                        className="w-full h-full object-cover select-none pointer-events-none group-hover:scale-105 transition-transform duration-500 ease-out motion-reduce:transition-none motion-reduce:transform-none"
                      />
                    ) : mediaSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={mediaSrc}
                        alt={project.title}
                        className="w-full h-full object-cover select-none group-hover:scale-105 transition-transform duration-500 ease-out motion-reduce:transition-none motion-reduce:transform-none"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#111111] flex flex-col items-center justify-center p-6 text-center">
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 mb-1">
                          [ARCHIVE // 4K]
                        </span>
                        <h4 className="font-display text-sm font-bold uppercase text-white/90 line-clamp-1">
                          {project.title}
                        </h4>
                      </div>
                    )}

                    {/* Subtle Dark Overlay (Hidden by Default, Smooth Fade-in on Hover & Focus) */}
                    <div
                      data-testid="video-card-overlay"
                      className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 ease-out motion-reduce:transition-none pointer-events-none"
                    />

                    {/* Centered Circular Play Button & VIEW PROJECT Button (Hidden by Default, Smooth Fade-in & Scale on Hover & Focus) */}
                    <div
                      data-testid="video-card-hover-controls"
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 scale-95 group-hover:scale-100 group-focus-within:scale-100 transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:transform-none"
                    >
                      {/* Circular Play Button */}
                      <div
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/50 backdrop-blur-sm border border-white/80 flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:border-white transition-all duration-300"
                        aria-hidden="true"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5 fill-white"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <polygon points="6 4 20 12 6 20" />
                        </svg>
                      </div>

                      {/* VIEW PROJECT Button */}
                      <div className="px-3.5 sm:px-4 py-1.5 bg-black/60 backdrop-blur-sm border border-white/80 text-white rounded-none text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-2 group-hover:bg-brand-red group-hover:border-brand-red transition-all duration-200">
                        <span>VIEW PROJECT</span>
                        <span className="text-sm leading-none" aria-hidden="true">→</span>
                      </div>
                    </div>
                  </Link>
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
