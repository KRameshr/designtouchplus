"use client";

import { motion } from "framer-motion";

const PortfolioHero = ({ stats = [] }) => {
  return (
    <section className="bg-[#0a0a0a] text-white px-6 pt-16 pb-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl mb-10"
        >
          <div className="flex items-center gap-2 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Our Portfolio
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black uppercase leading-tight mb-6">
            Our Work Speaks{" "}
            <span className="bg-gradient-to-r from-brand-red to-brand-green bg-clip-text text-transparent">
              Louder.
            </span>
          </h1>

          <p className="text-gray-400 text-base leading-relaxed">
            Explore our latest projects where creativity meets strategy and
            delivers real impact.
          </p>
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
                <p className="text-2xl font-black text-white mb-1">
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

export default PortfolioHero;
