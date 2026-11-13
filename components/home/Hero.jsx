"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clapperboard, Clock3, Headset, RefreshCw } from "lucide-react";

const CREDENTIALS = [
  { label: "Fast Delivery", desc: "On-time, every time.", Icon: Clock3 },
  { label: "Cinema Quality", desc: "Pro-level edits & visuals.", Icon: Clapperboard },
  { label: "Unlimited Revisions", desc: "Until you're satisfied.", Icon: RefreshCw },
  { label: "Dedicated Support", desc: "Direct & clear communication.", Icon: Headset },
];

const DEFAULT_HERO = {
  eyebrow: "CREATIVE VIDEO & CONTENT STUDIO",
  headlineLine1: "WE CREATE",
  headlineLine2: "VIDEOS THAT",
  headlineLine3: "GROW",
  headlineHighlight: "BRANDS.",
  subheading:
    "Helping businesses and creators tell powerful stories through professional video editing & creative content.",
  primaryCtaText: "VIEW PORTFOLIO",
  primaryCtaLink: "/portfolio",
  secondaryCtaText: "BOOK A CALL",
  secondaryCtaLink: "/contact",
  videoUrl: "/hero-demo.mp4",
  badgeText: "REEL // 2026",
  specBadgeText: "4K PRORES",
};

export default function Hero({ hero, ...directProps }) {
  const [isMounted, setIsMounted] = useState(false);
  const videoRef = useRef(null);

  const { eyebrow, headlineLine1, headlineLine2, headlineLine3, headlineHighlight, subheading, primaryCtaText, secondaryCtaText } = DEFAULT_HERO;
  const primaryCtaLink = hero?.primaryCtaLink ?? directProps.primaryCtaLink ?? DEFAULT_HERO.primaryCtaLink;
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
              preload="metadata"
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
            className="max-w-xl lg:max-w-2xl xl:max-w-[720px]"
          >
            {/* Eyebrow / Agency Marker */}
            {eyebrow && (
              <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
                <span
                  className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0"
                  aria-hidden="true"
                />
                <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-[0.18em] sm:tracking-[0.22em] text-neutral-300">
                  {eyebrow}
                </span>
              </div>
            )}

            {/* Editorial Display Headline */}
            <h1 className="font-display text-[clamp(2rem,8.8vw,5.5rem)] sm:text-[clamp(3.25rem,5.2vw,5.5rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.045em] text-white mb-6 sm:mb-8">
              {headlineLine1 && <span className="block">{headlineLine1}</span>}
              {headlineLine2 && <span className="block">{headlineLine2}</span>}
              {(headlineLine3 || headlineHighlight) && (
                <span className="block whitespace-nowrap text-brand-red">
                  {headlineLine3 ? `${headlineLine3} ` : ""}
                  {headlineHighlight || null}
                </span>
              )}
            </h1>

            {/* Supporting Copy */}
            {subheading && (
              <p className="text-neutral-300 text-base sm:text-lg max-w-[38rem] leading-relaxed mb-8 sm:mb-10 font-normal">
                {subheading}
              </p>
            )}

            {/* Editorial Action Buttons (Sharp Square Geometry, No Rounded Pills) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              {primaryCtaText && (
                <Link
                  href={primaryCtaLink || "/portfolio"}
                  className="inline-flex min-h-14 items-center justify-center gap-2.5 bg-brand-red text-white text-xs font-bold uppercase tracking-[0.14em] sm:tracking-[0.16em] font-display px-5 sm:px-7 py-4 rounded-none border border-brand-red hover:bg-[#dc2626] transition-colors duration-150 no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
                      d="M3 9L9 3M4 3H9V8"
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
                  className="inline-flex min-h-14 items-center justify-center gap-2.5 border border-white/20 hover:border-white hover:bg-white hover:text-black text-white text-xs font-bold uppercase tracking-[0.14em] sm:tracking-[0.16em] font-display px-5 sm:px-7 py-4 rounded-none transition-colors duration-150 no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
        <div className="max-w-7xl mx-auto px-6 py-6 sm:py-8 lg:py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
          {CREDENTIALS.map(({ label, desc, Icon }, index) => (
            <div
              key={label}
              className={`flex min-h-[112px] items-center gap-4 border-t border-white/[0.08] py-5 sm:px-5 lg:border-t-0 lg:py-3 ${
                index === 0 ? "sm:border-t-0 lg:pl-0" : "lg:border-l"
              } ${index % 2 === 0 ? "sm:border-r sm:border-r-white/[0.08] lg:border-r-0" : ""}`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-brand-red/30 text-brand-red" aria-hidden="true">
                <Icon size={18} strokeWidth={1.7} />
              </span>
              <div className="min-w-0">
                <h3 className="text-white text-xs sm:text-sm font-bold uppercase tracking-wider font-display">
                  {label}
                </h3>
                <p className="mt-1 text-neutral-400 text-xs sm:text-[13px] leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
