import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Builds /blog?category=X&q=Y&page=N links — preserves existing filters
// while changing only the page number.
const Pagination = ({ currentPage, totalPages, category, query }) => {
  if (totalPages <= 1) return null;

  const buildHref = (page) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (query) params.set("q", query);
    if (page > 0) params.set("page", page);
    const qs = params.toString();
    return `/blog${qs ? `?${qs}` : ""}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i);

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <Link
        href={buildHref(Math.max(0, currentPage - 1))}
        aria-disabled={currentPage === 0}
        className={`w-9 h-9 rounded-full border border-white/10 flex items-center justify-center no-underline ${
          currentPage === 0 ? "text-gray-700 pointer-events-none" : "text-gray-400 hover:text-white hover:border-white/30"
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
      </Link>

      {pages.map((page) => (
        <Link
          key={page}
          href={buildHref(page)}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold no-underline transition-colors ${
            page === currentPage
              ? "bg-brand-red text-white"
              : "text-gray-400 border border-white/10 hover:text-white hover:border-white/30"
          }`}
        >
          {page + 1}
        </Link>
      ))}

      <Link
        href={buildHref(Math.min(totalPages - 1, currentPage + 1))}
        aria-disabled={currentPage === totalPages - 1}
        className={`w-9 h-9 rounded-full border border-white/10 flex items-center justify-center no-underline ${
          currentPage === totalPages - 1 ? "text-gray-700 pointer-events-none" : "text-gray-400 hover:text-white hover:border-white/30"
        }`}
      >
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
};

export default Pagination;
