"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Play, ArrowRight, Terminal, Film, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = [
  { value: "ALL", label: "All Work" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "INSTAGRAM_REELS", label: "Instagram Reels" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "MOTION_GRAPHICS", label: "Motion Graphics" },
  { value: "CORPORATE", label: "Corporate" },
  { value: "REAL_ESTATE", label: "Real Estate" },
];

const CATEGORY_STYLES = {
  YOUTUBE: "text-brand-red",
  COMMERCIAL: "text-orange-400",
  REAL_ESTATE: "text-brand-green",
  INSTAGRAM_REELS: "text-purple-400",
  MOTION_GRAPHICS: "text-blue-400",
  CORPORATE: "text-gray-300",
};

// Receives the full VIDEO_EDITING dataset once (fetched server-side) and
// filters client-side — the dataset is small enough that a new network
// round-trip per tab click isn't worth the complexity.
const PortfolioGrid = ({ items = [] }) => {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [sortLatest, setSortLatest] = useState(false);

  const filtered = useMemo(() => {
    let result =
      activeCategory === "ALL"
        ? items
        : items.filter((item) => item.category === activeCategory);

    if (sortLatest) {
      result = [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return result;
  }, [items, activeCategory, sortLatest]);

  return (
    <section className="bg-[#0a0a0a] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Filter tabs + sort */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setActiveCategory(value)}
                className={`text-[11px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-full border transition-colors duration-300 cursor-pointer ${
                  activeCategory === value
                    ? "bg-brand-red border-brand-red text-white"
                    : "bg-transparent border-white/10 text-gray-400 hover:border-white/30"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSortLatest((s) => !s)}
            className={`inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${
              sortLatest
                ? "border-brand-red text-white bg-brand-red/10"
                : "border-white/10 text-gray-400 hover:border-white/30 bg-transparent"
            }`}
          >
            Latest <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Section header — icon, divider, "View All Projects" */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 shrink-0">
            <Film className="w-4 h-4 text-brand-red" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white whitespace-nowrap">
              Video Editing
            </h2>
          </div>
          <div className="flex-1 h-px bg-white/[0.08]" />
          <Link
            href="/portfolio"
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white no-underline shrink-0 transition-colors"
          >
            View All Projects <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {filtered.length === 0 ? (
          <p className="text-gray-600 text-sm py-12 text-center">
            No projects in this category yet.
          </p>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {filtered.map((project) => (
              <motion.div
                key={project.id}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.4 }}
                className="group"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-white/[0.04] border border-white/10 mb-3">
                  {project.thumbnailUrl || project.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.thumbnailUrl || project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Terminal className="w-8 h-8 text-white/10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center transition-colors duration-300">
                    <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                    </div>
                  </div>
                  {project.duration && (
                    <span className="absolute bottom-2 right-2 text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded">
                      {project.duration}
                    </span>
                  )}
                </div>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${CATEGORY_STYLES[project.category] || "text-gray-400"}`}>
                  {CATEGORIES.find((c) => c.value === project.category)?.label || project.category}
                </p>
                <h3 className="text-sm font-bold text-white">{project.title}</h3>
                {project.description && (
                  <p className="text-xs text-gray-500 mt-1">{project.description}</p>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default PortfolioGrid;
