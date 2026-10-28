import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Builds /blog?category=X&q=Y&page=N links — preserves existing filters
 * while changing only the page number. Omit page=0 for clean root URLs.
 */
const Pagination = ({ currentPage = 0, totalPages = 0, category = "", query = "" }) => {
  if (totalPages <= 1) return null;

  const buildHref = (page) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (query) params.set("q", query);
    if (page > 0) params.set("page", page);
    const qs = params.toString();
    return `/blog${qs ? `?${qs}` : ""}`;
  };

  // Generate pagination items with responsive ellipsis windowing
  const getPageItems = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => ({ type: "page", value: i }));
    }

    const items = [];
    const showLeftEllipsis = currentPage > 3;
    const showRightEllipsis = currentPage < totalPages - 4;

    // Always show first page
    items.push({ type: "page", value: 0 });

    if (showLeftEllipsis) {
      items.push({ type: "ellipsis", key: "ellipsis-left" });
    }

    // Determine range around current page
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages - 2, currentPage + 1);

    if (!showLeftEllipsis) {
      start = 1;
      end = Math.min(totalPages - 2, 4);
    } else if (!showRightEllipsis) {
      start = Math.max(1, totalPages - 5);
      end = totalPages - 2;
    }

    for (let i = start; i <= end; i++) {
      items.push({ type: "page", value: i });
    }

    if (showRightEllipsis) {
      items.push({ type: "ellipsis", key: "ellipsis-right" });
    }

    // Always show last page
    items.push({ type: "page", value: totalPages - 1 });

    return items;
  };

  const items = getPageItems();

  return (
    <nav
      aria-label="Blog articles pagination"
      className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 mt-12 sm:mt-16 select-none"
    >
      {/* Previous Page Button */}
      {currentPage > 0 ? (
        <Link
          href={buildHref(currentPage - 1)}
          scroll={false}
          aria-label="Previous page"
          className="w-10 h-10 rounded-none border flex items-center justify-center no-underline transition-all duration-200 text-neutral-300 hover:text-white hover:border-white/20 hover:bg-[#121212] bg-[#0d0d0d] border-white/[0.08] cursor-pointer select-none"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
      ) : (
        <button
          type="button"
          disabled
          aria-label="Previous page"
          aria-disabled="true"
          className="w-10 h-10 rounded-none border flex items-center justify-center text-neutral-700 pointer-events-none bg-transparent border-white/[0.04] opacity-40 cursor-not-allowed select-none"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Page Numbers & Ellipses */}
      {items.map((item, idx) => {
        if (item.type === "ellipsis") {
          return (
            <span
              key={item.key || `ellipsis-${idx}`}
              aria-hidden="true"
              className="w-8 h-10 flex items-center justify-center font-mono text-xs text-neutral-600 select-none"
            >
              …
            </span>
          );
        }

        const isCurrent = item.value === currentPage;
        if (isCurrent) {
          return (
            <span
              key={item.value}
              aria-label={`Page ${item.value + 1}`}
              aria-current="page"
              className="min-w-[40px] h-10 px-2.5 rounded-none flex items-center justify-center font-mono text-xs font-bold bg-brand-red border border-brand-red text-white cursor-default select-none"
            >
              {item.value + 1}
            </span>
          );
        }

        return (
          <Link
            key={item.value}
            href={buildHref(item.value)}
            scroll={false}
            aria-label={`Page ${item.value + 1}`}
            className="min-w-[40px] h-10 px-2.5 rounded-none flex items-center justify-center font-mono text-xs font-semibold no-underline transition-all duration-200 text-neutral-300 border border-white/[0.08] hover:text-white hover:border-white/20 hover:bg-[#121212] bg-[#0d0d0d] cursor-pointer select-none"
          >
            {item.value + 1}
          </Link>
        );
      })}

      {/* Next Page Button */}
      {currentPage < totalPages - 1 ? (
        <Link
          href={buildHref(currentPage + 1)}
          scroll={false}
          aria-label="Next page"
          className="w-10 h-10 rounded-none border flex items-center justify-center no-underline transition-all duration-200 text-neutral-300 hover:text-white hover:border-white/20 hover:bg-[#121212] bg-[#0d0d0d] border-white/[0.08] cursor-pointer select-none"
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <button
          type="button"
          disabled
          aria-label="Next page"
          aria-disabled="true"
          className="w-10 h-10 rounded-none border flex items-center justify-center text-neutral-700 pointer-events-none bg-transparent border-white/[0.04] opacity-40 cursor-not-allowed select-none"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </nav>
  );
};

export default Pagination;
