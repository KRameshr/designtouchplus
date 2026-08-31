"use client";

import Link from "next/link";
import { Play, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// Matches the category tag colors used across the Figma portfolio screens
const CATEGORY_STYLES = {
  YOUTUBE: "text-brand-red",
  COMMERCIAL: "text-orange-400",
  REAL_ESTATE: "text-brand-green",
  INSTAGRAM_REELS: "text-purple-400",
  MOTION_GRAPHICS: "text-blue-400",
  CORPORATE: "text-gray-300",
};

const CATEGORY_LABELS = {
  YOUTUBE: "YouTube",
  COMMERCIAL: "Commercial",
  REAL_ESTATE: "Real Estate",
  INSTAGRAM_REELS: "Instagram Reel",
  MOTION_GRAPHICS: "Motion Graphics",
  CORPORATE: "Corporate",
};

const FeaturedProjects = ({ projects }) => {
  if (!projects || projects.length === 0) return null;

  return (
    <section className="bg-[#0a0a0a] text-white px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Our Work
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase">
              Featured Projects
            </h2>
          </div>
          <Link
            href="/portfolio"
            className="hidden sm:inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white no-underline transition-colors"
          >
            View All Projects <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="group"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden bg-white/[0.04] border border-white/10 mb-3">
                {project.thumbnailUrl || project.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.thumbnailUrl || project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent" />
                )}

                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                  </div>
                </div>

                <span
                  className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest ${
                    CATEGORY_STYLES[project.category] || "text-gray-300"
                  }`}
                >
                  {CATEGORY_LABELS[project.category] || project.category}
                </span>

                {project.duration && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold text-white/80">
                    {project.duration}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-white mb-1">{project.title}</h3>
              {project.description && (
                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                  {project.description}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        <Link
          href="/portfolio"
          className="sm:hidden mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 no-underline"
        >
          View All Projects <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
};

export default FeaturedProjects;
