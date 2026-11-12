"use client";

import { useState } from "react";
import { Quote, Star } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cloudinaryResponsiveImageProps } from "@/lib/cloudinaryImages.mjs";

const ClientLogoCard = ({ client }) => {
  const [logoError, setLogoError] = useState(false);

  const CardContainer = client.websiteUrl ? "a" : "div";
  const containerProps = client.websiteUrl
    ? {
        href: client.websiteUrl,
        target: "_blank",
        rel: "noopener noreferrer",
        "aria-label": `${client.clientName} website`,
      }
    : {};

  const hasLogo = Boolean(client.logoUrl && !logoError);

  return (
    <CardContainer
      {...containerProps}
      className="h-28 sm:h-32 flex items-center justify-center flex-col px-4 py-3 sm:px-6 sm:py-4 bg-[#0e0e0e] hover:bg-[#141414] border border-white/[0.08] hover:border-white/[0.22] rounded-[1px] transition-all duration-300 group select-none relative"
    >
      {/* Client Logo - Prominently Centered */}
      <div className="h-9 sm:h-10 w-full flex items-center justify-center">
        {hasLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            {...cloudinaryResponsiveImageProps(client.logoUrl, { widths: [160, 240, 320, 480], sizes: "250px", fallbackWidth: 320 })}
            alt={client.clientName || "Client logo"}
            loading="lazy"
            decoding="async"
            onError={() => setLogoError(true)}
            className="max-h-8 sm:max-h-10 max-w-[75%] object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-sm sm:text-base font-bold font-mono text-white/50 group-hover:text-white/70 uppercase tracking-widest transition-colors duration-300">
            {client.clientName ? client.clientName.charAt(0) : "•"}
          </span>
        )}
      </div>

      {/* Client Name - Directly Below Logo */}
      <span className="mt-2 sm:mt-2.5 text-xs sm:text-[13px] font-bold uppercase tracking-wider text-white group-hover:text-white truncate max-w-[90%] text-center transition-colors duration-300">
        {client.clientName}
      </span>
    </CardContainer>
  );
};

const TestimonialCard = ({ testimonial, index = 0 }) => {
  const [imageError, setImageError] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  if (!testimonial) return null;

  const authorName = testimonial.authorName?.trim() || "Anonymous Client";
  const initial = authorName.charAt(0).toUpperCase() || "C";
  const ratingCount = Math.min(5, Math.max(1, Number(testimonial.rating) || 5));

  const cardVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.55,
        delay: shouldReduceMotion ? 0 : index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const starVariants = {
    hidden: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.8 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.25,
        delay: shouldReduceMotion ? 0 : index * 0.12 + i * 0.05,
        ease: "easeOut",
      },
    }),
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      whileHover={shouldReduceMotion ? {} : { y: -4 }}
      className="bg-[#0e0e0e] hover:bg-[#131313] border border-white/[0.08] hover:border-white/[0.20] rounded-[1px] p-7 sm:p-8 flex flex-col justify-between h-full transition-colors duration-300 group text-left relative"
    >
      {/* Top Section: Circular Profile Photo (58px), Name, Designation, 5-Star Rating */}
      <div>
        <div className="flex items-center gap-4 mb-5">
          {/* Circular Client Profile Photo (58px) */}
          <div className="w-[58px] h-[58px] min-w-[58px] rounded-full border border-white/10 overflow-hidden bg-[#161616] shrink-0 flex items-center justify-center relative">
            {testimonial.authorAvatarUrl && !imageError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                {...cloudinaryResponsiveImageProps(testimonial.authorAvatarUrl, { widths: [64, 96, 128, 192], sizes: "96px", fallbackWidth: 128 })}
                alt={authorName}
                loading="lazy"
                decoding="async"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-display font-bold text-xl uppercase select-none">
                {initial}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-wide uppercase truncate">
              {authorName}
            </h3>
            <p className="text-xs text-neutral-400 font-mono truncate mb-1.5">
              {testimonial.authorRole || "Client"}
            </p>
            {/* 5-Star Rating in Restrained Gold with Smooth Appearance */}
            <div
              className="flex items-center gap-1"
              aria-label={`${ratingCount} out of 5 stars`}
            >
              {Array.from({ length: ratingCount }).map((_, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={starVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <Star
                    className="w-3.5 h-3.5 text-[#e5a93c] fill-[#e5a93c]"
                    aria-hidden="true"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Section: Subtle Decorative Quote Icon & Complete Testimonial Quote */}
        <div className="relative my-4 flex-1">
          <Quote
            className="w-5 h-5 text-brand-red/80 mb-3 shrink-0"
            aria-hidden="true"
          />
          <p className="text-neutral-300 text-sm sm:text-[15px] leading-relaxed font-normal italic">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
        </div>
      </div>

      {/* Bottom Section: Thin Divider, Company Name, Service Type Highlighted in Brand Red */}
      <div className="pt-4 mt-auto border-t border-white/[0.08] w-full flex items-center justify-between gap-3 flex-wrap">
        <span className="text-xs text-neutral-400 font-mono tracking-wide uppercase truncate max-w-[55%]">
          {testimonial.authorCompany || testimonial.authorRole || "Client"}
        </span>
        <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-brand-red shrink-0">
          {testimonial.serviceType || "General Feedback"}
        </span>
      </div>
    </motion.div>
  );
};

const TrustedClients = ({ clients: rawClients = [], testimonials = [] }) => {
  // Only active and featured clients appear in the homepage Trusted Partners section
  const clients = rawClients.filter(
    (c) => c && c.isActive !== false && c.isFeatured !== false
  );

  if (clients.length === 0 && testimonials.length === 0) return null;

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="bg-[#080808] text-white px-4 sm:px-6 py-16 sm:py-24 border-b border-white/[0.08] overflow-x-clip"
    >
      <div className="max-w-7xl mx-auto">
        {/* Client Partners Section (if clients exist) */}
        {clients.length > 0 && (
          <div className="mb-20 sm:mb-28 pb-16 sm:pb-20 border-b border-white/[0.08]">
            {/* Centered Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 mb-3 justify-center">
                <span
                  className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0"
                  aria-hidden="true"
                />
                <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.24em] text-neutral-400">
                  CLIENT PARTNERSHIPS
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-[-0.02em] text-white leading-tight">
                TRUSTED BY LEADING <span className="text-brand-red">CREATORS & BRANDS</span>
              </h2>
              {/* Thin divider below the heading */}
              <div
                className="w-16 h-[2px] bg-brand-red/70 mx-auto mt-4 sm:mt-5"
                aria-hidden="true"
              />
            </div>

            {/* Client Logo Grid: 3 clients -> 3 equal cards in 1 row on desktop/tablet, 2 on mobile; >3 clients -> up to 5 cols desktop, 3 tablet, 2 mobile */}
            <div
              className={
                clients.length === 3
                  ? "grid grid-cols-2 sm:grid-cols-3 max-w-5xl mx-auto gap-4 sm:gap-6"
                  : clients.length === 2
                  ? "grid grid-cols-2 max-w-2xl mx-auto gap-4 sm:gap-6"
                  : clients.length === 1
                  ? "grid grid-cols-1 max-w-md mx-auto gap-4 sm:gap-6"
                  : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6"
              }
            >
              {clients.map((client) => (
                <ClientLogoCard
                  key={client.id || client.clientName}
                  client={client}
                />
              ))}
            </div>
          </div>
        )}

        {/* Testimonials Section */}
        {testimonials.length > 0 && (
          <div>
            {/* Header: Title on Left, Supporting Description on Right */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16 pb-7 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-2 h-2 bg-brand-red rounded-none inline-block shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.24em] text-neutral-400">
                    TESTIMONIALS // CLIENT EXPERIENCES
                  </span>
                </div>
                <h2
                  id="testimonials-heading"
                  className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-[-0.03em] text-white leading-tight"
                >
                  CLIENT <span className="text-brand-red">TESTIMONIALS</span>
                </h2>
              </div>

              <div className="md:text-right">
                <p className="text-neutral-400 text-xs sm:text-sm font-normal max-w-xs md:max-w-sm leading-relaxed">
                  Real experiences. Creative partnerships. Results that speak.
                </p>
              </div>
            </div>

            {/* Testimonials Responsive Grid: 3 cols desktop (4th aligned left on row 2), 2 cols tablet, 1 col mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
              {testimonials.map((testimonial, idx) => (
                <TestimonialCard
                  key={testimonial.id || testimonial.authorName || idx}
                  testimonial={testimonial}
                  index={idx}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TrustedClients;
