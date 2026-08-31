"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const ServicesHero = () => {
  return (
    <section className="bg-[#0a0a0a] text-white px-6 pt-16 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-7xl mx-auto max-w-2xl"
      >
        <div className="flex items-center gap-2 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
            Our Services
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black uppercase leading-tight mb-6">
          Creative Solutions That Drive{" "}
          <span className="bg-gradient-to-r from-brand-red to-brand-green bg-clip-text text-transparent">
            Results.
          </span>
        </h1>

        <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-xl">
          From concept to final cut, we provide end-to-end creative services
          that help brands connect, engage and grow.
        </p>

        <Link
          href="/contact"
          className="inline-flex items-center gap-2 border border-white/20 hover:border-brand-red hover:bg-brand-red text-white text-xs font-bold uppercase tracking-widest px-7 py-4 rounded-full no-underline transition-colors duration-300"
        >
          Discuss Your Project <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </section>
  );
};

export default ServicesHero;
