"use client";

import { MessageSquare, ClipboardList, Clapperboard, Eye, Send } from "lucide-react";
import { resolveProcessIconKey } from "@/lib/processIcons";

// Maps the existing process icon keys (lib/processIcons) to outline icons that
// match the pricing reference pictograms.
const STEP_ICONS = {
  discover: MessageSquare,
  plan: ClipboardList,
  create: Clapperboard,
  review: Eye,
  deliver: Send,
};

function resolveStepIcon(step, index) {
  const title = String(step.title || "").toLowerCase();
  // "Discuss" is the pricing wording for the discovery step
  const key = title.includes("discuss")
    ? "discover"
    : resolveProcessIconKey(step.icon, step.title, step.stepNumber || index + 1);
  return STEP_ICONS[key] || MessageSquare;
}

const PricingProcess = ({ steps = [] }) => {
  const visibleSteps = (Array.isArray(steps) ? steps : []).filter(
    (s) => s && s.isActive !== false
  );
  if (visibleSteps.length === 0) return null;

  return (
    <section
      aria-labelledby="pricing-process-heading"
      className="bg-[#080808] text-white px-4 sm:px-6 pb-12 sm:pb-16"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="flex items-center gap-2.5 mb-8 sm:mb-10">
          <span
            className="w-2 h-2 rounded-full bg-brand-red shrink-0"
            aria-hidden="true"
          />
          <h2
            id="pricing-process-heading"
            className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.22em] text-neutral-300"
          >
            Our Process
          </h2>
        </div>

        {/* 5-Step Process Timeline */}
        <ol className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4 list-none p-0 m-0">
          {visibleSteps.map((step, index) => {
            const Icon = resolveStepIcon(step, index);
            const isLast = index === visibleSteps.length - 1;

            return (
              <li
                key={step.id || index}
                tabIndex={0}
                className="group relative flex md:flex-col items-start md:items-center gap-4 md:gap-0 md:text-center min-w-0 cursor-default outline-none select-none rounded-xl p-2 -m-2 md:p-3 md:-m-3 focus-visible:ring-1 focus-visible:ring-brand-red/50 transition-colors duration-250"
              >
                {/* Desktop connector: dotted line to the next step with a red midpoint dot */}
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="hidden md:block absolute top-8 left-[calc(50%+40px)] right-[calc(-50%+40px)] border-t border-dashed border-white/20 group-hover:border-brand-red/40 group-focus-visible:border-brand-red/40 transition-colors duration-300 pointer-events-none"
                  >
                    <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-brand-red transition-all duration-300 motion-safe:group-hover:scale-125 motion-safe:group-focus-visible:scale-125 group-hover:shadow-[0_0_8px_rgba(239,68,68,0.8)] group-focus-visible:shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  </span>
                )}

                {/* Mobile connector: vertical line */}
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="md:hidden absolute left-8 top-16 -bottom-8 border-l border-dashed border-white/20 group-hover:border-brand-red/40 group-focus-visible:border-brand-red/40 transition-colors duration-300 pointer-events-none"
                  />
                )}

                {/* Circular Icon with Premium Hover Glow and Scaling */}
                <span className="relative z-10 w-16 h-16 rounded-full bg-[#0d0d0d] border border-white/25 flex items-center justify-center shrink-0 md:mb-5 transition-all duration-300 ease-out motion-safe:group-hover:scale-[1.08] motion-safe:group-focus-visible:scale-[1.08] group-hover:bg-[#180a0a] group-focus-visible:bg-[#180a0a] group-hover:border-brand-red group-focus-visible:border-brand-red group-hover:shadow-[0_0_24px_rgba(239,68,68,0.35)] group-focus-visible:shadow-[0_0_24px_rgba(239,68,68,0.35)]">
                  <Icon
                    className="w-6 h-6 text-white transition-all duration-300 ease-out group-hover:text-brand-red group-focus-visible:text-brand-red motion-safe:group-hover:scale-105 motion-safe:group-focus-visible:scale-105"
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                </span>

                {/* Title & Description */}
                <div className="min-w-0 pt-2 md:pt-0">
                  <h3 className="font-display text-sm font-bold uppercase tracking-[0.04em] text-white group-hover:text-red-400 group-focus-visible:text-red-400 transition-colors duration-250 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[13px] text-neutral-400 group-hover:text-neutral-300 transition-colors duration-250 leading-relaxed md:max-w-[190px] md:mx-auto">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

export default PricingProcess;
