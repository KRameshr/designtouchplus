"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getProcessIconMeta } from "@/lib/processIcons";

const DEFAULT_PROCESS_STEPS = [
  {
    numericStep: 1,
    stepNumber: "01",
    title: "DISCOVER",
    description: "We learn about your brand, goals and vision.",
    icon: "discover",
  },
  {
    numericStep: 2,
    stepNumber: "02",
    title: "PLAN",
    description: "We brainstorm ideas and create a clear strategy.",
    icon: "plan",
  },
  {
    numericStep: 3,
    stepNumber: "03",
    title: "CREATE",
    description: "Our team brings your story to life with creativity.",
    icon: "create",
  },
  {
    numericStep: 4,
    stepNumber: "04",
    title: "REVIEW",
    description: "We collaborate, refine and make it perfect.",
    icon: "review",
  },
  {
    numericStep: 5,
    stepNumber: "05",
    title: "DELIVER",
    description: "We deliver the final product that drives results.",
    icon: "deliver",
  },
];

export default function ServicesProcess({ steps = [], content }) {
  const prefersReducedMotion = useReducedMotion();

  const renderedSteps = useMemo(() => {
    if (Array.isArray(steps) && steps.length > 0) {
      return steps.map((step, idx) => {
        const numericStep = Number(step.stepNumber) || idx + 1;
        const cleanTitle =
          (step.title || "")
            .replace(/^\d+\.\s*/, "")
            .trim() || `STEP ${numericStep}`;
        const iconMeta = getProcessIconMeta(
          step.icon,
          cleanTitle,
          numericStep
        );

        return {
          id: step.id || `${numericStep}-${cleanTitle}`,
          numericStep,
          stepNumber: String(numericStep).padStart(2, "0"),
          title: cleanTitle,
          description: step.description || "",
          icon: iconMeta.key,
          iconSrc: iconMeta.src,
        };
      });
    }

    return DEFAULT_PROCESS_STEPS.map((step) => {
      const iconMeta = getProcessIconMeta(
        step.icon,
        step.title,
        step.numericStep
      );
      return {
        ...step,
        id: `${step.numericStep}-${step.title}`,
        icon: iconMeta.key,
        iconSrc: iconMeta.src,
      };
    });
  }, [steps]);

  const eyebrow = content?.processEyebrow || "HOW WE WORK // METHODOLOGY";
  const heading = content?.processHeading || "OUR PROCESS";
  const description =
    content?.processDescription ||
    "A structured five-step production workflow built for creative alignment, swift turnaround, and measurable results.";

  const desktopGridCols =
    renderedSteps.length === 5
      ? "lg:grid-cols-5"
      : renderedSteps.length === 4
      ? "lg:grid-cols-4"
      : renderedSteps.length === 3
      ? "lg:grid-cols-3"
      : "lg:grid-cols-5";

  return (
    <section
      aria-labelledby="services-process-heading"
      className="bg-[#080808] text-white px-4 sm:px-6 py-16 sm:py-24 border-b border-white/[0.08] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14 sm:mb-20 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span
                className="w-2.5 h-2.5 bg-brand-red rounded-full inline-block shrink-0"
                aria-hidden="true"
              />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.24em] text-neutral-400">
                {eyebrow}
              </span>
            </div>
            <h2
              id="services-process-heading"
              className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-[-0.03em] text-white"
            >
              {heading}
            </h2>
          </div>
          <p className="text-neutral-400 text-xs sm:text-sm font-normal max-w-md leading-relaxed sm:text-right">
            {description}
          </p>
        </div>

        {/* Client Reference-Matched Process Timeline */}
        <ol
          className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${desktopGridCols} gap-y-10 sm:gap-y-12 sm:gap-x-8 lg:gap-6 xl:gap-8 list-none p-0 m-0`}
        >
          {renderedSteps.map((step, index) => {
            const isLast = index === renderedSteps.length - 1;

            return (
              <motion.li
                key={step.id}
                initial={
                  prefersReducedMotion
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 16 }
                }
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.38, delay: index * 0.06, ease: "easeOut" }
                }
                className="group relative flex flex-col items-center text-center"
              >
                {/* Horizontal Dotted Connector + Red Dot (Desktop between step i and i+1) */}
                {!isLast && (
                  <div
                    aria-hidden="true"
                    className="hidden lg:flex items-center justify-center absolute top-[46px] -translate-y-1/2 left-[calc(50%+50px)] w-[calc(100%+24px-100px)] xl:w-[calc(100%+32px-100px)] pointer-events-none z-0"
                  >
                    <span className="w-full border-t border-dashed border-white/25 group-hover:border-white/45 transition-colors duration-200" />
                    <span
                      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-brand-red shadow-[0_0_8px_rgba(239,68,68,0.45)] transition-transform duration-200 ${
                        prefersReducedMotion ? "" : "group-hover:scale-125"
                      }`}
                    />
                  </div>
                )}

                {/* Circular Outline Icon Container */}
                <div
                  tabIndex={0}
                  className={`relative z-10 w-20 h-20 sm:w-[88px] sm:h-[88px] lg:w-[92px] lg:h-[92px] rounded-full bg-[#0b0b0b] border border-white/20 group-hover:border-brand-red/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/70 flex items-center justify-center mb-6 transition-[transform,border-color,background-color,box-shadow] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-[#111111] group-hover:shadow-[0_10px_28px_-10px_rgba(239,68,68,0.22)] ${
                    prefersReducedMotion ? "" : "group-hover:-translate-y-1"
                  }`}
                >
                  <img
                    src={step.iconSrc}
                    alt={`${step.title} step icon`}
                    width={38}
                    height={38}
                    className={`w-9 h-9 sm:w-[38px] sm:h-[38px] object-contain select-none opacity-95 group-hover:opacity-100 transition-transform duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      prefersReducedMotion ? "" : "group-hover:scale-[1.06]"
                    }`}
                  />
                </div>

                {/* Centered Step Number + Title */}
                <h3 className="font-display text-sm sm:text-[15px] font-bold uppercase tracking-[0.04em] text-white mb-2.5 leading-snug">
                  {step.numericStep}. {step.title}
                </h3>

                {/* Centered Step Description */}
                <p className="text-xs sm:text-[13px] text-neutral-400 font-sans leading-[1.6] max-w-[220px] mx-auto">
                  {step.description}
                </p>

                {/* Mobile Vertical Dotted Connector + Red Dot */}
                {!isLast && (
                  <div
                    aria-hidden="true"
                    className="flex sm:hidden items-center justify-center relative h-9 mt-6 pointer-events-none"
                  >
                    <span className="h-full border-l border-dashed border-white/25" />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-brand-red shadow-[0_0_6px_rgba(239,68,68,0.45)]" />
                  </div>
                )}
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
