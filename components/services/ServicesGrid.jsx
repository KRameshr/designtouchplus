"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// Standard 8 reference services matching the DesignTouch+ catalog
const REFERENCE_SERVICES = [
  {
    orderNumber: "01",
    title: "Video Editing",
    slug: "video-editing",
    description: "Engaging edits for YouTube, social media, ads, podcasts, and digital campaigns.",
    features: [
      "Long-form & Short-form Cuts",
      "Dynamic Pacing & Retention Flow",
      "Podcast & Interview Editing",
      "Cinematic Color Grading",
    ],
    iconType: "video",
    ctaLabel: "LEARN MORE",
    ctaUrl: "/contact?service=Video%20Editing",
  },
  {
    orderNumber: "02",
    title: "Motion Graphics",
    slug: "motion-graphics",
    description: "Stunning motion graphics that explain, engage, and elevate your core narrative.",
    features: [
      "2D & 3D Title Animation",
      "Explainer Video Sequences",
      "Logo Idents & Sound Stings",
      "Kinetic Typography Packs",
    ],
    iconType: "motion",
    ctaLabel: "LEARN MORE",
    ctaUrl: "/contact?service=Motion%20Graphics",
  },
  {
    orderNumber: "03",
    title: "Social Media Content",
    slug: "social-media-content",
    description: "Scroll-stopping vertical video designed to capture attention and scale reach.",
    features: [
      "Instagram Reels & TikToks",
      "YouTube Shorts Optimization",
      "Viral Hook Formatting",
      "Animated Captions & B-Roll",
    ],
    iconType: "social",
    ctaLabel: "LEARN MORE",
    ctaUrl: "/contact?service=Social%20Media%20Content",
  },
  {
    orderNumber: "04",
    title: "YouTube Management",
    slug: "youtube-management",
    description: "End-to-end channel operations to optimize algorithm performance and view counts.",
    features: [
      "Upload Schedule & Publishing",
      "High-CTR Title Strategies",
      "Audience Retention Audits",
      "Community & Tag SEO",
    ],
    iconType: "youtube",
    ctaLabel: "LEARN MORE",
    ctaUrl: "/contact?service=YouTube%20Management",
  },
  {
    orderNumber: "05",
    title: "Graphic Design",
    slug: "graphic-design",
    description: "High-impact visual designs that communicate your brand message with authority.",
    features: [
      "Social Media Carousels",
      "Marketing Banners & Post Art",
      "Pitch Decks & Presentation Kits",
      "Advertising Creative Suites",
    ],
    iconType: "graphic",
    ctaLabel: "LEARN MORE",
    ctaUrl: "/contact?service=Graphic%20Design",
  },
  {
    orderNumber: "06",
    title: "Thumbnail Design",
    slug: "thumbnail-design",
    description: "High-CTR, psychology-driven custom thumbnails engineered for peak click rates.",
    features: [
      "High-CTR Visual Formulas",
      "3D Typography & Bold Callouts",
      "Face Retouching & Expression Pop",
      "A/B Split Test Ready Files",
    ],
    iconType: "thumbnail",
    ctaLabel: "LEARN MORE",
    ctaUrl: "/contact?service=Thumbnail%20Design",
  },
  {
    orderNumber: "07",
    title: "Branding",
    slug: "branding",
    description: "Cohesive brand identities that distinguish your studio from competitors.",
    features: [
      "Logo System & Variations",
      "Color Palettes & Typography",
      "Brand Guidelines Manual",
      "Social Media Kit Assets",
    ],
    iconType: "branding",
    ctaLabel: "LEARN MORE",
    ctaUrl: "/contact?service=Branding",
  },
  {
    orderNumber: "08",
    title: "Commercial & Ads",
    slug: "commercial-ads",
    description: "Commercial-grade video assets structured specifically for paid conversion.",
    features: [
      "Direct Response Ad Cuts",
      "Multi-Ratio Ad Adaptations",
      "Product Demo & Explainer Ads",
      "Sound Design & Voice Mixing",
    ],
    iconType: "commercial",
    ctaLabel: "LEARN MORE",
    ctaUrl: "/contact?service=Commercial%20%26%20Ads",
  },
];

// Clean inline geometric icons (no lucide runtime dependencies)
function ServiceIcon({ type }) {
  switch (type) {
    case "video":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square">
          <rect x="2" y="2" width="20" height="20" rx="0" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="2" y1="7" x2="7" y2="7" />
          <line x1="2" y1="17" x2="7" y2="17" />
          <line x1="17" y1="7" x2="22" y2="7" />
          <line x1="17" y1="17" x2="22" y2="17" />
        </svg>
      );
    case "motion":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square">
          <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
        </svg>
      );
    case "social":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square">
          <rect x="5" y="2" width="14" height="20" rx="0" />
          <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5" />
        </svg>
      );
    case "youtube":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square">
          <rect x="2" y="4" width="20" height="16" rx="0" />
          <polygon points="10 9 15 12 10 15 10 9" fill="currentColor" />
        </svg>
      );
    case "graphic":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square">
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <circle cx="11" cy="11" r="2" />
        </svg>
      );
    case "thumbnail":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square">
          <rect x="3" y="3" width="18" height="18" rx="0" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      );
    case "branding":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
      );
    case "commercial":
    default:
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square">
          <rect x="2" y="3" width="20" height="14" rx="0" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
  }
}

export default function ServicesGrid({ services = [], content }) {
  // If dynamic active services are present, render them in their defined order.
  // Otherwise, fallback gracefully to the 8 canonical reference cards.
  const activeServices = useMemo(() => {
    if (Array.isArray(services) && services.length > 0) {
      return services.map((s, idx) => ({
        orderNumber: s.orderNumber || String(idx + 1).padStart(2, "0"),
        title: s.title,
        slug: s.slug,
        description: s.shortDescription || s.description || "",
        features: Array.isArray(s.features) ? s.features : [],
        iconType: s.icon || "video",
        ctaLabel: s.ctaLabel || "LEARN MORE",
        ctaUrl: s.ctaUrl || `/contact?service=${encodeURIComponent(s.title)}`,
      }));
    }
    return REFERENCE_SERVICES;
  }, [services]);

  const eyebrow = content?.servicesEyebrow || "WHAT WE DO // PORTFOLIO DISCIPLINES";
  const heading = content?.servicesHeading || "OUR SERVICES";
  const description =
    content?.servicesDescription ||
    "High-quality creative services tailored to your brand’s unique needs. Engineered for digital retention and commercial performance.";

  return (
    <section className="bg-[#080808] text-white px-4 sm:px-6 py-16 sm:py-24 border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading matching DesignTouch+ specification */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 sm:mb-16 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0" aria-hidden="true" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.24em] text-neutral-400">
                {eyebrow}
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
              {heading}
            </h2>
          </div>
          <p className="text-neutral-400 text-xs sm:text-sm font-normal max-w-md leading-relaxed sm:text-right">
            {description}
          </p>
        </div>

        {/* Dynamic Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {activeServices.map((service, index) => {
            return (
              <motion.div
                key={service.slug || service.title || index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="bg-[#0c0c0c] border border-white/10 hover:border-white/30 p-6 sm:p-7 flex flex-col justify-between group transition-all duration-300 relative rounded-none hover:bg-[#101010]"
              >
                {/* Top Row: Number & Icon */}
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 group-hover:text-brand-red transition-colors">
                      {service.orderNumber}
                    </span>
                    <div className="w-10 h-10 bg-white/[0.03] border border-white/10 flex items-center justify-center text-neutral-300 group-hover:text-white group-hover:border-white/30 transition-colors">
                      <ServiceIcon type={service.iconType} />
                    </div>
                  </div>

                  {/* Service Title */}
                  <h3 className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-white mt-5 mb-2.5 group-hover:text-white transition-colors">
                    {service.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-xs text-neutral-400 font-sans leading-relaxed mb-5">
                    {service.description}
                  </p>

                  {/* Key Feature Bullets */}
                  {Array.isArray(service.features) && service.features.length > 0 && (
                    <ul className="space-y-2 mb-6 list-none p-0 m-0">
                      {service.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-start gap-2 text-[11px] font-mono text-neutral-300">
                          <span className="w-1 h-1 bg-brand-red mt-1.5 shrink-0 inline-block" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Bottom Action: Dynamic CTA label & destination */}
                <div className="pt-4 border-t border-white/[0.06] mt-4">
                  <Link
                    href={service.ctaUrl || `/contact?service=${encodeURIComponent(service.title)}`}
                    className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.14em] text-neutral-400 group-hover:text-white transition-colors no-underline select-none"
                    aria-label={`Inquire about ${service.title}`}
                  >
                    <span>{service.ctaLabel || "LEARN MORE"}</span>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      <path d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5" />
                    </svg>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
