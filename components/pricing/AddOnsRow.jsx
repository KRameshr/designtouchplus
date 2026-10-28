"use client";

import { useId } from "react";
import {
  Clock,
  Image as ImageIcon,
  ImagePlus,
  Captions,
  Subtitles,
  Zap,
  Timer,
  PenLine,
  FileText,
  Plus,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

// Style definitions for each icon and service type
const ICON_STYLES = {
  // 1. Additional Minute (Green accent)
  clock: {
    icon: Clock,
    circle: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-400/50 group-hover:text-emerald-300",
    glow: "group-hover:shadow-[0_4px_20px_rgba(16,185,129,0.22)]",
    ring: "group-hover:ring-1 group-hover:ring-emerald-400/30",
  },
  // 2. Thumbnail Design (Amber accent)
  image: {
    icon: ImageIcon,
    circle: "bg-amber-400/10 border-amber-400/20 text-amber-400 group-hover:bg-amber-400/20 group-hover:border-amber-400/50 group-hover:text-amber-300",
    glow: "group-hover:shadow-[0_4px_20px_rgba(245,158,11,0.22)]",
    ring: "group-hover:ring-1 group-hover:ring-amber-400/30",
  },
  imageplus: {
    icon: ImagePlus,
    circle: "bg-amber-400/10 border-amber-400/20 text-amber-400 group-hover:bg-amber-400/20 group-hover:border-amber-400/50 group-hover:text-amber-300",
    glow: "group-hover:shadow-[0_4px_20px_rgba(245,158,11,0.22)]",
    ring: "group-hover:ring-1 group-hover:ring-amber-400/30",
  },
  // 3. Subtitles (Purple accent)
  captions: {
    icon: Captions,
    circle: "bg-purple-500/10 border-purple-500/20 text-purple-400 group-hover:bg-purple-500/20 group-hover:border-purple-400/50 group-hover:text-purple-300",
    glow: "group-hover:shadow-[0_4px_20px_rgba(168,85,247,0.24)]",
    ring: "group-hover:ring-1 group-hover:ring-purple-400/30",
  },
  subtitles: {
    icon: Subtitles,
    circle: "bg-purple-500/10 border-purple-500/20 text-purple-400 group-hover:bg-purple-500/20 group-hover:border-purple-400/50 group-hover:text-purple-300",
    glow: "group-hover:shadow-[0_4px_20px_rgba(168,85,247,0.24)]",
    ring: "group-hover:ring-1 group-hover:ring-purple-400/30",
  },
  // 4. Rush Delivery (Red accent)
  zap: {
    icon: Zap,
    circle: "bg-brand-red/10 border-brand-red/25 text-brand-red group-hover:bg-brand-red/20 group-hover:border-brand-red/55 group-hover:text-red-300",
    glow: "group-hover:shadow-[0_4px_20px_rgba(239,68,68,0.28)]",
    ring: "group-hover:ring-1 group-hover:ring-brand-red/40",
  },
  timer: {
    icon: Timer,
    circle: "bg-brand-red/10 border-brand-red/25 text-brand-red group-hover:bg-brand-red/20 group-hover:border-brand-red/55 group-hover:text-red-300",
    glow: "group-hover:shadow-[0_4px_20px_rgba(239,68,68,0.28)]",
    ring: "group-hover:ring-1 group-hover:ring-brand-red/40",
  },
  // 5. Script Writing (Green accent)
  pen: {
    icon: PenLine,
    circle: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-400/50 group-hover:text-emerald-300",
    glow: "group-hover:shadow-[0_4px_20px_rgba(16,185,129,0.22)]",
    ring: "group-hover:ring-1 group-hover:ring-emerald-400/30",
  },
  penline: {
    icon: PenLine,
    circle: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-400/50 group-hover:text-emerald-300",
    glow: "group-hover:shadow-[0_4px_20px_rgba(16,185,129,0.22)]",
    ring: "group-hover:ring-emerald-400/30",
  },
  filetext: {
    icon: FileText,
    circle: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-400/50 group-hover:text-emerald-300",
    glow: "group-hover:shadow-[0_4px_20px_rgba(16,185,129,0.22)]",
    ring: "group-hover:ring-emerald-400/30",
  },
};

// Fallback style for unknown add-ons
const FALLBACK_STYLE = {
  icon: Plus,
  circle: "bg-white/[0.05] border-white/10 text-neutral-300 group-hover:bg-white/[0.1] group-hover:border-white/30 group-hover:text-white",
  glow: "group-hover:shadow-[0_4px_20px_rgba(255,255,255,0.12)]",
  ring: "group-hover:ring-1 group-hover:ring-white/30",
};

// Name-based mappings matching the standard DesignTouch+ Add-Ons
const ADDON_NAME_STYLES = {
  "additional minute": ICON_STYLES.clock,
  "thumbnail design": ICON_STYLES.image,
  "subtitles (per video)": ICON_STYLES.captions,
  "subtitles": ICON_STYLES.captions,
  "rush delivery": ICON_STYLES.zap,
  "script writing (per video)": ICON_STYLES.penline,
  "script writing": ICON_STYLES.penline,
};

function getAddonStyle(addOn) {
  if (!addOn) return FALLBACK_STYLE;

  // 1. Direct match on explicit icon property from CMS / API
  const iconKey = String(addOn.icon || "").trim().toLowerCase();
  if (iconKey && ICON_STYLES[iconKey]) {
    return ICON_STYLES[iconKey];
  }

  // 2. Exact match on normalized add-on name
  const nameKey = String(addOn.name || "").trim().toLowerCase();
  if (ADDON_NAME_STYLES[nameKey]) {
    return ADDON_NAME_STYLES[nameKey];
  }

  // 3. Keyword-based matching for customized or reworded add-on names
  if (nameKey.includes("minute") || nameKey.includes("duration") || nameKey.includes("clock")) {
    return ICON_STYLES.clock;
  }
  if (nameKey.includes("thumbnail") || nameKey.includes("image") || nameKey.includes("cover")) {
    return ICON_STYLES.image;
  }
  if (nameKey.includes("subtitle") || nameKey.includes("caption")) {
    return ICON_STYLES.captions;
  }
  if (nameKey.includes("rush") || nameKey.includes("fast") || nameKey.includes("speed") || nameKey.includes("timer") || nameKey.includes("express")) {
    return ICON_STYLES.zap;
  }
  if (nameKey.includes("script") || nameKey.includes("write") || nameKey.includes("copy") || nameKey.includes("text")) {
    return ICON_STYLES.penline;
  }

  return FALLBACK_STYLE;
}

const AddOnsRow = ({ addOns = [] }) => {
  const shouldReduceMotion = useReducedMotion();
  const headingId = useId();

  if (!Array.isArray(addOns) || addOns.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      y: shouldReduceMotion ? 0 : 16,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section
      aria-labelledby={headingId}
      className="bg-[#080808] text-white px-4 sm:px-6 pb-12 sm:pb-16"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Heading with subtle accent */}
        <div className="mb-5 sm:mb-6">
          <div className="flex items-center gap-2.5">
            <span
              className="w-2 h-2 rounded-full bg-brand-red shrink-0"
              aria-hidden="true"
            />
            <h2
              id={headingId}
              className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.22em] text-neutral-300"
            >
              Add-Ons
            </h2>
          </div>
          {/* Restrained animated red accent line */}
          <motion.div
            initial={shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            style={{ originX: 0 }}
            className="h-[1.5px] w-12 bg-gradient-to-r from-brand-red via-brand-red/80 to-transparent mt-2 rounded-full"
            aria-hidden="true"
          />
        </div>

        {/* 5-item animated container */}
        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 bg-[#0c0c0c] border border-white/[0.08] rounded-[12px] sm:rounded-[14px] overflow-hidden list-none p-0 m-0 shadow-lg shadow-black/40"
        >
          {addOns.map((addOn, index) => {
            const style = getAddonStyle(addOn);
            const Icon = style.icon;

            // Compute border classes across breakpoints
            // Mobile (col 1): border-t on index > 0
            // Tablet (col 2): border-l on odd columns, border-t on row >= 1, last item spans 2 cols if odd total
            // Desktop (col 5): border-l on all except first item, zero top border
            const isLastOdd = index === addOns.length - 1 && addOns.length % 2 === 1;

            return (
              <motion.li
                key={addOn.id || addOn.name}
                variants={itemVariants}
                tabIndex={0}
                className={`group relative flex items-center justify-between sm:justify-start gap-3.5 sm:gap-4 p-4 sm:p-5 xl:p-6 transition-all duration-300 ease-out cursor-default outline-none select-none ${
                  shouldReduceMotion ? "" : "motion-safe:hover:-translate-y-1 motion-safe:focus-visible:-translate-y-1"
                } hover:bg-white/[0.025] hover:z-10 focus-visible:z-20 focus-visible:ring-1 focus-visible:ring-white/30 ${
                  index > 0 ? "border-t border-white/[0.06] sm:border-t-0" : ""
                } ${
                  index % 2 === 1 ? "sm:border-l border-white/[0.06]" : ""
                } ${
                  index >= 2 ? "sm:border-t border-white/[0.06] lg:border-t-0" : ""
                } ${
                  index > 0 ? "lg:border-l lg:border-t-0 border-white/[0.08]" : ""
                } ${
                  isLastOdd ? "sm:col-span-2 lg:col-span-1" : ""
                }`}
              >
                {/* Circular tinted icon */}
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 lg:w-[50px] lg:h-[50px] xl:w-[52px] xl:h-[52px] rounded-full flex items-center justify-center shrink-0 border overflow-hidden transition-all duration-250 ease-out ${
                    style.circle
                  } ${
                    style.glow
                  } ${
                    style.ring
                  } ${
                    shouldReduceMotion
                      ? ""
                      : "motion-safe:group-hover:scale-[1.08] motion-safe:group-hover:-translate-y-[2px]"
                  }`}
                >
                  {addOn.customIconUrl ? (
                    <img
                      src={addOn.customIconUrl}
                      alt={addOn.name || "Add-on custom icon"}
                      aria-hidden="true"
                      className="w-full h-full p-1 sm:p-[3px] object-contain transition-transform duration-250 ease-out"
                    />
                  ) : (
                    <Icon
                      className="w-[22px] h-[22px] sm:w-[24px] sm:h-[24px] lg:w-[25px] lg:h-[25px] transition-all duration-250 ease-out"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <span className="text-[13px] sm:text-[12.5px] xl:text-[13px] font-medium text-neutral-200 group-hover:text-white transition-colors duration-200 leading-snug line-clamp-2">
                    {addOn.name}
                  </span>
                  {/* Price underneath name on tablet/desktop */}
                  <span className="text-[12px] xl:text-[12.5px] font-mono font-bold text-brand-green group-hover:text-emerald-300 transition-colors duration-200 mt-0.5 tracking-tight hidden sm:block">
                    {addOn.priceLabel}
                  </span>
                </div>

                {/* Mobile-only Price (aligned right) */}
                <span className="text-[12.5px] font-mono font-bold text-brand-green group-hover:text-emerald-300 transition-colors duration-200 whitespace-nowrap shrink-0 sm:hidden">
                  {addOn.priceLabel}
                </span>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
};

export default AddOnsRow;
