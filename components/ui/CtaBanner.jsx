"use client";

import Link from "next/link";
import { Rocket, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const CtaBanner = ({
  eyebrow = "Have a Project in Mind?",
  heading = "Let's Create Something Amazing Together.",
  ctaText = "Get In Touch",
}) => {
  return (
    <section className="px-6 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto bg-gradient-to-r from-brand-red/10 via-white/[0.03] to-brand-green/10 border border-white/10 rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center shrink-0">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">
              {eyebrow}
            </p>
            <h3 className="text-lg sm:text-xl font-black text-white uppercase">
              {heading}
            </h3>
          </div>
        </div>

        <Link
          href="/contact"
          className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-black text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded-full no-underline transition-colors duration-300 shrink-0"
        >
          {ctaText} <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </section>
  );
};

export default CtaBanner;
