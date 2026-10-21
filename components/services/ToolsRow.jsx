"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

const CANONICAL_TOOLS = [
  {
    name: "Adobe Premiere Pro",
    shortCode: "Pr",
    role: "NLE & Timeline Assembly",
    badgeColor: "border-[#9999FF]/40 text-[#9999FF] bg-[#9999FF]/10",
  },
  {
    name: "After Effects",
    shortCode: "Ae",
    role: "Motion & Visual Effects",
    badgeColor: "border-[#D291FF]/40 text-[#D291FF] bg-[#D291FF]/10",
  },
  {
    name: "DaVinci Resolve",
    shortCode: "Dv",
    role: "Color Grading & Mastering",
    badgeColor: "border-[#FF5555]/40 text-[#FF7777] bg-[#FF5555]/10",
  },
  {
    name: "Photoshop",
    shortCode: "Ps",
    role: "Thumbnail & Raster Art",
    badgeColor: "border-[#31A8FF]/40 text-[#31A8FF] bg-[#31A8FF]/10",
  },
  {
    name: "Illustrator",
    shortCode: "Ai",
    role: "Vector Graphics & Branding",
    badgeColor: "border-[#FF9A00]/40 text-[#FF9A00] bg-[#FF9A00]/10",
  },
  {
    name: "Blender",
    shortCode: "3D",
    role: "3D Animation & Assets",
    badgeColor: "border-[#EA7600]/40 text-[#EA7600] bg-[#EA7600]/10",
  },
  {
    name: "Figma",
    shortCode: "Fg",
    role: "Storyboards & UI Layout",
    badgeColor: "border-[#0ACF83]/40 text-[#0ACF83] bg-[#0ACF83]/10",
  },
];

const COLOR_MAP = {
  Pr: "border-[#9999FF]/40 text-[#9999FF] bg-[#9999FF]/10",
  Ae: "border-[#D291FF]/40 text-[#D291FF] bg-[#D291FF]/10",
  Dv: "border-[#FF5555]/40 text-[#FF7777] bg-[#FF5555]/10",
  Ps: "border-[#31A8FF]/40 text-[#31A8FF] bg-[#31A8FF]/10",
  Ai: "border-[#FF9A00]/40 text-[#FF9A00] bg-[#FF9A00]/10",
  "3D": "border-[#EA7600]/40 text-[#EA7600] bg-[#EA7600]/10",
  Fg: "border-[#0ACF83]/40 text-[#0ACF83] bg-[#0ACF83]/10",
};

export default function ToolsRow({ tools = [], content }) {
  const renderedTools = useMemo(() => {
    if (Array.isArray(tools) && tools.length > 0) {
      return tools.map((t, idx) => {
        const code = t.iconKey || t.name.slice(0, 2);
        return {
          name: t.name,
          shortCode: code,
          role: t.role || "Creative Tool",
          websiteUrl: t.websiteUrl,
          badgeColor:
            COLOR_MAP[code] ||
            (idx % 2 === 0
              ? "border-brand-red/40 text-brand-red bg-brand-red/10"
              : "border-brand-green/40 text-brand-green bg-brand-green/10"),
        };
      });
    }
    return CANONICAL_TOOLS;
  }, [tools]);

  const eyebrow = content?.toolsEyebrow || "PRODUCTION STACK // HARDWARE & SOFTWARE";
  const heading = content?.toolsHeading || "TOOLS WE USE";
  const description =
    content?.toolsDescription ||
    "Industry-standard software suites power every frame, cut, grade, and render we produce for our clients.";

  return (
    <section className="bg-[#080808] text-white px-4 sm:px-6 py-16 sm:py-20 border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0" aria-hidden="true" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.24em] text-neutral-400">
                {eyebrow}
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
              {heading}
            </h2>
          </div>
          <p className="text-neutral-400 text-xs sm:text-sm font-normal max-w-md leading-relaxed sm:text-right">
            {description}
          </p>
        </div>

        {/* Tools Horizontal Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {renderedTools.map((tool, index) => {
            const cardContent = (
              <>
                {/* Tool Monogram Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`w-9 h-9 flex items-center justify-center font-display font-black text-xs border rounded-none ${tool.badgeColor}`}
                  >
                    {tool.shortCode}
                  </span>
                  <span className="text-[9px] font-mono text-neutral-600 group-hover:text-neutral-400 transition-colors uppercase">
                    STD
                  </span>
                </div>

                {/* Tool Name & Role */}
                <div>
                  <h3 className="font-display font-bold text-xs sm:text-sm uppercase tracking-tight text-white mb-1 leading-snug">
                    {tool.name}
                  </h3>
                  <p className="text-[10px] font-mono text-neutral-400 leading-tight">
                    {tool.role}
                  </p>
                </div>
              </>
            );

            return (
              <motion.div
                key={tool.name + index}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="bg-[#0c0c0c] border border-white/10 hover:border-white/30 p-4 flex flex-col justify-between group transition-colors rounded-none"
              >
                {tool.websiteUrl ? (
                  <a
                    href={tool.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline text-inherit flex flex-col justify-between h-full"
                  >
                    {cardContent}
                  </a>
                ) : (
                  cardContent
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
