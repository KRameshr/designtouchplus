"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  ServiceCard,
  normalizeServicesList,
} from "@/components/services/ServicesGrid";

export default function Services({ services = [] }) {
  const prefersReducedMotion = useReducedMotion();

  const activeServices = useMemo(
    () => normalizeServicesList(services),
    [services]
  );

  return (
    <section
      aria-labelledby="home-services-heading"
      className="bg-[#080808] text-white px-4 sm:px-6 py-16 sm:py-24 border-b border-white/[0.08] overflow-x-clip"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header + View All Services Link */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-14 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span
                className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0"
                aria-hidden="true"
              />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.24em] text-neutral-400">
                WHAT WE DO // PORTFOLIO DISCIPLINES
              </span>
            </div>
            <h2
              id="home-services-heading"
              className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-[-0.03em] text-white"
            >
              OUR{" "}
              <span className="bg-gradient-to-r from-brand-red to-brand-green bg-clip-text text-transparent">
                SERVICES
              </span>
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6">
            <p className="text-neutral-400 text-xs sm:text-sm font-normal max-w-md leading-relaxed">
              High-quality creative services tailored to your brand’s unique
              needs. Engineered for digital retention and commercial
              performance.
            </p>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 shrink-0 px-5 py-3 bg-white/[0.04] hover:bg-brand-red border border-white/15 hover:border-brand-red text-white text-xs font-display font-bold uppercase tracking-[0.12em] rounded-[8px] transition-all duration-[220ms] no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/70"
            >
              <span>View All Services</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* 8-Service Responsive Grid (4 cols × 2 rows on desktop, 2 cols on tablet, 1 col on mobile) */}
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
