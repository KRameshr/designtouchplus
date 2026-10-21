"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function ServicesCta({ content }) {
  const eyebrow =
    content?.ctaEyebrow || "STUDIO AVAILABILITY // NOW ACCEPTING COMMISSIONS";
  const headingLine1 = content?.ctaHeadingLine1 || "LET’S CREATE SOMETHING";
  const headingLine2 = content?.ctaHeadingLine2 || "AMAZING";
  const headingHighlight = content?.ctaHeadingHighlight || "TOGETHER.";
  const description =
    content?.ctaDescription ||
    "Have a project in mind? We're ready to bring your ideas to life with high-retention video editing, scroll-stopping thumbnails, and cinematic visual assets.";
  const buttonText = content?.ctaButtonText || "GET IN TOUCH";
  const buttonLink = content?.ctaButtonLink || "/contact";
  const accentNote = content?.ctaAccentNote;

  return (
    <section className="bg-[#080808] px-4 sm:px-6 py-16 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-7xl mx-auto bg-[#0c0c0c] border border-white/15 p-8 sm:p-12 lg:p-16 relative rounded-none select-none"
      >
        {/* Subtle decorative top border bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-red via-brand-red/80 to-transparent" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-12">
          {/* Left Text Block */}
          <div className="max-w-2xl">
            {/* Availability Eyebrow */}
            <div className="flex items-center gap-2 mb-3.5">
              <span className="w-2 h-2 rounded-full bg-brand-green inline-block animate-pulse" aria-hidden="true" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.22em] text-neutral-300">
                {eyebrow}
              </span>
            </div>

            {/* Main Heading */}
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-[1.05] mb-4">
              {headingLine1} <br className="hidden sm:inline" />
              {headingLine2} <span className="text-brand-red">{headingHighlight}</span>
            </h2>

            {/* Supporting Copy */}
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed font-normal">
              {description}
            </p>

            {accentNote && (
              <p className="text-xs font-mono text-neutral-500 mt-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-red inline-block" />
                <span>{accentNote}</span>
              </p>
            )}
          </div>

          {/* Right Action Button */}
          <div className="shrink-0">
            <Link
              href={buttonLink}
              className="inline-flex items-center justify-center gap-3 bg-brand-red hover:bg-[#dc2626] text-white text-xs font-mono font-bold uppercase tracking-[0.18em] px-9 py-5 rounded-none border border-brand-red transition-all duration-200 no-underline cursor-pointer select-none group shadow-2xl shadow-brand-red/20"
            >
              <span>{buttonText}</span>
              <svg
                width="13"
                height="13"
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
        </div>
      </motion.div>
    </section>
  );
}
