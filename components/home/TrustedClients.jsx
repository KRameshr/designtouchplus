"use client";

import { useState } from "react";
import { Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TrustedClients = ({ clients = [], testimonials = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTestimonial = testimonials[activeIndex];

  if (clients.length === 0 && testimonials.length === 0) return null;

  return (
    <section className="bg-[#0a0a0a] text-white px-6 py-20 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left — client logos */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Trusted By
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase mb-10">
            Amazing Clients
          </h2>

          {clients.length > 0 && (
            <div className="grid grid-cols-3 gap-6 items-center">
              {clients.map((client) => (
                <div key={client.id} className="opacity-60 hover:opacity-100 transition-opacity duration-300">
                  {client.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={client.logoUrl}
                      alt={client.clientName}
                      className="h-8 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  ) : (
                    <span className="text-sm font-bold text-gray-400">
                      {client.clientName}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — testimonial card */}
        {activeTestimonial && (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
            <Quote className="w-8 h-8 text-brand-red/40 mb-5" />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-gray-200 text-base leading-relaxed mb-6">
                  &ldquo;{activeTestimonial.quote}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  {activeTestimonial.authorAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activeTestimonial.authorAvatarUrl}
                      alt={activeTestimonial.authorName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-red/20 flex items-center justify-center text-brand-red font-bold text-sm">
                      {activeTestimonial.authorName?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-white">
                      {activeTestimonial.authorName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activeTestimonial.authorRole}
                      {activeTestimonial.authorCompany && `, ${activeTestimonial.authorCompany}`}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {testimonials.length > 1 && (
              <div className="flex gap-2 mt-6">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    aria-label={`Show testimonial ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      i === activeIndex ? "bg-brand-red w-6" : "bg-white/20 w-1.5"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrustedClients;
