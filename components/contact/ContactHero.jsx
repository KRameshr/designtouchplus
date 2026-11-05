"use client";

import { useEffect, useState } from "react";
import { Zap, CheckCircle2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { getContactPageContent } from "@/lib/api";

const DEFAULT_CONTENT = {
  heroEyebrow: "Contact Us",
  heroHeadlineLine1: "Let's Create",
  heroHeadlineLine2: "Something",
  heroHeadlineHighlight: "Amazing.",
  heroDescription:
    "Have a project in mind? We'd love to hear about it. Fill out the form or reach out to us directly.",
  badge1Title: "Fast Response",
  badge1Subtitle: "We reply within 24 hours",
  badge2Title: "Project Focused",
  badge2Subtitle: "Solutions tailored for you",
  heroBannerImageUrl: null,
  heroBannerImageAlt: "DesignTouch+ Creative Studio",
  heroBannerObjectPosition: "center right",
};

export default function ContactHero({
  content: initialContent = null,
  bannerUrl: propBannerUrl = null,
  bannerImageUrl: propBannerImageUrl = null,
  imageUrl: propImageUrl = null,
}) {
  const prefersReducedMotion = useReducedMotion();
  const [content, setContent] = useState(initialContent || DEFAULT_CONTENT);

  // Sync if initialContent changes from server
  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  // Live client-side refresh to ensure immediate sync on tab focus or after CMS edit
  useEffect(() => {
    let active = true;
    getContactPageContent()
      .then((fresh) => {
        if (active && fresh) {
          setContent(fresh);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const eyebrow = content?.heroEyebrow || DEFAULT_CONTENT.heroEyebrow;
  const rawLine1 = content?.heroHeadlineLine1 || "Let's Create";
  const highlight =
    content?.heroHeadlineHighlight !== undefined &&
    content?.heroHeadlineHighlight !== null
      ? content.heroHeadlineHighlight
      : DEFAULT_CONTENT.heroHeadlineHighlight;
  const description =
    content?.heroDescription || DEFAULT_CONTENT.heroDescription;
  const badge1Title = content?.badge1Title || DEFAULT_CONTENT.badge1Title;
  const badge1Subtitle =
    content?.badge1Subtitle || DEFAULT_CONTENT.badge1Subtitle;
  const badge2Title = content?.badge2Title || DEFAULT_CONTENT.badge2Title;
  const badge2Subtitle =
    content?.badge2Subtitle || DEFAULT_CONTENT.badge2Subtitle;
  const bannerUrl =
    propBannerUrl ||
    propBannerImageUrl ||
    propImageUrl ||
    content?.heroBannerImageUrl ||
    content?.bannerImageUrl ||
    content?.heroBackgroundImageUrl ||
    content?.imageUrl ||
    null;
  const bannerAlt =
    content?.heroBannerImageAlt ||
    content?.bannerAlt ||
    DEFAULT_CONTENT.heroBannerImageAlt;
  const bannerPosition =
    content?.heroBannerObjectPosition ||
    content?.bannerPosition ||
    DEFAULT_CONTENT.heroBannerObjectPosition;

  // Format headline lines cleanly:
  // If rawLine1 already contains "Something" (e.g. "Let's Create Something"), split nicely across 2 lines.
  let line1 = rawLine1;
  let line2 = "";
  if (rawLine1.toLowerCase().includes("something")) {
    const parts = rawLine1.split(/something/i);
    line1 = parts[0]?.trim() || "Let's Create";
    line2 = "Something";
  } else {
    line2 = content?.heroHeadlineLine2 || "Something";
  }

  return (
    <section
      aria-label="Contact Hero"
      className="relative w-full overflow-hidden bg-[#080808] min-h-[480px] sm:min-h-[520px] md:min-h-[560px] lg:min-h-[580px] xl:min-h-[620px] py-14 sm:py-16 lg:py-20 flex items-center border-b border-white/[0.08]"
    >
      {/* Background Image Container spanning full viewport width edge-to-edge */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bannerUrl}
            alt={bannerAlt}
            className="w-full h-full object-cover select-none pointer-events-none"
            style={{ objectPosition: bannerPosition || "center right" }}
            fetchPriority="high"
            loading="eager"
          />
        ) : (
          <div
            className="w-full h-full select-none pointer-events-none"
            style={{
              backgroundImage:
                "var(--contact-workstation-image, radial-gradient(ellipse at 72% 40%, rgba(239,68,68,0.12), transparent 36%), radial-gradient(ellipse at 35% 80%, rgba(34,197,94,0.08), transparent 38%), linear-gradient(135deg, #141414, #080808 72%))",
              backgroundSize: "cover",
              backgroundPosition: bannerPosition || "center right",
            }}
          />
        )}

        {/* Subtle, smooth photographic dark scrim overlay:
            Desktop/tablet horizontal scrim keeps text contrast sharp on the left while leaving the studio workspace clearly visible */}
        <div
          className="absolute inset-0 pointer-events-none hidden sm:block"
          style={{
            background:
              "linear-gradient(90deg, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.80) 40%, rgba(8,8,8,0.45) 72%, rgba(8,8,8,0.20) 100%)",
          }}
        />

        {/* Mobile vertical scrim for stacked layout */}
        <div
          className="absolute inset-0 pointer-events-none sm:hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,8,8,0.94) 0%, rgba(8,8,8,0.84) 60%, rgba(8,8,8,0.60) 100%)",
          }}
        />

        {/* Bottom gradient fade for smooth border-b transition */}
        <div
          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Main Content (Left Aligned, Vertically Centered over the background) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl lg:max-w-2xl xl:max-w-[720px]">
          {/* Eyebrow - Subtle fade-in animation */}
          <motion.div
            className="flex items-center gap-2 mb-3 sm:mb-4"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span
              className="w-2 h-2 rounded-full bg-brand-red shrink-0"
              aria-hidden="true"
            />
            <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.22em] text-neutral-300">
              {eyebrow}
            </span>
          </motion.div>

          {/* Editorial Display Headline matching Blog hero style */}
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-[54px] xl:text-[62px] font-extrabold uppercase leading-[1.04] tracking-tight text-white mb-4 sm:mb-6">
            <motion.span
              className="block"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.08,
              }}
            >
              {line1}
            </motion.span>
            <motion.span
              className="block mt-1 sm:mt-1.5"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.18,
              }}
            >
              {line2 ? `${line2} ` : ""}
              {highlight ? (
                <span className="text-brand-red">
                  {highlight}
                </span>
              ) : null}
            </motion.span>
          </h1>

          {/* Subtitle / Description */}
          <motion.p
            className="text-neutral-300 text-xs sm:text-sm lg:text-base leading-relaxed max-w-lg mb-7 sm:mb-8 font-sans font-normal"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.32 }}
          >
            {description}
          </motion.p>

          {/* Benefit Badges (Minimal Editorial Row) */}
          <motion.div
            className="flex flex-wrap sm:flex-nowrap items-center gap-y-4 gap-x-8 sm:gap-x-10 lg:gap-x-12 pt-1"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.44 }}
          >
            {/* Badge 1: Fast Response */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-brand-red/35 flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                <Zap className="w-3.5 h-3.5 text-brand-red" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white font-mono uppercase tracking-wider leading-tight">
                  {badge1Title}
                </p>
                <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5 leading-normal">
                  {badge1Subtitle}
                </p>
              </div>
            </div>

            {/* Badge 2: Project Focused */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-brand-green/35 flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white font-mono uppercase tracking-wider leading-tight">
                  {badge2Title}
                </p>
                <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5 leading-normal">
                  {badge2Subtitle}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
