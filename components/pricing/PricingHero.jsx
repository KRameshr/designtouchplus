"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
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
      aria-label="Pricing Hero"
      className="relative w-full overflow-hidden bg-[#080808] min-h-[460px] sm:min-h-[520px] md:min-h-[560px] lg:h-[600px] xl:h-[640px] flex items-center border-b border-white/[0.08]"
    >
      {/* Background Multi-Banner Carousel spanning full viewport width edge-to-edge */}
      <div
        data-testid="pricing-hero-banner-container"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        className="absolute inset-0 w-full h-full z-0 overflow-hidden"
      >
        {hasBanners ? (
          <div
            data-testid="pricing-hero-carousel-track"
            className="flex w-full h-full will-change-transform"
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
                "center right";

              return (
                <div
                  key={slideKey}
                  className="relative w-full h-full min-w-full shrink-0 grow-0 basis-full overflow-hidden bg-[#080808]"
                  aria-hidden={
                    idx !== activeIndicatorIndex || Boolean(banner._isLoopClone)
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={altText}
                    loading="eager"
                    decoding="async"
                    fetchPriority={idx === 0 ? "high" : "auto"}
                    style={{ objectPosition: objectPosition || "center right" }}
                    onError={
                      banner._isLoopClone
                        ? undefined
                        : () => handleBannerError(banner.id || url)
                    }
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                </div>
              );
            })}
          </div>
        ) : (
          /* Fallback Studio Motif Background when no banners are loaded */
          <div
            data-testid="pricing-hero-fallback-container"
            className="w-full h-full bg-[#080808] relative overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_30%,rgba(239,68,68,0.18),transparent_60%),radial-gradient(ellipse_at_20%_80%,rgba(34,197,94,0.12),transparent_55%)] pointer-events-none"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Subtle, smooth photographic dark scrim overlay (matching Blog Hero):
            Desktop/tablet horizontal scrim keeps text contrast sharp on the left while leaving the studio workspace clearly visible on the right */}
        <div
          className="absolute inset-0 pointer-events-none hidden sm:block"
          style={{
            background:
              "linear-gradient(90deg, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.78) 38%, rgba(8,8,8,0.38) 70%, rgba(8,8,8,0.16) 100%)",
          }}
          aria-hidden="true"
        />

        {/* Mobile vertical scrim for stacked layout */}
        <div
          className="absolute inset-0 pointer-events-none sm:hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.80) 60%, rgba(8,8,8,0.48) 100%)",
          }}
          aria-hidden="true"
        />

        {/* Carousel Indicators (shown when > 1 active banner) */}
        {activeBanners.length > 1 && (
          <div
            className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-20 flex items-center gap-1.5 bg-black/70 backdrop-blur-md border border-white/15 rounded-full px-2.5 py-1.5 shadow-lg"
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

      {/* Foreground Content: Text directly over the image on the left */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-0">
        <div className="max-w-xl lg:max-w-2xl xl:max-w-[680px]">
          {/* Eyebrow Label */}
          {eyebrow && (
            <motion.div
              className="flex items-center gap-2.5 mb-3 sm:mb-4"
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <span
                className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0"
                aria-hidden="true"
              />
              <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.22em] text-neutral-300">
                {eyebrow}
              </span>
            </motion.div>
          )}

          {/* Display Headline */}
          <h1 className="font-display text-3xl sm:text-5xl md:text-5xl lg:text-[48px] xl:text-[54px] font-extrabold uppercase leading-[1.06] tracking-[-0.035em] text-white mb-4 sm:mb-6">
            {line1 && (
              <motion.span
                className="block"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
              >
                {line1}
              </motion.span>
            )}
            {(line2 || highlight) && (
              <motion.span
                className="block mt-1 sm:mt-1.5"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
              >
                {line2 ? `${line2} ` : ""}
                {highlight ? (
                  <span className={getHighlightClass()}>{highlight}</span>
                ) : null}
              </motion.span>
            )}
          </h1>

          {/* Subheading / Description */}
          {description && (
            <motion.p
              className="text-neutral-300 text-xs sm:text-sm lg:text-base leading-relaxed mb-7 sm:mb-8 max-w-lg font-normal"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut", delay: 0.32 }}
            >
              {description}
            </motion.p>
          )}

          {/* Action CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.44 }}
          >
            {primaryCtaText && (
              <Link
                href={primaryCtaLink}
                className="inline-flex items-center justify-center gap-2.5 bg-brand-red text-white text-xs font-bold uppercase tracking-[0.16em] font-display px-6 sm:px-7 py-3.5 sm:py-4 rounded-none border border-brand-red hover:bg-[#dc2626] transition-all duration-150 no-underline cursor-pointer shadow-[0_4px_20px_rgba(239,68,68,0.25)] hover:shadow-[0_4px_25px_rgba(239,68,68,0.4)] active:scale-95"
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
                className="inline-flex items-center justify-center gap-2.5 border border-white/20 hover:border-white hover:bg-white hover:text-black text-white text-xs font-bold uppercase tracking-[0.16em] font-display px-6 sm:px-7 py-3.5 sm:py-4 rounded-none transition-colors duration-150 no-underline cursor-pointer active:scale-95"
              >
                <span>{secondaryCtaText}</span>
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
