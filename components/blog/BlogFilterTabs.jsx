"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const FALLBACK_CATEGORIES = [
  { value: "", label: "All Articles" },
  { value: "THUMBNAIL", label: "Thumbnail" },
  { value: "VIDEO_EDITING", label: "Video Editing" },
  { value: "MOTION_GRAPHICS", label: "Motion Graphics" },
  { value: "CONTENT_CREATION", label: "Content Creation" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "BUSINESS", label: "Business" },
];

export default function BlogFilterTabs({
  activeCategory = "",
  categories = [],
  currentQuery = "",
}) {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // Build items array: All Articles always first, followed by dynamic categories
  const tabs =
    categories && categories.length > 0
      ? [
          { value: "", label: "All Articles" },
          ...categories.map((c) => ({
            value: c.category || c.slug,
            label: c.name || c.category,
          })),
        ]
      : FALLBACK_CATEGORIES;

  // Check scroll positions and overflow
  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();

    // Small timeouts to re-check after fonts, icons and layouts stabilize
    const t1 = setTimeout(checkScroll, 50);
    const t2 = setTimeout(checkScroll, 150);
    const t3 = setTimeout(checkScroll, 300);

    const el = scrollContainerRef.current;
    if (!el) return;

    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);

    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => checkScroll());
      resizeObserver.observe(el);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [checkScroll, tabs]);

  // Auto-scroll active item into view horizontally within the track on mount or when category changes
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // Small delay to ensure render layout is complete
    const timeout = setTimeout(() => {
      const activeEl = el.querySelector('[aria-selected="true"]');
      if (activeEl) {
        const containerRect = el.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();
        const targetScrollLeft =
          el.scrollLeft +
          (activeRect.left - containerRect.left) -
          (el.clientWidth / 2) +
          (activeRect.width / 2);
        el.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
        checkScroll();
      }
    }, 60);

    return () => clearTimeout(timeout);
  }, [activeCategory, checkScroll]);

  // Smooth scroll buttons
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -280, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 280, behavior: "smooth" });
    }
  };

  // Keyboard navigation for tablist
  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      handleScrollLeft();
    } else if (e.key === "ArrowRight") {
      handleScrollRight();
    }
  };

  // URL builder preserving query if present
  const buildHref = (val) => {
    const params = new URLSearchParams();
    if (val) params.set("category", val);
    if (currentQuery) params.set("q", currentQuery);
    const qs = params.toString();
    return `/blog${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="w-full relative" onKeyDown={handleKeyDown}>
      <div className="flex items-center gap-2 sm:gap-2.5 w-full">
        {/* Left Arrow Button — Sharp Corners */}
        <button
          type="button"
          onClick={handleScrollLeft}
          disabled={!canScrollLeft}
          aria-label="Scroll categories left"
          className={`h-10 w-10 sm:h-[42px] sm:w-[42px] rounded-none flex items-center justify-center shrink-0 border transition-all duration-200 select-none ${
            canScrollLeft
              ? "bg-[#0d0d0d] hover:bg-[#141414] border-white/10 hover:border-white/25 text-neutral-300 hover:text-white cursor-pointer active:scale-95"
              : "bg-[#0d0d0d] border-white/[0.04] text-neutral-600 opacity-40 cursor-not-allowed"
          }`}
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Scrollable Category Track */}
        <div
          ref={scrollContainerRef}
          role="tablist"
          aria-label="Blog categories"
          tabIndex={0}
          className="flex-1 overflow-x-auto scroll-smooth py-1 flex items-center gap-2 sm:gap-2.5 focus:outline-none min-w-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {tabs.map(({ value, label }) => {
            const isActive =
              activeCategory === value ||
              (value && activeCategory.toLowerCase() === value.toLowerCase());

            return (
              <Link
                key={value || "all"}
                href={buildHref(value)}
                scroll={false}
                role="tab"
                aria-selected={isActive}
                className={`shrink-0 text-xs sm:text-[13px] font-mono font-semibold uppercase tracking-[0.12em] px-4 sm:px-5 h-10 sm:h-[42px] flex items-center justify-center rounded-none border no-underline whitespace-nowrap select-none transition-all duration-200 ${
                  isActive
                    ? "bg-brand-red border-brand-red text-white font-bold"
                    : "bg-[#0d0d0d] border-white/[0.08] text-neutral-300 hover:text-white hover:border-white/20 hover:bg-[#131313]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right Arrow Button — Sharp Corners */}
        <button
          type="button"
          onClick={handleScrollRight}
          disabled={!canScrollRight}
          aria-label="Scroll categories right"
          className={`h-10 w-10 sm:h-[42px] sm:w-[42px] rounded-none flex items-center justify-center shrink-0 border transition-all duration-200 select-none ${
            canScrollRight
              ? "bg-[#0d0d0d] hover:bg-[#141414] border-white/10 hover:border-white/25 text-neutral-300 hover:text-white cursor-pointer active:scale-95"
              : "bg-[#0d0d0d] border-white/[0.04] text-neutral-600 opacity-40 cursor-not-allowed"
          }`}
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}
