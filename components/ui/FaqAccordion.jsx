"use client";

import { useState } from "react";
import {
  ChevronDown,
  HelpCircle,
  RotateCcw,
  Zap,
  Layers,
  Calendar,
  ShieldCheck,
  Clock,
  CreditCard,
  CheckCircle2,
  FileText,
  Lock,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Contextual Lucide icon mapped to question keywords for a premium visual identity
function getFaqIcon(question = "") {
  const q = String(question).toLowerCase();
  if (q.includes("revision") || q.includes("change") || q.includes("feedback")) return RotateCcw;
  if (q.includes("urgent") || q.includes("fast") || q.includes("speed") || q.includes("rush")) return Zap;
  if (q.includes("software") || q.includes("tool") || q.includes("program") || q.includes("app")) return Layers;
  if (q.includes("start") || q.includes("kickoff") || q.includes("begin") || q.includes("soon")) return Clock;
  if (q.includes("nda") || q.includes("confidential") || q.includes("privacy") || q.includes("security")) return Lock;
  if (q.includes("asset") || q.includes("file") || q.includes("footage") || q.includes("brief")) return FileText;
  if (q.includes("long-term") || q.includes("ongoing") || q.includes("retainer") || q.includes("contract")) return Calendar;
  if (q.includes("guarantee") || q.includes("safe") || q.includes("trust") || q.includes("refund")) return ShieldCheck;
  if (q.includes("payment") || q.includes("billing") || q.includes("invoice") || q.includes("price") || q.includes("cost")) return CreditCard;
  if (q.includes("include") || q.includes("deliverable") || q.includes("package") || q.includes("milestone")) return CheckCircle2;
  if (q.includes("custom") || q.includes("special") || q.includes("creative")) return Sparkles;
  return HelpCircle;
}

const FaqAccordion = ({
  faqs = [],
  heading = "Frequently Asked Questions",
  subheading = "Everything you need to know about working with DesignTouch+, onboarding timelines, deliverables, and communication.",
}) => {
  const [openId, setOpenId] = useState(null);

  if (!faqs || faqs.length === 0) return null;

  const toggle = (id) => setOpenId((current) => (current === id ? null : id));

  return (
    <section
      className="bg-[#080808] text-white px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 border-t border-white/[0.08]"
      aria-label="Frequently Asked Questions"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 mb-3">
            <span
              className="w-2 h-2 rounded-full bg-brand-red shrink-0"
              aria-hidden="true"
            />
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.22em] text-neutral-400">
              Clear &bull; Transparent &bull; Collaborative
            </span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-white mb-3.5">
            {heading === "Frequently Asked Questions" ? (
              <>
                Frequently Asked{" "}
                <span className="text-brand-red">Questions</span>
              </>
            ) : (
              heading
            )}
          </h2>

          {subheading && (
            <p className="text-neutral-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed font-sans">
              {subheading}
            </p>
          )}
        </div>

        {/* Accordion List with Thin Dividers and Generous Vertical Spacing */}
        <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {faqs.map((faq, index) => {
            const id = faq.id || `faq-${index}`;
            const isOpen = openId === id;
            const buttonId = `faq-btn-${id}`;
            const panelId = `faq-panel-${id}`;
            const Icon = getFaqIcon(faq.question);

            return (
              <div
                key={id}
                className={`group transition-colors duration-150 ${
                  isOpen ? "bg-white/[0.015]" : "hover:bg-white/[0.01]"
                }`}
              >
                <h3 className="m-0 p-0 font-normal">
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(id)}
                    className="w-full flex items-center justify-between gap-4 py-5 sm:py-6 text-left cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-brand-red/60 focus-visible:rounded"
                  >
                    <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 pr-2">
                      {/* Left circular icon */}
                      <span
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                          isOpen
                            ? "bg-brand-red/15 text-brand-red border border-brand-red/40 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                            : "bg-white/[0.04] text-neutral-400 border border-white/[0.08] group-hover:text-brand-red group-hover:border-brand-red/30 group-hover:bg-brand-red/10"
                        }`}
                      >
                        <Icon
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                          strokeWidth={1.9}
                          aria-hidden="true"
                        />
                      </span>

                      {/* Question as bold, clear heading */}
                      <span
                        className={`font-display text-sm sm:text-base font-bold leading-snug tracking-tight transition-colors duration-200 ${
                          isOpen
                            ? "text-brand-red"
                            : "text-white group-hover:text-neutral-200"
                        }`}
                      >
                        {faq.question}
                      </span>
                    </div>

                    {/* Chevron indicator on the right */}
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200 ${
                        isOpen
                          ? "text-brand-red"
                          : "text-neutral-500 group-hover:text-neutral-300"
                      }`}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ease-out ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </span>
                  </button>
                </h3>

                {/* Expandable answer panel */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.24, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-sans pl-10.5 sm:pl-12 pr-4 pb-6 sm:pb-7">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqAccordion;
