"use client";

import Link from "next/link";
import { ArrowRight, Zap, Gem, RefreshCw, Headphones } from "lucide-react";
import { motion } from "framer-motion";

const TRUST_BADGES = [
  { icon: Zap, label: "Fast Delivery", desc: "On-time, every time." },
  { icon: Gem, label: "Premium Quality", desc: "Top-notch results." },
  { icon: RefreshCw, label: "Unlimited Revisions", desc: "Your satisfaction, our priority." },
  { icon: Headphones, label: "24/7 Support", desc: "We're always here." },
];

const Hero = () => {
  return (
    <section className="bg-[#0a0a0a] text-white px-6 pt-16 pb-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
        {/* Left — copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Welcome to DesignTouch+
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase leading-[1.05] mb-6">
            We create videos that grow{" "}
            <span className="bg-gradient-to-r from-brand-red via-orange-400 to-brand-green bg-clip-text text-transparent">
              brands.
            </span>
          </h1>

          <p className="text-gray-400 text-base max-w-md mb-8 leading-relaxed">
            We help businesses and creators tell their stories through
            powerful video editing &amp; creative content.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-7 py-4 rounded-full no-underline transition-colors duration-300"
            >
              View Portfolio <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white text-xs font-bold uppercase tracking-widest px-7 py-4 rounded-full no-underline transition-colors duration-300"
            >
              Book a Call <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Right — visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="relative"
        >
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent">
            {/* Placeholder editing-suite visual until a real still is supplied */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-2 w-2/3 opacity-40">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="aspect-video bg-white/10 rounded-sm" />
                ))}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          <div className="hidden lg:flex absolute -right-10 top-1/2 -translate-y-1/2 flex-col items-center gap-3">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500"
              style={{ writingMode: "vertical-rl" }}
            >
              Scroll Down
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="w-px h-10 bg-gradient-to-b from-gray-500 to-transparent"
            />
          </div>
        </motion.div>
      </div>

      {/* Trust badges */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/[0.06]">
        {TRUST_BADGES.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-brand-red shrink-0" />
            <div>
              <p className="text-white text-xs font-bold uppercase tracking-wide">{label}</p>
              <p className="text-gray-500 text-xs">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Hero;
