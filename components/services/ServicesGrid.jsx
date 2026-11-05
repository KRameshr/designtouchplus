"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  REFERENCE_THEME_SEQUENCE,
  ServiceOutlineIcon,
  resolveServiceIconKey,
} from "@/lib/serviceIcons";
import {
  REFERENCE_SERVICES,
  normalizeServicesList,
} from "@/lib/servicesData";

// Re-export canonical reference catalog and normalizer for consumers
export { REFERENCE_SERVICES, normalizeServicesList };

export function ServiceCard({ service, index, prefersReducedMotion = false }) {
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
          : { duration: 0.35, delay: index * 0.04, ease: "easeOut" }
      }
      className="h-full min-w-0 flex flex-col"
    >
      <article
        id={service.slug || undefined}
        className="group relative h-full min-w-0 bg-[#0c0c0c] hover:bg-[#111111] border border-white/[0.08] hover:border-brand-red/50 focus-within:border-brand-red/60 rounded-[2px] p-6 sm:p-7 flex flex-col justify-between transition-colors duration-200 text-left"
      >
        <div className="relative z-10 flex flex-col flex-1 min-w-0">
          {/* Top Row: Service Outline Icon (Left) + Order Number (Right) */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="text-white group-hover:text-brand-red transition-colors duration-200 shrink-0">
              <ServiceOutlineIcon
                iconKey={service.iconType}
                className="w-10 h-10 sm:w-11 sm:h-11"
              />
            </div>

            <span
              aria-hidden="true"
              className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white/10 group-hover:text-brand-red/40 select-none transition-colors duration-200 leading-none"
            >
              {displayNumber}
            </span>
          </div>

          {/* Service Title */}
          <h3 className="font-display text-base sm:text-[17px] font-bold uppercase tracking-[0.02em] text-white leading-snug mb-2.5 break-words">
            {service.title}
          </h3>

          {/* Short Description with consistent minimum height */}
          <p className="text-[13px] text-neutral-400 font-sans leading-[1.6] mb-5 break-words sm:min-h-[44px]">
            {service.description}
          </p>

          {/* Key Feature Bullets with sharp rectangular red indicators */}
          {Array.isArray(service.features) && service.features.length > 0 && (
            <ul className="space-y-2 mb-6 list-none p-0 m-0">
              {service.features.map((feature, fIndex) => (
                <li
                  key={fIndex}
                  className="flex items-center gap-2.5 text-xs sm:text-[12.5px] font-sans text-neutral-300 leading-snug"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-none bg-brand-red shrink-0 inline-block"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 break-words">{feature}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Bottom Learn More Link Container */}
        <div className="relative z-10 pt-4 border-t border-white/[0.06] mt-auto">
          <Link
            href={detailHref}
            className="inline-flex items-center gap-2 text-xs font-display font-bold uppercase tracking-[0.12em] text-white group-hover:text-brand-red transition-colors duration-200 no-underline select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/60 rounded-[1px]"
            aria-label={`Learn more about ${service.title}`}
          >
            <span>{service.ctaLabel || "LEARN MORE"}</span>
            <ArrowRight
              className="w-3.5 h-3.5 text-brand-red transition-transform duration-200 group-hover:translate-x-1"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch">
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
