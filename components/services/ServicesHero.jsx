"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ServicesHero({ content }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const eyebrow =
    content?.heroEyebrow || "OUR SERVICES // FULL-SERVICE CREATIVE STUDIO";
  const headlineLine1 = content?.heroHeadlineLine1 || "CREATIVE SOLUTIONS";
  const headlineLine2 = content?.heroHeadlineLine2 || "THAT DRIVE";
  const headlineHighlight = content?.heroHeadlineHighlight || "RESULTS.";
  const description =
    content?.heroDescription ||
    "From concept to final cut, we provide end-to-end creative services that help brands connect, engage, and grow. Every edit, thumbnail, and motion visual is crafted for maximum retention and measurable conversion.";
  const primaryCtaText = content?.heroPrimaryCtaText || "DISCUSS YOUR PROJECT";
  const primaryCtaLink = content?.heroPrimaryCtaLink || "/contact";
  const secondaryCtaText = content?.heroSecondaryCtaText || "VIEW WORK ARCHIVE";
  const secondaryCtaLink = content?.heroSecondaryCtaLink || "/portfolio";

  const bannerImageUrl = content?.heroBannerImageUrl;
  const bannerAlt = content?.heroHeadlineLine1
    ? `${content.heroHeadlineLine1} — DesignTouch+ Creative Studio Services`
    : "DesignTouch+ Creative Studio Services Hero Banner";

  const stat1Value = content?.heroStat1Value || "4K+";
  const stat1Label = content?.heroStat1Label || "Master Exports";
  const stat2Value = content?.heroStat2Value || "48H";
  const stat2Label = content?.heroStat2Label || "Avg First Draft";
  const stat3Value = content?.heroStat3Value || "100%";
  const stat3Label = content?.heroStat3Label || "Retention Focus";

  const showStats = content?.heroShowStats !== false;
  const showWorkstation = content?.heroShowWorkstation !== false;

  return (
    <section className="bg-[#080808] text-white px-4 sm:px-6 pt-14 sm:pt-20 pb-16 sm:pb-20 border-b border-white/[0.08] relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div
          className={`grid grid-cols-1 ${
            showWorkstation ? "lg:grid-cols-12" : "max-w-3xl"
          } gap-10 lg:gap-12 xl:gap-16 items-center`}
        >
          {/* Left Column: Editorial Headline & Copy */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`${showWorkstation ? "lg:col-span-7" : "w-full"} flex flex-col justify-center`}
          >
            {/* Eyebrow Label */}
            <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
              <span className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0" aria-hidden="true" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.24em] text-neutral-400">
                {eyebrow}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.98] tracking-tight text-white mb-6">
              {headlineLine1} <br className="hidden sm:inline" />
              {headlineLine2}{" "}
              <span className="text-brand-red">{headlineHighlight}</span>
            </h1>

            {/* Supporting Description */}
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-xl font-normal mb-8">
              {description}
            </p>

            {/* Action Row */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={primaryCtaLink}
                className="inline-flex items-center justify-center gap-2.5 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-[0.16em] px-8 py-4 rounded-none border border-brand-red transition-colors no-underline cursor-pointer select-none group"
              >
                <span>{primaryCtaText}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  <path d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5" />
                </svg>
              </Link>

              <Link
                href={secondaryCtaLink}
                className="inline-flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white text-xs font-mono font-bold uppercase tracking-[0.16em] px-6 py-4 rounded-none border border-white/10 hover:border-white/25 transition-colors no-underline cursor-pointer select-none"
              >
                <span>{secondaryCtaText}</span>
              </Link>
            </div>

            {/* Quick Capability Indicators */}
            {showStats && (
              <div className="grid grid-cols-3 gap-4 pt-8 mt-8 border-t border-white/[0.08] max-w-lg">
                <div>
                  <span className="block font-display text-xl sm:text-2xl font-black text-white">{stat1Value}</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">{stat1Label}</span>
                </div>
                <div>
                  <span className="block font-display text-xl sm:text-2xl font-black text-brand-red">{stat2Value}</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">{stat2Label}</span>
                </div>
                <div>
                  <span className="block font-display text-xl sm:text-2xl font-black text-brand-green">{stat3Value}</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">{stat3Label}</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Column: Studio Banner Monitor Visual */}
          {showWorkstation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="lg:col-span-5"
            >
              <div className="relative bg-[#0c0c0c] border border-white/15 p-2.5 sm:p-3 rounded-none shadow-2xl group">
                {/* Top Studio Monitor Toolbar */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/[0.08] px-1 text-[10px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse inline-block" />
                    <span className="text-white font-bold uppercase tracking-wider">STUDIO BANNER // DISPLAY 01</span>
                  </div>
                  <div className="flex items-center gap-3 text-neutral-400">
                    <span className="text-brand-green">ACTIVE</span>
                    <span className="text-white">HD / 4K</span>
                  </div>
                </div>

                {/* Banner Monitor Frame (16:9 Aspect Ratio) */}
                <div className="relative aspect-[16/9] w-full bg-[#141414] overflow-hidden border border-white/10 flex items-center justify-center">
                  {bannerImageUrl && !imageError ? (
                    <img
                      key={bannerImageUrl}
                      src={bannerImageUrl}
                      alt={bannerAlt}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageError(true)}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        imageLoaded ? "opacity-100" : "opacity-90"
                      }`}
                      loading="eager"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#121212] via-[#161616] to-[#0c0c0c]">
                      <div className="w-12 h-12 rounded-none border border-white/15 bg-white/[0.04] flex items-center justify-center mb-3 text-neutral-400">
                        <svg
                          className="w-6 h-6 text-neutral-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                          />
                        </svg>
                      </div>
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-300">
                        DESIGNTOUCH+ STUDIO BANNER
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500 mt-1 max-w-[220px]">
                        Full-service creative production &amp; visual performance
                      </span>
                    </div>
                  )}

                  {/* Overlaid Studio HUD Tag */}
                  <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 bg-black/85 border border-white/15 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.16em] text-neutral-300">
                      <span className="w-1.5 h-1.5 bg-brand-green rounded-none" aria-hidden="true" />
                      STUDIO MONITOR
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
                    <span className="inline-flex items-center bg-black/85 border border-white/15 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-neutral-300">
                      FRAME 01
                    </span>
                  </div>
                </div>

                {/* Editorial Monitor Info Bar */}
                <div className="mt-2.5 bg-[#121212] border border-white/[0.08] px-3 py-2 flex items-center justify-between text-[9px] font-mono text-neutral-400">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand-red rounded-none" aria-hidden="true" />
                    <span>STUDIO ASSET // HERO BANNER</span>
                  </div>
                  <span className="text-neutral-500 uppercase tracking-wider">
                    {bannerImageUrl && !imageError ? "ACTIVE FEED" : "STANDBY / FALLBACK"}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
