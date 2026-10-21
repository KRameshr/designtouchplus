"use client";

import { useState, useRef } from "react";

export default function PortfolioHero({
  stats = [],
  featuredProject = null,
  introContent = null,
  tags = [],
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

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

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  return (
    <section className="bg-[#080808] text-white px-4 sm:px-6 pt-16 sm:pt-20 pb-12 sm:pb-16 border-b border-white/[0.08] relative">
      <div className="max-w-7xl mx-auto">
        {/* Main Hero Editorial Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12 sm:mb-16">
          {/* Left Column: Headlines & Copy */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Editorial Eyebrow */}
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <span
                className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0"
                aria-hidden="true"
              />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.24em] text-neutral-400">
                {introContent?.eyebrow || "OUR PORTFOLIO // SELECTED WORK"}
              </span>
            </div>

            {/* Display Headline */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.98] tracking-tight text-white mb-6">
              {introContent?.headlineLine1 || "Our Work"} <br />
              {introContent?.headlineLine2 || "Speaks"}{" "}
              <span className="text-brand-red">
                {introContent?.headlineHighlight || "Louder."}
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
              {introContent?.description ||
                "Explore our curated portfolio of commercial campaigns, creator reels, and high-conversion visual narratives built to command attention."}
            </p>

            {/* Agency Capabilities Meta Strip */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mt-8 pt-6 border-t border-white/[0.08]">
              {renderedTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-white/[0.03] border border-white/10 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-neutral-300 rounded-none"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: Cinematic Featured Media Frame */}
          <div className="lg:col-span-5">
            <div className="relative bg-[#0c0c0c] border border-white/15 p-2 sm:p-2.5 rounded-none group">
              {/* Media Container (16:9 Aspect Ratio) */}
              <div className="relative aspect-[16/9] w-full bg-[#141414] overflow-hidden border border-white/10">
                {activeVideoUrl ? (
                  <video
                    ref={videoRef}
                    src={activeVideoUrl}
                    controls={isPlaying}
                    playsInline
                    preload="metadata"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    className="w-full h-full object-cover"
                  />
                ) : activePoster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activePoster}
                    alt={featuredProject?.title || "Featured Showcase"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                    <span className="w-2 h-2 bg-brand-red mb-2" />
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-300">
                      DESIGNTOUCH+ SHOWCASE
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500 mt-1">
                      PRORES 4K // MASTER REEL
                    </span>
                  </div>
                )}

                {/* Overlaid Large Centered Play Button when paused / before playback */}
                {!isPlaying && activeVideoUrl && (
                  <button
                    type="button"
                    onClick={handlePlay}
                    className="absolute inset-0 w-full h-full bg-black/40 hover:bg-black/50 flex items-center justify-center transition-colors cursor-pointer group/play z-20 focus:outline-none"
                    aria-label="Play showcase video"
                  >
                    <span className="w-16 h-16 sm:w-20 sm:h-20 bg-black/80 group-hover/play:bg-black/95 border border-white/25 group-hover/play:border-brand-red text-white flex items-center justify-center rounded-none shadow-2xl transition-all duration-200 transform group-hover/play:scale-105">
                      <svg
                        className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-1 transition-transform group-hover/play:translate-x-0.5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M5 3.868v16.264c0 .87 1.01 1.346 1.677.784l13.553-8.132a.916.916 0 000-1.568L6.677 3.084C6.01 2.522 5 2.998 5 3.868z" />
                      </svg>
                    </span>
                  </button>
                )}

                {/* Top Badge */}
                <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 bg-black/85 border border-white/15 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.16em] text-neutral-300">
                    <span className="w-1.5 h-1.5 bg-brand-red rounded-none" aria-hidden="true" />
                    SHOWCASE REEL
                  </span>
                </div>

                {/* Spec Badge */}
                <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
                  <span className="inline-flex items-center bg-black/85 border border-white/15 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-neutral-400">
                    4K PRORES
                  </span>
                </div>
              </div>

              {/* Media Sub-bar */}
              <div className="pt-2.5 px-1 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span className="truncate text-white font-medium uppercase text-[11px]">
                  {introContent?.introVideoUrl
                    ? "Showcase Reel"
                    : featuredProject?.title || "Signature Production Reel"}
                </span>
                <span className="shrink-0 text-neutral-500 text-[10px] pl-2">
                  {introContent?.introVideoUrl
                    ? "4K INTRO"
                    : featuredProject?.duration || "FEATURED"}
                </span>
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
                <div key={stat.id || idx} className="border-l border-white/10 pl-4 sm:pl-6 first:border-l-0 first:pl-0">
                  <p className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-1">
                    {valStr}
                    {!alreadyHasSuffix && suffixStr && (
                      <span className="text-brand-red font-mono ml-0.5">{suffixStr}</span>
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
