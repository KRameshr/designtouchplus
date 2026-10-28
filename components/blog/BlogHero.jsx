"use client";

import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { getBlogPageContent } from "@/lib/api";

const DEFAULT_CONTENT = {
  heroEyebrow: "OUR BLOG",
  heroHeadlineLine1: "INSIGHTS THAT",
  heroHeadlineLine2: "INSPIRE",
  heroHeadlineHighlight: "CREATIVITY.",
  heroDescription:
    "Tips, trends and tutorials on video editing, motion graphics, content creation and growing your brand.",
  heroCtaText: "EXPLORE ALL ARTICLES",
  heroCtaLink: "#articles",
  heroBannerImageUrl:
    "https://res.cloudinary.com/dggikfrj5/image/upload/v1793013354/designtouch/blog/xt6cdppkr00r5hopivfy.jpg",
  heroBannerImageAlt: "DesignTouch+ Creative Workspace Studio",
  heroBannerObjectPosition: "center right",
};

export default function BlogHero({ content: initialContent = null }) {
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
    getBlogPageContent()
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
  const line1 = content?.heroHeadlineLine1 || DEFAULT_CONTENT.heroHeadlineLine1;
  const line2 = content?.heroHeadlineLine2 || DEFAULT_CONTENT.heroHeadlineLine2;
  const highlight =
    content?.heroHeadlineHighlight !== undefined
      ? content.heroHeadlineHighlight
      : DEFAULT_CONTENT.heroHeadlineHighlight;
  const description = content?.heroDescription || DEFAULT_CONTENT.heroDescription;
  const ctaText = content?.heroCtaText || DEFAULT_CONTENT.heroCtaText;
  const ctaLink = content?.heroCtaLink || DEFAULT_CONTENT.heroCtaLink;
  const bannerUrl = content?.heroBannerImageUrl || DEFAULT_CONTENT.heroBannerImageUrl;
  const bannerAlt = content?.heroBannerImageAlt || DEFAULT_CONTENT.heroBannerImageAlt;
  const objectPosition = content?.heroBannerObjectPosition || DEFAULT_CONTENT.heroBannerObjectPosition;

  return (
    <section
      aria-label="Blog Hero"
      className="relative w-full overflow-hidden bg-[#080808] h-[420px] sm:h-[480px] md:h-[520px] lg:h-[560px] xl:h-[600px] flex items-center"
    >
      {/* Background Image Container spanning full viewport width edge-to-edge */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bannerUrl}
            alt={bannerAlt}
            className="w-full h-full object-cover select-none pointer-events-none"
            style={{ objectPosition: objectPosition || "center right" }}
            fetchPriority="high"
            loading="eager"
          />
        ) : (
          <div className="w-full h-full bg-[#0d0d0d]" />
        )}

        {/* Subtle, smooth photographic dark scrim overlay:
            Desktop/tablet horizontal scrim keeps text contrast sharp on the left while leaving the studio workspace clearly visible */}
        <div
          className="absolute inset-0 pointer-events-none hidden sm:block"
          style={{
            background:
              "linear-gradient(90deg, rgba(8,8,8,0.85) 0%, rgba(8,8,8,0.70) 38%, rgba(8,8,8,0.30) 70%, rgba(8,8,8,0.12) 100%)",
          }}
        />

        {/* Mobile vertical scrim for stacked layout */}
        <div
          className="absolute inset-0 pointer-events-none sm:hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,8,8,0.88) 0%, rgba(8,8,8,0.72) 60%, rgba(8,8,8,0.45) 100%)",
          }}
        />
      </div>

      {/* Main Content (Left Aligned, Vertically Centered with exact 3-line heading layout) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl lg:max-w-2xl xl:max-w-[700px]">
          {/* Eyebrow - Subtle fade-in animation */}
          <motion.div
            className="flex items-center gap-2 mb-3 sm:mb-4"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="w-2 h-2 rounded-full bg-brand-red shrink-0" aria-hidden="true" />
            <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.22em] text-neutral-300">
              {eyebrow}
            </span>
          </motion.div>

          {/* Headline - Exact 3-line layout on desktop with staggered fade + upward motion */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[54px] xl:text-[62px] font-display font-extrabold uppercase tracking-tight leading-[1.04] text-white mb-4 sm:mb-6">
            {/* Line 1: White text */}
            <motion.span
              className="block"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
            >
              {line1}
            </motion.span>

            {/* Line 2: White text */}
            <motion.span
              className="block mt-1 sm:mt-1.5"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
            >
              {line2}
            </motion.span>

            {/* Line 3: Separate block-level element in red accent with staggered delay */}
            {highlight ? (
              <motion.span
                className="block mt-1 sm:mt-1.5 text-brand-red"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.32 }}
              >
                {highlight}
              </motion.span>
            ) : null}
          </h1>

          {/* Description - Fade in slightly afterward */}
          <motion.p
            className="text-neutral-300 text-xs sm:text-sm lg:text-base leading-relaxed max-w-lg mb-7 sm:mb-8 font-sans font-normal"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.44 }}
          >
            {description}
          </motion.p>

          {/* Action: Primary CTA with subtle lift and glow on hover */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.54 }}
          >
            <a
              href={ctaLink}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-[0.16em] rounded-none transition-all duration-200 no-underline group cursor-pointer active:scale-95"
            >
              <span>{ctaText}</span>
              <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform duration-200" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
