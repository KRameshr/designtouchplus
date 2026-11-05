"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const CREDENTIALS = [
  { index: "01", label: "Fast Delivery", desc: "On-time turnaround, every time." },
  { index: "02", label: "Cinema Quality", desc: "Top-tier color, sound & edit." },
  { index: "03", label: "Unlimited Revisions", desc: "Polished to exact perfection." },
  { index: "04", label: "Dedicated Support", desc: "Direct creator communication." },
];

const DEFAULT_HERO = {
  eyebrow: "Welcome to DesignTouch+",
  headlineLine1: "We create",
  headlineLine2: "videos that",
  headlineLine3: "grow",
  headlineHighlight: "brands.",
  subheading:
    "We help businesses and creators tell their stories through powerful video editing & creative content.",
  primaryCtaText: "View Portfolio",
  primaryCtaLink: "/portfolio",
  secondaryCtaText: "Book a Call",
  secondaryCtaLink: "/contact",
  videoUrl: "/hero-demo.mp4",
  badgeText: "REEL // 2026",
  specBadgeText: "4K PRORES",
};

export default function Hero({ hero, ...directProps }) {
  const [isMounted, setIsMounted] = useState(false);
  const videoRef = useRef(null);

  const eyebrow = hero?.eyebrow ?? directProps.eyebrow ?? DEFAULT_HERO.eyebrow;
  const headlineLine1 = hero?.headlineLine1 ?? directProps.headlineLine1 ?? DEFAULT_HERO.headlineLine1;
  const headlineLine2 = hero?.headlineLine2 ?? directProps.headlineLine2 ?? DEFAULT_HERO.headlineLine2;
  const headlineLine3 = hero?.headlineLine3 ?? directProps.headlineLine3 ?? DEFAULT_HERO.headlineLine3;
  const headlineHighlight = hero?.headlineHighlight ?? directProps.headlineHighlight ?? DEFAULT_HERO.headlineHighlight;
  const subheading = hero?.subheading ?? directProps.subheading ?? DEFAULT_HERO.subheading;
  const primaryCtaText = hero?.primaryCtaText ?? directProps.primaryCtaText ?? DEFAULT_HERO.primaryCtaText;
  const primaryCtaLink = hero?.primaryCtaLink ?? directProps.primaryCtaLink ?? DEFAULT_HERO.primaryCtaLink;
  const secondaryCtaText = hero?.secondaryCtaText ?? directProps.secondaryCtaText ?? DEFAULT_HERO.secondaryCtaText;
  const secondaryCtaLink = hero?.secondaryCtaLink ?? directProps.secondaryCtaLink ?? DEFAULT_HERO.secondaryCtaLink;
  const videoUrl = hero?.videoUrl ?? directProps.videoUrl ?? DEFAULT_HERO.videoUrl;
  const badgeText = hero?.badgeText ?? directProps.badgeText ?? DEFAULT_HERO.badgeText;
  const specBadgeText = hero?.specBadgeText ?? directProps.specBadgeText ?? DEFAULT_HERO.specBadgeText;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, [isMounted, videoUrl]);

  return (
    <section id="home-hero" aria-label="Hero" className="bg-[#080808] text-white relative">
      {/* Full-width Cinematic Hero Video Container */}
      {/* Spans edge-to-edge directly beneath navbar with generous 780–850px desktop min-height */}
      <div
        data-testid="home-hero-video-container"
        className="relative w-full overflow-hidden bg-[#0a0a0a] flex items-center min-h-[640px] sm:min-h-[720px] lg:min-h-[800px] xl:min-h-[820px]"
        style={{ minHeight: "clamp(780px, 85vh, 850px)" }}
      >
        {/* Background Video Canvas Layer (z-0) */}
        <div
          data-testid="home-hero-media-canvas"
          className="absolute inset-0 w-full h-full z-0 overflow-hidden"
        >
          {isMounted && videoUrl && (
            <video
              key={videoUrl}
              ref={videoRef}
              src={videoUrl}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="w-full h-full object-cover select-none pointer-events-none"
              style={{ objectPosition: "center 35%" }}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          )}

          {/* Scrim Overlay — Desktop / Tablet: Horizontal gradient darkest behind text on left,
              gradually becoming lighter toward the right to showcase the cinematic video */}
          <div
            data-testid="home-hero-scrim-horizontal"
            className="absolute inset-0 pointer-events-none hidden sm:block"
            style={{
              background:
                "linear-gradient(90deg, rgba(8,8,8,0.94) 0%, rgba(8,8,8,0.82) 38%, rgba(8,8,8,0.45) 72%, rgba(8,8,8,0.18) 100%)",
            }}
            aria-hidden="true"
          />

          {/* Scrim Overlay — Subtle vertical vignette for soft top/bottom transitions */}
          <div
            className="absolute inset-0 pointer-events-none hidden sm:block"
            style={{
              background:
                "linear-gradient(0deg, rgba(8,8,8,0.60) 0%, transparent 40%, rgba(8,8,8,0.45) 100%)",
            }}
            aria-hidden="true"
          />

          {/* Scrim Overlay — Mobile: Vertical gradient for stacked layout */}
          <div
            data-testid="home-hero-scrim-vertical"
            className="absolute inset-0 pointer-events-none sm:hidden"
            style={{
              background:
                "linear-gradient(180deg, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.80) 65%, rgba(8,8,8,0.45) 100%)",
            }}
            aria-hidden="true"
          />
        </div>

        {/* Optional Editorial Header & Spec Badges (Floating on desktop canvas) */}
        {badgeText && (
          <div className="hidden lg:flex absolute top-8 right-8 z-20 items-center gap-2 px-3 py-1.5 bg-[#080808]/75 backdrop-blur-sm border border-white/10 text-[10px] font-mono uppercase tracking-widest text-neutral-300 pointer-events-none select-none">
            <span
              className="w-1.5 h-1.5 bg-brand-red rounded-none animate-pulse"
              aria-hidden="true"
            />
            <span>{badgeText}</span>
          </div>
        )}

        {specBadgeText && (
          <div className="hidden lg:flex absolute bottom-8 right-8 z-20 px-2.5 py-1 bg-[#080808]/75 backdrop-blur-sm border border-white/10 text-[9px] font-mono uppercase tracking-widest text-neutral-400 pointer-events-none select-none">
            <span>{specBadgeText}</span>
          </div>
        )}

        {/* Foreground Content: Text Overlay on the Left with Generous Padding to Prevent Any Button Clipping (z-10) */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16 sm:py-20 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-xl lg:max-w-2xl xl:max-w-[680px]"
          >
            {/* Eyebrow / Agency Marker */}
            {eyebrow && (
              <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
                <span
                  className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0"
                  aria-hidden="true"
                />
                <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-neutral-300">
                  {eyebrow}
                </span>
              </div>
            )}

            {/* Editorial Display Headline */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[52px] xl:text-[64px] font-extrabold uppercase leading-[0.98] tracking-[-0.035em] text-white mb-6 sm:mb-8">
              {headlineLine1 && <span className="block">{headlineLine1}</span>}
              {headlineLine2 && <span className="block">{headlineLine2}</span>}
              {(headlineLine3 || headlineHighlight) && (
                <span className="block">
                  {headlineLine3 ? `${headlineLine3} ` : ""}
                  {headlineHighlight ? (
                    <span className="text-brand-red">{headlineHighlight}</span>
                  ) : null}
                </span>
              )}
            </h1>

            {/* Supporting Copy */}
            {subheading && (
              <p className="text-neutral-300 text-base sm:text-lg max-w-xl leading-relaxed mb-8 sm:mb-10 font-normal drop-shadow-sm">
                {subheading}
              </p>
            )}

            {/* Editorial Action Buttons (Sharp Square Geometry, No Rounded Pills) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
              {primaryCtaText && (
                <Link
                  href={primaryCtaLink || "/portfolio"}
                  className="inline-flex items-center justify-center gap-2.5 bg-brand-red text-white text-xs font-bold uppercase tracking-[0.16em] font-display px-7 py-4 rounded-none border border-brand-red hover:bg-[#dc2626] transition-colors duration-150 no-underline"
                >
                  <span>{primaryCtaText}</span>
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="translate-y-[-0.5px]"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                    />
                  </svg>
                </Link>
              )}

              {secondaryCtaText && (
                <Link
                  href={secondaryCtaLink || "/contact"}
                  className="inline-flex items-center justify-center gap-2.5 border border-white/20 hover:border-white hover:bg-white hover:text-black text-white text-xs font-bold uppercase tracking-[0.16em] font-display px-7 py-4 rounded-none transition-colors duration-150 no-underline"
                >
                  <span>{secondaryCtaText}</span>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Credentials / Capability Strip (Neo-Brutalist Typographic Index) */}
      <div className="border-t border-b border-white/[0.08] bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6 py-8 sm:py-10 lg:py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {CREDENTIALS.map(({ index, label, desc }) => (
            <div
              key={label}
              className="flex flex-col gap-1 border-l border-white/[0.08] pl-4 sm:pl-5"
            >
              <span className="text-[11px] font-mono tracking-widest text-brand-red font-semibold">
                [{index}]
              </span>
              <h3 className="text-white text-xs font-bold uppercase tracking-wider font-display mt-0.5">
                {label}
              </h3>
              <p className="text-neutral-400 text-xs leading-normal">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
