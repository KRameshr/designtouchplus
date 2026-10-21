"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const THUMBNAIL_PAGE_SIZE = 9;

export default function ThumbnailGrid({ items = [], categories = [] }) {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const handleCategoryChange = (val) => {
    setActiveCategory(val);
    setCurrentPage(1);
  };

  const filterTabs = useMemo(() => {
    const tabs = [{ value: "ALL", label: "ALL THUMBNAILS" }];
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

  const categoryMap = useMemo(() => {
    const map = {};
    if (Array.isArray(categories)) {
      categories.forEach((c) => {
        if (c.id) map[c.id] = c.name;
        if (c.slug) map[c.slug] = c.name;
      });
    }
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    if (!activeCategory || activeCategory === "ALL") return items;

    const activeTab = filterTabs.find((t) => t.value === activeCategory);
    const targetId = (activeTab?.id || activeCategory)?.toLowerCase().trim();
    const targetSlug = (activeTab?.slug || activeCategory)?.toLowerCase().trim();
    const targetLabel = (activeTab?.label || "")?.toLowerCase().trim();

    return items.filter((item) => {
      // 1. Exact or normalized categoryId match
      if (item.categoryId) {
        const itemCatId = String(item.categoryId).toLowerCase().trim();
        if (itemCatId === targetId || itemCatId === targetSlug) return true;
      }

      // 2. Exact or normalized categorySlug match
      if (item.categorySlug) {
        const itemSlug = item.categorySlug.toLowerCase().trim();
        if (itemSlug === targetSlug || itemSlug === targetId) return true;
      }

      // 3. Match by categoryName (human-readable)
      if (item.categoryName) {
        const itemName = item.categoryName.toLowerCase().trim();
        if (targetLabel && itemName === targetLabel) return true;
        const normalizedItemNameSlug = itemName.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        if (targetSlug && (normalizedItemNameSlug === targetSlug || targetSlug.includes(normalizedItemNameSlug))) return true;
      }

      // 4. Fallback match by subCategory tag
      if (item.subCategory) {
        const itemSub = item.subCategory.toLowerCase().trim();
        if (targetLabel && itemSub === targetLabel) return true;
        const normalizedSubSlug = itemSub.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        if (targetSlug && (normalizedSubSlug === targetSlug || targetSlug.includes(normalizedSubSlug))) return true;
      }

      return false;
    });
  }, [items, activeCategory, filterTabs]);

  const totalThumbnails = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalThumbnails / THUMBNAIL_PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const startIndex = (safePage - 1) * THUMBNAIL_PAGE_SIZE;
  const endIndex = Math.min(startIndex + THUMBNAIL_PAGE_SIZE, totalThumbnails);
  const paginatedThumbnails = useMemo(() => {
    return filtered.slice(startIndex, endIndex);
  }, [filtered, startIndex, endIndex]);

  const goToPage = (pageNumber) => {
    const p = Math.max(1, Math.min(pageNumber, totalPages));
    setCurrentPage(p);
    if (typeof window !== "undefined") {
      const el = document.getElementById("thumbnails");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const rangeIndicator =
    totalThumbnails === 0
      ? "0 thumbnails"
      : `Showing ${startIndex + 1}–${endIndex} of ${totalThumbnails} ${
          totalThumbnails === 1 ? "thumbnail" : "thumbnails"
        }`;

  if ((!items || items.length === 0) && (!categories || categories.length === 0)) {
    return null;
  }

  return (
    <section id="thumbnails" className="bg-[#080808] text-white px-4 sm:px-6 py-12 sm:py-16 border-b border-white/[0.08] scroll-mt-20">
      <div id="thumbnail-design" className="max-w-7xl mx-auto">
        {/* Section Header: THUMBNAIL DESIGN */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0" aria-hidden="true" />
            <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-white">
              Thumbnail Design
            </h2>
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest ml-1 hidden sm:inline-block">
              // HIGH-CTR YOUTUBE PACKAGING
            </span>
          </div>

          <div className="flex-1 h-px bg-white/[0.08] mx-2 hidden md:block" />

          <Link
            href="/contact"
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-neutral-400 hover:text-white transition-colors no-underline shrink-0"
          >
            <span>Order Thumbnails</span>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" />
            </svg>
          </Link>
        </div>

        {/* Dedicated Category Filter Row */}
        {filterTabs.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
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
        )}

        {/* 3-Column Editorial Grid (3 cols × 3 rows = 9 per page) or Empty State */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
            {paginatedThumbnails.map((item, idx) => {
              const imageSrc = item.imageUrl || item.thumbnailUrl;
              const displayCategory =
                item.categoryName ||
                (item.categoryId && categoryMap[item.categoryId]) ||
                item.subCategory ||
                "YouTube CTR";

              return (
                <article
                  key={item.id || idx}
                  className="flex flex-col bg-[#0c0c0c] border border-white/10 hover:border-white/25 transition-all duration-200 rounded-none group"
                >
                  {/* 16:9 Thumbnail Frame */}
                  <Link
                    href={`/portfolio/${item.slug || item.id}`}
                    className="relative aspect-[16/9] w-full overflow-hidden bg-[#141414] border-b border-white/[0.08] select-none block"
                  >
                    {imageSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageSrc}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-3 text-center bg-[#111]">
                        <span className="text-[10px] font-mono uppercase text-neutral-600">
                          [THUMBNAIL // 16:9]
                        </span>
                      </div>
                    )}

                    {/* Corner Accent Square on Hover */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="w-1.5 h-1.5 bg-brand-red inline-block" />
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="p-4 sm:p-4.5 flex flex-col justify-between flex-1">
                    <h3 className="font-display text-sm sm:text-base font-bold uppercase tracking-tight text-white line-clamp-1 group-hover:text-brand-red transition-colors">
                      <Link
                        href={`/portfolio/${item.slug || item.id}`}
                        className="hover:text-brand-red transition-colors no-underline text-white"
                      >
                        {item.title}
                      </Link>
                    </h3>

                    <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
                      <span className="text-neutral-400 uppercase truncate">
                        {displayCategory}
                      </span>
                      <span className="text-brand-red shrink-0 ml-1 font-bold">
                        #{(startIndex + idx + 1).toString().padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center border border-dashed border-white/10 p-8">
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">
              [NO THUMBNAILS FOUND IN THIS CATEGORY]
            </p>
            <button
              type="button"
              onClick={() => handleCategoryChange("ALL")}
              className="mt-4 text-[11px] font-mono uppercase tracking-wider text-brand-red hover:underline cursor-pointer"
            >
              View All Thumbnails
            </button>
          </div>
        )}

        {/* Thumbnail Pagination Bar */}
        {totalThumbnails > 0 && (
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
