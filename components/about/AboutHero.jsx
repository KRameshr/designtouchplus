"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const AboutHero = ({ aboutContent, stats = [] }) => {
  return (
    <section className="bg-[#0a0a0a] text-white px-6 pt-16 pb-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl mb-12"
        >
          <div className="flex items-center gap-2 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
              About DesignTouch+
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black uppercase leading-tight mb-6">
            {aboutContent?.heading || "We Are DesignTouch+"}
          </h1>

          <p className="text-gray-400 text-base leading-relaxed mb-8">
            {aboutContent?.subheading ||
              "We are a team of passionate storytellers, editors and creators who turn ideas into powerful visual experiences."}
          </p>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-7 py-4 rounded-full no-underline transition-colors duration-300"
          >
            Let&apos;s Create Together <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/[0.06]"
          >
            {stats.map((stat) => (
              <div key={stat.id}>
                <p className="text-3xl font-black text-white mb-1">
                  {stat.value}
                  <span className="text-brand-red">{stat.suffix}</span>
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {stat.description}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default AboutHero;
