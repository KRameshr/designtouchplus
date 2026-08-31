"use client";

import { motion } from "framer-motion";

const PricingHero = () => {
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
            Pricing Plans
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black uppercase leading-tight mb-6">
          Simple Pricing.{" "}
          <span className="bg-gradient-to-r from-brand-red to-brand-green bg-clip-text text-transparent">
            Powerful Results.
          </span>
        </h1>

        <p className="text-gray-400 text-base leading-relaxed">
          Choose the perfect plan for your needs. All plans include
          high-quality editing, fast delivery and unlimited revisions.
        </p>
      </motion.div>
    </section>
  );
};

export default PricingHero;
