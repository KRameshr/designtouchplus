"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { PlayCircle, Users, Calendar, Globe } from "lucide-react";
import { cloudinaryResponsiveImageProps } from "@/lib/cloudinaryImages.mjs";

// Existing studio workspace photo from BlogHero / Cloudinary for fallback when no banner is uploaded
const EXISTING_STUDIO_FALLBACK_IMAGE =
  "https://res.cloudinary.com/dggikfrj5/image/upload/v1793013354/designtouch/blog/xt6cdppkr00r5hopivfy.jpg";

// Default 4 statistics metrics matching requested client items
const DEFAULT_STATS = [
  { id: "stat-1", value: "60", suffix: "+", description: "Projects Completed", label: "Projects Completed", icon: "play" },
  { id: "stat-2", value: "3", suffix: "+", description: "Happy Clients", label: "Happy Clients", icon: "users" },
  { id: "stat-3", value: "10", suffix: "+", description: "Years Experience", label: "Years Experience", icon: "calendar" },
  { id: "stat-4", value: "5", suffix: "+", description: "Countries Served", label: "Countries Served", icon: "globe" },
];

/**
 * Maps statistic item metadata or fallback index to professional Lucide icons:
 * - Projects Completed -> PlayCircle
 * - Happy Clients -> Users
 * - Years Experience -> Calendar
 * - Countries Served -> Globe
 */
function getStatIcon(item, index) {
  const key = `${item?.icon || ""} ${item?.label || ""} ${item?.description || ""}`.toLowerCase();

  if (key.includes("project") || key.includes("video") || key.includes("film") || key.includes("play")) {
    return PlayCircle;
  }
  if (key.includes("client") || key.includes("user") || key.includes("people") || key.includes("happy")) {
    return Users;
  }
  if (key.includes("year") || key.includes("experience") || key.includes("calendar") || key.includes("award")) {
    return Calendar;
  }
  if (key.includes("countr") || key.includes("global") || key.includes("globe") || key.includes("world")) {
    return Globe;
  }

  const defaultIcons = [PlayCircle, Users, Calendar, Globe];
  return defaultIcons[index % defaultIcons.length];
}

/**
 * Smooth count-up animation component:
 * - Uses requestAnimationFrame with cubic ease-out
 * - Respects prefers-reduced-motion
 * - Triggers once when section enters viewport
 * - Zero hydration error risk with matching initial SSR/client state
 * - Screen-reader accessible
 */
function CountUpNumber({ value, suffix = "", isInView, reducedMotion }) {
  const rawStr = String(value ?? "").trim();
  const numericVal = parseInt(rawStr.replace(/[^0-9]/g, ""), 10);
  const isNumeric = !isNaN(numericVal) && numericVal > 0;
  const [displayNum, setDisplayNum] = useState(0);
  const animatedRef = useRef(false);

  useEffect(() => {
    if (!isNumeric) return;

    if (reducedMotion) {
      setDisplayNum(numericVal);
      return;
    }

    if (!isInView || animatedRef.current) return;
    animatedRef.current = true;

    let startTime = null;
    let animationFrame;
    const duration = 1400; // 1.4s smooth count up

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Clean cubic ease-out
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayNum(Math.round(easeOut * numericVal));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayNum(numericVal);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isInView, isNumeric, numericVal, reducedMotion]);

  if (!isNumeric) {
    return (
      <span>
        {rawStr}
        {suffix}
      </span>
    );
  }

  return (
    <>
      <span className="sr-only">
        {numericVal}
        {suffix}
      </span>
      <span aria-hidden="true">
        {displayNum}
        {suffix}
      </span>
    </>
  );
}

// Subtle entrance animations for stats container and items
const statsContainerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
      staggerChildren: 0.08,
    },
  },
};

const statItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const statIconVariants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

/**
 * Helper to render the deliberate two-line editorial heading with brand accents:
 * - Line 1: WE ARE
 * - Line 2: DESIGNTOUCH+ (Letter S in DESIGN in red, TOUCH+ accent in green)
 */
function renderEditorialHeading(rawHeading) {
  const text = (rawHeading || "").trim();

  // If empty or default "WE ARE DESIGNTOUCH+" (case-insensitive)
  if (!text || /^we\s+are\s+designtouch\+?$/i.test(text)) {
    return (
      <>
        <span className="block text-white">WE ARE</span>
        <span className="block text-white mt-1 sm:mt-1.5 whitespace-nowrap">
          DE<span className="text-brand-red">S</span>IGN<span className="text-brand-green">TOUCH+</span>
        </span>
      </>
    );
  }

  // If customized heading contains DESIGNTOUCH+
  if (/designtouch\+/i.test(text)) {
    const parts = text.split(/designtouch\+/i);
    return (
      <>
        {parts[0]}
        <span>
          DE<span className="text-brand-red">S</span>IGN<span className="text-brand-green">TOUCH+</span>
        </span>
        {parts.slice(1).join("DESIGNTOUCH+")}
      </>
    );
  }

  // If customized heading contains DESIGN
  if (/design/i.test(text)) {
    const parts = text.split(/design/i);
    return (
      <>
        {parts[0]}
        <span>
          DE<span className="text-brand-red">S</span>IGN
        </span>
        {parts.slice(1).join("DESIGN")}
      </>
    );
  }

  // Fallback custom text
  return <span className="text-white">{text}</span>;
}

const AboutHero = ({ aboutContent, stats = [] }) => {
  // Use CMS uploaded hero banner, or fallback to existing studio image
  const bannerUrl =
    aboutContent?.heroBannerImageUrl?.trim() || EXISTING_STUDIO_FALLBACK_IMAGE;

  // Eyebrow
  const eyebrowText = "ABOUT DESIGNTOUCH+";

  // Description copy
  const descriptionText =
    aboutContent?.subheading ||
    "We are a creative video production team turning ideas into powerful visual experiences. We craft content that connects, engages and helps brands grow in the digital world.";

  // CTA Link and Text
  const ctaText = aboutContent?.ctaText || "LET'S CREATE TOGETHER";
  const ctaLink = aboutContent?.ctaLink || "/contact";

  // 4 Statistics items
  const displayStats =
    Array.isArray(stats) && stats.length > 0 ? stats : DEFAULT_STATS;

  // Viewport observer and reduced motion detection for smooth entrance and count-up animations
  const statsSectionRef = useRef(null);
  const isStatsInView = useInView(statsSectionRef, { once: true, amount: 0.25 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mediaQuery.matches);
      const handler = (e) => setReducedMotion(e.matches);
      mediaQuery.addEventListener?.("change", handler);
      return () => mediaQuery.removeEventListener?.("change", handler);
    }
  }, []);

  return (
    <>
      {/* 1. Full-Width Background Hero Section (Refined 680-740px height on desktop, text overlaid on left) */}
      <section
        aria-label="About DesignTouch+ Hero"
        className="relative w-full overflow-hidden bg-[#080808] text-white min-h-[560px] sm:min-h-[620px] md:min-h-[660px] lg:min-h-[700px] xl:h-[720px] 2xl:h-[740px] flex items-center border-b border-white/[0.08]"
      >
        {/* Full-width background image spanning complete viewport width */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            {...cloudinaryResponsiveImageProps(bannerUrl, { widths: [480, 640, 960, 1280, 1600, 1920], sizes: "100vw", fallbackWidth: 1280 })}
            alt={aboutContent?.heading || "DesignTouch+ Creative Production Studio"}
            className="w-full h-full object-cover object-center sm:object-[center_right] select-none pointer-events-none"
            loading="eager"
            fetchPriority="high"
          />

          {/* Desktop/tablet horizontal left-to-right subtle black gradient overlay for crisp text readability while preserving the studio setup on the right */}
          <div
            className="absolute inset-0 pointer-events-none hidden sm:block"
            style={{
              background:
                "linear-gradient(90deg, rgba(8,8,8,0.94) 0%, rgba(8,8,8,0.86) 35%, rgba(8,8,8,0.60) 58%, rgba(8,8,8,0.18) 78%, rgba(8,8,8,0.04) 100%)",
            }}
            aria-hidden="true"
          />

          {/* Mobile vertical overlay for stacked readability */}
          <div
            className="absolute inset-0 pointer-events-none sm:hidden"
            style={{
              background:
                "linear-gradient(180deg, rgba(8,8,8,0.94) 0%, rgba(8,8,8,0.84) 55%, rgba(8,8,8,0.40) 100%)",
            }}
            aria-hidden="true"
          />
        </div>

        {/* 2. Text Content Overlaid on the LEFT, vertically centered with controlled measure (approx 45-48% width) */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16 sm:py-20 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full lg:w-[47%] lg:max-w-[550px] xl:w-[48%] xl:max-w-[580px] flex flex-col items-start text-left"
          >
            {/* Small Eyebrow Agency Marker */}
            <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
              <span
                className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0"
                aria-hidden="true"
              />
              <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.24em] text-neutral-300">
                {eyebrowText}
              </span>
            </div>

            {/* Main Heading: Noticeably increased desktop size with bold, strong typography and brand colors */}
            <h1 className="font-display font-extrabold uppercase tracking-[-0.03em] text-white leading-[1.05] mb-5 sm:mb-6 text-[clamp(2rem,4.2vw,3.5rem)]">
              {renderEditorialHeading(aboutContent?.heading)}
            </h1>

            {/* Description Copy: Increased to ~20-22px on desktop with enhanced line-height and balanced width */}
            <p className="text-neutral-300 text-base sm:text-lg lg:text-[20px] xl:text-[21px] 2xl:text-[22px] leading-[1.65] mb-8 sm:mb-9 max-w-[500px] lg:max-w-[520px] font-normal drop-shadow-sm">
              {descriptionText}
            </p>

            {/* Primary Action Button (CTA): Increased height, horizontal padding, and font size in red brand style */}
            <div>
              <Link
                href={ctaLink}
                className="inline-flex items-center gap-3 px-8 py-4 sm:px-9 sm:py-[18px] lg:px-10 lg:py-[19px] bg-brand-red hover:bg-transparent text-white text-xs sm:text-sm lg:text-[15px] font-bold uppercase tracking-[0.14em] font-display rounded-none border border-brand-red hover:text-white transition-colors duration-150 no-underline group shadow-sm select-none"
              >
                <span>{ctaText}</span>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="translate-y-[-0.5px] transition-transform duration-150 group-hover:translate-x-1"
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
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Statistics Section immediately BELOW the hero (Sharp minimal 0-2px border-radius, refined low-contrast borders & subtle hover states) */}
      <section
        ref={statsSectionRef}
        aria-label="About Statistics"
        className="w-full bg-[#080808] border-b border-white/[0.08] py-8 sm:py-10 lg:py-12"
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            variants={statsContainerVariants}
            initial={reducedMotion ? false : "hidden"}
            animate={isStatsInView ? "visible" : (reducedMotion ? "visible" : "hidden")}
            className="border border-white/[0.08] bg-[#0c0c0c] rounded-[2px] overflow-hidden divide-white/[0.08]"
          >
            <div className="grid grid-cols-2 md:grid-cols-4">
              {displayStats.slice(0, 4).map((stat, idx) => {
                const isGreen = idx % 2 === 1; // Alternating accents: Red (0, 2) & Green (1, 3)
                const rawVal = String(stat.value ?? "").trim();
                const hasPlus = rawVal.endsWith("+");
                const val = hasPlus ? rawVal.slice(0, -1) : rawVal;
                const suffix = stat.suffix || (hasPlus ? "+" : "");
                const label = stat.description || stat.label || "";
                const IconComponent = getStatIcon(stat, idx);

                return (
                  <motion.div
                    key={stat.id || idx}
                    variants={statItemVariants}
                    className={`relative px-4 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-6.5 flex items-center gap-3.5 sm:gap-4 group cursor-default transition-colors duration-250 ease-out hover:bg-white/[0.02] ${
                      idx % 2 === 0
                        ? "border-r border-white/[0.08]"
                        : "md:border-r md:border-white/[0.08]"
                    } ${idx < 2 ? "border-b border-white/[0.08] md:border-b-0" : ""} ${
                      idx === 3 ? "md:border-r-0" : ""
                    }`}
                  >
                    {/* Icon Container with minimal 2px radius, subtle dark background and brand accent */}
                    <motion.div
                      variants={statIconVariants}
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-[2px] flex items-center justify-center shrink-0 transition-all duration-250 ease-out ${
                        isGreen
                          ? "bg-[#0b1710] border border-brand-green/30 text-brand-green group-hover:border-brand-green/55 group-hover:bg-[#0e1d14]"
                          : "bg-[#170c0c] border border-brand-red/30 text-brand-red group-hover:border-brand-red/55 group-hover:bg-[#1d0e0e]"
                      }`}
                      aria-hidden="true"
                    >
                      <IconComponent
                        className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform duration-250 ease-out group-hover:scale-[1.04]"
                        strokeWidth={1.75}
                      />
                    </motion.div>

                    {/* Numeric Value & Label */}
                    <div className="flex flex-col justify-center min-w-0">
                      <div className="flex items-baseline leading-none">
                        <span className="font-display text-2xl sm:text-3xl lg:text-[28px] xl:text-[32px] font-extrabold text-white tracking-tight">
                          <CountUpNumber
                            value={val}
                            suffix={suffix}
                            isInView={isStatsInView}
                            reducedMotion={reducedMotion}
                          />
                        </span>
                      </div>
                      <p className="text-xs sm:text-[13px] font-medium text-neutral-400 font-sans tracking-wide leading-snug mt-1.5 transition-colors duration-200 group-hover:text-neutral-300">
                        {label}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default AboutHero;
