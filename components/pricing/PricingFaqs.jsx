"use client";

import { useId, useState } from "react";
import {
  ChevronDown,
  RotateCcw,
  Zap,
  Layers,
  Calendar,
  Mic,
  ShieldCheck,
  TrendingUp,
  Clock,
  CreditCard,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

function getFaqIcon(question = "") {
  const q = String(question).toLowerCase();
  if (q.includes("revision") || q.includes("change") || q.includes("feedback")) return RotateCcw;
  if (q.includes("urgent") || q.includes("rush") || q.includes("fast") || q.includes("speed")) return Zap;
  if (q.includes("software") || q.includes("tool") || q.includes("program") || q.includes("app")) return Layers;
  if (q.includes("long-term") || q.includes("ongoing") || q.includes("retainer") || q.includes("contract")) return Calendar;
  if (q.includes("voice") || q.includes("audio") || q.includes("sound") || q.includes("music")) return Mic;
  if (q.includes("refund") || q.includes("guarantee") || q.includes("money") || q.includes("cancel")) return ShieldCheck;
  if (q.includes("upgrade") || q.includes("switch") || q.includes("scale") || q.includes("tier") || q.includes("plan")) return TrendingUp;
  if (q.includes("turnaround") || q.includes("how long") || q.includes("time") || q.includes("delivery") || q.includes("deliver")) return Clock;
  if (q.includes("payment") || q.includes("billing") || q.includes("invoice") || q.includes("price") || q.includes("cost")) return CreditCard;
  if (q.includes("include") || q.includes("feature") || q.includes("what is") || q.includes("package")) return CheckCircle2;
  return HelpCircle;
}

function FaqItem({ faq, isOpen, onToggle, baseId, shouldReduceMotion }) {
  const buttonId = `${baseId}-btn`;
  const panelId = `${baseId}-panel`;
  const Icon = getFaqIcon(faq.question);

  return (
    <div
      className={`group relative border-b border-white/[0.08] last:border-b-0 px-2 sm:px-3 -mx-2 sm:-mx-3 rounded-[6px] transition-all duration-200 ease-out ${
        shouldReduceMotion ? "" : "motion-safe:hover:-translate-y-[2px] motion-safe:focus-within:-translate-y-[2px]"
      } hover:bg-brand-red/[0.03] hover:border-brand-red/25 ${
        isOpen ? "bg-brand-red/[0.015]" : ""
      }`}
    >
      <h3 className="m-0 p-0 font-normal">
        <button
          id={buttonId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="w-full flex items-center justify-between gap-4 py-5 sm:py-6 text-left cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-brand-red/60 focus-visible:rounded"
        >
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 pr-2">
            {/* Left icon in restrained circular badge */}
            <span
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ease-out ${
                isOpen
                  ? "bg-brand-red/15 text-brand-red border border-brand-red/40 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                  : "bg-white/[0.04] text-neutral-400 border border-white/[0.08] group-hover:text-brand-red group-hover:border-brand-red/30 group-hover:bg-brand-red/10"
              }`}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.9} aria-hidden="true" />
            </span>

            {/* Bold, readable question with DesignTouch+ typography & subtle hover scale */}
            <span
              className={`font-display text-sm sm:text-[15px] font-bold leading-snug tracking-[0.01em] transition-all duration-200 ease-out inline-block origin-left ${
                shouldReduceMotion ? "" : "motion-safe:group-hover:scale-[1.015]"
              } ${
                isOpen
                  ? "text-brand-red"
                  : "text-white group-hover:text-brand-red"
              }`}
            >
              {faq.question}
            </span>
          </div>

          {/* Right chevron */}
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200 ease-out ${
              isOpen
                ? "text-brand-red"
                : "text-neutral-500 group-hover:text-brand-red"
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

      {/* Expanded Answer */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <p className="pl-[42px] sm:pl-[48px] pr-6 sm:pr-10 pb-5 sm:pb-6 text-sm sm:text-[14.5px] text-neutral-400 leading-[1.75] font-normal">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const PricingFaqs = ({ faqs = [] }) => {
  const baseId = useId();
  const shouldReduceMotion = useReducedMotion();
  const [openIds, setOpenIds] = useState(() => new Set());
  const items = Array.isArray(faqs) ? faqs.filter((f) => f && f.question) : [];

  if (items.length === 0) return null;

  const toggle = (key) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <section
      aria-labelledby="pricing-faqs-heading"
      className="bg-[#080808] text-white px-4 sm:px-6 pb-16 sm:pb-20"
    >
      <div className="max-w-4xl mx-auto">
        {/* Centered Heading with subtle accent */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 mb-2.5">
            <span className="w-2 h-2 rounded-full bg-brand-red shrink-0" aria-hidden="true" />
            <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.22em] text-neutral-400">
              Got Questions?
            </span>
          </div>
          <h2
            id="pricing-faqs-heading"
            className="font-display text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-[0.04em] text-white"
          >
            FAQ
          </h2>
          {/* Subtle animated red accent underline */}
          <motion.div
            initial={shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            style={{ originX: 0.5 }}
            className="h-[1.5px] w-12 bg-gradient-to-r from-transparent via-brand-red to-transparent mx-auto mt-3 rounded-full"
            aria-hidden="true"
          />
        </div>

        {/* Editorial Accordion List */}
        <div className="border-t border-b border-white/[0.08]">
          {items.map((faq, index) => {
            const key = faq.id || `faq-${index}`;
            return (
              <FaqItem
                key={key}
                faq={faq}
                isOpen={openIds.has(key)}
                onToggle={() => toggle(key)}
                baseId={`${baseId}-${key}`}
                shouldReduceMotion={shouldReduceMotion}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingFaqs;
