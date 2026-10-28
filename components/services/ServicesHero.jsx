"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getServicesPageContent, getServicesHeroBanners } from "@/lib/api";

const SLIDE_INTERVAL_MS = 2000;
const SLIDE_TRANSITION_MS = 600;
const REDUCED_MOTION_TRANSITION_MS = 250;
const DEFAULT_BANNERS = [];

function resolveInitialBanners(content, initialBanners) {
  if (Array.isArray(initialBanners) && initialBanners.length > 0) {
    return initialBanners;
  }
  if (Array.isArray(content?.heroBanners)) {
    return content.heroBanners;
  }
  if (content?.heroBannerImageUrl?.trim()) {
    return [
      {
        id: "legacy-banner-1",
        label: "Banner 1",
        imageUrl: content.heroBannerImageUrl.trim(),
        displayOrder: 1,
        isActive: true,
      },
    ];
  }
  return DEFAULT_BANNERS;
}

export default function ServicesHero({
  content,
  initialBanners = DEFAULT_BANNERS,
}) {
  const [liveContent, setLiveContent] = useState(content || null);
  const [banners, setBanners] = useState(() =>
    resolveInitialBanners(content, initialBanners)
  );

  const [failedBannerKeys, setFailedBannerKeys] = useState({});
  const [trackIndex, setTrackIndex] = useState(0);
  const [isInstantReset, setIsInstantReset] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Respect prefers-reduced-motion media query (uses shorter transition while keeping banner display/cycling intact)
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    if (mq.addEventListener) {
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
    return undefined;
  }, []);

  // Sync when server-rendered props update
  useEffect(() => {
    if (content) {
      setLiveContent(content);
    }
  }, [content]);

  useEffect(() => {
    if (Array.isArray(initialBanners) && initialBanners.length > 0) {
      setBanners(initialBanners);
    } else if (Array.isArray(content?.heroBanners)) {
      setBanners(content.heroBanners);
    }
  }, [initialBanners, content]);

  // Fetch latest saved CMS content and active banners on mount and when tab regains visibility
  useEffect(() => {
    let active = true;

    const fetchLatest = () => {
      Promise.all([
        getServicesPageContent().catch(() => null),
        getServicesHeroBanners().catch(() => null),
      ]).then(([freshContent, freshBanners]) => {
        if (!active) return;
        if (freshContent) {
          setLiveContent(freshContent);
        }
        if (Array.isArray(freshBanners)) {
          setBanners(freshBanners);
          setFailedBannerKeys((prev) =>
            Object.keys(prev).length === 0 ? prev : {}
          );
        } else if (Array.isArray(freshContent?.heroBanners)) {
          setBanners(freshContent.heroBanners);
          setFailedBannerKeys((prev) =>
            Object.keys(prev).length === 0 ? prev : {}
          );
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

  // Filter and sort active banners with valid image URLs in saved displayOrder
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

  // Preload all active banner images so slides are decoded before becoming active
  useEffect(() => {
    if (typeof window === "undefined" || activeBanners.length === 0) return;
    activeBanners.forEach((banner) => {
      const url = banner?.imageUrl?.trim();
      if (!url) return;
      const preloadImg = new window.Image();
      preloadImg.decoding = "async";
      preloadImg.src = url;
    });
  }, [activeBanners]);

  const bannerSignature = useMemo(
    () =>
      activeBanners
        .map((b) => `${b.id || ""}:${b.displayOrder ?? 1}:${b.imageUrl}`)
        .join("|"),
    [activeBanners]
  );

  // Reset track position cleanly whenever the active banner list or order changes
  useEffect(() => {
    setIsInstantReset(true);
    setTrackIndex(0);
    const reenableTimer = setTimeout(() => {
      setIsInstantReset(false);
    }, 50);
    return () => clearTimeout(reenableTimer);
  }, [bannerSignature, activeBanners.length]);

  // Automatic right-to-left horizontal slide every 2 seconds when > 1 banner is active
  useEffect(() => {
    if (activeBanners.length <= 1) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setIsInstantReset(false);
      setTrackIndex((prev) => {
        // Safety guard if tab was backgrounded while on the cloned loop slide
        if (prev >= activeBanners.length) {
          return 1;
        }
        return prev + 1;
      });
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [activeBanners.length, bannerSignature]);

  // Seamless loop reset: when trackIndex reaches the trailing clone (index === activeBanners.length),
  // wait for the horizontal slide transition to finish, then silently snap back to index 0 without transition.
  const transitionDurationMs = prefersReducedMotion
    ? REDUCED_MOTION_TRANSITION_MS
    : SLIDE_TRANSITION_MS;

  useEffect(() => {
    if (activeBanners.length <= 1 || trackIndex < activeBanners.length) {
      return undefined;
    }

    let restoreTimerId = null;
    const snapTimerId = setTimeout(() => {
      setIsInstantReset(true);
      setTrackIndex(0);
      restoreTimerId = setTimeout(() => {
        setIsInstantReset(false);
      }, 50);
    }, transitionDurationMs);

    return () => {
      clearTimeout(snapTimerId);
      if (restoreTimerId) clearTimeout(restoreTimerId);
    };
  }, [trackIndex, activeBanners.length, transitionDurationMs]);

  const handleBannerError = useCallback((key) => {
    if (!key) return;
    setFailedBannerKeys((prev) => ({ ...prev, [key]: true }));
  }, []);

  // Build slides list: when > 1 active banner, append a clone of the first banner at the end
  // so transitioning from the last banner back to the first also slides smoothly right-to-left.
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

  const activeContent = liveContent || content;

  const eyebrow =
    activeContent?.heroEyebrow || "OUR SERVICES // FULL-SERVICE CREATIVE STUDIO";
  const headlineLine1 = activeContent?.heroHeadlineLine1 || "CREATIVE SOLUTIONS";
  const headlineLine2 = activeContent?.heroHeadlineLine2 || "THAT DRIVE";
  const headlineHighlight = activeContent?.heroHeadlineHighlight || "RESULTS.";
  const description =
    activeContent?.heroDescription ||
    "From concept to final cut, we provide end-to-end creative services that help brands connect, engage, and grow. Every edit, thumbnail, and motion visual is crafted for maximum retention and measurable conversion.";
  const primaryCtaText =
    activeContent?.heroPrimaryCtaText || "DISCUSS YOUR PROJECT";
  const primaryCtaLink = activeContent?.heroPrimaryCtaLink || "/contact";
  const secondaryCtaText =
    activeContent?.heroSecondaryCtaText || "VIEW WORK ARCHIVE";
  const secondaryCtaLink = activeContent?.heroSecondaryCtaLink || "/portfolio";

  const stat1Value = activeContent?.heroStat1Value || "4K+";
  const stat1Label = activeContent?.heroStat1Label || "Master Exports";
  const stat2Value = activeContent?.heroStat2Value || "48H";
  const stat2Label = activeContent?.heroStat2Label || "Avg First Draft";
  const stat3Value = activeContent?.heroStat3Value || "100%";
  const stat3Label = activeContent?.heroStat3Label || "Retention Focus";

  const showStats = activeContent?.heroShowStats !== false;
  const hasBanners = activeBanners.length > 0;

  return (
    <section className="relative w-full max-w-full bg-[#080808] text-white px-4 sm:px-6 py-10 sm:py-12 lg:py-14 border-b border-white/[0.08] overflow-hidden">
      <div className="relative w-full max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7 sm:gap-8 lg:gap-8 xl:gap-10">
          {/* 1. Left Column: Editorial Copy & Actions Matched to Home Page Hero */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10 w-full lg:w-[38%] xl:w-[38%] shrink-0 flex flex-col justify-center"
          >
            {/* Eyebrow / Agency Marker (matches Home Hero) */}
            {eyebrow && (
              <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
                <span
                  className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0"
                  aria-hidden="true"
                />
                <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-neutral-400">
                  {eyebrow}
                </span>
              </div>
            )}

            {/* Editorial Display Headline (matches Home Hero typography & prevents single-letter wrapping) */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[42px] xl:text-[50px] font-extrabold uppercase leading-[0.98] tracking-[-0.035em] text-white mb-6 sm:mb-7 [overflow-wrap:normal] [word-break:keep-all] [hyphens:none]">
              {headlineLine1 && <span className="block">{headlineLine1}</span>}
              {(headlineLine2 || headlineHighlight) && (
                <span className="block">
                  {headlineLine2 ? `${headlineLine2} ` : ""}
                  {headlineHighlight ? (
                    <span className="inline-block whitespace-nowrap text-brand-red">
                      {headlineHighlight}
                    </span>
                  ) : null}
                </span>
              )}
            </h1>

            {/* Supporting Copy (matches Home Hero subheading) */}
            {description && (
              <p className="text-neutral-400 text-base sm:text-lg max-w-xl leading-relaxed mb-7 sm:mb-8 font-normal">
                {description}
              </p>
            )}

            {/* Editorial Action Buttons (matches Home Hero CTA buttons) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
              {primaryCtaText && (
                <Link
                  href={primaryCtaLink || "/contact"}
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
                  href={secondaryCtaLink || "/portfolio"}
                  className="inline-flex items-center justify-center gap-2.5 border border-white/20 hover:border-white hover:bg-white hover:text-black text-white text-xs font-bold uppercase tracking-[0.16em] font-display px-7 py-4 rounded-none transition-colors duration-150 no-underline"
                >
                  <span>{secondaryCtaText}</span>
                </Link>
              )}
            </div>

            {/* Services Hero Statistics */}
            {showStats && (
              <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-5 mt-7 border-t border-white/[0.08] max-w-md">
                <div>
                  <span className="block font-display text-lg sm:text-xl font-extrabold tracking-[-0.02em] text-white leading-tight">
                    {stat1Value}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    {stat1Label}
                  </span>
                </div>
                <div>
                  <span className="block font-display text-lg sm:text-xl font-extrabold tracking-[-0.02em] text-brand-red leading-tight">
                    {stat2Value}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    {stat2Label}
                  </span>
                </div>
                <div>
                  <span className="block font-display text-lg sm:text-xl font-extrabold tracking-[-0.02em] text-brand-green leading-tight">
                    {stat3Value}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    {stat3Label}
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* 2. Right Column: Prominent, Larger Banner Carousel (~60–62% on Desktop, 4px Radius) */}
          <div className="relative w-full lg:w-[60%] xl:w-[62%] shrink-0">
            {hasBanners ? (
              <div
                data-testid="services-hero-banner-container"
                className="relative w-full aspect-[1.68/1] sm:aspect-[1.7/1] min-h-[220px] sm:min-h-[320px] lg:min-h-[430px] xl:min-h-[470px] bg-[#080808] rounded-[4px] overflow-hidden select-none border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.65)]"
              >
                {/* Smooth Horizontal Right-to-Left Sliding Track */}
                <div
                  data-testid="services-hero-carousel-track"
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
                      ? `loop-clone-${banner.id || url}`
                      : banner.id || `${url}-${idx}`;
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
                          alt={
                            banner._isLoopClone
                              ? ""
                              : banner.label || `Services Hero Banner ${idx + 1}`
                          }
                          loading="eager"
                          decoding="async"
                          fetchPriority={idx === 0 ? "high" : "auto"}
                          onError={
                            banner._isLoopClone
                              ? undefined
                              : () => handleBannerError(banner.id || url)
                          }
                          className="w-full h-full object-cover object-right rounded-[4px] select-none pointer-events-none"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Subtle left-edge feather into #080808 (keeps >95% of the studio image at 100% brightness) */}
                <div
                  className="absolute inset-y-0 left-0 w-7 sm:w-9 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(8,8,8,0.85) 0%, rgba(8,8,8,0.35) 50%, rgba(8,8,8,0) 100%)",
                  }}
                />

                {/* 3. Synchronized Carousel Indicators (shown when > 1 active banner) */}
                {activeBanners.length > 1 && (
                  <div
                    className="absolute bottom-3 right-3 sm:bottom-3.5 sm:right-4 z-20 flex items-center gap-2 bg-black/75 border border-white/15 rounded-[4px] px-2.5 py-1"
                    role="tablist"
                    aria-label="Hero banner slides"
                  >
                    {activeBanners.map((banner, idx) => {
                      const isCurrent = idx === activeIndicatorIndex;
                      return (
                        <button
                          key={banner.id || idx}
                          type="button"
                          role="tab"
                          aria-selected={isCurrent}
                          aria-label={`Show ${banner.label || `Banner ${idx + 1}`}`}
                          onClick={() => {
                            setIsInstantReset(false);
                            setTrackIndex(idx);
                          }}
                          className={`h-1.5 transition-all duration-300 cursor-pointer border-0 p-0 ${
                            isCurrent
                              ? "w-6 bg-brand-red"
                              : "w-2 bg-white/35 hover:bg-white/60"
                          }`}
                        />
                      );
                    })}
                    <span className="ml-1 text-[9px] font-mono text-neutral-300 select-none">
                      {activeIndicatorIndex + 1}/{activeBanners.length}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* Clean Editorial Dark Fallback when 0 active banners are configured */
              <div className="relative w-full aspect-[1.68/1] sm:aspect-[1.7/1] min-h-[220px] sm:min-h-[320px] lg:min-h-[430px] xl:min-h-[470px] bg-[#0a0a0a] rounded-[4px] border border-white/10 overflow-hidden flex items-center justify-center select-none">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0e0e0e] via-[#080808] to-[#050505]" />
                <div className="relative z-10 flex flex-col items-center gap-1.5 text-center px-4">
                  <span className="w-2 h-2 bg-brand-red rounded-[1px] inline-block" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">
                    DESIGNTOUCH+ // PRODUCTION STUDIO
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
