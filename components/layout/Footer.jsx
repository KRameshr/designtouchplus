"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { subscribeToNewsletter, getContactPageContent } from "@/lib/api";
import {
  parseSocialLinks,
  getSocialPlatformIcon,
  validateSocialUrl,
  XPlatformIcon,
  DEFAULT_SOCIAL_LINKS,
} from "@/lib/socialPlatforms";
import {
  getStoredCookieConsent,
  saveCookieConsent,
  acceptAllCookies,
  rejectOptionalCookies,
  subscribeToCookieConsent,
  isPopupDismissedInSession,
  dismissPopupSession,
  notifyCookieModalState,
} from "@/lib/cookieConsent";

const QUICK_LINKS = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Services", path: "/services" },
  { name: "Portfolio", path: "/portfolio" },
  { name: "Pricing", path: "/pricing" },
  { name: "Blog", path: "/blog" },
  { name: "Contact", path: "/contact" },
];

const SERVICES = [
  { name: "Video Editing", path: "/services/video-editing" },
  { name: "Motion Graphics", path: "/services/motion-graphics" },
  { name: "Content Creation", path: "/services/social-media-content" },
  { name: "Brand Films", path: "/services/commercial-ads" },
  { name: "Thumbnail Design", path: "/services/thumbnail-design" },
  { name: "YouTube Content", path: "/services/youtube-management" },
];

/**
 * DesignTouch+ Global Website Footer
 * Minimal, premium, sharp-edged creative agency footer:
 * - Content container matching Navbar max-width and horizontal alignment (max-w-7xl mx-auto px-6)
 * - Sharp rectangular 0px border-radius throughout (wrapper, inputs, buttons, social containers)
 * - Flush horizontal newsletter subscribe form with #111111 background, #F04444 button, and rectangular focus state
 * - Consistent square social icon buttons with restrained red/green accents
 * - Clean four-column structure and single-row desktop bottom copyright/policies
 */
const Footer = ({ companyInfo, contactContent: initialContactContent }) => {
  const pathname = usePathname();
  const [contactContent, setContactContent] = useState(initialContactContent || null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | duplicate | unconfirmed | error
  const [feedback, setFeedback] = useState("");
  const [showCookieModal, setShowCookieModal] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  // Synchronize cookie consent preferences with localStorage and global events
  useEffect(() => {
    const consent = getStoredCookieConsent();
    setAnalyticsEnabled(consent.analytics);

    const unsubscribe = subscribeToCookieConsent((updated) => {
      setAnalyticsEnabled(updated.analytics);
    });

    return unsubscribe;
  }, []);

  // Broadcast cookie modal visibility for synchronized components (e.g. chat launcher sequence)
  useEffect(() => {
    notifyCookieModalState(showCookieModal);
  }, [showCookieModal]);

  // Cookie popup lifecycle:
  // - Does NOT immediately show popup on initial page open
  // - Triggers when visitor scrolls to 30% of total scrollable page height
  // - Triggers only once per valid consent period
  // - Stays visible until visitor makes a consent choice
  // - If page is shorter than viewport and cannot be scrolled, handles gracefully without breaking
  // - Efficient, passive scroll listener with rAF throttle and proper cleanup
  useEffect(() => {
    // Only target the homepage
    if (pathname !== "/") return;

    // Do not show if visitor already has valid 24h consent or dismissed popup in this session
    const consent = getStoredCookieConsent();
    const isDismissed = isPopupDismissedInSession();

    if (process.env.NODE_ENV !== "production") {
      console.log("[CookieConsent] Homepage scroll detection init:", {
        pathname,
        isConfigured: consent.isConfigured,
        analytics: consent.analytics,
        isDismissed,
      });
    }

    if (consent.isConfigured || isDismissed) {
      if (process.env.NODE_ENV !== "production") {
        console.log(
          "[CookieConsent] Scroll trigger skipped:",
          consent.isConfigured ? "Consent already configured." : "Dismissed for this session."
        );
      }
      return;
    }

    let hasTriggered = false;
    let isTicking = false;

    const cleanUpListeners = () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("load", handleScroll);
    };

    const triggerPopup = () => {
      if (hasTriggered) return;
      hasTriggered = true;
      if (process.env.NODE_ENV !== "production") {
        console.log("%c[CookieConsent] Reached 30% scroll — displaying cookie consent popup.", "color: #EF4444; font-weight: bold;");
      }
      setShowCookieModal(true);
      cleanUpListeners();
    };

    const checkScrollPosition = () => {
      if (hasTriggered) return;

      const scrollingElement =
        document.scrollingElement || document.documentElement || document.body;

      // Robust cross-browser scroll calculation (desktop, mobile, iOS, WebKit)
      const scrollTop = Math.max(
        window.scrollY || 0,
        window.pageYOffset || 0,
        scrollingElement?.scrollTop || 0,
        document.documentElement?.scrollTop || 0,
        document.body?.scrollTop || 0
      );

      const scrollHeight = Math.max(
        document.documentElement?.scrollHeight || 0,
        document.body?.scrollHeight || 0,
        scrollingElement?.scrollHeight || 0
      );

      const clientHeight =
        window.innerHeight ||
        document.documentElement?.clientHeight ||
        document.body?.clientHeight ||
        0;

      const totalScrollable = scrollHeight - clientHeight;

      // Gracefully handle short pages that cannot be scrolled
      if (!totalScrollable || totalScrollable <= 20) {
        return;
      }

      const scrollFraction = scrollTop / totalScrollable;

      if (process.env.NODE_ENV !== "production") {
        const pct = Math.round(scrollFraction * 100);
        if (pct % 10 === 0 || pct >= 30) {
          console.log(`[CookieConsent] Scroll progress: ${pct}% (scrollTop: ${Math.round(scrollTop)} / totalScrollable: ${Math.round(totalScrollable)})`);
        }
      }

      if (scrollFraction >= 0.3) {
        triggerPopup();
      }
    };

    const handleScroll = () => {
      if (hasTriggered) return;
      if (typeof requestAnimationFrame !== "undefined") {
        if (!isTicking) {
          requestAnimationFrame(() => {
            checkScrollPosition();
            isTicking = false;
          });
          isTicking = true;
        }
      } else {
        checkScrollPosition();
      }
    };

    // Attach passive listeners to capture scroll across all devices
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    window.addEventListener("load", handleScroll, { passive: true });

    // Handle dynamic content, images or late-loading sections via ResizeObserver
    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined" && document.body) {
      resizeObserver = new ResizeObserver(() => {
        handleScroll();
      });
      resizeObserver.observe(document.body);
    }

    // Check initial position on mount in case the page loaded already scrolled
    handleScroll();

    return () => {
      cleanUpListeners();
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [pathname]);

  const handleDismissModal = () => {
    setShowCookieModal(false);
    dismissPopupSession();
  };

  const handleAcceptAll = () => {
    acceptAllCookies();
    setAnalyticsEnabled(true);
    setShowCookieModal(false);
  };

  const handleRejectOptional = () => {
    rejectOptionalCookies();
    setAnalyticsEnabled(false);
    setShowCookieModal(false);
  };

  const handleSavePreferences = () => {
    saveCookieConsent({ analytics: analyticsEnabled, functional: false });
    setShowCookieModal(false);
  };

  // Synchronize contactContent prop changes or fetch from API if not supplied
  useEffect(() => {
    if (initialContactContent) {
      setContactContent(initialContactContent);
      return;
    }
    let isMounted = true;
    getContactPageContent()
      .then((data) => {
        if (isMounted && data) {
          setContactContent(data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [initialContactContent]);

  // Dynamic CMS social links: parse and filter to active, valid URLs
  const rawSocialLinks = parseSocialLinks(contactContent?.socialLinks);
  const activeSocialLinks = (rawSocialLinks || []).filter(
    (link) =>
      link.enabled !== false &&
      Boolean(link.url?.trim()) &&
      validateSocialUrl(link.url, link.platform)
  );

  // Close cookie modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showCookieModal) {
        handleDismissModal();
      }
    };
    if (showCookieModal) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showCookieModal]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const trimmed = (email || "").trim();
    if (!trimmed || status === "loading") return;

    setStatus("loading");
    setFeedback("");
    try {
      const result = await subscribeToNewsletter(trimmed);
      if (result?.emailSent) {
        setStatus("success");
        setFeedback("Confirmation email sent — check your inbox!");
      } else {
        setStatus("unconfirmed");
        setFeedback(
          result?.message ||
            "Subscribed! Note: Confirmation email delivery could not be completed by email provider."
        );
      }
      setEmail("");
    } catch (err) {
      if (err.status === 409) {
        setStatus("duplicate");
        setFeedback(
          err.message || "Already Subscribed — you're already on our list!"
        );
      } else if (err.status === 400) {
        setStatus("error");
        setFeedback(err.message || "Please enter a valid email address.");
      } else {
        setStatus("error");
        setFeedback(err.message || "Something went wrong. Try again.");
      }
    }
  };

  return (
    <footer className="w-full bg-[#080808] border-t border-white/[0.08] pt-16 sm:pt-20 pb-12 sm:pb-14 select-none">
      {/* Container aligned with Navbar max-width and horizontal alignment */}
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Content Grid: 12-column responsive layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-12 pb-14 sm:pb-16">
          {/* 1. Left Branding Section (4 columns on desktop) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              {/* Official DesignTouch+ Brand Logo */}
              <Link
                href="/"
                className="inline-flex items-center mb-5 group no-underline"
                aria-label="DesignTouch+ Home"
              >
                <Image
                  src="/assets/logos/design-touch-logo.png"
                  alt="DesignTouch+"
                  width={1315}
                  height={599}
                  className="h-10 sm:h-12 w-auto object-contain transition-opacity duration-150 group-hover:opacity-90"
                />
              </Link>

              {/* Exact Tagline Description */}
              <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed max-w-sm mb-6 font-sans font-normal">
                A creative studio for visual storytelling, brand films, and
                high-impact content.
              </p>

              {/* Square Social Icons: dynamically loaded from CMS, border-radius 0px, #111111 background, thin neutral border */}
              {activeSocialLinks.length > 0 && (
                <div className="flex items-center gap-2.5 sm:gap-3">
                  {activeSocialLinks.map((item) => {
                    const Icon = getSocialPlatformIcon(item.platform);
                    const isGreen =
                      item.platform?.toLowerCase().includes("instagram") ||
                      item.platform?.toLowerCase().includes("youtube");
                    const hoverBorder = isGreen
                      ? "hover:border-brand-green"
                      : "hover:border-[#F04444]";
                    const hoverText = isGreen
                      ? "hover:text-brand-green"
                      : "hover:text-[#F04444]";
                    const label = `Follow DesignTouch+ on ${item.platform}`;

                    return (
                      <a
                        key={item.id || `${item.platform}-${item.url}`}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className={`w-10 h-10 rounded-none bg-[#111111] border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white ${hoverBorder} ${hoverText} transition-colors duration-150`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 2. Quick Links Section (2 columns on desktop) */}
          <div className="lg:col-span-2">
            <h4 className="text-white text-xs sm:text-sm font-bold uppercase tracking-[0.14em] font-display mb-5">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-3 list-none p-0 m-0 font-sans">
              {QUICK_LINKS.map(({ name, path }) => (
                <li key={path}>
                  <Link
                    href={path}
                    className="text-neutral-400 hover:text-white text-xs sm:text-[13px] leading-normal no-underline transition-colors duration-150"
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Our Services Section (3 columns on desktop) */}
          <div className="lg:col-span-3">
            <h4 className="text-white text-xs sm:text-sm font-bold uppercase tracking-[0.14em] font-display mb-5">
              Our Services
            </h4>
            <ul className="flex flex-col gap-3 list-none p-0 m-0 font-sans">
              {SERVICES.map(({ name, path }) => (
                <li key={path}>
                  <Link
                    href={path}
                    className="text-neutral-400 hover:text-white text-xs sm:text-[13px] leading-normal no-underline transition-colors duration-150"
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Stay in the Loop Newsletter Section (3 columns on desktop) */}
          <div className="lg:col-span-3">
            <h4 className="text-white text-xs sm:text-sm font-bold uppercase tracking-[0.14em] font-display mb-5">
              Stay in the Loop
            </h4>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-5 font-sans font-normal">
              Get the latest tips, updates, and creative insights from
              DesignTouch+.
            </p>

            {/* Newsletter Horizontal Form: border-radius 0px, #111111 bg, #F04444 button, aligned height */}
            <form onSubmit={handleSubscribe} className="w-full">
              <div className="flex items-stretch w-full rounded-none border border-white/10 bg-[#111111] transition-colors duration-150 focus-within:border-[#F04444]">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  aria-label="Email address for newsletter"
                  className="flex-1 min-w-0 h-11 sm:h-12 bg-transparent rounded-none px-3.5 sm:px-4 text-xs sm:text-sm text-white placeholder-neutral-500 outline-none border-0 font-sans focus:ring-0"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  aria-label="Subscribe to newsletter"
                  className="w-11 sm:w-12 h-11 sm:h-12 shrink-0 rounded-none bg-[#F04444] hover:bg-[#F04444]/90 text-white flex items-center justify-center transition-colors duration-150 disabled:opacity-60 cursor-pointer border-0"
                >
                  <ArrowRight className="w-4 h-4 stroke-[2]" />
                </button>
              </div>
            </form>

            {status === "loading" && (
              <p className="text-neutral-400 text-xs mt-2.5 font-sans">
                Subscribing...
              </p>
            )}
            {status === "success" && (
              <p className="text-brand-green text-xs mt-2.5 font-sans">
                {feedback}
              </p>
            )}
            {(status === "duplicate" || status === "unconfirmed") && (
              <p className="text-amber-400 text-xs mt-2.5 font-sans">
                {feedback}
              </p>
            )}
            {status === "error" && (
              <p className="text-brand-red text-xs mt-2.5 font-sans">
                {feedback}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Copyright and Legal Section: Single row on desktop with floating button clearance */}
        <div className="border-t border-white/[0.08] pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-sans text-xs sm:text-sm">
          <p className="text-neutral-500 m-0">
            © 2025 DesignTouch+. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-neutral-500 max-w-[calc(100%-140px)] sm:max-w-none sm:pr-48 md:pr-52 lg:pr-56">
            <Link
              href="/privacy-policy"
              className="hover:text-white transition-colors duration-150 no-underline"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-and-conditions"
              className="hover:text-white transition-colors duration-150 no-underline"
            >
              Terms of Service
            </Link>
            <button
              type="button"
              onClick={() => {
                const consent = getStoredCookieConsent();
                setAnalyticsEnabled(consent.analytics);
                setShowCookieModal(true);
              }}
              className="hover:text-white transition-colors duration-150 cursor-pointer bg-transparent border-0 p-0 text-inherit font-sans"
            >
              Cookies Settings
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Cookies Settings Preferences Dialog */}
      {showCookieModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-settings-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
        >
          <div
            className="bg-[#111111] border border-white/10 rounded-none w-full max-w-lg p-6 sm:p-7 relative shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3
                id="cookie-settings-title"
                className="text-base sm:text-lg font-bold text-white font-display"
              >
                Cookies Settings
              </h3>
              <button
                type="button"
                onClick={handleDismissModal}
                className="text-neutral-400 hover:text-white p-1 rounded-none transition-colors cursor-pointer bg-transparent border-0"
                aria-label="Close cookies settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-neutral-400 text-xs sm:text-sm mt-3.5 leading-relaxed font-sans">
              We use essential cookies to maintain site security and forms. You can customize whether to allow anonymous analytics cookies to help us improve site experience.
            </p>

            <div className="mt-5 space-y-3.5 font-sans">
              {/* Essential cookies - permanently enabled & non-editable */}
              <div className="flex items-start justify-between gap-4 p-3.5 rounded-none bg-white/[0.02] border border-white/[0.06]">
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-white">
                    Essential Cookies
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-normal">
                    Strictly required for site security, forms, and core navigation. Non-editable.
                  </p>
                </div>
                <span className="text-[10px] sm:text-xs font-mono text-brand-green uppercase tracking-wider shrink-0 mt-0.5 font-bold">
                  Always Active
                </span>
              </div>

              {/* Analytics cookies - accessible ON/OFF switch toggle */}
              <div className="flex items-start justify-between gap-4 p-3.5 rounded-none bg-white/[0.02] border border-white/[0.06]">
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-semibold text-white">
                      Analytics &amp; Performance
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 border border-white/10 px-1.5 py-0.5 rounded-none uppercase">
                      Optional
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-normal">
                    Measures aggregated, anonymous site traffic and performance. Disabled by default.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 mt-0.5">
                  <span
                    className={`text-[11px] font-mono font-bold tracking-wider uppercase select-none ${
                      analyticsEnabled ? "text-brand-green" : "text-neutral-500"
                    }`}
                  >
                    {analyticsEnabled ? "ON" : "OFF"}
                  </span>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={analyticsEnabled}
                    aria-label="Toggle Analytics and Performance cookies"
                    onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setAnalyticsEnabled(!analyticsEnabled);
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-none border transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-red ${
                      analyticsEnabled
                        ? "bg-brand-red border-brand-red"
                        : "bg-neutral-800 border-white/20"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-none bg-white shadow-sm transition-transform duration-150 mt-[3px] ${
                        analyticsEnabled ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
              <Link
                href="/cookie-policy"
                onClick={() => setShowCookieModal(false)}
                className="text-[11px] text-neutral-400 hover:text-white underline transition-colors"
              >
                Detailed Cookie Policy
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleRejectOptional}
                  className="text-xs text-neutral-300 hover:text-white px-2.5 py-2 rounded-none border border-white/10 hover:bg-white/[0.04] transition-colors bg-transparent cursor-pointer"
                >
                  Reject Optional
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="text-xs text-white px-2.5 py-2 rounded-none border border-white/20 bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  Accept All
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="text-xs bg-[#F04444] hover:bg-[#F04444]/90 text-white font-medium px-3.5 py-2 rounded-none transition-colors border-0 cursor-pointer shadow-md"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
