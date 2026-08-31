"use client";

import { Zap, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const ContactHero = () => {
  return (
    <section className="bg-[#0a0a0a] text-white px-6 pt-16 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-7xl mx-auto"
      >
        <div className="max-w-xl mb-10">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Contact Us
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black uppercase leading-tight mb-6">
            Let&apos;s Create Something{" "}
            <span className="bg-gradient-to-r from-brand-red to-brand-green bg-clip-text text-transparent">
              Amazing.
            </span>
          </h1>

          <p className="text-gray-400 text-base leading-relaxed">
            Have a project in mind? We&apos;d love to hear about it. Fill out
            the form or reach out to us directly.
          </p>
        </div>

        <div className="flex flex-wrap gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-brand-red/40 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-brand-red" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Fast Response</p>
              <p className="text-xs text-gray-500">We reply within 24 hours</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-brand-green/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-brand-green" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Project Focused</p>
              <p className="text-xs text-gray-500">Solutions tailored for you</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default ContactHero;
