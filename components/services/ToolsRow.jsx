"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  TOOL_ICON_OPTIONS,
  getToolMonogram,
  resolveToolIconMeta,
} from "@/lib/toolIcons";

const CANONICAL_TOOLS = TOOL_ICON_OPTIONS.map((opt, idx) => ({
  id: opt.key,
  name: opt.label,
  shortCode: opt.shortCode,
  logoUrl: opt.src,
  iconSrc: opt.src,
  iconFilename: opt.filename,
  hasIcon: true,
  role: "Creative Tool",
  displayOrder: idx + 1,
}));

function ToolBadgeIcon({ tool, prefersReducedMotion }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const showImage =
    Boolean(tool.hasIcon && tool.iconSrc) && failedSrc !== tool.iconSrc;

  if (showImage) {
    return (
      <img
        src={tool.iconSrc}
        alt={`${tool.name} application icon`}
        width={40}
        height={40}
        onError={() => setFailedSrc(tool.iconSrc)}
        className={`w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0 select-none transition-transform duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          prefersReducedMotion ? "" : "group-hover:scale-[1.06]"
        }`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-[9px] bg-[#141414] border border-white/15 flex items-center justify-center shrink-0 select-none font-mono text-xs sm:text-[13px] font-bold tracking-tight text-neutral-100 transition-transform duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        prefersReducedMotion ? "" : "group-hover:scale-[1.06]"
      }`}
    >
      {getToolMonogram(tool.shortCode, tool.name)}
    </span>
  );
}

export default function ToolsRow({ tools = [], content }) {
  const prefersReducedMotion = useReducedMotion();

  const renderedTools = useMemo(() => {
    if (Array.isArray(tools) && tools.length > 0) {
      return tools.map((t, idx) => {
        const iconMeta = resolveToolIconMeta(t);
        return {
          id: t.id || `${t.name}-${idx}`,
          name: t.name,
          shortCode: getToolMonogram(t.iconKey, t.name || iconMeta.shortCode),
          role: t.role || "Creative Tool",
          websiteUrl: t.websiteUrl,
          iconSrc: iconMeta.src,
          iconFilename: iconMeta.filename,
          hasIcon: iconMeta.hasIcon,
        };
      });
    }
    return CANONICAL_TOOLS;
  }, [tools]);

  const eyebrow =
    content?.toolsEyebrow || "PRODUCTION STACK // HARDWARE & SOFTWARE";
  const heading = content?.toolsHeading || "TOOLS WE USE";
  const description =
    content?.toolsDescription ||
    "Industry-standard software suites power every frame, cut, grade, and render we produce for our clients.";

  return (
    <section
      aria-labelledby="services-tools-heading"
      className="bg-[#080808] text-white px-4 sm:px-6 py-16 sm:py-20 border-b border-white/[0.08] overflow-x-clip"
    >
      <div className="max-w-7xl mx-auto min-w-0">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12 pb-6 border-b border-white/[0.08]">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 mb-2">
              <span
                className="w-2.5 h-2.5 bg-brand-red rounded-full inline-block shrink-0"
                aria-hidden="true"
              />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.24em] text-neutral-400">
                {eyebrow}
              </span>
            </div>
            <h2
              id="services-tools-heading"
              className="font-display text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white"
            >
              {heading}
            </h2>
          </div>
          <p className="text-neutral-400 text-xs sm:text-sm font-normal max-w-md leading-relaxed sm:text-right">
            {description}
          </p>
        </div>

        {/* Client Reference-Matched Responsive Tools Container */}
        <div className="w-full max-w-full overflow-hidden bg-[#0b0b0b] border border-white/[0.1] rounded-[12px] px-4 sm:px-6 lg:px-7 py-5 sm:py-6">
          <ul className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:flex-wrap lg:items-center lg:justify-center xl:justify-evenly gap-x-4 gap-y-3 sm:gap-x-5 sm:gap-y-4 list-none p-0 m-0 w-full min-w-0">
            {renderedTools.map((tool, index) => {
              const itemInner = (
                <div
                  className={`group flex items-center gap-2.5 sm:gap-3 py-1.5 px-2.5 rounded-[8px] border border-transparent hover:border-white/[0.08] hover:bg-white/[0.025] min-w-0 max-w-full transition-all duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    prefersReducedMotion ? "" : "hover:-translate-y-0.5"
                  }`}
                  title={
                    tool.role ? `${tool.name} — ${tool.role}` : tool.name
                  }
                >
                  <ToolBadgeIcon
                    tool={tool}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                  <span className="font-sans text-xs sm:text-[13.5px] font-medium text-neutral-200 group-hover:text-white transition-colors duration-[220ms] leading-snug min-w-0 break-words">
                    {tool.name}
                  </span>
                </div>
              );

              return (
                <motion.li
                  key={tool.id || `${tool.name}-${index}`}
                  className="min-w-0 max-w-full"
                  initial={
                    prefersReducedMotion
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 10 }
                  }
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { duration: 0.3, delay: index * 0.04, ease: "easeOut" }
                  }
                >
                  {tool.websiteUrl ? (
                    <a
                      href={tool.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-underline text-inherit block min-w-0 max-w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/70 rounded-[8px]"
                    >
                      {itemInner}
                    </a>
                  ) : (
                    itemInner
                  )}
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
