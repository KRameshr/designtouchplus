"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

const DEFAULT_PROCESS_STEPS = [
  {
    stepNumber: "01",
    title: "Discover",
    description: "We analyze your brand voice, content goals, audience metrics, and raw source footage to establish a clear creative brief.",
    icon: "discover",
  },
  {
    stepNumber: "02",
    title: "Plan",
    description: "We outline narrative arcs, pacing blueprints, sound design references, and milestone schedules before touching the edit.",
    icon: "plan",
  },
  {
    stepNumber: "03",
    title: "Create",
    description: "Our dedicated editors and motion designers craft the assembly, rhythm, B-roll layering, custom graphics, and color grading.",
    icon: "create",
  },
  {
    stepNumber: "04",
    title: "Review",
    description: "Structured feedback cycles let you review timecoded cuts and request precision adjustments until the final edit is dialed in.",
    icon: "review",
  },
  {
    stepNumber: "05",
    title: "Deliver",
    description: "Master exports are prepared in 4K ProRes, YouTube landscape, and 9:16 vertical cuts, securely delivered and archived.",
    icon: "deliver",
  },
];

function StepIcon({ type }) {
  switch (type) {
    case "discover":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      );
    case "plan":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <rect x="3" y="3" width="18" height="18" rx="0" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      );
    case "create":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
          <path d="M20 4v4m2-2h-4" />
        </svg>
      );
    case "review":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M9 10h6M9 14h3" />
        </svg>
      );
    case "deliver":
    default:
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" fill="none" />
        </svg>
      );
  }
}

export default function ServicesProcess({ steps = [], content }) {
  const renderedSteps = useMemo(() => {
    if (Array.isArray(steps) && steps.length > 0) {
      return steps.map((step, idx) => ({
        stepNumber: String(step.stepNumber ?? idx + 1).padStart(2, "0"),
        title: step.title?.replace(/^\d+\.\s*/, "") || `Phase ${idx + 1}`,
        description: step.description || "",
        icon: step.icon || DEFAULT_PROCESS_STEPS[idx % DEFAULT_PROCESS_STEPS.length]?.icon || "discover",
      }));
    }
    return DEFAULT_PROCESS_STEPS;
  }, [steps]);

  const eyebrow = content?.processEyebrow || "HOW WE WORK // METHODOLOGY";
  const heading = content?.processHeading || "OUR PROCESS";
  const description =
    content?.processDescription ||
    "A structured five-step production workflow built for creative alignment, swift turnaround, and measurable results.";

  return (
    <section className="bg-[#080808] text-white px-4 sm:px-6 py-16 sm:py-24 border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 sm:mb-16 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0" aria-hidden="true" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.24em] text-neutral-400">
                {eyebrow}
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
              {heading}
            </h2>
          </div>
          <p className="text-neutral-400 text-xs sm:text-sm font-normal max-w-md leading-relaxed sm:text-right">
            {description}
          </p>
        </div>

        {/* Desktop Horizontal Process Timeline */}
        <div className="relative">
          {/* Subtle horizontal connecting line on desktop */}
          <div className="hidden lg:block absolute top-7 left-12 right-12 h-px bg-white/15 z-0" aria-hidden="true" />

          <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${
              renderedSteps.length === 5
                ? "lg:grid-cols-5"
                : renderedSteps.length === 4
                ? "lg:grid-cols-4"
                : renderedSteps.length === 3
                ? "lg:grid-cols-3"
                : "lg:grid-cols-4"
            } gap-6 sm:gap-6 relative z-10`}
          >
            {renderedSteps.map((step, index) => (
              <motion.div
                key={step.stepNumber + step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className="bg-[#0c0c0c] border border-white/10 hover:border-white/30 p-6 flex flex-col justify-between group transition-all duration-300 rounded-none relative"
              >
                {/* Step Marker Badge */}
                <div>
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.06]">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-red">
                      {step.stepNumber} //
                    </span>
                    <div className="w-10 h-10 bg-[#141414] border border-white/15 group-hover:border-brand-red text-neutral-300 group-hover:text-white flex items-center justify-center transition-colors">
                      <StepIcon type={step.icon} />
                    </div>
                  </div>

                  {/* Step Title */}
                  <h3 className="font-display text-lg font-bold uppercase tracking-tight text-white mb-2.5">
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Bottom Step Indicator Bar */}
                <div className="mt-6 pt-3 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono text-neutral-500">
                  <span className="uppercase tracking-wider">PHASE {step.stepNumber}</span>
                  <span className="text-neutral-400 group-hover:text-brand-red transition-colors">● ACTIVE</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
