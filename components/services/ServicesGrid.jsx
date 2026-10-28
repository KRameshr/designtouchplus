"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  REFERENCE_THEME_SEQUENCE,
  ServiceOutlineIcon,
  resolveServiceIconKey,
  resolveServiceTheme,
} from "@/lib/serviceIcons";

// Standard 8 reference services matching the DesignTouch+ catalog
export const REFERENCE_SERVICES = [
  {
    orderNumber: "01",
    title: "Video Editing",
    slug: "video-editing",
    description:
      "Engaging edits for YouTube, social media, ads, podcasts and more.",
    features: [
      "Long-form Editing",
      "Short-form / Reels",
      "Podcast Editing",
      "Color Grading",
    ],
    iconType: "video",
    colorTheme: "red",
    ctaLabel: "LEARN MORE",
    ctaUrl: "/services/video-editing",
  },
  {
    orderNumber: "02",
    title: "Motion Graphics",
    slug: "motion-graphics",
    description:
      "Stunning motion graphics that explain, engage and elevate your message.",
    features: [
      "2D/3D Animation",
      "Explainer Videos",
      "Logo Animation",
      "Kinetic Typography",
    ],
    iconType: "motion",
    colorTheme: "green",
    ctaLabel: "LEARN MORE",
    ctaUrl: "/services/motion-graphics",
  },
  {
    orderNumber: "03",
    title: "Social Media Content",
    slug: "social-media-content",
    description:
      "Scroll-stopping content designed to grow your brand and boost engagement.",
    features: [
      "Instagram Reels",
      "YouTube Shorts",
      "TikTok Videos",
      "Ad Creatives",
    ],
    iconType: "social",
    colorTheme: "violet",
    ctaLabel: "LEARN MORE",
    ctaUrl: "/services/social-media-content",
  },
  {
    orderNumber: "04",
    title: "YouTube Management",
    slug: "youtube-management",
    description:
      "End-to-end YouTube solutions to grow your channel and maximize views.",
    features: [
      "Video Editing",
      "Thumbnails",
      "SEO & Optimization",
      "Channel Growth",
    ],
    iconType: "youtube",
    colorTheme: "orange",
    ctaLabel: "LEARN MORE",
    ctaUrl: "/services/youtube-management",
  },
  {
    orderNumber: "05",
    title: "Graphic Design",
    slug: "graphic-design",
    description:
      "Creative designs that communicate your brand identity with impact.",
    features: [
      "Social Media Posts",
      "Banners & Posters",
      "Brand Identity",
      "Marketing Materials",
    ],
    iconType: "graphic",
    colorTheme: "cyan",
    ctaLabel: "LEARN MORE",
    ctaUrl: "/services/graphic-design",
  },
  {
    orderNumber: "06",
    title: "Thumbnail Design",
    slug: "thumbnail-design",
    description:
      "High CTR thumbnails that attract clicks and increase engagement.",
    features: [
      "YouTube Thumbnails",
      "Custom Designs",
      "A/B Testing Thumbnails",
      "Series Thumbnails",
    ],
    iconType: "thumbnail",
    colorTheme: "yellow",
    ctaLabel: "LEARN MORE",
    ctaUrl: "/services/thumbnail-design",
  },
  {
    orderNumber: "07",
    title: "Branding",
    slug: "branding",
    description:
      "Build a strong brand identity that makes you stand out from the competition.",
    features: [
      "Logo Design",
      "Brand Guidelines",
      "Brand Strategy",
      "Visual Identity",
    ],
    iconType: "branding",
    colorTheme: "pink",
    ctaLabel: "LEARN MORE",
    ctaUrl: "/services/branding",
  },
  {
    orderNumber: "08",
    title: "Commercial & Ads",
    slug: "commercial-ads",
    description:
      "High-converting video ads that drive traffic, leads and real results.",
    features: [
      "Product Ads",
      "Promotional Videos",
      "Corporate Videos",
      "UGC-style Ads",
    ],
    iconType: "commercial",
    colorTheme: "green",
    ctaLabel: "LEARN MORE",
    ctaUrl: "/services/commercial-ads",
  },
];

export function normalizeServicesList(services = []) {
  if (Array.isArray(services) && services.length > 0) {
    return services
      .filter((s) => s && s.isActive !== false)
      .map((s, idx) => {
        const slug =
          s.slug ||
          String(s.title || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        return {
          id: s.id || slug || `${idx}`,
          orderNumber: s.orderNumber || String(idx + 1).padStart(2, "0"),
          title: s.title,
          slug,
          description: s.shortDescription || s.description || "",
          fullDescription: s.fullDescription || s.description || "",
          features: Array.isArray(s.features) ? s.features : [],
          iconType: resolveServiceIconKey(s.icon || s.iconType, slug, s.title),
          colorTheme:
            s.colorTheme ||
            REFERENCE_THEME_SEQUENCE[idx % REFERENCE_THEME_SEQUENCE.length],
          ctaLabel: s.ctaLabel || "LEARN MORE",
          ctaUrl:
            s.ctaUrl && String(s.ctaUrl).trim()
              ? String(s.ctaUrl).trim()
              : slug
              ? `/services/${slug}`
              : `/contact?service=${encodeURIComponent(s.title || "")}`,
        };
      });
  }
  return REFERENCE_SERVICES;
}

export function ServiceCard({ service, index, prefersReducedMotion = false }) {
  const theme = resolveServiceTheme(service.colorTheme, index);
  const displayNumber =
    service.orderNumber || String(index + 1).padStart(2, "0");
  const detailHref =
    service.ctaUrl ||
    (service.slug
      ? `/services/${service.slug}`
      : `/contact?service=${encodeURIComponent(service.title || "")}`);

  return (
    <motion.div
      initial={
        prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
      }
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.36, delay: index * 0.045, ease: "easeOut" }
      }
      className="h-full min-w-0"
    >
      <article
        id={service.slug || undefined}
        className={`group relative h-full min-w-0 overflow-hidden bg-[#0a0a0a] hover:bg-[#0e0e0e] border border-white/[0.1] ${theme.cardHover} rounded-[12px] p-6 sm:p-7 flex flex-col justify-between transition-[transform,background-color,border-color,box-shadow] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          prefersReducedMotion ? "" : "hover:-translate-y-1"
        }`}
      >
        {/* Subtle top-left radial accent glow on hover */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -top-12 -left-12 w-36 h-36 rounded-full bg-gradient-to-br ${theme.ambientGlow} to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-[240ms]`}
        />

        <div className="relative z-10 flex flex-col flex-1 min-w-0">
          {/* Top Row: Large Custom Outline Icon (Left) + Subtle Service Number 01-08 (Right) */}
          <div className="flex items-start justify-between gap-3 mb-6">
            <div
              className={`${theme.iconText} shrink-0 transition-transform duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                prefersReducedMotion
                  ? ""
                  : "group-hover:scale-[1.06] group-hover:-translate-y-0.5"
              }`}
            >
              <ServiceOutlineIcon
                iconKey={service.iconType}
                className="w-11 h-11 sm:w-[48px] sm:h-[48px]"
              />
            </div>

            <span
              aria-hidden="true"
              className="font-display text-[40px] sm:text-[44px] font-extrabold leading-none tracking-[-0.03em] text-white/[0.06] group-hover:text-white/[0.1] select-none transition-colors duration-[240ms]"
            >
              {displayNumber}
            </span>
          </div>

          {/* Uppercase Service Title */}
          <h3 className="font-display text-[15px] sm:text-base font-bold uppercase tracking-[0.02em] text-white leading-snug mb-3 break-words">
            {service.title}
          </h3>

          {/* Readable Short Description */}
          <p className="text-[13px] sm:text-[13.5px] text-neutral-400 font-sans leading-[1.6] mb-5 break-words">
            {service.description}
          </p>

          {/* Key Feature Bullets Matching Service Accent Color */}
          {Array.isArray(service.features) && service.features.length > 0 && (
            <ul className="space-y-2 mt-auto mb-7 list-none p-0 m-0">
              {service.features.map((feature, fIndex) => (
                <li
                  key={fIndex}
                  className="flex items-center gap-2.5 text-[12.5px] sm:text-[13px] font-sans text-neutral-300 leading-snug"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 inline-block ${theme.bullet}`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 break-words">{feature}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Prominent Color-Matched LEARN MORE → Link */}
        <div className="relative z-10 pt-1">
          <Link
            href={detailHref}
            className={`inline-flex items-center gap-2 text-xs font-display font-bold uppercase tracking-[0.08em] ${theme.ctaText} focus-visible:outline-none focus-visible:ring-2 rounded-[2px] transition-colors duration-[220ms] no-underline select-none`}
            aria-label={`Learn more about ${service.title}`}
          >
            <span>{service.ctaLabel || "LEARN MORE"}</span>
            <ArrowRight
              className={`w-4 h-4 ${
                prefersReducedMotion
                  ? ""
                  : "transition-transform duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
              }`}
              strokeWidth={2.25}
              aria-hidden="true"
            />
          </Link>
        </div>
      </article>
    </motion.div>
  );
}

export default function ServicesGrid({ services = [], content }) {
  const prefersReducedMotion = useReducedMotion();

  const activeServices = useMemo(
    () => normalizeServicesList(services),
    [services]
  );

  const eyebrow =
    content?.servicesEyebrow || "WHAT WE DO // PORTFOLIO DISCIPLINES";
  const heading = content?.servicesHeading || "OUR SERVICES";
  const description =
    content?.servicesDescription ||
    "High-quality creative services tailored to your brand’s unique needs. Engineered for digital retention and commercial performance.";

  return (
    <section className="bg-[#080808] text-white px-4 sm:px-6 py-16 sm:py-24 border-b border-white/[0.08] overflow-x-clip">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 sm:mb-14 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span
                className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0"
                aria-hidden="true"
              />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.24em] text-neutral-400">
                {eyebrow}
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-[-0.03em] text-white">
              {heading}
            </h2>
          </div>
          <p className="text-neutral-400 text-xs sm:text-sm font-normal max-w-md leading-relaxed sm:text-right">
            {description}
          </p>
        </div>

        {/* Client Reference-Matched 8-Card Services Grid (1 col mobile, 2 col tablet, 4 col desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {activeServices.map((service, index) => (
            <ServiceCard
              key={service.id || service.slug || service.title || index}
              service={service}
              index={index}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
