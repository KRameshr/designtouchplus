import Link from "next/link";

const CATEGORIES = [
  { value: "", label: "All Articles" },
  { value: "VIDEO_EDITING", label: "Video Editing" },
  { value: "MOTION_GRAPHICS", label: "Motion Graphics" },
  { value: "CONTENT_CREATION", label: "Content Creation" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "BUSINESS", label: "Business" },
];

// Plain <Link>s with query params — clicking a tab is a normal navigation,
// so the page re-renders server-side with the filtered list already in the
// initial HTML (no client-side fetch/loading state needed).
const BlogFilterTabs = ({ activeCategory = "" }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-10">
      {CATEGORIES.map(({ value, label }) => {
        const isActive = activeCategory === value;
        return (
          <Link
            key={value || "all"}
            href={value ? `/blog?category=${value}` : "/blog"}
            className={`text-[11px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-full border no-underline transition-colors duration-300 ${
              isActive
                ? "bg-brand-red border-brand-red text-white"
                : "bg-transparent border-white/10 text-gray-400 hover:border-white/30"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
};

export default BlogFilterTabs;
