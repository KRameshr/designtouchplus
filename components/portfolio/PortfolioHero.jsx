"use client";

import { useRef, useEffect, useState } from "react";
import { cloudinaryImageUrl, cloudinaryResponsiveImageProps } from "@/lib/cloudinaryImages.mjs";

export default function PortfolioHero({
  stats = [],
  featuredProject = null,
  introContent = null,
  tags = [],
}) {
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);

  // Active showcase video: Intro video set in Portfolio CMS takes precedence,
  // otherwise fall back to featured project video
  const activeVideoUrl = introContent?.introVideoUrl || featuredProject?.videoUrl || null;
  const activePoster = featuredProject?.imageUrl || featuredProject?.thumbnailUrl || null;

  // Active tags from DB (fallback to default 5 tags if none yet)
  const renderedTags =
    tags && tags.length > 0
      ? tags.map((t) => (typeof t === "string" ? t : t.label))
      : [
          "4K VIDEO EDITING",
          "SHORT-FORM REELS",
          "MOTION GRAPHICS",
          "COMMERCIAL ADS",
          "THUMBNAILS",
        ];

  // Auto-start video muted on mount or when active video URL changes
  useEffect(() => {
    if (videoRef.current && activeVideoUrl && !videoError) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay handled by browser muted policy
        });
      }
    }
  }, [activeVideoUrl, videoError]);

  return (
    <section
      id="portfolio-hero"
      aria-label="Portfolio Hero"
      className="bg-[#080808] text-white pt-6 sm:pt-8 lg:pt-10 pb-12 sm:pb-16 border-b border-white/[0.08] relative"
    >
      <div className="global-container w-[calc(100%-32px)] sm:w-[calc(100%-64px)] lg:w-[calc(100%-120px)] max-w-7xl max-w-[1440px] mx-auto">
        {/* Full-width Cinematic Hero Video Container */}
        {/* Spans the complete navbar-aligned container width from the logo's left edge to "LET'S TALK" */}
        <div
          data-testid="portfolio-hero-video-container"
          className="relative w-full overflow-hidden bg-[#0a0a0a] min-h-[480px] sm:min-h-[540px] md:min-h-[600px] lg:h-[640px] xl:h-[680px] flex items-center mb-10 sm:mb-14"
        >
          {/* Background Video Canvas Layer (z-0) */}
          <div
            data-testid="portfolio-hero-media-canvas"
            className="absolute inset-0 w-full h-full z-0 overflow-hidden"
          >
            {activeVideoUrl && !videoError ? (
              <video
                ref={videoRef}
                src={activeVideoUrl}
                poster={cloudinaryImageUrl(activePoster, 1440) || activePoster || undefined}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                onError={() => setVideoError(true)}
                className="w-full h-full object-cover select-none pointer-events-none"
                style={{ objectPosition: "center center" }}
              />
            ) : activePoster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                {...cloudinaryResponsiveImageProps(activePoster, { widths: [480, 640, 960, 1280, 1600], sizes: "(min-width: 1440px) 1320px, calc(100vw - 32px)", fallbackWidth: 1280 })}
                alt={featuredProject?.title || "Portfolio Showcase Reel"}
                className="w-full h-full object-cover select-none pointer-events-none"
                style={{ objectPosition: "center center" }}
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#0d0d0d]">
                <span className="w-2 h-2 bg-brand-red mb-2" aria-hidden="true" />
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-300">
                  DESIGNTOUCH+ SHOWCASE
                </span>
                <span className="text-[10px] font-mono text-neutral-500 mt-1">
                  PRORES 4K // MASTER REEL
                </span>
              </div>
            )}

            {/* Scrim Overlay — Desktop / Tablet: Horizontal gradient darkest behind text on left,
                gradually becoming lighter toward the right to showcase the cinematic video */}
            <div
              data-testid="portfolio-hero-scrim-horizontal"
              className="absolute inset-0 pointer-events-none hidden sm:block"
              style={{
                background:
                  "linear-gradient(90deg, rgba(8,8,8,0.94) 0%, rgba(8,8,8,0.82) 36%, rgba(8,8,8,0.45) 72%, rgba(8,8,8,0.18) 100%)",
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
              data-testid="portfolio-hero-scrim-vertical"
              className="absolute inset-0 pointer-events-none sm:hidden"
              style={{
                background:
                  "linear-gradient(180deg, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.80) 65%, rgba(8,8,8,0.45) 100%)",
              }}
              aria-hidden="true"
            />
          </div>

          {/* Foreground Content: Text Overlay on the Left (z-10) */}
          <div className="relative z-10 w-full p-6 sm:p-10 md:p-12 lg:p-14 xl:p-16">
            <div className="max-w-xl lg:max-w-2xl xl:max-w-[660px]">
              {/* Editorial Eyebrow */}
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span
                  className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0"
                  aria-hidden="true"
                />
                <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.24em] text-neutral-300">
                  {introContent?.eyebrow || "OUR PORTFOLIO // SELECTED WORK"}
                </span>
              </div>

              {/* Display Headline */}
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[62px] xl:text-7xl font-black uppercase leading-[0.98] tracking-tight text-white mb-5 sm:mb-6">
                {introContent?.headlineLine1 || "Our Work"} <br />
                {introContent?.headlineLine2 || "Speaks"}{" "}
                <span className="text-brand-red">
                  {introContent?.headlineHighlight || "Louder."}
                </span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-xl font-normal drop-shadow-sm mb-6 sm:mb-8">
                {introContent?.description ||
                  "Explore our curated portfolio of commercial campaigns, creator reels, and high-conversion visual narratives built to command attention."}
              </p>

              {/* Agency Capabilities Meta Strip */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-5 sm:pt-6 border-t border-white/15">
                {renderedTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-black/60 backdrop-blur-sm border border-white/20 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-neutral-200 rounded-none"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        {stats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/[0.08]">
            {stats.map((stat, idx) => {
              const valStr = String(stat.value ?? "");
              const suffixStr = stat.suffix || "";
              const alreadyHasSuffix = suffixStr && valStr.endsWith(suffixStr);
              return (
                <div
                  key={stat.id || idx}
                  className="border-l border-white/10 pl-4 sm:pl-6 first:border-l-0 first:pl-0"
                >
                  <p className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-1">
                    {valStr}
                    {!alreadyHasSuffix && suffixStr && (
                      <span className="text-brand-red font-mono ml-0.5">
                        {suffixStr}
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                    {stat.label || stat.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
