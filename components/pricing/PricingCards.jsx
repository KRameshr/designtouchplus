"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Check, Send, Star, Gem, Crown, ArrowRight, Sparkles } from "lucide-react";

// Per-plan accent styling matching DesignTouch+ brand identity
const PLAN_ACCENTS = {
  BASIC: {
    icon: Send,
    text: "text-brand-green",
    iconBox: "bg-brand-green/10 border-brand-green/25 text-brand-green",
  },
  STANDARD: {
    icon: Star,
    text: "text-brand-red",
    iconBox: "bg-brand-red/15 border-brand-red/35 text-brand-red",
  },
  PREMIUM: {
    icon: Gem,
    text: "text-purple-400",
    iconBox: "bg-purple-500/10 border-purple-500/25 text-purple-400",
  },
  ENTERPRISE: {
    icon: Crown,
    text: "text-orange-400",
    iconBox: "bg-orange-500/10 border-orange-500/25 text-orange-400",
  },
};

const SERVICE_CATEGORIES = [
  { id: "VIDEO_EDITING", label: "Video Editing", shortLabel: "Video" },
  { id: "THUMBNAIL_DESIGN", label: "Thumbnail Design", shortLabel: "Thumbnails" },
  { id: "CONTENT_CREATOR", label: "Content Creator", shortLabel: "Creator" },
];

const BILLING_OPTIONS = [
  { value: "ONE_TIME", label: "One-Time Project" },
  { value: "MONTHLY", label: "Monthly Packages" },
];

function getAccent(planName, customAccent) {
  if (customAccent) {
    const key = String(customAccent).toUpperCase();
    if (key === "PURPLE" || key === "VIOLET") return PLAN_ACCENTS.PREMIUM;
    if (key === "GREEN") return PLAN_ACCENTS.BASIC;
    if (key === "RED") return PLAN_ACCENTS.STANDARD;
    if (key === "ORANGE") return PLAN_ACCENTS.ENTERPRISE;
  }
  return PLAN_ACCENTS[String(planName || "").toUpperCase()] || PLAN_ACCENTS.BASIC;
}

function formatPriceNumber(plan) {
  if (plan.price == null) return null;
  return Number(plan.price).toLocaleString("en-IN");
}

/**
 * Multi-Service PricingCards:
 * - Supports 3 distinct service categories:
 *   1. Video Editing (VIDEO_EDITING)
 *   2. Thumbnail Design (THUMBNAIL_DESIGN)
 *   3. Content Creator Packages (CONTENT_CREATOR)
 * - Service Category Selector + Billing Toggle work seamlessly together.
 * - 0-latency client-side switching with pre-filtered server-provided plans.
 * - Responsive grid: 4 columns on desktop (>=1280px), 2 columns on laptop (1024px) & tablet (768px),
 *   and 1 column on mobile (360px-390px).
 * - Full CMS compatibility with dynamic plan data, custom badges, and service/plan context in CTAs.
 */
const PricingCards = ({ oneTimePlans = [], monthlyPlans = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState("VIDEO_EDITING");
  const [activeType, setActiveType] = useState("ONE_TIME");

  // Get active plans pool for current billing type
  const activePool = activeType === "ONE_TIME" ? oneTimePlans : monthlyPlans;

  // Filter plans for the selected service category
  const categoryPlans = useMemo(() => {
    return activePool.filter((plan) => {
      const planCategory = plan.serviceCategory || "VIDEO_EDITING";
      return planCategory === selectedCategory;
    });
  }, [activePool, selectedCategory]);

  const activeCategoryMeta = SERVICE_CATEGORIES.find((c) => c.id === selectedCategory) || SERVICE_CATEGORIES[0];

  return (
    <section id="plans" className="bg-[#080808] text-white px-4 sm:px-6 pt-10 sm:pt-14 pb-14 sm:pb-18">
      <div className="max-w-7xl mx-auto">
        {/* Controls Container: Service Category Selector + Billing Toggle */}
        <div className="flex flex-col items-center gap-4 mb-10 sm:mb-12">
          {/* 1. Service Category Selector Tabs */}
          <div
            role="tablist"
            aria-label="Service Category"
            className="grid grid-cols-3 gap-1.5 p-1 bg-[#0c0c0c] border border-white/[0.1] rounded-[4px] w-full max-w-xl mx-auto sm:inline-flex sm:w-auto shadow-inner"
          >
            {SERVICE_CATEGORIES.map(({ id, label, shortLabel }) => {
              const isSelected = selectedCategory === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedCategory(id)}
                  className={`text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.08em] sm:tracking-[0.12em] px-2.5 sm:px-6 py-2.5 rounded-[2px] border transition-all duration-150 cursor-pointer text-center truncate ${
                    isSelected
                      ? "border-brand-red bg-brand-red text-white shadow-[0_2px_12px_rgba(239,68,68,0.3)]"
                      : "border-transparent bg-transparent text-neutral-400 hover:text-white"
                  }`}
                >
                  <span className="sm:hidden">{shortLabel}</span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </div>

          {/* 2. Billing Toggle: One-Time vs Monthly */}
          <div
            role="group"
            aria-label="Billing frequency"
            className="inline-flex max-w-full bg-[#0c0c0c] border border-white/[0.1] rounded-[3px] p-1 shadow-inner"
          >
            {BILLING_OPTIONS.map(({ value, label }) => {
              const isActive = activeType === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveType(value)}
                  className={`text-[10.5px] sm:text-xs font-mono font-bold uppercase tracking-[0.1em] sm:tracking-[0.12em] px-3.5 sm:px-6 py-2 rounded-[2px] border transition-colors duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 ${
                    isActive
                      ? "border-white/20 bg-white/15 text-white"
                      : "border-transparent bg-transparent text-neutral-400 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Plans Display */}
        {categoryPlans.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-white/10 rounded-[8px] max-w-xl mx-auto p-8 bg-[#0a0a0a]">
            <p className="text-xs font-mono text-neutral-300 mb-2">
              No {activeType === "ONE_TIME" ? "one-time" : "monthly"} plans available for{" "}
              <span className="text-white font-bold">{activeCategoryMeta.label}</span> yet.
            </p>
            <p className="text-[11px] font-mono text-neutral-500 mb-5">
              Custom packages, trial assets, and bulk retainers are available via our contact desk.
            </p>
            <Link
              href={`/contact?service=${encodeURIComponent(selectedCategory)}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-red text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#dc2626] transition-colors"
            >
              <span>Request Custom Quote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 xl:gap-5 2xl:gap-6 items-stretch pt-2">
            {categoryPlans.map((plan, index) => {
              const accent = getAccent(plan.planName, plan.accentColor);
              const Icon = accent.icon;
              const isPopular = Boolean(plan.isMostPopular);
              const priceNumber = formatPriceNumber(plan);
              const currency = plan.currency || "₹";
              const serviceParam = plan.serviceCategory || selectedCategory || "VIDEO_EDITING";
              const ctaHref =
                plan.ctaLink && String(plan.ctaLink).trim()
                  ? String(plan.ctaLink).trim()
                  : `/contact?service=${encodeURIComponent(serviceParam)}&plan=${encodeURIComponent(
                      `${plan.planName} (${activeType === "ONE_TIME" ? "One-Time" : "Monthly"})`
                    )}`;

              return (
                <article
                  key={plan.id || `${activeType}-${selectedCategory}-${plan.planName}`}
                  className={`relative flex flex-col rounded-[8px] overflow-hidden transition-colors duration-200 h-full ${
                    isPopular
                      ? "bg-[#0d0909] border border-brand-red/70 hover:border-brand-red shadow-[0_4px_24px_rgba(239,68,68,0.12)]"
                      : "bg-[#0b0b0b] border border-white/[0.08] hover:border-white/[0.18]"
                  }`}
                >
                  {/* Top Block: Plan Identity, Price & Description */}
                  <div
                    className={`p-6 sm:p-7 border-b flex flex-col justify-between shrink-0 ${
                      isPopular
                        ? "bg-[#120a0a] border-brand-red/20"
                        : "bg-[#0e0e0e] border-white/[0.07]"
                    }`}
                  >
                    {/* Header Row: Icon + Plan Name + Status Tag */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-7 h-7 rounded-[4px] border flex items-center justify-center shrink-0 ${accent.iconBox}`}
                        >
                          <Icon className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                        </span>
                        <h3 className="font-display text-base sm:text-lg font-bold uppercase tracking-[0.06em] text-white">
                          {plan.planName}
                        </h3>
                      </div>

                      {isPopular ? (
                        <span className="inline-flex items-center gap-1.5 text-[9.5px] font-mono font-semibold uppercase tracking-[0.16em] px-2 py-0.5 rounded-[2px] bg-brand-red/15 border border-brand-red/35 text-brand-red">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0" />
                          <span>{plan.badgeText || "Most Popular"}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-neutral-500 font-medium">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      )}
                    </div>

                    {/* Price Display */}
                    <div className="mt-1 mb-2">
                      {priceNumber ? (
                        <div className="flex items-baseline gap-1">
                          <span className="font-sans text-xl sm:text-2xl font-bold text-neutral-400">
                            {currency}
                          </span>
                          <span className="font-sans text-3xl sm:text-[34px] xl:text-[36px] font-bold text-white tracking-tight leading-none">
                            {priceNumber}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-baseline">
                          <span className="font-sans text-2xl sm:text-[28px] xl:text-[30px] font-bold text-white tracking-tight leading-none font-display uppercase">
                            Custom
                          </span>
                        </div>
                      )}

                      {/* Billing Frequency / Unit */}
                      <p className="text-[11px] font-mono text-neutral-400 font-medium uppercase tracking-wider mt-2">
                        {plan.unit
                          ? plan.unit
                          : activeType === "ONE_TIME"
                          ? "Per Project"
                          : "Per Month"}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-neutral-400 text-xs sm:text-[13px] leading-relaxed mt-2.5 min-h-[38px] font-normal">
                      {plan.description}
                    </p>
                  </div>

                  {/* Lower Block: Features Checklist + Baseline-Aligned CTA */}
                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between bg-transparent">
                    {/* Features List */}
                    {Array.isArray(plan.features) && plan.features.length > 0 ? (
                      <div className="mb-7 grow">
                        <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-neutral-400 mb-3.5">
                          Included Features
                        </p>
                        <ul className="flex flex-col gap-3 list-none p-0 m-0">
                          {plan.features.map((feature, fIndex) => (
                            <li
                              key={`${feature}-${fIndex}`}
                              className="flex items-start gap-2.5 text-xs sm:text-[13px] text-neutral-300 leading-snug"
                            >
                              <Check
                                className={`w-3.5 h-3.5 shrink-0 mt-[2px] ${accent.text}`}
                                strokeWidth={2.4}
                                aria-hidden="true"
                              />
                              <span className="min-w-0 break-words">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="grow" />
                    )}

                    {/* CTA Button (Baseline-Aligned with service & plan query context) */}
                    <div className="mt-auto pt-2">
                      <Link
                        href={ctaHref}
                        className={`w-full flex items-center justify-center gap-2 text-center text-xs font-bold font-display uppercase tracking-[0.14em] py-3.5 px-5 rounded-[2px] no-underline transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 ${
                          isPopular
                            ? "bg-brand-red text-white border border-brand-red hover:bg-[#dc2626] focus-visible:ring-brand-red/60 shadow-[0_2px_12px_rgba(239,68,68,0.2)]"
                            : "border border-white/20 text-white hover:border-white hover:bg-white hover:text-black focus-visible:ring-white/40"
                        }`}
                      >
                        <span>
                          {plan.ctaText || (priceNumber ? "Choose Plan" : "Contact Us")}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingCards;
