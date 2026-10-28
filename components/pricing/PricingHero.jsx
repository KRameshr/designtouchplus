"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { SlidersHorizontal, MonitorPlay } from "lucide-react";
import { getPricingPageContent, getPricingHeroBanners } from "@/lib/api";

const SLIDE_INTERVAL_MS = 1500; // Requirement: auto-advance every 1.5s
const SLIDE_TRANSITION_MS = 500;
const REDUCED_MOTION_TRANSITION_MS = 200;

function resolveInitialBanners(content, initialBanners) {
  if (Array.isArray(initialBanners) && initialBanners.length > 0) {
    return initialBanners;
  }
  if (Array.isArray(content?.heroBanners) && content.heroBanners.length > 0) {
    return content.heroBanners;
  }
  const singleUrl =
    content?.heroBannerImageUrl?.trim() ||
    content?.heroBackgroundImageUrl?.trim();
  if (singleUrl) {
    return [
      {
        id: "legacy-pricing-banner-1",
        label: "Banner 1",
        imageUrl: singleUrl,
        altText: content?.heroBannerImageAlt || "DesignTouch+ Creative Production Studio",
        objectPosition: content?.heroBannerObjectPosition || "center",
        displayOrder: 1,
        isActive: true,
      },
    ];
  }
  return [];
}

/**
 * Premium Pricing Page Hero:
 * - Left column: Eyebrow, refined editorial heading with customizable highlight style,
 *   subheading description, and primary/secondary CTAs.
 * - Right column: Automatic horizontal multi-banner carousel (up to 5 banners)
 *   transitioning every 1.5 seconds, hover pause/resume, interactive indicators,
 *   and fallback studio motif when empty.
 */
export default function PricingHero({ content = null, initialBanners = [] }) {
  const prefersReducedMotion = useReducedMotion();

  const [liveContent, setLiveContent] = useState(content || null);
  const [banners, setBanners] = useState(() =>
    resolveInitialBanners(content, initialBanners)
  );

  const [failedBannerKeys, setFailedBannerKeys] = useState({});
  const [trackIndex, setTrackIndex] = useState(0);
  const [isInstantReset, setIsInstantReset] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Sync when server props change
  useEffect(() => {
    if (content) setLiveContent(content);
  }, [content]);

  useEffect(() => {
    if (Array.isArray(initialBanners) && initialBanners.length > 0) {
      setBanners(initialBanners);
    } else if (Array.isArray(content?.heroBanners) && content.heroBanners.length > 0) {
      setBanners(content.heroBanners);
    }
  }, [initialBanners, content]);

  // Live refetch on mount and window focus/visibility
  useEffect(() => {
    let active = true;

    const fetchLatest = () => {
      Promise.all([
        getPricingPageContent().catch(() => null),
        getPricingHeroBanners().catch(() => null),
      ]).then(([freshContent, freshBanners]) => {
        if (!active) return;
        if (freshContent) {
          setLiveContent(freshContent);
        }
        if (Array.isArray(freshBanners) && freshBanners.length > 0) {
          setBanners(freshBanners);
        } else if (Array.isArray(freshContent?.heroBanners) && freshContent.heroBanners.length > 0) {
          setBanners(freshContent.heroBanners);
        }
      });
    };

    fetchLatest();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchLatest();
      }
    };

    window.addEventListener("focus", fetchLatest);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      window.removeEventListener("focus", fetchLatest);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Filter & sort active banners
  const activeBanners = useMemo(() => {
    if (!Array.isArray(banners)) return [];
    return [...banners]
      .filter((b) => {
        const url = b?.imageUrl?.trim();
        const key = b?.id || url;
        return b?.isActive !== false && Boolean(url) && !failedBannerKeys[key];
      })
      .sort((a, b) => (a.displayOrder ?? 1) - (b.displayOrder ?? 1));
  }, [banners, failedBannerKeys]);

  // Preload all active banner images
  useEffect(() => {
    if (typeof window === "undefined" || activeBanners.length === 0) return;
    activeBanners.forEach((banner) => {
      const url = banner?.imageUrl?.trim();
      if (!url) return;
      const img = new window.Image();
      img.decoding = "async";
      img.src = url;
    });
  }, [activeBanners]);

  const bannerSignature = useMemo(
    () =>
      activeBanners
        .map((b) => `${b.id || ""}:${b.displayOrder ?? 1}:${b.imageUrl}`)
        .join("|"),
    [activeBanners]
  );

  // Reset track position if banners change
  useEffect(() => {
    setIsInstantReset(true);
    setTrackIndex(0);
    const t = setTimeout(() => setIsInstantReset(false), 50);
    return () => clearTimeout(t);
  }, [bannerSignature, activeBanners.length]);

  // Automatic slide rotation every 1.5 seconds (paused on hover/focus)
  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setIsInstantReset(false);
      setTrackIndex((prev) => {
        if (prev >= activeBanners.length) {
          return 1;
        }
        return prev + 1;
      });
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [activeBanners.length, isPaused, bannerSignature]);

  const transitionDurationMs = prefersReducedMotion
    ? REDUCED_MOTION_TRANSITION_MS
    : SLIDE_TRANSITION_MS;

  // Seamless loop reset when trackIndex reaches cloned first banner
  useEffect(() => {
    if (activeBanners.length <= 1 || trackIndex < activeBanners.length) {
      return undefined;
    }

    let restoreTimer = null;
    const snapTimer = setTimeout(() => {
      setIsInstantReset(true);
      setTrackIndex(0);
      restoreTimer = setTimeout(() => {
        setIsInstantReset(false);
      }, 50);
    }, transitionDurationMs);

    return () => {
      clearTimeout(snapTimer);
      if (restoreTimer) clearTimeout(restoreTimer);
    };
  }, [trackIndex, activeBanners.length, transitionDurationMs]);

  const handleBannerError = useCallback((key) => {
    if (!key) return;
    setFailedBannerKeys((prev) => ({ ...prev, [key]: true }));
  }, []);

  // When > 1 active banner, append clone of first banner for smooth right-to-left loop
  const renderedSlides = useMemo(() => {
    if (activeBanners.length <= 1) {
      return activeBanners;
    }
    return [
      ...activeBanners,
      {
        ...activeBanners[0],
        _isLoopClone: true,
      },
    ];
  }, [activeBanners]);

  const effectiveTrackIndex =
    renderedSlides.length > 0
      ? Math.min(trackIndex, renderedSlides.length - 1)
      : 0;

  const activeIndicatorIndex =
    activeBanners.length > 0 ? effectiveTrackIndex % activeBanners.length : 0;

  const shouldAnimateSlide = activeBanners.length > 1 && !isInstantReset;

  const handleSelectBanner = (idx) => {
    setIsInstantReset(false);
    setTrackIndex(idx);
  };

  // Content values
  const activeContent = liveContent || content;
  const eyebrow = activeContent?.heroEyebrow || "PRICING PLANS";
  const line1 = activeContent?.heroHeadlineLine1 || "SIMPLE PRICING.";
  const line2 = activeContent?.heroHeadlineLine2 || "POWERFUL";
  const highlight = activeContent?.heroHeadlineHighlight || "RESULTS.";
  const highlightStyle = activeContent?.heroHighlightStyle || "gradient";
  const description =
    activeContent?.heroDescription ||
    "Choose the perfect plan for your needs. All plans include high-quality editing, fast delivery and unlimited revisions.";

  const primaryCtaText = activeContent?.heroPrimaryCtaText?.trim() || "CHOOSE A PLAN";
  const primaryCtaLink = activeContent?.heroPrimaryCtaLink?.trim() || "#plans";
  const secondaryCtaText = activeContent?.heroSecondaryCtaText?.trim() || "BOOK A CALL";
  const secondaryCtaLink = activeContent?.heroSecondaryCtaLink?.trim() || "/contact";

  const getHighlightClass = () => {
    if (highlightStyle === "red") {
      return "inline-block whitespace-nowrap text-brand-red";
    }
    if (highlightStyle === "green") {
      return "inline-block whitespace-nowrap text-brand-green";
    }
    return "inline-block whitespace-nowrap bg-gradient-to-r from-brand-red via-orange-400 to-brand-green bg-clip-text text-transparent";
  };

  const hasBanners = activeBanners.length > 0;

  return (
    <section
      id="pricing-hero"
      className="relative w-full max-w-full bg-[#080808] text-white px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 lg:pt-12 xl:pt-14 pb-12 sm:pb-14 lg:pb-16 xl:pb-18 border-b border-white/[0.08] overflow-x-clip"
    >
      <div className="relative w-full max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 sm:gap-10 lg:gap-8 xl:gap-10">
          {/* Left Column: Editorial Copy & Actions */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10 w-full lg:w-[40%] xl:w-[39%] shrink-0 flex flex-col justify-center"
          >
            {/* Eyebrow Label */}
            {eyebrow && (
              <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
                <span
                  className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0"
                  aria-hidden="true"
                />
                <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-neutral-400">
                  {eyebrow}
                </span>
              </div>
            )}

            {/* Display Headline */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-5xl lg:text-[42px] xl:text-[48px] 2xl:text-[54px] font-extrabold uppercase leading-[1.08] tracking-[-0.035em] text-white mb-5 sm:mb-6 [overflow-wrap:normal] [word-break:keep-all] [hyphens:none]">
              {line1 && <span className="block">{line1}</span>}
              {(line2 || highlight) && (
                <span className="block">
                  {line2 ? `${line2} ` : ""}
                  {highlight ? (
                    <span className={getHighlightClass()}>{highlight}</span>
                  ) : null}
                </span>
              )}
            </h1>

            {/* Subheading / Description */}
            {description && (
              <p className="text-neutral-400 text-sm sm:text-base leading-relaxed mb-7 sm:mb-8 max-w-lg font-normal">
                {description}
              </p>
            )}

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
              {primaryCtaText && (
                <Link
                  href={primaryCtaLink}
                  className="inline-flex items-center justify-center gap-2.5 bg-brand-red text-white text-xs font-bold uppercase tracking-[0.16em] font-display px-6 sm:px-7 py-3.5 sm:py-4 rounded-none border border-brand-red hover:bg-[#dc2626] transition-all duration-150 no-underline cursor-pointer shadow-[0_4px_20px_rgba(239,68,68,0.2)] hover:shadow-[0_4px_25px_rgba(239,68,68,0.35)]"
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
                  href={secondaryCtaLink}
                  className="inline-flex items-center justify-center gap-2.5 border border-white/20 hover:border-white hover:bg-white hover:text-black text-white text-xs font-bold uppercase tracking-[0.16em] font-display px-6 sm:px-7 py-3.5 sm:py-4 rounded-none transition-colors duration-150 no-underline cursor-pointer"
                >
                  <span>{secondaryCtaText}</span>
                </Link>
              )}
            </div>
          </motion.div>

          {/* Right Column: Prominent Cinematic Workstation Carousel */}
          <div className="relative w-full lg:w-[58%] xl:w-[59%] shrink-0 flex items-center justify-center">
            {hasBanners ? (
              <div
                data-testid="pricing-hero-banner-container"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
                className="relative w-full aspect-[16/10] sm:aspect-[1.7/1] lg:aspect-[1.65/1] xl:aspect-[1.68/1] min-h-[240px] sm:min-h-[280px] lg:min-h-[360px] xl:min-h-[400px] max-h-[380px] sm:max-h-[440px] lg:max-h-[460px] xl:max-h-[500px] 2xl:max-h-[540px] bg-[#080808] rounded-[4px] overflow-hidden select-none border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.65)] group"
              >
                {/* Horizontal sliding track */}
                <div
                  data-testid="pricing-hero-carousel-track"
                  className="flex w-full h-full rounded-[4px] will-change-transform"
                  style={{
                    transform: `translate3d(-${effectiveTrackIndex * 100}%, 0, 0)`,
                    transition: shouldAnimateSlide
                      ? `transform ${transitionDurationMs}ms cubic-bezier(0.4, 0, 0.2, 1)`
                      : "none",
                  }}
                >
                  {renderedSlides.map((banner, idx) => {
                    const url = banner.imageUrl.trim();
                    const slideKey = banner._isLoopClone
                      ? `pricing-loop-clone-${banner.id || url}`
                      : banner.id || `${url}-${idx}`;
                    const altText =
                      banner._isLoopClone
                        ? ""
                        : banner.altText ||
                          banner.label ||
                          `Pricing Hero Banner ${idx + 1}`;
                    const objectPosition =
                      banner.objectPosition ||
                      banner.heroBannerObjectPosition ||
                      "center";

                    return (
                      <div
                        key={slideKey}
                        className="relative w-full h-full min-w-full shrink-0 grow-0 basis-full overflow-hidden rounded-[4px] bg-[#080808]"
                        aria-hidden={
                          idx !== activeIndicatorIndex || Boolean(banner._isLoopClone)
                        }
                      >
                        <img
                          src={url}
                          alt={altText}
                          loading="eager"
                          decoding="async"
                          fetchPriority={idx === 0 ? "high" : "auto"}
                          style={{ objectPosition }}
                          onError={
                            banner._isLoopClone
                              ? undefined
                              : () => handleBannerError(banner.id || url)
                          }
                          className="w-full h-full object-cover rounded-[4px] select-none pointer-events-none transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Subtle left-edge feather into #080808 */}
                <div
                  className="absolute inset-y-0 left-0 w-8 sm:w-12 pointer-events-none z-10"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(8,8,8,0.85) 0%, rgba(8,8,8,0.3) 50%, rgba(8,8,8,0) 100%)",
                  }}
                  aria-hidden="true"
                />

                {/* Studio Suite Badge Overlay */}
                <div
                  className="absolute top-3.5 right-3.5 z-20 flex items-center gap-2 bg-black/80 border border-white/15 rounded-[4px] px-2.5 py-1 backdrop-blur-md pointer-events-none"
                  aria-hidden="true"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
                  <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-neutral-300">
                    DT+ PRODUCTION WORKSTATION
                  </span>
                </div>

                {/* Carousel Indicators (shown when > 1 active banner) */}
                {activeBanners.length > 1 && (
                  <div
                    className="absolute bottom-3.5 right-3.5 sm:bottom-4 sm:right-4 z-20 flex items-center gap-1.5 bg-black/80 backdrop-blur-md border border-white/15 rounded-full px-2.5 py-1.5 shadow-lg"
                    role="tablist"
                    aria-label="Pricing hero banner slides"
                  >
                    {activeBanners.map((banner, idx) => {
                      const isCurrent = activeIndicatorIndex === idx;
                      return (
                        <button
                          key={banner.id || idx}
                          type="button"
                          role="tab"
                          aria-selected={isCurrent}
                          aria-label={`Slide ${idx + 1} of ${activeBanners.length}: ${
                            banner.label || `Banner ${idx + 1}`
                          }`}
                          onClick={() => handleSelectBanner(idx)}
                          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            isCurrent
                              ? "w-5 bg-brand-red"
                              : "w-1.5 bg-white/40 hover:bg-white/70"
                          }`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Fallback: Cinematic Studio Workstation Aesthetic */
              <div
                data-testid="pricing-hero-fallback-container"
                className="relative w-full aspect-[16/10] sm:aspect-[1.7/1] lg:aspect-[1.65/1] xl:aspect-[1.68/1] min-h-[240px] sm:min-h-[280px] lg:min-h-[360px] xl:min-h-[400px] max-h-[380px] sm:max-h-[440px] lg:max-h-[460px] xl:max-h-[500px] 2xl:max-h-[540px] bg-[#090909] rounded-[4px] border border-white/10 overflow-hidden flex flex-col justify-between p-6 sm:p-8 select-none shadow-[0_20px_50px_rgba(0,0,0,0.65)]"
              >
                {/* Background ambient lighting */}
                <div
                  className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_30%,rgba(239,68,68,0.14),transparent_60%),radial-gradient(ellipse_at_20%_80%,rgba(34,197,94,0.08),transparent_55%)] pointer-events-none"
                  aria-hidden="true"
                />

                {/* Top header bar */}
                <div className="relative z-10 flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    <span className="text-[10px] font-mono text-neutral-400 ml-2 tracking-wider">
                      PRO_PROJECT_TIMELINE.PRPROJ
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase text-neutral-500 tracking-widest hidden sm:inline-block">
                    REC ● 23.976 FPS
                  </span>
                </div>

                {/* Center Visual Motif */}
                <div className="relative z-10 flex flex-col items-center justify-center my-auto py-6 sm:py-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red mb-3 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                    <MonitorPlay className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm sm:text-base font-display font-extrabold uppercase tracking-wider text-white">
                    Premium Post-Production Studio
                  </h3>
                  <p className="text-[11px] font-mono text-neutral-400 mt-1 max-w-sm">
                    Custom motion graphics, sound design, and color grading calibrated for high retention.
                  </p>
                </div>

                {/* Bottom Timeline Strip */}
                <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/[0.08]">
                  <div className="flex items-center gap-3 text-[10px] font-mono text-neutral-400">
                    <span className="flex items-center gap-1">
                      <SlidersHorizontal className="w-3 h-3 text-brand-red" /> 10-BIT LOG
                    </span>
                    <span className="hidden sm:inline">|</span>
                    <span className="hidden sm:inline">4K PRORES 422 HQ</span>
                  </div>
                  <span className="text-[10px] font-mono text-brand-green font-bold uppercase tracking-wider">
                    ● READY TO PRODUCE
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
